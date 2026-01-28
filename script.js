// script.js
(() => {
  // ===== Global Safe Variables =====
  const caloriesCache = new Map();
  const totalInputs = 6;

  // Default targetWeight (will update if needed)
  let targetWeight = 150;

  // ===== Worker URL =====
  const WORKER_URL = "https://cosmonomic-ai.cosmonomic-ai.workers.dev/calories"; // <-- Replace this!

 // ---- SAFELY IGNORE MICROSOFT OFFICE EMBED DISPOSE ERROR ----
window.addEventListener("error", function (event) {
  const msg = event?.message || "";

  if (
    msg.includes("EwaTS.vrs.js") ||
    msg.includes("MicrosoftAjaxDS") ||
    msg.includes("reading 'vh'")
  ) {
    event.preventDefault();
    return false;
  }
});

  // ===== Helper Functions =====

  // Fetch calories from Cloudflare Worker with caching
  async function fetchCalories(food) {
    if (!food) return 0;

    if (caloriesCache.has(food)) {
      return caloriesCache.get(food);
    }

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food }),
      });

      const data = await response.json();
      const calories = parseInt(data.calories) || 0;
      caloriesCache.set(food, calories);
      return calories;
    } catch (err) {
      console.error("Worker error:", err);
      return 0;
    }
  }

  // Calculate total calories from all chat containers
  function calculateTotalCalories() {
    let sum = 0;
    for (let i = 1; i <= totalInputs; i++) {
      const container = document.getElementById(`chat-container${i}`);
      const value = parseInt(container.innerText.trim()) || 0;
      sum += value;
    }
    return sum;
  }

  // Update available calories and color
  function updateAvailableCalories() {
    const sum = calculateTotalCalories();
    const availableTotal = parseInt(document.getElementById("calc-target-available").querySelector("span").innerText) || 0;
    const nowValue = availableTotal - sum;
    const nowSpan = document.querySelector("#calc-target-available-now span");
    nowSpan.textContent = nowValue;
    nowSpan.style.color = nowValue < 0 ? "red" : "black";

    // Update total and target (you can replace targetWeight logic)
    document.getElementById("calc-total").textContent = parseInt(document.getElementById("calc-target-daily").querySelector("span").innerText);
    document.getElementById("calc-target").value = Math.round(targetWeight / 2.2);
  }

  // Insert calorie response for one input
  async function insertResponse(inputId, containerId, quantityId) {
    const food = document.getElementById(inputId).value.trim();
    const quantity = parseFloat(document.getElementById(quantityId).value) || 1;
    const container = document.getElementById(containerId);
    const calories = await fetchCalories(food);
    container.innerText = calories * quantity;
    updateAvailableCalories();
  }

  // ===== Initialization =====
  function init() {
    // Attach event listeners to all voice inputs
    for (let i = 1; i <= totalInputs; i++) {
      const inputId = `voiceInput${i}`;
      const containerId = `chat-container${i}`;
      const quantityId = `Quantity${i}`;

      const voiceInput = document.getElementById(inputId);
      const quantityInput = document.getElementById(quantityId);

      if (voiceInput) {
        voiceInput.addEventListener("change", () => insertResponse(inputId, containerId, quantityId));
      }

      if (quantityInput) {
        quantityInput.addEventListener("input", () => insertResponse(inputId, containerId, quantityId));
      }
    }

    // Reset button
    const resetButton = document.getElementById("resetButton");
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        for (let i = 1; i <= totalInputs; i++) {
          const voiceInput = document.getElementById(`voiceInput${i}`);
          const quantityInput = document.getElementById(`Quantity${i}`);
          const container = document.getElementById(`chat-container${i}`);
          voiceInput.value = "";
          quantityInput.value = 1;
          container.innerText = 0;
        }
        updateAvailableCalories();
      });
    }

    // Observe changes to chat-container elements in case contenteditable is used
    const observerConfig = { childList: true, characterData: true, subtree: true };
    const observer = new MutationObserver(updateAvailableCalories);
    for (let i = 1; i <= totalInputs; i++) {
      const container = document.getElementById(`chat-container${i}`);
      if (container) observer.observe(container, observerConfig);
    }

    // Initial update
    updateAvailableCalories();
  }

  // Start initialization after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

// ---- PREVENT OFFICE IFRAME UNLOAD CRASH ----
window.addEventListener("beforeunload", () => {
  try {
    const iframes = document.getElementsByTagName("iframe");
    for (const iframe of iframes) {
      iframe.src = "about:blank";
    }
  } catch (_) {
    // intentionally ignored
  }
});

// ================================
// script.js - Cosmonomic Diet
// ================================

// Cache calories to prevent repeated calls
const caloriesCache = {};

// Safe fetch function for Cloudflare Worker
async function fetchCalories(food) {
  if (!food) return 0;

  // Return cached value if available
  if (caloriesCache[food]) return caloriesCache[food];

  try {
    const response = await fetch(
      "https://cosmonomic-ai.cosmonomic-ai.workers.dev/calories",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food })
      }
    );

    const data = await response.json();
    const calories = parseInt(data.calories) || 0;

    // Store in cache
    caloriesCache[food] = calories;

    return calories;
  } catch (err) {
    console.error("Worker error:", err);
    return 0;
  }
}

// Update a single food input's calories
async function updateFoodCalories(inputId, quantityId, containerId) {
  const foodInput = document.getElementById(inputId);
  const quantityInput = document.getElementById(quantityId);
  const container = document.getElementById(containerId);

  if (!foodInput || !quantityInput || !container) return;

  const food = foodInput.value.trim();
  const quantity = parseFloat(quantityInput.value) || 1;

  const calories = await fetchCalories(food);
  const totalCalories = calories * quantity;

  container.textContent = totalCalories;

  // Update overall totals
  updateTotals();
}

// Sum all food containers and update available calories
function updateTotals() {
  let sum = 0;
  for (let i = 1; i <= 6; i++) {
    const container = document.getElementById(`chat-container${i}`);
    const val = parseInt(container?.textContent) || 0;
    sum += val;
  }

  const available = parseInt(document.getElementById("calc-target-available")?.querySelector("span")?.textContent) || 0;
  const nowSpan = document.getElementById("calc-target-available-now")?.querySelector("span");
  if (nowSpan) {
    const remaining = available - sum;
    nowSpan.textContent = remaining;
    nowSpan.style.color = remaining < 0 ? "red" : "black";
  }
}

// Reset all inputs
function resetAll() {
  for (let i = 1; i <= 6; i++) {
    const foodInput = document.getElementById(`voiceInput${i}`);
    const quantityInput = document.getElementById(`Quantity${i}`);
    const container = document.getElementById(`chat-container${i}`);

    if (foodInput) foodInput.value = "";
    if (quantityInput) quantityInput.value = 1;
    if (container) container.textContent = 0;
  }

  updateTotals();
}

// Attach event listeners safely
function attachListeners() {
  for (let i = 1; i <= 6; i++) {
    const foodInput = document.getElementById(`voiceInput${i}`);
    const quantityInput = document.getElementById(`Quantity${i}`);

    if (foodInput) {
      foodInput.addEventListener("change", () => updateFoodCalories(`voiceInput${i}`, `Quantity${i}`, `chat-container${i}`));
    }

    if (quantityInput) {
      quantityInput.addEventListener("input", () => updateFoodCalories(`voiceInput${i}`, `Quantity${i}`, `chat-container${i}`));
    }
  }

  const resetButton = document.getElementById("resetButton");
  if (resetButton) resetButton.addEventListener("click", resetAll);
}

// Initialize the script safely
function init() {
  attachListeners();
  updateTotals(); // initial calculation
}

// Wait for DOM
document.addEventListener("DOMContentLoaded", init);

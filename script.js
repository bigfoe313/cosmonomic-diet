// Simple in-memory cache for repeated queries
// Deploy to Github Pages
const caloriesCache = {};

async function getCalories() {
  const food = document.getElementById("foodInput").value.trim().toLowerCase();
  const result = document.getElementById("result");

  if (!food) {
    result.textContent = "Please enter a food item.";
    return;
  }

  // Check local cache first
  if (caloriesCache[food]) {
    result.textContent = `Calories: ${caloriesCache[food]} (cached)`;
    return;
  }

  result.textContent = "Loading...";

  try {
    const response = await fetch(
      "https://cosmonomic-ai.cosmonomic-ai.workers.dev/calories",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food }),
        cache: "force-cache" // use browser cache if available
      }
    );

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();

    if (data.calories !== null) {
      caloriesCache[food] = data.calories; // store in local cache
      result.textContent = `Calories: ${data.calories}`;
    } else {
      result.textContent = "Calories not found";
    }
  } catch (err) {
    console.error(err);
    result.textContent = "Error fetching calories";
  }
}

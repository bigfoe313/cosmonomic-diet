async function getCalories() {
  const food = document.getElementById("foodInput").value;
  const result = document.getElementById("result");

  result.textContent = "Loading...";

  try {
    const response = await fetch(
      "https://YOUR-WORKER-NAME.YOUR-ACCOUNT.workers.dev/calories",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food })
      }
    );

    const data = await response.json();
    result.textContent = `Calories: ${data.calories}`;
  } catch (err) {
    result.textContent = "Error fetching calories";
  }
}

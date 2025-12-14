document.addEventListener("DOMContentLoaded", function () {
  const historyContainer = document.getElementById("history-container");

  fetch("http://127.0.0.1:8000/hospital/api/alerts/confirmed/")
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) {
        historyContainer.innerHTML =
          "<p class='text-center text-muted'>No confirmed alerts found.</p>";
        return;
      }

      let html = "";
      data.forEach((alert) => {
        html += `
          <div class="alert alert-success m-2">
            <p><strong>Location:</strong> ${alert.message}</p>
            <p><strong>Pateint Name:</strong> ${alert.name}</p>
            <p><strong>Timestamp:</strong> ${new Date(
              alert.timestamp
            ).toLocaleString()}</p>
          </div>
        `;
      });

      historyContainer.innerHTML = html;
    })
    .catch((error) => {
      console.error("Error fetching history:", error);
      historyContainer.innerHTML =
        "<p class='text-danger text-center'>Error loading history data.</p>";
    });
});

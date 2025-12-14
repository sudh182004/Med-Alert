// Get unique hospital ID from the page dynamically
let uniqueid = document.querySelector('.uniqueid');
let hospitalId = uniqueid ? uniqueid.innerText : 3;  // Fallback to 3 if not found
let lastDataLength = 0; // To store the previous data length
const alertContainer = document.querySelector(".card");

 // Store displayed alert IDs to prevent duplicates
 let displayedAlertIds = new Set();  // Store displayed alert IDs to prevent duplicates

 function fetchAlerts() {
   fetch(`http://127.0.0.1:8000/hospital/api/alerts/?id=${hospitalId}/`)
     .then(response => {
       if (!response.ok) {
         alert("Please wait, fetching data...");
         throw new Error('Network response was not ok');
       }
       return response.json();  // Try to parse the JSON response
     })
     .then(data => {
       // Check if there are any alerts
       if (data.length === 0) {
         alertContainer.innerHTML = "<p>No alerts found.</p>";
         return;
       }
 
       // Loop through the alerts and display them if they are new
       data.forEach((alert) => {
         // If the alert is already displayed, skip it
         if (displayedAlertIds.has(alert.id)) {
           return;
         }
 
         // Create the alert div dynamically
         const alertDiv = document.createElement("div");
         alertDiv.classList.add("alert"); 
 
         alertDiv.innerHTML = `<div class="alert-card">
  <h5>Token No: ${alert.id}</h5>
  <h5>User Name: ${alert.name}</h5>
  <h6>GPS Location: <a href="${alert.message}" target="_blank">${alert.message}</a></h6>

  <h5>Status: ${(alert.is_confirmed) ? 'Completed' : 'Pending'}</h5>
  
  ${alert.file_path ? `
    <h6>Download Report: <a href="${alert.file_path}" download>Click here to download</a></h6>
  ` : ''}

  <!-- Dropdown for Additional Details -->
  <button 
    class="btn btn-secondary mt-4" 
    type="button" 
    data-bs-toggle="collapse" 
    data-bs-target="#additionalDetails${alert.id}" 
    aria-expanded="false" 
    aria-controls="additionalDetails${alert.id}">
    Show Additional Details
  </button>
  
  <div class="collapse mt-4" id="additionalDetails${alert.id}">
    <h6>Gender: ${alert.genders ? alert.genders : 'Not specified'}</h6>
    <h6>Allergies: ${alert.allergies ? alert.allergies : 'No allergies listed'}</h6>
    <h6>Medical Conditions: ${alert.medical_conditions ? alert.medical_conditions : 'None reported'}</h6>

    <h6>Emergency Contact Numbers:</h6>
    <ul>
      ${alert.emergency_contact_numbers
        ? alert.emergency_contact_numbers
            .split(',')
            .map((num) => `<li>${num}</li>`)
            .join('')
        : '<li>No emergency contacts listed</li>'}
    </ul>

    <h6>Emergency Contact Relationships:</h6>
    <ul>
      ${alert.emergency_contact_relationships
        ? alert.emergency_contact_relationships
            .split(',')
            .map((rel) => `<li>${rel}</li>`)
            .join('')
        : '<li>No relationships provided</li>'}
    </ul>
  </div>

  <button 
    type="button" 
    onclick="confirmAction(this, ${alert.id})" 
    class="btn btn-warning mt-4">
    Confirmation
  </button>
  <hr>
</div>
 `;
 
         // Insert the new alert div at the top of the container
         if (alertContainer.firstChild) {
           alertContainer.insertBefore(alertDiv, alertContainer.firstChild);
         } else {
           // If no alerts are present, append the first alert
           alertContainer.appendChild(alertDiv);
         }
 
         // Mark this alert as displayed
         displayedAlertIds.add(alert.id);
       });
 
       console.log(data);  // Log the data for debugging
     })
     .catch(error => {
       console.error('Error fetching alerts:', error);
       alert(`Error fetching alerts: ${error.message}`);
     });
 }
 
 // Fetch alerts every 3 seconds
 setInterval(fetchAlerts, 3000);
 
 // Fetch alerts immediately when the page loads
 fetchAlerts();
 

// function confirmAction(){
  
// }
function confirmAction(button, alertId) {
  const alertDiv = button.closest(".alert");

  if (!alertDiv) {
    console.error("Error: Button is not inside an alert container");
    return;
  }

  // Add a fade-out effect using CSS
  alertDiv.style.transition = "opacity 0.5s ease-out";
  alertDiv.style.opacity = "0";

  // Wait for the fade-out to complete, then remove the alert
  setTimeout(() => {
    alertDiv.remove();
  }, 500);

  // Send the confirmation request
  fetch(`http://127.0.0.1:8000/hospital/confirm_alert/${alertId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie('csrftoken'), // Django CSRF token for security
    },
    body: JSON.stringify({ is_confirmed: true }),
  })
    .then((response) => {
      if (!response.ok) {
        alert("Failed to confirm alert");
        throw new Error("Failed to confirm alert");
      }
      return response.json();
    })
    .then((data) => {
      alert(`Token ${alertId} is confirmed`)
      console.log("Alert confirmed:", data);
    })
    .catch((error) => {
      console.error("Error confirming alert:", error);
      alert("Error confirming alert. Please try again.");
    });
}

// Function to get the value of a cookie by name
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();

      // Does this cookie string begin with the name we want?
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

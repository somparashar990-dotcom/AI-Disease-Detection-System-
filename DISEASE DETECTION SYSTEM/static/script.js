document.addEventListener("DOMContentLoaded", function () {
  const categoryLinks = document.querySelectorAll(".category-link");
  const symptomSections = document.querySelectorAll(".symptom-section");
  const form = document.getElementById("prediction-form");
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");

  // Category link navigation
  categoryLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all links and sections
      categoryLinks.forEach((l) => l.classList.remove("active"));
      symptomSections.forEach((section) => section.classList.remove("active"));

      // Add active class to clicked link and corresponding section
      this.classList.add("active");
      const targetId = this.getAttribute("href").substring(1);
      document.getElementById(targetId).classList.add("active");

      // If on mobile, close the sidebar after selection
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("active");
      }
    });
  });

  // Form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const symptoms = [];
    const checkboxes = document.querySelectorAll(
      'input[name="symptom"]:checked',
    );
    checkboxes.forEach((checkbox) => {
      symptoms.push(checkbox.value);
    });

    if (symptoms.length === 0) {
      alert("Please select at least one symptom");
      return;
    }

    fetch("/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symptoms: symptoms }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert("Error: " + data.error);
        } else {
          displayResultModal(data.prediction, data.precautions);
          // Trigger booking section with specialty data
          if (typeof initBookingSection === 'function') {
            initBookingSection(data.prediction, data.specialty, data.specialist_label);
          }
        }
      })
      .catch((error) => {
        alert("An error occurred. Please try again.");
        console.error("Error:", error);
      });
  });

  // Responsive sidebar toggle
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("active");
    });
  }

  // Close sidebar when clicking outside on mobile
  if (window.innerWidth <= 768) {
    document.addEventListener("click", function (e) {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove("active");
      }
    });
  }

  // Close modal with close button
  const closeButton = document.querySelector(".close-button");
  if (closeButton) {
    closeButton.addEventListener("click", closeResultModal);
  }
});

// Function to display results in modal
function displayResultModal(diseaseName, precautions = []) {
  // Get category and specialist information
  const category = getDiseaseCategory(diseaseName);
  const specialist = getSpecialistType(category);
  const doctors = getDoctorsByCategory(category);

  // Determine which template is being used and set values accordingly
  const resultElement = document.getElementById("result");
  const diseaseNameElement = document.getElementById("modalDiseaseName");
  const categoryElement = document.getElementById("modalDiseaseCategory");
  const specialistElement = document.getElementById("modalSpecialist");
  const doctorsListElement = document.getElementById("doctorsList");

  // Handle index.html template
  if (resultElement) {
    resultElement.textContent = diseaseName;
  }

  // Handle predict.html template
  if (diseaseNameElement) {
    diseaseNameElement.textContent = diseaseName;
  }

  // Set category information
  if (categoryElement) {
    categoryElement.textContent = category;
  }

  // Set specialist information
  if (specialistElement) {
    specialistElement.textContent = specialist;
  }

  // Display doctors
  if (doctorsListElement) {
    doctorsListElement.innerHTML = "";

    doctors.forEach((doctor, index) => {
      const doctorCard = document.createElement("div");
      doctorCard.className = "doctor-card";
      
      const mapButton = doctor.mapLink ? `
                <div class="map-action" style="margin-top: 15px;">
                    <a href="${doctor.mapLink}" target="_blank" class="btn-map">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Show on Map
                    </a>
                </div>
            ` : '';

      doctorCard.innerHTML = `
                <div class="doctor-header">
                    <h4>${doctor.name}</h4>
                    <span class="doctor-number">${index + 1}</span>
                </div>
                <div class="doctor-details">
                    <div class="detail-item">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${doctor.city}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Clinic:</span>
                        <span class="detail-value">${doctor.clinic}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Contact:</span>
                        <span class="detail-value">${doctor.contact}</span>
                    </div>
                </div>
                ${mapButton}
            `;
      doctorsListElement.appendChild(doctorCard);
    });
  }

  // Display precautions
  const precautionsDiv = document.getElementById("precautions");
  if (precautionsDiv) {
    precautionsDiv.innerHTML = "";

    if (precautions && precautions.length > 0) {
      const precautionsHTML = `
                <h3>Recommended Precautions:</h3>
                <ul>
                    ${precautions.map((precaution) => `<li>${precaution}</li>`).join("")}
                </ul>
            `;
      precautionsDiv.innerHTML = precautionsHTML;
    }
  }

  // Show modal - handle both IDs
  const resultModal =
    document.getElementById("result-modal") ||
    document.getElementById("resultModal");
  if (resultModal) {
    resultModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

// Function to close result modal
function closeResultModal() {
  const resultModal =
    document.getElementById("result-modal") ||
    document.getElementById("resultModal");
  if (resultModal) {
    resultModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
  const resultModal =
    document.getElementById("result-modal") ||
    document.getElementById("resultModal");
  if (resultModal && event.target === resultModal) {
    closeResultModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeResultModal();
  }
});

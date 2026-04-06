const instructorIdSelect = document.getElementById("instructorIdSelect");
const instructorIdLabel = document.getElementById("instructorIdLabel");
const instructorIdTextLabel = document.getElementById("instructorIdTextLabel");
const instructorIdText = document.getElementById("instructorIdText");

const firstnameInput = document.getElementById("firstname") || document.querySelector('input[name="firstname"]');
const lastnameInput = document.getElementById("lastname") || document.querySelector('input[name="lastname"]');
const addressInput = document.getElementById("address") || document.querySelector('textarea[name="address"]');
const phoneInput = document.getElementById("phone") || document.querySelector('input[name="phone"]');
const emailInput = document.getElementById("email") || document.querySelector('input[name="email"]');

let instructorsData = [];

async function loadInstructors() {
  try {
    const response = await fetch("/api/instructor/getInstructorIds");
    if (!response.ok) throw new Error("Failed to load instructor IDs");

    instructorsData = await response.json();
    populateInstructorDropdown();
  } catch (error) {
    console.error("Error loading instructors:", error);
  }
}

function populateInstructorDropdown() {
  instructorIdSelect.innerHTML = '<option value=""> -- Select Instructor Id --</option>';

  instructorsData.forEach(instructor => {
    const option = document.createElement("option");
    option.value = instructor.instructorId;
    option.textContent = `${instructor.instructorId} - ${instructor.firstname} ${instructor.lastname}`;
    instructorIdSelect.appendChild(option);
  });
}

async function displayInstructorDetails(instructorId) {
  if (!instructorId) {
    clearInstructorForm();
    return;
  }

  try {
    const response = await fetch(`/api/instructor/getInstructor?instructorId=${encodeURIComponent(instructorId)}`);
    if (!response.ok) throw new Error("Failed to load instructor details");

    const instructor = await response.json();

    instructorIdText.value = instructor.instructorId || "";
    if (firstnameInput) firstnameInput.value = instructor.firstname || "";
    if (lastnameInput) lastnameInput.value = instructor.lastname || "";
    if (addressInput) addressInput.value = instructor.address || "";
    if (phoneInput) phoneInput.value = instructor.phone || instructor.phoneNumber || "";
    if (emailInput) emailInput.value = instructor.email || "";

    const preferred = instructor.preferredContact;
    if (preferred) {
      const radio = document.querySelector(`input[name="pref"][value="${preferred}"]`);
      if (radio) radio.checked = true;
    }
  } catch (error) {
    console.error("Error loading instructor details:", error);
  }
}

function clearInstructorForm() {
  instructorIdSelect.value = "";
  instructorIdText.value = "";

  if (firstnameInput) firstnameInput.value = "";
  if (lastnameInput) lastnameInput.value = "";
  if (addressInput) addressInput.value = "";
  if (phoneInput) phoneInput.value = "";
  if (emailInput) emailInput.value = "";

  document.querySelectorAll('input[name="pref"]').forEach(radio => {
    radio.checked = false;
  });
}

function toggleInstructorIdMode(showTextField) {
  if (!instructorIdLabel || !instructorIdTextLabel || !instructorIdText) return;

  instructorIdLabel.style.display = showTextField ? "none" : "block";
  instructorIdTextLabel.style.display = showTextField ? "block" : "none";
  instructorIdText.hidden = !showTextField;
}

if (instructorIdSelect) {
  instructorIdSelect.addEventListener("change", function () {
    displayInstructorDetails(this.value);
  });
}

window.clearInstructorForm = clearInstructorForm;

document.addEventListener("DOMContentLoaded", () => {
  toggleInstructorIdMode(false);
  loadInstructors();
});
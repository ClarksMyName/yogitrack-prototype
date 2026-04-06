const classNameSelect = document.getElementById("className");
const customerIdInput = document.getElementById("customerId");
const datetimeInput = document.getElementById("datetime");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");

let classesData = [];
let currentUser = null;

async function loadClasses() {
  try {
    // Use the file name you actually have:
    // "/data/class.json" OR "/data/classes.json"
    const response = await fetch("/data/classes.json");

    if (!response.ok) {
      throw new Error("Failed to load classes");
    }

    classesData = await response.json();
    populateClassDropdown();
  } catch (error) {
    console.error("Error loading classes:", error);
  }
}

function populateClassDropdown() {
  classNameSelect.innerHTML = '<option value="">-- Select Class --</option>';

  classesData.forEach((yogaClass) => {
    const option = document.createElement("option");
    option.value = yogaClass.className;
    option.textContent = yogaClass.className;
    classNameSelect.appendChild(option);
  });
}

function setTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  datetimeInput.value = `${yyyy}-${mm}-${dd}`;
}

function clearCheckinForm() {
  classNameSelect.value = "";
  setTodayDate();
}

async function loadLoggedInUser() {
  try {
    const response = await fetch("/api/user/me");

    if (!response.ok) {
      throw new Error("Failed to load user");
    }

    currentUser = await response.json();
    customerIdInput.value = currentUser.customerId || "";
  } catch (error) {
    console.error("Error loading current user:", error);
  }
}

async function saveCheckin() {
  try {
    const customerId = customerIdInput.value.trim();
    const className = classNameSelect.value.trim();
    const datetime = datetimeInput.value;

    if (!customerId || !className || !datetime) {
      alert("Please complete all fields before checking in.");
      return;
    }

    const response = await fetch("/api/checkins/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customerId,
        className,
        datetime
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to save check-in");
    }

    alert("Check-in saved successfully.");
    window.location.href = "/htmls/member-dashboard.html";
    clearCheckinForm();
  } catch (error) {
    console.error("Save check-in error:", error);
    alert(error.message);
  }
}

if (clearBtn) {
  clearBtn.addEventListener("click", clearCheckinForm);
}

if (saveBtn) {
  saveBtn.addEventListener("click", saveCheckin);
}

document.addEventListener("DOMContentLoaded", async () => {
  setTodayDate();
  await loadLoggedInUser();
  await loadClasses();
});
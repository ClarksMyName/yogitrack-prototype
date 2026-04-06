const classIdSelect = document.getElementById("classId");
const classNameInput = document.getElementById("className");
const instructorIdInput = document.getElementById("instructorId");
const classTypeInput = document.getElementById("classType");
const descriptionInput = document.getElementById("description");
const daytimeInput = document.getElementById("daytime");

let classesData = [];

async function loadClasses() {
  try {
    const response = await fetch("/data/classes.json");
    if (!response.ok) throw new Error("Failed to load class data");

    classesData = await response.json();
    populateClassDropdown();
  } catch (error) {
    console.error("Error loading classes:", error);
  }
}

function populateClassDropdown() {
  classIdSelect.innerHTML = '<option value="">-- Select Class --</option>';

  classesData.forEach(yogaClass => {
    const option = document.createElement("option");
    option.value = yogaClass.classId;
    option.textContent = `${yogaClass.classId} - ${yogaClass.className}`;
    classIdSelect.appendChild(option);
  });
}

function displayClassDetails(classId) {
  const selectedClass = classesData.find(yogaClass => yogaClass.classId === classId);

  if (!selectedClass) {
    clearClassForm();
    return;
  }

  classNameInput.value = selectedClass.className || "";
  instructorIdInput.value = selectedClass.instructorId || "";
  classTypeInput.value = selectedClass.classType || "";
  descriptionInput.value = selectedClass.description || "";

  if (Array.isArray(selectedClass.daytime)) {
    daytimeInput.value = selectedClass.daytime
      .map(item => `${item.day} ${item.time} (${item.duration} min)`)
      .join("\n");
  } else {
    daytimeInput.value = "";
  }
}

function clearClassForm() {
  classNameInput.value = "";
  instructorIdInput.value = "";
  classTypeInput.value = "";
  descriptionInput.value = "";
  daytimeInput.value = "";
}

classIdSelect.addEventListener("change", function () {
  displayClassDetails(this.value);
});

document.addEventListener("DOMContentLoaded", loadClasses);
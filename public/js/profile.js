const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const saveProfileBtn = document.getElementById("saveProfileBtn");

async function loadProfile() {
  try {
    const response = await fetch("/api/profile/me");
    if (!response.ok) throw new Error("Failed to load profile");

    const profile = await response.json();

    firstNameInput.value = profile.firstName || "";
    lastNameInput.value = profile.lastName || "";
    emailInput.value = profile.email || "";
    phoneInput.value = profile.phone || "";
  } catch (error) {
    console.error("Profile load error:", error);
  }
}

async function saveProfile() {
  try {
    const response = await fetch("/api/profile/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        password: passwordInput.value
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update profile");
    }

    alert("Profile updated successfully.");
    passwordInput.value = "";
  } catch (error) {
    console.error("Save profile error:", error);
    alert(error.message);
  }
}

if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", saveProfile);
}

document.addEventListener("DOMContentLoaded", loadProfile);
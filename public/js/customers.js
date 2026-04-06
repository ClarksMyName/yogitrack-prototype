const customerIdSelect = document.getElementById("customerId");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");
const classBalanceInput = document.getElementById("classBalance");

let customersData = [];

async function loadCustomers() {
  try {
    const response = await fetch("/data/customers.json");
    if (!response.ok) throw new Error("Failed to load customer data");

    customersData = await response.json();
    populateCustomerDropdown();
  } catch (error) {
    console.error("Error loading customers:", error);
  }
}

function populateCustomerDropdown() {
  customerIdSelect.innerHTML = '<option value="">-- Select Customer --</option>';

  customersData.forEach(customer => {
    const option = document.createElement("option");
    option.value = customer.customerId;
    option.textContent = `${customer.customerId} - ${customer.firstName} ${customer.lastName}`;
    customerIdSelect.appendChild(option);
  });
}

function displayCustomerDetails(customerId) {
  const selectedCustomer = customersData.find(customer => customer.customerId === customerId);

  if (!selectedCustomer) {
    clearCustomerForm();
    return;
  }

  firstNameInput.value = selectedCustomer.firstName || "";
  lastNameInput.value = selectedCustomer.lastName || "";
  emailInput.value = selectedCustomer.email || "";
  phoneInput.value = selectedCustomer.phone || "";
  addressInput.value = selectedCustomer.address || "";
  classBalanceInput.value = selectedCustomer.classBalance ?? "";

  const preferredContact = selectedCustomer.preferredContact;
  const radio = document.querySelector(`input[name="pref"][value="${preferredContact}"]`);
  if (radio) radio.checked = true;
}

function clearCustomerForm() {
  firstNameInput.value = "";
  lastNameInput.value = "";
  emailInput.value = "";
  phoneInput.value = "";
  addressInput.value = "";
  classBalanceInput.value = "";

  document.querySelectorAll('input[name="pref"]').forEach(radio => {
    radio.checked = false;
  });
}

customerIdSelect.addEventListener("change", function () {
  displayCustomerDetails(this.value);
});

document.addEventListener("DOMContentLoaded", loadCustomers);
const customerSelect = document.getElementById("customerId");
const packageSelect = document.getElementById("packageId");
const packageNameInput = document.getElementById("packageName");
const descriptionInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const classAmountInput = document.getElementById("classAmount");

const searchBtn = document.getElementById("searchBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");

let packagesData = [];
let customersData = [];

async function loadCustomers() {
  const response = await fetch("/api/customers");
  if (!response.ok) throw new Error("Failed to load customers");
  customersData = await response.json();

  customerSelect.innerHTML = '<option value="">-- Select Customer --</option>';
  customersData.forEach(customer => {
    const option = document.createElement("option");
    option.value = customer.customerId;
    option.textContent = `${customer.customerId} - ${customer.username || ""} ${customer.firstName || ""} ${customer.lastName || ""}`.trim();
    customerSelect.appendChild(option);
  });
}

async function loadPackages() {
  const response = await fetch("/data/packages.json");
  if (!response.ok) throw new Error("Failed to load packages");
  packagesData = await response.json();

  packageSelect.innerHTML = '<option value="">-- Select Package --</option>';
  packagesData.forEach(pkg => {
    const option = document.createElement("option");
    option.value = pkg.packageId;
    option.textContent = `${pkg.packageId} - ${pkg.packageName}`;
    packageSelect.appendChild(option);
  });
}

function displayPackageDetails(packageId) {
  const pkg = packagesData.find(p => p.packageId === packageId);

  if (!pkg) {
    clearPackageDetails();
    return;
  }

  packageNameInput.value = pkg.packageName || "";
  descriptionInput.value = pkg.description || "";
  priceInput.value = pkg.price ?? "";
  classAmountInput.value = pkg.classAmount ?? 0;
}

function clearPackageDetails() {
  packageSelect.value = "";
  packageNameInput.value = "";
  descriptionInput.value = "";
  priceInput.value = "";
  classAmountInput.value = "";
}

async function assignPackage() {
  try {
    const customerId = customerSelect.value;
    const packageId = packageSelect.value;

    if (!customerId || !packageId) {
      alert("Please select both a customer and a package.");
      return;
    }

    const response = await fetch("/api/packages/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ customerId, packageId })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to assign package");
    }

    alert(`Package assigned successfully. New balance: ${result.classBalance}`);
    clearPackageDetails();
    customerSelect.value = "";
  } catch (error) {
    console.error("Assign package error:", error);
    alert(error.message);
  }
}

function clearForm() {
  customerSelect.value = "";
  clearPackageDetails();
}

packageSelect.addEventListener("change", function () {
  displayPackageDetails(this.value);
});

if (searchBtn) {
  searchBtn.addEventListener("click", function () {
    displayPackageDetails(packageSelect.value);
  });
}

if (saveBtn) {
  saveBtn.addEventListener("click", assignPackage);
}

if (clearBtn) {
  clearBtn.addEventListener("click", clearForm);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await Promise.all([loadCustomers(), loadPackages()]);
  } catch (error) {
    console.error("Package page load error:", error);
  }
});
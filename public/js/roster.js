const rosterBody = document.getElementById("rosterBody");

async function loadRoster() {
  try {
    const response = await fetch("/api/roster");
    if (!response.ok) throw new Error("Failed to load roster");

    const customers = await response.json();

    rosterBody.innerHTML = customers.map(customer => `
      <tr>
        <td>${customer.username || ""}</td>
        <td>${customer.customerId || ""}</td>
        <td>${`${customer.firstName || ""} ${customer.lastName || ""}`.trim()}</td>
        <td>${customer.classBalance ?? 0}</td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Roster error:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadRoster);
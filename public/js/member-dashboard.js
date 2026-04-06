const welcomeMessage = document.getElementById("welcomeMessage");
const classBalance = document.getElementById("classBalance");
const totalAttended = document.getElementById("totalAttended");
const pastCheckinsBody = document.getElementById("pastCheckinsBody");
const upcomingClassesBody = document.getElementById("upcomingClassesBody");

let currentUser = null;
let customerProfile = null;
let checkins = [];
let classes = [];

async function loadCurrentUser() {
  const response = await fetch("/api/user/me");
  if (!response.ok) throw new Error("Failed to load current user");
  currentUser = await response.json();
}

async function loadCustomerProfile() {
  const response = await fetch("/api/customers/me");
  if (!response.ok) throw new Error("Failed to load customer profile");
  customerProfile = await response.json();
}

async function loadMyCheckins() {
  const response = await fetch("/api/checkins/my");
  if (!response.ok) throw new Error("Failed to load check-ins");
  checkins = await response.json();
}

async function loadClasses() {
  const response = await fetch("/data/classes.json");
  if (!response.ok) throw new Error("Failed to load classes");
  classes = await response.json();
}

function formatDisplayDate(dateString) {
  if (!dateString) return "";
  return dateString;
}

function formatTime(timeString) {
  if (!timeString) return "";
  return timeString.slice(0, 5);
}

function dayOrder(day) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.indexOf(day);
}

function renderDashboard() {
  welcomeMessage.textContent = `Welcome, ${currentUser.username || "Member"}`;
  classBalance.textContent = customerProfile?.classBalance ?? 0;
  totalAttended.textContent = checkins.length;

  renderPastCheckins();
  renderUpcomingClasses();
}

function renderPastCheckins() {
  if (!checkins.length) {
    pastCheckinsBody.innerHTML = `
      <tr>
        <td colspan="2">No past check-ins found.</td>
      </tr>
    `;
    return;
  }

  pastCheckinsBody.innerHTML = checkins.map(checkin => `
    <tr>
      <td>${formatDisplayDate(checkin.datetime)}</td>
      <td>${checkin.className}</td>
    </tr>
  `).join("");
}

function renderUpcomingClasses() {
  const flattened = [];

  classes.forEach(yogaClass => {
    if (Array.isArray(yogaClass.daytime)) {
      yogaClass.daytime.forEach(slot => {
        flattened.push({
          className: yogaClass.className,
          day: slot.day,
          time: slot.time,
          duration: slot.duration
        });
      });
    }
  });

  flattened.sort((a, b) => {
    const dayCompare = dayOrder(a.day) - dayOrder(b.day);
    if (dayCompare !== 0) return dayCompare;
    return a.time.localeCompare(b.time);
  });

  if (!flattened.length) {
    upcomingClassesBody.innerHTML = `
      <tr>
        <td colspan="4">No upcoming classes found.</td>
      </tr>
    `;
    return;
  }

  upcomingClassesBody.innerHTML = flattened.map(item => `
    <tr>
      <td>${item.className}</td>
      <td>${item.day}</td>
      <td>${formatTime(item.time)}</td>
      <td>${item.duration} min</td>
    </tr>
  `).join("");
}

async function initDashboard() {
  try {
    await loadCurrentUser();
    await Promise.all([
      loadCustomerProfile(),
      loadMyCheckins(),
      loadClasses()
    ]);
    renderDashboard();
  } catch (error) {
    console.error("Dashboard error:", error);
  }
}

document.addEventListener("DOMContentLoaded", initDashboard);
let wakeLock = null;
let sessionStart = null;
let timerInterval = null;

// Elements
const startBtn = document.getElementById("startBtn");
const wakeStatus = document.getElementById("wakeStatus");
const sessionTimer = document.getElementById("sessionTimer");

// -----------------------------
// Wake Lock Logic
// -----------------------------
async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeStatus.textContent = "Active";
    console.log("Wake lock acquired");

    wakeLock.addEventListener("release", () => {
      console.log("Wake lock was released");
      wakeStatus.textContent = "Lost — Reacquiring…";
    });
  } catch (err) {
    console.error("Wake lock error:", err);
    wakeStatus.textContent = "Error";
  }
}

// Reacquire loop
setInterval(() => {
  if (!wakeLock) {
    requestWakeLock();
  }
}, 2000);

// -----------------------------
// Session Timer
// -----------------------------
function startTimer() {
  sessionStart = Date.now();

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - sessionStart;

    const hours = String(Math.floor(elapsed / 3600000)).padStart(2, "0");
    const minutes = String(Math.floor((elapsed % 3600000) / 60000)).padStart(2, "0");
    const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0");

    sessionTimer.textContent = `${hours}:${minutes}:${seconds}`;
  }, 1000);
}

// -----------------------------
// Launch Google Maps
// -----------------------------
function launchMaps() {
  const mapsURL = "https://www.google.com/maps";
  window.location.href = mapsURL;
}

// -----------------------------
// Start Session
// -----------------------------
startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  startBtn.textContent = "Running…";

  await requestWakeLock();
  startTimer();

  // Delay slightly so UI updates before switching apps
  setTimeout(() => {
    launchMaps();
  }, 500);
});
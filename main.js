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
      wakeLock = null;
    });
  } catch (err) {
    console.error("Wake lock error:", err);
    wakeStatus.textContent = "Error";
  }
}


// Reacquire loop with reset on failure
setInterval(async () => {
  if (!wakeLock) {
    try {
      await requestWakeLock();
    } catch (err) {
      console.log("Reacquire failed:", err);
      resetSession();
    }
  }
}, 2000);
// Reset session state and UI
function resetSession() {
  startBtn.disabled = false;
  startBtn.textContent = "Start Session";
  document.body.classList.remove("session-running");

  clearInterval(timerInterval);
  timerInterval = null;

  sessionTimer.textContent = "00:00:00";
  wakeStatus.textContent = "Inactive";
}

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
// Launch Google Maps (platform aware)
// -----------------------------
function launchMaps() {
  const androidIntent =
    "intent://maps.google.com/#Intent;scheme=https;package=com.google.android.apps.maps;end";
  const iosURL = "maps://";

  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes("android")) {
    window.open(androidIntent, "_blank");
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    window.open(iosURL, "_blank");
  } else {
    window.open("https://www.google.com/maps", "_blank");
  }
}

// -----------------------------
// Start Session
// -----------------------------
startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  startBtn.textContent = "Running…";
  document.body.classList.add("session-running");
  await requestWakeLock();
  startTimer();
});

// -----------------------------
// PWA Service Worker Registration
// -----------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js');
  });
}
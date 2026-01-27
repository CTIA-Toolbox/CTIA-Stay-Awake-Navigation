// -----------------------------
// Global State
// -----------------------------
let wakeLock = null;

const wakeStatus = document.getElementById("wakeStatus");
const wakeAlert = document.getElementById("wakeAlert");

// Wake‑lock diagnostics
let wakeInterruptCount = 0;
let lastWakeInterruptTimestamp = null;

// GPS diagnostics
let gpsLog = [];
let gpsFixCount = 0;
let gpsInterruptCount = 0;
let lastFixTimestamp = null;
let gpsIntervalId = null;


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

      // Wake‑lock diagnostics
      wakeInterruptCount++;
      lastWakeInterruptTimestamp = Date.now();

      // Alert sound
      if (wakeAlert) {
        wakeAlert.currentTime = 0;
        wakeAlert.play().catch(() => {});
      }

      wakeStatus.textContent = "Lost — Reacquiring…";
      wakeLock = null;

      updateWakeUI();
    });

  } catch (err) {
    console.error("Wake lock error:", err);
    wakeStatus.textContent = "Error";
  }
}


// -----------------------------
// Wake‑lock UI updater
// -----------------------------
function updateWakeUI() {
  const countEl = document.getElementById("wakeInterruptCount");
  const ageEl = document.getElementById("wakeInterruptAge");

  if (countEl) countEl.textContent = wakeInterruptCount;

  if (!lastWakeInterruptTimestamp) {
    if (ageEl) ageEl.textContent = "--";
    return;
  }

  const ageSeconds = Math.floor((Date.now() - lastWakeInterruptTimestamp) / 1000);
  if (ageEl) ageEl.textContent = ageSeconds + "s";
}


// -----------------------------
// GPS Logging & Diagnostics
// -----------------------------
function startGPSLogging() {
  if (gpsIntervalId) return; // Already running

  gpsIntervalId = setInterval(() => {
    let gotFix = false;

    let fixTimeout = setTimeout(() => {
      if (!gotFix) {
        recordInterrupt();
        updateGPSUI();
      }
    }, 4000); // 4s interruption threshold

    navigator.geolocation.getCurrentPosition(
      (position) => {
        gotFix = true;
        clearTimeout(fixTimeout);
        recordFix(position);
        updateGPSUI();
      },
      (err) => {
        clearTimeout(fixTimeout);
        recordInterrupt();
        updateGPSUI();
      },
      { enableHighAccuracy: true, timeout: 3500, maximumAge: 0 }
    );
  }, 2000);
}

function recordFix(position) {
  gpsLog.push(position);
  gpsFixCount++;
  lastFixTimestamp = Date.now();
}

function recordInterrupt() {
  gpsInterruptCount++;
}

function getFixAge() {
  if (!lastFixTimestamp) return "--";
  return Math.floor((Date.now() - lastFixTimestamp) / 1000);
}

function updateGPSUI() {
  const fixEl = document.getElementById("gpsFixCount");
  const intEl = document.getElementById("gpsInterruptCount");
  const ageEl = document.getElementById("gpsFixAge");

  if (fixEl) fixEl.textContent = gpsFixCount;
  if (intEl) intEl.textContent = gpsInterruptCount;
  if (ageEl) ageEl.textContent = getFixAge();
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
// Startup
// -----------------------------
window.addEventListener("DOMContentLoaded", () => {
  requestWakeLock();
  startGPSLogging();

  // Keep both diagnostic panels fresh
  setInterval(updateGPSUI, 1000);
  setInterval(updateWakeUI, 1000);
});


// -----------------------------
// PWA Service Worker Registration
// -----------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js");
  });
}
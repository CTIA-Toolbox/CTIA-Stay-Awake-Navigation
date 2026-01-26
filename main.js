
let wakeLock = null;
let wakeInterruptions = 0;

const wakeStatus = document.getElementById("wakeStatus");
const interruptionCount = document.getElementById("interruptionCount");

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
      wakeStatus.textContent = "Lost  Reacquiring";
      wakeLock = null;
      wakeInterruptions++;
      if (interruptionCount) interruptionCount.textContent = wakeInterruptions;
    });
  } catch (err) {
    console.error("Wake lock error:", err);
    wakeStatus.textContent = "Error";
  }
}



// Reacquire loop (no session reset)
setInterval(async () => {
  if (!wakeLock) {
    try {
      await requestWakeLock();
    } catch (err) {
      console.log("Reacquire failed:", err);
    }
  }
}, 2000);

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


// Request wake lock on page load
window.addEventListener("DOMContentLoaded", () => {
  requestWakeLock();
});

// -----------------------------
// PWA Service Worker Registration
// -----------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js');
  });
}
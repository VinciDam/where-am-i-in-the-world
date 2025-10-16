// --- idleTimeout.js ---

const IDLE_DELAY = 2 * 60 * 1000; // 2 minutes
let idleTimer = null;

export function startIdleMonitor() {
  resetIdleTimer();
  window.addEventListener("click", resetIdleTimer);
}

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(showIdleModal, IDLE_DELAY);
}

function showIdleModal() {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "idle-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.7)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = 9999;
  
  // Message
  const msg = document.createElement("div");
  msg.textContent = "You've been idle for several minutes. Do you want to restart?";
  msg.style.color = "#fff";
  msg.style.fontSize = "1.5rem";
  msg.style.marginBottom = "1rem";
  overlay.appendChild(msg);
  
  // Buttons
  const btnContainer = document.createElement("div");
  
  const restartBtn = document.createElement("button");
  restartBtn.textContent = "Restart";
  restartBtn.onclick = () => {
    removeOverlay();
    restartNarrative();
  };
  
  const continueBtn = document.createElement("button");
  continueBtn.textContent = "Continue";
  continueBtn.style.marginLeft = "1rem";
  continueBtn.onclick = () => {
    removeOverlay();
    resetIdleTimer();
  };
  
  btnContainer.appendChild(restartBtn);
  btnContainer.appendChild(continueBtn);
  overlay.appendChild(btnContainer);
  
  document.body.appendChild(overlay);
}

function removeOverlay() {
  const overlay = document.getElementById("idle-overlay");
  if (overlay) overlay.remove();
}

// Must import restartNarrative() from script.js
import { restartNarrative } from "./script.js";

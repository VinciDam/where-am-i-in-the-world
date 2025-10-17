// script.js

import { dispatchContent } from './dispatcher.js';
import { stopChapterAudio, 
  stopBackgroundLoop, resetBackgroundTrigger } from './audio/audioEngine.js';
import { resetLinkClicks } from './state.js';
import { startIdleMonitor } from "./idleTimeout.js";

const contentEl = document.getElementById("content");
const activeTimeouts = [];
const AUTO_RESTART_DELAY = 1000;   // optional delay after narrative ends (ms)
const FIRST_CHAPTER = "chapter-start";
const restartButton = document.getElementById("restartButton");

restartButton.addEventListener("click", () => {
  stopBackgroundLoop();      // stop ongoing audio
  resetBackgroundTrigger();
  showChapter(FIRST_CHAPTER); // restart narrative
  resetLinkClicks();         // reset click counters
  restartButton.style.display = "none";
});

export function restartNarrative() {
  // auto-restart after a short delay
  setTimeout(() => {
    stopBackgroundLoop();
    resetBackgroundTrigger();
    showChapter(FIRST_CHAPTER);
    resetLinkClicks();
  }, AUTO_RESTART_DELAY);
}

window.onload = () => {
  showChapter(FIRST_CHAPTER);
  startIdleMonitor(); // begin monitoring
};

function onValueClick(link) {
  showChapter(link); // This was previously hardcoded inside showValue
}

function clearTimeouts() {
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts.length = 0;
}

export function showChapter(id) {
  stopChapterAudio();
  clearTimeouts();
  contentEl.innerHTML = "";

  const animationLayer = document.getElementById("animation-layer");
  if (animationLayer) {
    animationLayer.innerHTML = "";
  }

  fetch(`chapters/${id}.json`)
    .then(response => response.json())
    .then(chapter => {
      // --- Dynamic content margin control ---
      if (chapter.marginTop) {
        contentEl.style.setProperty('--content-margin-top', chapter.marginTop);
      } else { 
        contentEl.style.setProperty('--content-margin-top', '15vh'); // fallback
      }

      if (chapter.marginBottom) {
        contentEl.style.setProperty('--content-margin-bottom', chapter.marginBottom);
      } else {
        contentEl.style.setProperty('--content-margin-bottom', '5vh'); // fallback
      }

      const lastWasValueRef = { value: false };
      revealContent(chapter.content, lastWasValueRef);
      handleAutoAdvance(chapter.autoAdvance);

    })
    .catch(error => console.error(`Failed to load ${id}:`, error));
}

function revealContent(contentArray, lastWasValueRef) {
  let index = 0;

  function next() {
    if (index >= contentArray.length) return;

    const item = contentArray[index++];

    dispatchContent(item, next, contentEl, activeTimeouts, lastWasValueRef, onValueClick);
  }

  next();
}

function handleAutoAdvance(autoAdvance) {
  if (!autoAdvance) return;

  const { type, delay, target, next } = autoAdvance;

  if (type === "timeout" && delay && next) {
    activeTimeouts.push(setTimeout(() => showChapter(next), delay));
  }

  if (type === "mediaEnd" && target && next) {
    const checkMediaReady = setInterval(() => {
      const mediaEls = Array.from(document.querySelectorAll("video, audio"));
      const match = mediaEls.find(el => el.src.includes(target));
      if (match) {
        clearInterval(checkMediaReady);
        match.addEventListener("ended", () => showChapter(next));
      }
    }, 100);
  }
}
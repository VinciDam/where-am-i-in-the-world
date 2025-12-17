// script.js

import { dispatchContent } from './dispatcher.js';
import { stopChapterAudio, 
  stopBackgroundLoop, resetBackgroundTrigger } from './audio/audioEngine.js';
import { resetLinkClicks } from './state.js';
import { startIdleMonitor } from "./idleTimeout.js";
import {
  getWordRevealDelay,
  setWordRevealDelay,
  resetWordRevealDelay,
  getWordRevealSpeedNormalized
} from "./renderers/text.js";

const contentEl = document.getElementById("content");
const activeTimeouts = [];
const AUTO_RESTART_DELAY = 1000;   // optional delay after narrative ends (ms)
const FIRST_CHAPTER = "chapter-start";
const restartButton = document.getElementById("restartButton");
let currentRunId = 0; // incremented when a chapter starts
let speedIndicatorTimeout = null;

export function showSpeedIndicator(fill) {
  let el = document.getElementById("speed-indicator");

  if (!el) {
    el = document.createElement("div");
    el.id = "speed-indicator";

    const bar = document.createElement("div");
    bar.className = "speed-bar";
    el.appendChild(bar);

    document.body.appendChild(el);
  }

  const bar = el.querySelector(".speed-bar");

  bar.style.transform = `scaleY(${fill})`;

  // visibility
  el.style.opacity = "1";

  if (speedIndicatorTimeout) clearTimeout(speedIndicatorTimeout);
  speedIndicatorTimeout = setTimeout(() => {
    el.style.opacity = "0";
  }, 800);
}

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    setWordRevealDelay(getWordRevealDelay() - 2);
    showSpeedIndicator(getWordRevealSpeedNormalized());
  } else if (e.key === "ArrowDown") {
    setWordRevealDelay(getWordRevealDelay() + 2);
    showSpeedIndicator(getWordRevealSpeedNormalized());
  }
});

restartButton.addEventListener("click", () => {
  stopBackgroundLoop();      // stop ongoing audio
  resetBackgroundTrigger();
  resetWordRevealDelay();
  showChapter(FIRST_CHAPTER); // restart narrative
  resetLinkClicks();         // reset click counters
  restartButton.style.display = "none";
});

export function restartNarrative() {
  // auto-restart after a short delay
  setTimeout(() => {
    stopBackgroundLoop();
    resetBackgroundTrigger();
    resetWordRevealDelay();
    showChapter(FIRST_CHAPTER);
    resetLinkClicks();
  }, AUTO_RESTART_DELAY);
}

window.onload = () => {
  showChapter("chapter-instructions");
  startIdleMonitor(); // begin monitoring
};

function onValueClick(link) {
  showChapter(link); // This was previously hardcoded inside showValue
}

function clearTimeouts() {
  for (const entry of activeTimeouts) {
    if (!entry) continue;

    if (entry.type === "timeout") {
      clearTimeout(entry.id);
    } else if (entry.type === "raf") {
      cancelAnimationFrame(entry.id);
    }
  }
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
      // mark this run — any previous callbacks should ignore themselves
      const myRunId = ++currentRunId;
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
      revealContent(chapter.content, lastWasValueRef, myRunId);
      handleAutoAdvance(chapter.autoAdvance);

    })
    .catch(error => console.error(`Failed to load ${id}:`, error));
}

function revealContent(contentArray, lastWasValueRef, runId) {
  let index = 0;

  function next() {
    // run-guard: ignore callbacks that belong to older runs
    if (runId !== currentRunId) return;

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
    const id = setTimeout(() => showChapter(next), delay);
    activeTimeouts.push({ type: "timeout", id });
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
// script.js

import { dispatchContent } from './dispatcher.js';
import { ensureInitialized, stopChapterAudio } from './audio/audioEngine.js';
import {  startAmbientSnippets } from './audio/ambient.js';

document.addEventListener('click', () => {
  ensureInitialized();
  startAmbientSnippets();
}, { once: true }); // Only needs to run once

const contentEl = document.getElementById("content");
const activeTimeouts = [];

document.getElementById("toggleNav").addEventListener("click", toggleNav);
window.onload = () => {
  loadChapters();
  showChapter("chapter-reeds");
};

function onValueClick(link) {
  showChapter(link); // This was previously hardcoded inside showValue
}

function loadChapters() {
  const navEl = document.querySelector("#nav ul");

  fetch("chapters/index.json")
    .then(response => response.json())
    .then(chapterList => {
      navEl.innerHTML = "";
      chapterList.forEach(chapter => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = chapter.title;
        a.onclick = (e) => {
          e.preventDefault();
          showChapter(chapter.id);
          toggleNav();
        };
        li.appendChild(a);
        navEl.appendChild(li);
      });
    })
    .catch(error => console.error("Failed to load chapter list:", error));
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

export function toggleNav() {
  document.getElementById("nav").classList.toggle("hidden");
}
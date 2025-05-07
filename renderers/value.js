import { showChapter } from '../script.js'; // May need to adjust path depending on structure
import { toggleNav } from '../script.js';   // Same here

let currentAudio = null;

export function showValue(item, next, contentEl, activeTimeouts, lastWasValueRef) {
  const a = document.createElement("a");
  a.href = "#";
  a.textContent = item.value;
  
  a.onclick = (e) => {
    e.preventDefault();

    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    // Play new audio, if any
    if (item.audio) {
      currentAudio = new Audio(item.audio);
      currentAudio.play(); // Don't block chapter loading
    }

    // Navigate immediately
    showChapter(item.link);
  };

  contentEl.appendChild(a);
  lastWasValueRef.current = true;
  activeTimeouts.push(setTimeout(next, 100));
}

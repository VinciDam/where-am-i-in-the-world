import { showChapter } from '../script.js';
// import { toggleNav } from '../script.js';
import { playSoundFromUrl, playReversedSoundFromUrl, startBackgroundOnce } from '../audio/audioEngine.js';

const BACKGROUND_START_AFTER = 2; // start background on this click number
let linkClicks = 0; // module-level counter, reset elsewhere if narrative restarts

export function resetLinkClicks() {
    linkClicks = 0;
}

export function showValue(item, next, contentEl, activeTimeouts, lastWasValueRef) {
  const span = document.createElement("span");
  span.classList.add("preserve-whitespace");
  
  const a = document.createElement("a");
  a.href = "#";
  a.textContent = item.value;
  
  a.onclick = async (e) => {
    e.preventDefault();

    linkClicks++;

    // Start background loop on second user click
    if (linkClicks >= BACKGROUND_START_AFTER) {
      await startBackgroundOnce("audio/background.mp3");
    }

    // Play foreground audio if present
    if (item.audio) {
      const volume = item.volume !== undefined ? Number(item.volume) : 1.0;
      playSoundFromUrl(item.audio, volume);
      // playReversedSoundFromUrl(item.audio)
    }

    // Navigate immediately
    showChapter(item.link);
  };

  span.appendChild(a);
  contentEl.appendChild(span);
  
  lastWasValueRef.current = true;
  activeTimeouts.push(setTimeout(next, 100));
}

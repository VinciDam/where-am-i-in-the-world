import { showChapter } from '../script.js';
// import { toggleNav } from '../script.js';
import { playSoundFromUrl, playReversedSoundFromUrl, startBackgroundOnce } from '../audio/audioEngine.js';

export function showValue(item, next, contentEl, activeTimeouts, lastWasValueRef) {
  const a = document.createElement("a");
  a.href = "#";
  a.textContent = item.value;
  
  a.onclick = async (e) => {
    e.preventDefault();

    // Start background loop on first user interaction
    await startBackgroundOnce("audio/background.mp3");

    // Play foreground audio if present
    if (item.audio) {
      // playSoundFromUrl(item.audio);
      playReversedSoundFromUrl(item.audio)
    }

    // Navigate immediately
    showChapter(item.link);
  };

  contentEl.appendChild(a);
  lastWasValueRef.current = true;
  activeTimeouts.push(setTimeout(next, 100));
}

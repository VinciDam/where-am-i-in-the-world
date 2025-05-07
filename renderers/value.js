let currentAudio = null;

export function showValue(item, next, contentEl, activeTimeouts, lastWasValueRef) {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = item.value;
    a.onclick = (e) => {
      e.preventDefault();
      // Stop any currently playing audio if applicable
      if (currentAudio && item.audio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
      }
      // Clear content if needed
      contentEl.innerHTML = "";
    
      // Play audio if provided
      if (item.audio) {
        currentAudio = new Audio(item.audio);
        currentAudio.play();
        // Optional: wait for audio to finish before navigating
        // audio.onended = () => showChapter(item.link);
        showChapter(item.link);
      } else {
        showChapter(item.link);
      }
    };
    
    contentEl.appendChild(a);
    lastWasValueRef.current = true;
    activeTimeouts.push(setTimeout(next, 100));
  }
  
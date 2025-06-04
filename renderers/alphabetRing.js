export function showAlphabetRing(phrase, next, contentEl, activeTimeouts, lastWasValueRef) {
    const words = phrase.split(" ");
    let index = 0;
  
    const wrapper = document.createElement("div");
    wrapper.className = "alphabet-ring-wrapper";
    contentEl.appendChild(wrapper);
  
    const center = document.createElement("div");
    center.className = "alphabet-ring-center";
    wrapper.appendChild(center);
  
    const radius = 60;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const videoMap = {};
  
    // Helper function to create video elements and position them
    function createAlphabetVideos() {
      for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const angle = (360 / letters.length) * i;
        const radians = (angle * Math.PI) / 180;
  
        const video = document.createElement("video");
        video.src = `videos/alphabet/${letter.toLowerCase()}.mp4`;
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.className = "alphabet-ring-video";
        video.style.left = `${50 + Math.cos(radians) * radius}%`;
        video.style.top = `${50 + Math.sin(radians) * radius}%`;
        video.style.opacity = "0"; // Start with hidden videos
  
        wrapper.appendChild(video);
        videoMap[letter] = video;
      }
    }
  
    // Helper function to update video visibility based on the word
    function updateVideoVisibility(activeLetters) {
      for (const letter of letters) {
        const video = videoMap[letter];
        video.style.opacity = activeLetters.has(letter) ? "1" : "0";
      }
    }
  
    // Display the next word in the phrase
    function showNextWord() {
      if (index >= words.length) {
        activeTimeouts.push(setTimeout(() => {
          contentEl.removeChild(wrapper);
          activeTimeouts.push(setTimeout(next, 200));
        }, 1000));
        return;
      }
  
      const word = words[index++];
      const activeLetters = new Set(word.toUpperCase());
      
      // Clear previous content
      center.innerHTML = "";

      // English word
      const englishSpan = document.createElement("span");
      englishSpan.textContent = word;

      // Translated word (custom script)
      const customSpan = document.createElement("div");
      customSpan.textContent = translateToJellyScript(word); // <-- Add this function below
      customSpan.className = "jelly-script";

      center.appendChild(englishSpan);
      // center.appendChild(document.createTextNode(" | "));
      center.appendChild(customSpan);
  
      updateVideoVisibility(activeLetters);
  
      activeTimeouts.push(setTimeout(showNextWord, 1200));
    }

    function translateToJellyScript(word) {
      return word; // Just use the same letters, rendered in the .otf font
    }
  
    createAlphabetVideos();
    showNextWord();
  }
  
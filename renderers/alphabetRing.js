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
      const wrapperSize = wrapper.offsetWidth;
      const numLetters = letters.length;
    
      // Estimate optimal video size (based on arc length and screen space)
      const maxVideoSize = wrapperSize * 0.1; // max 10% of wrapper
      const angleBetween = (2 * Math.PI) / numLetters;
    
      const radius = (wrapperSize / 2) - (maxVideoSize / 2); // keep inside bounds
      const videoSize = 2 * radius * Math.sin(angleBetween / 2); // approx tangent spacing
    
      wrapper.style.setProperty('--video-size', `${Math.min(videoSize, maxVideoSize)}px`);
    
      for (let i = 0; i < numLetters; i++) {
        const letter = letters[i];
        const angle = angleBetween * i;
    
        const video = document.createElement("video");
        video.src = `videos/alphabet/${letter.toLowerCase()}.mp4`;
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.className = "alphabet-ring-video";
    
        const x = 50 + Math.cos(angle) * (radius / wrapperSize) * 100;
        const y = 50 + Math.sin(angle) * (radius / wrapperSize) * 100;
    
        video.style.left = `${x}%`;
        video.style.top = `${y}%`;
        video.style.opacity = "0";
    
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
  
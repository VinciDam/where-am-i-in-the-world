export function showAlphabetRing(phrase, next, contentEl, activeTimeouts, lastWasValueRef) {
    const words = phrase.split(" ");
    let index = 0;
  
    const wrapper = document.createElement("div");
    wrapper.className = "alphabet-ring-wrapper";
    contentEl.appendChild(wrapper);
  
    const center = document.createElement("div");
    center.className = "alphabet-ring-center";
    wrapper.appendChild(center);
  
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const imageMap = {};
  
    // Helper function to create image elements and position them
    function createAlphabetImages() {
      const wrapperSize = wrapper.offsetWidth;
      const numLetters = letters.length;
    
      // Estimate optimal image size (based on arc length and screen space)
      const maxImageSize = wrapperSize * 0.1; // max 10% of wrapper
      const angleBetween = (2 * Math.PI) / numLetters;
    
      const radius = (wrapperSize / 2) - (maxImageSize / 2); // keep inside bounds
      const imageSize = 2 * radius * Math.sin(angleBetween / 2); // approx tangent spacing
    
      wrapper.style.setProperty('--image-size', `${Math.min(imageSize, maxImageSize)}px`);
    
      for (let i = 0; i < numLetters; i++) {
        const letter = letters[i];
        const angle = angleBetween * i;
    
        const img = document.createElement("img");
        img.src = `images/alphabet/${letter.toLowerCase()}.png`;
        img.className = "alphabet-ring-image";
    
        const x = 50 + Math.cos(angle) * (radius / wrapperSize) * 100;
        const y = 50 + Math.sin(angle) * (radius / wrapperSize) * 100;
    
        img.style.left = `${x}%`;
        img.style.top = `${y}%`;
        img.style.opacity = "0";
    
        wrapper.appendChild(img);
        imageMap[letter] = img;
      }
    }
  
    // Helper function to update image visibility based on the word
    function updateImageVisibility(activeLetters) {
      for (const letter of letters) {
        const img = imageMap[letter];
        img.style.opacity = activeLetters.has(letter) ? "1" : "0";
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
      center.appendChild(customSpan);
  
      updateImageVisibility(activeLetters);
  
      activeTimeouts.push(setTimeout(showNextWord, 1200));
    }

    function translateToJellyScript(word) {
      return word; // Just use the same letters, rendered in the .otf font
    }
  
    createAlphabetImages();
    showNextWord();
  }
  
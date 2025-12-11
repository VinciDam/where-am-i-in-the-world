export function showAlphabetRect(phrase, next, contentEl, activeTimeouts, lastWasValueRef) {
    const words = phrase.split(" ");
    let index = 0;
  
    const wrapper = document.createElement("div");
    wrapper.className = "alphabet-rect-wrapper";
    contentEl.appendChild(wrapper);
  
    const center = document.createElement("div");
    center.className = "alphabet-rect-center";
    wrapper.appendChild(center);
  
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const videoMap = {};
  
    function createAlphabetVideos() {
      const topRow = document.createElement("div");
      const bottomRow = document.createElement("div");
      const leftCol = document.createElement("div");
      const rightCol = document.createElement("div");
  
      topRow.className = "rect-row top";
      bottomRow.className = "rect-row bottom";
      leftCol.className = "rect-col left";
      rightCol.className = "rect-col right";
  
      wrapper.appendChild(topRow);
      wrapper.appendChild(bottomRow);
      wrapper.appendChild(leftCol);
      wrapper.appendChild(rightCol);
  
      let i = 0;
  
      function createVideo(letter) {
        const video = document.createElement("video");
        video.src = `videos/alphabet/${letter.toLowerCase()}.mp4`;
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.className = "alphabet-rect-video";
        video.style.opacity = "0";
        videoMap[letter] = video;
        return video;
      }
  
      // Top 8
      for (let j = 0; j < 8; j++, i++) {
        topRow.appendChild(createVideo(letters[i]));
      }
      // Right 7
      for (let j = 0; j < 5; j++, i++) {
        rightCol.appendChild(createVideo(letters[i]));
      }
      // Bottom 8 (reversed)
      for (let j = 0; j < 8; j++, i++) {
        bottomRow.insertBefore(createVideo(letters[i]), bottomRow.firstChild);
      }
      // Left 7 (reversed)
      for (let j = 0; j < 5; j++, i++) {
        leftCol.insertBefore(createVideo(letters[i]), leftCol.firstChild);
      }
    }
  
    function updateVideoVisibility(activeLetters) {
      for (const letter of letters) {
        const video = videoMap[letter];
        if (video) video.style.opacity = activeLetters.has(letter) ? "1" : "0";
      }
    }
  
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
  
      center.innerHTML = "";
  
      const englishSpan = document.createElement("span");
      englishSpan.textContent = word;
  
      const customSpan = document.createElement("div");
      customSpan.textContent = translateToJellyScript(word);
      customSpan.className = "jelly-script";
  
      center.appendChild(englishSpan);
      center.appendChild(customSpan);
  
      updateVideoVisibility(activeLetters);
  
      activeTimeouts.push(setTimeout(showNextWord, 1200));
    }
  
    function translateToJellyScript(word) {
      return word; // uses jellyscript .otf font via CSS class
    }
  
    createAlphabetVideos();
    showNextWord();
  } 
  
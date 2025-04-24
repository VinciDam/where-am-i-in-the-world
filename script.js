// script.js

const contentEl = document.getElementById("content");
const activeTimeouts = [];
const DEFAULT_VIDEO_THRESHOLD = 0.5; // seconds

document.getElementById("toggleNav").addEventListener("click", toggleNav);
window.onload = () => {
  loadChapters();
  showChapter("chapter-4");
};

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

function showChapter(id) {
  clearTimeouts();
  contentEl.innerHTML = "";

  fetch(`chapters/${id}.json`)
    .then(response => response.json())
    .then(chapter => {
      revealContent(chapter.content);
      handleAutoAdvance(chapter.autoAdvance);
    })
    .catch(error => console.error(`Failed to load ${id}:`, error));
}

function revealContent(contentArray) {
  let index = 0;
  let lastWasValue = false;

  function next() {
    if (index >= contentArray.length) return;

    const item = contentArray[index++];

    if (typeof item === "object" && item.em) {
      showEmphasizedText(item)
    } else if (typeof item === "string") {
      showText(item);
    } else if (item.value) {
      showValue(item);
    } else if (item.video) {
      showVideo(item);
    } else if (item.image) {
      showImage(item);
    } else if (item.videoGrid) {
      showVideoGrid(item);
    } else if (item.imageGrid) {
      showImageGrid(item);
    }
  }

  function revealWordsOneByOne(text, className = "", addInitialBreak = true) {
    if (addInitialBreak && !lastWasValue) {
      contentEl.appendChild(document.createElement("br"));
    }
  
    const words = text.split(" ");
    let wordIndex = 0;
  
    function nextWord() {
      if (wordIndex >= words.length) {
        lastWasValue = false;
        activeTimeouts.push(setTimeout(next, 100));
        return;
      }
      const span = document.createElement("span");
      if (className) span.className = className;
      span.textContent = words[wordIndex] + (wordIndex < words.length - 1 ? " " : "");
      contentEl.appendChild(span);
      wordIndex++;
      activeTimeouts.push(setTimeout(nextWord, 100));
    }
  
    nextWord();
  }

  function showText(text) {
    revealWordsOneByOne(text);
  }
  
  function showEmphasizedText(text) {
    revealWordsOneByOne(text.em, "em", false);
  }

  function showValue(item) {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = item.value;
    a.onclick = (e) => {
      e.preventDefault();
      // clearAllTimeouts(); // stop current content from revealing
  
      // Clear content if needed
      contentEl.innerHTML = "";
  
      // Play audio if provided
      if (item.audio) {
        const audio = new Audio(item.audio);
        audio.play();
  
        // Optional: wait for audio to finish before navigating
        // audio.onended = () => showChapter(item.link);
        
        // Immediate navigation (uncomment instead if you prefer this)
        showChapter(item.link);
  
      } else {
        showChapter(item.link);
      }
    };
  
    contentEl.appendChild(a);
    lastWasValue = true;
    activeTimeouts.push(setTimeout(next, 100));
  }  

  function showVideo(item) {
    // Create the video container
    const videoContainer = document.createElement("div");
    videoContainer.classList.add("video-container");
  
    // Create and append the video element
    const videoEl = document.createElement("video");
    videoEl.src = item.video;
    videoEl.classList.add("autoplay-video");
    videoEl.autoplay = true;
    videoEl.muted = true;  // Optionally mute the video
    videoContainer.appendChild(videoEl);
  
    // Check if subtitles exist and create them
    if (item.subtitles) {
      if (item.subtitles.top) {
        const topSubtitle = document.createElement("div");
        topSubtitle.classList.add("subtitle", "top-subtitle");
        topSubtitle.textContent = item.subtitles.top.text;
        videoContainer.appendChild(topSubtitle);
      }
      
      if (item.subtitles.bottom) {
        const bottomSubtitle = document.createElement("div");
        bottomSubtitle.classList.add("subtitle", "bottom-subtitle");
        bottomSubtitle.textContent = item.subtitles.bottom.text;
        videoContainer.appendChild(bottomSubtitle);
      }
    }
  
    // Append the video container to the content area
    contentEl.appendChild(videoContainer);
    
    // Scroll to the new content
    contentEl.scrollTop = contentEl.scrollHeight;
  
    // Add a timeout to go to the next piece of content
    lastWasValue = false;
    activeTimeouts.push(setTimeout(next, 100));
  }
  

  function showImage(item) {
    contentEl.appendChild(document.createElement("br"));
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.alt || "";
    img.className = "content-image";
    img.style.display = "block";
    img.style.margin = "1rem 0";
    if (item.width) img.style.width = item.width;
    contentEl.appendChild(img);
    lastWasValue = false;
    activeTimeouts.push(setTimeout(next, 100));
  }

  function showVideoGrid(item) {
    const { rows, cols, videos } = item.videoGrid;
    const container = document.createElement("div");
    container.className = "grid-container";
    container.style.display = "grid";
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gap = "0.5rem";

    videos.forEach(src => {
      const video = document.createElement("video");
      video.src = src;
      video.controls = false;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.className = "autoplay-video";
      container.appendChild(video);
    });

    contentEl.appendChild(container);
    lastWasValue = false;
    activeTimeouts.push(setTimeout(next, DEFAULT_VIDEO_THRESHOLD * 1000));
  }

  function showImageGrid(item) {
    const { rows, cols, images } = item.imageGrid;
    const container = document.createElement("div");
    container.className = "grid-container";
    container.style.display = "grid";
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gap = "0.5rem";

    images.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.className = "content-image";
      container.appendChild(img);
    });

    contentEl.appendChild(container);
    lastWasValue = false;
    activeTimeouts.push(setTimeout(next, 100));
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

function toggleNav() {
  document.getElementById("nav").classList.toggle("hidden");
}

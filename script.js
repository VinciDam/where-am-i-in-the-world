// script.js

const contentEl = document.getElementById("content");
const activeTimeouts = [];
const DEFAULT_VIDEO_THRESHOLD = 1; // seconds

document.getElementById("toggleNav").addEventListener("click", toggleNav);
window.onload = () => {
  loadChapters();
  showChapter("chapter-1");
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
    })
    .catch(error => console.error(`Failed to load ${id}:`, error));
}

function revealContent(contentArray) {
  let index = 0;
  let lastWasValue = false;

  function next() {
    if (index >= contentArray.length) return;

    const item = contentArray[index++];

    if (typeof item === "string") {
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

  function showText(text) {
    if (!lastWasValue) contentEl.appendChild(document.createElement("br"));
    const words = text.split(" ");
    let wordIndex = 0;

    function nextWord() {
      if (wordIndex >= words.length) {
        lastWasValue = false;
        activeTimeouts.push(setTimeout(next, 100));
        return;
      }
      const span = document.createElement("span");
      span.textContent = words[wordIndex] + (wordIndex < words.length - 1 ? " " : "");
      contentEl.appendChild(span);
      wordIndex++;
      activeTimeouts.push(setTimeout(nextWord, 100));
    }
    nextWord();
  }

  function showValue(item) {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = item.value;
    a.onclick = (e) => {
      e.preventDefault();
      showChapter(item.link);
    };
    contentEl.appendChild(a);
    lastWasValue = true;
    activeTimeouts.push(setTimeout(next, 100));
  }

  function showVideo(item) {
    contentEl.appendChild(document.createElement("br"));
    const video = document.createElement("video");
    video.src = item.video;
    video.controls = false;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.className = "autoplay-video";
    if (item.width) video.style.width = item.width;
    contentEl.appendChild(video);

    const threshold = item.threshold !== undefined ? item.threshold : DEFAULT_VIDEO_THRESHOLD;
    video.onloadedmetadata = () => {
      if (video.duration < threshold) {
        video.onended = () => activeTimeouts.push(setTimeout(next, 100));
      } else {
        activeTimeouts.push(setTimeout(next, threshold * 1000));
      }
    };
    video.onerror = () => {
      console.warn("Video failed to load — skipping delay.");
      activeTimeouts.push(setTimeout(next, 100));
    };
    lastWasValue = false;
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

function toggleNav() {
  document.getElementById("nav").classList.toggle("hidden");
}

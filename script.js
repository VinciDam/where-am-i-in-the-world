const contentEl = document.getElementById("content");

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
    .catch(error => {
      console.error("Failed to load chapter list:", error);
    });
}

function showChapter(id) {
  contentEl.innerHTML = "";

  fetch(`chapters/${id}.json`)
    .then(response => response.json())
    .then(chapter => {
      revealContent(chapter.content);
    })
    .catch(error => {
      console.error(`Failed to load ${id}:`, error);
    });
}

function revealContent(contentArray) {
    let index = 0;
    let lastWasValue = false;
  
    function next() {
      if (index >= contentArray.length) return;
  
      const item = contentArray[index];
  
      if (typeof item === "string") {
        if (!lastWasValue) {
          contentEl.appendChild(document.createElement("br"));
        }
  
        const words = item.split(" ");
        let wordIndex = 0;
  
        function nextWord() {
          if (wordIndex >= words.length) {
            lastWasValue = false;
            index++;
            setTimeout(next, 400);
            return;
          }
  
          const span = document.createElement("span");
          span.textContent = words[wordIndex] + " ";
          contentEl.appendChild(span);
  
          wordIndex++;
          setTimeout(nextWord, 200);
        }
  
        nextWord();
      }
  
      else if (item.value) {
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = item.value;
        a.onclick = (e) => {
          e.preventDefault();
          showChapter(item.link);
        };
        contentEl.appendChild(a);
  
        lastWasValue = true;
        index++;
        setTimeout(next, 200);
      }
  
      else if (item.video) {
        contentEl.appendChild(document.createElement("br"));
      
        const video = document.createElement("video");
        video.src = item.video;
        video.controls = false;
        video.autoplay = true;
        video.muted = true; // optional: in case autoplay is blocked without it
        video.playsInline = true;
        video.className = "autoplay-video";

        // Optional width override from JSON
        if (item.width) {
            video.style.width = item.width;
        }

        contentEl.appendChild(video);
      
        const threshold = item.threshold !== undefined ? item.threshold : 10;
      
        lastWasValue = false;
      
        const proceedAfterDelay = () => {
          index++;
          setTimeout(next, 200);
        };
      
        // Wait for video metadata to load so we can check duration
        video.onloadedmetadata = () => {
          if (video.duration < threshold) {
            // If short: wait until video ends
            video.onended = () => {
              proceedAfterDelay();
            };
          } else {
            // If long: wait `threshold` seconds, then proceed while video keeps playing
            setTimeout(() => {
              proceedAfterDelay();
            }, threshold * 1000);
          }
        };
      
        // Fallback: if video fails to load metadata, just proceed
        video.onerror = () => {
          console.warn("Video failed to load metadata — skipping delay.");
          proceedAfterDelay();
        };
      }
      
    }
  
    next();
  }
  
  

function toggleNav() {
  document.getElementById("nav").classList.toggle("hidden");
}

document.getElementById("toggleNav").addEventListener("click", toggleNav);

window.onload = () => {
  loadChapters();
  showChapter("chapter-1");
};

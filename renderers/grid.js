export function showVideoGrid(item, next, contentEl, activeTimeouts, lastWasValueRef) {
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
    lastWasValueRef.current = false;
    activeTimeouts.push(setTimeout(next, 100));
  }
  
  export function showImageGrid(item, next, contentEl, activeTimeouts, lastWasValueRef) {
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
    lastWasValueRef.current = false;
    activeTimeouts.push(setTimeout(next, 100));
  }
  
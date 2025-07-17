export function showVideo(item, next, contentEl, activeTimeouts, lastWasValueRef) {
    // Create video container
    const videoContainer = document.createElement("div");
    videoContainer.classList.add("video-container");
  
    // Create and append video element
    const videoEl = document.createElement("video");
    videoEl.src = item.video;
    videoEl.classList.add("autoplay-video");
    videoEl.autoplay = true;
    videoEl.muted = true;

    // TODO: allow left/centre/right video pos from json
    if (item.width) {
      videoContainer.style.width = item.width;
    }

    videoContainer.appendChild(videoEl);
  
    // Wait for video metadata (to get duration)
    videoEl.addEventListener("loadedmetadata", () => {
      const duration = videoEl.duration;
      // Check for subtitles
      if (item.subtitles) {
        const defaultDuration = 60; // fallback duration in seconds
        if (item.subtitles.top) {
          const dur = item.subtitles.top.duration || defaultDuration;
          const topSubtitle = createScrollingSubtitle(item.subtitles.top.text, "top-subtitle", dur);
          videoContainer.appendChild(topSubtitle);
        }
        if (item.subtitles.bottom) {
          const dur = item.subtitles.bottom.duration || defaultDuration;
          const bottomSubtitle = createScrollingSubtitle(item.subtitles.bottom.text, "bottom-subtitle", dur);
          videoContainer.appendChild(bottomSubtitle);
        }
      }
    });
  
    // Append video container to content area
    contentEl.appendChild(videoContainer);
    // Scroll to new content
    contentEl.scrollTop = contentEl.scrollHeight;
    // Add timeout to go to next piece of content
    lastWasValueRef.current = false;
    activeTimeouts.push(setTimeout(next, 100));
  }
  
  export function createScrollingSubtitle(text, className, duration) {
    const subtitle = document.createElement("div");
    subtitle.classList.add("subtitle", className);
    subtitle.textContent = text;
    subtitle.style.animationDuration = `${duration}s`;
    return subtitle;
  }
  
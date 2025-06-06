export function showImage(item, next, contentEl, activeTimeouts, lastWasValueRef) {
  const existingImg = contentEl.querySelector(".content-image");

  // 1. If there's an existing image, fade it out first
  if (existingImg) {
    existingImg.classList.remove("visible"); // trigger fade out
    existingImg.addEventListener("transitionend", () => {
      if (existingImg.parentElement) {
        existingImg.parentElement.removeChild(existingImg);
      }

      // After removing, insert new image
      insertAndFadeInNewImage();
    }, { once: true });
  } else {
    // No existing image, just insert the new one
    insertAndFadeInNewImage();
  }

  function insertAndFadeInNewImage() {
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.alt || "";
    img.className = "content-image";
    img.style.display = "block";
    img.style.margin = "1rem 0";
    if (item.width) img.style.width = item.width;

    contentEl.appendChild(img);
    lastWasValueRef.current = false;

    requestAnimationFrame(() => {
      void img.offsetWidth;
      img.classList.add("visible");
    });

    const delay = item.replaceAfter || 100;
    activeTimeouts.push(setTimeout(next, delay));
  }
}

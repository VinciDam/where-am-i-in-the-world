export function showImage(item, next, contentEl, activeTimeouts, lastWasValueRef) {
  // Clear previous image if you want to replace it
  const existingImg = contentEl.querySelector(".content-image");
  if (existingImg) {
    contentEl.removeChild(existingImg);
  }

  // Create and insert the new image
  const img = document.createElement("img");
  img.src = item.image;
  img.alt = item.alt || "";
  img.className = "content-image";
  img.style.display = "block";
  img.style.margin = "1rem 0";
  if (item.width) img.style.width = item.width;

  contentEl.appendChild(img);
  lastWasValueRef.current = false;

  // Delay next() based on replaceAfter
  const delay = item.replaceAfter || 100;
  activeTimeouts.push(setTimeout(next, delay));
}

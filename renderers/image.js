export function showImage(item, next, contentEl, activeTimeouts, lastWasValueRef) {
    contentEl.appendChild(document.createElement("br"));
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.alt || "";
    img.className = "content-image";
    img.style.display = "block";
    img.style.margin = "1rem 0";
    if (item.width) img.style.width = item.width;
    contentEl.appendChild(img);
    lastWasValueRef.current = false;
    activeTimeouts.push(setTimeout(next, 100));
  }
  
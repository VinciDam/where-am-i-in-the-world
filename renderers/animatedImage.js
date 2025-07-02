export function showAnimatedImage(item, next, contentEl, activeTimeouts, lastWasValueRef) {
    const existingImg = contentEl.querySelector(".animated-image");

    if (existingImg) {
        existingImg.remove();
    }

    const img = document.createElement("img");
    img.src = item.animatedImage;
    img.alt = item.alt || "";
    img.className = "animated-image";
    img.style.position = "absolute";
    img.style.display = "block";
    img.style.maxWidth = item.width || "200px";
    img.style.transform = "translate(-50%, -50%)";

    // Start positions
    img.style.left = item.startX || "0%";
    img.style.top  = item.startY  || "50%";

    contentEl.appendChild(img);
    lastWasValueRef.current = false;

    img.onload = () => {
        void img.offsetWidth; // force reflow

        // default animation distance
        const duration = item.duration || 5000;

        // ensure the duck *exits* fully:
        const endX = item.endX || "120%";
        const endY = item.endY || "50%";

        img.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
        img.style.left = endX;
        img.style.top  = endY;

        const delay = item.replaceAfter || duration + 100;
        activeTimeouts.push(setTimeout(next, delay));
    };
}

export function createAnimatedImage(item) {
    const img = document.createElement("img");
    img.src = item.animatedImage || item.scalingImage;
    img.alt = item.alt || "";
    img.className = "animated-image";
    img.style.position = "absolute";
    img.style.display = "block";
    img.style.maxWidth = item.width || "200px";
    img.style.pointerEvents = "none";
    img.style.transformOrigin = "center center";

    return img;
}

export function showAnimatedImage(item, next, activeTimeouts, lastWasValueRef) {
    const animationLayer = document.getElementById("animation-layer");

    const existing = animationLayer.querySelector(".animated-image");
    if (existing) existing.remove();

    const img = createAnimatedImage(item);
    img.style.transform = "translate(-50%, -50%)";
    img.style.left = item.startX || "0%";
    img.style.top  = item.startY  || "50%";

    animationLayer.appendChild(img);
    lastWasValueRef.current = false;

    img.onload = () => {
        void img.offsetWidth; // force reflow

        const duration = item.duration || 5000;
        img.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;

        img.style.left = item.endX || "130%";
        img.style.top  = item.endY || "50%";

        const delay = item.replaceAfter || duration + 100;
        activeTimeouts.push(setTimeout(next, delay));
    };
}

export function showScalingImage(item, next, activeTimeouts, lastWasValueRef) {
    const animationLayer = document.getElementById("animation-layer");

    const existing = animationLayer.querySelector(".animated-image");
    if (existing) existing.remove();

    const img = createAnimatedImage(item);
    img.style.left = item.startX || "50%";
    img.style.top  = item.startY  || "50%";
    img.style.transform = `translate(-50%, -50%) scale(${item.startScale || 0.5})`;

    animationLayer.appendChild(img);
    lastWasValueRef.current = false;

    img.onload = () => {
        void img.offsetWidth;

        const duration = item.duration || 4000;
        img.style.transition = `transform ${duration}ms ease-in-out`;
        img.style.transform = `translate(-50%, -50%) scale(${item.endScale || 1.0})`;

        const delay = item.replaceAfter || duration + 100;
        activeTimeouts.push(setTimeout(next, delay));
    };
}

export function showReplicatedImages(item, next, activeTimeouts, lastWasValueRef) {
    const animationLayer = document.getElementById("animation-layer");
    const existing = animationLayer.querySelectorAll(".animated-image");
    existing.forEach(el => el.remove());

    const coords = item.coordinates || [];
    const interval = item.interval || 300;
    const replaceAfter = item.replaceAfter || coords.length * interval + 100;

    let index = 0;

    function placeNext() {
        if (index >= coords.length) return;

        const img = createAnimatedImage({
            animatedImage: item.replicateImage,
            width: item.width || "200px"
        });

        img.style.left = coords[index].x || "50%";
        img.style.top  = coords[index].y || "50%";
        img.style.transform = "translate(-50%, -50%)";

        animationLayer.appendChild(img);

        index++;
        if (index < coords.length) {
            activeTimeouts.push(setTimeout(placeNext, interval));
        }
    }

    placeNext();

    activeTimeouts.push(setTimeout(next, replaceAfter));
    lastWasValueRef.current = false;
}

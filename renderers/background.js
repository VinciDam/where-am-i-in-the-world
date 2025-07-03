export function setBackgroundImages(item) {
  clearBackgroundImages();

  item.backgroundImages.forEach((img) => {
    const bg = document.createElement("img");
    bg.src = img.src;
    bg.classList.add("background-image");
    
    bg.style.position = "absolute";
    bg.style.top = img.top || "50%";
    bg.style.width = img.width || "auto";
    bg.style.zIndex = -1;

    if (img.position === "left") {
      bg.style.left = "0";
    } else if (img.position === "right") {
      bg.style.right = "0";
    } else if (img.position === "center") {
      bg.style.left = "50%";
      bg.style.transform = (bg.style.transform || "") + " translateX(-50%)";
    } else if (img.position) {
      bg.style.left = img.position;
    } else {
      bg.style.left = "50%";
      bg.style.transform = (bg.style.transform || "") + " translateX(-50%)";
    }

    if (img.rotate) {
      bg.style.transform = `rotate(${img.rotate}deg)`;
      bg.style.transformOrigin = "center center";
    }

    const bgLayer = document.getElementById("background-layer");
    bgLayer.appendChild(bg);
  });
}
  
export function clearBackgroundImages() {
  const bgLayer = document.getElementById("background-layer");
  bgLayer.innerHTML = "";
  bgLayer.style.backgroundImage = "";
}

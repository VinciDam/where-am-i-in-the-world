export function setBackgroundImages(item) {

  // clearBackgroundImages();

  item.backgroundImages.forEach((img) => {
    const bg = document.createElement("img");
    bg.src = img.src;
    bg.classList.add("background-image");

    bg.style.position = "absolute";
    bg.style.zIndex = -1;
    bg.style.width = img.width || "auto";

    // Horizontal positioning
    switch (img.horizontal) {
      case "left":
        bg.style.left = "0";
        break;
      case "right":
        bg.style.right = "0";
        break;
      case "center":
      default:
        bg.style.left = "50%";
        bg.style.transform = (bg.style.transform || "") + " translateX(-50%)";
        break;
    }

    // Vertical positioning
    switch (img.vertical) {
      case "top":
        bg.style.top = "0";
        break;
      case "bottom":
        bg.style.bottom = "0";
        break;
      case "center":
      default:
        bg.style.top = "50%";
        bg.style.transform = (bg.style.transform || "") + " translateY(-50%)";
        break;
    }

    // Combine transforms (if both X and Y centering or rotation is needed)
    if (img.rotate) {
      bg.style.transform = (bg.style.transform || "") + ` rotate(${img.rotate}deg)`;
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

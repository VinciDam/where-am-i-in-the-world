export function setBackgroundImages(item) {
    const bgLayer = document.getElementById("background-layer");
  
    item.backgroundImages.forEach(bg => {
      let img = document.createElement("img");
      img.src = bg.src;
      img.style.top = bg.top || "auto";
      img.style.bottom = bg.bottom || "auto";
      img.style.left = bg.left || "auto";
      img.style.right = bg.right || "auto";
      img.style.width = bg.width || "auto";
      bgLayer.appendChild(img);
    });
  }
  
export function clearBackgroundImages() {
  const bgLayer = document.getElementById("background-layer");
  bgLayer.innerHTML = "";
}

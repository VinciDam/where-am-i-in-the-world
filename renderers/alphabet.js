export function showWordSequence(item, next, contentEl, activeTimeouts, lastWasValueRef) {
  const text = item.wordSequence;
  const alignV = item.alignV || "center";
  const alignH = item.alignH || "center";
  const delay = item.delay ?? 1200; // default word delay

  const wrapper = document.createElement("div");
  wrapper.className = "word-sequence-wrapper";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.justifyContent =
    alignV === "center" ? "center" :
    alignV === "bottom" ? "flex-end" : "flex-start";
  wrapper.style.alignItems =
    alignH === "left" ? "flex-start" :
    alignH === "right" ? "flex-end" : "center";
  wrapper.style.height = "100%";
  wrapper.style.width = "100%";

  const wordContainer = document.createElement("div");
  wordContainer.className = "word-sequence-word";
  wrapper.appendChild(wordContainer);

  const englishSpan = document.createElement("div");
  englishSpan.className = "word-english";
  const jellySpan = document.createElement("div");
  jellySpan.className = "word-jelly";
  wordContainer.appendChild(englishSpan);
  wordContainer.appendChild(jellySpan);

  contentEl.appendChild(wrapper);

  const words = text.split(" ");
  let index = 0;

  function translateToJellyScript(word) {
    // Replace this with a mapping to your jellyfish font if needed
    return word;
  }

  function showNextWord() {
    if (index >= words.length) {
      activeTimeouts.push(setTimeout(() => {
        contentEl.removeChild(wrapper);
        next();
      }, 1000));
      return;
    }

    const word = words[index++];
    englishSpan.textContent = word;
    jellySpan.textContent = translateToJellyScript(word);

    activeTimeouts.push(setTimeout(showNextWord, delay));
  }

  showNextWord();
}

// renderers/text.js

export function showText(text, next, contentEl, activeTimeouts, lastWasValueRef) {
    revealWordsOneByOne(text, "", true, next, contentEl, activeTimeouts, lastWasValueRef);
  }
  
export function showEmphasizedText(item, next, contentEl, activeTimeouts, lastWasValueRef) {
    revealWordsOneByOne(item.em, "em", false, next, contentEl, activeTimeouts, lastWasValueRef);
  }
  
function revealWordsOneByOne(text, className, addInitialBreak, next, contentEl, activeTimeouts, lastWasValueRef) {
    if (addInitialBreak && !lastWasValueRef.current) {
      contentEl.appendChild(document.createElement("br"));
    }
  
    const words = text.split(" ");
    let wordIndex = 0;
  
    function nextWord() {
      if (wordIndex >= words.length) {
        lastWasValueRef.current = false;
        activeTimeouts.push(setTimeout(next, 100));
        return;
      }
      const span = document.createElement("span");
      if (className) span.className = className;
      span.textContent = words[wordIndex] + (wordIndex < words.length - 1 ? " " : "");
      contentEl.appendChild(span);
      wordIndex++;
      activeTimeouts.push(setTimeout(nextWord, 100));
    }
  
    nextWord();
  }
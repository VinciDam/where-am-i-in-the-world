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

  // Split into tokens: word + whitespace blocks
  const tokens = text.match(/(\s+|\S+)/g) || [];
  let tokenIndex = 0;

  function nextToken() {
    if (tokenIndex >= tokens.length) {
      lastWasValueRef.current = false;
      activeTimeouts.push(setTimeout(next, 100));
      return;
    }

    const span = document.createElement("span");
    if (className) span.className = className;
    span.classList.add("preserve-whitespace"); // to keep spaces/newlines
    span.textContent = tokens[tokenIndex];
    contentEl.appendChild(span);

    tokenIndex++;
    activeTimeouts.push(setTimeout(nextToken, 100));
  }

  nextToken();
}

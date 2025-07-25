// renderers/text.js

const WORD_REVEAL_DELAY = 100;

export function showText(text, next, contentEl, activeTimeouts, lastWasValueRef) {
  showStyledText({ text, className: "", addInitialBreak: true }, next, contentEl, activeTimeouts, lastWasValueRef);
}

export function showEmphasizedText(item, next, contentEl, activeTimeouts, lastWasValueRef) {
  showStyledText({ text: item.em, className: "em", addInitialBreak: false }, next, contentEl, activeTimeouts, lastWasValueRef);
}

export function showStyledText({ text, className = "", addInitialBreak = true }, next, contentEl, activeTimeouts, lastWasValueRef) {
  revealWordsOneByOne(text, className, addInitialBreak, next, contentEl, activeTimeouts, lastWasValueRef);
}

export function clearTextThenNext(contentEl, next, activeTimeouts, delay = 1000) {
  activeTimeouts.push(setTimeout(() => {
    contentEl.innerHTML = "";
    next();
  }, delay));
}

function revealWordsOneByOne(text, className, addInitialBreak, next, contentEl, activeTimeouts, lastWasValueRef) {
  if (addInitialBreak && !lastWasValueRef.current) {
    contentEl.appendChild(document.createElement("br"));
  }

  const tokens = (text || "").match(/(\s+|\S+)/g) || [];
  let tokenIndex = 0;

  function nextToken() {
    if (tokenIndex >= tokens.length) {
      lastWasValueRef.current = false;
      activeTimeouts.push(setTimeout(next, WORD_REVEAL_DELAY));
      return;
    }

    const span = createTextSpan(tokens[tokenIndex], className);
    contentEl.appendChild(span);

    tokenIndex++;
    activeTimeouts.push(setTimeout(nextToken, WORD_REVEAL_DELAY));
  }

  nextToken();
}

function createTextSpan(token, className) {
  const span = document.createElement("span");
  span.textContent = token;
  if (className) span.className = className;
  span.classList.add("preserve-whitespace");
  return span;
}

// renderers/text.js

import { dispatchContent } from "../dispatcher.js";

// Timing configuration
const WORD_REVEAL_DELAY = 70;
const MAX_SPACE_DELAY = WORD_REVEAL_DELAY; // for whitespace clusters

export function showText(text, next, contentEl, activeTimeouts, lastWasValueRef) {
  // SPECIAL CASE: an *empty string* means an explicit blank line.
  // We do NOT treat whitespace-only strings (e.g. "   ") here,
  // because those should render as visible spaces via tokenized spans.
  if (text === "") {
    // Insert a single line break
    contentEl.appendChild(document.createElement("br"));

    // Maintain the convention that the last thing was not a 'value' (so normal breaks can occur next)
    lastWasValueRef.current = false;

    // continue the sequence
    activeTimeouts.push(setTimeout(next, 20));
    return;
  }

  // Normal strings: default to breakBefore + breakAfter (you set these defaults earlier)
  showStyledText(
    { text, className: "", breakBefore: false, breakAfter: false },
    next,
    contentEl,
    activeTimeouts,
    lastWasValueRef
  );
}

export function showEmphasizedText(item, next, contentEl, activeTimeouts, lastWasValueRef) {
  showStyledText(
    { 
      text: item.em, 
      className: "em", 
      breakBefore: item.breakBefore ?? false, 
      breakAfter: item.breakAfter ?? false 
    },
    next,
    contentEl,
    activeTimeouts,
    lastWasValueRef
  );
}

export function showStyledText({ text, className = "", breakBefore = false, breakAfter = false }, next, contentEl, activeTimeouts, lastWasValueRef) {
  revealTextCharByChar(text, className, breakBefore, breakAfter, next, contentEl, activeTimeouts, lastWasValueRef);
}

export function clearTextThenNext(contentEl, next, activeTimeouts, delay = 1000) {
  activeTimeouts.push(setTimeout(() => {
    contentEl.innerHTML = "";
    next();
  }, delay));
}

// NEW: block text with alignment
export function showBlock(item, next, contentEl, activeTimeouts, lastWasValueRef) {
  const { block, align = "left" } = item;
  const breakBefore = item.breakBefore ?? false;
  const breakAfter = item.breakAfter ?? false;

  const div = document.createElement("div");
  div.classList.add("text-block", "preserve-whitespace");

  // alignment only makes sense for block-level container
  if (align === "center") div.style.textAlign = "center";
  else if (align === "right") div.style.textAlign = "right";
  else if (align === "justify") {
    div.style.textAlign = "justify";
    div.style.textJustify = "inter-word";
  }

  if (breakBefore) contentEl.appendChild(document.createElement("br"));
  contentEl.appendChild(div);

  // ensure block is treated as an array
  const children = Array.isArray(block) ? block : [block];

  let i = 0;
  function nextChild() {
    if (i >= children.length) {
      if (breakAfter) div.appendChild(document.createElement("br"));
      activeTimeouts.push(setTimeout(next, 40));
      return;
    }

    dispatchContent(children[i], () => {
      i++;
      nextChild();
    }, div, activeTimeouts, lastWasValueRef);
  }

  nextChild();
}

function revealTextCharByChar(text, className, breakBefore, breakAfter, next, contentEl, activeTimeouts, lastWasValueRef) {
  if (breakBefore && !lastWasValueRef.current) {
    contentEl.appendChild(document.createElement("br"));
  }

  const tokens = (text || "").match(/(\s+|\S+)/g) || [];
  let tokenIndex = 0;
  let charIndex = 0;
  let currentSpan = null;

  function nextChar() {
    // all tokens done
    if (tokenIndex >= tokens.length) {
      lastWasValueRef.current = false;
      if (breakAfter) contentEl.appendChild(document.createElement("br"));
      activeTimeouts.push(setTimeout(next, WORD_REVEAL_DELAY));
      return;
    }

    const token = tokens[tokenIndex];

    // first char of a token → create a span
    if (charIndex === 0) {
      currentSpan = document.createElement("span");
      if (className) currentSpan.className = className;
      currentSpan.classList.add("preserve-whitespace");
      contentEl.appendChild(currentSpan);
    }

    // reveal the next character
    currentSpan.textContent += token[charIndex];
    charIndex++;

    if (charIndex >= token.length) {
      // token finished → move to next one
      tokenIndex++;
      charIndex = 0;
    }

    activeTimeouts.push(setTimeout(nextChar, WORD_REVEAL_DELAY));
  }

  nextChar();
}

function createTextSpan(token, className) {
  const span = document.createElement("span");
  span.textContent = token;
  if (className) span.className = className;
  span.classList.add("preserve-whitespace");
  return span;
}

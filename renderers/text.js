// renderers/text.js

import { dispatchContent } from "../dispatcher.js";

// Timing configuration
const WORD_REVEAL_DELAY = 70;
const MAX_SPACE_DELAY = WORD_REVEAL_DELAY; // for whitespace clusters

export function showTextItem(item, next, contentEl, activeTimeouts, lastWasValueRef) {
  // --- Normalize input ---
  let text = "";
  let className = "";
  let breakBefore = false;
  let breakAfter = false;
  let indent = 0; // optional indentation (in num spaces)

  if (typeof item === "string") {
    text = item;
  } else if (item.em) {
    text = item.em;
    className = "em";
    breakBefore = item.breakBefore ?? false;
    breakAfter = item.breakAfter ?? false;
    indent = item.indent ?? 0;
  } else if (item.text) {
    text = item.text;
    className = item.className || "";
    breakBefore = item.breakBefore ?? false;
    breakAfter = item.breakAfter ?? false;
    indent = item.indent ?? 0;
  }

  // --- Preserve blank-line behaviour ---
  if (text === "") {
    contentEl.appendChild(document.createElement("br"));
    lastWasValueRef.current = false;
    activeTimeouts.push(setTimeout(next, 20));
    return;
  }

  // --- Normal case ---
  revealTextCharByChar(
    text, 
    className, 
    breakBefore, 
    breakAfter, 
    next, 
    contentEl, 
    activeTimeouts, 
    lastWasValueRef,
    indent
  );
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

function revealTextCharByChar(
  text, 
  className, 
  breakBefore, 
  breakAfter, 
  next, 
  contentEl, 
  activeTimeouts, 
  lastWasValueRef,
  indent = 0
) {
  if (breakBefore && !lastWasValueRef.current) {
    contentEl.appendChild(document.createElement("br"));
  }

  // Add indentation instantly before reveal
  if (indent > 0) {
    const indentSpan = document.createElement("span");
    indentSpan.classList.add("preserve-whitespace");
    indentSpan.textContent = " ".repeat(indent);
    contentEl.appendChild(indentSpan);
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

    // If this token is *only whitespace*, reveal it all instantly
    if (/^\s+$/.test(token)) {
      currentSpan.textContent += token; // render all spaces at once
      tokenIndex++;
      charIndex = 0;
      activeTimeouts.push(setTimeout(nextChar, WORD_REVEAL_DELAY)); // only one delay
      return;
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

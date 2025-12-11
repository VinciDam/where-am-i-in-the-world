// renderers/text.js

import { dispatchContent } from "../dispatcher.js";

// Timing configuration
const WORD_REVEAL_DELAY = 70;

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
    const id = setTimeout(next, 20);
    activeTimeouts.push({ type: "timeout", id });
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
  // Cancel pending timeouts and RAFs
  for (const entry of activeTimeouts) {
    if (entry.type === "timeout") clearTimeout(entry.id);
    if (entry.type === "raf") cancelAnimationFrame(entry.id);
  }
  activeTimeouts.length = 0;

  // Schedule clearing + next
  const timeoutId = setTimeout(() => {
    contentEl.innerHTML = "";

    // Let the DOM update before proceeding
    queueMicrotask(() => next());
  }, delay);

  activeTimeouts.push({ type: "timeout", id: timeoutId });
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
      const id = setTimeout(next, 40);
      activeTimeouts.push({ type: "timeout", id });
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

  // wrap indent + revealed text in a single container
  const line = document.createElement("span");
  line.classList.add("text-line");
  contentEl.appendChild(line);

  let indentSpan = null;
  if (indent > 0) {
    indentSpan = document.createElement("span");
    indentSpan.classList.add("preserve-whitespace");
    indentSpan.textContent = " ".repeat(indent);
    line.appendChild(indentSpan);
  }

  // this will receive revealed chars
  let revealSpan = document.createElement("span");
  revealSpan.classList.add("preserve-whitespace");
  if (className) revealSpan.classList.add(className);
  line.appendChild(revealSpan);

  // tokenisation
  const tokens = (text || "").match(/(\s+|\S+)/g) || [];
  let tokenIndex = 0;
  let charIndex = 0;

  function scheduleNextFrame() {
    const timeoutId = setTimeout(() => {
      const rafId = requestAnimationFrame(nextChar);
      activeTimeouts.push({ type: "raf", id: rafId });
    }, WORD_REVEAL_DELAY);

    activeTimeouts.push({ type: "timeout", id: timeoutId });
  }

  function nextChar() {
    // all tokens done
    if (tokenIndex >= tokens.length) {
      lastWasValueRef.current = false;
      if (breakAfter) contentEl.appendChild(document.createElement("br"));
      
      const id = setTimeout(next, WORD_REVEAL_DELAY);
      activeTimeouts.push({ type: "timeout", id });
      return;
    }

    const token = tokens[tokenIndex];

    // whitespace token → append whole token instantly
    if (/^\s+$/.test(token)) {
      revealSpan.textContent += token;
      tokenIndex++;
      charIndex = 0;
      scheduleNextFrame();
      return;
    }

    // normal char reveal
    revealSpan.textContent += token[charIndex];
    charIndex++;

    if (charIndex >= token.length) {
      tokenIndex++;
      charIndex = 0;
    }

    scheduleNextFrame();
  }

  nextChar();
}


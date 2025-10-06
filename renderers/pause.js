// renderers/pause.js

export function showPause(item, next, activeTimeouts) {
  const duration = typeof item.pause === "number" ? item.pause : 1000; // default 1s
  activeTimeouts.push(setTimeout(next, duration));
}

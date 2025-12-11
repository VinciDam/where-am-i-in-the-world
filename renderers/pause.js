// renderers/pause.js

export function showPause(item, next, activeTimeouts) {
  const duration = typeof item.pause === "number" ? item.pause : 1000; // default 1s
  const id = setTimeout(next, duration);
  activeTimeouts.push({ type: "timeout", id });
}

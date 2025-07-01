// audio/core/context.js

let audioContext;

/**
 * Returns the shared AudioContext instance.
 * Creates it lazily if it doesn't already exist.
 */
export function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}
 
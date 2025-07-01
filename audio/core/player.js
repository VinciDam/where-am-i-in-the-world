// core/player.js

import { getAudioContext } from "./context.js";

export function playBuffer(buffer) {
  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  return source;
}

export function playLoopingBuffer(buffer) {
  const ctx = getAudioContext();

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const gainNode = ctx.createGain();
  const pannerNode = ctx.createStereoPanner();

  source.connect(gainNode);
  gainNode.connect(pannerNode);
  pannerNode.connect(ctx.destination);

  source.gainNode = gainNode;
  source.pannerNode = pannerNode;

  source.start();
  return source;
}

export function stopLoopingBuffer(source) {
  if (source) {
    try {
      source.stop();
    } catch (e) {
      console.warn("Error stopping source:", e);
    }
  }
}

export function setLoopGain(source, value) {
  if (source?.gainNode) {
    source.gainNode.gain.setValueAtTime(value, getAudioContext().currentTime);
  }
}

export function setLoopPanner(source, position) {
  if (source?.pannerNode) {
    source.pannerNode.pan.setValueAtTime(position, getAudioContext().currentTime);
  }
}

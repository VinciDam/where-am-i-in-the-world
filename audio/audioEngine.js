// audio/audioEngine.js

import { getAudioContext } from "./core/context.js";
import { fetchAndDecode } from "./core/loader.js";
import { playLoopingBuffer, stopLoopingBuffer, setLoopGain, setLoopPanner } from "./core/player.js";
import { reverseBuffer } from "./utils/bufferUtils.js";

let backgroundBuffer = null;
let initialized = false;
let backgroundSource = null;
let currentChapterSource = null;

export async function ensureInitialized() {
  if (!initialized) {
    const ctx = getAudioContext();
    await ctx.resume();
    initialized = true;
  }
}

// Add this helper (internal use only)
async function playChapterBuffer(buffer, volume = 1.0) {
    await ensureInitialized();
  
    // Stop previous chapter audio if still playing
    if (currentChapterSource) {
      try {
        currentChapterSource.stop();
        currentChapterSource.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
      currentChapterSource = null;
    }
  
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Add gain node
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();
  
    currentChapterSource = source;
  
    source.onended = () => {
      if (currentChapterSource === source) {
        currentChapterSource = null;
      }
    };
  }
  
export async function playSoundFromUrl(url, volume = 1.0) {
    const buffer = await fetchAndDecode(url);
    await playChapterBuffer(buffer, volume);
}

export async function playReversedSoundFromUrl(url) {
    const buffer = await fetchAndDecode(url);
    const reversed = reverseBuffer(buffer);
    await playChapterBuffer(reversed);
}

export async function startBackgroundLoop(url) {
    await ensureInitialized();
    const buffer = backgroundBuffer || await fetchAndDecode(url);
    backgroundSource = playLoopingBuffer(buffer);
}

export function stopBackgroundLoop() {
    if (backgroundSource) {
        stopLoopingBuffer(backgroundSource);
        backgroundSource = null;
    }
}

export function setBackgroundVolume(value) {
  setLoopGain(backgroundSource, value);
}

export function setBackgroundPanning(position) {
  setLoopPanner(backgroundSource, position);
}

export function getAudioContextInstance() {
  return getAudioContext();
}

let backgroundStarted = false;

export async function startBackgroundOnce(url) {
    if (!backgroundStarted) {
            await startBackgroundLoop(url);
            backgroundStarted = true;
    }
}

export function resetBackgroundTrigger() {
  backgroundStarted = false;
}

export function stopChapterAudio() {
    if (currentChapterSource) {
        currentChapterSource.stop();
        currentChapterSource.disconnect();
        currentChapterSource = null;
    }
  }

// Preload background audio at startup
(async () => {
  try {
    const ctx = getAudioContext();
    // Don't resume yet (avoids autoplay restrictions)
    const response = await fetch("audio/background.mp3");
    const arrayBuffer = await response.arrayBuffer();
    backgroundBuffer = await ctx.decodeAudioData(arrayBuffer);
    console.log("Background audio preloaded.");
  } catch (e) {
    console.warn("Failed to preload background:", e);
  }
})();




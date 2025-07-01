// audio/audioEngine.js

import { getAudioContext } from "./core/context.js";
import { fetchAndDecode } from "./core/loader.js";
import { playBuffer, playLoopingBuffer, stopLoopingBuffer, setLoopGain, setLoopPanner } from "./core/player.js";
import { reverseBuffer } from "./utils/bufferUtils.js";
import { startAmbientSnippets, stopAmbientSnippets } from './ambient.js';

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
async function playChapterBuffer(buffer) {
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
    source.connect(ctx.destination);
    source.start();
  
    currentChapterSource = source;
  
    source.onended = () => {
      if (currentChapterSource === source) {
        currentChapterSource = null;
      }
    };
  }
  
export async function playSoundFromUrl(url) {
    const buffer = await fetchAndDecode(url);
    await playChapterBuffer(buffer);
}

export async function playReversedSoundFromUrl(url) {
    const buffer = await fetchAndDecode(url);
    const reversed = reverseBuffer(buffer);
    await playChapterBuffer(reversed);
}

export async function startBackgroundLoop(url) {
    await ensureInitialized();
    const buffer = await fetchAndDecode(url);
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

export function stopChapterAudio() {
    if (currentChapterSource) {
        currentChapterSource.stop();
        currentChapterSource.disconnect();
        currentChapterSource = null;
    }
  }



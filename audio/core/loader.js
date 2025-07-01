// audio/core/loader.js

import { getAudioContext } from "./context.js";

/**
 * Fetches an audio file from a given URL and decodes it into an AudioBuffer.
 * @param {string} url - The path or URL of the audio file.
 * @returns {Promise<AudioBuffer>}
 */
export async function fetchAndDecode(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch audio at ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const audioContext = getAudioContext();
  return await audioContext.decodeAudioData(arrayBuffer);
}

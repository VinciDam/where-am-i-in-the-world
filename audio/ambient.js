// audio/ambient.js
import { getAudioContext } from "./core/context.js";
import { fetchAndDecode } from "./core/loader.js";
import { snippetUrls } from "./snippets/index.js";

let ambientSource = null;
let ambientIndex = 0;
let ambientTimeout = null;
let ambientPlaying = false;

export async function startAmbientSnippets() {
  const ctx = getAudioContext();
  await ctx.resume();

  if (!ambientPlaying) {
    ambientPlaying = true;
    ambientIndex = 0;
    playNextAmbientSnippet();
  }
}

export function stopAmbientSnippets() {
  ambientPlaying = false;
  if (ambientTimeout) clearTimeout(ambientTimeout);
  if (ambientSource) {
    try {
      ambientSource.stop();
      ambientSource.disconnect();
    } catch (_) {}
    ambientSource = null;
  }
}

async function playNextAmbientSnippet() {
  if (!ambientPlaying || ambientIndex >= snippetUrls.length) return;

  const ctx = getAudioContext();
  const buffer = await fetchAndDecode(snippetUrls[ambientIndex]);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();

  ambientSource = source;

  source.onended = () => {
    ambientIndex = (ambientIndex + 1) % snippetUrls.length;
    const delay = 2000 + Math.random() * 3000;
    ambientTimeout = setTimeout(playNextAmbientSnippet, delay);
  };
}

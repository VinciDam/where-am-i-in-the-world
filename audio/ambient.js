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
      // also disconnect the gain node if we attached one
      if (ambientSource.gainNode) {
        try { ambientSource.gainNode.disconnect(); } catch (_) {}
      }
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

  // Minimal change: insert a GainNode set to 50% volume.
  const gainNode = ctx.createGain(); // <-- added
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime); // <-- added

  // connect source -> gain -> destination
  source.connect(gainNode); // <-- changed
  gainNode.connect(ctx.destination); // <-- changed

  // keep a reference so stopAmbientSnippets can disconnect it
  source.gainNode = gainNode; // <-- added

  source.start();

  ambientSource = source;

  source.onended = () => {
    ambientIndex = (ambientIndex + 1) % snippetUrls.length;
    const delay = 5000 + Math.random() * 10000;
    ambientTimeout = setTimeout(playNextAmbientSnippet, delay);
  };
}

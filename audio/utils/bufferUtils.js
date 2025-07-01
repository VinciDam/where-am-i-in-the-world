// audio/utils/bufferUtils.js

/**
 * Returns a new AudioBuffer with all channels reversed in time.
 * @param {AudioBuffer} buffer - The input AudioBuffer.
 * @returns {AudioBuffer} - The reversed AudioBuffer.
 */
export function reverseBuffer(buffer) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const reversedBuffer = ctx.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );
  
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const input = buffer.getChannelData(channel);
      const output = reversedBuffer.getChannelData(channel);
      for (let i = 0; i < input.length; i++) {
        output[i] = input[input.length - 1 - i];
      }
    }
  
    return reversedBuffer;
  }
  
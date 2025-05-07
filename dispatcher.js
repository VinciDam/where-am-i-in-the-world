// dispatcher.js
import { showText, showEmphasizedText } from './renderers/text.js';
import { showValue } from './renderers/value.js';
import { showVideo } from './renderers/video.js';
import { showImage } from './renderers/image.js';
import { showVideoGrid, showImageGrid } from './renderers/grid.js';
import { showAlphabetRing } from './renderers/alphabetRing.js';

export function dispatchContent(item, next, contentEl, activeTimeouts, lastWasValueRef) {
  if (typeof item === "object" && item.em) {
    showEmphasizedText(item, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (typeof item === "string") {
    showText(item, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.value) {
    showValue(item, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.video) {
    showVideo(item, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.image) {
    showImage(item, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.videoGrid) {
    showVideoGrid(item.videoGrid, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.imageGrid) {
    showImageGrid(item.imageGrid, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.alphabetRing) {
    showAlphabetRing(item.alphabetRing, next, contentEl, activeTimeouts, lastWasValueRef);
  } else {
    next(); // unknown content; skip
  }
}
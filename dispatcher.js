// dispatcher.js
import { showText, showEmphasizedText, clearTextThenNext, showBlock } from './renderers/text.js';
import { showValue } from './renderers/value.js';
import { showVideo } from './renderers/video.js';
import { showImage } from './renderers/image.js';
import { showPause } from './renderers/pause.js';
import { showVideoGrid, showImageGrid } from './renderers/grid.js';
import { showAlphabetRing } from './renderers/alphabetRing.js';
import { showWordSequence } from './renderers/alphabet.js';
import { showAnimatedImage, showReplicatedImages, 
  showScalingImage, showAnimatedSquiggle, showCircularAnimatedImage } from './renderers/animatedImage.js';
import { setBackgroundImages, clearBackgroundImages } from './renderers/background.js';

export function dispatchContent(item, next, contentEl, activeTimeouts, lastWasValueRef, onValueClick) {
  if (typeof item === "object" && item.em) {
    showEmphasizedText(item, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (typeof item === "string") {
    showText(item, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.clearText) {
    const delay = typeof item.delay === "number" ? item.delay : 1000;
    clearTextThenNext(contentEl, next, activeTimeouts, delay);
  } else if (item.value) {
    showValue(item, next, contentEl, activeTimeouts, lastWasValueRef, onValueClick);
  } else if (item.block) {
    showBlock(item, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.pause) {
    showPause(item, next, activeTimeouts);
  } else if (item.video) {
    showVideo(item, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.backgroundImages) {
    setBackgroundImages(item);
    next();
  } else if (item.clearBackground) {
    clearBackgroundImages();
    next();
  } else if (item.image) {
    showImage(item, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.videoGrid) {
    showVideoGrid(item, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.imageGrid) {
    showImageGrid(item, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.wordSequence) {
    showWordSequence(item, next, contentEl, activeTimeouts, lastWasValueRef)
  } else if (item.alphabetRing) {
    showAlphabetRing(item.alphabetRing, next, contentEl, activeTimeouts, lastWasValueRef);
  } else if (item.animatedImage) {
    showAnimatedImage(item, next, activeTimeouts, lastWasValueRef);
  } else if (item.circularAnimatedImage) {
    showCircularAnimatedImage(item, next, activeTimeouts, lastWasValueRef);
  } else if (item.scalingImage) {
    showScalingImage(item, next, activeTimeouts, lastWasValueRef);
  } else if (item.replicateImage) {
    showReplicatedImages(item, next, activeTimeouts, lastWasValueRef);
  } else if (item.squiggleSvg) {
    showAnimatedSquiggle(item, next, activeTimeouts, lastWasValueRef);
  } else {
    next(); // unknown content; skip
  }
}
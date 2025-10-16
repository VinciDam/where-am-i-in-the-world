let linkClicks = 0;

export function incrementLinkClicks() {
  linkClicks++;
  return linkClicks;
}

export function resetLinkClicks() {
  linkClicks = 0;
}

export function getLinkClicks() {
  return linkClicks;
}

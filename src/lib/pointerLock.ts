// Thin wrappers around the Fullscreen and Pointer Lock browser APIs.
//
// Fullscreen and Pointer Lock entry are split into separate calls because the
// app enters them at different moments (fullscreen on the start page via a
// button click, pointer lock automatically on the tracking page).
//
// NOTE: both APIs require transient user activation (a click/keypress). They
// will reject when called outside a user-gesture handler.

export function enterFullscreen(element: Element): Promise<void> {
  return element.requestFullscreen();
}

export function enterPointerLock(element: Element): Promise<void> {
  // requestPointerLock returns void in older lib.dom typings; normalize to a
  // promise so callers can await/catch uniformly.
  return Promise.resolve(element.requestPointerLock());
}

export function exitCaptureMode(): void {
  if (document.pointerLockElement) document.exitPointerLock();
  if (document.fullscreenElement) document.exitFullscreen();
}

export interface ViewportCenter {
  viewportWidth: number;
  viewportHeight: number;
  centerX: number;
  centerY: number;
}

export function getViewportCenter(): ViewportCenter {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  return {
    viewportWidth,
    viewportHeight,
    centerX: viewportWidth / 2,
    centerY: viewportHeight / 2
  };
}

export function isLocked(): boolean {
  return document.pointerLockElement !== null;
}

export function isFullscreen(): boolean {
  return document.fullscreenElement !== null;
}

/** Subscribes to pointerlockchange; returns an unsubscribe function. */
export function onLockChange(callback: () => void): () => void {
  document.addEventListener('pointerlockchange', callback);
  return () => document.removeEventListener('pointerlockchange', callback);
}

/** Subscribes to fullscreenchange; returns an unsubscribe function. */
export function onFullscreenChange(callback: () => void): () => void {
  document.addEventListener('fullscreenchange', callback);
  return () => document.removeEventListener('fullscreenchange', callback);
}

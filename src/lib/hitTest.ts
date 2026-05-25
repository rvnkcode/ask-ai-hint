// Virtual hit testing: under pointer lock the OS cursor is frozen, so normal
// click handlers never fire on the buttons. Instead we resolve which target
// element sits at the virtual cursor coordinates ourselves.

/**
 * Returns the key of the first target whose element contains the topmost
 * element at (x, y), or null when nothing matches.
 */
export function hitTestAt(
  x: number,
  y: number,
  targets: Record<string, HTMLElement | null>
): string | null {
  const topmost = document.elementFromPoint(x, y);
  if (!topmost) return null;

  for (const [key, element] of Object.entries(targets)) {
    // `contains` matches the element itself and any descendant, so clicking a
    // child node (e.g. text/icon inside the button) still resolves correctly.
    if (element && element.contains(topmost)) return key;
  }
  return null;
}

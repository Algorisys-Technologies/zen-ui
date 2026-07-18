/**
 * Body scroll lock — what Radix pulls in `react-remove-scroll` for.
 *
 * Two things make this more than `overflow: hidden`:
 *
 *  1. **Reference counting.** Two stacked dialogs, and the first to close would
 *     otherwise unlock the page while the second is still open.
 *  2. **Scrollbar compensation.** Removing the scrollbar narrows the viewport, so
 *     every centered/fixed element jumps sideways by ~15px at the exact moment a
 *     dialog opens. Padding the body by the width the scrollbar occupied holds the
 *     layout still.
 */

let depth = 0;
let restore: (() => void) | null = null;

/** Locks page scroll. Returns a cleanup; the page unlocks when the last caller does. */
export function scrollLock(): () => void {
  depth++;

  if (depth === 1) {
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    // Measure BEFORE hiding the scrollbar — afterwards the gap is gone and the
    // number is always 0.
    const gap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gap > 0) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + gap}px`;
    }

    restore = () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }

  let released = false;
  return () => {
    // Guard: a component whose destroy() runs twice would otherwise drive the
    // count negative and unlock the page under a dialog that is still open.
    if (released) return;
    released = true;
    depth--;
    if (depth === 0) {
      restore?.();
      restore = null;
    }
  };
}

/**
 * Sidebar logic shared by every binding.
 */

/** Seconds or milliseconds from a computed `transition-duration` entry. */
const toMs = (t: string): number => (t.trim().endsWith("ms") ? parseFloat(t) : parseFloat(t) * 1000) || 0;

/**
 * Call `done` once `el`'s transition of `property` has finished, or after its
 * computed duration plus delay if no `transitionend` arrives (the value did
 * not change, the tab is hidden, a reduced-motion 0.01ms transition). Returns
 * a cancel.
 */
export function afterTransition(el: HTMLElement, property: string, done: () => void): () => void {
  const cs = getComputedStyle(el);
  const longest = (v: string) => Math.max(0, ...v.split(",").map(toMs));
  const wait = longest(cs.transitionDuration) + longest(cs.transitionDelay);
  let finished = false;
  const onEnd = (e: TransitionEvent) => {
    if (e.target === el && e.propertyName === property) finish();
  };
  const timer = setTimeout(() => finish(), wait + 50);
  const stop = () => {
    clearTimeout(timer);
    el.removeEventListener("transitionend", onEnd);
  };
  function finish() {
    if (finished) return;
    finished = true;
    stop();
    done();
  }
  el.addEventListener("transitionend", onEnd);
  return () => {
    finished = true;
    stop();
  };
}

/**
 * `afterTransition` for the sidebar's width: how the sidebar knows a collapse
 * or expand is over, and stops clipping and keeping its rows to one line
 * (`data-transitioning`).
 */
export const afterWidthTransition = (el: HTMLElement, done: () => void): (() => void) =>
  afterTransition(el, "width", done);

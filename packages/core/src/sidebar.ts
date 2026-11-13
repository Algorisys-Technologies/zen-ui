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
 *
 * "Finished" means every OTHER property that started transitioning on `el`
 * has ended too, not only `property`. Callers remove `el` in `done`, and a
 * transition still running on a removed element never reports its end where
 * a document-level listener can hear it: Kobalte tracks running transitions
 * that way (`@kobalte/utils`, a `transitionrun` listener on body) and kept
 * every such element forever. The sidebar's sub-list eases `margin` beside
 * `grid-template-rows`, so each collapse of an open group leaked its list and
 * a listener, and Kobalte's after-transition callbacks stopped running for
 * good once its map could no longer empty.
 */
export function afterTransition(el: HTMLElement, property: string, done: () => void): () => void {
  const cs = getComputedStyle(el);
  const longest = (v: string) => Math.max(0, ...v.split(",").map(toMs));
  const wait = longest(cs.transitionDuration) + longest(cs.transitionDelay);
  let finished = false;
  let ended = false;
  const running = new Set<string>();
  const onRun = (e: TransitionEvent) => {
    if (e.target === el) running.add(e.propertyName);
  };
  const onEnd = (e: TransitionEvent) => {
    if (e.target !== el) return;
    running.delete(e.propertyName);
    if (e.propertyName === property) ended = true;
    if (ended && running.size === 0) finish();
  };
  const timer = setTimeout(() => finish(), wait + 50);
  const stop = () => {
    clearTimeout(timer);
    el.removeEventListener("transitionrun", onRun);
    el.removeEventListener("transitionend", onEnd);
    el.removeEventListener("transitioncancel", onEnd);
  };
  function finish() {
    if (finished) return;
    finished = true;
    stop();
    done();
  }
  el.addEventListener("transitionrun", onRun);
  el.addEventListener("transitionend", onEnd);
  el.addEventListener("transitioncancel", onEnd);
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

/**
 * `data-state` toggling, animation-aware exit, and the collapsible height
 * measurement — Radix's `Presence` + `Collapsible`'s measuring effect.
 *
 * **This binding emits React's state vocabulary** (`data-state="open" | "closed"`).
 * That is a decision, not an accident: the primitive library's vocabulary leaks
 * into the shipped class strings, so `data-[state=open]:zen-anim-accordion-down`
 * and Solid's `data-[expanded]:…` are the same design decision in two dialects.
 * Vanilla owns its own behaviour, so it is free to choose, and it chooses the
 * reference binding's. See PORTING.md.
 */

export type PresenceState = "open" | "closed";

/** Is anything actually animating on this element right now? */
const hasAnimation = (el: HTMLElement) => {
  const cs = getComputedStyle(el);
  return cs.animationName !== "none" && parseFloat(cs.animationDuration) > 0;
};

/**
 * Set the state and, when closing, wait for the exit animation before running
 * `done`.
 *
 * Without the wait, removing the node on close means the exit animation never
 * renders a frame — the element is gone before the first one. That is why this
 * cannot be `el.remove()`.
 */
export function setPresence(el: HTMLElement, state: PresenceState, done?: () => void): void {
  el.setAttribute("data-state", state);

  if (state === "open" || !done) {
    if (state === "open") el.removeAttribute("hidden");
    return;
  }

  // Read AFTER the attribute is set, so the exit rule is the one in effect.
  if (!hasAnimation(el)) {
    done();
    return;
  }

  const onEnd = (e: AnimationEvent) => {
    // Only OUR animation: a child's animation bubbles here too, and acting on it
    // unmounts the surface mid-exit.
    if (e.target !== el) return;
    el.removeEventListener("animationend", onEnd);
    el.removeEventListener("animationcancel", onEnd);
    done();
  };
  el.addEventListener("animationend", onEnd);
  // If the element is re-opened mid-exit the animation is cancelled and
  // animationend never fires; without this the cleanup never runs.
  el.addEventListener("animationcancel", onEnd);
}

/**
 * Publish the content's natural height as `--zen-collapsible-content-height`, the
 * neutral name core's keyframes interpolate to.
 *
 * core used to read `var(--radix-accordion-content-height)` — a Radix name, in the
 * one file meant to be framework-agnostic. Radix and Kobalte each publish this
 * under their own prefix and each binding now maps its own onto the neutral name.
 * This binding has no primitive library, so it measures the height itself.
 *
 * The measurement must happen with the animation SUPPRESSED. Reading `scrollHeight`
 * while `zen-accordion-down` is mid-flight returns the animating height, which then
 * becomes the animation's own target — the accordion converges on some fraction of
 * its real size and stops there. Radix suppresses `animationName` for exactly one
 * layout read for the same reason.
 *
 * Returns a cleanup for the observer.
 */
export interface CollapsibleHeight {
  /** Re-read the natural height now. Call before opening. */
  measure(): void;
  dispose(): void;
}

export function trackCollapsibleHeight(el: HTMLElement): CollapsibleHeight {
  const measure = () => {
    // A `hidden` element has NO layout, so scrollHeight is 0 — and a keyframe
    // that animates to 0px is a keyframe that does nothing. The collapsed content
    // is hidden by definition, so measuring it means briefly un-hiding it.
    // `visibility: hidden` keeps that off-screen: it still occupies layout (which
    // is what we need to measure) but paints nothing, so there is no flash.
    const wasHidden = el.hidden;
    const prevAnim = el.style.animationName;
    const prevVis = el.style.visibility;

    if (wasHidden) {
      el.style.visibility = "hidden";
      el.hidden = false;
    }
    // Suppress the animation for the read. Measuring mid-flight returns the
    // ANIMATING height, which then becomes the animation's own target — the
    // accordion converges on some fraction of its real size and stops there.
    // Radix suppresses animationName for one layout read for the same reason.
    el.style.animationName = "none";

    const height = el.scrollHeight;

    el.style.animationName = prevAnim;
    if (wasHidden) {
      el.hidden = true;
      el.style.visibility = prevVis;
    }
    el.style.setProperty("--zen-collapsible-content-height", `${height}px`);
  };

  measure();

  // The content can change size after mount — a font loads, an image decodes, a
  // caller writes into it. A height measured once is wrong from then on.
  const ro = new ResizeObserver(() => {
    // Never during the animation: re-measuring every frame re-targets it.
    if (!hasAnimation(el)) measure();
  });
  ro.observe(el);

  return { measure, dispose: () => ro.disconnect() };
}

/**
 * Reading direction — the framework-agnostic half.
 *
 * There are two distinct problems here and they want different solutions.
 *
 * 1. THE PRIMITIVES. Radix and Kobalte keep direction in their own JS context
 *    and default to "ltr" no matter what the DOM says. Only a provider can tell
 *    them, so each binding ships a `DirectionProvider`. That is binding-specific
 *    and lives there, not here.
 *
 * 2. ZEN-UI'S OWN COMPONENTS. Carousel, Rating, Likert, NPS, OTP, Tree,
 *    ColorPalette, ObjectPage and TimePicker all decide what ArrowLeft and
 *    ArrowRight MEAN. They need direction too — but threading a context through
 *    every one of them is a lot of plumbing for a value the DOM already knows.
 *
 * So for (2) we ask the element. `getComputedStyle(el).direction` is the
 * EFFECTIVE direction at that point in the tree: it accounts for `dir` on
 * <html>, on any ancestor, and on the element itself, which a context would
 * only know about if every wrapper remembered to update it. It needs no
 * provider, it cannot go stale, and it composes with `<Theme>` and with a
 * caller's own `dir` on a subtree for free.
 *
 * The cost is a layout-adjacent read per keystroke. That is fine here: it
 * happens on ArrowLeft/ArrowRight in a component the user is already
 * interacting with, not in a render loop.
 */

export type Direction = "ltr" | "rtl";

/** `dir` on <html>, defaulting to ltr off the DOM (SSR). */
export function readDocumentDirection(): Direction {
  if (typeof document === "undefined") return "ltr";
  return document.documentElement.getAttribute("dir") === "rtl" ? "rtl" : "ltr";
}

/**
 * Calls back whenever `dir` on <html> changes; returns the unsubscribe.
 *
 * Apps flip direction at runtime when the user switches locale, so reading once
 * on mount is the difference between a language switch that works and one that
 * needs a reload.
 */
export function observeDocumentDirection(onChange: (dir: Direction) => void): () => void {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(() => onChange(readDocumentDirection()));
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
  return () => observer.disconnect();
}

/**
 * The EFFECTIVE direction at an element — what the browser actually resolved,
 * including any `dir` on the element or an ancestor.
 *
 * Prefer this over `readDocumentDirection()` inside a component: a page can be
 * ltr with an rtl panel in it, and only this sees that.
 */
export function directionOf(el: Element | null | undefined): Direction {
  if (!el || typeof window === "undefined") return "ltr";
  return window.getComputedStyle(el).direction === "rtl" ? "rtl" : "ltr";
}

/**
 * Maps a horizontal arrow key to a LOGICAL step: `1` forward (next), `-1`
 * backward (previous), `0` if it is not a horizontal arrow.
 *
 * In RTL, "next" is to the LEFT — pressing ArrowLeft moves you forward through
 * a carousel, a rating, a set of OTP boxes. This is the whole reason the
 * function exists: `key === "ArrowRight"` is a bug in every one of those.
 *
 * Vertical arrows are deliberately NOT handled. Up and down never flip, so a
 * component that treats ArrowDown as "next" is already correct and should keep
 * doing so alongside this.
 */
export function horizontalStep(key: string, dir: Direction): -1 | 0 | 1 {
  if (key !== "ArrowLeft" && key !== "ArrowRight") return 0;
  const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  return key === forward ? 1 : -1;
}

/**
 * `horizontalStep` against the element's own effective direction — the form
 * almost every call site wants, since it already has the event target to hand.
 *
 *   const step = arrowStep(e.key, e.currentTarget);
 *   if (step) go(index + step);
 */
export function arrowStep(key: string, el: Element | null | undefined): -1 | 0 | 1 {
  return horizontalStep(key, directionOf(el));
}

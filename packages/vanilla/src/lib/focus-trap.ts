/**
 * Focus containment for modal surfaces — Radix's `FocusScope`, written out.
 *
 * Contract, and every clause is a real bug if you drop it:
 *  - Focus moves INTO the surface on open, or a keyboard user is stranded behind
 *    a dialog they cannot reach.
 *  - Tab and Shift+Tab cycle WITHIN it, or they walk out into the page behind and
 *    the modal stops being modal.
 *  - Focus RETURNS to whatever opened it on close, or the user's place in the
 *    document is lost.
 */

/**
 * Deliberately not a static list of tag names. `[tabindex]` and `contenteditable`
 * are focusable, `disabled` and `inert` subtrees are not, and a details/summary
 * is focusable only via its summary.
 */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "[contenteditable=true]",
  "audio[controls]",
  "video[controls]",
  "summary",
].join(",");

/**
 * Visible AND rendered. `offsetParent` is null for `display:none` but ALSO for
 * `position:fixed`, which every dialog is — so it cannot be the test, and using it
 * silently makes a fixed dialog untrappable.
 */
const isVisible = (el: HTMLElement) => {
  if (el.hasAttribute("inert") || el.closest("[inert]")) return false;
  const rects = el.getClientRects();
  if (rects.length === 0) return false;
  const cs = getComputedStyle(el);
  return cs.visibility !== "hidden";
};

export const focusable = (root: HTMLElement): HTMLElement[] =>
  [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(isVisible);

export interface FocusTrapOptions {
  /** Focus this on open instead of the first focusable child. */
  initialFocus?: HTMLElement | (() => HTMLElement | null);
  /** Return focus here on close. Defaults to whatever was focused at open. */
  returnFocus?: HTMLElement | null;
}

/** Traps focus inside `root`. Returns a cleanup that restores it. */
export function focusTrap(root: HTMLElement, opts: FocusTrapOptions = {}): () => void {
  const previous = opts.returnFocus ?? (document.activeElement as HTMLElement | null);

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const items = focusable(root);
    if (items.length === 0) {
      // Nothing to cycle between: keep focus on the surface rather than letting
      // Tab escape to the page behind.
      e.preventDefault();
      root.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && (active === first || active === root)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /**
   * Tab-cycling alone is not containment: a click, a programmatic `.focus()`, or
   * the browser's own address-bar round trip can all land focus outside without a
   * Tab ever firing. This is the backstop.
   */
  const onFocusIn = (e: FocusEvent) => {
    const target = e.target as Node | null;
    if (target && !root.contains(target)) {
      const items = focusable(root);
      (items[0] ?? root).focus();
    }
  };

  root.addEventListener("keydown", onKeydown);
  document.addEventListener("focusin", onFocusIn);

  // The surface itself must be focusable for the empty case and as the landing
  // spot when nothing inside is.
  if (!root.hasAttribute("tabindex")) root.setAttribute("tabindex", "-1");

  const initial =
    typeof opts.initialFocus === "function" ? opts.initialFocus() : opts.initialFocus;
  (initial ?? focusable(root)[0] ?? root).focus({ preventScroll: true });

  return () => {
    root.removeEventListener("keydown", onKeydown);
    document.removeEventListener("focusin", onFocusIn);
    // Only restore if focus is still ours to give back. If the user has already
    // clicked elsewhere, yanking it is worse than leaving it.
    if (previous?.isConnected && root.contains(document.activeElement)) {
      previous.focus({ preventScroll: true });
    }
  };
}

/**
 * Arrow-key navigation over a set of items — Radix's `RovingFocusGroup`.
 *
 * The rule people get wrong: a tab list is ONE tab stop, not one per tab. Tab
 * enters the group at the active item and Tab again leaves it; the arrows move
 * within. Leaving every item at `tabindex="0"` makes a ten-tab list ten presses
 * deep and is a WCAG 2.1.1 failure, not a preference.
 */

export interface RovingFocusOptions {
  /** Finds the navigable items, in DOM order. Re-read on every key: they change. */
  items: () => HTMLElement[];
  orientation?: "horizontal" | "vertical" | "both";
  /** Wrap from last to first. Default true. */
  loop?: boolean;
  /** Called when an item is reached. Tabs uses this to select on arrow. */
  onFocus?: (el: HTMLElement, index: number) => void;
}

const KEYS = {
  horizontal: { prev: ["ArrowLeft"], next: ["ArrowRight"] },
  vertical: { prev: ["ArrowUp"], next: ["ArrowDown"] },
  both: { prev: ["ArrowLeft", "ArrowUp"], next: ["ArrowRight", "ArrowDown"] },
};

/**
 * Wires arrow / Home / End over `root`'s items and maintains the single tab stop.
 * Returns a cleanup.
 */
export function rovingFocus(root: HTMLElement, opts: RovingFocusOptions): () => void {
  const orientation = opts.orientation ?? "horizontal";
  const loop = opts.loop ?? true;
  const keys = KEYS[orientation];

  /** Exactly one item is tabbable; the rest are reachable only by arrow. */
  const setTabStop = (active: HTMLElement | null) => {
    for (const item of opts.items()) {
      item.tabIndex = item === active ? 0 : -1;
    }
  };

  const focusAt = (index: number) => {
    const items = opts.items();
    if (items.length === 0) return;
    const clamped = loop
      ? (index + items.length) % items.length
      : Math.min(Math.max(index, 0), items.length - 1);
    const target = items[clamped];
    setTabStop(target);
    target.focus();
    opts.onFocus?.(target, clamped);
  };

  const onKeydown = (e: KeyboardEvent) => {
    const items = opts.items();
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (current === -1) return;

    if (keys.next.includes(e.key)) {
      e.preventDefault();
      focusAt(current + 1);
    } else if (keys.prev.includes(e.key)) {
      e.preventDefault();
      focusAt(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusAt(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusAt(items.length - 1);
    }
  };

  /**
   * A click must move the tab stop too, or Tab still returns to whichever item
   * happened to hold it at mount — the user clicks tab 3, tabs away, tabs back,
   * and lands on tab 1.
   */
  const onFocusIn = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (opts.items().includes(target)) setTabStop(target);
  };

  root.addEventListener("keydown", onKeydown);
  root.addEventListener("focusin", onFocusIn);

  const items = opts.items();
  setTabStop(items.find((i) => i.getAttribute("data-state") === "active") ?? items[0] ?? null);

  return () => {
    root.removeEventListener("keydown", onKeydown);
    root.removeEventListener("focusin", onFocusIn);
  };
}

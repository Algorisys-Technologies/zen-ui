/**
 * Escape-to-close and click-outside — Radix's `DismissableLayer`, at the size this
 * library actually needs.
 */

export interface DismissableOptions {
  onDismiss: (reason: "escape" | "outside") => void;
  /** Ignore Escape. AlertDialog does this: it must be answered, not dismissed. */
  disableEscape?: boolean;
  /** Ignore outside clicks. AlertDialog does this too. */
  disableOutside?: boolean;
  /** Clicks inside these do not count as outside (e.g. the trigger). */
  ignore?: Array<HTMLElement | null | undefined>;
}

export function dismissable(root: HTMLElement, opts: DismissableOptions): () => void {
  const onKeydown = (e: KeyboardEvent) => {
    if (opts.disableEscape || e.key !== "Escape" || e.defaultPrevented) return;
    e.preventDefault();
    opts.onDismiss("escape");
  };

  /**
   * POINTERDOWN, not click.
   *
   * A `click` fires on the element the press ENDED over, so pressing inside the
   * surface and releasing outside (any drag: selecting text, a slider, resizing)
   * dismisses it — the user is interacting with the thing and it vanishes.
   *
   * Pointerdown also runs before focus moves, which is what makes a trigger's own
   * press not read as an outside click while the layer is still open.
   */
  const onPointerDown = (e: PointerEvent) => {
    if (opts.disableOutside) return;
    const target = e.target as Node | null;
    if (!target) return;
    if (root.contains(target)) return;
    if (opts.ignore?.some((el) => el?.contains(target))) return;
    opts.onDismiss("outside");
  };

  document.addEventListener("keydown", onKeydown);
  // Capture phase: a handler inside the page that stops propagation would
  // otherwise leave the layer open with no way to close it by clicking away.
  document.addEventListener("pointerdown", onPointerDown, true);

  return () => {
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("pointerdown", onPointerDown, true);
  };
}

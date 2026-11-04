import { type JSX, createEffect, createSignal, onCleanup } from "solid-js";

/**
 * Where a popup list goes, fixed against the field it belongs to: below it,
 * or above when there is more room there, its height capped to the room it
 * has, kept inside the window sideways, and following the field as anything
 * scrolls. Render the popup in a Portal and spread `style()` on it.
 *
 * A popup positioned inside the field's wrapper instead is cut off by any
 * ancestor that clips (a card with overflow hidden) and never flips near the
 * window's end: TreeSelect shipped exactly that.
 */
export function createAnchoredPlacement(opts: {
  anchor: () => HTMLElement | undefined;
  popup: () => HTMLElement | undefined;
  open: () => boolean;
  /** The tallest the popup gets, in px. */
  maxHeight: number;
  /** As wide as the anchor (a list under a field). Otherwise the popup sizes itself, at least as wide as the anchor. */
  matchWidth?: boolean;
  gap?: number;
}) {
  const gap = opts.gap ?? 4;
  const edge = 8;
  const [style, setStyle] = createSignal<JSX.CSSProperties>({ position: "fixed", visibility: "hidden" });
  const [dir, setDir] = createSignal<"ltr" | "rtl">("ltr");

  const measure = () => {
    const anchor = opts.anchor();
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const popup = opts.popup();
    const below = window.innerHeight - r.bottom - gap - edge;
    const above = r.top - gap - edge;
    const wants = Math.min(opts.maxHeight, popup?.scrollHeight ?? opts.maxHeight);
    const up = below < wants && above > below;
    const rtl = getComputedStyle(anchor).direction === "rtl";
    const width = opts.matchWidth ? r.width : Math.max(r.width, popup?.offsetWidth ?? r.width);
    // Start-aligned with the field, then pulled back inside the window.
    let left = rtl ? r.right - width : r.left;
    left = Math.max(edge, Math.min(left, window.innerWidth - edge - width));
    setDir(rtl ? "rtl" : "ltr");
    setStyle({
      position: "fixed",
      left: `${left}px`,
      ...(opts.matchWidth ? { width: `${r.width}px` } : { "min-width": `${r.width}px`, "max-width": `calc(100vw - ${edge * 2}px)` }),
      ...(up ? { bottom: `${window.innerHeight - r.top + gap}px` } : { top: `${r.bottom + gap}px` }),
      "max-height": `${Math.max(96, Math.min(opts.maxHeight, up ? above : below))}px`,
    });
  };

  createEffect(() => {
    if (!opts.open()) return;
    measure();
    // Again once the popup has laid out: its own size decides flipping and the sideways pull.
    let frame = requestAnimationFrame(measure);
    const later = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", later, true);
    window.addEventListener("resize", later);
    onCleanup(() => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", later, true);
      window.removeEventListener("resize", later);
    });
  });

  return { style, dir, measure };
}

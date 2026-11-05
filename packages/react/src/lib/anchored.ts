import * as React from "react";

export type AnchoredPlacementOptions = {
  anchor: React.RefObject<HTMLElement | null>;
  popup: React.RefObject<HTMLElement | null>;
  open: boolean;
  /** The tallest the popup gets, in px. */
  maxHeight: number;
  /** As wide as the anchor (a list under a field). Otherwise the popup sizes itself, at least as wide as the anchor. */
  matchWidth?: boolean;
  gap?: number;
};

const HIDDEN: React.CSSProperties = { position: "fixed", visibility: "hidden" };

/**
 * Where a popup list goes, fixed against the field it belongs to: below it,
 * or above when there is more room there, its height capped to the room it
 * has, kept inside the window sideways, and following the field as anything
 * scrolls. Render the popup in a portal and put `style` and `dir` on it.
 *
 * A popup positioned inside the field's wrapper instead is cut off by any
 * ancestor that clips (a card with overflow hidden) and never flips near the
 * window's end: TreeSelect shipped exactly that (in Solid, which this mirrors:
 * solid/src/lib/anchored.ts).
 */
export function useAnchoredPlacement(opts: AnchoredPlacementOptions) {
  const [style, setStyle] = React.useState<React.CSSProperties>(HIDDEN);
  const [dir, setDir] = React.useState<"ltr" | "rtl">("ltr");
  // The listeners are attached once per opening; they read the latest options.
  const latest = React.useRef(opts);
  latest.current = opts;

  const measure = React.useCallback(() => {
    const o = latest.current;
    const gap = o.gap ?? 4;
    const edge = 8;
    const anchor = o.anchor.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const popup = o.popup.current;
    const below = window.innerHeight - r.bottom - gap - edge;
    const above = r.top - gap - edge;
    const wants = Math.min(o.maxHeight, popup?.scrollHeight ?? o.maxHeight);
    const up = below < wants && above > below;
    const rtl = getComputedStyle(anchor).direction === "rtl";
    const width = o.matchWidth ? r.width : Math.max(r.width, popup?.offsetWidth ?? r.width);
    // Start-aligned with the field, then pulled back inside the window.
    let left = rtl ? r.right - width : r.left;
    left = Math.max(edge, Math.min(left, window.innerWidth - edge - width));
    setDir(rtl ? "rtl" : "ltr");
    setStyle({
      position: "fixed",
      left: `${left}px`,
      ...(o.matchWidth ? { width: `${r.width}px` } : { minWidth: `${r.width}px`, maxWidth: `calc(100vw - ${edge * 2}px)` }),
      ...(up ? { bottom: `${window.innerHeight - r.top + gap}px` } : { top: `${r.bottom + gap}px` }),
      maxHeight: `${Math.max(96, Math.min(o.maxHeight, up ? above : below))}px`,
    });
  }, []);

  // A layout effect, so the first frame the popup is painted in is already placed.
  React.useLayoutEffect(() => {
    if (!opts.open) return;
    measure();
    // Again once the popup has laid out: its own size decides flipping and the sideways pull.
    let frame = requestAnimationFrame(measure);
    const later = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", later, true);
    window.addEventListener("resize", later);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", later, true);
      window.removeEventListener("resize", later);
    };
  }, [opts.open, measure]);

  return { style, dir, measure };
}

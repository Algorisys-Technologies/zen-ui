/**
 * A popup list fixed against the field it belongs to: portalled to <body>,
 * below the field or above it when there is more room there, its height capped
 * to the room it has, kept inside the window sideways, and following the field
 * as anything scrolls or the window resizes.
 *
 *   const placed = anchorPopup({ anchor: field, popup: list, maxHeight: 288, matchWidth: true });
 *   …
 *   placed.destroy();   // on close: listeners released, the popup taken out of <body>
 *
 * One call per opening. A popup positioned inside the field's wrapper instead
 * is cut off by any ancestor that clips (a card with overflow hidden) and never
 * flips near the window's end: TreeSelect shipped exactly that in Solid. The
 * spec is solid/src/lib/anchored.ts and react/src/lib/anchored.ts; this is the
 * same measurement, without a framework to re-render the style.
 */
export interface AnchorPopupOptions {
  /** What the popup is placed against (the field's box). */
  anchor: HTMLElement;
  /** The popup. Moved to <body> by the call, removed again by destroy(). */
  popup: HTMLElement;
  /** The tallest the popup gets, in px. */
  maxHeight: number;
  /** As wide as the anchor (a list under a field). Otherwise the popup sizes itself, at least as wide as the anchor. */
  matchWidth?: boolean;
  /** Between the anchor and the popup, px. Default 4. */
  gap?: number;
  /**
   * After every placement. The popup is only a scroller once its height is
   * capped, so anything that scrolls it to a row (an active option) has to run
   * again here: done before the cap, it scrolls a list that cannot scroll yet.
   */
  onPlace?: (placement: { maxHeight: number; up: boolean }) => void;
  /** Where to mount. Default document.body. */
  container?: HTMLElement;
}

export interface AnchoredPopup {
  /** Measure and place now (after the popup's content changed size). */
  place(): void;
  /** Release the listeners and take the popup out of the document. Safe twice. */
  destroy(): void;
}

const EDGE = 8;

export function anchorPopup(opts: AnchorPopupOptions): AnchoredPopup {
  const { anchor, popup } = opts;
  const gap = opts.gap ?? 4;
  const s = popup.style;
  // Hidden until the first measurement, so no frame is painted unplaced.
  s.position = "fixed";
  s.visibility = "hidden";
  (opts.container ?? document.body).appendChild(popup);

  const place = () => {
    if (!anchor.isConnected) return;
    const r = anchor.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - gap - EDGE;
    const above = r.top - gap - EDGE;
    const wants = Math.min(opts.maxHeight, popup.scrollHeight || opts.maxHeight);
    const up = below < wants && above > below;
    const rtl = getComputedStyle(anchor).direction === "rtl";
    const width = opts.matchWidth ? r.width : Math.max(r.width, popup.offsetWidth || r.width);
    // Start-aligned with the field, then pulled back inside the window.
    let left = rtl ? r.right - width : r.left;
    left = Math.max(EDGE, Math.min(left, window.innerWidth - EDGE - width));
    const maxHeight = Math.max(96, Math.min(opts.maxHeight, up ? above : below));

    popup.dir = rtl ? "rtl" : "ltr";
    s.position = "fixed";
    s.visibility = "";
    s.left = `${left}px`;
    if (opts.matchWidth) {
      s.width = `${r.width}px`;
    } else {
      s.minWidth = `${r.width}px`;
      s.maxWidth = `calc(100vw - ${EDGE * 2}px)`;
    }
    // One of top / bottom, never both: the other is cleared, or a list that
    // flipped would be stretched between the two.
    if (up) {
      s.top = "";
      s.bottom = `${window.innerHeight - r.top + gap}px`;
    } else {
      s.bottom = "";
      s.top = `${r.bottom + gap}px`;
    }
    s.maxHeight = `${maxHeight}px`;
    opts.onPlace?.({ maxHeight, up });
  };

  place();
  // Again once the popup has laid out: its own size decides flipping and the sideways pull.
  let frame = requestAnimationFrame(place);
  const later = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(place);
  };
  window.addEventListener("scroll", later, true);
  window.addEventListener("resize", later);

  let done = false;
  return {
    place,
    destroy() {
      if (done) return;
      done = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", later, true);
      window.removeEventListener("resize", later);
      popup.remove();
    },
  };
}

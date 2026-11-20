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
export declare function useAnchoredPlacement(opts: AnchoredPlacementOptions): {
    style: React.CSSProperties;
    dir: "ltr" | "rtl";
    measure: () => void;
};
//# sourceMappingURL=anchored.d.ts.map
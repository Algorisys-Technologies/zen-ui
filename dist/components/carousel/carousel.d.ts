import { type JSX } from "solid-js";
/**
 * Carousel — swipeable rotating items.
 *
 *   <Carousel label="Featured">
 *     <img src="…" />
 *     <Card>…</Card>
 *   </Carousel>
 *
 * Every child becomes a slide. There is no CarouselItem to import: the
 * component wraps each child itself. That is what lets this binding match
 * React's API — Solid cannot read a child's props, but `children()` resolves
 * them to an array, which is all the wrapping needs.
 *
 * Movement is CSS scroll-snap, not a drag implementation: touch swipe, momentum
 * and the rubber-band edge come from the platform for free.
 *
 * Follows the WAI-ARIA carousel pattern and does NOT auto-rotate — content that
 * moves on its own is an accessibility hazard with no correct version that
 * lacks a pause control.
 *
 * Mirrors the React binding's API.
 */
export type CarouselProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onScroll" | "class"> & {
    /** Names the carousel for a screen reader. */
    label?: string;
    /** Previous / next buttons. Default true. */
    arrows?: boolean;
    /** The dots. Default true. */
    dots?: boolean;
    /** Slides visible at once. Default 1. */
    perView?: number;
    class?: string;
    children?: JSX.Element;
};
export declare const Carousel: (props: CarouselProps) => JSX.Element;
//# sourceMappingURL=carousel.d.ts.map
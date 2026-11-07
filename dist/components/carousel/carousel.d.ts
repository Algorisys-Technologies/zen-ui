import * as React from "react";
/**
 * Carousel — swipeable rotating items.
 *
 *   <Carousel label="Featured">
 *     <img src="…" />
 *     <Card>…</Card>
 *   </Carousel>
 *
 * Every child becomes a slide. There is no CarouselItem to import: the
 * component wraps each child itself, which keeps the API to one component and
 * lets the Solid binding do exactly the same thing — it cannot read a child's
 * props the way React.Children can, and an API that only one binding can
 * implement is not an API.
 *
 * Movement is CSS scroll-snap, not a drag implementation. Touch swipe, momentum
 * and the rubber-band edge all come from the platform for free and behave the
 * way each platform's users expect; a JS drag would be a worse copy of all
 * three, and would fight the scrollbar rather than being it.
 *
 * Follows the WAI-ARIA carousel pattern: the region is a carousel, each slide
 * says which of how many it is, and the controls are real buttons that disable
 * at the ends. It does NOT auto-rotate. Content that moves on its own is a
 * documented accessibility hazard and there is no version of it that is
 * correct without a pause control, so the caller drives it or nothing does.
 */
export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onScroll"> {
    /** Names the carousel for a screen reader. */
    label?: string;
    /** Previous / next buttons. Default true. */
    arrows?: boolean;
    /** The dots. Default true. */
    dots?: boolean;
    /** Slides visible at once. Default 1. */
    perView?: number;
    className?: string;
    children: React.ReactNode;
}
export declare const Carousel: React.ForwardRefExoticComponent<CarouselProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=carousel.d.ts.map
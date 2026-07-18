import * as React from "react";
import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";

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

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ label = "Carousel", arrows = true, dots = true, perView = 1, className, children, ...props }, ref) => {
    const slides = React.Children.toArray(children);
    const count = slides.length;
    const scroller = React.useRef<HTMLDivElement | null>(null);
    const [index, setIndex] = React.useState(0);

    /** The last index that can sit flush at the left edge. */
    const lastIndex = Math.max(0, count - perView);

    const goTo = (i: number) => {
      const el = scroller.current;
      if (!el) return;
      const target = Math.max(0, Math.min(lastIndex, i));
      // Respecting the OS setting rather than always animating: smooth
      // scrolling is exactly the vestibular trigger the setting exists for.
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({ left: target * (el.clientWidth / perView), behavior: reduce ? "auto" : "smooth" });
    };

    // Derived from the scroll position, not from the button that was pressed:
    // a swipe never presses a button, and the dots have to follow it too.
    const onScroll = () => {
      const el = scroller.current;
      if (!el) return;
      const width = el.clientWidth / perView;
      if (width > 0) setIndex(Math.round(el.scrollLeft / width));
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(lastIndex);
      }
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        className={cn("zen-relative zen-flex zen-flex-col zen-gap-2", className)}
        {...props}
      >
        <div className="zen-relative zen-flex zen-items-center zen-gap-2">
          {arrows && count > perView ? (
            <CarouselArrow
              dir="prev"
              disabled={index <= 0}
              onClick={() => goTo(index - 1)}
            />
          ) : null}

          <div
            ref={scroller}
            onScroll={onScroll}
            onKeyDown={onKeyDown}
            tabIndex={0}
            className={cn(
              "zen-flex zen-min-w-0 zen-flex-1 zen-gap-3 zen-overflow-x-auto",
              "zen-snap-x zen-snap-mandatory",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 zen-rounded-zen-md",
              // The scroller IS the control, so its scrollbar is chrome.
              "zen-[scrollbar-width:none]",
            )}
          >
            {slides.map((child, i) => (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                // "3 of 7" — a slide with no position is just a div to anyone
                // who cannot see where it sits.
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={i < index || i >= index + perView || undefined}
                className="zen-shrink-0 zen-snap-start"
                // Computed from perView, so it cannot be a class: a width class
                // per perView is a class UnoCSS never sees.
                style={{ width: `calc((100% - ${(perView - 1) * 0.75}rem) / ${perView})` }}
              >
                {child}
              </div>
            ))}
          </div>

          {arrows && count > perView ? (
            <CarouselArrow
              dir="next"
              disabled={index >= lastIndex}
              onClick={() => goTo(index + 1)}
            />
          ) : null}
        </div>

        {dots && count > perView ? (
          <div className="zen-flex zen-justify-center zen-gap-1.5">
            {Array.from({ length: lastIndex + 1 }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index || undefined}
                onClick={() => goTo(i)}
                className={cn(
                  "zen-h-2 zen-w-2 zen-cursor-pointer zen-rounded-zen-full zen-border-0 zen-p-0",
                  "zen-transition-colors",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                  i === index ? "zen-bg-zen-primary" : "zen-bg-zen-border hover:zen-bg-zen-muted-fg",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  },
);
Carousel.displayName = "Carousel";

const CarouselArrow: React.FC<{ dir: "prev" | "next"; disabled: boolean; onClick: () => void }> = ({
  dir,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
    className={cn(
      "zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center",
      "zen-cursor-pointer zen-rounded-zen-full zen-border zen-border-zen-border zen-bg-zen-background",
      "zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-40 disabled:hover:zen-bg-zen-background",
    )}
  >
    <Icon name={dir === "prev" ? "chevron-left" : "chevron-right"} size={16} />
  </button>
);

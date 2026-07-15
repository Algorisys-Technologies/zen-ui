import { type JSX, For, Show, children, createMemo, createSignal, splitProps } from "solid-js";
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

export const Carousel = (props: CarouselProps) => {
  const [local, rest] = splitProps(props, [
    "label",
    "arrows",
    "dots",
    "perView",
    "class",
    "children",
  ]);

  // `children()` resolves the caller's JSX ONCE into an array. Reading
  // props.children twice would build two of everything — the trap already
  // documented on demo-helpers' CodeExample.
  const resolved = children(() => local.children);
  const slides = createMemo(() => resolved.toArray());
  const count = createMemo(() => slides().length);
  const perView = () => local.perView ?? 1;
  const lastIndex = createMemo(() => Math.max(0, count() - perView()));

  let scroller: HTMLDivElement | undefined;
  const [index, setIndex] = createSignal(0);

  const goTo = (i: number) => {
    if (!scroller) return;
    const target = Math.max(0, Math.min(lastIndex(), i));
    // Respecting the OS setting rather than always animating: smooth scrolling
    // is exactly the vestibular trigger the setting exists for.
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({
      left: target * (scroller.clientWidth / perView()),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  // Derived from the scroll position, not the button that was pressed: a swipe
  // never presses a button, and the dots have to follow it too.
  const onScroll = () => {
    if (!scroller) return;
    const width = scroller.clientWidth / perView();
    if (width > 0) setIndex(Math.round(scroller.scrollLeft / width));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index() + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index() - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(lastIndex());
    }
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={local.label ?? "Carousel"}
      class={cn("zen-relative zen-flex zen-flex-col zen-gap-2", local.class)}
      {...rest}
    >
      <div class="zen-relative zen-flex zen-items-center zen-gap-2">
        <Show when={(local.arrows ?? true) && count() > perView()}>
          <CarouselArrow dir="prev" disabled={index() <= 0} onClick={() => goTo(index() - 1)} />
        </Show>

        <div
          ref={scroller}
          onScroll={onScroll}
          onKeyDown={onKeyDown}
          tabIndex={0}
          class={cn(
            "zen-flex zen-min-w-0 zen-flex-1 zen-gap-3 zen-overflow-x-auto",
            "zen-snap-x zen-snap-mandatory",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 zen-rounded-zen-md",
            // The scroller IS the control, so its scrollbar is chrome.
            "zen-[scrollbar-width:none]",
          )}
        >
          <For each={slides()}>
            {(child, i) => (
              <div
                role="group"
                aria-roledescription="slide"
                // "3 of 7" — a slide with no position is just a div to anyone
                // who cannot see where it sits.
                aria-label={`${i() + 1} of ${count()}`}
                aria-hidden={i() < index() || i() >= index() + perView() || undefined}
                class="zen-shrink-0 zen-snap-start"
                // Computed from perView, so it cannot be a class.
                style={{ width: `calc((100% - ${(perView() - 1) * 0.75}rem) / ${perView()})` }}
              >
                {child}
              </div>
            )}
          </For>
        </div>

        <Show when={(local.arrows ?? true) && count() > perView()}>
          <CarouselArrow
            dir="next"
            disabled={index() >= lastIndex()}
            onClick={() => goTo(index() + 1)}
          />
        </Show>
      </div>

      <Show when={(local.dots ?? true) && count() > perView()}>
        <div class="zen-flex zen-justify-center zen-gap-1.5">
          <For each={Array.from({ length: lastIndex() + 1 }, (_, i) => i)}>
            {(i) => (
              <button
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index() || undefined}
                onClick={() => goTo(i)}
                class={cn(
                  "zen-h-2 zen-w-2 zen-cursor-pointer zen-rounded-zen-full zen-border-0 zen-p-0",
                  "zen-transition-colors",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                  i === index() ? "zen-bg-zen-primary" : "zen-bg-zen-border hover:zen-bg-zen-muted-fg",
                )}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

const CarouselArrow = (props: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={() => props.onClick()}
    disabled={props.disabled}
    aria-label={props.dir === "prev" ? "Previous slide" : "Next slide"}
    class={cn(
      "zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center",
      "zen-cursor-pointer zen-rounded-zen-full zen-border zen-border-zen-border zen-bg-zen-background",
      "zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-40 disabled:hover:zen-bg-zen-background",
    )}
  >
    <Icon name={props.dir === "prev" ? "chevron-left" : "chevron-right"} size={16} />
  </button>
);

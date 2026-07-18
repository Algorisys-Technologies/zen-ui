import { cn } from "../../lib/cn";
import { applyProps, Disposer, toNodes, type BaseProps, type Child, type ZenComponent } from "../../lib/component";
import { Icon } from "../icon/icon";

/**
 * Carousel — swipeable rotating items. The vanilla port of the React reference.
 *
 *   Carousel({ label: "Featured", children: [Card({ … }), Card({ … })] })
 *
 * Every child becomes a slide. There is no CarouselItem to import: the component
 * wraps each child itself. React reaches that through `React.Children.toArray`;
 * here the same shape is a `children` ARRAY, one entry per slide — the entry is a
 * node, a string, or another component, wrapped into a slide by the carousel.
 *
 * Movement is CSS scroll-snap, not a drag implementation. Touch swipe, momentum
 * and the rubber-band edge all come from the platform for free and behave the way
 * each platform's users expect; a JS drag would be a worse copy of all three, and
 * would fight the scrollbar rather than being it.
 *
 * Follows the WAI-ARIA carousel pattern: the region is a carousel, each slide says
 * which of how many it is, and the controls are real buttons that disable at the
 * ends. It does NOT auto-rotate. Content that moves on its own is a documented
 * accessibility hazard with no correct version that lacks a pause control, so the
 * caller drives it or nothing does.
 */

export interface CarouselProps extends BaseProps {
  /** Names the carousel for a screen reader. */
  label?: string;
  /** Previous / next buttons. Default true. */
  arrows?: boolean;
  /** The dots. Default true. */
  dots?: boolean;
  /** Slides visible at once. Default 1. */
  perView?: number;
  /** One entry per slide. Each is wrapped as a slide. */
  children?: Child;
}

/** The top-level children, one entry per slide. */
const toSlideList = (children: Child): Child[] => {
  if (children === null || children === undefined || children === false) return [];
  if (Array.isArray(children)) return children.filter((c) => c !== null && c !== undefined && c !== false);
  return [children];
};

interface SlideRef {
  el: HTMLDivElement;
}

export function Carousel(props: CarouselProps): ZenComponent<CarouselProps> {
  let current: CarouselProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  const cleanups = new Disposer();
  let removeProps: (() => void) | undefined;

  // Scroll position is the source of truth; index is derived from it. A swipe never
  // presses a button, but the dots and arrows still have to follow it.
  let index = 0;

  let scroller: HTMLDivElement | null = null;
  let prevArrow: HTMLButtonElement | null = null;
  let nextArrow: HTMLButtonElement | null = null;
  let dotBtns: HTMLButtonElement[] = [];
  let slideRefs: SlideRef[] = [];

  const perViewOf = () => current.perView ?? 1;
  const countOf = () => toSlideList(current.children).length;
  /** The last index that can sit flush at the left edge. */
  const lastIndexOf = () => Math.max(0, countOf() - perViewOf());

  const goTo = (i: number) => {
    if (!scroller) return;
    const perView = perViewOf();
    const target = Math.max(0, Math.min(lastIndexOf(), i));
    // Respecting the OS setting rather than always animating: smooth scrolling is
    // exactly the vestibular trigger the setting exists for.
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ left: target * (scroller.clientWidth / perView), behavior: reduce ? "auto" : "smooth" });
  };

  // The disabled look comes from the `disabled:` CSS variants on the button's
  // disabled attribute, so this is a constant class rather than a function of state.
  const arrowClass = cn(
    "zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center",
    "zen-cursor-pointer zen-rounded-zen-full zen-border zen-border-zen-border zen-bg-zen-background",
    "zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
    "disabled:zen-cursor-not-allowed disabled:zen-opacity-40 disabled:hover:zen-bg-zen-background",
  );

  const makeArrow = (dir: "prev" | "next"): HTMLButtonElement => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", dir === "prev" ? "Previous slide" : "Next slide");
    btn.className = arrowClass;
    btn.append(Icon({ name: dir === "prev" ? "chevron-left" : "chevron-right", size: 16 }).el);
    const onClick = () => goTo(dir === "prev" ? index - 1 : index + 1);
    btn.addEventListener("click", onClick);
    cleanups.add(() => btn.removeEventListener("click", onClick));
    return btn;
  };

  const dotClass = (active: boolean) =>
    cn(
      "zen-h-2 zen-w-2 zen-cursor-pointer zen-rounded-zen-full zen-border-0 zen-p-0",
      "zen-transition-colors",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      active ? "zen-bg-zen-primary" : "zen-bg-zen-border hover:zen-bg-zen-muted-fg",
    );

  // Derived from the scroll position, not from the button that was pressed.
  const onScroll = () => {
    if (!scroller) return;
    const width = scroller.clientWidth / perViewOf();
    if (width > 0) {
      const next = Math.round(scroller.scrollLeft / width);
      if (next !== index) {
        index = next;
        paint();
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
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
      goTo(lastIndexOf());
    }
  };

  const render = () => {
    const {
      label = "Carousel",
      arrows = true,
      dots = true,
      perView = 1,
      class: className,
      children,
      ...rest
    } = current;

    cleanups.dispose();
    scroller = null;
    prevArrow = null;
    nextArrow = null;
    dotBtns = [];
    slideRefs = [];

    const slides = toSlideList(children);
    const count = slides.length;
    const lastIndex = Math.max(0, count - perView);
    index = Math.max(0, Math.min(lastIndex, index));

    el.setAttribute("role", "group");
    el.setAttribute("aria-roledescription", "carousel");
    el.setAttribute("aria-label", label);
    el.className = cn("zen-relative zen-flex zen-flex-col zen-gap-2", className);
    el.replaceChildren();

    // The controls row: prev arrow, the scroller, next arrow.
    const row = document.createElement("div");
    row.className = "zen-relative zen-flex zen-items-center zen-gap-2";

    const showControls = count > perView;

    if (arrows && showControls) {
      prevArrow = makeArrow("prev");
      row.append(prevArrow);
    }

    const scroll = document.createElement("div");
    scroller = scroll;
    scroll.tabIndex = 0;
    scroll.className = cn(
      "zen-flex zen-min-w-0 zen-flex-1 zen-gap-3 zen-overflow-x-auto",
      "zen-snap-x zen-snap-mandatory",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 zen-rounded-zen-md",
      // The scroller IS the control, so its scrollbar is chrome.
      "zen-[scrollbar-width:none]",
    );
    scroll.addEventListener("scroll", onScroll);
    scroll.addEventListener("keydown", onKeyDown);
    cleanups.add(() => scroll.removeEventListener("scroll", onScroll));
    cleanups.add(() => scroll.removeEventListener("keydown", onKeyDown));

    slides.forEach((child, i) => {
      const slide = document.createElement("div");
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      // "3 of 7" — a slide with no position is just a div to anyone who cannot see
      // where it sits.
      slide.setAttribute("aria-label", `${i + 1} of ${count}`);
      slide.className = "zen-shrink-0 zen-snap-start";
      // Computed from perView, so it cannot be a class: a width class per perView is
      // a class UnoCSS never sees.
      slide.style.width = `calc((100% - ${(perView - 1) * 0.75}rem) / ${perView})`;
      slide.append(...toNodes(child));
      scroll.append(slide);
      slideRefs.push({ el: slide });
    });

    row.append(scroll);

    if (arrows && showControls) {
      nextArrow = makeArrow("next");
      row.append(nextArrow);
    }

    el.append(row);

    if (dots && showControls) {
      const dotRow = document.createElement("div");
      dotRow.className = "zen-flex zen-justify-center zen-gap-1.5";
      for (let i = 0; i <= lastIndex; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.className = dotClass(false);
        const target = i;
        const onClick = () => goTo(target);
        dot.addEventListener("click", onClick);
        cleanups.add(() => dot.removeEventListener("click", onClick));
        dotRow.append(dot);
        dotBtns.push(dot);
      }
      el.append(dotRow);
    }

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);

    paint();
  };

  // Everything that follows from `index`: arrow disabled state, dot selection, and
  // each slide's aria-hidden. Cheap enough to run on every scroll frame.
  function paint() {
    const perView = perViewOf();
    const lastIndex = lastIndexOf();

    if (prevArrow) prevArrow.disabled = index <= 0;
    if (nextArrow) nextArrow.disabled = index >= lastIndex;

    dotBtns.forEach((dot, i) => {
      const active = i === index;
      dot.className = dotClass(active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    slideRefs.forEach((s, i) => {
      const hidden = i < index || i >= index + perView;
      if (hidden) s.el.setAttribute("aria-hidden", "true");
      else s.el.removeAttribute("aria-hidden");
    });
  }

  render();
  disposer.add(() => cleanups.dispose());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

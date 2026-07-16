import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";

/**
 * ScrollArea — custom scrollbars over native scrolling, hand-written.
 *
 *   ScrollArea({
 *     class: "zen-h-48 zen-w-64 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
 *     children: longList,
 *   });
 *
 * React's version wraps `@radix-ui/react-scroll-area`. There is no primitive
 * library here, so this file IS what Radix was doing: hide the platform
 * scrollbar, keep native scrolling (wheel, touch, keyboard, screen readers),
 * and paint a thumb whose size and position track the viewport.
 *
 * The public API mirrors React: a `ScrollArea` that ships a vertical scrollbar
 * by default, and a `ScrollBar` you pass as a child to add the horizontal axis.
 * A `ScrollBar` child is configuration, not content — ScrollArea hoists it out
 * of the viewport and wires it, exactly as Radix's context did.
 */

const THICKNESS = 10; // zen-w-2.5 / zen-h-2.5 -> 0.625rem
const MIN_THUMB = 18;

/**
 * Hide the platform scrollbar on the viewport. Firefox/IE take an inline
 * property; WebKit needs a pseudo-element, which only a stylesheet can reach —
 * injected once, scoped to the one attribute zen-ui sets, so it touches nothing
 * the library did not render.
 */
let viewportStyleInjected = false;
function ensureViewportStyle(): void {
  if (viewportStyleInjected || typeof document === "undefined") return;
  viewportStyleInjected = true;
  const style = document.createElement("style");
  style.setAttribute("data-zen-scroll-area", "");
  style.textContent =
    "[data-zen-scroll-viewport]::-webkit-scrollbar{display:none}" +
    "[data-zen-scroll-viewport]{-ms-overflow-style:none;scrollbar-width:none}";
  document.head.appendChild(style);
}

export interface ScrollBarProps extends BaseProps {
  /** Which axis this scrollbar controls. Defaults to "vertical". */
  orientation?: "vertical" | "horizontal";
}

interface ScrollBarComponent extends ZenComponent<ScrollBarProps> {
  readonly __zenScrollbar: true;
  readonly orientation: "vertical" | "horizontal";
  /** The draggable thumb inside the track. */
  readonly thumb: HTMLElement;
}

const isScrollBar = (v: unknown): v is ScrollBarComponent =>
  typeof v === "object" && v !== null && (v as { __zenScrollbar?: unknown }).__zenScrollbar === true;

/**
 * ScrollBar — the track + thumb for one axis. On its own it is inert markup;
 * mounted inside a ScrollArea, that ScrollArea wires it to the viewport. This
 * mirrors Radix, where a `ScrollBar` outside a `ScrollArea.Root` has no context
 * to attach to either.
 */
export function ScrollBar(props: ScrollBarProps = {}): ScrollBarComponent {
  const { orientation = "vertical", class: cls, children: _children, ...rest } = props;
  const vertical = orientation === "vertical";

  const track = document.createElement("div");
  track.className = cn(
    "zen-flex zen-touch-none zen-select-none zen-transition-colors",
    vertical
      ? "zen-h-full zen-w-2.5 zen-border-l zen-border-l-transparent zen-p-px"
      : "zen-h-2.5 zen-flex-col zen-border-t zen-border-t-transparent zen-p-px",
    cls,
  );
  track.setAttribute("data-orientation", orientation);

  const thumb = document.createElement("div");
  thumb.className = "zen-relative zen-flex-1 zen-rounded-zen-full zen-bg-zen-border";
  track.appendChild(thumb);

  const removeProps = applyProps(track, rest as Record<string, unknown>);

  return {
    __zenScrollbar: true,
    orientation,
    el: track,
    thumb,
    update() {
      /* geometry is owned by the parent ScrollArea; nothing to re-apply here */
    },
    destroy() {
      removeProps();
      track.remove();
    },
  };
}

export type ScrollAreaProps = BaseProps;

interface WiredBar {
  track: HTMLElement;
  measure: () => void;
  overflowing: () => boolean;
}

export function ScrollArea(props: ScrollAreaProps = {}): ZenComponent<ScrollAreaProps> {
  ensureViewportStyle();
  const { class: cls, children, style: _style, ...rest } = props;
  const disposer = new Disposer();

  const root = document.createElement("div");
  root.className = cn("zen-relative zen-overflow-hidden", cls);

  const viewport = document.createElement("div");
  viewport.className = "zen-h-full zen-w-full zen-rounded-[inherit]";
  viewport.setAttribute("data-zen-scroll-viewport", "");
  viewport.style.overflow = "scroll";

  // Content lives in its own wrapper so a ResizeObserver can watch the content's
  // size (its scrollHeight/Width), which observing the fixed-size viewport cannot.
  const content = document.createElement("div");
  viewport.appendChild(content);
  root.appendChild(viewport);

  // Separate ScrollBar children (configuration) from real content.
  const { horizontalBar, verticalBar, contentChildren } = splitChildren(children);
  content.replaceChildren(...toNodes(contentChildren));

  const vBar = verticalBar ?? ScrollBar({ orientation: "vertical" });
  disposer.add(() => vBar.destroy());
  const hasHorizontal = !!horizontalBar;

  const bars: WiredBar[] = [];

  // Vertical scrollbar: full height, inset from the bottom when a horizontal one
  // shares the corner.
  vBar.el.style.position = "absolute";
  vBar.el.style.height = "auto";
  vBar.el.style.top = "0";
  vBar.el.style.right = "0";
  vBar.el.style.bottom = hasHorizontal ? `${THICKNESS}px` : "0";
  root.appendChild(vBar.el);
  bars.push(wireBar(viewport, vBar, "vertical", disposer));

  if (horizontalBar) {
    disposer.add(() => horizontalBar.destroy());
    horizontalBar.el.style.position = "absolute";
    horizontalBar.el.style.width = "auto";
    horizontalBar.el.style.left = "0";
    horizontalBar.el.style.bottom = "0";
    horizontalBar.el.style.right = `${THICKNESS}px`; // leave room for the vertical bar
    root.appendChild(horizontalBar.el);
    bars.push(wireBar(viewport, horizontalBar, "horizontal", disposer));
  }

  // Visibility follows Radix's default `type="hover"`: a bar shows on hover of
  // the area and while scrolling, and only ever when its axis actually overflows.
  let hovering = false;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  const setVisible = (on: boolean) => {
    for (const b of bars) {
      if (b.overflowing()) b.track.style.opacity = on ? "1" : "0";
    }
  };
  const measureAll = () => {
    for (const b of bars) b.measure();
  };

  const onEnter = () => {
    hovering = true;
    setVisible(true);
  };
  const onLeave = () => {
    hovering = false;
    setVisible(false);
  };
  const onScroll = () => {
    measureAll();
    setVisible(true);
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!hovering) setVisible(false);
    }, 800);
  };
  root.addEventListener("pointerenter", onEnter);
  root.addEventListener("pointerleave", onLeave);
  viewport.addEventListener("scroll", onScroll, { passive: true });
  disposer.add(() => {
    root.removeEventListener("pointerenter", onEnter);
    root.removeEventListener("pointerleave", onLeave);
    viewport.removeEventListener("scroll", onScroll);
    if (hideTimer) clearTimeout(hideTimer);
  });

  // ResizeObserver drives the first measure too: at construction the element is
  // not in the DOM and has zero size, so the initial callback (fired when it is
  // inserted and laid out) is what makes the thumbs appear.
  const ro = new ResizeObserver(() => measureAll());
  ro.observe(viewport);
  ro.observe(content);
  disposer.add(() => ro.disconnect());

  const removeProps = applyProps(root, rest as Record<string, unknown>);
  if (_style) applyProps(root, { style: _style });
  disposer.add(() => removeProps());

  return {
    el: root,
    update(next) {
      if (next.class !== undefined) root.className = cn("zen-relative zen-overflow-hidden", next.class);
      if (next.children !== undefined) {
        const split = splitChildren(next.children);
        content.replaceChildren(...toNodes(split.contentChildren));
        measureAll();
      }
      const { class: _c, children: _ch, ...r } = next;
      if (Object.keys(r).length) applyProps(root, r as Record<string, unknown>);
    },
    destroy() {
      disposer.dispose();
      root.remove();
    },
  };
}

function splitChildren(children: Child): {
  horizontalBar?: ScrollBarComponent;
  verticalBar?: ScrollBarComponent;
  contentChildren: Child[];
} {
  const contentChildren: Child[] = [];
  let horizontalBar: ScrollBarComponent | undefined;
  let verticalBar: ScrollBarComponent | undefined;

  const walk = (c: Child): void => {
    if (Array.isArray(c)) {
      c.forEach(walk);
      return;
    }
    if (isScrollBar(c)) {
      if (c.orientation === "horizontal") horizontalBar = c;
      else verticalBar = c;
      return;
    }
    contentChildren.push(c);
  };
  walk(children);

  return { horizontalBar, verticalBar, contentChildren };
}

/**
 * Attach one bar to the viewport: size and position its thumb from the scroll
 * metrics, drag the thumb to scroll, and click the track to page towards the
 * pointer. Returns a `measure()` the area re-runs on scroll and resize.
 */
function wireBar(
  viewport: HTMLElement,
  bar: ScrollBarComponent,
  orientation: "vertical" | "horizontal",
  disposer: Disposer,
): WiredBar {
  const track = bar.el;
  const thumb = bar.thumb;
  const vertical = orientation === "vertical";
  let overflowing = false;

  track.style.opacity = "0";
  track.style.transition = "opacity 160ms ease";
  thumb.style.position = "absolute";
  if (vertical) {
    thumb.style.left = "1px";
    thumb.style.right = "1px";
    thumb.style.top = "0";
  } else {
    thumb.style.top = "1px";
    thumb.style.bottom = "1px";
    thumb.style.left = "0";
  }

  const scrollSize = () => (vertical ? viewport.scrollHeight : viewport.scrollWidth);
  const clientSize = () => (vertical ? viewport.clientHeight : viewport.clientWidth);
  const trackSize = () => (vertical ? track.clientHeight : track.clientWidth);
  const getScroll = () => (vertical ? viewport.scrollTop : viewport.scrollLeft);
  const setScroll = (v: number) => {
    if (vertical) viewport.scrollTop = v;
    else viewport.scrollLeft = v;
  };

  const measure = () => {
    overflowing = scrollSize() - clientSize() > 1;
    track.style.display = overflowing ? "" : "none";
    if (!overflowing) return;
    const tSize = trackSize();
    const thumbLen = Math.max((clientSize() / scrollSize()) * tSize, MIN_THUMB);
    const maxScroll = scrollSize() - clientSize();
    const maxThumb = tSize - thumbLen;
    const pos = maxScroll > 0 ? (getScroll() / maxScroll) * maxThumb : 0;
    if (vertical) {
      thumb.style.height = `${thumbLen}px`;
      thumb.style.transform = `translateY(${pos}px)`;
    } else {
      thumb.style.width = `${thumbLen}px`;
      thumb.style.transform = `translateX(${pos}px)`;
    }
  };

  // Drag the thumb.
  const onThumbDown = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    thumb.setPointerCapture(e.pointerId);
    const start = vertical ? e.clientY : e.clientX;
    const startScroll = getScroll();
    const maxThumb = trackSize() - (vertical ? thumb.offsetHeight : thumb.offsetWidth);
    const maxScroll = scrollSize() - clientSize();
    const onMove = (ev: PointerEvent) => {
      const delta = (vertical ? ev.clientY : ev.clientX) - start;
      const dScroll = maxThumb > 0 ? (delta / maxThumb) * maxScroll : 0;
      setScroll(startScroll + dScroll);
    };
    const onUp = (ev: PointerEvent) => {
      try {
        thumb.releasePointerCapture(ev.pointerId);
      } catch {
        /* pointer already released */
      }
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  // Click the track: page towards the pointer.
  const onTrackDown = (e: PointerEvent) => {
    if (e.target !== track) return;
    const rect = track.getBoundingClientRect();
    const clickPos = (vertical ? e.clientY - rect.top : e.clientX - rect.left);
    const thumbLen = vertical ? thumb.offsetHeight : thumb.offsetWidth;
    const maxThumb = trackSize() - thumbLen;
    const fraction = maxThumb > 0 ? (clickPos - thumbLen / 2) / maxThumb : 0;
    const maxScroll = scrollSize() - clientSize();
    setScroll(Math.max(0, Math.min(1, fraction)) * maxScroll);
  };

  thumb.addEventListener("pointerdown", onThumbDown);
  track.addEventListener("pointerdown", onTrackDown);
  disposer.add(() => {
    thumb.removeEventListener("pointerdown", onThumbDown);
    track.removeEventListener("pointerdown", onTrackDown);
  });

  return { track, measure, overflowing: () => overflowing };
}

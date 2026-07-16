import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";

/**
 * ObjectPageLayout — the vanilla port of the React reference.
 *
 * The object detail page: a title bar that stays, an object header that scrolls
 * away, and a sticky anchor bar whose links stay in sync with whatever section
 * you are looking at.
 *
 *   const page = ObjectPageLayout({
 *     title: "SO-4711",
 *     header: orderHeader,
 *     sections: SECTIONS,
 *     onSelectedSectionChange: (id) => console.log(id),
 *   });
 *   document.querySelector("#screen").append(page.el);
 *
 * ## Why `sections` is data rather than compound children
 *
 * The same departure Accordion, Tabs, Tree and DataTable make here: the anchor
 * bar has to render the WHOLE section list before a single section is on screen,
 * and the scroll-spy needs an element per section to observe. With no context to
 * wire a compound tree, taking the data is the one honest shape — the bar is a
 * map over the list and the observer is registered once per section.
 *
 * HEIGHT: the root is `zen-h-full` and its container must have a definite height.
 * min-height is a floor, not a ceiling — a container that grows to fit its
 * content leaves the inner scroller nothing to scroll, so the scroll-spy has
 * nothing to spy on. Every demo preview pins its own height for this reason.
 *
 * SCROLL-SPY: an IntersectionObserver rooted at the CONTENT scroller, not the
 * window — the demo shell owns page scrolling, so a window-rooted observer would
 * never fire. The observed region reaches from just below the sticky bar to the
 * bottom of the scroller; the FIRST section (in document order) still reaching
 * below the bar is the one being read.
 *
 * ARIA: the bar is a `nav` landmark of buttons carrying `aria-current`, not a
 * `role="tablist"`. Every section is on screen at once and the bar moves the
 * viewport rather than swapping panels, so `aria-selected` would describe a
 * widget that isn't there. It still behaves like a tablist — roving tabindex,
 * arrows, Home/End.
 *
 * State vocabulary is moot here (no open/closed), so nothing to emit.
 */

export interface ObjectPageSubSection {
  id: string;
  title: Child;
  content: Child;
}

export interface ObjectPageSection {
  id: string;
  title: Child;
  subSections?: ObjectPageSubSection[];
  content?: Child;
}

export interface ObjectPageLayoutProps extends Omit<BaseProps, "title"> {
  sections: ObjectPageSection[];
  /** Controlled active section. Setting it scrolls there. */
  selectedSectionId?: string;
  defaultSelectedSectionId?: string;
  /** Fires for both a click on an anchor and a scroll that changes the section. */
  onSelectedSectionChange?: (id: string) => void;
  /** The object header — scrolls away under the anchor bar. */
  header?: Child;
  /** Stays put above the scroller. */
  title?: Child;
  showAnchorBar?: boolean;
  /** Accessible name for the anchor bar's nav landmark. */
  anchorBarLabel?: string;
}

/** A jump the user asked for should not also be an animation they didn't. */
const reducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const anchorClass = (isActive: boolean) =>
  cn(
    "zen-relative zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-whitespace-nowrap zen-border-0 zen-bg-transparent zen-px-3 zen-text-sm zen-transition-colors",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring",
    isActive
      ? "zen-font-semibold zen-text-zen-primary"
      : "zen-text-zen-muted-fg hover:zen-text-zen-foreground",
  );

interface AnchorRef {
  id: string;
  btn: HTMLButtonElement;
  underline: HTMLSpanElement;
}

export function ObjectPageLayout(
  props: ObjectPageLayoutProps,
): ZenComponent<ObjectPageLayoutProps> {
  let current: ObjectPageLayoutProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();

  // Per-render resources: listeners, observers and the applyProps cleanup. Torn
  // down and rebuilt whenever a structural prop changes.
  let frame = new Disposer();
  let removeProps: (() => void) | undefined;
  let io: IntersectionObserver | null = null;

  // Live DOM handles the spy and the roving bar reach for.
  let scroller: HTMLDivElement | null = null;
  let bar: HTMLElement | null = null;
  let spacer: HTMLDivElement | null = null;
  const sectionEls = new Map<string, HTMLElement>();
  let anchors: AnchorRef[] = [];

  const firstId = () => current.sections[0]?.id;

  const selected = controllable<string>({
    value: current.selectedSectionId,
    defaultValue: current.defaultSelectedSectionId ?? firstId() ?? "",
    onChange: (id) => current.onSelectedSectionChange?.(id),
  });

  // What the spy last reported. Also the guard that keeps a controlled
  // selectedSectionId from scrolling back to where the user just scrolled:
  // spy says B -> parent echoes B -> the command path must not "obey" it.
  let spyId: string | undefined =
    current.selectedSectionId ?? current.defaultSelectedSectionId ?? firstId();
  // A click is already scrolling somewhere; mute the spy until it settles.
  let suppress = false;
  // Set by setupObserver; replays a fresh entry for every section.
  let recheck: (() => void) | null = null;
  // Measured, never hardcoded from the height utility, so the spy's band and the
  // sections' scroll-margin-top cannot drift from the bar's real height.
  let barHeight = 0;
  let didInit = false;

  // Roving tabindex: the bar is one tab stop. Manual activation — arrows move
  // focus, Enter/Space (the button's own default) does the navigating.
  let focusedAnchor: string | null = null;
  const tabbableAnchor = () => focusedAnchor ?? selected.get() ?? firstId();

  const updateTabStops = () => {
    const target = tabbableAnchor();
    for (const a of anchors) a.btn.tabIndex = a.id === target ? 0 : -1;
  };

  const paint = () => {
    const active = selected.get();
    for (const a of anchors) {
      const isActive = a.id === active;
      if (isActive) a.btn.setAttribute("aria-current", "true");
      else a.btn.removeAttribute("aria-current");
      a.btn.className = anchorClass(isActive);
      a.underline.hidden = !isActive;
    }
    updateTabStops();
  };

  /**
   * Scroll a section to the anchor line and make it current.
   *
   * `notify` is off for the two cases the caller already knows about — the
   * initial selection, and a controlled selectedSectionId the parent just set —
   * so onSelectedSectionChange only ever reports what the component decided: a
   * click, or a scroll.
   */
  const goToSection = (
    id: string,
    { animate, notify }: { animate: boolean; notify: boolean },
  ) => {
    const target = sectionEls.get(id);
    const root = scroller;
    if (!target || !root) return;

    spyId = id;
    // set() reports + (uncontrolled) stores + repaints; sync() repaints without
    // reporting, which is what the two silent cases want.
    if (notify) selected.set(id);
    else selected.sync(id);

    // Mute the spy until the scroll settles. Otherwise the bar strobes through
    // every section the animation passes over and the last one to report wins.
    suppress = true;
    let timer = 0;
    const release = () => {
      root.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      suppress = false;
      // Re-read where everything ended up. The callbacks that fired during the
      // jump were dropped by the mute above.
      recheck?.();
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      // `scrollend` says exactly this, but Safari doesn't implement it. 120ms of
      // quiet is the portable equivalent.
      timer = window.setTimeout(release, 120);
    };
    root.addEventListener("scroll", onScroll);
    // Nothing to scroll — already there, or no travel left. Release rather than
    // stay muted forever.
    timer = window.setTimeout(release, 1000);

    target.scrollIntoView({
      block: "start",
      behavior: animate && !reducedMotion() ? "smooth" : "auto",
    });
  };

  const tryInit = () => {
    if (didInit) return;
    // scroll-margin-top depends on barHeight; running before it is measured
    // lands the section under the bar.
    if (current.showAnchorBar !== false && barHeight === 0) return;
    didInit = true;
    const id = current.selectedSectionId ?? current.defaultSelectedSectionId;
    if (!id || id === firstId()) return;
    goToSection(id, { animate: false, notify: false });
  };

  const recomputeTail = () => {
    const root = scroller;
    const lastId = current.sections[current.sections.length - 1]?.id;
    const last = lastId ? sectionEls.get(lastId) : undefined;
    if (!root || !last || !spacer) return;
    // Trailing space so the LAST section can still scroll up to the band. Without
    // it the final anchor is unreachable — the scroller runs out of travel while
    // that section is still halfway down. sap.uxap pads the same gap.
    spacer.style.height = `${Math.max(0, root.clientHeight - last.offsetHeight - barHeight)}px`;
  };

  const setupObserver = () => {
    io?.disconnect();
    io = null;
    recheck = null;
    const root = scroller;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const els = current.sections
      .map((s) => sectionEls.get(s.id))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length) return;

    // Which sections still reach below the anchor line. A section drops out of
    // this set exactly when it has scrolled entirely above the line, so the FIRST
    // still in it (in document order) is the one you are inside. The region
    // reaches the bottom of the scroller deliberately: a thin band answers
    // nothing at the extremes, and misses a jump larger than itself.
    const below = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.sectionId;
          if (!id) continue;
          if (e.isIntersecting) below.add(id);
          else below.delete(id);
        }
        if (suppress) return;
        const next = current.sections.find((s) => below.has(s.id))?.id;
        if (!next || next === spyId) return;
        spyId = next;
        selected.set(next);
      },
      {
        root,
        // The extra pixel decides the bottom: at max scroll the last section's
        // top lands exactly on the line, leaving its predecessor's bottom edge
        // there too. Nudging the line down a pixel breaks the tie.
        rootMargin: `-${barHeight + 1}px 0px 0px 0px`,
        threshold: 0,
      },
    );
    els.forEach((e) => observer.observe(e));
    io = observer;
    // Re-observing replays a fresh entry for every section — a programmatic
    // scroll needs it, since the callbacks that arrived while muted were dropped.
    recheck = () => {
      els.forEach((e) => {
        observer.unobserve(e);
        observer.observe(e);
      });
    };
  };

  // The bar's height is load-bearing twice over: the spy's band starts below it,
  // and scroll-margin-top keeps a clicked section from landing beneath it. When
  // it changes, both derived quantities are recomputed.
  const applyBarHeight = (h: number) => {
    if (h === barHeight) {
      tryInit();
      return;
    }
    barHeight = h;
    for (const s of sectionEls.values()) s.style.scrollMarginTop = `${h}px`;
    setupObserver();
    recomputeTail();
    tryInit();
  };

  const focusAnchor = (id: string) => {
    focusedAnchor = id;
    updateTabStops();
    anchors.find((a) => a.id === id)?.btn.focus();
  };

  const onAnchorKeyDown = (e: KeyboardEvent, index: number) => {
    const list = current.sections;
    const last = list.length - 1;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAnchor(list[index === last ? 0 : index + 1].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAnchor(list[index === 0 ? last : index - 1].id);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusAnchor(list[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      focusAnchor(list[last].id);
    }
  };

  const render = () => {
    frame.dispose();
    frame = new Disposer();
    io?.disconnect();
    io = null;
    recheck = null;
    removeProps?.();
    sectionEls.clear();
    anchors = [];
    scroller = bar = spacer = null;
    barHeight = 0;

    const {
      sections,
      selectedSectionId: _sel,
      defaultSelectedSectionId: _dsel,
      onSelectedSectionChange: _osc,
      header,
      title,
      showAnchorBar = true,
      anchorBarLabel = "Object page sections",
      class: className,
      children,
      ...rest
    } = current;

    el.className = cn(
      "zen-flex zen-h-full zen-flex-col zen-overflow-hidden zen-bg-zen-background zen-text-zen-foreground",
      className,
    );
    el.replaceChildren();

    // The title bar. `children` are its trailing content — actions, a status.
    // They are not sections and they do not scroll away.
    const hasTitle = title !== undefined && title !== null && title !== false;
    const hasChildren = children !== undefined && children !== null && children !== false;
    if (hasTitle || hasChildren) {
      const titleBar = document.createElement("div");
      titleBar.className =
        "zen-flex zen-shrink-0 zen-items-center zen-gap-3 zen-border-b zen-border-zen-border zen-px-6 zen-py-3";
      if (hasTitle) {
        const h2 = document.createElement("h2");
        h2.className = "zen-m-0 zen-min-w-0 zen-truncate zen-text-base zen-font-semibold";
        h2.replaceChildren(...toNodes(title as Child));
        titleBar.append(h2);
      }
      if (hasChildren) {
        const actions = document.createElement("div");
        actions.className = "zen-ml-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2";
        actions.replaceChildren(...toNodes(children));
        titleBar.append(actions);
      }
      el.append(titleBar);
    }

    scroller = document.createElement("div");
    scroller.className = "zen-min-h-0 zen-flex-1 zen-overflow-y-auto";
    el.append(scroller);

    if (header !== undefined && header !== null && header !== false) {
      const headerBox = document.createElement("div");
      headerBox.className = "zen-border-b zen-border-zen-border zen-px-6 zen-py-4";
      headerBox.replaceChildren(...toNodes(header as Child));
      scroller.append(headerBox);
    }

    if (showAnchorBar) {
      const nav = document.createElement("nav");
      nav.setAttribute("aria-label", anchorBarLabel);
      nav.className =
        "zen-sticky zen-top-0 zen-z-10 zen-flex zen-h-11 zen-items-stretch zen-gap-1 zen-overflow-x-auto zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-4";

      sections.forEach((s, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.anchorId = s.id;
        btn.className = anchorClass(false);
        btn.append(...toNodes(s.title));

        const underline = document.createElement("span");
        underline.setAttribute("aria-hidden", "true");
        underline.className =
          "zen-absolute zen-inset-x-2 zen-bottom-0 zen-h-0.5 zen-rounded-zen-full zen-bg-zen-primary";
        underline.hidden = true;
        btn.append(underline);

        btn.addEventListener("focus", () => {
          focusedAnchor = s.id;
          updateTabStops();
        });
        btn.addEventListener("keydown", (e) => onAnchorKeyDown(e, i));
        btn.addEventListener("click", () =>
          goToSection(s.id, { animate: true, notify: true }),
        );

        nav.append(btn);
        anchors.push({ id: s.id, btn, underline });
      });

      scroller.append(nav);
      bar = nav;
    }

    for (const s of sections) {
      const section = document.createElement("section");
      section.id = s.id;
      section.dataset.sectionId = s.id;
      section.setAttribute("aria-labelledby", `${s.id}-title`);
      section.className = "zen-border-b zen-border-zen-border zen-px-6 zen-py-5";

      const h3 = document.createElement("h3");
      h3.id = `${s.id}-title`;
      h3.className =
        "zen-m-0 zen-mb-3 zen-text-sm zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg";
      h3.append(...toNodes(s.title));
      section.append(h3);

      if (s.content !== undefined && s.content !== null && s.content !== false) {
        section.append(...toNodes(s.content));
      }

      s.subSections?.forEach((sub) => {
        const subSection = document.createElement("section");
        subSection.id = sub.id;
        subSection.setAttribute("aria-labelledby", `${sub.id}-title`);
        subSection.className =
          "zen-mt-4 zen-border-t zen-border-zen-border zen-pt-4 first:zen-mt-0 first:zen-border-t-0 first:zen-pt-0";
        const h4 = document.createElement("h4");
        h4.id = `${sub.id}-title`;
        h4.className = "zen-m-0 zen-mb-2 zen-text-sm zen-font-semibold";
        h4.append(...toNodes(sub.title));
        subSection.append(h4);
        subSection.append(...toNodes(sub.content));
        section.append(subSection);
      });

      scroller.append(section);
      sectionEls.set(s.id, section);
    }

    spacer = document.createElement("div");
    spacer.setAttribute("aria-hidden", "true");
    scroller.append(spacer);

    removeProps = applyProps(el, rest as Record<string, unknown>);

    // Measure the bar. offsetHeight is 0 until the element is laid out — the
    // ResizeObserver picks up the real value once it is in the document, and
    // applyBarHeight rebuilds everything that depends on it.
    if (bar && typeof ResizeObserver !== "undefined") {
      const barEl = bar;
      const ro = new ResizeObserver(() => applyBarHeight(barEl.offsetHeight));
      ro.observe(barEl);
      frame.add(() => ro.disconnect());
      applyBarHeight(barEl.offsetHeight);
    } else {
      applyBarHeight(0);
    }

    // Tail space follows the scroller's and the last section's size.
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => recomputeTail());
      ro.observe(scroller);
      const lastId = sections[sections.length - 1]?.id;
      const last = lastId ? sectionEls.get(lastId) : undefined;
      if (last) ro.observe(last);
      frame.add(() => ro.disconnect());
    }
    recomputeTail();

    setupObserver();
    frame.add(() => {
      io?.disconnect();
      io = null;
    });

    paint();
    tryInit();
  };

  render();
  disposer.add(selected.subscribe(paint));
  disposer.add(() => frame.dispose());
  disposer.add(() => io?.disconnect());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      const structural =
        next.sections !== undefined ||
        next.title !== undefined ||
        next.header !== undefined ||
        next.showAnchorBar !== undefined ||
        next.anchorBarLabel !== undefined ||
        next.children !== undefined ||
        next.class !== undefined;
      current = { ...current, ...next };
      if (structural) render();
      // A controlled selectedSectionId is a command, not a mirror: keep the
      // highlight in step, and scroll there when it is a genuine new target.
      if (next.selectedSectionId !== undefined) {
        selected.sync(next.selectedSectionId);
        if (next.selectedSectionId !== spyId) {
          goToSection(next.selectedSectionId, { animate: true, notify: false });
        }
      }
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

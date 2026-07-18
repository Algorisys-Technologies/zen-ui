import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * ObjectPageLayout — the object detail page: a title bar that stays, an
 * object header that scrolls away, and a sticky AnchorBar whose links stay in
 * sync with whatever section you are looking at.
 *
 * docs/fiori-gap-analysis.md (Tier 1): "Object detail page with anchored,
 * scroll-synced sections. `sap.uxap`'s whole reason to exist."
 *
 *   <ObjectPageLayout
 *     title="SO-4711"
 *     header={<OrderHeader />}
 *     sections={SECTIONS}
 *     onSelectedSectionChange={setSection}
 *   />
 *
 * `sections` is DATA rather than compound children — the same departure from
 * this library's usual Radix-style composition that Tree and DataTable make, and
 * for the same structural reason (see tree.tsx's header). Two facts force it:
 * the AnchorBar has to render the WHOLE section list before a single section is
 * on screen, and the scroll-spy needs an element per section to observe. With
 * compound children both live only in the DOM, so the bar would be a DOM walk
 * re-run on every render and the observer would be re-attached as the tree
 * changed underneath it. Given the list, the bar is a map over it and the
 * observer is registered once per section.
 *
 * HEIGHT: the root is `zen-h-full` and its container must have a definite
 * height. min-height is a floor, not a ceiling — a container that grows to fit
 * its content leaves the inner scroller nothing to scroll, so it expands too,
 * and the page ends up with two scrollbars and an anchor bar that sticks to
 * nothing. This is the same bug App.css documents at `.app-shell`.
 *
 * SCROLL-SPY: an IntersectionObserver rooted at the CONTENT scroller, not the
 * window. The demo shell owns page scrolling (`.app-content` is the single
 * scroller; the document does not scroll), so a window-rooted observer would
 * never fire — and offset arithmetic against `window.scrollY` would read 0
 * forever. The band it watches is a strip across the top of the scroller,
 * starting just below the sticky bar; the first section (in document order) to
 * reach it is the one being read.
 *
 * IDS: a section's `id` is its identity in the API and its id in the DOM, so it
 * is what a URL fragment or an external link can point at — and so it must be
 * unique in the document. One object page per screen is the assumption.
 *
 * ARIA: the bar is a `nav` landmark of buttons carrying `aria-current`, not a
 * `tablist` of `role="tab"`. It behaves like a tablist — roving tabindex,
 * arrows, Home/End — and Fiori's own anchor bar looks like one, but `role="tab"`
 * promises `role="tabpanel"` siblings of which exactly one is shown. Here every
 * section is on screen at once and the bar moves the viewport rather than
 * swapping panels, so `aria-selected` would be describing a widget that isn't
 * there. `aria-current` is the attribute for "this is the one you're on".
 */

export interface ObjectPageSubSection {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface ObjectPageSection {
  id: string;
  title: React.ReactNode;
  subSections?: ObjectPageSubSection[];
  content?: React.ReactNode;
}

export interface ObjectPageLayoutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  sections: ObjectPageSection[];
  /** Controlled active section. Setting it scrolls there. */
  selectedSectionId?: string;
  defaultSelectedSectionId?: string;
  /** Fires for both a click on an anchor and a scroll that changes the section. */
  onSelectedSectionChange?: (id: string) => void;
  /** The object header — scrolls away under the anchor bar. */
  header?: React.ReactNode;
  /** Stays put above the scroller. */
  title?: React.ReactNode;
  showAnchorBar?: boolean;
  /** Accessible name for the anchor bar's nav landmark. */
  anchorBarLabel?: string;
}

/** A jump the user asked for should not also be an animation they didn't. */
const reducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const ObjectPageLayout = React.forwardRef<HTMLDivElement, ObjectPageLayoutProps>(
  (
    {
      sections,
      selectedSectionId,
      defaultSelectedSectionId,
      onSelectedSectionChange,
      header,
      title,
      showAnchorBar = true,
      anchorBarLabel = "Object page sections",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const barRef = React.useRef<HTMLElement>(null);
    const sectionRefs = React.useRef(new Map<string, HTMLElement>());

    const firstId = sections[0]?.id;
    const [internalSelected, setInternalSelected] = React.useState<string | undefined>(
      defaultSelectedSectionId ?? firstId,
    );
    const activeId = selectedSectionId ?? internalSelected;

    // What the spy last reported. Also the guard that keeps a controlled
    // `selectedSectionId` from scrolling back to where the user just scrolled:
    // spy says B -> parent echoes B -> the effect below must not "obey" it.
    const spyIdRef = React.useRef<string | undefined>(
      selectedSectionId ?? defaultSelectedSectionId ?? firstId,
    );
    const suppressRef = React.useRef(false);
    /** Set by the observer effect; replays a fresh entry for every section. */
    const recheckRef = React.useRef<(() => void) | null>(null);

    // Read through a ref so the observer, which is created once per section
    // list, never calls a stale handler.
    const onChangeRef = React.useRef(onSelectedSectionChange);
    React.useEffect(() => {
      onChangeRef.current = onSelectedSectionChange;
    });

    const commit = React.useCallback((id: string) => {
      setInternalSelected(id);
      onChangeRef.current?.(id);
    }, []);

    // The bar's height is load-bearing twice over: the spy's band starts below
    // it, and `scroll-margin-top` keeps a clicked section from landing beneath
    // it. Measured rather than hardcoded from the height utility, so the two
    // cannot drift.
    const [barHeight, setBarHeight] = React.useState(0);
    React.useLayoutEffect(() => {
      const el = barRef.current;
      if (!el) {
        setBarHeight(0);
        return;
      }
      setBarHeight(el.offsetHeight);
      if (typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => setBarHeight(el.offsetHeight));
      ro.observe(el);
      return () => ro.disconnect();
    }, [showAnchorBar]);

    // Trailing space, so the LAST section can still scroll up to the band. Without
    // it the final anchor is unreachable — the scroller runs out of travel while
    // that section is still halfway down the viewport, so clicking its anchor
    // moves nothing and the spy never marks it current. sap.uxap pads the same
    // gap for the same reason. No feedback loop: the spacer changes the content
    // height, and neither term below reads it.
    const [tailSpace, setTailSpace] = React.useState(0);
    const lastId = sections[sections.length - 1]?.id;
    React.useLayoutEffect(() => {
      const root = scrollRef.current;
      const last = lastId ? sectionRefs.current.get(lastId) : undefined;
      if (!root || !last) return;
      const recompute = () =>
        setTailSpace(Math.max(0, root.clientHeight - last.offsetHeight - barHeight));
      recompute();
      if (typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(recompute);
      ro.observe(root);
      ro.observe(last);
      return () => ro.disconnect();
    }, [lastId, barHeight, sections]);

    React.useEffect(() => {
      const root = scrollRef.current;
      if (!root || typeof IntersectionObserver === "undefined") return;
      const els = sections
        .map((s) => sectionRefs.current.get(s.id))
        .filter((el): el is HTMLElement => !!el);
      if (!els.length) return;

      // Which sections still reach below the anchor line — the line being where
      // the sticky bar ends. A section drops out of this set exactly when it has
      // scrolled entirely above the line, so the FIRST section still in it (in
      // document order) is the one you are inside, and the handover happens at
      // precisely the moment the previous section's last pixel leaves.
      //
      // The observed region is everything from the line to the bottom of the
      // scroller, deliberately, rather than a thin band across the top. A band
      // fails twice. It answers nothing at the extremes, where no section is in
      // it at all — at rest the header fills it, at the bottom the tail spacer
      // does — so the bar keeps whatever it last said. And an observer only
      // fires when the intersection STATE changes, so a jump bigger than the
      // band (a scrollbar drag, a flick) crosses it entirely between frames,
      // changes nothing, and fires nothing: the bar silently stops updating.
      // A region reaching the bottom of the scroller has neither failure — every
      // section is either in it or above it, and any scroll that matters flips
      // that bit.
      const below = new Set<string>();

      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const id = (e.target as HTMLElement).dataset.sectionId;
            if (!id) continue;
            if (e.isIntersecting) below.add(id);
            else below.delete(id);
          }
          // A click is already scrolling somewhere; the sections it flies past
          // are not what the reader is looking at. Membership is still tracked
          // above — only the decision waits.
          if (suppressRef.current) return;
          const next = sections.find((s) => below.has(s.id))?.id;
          if (!next || next === spyIdRef.current) return;
          spyIdRef.current = next;
          commit(next);
        },
        {
          root,
          // The extra pixel is the difference between "at the bottom, the last
          // section is current" and "at the bottom, the second-to-last section
          // is current by a rounding error": at max scroll the last section's
          // top lands exactly on the line, which leaves its predecessor's bottom
          // edge exactly there too. Nudging the line down a pixel decides it.
          rootMargin: `-${barHeight + 1}px 0px 0px 0px`,
          threshold: 0,
        },
      );
      els.forEach((el) => io.observe(el));
      // Re-observing replays a fresh entry for every section. A programmatic
      // scroll needs that: the spy is muted while it runs, and the callbacks that
      // arrive during the mute are dropped, so without a replay the rects that
      // decided `passed` are the ones from before the jump.
      recheckRef.current = () => {
        els.forEach((el) => {
          io.unobserve(el);
          io.observe(el);
        });
      };
      return () => {
        recheckRef.current = null;
        io.disconnect();
      };
    }, [sections, barHeight, commit]);

    /**
     * Scroll a section to the anchor line and make it current.
     *
     * `notify` is off for the two cases the caller already knows about — the
     * initial selection, and a controlled `selectedSectionId` the parent just
     * set — so `onSelectedSectionChange` only ever reports what the component
     * decided: a click, or a scroll.
     */
    const goToSection = React.useCallback(
      (id: string, { animate, notify }: { animate: boolean; notify: boolean }) => {
        const el = sectionRefs.current.get(id);
        const root = scrollRef.current;
        if (!el || !root) return;

        spyIdRef.current = id;
        if (notify) commit(id);
        else setInternalSelected(id);

        // Mute the spy until the scroll settles. Otherwise the bar strobes
        // through every section the animation passes over and the last one to
        // report wins — which is not the one that was clicked.
        suppressRef.current = true;
        let timer = 0;
        const release = () => {
          root.removeEventListener("scroll", onScroll);
          window.clearTimeout(timer);
          suppressRef.current = false;
          // Re-read where everything ended up. The callbacks that fired during
          // the jump were dropped by the mute above.
          recheckRef.current?.();
        };
        const onScroll = () => {
          window.clearTimeout(timer);
          // `scrollend` says exactly this, but Safari doesn't implement it.
          // 120ms of quiet is the portable equivalent.
          timer = window.setTimeout(release, 120);
        };
        root.addEventListener("scroll", onScroll);
        // Nothing to scroll — already there, or the scroller has no travel left.
        // Release rather than stay muted forever.
        timer = window.setTimeout(release, 1000);

        el.scrollIntoView({
          block: "start",
          behavior: animate && !reducedMotion() ? "smooth" : "auto",
        });
      },
      [commit],
    );

    // The initial selection is a scroll position, not just a highlight: an
    // anchor marked current for a section that is not on screen is a lie. Waits
    // for barHeight, because scroll-margin-top depends on it and lands the
    // section under the bar if it runs first.
    const didInit = React.useRef(false);
    React.useEffect(() => {
      if (didInit.current) return;
      if (showAnchorBar && barHeight === 0) return;
      didInit.current = true;
      const id = selectedSectionId ?? defaultSelectedSectionId;
      if (!id || id === firstId) return;
      goToSection(id, { animate: false, notify: false });
    }, [barHeight, showAnchorBar, selectedSectionId, defaultSelectedSectionId, firstId, goToSection]);

    // A controlled selectedSectionId is a command, not a mirror.
    React.useEffect(() => {
      if (selectedSectionId === undefined) return;
      if (selectedSectionId === spyIdRef.current) return;
      goToSection(selectedSectionId, { animate: true, notify: false });
    }, [selectedSectionId, goToSection]);

    // Roving tabindex: the bar is one tab stop. Manual activation — arrows move
    // focus, Enter/Space (the button's own default) does the navigating.
    const [focusedAnchor, setFocusedAnchor] = React.useState<string | null>(null);
    const tabbableAnchor = focusedAnchor ?? activeId ?? firstId;
    const anchorRefs = React.useRef(new Map<string, HTMLButtonElement>());
    const focusAnchor = (id: string) => {
      setFocusedAnchor(id);
      anchorRefs.current.get(id)?.focus();
    };

    const onAnchorKeyDown = (e: React.KeyboardEvent, index: number) => {
      const last = sections.length - 1;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        focusAnchor(sections[index === last ? 0 : index + 1].id);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusAnchor(sections[index === 0 ? last : index - 1].id);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusAnchor(sections[0].id);
      } else if (e.key === "End") {
        e.preventDefault();
        focusAnchor(sections[last].id);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "zen-flex zen-h-full zen-flex-col zen-overflow-hidden zen-bg-zen-background zen-text-zen-foreground",
          className,
        )}
        {...props}
      >
        {/* `children` are the title bar's trailing content — actions, a status.
            They are not sections, and they do not scroll away. */}
        {title || children ? (
          <div className="zen-flex zen-shrink-0 zen-items-center zen-gap-3 zen-border-b zen-border-zen-border zen-px-6 zen-py-3">
            {title ? (
              <h2 className="zen-m-0 zen-min-w-0 zen-truncate zen-text-base zen-font-semibold">
                {title}
              </h2>
            ) : null}
            {children ? (
              <div className="zen-ml-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2">
                {children}
              </div>
            ) : null}
          </div>
        ) : null}

        <div ref={scrollRef} className="zen-min-h-0 zen-flex-1 zen-overflow-y-auto">
          {header ? (
            <div className="zen-border-b zen-border-zen-border zen-px-6 zen-py-4">{header}</div>
          ) : null}

          {showAnchorBar ? (
            <nav
              ref={barRef}
              aria-label={anchorBarLabel}
              className="zen-sticky zen-top-0 zen-z-10 zen-flex zen-h-11 zen-items-stretch zen-gap-1 zen-overflow-x-auto zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-4"
            >
              {sections.map((s, i) => {
                const isActive = activeId === s.id;
                return (
                  <button
                    key={s.id}
                    ref={(el) => {
                      if (el) anchorRefs.current.set(s.id, el);
                      else anchorRefs.current.delete(s.id);
                    }}
                    type="button"
                    data-anchor-id={s.id}
                    aria-current={isActive ? "true" : undefined}
                    tabIndex={tabbableAnchor === s.id ? 0 : -1}
                    onFocus={() => setFocusedAnchor(s.id)}
                    onKeyDown={(e) => onAnchorKeyDown(e, i)}
                    onClick={() => goToSection(s.id, { animate: true, notify: true })}
                    className={cn(
                      "zen-relative zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-whitespace-nowrap zen-border-0 zen-bg-transparent zen-px-3 zen-text-sm zen-transition-colors",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring",
                      isActive
                        ? "zen-font-semibold zen-text-zen-primary"
                        : "zen-text-zen-muted-fg hover:zen-text-zen-foreground",
                    )}
                  >
                    {s.title}
                    {isActive ? (
                      <span
                        aria-hidden="true"
                        className="zen-absolute zen-inset-x-2 zen-bottom-0 zen-h-0.5 zen-rounded-zen-full zen-bg-zen-primary"
                      />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          ) : null}

          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              data-section-id={s.id}
              aria-labelledby={`${s.id}-title`}
              ref={(el) => {
                if (el) sectionRefs.current.set(s.id, el);
                else sectionRefs.current.delete(s.id);
              }}
              // Keeps a clicked section clear of the sticky bar it would
              // otherwise scroll underneath. Inline because the bar is measured,
              // not fixed by a class.
              style={{ scrollMarginTop: barHeight }}
              className="zen-border-b zen-border-zen-border zen-px-6 zen-py-5"
            >
              <h3
                id={`${s.id}-title`}
                className="zen-m-0 zen-mb-3 zen-text-sm zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg"
              >
                {s.title}
              </h3>
              {s.content}
              {s.subSections?.map((sub) => (
                <section
                  key={sub.id}
                  id={sub.id}
                  aria-labelledby={`${sub.id}-title`}
                  className="zen-mt-4 zen-border-t zen-border-zen-border zen-pt-4 first:zen-mt-0 first:zen-border-t-0 first:zen-pt-0"
                >
                  <h4 id={`${sub.id}-title`} className="zen-m-0 zen-mb-2 zen-text-sm zen-font-semibold">
                    {sub.title}
                  </h4>
                  {sub.content}
                </section>
              ))}
            </section>
          ))}

          <div aria-hidden="true" style={{ height: tailSpace }} />
        </div>
      </div>
    );
  },
);
ObjectPageLayout.displayName = "ObjectPageLayout";

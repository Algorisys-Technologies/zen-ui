import {
  type JSX,
  For,
  Show,
  createEffect,
  createSignal,
  on,
  onCleanup,
  splitProps,
  untrack,
} from "solid-js";
import { cn } from "../../lib/cn";

/**
 * ObjectPageLayout — Solid binding. Mirrors
 * packages/react/src/components/object-page/object-page.tsx: same props, same
 * class strings, same observer strategy, same ARIA. See that file for why
 * `sections` is data rather than compound children, why the root needs a
 * container with a definite height, why the scroll-spy is rooted at the content
 * scroller rather than the window, and why the bar is a `nav` with
 * `aria-current` rather than a `tablist` with `aria-selected`.
 *
 * IDS: a section's `id` is its identity in the API and its id in the DOM, so it
 * must be unique in the document — one object page per screen.
 */

export interface ObjectPageSubSection {
  id: string;
  title: JSX.Element;
  content: JSX.Element;
}

export interface ObjectPageSection {
  id: string;
  title: JSX.Element;
  subSections?: ObjectPageSubSection[];
  content?: JSX.Element;
}

export type ObjectPageLayoutProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "title"> & {
  sections: ObjectPageSection[];
  /** Controlled active section. Setting it scrolls there. */
  selectedSectionId?: string;
  defaultSelectedSectionId?: string;
  /** Fires for both a click on an anchor and a scroll that changes the section. */
  onSelectedSectionChange?: (id: string) => void;
  /** The object header — scrolls away under the anchor bar. */
  header?: JSX.Element;
  /** Stays put above the scroller. */
  title?: JSX.Element;
  showAnchorBar?: boolean;
  /** Accessible name for the anchor bar's nav landmark. */
  anchorBarLabel?: string;
};

/** A jump the user asked for should not also be an animation they didn't. */
const reducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const ObjectPageLayout = (props: ObjectPageLayoutProps) => {
  const [local, rest] = splitProps(props, [
    "sections",
    "selectedSectionId",
    "defaultSelectedSectionId",
    "onSelectedSectionChange",
    "header",
    "title",
    "showAnchorBar",
    "anchorBarLabel",
    "class",
    "children",
  ]);

  let scrollRef: HTMLDivElement | undefined;
  let barRef: HTMLElement | undefined;
  const sectionRefs = new Map<string, HTMLElement>();
  const anchorRefs = new Map<string, HTMLButtonElement>();

  const showAnchorBar = () => local.showAnchorBar ?? true;
  const firstId = () => local.sections[0]?.id;

  // Seed reads, seen once at setup — the effects below keep everything current.
  const [internalSelected, setInternalSelected] = createSignal<string | undefined>(
    untrack(() => local.defaultSelectedSectionId ?? local.sections[0]?.id),
  );
  const activeId = () => local.selectedSectionId ?? internalSelected();

  // What the spy last reported. Also the guard that keeps a controlled
  // `selectedSectionId` from scrolling back to where the user just scrolled:
  // spy says B -> parent echoes B -> the effect below must not "obey" it.
  let spyId: string | undefined = untrack(
    () => local.selectedSectionId ?? local.defaultSelectedSectionId ?? local.sections[0]?.id,
  );
  let suppressed = false;
  /** Set by the observer effect; replays a fresh entry for every section. */
  let recheck: (() => void) | null = null;

  const commit = (id: string) => {
    setInternalSelected(id);
    local.onSelectedSectionChange?.(id);
  };

  // The bar's height is load-bearing twice over: the spy's band starts below it,
  // and `scroll-margin-top` keeps a clicked section from landing beneath it.
  // Measured rather than hardcoded from the height utility, so the two cannot
  // drift.
  const [barHeight, setBarHeight] = createSignal(0);
  createEffect(
    on(showAnchorBar, () => {
      const el = barRef;
      if (!el) {
        setBarHeight(0);
        return;
      }
      setBarHeight(el.offsetHeight);
      if (typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => setBarHeight(el.offsetHeight));
      ro.observe(el);
      onCleanup(() => ro.disconnect());
    }),
  );

  // Trailing space, so the LAST section can still scroll up to the band. Without
  // it the final anchor is unreachable — the scroller runs out of travel while
  // that section is still halfway down the viewport, so clicking its anchor
  // moves nothing and the spy never marks it current. sap.uxap pads the same gap
  // for the same reason. No feedback loop: the spacer changes the content
  // height, and neither term below reads it.
  const [tailSpace, setTailSpace] = createSignal(0);
  createEffect(
    on([() => local.sections, barHeight], () => {
      const root = scrollRef;
      const id = local.sections[local.sections.length - 1]?.id;
      const last = id ? sectionRefs.get(id) : undefined;
      if (!root || !last) return;
      const recompute = () =>
        setTailSpace(Math.max(0, root.clientHeight - last.offsetHeight - untrack(barHeight)));
      recompute();
      if (typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(recompute);
      ro.observe(root);
      ro.observe(last);
      onCleanup(() => ro.disconnect());
    }),
  );

  createEffect(
    on([() => local.sections, barHeight], () => {
      const root = scrollRef;
      console.log("DBG io effect root?", !!root);
      if (!root || typeof IntersectionObserver === "undefined") return;
      const sections = local.sections;
      const els = sections
        .map((s) => sectionRefs.get(s.id))
        .filter((el): el is HTMLElement => !!el);
      if (!els.length) return;

      // Which sections still reach below the anchor line — the line being where
      // the sticky bar ends. A section drops out of this set exactly when it has
      // scrolled entirely above the line, so the FIRST section still in it is
      // the one you are inside. The region reaches the bottom of the scroller
      // rather than being a thin band; see the React file for why a band fails
      // both at the extremes and on any jump big enough to clear it.
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
          if (suppressed) return;
          const next = sections.find((s) => below.has(s.id))?.id;
          if (!next || next === spyId) return;
          console.log("DBG spy commit:", next, "was", spyId);
          spyId = next;
          commit(next);
        },
        {
          root,
          // The extra pixel decides the bottom of the scroller, where the last
          // section's top and its predecessor's bottom land on the line together.
          rootMargin: `-${untrack(barHeight) + 1}px 0px 0px 0px`,
          threshold: 0,
        },
      );
      els.forEach((el) => io.observe(el));
      // Re-observing replays a fresh entry for every section — a programmatic
      // scroll needs that, since the callbacks that arrive while the spy is
      // muted are dropped.
      recheck = () => {
        els.forEach((el) => {
          io.unobserve(el);
          io.observe(el);
        });
      };
      onCleanup(() => {
        recheck = null;
        io.disconnect();
      });
    }),
  );

  /**
   * Scroll a section to the anchor line and make it current.
   *
   * `notify` is off for the two cases the caller already knows about — the
   * initial selection, and a controlled `selectedSectionId` the parent just set
   * — so `onSelectedSectionChange` only ever reports what the component decided:
   * a click, or a scroll.
   */
  const goToSection = (id: string, opts: { animate: boolean; notify: boolean }) => {
    const el = sectionRefs.get(id);
    const root = scrollRef;
    console.log("DBG goTo", id, "el?", !!el, "root?", !!root, "keys", [...sectionRefs.keys()].join(","));
    if (!el || !root) return;

    spyId = id;
    if (opts.notify) commit(id);
    else setInternalSelected(id);

    // Mute the spy until the scroll settles. Otherwise the bar strobes through
    // every section the animation passes over and the last one to report wins —
    // which is not the one that was clicked.
    suppressed = true;
    let timer = 0;
    const release = () => {
      root.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      suppressed = false;
      // Re-read where everything ended up: the callbacks that fired during the
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
    // Nothing to scroll — already there, or the scroller has no travel left.
    // Release rather than stay muted forever.
    timer = window.setTimeout(release, 1000);

    el.scrollIntoView({
      block: "start",
      behavior: opts.animate && !reducedMotion() ? "smooth" : "auto",
    });
  };

  // The initial selection is a scroll position, not just a highlight: an anchor
  // marked current for a section that is not on screen is a lie. Waits for
  // barHeight, because scroll-margin-top depends on it and lands the section
  // under the bar if it runs first.
  let didInit = false;
  createEffect(
    on(barHeight, (h) => {
      console.log("DBG init run: h=", h, "didInit=", didInit, "sel=", local.selectedSectionId, "spyId=", spyId);
      if (didInit) return;
      if (showAnchorBar() && h === 0) return;
      didInit = true;
      const id = local.selectedSectionId ?? local.defaultSelectedSectionId;
      console.log("DBG init deciding: id=", id, "firstId=", firstId());
      if (!id || id === firstId()) return;
      goToSection(id, { animate: false, notify: false });
    }),
  );

  // A controlled selectedSectionId is a command, not a mirror.
  createEffect(
    on(
      () => local.selectedSectionId,
      (id) => {
        if (id === undefined) return;
        if (id === spyId) return;
        goToSection(id, { animate: true, notify: false });
      },
    ),
  );

  // Roving tabindex: the bar is one tab stop. Manual activation — arrows move
  // focus, Enter/Space (the button's own default) does the navigating.
  const [focusedAnchor, setFocusedAnchor] = createSignal<string | null>(null);
  const tabbableAnchor = () => focusedAnchor() ?? activeId() ?? firstId();
  const focusAnchor = (id: string) => {
    setFocusedAnchor(id);
    anchorRefs.get(id)?.focus();
  };

  const onAnchorKeyDown = (e: KeyboardEvent, index: number) => {
    const sections = local.sections;
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
      class={cn(
        "zen-flex zen-h-full zen-flex-col zen-overflow-hidden zen-bg-zen-background zen-text-zen-foreground",
        local.class,
      )}
      {...rest}
    >
      {/* `children` are the title bar's trailing content — actions, a status.
          They are not sections, and they do not scroll away. */}
      <Show when={local.title || local.children}>
        <div class="zen-flex zen-shrink-0 zen-items-center zen-gap-3 zen-border-b zen-border-zen-border zen-px-6 zen-py-3">
          <Show when={local.title}>
            <h2 class="zen-m-0 zen-min-w-0 zen-truncate zen-text-base zen-font-semibold">
              {local.title}
            </h2>
          </Show>
          <Show when={local.children}>
            <div class="zen-ml-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2">
              {local.children}
            </div>
          </Show>
        </div>
      </Show>

      <div ref={scrollRef} class="zen-min-h-0 zen-flex-1 zen-overflow-y-auto">
        <Show when={local.header}>
          <div class="zen-border-b zen-border-zen-border zen-px-6 zen-py-4">{local.header}</div>
        </Show>

        <Show when={showAnchorBar()}>
          <nav
            ref={(el) => {
              barRef = el;
              onCleanup(() => {
                barRef = undefined;
              });
            }}
            aria-label={local.anchorBarLabel ?? "Object page sections"}
            class="zen-sticky zen-top-0 zen-z-10 zen-flex zen-h-11 zen-items-stretch zen-gap-1 zen-overflow-x-auto zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-4"
          >
            <For each={local.sections}>
              {(s, i) => {
                const isActive = () => activeId() === s.id;
                return (
                  <button
                    ref={(el) => {
                      anchorRefs.set(s.id, el);
                      onCleanup(() => anchorRefs.delete(s.id));
                    }}
                    type="button"
                    data-anchor-id={s.id}
                    aria-current={isActive() ? "true" : undefined}
                    tabIndex={tabbableAnchor() === s.id ? 0 : -1}
                    onFocus={() => setFocusedAnchor(s.id)}
                    onKeyDown={(e) => onAnchorKeyDown(e, i())}
                    onClick={() => goToSection(s.id, { animate: true, notify: true })}
                    class={cn(
                      "zen-relative zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-whitespace-nowrap zen-border-0 zen-bg-transparent zen-px-3 zen-text-sm zen-transition-colors",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring",
                      isActive()
                        ? "zen-font-semibold zen-text-zen-primary"
                        : "zen-text-zen-muted-fg hover:zen-text-zen-foreground",
                    )}
                  >
                    {s.title}
                    <Show when={isActive()}>
                      {/* Explicitly "true": a bare aria-hidden renders as
                          aria-hidden="" in Solid, and an empty value is not
                          `true` per ARIA — verified against Chrome's a11y tree. */}
                      <span
                        aria-hidden="true"
                        class="zen-absolute zen-inset-x-2 zen-bottom-0 zen-h-0.5 zen-rounded-zen-full zen-bg-zen-primary"
                      />
                    </Show>
                  </button>
                );
              }}
            </For>
          </nav>
        </Show>

        <For each={local.sections}>
          {(s) => (
            <section
              ref={(el) => {
                sectionRefs.set(s.id, el);
                onCleanup(() => sectionRefs.delete(s.id));
              }}
              id={s.id}
              data-section-id={s.id}
              aria-labelledby={`${s.id}-title`}
              // Keeps a clicked section clear of the sticky bar it would
              // otherwise scroll underneath. Inline because the bar is measured,
              // not fixed by a class.
              style={{ "scroll-margin-top": `${barHeight()}px` }}
              class="zen-border-b zen-border-zen-border zen-px-6 zen-py-5"
            >
              <h3
                id={`${s.id}-title`}
                class="zen-m-0 zen-mb-3 zen-text-sm zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg"
              >
                {s.title}
              </h3>
              {s.content}
              <For each={s.subSections}>
                {(sub) => (
                  <section
                    id={sub.id}
                    aria-labelledby={`${sub.id}-title`}
                    class="zen-mt-4 zen-border-t zen-border-zen-border zen-pt-4 first:zen-mt-0 first:zen-border-t-0 first:zen-pt-0"
                  >
                    <h4 id={`${sub.id}-title`} class="zen-m-0 zen-mb-2 zen-text-sm zen-font-semibold">
                      {sub.title}
                    </h4>
                    {sub.content}
                  </section>
                )}
              </For>
            </section>
          )}
        </For>

        <div aria-hidden="true" style={{ height: `${tailSpace()}px` }} />
      </div>
    </div>
  );
};

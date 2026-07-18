import {
  type JSX,
  type Accessor,
  type ComponentProps,
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";

/**
 * DynamicPage — Solid binding. Mirrors
 * packages/react/src/components/dynamic-page/: same props, same class strings,
 * same snap logic. See that file for why the ROOT is the scroll container and
 * why the root needs a bounded height rather than a min-height.
 *
 * The one structural translation: context values that change (headerExpanded,
 * pinned) are exposed as accessors, since Solid cannot re-render consumers on a
 * plain value change.
 */

/** Slop before a scroll counts as intent to snap. Pixels, not rem: this is a
 *  scroll measurement, not a design token. */
const SNAP_THRESHOLD_PX = 8;

interface DynamicPageContextValue {
  headerExpanded: Accessor<boolean>;
  setHeaderExpanded: (v: boolean) => void;
  pinned: Accessor<boolean>;
  setPinned: (v: boolean) => void;
  headerPinnable: Accessor<boolean>;
  showFooter: Accessor<boolean>;
  headerId: string;
  setTitleEl: (el: HTMLElement | null) => void;
  setHeaderEl: (el: HTMLElement | null) => void;
}

const DynamicPageContext = createContext<DynamicPageContextValue | null>(null);

function useDynamicPage(part: string): DynamicPageContextValue {
  const ctx = useContext(DynamicPageContext);
  if (!ctx) throw new Error(`<${part}> must be used within a <DynamicPage>`);
  return ctx;
}

export type DynamicPageProps = ComponentProps<"div"> & {
  /** Controlled expanded state of the header. */
  headerExpanded?: boolean;
  /** Uncontrolled initial expanded state (default true). */
  defaultHeaderExpanded?: boolean;
  onHeaderExpandedChange?: (expanded: boolean) => void;
  /** Offer the pin toggle that keeps the header expanded while scrolling. */
  headerPinnable?: boolean;
  /** Set false to hide a `<DynamicPageFooter>` without unmounting the page. */
  showFooter?: boolean;
};

export const DynamicPage = (props: DynamicPageProps) => {
  const [local, rest] = splitProps(props, [
    "headerExpanded",
    "defaultHeaderExpanded",
    "onHeaderExpandedChange",
    "headerPinnable",
    "showFooter",
    "class",
    "children",
  ]);

  let rootRef: HTMLDivElement | undefined;
  const headerId = createUniqueId();

  const [titleEl, setTitleEl] = createSignal<HTMLElement | null>(null);
  const [headerEl, setHeaderEl] = createSignal<HTMLElement | null>(null);

  const [internal, setInternal] = createSignal(local.defaultHeaderExpanded ?? true);
  const headerExpanded = createMemo(() => local.headerExpanded ?? internal());
  const setHeaderExpanded = (v: boolean) => {
    if (local.headerExpanded === undefined) setInternal(v);
    local.onHeaderExpandedChange?.(v);
  };

  const [pinned, setPinned] = createSignal(false);
  const headerPinnable = createMemo(() => local.headerPinnable ?? true);
  const showFooter = createMemo(() => local.showFooter ?? true);

  // A page that stops being pinnable must not strand a pinned header, which
  // would be permanently un-snappable with no control left to release it.
  createEffect(() => {
    if (!headerPinnable() && pinned()) setPinned(false);
  });

  // The snap itself. The listener reads signals outside any tracking scope, so
  // it never needs re-subscribing the way React's effect does.
  onMount(() => {
    const el = rootRef;
    if (!el) return;

    const onScroll = () => {
      if (pinned()) return;
      const top = el.scrollTop;
      if (top <= 0) {
        setHeaderExpanded(true);
        return;
      }
      if (top <= SNAP_THRESHOLD_PX) return;
      // Refuse to snap when collapsing would destroy the very scroll distance
      // that triggered it: the scroller would clamp back to 0, we would
      // re-expand, and the header would flap for as long as the user scrolled.
      const headerH = headerEl()?.offsetHeight ?? 0;
      if (el.scrollHeight - el.clientHeight - headerH <= SNAP_THRESHOLD_PX) return;
      setHeaderExpanded(false);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onCleanup(() => el.removeEventListener("scroll", onScroll));
  });

  // A pinned header sticks directly BELOW the title, which means it needs the
  // title's height as an offset. Published as a custom property and written
  // imperatively: this changes on resize, not on render.
  createEffect(() => {
    const title = titleEl();
    const root = rootRef;
    if (!root || !title || typeof ResizeObserver === "undefined") return;
    const sync = () =>
      root.style.setProperty("--zen-dynamic-page-title-h", `${title.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(title);
    onCleanup(() => ro.disconnect());
  });

  const ctx: DynamicPageContextValue = {
    headerExpanded,
    setHeaderExpanded,
    pinned,
    setPinned,
    headerPinnable,
    showFooter,
    headerId,
    setTitleEl,
    setHeaderEl,
  };

  return (
    <DynamicPageContext.Provider value={ctx}>
      <div
        ref={rootRef}
        data-header-expanded={headerExpanded() || undefined}
        data-header-pinned={pinned() || undefined}
        class={cn(
          "zen-relative zen-flex zen-h-full zen-flex-col zen-overflow-y-auto zen-bg-zen-background zen-text-zen-foreground",
          // Scroll anchoring would "helpfully" subtract the collapsing header's
          // height from scrollTop, dropping us back to 0, which re-expands the
          // header — the snap would undo itself.
          "zen-[overflow-anchor:none]",
          local.class,
        )}
        {...rest}
      >
        {local.children}
      </div>
    </DynamicPageContext.Provider>
  );
};

export type DynamicPageTitleProps = Omit<ComponentProps<"div">, "title"> & {
  heading: JSX.Element;
  subheading?: JSX.Element;
  /** Rendered at the trailing edge; does not collapse. */
  actions?: JSX.Element;
  breadcrumbs?: JSX.Element;
  /** Extra title content shown only while the header is EXPANDED. */
  expandedContent?: JSX.Element;
  /** Extra title content shown only while the header is SNAPPED — the way
   *  to keep the facts you lose to the collapse. */
  snappedContent?: JSX.Element;
};

export const DynamicPageTitle = (props: DynamicPageTitleProps) => {
  const { headerExpanded, setHeaderExpanded, headerId, setTitleEl } =
    useDynamicPage("DynamicPageTitle");
  const [local, rest] = splitProps(props, [
    "heading",
    "subheading",
    "actions",
    "breadcrumbs",
    "expandedContent",
    "snappedContent",
    "class",
    "children",
  ]);

  return (
    <div
      ref={(el) => setTitleEl(el)}
      data-state={headerExpanded() ? "expanded" : "snapped"}
      class={cn(
        // Sticky at ALL times — only the header below it ever collapses.
        "zen-sticky zen-top-0 zen-z-20 zen-shrink-0 zen-bg-zen-background zen-px-4 zen-pb-2 zen-pt-3",
        local.class,
      )}
      {...rest}
    >
      <Show when={local.breadcrumbs}>
        <div class="zen-mb-1 zen-min-w-0">{local.breadcrumbs}</div>
      </Show>

      <div class="zen-flex zen-items-start zen-justify-between zen-gap-4">
        <div class="zen-min-w-0 zen-flex-1">
          <h2 class="zen-m-0">
            {/* The heading IS the expand/collapse control: the header toggles
                on a title click, and a11y wants a real button carrying
                aria-expanded. One element satisfies both, and its text is the
                accessible name — no aria-label to fall out of sync. */}
            <button
              type="button"
              aria-expanded={headerExpanded()}
              aria-controls={headerId}
              onClick={() => setHeaderExpanded(!headerExpanded())}
              class="zen-group zen-inline-flex zen-max-w-full zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-bg-transparent zen-px-1 zen-py-0.5 zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
            >
              <span class="zen-truncate">{local.heading}</span>
              <Icon
                name={headerExpanded() ? "chevron-up" : "chevron-down"}
                size={16}
                class="zen-shrink-0 zen-text-zen-muted-fg"
              />
            </button>
          </h2>

          <Show when={local.subheading}>
            <p class="zen-m-0 zen-px-1 zen-text-sm zen-text-zen-muted-fg">{local.subheading}</p>
          </Show>

          {headerExpanded() ? local.expandedContent : local.snappedContent}
          {local.children}
        </div>

        <Show when={local.actions}>
          <div class="zen-flex zen-shrink-0 zen-items-center zen-gap-2">{local.actions}</div>
        </Show>
      </div>
    </div>
  );
};

export type DynamicPageHeaderProps = ComponentProps<"div"> & {
  pinLabel?: string;
  unpinLabel?: string;
};

export const DynamicPageHeader = (props: DynamicPageHeaderProps) => {
  const { headerExpanded, pinned, setPinned, headerPinnable, headerId, setHeaderEl } =
    useDynamicPage("DynamicPageHeader");
  const [local, rest] = splitProps(props, ["class", "children", "aria-label", "pinLabel", "unpinLabel"]);

  return (
    <div
      ref={(el) => setHeaderEl(el)}
      id={headerId}
      role="region"
      aria-label={local["aria-label"] ?? "Page header"}
      data-state={headerExpanded() ? "expanded" : "collapsed"}
      class={cn(
        // 1fr → 0fr on a grid row collapses to zero without anyone measuring the
        // content, and animates, which `height: auto` cannot.
        //
        // The transition-property is spelled as an arbitrary PROPERTY
        // (`zen-[transition-property:…]`), not as `zen-transition-[…]`. Uno has no
        // arbitrary-value form of its `transition-*` rule, so the latter matched
        // nothing and this header collapsed instantly — the one thing the comment
        // above says it does not do. Pinned by check:css-live.
        "zen-grid zen-shrink-0 zen-overflow-hidden zen-border-b zen-border-zen-border zen-bg-zen-background zen-[transition-property:grid-template-rows] zen-duration-200 zen-ease-out",
        headerExpanded() ? "zen-grid-rows-[1fr]" : "zen-grid-rows-[0fr]",
        // Pinned: ride along under the sticky title instead of scrolling away.
        // The border-b sits on THIS element, outside the clipped row, so a
        // collapsed header still draws the line under the title.
        pinned() && "zen-sticky zen-z-10",
        local.class,
      )}
      style={pinned() ? { top: "var(--zen-dynamic-page-title-h, 0px)" } : undefined}
      // Collapsed content is clipped, not removed — without this it keeps its
      // place in the tab order and the accessibility tree. `undefined` rather
      // than `false`: inert is a boolean attribute, so inert="false" would
      // still make the subtree inert.
      inert={!headerExpanded() ? true : undefined}
      {...rest}
    >
      <div class="zen-min-h-0 zen-overflow-hidden">
        <div class="zen-flex zen-items-end zen-justify-between zen-gap-4 zen-px-4 zen-pb-3 zen-pt-1">
          <div class="zen-min-w-0 zen-flex-1">{local.children}</div>

          <Show when={headerPinnable()}>
            <button
              type="button"
              aria-pressed={pinned()}
              aria-label={pinned() ? (local.unpinLabel ?? "Unpin header") : (local.pinLabel ?? "Pin header")}
              onClick={() => setPinned(!pinned())}
              class={cn(
                "zen-inline-flex zen-h-7 zen-w-7 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-bg-transparent zen-text-zen-muted-fg zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                pinned() && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
              )}
            >
              <Icon name="lock" size={14} />
            </button>
          </Show>
        </div>
      </div>
    </div>
  );
};

export type DynamicPageFooterProps = ComponentProps<"div">;

export const DynamicPageFooter = (props: DynamicPageFooterProps) => {
  const { showFooter } = useDynamicPage("DynamicPageFooter");
  const [local, rest] = splitProps(props, ["class", "children"]);

  return (
    <Show when={showFooter()}>
      {/* mt-auto pins the bar to the bottom when the content is too short to
          fill the page; sticky keeps it there once the content overflows.
          pointer-events-none on the rail so the floating bar's margins do not
          swallow clicks meant for the content scrolling underneath it. */}
      <div class="zen-pointer-events-none zen-sticky zen-bottom-0 zen-z-30 zen-mt-auto zen-shrink-0 zen-p-3">
        <div
          class={cn(
            "zen-pointer-events-auto zen-flex zen-items-center zen-justify-end zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-shadow-lg",
            local.class,
          )}
          {...rest}
        >
          {local.children}
        </div>
      </div>
    </Show>
  );
};

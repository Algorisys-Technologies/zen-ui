import * as React from "react";
import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";

/**
 * DynamicPage — a page whose header COLLAPSES ("snaps") as the content scrolls,
 * leaving a sticky title bar behind, plus an optional floating footer.
 *
 * See docs/fiori-gap-analysis.md (Tier 1). This underpins the List Report
 * and Object Page floorplans; the snapping is the whole component.
 *
 *   <DynamicPage className="zen-h-[520px]">
 *     <DynamicPageTitle heading="Order 4711" subheading="Acme Corp" actions={…} />
 *     <DynamicPageHeader>…facts, KPIs…</DynamicPageHeader>
 *     <div>…content…</div>
 *     <DynamicPageFooter>…</DynamicPageFooter>
 *   </DynamicPage>
 *
 * Compound rather than data-driven (unlike Toolbar): these are content SLOTS
 * that render where you put them, not actions that have to move between two
 * different elements.
 *
 * ── Why the ROOT is the scroll container ──────────────────────────────────
 * The root scrolls; the title is `sticky top-0` inside it. Snapping is driven
 * by that element's `scrollTop`, never by `window` — this repo's demo shell
 * already owns page scrolling (`.app-content` is the single scroller and the
 * document does not scroll), so a window-scroll implementation would never
 * fire even once. Being self-contained is also what lets the page work inside
 * any container.
 *
 * The root therefore needs a BOUNDED height from its parent (`h-full`, a grid
 * track, a fixed height). `min-height` would be a floor, not a ceiling: a root
 * free to grow to its content never scrolls, and the header never snaps.
 */

/** Slop before a scroll counts as intent to snap. Pixels, not rem: this is a
 *  scroll measurement, not a design token. */
const SNAP_THRESHOLD_PX = 8;

interface DynamicPageContextValue {
  headerExpanded: boolean;
  setHeaderExpanded: (v: boolean) => void;
  pinned: boolean;
  setPinned: (v: boolean) => void;
  headerPinnable: boolean;
  showFooter: boolean;
  headerId: string;
  setTitleEl: (el: HTMLElement | null) => void;
  setHeaderEl: (el: HTMLElement | null) => void;
}

const DynamicPageContext = React.createContext<DynamicPageContextValue | null>(null);

function useDynamicPage(part: string): DynamicPageContextValue {
  const ctx = React.useContext(DynamicPageContext);
  if (!ctx) throw new Error(`<${part}> must be used within a <DynamicPage>`);
  return ctx;
}

export interface DynamicPageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controlled expanded state of the header. */
  headerExpanded?: boolean;
  /** Uncontrolled initial expanded state (default true). */
  defaultHeaderExpanded?: boolean;
  onHeaderExpandedChange?: (expanded: boolean) => void;
  /** Offer the pin toggle that keeps the header expanded while scrolling. */
  headerPinnable?: boolean;
  /** Set false to hide a `<DynamicPageFooter>` without unmounting the page. */
  showFooter?: boolean;
}

export const DynamicPage = React.forwardRef<HTMLDivElement, DynamicPageProps>(
  (
    {
      headerExpanded: expandedProp,
      defaultHeaderExpanded = true,
      onHeaderExpandedChange,
      headerPinnable = true,
      showFooter = true,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const headerId = React.useId();

    // Elements land in state rather than refs so the effects below re-run when
    // a part mounts late (a conditionally rendered header, say) instead of
    // silently observing nothing.
    const [titleEl, setTitleEl] = React.useState<HTMLElement | null>(null);
    const [headerEl, setHeaderEl] = React.useState<HTMLElement | null>(null);

    const [internal, setInternal] = React.useState(defaultHeaderExpanded);
    const isControlled = expandedProp !== undefined;
    const headerExpanded = isControlled ? expandedProp : internal;

    const setHeaderExpanded = React.useCallback(
      (v: boolean) => {
        if (!isControlled) setInternal(v);
        onHeaderExpandedChange?.(v);
      },
      [isControlled, onHeaderExpandedChange],
    );

    const [pinned, setPinned] = React.useState(false);
    // A page that stops being pinnable must not strand a pinned header, which
    // would be permanently un-snappable with no control left to release it.
    React.useEffect(() => {
      if (!headerPinnable && pinned) setPinned(false);
    }, [headerPinnable, pinned]);

    // The snap itself.
    React.useEffect(() => {
      const el = rootRef.current;
      if (!el) return;

      const onScroll = () => {
        if (pinned) return;
        const top = el.scrollTop;
        if (top <= 0) {
          setHeaderExpanded(true);
          return;
        }
        if (top <= SNAP_THRESHOLD_PX) return;
        // Refuse to snap when collapsing would destroy the very scroll distance
        // that triggered it: the scroller would clamp back to 0, we would
        // re-expand, and the header would flap for as long as the user scrolled.
        // Fiori draws the same line — a header is not snappable if the content
        // does not overflow.
        const headerH = headerEl?.offsetHeight ?? 0;
        if (el.scrollHeight - el.clientHeight - headerH <= SNAP_THRESHOLD_PX) return;
        setHeaderExpanded(false);
      };

      el.addEventListener("scroll", onScroll, { passive: true });
      return () => el.removeEventListener("scroll", onScroll);
    }, [pinned, headerEl, setHeaderExpanded]);

    // A pinned header sticks directly BELOW the title, which means it needs the
    // title's height as an offset. Published as a custom property and written
    // imperatively: this changes on resize, not on render, and re-rendering the
    // whole page to move a header by 2px would be a poor trade.
    React.useLayoutEffect(() => {
      const root = rootRef.current;
      if (!root || !titleEl || typeof ResizeObserver === "undefined") return;
      const sync = () =>
        root.style.setProperty("--zen-dynamic-page-title-h", `${titleEl.offsetHeight}px`);
      sync();
      const ro = new ResizeObserver(sync);
      ro.observe(titleEl);
      return () => ro.disconnect();
    }, [titleEl]);

    const ctx = React.useMemo<DynamicPageContextValue>(
      () => ({
        headerExpanded,
        setHeaderExpanded,
        pinned,
        setPinned,
        headerPinnable,
        showFooter,
        headerId,
        setTitleEl,
        setHeaderEl,
      }),
      [headerExpanded, setHeaderExpanded, pinned, headerPinnable, showFooter, headerId],
    );

    return (
      <DynamicPageContext.Provider value={ctx}>
        <div
          ref={(node) => {
            rootRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          data-header-expanded={headerExpanded || undefined}
          data-header-pinned={pinned || undefined}
          className={cn(
            "zen-relative zen-flex zen-h-full zen-flex-col zen-overflow-y-auto zen-bg-zen-background zen-text-zen-foreground",
            // Scroll anchoring would "helpfully" subtract the collapsing
            // header's height from scrollTop, dropping us back to 0, which
            // re-expands the header — the snap would undo itself.
            "zen-[overflow-anchor:none]",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </DynamicPageContext.Provider>
    );
  },
);
DynamicPage.displayName = "DynamicPage";

export interface DynamicPageTitleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  heading: React.ReactNode;
  subheading?: React.ReactNode;
  /** Rendered at the trailing edge; does not collapse. */
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  /** Extra title content shown only while the header is EXPANDED. */
  expandedContent?: React.ReactNode;
  /** Extra title content shown only while the header is SNAPPED — the way
   *  to keep the facts you lose to the collapse. */
  snappedContent?: React.ReactNode;
}

export const DynamicPageTitle = React.forwardRef<HTMLDivElement, DynamicPageTitleProps>(
  (
    { heading, subheading, actions, breadcrumbs, expandedContent, snappedContent, className, children, ...props },
    ref,
  ) => {
    const { headerExpanded, setHeaderExpanded, headerId, setTitleEl } =
      useDynamicPage("DynamicPageTitle");

    return (
      <div
        ref={(node) => {
          setTitleEl(node);
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-state={headerExpanded ? "expanded" : "snapped"}
        className={cn(
          // Sticky at ALL times — only the header below it ever collapses.
          "zen-sticky zen-top-0 zen-z-20 zen-shrink-0 zen-bg-zen-background zen-px-4 zen-pb-2 zen-pt-3",
          className,
        )}
        {...props}
      >
        {breadcrumbs ? <div className="zen-mb-1 zen-min-w-0">{breadcrumbs}</div> : null}

        <div className="zen-flex zen-items-start zen-justify-between zen-gap-4">
          <div className="zen-min-w-0 zen-flex-1">
            <h2 className="zen-m-0">
              {/* The heading IS the expand/collapse control: the header toggles
                  on a title click, and a11y wants a real button carrying
                  aria-expanded. One element satisfies both, and its text is the
                  accessible name — no aria-label to fall out of sync. */}
              <button
                type="button"
                aria-expanded={headerExpanded}
                aria-controls={headerId}
                onClick={() => setHeaderExpanded(!headerExpanded)}
                className="zen-group zen-inline-flex zen-max-w-full zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-bg-transparent zen-px-1 zen-py-0.5 zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
              >
                <span className="zen-truncate">{heading}</span>
                <Icon
                  name={headerExpanded ? "chevron-up" : "chevron-down"}
                  size={16}
                  className="zen-shrink-0 zen-text-zen-muted-fg"
                />
              </button>
            </h2>

            {subheading ? (
              <p className="zen-m-0 zen-px-1 zen-text-sm zen-text-zen-muted-fg">{subheading}</p>
            ) : null}

            {headerExpanded ? expandedContent : snappedContent}
            {children}
          </div>

          {actions ? (
            <div className="zen-flex zen-shrink-0 zen-items-center zen-gap-2">{actions}</div>
          ) : null}
        </div>
      </div>
    );
  },
);
DynamicPageTitle.displayName = "DynamicPageTitle";

export interface DynamicPageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Names the header region. */
  "aria-label"?: string;
  pinLabel?: string;
  unpinLabel?: string;
}

export const DynamicPageHeader = React.forwardRef<HTMLDivElement, DynamicPageHeaderProps>(
  (
    {
      className,
      children,
      "aria-label": ariaLabel = "Page header",
      pinLabel = "Pin header",
      unpinLabel = "Unpin header",
      ...props
    },
    ref,
  ) => {
    const { headerExpanded, pinned, setPinned, headerPinnable, headerId, setHeaderEl } =
      useDynamicPage("DynamicPageHeader");

    return (
      <div
        ref={(node) => {
          setHeaderEl(node);
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={headerId}
        role="region"
        aria-label={ariaLabel}
        data-state={headerExpanded ? "expanded" : "collapsed"}
        className={cn(
          // 1fr → 0fr on a grid row collapses to zero without anyone measuring
          // the content, and animates, which `height: auto` cannot.
          //
          // The transition-property is spelled as an arbitrary PROPERTY
          // (`zen-[transition-property:…]`), not as `zen-transition-[…]`. Uno has
          // no arbitrary-value form of its `transition-*` rule, so the latter
          // matched nothing and this header collapsed instantly — the one thing
          // the comment above says it does not do. Pinned by check:css-live.
          "zen-grid zen-shrink-0 zen-overflow-hidden zen-border-b zen-border-zen-border zen-bg-zen-background zen-[transition-property:grid-template-rows] zen-duration-200 zen-ease-out",
          headerExpanded ? "zen-grid-rows-[1fr]" : "zen-grid-rows-[0fr]",
          // Pinned: ride along under the sticky title instead of scrolling away.
          // The border-b sits on THIS element, outside the clipped row, so a
          // collapsed header still draws the line under the title.
          pinned && "zen-sticky zen-z-10",
          className,
        )}
        style={pinned ? { top: "var(--zen-dynamic-page-title-h, 0px)" } : undefined}
        // Collapsed content is clipped, not removed — without this it keeps its
        // place in the tab order and the accessibility tree.
        inert={!headerExpanded ? true : undefined}
        {...props}
      >
        <div className="zen-min-h-0 zen-overflow-hidden">
          <div className="zen-flex zen-items-end zen-justify-between zen-gap-4 zen-px-4 zen-pb-3 zen-pt-1">
            <div className="zen-min-w-0 zen-flex-1">{children}</div>

            {headerPinnable ? (
              <button
                type="button"
                aria-pressed={pinned}
                aria-label={pinned ? unpinLabel : pinLabel}
                onClick={() => setPinned(!pinned)}
                className={cn(
                  "zen-inline-flex zen-h-7 zen-w-7 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-bg-transparent zen-text-zen-muted-fg zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  pinned && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
                )}
              >
                <Icon name="lock" size={14} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);
DynamicPageHeader.displayName = "DynamicPageHeader";

export type DynamicPageFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const DynamicPageFooter = React.forwardRef<HTMLDivElement, DynamicPageFooterProps>(
  ({ className, children, ...props }, ref) => {
    const { showFooter } = useDynamicPage("DynamicPageFooter");
    if (!showFooter) return null;

    return (
      // mt-auto pins the bar to the bottom when the content is too short to
      // fill the page; sticky keeps it there once the content overflows.
      // pointer-events-none on the rail so the floating bar's margins do not
      // swallow clicks meant for the content scrolling underneath it.
      <div className="zen-pointer-events-none zen-sticky zen-bottom-0 zen-z-30 zen-mt-auto zen-shrink-0 zen-p-3">
        <div
          ref={ref}
          className={cn(
            "zen-pointer-events-auto zen-flex zen-items-center zen-justify-end zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-shadow-lg",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);
DynamicPageFooter.displayName = "DynamicPageFooter";

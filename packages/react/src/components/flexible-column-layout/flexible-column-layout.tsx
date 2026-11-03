import * as React from "react";
import { cn } from "../../lib/cn";
import {
  FLEXIBLE_COLUMN_ORDER,
  flexibleColumnsForWidth,
  resolveFlexibleColumns,
  type FlexibleColumnShare,
} from "@algorisys/zen-ui-core/flexible-column-layout";

/**
 * FlexibleColumnLayout — 1–3 columns for the master-detail pattern
 * (list → detail → detail), with responsive collapse rules.
 *
 * See docs/fiori-gap-analysis.md (Tier 1). Master-detail is the dominant Fiori
 * navigation pattern and the app frame is the library's largest gap.
 *
 *   <FlexibleColumnLayout
 *     layout={layout}
 *     onLayoutChange={(d) => console.log(d.visibleColumns)}
 *     startColumn={<OrderList onSelect={() => setLayout("TwoColumnsMidExpanded")} />}
 *     midColumn={<OrderDetail />}
 *     endColumn={<LineItemDetail />}
 *   />
 *
 * Fiori's layout NAMES are kept verbatim — this is the one place SAP's
 * vocabulary is worth preserving, because the layout state machine is what
 * apps drive: a router maps a URL to a layout, the layout maps to columns.
 * Renaming them would break the only mental model consumers already have.
 *
 * The component is CONTROLLED: it never changes `layout` itself.
 * Responsive collapse changes which columns are *rendered*, not which layout is
 * requested — so widening the container restores the full layout without the
 * app having to remember what it asked for. `onLayoutChange` reports what
 * actually got rendered; it is a notification, not a value to echo back into
 * `layout`.
 *
 * Sizing is container-relative (ResizeObserver), not viewport-relative. Fiori
 * uses global media queries, which is wrong for a library component: the same
 * layout inside a split pane, a preview frame or a builder canvas has to
 * collapse on ITS width, not the window's.
 */

export type FlexibleColumnLayoutType =
  | "OneColumn"
  | "TwoColumnsBeginExpanded"
  | "TwoColumnsMidExpanded"
  | "ThreeColumnsMidExpanded"
  | "ThreeColumnsEndExpanded"
  | "MidColumnFullScreen"
  | "EndColumnFullScreen";

export type FlexibleColumnName = "start" | "mid" | "end";

export interface FlexibleColumnLayoutChangeDetail {
  /**
   * The `layout` prop in effect. Deliberately NOT rewritten by responsive
   * collapse — same as Fiori, whose `layoutChange` reports the requested layout
   * alongside the visibility it actually resolved to.
   */
  layout: FlexibleColumnLayoutType;
  /** How many columns the CONTAINER is wide enough for: 1, 2 or 3. */
  maxColumnsCount: 1 | 2 | 3;
  /** The columns actually rendered, in order. */
  visibleColumns: FlexibleColumnName[];
}

/**
 * `children` is omitted deliberately: the root is a flex row of columns, so a
 * stray child would render as a fourth, unsized column. The columns ARE the
 * content — pass them as `startColumn` / `midColumn` / `endColumn`.
 */
export interface FlexibleColumnLayoutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  layout?: FlexibleColumnLayoutType;
  /** Fires when the rendered result changes — layout prop, or container tier. */
  onLayoutChange?: (detail: FlexibleColumnLayoutChangeDetail) => void;
  startColumn?: React.ReactNode;
  midColumn?: React.ReactNode;
  endColumn?: React.ReactNode;
}

// The column arithmetic (tiers, ratios, re-spreading an absent column's room)
// is core's, shared by every binding and pinned by
// check:flexible-column-layout. The classes stay here: UnoCSS generates only
// the classes it finds in this package's source.
const BASIS_CLASS: Record<FlexibleColumnShare, string> = {
  full: "zen-basis-full",
  "2/3": "zen-basis-2/3",
  "1/2": "zen-basis-1/2",
  "1/3": "zen-basis-1/3",
  "1/4": "zen-basis-1/4",
};

const COLUMN_ORDER = FLEXIBLE_COLUMN_ORDER;
const columnsForWidth = flexibleColumnsForWidth;

function resolveColumns(
  layout: FlexibleColumnLayoutType,
  maxColumnsCount: 1 | 2 | 3,
  present: Record<FlexibleColumnName, boolean>,
): Array<{ name: FlexibleColumnName; basis: string }> {
  return resolveFlexibleColumns(layout, maxColumnsCount, present).map((c) => ({ name: c.name, basis: BASIS_CLASS[c.share] }));
}

/**
 * `h-full` + `min-h-0` + `overflow-hidden`, and NOT `min-h-*`: min-height is a
 * floor, not a ceiling. A root that can grow past its parent means the columns'
 * `overflow-y: auto` never has anything to scroll — the content pushes the root
 * taller instead, and the page grows a second scrollbar. This repo shipped
 * exactly that bug (see the nps/likert fit-container fix). The layout must be
 * pinned to the parent for the columns to be the things that scroll.
 */
const ROOT_CLASS = "zen-flex zen-h-full zen-min-h-0 zen-w-full zen-overflow-hidden";

const COLUMN_CLASS =
  "zen-flex zen-h-full zen-min-h-0 zen-min-w-0 zen-shrink zen-grow-0 zen-flex-col " +
  "zen-overflow-y-auto zen-overflow-x-hidden zen-transition-all zen-duration-200 zen-ease-out";

export const FlexibleColumnLayout = React.forwardRef<HTMLDivElement, FlexibleColumnLayoutProps>(
  (
    { layout = "OneColumn", onLayoutChange, startColumn, midColumn, endColumn, className, ...props },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Starts at 3 so the first paint is the widest case rather than a single
    // column that snaps open — same reasoning as Toolbar's visibleCount.
    const [maxColumnsCount, setMaxColumnsCount] = React.useState<1 | 2 | 3>(3);

    React.useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container || typeof ResizeObserver === "undefined") return;

      const recompute = () => {
        const width = container.offsetWidth;
        // A zero width means "not laid out" (a hidden tab, a display:none
        // ancestor), not "very narrow". Collapsing on it would leave the wrong
        // column showing when the container is revealed at full size.
        if (!width) return;
        setMaxColumnsCount(columnsForWidth(width));
      };

      recompute();
      const ro = new ResizeObserver(recompute);
      ro.observe(container);
      return () => ro.disconnect();
    }, []);

    // Keyed on the booleans, never on the nodes. The columns are ReactNodes, so
    // the obvious consumer — `startColumn={<OrderList />}` — hands us a fresh
    // element identity on every render. Depending on the nodes made this memo
    // (and `columns`, and `detail` below) recompute every time, which fired the
    // `[detail]` effect, which called `onLayoutChange`, which set the caller's
    // state, which rendered again: a loop that pinned the CPU at 99% and
    // starved React's queue so route changes never committed. Only presence
    // matters here, and presence is a primitive.
    const hasStart = startColumn != null;
    const hasMid = midColumn != null;
    const hasEnd = endColumn != null;
    const present = React.useMemo(
      () => ({ start: hasStart, mid: hasMid, end: hasEnd }),
      [hasStart, hasMid, hasEnd],
    );

    const columns = React.useMemo(
      () => resolveColumns(layout, maxColumnsCount, present),
      [layout, maxColumnsCount, present],
    );

    const detail = React.useMemo<FlexibleColumnLayoutChangeDetail>(
      () => ({ layout, maxColumnsCount, visibleColumns: columns.map((c) => c.name) }),
      [layout, maxColumnsCount, columns],
    );

    // The callback is held in a ref so an inline arrow from the caller cannot
    // re-fire the event on every render — which, for the obvious consumer
    // (`onLayoutChange` drives state), would be an infinite loop.
    const callbackRef = React.useRef(onLayoutChange);
    React.useEffect(() => {
      callbackRef.current = onLayoutChange;
    });
    React.useEffect(() => {
      callbackRef.current?.(detail);
    }, [detail]);

    const content: Record<FlexibleColumnName, React.ReactNode> = {
      start: startColumn,
      mid: midColumn,
      end: endColumn,
    };

    const renderColumn = (name: FlexibleColumnName) => {
      if (!present[name]) return null;
      const index = columns.findIndex((c) => c.name === name);
      const visible = index > -1;
      return (
        <div
          key={name}
          data-column={name}
          data-visible={visible ? "true" : "false"}
          className={cn(
            COLUMN_CLASS,
            // `zen-hidden` rather than unmounting: a hidden column keeps its
            // scroll position and its state for when navigation comes back to
            // it, and display:none takes it out of the accessibility tree.
            visible ? columns[index].basis : "zen-hidden",
            // Separator on every visible column but the first, so the layout
            // never opens or closes with a stray edge.
            visible && index > 0 ? "zen-border-l zen-border-zen-border" : null,
          )}
        >
          {content[name]}
        </div>
      );
    };

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-layout={layout}
        data-max-columns={maxColumnsCount}
        className={cn(ROOT_CLASS, className)}
        {...props}
      >
        {COLUMN_ORDER.map(renderColumn)}
      </div>
    );
  },
);
FlexibleColumnLayout.displayName = "FlexibleColumnLayout";

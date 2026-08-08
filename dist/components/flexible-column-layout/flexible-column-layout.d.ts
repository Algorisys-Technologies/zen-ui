import * as React from "react";
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
export type FlexibleColumnLayoutType = "OneColumn" | "TwoColumnsBeginExpanded" | "TwoColumnsMidExpanded" | "ThreeColumnsMidExpanded" | "ThreeColumnsEndExpanded" | "MidColumnFullScreen" | "EndColumnFullScreen";
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
export interface FlexibleColumnLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    layout?: FlexibleColumnLayoutType;
    /** Fires when the rendered result changes — layout prop, or container tier. */
    onLayoutChange?: (detail: FlexibleColumnLayoutChangeDetail) => void;
    startColumn?: React.ReactNode;
    midColumn?: React.ReactNode;
    endColumn?: React.ReactNode;
}
export declare const FlexibleColumnLayout: React.ForwardRefExoticComponent<FlexibleColumnLayoutProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=flexible-column-layout.d.ts.map
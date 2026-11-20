/**
 * FlexibleColumnLayout's arithmetic: which columns render, and how wide.
 *
 * The pure half of FlexibleColumnLayout, shared by every binding (it was three
 * copies, one per binding, with identical tables). The layout NAMES are SAP's
 * verbatim; see the React component for why, and for why the tiers are
 * measured on the container rather than the viewport.
 *
 *   bun run check:flexible-column-layout
 */
export type FlexibleColumnLayoutType = "OneColumn" | "TwoColumnsBeginExpanded" | "TwoColumnsMidExpanded" | "ThreeColumnsMidExpanded" | "ThreeColumnsEndExpanded" | "MidColumnFullScreen" | "EndColumnFullScreen";
export type FlexibleColumnName = "start" | "mid" | "end";
/**
 * A column stops being usable below roughly this width, so the container is
 * given as many columns as it can pay for, capped at three.
 *
 * This is the one place the component deliberately departs from Fiori's
 * numbers. Fiori drops to two columns under 1024px and one under 600px — but
 * those are VIEWPORT breakpoints, a proxy for "phone / tablet / desktop".
 * Measured against a container they are a category error: a 1000px-wide pane on
 * a 1600px desktop is not a tablet, and three 333px columns in it are perfectly
 * usable. Deriving the tiers from a column's minimum width keeps the rule
 * container-relative, and reproduces Fiori's phone boundary exactly:
 * 3 × 300 = 900 for three columns, 2 × 300 = 600 for two.
 */
export declare const FLEXIBLE_COLUMN_MIN_WIDTH = 300;
export declare const FLEXIBLE_COLUMN_ORDER: readonly FlexibleColumnName[];
/**
 * A column's width, as a share of the row. Every share the tables can produce,
 * after re-spreading, is one of these. The bindings map each to a literal
 * `zen-basis-*` class in their own source, because UnoCSS generates only the
 * classes it finds there: a class string built here would render an unsized
 * column. A share with no token is a table edit that forgot to add one, so it
 * throws (and the check fails) rather than rendering one.
 */
export type FlexibleColumnShare = "full" | "2/3" | "1/2" | "1/3" | "1/4";
export declare function flexibleColumnShare(fraction: number): FlexibleColumnShare;
/** How many columns a container this wide can pay for: 1, 2 or 3. */
export declare function flexibleColumnsForWidth(width: number): 1 | 2 | 3;
/**
 * Which columns render, and how wide. `present` gates on content: a layout
 * that names a column the caller never filled must not reserve room for it,
 * and — at the one-column tier — must not resolve to an empty screen.
 *
 * Not reserving room means GIVING it to the others: the shares of the columns
 * that are present are re-spread over the whole row, keeping their proportion.
 * A three-column layout with no start column was otherwise drawn at three
 * quarters of the width with the last quarter blank. That case is a real one,
 * not a misuse: a consumer that keeps the detail in `mid` so that showing or
 * hiding the list never remounts it (and loses its state) has no start column
 * while the list is hidden.
 */
export declare function resolveFlexibleColumns(layout: FlexibleColumnLayoutType, maxColumnsCount: 1 | 2 | 3, present: Record<FlexibleColumnName, boolean>): Array<{
    name: FlexibleColumnName;
    share: FlexibleColumnShare;
}>;

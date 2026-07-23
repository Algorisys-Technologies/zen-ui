import { type JSX } from "solid-js";
/**
 * FlexibleColumnLayout — Solid binding. Mirrors
 * packages/react/src/components/flexible-column-layout/: same props, same
 * layout names, same class strings, same breakpoints. See that file for why
 * Fiori's vocabulary is preserved and why sizing is container-relative.
 */
export type FlexibleColumnLayoutType = "OneColumn" | "TwoColumnsBeginExpanded" | "TwoColumnsMidExpanded" | "ThreeColumnsMidExpanded" | "ThreeColumnsEndExpanded" | "MidColumnFullScreen" | "EndColumnFullScreen";
export type FlexibleColumnName = "start" | "mid" | "end";
export interface FlexibleColumnLayoutChangeDetail {
    /** The `layout` prop in effect — not rewritten by responsive collapse. */
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
export type FlexibleColumnLayoutProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    layout?: FlexibleColumnLayoutType;
    /** Fires when the rendered result changes — layout prop, or container tier. */
    onLayoutChange?: (detail: FlexibleColumnLayoutChangeDetail) => void;
    startColumn?: JSX.Element;
    midColumn?: JSX.Element;
    endColumn?: JSX.Element;
};
export declare const FlexibleColumnLayout: (props: FlexibleColumnLayoutProps) => JSX.Element;
//# sourceMappingURL=flexible-column-layout.d.ts.map
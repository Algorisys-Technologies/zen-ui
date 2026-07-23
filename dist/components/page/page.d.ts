import { type JSX } from "solid-js";
/**
 * Page and Bar — Solid binding. Mirrors packages/react/src/components/page/:
 * same props, same class strings. See that file for the rationale.
 */
export type PageProps = JSX.HTMLAttributes<HTMLDivElement> & {
    header?: JSX.Element;
    footer?: JSX.Element;
    /** Removes the content padding — for a full-bleed table or map. */
    flush?: boolean;
};
export declare const Page: (props: PageProps) => JSX.Element;
export type BarProps = JSX.HTMLAttributes<HTMLDivElement> & {
    startContent?: JSX.Element;
    /** Centred regardless of how wide start/end are — that is the point of Bar. */
    middleContent?: JSX.Element;
    endContent?: JSX.Element;
    design?: "header" | "subheader" | "footer";
};
export declare const Bar: (props: BarProps) => JSX.Element;
//# sourceMappingURL=page.d.ts.map
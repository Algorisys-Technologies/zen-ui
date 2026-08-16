import * as React from "react";
/**
 * Page and Bar — the two small structural pieces of the Tier 1 frame
 * (docs/fiori-gap-analysis.md). Neither is clever; both are load-bearing,
 * because everything else in the frame assumes them.
 *
 *   Page — a whole-screen container: header / content / footer, where ONLY the
 *          content scrolls.
 *   Bar  — the three-slot (start / middle / end) row used for headers,
 *          subheaders and footers.
 */
export interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
    header?: React.ReactNode;
    footer?: React.ReactNode;
    /** Removes the content padding — for a full-bleed table or map. */
    flush?: boolean;
}
export declare const Page: React.ForwardRefExoticComponent<PageProps & React.RefAttributes<HTMLDivElement>>;
export interface BarProps extends React.HTMLAttributes<HTMLDivElement> {
    startContent?: React.ReactNode;
    /** Centred regardless of how wide start/end are — that is the point of Bar. */
    middleContent?: React.ReactNode;
    endContent?: React.ReactNode;
    design?: "header" | "subheader" | "footer";
}
export declare const Bar: React.ForwardRefExoticComponent<BarProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=page.d.ts.map
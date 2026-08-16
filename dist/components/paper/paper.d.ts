import * as React from "react";
import { type VariantProps } from "class-variance-authority";
declare const paperVariants: (props?: ({
    measure?: "prose" | "wide" | "full" | null | undefined;
    elevation?: "flat" | "raised" | "lifted" | null | undefined;
    padding?: "none" | "sm" | "md" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface PaperProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof paperVariants> {
    /**
     * Draw 1 or 2 sheet edges behind this one — a pile rather than a sheet.
     * Purely decorative: the edges are box-shadows, so nothing enters the DOM or
     * the accessibility tree and a reader is never told the pile holds more
     * documents than the one you rendered.
     */
    stack?: 1 | 2;
}
declare const Paper: React.ForwardRefExoticComponent<PaperProps & React.RefAttributes<HTMLDivElement>>;
declare const PaperHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export type PaperTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
declare const PaperTitle: React.ForwardRefExoticComponent<PaperTitleProps & React.RefAttributes<HTMLHeadingElement>>;
declare const PaperDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const PaperContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const PaperFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export { Paper, PaperHeader, PaperTitle, PaperDescription, PaperContent, PaperFooter };
//# sourceMappingURL=paper.d.ts.map
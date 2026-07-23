import { type JSX } from "solid-js";
import { type VariantProps } from "class-variance-authority";
/**
 * Banner — page-top persistent callout. Compound API mirroring the
 * React binding: BannerIcon · BannerContent (Title + Description) ·
 * BannerActions · BannerClose. Differs from Alert in three ways:
 *  - Full container width (no rounded corners).
 *  - Optional `sticky` pins to top of the scroll viewport.
 *  - Inner row centers content within a max-width for wide screens.
 */
declare const bannerVariants: (props?: ({
    color?: "primary" | "neutral" | "info" | "success" | "warning" | "destructive" | null | undefined;
    sticky?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type BannerProps = VariantProps<typeof bannerVariants> & Omit<JSX.HTMLAttributes<HTMLDivElement>, "color" | "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const Banner: (props: BannerProps) => JSX.Element;
type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
type SpanProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const BannerIcon: (props: SpanProps) => JSX.Element;
export declare const BannerContent: (props: DivProps) => JSX.Element;
export declare const BannerTitle: (props: SpanProps) => JSX.Element;
export declare const BannerDescription: (props: SpanProps) => JSX.Element;
export declare const BannerActions: (props: DivProps) => JSX.Element;
export type BannerCloseProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "class"> & {
    class?: string;
};
export declare const BannerClose: (props: BannerCloseProps) => JSX.Element;
export { bannerVariants };
//# sourceMappingURL=banner.d.ts.map
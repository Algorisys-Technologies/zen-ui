import { type JSX } from "solid-js";
/**
 * Avatar — Solid port. Built on Kobalte's `Image` primitive (the
 * Solid-side equivalent of Radix Avatar — same data-loading-status
 * semantics, just named differently).
 *
 *   <Avatar>
 *     <AvatarImage src="…" alt="…" />
 *     <AvatarFallback>AB</AvatarFallback>
 *   </Avatar>
 *
 * The fallback renders automatically while the image is loading or
 * failed (Kobalte sets `data-loading-status="idle|loading|loaded|error"`).
 *
 * For grouped / stacked avatars use <AvatarGroup>.
 */
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class" | "children"> & {
    size?: AvatarSize;
    class?: string;
    children?: JSX.Element;
    /** Delay (ms) before showing the fallback. Useful to avoid a flash
     *  on fast networks while the <img> resolves. */
    fallbackDelay?: number;
};
export declare const Avatar: (props: AvatarProps) => JSX.Element;
export type AvatarImageProps = Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, "class" | "children"> & {
    class?: string;
};
export declare const AvatarImage: (props: AvatarImageProps) => JSX.Element;
export type AvatarFallbackProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const AvatarFallback: (props: AvatarFallbackProps) => JSX.Element;
export type AvatarGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    /** Maximum number of avatars to show. Excess collapses to "+N". */
    max?: number;
    /** Spacing between stacked avatars (negative left margin on children). */
    spacing?: "tight" | "default" | "loose";
    size?: AvatarSize;
    class?: string;
    children?: JSX.Element;
};
export declare const AvatarGroup: (props: AvatarGroupProps) => JSX.Element;
//# sourceMappingURL=avatar.d.ts.map
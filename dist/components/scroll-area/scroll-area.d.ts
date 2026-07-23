import { type JSX } from "solid-js";
/**
 * ScrollArea — Solid binding. Kobalte does not ship a ScrollArea
 * primitive, so this is a native-scroll wrapper with styled scrollbars
 * (via UnoCSS `scrollbar-*` utilities where supported). The trade-off
 * vs. the React/Radix version: scrollbars use the platform's native
 * appearance instead of a custom rendered thumb. For most app contexts
 * this is acceptable; a richer custom-scrollbar port can replace this
 * later if needed (likely via @corvu/scroll-area or solid-presence).
 */
export type ScrollAreaProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const ScrollArea: (props: ScrollAreaProps) => JSX.Element;
/** No-op kept for API parity with the React binding. */
export declare const ScrollBar: () => null;
//# sourceMappingURL=scroll-area.d.ts.map
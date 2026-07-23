import { type JSX } from "solid-js";
/**
 * Tooltip — Solid port built on Kobalte's Tooltip primitive.
 *
 *   <Tooltip>
 *     <TooltipTrigger>?</TooltipTrigger>
 *     <TooltipContent>Helpful hint</TooltipContent>
 *   </Tooltip>
 *
 * Kobalte handles positioning (via @floating-ui), collision detection,
 * keyboard dismissal (Esc), focus/hover triggers, and a11y
 * (aria-describedby). Theming flows through --zen-* tokens.
 *
 * No equivalent of Radix's <TooltipProvider> is needed — Kobalte uses a
 * `Tooltip` root per instance and per-tooltip delay props.
 */
export declare const Tooltip: typeof import("@kobalte/core/tooltip").Root & {
    Arrow: typeof import("@kobalte/core/dropdown-menu").Arrow;
    Content: typeof import("@kobalte/core/tooltip").Content;
    Portal: typeof import("@kobalte/core/tooltip").Portal;
    Trigger: typeof import("@kobalte/core/tooltip").Trigger;
};
export declare const TooltipTrigger: typeof import("@kobalte/core/tooltip").Trigger;
export declare const TooltipPortal: typeof import("@kobalte/core/tooltip").Portal;
export type TooltipContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    /** Render an arrow pointing at the trigger. Default false. */
    arrow?: boolean;
    class?: string;
    children?: JSX.Element;
};
export declare const TooltipContent: (props: TooltipContentProps) => JSX.Element;
//# sourceMappingURL=tooltip.d.ts.map
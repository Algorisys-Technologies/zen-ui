import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
/**
 * Tooltip — built on @radix-ui/react-tooltip.
 *
 * Compound API (shadcn-style):
 *   <TooltipProvider>
 *     <Tooltip>
 *       <TooltipTrigger asChild><Button>?</Button></TooltipTrigger>
 *       <TooltipContent>Helpful hint</TooltipContent>
 *     </Tooltip>
 *   </TooltipProvider>
 *
 * Radix handles positioning, collision detection, keyboard dismissal (Esc),
 * pointer-down dismissal, focus/hover triggers, and a11y (aria-describedby).
 * Theming flows through --zen-* CSS variables.
 */
declare const TooltipProvider: React.FC<TooltipPrimitive.TooltipProviderProps>;
declare const Tooltip: React.FC<TooltipPrimitive.TooltipProps>;
declare const TooltipTrigger: React.ForwardRefExoticComponent<TooltipPrimitive.TooltipTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const TooltipPortal: React.FC<TooltipPrimitive.TooltipPortalProps>;
export interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
    /** Render an arrow pointing at the trigger. Default false. */
    arrow?: boolean;
}
declare const TooltipContent: React.ForwardRefExoticComponent<TooltipContentProps & React.RefAttributes<HTMLDivElement>>;
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipPortal, };
//# sourceMappingURL=tooltip.d.ts.map
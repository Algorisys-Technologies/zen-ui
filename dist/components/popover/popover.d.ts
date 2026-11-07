import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
/**
 * Popover — built on @radix-ui/react-popover.
 *
 *   <Popover>
 *     <PopoverTrigger asChild><Button>Open</Button></PopoverTrigger>
 *     <PopoverContent>…</PopoverContent>
 *   </Popover>
 *
 * Radix supplies positioning, collision detection, focus trap, click-outside
 * dismissal, Escape-to-close, and ARIA.
 */
declare const Popover: React.FC<PopoverPrimitive.PopoverProps>;
declare const PopoverTrigger: React.ForwardRefExoticComponent<PopoverPrimitive.PopoverTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const PopoverAnchor: React.ForwardRefExoticComponent<PopoverPrimitive.PopoverAnchorProps & React.RefAttributes<HTMLDivElement>>;
declare const PopoverContent: React.ForwardRefExoticComponent<Omit<PopoverPrimitive.PopoverContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
//# sourceMappingURL=popover.d.ts.map
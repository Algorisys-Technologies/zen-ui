import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../../lib/cn";

/**
 * Switch — built on @radix-ui/react-switch.
 *
 *   <Switch checked={value} onCheckedChange={setValue} />
 *
 * Radix supplies controlled/uncontrolled state, name + value for form
 * submission, keyboard (space/enter), and ARIA (role="switch", aria-checked).
 * Theming via --zen-* tokens; size is a CVA variant.
 */

export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  size?: SwitchSize;
}

const TRACK_SIZES: Record<SwitchSize, string> = {
  sm: "zen-h-4 zen-w-7",
  md: "zen-h-5 zen-w-9",
  lg: "zen-h-6 zen-w-11",
};
const THUMB_SIZES: Record<SwitchSize, string> = {
  sm: "zen-h-3 zen-w-3 data-[state=checked]:zen-translate-x-3 data-[state=unchecked]:zen-translate-x-0.5",
  md: "zen-h-4 zen-w-4 data-[state=checked]:zen-translate-x-4 data-[state=unchecked]:zen-translate-x-0.5",
  lg: "zen-h-5 zen-w-5 data-[state=checked]:zen-translate-x-5 data-[state=unchecked]:zen-translate-x-0.5",
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size = "md", ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "zen-peer zen-inline-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-rounded-zen-full",
      "zen-transition-colors",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      "data-[state=checked]:zen-bg-zen-primary data-[state=unchecked]:zen-bg-zen-muted",
      TRACK_SIZES[size],
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "zen-block zen-rounded-zen-full zen-bg-zen-background zen-shadow-md zen-ring-0",
        "zen-transition-transform",
        THUMB_SIZES[size],
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };

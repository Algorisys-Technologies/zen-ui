import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../../../lib/cn";

/**
 * RadioGroup + RadioGroupItem — built on @radix-ui/react-radio-group.
 *
 *   <RadioGroup value={x} onValueChange={setX}>
 *     <RadioGroupItem value="a" id="a" /> <label htmlFor="a">A</label>
 *     <RadioGroupItem value="b" id="b" /> <label htmlFor="b">B</label>
 *   </RadioGroup>
 *
 * Radix supplies roving tabindex, arrow-key navigation, keyboard
 * activation, ARIA, and form submission (name + value).
 */

export type RadioSize = "sm" | "md" | "lg";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("zen-grid zen-gap-2", className)}
    {...props}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const ITEM_SIZES: Record<RadioSize, string> = {
  sm: "zen-h-3.5 zen-w-3.5",
  md: "zen-h-4 zen-w-4",
  lg: "zen-h-5 zen-w-5",
};

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  size?: RadioSize;
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size = "md", ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "zen-aspect-square zen-rounded-zen-full zen-border zen-border-zen-border zen-text-zen-primary",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      "data-[state=checked]:zen-border-zen-primary",
      ITEM_SIZES[size],
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="zen-flex zen-items-center zen-justify-center">
      <span className="zen-block zen-h-2 zen-w-2 zen-rounded-zen-full zen-bg-zen-primary" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };

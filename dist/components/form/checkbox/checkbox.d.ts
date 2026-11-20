import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
/**
 * Checkbox — built on @radix-ui/react-checkbox.
 *
 *   <Checkbox checked={value} onCheckedChange={setValue} />
 *   <Checkbox checked="indeterminate" onCheckedChange={setValue} />
 *
 * Radix supports the tri-state `"indeterminate"` natively (no DOM ref-poking
 * needed), keyboard activation (space), and ARIA. Themed via --zen-* tokens.
 */
export type CheckboxSize = "sm" | "md" | "lg";
export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
    size?: CheckboxSize;
}
declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLButtonElement>>;
export { Checkbox };
//# sourceMappingURL=checkbox.d.ts.map
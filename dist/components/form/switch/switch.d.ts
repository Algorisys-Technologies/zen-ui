import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
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
export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
    size?: SwitchSize;
}
declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>;
export { Switch };
//# sourceMappingURL=switch.d.ts.map
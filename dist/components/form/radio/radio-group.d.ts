import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
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
declare const RadioGroup: React.ForwardRefExoticComponent<Omit<RadioGroupPrimitive.RadioGroupProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
    size?: RadioSize;
}
declare const RadioGroupItem: React.ForwardRefExoticComponent<RadioGroupItemProps & React.RefAttributes<HTMLButtonElement>>;
export { RadioGroup, RadioGroupItem };
//# sourceMappingURL=radio-group.d.ts.map
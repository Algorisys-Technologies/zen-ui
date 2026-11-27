import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
/**
 * RadioGroup + RadioGroupItem — built on @radix-ui/react-radio-group.
 *
 *   <RadioGroup value={x} onValueChange={setX} label="Plan">
 *     <RadioGroupItem value="a" label="A" />
 *     <RadioGroupItem value="b" id="b" /> <label htmlFor="b">B</label>
 *   </RadioGroup>
 *
 * Radix supplies roving tabindex, arrow-key navigation, keyboard
 * activation, ARIA, and form submission (name + value).
 */
export type RadioSize = "sm" | "md" | "lg";
export interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
    /** Names the group — the question the options answer. Wired to the group's
     *  `aria-labelledby`, so a screen reader announces it before the options. */
    label?: React.ReactNode;
    /** Help text under the options, wired to the group's `aria-describedby`. */
    description?: React.ReactNode;
}
declare const RadioGroup: React.ForwardRefExoticComponent<RadioGroupProps & React.RefAttributes<HTMLDivElement>>;
export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
    size?: RadioSize;
    /** The option's text. Renders a `<label>` around the radio, so clicking the
     *  text selects it and the text becomes the radio's accessible name. */
    label?: React.ReactNode;
}
declare const RadioGroupItem: React.ForwardRefExoticComponent<RadioGroupItemProps & React.RefAttributes<HTMLButtonElement>>;
export { RadioGroup, RadioGroupItem };
//# sourceMappingURL=radio-group.d.ts.map
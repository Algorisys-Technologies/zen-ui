import { type JSX } from "solid-js";
/**
 * RadioGroup + RadioGroupItem — Solid port built on Kobalte's
 * RadioGroup primitive.
 *
 *   <RadioGroup value={x()} onChange={setX}>
 *     <RadioGroupItem value="a">A</RadioGroupItem>
 *     <RadioGroupItem value="b">B</RadioGroupItem>
 *   </RadioGroup>
 *
 * Kobalte supplies roving tabindex, arrow-key nav, keyboard activation,
 * ARIA, and form submission (name + value). Themed via --zen-* tokens.
 */
export type RadioSize = "sm" | "md" | "lg";
export type RadioGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children" | "onChange"> & {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    orientation?: "horizontal" | "vertical";
    class?: string;
    children?: JSX.Element;
};
export declare const RadioGroup: (props: RadioGroupProps) => JSX.Element;
export type RadioGroupItemProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    value: string;
    disabled?: boolean;
    size?: RadioSize;
    class?: string;
    children?: JSX.Element;
};
export declare const RadioGroupItem: (props: RadioGroupItemProps) => JSX.Element;
//# sourceMappingURL=radio-group.d.ts.map
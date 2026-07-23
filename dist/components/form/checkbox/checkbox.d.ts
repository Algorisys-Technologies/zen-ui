import { type JSX } from "solid-js";
/**
 * Checkbox — Solid port built on Kobalte's Checkbox primitive.
 *
 *   <Checkbox checked={value()} onChange={setValue} />
 *   <Checkbox indeterminate />
 *
 * Kobalte exposes both `checked` and `indeterminate` props natively (no
 * DOM ref-poking), keyboard activation (space), and ARIA. Themed via
 * --zen-* tokens.
 */
export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "onChange"> & {
    size?: CheckboxSize;
    class?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
    /** Optional inline label rendered to the right of the box. */
    label?: JSX.Element;
};
export declare const Checkbox: (props: CheckboxProps) => JSX.Element;
//# sourceMappingURL=checkbox.d.ts.map
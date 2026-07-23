import { type JSX } from "solid-js";
import { type ButtonProps } from "./button";
/**
 * Button family — Solid binding. Mirrors packages/react/src/components/button/
 * button-family.tsx: same props, same class strings. See that file for the
 * rationale.
 */
export type ToggleButtonProps = Omit<ButtonProps, "onChange"> & {
    /** Controlled pressed state. */
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
};
export declare const ToggleButton: (props: ToggleButtonProps) => JSX.Element;
export type SegmentedButtonProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: ButtonProps["size"];
};
export declare const SegmentedButton: (props: SegmentedButtonProps) => JSX.Element;
export type SegmentedButtonItemProps = Omit<ButtonProps, "value"> & {
    value: string;
};
export declare const SegmentedButtonItem: (props: SegmentedButtonItemProps) => JSX.Element;
export type SplitButtonProps = ButtonProps & {
    /** Menu contents — pass DropdownMenuItem children. */
    menu: JSX.Element;
    /** Accessible name for the arrow half. */
    menuLabel?: string;
    menuAlign?: "start" | "center" | "end";
};
export declare const SplitButton: (props: SplitButtonProps) => JSX.Element;
//# sourceMappingURL=button-family.d.ts.map
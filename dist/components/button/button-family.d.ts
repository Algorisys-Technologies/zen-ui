import * as React from "react";
import { type ButtonProps } from "./button";
/**
 * Button family — the three Fiori-shaped button forms zen-ui was missing.
 * See docs/fiori-gap-analysis.md (Tier 2: "cheap, high frequency").
 *
 *   ToggleButton     a button with a pressed state
 *   SegmentedButton  mutually exclusive choice, rendered as one joined control
 *   SplitButton      a default action plus a dropdown of related actions
 *
 * All three compose the existing Button rather than restyling from scratch, so
 * variant/color/size stay consistent and any Button change flows through.
 */
export interface ToggleButtonProps extends Omit<ButtonProps, "onChange"> {
    /** Controlled pressed state. */
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
}
export declare const ToggleButton: React.ForwardRefExoticComponent<ToggleButtonProps & React.RefAttributes<HTMLButtonElement>>;
export interface SegmentedButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: ButtonProps["size"];
    /** Accessible name for the group — it is a radiogroup, so it needs one. */
    "aria-label"?: string;
}
export declare const SegmentedButton: React.ForwardRefExoticComponent<SegmentedButtonProps & React.RefAttributes<HTMLDivElement>>;
export interface SegmentedButtonItemProps extends Omit<ButtonProps, "value"> {
    value: string;
}
export declare const SegmentedButtonItem: React.ForwardRefExoticComponent<SegmentedButtonItemProps & React.RefAttributes<HTMLButtonElement>>;
export interface SplitButtonProps extends ButtonProps {
    /** Menu contents — pass DropdownMenuItem children. */
    menu: React.ReactNode;
    /** Accessible name for the arrow half. */
    menuLabel?: string;
    menuAlign?: "start" | "center" | "end";
}
export declare const SplitButton: React.ForwardRefExoticComponent<SplitButtonProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=button-family.d.ts.map
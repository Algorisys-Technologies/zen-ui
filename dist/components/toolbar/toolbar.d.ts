import { type JSX } from "solid-js";
import { type ButtonProps } from "../button/button";
import { type IconName } from "../icon/icon";
/**
 * Toolbar — Solid binding. Mirrors packages/react/src/components/toolbar/:
 * same props, same class strings, same measurement strategy. See that file for
 * why `actions` is data rather than children.
 */
export interface ToolbarAction {
    id: string;
    label: JSX.Element;
    icon?: IconName;
    onSelect?: () => void;
    disabled?: boolean;
    variant?: ButtonProps["variant"];
    color?: ButtonProps["color"];
    /** `never` pins the action to the bar; anything else collapses when needed. */
    overflow?: "never" | "auto";
    /** Renders a divider before this action, in the bar and in the menu. */
    separatorBefore?: boolean;
}
export type ToolbarProps = JSX.HTMLAttributes<HTMLDivElement> & {
    actions: ToolbarAction[];
    overflowLabel?: string;
    size?: ButtonProps["size"];
};
export declare const Toolbar: (props: ToolbarProps) => JSX.Element;
//# sourceMappingURL=toolbar.d.ts.map
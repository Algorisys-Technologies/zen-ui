import * as React from "react";
import { type ButtonProps } from "../button/button";
import { type IconName } from "../icon/icon";
/**
 * Toolbar — a row of actions that collapses into an overflow menu when it runs
 * out of room. The overflow is the point; a row of buttons needs no component.
 *
 * See docs/fiori-gap-analysis.md (Tier 2). Fiori's OverflowToolbar physically
 * MOVES controls into a popover when they don't fit.
 *
 *   <Toolbar actions={actions} aria-label="Order actions">
 *     <h2>Orders</h2>
 *   </Toolbar>
 *
 * `actions` is DATA, not children — the one deliberate departure from this
 * library's usual composition, and the reason is structural rather than
 * stylistic: an overflowed action has to re-render as a *menu item*, which is a
 * different element than the button it was. The same React element cannot be in
 * two places, so the toolbar has to know the action's intent (label, icon,
 * onSelect) to render it either way. Compound children could only be shown or
 * hidden, never moved — which is precisely the behaviour that makes a toolbar
 * worth having. `children` covers leading content (a title) that never overflows.
 */
export interface ToolbarAction {
    id: string;
    label: React.ReactNode;
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
export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
    actions: ToolbarAction[];
    /** Accessible name — a toolbar needs one. */
    "aria-label"?: string;
    overflowLabel?: string;
    size?: ButtonProps["size"];
}
export declare const Toolbar: React.ForwardRefExoticComponent<ToolbarProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=toolbar.d.ts.map
import * as React from "react";
import { type StatusBarAlign } from "../../_core/status-bar";
import { type IconName } from "../icon/icon";
/**
 * StatusBar — the strip along the bottom of an app, an editor or a panel.
 *
 *   <StatusBar items={[
 *     { id: "branch", icon: "flag", label: "main" },
 *     { id: "errors", icon: "error", label: "2", color: "error", onSelect: openProblems, align: "end", priority: 5 },
 *   ]} />
 *
 * Items are data, not children, so the bar can decide what fits. When it is
 * too narrow, items give way lowest `priority` first, and among equals the one
 * later in the list — the rest are never squashed or wrapped. A collapsed item
 * is gone from the accessibility tree too, so give anything a user must not
 * miss a high priority.
 *
 * An item with `onSelect` is a button; otherwise it is text. Item text is not
 * announced when it changes (a clock would speak every second) unless the item
 * sets `announce`.
 *
 * Collapse is measured from the rendered items themselves, not from a hidden
 * copy: a `label` may be a stateful element, and rendering it twice would
 * mount it twice.
 */
export type StatusBarColor = "info" | "success" | "warning" | "error";
export interface StatusBarItem {
    id: string;
    label?: React.ReactNode;
    icon?: IconName;
    /** Tooltip, and part of the accessible name ("Problems 2"); the whole name of an icon-only item. */
    title?: string;
    /** Shows the item as a soft chip in that colour. */
    color?: StatusBarColor;
    /** Makes the item a button. */
    onSelect?: () => void;
    disabled?: boolean;
    /** Default "start". */
    align?: StatusBarAlign;
    /** Higher stays longer when the bar is narrow. Default 0. */
    priority?: number;
    hidden?: boolean;
    /** Draws a divider before the item. */
    separatorBefore?: boolean;
    /** Announces changes to this item's text to screen readers (a polite live region). */
    announce?: boolean;
}
export interface StatusBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    items: StatusBarItem[];
    variant?: "default" | "muted" | "accent";
    size?: "sm" | "md";
    /** The bar's accessible name. Default "Status bar". */
    label?: string;
    /** Called with the ids that gave way, whenever that set changes. */
    onCollapse?: (ids: string[]) => void;
}
export declare const StatusBar: React.ForwardRefExoticComponent<StatusBarProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=status-bar.d.ts.map
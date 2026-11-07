import * as React from "react";
import { type IconName } from "../icon/icon";
export interface ShellBarMenuItem {
    id: string;
    label: React.ReactNode;
    icon?: IconName;
    onSelect?: () => void;
    disabled?: boolean;
    /** Renders a divider before this entry. */
    separatorBefore?: boolean;
}
export interface ShellBarItem {
    id: string;
    /** Icon-only on the bar, so this is the accessible name AND the menu label. */
    label: string;
    icon: IconName;
    onSelect?: () => void;
    disabled?: boolean;
    /** `never` pins the item to the bar; anything else collapses when needed. */
    overflow?: "never" | "auto";
}
export interface ShellBarProfile {
    /** Accessible name of the trigger, and the menu's heading. */
    name: string;
    image?: string;
    /** Falls back to initials derived from `name`. */
    initials?: string;
    menuItems?: ShellBarMenuItem[];
    /**
     * The menu's own body, in place of `menuItems`: DropdownMenu parts — labels,
     * radio groups, checkbox items — for a menu that holds settings as well as
     * actions (appearance, density, sign out). Rendered under the name heading.
     * A function, called when the menu opens (the Solid binding needs that to
     * build the parts inside the menu's context; the shape is kept the same here).
     */
    menu?: () => React.ReactNode;
    onClick?: () => void;
}
export interface ShellBarProps extends Omit<React.HTMLAttributes<HTMLElement>, "onSearch" | "title"> {
    logo?: React.ReactNode;
    primaryTitle?: string;
    secondaryTitle?: string;
    /** Turns the title into a product-switcher dropdown. */
    menuItems?: ShellBarMenuItem[];
    searchable?: boolean;
    /**
     * Your own search control in the bar, in place of the built-in field: a
     * command palette's trigger, say. Laid out by the bar like its own search.
     * Pass a function to change with the space: `compact` is true where the
     * built-in field would have shrunk to an icon, so the control can too.
     * Replaces `searchable`'s field when both are given.
     *
     *   search={(bar) => <PaletteButton iconOnly={bar.compact} />}
     */
    search?: React.ReactNode | ((bar: {
        readonly compact: boolean;
    }) => React.ReactNode);
    onSearch?: (value: string) => void;
    /** Placeholder AND the search field's visually-hidden label. */
    searchPlaceholder?: string;
    notificationCount?: number;
    onNotificationsClick?: () => void;
    profile?: ShellBarProfile;
    /** Custom action icons; these overflow into a menu when space runs out. */
    items?: ShellBarItem[];
    onLogoClick?: () => void;
    overflowLabel?: string;
    /** Accessible name — a banner landmark needs one. Defaults to `primaryTitle`. */
    "aria-label"?: string;
}
export declare const ShellBar: React.ForwardRefExoticComponent<ShellBarProps & React.RefAttributes<HTMLElement>>;
//# sourceMappingURL=shellbar.d.ts.map
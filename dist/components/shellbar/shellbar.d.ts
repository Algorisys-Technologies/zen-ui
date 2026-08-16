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
    onClick?: () => void;
}
export interface ShellBarProps extends Omit<React.HTMLAttributes<HTMLElement>, "onSearch" | "title"> {
    logo?: React.ReactNode;
    primaryTitle?: string;
    secondaryTitle?: string;
    /** Turns the title into a product-switcher dropdown. */
    menuItems?: ShellBarMenuItem[];
    searchable?: boolean;
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
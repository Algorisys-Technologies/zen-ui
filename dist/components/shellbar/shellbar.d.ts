import { type JSX } from "solid-js";
import { type IconName } from "../icon/icon";
export interface ShellBarMenuItem {
    id: string;
    label: JSX.Element;
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
export type ShellBarProps = Omit<JSX.HTMLAttributes<HTMLElement>, "onSearch" | "title"> & {
    logo?: JSX.Element;
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
};
export declare const ShellBar: (props: ShellBarProps) => JSX.Element;
//# sourceMappingURL=shellbar.d.ts.map
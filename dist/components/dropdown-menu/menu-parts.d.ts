/**
 * The look DropdownMenu and ContextMenu share. Radix scopes each menu's parts
 * to its own root, so a DropdownMenuItem cannot render inside a ContextMenu
 * (in Solid, Kobalte shares one set of item parts and ContextMenu reuses them
 * outright). Here the two menus are separate components over one set of
 * classes and icons, which is what keeps them from drifting apart in look.
 */
export declare const menuContentClass: (className?: string) => string;
export declare const menuSubTriggerClass: (inset?: boolean, className?: string) => string;
export declare const menuItemClass: (variant: "default" | "destructive", inset?: boolean, className?: string) => string;
/** Checkbox and radio items: room on the start side for the indicator. */
export declare const menuIndicatorItemClass: (className?: string) => string;
export declare const menuIndicatorSlotClass = "zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center";
export declare const menuLabelClass: (inset?: boolean, className?: string) => string;
export declare const menuSeparatorClass: (className?: string) => string;
export declare const menuShortcutClass: (className?: string) => string;
export declare const CheckIcon: () => import("react").JSX.Element;
export declare const DotIcon: () => import("react").JSX.Element;
export declare const ChevronRightIcon: () => import("react").JSX.Element;
//# sourceMappingURL=menu-parts.d.ts.map
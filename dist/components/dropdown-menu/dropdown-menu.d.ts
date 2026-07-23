import { type JSX } from "solid-js";
import { type DropdownMenuRootProps } from "@kobalte/core/dropdown-menu";
/**
 * DropdownMenu — Solid port built on Kobalte DropdownMenu.
 *
 * Action-menu primitive (kebab menus, user menus, context-style menus).
 * NOT a form-input replacement — for that use <Select>.
 *
 *   <DropdownMenu>
 *     <DropdownMenuTrigger as={Button}>Options</DropdownMenuTrigger>
 *     <DropdownMenuContent align="end">
 *       <DropdownMenuLabel>My account</DropdownMenuLabel>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuItem onSelect={…}>Profile</DropdownMenuItem>
 *       <DropdownMenuItem variant="destructive" onSelect={signOut}>Sign out</DropdownMenuItem>
 *
 *       <DropdownMenuCheckboxItem checked={x()} onChange={setX}>Show toolbar</DropdownMenuCheckboxItem>
 *
 *       <DropdownMenuRadioGroup value={r()} onChange={setR}>
 *         <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
 *         <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
 *       </DropdownMenuRadioGroup>
 *
 *       <DropdownMenuSub>
 *         <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
 *         <DropdownMenuSubContent>…</DropdownMenuSubContent>
 *       </DropdownMenuSub>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
 */
export declare const DropdownMenuTrigger: typeof import("@kobalte/core/dropdown-menu").Trigger;
export declare const DropdownMenuGroup: typeof import("@kobalte/core/dropdown-menu").Group;
export declare const DropdownMenuPortal: typeof import("@kobalte/core/dropdown-menu").Portal;
export declare const DropdownMenuSub: typeof import("@kobalte/core/dropdown-menu").Sub;
export declare const DropdownMenuRadioGroup: typeof import("@kobalte/core/dropdown-menu").RadioGroup;
/** Mirrors React/Radix's `align` on DropdownMenuContent. */
export type DropdownMenuAlign = "start" | "center" | "end";
/**
 * Root. Forwards every Kobalte root prop; an explicit `placement`/`gutter` wins over
 * the one derived from Content's `align`/`sideOffset`.
 */
export declare const DropdownMenu: (props: DropdownMenuRootProps) => JSX.Element;
export type DropdownMenuContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
    /** Alignment against the trigger. Mirrors React/Radix. Default "start". */
    align?: DropdownMenuAlign;
    /** Gap in px between trigger and menu. Mirrors React/Radix. Default 4. */
    sideOffset?: number;
};
export declare const DropdownMenuContent: (props: DropdownMenuContentProps) => JSX.Element;
export type DropdownMenuSubTriggerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
    inset?: boolean;
};
export declare const DropdownMenuSubTrigger: (props: DropdownMenuSubTriggerProps) => JSX.Element;
export type DropdownMenuSubContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const DropdownMenuSubContent: (props: DropdownMenuSubContentProps) => JSX.Element;
export type DropdownMenuItemProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children" | "onSelect"> & {
    class?: string;
    children?: JSX.Element;
    inset?: boolean;
    variant?: "default" | "destructive";
    disabled?: boolean;
    onSelect?: () => void;
};
export declare const DropdownMenuItem: (props: DropdownMenuItemProps) => JSX.Element;
export type DropdownMenuCheckboxItemProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children" | "onChange" | "onSelect"> & {
    class?: string;
    children?: JSX.Element;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    onSelect?: () => void;
    disabled?: boolean;
};
export declare const DropdownMenuCheckboxItem: (props: DropdownMenuCheckboxItemProps) => JSX.Element;
export type DropdownMenuRadioItemProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children" | "onSelect"> & {
    class?: string;
    children?: JSX.Element;
    value: string;
    onSelect?: () => void;
    disabled?: boolean;
};
export declare const DropdownMenuRadioItem: (props: DropdownMenuRadioItemProps) => JSX.Element;
export type DropdownMenuLabelProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
    inset?: boolean;
};
export declare const DropdownMenuLabel: (props: DropdownMenuLabelProps) => JSX.Element;
export type DropdownMenuSeparatorProps = Omit<JSX.HTMLAttributes<HTMLHRElement>, "class"> & {
    class?: string;
};
export declare const DropdownMenuSeparator: (props: DropdownMenuSeparatorProps) => JSX.Element;
export type DropdownMenuShortcutProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const DropdownMenuShortcut: (props: DropdownMenuShortcutProps) => JSX.Element;
//# sourceMappingURL=dropdown-menu.d.ts.map
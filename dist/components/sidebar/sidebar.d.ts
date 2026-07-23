import { type JSX, type Accessor, type ComponentProps, type ValidComponent } from "solid-js";
import type { PolymorphicProps } from "../../lib/polymorphic";
/**
 * Sidebar — collapsible navigation shell. A lightweight, context-driven app
 * sidebar: provider holds the open/collapsed state, the parts compose the
 * header / scrollable content / grouped menu / footer. Collapsing shrinks the
 * rail to an icon-only strip.
 *
 *   <SidebarProvider>
 *     <Sidebar>
 *       <SidebarHeader>…</SidebarHeader>
 *       <SidebarContent>
 *         <SidebarGroup>
 *           <SidebarGroupLabel>Main</SidebarGroupLabel>
 *           <SidebarMenu>
 *             <SidebarMenuItem>
 *               <SidebarMenuButton active as={A} href="/">
 *                 <HomeIcon/><span>Home</span>
 *               </SidebarMenuButton>
 *             </SidebarMenuItem>
 *           </SidebarMenu>
 *         </SidebarGroup>
 *       </SidebarContent>
 *     </Sidebar>
 *     <main>
 *       <SidebarTrigger /> …
 *     </main>
 *   </SidebarProvider>
 *
 * Solid port of the React binding. Two deliberate translations:
 *  - React's `asChild` (Radix `Slot`) becomes `as` — this binding's house
 *    polymorphism idiom, shared with Button/Badge. Solid has no Slot: props
 *    can't be cloned onto an already-created element.
 *  - Context values that are reactive (`collapsed`) are exposed as accessors,
 *    since Solid can't re-render consumers on a plain value change.
 */
interface SidebarContextValue {
    collapsed: Accessor<boolean>;
    setCollapsed: (v: boolean) => void;
    toggle: () => void;
}
export declare function useSidebar(): SidebarContextValue;
export interface SidebarProviderProps {
    children?: JSX.Element;
    /** uncontrolled initial collapsed state (default false) */
    defaultCollapsed?: boolean;
    /** controlled collapsed state */
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
}
export declare function SidebarProvider(props: SidebarProviderProps): JSX.Element;
export declare const Sidebar: (props: ComponentProps<"aside">) => JSX.Element;
export declare const SidebarHeader: (props: ComponentProps<"div">) => JSX.Element;
export declare const SidebarContent: (props: ComponentProps<"div">) => JSX.Element;
export declare const SidebarFooter: (props: ComponentProps<"div">) => JSX.Element;
export declare const SidebarGroup: (props: ComponentProps<"div">) => JSX.Element;
export declare const SidebarGroupLabel: (props: ComponentProps<"div">) => JSX.Element;
export declare const SidebarMenu: (props: ComponentProps<"ul">) => JSX.Element;
export declare const SidebarMenuItem: (props: ComponentProps<"li">) => JSX.Element;
type SidebarMenuButtonOwnProps = {
    /** render as the current / selected item */
    active?: boolean;
    class?: string;
    children?: JSX.Element;
};
export type SidebarMenuButtonProps<T extends ValidComponent = "button"> = PolymorphicProps<T, SidebarMenuButtonOwnProps>;
export declare const SidebarMenuButton: <T extends ValidComponent = "button">(rawProps: SidebarMenuButtonProps<T>) => JSX.Element;
export type SidebarMenuSubProps = {
    /** The parent row's label. Doubles as the flyout heading when collapsed. */
    label: JSX.Element;
    icon?: JSX.Element;
    /** uncontrolled initial expanded state (default false) */
    defaultOpen?: boolean;
    /** controlled expanded state */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** mark the parent row as holding the current item */
    active?: boolean;
    children?: JSX.Element;
    class?: string;
};
/**
 * A nav row that owns a nested list, and the reason this component exists at
 * all: an icon-only rail has nowhere to put children, so when the sidebar is
 * collapsed the SAME children re-host into a flyout Popover anchored to the
 * icon. Caller writes the tree once and both modes work.
 *
 *   <SidebarMenuItem>
 *     <SidebarMenuSub label="Reports" icon={<ChartIcon />}>
 *       <SidebarMenuSubItem>
 *         <SidebarMenuSubButton as={A} href="/reports/sales" active>
 *           Sales
 *         </SidebarMenuSubButton>
 *       </SidebarMenuSubItem>
 *     </SidebarMenuSub>
 *   </SidebarMenuItem>
 *
 * Mirrors the React binding. Note both diverge from shadcn, where
 * `SidebarMenuSub` is only the <ul>.
 */
export declare const SidebarMenuSub: (rawProps: SidebarMenuSubProps) => JSX.Element;
export declare const SidebarMenuSubItem: (props: ComponentProps<"li">) => JSX.Element;
type SidebarMenuSubButtonOwnProps = {
    /** render as the current / selected item */
    active?: boolean;
    class?: string;
    children?: JSX.Element;
};
export type SidebarMenuSubButtonProps<T extends ValidComponent = "button"> = PolymorphicProps<T, SidebarMenuSubButtonOwnProps>;
export declare const SidebarMenuSubButton: <T extends ValidComponent = "button">(rawProps: SidebarMenuSubButtonProps<T>) => JSX.Element;
type SidebarTriggerOwnProps = {
    class?: string;
    children?: JSX.Element;
};
export type SidebarTriggerProps<T extends ValidComponent = "button"> = PolymorphicProps<T, SidebarTriggerOwnProps>;
export declare const SidebarTrigger: <T extends ValidComponent = "button">(rawProps: SidebarTriggerProps<T>) => JSX.Element;
export {};
//# sourceMappingURL=sidebar.d.ts.map
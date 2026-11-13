import * as React from "react";
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
 *               <SidebarMenuButton active asChild>
 *                 <Link to="/"><HomeIcon/><span>Home</span></Link>
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
 * Three ways to collapse, all from SidebarProvider:
 *  - `collapseMode="icon"` (the default): shrink to an icon rail.
 *  - `collapseMode="hidden"`: hide it entirely, for a menu with no icons.
 *  - `overlay` (`true`, or `{ below: 900 }` for when its container is narrower
 *    than that): it starts closed and opens OVER the content, and closes on
 *    Esc, a click outside it, or following a link in it.
 */
interface SidebarContextValue {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
    toggle: () => void;
    /** Drawn as an icon rail: collapsed, in the icon mode, not as an overlay. What the parts style by. */
    rail: boolean;
    collapseMode: "icon" | "hidden";
    /** The sidebar is an overlay right now (always, or because its container is narrow). */
    overlayActive: boolean;
    setOverlayActive: (v: boolean) => void;
    overlay: boolean | {
        below: number;
    } | undefined;
}
export declare function useSidebar(): SidebarContextValue;
export interface SidebarProviderProps {
    children: React.ReactNode;
    /** uncontrolled initial collapsed state (default false) */
    defaultCollapsed?: boolean;
    /** controlled collapsed state */
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    /**
     * What collapsing does: shrink to an icon rail (`"icon"`, the default), or
     * hide the sidebar entirely (`"hidden"`), for a menu without icons. A hidden
     * sidebar is inert: nothing in it can take focus.
     */
    collapseMode?: "icon" | "hidden";
    /**
     * Open over the content instead of beside it: `true` always, or
     * `{ below: 900 }` while the sidebar's container is narrower than 900px.
     * As an overlay it starts closed, takes focus when opened, and closes on
     * Esc, a click outside it, or following a link inside it.
     */
    overlay?: boolean | {
        below: number;
    };
}
export declare function SidebarProvider({ children, defaultCollapsed, collapsed: collapsedProp, onCollapsedChange, collapseMode, overlay, }: SidebarProviderProps): React.JSX.Element;
export declare const Sidebar: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, "ref"> & React.RefAttributes<HTMLElement>>;
export declare const SidebarHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
/** The app or workspace name in SidebarHeader; on the icon rail it is read, not shown. */
export declare const SidebarHeaderLabel: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
/**
 * A count or status beside a menu row's label ("Accounts 29"), aligned at the
 * row's end. On the icon rail it is read with the label, not shown.
 */
export declare const SidebarMenuBadge: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
export declare const SidebarContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarGroupLabel: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarMenu: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>, "ref"> & React.RefAttributes<HTMLUListElement>>;
export declare const SidebarMenuItem: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "ref"> & React.RefAttributes<HTMLLIElement>>;
export interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    /** render as the current / selected item */
    active?: boolean;
}
export declare const SidebarMenuButton: React.ForwardRefExoticComponent<SidebarMenuButtonProps & React.RefAttributes<HTMLButtonElement>>;
export interface SidebarMenuSubProps {
    /** The parent row's label. Doubles as the flyout heading when collapsed. */
    label: React.ReactNode;
    icon?: React.ReactNode;
    /** uncontrolled initial expanded state (default false) */
    defaultOpen?: boolean;
    /** controlled expanded state */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** mark the parent row as holding the current item */
    active?: boolean;
    /** A count or status at the row's end ("29"), before the chevron. */
    badge?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}
/**
 * A nav row that owns a nested list, and the reason this component exists at
 * all: an icon-only rail has nowhere to put children, so when the sidebar is
 * collapsed the SAME children re-host into a flyout Popover anchored to the
 * icon. Caller writes the tree once and both modes work.
 *
 *   <SidebarMenuItem>
 *     <SidebarMenuSub label="Reports" icon={<ChartIcon />}>
 *       <SidebarMenuSubItem>
 *         <SidebarMenuSubButton asChild active>
 *           <Link to="/reports/sales">Sales</Link>
 *         </SidebarMenuSubButton>
 *       </SidebarMenuSubItem>
 *     </SidebarMenuSub>
 *   </SidebarMenuItem>
 *
 * Note this diverges from shadcn, where `SidebarMenuSub` is only the <ul>.
 */
export declare function SidebarMenuSub({ label, icon, defaultOpen, open: openProp, onOpenChange, active, badge, children, className, }: SidebarMenuSubProps): React.JSX.Element;
export declare const SidebarMenuSubItem: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "ref"> & React.RefAttributes<HTMLLIElement>>;
export interface SidebarMenuSubButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    /** render as the current / selected item */
    active?: boolean;
}
export declare const SidebarMenuSubButton: React.ForwardRefExoticComponent<SidebarMenuSubButtonProps & React.RefAttributes<HTMLButtonElement>>;
/**
 * A heading inside a group's list: "Transactions", "Pricing". Text, not a
 * row: it is not focusable, and `role="presentation"` keeps it out of the
 * list's item count, so a screen reader still hears "list, 7 items" for seven
 * links. It renders in the inline list and in the rail's flyout alike.
 *
 *   <SidebarMenuSub label="Selling">
 *     <SidebarMenuSubLabel>Transactions</SidebarMenuSubLabel>
 *     <SidebarMenuSubItem>…</SidebarMenuSubItem>
 *   </SidebarMenuSub>
 */
export declare const SidebarMenuSubLabel: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "ref"> & React.RefAttributes<HTMLLIElement>>;
export interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}
export declare const SidebarTrigger: React.ForwardRefExoticComponent<SidebarTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export {};
//# sourceMappingURL=sidebar.d.ts.map
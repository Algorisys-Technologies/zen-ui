import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { Popover, PopoverTrigger, PopoverContent } from "../popover/popover";

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
 */

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a <SidebarProvider>");
  return ctx;
}

export interface SidebarProviderProps {
  children: React.ReactNode;
  /** uncontrolled initial collapsed state (default false) */
  defaultCollapsed?: boolean;
  /** controlled collapsed state */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
}: SidebarProviderProps) {
  const [internal, setInternal] = React.useState(defaultCollapsed);
  const isControlled = collapsedProp !== undefined;
  const collapsed = isControlled ? collapsedProp : internal;

  const setCollapsed = React.useCallback(
    (v: boolean) => {
      if (!isControlled) setInternal(v);
      onCollapsedChange?.(v);
    },
    [isControlled, onCollapsedChange],
  );

  const value = React.useMemo<SidebarContextValue>(
    () => ({ collapsed, setCollapsed, toggle: () => setCollapsed(!collapsed) }),
    [collapsed, setCollapsed],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export const Sidebar = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"aside">
>(({ className, ...props }, ref) => {
  const { collapsed } = useSidebar();
  return (
    <aside
      ref={ref}
      data-collapsed={collapsed || undefined}
      className={cn(
        "zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width] zen-duration-200 zen-ease-in-out",
        collapsed ? "zen-w-16" : "zen-w-64",
        className,
      )}
      {...props}
    />
  );
});
Sidebar.displayName = "Sidebar";

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("zen-flex zen-items-center zen-gap-2 zen-p-3", className)}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-1 zen-overflow-y-auto zen-p-2", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("zen-mt-auto zen-flex zen-items-center zen-gap-2 zen-border-t zen-border-zen-border zen-p-3", className)}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("zen-flex zen-flex-col zen-gap-1 zen-py-2", className)} {...props} />
));
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { collapsed } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "zen-px-3 zen-py-1 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg",
        collapsed && "zen-sr-only",
        className,
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<"ul">
>(({ className, ...props }, ref) => (
  // The list reset is the component's own job: zen-ui ships no element reset
  // (it is opt-in via /preflight), so without this the browser default
  // `list-style: disc` + `padding-inline-start: 40px` apply. That 40px ate the
  // collapsed rail — 64px wide, less 16px of padding, less 40px, left 8px of
  // room for a 16px icon.
  <ul
    ref={ref}
    className={cn("zen-m-0 zen-flex zen-w-full zen-list-none zen-flex-col zen-gap-0.5 zen-p-0", className)}
    {...props}
  />
));
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("zen-w-full", className)} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  /** render as the current / selected item */
  active?: boolean;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, asChild = false, active = false, ...props }, ref) => {
  const { collapsed } = useSidebar();
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-active={active || undefined}
      className={cn(
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-2 zen-text-sm zen-font-medium zen-transition-colors",
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
        active && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
        // sr-only, not hidden: `display: none` drops the label out of the
        // accessibility tree, which left a collapsed rail as a column of
        // buttons with no accessible name at all. Matches SidebarGroupLabel.
        collapsed && "zen-relative zen-justify-center zen-px-0 [&>span]:zen-sr-only",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

const SUB_LIST_CLASS =
  // Every side is set explicitly: `zen-m-0`/`zen-p-0` plus a directional
  // `zen-ml-4` are the same specificity, so which one wins would come down to
  // UnoCSS's emit order rather than intent.
  "zen-mb-0 zen-ml-4 zen-mr-0 zen-mt-0.5 zen-flex zen-list-none zen-flex-col zen-gap-0.5 zen-border-0 zen-border-l zen-border-solid zen-border-zen-border zen-pb-0 zen-pl-3 zen-pr-0 zen-pt-0";

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={cn("zen-ml-auto zen-transition-transform", open && "zen-rotate-90")}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

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
export function SidebarMenuSub({
  label,
  icon,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  active = false,
  children,
  className,
}: SidebarMenuSubProps) {
  const { collapsed } = useSidebar();
  const [internal, setInternal] = React.useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internal;

  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!isControlled) setInternal(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange],
  );

  // Collapsing while a row is expanded would otherwise reopen it mid-flight as
  // a flyout, because both modes read the same `open`.
  React.useEffect(() => {
    if (collapsed) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  if (collapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* No chevron here: there is no room on a 48px rail, and as a bare
              <svg> it would survive the collapsed label rule and read as a
              second icon. */}
          <SidebarMenuButton active={active} className={className}>
            {icon}
            <span>{label}</span>
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="zen-w-56 zen-p-2">
          <div className="zen-px-2 zen-pb-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg">
            {label}
          </div>
          <ul className={cn(SUB_LIST_CLASS, "zen-ml-0 zen-border-l-0 zen-pl-0")}>{children}</ul>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <>
      <SidebarMenuButton
        active={active}
        className={className}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {icon}
        <span>{label}</span>
        <Chevron open={open} />
      </SidebarMenuButton>
      {open ? <ul className={SUB_LIST_CLASS}>{children}</ul> : null}
    </>
  );
}

export const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("zen-w-full", className)} {...props} />
));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

export interface SidebarMenuSubButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  /** render as the current / selected item */
  active?: boolean;
}

export const SidebarMenuSubButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuSubButtonProps
>(({ className, asChild = false, active = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-active={active || undefined}
      className={cn(
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-1.5 zen-text-sm zen-no-underline zen-transition-colors",
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
        active
          ? "zen-bg-zen-primary-soft zen-font-medium zen-text-zen-primary-soft-fg"
          : "zen-text-zen-foreground",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  SidebarTriggerProps
>(({ className, asChild = false, onClick, children, ...props }, ref) => {
  const { toggle } = useSidebar();
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      aria-label="Toggle sidebar"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        toggle();
      }}
      className={cn(
        "zen-inline-flex zen-h-9 zen-w-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        className,
      )}
      {...props}
    >
      {children ?? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      )}
    </Comp>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

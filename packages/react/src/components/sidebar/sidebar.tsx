import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { Popover, PopoverTrigger, PopoverContent } from "../popover/popover";
import { useLocale } from "../locale/locale";

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
  overlay: boolean | { below: number } | undefined;
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
  overlay?: boolean | { below: number };
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  collapseMode = "icon",
  overlay,
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

  const [overlayActive, setOverlayActive] = React.useState(false);
  // Normalised so an inline `overlay={{ below: 900 }}` (a new object every
  // render) does not hand every consumer a new context value each time.
  const below = typeof overlay === "object" ? overlay.below : undefined;
  const always = overlay === true;
  const overlayValue = React.useMemo(
    () => (always ? true : below !== undefined ? { below } : undefined),
    [always, below],
  );

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      toggle: () => setCollapsed(!collapsed),
      rail: collapsed && collapseMode === "icon" && !overlayActive,
      collapseMode,
      overlayActive,
      setOverlayActive,
      overlay: overlayValue,
    }),
    [collapsed, setCollapsed, collapseMode, overlayActive, overlayValue],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export const Sidebar = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"aside">
>(({ className, ...props }, ref) => {
  const { collapsed, setCollapsed, collapseMode, overlay: overlayOption, overlayActive, setOverlayActive } =
    useSidebar();
  const asideRef = React.useRef<HTMLElement | null>(null);
  const setRefs = React.useCallback(
    (el: HTMLElement | null) => {
      asideRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );

  // Overlay below a width: measured on the sidebar's container, not the
  // window, so a sidebar in a narrow region (or a demo frame) behaves as it
  // would on a narrow screen. A layout effect, so the first paint is already
  // the right layout rather than a full sidebar that then closes.
  const below = typeof overlayOption === "object" ? overlayOption.below : undefined;
  const [narrow, setNarrow] = React.useState(false);
  React.useLayoutEffect(() => {
    const parent = asideRef.current?.parentElement;
    if (!parent || below === undefined) {
      setNarrow(false);
      return;
    }
    const measure = () => setNarrow(parent.clientWidth < below);
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    measure();
    return () => ro.disconnect();
  }, [below]);
  const overlay = overlayOption === true || narrow;

  // Entering overlay mode closes it: it is opened when wanted, not left over
  // the content because the window narrowed. Leaving it restores the state it
  // had before, so widening the window brings the full sidebar back. The ref
  // guard makes this run on a CHANGE of mode only, not on every collapse.
  const wasOverlay = React.useRef(false);
  const beforeOverlay = React.useRef(false);
  React.useLayoutEffect(() => {
    if (overlay === wasOverlay.current) return;
    wasOverlay.current = overlay;
    setOverlayActive(overlay);
    if (overlay) {
      beforeOverlay.current = collapsed;
      setCollapsed(true);
    } else {
      setCollapsed(beforeOverlay.current);
    }
  }, [overlay, collapsed, setCollapsed, setOverlayActive]);

  const hidden = collapsed && (collapseMode === "hidden" || overlay);
  // `overlayActive` too: it is set in the same pass that closes a sidebar
  // entering overlay mode, so the one render in between (overlay, not yet
  // closed) does not count as open and steal focus.
  const open = overlay && overlayActive && !collapsed;

  // Read through a ref by the effect below, so a new onCollapsedChange from
  // the caller does not re-run it (and re-capture where focus returns to).
  const setCollapsedRef = React.useRef(setCollapsed);
  React.useLayoutEffect(() => {
    setCollapsedRef.current = setCollapsed;
  });

  // An open overlay: Esc and a click outside close it, as does following a
  // link in it; it takes focus when it opens and gives it back when it closes.
  React.useEffect(() => {
    const el = asideRef.current;
    if (!open || !el) return;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const close = (restoreFocus: boolean) => {
      setCollapsedRef.current(true);
      if (restoreFocus && el.contains(document.activeElement)) returnTo?.focus({ preventScroll: true });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) close(true);
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Element;
      if (el.contains(t) || t.closest?.("[data-sidebar-trigger]")) return;
      close(false);
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest?.("a[href]")) close(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer, true);
    el.addEventListener("click", onClick);
    const frame = requestAnimationFrame(() => {
      if (!el.contains(document.activeElement)) {
        el.querySelector<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')?.focus({ preventScroll: true });
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer, true);
      el.removeEventListener("click", onClick);
    };
  }, [open]);

  return (
    <aside
      ref={setRefs}
      data-collapsed={collapsed || undefined}
      data-overlay={overlay ? "" : undefined}
      inert={hidden || undefined}
      className={cn(
        "zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width] zen-duration-200 zen-ease-in-out",
        overlay
          ? // Overlay: a full-width panel whose negative end margin cancels its
            // own width, so it takes no room in the row and the content that
            // follows starts where it does, underneath it. The same element
            // and children as the in-flow layout (unlike Solid's wrapper
            // panel), so crossing the breakpoint does not remount the menu.
            cn("zen-relative zen-z-30 zen-w-64 zen-shrink-0 -zen-me-64 zen-shadow-lg", hidden && "zen-invisible")
          : hidden
            ? "zen-w-0 zen-overflow-hidden zen-border-r-0"
            : collapsed
              ? "zen-w-16"
              : "zen-w-64",
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
>(({ className, ...props }, ref) => {
  const { rail } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "zen-flex zen-items-center zen-gap-2 zen-p-3",
        // On the rail the header stacks (the toggle over a logo) and its text
        // goes to screen readers only, as the menu's labels do. Text left
        // visible spilled out of the 64px rail over the page.
        rail && "zen-flex-col zen-px-0 [&>span]:zen-sr-only [&>strong]:zen-sr-only",
        className,
      )}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

/** The app or workspace name in SidebarHeader; on the icon rail it is read, not shown. */
export const SidebarHeaderLabel = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { rail } = useSidebar();
  return (
    <span
      ref={ref}
      className={cn("zen-min-w-0 zen-truncate zen-font-semibold", rail && "zen-sr-only", className)}
      {...props}
    />
  );
});
SidebarHeaderLabel.displayName = "SidebarHeaderLabel";

/**
 * A count or status beside a menu row's label ("Accounts 29"), aligned at the
 * row's end. On the icon rail it is read with the label, not shown.
 */
export const SidebarMenuBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-sidebar-badge=""
    className={cn(
      "zen-ml-auto zen-min-w-5 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1.5 zen-text-center zen-text-xs zen-font-medium zen-tabular-nums zen-text-zen-muted-fg",
      className,
    )}
    {...props}
  />
));
SidebarMenuBadge.displayName = "SidebarMenuBadge";

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
  const { rail: collapsed } = useSidebar();
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
  const { rail: collapsed } = useSidebar();
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-active={active || undefined}
      className={cn(
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-2 zen-text-sm zen-font-medium zen-no-underline zen-transition-colors",
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
        // As a link (asChild <a>) it would otherwise take the browser's
        // underline and link blue: zen-ui ships no element reset.
        // SidebarMenuSubButton has always set both.
        active ? "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground",
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

const Chevron = ({ open, after }: { open: boolean; after?: boolean }) => (
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
    className={cn(after ? "zen-ml-1" : "zen-ml-auto", "zen-transition-transform", open && "zen-rotate-90")}
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
export function SidebarMenuSub({
  label,
  icon,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  active = false,
  badge,
  children,
  className,
}: SidebarMenuSubProps) {
  const { rail: collapsed } = useSidebar();
  const hasBadge = badge !== undefined;
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
          <div
            className={cn(
              "zen-px-2 zen-pb-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
              // Only with a badge, so a heading without one renders as before.
              hasBadge && "zen-flex zen-items-center zen-gap-2",
            )}
          >
            {label}
            {hasBadge ? <SidebarMenuBadge>{badge}</SidebarMenuBadge> : null}
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
        {hasBadge ? <SidebarMenuBadge>{badge}</SidebarMenuBadge> : null}
        <Chevron open={open} after={hasBadge} />
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
  const loc = useLocale();
  const { toggle } = useSidebar();
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      aria-label={loc.t("sidebar.toggleSidebar")}
      // An open overlay closes on a pointerdown outside it; the toggle is
      // exempt, so pressing it closes the overlay once (its own click) rather
      // than closing it and then toggling it straight back open.
      data-sidebar-trigger=""
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

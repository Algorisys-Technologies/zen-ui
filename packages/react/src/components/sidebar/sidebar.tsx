import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { afterTransition, afterWidthTransition } from "@algorisys/zen-ui-core/sidebar";
import { cn } from "../../lib/cn";
import { Popover, PopoverAnchor, PopoverContent } from "../popover/popover";
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

/** Every collapse transition runs on the same clock, so nothing finishes early and pops. */
const MOTION = "zen-duration-[var(--zen-sidebar-duration)] zen-ease-[var(--zen-sidebar-ease)]";

/**
 * Only while the sidebar is collapsed or moving (`data-collapsed`,
 * `data-transitioning` on the aside) do its parts keep to one line and clip:
 * a row that wraps would change height as the width moved. Expanded and at
 * rest they lay out as they always have, labels wrapping and nothing clipped.
 */
const COMPACT =
  "[[data-collapsed]_&]:zen-overflow-hidden [[data-collapsed]_&]:zen-whitespace-nowrap [[data-transitioning]_&]:zen-overflow-hidden [[data-transitioning]_&]:zen-whitespace-nowrap";

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

  // Collapsing or expanding, until the width has arrived. Meanwhile the aside
  // clips and its rows keep to one line (COMPACT), so nothing spills over the
  // page or changes height mid-move; at rest an expanded sidebar lays out
  // exactly as it always has. The cancel lives in a ref, not an effect
  // cleanup, so a re-run for another reason cannot strand it at true.
  const [transitioning, setTransitioning] = React.useState(false);
  const prevCollapsed = React.useRef(collapsed);
  const cancelMove = React.useRef<(() => void) | undefined>(undefined);
  React.useLayoutEffect(() => {
    if (prevCollapsed.current === collapsed) return;
    prevCollapsed.current = collapsed;
    cancelMove.current?.();
    const el = asideRef.current;
    if (!el || overlay) {
      setTransitioning(false);
      return;
    }
    setTransitioning(true);
    cancelMove.current = afterWidthTransition(el, () => setTransitioning(false));
  }, [collapsed, overlay]);
  React.useEffect(() => () => cancelMove.current?.(), []);

  // The overlay's slide is switched on only after it has been painted closed.
  // Becoming an overlay takes several layout-effect passes (measure, then
  // close), after the in-flow style has already been computed, so with the
  // transition present from the start the panel visibly slid shut on page
  // load. A plain effect is not late enough: React flushes it before the
  // pass that closes the panel. Two frames are.
  const [slide, setSlide] = React.useState(false);
  React.useEffect(() => {
    if (!overlay) {
      setSlide(false);
      return;
    }
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setSlide(true));
    });
    return () => cancelAnimationFrame(id);
  }, [overlay]);

  return (
    <aside
      ref={setRefs}
      data-collapsed={collapsed || undefined}
      data-transitioning={transitioning || undefined}
      data-overlay={overlay ? "" : undefined}
      inert={hidden || undefined}
      className={cn(
        // Only the width animates, and everything inside is laid out so it
        // does not have to: rows keep their place and the aside clips
        // whatever no longer fits. It used to restyle every row on the first
        // frame while the width was still 256px, which threw each icon 100px
        // to the right and back, and on expand drew full labels over the page
        // from a 64px rail.
        "zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width]",
        MOTION,
        !overlay && (collapsed || transitioning) && "zen-overflow-hidden",
        overlay
          ? // Overlay: a full-width panel whose negative end margin cancels its
            // own width, so it takes no room in the row and the content that
            // follows starts where it does, underneath it. The same element
            // and children as the in-flow layout (unlike Solid's wrapper
            // panel), so crossing the breakpoint does not remount the menu.
            cn(
              "zen-relative zen-z-30 zen-w-64 zen-shrink-0 -zen-me-64 zen-shadow-lg",
              // It slides in from its edge on the sidebar's clock rather than
              // appearing. Visibility is transitioned only on the way out, so
              // the panel stays drawn until the slide has finished. On the way
              // in it must not be: a transition's first frame holds its start
              // value, so the panel was still hidden when focus moved into it,
              // and the focus went nowhere.
              hidden && "zen-invisible -zen-translate-x-full rtl:zen-translate-x-full",
              slide ? (hidden ? "zen-transition-[transform,visibility]" : "zen-transition-transform") : "zen-transition-none",
            )
          : hidden
            ? "zen-w-0 zen-border-r-0"
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
        // The header stays a row on the rail: its inline padding grows just
        // enough to centre the 36px toggle, and its text fades and is
        // clipped. It used to restack into a column on the first frame, which
        // moved the toggle you had just clicked 100px out from under the
        // pointer. Faded, not sr-only, so the name is still read.
        "zen-flex zen-items-center zen-gap-2 zen-py-3 zen-transition-[padding]",
        "[&>span]:zen-transition-opacity [&>strong]:zen-transition-opacity",
        MOTION,
        "[&>span]:zen-duration-[var(--zen-sidebar-duration)] [&>strong]:zen-duration-[var(--zen-sidebar-duration)]",
        COMPACT,
        rail ? "zen-px-3.5 [&>span]:zen-opacity-0 [&>strong]:zen-opacity-0" : "zen-px-3",
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
      className={cn(
        "zen-min-w-0 zen-truncate zen-font-semibold zen-transition-opacity",
        MOTION,
        rail && "zen-opacity-0",
        className,
      )}
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
>(({ className, ...props }, ref) => {
  const { rail } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "zen-mt-auto zen-flex zen-items-center zen-gap-2 zen-border-t zen-border-zen-border zen-py-3 zen-transition-[padding]",
        MOTION,
        COMPACT,
        // On the rail its inset matches the content's, which is what centres
        // a menu row's icon there; expanded it keeps its 12px.
        rail ? "zen-px-2" : "zen-px-3",
        className,
      )}
      {...props}
    />
  );
});
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
        "zen-px-3 zen-py-1 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg zen-transition-[margin,opacity]",
        MOTION,
        COMPACT,
        // On the rail it folds away: a negative top margin of its own height
        // plus the group's gap, eased, so the rows below glide up with the
        // width instead of jumping 24px on the first frame (shadcn folds it
        // the same way). The height is the type token's line height plus its
        // padding, so a theme's line height carries through. Faded, not
        // sr-only, so the group is still named.
        collapsed &&
          "-zen-mt-[calc(var(--zen-line-height-xs)+var(--zen-space-2)+var(--zen-space-1))] zen-opacity-0",
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
        "zen-relative zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-py-2 zen-text-sm zen-font-medium zen-no-underline zen-transition-[color,background-color,padding]",
        MOTION,
        COMPACT,
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
        "[&>span]:zen-min-w-0 [[data-collapsed]_&>span]:zen-truncate [[data-transitioning]_&>span]:zen-truncate",
        "[&>span]:zen-transition-opacity [&>span]:zen-duration-[var(--zen-sidebar-duration)] [&>span]:zen-ease-[var(--zen-sidebar-ease)]",
        // As a link (asChild <a>) it would otherwise take the browser's
        // underline and link blue: zen-ui ships no element reset.
        // SidebarMenuSubButton has always set both.
        active ? "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground",
        // On the rail the icon is centred by padding that eases over — the
        // content's 8px inset plus 16px puts a 16px icon dead centre of the
        // 64px rail — not by `justify-center` flipping on the first frame,
        // which threw it 100px right while the rail was still wide. The label
        // stays in the row, truncated and faded, and the rail clips it: it
        // shrinks with the width instead of vanishing at t=0. Faded, not
        // hidden, so the row keeps its accessible name.
        collapsed ? "zen-px-4 [&>span]:zen-opacity-0" : "zen-px-3",
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
  "zen-mb-0 zen-ml-4 zen-mr-0 zen-mt-0.5 zen-flex zen-list-none zen-flex-col zen-gap-0.5 zen-pb-0 zen-pl-3 zen-pr-0 zen-pt-0";

// The inline list's guide line, from tokens (tokens.css, "the nested list's
// guide line"). Each side is set on its own for the reason above.
const SUB_LIST_GUIDE_CLASS =
  "zen-border-solid zen-border-y-0 zen-border-r-0 zen-border-l-[length:var(--zen-sidebar-guide-width)] zen-border-l-[color:var(--zen-sidebar-guide)]";

// The flyout has no guide, so it has no mark either, whatever the app set.
const SUB_LIST_FLYOUT_CLASS = "zen-ml-0 zen-border-0 zen-pl-0 [--zen-sidebar-guide-current:transparent]";

const Chevron = ({ open, after, faded }: { open: boolean; after?: boolean; faded?: boolean }) => (
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
    className={cn(
      after ? "zen-ml-1" : "zen-ml-auto",
      "zen-transition-[transform,opacity]",
      MOTION,
      open && "zen-rotate-90",
      // On the rail it would read as a second icon.
      faded && "zen-opacity-0",
    )}
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

  // The rail's flyout is this row's own state, apart from `open` (the inline
  // expansion, which the owner may control). Sharing them made collapsing
  // close the row through onOpenChange, so an app that keeps its groups' open
  // state recorded a close the user never made, and the group the current
  // page lives in came back shut on expanding. Collapsing or expanding closes
  // only the flyout.
  const [flyout, setFlyout] = React.useState(false);
  React.useEffect(() => {
    setFlyout(false);
  }, [collapsed]);

  // ONE row for both modes, with the flyout anchored to it, rather than a
  // different row per mode: swapping rows remounted this one on every
  // collapse, so it snapped to its rail position while every other row eased
  // there.
  const rowRef = React.useRef<HTMLButtonElement>(null);
  // A pointerdown outside an open flyout closes it, and this row is outside
  // it, so the click that follows would reopen it. Read the state at the
  // pointerdown, and also note a close made during that pointerdown's
  // dispatch (until the next macrotask), whichever listener heard it first.
  const openAtPointerDown = React.useRef<boolean | null>(null);
  const closedThisPointerDown = React.useRef(false);
  const onFlyoutOpenChange = (v: boolean) => {
    if (!v) {
      closedThisPointerDown.current = true;
      setTimeout(() => (closedThisPointerDown.current = false));
    }
    setFlyout(v);
  };

  // The inline list is mounted only while it is open or closing: it mounts at
  // 0fr and eases to 1fr a frame later, and closing eases back before it
  // unmounts, so the rows below glide instead of jumping and a closed list
  // leaves nothing in the page.
  const inline = open && !collapsed;
  const [listMounted, setListMounted] = React.useState(inline);
  const [listOpen, setListOpen] = React.useState(inline);
  const disclosureRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (inline) {
      setListMounted(true);
      const frame = requestAnimationFrame(() => {
        void disclosureRef.current?.offsetHeight;
        setListOpen(true);
      });
      return () => cancelAnimationFrame(frame);
    }
    setListOpen(false);
    const el = disclosureRef.current;
    if (!el) {
      setListMounted(false);
      return undefined;
    }
    return afterTransition(el, "grid-template-rows", () => setListMounted(false));
  }, [inline]);

  return (
    <Popover open={collapsed && flyout} onOpenChange={onFlyoutOpenChange}>
      <PopoverAnchor asChild>
        <SidebarMenuButton
          ref={rowRef}
          active={active}
          className={className}
          aria-expanded={collapsed ? flyout : open}
          aria-haspopup={collapsed ? "dialog" : undefined}
          onPointerDown={() => {
            openAtPointerDown.current = collapsed ? flyout || closedThisPointerDown.current : open;
          }}
          onClick={() => {
            if (collapsed) setFlyout(!(openAtPointerDown.current ?? flyout));
            else setOpen(!(openAtPointerDown.current ?? open));
            openAtPointerDown.current = null;
          }}
        >
          {icon}
          <span>{label}</span>
          {hasBadge ? <SidebarMenuBadge>{badge}</SidebarMenuBadge> : null}
          <Chevron open={open && !collapsed} after={hasBadge} faded={collapsed} />
        </SidebarMenuButton>
      </PopoverAnchor>
      {listMounted ? (
        <div
          ref={disclosureRef}
          inert={!listOpen || undefined}
          className={cn(
            "zen-grid zen-transition-[grid-template-rows,margin]",
            MOTION,
            // The list's own top margin moves out here, or a closed track
            // would still hold it open by 2px.
            listOpen ? "zen-mt-0.5 zen-grid-rows-[1fr]" : "zen-mt-0 zen-grid-rows-[0fr]",
          )}
        >
          {/* The clip for the height animation sits on this wrapper, not on
              the list: the guide is the list's border, and a clip on the
              list would cut the current-row mark drawn on top of it. */}
          <div className="zen-min-h-0 zen-overflow-hidden">
            <ul data-sidebar="menu-sub" className={cn(SUB_LIST_CLASS, SUB_LIST_GUIDE_CLASS, "zen-mt-0")}>
              {collapsed && flyout ? null : children}
            </ul>
          </div>
        </div>
      ) : null}
      <PopoverContent
        side="right"
        align="start"
        className="zen-w-56 zen-p-2"
        onCloseAutoFocus={(e) => {
          // With no Popover trigger there is nothing for Radix to return
          // focus to; give it back to the row unless it has moved elsewhere.
          e.preventDefault();
          queueMicrotask(() => {
            if (!document.activeElement || document.activeElement === document.body) {
              rowRef.current?.focus({ preventScroll: true });
            }
          });
        }}
      >
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
        <ul className={cn(SUB_LIST_CLASS, SUB_LIST_FLYOUT_CLASS)}>{children}</ul>
      </PopoverContent>
    </Popover>
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
        // One line while the sidebar is collapsed or moving: wrapped, a
        // sub-row grew taller as a closing sidebar narrowed and pushed every
        // row below it down mid-animation.
        COMPACT,
        "[[data-collapsed]_&>span]:zen-truncate [[data-transitioning]_&>span]:zen-truncate",
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
        active
          ? "zen-bg-zen-primary-soft zen-font-medium zen-text-zen-primary-soft-fg"
          : "zen-text-zen-foreground",
        // The current-row mark: a bar centred on the list's guide line, level
        // with this row. Invisible until --zen-sidebar-guide-current is given
        // a colour. The row starts the list's padding (zen-pl-3) right of the
        // guide, and half the guide's width further on.
        active &&
          "zen-relative before:zen-pointer-events-none before:zen-absolute before:zen-inset-y-1 before:-zen-left-3 before:zen-w-[var(--zen-sidebar-guide-current-width)] before:zen-translate-x-[calc(-50%-var(--zen-sidebar-guide-width)/2)] before:zen-rounded-full before:zen-bg-[var(--zen-sidebar-guide-current)] before:zen-content-empty",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

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
export const SidebarMenuSubLabel = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    role="presentation"
    data-sidebar="menu-sub-label"
    className={cn(
      "zen-w-full zen-px-3 zen-pb-0.5 zen-pt-2 zen-text-xs zen-font-semibold zen-text-zen-muted-fg first:zen-pt-1",
      COMPACT,
      "[[data-collapsed]_&]:zen-truncate [[data-transitioning]_&]:zen-truncate",
      className,
    )}
    {...props}
  />
));
SidebarMenuSubLabel.displayName = "SidebarMenuSubLabel";

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
        // Never squeezed by the header's clipped text on the rail.
        "zen-inline-flex zen-h-9 zen-w-9 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
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

import * as React from "react";
import { createPortal } from "react-dom";
import { Slot } from "@radix-ui/react-slot";
import {
  SIDEBAR_MENU_BUTTON_ATTR,
  afterWidthTransition,
  sidebarRailTooltip,
  watchSidebarScrollbar,
  type SidebarCollapseMode,
} from "@algorisys/zen-ui-core/sidebar";
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
 * Four ways to collapse, all from SidebarProvider:
 *  - `collapseMode="icon"` (the default): shrink to an icon rail.
 *  - `collapseMode="labelled"`: shrink to a wider rail that keeps a short
 *    label under each icon.
 *  - `collapseMode="hidden"`: hide it entirely, for a menu with no icons.
 *  - `overlay` (`true`, or `{ below: 900 }` for when its container is narrower
 *    than that): it starts closed and opens OVER the content, and closes on
 *    Esc, a click outside it, or following a link in it.
 */

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
  /** Drawn as a rail: collapsed, in the icon or labelled mode, not as an overlay. What the parts style by. */
  rail: boolean;
  collapseMode: SidebarCollapseMode;
  /** The sidebar is an overlay right now (always, or because its container is narrow). */
  overlayActive: boolean;
  setOverlayActive: (v: boolean) => void;
  overlay: boolean | { below: number } | undefined;
  /**
   * The rail the parts are LAID OUT for, which can trail `rail`: collapsing
   * into the labelled rail keeps the rows as rows until the width has
   * arrived, then turns them into tiles. Everywhere else it equals `rail`.
   */
  railLayout: "icon" | "labelled" | null;
  setRailLayout: (v: "icon" | "labelled" | null) => void;
  /** The Sidebar's id, so SidebarTrigger can say which element it controls. */
  sidebarId: string;
  setSidebarId: (id: string | undefined) => void;
}

/** The rail the parts are laid out for right now, if any. */
const railOf = (ctx: SidebarContextValue): "icon" | "labelled" | null => ctx.railLayout;

// The whole sidebar is one scroller: a single thin scrollbar runs its full
// height, the header and footer stick to its ends, and every section sits in
// the same client width, so on a rail they all centre on one axis. The rail
// widens by the scrollbar's measured width (--zen-sidebar-gutter,
// watchSidebarScrollbar) rather than letting it eat into the tiles.
const SCROLLER = "zen-overflow-x-hidden zen-overflow-y-auto zen-[scrollbar-width:thin] zen-[scrollbar-color:var(--zen-color-border)_transparent]";

/** Every collapse transition runs on the same clock, so nothing finishes early and pops. */
const MOTION = "zen-duration-[var(--zen-sidebar-duration)] zen-ease-[var(--zen-sidebar-ease)]";

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
   * What collapsing does: shrink to an icon rail (`"icon"`, the default),
   * shrink to a rail that keeps a short label under each icon
   * (`"labelled"`), or hide the sidebar entirely (`"hidden"`), for a menu
   * without icons. A hidden sidebar is inert: nothing in it can take focus.
   */
  collapseMode?: SidebarCollapseMode;
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

  const generatedId = `zen-sidebar-${React.useId()}`;
  const [customId, setSidebarId] = React.useState<string | undefined>();
  const sidebarId = customId ?? generatedId;
  const [railLayout, setRailLayout] = React.useState<"icon" | "labelled" | null>(() =>
    collapsed && collapseMode !== "hidden" ? (collapseMode === "labelled" ? "labelled" : "icon") : null,
  );

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      toggle: () => setCollapsed(!collapsed),
      rail: collapsed && collapseMode !== "hidden" && !overlayActive,
      collapseMode,
      overlayActive,
      setOverlayActive,
      overlay: overlayValue,
      railLayout,
      setRailLayout,
      sidebarId,
      setSidebarId,
    }),
    [collapsed, setCollapsed, collapseMode, overlayActive, overlayValue, railLayout, sidebarId],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export const Sidebar = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"aside">
>(({ className, id, ...props }, ref) => {
  const ctx = useSidebar();
  const { collapsed, setCollapsed, collapseMode, overlay: overlayOption, overlayActive, setOverlayActive, setSidebarId } =
    ctx;
  // A caller's id wins; otherwise the provider's, which SidebarTrigger already points at.
  React.useLayoutEffect(() => {
    setSidebarId(id);
  }, [id, setSidebarId]);
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

  React.useEffect(() => (asideRef.current ? watchSidebarScrollbar(asideRef.current) : undefined), []);

  // Collapsing into the labelled rail is sequenced: the width moves with the
  // rows still laid out as rows (truncating, as the icon rail's do), and only
  // once it has arrived do they become tiles. Switching the layout at once
  // made the menu finish on the first frame while the width spent the whole
  // duration catching up. Expanding, and the icon rail, switch at once.
  const railNow = ctx.rail;
  const prevRailNow = React.useRef<boolean | null>(null);
  React.useLayoutEffect(() => {
    const was = prevRailNow.current;
    prevRailNow.current = railNow;
    const target = railNow ? (collapseMode === "labelled" ? "labelled" : "icon") : null;
    const el = asideRef.current;
    if (target === "labelled" && was === false && el && !overlay) {
      return afterWidthTransition(el, () => ctx.setRailLayout("labelled"));
    }
    ctx.setRailLayout(target);
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on a change of rail or mode, not of the context object
  }, [railNow, collapseMode]);

  // The rail's tooltip: one for the whole sidebar, positioned beside the row
  // under the pointer or keyboard focus. One element rather than a Tooltip
  // per row, so a 40-row menu mounts one popup instead of forty, and the
  // rows stay plain buttons/links whatever `asChild` renders. It repeats the
  // row's name, which the row already has, so it is hidden from assistive
  // tech rather than announced twice.
  const rail = railOf(ctx);
  const [tip, setTip] = React.useState<{ text: string; x: number; y: number; rtl: boolean } | null>(null);
  // The listeners are attached once; they read the current rail through this.
  const railRef = React.useRef(rail);
  React.useLayoutEffect(() => {
    railRef.current = rail;
    setTip(null);
  }, [rail]);
  React.useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    const rowAt = (t: EventTarget | null) => {
      if (!railRef.current || !(t instanceof Element)) return null;
      const row = t.closest<HTMLElement>(`[${SIDEBAR_MENU_BUTTON_ATTR}]`);
      return row && el.contains(row) ? row : null;
    };
    const show = (row: HTMLElement | null) => {
      const text = row && railRef.current ? sidebarRailTooltip(row, railRef.current) : null;
      if (!row || !text) return setTip(null);
      const r = row.getBoundingClientRect();
      const rtl = getComputedStyle(row).direction === "rtl";
      setTip({ text, x: rtl ? r.left : r.right, y: r.top + r.height / 2, rtl });
    };
    const hide = () => setTip(null);
    const onOver = (e: Event) => show(rowAt(e.target));
    const onFocus = (e: Event) => {
      const row = rowAt(e.target);
      if (row?.matches(":focus-visible")) show(row);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    el.addEventListener("pointerover", onOver);
    el.addEventListener("pointerleave", hide);
    el.addEventListener("focusin", onFocus);
    el.addEventListener("focusout", hide);
    el.addEventListener("click", hide);
    el.addEventListener("scroll", hide, true);
    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("pointerover", onOver);
      el.removeEventListener("pointerleave", hide);
      el.removeEventListener("focusin", onFocus);
      el.removeEventListener("focusout", hide);
      el.removeEventListener("click", hide);
      el.removeEventListener("scroll", hide, true);
      el.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
    <aside
      ref={setRefs}
      id={ctx.sidebarId}
      data-collapsed={collapsed || undefined}
      data-overlay={overlay ? "" : undefined}
      data-rail={rail ?? undefined}
      inert={hidden || undefined}
      className={cn(
        // Only the width animates, and everything inside is laid out so it
        // does not have to: rows keep their place and the aside clips
        // whatever no longer fits. It used to restyle every row on the first
        // frame while the width was still 256px, which threw each icon 100px
        // to the right and back, and on expand drew full labels over the page
        // from a 64px rail.
        "zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width]",
        SCROLLER,
        MOTION,
        // The labelled rail's own clock; every part inside reads it.
        // Collapsing is two half-clock steps, so it ends when the others do.
        collapseMode === "labelled" &&
          (collapsed
            ? "zen-[--zen-sidebar-duration:var(--zen-sidebar-labelled-step-duration)]"
            : "zen-[--zen-sidebar-duration:var(--zen-sidebar-labelled-duration)]"),
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
            : !collapsed
              ? "zen-w-[var(--zen-sidebar-width)]"
              : collapseMode === "labelled"
                ? "zen-w-[calc(var(--zen-sidebar-rail-labelled-width)+var(--zen-sidebar-gutter,0px))]"
                : "zen-w-[calc(var(--zen-sidebar-rail-width)+var(--zen-sidebar-gutter,0px))]",
        className,
      )}
      {...props}
    />
    {tip
      ? createPortal(
          <div
            aria-hidden="true"
            data-sidebar-tooltip=""
            className={cn(
              "zen-pointer-events-none zen-fixed zen-z-50 zen-whitespace-nowrap zen-rounded-zen-md zen-bg-zen-neutral zen-px-2.5 zen-py-1.5 zen-text-xs zen-text-zen-neutral-fg zen-shadow-md zen-anim-fade-in -zen-translate-y-1/2",
              tip.rtl ? "-zen-ml-2 -zen-translate-x-full" : "zen-ml-2",
            )}
            style={{ left: tip.x, top: tip.y }}
          >
            {tip.text}
          </div>,
          document.body,
        )
      : null}
    </>
  );
});
Sidebar.displayName = "Sidebar";

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const rail = railOf(useSidebar());
  return (
    <div
      ref={ref}
      className={cn(
        // The header stays a row on the rail: its inline padding grows just
        // enough to centre the 36px toggle, and its text fades and is
        // clipped. It used to restack into a column on the first frame, which
        // moved the toggle you had just clicked 100px out from under the
        // pointer. Faded, not sr-only, so the name is still read.
        // Stuck to the top of the scrolling sidebar, so the toggle never
        // scrolls out of reach.
        "zen-sticky zen-top-0 zen-z-10 zen-flex zen-shrink-0 zen-items-center zen-gap-2 zen-overflow-hidden zen-whitespace-nowrap zen-bg-zen-background zen-py-3 zen-transition-[padding]",
        "[&>span]:zen-transition-opacity [&>strong]:zen-transition-opacity",
        MOTION,
        "[&>span]:zen-duration-[var(--zen-sidebar-duration)] [&>strong]:zen-duration-[var(--zen-sidebar-duration)]",
        rail === "icon" ? "zen-px-3.5" : rail === "labelled" ? "zen-px-5.5" : "zen-px-3",
        rail && "[&>span]:zen-opacity-0 [&>strong]:zen-opacity-0",
        className,
      )}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

/** The app or workspace name in SidebarHeader; on a rail it is read, not shown. */
export const SidebarHeaderLabel = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { rail } = useSidebar();
  return (
    <span
      ref={ref}
      className={cn(
        // Alone in the header (no toggle before it), it starts where the
        // menu's icons do rather than 8px left of them.
        "zen-min-w-0 zen-truncate zen-font-semibold zen-transition-opacity first:zen-ps-2",
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
>(({ className, ...props }, ref) => {
  const rail = railOf(useSidebar());
  return (
    <span
      ref={ref}
      data-sidebar-badge=""
      className={cn(
        "zen-ml-auto zen-min-w-5 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1.5 zen-text-center zen-text-xs zen-font-medium zen-tabular-nums zen-text-zen-muted-fg",
        // On the labelled rail the count is a small tab on the icon's top
        // corner, starting at the icon's edge so it never covers the glyph;
        // on the icon rail it fades with the label.
        rail === "labelled" &&
          "zen-absolute zen-top-0 zen-start-[calc(var(--zen-sidebar-rail-labelled-width)/2+var(--zen-space-1))] zen-min-w-4 zen-px-1 zen-anim-sidebar-label-rail",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuBadge.displayName = "SidebarMenuBadge";

/**
 * A group heading by where it is drawn:
 * - icon rail: it folds away — its row track goes to 0fr, so the rows below
 *   glide up with the width instead of jumping 24px on the first frame.
 *   Faded, not sr-only, so the group is still named.
 * - labelled rail: it stays, as a centred caption over the group's hairline,
 *   truncated to the rail and sized by the rail's final width, so it
 *   fades in where it will rest instead of riding the shrinking group.
 */
function groupLabelClass(rail: "icon" | "labelled" | null, labelledMode: boolean, moved: boolean) {
  return cn(
    rail === "icon"
      ? "zen-grid-rows-[0fr] zen-px-3 zen-py-0 zen-opacity-0"
      : rail === "labelled"
        ? "zen-grid-rows-[1fr] zen-px-0 zen-py-1 zen-text-center [&>span]:zen-w-[calc(var(--zen-sidebar-rail-labelled-width)-var(--zen-space-2))]"
        : "zen-grid-rows-[1fr] zen-px-3 zen-py-1",
    moved && rail === "labelled" && "[&>span]:zen-anim-sidebar-label-rail",
    moved && labelledMode && !rail && "[&>span]:zen-anim-sidebar-label-row",
  );
}

/** Inline inset of the content and footer: narrower on the labelled rail so a label has room under its icon. */
const insetX = (rail: "icon" | "labelled" | null) => (rail === "labelled" ? "zen-px-1" : "zen-px-2");

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const rail = railOf(useSidebar());
  return (
    <div
      ref={ref}
      className={cn(
        // Grows to push the footer to the bottom; it does not scroll itself —
        // the sidebar does, so one scrollbar spans the whole height.
        "zen-flex zen-flex-1 zen-flex-col zen-gap-1 zen-py-2 zen-transition-[padding]",
        MOTION,
        insetX(rail),
        className,
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const rail = railOf(useSidebar());
  return (
    <div
      ref={ref}
      className={cn(
        // Inset as SidebarContent is, so a menu row in the footer lines its
        // icon up with the rows above (it sat 4px further in at p-3) and fits
        // the rail.
        // Stuck to the bottom of the scrolling sidebar, over the menu.
        "zen-sticky zen-bottom-0 zen-z-10 zen-mt-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2 zen-overflow-hidden zen-border-t zen-border-zen-border zen-bg-zen-background zen-py-2 zen-transition-[padding]",
        MOTION,
        insetX(rail),
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
>(({ className, ...props }, ref) => {
  const rail = railOf(useSidebar());
  return (
    <div
      ref={ref}
      className={cn(
        "zen-flex zen-flex-col zen-gap-1 zen-py-2",
        // The labelled rail has no room for a heading, so groups are told
        // apart by a hairline instead. A shadow, not a border, so it takes no
        // layout and nothing below it moves when it appears.
        rail === "labelled" && "zen-shadow-[0_-1px_0_var(--zen-color-border)] first:zen-shadow-none",
        className,
      )}
      {...props}
    />
  );
});
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const ctx = useSidebar();
  const rail = railOf(ctx);
  // As SidebarMenuButton's label: fades only once the rail has moved.
  const [prevRail, setPrevRail] = React.useState(rail);
  const [moved, setMoved] = React.useState(false);
  if (prevRail !== rail) {
    setPrevRail(rail);
    setMoved(true);
  }
  return (
    <div
      ref={ref}
      className={cn(
        "zen-grid zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg zen-transition-[grid-template-rows,opacity,padding]",
        MOTION,
        groupLabelClass(rail, ctx.collapseMode === "labelled", moved),
        className,
      )}
      {...props}
    >
      <span className="zen-min-h-0 zen-truncate">{children}</span>
    </div>
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

/**
 * A menu row's classes, by where it is drawn. The geometry is what makes
 * collapsing smooth, so it is worth stating:
 *
 * - The icon never re-centres. It sits at content inset + row inset from the
 *   edge, and each rail width in tokens.css is derived from those insets, so
 *   on the rail the icon is centred by padding that eases over, not by
 *   `justify-center` flipping on the first frame (which threw it 100px right
 *   while the rail was still wide, then slid it back).
 * - On the icon rail the label stays in the row, truncated and faded, and
 *   the rail clips it; it shrinks with the width instead of vanishing at t=0.
 *   Faded, not sr-only, so the row keeps its accessible name.
 * - On the labelled rail the label moves under the icon. That changes its
 *   position scheme, which no transition can carry, so it fades in over the
 *   move on the sidebar's clock, as the icon rail's labels do. It is placed
 *   by the rail's final geometry (a fixed start and a width derived from the
 *   rail width), not centred in the row, so it fades in under the icon
 *   rather than riding the shrinking row 90px across. The count badge is
 *   anchored the same way. The highlight covers
 *   the whole tile, label included, with the same rounded-zen-md box as
 *   every other row: not a Material pill around the icon alone, which
 *   understated the click target and left the label outside its own mark.
 *
 * The label is `[&>span:not([data-sidebar-badge])]`, spelled out in every
 * class below rather than interpolated: UnoCSS extracts classes from the
 * source text, so a `${...}:zen-truncate` template generates no CSS at all.
 */
function menuButtonClass(o: {
  active: boolean;
  rail: "icon" | "labelled" | null;
  labelledMode: boolean;
  moved: boolean;
}) {
  return cn(
    "zen-relative zen-flex zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden zen-whitespace-nowrap zen-rounded-zen-md zen-text-sm zen-font-medium zen-no-underline",
    "zen-transition-[color,background-color,padding]",
    MOTION,
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
    "[&>svg]:zen-my-0.5 [&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
    "[&>span:not([data-sidebar-badge])]:zen-min-w-0 [&>span:not([data-sidebar-badge])]:zen-truncate",
    "[&>span]:zen-transition-opacity [&>span]:zen-duration-[var(--zen-sidebar-duration)] [&>span]:zen-ease-[var(--zen-sidebar-ease)]",
    // Labelled tile, 50px: 6px, the icon's 20px line, 2px, a 16px label, 6px.
    // The icon's top (8px) is the same as an expanded row's, so it only
    // slides sideways.
    o.rail === "labelled" ? "zen-px-7 zen-pb-6 zen-pt-1.5" : o.rail === "icon" ? "zen-px-4 zen-py-2" : "zen-px-3 zen-py-2",
    o.rail === "icon" && "[&>span]:zen-opacity-0",
    o.rail === "labelled" &&
      "[&>span:not([data-sidebar-badge])]:zen-absolute [&>span:not([data-sidebar-badge])]:zen-start-1 [&>span:not([data-sidebar-badge])]:zen-w-[calc(var(--zen-sidebar-rail-labelled-width)-var(--zen-space-4))] [&>span:not([data-sidebar-badge])]:zen-bottom-1.5 [&>span:not([data-sidebar-badge])]:zen-text-center [&>span:not([data-sidebar-badge])]:zen-text-xs",
    o.moved && o.rail === "labelled" && "[&>span:not([data-sidebar-badge])]:zen-anim-sidebar-label-rail",
    o.moved && o.labelledMode && !o.rail && "[&>span:not([data-sidebar-badge])]:zen-anim-sidebar-label-row",
    // As a link (asChild <a>) it would otherwise take the browser's
    // underline and link blue: zen-ui ships no element reset.
    // SidebarMenuSubButton has always set both.
    o.active ? "zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground",
    // The highlight is the row's own background, so on the labelled rail it
    // is the whole tile — icon and label, exactly the area that is clickable —
    // and it shrinks into that tile with the row rather than being redrawn.
    o.active ? "zen-bg-zen-primary-soft" : "hover:zen-bg-zen-muted",
  );
}

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
  const ctx = useSidebar();
  const rail = railOf(ctx);
  const Comp = asChild ? Slot : "button";
  // The labelled label only fades once the rail has actually moved — never
  // on first paint, which would hide a sidebar's labels behind an animation.
  // Derived during render (React's "adjust state on a prop change" pattern)
  // so the fade class lands in the same commit as the move; an effect would
  // paint one frame of the label in its new place first.
  const [prevRail, setPrevRail] = React.useState(rail);
  const [moved, setMoved] = React.useState(false);
  if (prevRail !== rail) {
    setPrevRail(rail);
    setMoved(true);
  }
  return (
    <Comp
      ref={ref}
      data-active={active || undefined}
      {...{ [SIDEBAR_MENU_BUTTON_ATTR]: "" }}
      aria-current={active ? "page" : undefined}
      className={cn(
        menuButtonClass({ active, rail, labelledMode: ctx.collapseMode === "labelled", moved }),
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
      // On a rail it would read as a second icon.
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
  const { rail } = useSidebar();
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
    if (rail) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rail]);

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
    setOpen(v);
  };

  return (
    <Popover open={rail && open} onOpenChange={onFlyoutOpenChange}>
      <PopoverAnchor asChild>
        <SidebarMenuButton
          ref={rowRef}
          active={active}
          className={className}
          // `active` here means "holds the current item", not "is the page".
          aria-current={undefined}
          aria-expanded={open}
          aria-haspopup={rail ? "dialog" : undefined}
          onPointerDown={() => {
            openAtPointerDown.current = open || closedThisPointerDown.current;
          }}
          onClick={() => {
            setOpen(!(openAtPointerDown.current ?? open));
            openAtPointerDown.current = null;
          }}
        >
          {icon}
          <span>{label}</span>
          {hasBadge ? <SidebarMenuBadge>{badge}</SidebarMenuBadge> : null}
          <Chevron open={open && !rail} after={hasBadge} faded={rail} />
        </SidebarMenuButton>
      </PopoverAnchor>
      {/* The inline list opens and closes on the sidebar's clock: its row
          track eases between 0fr and 1fr, so the rows below glide instead of
          jumping. Closed it is inert, so its links cannot take focus. While
          the flyout is open the items render there instead. */}
      <div
        inert={!(open && !rail) || undefined}
        className={cn(
          "zen-grid zen-transition-[grid-template-rows,margin]",
          MOTION,
          // The list's own top margin moves out here, or a closed track
          // would still hold it open by 2px.
          open && !rail ? "zen-mt-0.5 zen-grid-rows-[1fr]" : "zen-mt-0 zen-grid-rows-[0fr]",
        )}
      >
        <ul className={cn(SUB_LIST_CLASS, "zen-mt-0 zen-min-h-0 zen-overflow-hidden")}>
          {rail && open ? null : children}
        </ul>
      </div>
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
        <ul className={cn(SUB_LIST_CLASS, "zen-ml-0 zen-border-l-0 zen-pl-0")}>{children}</ul>
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
      aria-current={active ? "page" : undefined}
      className={cn(
        // One line, as the rows above are (shadcn truncates both): wrapped,
        // a sub-row grew taller as a closing sidebar narrowed and pushed every
        // row below it down mid-animation.
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden zen-whitespace-nowrap zen-rounded-zen-md zen-px-3 zen-py-1.5 zen-text-sm zen-no-underline zen-transition-colors [&>span]:zen-truncate",
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
  const { toggle, collapsed, sidebarId } = useSidebar();
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      aria-label={loc.t("sidebar.toggleSidebar")}
      aria-expanded={!collapsed}
      aria-controls={sidebarId}
      // An open overlay closes on a pointerdown outside it; the toggle is
      // exempt, so pressing it closes the overlay once (its own click) rather
      // than closing it and then toggling it straight back open.
      data-sidebar-trigger=""
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        toggle();
      }}
      className={cn(
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

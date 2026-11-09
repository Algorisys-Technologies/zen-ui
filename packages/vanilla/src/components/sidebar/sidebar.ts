import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { styled } from "../../lib/styled";
import {
  SIDEBAR_MENU_BUTTON_ATTR,
  sidebarRailTooltip,
  watchSidebarScrollbar,
  type SidebarCollapseMode,
} from "@algorisys/zen-ui-core/sidebar";
import { useLocale } from "../locale/locale";
import { Popover } from "../popover/popover";

/**
 * Sidebar — the vanilla port of the React reference: a collapsible navigation
 * shell. `SidebarProvider` holds the open/collapsed state; the parts compose the
 * header / scrollable content / grouped menu / footer. Collapsing shrinks the rail
 * to an icon-only strip.
 *
 *   const shell = SidebarProvider({
 *     children: (ctx) => {
 *       const layout = document.createElement("div");
 *       layout.style.display = "flex";
 *       layout.append(
 *         Sidebar({ sidebar: ctx, children: [
 *           SidebarHeader({ sidebar: ctx, children: [SidebarTrigger({ sidebar: ctx }), strong("Acme")] }),
 *           SidebarContent({ children: SidebarGroup({ children: [
 *             SidebarGroupLabel({ sidebar: ctx, children: "Main" }),
 *             SidebarMenu({ children: SidebarMenuItem({ children:
 *               SidebarMenuButton({ sidebar: ctx, active: true, children: [icon, span("Home")] }),
 *             }) }),
 *           ] }) }),
 *         ] }).el,
 *         page,
 *       );
 *       return layout;
 *     },
 *   });
 *   document.body.append(shell.el);
 *
 * ## Why a context object rather than React context
 *
 * React threads the collapsed state to every part through `SidebarContext`, so a
 * button deep in the tree reads `collapsed` without being handed anything. With no
 * framework there is no tree walk and no context lookup. PORTING.md's answer for a
 * compound component is an explicit context object passed to the sub-parts, so
 * that is what `SidebarProvider` returns on `handle.context` — and every part that
 * cares about collapse (`Sidebar`, `SidebarGroupLabel`, `SidebarHeaderLabel`, `SidebarMenuButton`,
 * `SidebarMenuSub`, `SidebarTrigger`) takes it as a required `sidebar` prop, and
 * `SidebarHeader` as an optional one (it took none before). A part
 * subscribes to the context and repaints its own collapse-dependent classes; that
 * targeted DOM write is what React's re-render did.
 *
 * Ownership follows the caller, exactly as it does in React: the caller composes
 * the tree and holds the part handles, so unmounting means `destroy()`-ing them.
 * The provider owns only the state.
 *
 * Four ways to collapse, all from SidebarProvider:
 *  - `collapseMode: "icon"` (the default): shrink to an icon rail.
 *  - `collapseMode: "labelled"`: shrink to a wider rail that keeps a short
 *    label under each icon.
 *  - `collapseMode: "hidden"`: hide it entirely, for a menu with no icons.
 *
 * The parts that take no context (`SidebarContent`, `SidebarFooter`,
 * `SidebarGroup`, `SidebarMenuBadge`) style the labelled rail from the
 * aside's `data-rail` attribute instead, so they need no `sidebar` prop.
 *  - `overlay` (`true`, or `{ below: 900 }` for when its container is narrower
 *    than that): it starts closed and opens OVER the content, and closes on
 *    Esc, a click outside it, or following a link in it.
 *
 * ## State vocabulary
 *
 * `data-collapsed` on the rail, `data-active` on the current item — React's
 * vocabulary. See PORTING.md.
 */

export interface SidebarContextValue {
  /** True when the sidebar is collapsed: a rail, hidden, or a closed overlay. */
  readonly collapsed: boolean;
  setCollapsed(v: boolean): void;
  toggle(): void;
  /**
   * Drawn as a rail: collapsed, in the icon or labelled mode, not as an
   * overlay. What the parts style by; in the default mode it is exactly
   * `collapsed`.
   */
  readonly rail: boolean;
  readonly collapseMode: SidebarCollapseMode;
  /** The sidebar is an overlay right now (always, or because its container is narrow). */
  readonly overlayActive: boolean;
  setOverlayActive(v: boolean): void;
  readonly overlay: boolean | { below: number } | undefined;
  /** The Sidebar's id, so SidebarTrigger can say which element it controls. */
  readonly sidebarId: string;
  /** A caller's own id for the Sidebar; `undefined` goes back to the generated one. */
  setSidebarId(id: string | undefined): void;
  /**
   * Run `fn` whenever the sidebar's state changes — `collapsed`, and also
   * `rail`, `collapseMode`, `overlay` and `overlayActive`. Returns an unsubscribe.
   */
  subscribe(fn: (collapsed: boolean) => void): () => void;
}

export interface SidebarProviderProps {
  /** Builds the tree, given the context to hand to the parts that need it. */
  children?: (ctx: SidebarContextValue) => Child;
  /** Uncontrolled initial collapsed state. Default false. */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state. Present -> the caller owns it. */
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

export interface SidebarProviderHandle extends ZenComponent<SidebarProviderProps> {
  /** The collapse state to hand to `Sidebar`, `SidebarMenuButton`, … as `sidebar`. */
  readonly context: SidebarContextValue;
}

function requireCtx(ctx: SidebarContextValue | undefined, name: string): SidebarContextValue {
  if (!ctx) throw new Error(`${name} requires a \`sidebar\` context from SidebarProvider`);
  return ctx;
}

const collapseModeOf = (p: SidebarProviderProps): SidebarCollapseMode => p.collapseMode ?? "icon";

/** The rail being drawn right now, if any. */
const railOf = (ctx: SidebarContextValue | undefined): "icon" | "labelled" | null =>
  ctx?.rail ? (ctx.collapseMode === "labelled" ? "labelled" : "icon") : null;

/** Every collapse transition runs on the same clock, so nothing finishes early and pops. */
const MOTION = "zen-duration-[var(--zen-sidebar-duration)] zen-ease-[var(--zen-sidebar-ease)]";

let sidebarSeq = 0;

/** Compared by value: a web component re-parses its JSON `overlay` attribute on every update. */
const sameOverlay = (a: SidebarProviderProps["overlay"], b: SidebarProviderProps["overlay"]): boolean =>
  typeof a === "object" && typeof b === "object" ? a.below === b.below : a === b;

export function SidebarProvider(props: SidebarProviderProps = {}): SidebarProviderHandle {
  let current: SidebarProviderProps = { ...props };

  const state = controllable<boolean>({
    value: current.collapsed,
    defaultValue: current.defaultCollapsed ?? false,
    onChange: (o) => current.onCollapsedChange?.(o),
  });

  // One notification for every change the parts render by. Each subscriber
  // repaints idempotently, so a change that leaves `collapsed` alone (the
  // overlay switching on) still reaches them.
  const subs = new Set<(collapsed: boolean) => void>();
  const emit = () => {
    for (const fn of [...subs]) fn(state.get());
  };
  state.subscribe(emit);

  let overlayActive = false;
  const generatedId = `zen-sidebar-${++sidebarSeq}`;
  let customId: string | undefined;

  const context: SidebarContextValue = {
    get collapsed() {
      return state.get();
    },
    setCollapsed(v) {
      state.set(v);
    },
    toggle() {
      state.set(!state.get());
    },
    get rail() {
      return state.get() && collapseModeOf(current) !== "hidden" && !overlayActive;
    },
    get collapseMode() {
      return collapseModeOf(current);
    },
    get overlayActive() {
      return overlayActive;
    },
    setOverlayActive(v) {
      if (v === overlayActive) return;
      overlayActive = v;
      emit();
    },
    get overlay() {
      return current.overlay;
    },
    get sidebarId() {
      return customId ?? generatedId;
    },
    setSidebarId(id) {
      if (id === customId) return;
      customId = id;
      emit();
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };

  // `display: contents` so the provider adds no box of its own — it mirrors
  // React's context-only provider, which renders its children with no wrapper.
  const el = document.createElement("div");
  el.style.display = "contents";
  if (current.children) el.replaceChildren(...toNodes(current.children(context)));

  return {
    el,
    context,
    update(next) {
      const prev = current;
      current = { ...current, ...next };
      if (next.collapsed !== undefined) state.sync(next.collapsed);
      if (next.children) el.replaceChildren(...toNodes(next.children(context)));
      if (collapseModeOf(prev) !== collapseModeOf(current) || !sameOverlay(prev.overlay, current.overlay)) emit();
    },
    destroy() {
      el.remove();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* The rail                                                                   */
/* -------------------------------------------------------------------------- */

export interface SidebarProps extends BaseProps {
  sidebar: SidebarContextValue;
}

// Only the width animates, and everything inside is laid out so it does not
// have to: rows keep their place and the aside clips whatever no longer fits.
// It used to restyle every row on the first frame while the width was still
// 256px, which threw each icon 100px to the right and back, and on expand
// drew full labels over the page from a 64px rail.
//
// The whole sidebar is one scroller: a single thin scrollbar runs its full
// height, the header and footer stick to its ends, and every section sits in
// the same client width, so on a rail they all centre on one axis. The rail
// widens by the scrollbar's measured width (--zen-sidebar-gutter,
// watchSidebarScrollbar) rather than letting it eat into the tiles.
const SIDEBAR_BASE =
  "zen-overflow-x-hidden zen-overflow-y-auto zen-[scrollbar-width:thin] zen-[scrollbar-color:var(--zen-color-border)_transparent] zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width] zen-duration-[var(--zen-sidebar-duration)] zen-ease-[var(--zen-sidebar-ease)]";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Collapsed-or-not before the overlay took over, per provider, so a widening
 * restores it. Kept by context rather than by Sidebar instance: a provider that
 * rebuilds its children replaces the instance mid-overlay.
 */
const beforeOverlay = new WeakMap<SidebarContextValue, boolean>();

export function Sidebar(props: SidebarProps): ZenComponent<SidebarProps> {
  const ctx = requireCtx(props.sidebar, "Sidebar"); // i18n-ignore (a component name in a developer error)
  let current = { ...props };
  const el = document.createElement("aside");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  // Overlay below a width: measured on the sidebar's CONTAINER, not the window,
  // so a sidebar in a narrow region (or a demo frame) behaves as it would on a
  // narrow screen. The factory runs before the caller has put `el` anywhere, so
  // the aside observes itself too: its first notification comes once it is laid
  // out, which is when there is a parent to measure. Notifications arrive after
  // layout and before paint, so the first frame drawn is already the right one.
  //
  // A sidebar built against a context that is already an overlay (the provider
  // rebuilt its children: a web component does on every attribute change)
  // starts as one, so it neither reopens nor forgets what to restore.
  let narrow = typeof ctx.overlay === "object" && ctx.overlayActive;
  let watched: Element | null = null;
  // Once connected and then taken out of the document, this instance is stale:
  // its replacement owns the context now, and a detached parent measures 0px.
  let attached = false;
  const stale = () => attached && !el.isConnected;
  const measureNarrow = () => {
    const o = ctx.overlay;
    // The nearest ancestor with a box: a `display: contents` wrapper (a web
    // component's host, a provider) has none, and measures 0px wide.
    let parent = el.parentElement;
    while (parent && getComputedStyle(parent).display === "contents") parent = parent.parentElement;
    if (parent !== watched) {
      if (watched) ro.unobserve(watched);
      watched = parent;
      if (parent) ro.observe(parent);
    }
    narrow = typeof o === "object" && !!parent && parent.clientWidth < o.below;
  };
  const ro = new ResizeObserver(() => {
    if (!el.isConnected) {
      if (attached) stopOpen?.();
      return;
    }
    attached = true;
    const was = narrow;
    measureNarrow();
    if (narrow !== was) sync();
  });
  ro.observe(el);
  disposer.add(() => ro.disconnect());
  disposer.add(watchSidebarScrollbar(el));
  const isOverlay = () => ctx.overlay === true || narrow;

  // An open overlay: Esc and a click outside close it, as does following a link
  // in it; it takes focus when it opens and gives it back when it closes.
  let stopOpen: (() => void) | null = null;
  const startOpen = () => {
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const close = (restoreFocus: boolean) => {
      // Read first: collapsing makes the aside inert, which moves focus out.
      const hadFocus = el.contains(document.activeElement);
      ctx.setCollapsed(true);
      if (restoreFocus && hadFocus) returnTo?.focus({ preventScroll: true });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) close(true);
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Element;
      // The toggle is exempt, so pressing it closes the overlay once (its own
      // click) rather than closing it here and then toggling it straight back.
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
        el.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
      }
    });
    stopOpen = () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer, true);
      el.removeEventListener("click", onClick);
      stopOpen = null;
    };
  };
  disposer.add(() => stopOpen?.());

  const applyCollapse = () => {
    const collapsed = ctx.collapsed;
    const overlay = isOverlay();
    const hidden = collapsed && (ctx.collapseMode === "hidden" || overlay);
    el.className = cn(
      SIDEBAR_BASE,
      overlay
        ? // Overlay: a full-width panel whose negative end margin cancels its own
          // width, so it takes no room in the row and the content that follows
          // starts where it does, underneath it. The same element and children
          // as the in-flow layout, so crossing the breakpoint rebuilds nothing.
          cn(
            "zen-relative zen-z-30 zen-w-64 zen-shrink-0 -zen-me-64 zen-shadow-lg",
            // It slides in from its edge on the sidebar's clock rather than
            // appearing. Visibility is transitioned only on the way out, so the
            // panel stays drawn until the slide has finished. On the way in it
            // must not be: a transition's first frame holds its start value,
            // so the panel was still hidden when focus moved into it, and the
            // focus went nowhere.
            hidden
              ? "zen-invisible -zen-translate-x-full zen-transition-[transform,visibility] rtl:zen-translate-x-full"
              : "zen-transition-transform",
          )
        : hidden
          ? "zen-w-0 zen-border-r-0"
          : !collapsed
            ? "zen-w-[var(--zen-sidebar-width)]"
            : ctx.collapseMode === "labelled"
              ? "zen-w-[calc(var(--zen-sidebar-rail-labelled-width)+var(--zen-sidebar-gutter,0px))]"
              : "zen-w-[calc(var(--zen-sidebar-rail-width)+var(--zen-sidebar-gutter,0px))]",
      current.class,
    );
    if (collapsed) el.setAttribute("data-collapsed", "");
    else el.removeAttribute("data-collapsed");
    const rail = railOf(ctx);
    if (rail) el.setAttribute("data-rail", rail);
    else el.removeAttribute("data-rail");
    if (rail !== tipRail) {
      tipRail = rail;
      hideTip();
    }
    if (current.id === undefined) el.id = ctx.sidebarId;
    if (overlay) el.setAttribute("data-overlay", "");
    else el.removeAttribute("data-overlay");
    el.inert = hidden;

    const open = overlay && ctx.overlayActive && !collapsed;
    if (open && !stopOpen) startOpen();
    else if (!open) stopOpen?.();
  };

  // Entering overlay mode closes it: it is opened when wanted, not left over the
  // content because the container narrowed. Leaving restores the state it had
  // before, so widening brings back the full sidebar, or the rail if that is
  // what it was. The writes are ordered so `rail` never flickers on in between
  // (SidebarMenuSub would rebuild into its flyout and back), and the
  // notifications they cause are held until both have landed, so the one state
  // in between (an overlay not yet closed) is never painted or focused.
  let wasOverlay = ctx.overlayActive;
  let switching = false;
  function sync() {
    if (switching) return;
    const overlay = isOverlay();
    if (overlay !== wasOverlay) {
      wasOverlay = overlay;
      switching = true;
      try {
        if (overlay) {
          beforeOverlay.set(ctx, ctx.collapsed);
          ctx.setOverlayActive(true);
          ctx.setCollapsed(true);
        } else {
          ctx.setCollapsed(beforeOverlay.get(ctx) ?? false);
          ctx.setOverlayActive(false);
        }
      } finally {
        switching = false;
      }
    }
    applyCollapse();
  }

  // The rail's tooltip: one for the whole sidebar, positioned beside the row
  // under the pointer or keyboard focus. One element rather than a Tooltip per
  // row, so a 40-row menu mounts one popup instead of forty. It repeats the
  // row's name, which the row already has, so it is hidden from assistive tech
  // rather than announced twice.
  let tipRail: "icon" | "labelled" | null = null;
  let tipEl: HTMLDivElement | null = null;
  function hideTip() {
    tipEl?.remove();
    tipEl = null;
  }
  const rowAt = (t: EventTarget | null) => {
    if (!ctx.rail || !(t instanceof Element)) return null;
    const row = t.closest<HTMLElement>(`[${SIDEBAR_MENU_BUTTON_ATTR}]`);
    return row && el.contains(row) ? row : null;
  };
  const showTip = (row: HTMLElement | null) => {
    const text = row ? sidebarRailTooltip(row, ctx.collapseMode) : null;
    if (!row || !text) return hideTip();
    const r = row.getBoundingClientRect();
    const rtl = getComputedStyle(row).direction === "rtl";
    tipEl ??= document.createElement("div");
    tipEl.setAttribute("aria-hidden", "true");
    tipEl.setAttribute("data-sidebar-tooltip", "");
    tipEl.className = cn(
      "zen-pointer-events-none zen-fixed zen-z-50 zen-whitespace-nowrap zen-rounded-zen-md zen-bg-zen-neutral zen-px-2.5 zen-py-1.5 zen-text-xs zen-text-zen-neutral-fg zen-shadow-md zen-anim-fade-in -zen-translate-y-1/2",
      rtl ? "-zen-ml-2 -zen-translate-x-full" : "zen-ml-2",
    );
    tipEl.style.left = `${rtl ? r.left : r.right}px`;
    tipEl.style.top = `${r.top + r.height / 2}px`;
    tipEl.textContent = text;
    if (!tipEl.isConnected) document.body.append(tipEl);
  };
  const onTipOver = (e: Event) => showTip(rowAt(e.target));
  const onTipFocus = (e: Event) => {
    const row = rowAt(e.target);
    if (row?.matches(":focus-visible")) showTip(row);
  };
  const onTipKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") hideTip();
  };
  el.addEventListener("pointerover", onTipOver);
  el.addEventListener("pointerleave", hideTip);
  el.addEventListener("focusin", onTipFocus);
  el.addEventListener("focusout", hideTip);
  el.addEventListener("click", hideTip);
  el.addEventListener("scroll", hideTip, true);
  el.addEventListener("keydown", onTipKey);
  disposer.add(() => {
    el.removeEventListener("pointerover", onTipOver);
    el.removeEventListener("pointerleave", hideTip);
    el.removeEventListener("focusin", onTipFocus);
    el.removeEventListener("focusout", hideTip);
    el.removeEventListener("click", hideTip);
    el.removeEventListener("scroll", hideTip, true);
    el.removeEventListener("keydown", onTipKey);
    hideTip();
  });

  const render = () => {
    const { sidebar: _s, class: _c, children, ...rest } = current;
    // A caller's id wins; otherwise the provider's, which SidebarTrigger already points at.
    ctx.setSidebarId(typeof current.id === "string" ? current.id : undefined);
    sync();
    el.replaceChildren(...toNodes(children));
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(
    ctx.subscribe(() => {
      if (stale()) {
        stopOpen?.();
        return;
      }
      // `overlay` may have changed on the provider: measure against the new one.
      if (el.isConnected) measureNarrow();
      else if (typeof ctx.overlay !== "object") narrow = false;
      sync();
    }),
  );
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Pure-display structural parts (styled)                                     */
/* -------------------------------------------------------------------------- */

export interface SidebarHeaderProps extends BaseProps {
  /**
   * The provider's context. Optional, unlike the other collapse-aware parts,
   * because SidebarHeader took none before: without it the header never
   * restyles. With it, on a rail its inline padding centres the toggle and its
   * `<span>` / `<strong>` text fades: read, not shown.
   */
  sidebar?: SidebarContextValue;
}

// The header stays a row on the rail: its inline padding grows just enough to
// centre the 36px toggle, and its text fades and is clipped. It used to
// restack into a column on the first frame, which moved the toggle you had
// just clicked 100px out from under the pointer. Faded, not sr-only, so the
// name is still read. Stuck to the top of the scrolling sidebar, so the toggle
// never scrolls out of reach.
const HEADER_BASE =
  "zen-sticky zen-top-0 zen-z-10 zen-flex zen-shrink-0 zen-items-center zen-gap-2 zen-overflow-hidden zen-whitespace-nowrap zen-bg-zen-background zen-py-3 zen-transition-[padding] [&>span]:zen-transition-opacity [&>strong]:zen-transition-opacity zen-duration-[var(--zen-sidebar-duration)] zen-ease-[var(--zen-sidebar-ease)] [&>span]:zen-duration-[var(--zen-sidebar-duration)] [&>strong]:zen-duration-[var(--zen-sidebar-duration)]";

export function SidebarHeader(props: SidebarHeaderProps = {}): ZenComponent<SidebarHeaderProps> {
  let current = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  let unsubscribe: (() => void) | undefined;

  const applyRail = () => {
    const rail = railOf(current.sidebar);
    el.className = cn(
      HEADER_BASE,
      rail === "icon" ? "zen-px-3.5" : rail === "labelled" ? "zen-px-5.5" : "zen-px-3",
      rail && "[&>span]:zen-opacity-0 [&>strong]:zen-opacity-0",
      current.class,
    );
  };

  let subscribedTo: SidebarContextValue | undefined;
  const render = () => {
    const { sidebar, class: _c, children, ...rest } = current;
    if (sidebar !== subscribedTo) {
      unsubscribe?.();
      unsubscribe = sidebar?.subscribe(applyRail);
      subscribedTo = sidebar;
    }
    applyRail();
    el.replaceChildren(...toNodes(children));
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => unsubscribe?.());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export interface SidebarHeaderLabelProps extends BaseProps {
  sidebar: SidebarContextValue;
}

/** The app or workspace name in SidebarHeader; on a rail it is read, not shown. */
export function SidebarHeaderLabel(props: SidebarHeaderLabelProps): ZenComponent<SidebarHeaderLabelProps> {
  const ctx = requireCtx(props.sidebar, "SidebarHeaderLabel");
  let current = { ...props };
  const el = document.createElement("span");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const applyRail = () => {
    el.className = cn(
      // Alone in the header (no toggle before it), it starts where the menu's
      // icons do rather than 8px left of them.
      "zen-min-w-0 zen-truncate zen-font-semibold zen-transition-opacity first:zen-ps-2",
      MOTION,
      ctx.rail && "zen-opacity-0",
      current.class,
    );
  };

  const render = () => {
    const { sidebar: _s, class: _c, children, ...rest } = current;
    applyRail();
    el.replaceChildren(...toNodes(children));
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(ctx.subscribe(applyRail));
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/**
 * A count or status beside a menu row's label ("Accounts 29"), aligned at the
 * row's end. On the icon rail it fades with the label and is read with it (it
 * is a `<span>` in SidebarMenuButton); on the labelled rail it sits on the
 * icon's top corner, starting at the icon's edge so it never covers the glyph.
 */
export const SidebarMenuBadge = styled({
  tag: "span",
  className:
    "zen-ml-auto zen-min-w-5 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1.5 zen-text-center zen-text-xs zen-font-medium zen-tabular-nums zen-text-zen-muted-fg [[data-rail=labelled]_&]:zen-absolute [[data-rail=labelled]_&]:zen-top-0 [[data-rail=labelled]_&]:zen-start-[calc(50%+var(--zen-space-2))] [[data-rail=labelled]_&]:zen-min-w-4 [[data-rail=labelled]_&]:zen-px-1 [[data-rail=labelled]_&]:zen-anim-sidebar-label-rail",
  attrs: () => ({ "data-sidebar-badge": "" }),
});

// The inline inset of the content and footer is narrower on the labelled rail,
// so a label has room under its icon. The content grows to push the footer to
// the bottom; it does not scroll itself — the sidebar does, so one scrollbar
// spans the whole height.
export const SidebarContent = styled({
  tag: "div",
  className:
    "zen-flex zen-flex-1 zen-flex-col zen-gap-1 zen-px-2 zen-py-2 zen-transition-[padding] zen-duration-[var(--zen-sidebar-duration)] zen-ease-[var(--zen-sidebar-ease)] [[data-rail=labelled]_&]:zen-px-1",
});

// Inset as SidebarContent is, so a menu row in the footer lines its icon up
// with the rows above (it sat 4px further in at p-3) and fits the rail. Stuck to
// the bottom of the scrolling sidebar, over the menu.
export const SidebarFooter = styled({
  tag: "div",
  className:
    "zen-sticky zen-bottom-0 zen-z-10 zen-mt-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2 zen-overflow-hidden zen-border-t zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-2 zen-transition-[padding] zen-duration-[var(--zen-sidebar-duration)] zen-ease-[var(--zen-sidebar-ease)] [[data-rail=labelled]_&]:zen-px-1",
});

// The labelled rail has no room for a heading, so groups are told apart by a
// hairline instead. A shadow, not a border, so it takes no layout and nothing
// below it moves when it appears.
export const SidebarGroup = styled({
  tag: "div",
  className:
    "zen-flex zen-flex-col zen-gap-1 zen-py-2 [[data-rail=labelled]_&]:zen-shadow-[0_-1px_0_var(--zen-color-border)] [[data-rail=labelled]_&]:first:zen-shadow-none",
});

// The list reset is the component's own job: zen-ui ships no element reset (it is
// opt-in via /preflight), so without `zen-list-none` + `zen-p-0` the browser's
// default `list-style: disc` and 40px inline padding would eat the collapsed rail.
export const SidebarMenu = styled({
  tag: "ul",
  className: "zen-m-0 zen-flex zen-w-full zen-list-none zen-flex-col zen-gap-0.5 zen-p-0",
});

export const SidebarMenuItem = styled({ tag: "li", className: "zen-w-full" });

export const SidebarMenuSubItem = styled({ tag: "li", className: "zen-w-full" });

/* -------------------------------------------------------------------------- */
/* Group label — hides its text on the collapsed rail                         */
/* -------------------------------------------------------------------------- */

export interface SidebarGroupLabelProps extends BaseProps {
  sidebar: SidebarContextValue;
}

const GROUP_LABEL_BASE =
  "zen-grid zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg zen-transition-[grid-template-rows,opacity,padding] zen-duration-[var(--zen-sidebar-duration)] zen-ease-[var(--zen-sidebar-ease)]";

export function SidebarGroupLabel(props: SidebarGroupLabelProps): ZenComponent<SidebarGroupLabelProps> {
  const ctx = requireCtx(props.sidebar, "SidebarGroupLabel");
  let current = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  // - icon rail: the heading folds away — its row track goes to 0fr, so the
  //   rows below glide up with the width instead of jumping 24px on the first
  //   frame. Faded, not sr-only, so the group is still named.
  // - labelled rail: it stays, as a centred caption over the group's hairline,
  //   truncated to the rail. Re-aligning it from start to centre is not
  //   something a transition can carry, so like the row labels it fades in
  //   once the rail has moved (never on first paint).
  const inner = document.createElement("span");
  inner.className = "zen-min-h-0 zen-truncate";
  el.append(inner);
  let lastRail = railOf(ctx);
  let moved = false;
  const applyCollapse = () => {
    const rail = railOf(ctx);
    if (rail !== lastRail) {
      lastRail = rail;
      moved = true;
    }
    el.className = cn(
      GROUP_LABEL_BASE,
      rail === "icon"
        ? "zen-grid-rows-[0fr] zen-px-3 zen-py-0 zen-opacity-0"
        : rail === "labelled"
          ? "zen-grid-rows-[1fr] zen-px-0 zen-py-1 zen-text-center"
          : "zen-grid-rows-[1fr] zen-px-3 zen-py-1",
      moved && rail === "labelled" && "[&>span]:zen-anim-sidebar-label-rail",
      moved && ctx.collapseMode === "labelled" && !rail && "[&>span]:zen-anim-sidebar-label-row",
      current.class,
    );
  };

  const render = () => {
    const { sidebar: _s, class: _c, children, ...rest } = current;
    applyCollapse();
    inner.replaceChildren(...toNodes(children));
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(ctx.subscribe(applyCollapse));
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Menu button — the interactive nav row                                      */
/* -------------------------------------------------------------------------- */

export interface SidebarMenuButtonProps extends BaseProps {
  sidebar: SidebarContextValue;
  /** Element to render. Defaults to "button". Use "a" for a link. Replaces React's asChild. */
  as?: keyof HTMLElementTagNameMap;
  /** Render as the current / selected item. */
  active?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: MouseEvent) => void;
  href?: string;
  target?: string;
  rel?: string;
}

/**
 * A menu row's classes, by where it is drawn. The geometry is what makes
 * collapsing smooth, so it is worth stating:
 *
 * - The icon never re-centres. It sits at content inset + row inset from the
 *   edge, and each rail width in tokens.css is derived from those insets, so
 *   on the rail the icon is centred by padding that eases over, not by
 *   `justify-center` flipping on the first frame (which threw it 100px right
 *   while the rail was still wide, then slid it back).
 * - On the icon rail the label stays in the row, truncated and faded, and the
 *   rail clips it; it shrinks with the width instead of vanishing at t=0.
 *   Faded, not sr-only, so the row keeps its accessible name.
 * - On the labelled rail the label moves under the icon. That changes its
 *   position scheme, which no transition can carry, so it fades in once the
 *   rail is nearly narrow (zen-anim-sidebar-label-*). The highlight covers
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
}): string {
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
      "[&>span:not([data-sidebar-badge])]:zen-absolute [&>span:not([data-sidebar-badge])]:zen-inset-x-1 [&>span:not([data-sidebar-badge])]:zen-bottom-1.5 [&>span:not([data-sidebar-badge])]:zen-text-center [&>span:not([data-sidebar-badge])]:zen-text-xs",
    o.moved && o.rail === "labelled" && "[&>span:not([data-sidebar-badge])]:zen-anim-sidebar-label-rail",
    o.moved && o.labelledMode && !o.rail && "[&>span:not([data-sidebar-badge])]:zen-anim-sidebar-label-row",
    // As a link (`as: "a"`) it would otherwise take the browser's underline and
    // link blue: zen-ui ships no element reset. SidebarMenuSubButton has always
    // set both.
    o.active ? "zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground",
    // The highlight is the row's own background, so on the labelled rail it
    // is the whole tile — icon and label, exactly the area that is clickable —
    // and it shrinks into that tile with the row rather than being redrawn.
    o.active ? "zen-bg-zen-primary-soft" : "hover:zen-bg-zen-muted",
  );
}

export function SidebarMenuButton(props: SidebarMenuButtonProps): ZenComponent<SidebarMenuButtonProps> {
  const ctx = requireCtx(props.sidebar, "SidebarMenuButton");
  let current = { ...props };
  const el = document.createElement(current.as ?? "button");
  if ((current.as ?? "button") === "button" && current.type === undefined) {
    el.setAttribute("type", "button");
  }
  el.setAttribute(SIDEBAR_MENU_BUTTON_ATTR, "");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  // The labelled label only fades once the rail has actually moved — never on
  // first paint, which would hide a sidebar's labels behind an animation.
  let lastRail = railOf(ctx);
  let moved = false;
  const applyClass = () => {
    const rail = railOf(ctx);
    if (rail !== lastRail) {
      lastRail = rail;
      moved = true;
    }
    el.className = cn(
      menuButtonClass({
        active: !!current.active,
        rail,
        labelledMode: ctx.collapseMode === "labelled",
        moved,
      }),
      current.class,
    );
    if (current.active) el.setAttribute("data-active", "");
    else el.removeAttribute("data-active");
    // Unless the caller says otherwise: SidebarMenuSub's `active` means "holds
    // the current item", not "is the page", and this runs on every context
    // change, after applyProps has set the caller's value.
    if (!("aria-current" in current)) {
      if (current.active) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    }
  };

  const render = () => {
    const { sidebar: _s, as: _as, active: _a, class: _c, children, ...rest } = current;
    applyClass();
    el.replaceChildren(...toNodes(children));
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(ctx.subscribe(applyClass));
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Sub-menu button — a leaf row inside a nested list                          */
/* -------------------------------------------------------------------------- */

export interface SidebarMenuSubButtonProps extends BaseProps {
  /** Element to render. Defaults to "button". Use "a" for a link. Replaces React's asChild. */
  as?: keyof HTMLElementTagNameMap;
  /** Render as the current / selected item. */
  active?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: MouseEvent) => void;
  href?: string;
  target?: string;
  rel?: string;
}

export function SidebarMenuSubButton(
  props: SidebarMenuSubButtonProps,
): ZenComponent<SidebarMenuSubButtonProps> {
  let current = { ...props };
  const el = document.createElement(current.as ?? "button");
  if ((current.as ?? "button") === "button" && current.type === undefined) {
    el.setAttribute("type", "button");
  }
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { as: _as, active, class: className, children, ...rest } = current;
    el.className = cn(
      // One line, as the rows above are (shadcn truncates both): wrapped, a
      // sub-row grew taller as a closing sidebar narrowed and pushed every row
      // below it down mid-animation.
      "zen-flex zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden zen-whitespace-nowrap zen-rounded-zen-md zen-px-3 zen-py-1.5 zen-text-sm zen-no-underline zen-transition-colors [&>span]:zen-truncate",
      "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
      active
        ? "zen-bg-zen-primary-soft zen-font-medium zen-text-zen-primary-soft-fg"
        : "zen-text-zen-foreground",
      className,
    );
    if (active) el.setAttribute("data-active", "");
    else el.removeAttribute("data-active");
    if (active) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
    el.replaceChildren(...toNodes(children));
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Menu sub — a row that owns a nested list, and re-hosts it as a flyout       */
/* when the rail is collapsed.                                                 */
/* -------------------------------------------------------------------------- */

// Every side is set explicitly: `zen-m-0`/`zen-p-0` plus a directional `zen-ml-4`
// are the same specificity, so which wins would come down to UnoCSS's emit order.
const SUB_LIST_CLASS =
  "zen-mb-0 zen-ml-4 zen-mr-0 zen-mt-0.5 zen-flex zen-list-none zen-flex-col zen-gap-0.5 zen-border-0 zen-border-l zen-border-solid zen-border-zen-border zen-pb-0 zen-pl-3 zen-pr-0 zen-pt-0";

const CHEVRON_MARKUP =
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="zen-ml-auto zen-transition-[transform,opacity] zen-duration-[var(--zen-sidebar-duration)] zen-ease-[var(--zen-sidebar-ease)]"><polyline points="9 18 15 12 9 6"/></svg>`;

function makeChevron(open: boolean, after = false): SVGElement {
  const t = document.createElement("template");
  t.innerHTML = CHEVRON_MARKUP;
  const svg = t.content.firstChild as SVGElement;
  // After a badge, the badge takes the row's end and the chevron follows it.
  if (after) svg.classList.replace("zen-ml-auto", "zen-ml-1");
  if (open) svg.classList.add("zen-rotate-90");
  return svg;
}

export interface SidebarMenuSubProps {
  sidebar: SidebarContextValue;
  /** The parent row's label. Doubles as the flyout heading when collapsed. */
  label: string | Node;
  icon?: Child;
  /** Uncontrolled initial expanded state. Default false. */
  defaultOpen?: boolean;
  /** Controlled expanded state. Present -> the caller owns it. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Mark the parent row as holding the current item. */
  active?: boolean;
  /** A count or status at the row's end ("29"), before the chevron; also in the collapsed flyout's heading. */
  badge?: Child;
  /** The nested `SidebarMenuSubItem` rows. */
  children?: Child;
  class?: string;
}

export function SidebarMenuSub(props: SidebarMenuSubProps): ZenComponent<SidebarMenuSubProps> {
  const ctx = requireCtx(props.sidebar, "SidebarMenuSub");
  let current = { ...props };

  // `display: contents` so this wrapper adds no box between the <li> and the row
  // it renders — the row is a full-width button in both modes.
  const el = document.createElement("div");
  el.style.display = "contents";

  // Materialised once and moved between modes: a DOM node lives in one place, and
  // only one mode is ever mounted, so the same items host inline or in the flyout.
  let iconNodes = toNodes(current.icon);
  let subItems = toNodes(current.children);

  const labelNodes = (): Node[] =>
    typeof current.label === "string"
      ? [document.createTextNode(current.label)]
      : [current.label.cloneNode(true)];

  const openState = controllable<boolean>({
    value: current.open,
    defaultValue: current.defaultOpen ?? false,
    onChange: (o) => current.onOpenChange?.(o),
  });

  const disposer = new Disposer();
  let modeDisposer: Disposer | null = null;

  const hasBadge = () => current.badge !== undefined;
  const makeBadge = (md: Disposer) => {
    const badge = SidebarMenuBadge({ children: current.badge });
    md.add(() => badge.destroy());
    return badge.el;
  };

  // ONE row for both modes, with the flyout's Popover always wrapped around
  // it, rather than a different row per mode: rebuilding on every collapse
  // put a fresh row in at its rail position while every other row eased
  // there. The Popover only ever opens on the rail; expanded, the row's own
  // click discloses the list inline.
  const build = (md: Disposer) => {
    el.replaceChildren();

    const span = document.createElement("span");
    span.append(...labelNodes());
    const chevron = makeChevron(openState.get(), hasBadge());

    const row = SidebarMenuButton({
      sidebar: ctx,
      active: current.active,
      class: current.class,
      // `active` here means "holds the current item", not "is the page".
      "aria-current": "false",
      onClick: () => {
        if (!ctx.rail) openState.set(!openState.get());
      },
      children: [...iconNodes, span, hasBadge() ? makeBadge(md) : null, chevron],
    });

    const heading = document.createElement("div");
    heading.className = cn(
      "zen-px-2 zen-pb-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
      // Only with a badge, so a heading without one renders as before.
      hasBadge() && "zen-flex zen-items-center zen-gap-2",
    );
    heading.append(...labelNodes());
    if (hasBadge()) heading.append(makeBadge(md));

    const flyList = document.createElement("ul");
    flyList.className = cn(SUB_LIST_CLASS, "zen-ml-0 zen-border-l-0 zen-pl-0");
    // The inline list opens and closes on the sidebar's clock: its row track
    // eases between 0fr and 1fr, so the rows below glide instead of jumping.
    // Closed it is inert, so its links cannot take focus. The list's own top
    // margin moves out to the wrapper, or a closed track would still hold it
    // open by 2px.
    const disclosure = document.createElement("div");
    const list = document.createElement("ul");
    list.className = cn(SUB_LIST_CLASS, "zen-mt-0 zen-min-h-0 zen-overflow-hidden");
    disclosure.append(list);

    const pop = Popover({
      trigger: row,
      children: [heading, flyList],
      side: "right",
      align: "start",
      class: "zen-w-56 zen-p-2",
      open: false,
      // The Popover hears the row's click too; only a rail opens it.
      onOpenChange: (o) => {
        if (ctx.rail) openState.set(o);
      },
    });
    const controls = row.el.getAttribute("aria-controls");
    // The Popover wrapper is inline-flex; the row must fill the width.
    pop.el.style.display = "flex";
    pop.el.style.width = "100%";

    // The sub items live in one place at a time; see paint() below.
    const paint = () => {
      const open = openState.get();
      const rail = ctx.rail;
      row.el.setAttribute("aria-expanded", String(open));
      // The Popover marks its trigger as opening a dialog; only true on the rail.
      if (rail) {
        row.el.setAttribute("aria-haspopup", "dialog");
        if (controls) row.el.setAttribute("aria-controls", controls);
      } else {
        row.el.removeAttribute("aria-haspopup");
        row.el.removeAttribute("aria-controls");
      }
      chevron.classList.toggle("zen-rotate-90", open && !rail);
      // On a rail it would read as a second icon.
      chevron.classList.toggle("zen-opacity-0", rail);
      const inline = open && !rail;
      disclosure.className = cn(
        "zen-grid zen-transition-[grid-template-rows,margin]",
        MOTION,
        inline ? "zen-mt-0.5 zen-grid-rows-[1fr]" : "zen-mt-0 zen-grid-rows-[0fr]",
      );
      disclosure.inert = !inline;
      // The items live in one place at a time: the flyout while it is open,
      // the inline list otherwise (closed, it keeps them out of sight).
      if (open && rail) {
        flyList.replaceChildren(...subItems);
        pop.update({ open: true });
      } else {
        pop.update({ open: false });
        list.replaceChildren(...subItems);
      }
    };

    el.append(pop.el, disclosure);
    paint();
    repaint = paint;

    md.add(openState.subscribe(paint));
    md.add(() => pop.destroy());
    md.add(() => row.destroy());
  };

  // Entering the rail closes the disclosure, so it does not immediately
  // re-open as a flyout (both modes read the same state). The context also
  // notifies for changes that leave the rail alone.
  let wasRail = ctx.rail;
  let repaint: (() => void) | null = null;
  const rebuild = () => {
    modeDisposer?.dispose();
    const md = new Disposer();
    modeDisposer = md;
    build(md);
  };

  rebuild();
  disposer.add(
    ctx.subscribe(() => {
      const rail = ctx.rail;
      if (rail === wasRail) return;
      wasRail = rail;
      // Closing repaints through the subscription; otherwise repaint here,
      // since a rail change alone still moves the items and the chevron.
      if (rail && openState.get()) openState.set(false);
      else repaint?.();
    }),
  );
  disposer.add(() => modeDisposer?.dispose());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if (next.icon !== undefined) iconNodes = toNodes(current.icon);
      if (next.children !== undefined) subItems = toNodes(current.children);
      if (next.open !== undefined) openState.sync(next.open);
      rebuild();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Trigger — toggles the rail                                                  */
/* -------------------------------------------------------------------------- */

const HAMBURGER_MARKUP =
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;

function hamburger(): SVGElement {
  const t = document.createElement("template");
  t.innerHTML = HAMBURGER_MARKUP;
  return t.content.firstChild as SVGElement;
}

export interface SidebarTriggerProps extends BaseProps {
  sidebar: SidebarContextValue;
  /** Element to render. Defaults to "button". Replaces React's asChild. */
  as?: keyof HTMLElementTagNameMap;
  onClick?: (e: MouseEvent) => void;
}

export function SidebarTrigger(props: SidebarTriggerProps): ZenComponent<SidebarTriggerProps> {
  const ctx = requireCtx(props.sidebar, "SidebarTrigger");
  const loc = useLocale();
  let current = { ...props };
  const el = document.createElement(current.as ?? "button");
  if ((current.as ?? "button") === "button") el.setAttribute("type", "button");
  el.setAttribute("aria-label", loc.t("sidebar.toggleSidebar"));
  const applyState = () => {
    el.setAttribute("aria-expanded", String(!ctx.collapsed));
    el.setAttribute("aria-controls", ctx.sidebarId);
  };
  applyState();
  // An open overlay closes on a pointerdown outside it; the toggle is exempt,
  // so pressing it closes the overlay once (its own click) rather than closing
  // it and then toggling it straight back open.
  el.setAttribute("data-sidebar-trigger", "");

  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const onClick = (e: Event) => {
    current.onClick?.(e as MouseEvent);
    ctx.toggle();
  };
  el.addEventListener("click", onClick);
  disposer.add(() => el.removeEventListener("click", onClick));
  disposer.add(ctx.subscribe(applyState));

  const render = () => {
    const { sidebar: _s, as: _as, class: className, children, onClick: _oc, ...rest } = current;
    el.className = cn(
      "zen-inline-flex zen-h-9 zen-w-9 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      className,
    );
    const kids = toNodes(children);
    el.replaceChildren(...(kids.length ? kids : [hamburger()]));
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

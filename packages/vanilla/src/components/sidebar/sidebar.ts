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
 * Three ways to collapse, all from SidebarProvider:
 *  - `collapseMode: "icon"` (the default): shrink to an icon rail.
 *  - `collapseMode: "hidden"`: hide it entirely, for a menu with no icons.
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
   * Drawn as an icon rail: collapsed, in the icon mode, not as an overlay. What
   * the parts style by; in the default mode it is exactly `collapsed`.
   */
  readonly rail: boolean;
  readonly collapseMode: "icon" | "hidden";
  /** The sidebar is an overlay right now (always, or because its container is narrow). */
  readonly overlayActive: boolean;
  setOverlayActive(v: boolean): void;
  readonly overlay: boolean | { below: number } | undefined;
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

export interface SidebarProviderHandle extends ZenComponent<SidebarProviderProps> {
  /** The collapse state to hand to `Sidebar`, `SidebarMenuButton`, … as `sidebar`. */
  readonly context: SidebarContextValue;
}

function requireCtx(ctx: SidebarContextValue | undefined, name: string): SidebarContextValue {
  if (!ctx) throw new Error(`${name} requires a \`sidebar\` context from SidebarProvider`);
  return ctx;
}

const collapseModeOf = (p: SidebarProviderProps): "icon" | "hidden" => p.collapseMode ?? "icon";

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
      return state.get() && collapseModeOf(current) === "icon" && !overlayActive;
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

const SIDEBAR_BASE =
  "zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width] zen-duration-200 zen-ease-in-out";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Collapsed-or-not before the overlay took over, per provider, so a widening
 * restores it. Kept by context rather than by Sidebar instance: a provider that
 * rebuilds its children replaces the instance mid-overlay.
 */
const beforeOverlay = new WeakMap<SidebarContextValue, boolean>();

export function Sidebar(props: SidebarProps): ZenComponent<SidebarProps> {
  const ctx = requireCtx(props.sidebar, "Sidebar");
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
          cn("zen-relative zen-z-30 zen-w-64 zen-shrink-0 -zen-me-64 zen-shadow-lg", hidden && "zen-invisible")
        : hidden
          ? "zen-w-0 zen-overflow-hidden zen-border-r-0"
          : collapsed
            ? "zen-w-16"
            : "zen-w-64",
      current.class,
    );
    if (collapsed) el.setAttribute("data-collapsed", "");
    else el.removeAttribute("data-collapsed");
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

  const render = () => {
    const { sidebar: _s, class: _c, children, ...rest } = current;
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
   * restyles. With it, on the icon rail the header stacks (the toggle over a
   * logo) and its `<span>` / `<strong>` text is read, not shown.
   */
  sidebar?: SidebarContextValue;
}

const HEADER_BASE = "zen-flex zen-items-center zen-gap-2 zen-p-3";

export function SidebarHeader(props: SidebarHeaderProps = {}): ZenComponent<SidebarHeaderProps> {
  let current = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  let unsubscribe: (() => void) | undefined;

  // Text left visible spilled out of the 64px rail over the page.
  const applyRail = () => {
    el.className = cn(
      HEADER_BASE,
      current.sidebar?.rail && "zen-flex-col zen-px-0 [&>span]:zen-sr-only [&>strong]:zen-sr-only",
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

/** The app or workspace name in SidebarHeader; on the icon rail it is read, not shown. */
export function SidebarHeaderLabel(props: SidebarHeaderLabelProps): ZenComponent<SidebarHeaderLabelProps> {
  const ctx = requireCtx(props.sidebar, "SidebarHeaderLabel");
  let current = { ...props };
  const el = document.createElement("span");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const applyRail = () => {
    el.className = cn("zen-min-w-0 zen-truncate zen-font-semibold", ctx.rail && "zen-sr-only", current.class);
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
 * row's end. On the icon rail it is read with the label, not shown (it is a
 * `<span>` in SidebarMenuButton, which screen-reads its spans on the rail).
 */
export const SidebarMenuBadge = styled({
  tag: "span",
  className:
    "zen-ml-auto zen-min-w-5 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1.5 zen-text-center zen-text-xs zen-font-medium zen-tabular-nums zen-text-zen-muted-fg",
  attrs: () => ({ "data-sidebar-badge": "" }),
});

export const SidebarContent = styled({
  tag: "div",
  className: "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-1 zen-overflow-y-auto zen-p-2",
});

export const SidebarFooter = styled({
  tag: "div",
  className: "zen-mt-auto zen-flex zen-items-center zen-gap-2 zen-border-t zen-border-zen-border zen-p-3",
});

export const SidebarGroup = styled({
  tag: "div",
  className: "zen-flex zen-flex-col zen-gap-1 zen-py-2",
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
  "zen-px-3 zen-py-1 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg";

export function SidebarGroupLabel(props: SidebarGroupLabelProps): ZenComponent<SidebarGroupLabelProps> {
  const ctx = requireCtx(props.sidebar, "SidebarGroupLabel");
  let current = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  // sr-only, not hidden: `display: none` would drop the group name out of the
  // accessibility tree. Matches SidebarMenuButton.
  const applyCollapse = () => {
    el.className = cn(GROUP_LABEL_BASE, ctx.rail && "zen-sr-only", current.class);
  };

  const render = () => {
    const { sidebar: _s, class: _c, children, ...rest } = current;
    applyCollapse();
    el.replaceChildren(...toNodes(children));
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

const MENU_BUTTON_STATIC =
  "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 [&>svg]:zen-size-4 [&>svg]:zen-shrink-0";

export function SidebarMenuButton(props: SidebarMenuButtonProps): ZenComponent<SidebarMenuButtonProps> {
  const ctx = requireCtx(props.sidebar, "SidebarMenuButton");
  let current = { ...props };
  const el = document.createElement(current.as ?? "button");
  if ((current.as ?? "button") === "button" && current.type === undefined) {
    el.setAttribute("type", "button");
  }
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const applyClass = () => {
    const collapsed = ctx.rail;
    el.className = cn(
      "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-2 zen-text-sm zen-font-medium zen-no-underline zen-transition-colors",
      MENU_BUTTON_STATIC,
      // As a link (`as: "a"`) it would otherwise take the browser's underline
      // and link blue: zen-ui ships no element reset. SidebarMenuSubButton has
      // always set both.
      current.active ? "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground",
      // sr-only, not hidden: a collapsed rail is a column of icon buttons whose
      // only accessible name is the span. `display: none` would leave them nameless.
      collapsed && "zen-relative zen-justify-center zen-px-0 [&>span]:zen-sr-only",
      current.class,
    );
    if (current.active) el.setAttribute("data-active", "");
    else el.removeAttribute("data-active");
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
      "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-1.5 zen-text-sm zen-no-underline zen-transition-colors",
      "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
      active
        ? "zen-bg-zen-primary-soft zen-font-medium zen-text-zen-primary-soft-fg"
        : "zen-text-zen-foreground",
      className,
    );
    if (active) el.setAttribute("data-active", "");
    else el.removeAttribute("data-active");
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
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="zen-ml-auto zen-transition-transform"><polyline points="9 18 15 12 9 6"/></svg>`;

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

  const buildExpanded = (md: Disposer) => {
    el.replaceChildren();

    const span = document.createElement("span");
    span.append(...labelNodes());
    const chevron = makeChevron(openState.get(), hasBadge());

    const button = SidebarMenuButton({
      sidebar: ctx,
      active: current.active,
      class: current.class,
      "aria-expanded": String(openState.get()),
      onClick: () => openState.set(!openState.get()),
      children: [...iconNodes, span, hasBadge() ? makeBadge(md) : null, chevron],
    });

    const list = document.createElement("ul");
    list.className = SUB_LIST_CLASS;

    const paint = (open: boolean) => {
      button.el.setAttribute("aria-expanded", String(open));
      chevron.classList.toggle("zen-rotate-90", open);
      if (open) {
        list.replaceChildren(...subItems);
        if (!list.isConnected) el.append(list);
      } else {
        list.remove();
      }
    };

    el.append(button.el);
    paint(openState.get());

    md.add(openState.subscribe(paint));
    md.add(() => button.destroy());
  };

  const buildCollapsed = (md: Disposer) => {
    el.replaceChildren();

    // Match React's effect: entering the collapsed rail closes the disclosure so
    // it does not immediately re-open as a flyout (both modes read the same state).
    openState.set(false);

    const span = document.createElement("span");
    span.append(...labelNodes());
    // No chevron on a 48px rail: there is no room, and a bare <svg> would survive
    // the collapsed `[&>span]:sr-only` rule and read as a second icon.
    const trigger = SidebarMenuButton({
      sidebar: ctx,
      active: current.active,
      class: current.class,
      children: [...iconNodes, span],
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
    flyList.append(...subItems);

    const pop = Popover({
      trigger,
      children: [heading, flyList],
      side: "right",
      align: "start",
      class: "zen-w-56 zen-p-2",
      open: openState.get(),
      onOpenChange: (o) => openState.set(o),
    });
    // The Popover wrapper is inline-flex; the rail row must fill the width so the
    // collapsed button centres its icon across the strip.
    pop.el.style.display = "flex";
    pop.el.style.width = "100%";

    el.append(pop.el);

    md.add(openState.subscribe((o) => pop.update({ open: o })));
    md.add(() => pop.destroy());
    md.add(() => trigger.destroy());
  };

  // The mode follows `rail`, not `collapsed`: a hidden sidebar or a closed
  // overlay is collapsed but keeps its inline rows. Rebuilt only when the mode
  // changes, since the context also notifies for changes that leave it alone.
  let builtRail: boolean | undefined;
  const rebuild = () => {
    modeDisposer?.dispose();
    const md = new Disposer();
    modeDisposer = md;
    builtRail = ctx.rail;
    if (builtRail) buildCollapsed(md);
    else buildExpanded(md);
  };

  rebuild();
  disposer.add(
    ctx.subscribe(() => {
      if (ctx.rail !== builtRail) rebuild();
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

  const render = () => {
    const { sidebar: _s, as: _as, class: className, children, onClick: _oc, ...rest } = current;
    el.className = cn(
      "zen-inline-flex zen-h-9 zen-w-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
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

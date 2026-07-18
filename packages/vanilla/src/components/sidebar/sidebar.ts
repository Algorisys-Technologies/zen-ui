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
 *           SidebarHeader({ children: [SidebarTrigger({ sidebar: ctx }), strong("Acme")] }),
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
 * cares about collapse (`Sidebar`, `SidebarGroupLabel`, `SidebarMenuButton`,
 * `SidebarMenuSub`, `SidebarTrigger`) takes it as a required `sidebar` prop. A part
 * subscribes to the context and repaints its own collapse-dependent classes; that
 * targeted DOM write is what React's re-render did.
 *
 * Ownership follows the caller, exactly as it does in React: the caller composes
 * the tree and holds the part handles, so unmounting means `destroy()`-ing them.
 * The provider owns only the state.
 *
 * ## State vocabulary
 *
 * `data-collapsed` on the rail, `data-active` on the current item — React's
 * vocabulary. See PORTING.md.
 */

export interface SidebarContextValue {
  /** True when the rail is collapsed to the icon-only strip. */
  readonly collapsed: boolean;
  setCollapsed(v: boolean): void;
  toggle(): void;
  /** Run `fn` whenever `collapsed` changes. Returns an unsubscribe. */
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
}

export interface SidebarProviderHandle extends ZenComponent<SidebarProviderProps> {
  /** The collapse state to hand to `Sidebar`, `SidebarMenuButton`, … as `sidebar`. */
  readonly context: SidebarContextValue;
}

function requireCtx(ctx: SidebarContextValue | undefined, name: string): SidebarContextValue {
  if (!ctx) throw new Error(`${name} requires a \`sidebar\` context from SidebarProvider`);
  return ctx;
}

export function SidebarProvider(props: SidebarProviderProps = {}): SidebarProviderHandle {
  let current: SidebarProviderProps = { ...props };

  const state = controllable<boolean>({
    value: current.collapsed,
    defaultValue: current.defaultCollapsed ?? false,
    onChange: (o) => current.onCollapsedChange?.(o),
  });

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
    subscribe(fn) {
      return state.subscribe(fn);
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
      current = { ...current, ...next };
      if (next.collapsed !== undefined) state.sync(next.collapsed);
      if (next.children) el.replaceChildren(...toNodes(next.children(context)));
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

export function Sidebar(props: SidebarProps): ZenComponent<SidebarProps> {
  const ctx = requireCtx(props.sidebar, "Sidebar");
  let current = { ...props };
  const el = document.createElement("aside");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const applyCollapse = () => {
    const collapsed = ctx.collapsed;
    el.className = cn(SIDEBAR_BASE, collapsed ? "zen-w-16" : "zen-w-64", current.class);
    if (collapsed) el.setAttribute("data-collapsed", "");
    else el.removeAttribute("data-collapsed");
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
/* Pure-display structural parts (styled)                                     */
/* -------------------------------------------------------------------------- */

export const SidebarHeader = styled({
  tag: "div",
  className: "zen-flex zen-items-center zen-gap-2 zen-p-3",
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
    el.className = cn(GROUP_LABEL_BASE, ctx.collapsed && "zen-sr-only", current.class);
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
    const collapsed = ctx.collapsed;
    el.className = cn(
      "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-2 zen-text-sm zen-font-medium zen-transition-colors",
      MENU_BUTTON_STATIC,
      current.active && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
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

function makeChevron(open: boolean): SVGElement {
  const t = document.createElement("template");
  t.innerHTML = CHEVRON_MARKUP;
  const svg = t.content.firstChild as SVGElement;
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

  const buildExpanded = (md: Disposer) => {
    el.replaceChildren();

    const span = document.createElement("span");
    span.append(...labelNodes());
    const chevron = makeChevron(openState.get());

    const button = SidebarMenuButton({
      sidebar: ctx,
      active: current.active,
      class: current.class,
      "aria-expanded": String(openState.get()),
      onClick: () => openState.set(!openState.get()),
      children: [...iconNodes, span, chevron],
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
    heading.className = "zen-px-2 zen-pb-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg";
    heading.append(...labelNodes());

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

  const rebuild = () => {
    modeDisposer?.dispose();
    const md = new Disposer();
    modeDisposer = md;
    if (ctx.collapsed) buildCollapsed(md);
    else buildExpanded(md);
  };

  rebuild();
  disposer.add(ctx.subscribe(rebuild));
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
  let current = { ...props };
  const el = document.createElement(current.as ?? "button");
  if ((current.as ?? "button") === "button") el.setAttribute("type", "button");
  el.setAttribute("aria-label", "Toggle sidebar");

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

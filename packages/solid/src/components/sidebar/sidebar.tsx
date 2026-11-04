import {
  type JSX,
  type Accessor,
  type ComponentProps,
  type ValidComponent,
  children as resolveChildren,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  on,
  onCleanup,
  onMount,
  splitProps,
  useContext,
  Show,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "../../lib/cn";
import type { PolymorphicProps } from "../../lib/polymorphic";
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
 *
 * Three ways to collapse, all from SidebarProvider:
 *  - `collapseMode="icon"` (the default): shrink to an icon rail.
 *  - `collapseMode="hidden"`: hide it entirely, for a menu with no icons.
 *  - `overlay` (`true`, or `{ below: 900 }` for when its container is narrower
 *    than that): it starts closed and opens OVER the content, and closes on
 *    Esc, a click outside it, or following a link in it.
 */

interface SidebarContextValue {
  collapsed: Accessor<boolean>;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
  /** Drawn as an icon rail: collapsed, in the icon mode, not as an overlay. What the parts style by. */
  rail: Accessor<boolean>;
  collapseMode: Accessor<"icon" | "hidden">;
  /** The sidebar is an overlay right now (always, or because its container is narrow). */
  overlayActive: Accessor<boolean>;
  setOverlayActive: (v: boolean) => void;
  overlay: Accessor<boolean | { below: number } | undefined>;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a <SidebarProvider>");
  return ctx;
}

export interface SidebarProviderProps {
  children?: JSX.Element;
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

export function SidebarProvider(props: SidebarProviderProps) {
  const [internal, setInternal] = createSignal(props.defaultCollapsed ?? false);
  const collapsed = createMemo(() => props.collapsed ?? internal());

  const setCollapsed = (v: boolean) => {
    if (props.collapsed === undefined) setInternal(v);
    props.onCollapsedChange?.(v);
  };

  const [overlayActive, setOverlayActive] = createSignal(false);
  const collapseMode = () => props.collapseMode ?? "icon";
  const ctx: SidebarContextValue = {
    collapsed,
    setCollapsed,
    toggle: () => setCollapsed(!collapsed()),
    rail: () => collapsed() && collapseMode() === "icon" && !overlayActive(),
    collapseMode,
    overlayActive,
    setOverlayActive,
    overlay: () => props.overlay,
  };

  return <SidebarContext.Provider value={ctx}>{props.children}</SidebarContext.Provider>;
}

export const Sidebar = (props: ComponentProps<"aside">) => {
  const ctx = useSidebar();
  const [local, rest] = splitProps(props, ["class", "children", "ref"]);
  // Resolved once: the overlay and the in-flow layouts both render them, and
  // switching between the two moves the same nodes rather than rebuilding them.
  const content = resolveChildren(() => local.children);
  let aside: HTMLElement | undefined;
  let panel: HTMLDivElement | undefined;

  // Overlay below a width: measured on the sidebar's container, not the
  // window, so a sidebar in a narrow region (or a demo frame) behaves as it
  // would on a narrow screen.
  const [narrow, setNarrow] = createSignal(false);
  onMount(() => {
    const parent = aside?.parentElement;
    if (!parent) return;
    const measure = () => {
      const o = ctx.overlay();
      setNarrow(typeof o === "object" && parent.clientWidth < o.below);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    measure();
    onCleanup(() => ro.disconnect());
  });
  const overlay = () => ctx.overlay() === true || narrow();
  // Entering overlay mode closes it: it is opened when wanted, not left over
  // the content because the window narrowed. Leaving it restores the state it
  // had before, so widening the window brings the full sidebar back.
  let beforeOverlay = false;
  createEffect(
    on(overlay, (active, was) => {
      ctx.setOverlayActive(active);
      if (active && !was) {
        beforeOverlay = ctx.collapsed();
        ctx.setCollapsed(true);
      } else if (!active && was) {
        ctx.setCollapsed(beforeOverlay);
      }
    }),
  );

  const hidden = () => ctx.collapsed() && (ctx.collapseMode() === "hidden" || overlay());
  const open = () => overlay() && !ctx.collapsed();

  // An open overlay: Esc and a click outside close it, as does following a
  // link in it; it takes focus when it opens and gives it back when it closes.
  createEffect(() => {
    if (!open() || !panel) return;
    const el = panel;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const close = (restoreFocus: boolean) => {
      ctx.setCollapsed(true);
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
    requestAnimationFrame(() => {
      if (!el.contains(document.activeElement)) {
        el.querySelector<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')?.focus({ preventScroll: true });
      }
    });
    onCleanup(() => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer, true);
      el.removeEventListener("click", onClick);
    });
  });

  const setAside = (el: HTMLElement) => {
    aside = el;
    if (typeof local.ref === "function") (local.ref as (el: HTMLElement) => void)(el);
  };

  return (
    <Show
      when={overlay()}
      fallback={
        <aside
          ref={(el: HTMLElement) => setAside(el)}
          data-collapsed={ctx.collapsed() || undefined}
          inert={hidden() || undefined}
          class={cn(
            "zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width] zen-duration-200 zen-ease-in-out",
            hidden() ? "zen-w-0 zen-overflow-hidden zen-border-r-0" : ctx.collapsed() ? "zen-w-16" : "zen-w-64",
            local.class,
          )}
          {...rest}
        >
          {content()}
        </aside>
      }
    >
      {/* Overlay: the aside keeps a zero-width place in the layout, and the
          panel is positioned from it over whatever follows. */}
      <aside
        ref={(el: HTMLElement) => setAside(el)}
        data-collapsed={ctx.collapsed() || undefined}
        data-overlay=""
        class="zen-relative zen-z-30 zen-w-0 zen-shrink-0"
        {...rest}
      >
        <div
          ref={panel}
          inert={hidden() || undefined}
          class={cn(
            "zen-absolute zen-inset-y-0 zen-start-0 zen-flex zen-w-64 zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-shadow-lg",
            hidden() && "zen-invisible",
            local.class,
          )}
        >
          {content()}
        </div>
      </aside>
    </Show>
  );
};

export const SidebarHeader = (props: ComponentProps<"div">) => {
  const { rail } = useSidebar();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn(
        "zen-flex zen-items-center zen-gap-2 zen-p-3",
        // On the rail the header stacks (the toggle over a logo) and its text
        // goes to screen readers only, as the menu's labels do. Text left
        // visible spilled out of the 64px rail over the page.
        rail() && "zen-flex-col zen-px-0 [&>span]:zen-sr-only [&>strong]:zen-sr-only",
        local.class,
      )}
      {...rest}
    />
  );
};

/** The app or workspace name in SidebarHeader; on the icon rail it is read, not shown. */
export const SidebarHeaderLabel = (props: ComponentProps<"span">) => {
  const { rail } = useSidebar();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      class={cn("zen-min-w-0 zen-truncate zen-font-semibold", rail() && "zen-sr-only", local.class)}
      {...rest}
    />
  );
};

/**
 * A count or status beside a menu row's label ("Accounts 29"), aligned at the
 * row's end. On the icon rail it is read with the label, not shown.
 */
export const SidebarMenuBadge = (props: ComponentProps<"span">) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-sidebar-badge=""
      class={cn(
        "zen-ml-auto zen-min-w-5 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1.5 zen-text-center zen-text-xs zen-font-medium zen-tabular-nums zen-text-zen-muted-fg",
        local.class,
      )}
      {...rest}
    />
  );
};

export const SidebarContent = (props: ComponentProps<"div">) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn(
        "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-1 zen-overflow-y-auto zen-p-2",
        local.class,
      )}
      {...rest}
    />
  );
};

export const SidebarFooter = (props: ComponentProps<"div">) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn(
        "zen-mt-auto zen-flex zen-items-center zen-gap-2 zen-border-t zen-border-zen-border zen-p-3",
        local.class,
      )}
      {...rest}
    />
  );
};

export const SidebarGroup = (props: ComponentProps<"div">) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <div class={cn("zen-flex zen-flex-col zen-gap-1 zen-py-2", local.class)} {...rest} />;
};

export const SidebarGroupLabel = (props: ComponentProps<"div">) => {
  const { rail: collapsed } = useSidebar();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn(
        "zen-px-3 zen-py-1 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg",
        collapsed() && "zen-sr-only",
        local.class,
      )}
      {...rest}
    />
  );
};

export const SidebarMenu = (props: ComponentProps<"ul">) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    // The list reset is the component's own job: zen-ui ships no element reset
    // (it is opt-in via /preflight), so without this the browser default
    // `list-style: disc` + `padding-inline-start: 40px` apply. That 40px ate the
    // collapsed rail — 64px wide, less 16px of padding, less 40px, left 8px of
    // room for a 16px icon.
    <ul
      class={cn("zen-m-0 zen-flex zen-w-full zen-list-none zen-flex-col zen-gap-0.5 zen-p-0", local.class)}
      {...rest}
    />
  );
};

export const SidebarMenuItem = (props: ComponentProps<"li">) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <li class={cn("zen-w-full", local.class)} {...rest} />;
};

type SidebarMenuButtonOwnProps = {
  /** render as the current / selected item */
  active?: boolean;
  class?: string;
  children?: JSX.Element;
};

export type SidebarMenuButtonProps<T extends ValidComponent = "button"> = PolymorphicProps<
  T,
  SidebarMenuButtonOwnProps
>;

export const SidebarMenuButton = <T extends ValidComponent = "button">(
  rawProps: SidebarMenuButtonProps<T>,
) => {
  const { rail: collapsed } = useSidebar();
  const props = mergeProps({ as: "button" as ValidComponent, active: false }, rawProps);
  const [local, rest] = splitProps(
    props as SidebarMenuButtonProps<"button"> & { as: ValidComponent },
    ["as", "class", "active"],
  );

  return (
    <Dynamic
      component={local.as}
      data-active={local.active || undefined}
      class={cn(
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-2 zen-text-sm zen-font-medium zen-no-underline zen-transition-colors",
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
        // As a link (as={A}) it would otherwise take the browser's underline
        // and link blue: zen-ui ships no element reset. SidebarMenuSubButton
        // has always set both.
        local.active ? "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground",
        // sr-only, not hidden: `display: none` drops the label out of the
        // accessibility tree, which left a collapsed rail as a column of
        // buttons with no accessible name at all. Matches SidebarGroupLabel.
        collapsed() && "zen-relative zen-justify-center zen-px-0 [&>span]:zen-sr-only",
        local.class,
      )}
      {...rest}
    />
  );
};

const SUB_LIST_CLASS =
  // Every side is set explicitly: `zen-m-0`/`zen-p-0` plus a directional
  // `zen-ml-4` are the same specificity, so which one wins would come down to
  // UnoCSS's emit order rather than intent.
  "zen-mb-0 zen-ml-4 zen-mr-0 zen-mt-0.5 zen-flex zen-list-none zen-flex-col zen-gap-0.5 zen-border-0 zen-border-l zen-border-solid zen-border-zen-border zen-pb-0 zen-pl-3 zen-pr-0 zen-pt-0";

const Chevron = (props: { open: boolean; after?: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class={cn(props.after ? "zen-ml-1" : "zen-ml-auto", "zen-transition-transform", props.open && "zen-rotate-90")}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

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
  /** A count or status at the row's end ("29"), before the chevron. */
  badge?: JSX.Element;
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
export const SidebarMenuSub = (rawProps: SidebarMenuSubProps) => {
  const { rail: collapsed } = useSidebar();
  const props = mergeProps({ defaultOpen: false, active: false }, rawProps);
  const [internal, setInternal] = createSignal(props.defaultOpen);
  const isControlled = () => props.open !== undefined;
  const open = () => (isControlled() ? (props.open as boolean) : internal());

  const setOpen = (v: boolean) => {
    if (!isControlled()) setInternal(v);
    props.onOpenChange?.(v);
  };

  // Collapsing while a row is expanded would otherwise reopen it mid-flight as
  // a flyout, because both modes read the same `open`.
  createEffect(() => {
    if (collapsed()) setOpen(false);
  });

  // Resolved once: both branches below read the children, and an unmemoised
  // `props.children` getter rebuilds the caller's JSX on every read.
  const items = resolveChildren(() => props.children);

  return (
    <Show
      when={collapsed()}
      fallback={
        <>
          <SidebarMenuButton
            active={props.active}
            class={props.class}
            aria-expanded={open()}
            onClick={() => setOpen(!open())}
          >
            {props.icon}
            <span>{props.label}</span>
            <Show when={props.badge !== undefined}>
              <SidebarMenuBadge>{props.badge}</SidebarMenuBadge>
            </Show>
            <Chevron open={open()} after={props.badge !== undefined} />
          </SidebarMenuButton>
          <Show when={open()}>
            <ul class={SUB_LIST_CLASS}>{items()}</ul>
          </Show>
        </>
      }
    >
      <Popover open={open()} onOpenChange={setOpen} placement="right-start">
        {/* No chevron here: there is no room on a 48px rail, and as a bare
            <svg> it would survive the collapsed label rule and read as a
            second icon. */}
        <PopoverTrigger as={SidebarMenuButton} active={props.active} class={props.class}>
          {props.icon}
          <span>{props.label}</span>
        </PopoverTrigger>
        <PopoverContent class="zen-w-56 zen-p-2">
          <div class="zen-flex zen-items-center zen-gap-2 zen-px-2 zen-pb-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg">
            {props.label}
            <Show when={props.badge !== undefined}>
              <SidebarMenuBadge>{props.badge}</SidebarMenuBadge>
            </Show>
          </div>
          <ul class={cn(SUB_LIST_CLASS, "zen-ml-0 zen-border-l-0 zen-pl-0")}>{items()}</ul>
        </PopoverContent>
      </Popover>
    </Show>
  );
};

export const SidebarMenuSubItem = (props: ComponentProps<"li">) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <li class={cn("zen-w-full", local.class)} {...rest} />;
};

type SidebarMenuSubButtonOwnProps = {
  /** render as the current / selected item */
  active?: boolean;
  class?: string;
  children?: JSX.Element;
};

export type SidebarMenuSubButtonProps<T extends ValidComponent = "button"> = PolymorphicProps<
  T,
  SidebarMenuSubButtonOwnProps
>;

export const SidebarMenuSubButton = <T extends ValidComponent = "button">(
  rawProps: SidebarMenuSubButtonProps<T>,
) => {
  const props = mergeProps({ as: "button" as ValidComponent, active: false }, rawProps);
  const [local, rest] = splitProps(
    props as SidebarMenuSubButtonProps<"button"> & { as: ValidComponent },
    ["as", "class", "active"],
  );

  return (
    <Dynamic
      component={local.as}
      data-active={local.active || undefined}
      class={cn(
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-1.5 zen-text-sm zen-no-underline zen-transition-colors",
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
        local.active
          ? "zen-bg-zen-primary-soft zen-font-medium zen-text-zen-primary-soft-fg"
          : "zen-text-zen-foreground",
        local.class,
      )}
      {...rest}
    />
  );
};

type SidebarTriggerOwnProps = {
  class?: string;
  children?: JSX.Element;
};

export type SidebarTriggerProps<T extends ValidComponent = "button"> = PolymorphicProps<
  T,
  SidebarTriggerOwnProps
>;

/** Call an `onClick` that may be a plain handler or Solid's [handler, data] tuple. */
function callClickHandler<T extends HTMLElement>(
  handler: JSX.EventHandlerUnion<T, MouseEvent> | undefined,
  event: Parameters<JSX.EventHandler<T, MouseEvent>>[0],
) {
  if (!handler) return;
  if (typeof handler === "function") handler(event);
  else handler[0](handler[1], event);
}

export const SidebarTrigger = <T extends ValidComponent = "button">(
  rawProps: SidebarTriggerProps<T>,
) => {
  const { toggle } = useSidebar();
  const props = mergeProps({ as: "button" as ValidComponent }, rawProps);
  const [local, rest] = splitProps(
    props as SidebarTriggerProps<"button"> & { as: ValidComponent },
    ["as", "class", "onClick", "children"],
  );

  return (
    <Dynamic
      component={local.as}
      aria-label="Toggle sidebar"
      data-sidebar-trigger=""
      onClick={(e: Parameters<JSX.EventHandler<HTMLButtonElement, MouseEvent>>[0]) => {
        callClickHandler(local.onClick, e);
        toggle();
      }}
      class={cn(
        "zen-inline-flex zen-h-9 zen-w-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        local.class,
      )}
      {...rest}
    >
      <Show
        when={local.children}
        fallback={
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        }
      >
        {local.children}
      </Show>
    </Dynamic>
  );
};

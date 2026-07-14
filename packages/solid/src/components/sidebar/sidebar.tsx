import {
  type JSX,
  type Accessor,
  type ComponentProps,
  type ValidComponent,
  createContext,
  createMemo,
  createSignal,
  mergeProps,
  splitProps,
  useContext,
  Show,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "../../lib/cn";
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
}

export function SidebarProvider(props: SidebarProviderProps) {
  const [internal, setInternal] = createSignal(props.defaultCollapsed ?? false);
  const collapsed = createMemo(() => props.collapsed ?? internal());

  const setCollapsed = (v: boolean) => {
    if (props.collapsed === undefined) setInternal(v);
    props.onCollapsedChange?.(v);
  };

  const ctx: SidebarContextValue = {
    collapsed,
    setCollapsed,
    toggle: () => setCollapsed(!collapsed()),
  };

  return <SidebarContext.Provider value={ctx}>{props.children}</SidebarContext.Provider>;
}

export const Sidebar = (props: ComponentProps<"aside">) => {
  const { collapsed } = useSidebar();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <aside
      data-collapsed={collapsed() || undefined}
      class={cn(
        "zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width] zen-duration-200 zen-ease-in-out",
        collapsed() ? "zen-w-16" : "zen-w-64",
        local.class,
      )}
      {...rest}
    />
  );
};

export const SidebarHeader = (props: ComponentProps<"div">) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div class={cn("zen-flex zen-items-center zen-gap-2 zen-p-3", local.class)} {...rest} />
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
  const { collapsed } = useSidebar();
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
    <ul class={cn("zen-flex zen-w-full zen-flex-col zen-gap-0.5", local.class)} {...rest} />
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
  const { collapsed } = useSidebar();
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
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-2 zen-text-sm zen-font-medium zen-transition-colors",
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
        local.active && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
        collapsed() && "zen-justify-center zen-px-0 [&>span]:zen-hidden",
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

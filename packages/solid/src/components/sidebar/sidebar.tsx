import {
  type JSX,
  type Accessor,
  type ComponentProps,
  type ValidComponent,
  children as resolveChildren,
  createContext,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  createUniqueId,
  mergeProps,
  on,
  onCleanup,
  onMount,
  splitProps,
  untrack,
  useContext,
  Show,
} from "solid-js";
import { Dynamic, Portal } from "solid-js/web";
import {
  SIDEBAR_MENU_BUTTON_ATTR,
  afterWidthTransition,
  sidebarRailTooltip,
  watchSidebarScrollbar,
  type SidebarCollapseMode,
} from "@algorisys/zen-ui-core/sidebar";
import { cn } from "../../lib/cn";
import type { PolymorphicProps } from "../../lib/polymorphic";
import { Popover, PopoverContent } from "../popover/popover";
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
  collapsed: Accessor<boolean>;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
  /** Drawn as a rail: collapsed, in the icon or labelled mode, not as an overlay. What the parts style by. */
  rail: Accessor<boolean>;
  collapseMode: Accessor<SidebarCollapseMode>;
  /** The sidebar is an overlay right now (always, or because its container is narrow). */
  overlayActive: Accessor<boolean>;
  setOverlayActive: (v: boolean) => void;
  overlay: Accessor<boolean | { below: number } | undefined>;
  /**
   * The rail the parts are LAID OUT for, which can trail `rail`: collapsing
   * into the labelled rail keeps the rows as rows until the width has
   * arrived, then turns them into tiles. Everywhere else it equals `rail`.
   */
  railLayout: Accessor<"icon" | "labelled" | null>;
  setRailLayout: (v: "icon" | "labelled" | null) => void;
  /** The Sidebar's id, so SidebarTrigger can say which element it controls. */
  sidebarId: Accessor<string>;
  setSidebarId: (id: string) => void;
}

/** The rail the parts are laid out for right now, if any. */
const railOf = (ctx: SidebarContextValue): "icon" | "labelled" | null => ctx.railLayout();

// The whole sidebar is one scroller: a single thin scrollbar runs its full
// height, the header and footer stick to its ends, and every section sits in
// the same client width, so on a rail they all centre on one axis. The rail
// widens by the scrollbar's measured width (--zen-sidebar-gutter,
// watchSidebarScrollbar) rather than letting it eat into the tiles.
const SCROLLER = "zen-overflow-x-hidden zen-overflow-y-auto zen-[scrollbar-width:thin] zen-[scrollbar-color:var(--zen-color-border)_transparent]";

/** Every collapse transition runs on the same clock, so nothing finishes early and pops. */
const MOTION = "zen-duration-[var(--zen-sidebar-duration)] zen-ease-[var(--zen-sidebar-ease)]";

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

export function SidebarProvider(props: SidebarProviderProps) {
  const [internal, setInternal] = createSignal(props.defaultCollapsed ?? false);
  const collapsed = createMemo(() => props.collapsed ?? internal());

  const setCollapsed = (v: boolean) => {
    if (props.collapsed === undefined) setInternal(v);
    props.onCollapsedChange?.(v);
  };

  const [overlayActive, setOverlayActive] = createSignal(false);
  const collapseMode = () => props.collapseMode ?? "icon";
  const [sidebarId, setSidebarId] = createSignal(`zen-sidebar-${createUniqueId()}`);
  const [railLayout, setRailLayout] = createSignal<"icon" | "labelled" | null>(
    untrack(() => (collapsed() && collapseMode() !== "hidden" ? (collapseMode() === "labelled" ? "labelled" : "icon") : null)),
  );
  const ctx: SidebarContextValue = {
    collapsed,
    setCollapsed,
    toggle: () => setCollapsed(!collapsed()),
    rail: () => collapsed() && collapseMode() !== "hidden" && !overlayActive(),
    collapseMode,
    overlayActive,
    setOverlayActive,
    overlay: () => props.overlay,
    railLayout,
    setRailLayout,
    sidebarId,
    setSidebarId,
  };

  return <SidebarContext.Provider value={ctx}>{props.children}</SidebarContext.Provider>;
}

export const Sidebar = (props: ComponentProps<"aside">) => {
  const ctx = useSidebar();
  const [local, rest] = splitProps(props, ["class", "children", "ref", "id"]);
  // A caller's id wins; otherwise the provider's, which SidebarTrigger already points at.
  createRenderEffect(() => {
    if (local.id) ctx.setSidebarId(local.id);
  });
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

  // Collapsing into the labelled rail is sequenced: the width moves with the
  // rows still laid out as rows (truncating, as the icon rail's do), and only
  // once it has arrived do they become tiles. Switching the layout at once
  // made the menu finish on the first frame while the width spent the whole
  // duration catching up. Expanding, and the icon rail, switch at once.
  let cancelLayout: (() => void) | undefined;
  createEffect(
    on(
      () => [ctx.rail(), ctx.collapseMode()] as const,
      ([r, m], prev) => {
        cancelLayout?.();
        cancelLayout = undefined;
        const target = r ? (m === "labelled" ? "labelled" : "icon") : null;
        if (target === "labelled" && prev && !prev[0] && aside && !overlay()) {
          cancelLayout = afterWidthTransition(aside, () => ctx.setRailLayout("labelled"));
        } else {
          ctx.setRailLayout(target);
        }
      },
    ),
  );
  onCleanup(() => cancelLayout?.());
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

  // The rail's tooltip: one for the whole sidebar, positioned beside the row
  // under the pointer or keyboard focus. One element rather than a Tooltip
  // per row, so a 40-row menu mounts one popup instead of forty, and the
  // rows stay plain buttons/links whatever `as` they render. It repeats the
  // row's name, which the row already has, so it is hidden from assistive
  // tech rather than announced twice.
  const [tip, setTip] = createSignal<{ text: string; x: number; y: number; rtl: boolean } | null>(null);
  const rowAt = (t: EventTarget | null) => {
    if (!ctx.rail() || !(t instanceof Element)) return null;
    const row = t.closest<HTMLElement>(`[${SIDEBAR_MENU_BUTTON_ATTR}]`);
    return row && aside?.contains(row) ? row : null;
  };
  const showTip = (row: HTMLElement | null) => {
    const text = row ? sidebarRailTooltip(row, ctx.collapseMode()) : null;
    if (!row || !text) return setTip(null);
    const r = row.getBoundingClientRect();
    const rtl = getComputedStyle(row).direction === "rtl";
    setTip({ text, x: rtl ? r.left : r.right, y: r.top + r.height / 2, rtl });
  };
  const hideTip = () => setTip(null);
  createEffect(on(ctx.rail, hideTip, { defer: true }));

  const setAside = (el: HTMLElement) => {
    aside = el;
    if (!el.hasAttribute("data-overlay")) onCleanup(watchSidebarScrollbar(el));
    // Listeners, not JSX handlers, so a caller's own onClick / onFocusIn on
    // the Sidebar still reaches the element instead of being replaced.
    el.addEventListener("pointerover", (e) => showTip(rowAt(e.target)));
    el.addEventListener("pointerleave", hideTip);
    el.addEventListener("focusin", (e) => {
      const row = rowAt(e.target);
      if (row?.matches(":focus-visible")) showTip(row);
    });
    el.addEventListener("focusout", hideTip);
    el.addEventListener("click", hideTip);
    el.addEventListener("scroll", hideTip, true);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideTip();
    });
    if (typeof local.ref === "function") (local.ref as (el: HTMLElement) => void)(el);
  };

  const width = () => {
    if (hidden()) return "zen-w-0 zen-border-r-0";
    if (!ctx.collapsed()) return "zen-w-[var(--zen-sidebar-width)]";
    return ctx.collapseMode() === "labelled"
      ? "zen-w-[calc(var(--zen-sidebar-rail-labelled-width)+var(--zen-sidebar-gutter,0px))]"
      : "zen-w-[calc(var(--zen-sidebar-rail-width)+var(--zen-sidebar-gutter,0px))]";
  };

  return (
    <>
    <Show
      when={overlay()}
      fallback={
        <aside
          ref={(el: HTMLElement) => setAside(el)}
          id={ctx.sidebarId()}
          data-collapsed={ctx.collapsed() || undefined}
          data-rail={railOf(ctx) ?? undefined}
          inert={hidden() || undefined}
          class={cn(
            // Only the width animates, and everything inside is laid out so
            // it does not have to: rows keep their place and the aside clips
            // whatever no longer fits. It used to restyle every row on the
            // first frame while the width was still 256px, which threw each
            // icon 100px to the right and back, and on expand drew full
            // labels over the page from a 64px rail.
            "zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width]",
            SCROLLER,
            MOTION,
            // The labelled rail's own clock; every part inside reads it.
            // Collapsing is two half-clock steps, so it ends when the others do.
            ctx.collapseMode() === "labelled" &&
              (ctx.collapsed()
                ? "zen-[--zen-sidebar-duration:var(--zen-sidebar-labelled-step-duration)]"
                : "zen-[--zen-sidebar-duration:var(--zen-sidebar-labelled-duration)]"),
            width(),
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
        id={ctx.sidebarId()}
        data-collapsed={ctx.collapsed() || undefined}
        data-overlay=""
        class="zen-relative zen-z-30 zen-w-0 zen-shrink-0"
        {...rest}
      >
        <div
          ref={(el: HTMLDivElement) => {
            panel = el;
            onCleanup(watchSidebarScrollbar(el));
          }}
          inert={hidden() || undefined}
          class={cn(
            SCROLLER,
            "zen-absolute zen-inset-y-0 zen-start-0 zen-flex zen-w-64 zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-shadow-lg",
            // It slides in from its edge on the sidebar's clock rather than
            // appearing. Visibility is transitioned only on the way out, so
            // the panel stays drawn until the slide has finished. On the way
            // in it must not be: a transition's first frame holds its start
            // value, so the panel was still hidden when focus moved into it,
            // and the focus went nowhere.
            MOTION,
            hidden()
              ? "zen-invisible -zen-translate-x-full zen-transition-[transform,visibility] rtl:zen-translate-x-full"
              : "zen-transition-transform",
            local.class,
          )}
        >
          {content()}
        </div>
      </aside>
    </Show>
    <Show when={tip()}>
      {(t) => (
        <Portal>
          <div
            aria-hidden="true"
            data-sidebar-tooltip=""
            class={cn(
              "zen-pointer-events-none zen-fixed zen-z-50 zen-whitespace-nowrap zen-rounded-zen-md zen-bg-zen-neutral zen-px-2.5 zen-py-1.5 zen-text-xs zen-text-zen-neutral-fg zen-shadow-md zen-anim-fade-in -zen-translate-y-1/2",
              t().rtl ? "-zen-ml-2 -zen-translate-x-full" : "zen-ml-2",
            )}
            style={{ left: `${t().x}px`, top: `${t().y}px` }}
          >
            {t().text}
          </div>
        </Portal>
      )}
    </Show>
    </>
  );
};

export const SidebarHeader = (props: ComponentProps<"div">) => {
  const ctx = useSidebar();
  const [local, rest] = splitProps(props, ["class"]);
  const rail = () => railOf(ctx);
  return (
    <div
      class={cn(
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
        rail() === "icon"
          ? "zen-px-3.5"
          : rail() === "labelled"
            ? "zen-px-5.5"
            : "zen-px-3",
        rail() && "[&>span]:zen-opacity-0 [&>strong]:zen-opacity-0",
        local.class,
      )}
      {...rest}
    />
  );
};

/** The app or workspace name in SidebarHeader; on a rail it is read, not shown. */
export const SidebarHeaderLabel = (props: ComponentProps<"span">) => {
  const { rail } = useSidebar();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      class={cn(
        // Alone in the header (no toggle before it), it starts where the
        // menu's icons do rather than 8px left of them.
        "zen-min-w-0 zen-truncate zen-font-semibold zen-transition-opacity first:zen-ps-2",
        MOTION,
        rail() && "zen-opacity-0",
        local.class,
      )}
      {...rest}
    />
  );
};

/**
 * A count or status beside a menu row's label ("Accounts 29"), aligned at the
 * row's end. On the icon rail it is read with the label, not shown.
 */
export const SidebarMenuBadge = (props: ComponentProps<"span">) => {
  const ctx = useSidebar();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-sidebar-badge=""
      class={cn(
        "zen-ml-auto zen-min-w-5 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1.5 zen-text-center zen-text-xs zen-font-medium zen-tabular-nums zen-text-zen-muted-fg",
        // On the labelled rail the count is a small tab on the icon's top
        // corner, starting at the icon's edge so it never covers the glyph;
        // on the icon rail it fades with the label.
        railOf(ctx) === "labelled" &&
          "zen-absolute zen-top-0 zen-start-[calc(var(--zen-sidebar-rail-labelled-width)/2+var(--zen-space-1))] zen-min-w-4 zen-px-1 zen-anim-sidebar-label-rail",
        local.class,
      )}
      {...rest}
    />
  );
};

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
const insetX = (ctx: SidebarContextValue) => (railOf(ctx) === "labelled" ? "zen-px-1" : "zen-px-2");

export const SidebarContent = (props: ComponentProps<"div">) => {
  const ctx = useSidebar();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn(
        // Grows to push the footer to the bottom; it does not scroll itself —
        // the sidebar does, so one scrollbar spans the whole height.
        "zen-flex zen-flex-1 zen-flex-col zen-gap-1 zen-py-2 zen-transition-[padding]",
        MOTION,
        insetX(ctx),
        local.class,
      )}
      {...rest}
    />
  );
};

export const SidebarFooter = (props: ComponentProps<"div">) => {
  const ctx = useSidebar();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn(
        // Inset as SidebarContent is, so a menu row in the footer lines its
        // icon up with the rows above (it sat 4px further in at p-3) and fits
        // the rail.
        // Stuck to the bottom of the scrolling sidebar, over the menu.
        "zen-sticky zen-bottom-0 zen-z-10 zen-mt-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2 zen-overflow-hidden zen-border-t zen-border-zen-border zen-bg-zen-background zen-py-2 zen-transition-[padding]",
        MOTION,
        insetX(ctx),
        local.class,
      )}
      {...rest}
    />
  );
};

export const SidebarGroup = (props: ComponentProps<"div">) => {
  const ctx = useSidebar();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn(
        "zen-flex zen-flex-col zen-gap-1 zen-py-2",
        // The labelled rail has no room for a heading, so groups are told
        // apart by a hairline instead. A shadow, not a border, so it takes no
        // layout and nothing below it moves when it appears.
        railOf(ctx) === "labelled" && "zen-shadow-[0_-1px_0_var(--zen-color-border)] first:zen-shadow-none",
        local.class,
      )}
      {...rest}
    />
  );
};

export const SidebarGroupLabel = (props: ComponentProps<"div">) => {
  const ctx = useSidebar();
  const [local, rest] = splitProps(props, ["class", "children"]);
  // As SidebarMenuButton's label: fades only once the rail has moved.
  const [moved, setMoved] = createSignal(false);
  createEffect(on(ctx.railLayout, () => setMoved(true), { defer: true }));
  return (
    <div
      class={cn(
        "zen-grid zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg zen-transition-[grid-template-rows,opacity,padding]",
        MOTION,
        groupLabelClass(railOf(ctx), ctx.collapseMode() === "labelled", moved()),
        local.class,
      )}
      {...rest}
    >
      <span class="zen-min-h-0 zen-truncate">{local.children}</span>
    </div>
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
 */
// The label is `[&>span:not([data-sidebar-badge])]`, spelled out in every
// class below rather than interpolated: UnoCSS extracts classes from the
// source text, so a `${...}:zen-truncate` template generates no CSS at all.
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
    // As a link (as={A}) it would otherwise take the browser's underline
    // and link blue: zen-ui ships no element reset. SidebarMenuSubButton
    // has always set both.
    o.active ? "zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground",
    // The highlight is the row's own background, so on the labelled rail it
    // is the whole tile — icon and label, exactly the area that is clickable —
    // and it shrinks into that tile with the row rather than being redrawn.
    o.active ? "zen-bg-zen-primary-soft" : "hover:zen-bg-zen-muted",
  );
}

export const SidebarMenuButton = <T extends ValidComponent = "button">(
  rawProps: SidebarMenuButtonProps<T>,
) => {
  const ctx = useSidebar();
  const props = mergeProps({ as: "button" as ValidComponent, active: false }, rawProps);
  const [local, rest] = splitProps(
    props as SidebarMenuButtonProps<"button"> & { as: ValidComponent },
    ["as", "class", "active"],
  );
  // The labelled label only fades once the rail has actually moved — never
  // on first paint, which would hide a sidebar's labels behind an animation.
  const [moved, setMoved] = createSignal(false);
  createEffect(on(ctx.railLayout, () => setMoved(true), { defer: true }));

  return (
    <Dynamic
      component={local.as}
      data-active={local.active || undefined}
      {...{ [SIDEBAR_MENU_BUTTON_ATTR]: "" }}
      aria-current={local.active ? "page" : undefined}
      class={cn(
        menuButtonClass({
          active: !!local.active,
          rail: railOf(ctx),
          labelledMode: ctx.collapseMode() === "labelled",
          moved: moved(),
        }),
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

const Chevron = (props: { open: boolean; after?: boolean; faded?: boolean }) => (
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
    class={cn(
      props.after ? "zen-ml-1" : "zen-ml-auto",
      "zen-transition-[transform,opacity]",
      MOTION,
      props.open && "zen-rotate-90",
      // On a rail it would read as a second icon.
      props.faded && "zen-opacity-0",
    )}
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
  const { rail } = useSidebar();
  const props = mergeProps({ defaultOpen: false, active: false }, rawProps);
  const [internal, setInternal] = createSignal(props.defaultOpen);
  const isControlled = () => props.open !== undefined;
  const open = () => (isControlled() ? (props.open as boolean) : internal());

  const setOpen = (v: boolean) => {
    if (!isControlled()) setInternal(v);
    props.onOpenChange?.(v);
  };

  // Collapsing while a row is expanded would otherwise reopen it mid-flight as
  // a flyout, because both modes read the same `open`. Only the rail is
  // tracked: setOpen reads `props.open`, and tracking that too meant a
  // controlled flyout closed itself the moment its owner opened it.
  createEffect(
    on(rail, (r) => {
      if (r) untrack(() => setOpen(false));
    }),
  );

  // Resolved once: the inline list and the flyout both read the children,
  // and an unmemoised `props.children` getter rebuilds the caller's JSX on
  // every read. Only one of the two is ever mounted.
  const items = resolveChildren(() => props.children);

  // ONE row for both modes, with the flyout anchored to it, rather than a
  // different row per mode: swapping rows remounted this one on every
  // collapse, so it snapped to its rail position while every other row eased
  // there.
  let row: HTMLElement | undefined;
  // A pointerdown outside an open flyout closes it, and this row is outside
  // it, so the click that follows would reopen it. Kobalte closes it in the
  // capture phase, before the row hears the pointerdown, so the row cannot
  // simply read `open()` there: the close is flagged for the rest of the
  // event's dispatch (a macrotask, not a microtask, which would run between
  // the two listeners and clear it too early).
  let openAtPointerDown: boolean | null = null;
  let closedThisPointerDown = false;
  const onFlyoutOpenChange = (v: boolean) => {
    if (!v) {
      closedThisPointerDown = true;
      setTimeout(() => (closedThisPointerDown = false));
    }
    setOpen(v);
  };

  return (
    <Popover
      open={rail() && open()}
      onOpenChange={onFlyoutOpenChange}
      placement="right-start"
      anchorRef={() => row}
    >
      <SidebarMenuButton
        ref={(el: HTMLElement) => (row = el)}
        active={props.active}
        class={props.class}
        // `active` here means "holds the current item", not "is the page".
        aria-current={undefined}
        aria-expanded={open()}
        aria-haspopup={rail() ? "dialog" : undefined}
        onPointerDown={() => (openAtPointerDown = open() || closedThisPointerDown)}
        onClick={() => {
          setOpen(!(openAtPointerDown ?? open()));
          openAtPointerDown = null;
        }}
      >
        {props.icon}
        <span>{props.label}</span>
        <Show when={props.badge !== undefined}>
          <SidebarMenuBadge>{props.badge}</SidebarMenuBadge>
        </Show>
        <Chevron open={open() && !rail()} after={props.badge !== undefined} faded={rail()} />
      </SidebarMenuButton>
      {/* The inline list opens and closes on the sidebar's clock: its row
          track eases between 0fr and 1fr, so the rows below glide instead of
          jumping. Closed it is inert, so its links cannot take focus. On an
          open flyout the items move there, so the list is empty meanwhile. */}
      <div
        inert={!(open() && !rail()) || undefined}
        class={cn(
          "zen-grid zen-transition-[grid-template-rows,margin]",
          MOTION,
          // The list's own top margin moves out here, or a closed track
          // would still hold it open by 2px.
          open() && !rail() ? "zen-mt-0.5 zen-grid-rows-[1fr]" : "zen-mt-0 zen-grid-rows-[0fr]",
        )}
      >
        <ul class={cn(SUB_LIST_CLASS, "zen-mt-0 zen-min-h-0 zen-overflow-hidden")}>
          <Show when={!(rail() && open())}>{items()}</Show>
        </ul>
      </div>
      <PopoverContent
        class="zen-w-56 zen-p-2"
        onCloseAutoFocus={(e: Event) => {
          // With no Popover trigger there is nothing for Kobalte to return
          // focus to; give it back to the row unless it has moved elsewhere.
          e.preventDefault();
          queueMicrotask(() => {
            if (!document.activeElement || document.activeElement === document.body) {
              row?.focus({ preventScroll: true });
            }
          });
        }}
      >
        <div class="zen-flex zen-items-center zen-gap-2 zen-px-2 zen-pb-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg">
          {props.label}
          <Show when={props.badge !== undefined}>
            <SidebarMenuBadge>{props.badge}</SidebarMenuBadge>
          </Show>
        </div>
        <ul class={cn(SUB_LIST_CLASS, "zen-ml-0 zen-border-l-0 zen-pl-0")}>{items()}</ul>
      </PopoverContent>
    </Popover>
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
      aria-current={local.active ? "page" : undefined}
      class={cn(
        // One line, as the rows above are (shadcn truncates both): wrapped,
        // a sub-row grew taller as a closing sidebar narrowed and pushed every
        // row below it down mid-animation.
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden zen-whitespace-nowrap zen-rounded-zen-md zen-px-3 zen-py-1.5 zen-text-sm zen-no-underline zen-transition-colors [&>span]:zen-truncate",
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
  const loc = useLocale();
  const ctx = useSidebar();
  const props = mergeProps({ as: "button" as ValidComponent }, rawProps);
  const [local, rest] = splitProps(
    props as SidebarTriggerProps<"button"> & { as: ValidComponent },
    ["as", "class", "onClick", "children"],
  );

  return (
    <Dynamic
      component={local.as}
      type={local.as === "button" ? "button" : undefined}
      aria-label={loc.t("sidebar.toggleSidebar")}
      aria-expanded={!ctx.collapsed()}
      aria-controls={ctx.sidebarId()}
      data-sidebar-trigger=""
      onClick={(e: Parameters<JSX.EventHandler<HTMLButtonElement, MouseEvent>>[0]) => {
        callClickHandler(local.onClick, e);
        ctx.toggle();
      }}
      class={cn(
        "zen-inline-flex zen-h-9 zen-w-9 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
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

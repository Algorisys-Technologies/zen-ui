import { cn } from "../../lib/cn";
import {
  Disposer,
  toNodes,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { dismissable } from "../../lib/dismissable";
import { portal } from "../../lib/portal";
import { rovingFocus } from "../../lib/roving-focus";
import { setPresence } from "../../lib/presence";

/**
 * DropdownMenu — an action-menu on a trigger (kebab / user / context menus).
 *
 *   const dd = DropdownMenu({
 *     trigger: Button({ variant: "outline", children: "Options" }),
 *     items: [
 *       { label: "Profile", onSelect: () => …},
 *       { type: "separator" },
 *       { label: "Sign out", variant: "destructive", onSelect: () => …},
 *     ],
 *   });
 *   document.body.append(dd.el);
 *
 * This is NOT a form-input replacement — for that use `Select`.
 *
 * ## The divergence, and why this side of it
 *
 * React exposes Radix's compound parts — `<DropdownMenu>` / `<DropdownMenuTrigger
 * asChild>` / `<DropdownMenuContent>` / `<DropdownMenuItem>` / `…SubTrigger` /
 * `…CheckboxItem>` — wired to each other through React context. With no framework
 * there is no tree and no context, so the same shape would force the caller to
 * hand-thread the root into every part purely to look like React. That is
 * syntax-porting, which LOOPS XXXVI forbids, and it is the same call `select.ts`
 * and `popover.ts` made against the same primitive.
 *
 * So this takes the parts as data on one factory. Every capability of the compound
 * API survives: `trigger` is React's `DropdownMenuTrigger` (the `asChild` case is
 * the only case here), and the `items` array carries each item's kind — a plain
 * action, a `label`, a `separator`, a `checkbox`, a `radio` group, or a nested
 * `sub` menu — the same set React's sub-components expose.
 *
 * Radix supplies positioning, collision detection, keyboard navigation
 * (Arrow/Home/End), focus, dismissal and ARIA to the React binding. With no
 * primitive library this one writes them: `portal` mounts each panel to <body>
 * (so no ancestor's `overflow`/`transform`/`z-index` can clip or trap it),
 * `dismissable` gives Escape + click-outside, `rovingFocus` the arrow keys, and
 * the placement/flip logic below is Radix's floating middleware at the size this
 * library needs.
 *
 * These exports belong on check-parity's DIVERGENT list for the same reason
 * Select's and Popover's do.
 */

export type DropdownMenuSide = "top" | "right" | "bottom" | "left";
export type DropdownMenuAlign = "start" | "center" | "end";

/** A plain action row. The default kind, so `type` is optional. */
export interface DropdownMenuActionItem {
  type?: "item";
  label: Child;
  onSelect?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive";
  /** Pad the left as if a leading icon were present, to align with checkbox/radio rows. */
  inset?: boolean;
  /** Right-aligned hint text, e.g. "⌘B". React's DropdownMenuShortcut. */
  shortcut?: string;
}

/** A non-interactive group heading. React's DropdownMenuLabel. */
export interface DropdownMenuLabelItem {
  type: "label";
  label: Child;
  inset?: boolean;
}

/** A divider. React's DropdownMenuSeparator. */
export interface DropdownMenuSeparatorItem {
  type: "separator";
}

/** A boolean toggle. React's DropdownMenuCheckboxItem. */
export interface DropdownMenuCheckboxItemSpec {
  type: "checkbox";
  label: Child;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export interface DropdownMenuRadioOption {
  value: string;
  label: Child;
  disabled?: boolean;
}

/** A mutually-exclusive set. React's DropdownMenuRadioGroup + DropdownMenuRadioItem. */
export interface DropdownMenuRadioGroupSpec {
  type: "radio";
  value?: string;
  onValueChange?: (value: string) => void;
  options: DropdownMenuRadioOption[];
}

/** A nested submenu. React's DropdownMenuSub + SubTrigger + SubContent. */
export interface DropdownMenuSubSpec {
  type: "sub";
  label: Child;
  inset?: boolean;
  items: DropdownMenuItemSpec[];
}

export type DropdownMenuItemSpec =
  | DropdownMenuActionItem
  | DropdownMenuLabelItem
  | DropdownMenuSeparatorItem
  | DropdownMenuCheckboxItemSpec
  | DropdownMenuRadioGroupSpec
  | DropdownMenuSubSpec;

export interface DropdownMenuProps {
  /** The element that opens the menu. React's DropdownMenuTrigger (asChild). */
  trigger: Child;
  /** The menu contents, in order. */
  items: DropdownMenuItemSpec[];
  /** Preferred side of the trigger. Flips when it would leave the viewport. Default "bottom". */
  side?: DropdownMenuSide;
  /** Alignment along the chosen side. Default "start". */
  align?: DropdownMenuAlign;
  /** Gap between the trigger and the panel, in px. Default 4. */
  sideOffset?: number;
  /** Controlled open state. Present -> the caller owns it. */
  open?: boolean;
  /** Uncontrolled initial state. Default false. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Merged onto the content panel. React's DropdownMenuContent className. */
  class?: string;
  id?: string;
  [key: `data-${string}`]: unknown;
}

export interface DropdownMenuHandle extends ZenComponent<DropdownMenuProps> {
  open(): void;
  close(): void;
  readonly isOpen: boolean;
}

/* ---------------------------------------------------------------- class strings */
/* Carried over verbatim from the React DropdownMenu, plus `focus:`/`hover:`: Radix
 * paints highlight via `data-[highlighted]`, which vanilla's rovingFocus expresses
 * as real focus, so both are kept — the same choice button-family.ts made. */

const CONTENT_CLASS =
  "zen-z-50 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md zen-outline-none data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out";

const ITEM_CLASS =
  "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none focus:zen-bg-zen-muted hover:zen-bg-zen-muted data-[highlighted]:zen-bg-zen-muted aria-disabled:zen-pointer-events-none aria-disabled:zen-opacity-50";

const ITEM_DESTRUCTIVE =
  "zen-text-zen-error focus:zen-bg-zen-error-soft focus:zen-text-zen-error-soft-fg hover:zen-bg-zen-error-soft hover:zen-text-zen-error-soft-fg data-[highlighted]:zen-bg-zen-error-soft data-[highlighted]:zen-text-zen-error-soft-fg";

const CHECK_ITEM_CLASS =
  "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none focus:zen-bg-zen-muted hover:zen-bg-zen-muted data-[highlighted]:zen-bg-zen-muted aria-disabled:zen-pointer-events-none aria-disabled:zen-opacity-50";

const SUB_TRIGGER_CLASS =
  "zen-flex zen-cursor-default zen-items-center zen-gap-2 zen-select-none zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none focus:zen-bg-zen-muted hover:zen-bg-zen-muted data-[state=open]:zen-bg-zen-muted data-[highlighted]:zen-bg-zen-muted";

const LABEL_CLASS = "zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg";
const SEPARATOR_CLASS = "-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border";
const SHORTCUT_CLASS = "zen-ml-auto zen-text-xs zen-tracking-widest zen-text-zen-muted-fg";
const INDICATOR_CLASS =
  "zen-absolute zen-left-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center";

/* ------------------------------------------------------------------- icons (ours) */
const CHECK_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const DOT_ICON = `<svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="6"/></svg>`;
const CHEVRON_RIGHT_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="zen-ml-auto" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;

const svgSpan = (className: string, svg: string): HTMLSpanElement => {
  const s = document.createElement("span");
  s.className = className;
  // Our own trusted markup, never a caller's string — see PORTING.md.
  s.innerHTML = svg;
  return s;
};

/* ----------------------------------------------------------------------- helpers */
const VIEWPORT_PADDING = 8;

const OPPOSITE: Record<DropdownMenuSide, DropdownMenuSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

const MENU_ITEM_SEL = "[data-menu-item]";

/** The navigable rows inside one panel, in DOM order, disabled ones excluded. */
const focusablesIn = (panel: HTMLElement): HTMLElement[] =>
  [...panel.querySelectorAll<HTMLElement>(MENU_ITEM_SEL)].filter(
    (el) => el.getAttribute("aria-disabled") !== "true",
  );

/** Pull the interactive element out of a trigger child (a component's `.el` or a raw node). */
function elementOf(child: Child): HTMLElement {
  const el = toNodes(child).find((n): n is HTMLElement => n instanceof HTMLElement);
  if (!el) throw new Error("DropdownMenu trigger must render an element");
  return el;
}

/**
 * Place a panel against its anchor for the preferred side, flipping to the
 * opposite side when the preferred one would run off-screen, then clamping the
 * cross-axis into the viewport. Radix's floating middleware at this library's size.
 */
function placePanel(
  anchor: HTMLElement,
  panel: HTMLElement,
  side: DropdownMenuSide,
  align: DropdownMenuAlign,
  offset: number,
): void {
  const a = anchor.getBoundingClientRect();
  const cw = panel.offsetWidth;
  const ch = panel.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  const fits = (s: DropdownMenuSide): boolean => {
    if (s === "top") return a.top - offset - ch >= VIEWPORT_PADDING;
    if (s === "bottom") return a.bottom + offset + ch <= vh - VIEWPORT_PADDING;
    if (s === "left") return a.left - offset - cw >= VIEWPORT_PADDING;
    return a.right + offset + cw <= vw - VIEWPORT_PADDING;
  };

  let sd = side;
  if (!fits(sd) && fits(OPPOSITE[sd])) sd = OPPOSITE[sd];

  let top: number;
  let left: number;
  if (sd === "top" || sd === "bottom") {
    top = sd === "top" ? a.top - offset - ch : a.bottom + offset;
    left = align === "start" ? a.left : align === "end" ? a.right - cw : a.left + a.width / 2 - cw / 2;
  } else {
    left = sd === "left" ? a.left - offset - cw : a.right + offset;
    top = align === "start" ? a.top : align === "end" ? a.bottom - ch : a.top + a.height / 2 - ch / 2;
  }

  left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - cw - VIEWPORT_PADDING));
  top = Math.max(VIEWPORT_PADDING, Math.min(top, vh - ch - VIEWPORT_PADDING));

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.dataset.side = sd;
  panel.dataset.align = align;
}

interface LayoutEntry {
  panel: HTMLElement;
  anchor: HTMLElement;
  side: DropdownMenuSide;
  align: DropdownMenuAlign;
  offset: number;
}

interface PanelHandle {
  panel: HTMLElement;
  close: () => void;
  openSub: PanelHandle | null;
  openSubTrigger: HTMLElement | null;
}

let uid = 0;

export function DropdownMenu(props: DropdownMenuProps): DropdownMenuHandle {
  let current: DropdownMenuProps = { ...props };
  const id = current.id ?? `zen-dropdown-menu-${++uid}`;
  const contentId = `${id}-content`;

  const p = portal();

  // The wrapper stays inline where the caller drops it and holds the trigger.
  // Every panel lives in the portal, not here.
  const wrapper = document.createElement("span");
  wrapper.className = "zen-inline-flex";

  const triggerEl = elementOf(current.trigger);
  triggerEl.setAttribute("aria-haspopup", "menu");
  triggerEl.setAttribute("aria-expanded", "false");
  triggerEl.setAttribute("aria-controls", contentId);
  triggerEl.setAttribute("data-state", "closed");
  wrapper.append(triggerEl);

  /** All open panels, for the outside-click ignore list (root + any open subs). */
  const ignoreList: HTMLElement[] = [];
  /** All open panels, for re-placing on scroll/resize. */
  const layout: LayoutEntry[] = [];

  let rootHandle: PanelHandle | null = null;
  let mounted = false;
  let session: Disposer | null = null;
  /** Where to land focus on the next open: keyboard-up opens on the last row. */
  let pendingFocus: "first" | "last" = "first";

  const state = controllable<boolean>({
    value: current.open,
    defaultValue: current.defaultOpen ?? false,
    onChange: (o) => current.onOpenChange?.(o),
  });

  const closeAll = () => state.set(false);

  /* Build one interactive row and register its listeners on `disposer`. */
  const buildItem = (
    panel: HTMLElement,
    spec: DropdownMenuItemSpec,
    disposer: Disposer,
    openSubFor: (spec: DropdownMenuSubSpec, subTrigger: HTMLElement, focusFirst: boolean) => void,
  ): void => {
    const kind = "type" in spec ? spec.type : "item";

    if (kind === "separator") {
      const sep = document.createElement("div");
      sep.setAttribute("role", "separator");
      sep.setAttribute("aria-orientation", "horizontal");
      sep.className = SEPARATOR_CLASS;
      panel.append(sep);
      return;
    }

    if (kind === "label") {
      const s = spec as DropdownMenuLabelItem;
      const l = document.createElement("div");
      l.className = cn(LABEL_CLASS, s.inset && "zen-pl-8");
      l.append(...toNodes(s.label));
      panel.append(l);
      return;
    }

    if (kind === "checkbox") {
      const s = spec as DropdownMenuCheckboxItemSpec;
      const item = document.createElement("div");
      item.dataset.menuItem = "";
      item.setAttribute("role", "menuitemcheckbox");
      item.setAttribute("aria-checked", String(Boolean(s.checked)));
      item.setAttribute("data-state", s.checked ? "checked" : "unchecked");
      item.tabIndex = -1;
      if (s.disabled) item.setAttribute("aria-disabled", "true");
      item.className = CHECK_ITEM_CLASS;
      const indicator = svgSpan(INDICATOR_CLASS, CHECK_ICON);
      if (!s.checked) indicator.style.visibility = "hidden";
      item.append(indicator);
      item.append(...toNodes(s.label));
      if (!s.disabled) {
        const select = () => {
          s.onCheckedChange?.(!s.checked);
          closeAll();
        };
        wireRow(item, select, disposer, openSubFor, null);
      }
      panel.append(item);
      return;
    }

    if (kind === "radio") {
      const s = spec as DropdownMenuRadioGroupSpec;
      const group = document.createElement("div");
      group.setAttribute("role", "group");
      for (const opt of s.options) {
        const item = document.createElement("div");
        item.dataset.menuItem = "";
        item.setAttribute("role", "menuitemradio");
        const selected = opt.value === s.value;
        item.setAttribute("aria-checked", String(selected));
        item.setAttribute("data-state", selected ? "checked" : "unchecked");
        item.tabIndex = -1;
        if (opt.disabled) item.setAttribute("aria-disabled", "true");
        item.className = CHECK_ITEM_CLASS;
        const indicator = svgSpan(INDICATOR_CLASS, DOT_ICON);
        if (!selected) indicator.style.visibility = "hidden";
        item.append(indicator);
        item.append(...toNodes(opt.label));
        if (!opt.disabled) {
          const select = () => {
            s.onValueChange?.(opt.value);
            closeAll();
          };
          wireRow(item, select, disposer, openSubFor, null);
        }
        group.append(item);
      }
      panel.append(group);
      return;
    }

    if (kind === "sub") {
      const s = spec as DropdownMenuSubSpec;
      const item = document.createElement("div");
      item.dataset.menuItem = "";
      item.setAttribute("role", "menuitem");
      item.setAttribute("aria-haspopup", "menu");
      item.setAttribute("aria-expanded", "false");
      item.setAttribute("data-state", "closed");
      item.tabIndex = -1;
      item.className = cn(SUB_TRIGGER_CLASS, s.inset && "zen-pl-8");
      item.append(...toNodes(s.label));
      item.append(svgSpan("zen-ml-auto zen-inline-flex", CHEVRON_RIGHT_ICON));
      wireRow(item, () => openSubFor(s, item, true), disposer, openSubFor, s);
      panel.append(item);
      return;
    }

    // default action item
    const s = spec as DropdownMenuActionItem;
    const item = document.createElement("div");
    item.dataset.menuItem = "";
    item.setAttribute("role", "menuitem");
    item.tabIndex = -1;
    if (s.disabled) item.setAttribute("aria-disabled", "true");
    item.className = cn(
      ITEM_CLASS,
      s.variant === "destructive" && ITEM_DESTRUCTIVE,
      s.inset && "zen-pl-8",
    );
    item.append(...toNodes(s.label));
    if (s.shortcut) {
      const sc = document.createElement("span");
      sc.className = SHORTCUT_CLASS;
      sc.textContent = s.shortcut;
      item.append(sc);
    }
    if (!s.disabled) {
      const select = () => {
        s.onSelect?.();
        closeAll();
      };
      wireRow(item, select, disposer, openSubFor, null);
    }
    panel.append(item);
  };

  /**
   * The interaction every focusable row shares. A `sub` row opens its submenu
   * instead of selecting, and opens it on hover; every other row selects on
   * click/Enter/Space and only focuses on hover (Radix hover-focuses items).
   */
  const wireRow = (
    item: HTMLElement,
    activate: () => void,
    disposer: Disposer,
    openSubFor: (spec: DropdownMenuSubSpec, subTrigger: HTMLElement, focusFirst: boolean) => void,
    sub: DropdownMenuSubSpec | null,
  ): void => {
    const onClick = () => activate();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      } else if (sub && (e.key === "ArrowRight")) {
        e.preventDefault();
        openSubFor(sub, item, true);
      }
    };
    const onEnter = () => {
      item.focus();
      if (sub) openSubFor(sub, item, false);
    };
    item.addEventListener("click", onClick);
    item.addEventListener("keydown", onKey);
    item.addEventListener("pointerenter", onEnter);
    disposer.add(() => {
      item.removeEventListener("click", onClick);
      item.removeEventListener("keydown", onKey);
      item.removeEventListener("pointerenter", onEnter);
    });
  };

  /**
   * Mount one menu panel — the root, or a submenu. Recurses for submenus, so the
   * same placement, roving-focus and dismissal machinery serves every depth.
   */
  const mountMenu = (
    items: DropdownMenuItemSpec[],
    anchor: HTMLElement,
    side: DropdownMenuSide,
    align: DropdownMenuAlign,
    offset: number,
    extraClass: string | undefined,
    onCollapse: (() => void) | undefined,
  ): PanelHandle => {
    const panel = document.createElement("div");
    panel.setAttribute("role", "menu");
    panel.tabIndex = -1;
    panel.style.position = "fixed";
    panel.style.margin = "0";
    panel.className = cn(CONTENT_CLASS, extraClass);

    const panelDisposer = new Disposer();
    const handle: PanelHandle = { panel, close: () => {}, openSub: null, openSubTrigger: null };

    const closeSub = () => {
      if (!handle.openSub) return;
      handle.openSub.close();
      handle.openSubTrigger?.setAttribute("data-state", "closed");
      handle.openSubTrigger?.setAttribute("aria-expanded", "false");
      handle.openSub = null;
      handle.openSubTrigger = null;
    };

    const openSubFor = (spec: DropdownMenuSubSpec, subTrigger: HTMLElement, focusFirst: boolean) => {
      if (handle.openSubTrigger === subTrigger) {
        if (focusFirst) focusablesIn(handle.openSub!.panel)[0]?.focus();
        return;
      }
      closeSub();
      subTrigger.setAttribute("data-state", "open");
      subTrigger.setAttribute("aria-expanded", "true");
      const sub = mountMenu(spec.items, subTrigger, "right", "start", 4, undefined, () => {
        closeSub();
        subTrigger.focus();
      });
      handle.openSub = sub;
      handle.openSubTrigger = subTrigger;
      if (focusFirst) focusablesIn(sub.panel)[0]?.focus();
    };

    for (const spec of items) buildItem(panel, spec, panelDisposer, openSubFor);

    p.mount(panel);
    ignoreList.push(panel);
    // Measure and place while the panel is in the document but before the state
    // flips — offsetWidth/Height are 0 for an unmounted node.
    placePanel(anchor, panel, side, align, offset);
    layout.push({ panel, anchor, side, align, offset });
    setPresence(panel, "open");

    panelDisposer.add(
      rovingFocus(panel, {
        items: () => focusablesIn(panel),
        orientation: "vertical",
      }),
    );

    // Highlight parity + collapse a sibling submenu when focus moves off its trigger.
    const onFocusIn = (e: FocusEvent) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>(MENU_ITEM_SEL);
      if (!item || !panel.contains(item)) return;
      for (const el of panel.querySelectorAll<HTMLElement>(MENU_ITEM_SEL)) {
        if (el === item) el.setAttribute("data-highlighted", "");
        else el.removeAttribute("data-highlighted");
      }
      if (handle.openSubTrigger && item !== handle.openSubTrigger) closeSub();
    };
    panel.addEventListener("focusin", onFocusIn);
    panelDisposer.add(() => panel.removeEventListener("focusin", onFocusIn));

    const onKeydown = (e: KeyboardEvent) => {
      // Tab dismisses the whole menu (Radix's behaviour), then moves on normally.
      if (e.key === "Tab") {
        closeAll();
        return;
      }
      // ArrowLeft collapses a submenu back to its parent trigger.
      if (e.key === "ArrowLeft" && onCollapse) {
        e.preventDefault();
        onCollapse();
      }
    };
    panel.addEventListener("keydown", onKeydown);
    panelDisposer.add(() => panel.removeEventListener("keydown", onKeydown));

    handle.close = () => {
      closeSub();
      const i = ignoreList.indexOf(panel);
      if (i >= 0) ignoreList.splice(i, 1);
      const li = layout.findIndex((l) => l.panel === panel);
      if (li >= 0) layout.splice(li, 1);
      panelDisposer.dispose();
      setPresence(panel, "closed", () => panel.remove());
    };

    return handle;
  };

  const doOpen = () => {
    if (mounted) return;
    mounted = true;
    ignoreList.length = 0;
    layout.length = 0;
    // The trigger toggles the menu itself; a press on it must not also read as an
    // outside click, or the two cancel and the menu never opens.
    ignoreList.push(triggerEl);

    rootHandle = mountMenu(
      current.items,
      triggerEl,
      current.side ?? "bottom",
      current.align ?? "start",
      current.sideOffset ?? 4,
      current.class,
      undefined,
    );
    rootHandle.panel.id = contentId;

    triggerEl.setAttribute("aria-expanded", "true");
    triggerEl.setAttribute("data-state", "open");

    session = new Disposer();
    const onReflow = () => {
      for (const l of layout) placePanel(l.anchor, l.panel, l.side, l.align, l.offset);
    };
    window.addEventListener("scroll", onReflow, { capture: true, passive: true });
    window.addEventListener("resize", onReflow);
    session.add(() =>
      window.removeEventListener("scroll", onReflow, { capture: true } as EventListenerOptions),
    );
    session.add(() => window.removeEventListener("resize", onReflow));
    session.add(
      dismissable(rootHandle.panel, {
        ignore: ignoreList,
        onDismiss: () => state.set(false),
      }),
    );

    const rows = focusablesIn(rootHandle.panel);
    (pendingFocus === "last" ? rows[rows.length - 1] : rows[0])?.focus();
    pendingFocus = "first";
  };

  const doClose = () => {
    if (!mounted) return;
    mounted = false;
    session?.dispose();
    session = null;
    rootHandle?.close();
    rootHandle = null;
    ignoreList.length = 0;
    layout.length = 0;
    triggerEl.setAttribute("aria-expanded", "false");
    triggerEl.setAttribute("data-state", "closed");
    triggerEl.focus();
  };

  const disposer = new Disposer();
  disposer.add(state.subscribe((o) => (o ? doOpen() : doClose())));

  const onTriggerClick = () => {
    pendingFocus = "first";
    state.set(!mounted);
  };
  const onTriggerKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pendingFocus = "first";
      state.set(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      pendingFocus = "last";
      state.set(true);
    }
  };
  triggerEl.addEventListener("click", onTriggerClick);
  triggerEl.addEventListener("keydown", onTriggerKey);
  disposer.add(() => triggerEl.removeEventListener("click", onTriggerClick));
  disposer.add(() => triggerEl.removeEventListener("keydown", onTriggerKey));
  disposer.add(() => session?.dispose());

  // Honour defaultOpen / a controlled open=true on first build.
  if (state.get()) doOpen();

  const api: DropdownMenuHandle = {
    el: wrapper,
    get isOpen() {
      return mounted;
    },
    open() {
      state.set(true);
    },
    close() {
      state.set(false);
    },
    update(next) {
      current = { ...current, ...next };
      if (next.open !== undefined) state.sync(next.open);
      if (mounted) {
        // The simplest correct re-render for a menu whose contents changed: close
        // and reopen it, so every listener and submenu is rebuilt from `current`.
        doClose();
        doOpen();
      }
    },
    destroy() {
      disposer.dispose();
      p.destroy();
      wrapper.remove();
    },
  };

  return api;
}

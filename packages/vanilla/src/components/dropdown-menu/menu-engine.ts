import { cn } from "../../lib/cn";
import { arrowStep } from "@algorisys/zen-ui-core";
import { Disposer, toNodes, type Child } from "../../lib/component";
import type { Portal } from "../../lib/portal";
import { rovingFocus } from "../../lib/roving-focus";
import { setPresence } from "../../lib/presence";

/**
 * The menu machinery DropdownMenu and ContextMenu share: the item spec types,
 * the class strings and icons, placement with flip, and the panel builder
 * (rows, submenus, roving focus, Tab-to-dismiss). Moved here verbatim out of
 * dropdown-menu.ts so ContextMenu draws its rows from the same code, which is
 * what keeps the two menus identical in look and behaviour (React does the
 * same with `menu-parts.tsx`; in Solid, ContextMenu reuses DropdownMenu's
 * item components outright).
 *
 * The one generalisation: a panel's anchor is anything with a
 * `getBoundingClientRect()`, so ContextMenu can anchor its root panel to the
 * pointer (a zero-size rect) where DropdownMenu anchors to its trigger.
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
  /**
   * Default true. False keeps the menu open and toggles the row in place: a
   * scope picked before an action in the same menu (React's CheckboxItem with
   * `onSelect={(e) => e.preventDefault()}`).
   */
  closeOnSelect?: boolean;
}

export interface DropdownMenuRadioOption {
  value: string;
  label: Child;
  disabled?: boolean;
  /**
   * Close the menu when this option is chosen. Default true, which is what this
   * binding has always done and what React's DropdownMenuRadioItem does
   * (Solid's default is false: Kobalte keeps radio items open). A picker that
   * passes it explicitly behaves the same in every binding. With false, the menu
   * stays open and the chosen row shows as checked at once, without the caller
   * rebuilding `items`.
   */
  closeOnSelect?: boolean;
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

/* ---------------------------------------------------------------- class strings */
/* Carried over verbatim from the React DropdownMenu, plus `focus:`/`hover:`: Radix
 * paints highlight via `data-[highlighted]`, which vanilla's rovingFocus expresses
 * as real focus, so both are kept — the same choice button-family.ts made. */

export const CONTENT_CLASS =
  "zen-z-50 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md zen-outline-none data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out";

const ITEM_CLASS =
  "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-zen-menu-y zen-text-sm zen-outline-none focus:zen-bg-zen-muted hover:zen-bg-zen-muted data-[highlighted]:zen-bg-zen-muted aria-disabled:zen-pointer-events-none aria-disabled:zen-opacity-50";

const ITEM_DESTRUCTIVE =
  "zen-text-zen-error focus:zen-bg-zen-error-soft focus:zen-text-zen-error-soft-fg hover:zen-bg-zen-error-soft hover:zen-text-zen-error-soft-fg data-[highlighted]:zen-bg-zen-error-soft data-[highlighted]:zen-text-zen-error-soft-fg";

const CHECK_ITEM_CLASS =
  "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-zen-menu-y zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none focus:zen-bg-zen-muted hover:zen-bg-zen-muted data-[highlighted]:zen-bg-zen-muted aria-disabled:zen-pointer-events-none aria-disabled:zen-opacity-50";

const SUB_TRIGGER_CLASS =
  "zen-flex zen-cursor-default zen-items-center zen-gap-2 zen-select-none zen-rounded-zen-sm zen-px-2 zen-py-zen-menu-y zen-text-sm zen-outline-none focus:zen-bg-zen-muted hover:zen-bg-zen-muted data-[state=open]:zen-bg-zen-muted data-[highlighted]:zen-bg-zen-muted";

const LABEL_CLASS = "zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg";
const SEPARATOR_CLASS = "-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border";
const SHORTCUT_CLASS = "zen-ml-auto zen-text-xs zen-tracking-widest zen-text-zen-muted-fg";
const INDICATOR_CLASS =
  "zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center";

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
export const focusablesIn = (panel: HTMLElement): HTMLElement[] =>
  [...panel.querySelectorAll<HTMLElement>(MENU_ITEM_SEL)].filter(
    (el) => el.getAttribute("aria-disabled") !== "true",
  );
/** What a panel is placed against: an element, or a point (a zero-size rect). */
export interface MenuAnchor {
  getBoundingClientRect(): DOMRect;
}


/**
 * Place a panel against its anchor for the preferred side, flipping to the
 * opposite side when the preferred one would run off-screen, then clamping the
 * cross-axis into the viewport. Radix's floating middleware at this library's size.
 */
export function placePanel(
  anchor: MenuAnchor,
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

export interface LayoutEntry {
  panel: HTMLElement;
  anchor: MenuAnchor;
  side: DropdownMenuSide;
  align: DropdownMenuAlign;
  offset: number;
}

export interface PanelHandle {
  panel: HTMLElement;
  close: () => void;
  openSub: PanelHandle | null;
  openSubTrigger: HTMLElement | null;
}

export interface MenuEngineOptions {
  /** Where every panel mounts. Owned (and destroyed) by the caller. */
  portal: Portal;
  /** Selecting an item closes the whole menu: the caller's own close. */
  closeAll: () => void;
  /**
   * The pointer event that focuses a row (and opens a submenu) on hover.
   * DropdownMenu keeps `pointerenter`. ContextMenu uses `pointermove`, as
   * Radix's items do: a menu opened from the KEYBOARD can appear under a
   * resting mouse, and the boundary event the browser sends for that would
   * take focus off the first item. A pointermove means the mouse moved.
   */
  hoverEvent?: "pointerenter" | "pointermove";
}

export interface MenuEngine {
  /** All open panels, for the outside-click ignore list (root + any open subs). */
  ignoreList: HTMLElement[];
  /** All open panels, for re-placing on scroll/resize. */
  layout: LayoutEntry[];
  /**
   * Mount one menu panel — the root, or a submenu. Recurses for submenus, so the
   * same placement, roving-focus and dismissal machinery serves every depth.
   */
  mountMenu(
    items: DropdownMenuItemSpec[],
    anchor: MenuAnchor,
    side: DropdownMenuSide,
    align: DropdownMenuAlign,
    offset: number,
    extraClass: string | undefined,
    onCollapse: (() => void) | undefined,
  ): PanelHandle;
}

export function createMenuEngine({
  portal: p,
  closeAll,
  hoverEvent = "pointerenter",
}: MenuEngineOptions): MenuEngine {
  /** All open panels, for the outside-click ignore list (root + any open subs). */
  const ignoreList: HTMLElement[] = [];
  /** All open panels, for re-placing on scroll/resize. */
  const layout: LayoutEntry[] = [];

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
        let checked = Boolean(s.checked);
        const select = () => {
          s.onCheckedChange?.(!checked);
          if (s.closeOnSelect !== false) {
            closeAll();
            return;
          }
          checked = !checked;
          item.setAttribute("aria-checked", String(checked));
          item.setAttribute("data-state", checked ? "checked" : "unchecked");
          indicator.style.visibility = checked ? "" : "hidden";
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
            if (opt.closeOnSelect !== false) {
              closeAll();
              return;
            }
            // Staying open: show the choice now. The rows are this group's own,
            // so the caller's `items` is left as it was (and is what a reopen draws).
            for (const row of group.children) {
              const on = row === item;
              row.setAttribute("aria-checked", String(on));
              row.setAttribute("data-state", on ? "checked" : "unchecked");
              (row.firstElementChild as HTMLElement).style.visibility = on ? "" : "hidden";
            }
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
        // Opening a submenu goes FORWARD, which is ArrowLeft in RTL.
      } else if (sub && arrowStep(e.key, e.currentTarget as Element) === 1) {
        e.preventDefault();
        openSubFor(sub, item, true);
      }
    };
    const onEnter = () => {
      if (document.activeElement !== item) item.focus();
      if (sub) openSubFor(sub, item, false);
    };
    item.addEventListener("click", onClick);
    item.addEventListener("keydown", onKey);
    item.addEventListener(hoverEvent, onEnter);
    disposer.add(() => {
      item.removeEventListener("click", onClick);
      item.removeEventListener("keydown", onKey);
      item.removeEventListener(hoverEvent, onEnter);
    });
  };

  /**
   * Mount one menu panel — the root, or a submenu. Recurses for submenus, so the
   * same placement, roving-focus and dismissal machinery serves every depth.
   */
  const mountMenu = (
    items: DropdownMenuItemSpec[],
    anchor: MenuAnchor,
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
      // Collapsing a submenu goes BACK, which is ArrowRight in RTL.
      if (arrowStep(e.key, e.currentTarget as Element) === -1 && onCollapse) {
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

  return { ignoreList, layout, mountMenu };
}

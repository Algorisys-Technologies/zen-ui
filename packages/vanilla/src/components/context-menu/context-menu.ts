import { cn } from "../../lib/cn";
import { applyProps, Disposer, setChildren, type Child, type ZenComponent } from "../../lib/component";
import { dismissable } from "../../lib/dismissable";
import { portal } from "../../lib/portal";
import {
  createMenuEngine,
  focusablesIn,
  placePanel,
  type DropdownMenuItemSpec,
  type MenuAnchor,
  type PanelHandle,
} from "../dropdown-menu/menu-engine";

/**
 * ContextMenu — the menu a right-click opens, at the pointer.
 *
 *   const cm = ContextMenu({
 *     class: "zen-flex zen-h-40 …",
 *     children: "Right-click here",            // the rows, the canvas, the thing it acts on
 *     items: [
 *       { label: "Open in new tab", onSelect: openInNewTab },
 *       { label: "Copy", shortcut: "⌘C", onSelect: copy },
 *       { type: "separator" },
 *       { label: "Delete…", variant: "destructive", onSelect: remove },
 *     ],
 *   });
 *   document.body.append(cm.el);
 *
 * It opens from the keyboard too: the menu key or Shift+F10 on anything
 * focused inside the area opens it at that element's corner, with the first
 * item active. A long press (700ms, as Radix's) opens it on touch.
 *
 * ## The divergence, and why this side of it
 *
 * React exposes Radix's compound parts (`ContextMenuTrigger`,
 * `ContextMenuContent`, `ContextMenuItem`, `…Sub`, `…CheckboxItem`, …). This
 * binding's DropdownMenu already takes those parts as DATA (see the note in
 * dropdown-menu.ts), and ContextMenu takes exactly the same `items` — the same
 * spec type, rendered by the same code (`menu-engine.ts`) with the same
 * classes, so the two menus look and behave identically, as they do in React
 * (shared `menu-parts.tsx`) and Solid (shared item components). The returned
 * `el` IS the trigger area (React's `ContextMenuTrigger`, a `<span>` as Radix
 * renders it): `class` and the other root props land on it, and `contentClass`
 * is React's `ContextMenuContent className`.
 *
 * To make one menu serve many things (a list, a table), read what was
 * right-clicked in `onContextMenu` — it runs BEFORE the menu opens — and
 * `update({ items })` there; the menu opens with the new items.
 */

export interface ContextMenuProps {
  /** What the area contains: the rows, the canvas, the thing the menu acts on. */
  children?: Child;
  /** The menu contents, in order: the same specs DropdownMenu takes. */
  items: DropdownMenuItemSpec[];
  /** No menu opens; the browser's own context menu is left alone. */
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Runs first, before the menu opens, for a right-click, a long press and the
   * menu key alike. Read the target here and `update({ items })`; move focus to
   * what was right-clicked and focus returns there on close. Call
   * `e.preventDefault()` to keep the menu shut.
   */
  onContextMenu?: (e: MouseEvent) => void;
  /**
   * Where focus goes when the menu closes; call `e.preventDefault()` to put it
   * somewhere yourself. By default it returns to what had focus inside the
   * area when the menu opened (the row, cell or item the menu is for).
   */
  onCloseAutoFocus?: (e: Event) => void;
  /** Merged onto the trigger area (`el`). React's ContextMenuTrigger className. */
  class?: string;
  /** Merged onto the menu panel. React's ContextMenuContent className. */
  contentClass?: string;
  id?: string;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

export interface ContextMenuHandle extends ZenComponent<ContextMenuProps> {
  close(): void;
  readonly isOpen: boolean;
}

/** Radix's long-press delay. */
const LONG_PRESS_MS = 700;

const pointAt = (x: number, y: number): MenuAnchor => ({
  getBoundingClientRect: () => new DOMRect(x, y, 0, 0),
});

export function ContextMenu(props: ContextMenuProps): ContextMenuHandle {
  let current: ContextMenuProps = { ...props };
  const disposer = new Disposer();
  const p = portal();

  const area = document.createElement("span");
  area.setAttribute("data-state", "closed");
  // iOS would otherwise show its own callout on the long press.
  area.style.setProperty("-webkit-touch-callout", "none");
  const paintArea = () => {
    if (current.class) area.className = cn(current.class);
    else area.removeAttribute("class");
    if (current.disabled) area.setAttribute("data-disabled", "");
    else area.removeAttribute("data-disabled");
  };
  paintArea();
  setChildren(area, current.children);
  {
    const rest: Record<string, unknown> = { ...current };
    // Consumed by the factory, never forwarded to the area element.
    for (const k of ["children", "items", "disabled", "onOpenChange", "onContextMenu", "onCloseAutoFocus", "class", "contentClass"]) {
      delete rest[k];
    }
    disposer.add(applyProps(area, rest));
  }

  const engine = createMenuEngine({ portal: p, closeAll: () => close(true), hoverEvent: "pointermove" });

  let rootHandle: PanelHandle | null = null;
  let session: Disposer | null = null;
  let mounted = false;
  /** Where the open menu is, so `update()` can rebuild it in place. */
  let at = { x: 0, y: 0 };
  /** Opened from the keyboard: the first item takes focus, not the menu. */
  let byKeyboard = false;
  /**
   * What had focus inside the area when the menu opened: the row, cell or item
   * the menu is for. Closing returns focus there, not to the area, which for a
   * list or a table is the whole thing: a keyboard user would lose their place.
   */
  let returnTo: HTMLElement | null = null;
  /** Otherwise, what had focus before (Radix's FocusScope does the same). */
  let prevFocus: HTMLElement | null = null;

  const mount = () => {
    mounted = true;
    engine.ignoreList.length = 0;
    engine.layout.length = 0;
    // Radix's ContextMenuContent: to the right of the pointer, 2px off, top-aligned,
    // flipping to the left when it would leave the viewport.
    rootHandle = engine.mountMenu(
      // A custom element may connect before its items are set.
      current.items ?? [],
      pointAt(at.x, at.y),
      "right",
      "start",
      2,
      current.contentClass,
      undefined,
    );
    const panel = rootHandle.panel;
    area.setAttribute("data-state", "open");

    session = new Disposer();
    const onReflow = () => {
      for (const l of engine.layout) placePanel(l.anchor, l.panel, l.side, l.align, l.offset);
    };
    window.addEventListener("scroll", onReflow, { capture: true, passive: true });
    window.addEventListener("resize", onReflow);
    session.add(() => window.removeEventListener("scroll", onReflow, { capture: true } as EventListenerOptions));
    session.add(() => window.removeEventListener("resize", onReflow));
    session.add(dismissable(panel, { ignore: engine.ignoreList, onDismiss: () => close(true) }));
    // Opened by a right-click the menu itself has focus and no item is active
    // until you move; the arrows then start from the ends, as Radix's do.
    const onPanelKey = (e: KeyboardEvent) => {
      if (e.target !== panel) return;
      const rows = focusablesIn(panel);
      if (e.key === "ArrowDown" || e.key === "Home") {
        e.preventDefault();
        rows[0]?.focus();
      } else if (e.key === "ArrowUp" || e.key === "End") {
        e.preventDefault();
        rows[rows.length - 1]?.focus();
      }
    };
    panel.addEventListener("keydown", onPanelKey);
    session.add(() => panel.removeEventListener("keydown", onPanelKey));

    if (byKeyboard) (focusablesIn(panel)[0] ?? panel).focus();
    else panel.focus({ preventScroll: true });
  };

  const unmount = () => {
    mounted = false;
    session?.dispose();
    session = null;
    rootHandle?.close();
    rootHandle = null;
    engine.ignoreList.length = 0;
    engine.layout.length = 0;
    area.setAttribute("data-state", "closed");
  };

  const open = (x: number, y: number, keyboard: boolean) => {
    const wasOpen = mounted;
    if (wasOpen) unmount();
    at = { x, y };
    byKeyboard = keyboard;
    // Reopened in place (a long press, then the browser's own contextmenu for
    // it): focus is in the menu, so where it returns to is still the first one.
    if (!wasOpen) {
      const active = document.activeElement;
      returnTo = active instanceof HTMLElement && active !== area && area.contains(active) ? active : null;
      prevFocus = active instanceof HTMLElement && active !== document.body ? active : null;
    }
    mount();
    if (!wasOpen) current.onOpenChange?.(true);
  };

  function close(restoreFocus: boolean) {
    if (!mounted) return;
    unmount();
    current.onOpenChange?.(false);
    if (!restoreFocus) return;
    const ev = new Event("closeAutoFocus", { cancelable: true });
    current.onCloseAutoFocus?.(ev);
    if (ev.defaultPrevented) return;
    const el = returnTo?.isConnected ? returnTo : prevFocus?.isConnected ? prevFocus : null;
    el?.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------ the keyboard */
  // The browser may still send its own contextmenu event for the key (on
  // Windows, after the menu key comes up): the menu opened from the key is the
  // one, that event is not. A right-click is never mistaken for it: a mouse
  // contextmenu has button 2, a keyboard one does not.
  let keyHeld = false;
  let keyTimer = 0;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || current.disabled) return;
    if (e.key !== "ContextMenu" && !(e.shiftKey && e.key === "F10")) return;
    e.preventDefault();
    const active = document.activeElement;
    const target = active instanceof Element && area.contains(active) ? active : area;
    const r = target.getBoundingClientRect();
    const rtl = getComputedStyle(target).direction === "rtl";
    keyHeld = true;
    window.clearTimeout(keyTimer);
    keyTimer = window.setTimeout(() => (keyHeld = false), 1000);
    // Opened at the focused element's bottom start corner, so the menu reads
    // from the thing it is for. Dispatched as a contextmenu so the caller's
    // onContextMenu sees it exactly as it sees a right-click.
    target.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: rtl ? r.right : r.left,
        clientY: r.bottom,
      }),
    );
  };

  const onKeyUp = () => {
    if (!keyHeld) return;
    window.clearTimeout(keyTimer);
    keyTimer = window.setTimeout(() => (keyHeld = false));
  };

  /* ---------------------------------------------------------- the long press */
  let pressTimer = 0;
  const clearPress = () => window.clearTimeout(pressTimer);
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return;
    clearPress();
    const { clientX, clientY, target } = e;
    pressTimer = window.setTimeout(() => {
      // Through the same path as a right-click, so onContextMenu runs first.
      (target instanceof Element && area.contains(target) ? target : area).dispatchEvent(
        new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX, clientY }),
      );
    }, LONG_PRESS_MS);
  };
  const onPointerEnd = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") clearPress();
  };

  /* --------------------------------------------------------- the right-click */
  const onContextMenu = (e: MouseEvent) => {
    if (e.isTrusted && keyHeld && e.button !== 2) {
      e.preventDefault();
      return;
    }
    clearPress();
    // The caller's handler first: it may move focus to what was right-clicked
    // (a table focuses the row), and that is where focus should return; and it
    // may update the items for what was right-clicked.
    current.onContextMenu?.(e);
    if (e.defaultPrevented || current.disabled) return;
    e.preventDefault();
    // Ours (the key, the long press) are the only untrusted ones; only the key
    // focuses the first item.
    open(e.clientX, e.clientY, !e.isTrusted && keyHeld);
  };

  area.addEventListener("keydown", onKeyDown);
  area.addEventListener("keyup", onKeyUp);
  area.addEventListener("contextmenu", onContextMenu);
  area.addEventListener("pointerdown", onPointerDown);
  area.addEventListener("pointermove", onPointerEnd);
  area.addEventListener("pointerup", onPointerEnd);
  area.addEventListener("pointercancel", onPointerEnd);
  disposer.add(() => {
    area.removeEventListener("keydown", onKeyDown);
    area.removeEventListener("keyup", onKeyUp);
    area.removeEventListener("contextmenu", onContextMenu);
    area.removeEventListener("pointerdown", onPointerDown);
    area.removeEventListener("pointermove", onPointerEnd);
    area.removeEventListener("pointerup", onPointerEnd);
    area.removeEventListener("pointercancel", onPointerEnd);
    window.clearTimeout(keyTimer);
    clearPress();
    session?.dispose();
  });

  return {
    el: area,
    get isOpen() {
      return mounted;
    },
    close() {
      close(true);
    },
    update(next) {
      const prev = current;
      current = { ...current, ...next };
      // Only what changed: a custom element re-sends every prop on every update,
      // and re-setting the same children would detach the focused row.
      if (current.class !== prev.class || current.disabled !== prev.disabled) paintArea();
      if ("children" in next && current.children !== prev.children) setChildren(area, current.children);
      if (current.disabled && mounted) close(true);
      else if (mounted && (current.items !== prev.items || current.contentClass !== prev.contentClass)) {
        // Rebuild the open menu in place, at the same point, keeping where focus
        // returns to (a checkbox's onCheckedChange updates, then the menu closes).
        unmount();
        mount();
      }
    },
    destroy() {
      disposer.dispose();
      rootHandle?.close();
      p.destroy();
      area.remove();
    },
  };
}

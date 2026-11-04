import {
  type ComponentProps,
  type JSX,
  type ValidComponent,
  createContext,
  onCleanup,
  splitProps,
  useContext,
} from "solid-js";
import { ContextMenu as KContext, type ContextMenuRootProps } from "@kobalte/core/context-menu";
import type { PolymorphicProps } from "../../lib/polymorphic";
import { cn } from "../../lib/cn";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuShortcutProps,
  type DropdownMenuSubContentProps,
  type DropdownMenuSubTriggerProps,
} from "../dropdown-menu/dropdown-menu";

/**
 * ContextMenu — the menu a right-click opens, at the pointer. Solid, on
 * Kobalte's ContextMenu.
 *
 *   <ContextMenu>
 *     <ContextMenuTrigger>…the rows, the canvas, the thing it acts on…</ContextMenuTrigger>
 *     <ContextMenuContent>
 *       <ContextMenuItem onSelect={openInNewTab}>Open in new tab</ContextMenuItem>
 *       <ContextMenuItem onSelect={copy}>Copy<ContextMenuShortcut>⌘C</ContextMenuShortcut></ContextMenuItem>
 *       <ContextMenuSeparator />
 *       <ContextMenuItem variant="destructive" onSelect={remove}>Delete…</ContextMenuItem>
 *     </ContextMenuContent>
 *   </ContextMenu>
 *
 * It opens from the keyboard too: the menu key or Shift+F10 on anything
 * focused inside the trigger opens it at that element's corner, with the
 * first item active. A long press opens it on touch.
 *
 * The items, groups, labels, separators and submenus ARE DropdownMenu's: in
 * Kobalte the two menus share one set of item parts, so these are the same
 * components under the names a context menu reads with, and the two menus
 * cannot drift apart in look or behaviour.
 */

/**
 * What had focus inside the trigger when the menu opened: the row, cell or
 * item the menu is for. Closing returns focus there. Kobalte would return it
 * to the trigger, which for a list or a table is the whole area, and a
 * keyboard user would lose their place every time.
 */
interface MenuSession {
  /** What had focus inside the trigger when the menu opened. */
  returnTo: HTMLElement | null;
  /** Opened from the keyboard: the first item takes focus, not the menu. */
  byKeyboard: boolean;
}
const MenuSessionContext = createContext<MenuSession>();

export const ContextMenu = (props: ContextMenuRootProps) => (
  <MenuSessionContext.Provider value={{ returnTo: null, byKeyboard: false }}>
    <KContext {...props} />
  </MenuSessionContext.Provider>
);

export type ContextMenuTriggerProps<T extends ValidComponent = "div"> = PolymorphicProps<
  T,
  {
    children?: JSX.Element;
    class?: string;
    disabled?: boolean;
    onKeyDown?: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent>;
    onKeyUp?: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent>;
    onContextMenu?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;
  }
>;

const callHandler = <E extends Event>(
  e: E & { currentTarget: HTMLElement; target: Element },
  handler: JSX.EventHandlerUnion<HTMLElement, E> | undefined,
) => {
  if (typeof handler === "function") (handler as (e: E) => void)(e);
  else if (Array.isArray(handler)) (handler[0] as (data: unknown, e: E) => void)(handler[1], e);
};

/**
 * The area a right-click opens the menu in. Kobalte places the menu at the
 * event's pointer position, and a menu opened from the keyboard has none
 * worth using; so the menu key and Shift+F10 are read here, the browser's own
 * menu for them is held off, and the menu is opened at the focused element's
 * corner (its bottom start, so it reads from the thing it is for).
 */
export const ContextMenuTrigger = <T extends ValidComponent = "div">(
  props: ContextMenuTriggerProps<T>,
) => {
  const [local, rest] = splitProps(props as ContextMenuTriggerProps, ["onKeyDown", "onKeyUp", "onContextMenu"]);
  const session = useContext(MenuSessionContext);
  // The browser may still send its own contextmenu event for the key (on
  // Windows, after the menu key comes up): the menu opened from the key is the
  // one, that event is not. A right-click is never mistaken for it: a mouse
  // contextmenu has button 2, a keyboard one does not.
  let keyHeld = false;
  let keyTimer = 0;
  const releaseKey = () => {
    window.clearTimeout(keyTimer);
    keyTimer = window.setTimeout(() => (keyHeld = false));
  };
  const onKeyDown = (e: KeyboardEvent & { currentTarget: HTMLElement; target: Element }) => {
    callHandler(e, local.onKeyDown);
    if (e.defaultPrevented || props.disabled) return;
    if (e.key !== "ContextMenu" && !(e.shiftKey && e.key === "F10")) return;
    e.preventDefault();
    const target = (document.activeElement instanceof Element && e.currentTarget.contains(document.activeElement)
      ? document.activeElement
      : e.currentTarget) as Element;
    const r = target.getBoundingClientRect();
    const rtl = getComputedStyle(target).direction === "rtl";
    keyHeld = true;
    window.clearTimeout(keyTimer);
    keyTimer = window.setTimeout(() => (keyHeld = false), 1000);
    target.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: rtl ? r.right : r.left,
        clientY: r.bottom,
      }),
    );
  };
  const onKeyUp = (e: KeyboardEvent & { currentTarget: HTMLElement; target: Element }) => {
    callHandler(e, local.onKeyUp);
    if (keyHeld) releaseKey();
  };
  const onContextMenu = (e: MouseEvent & { currentTarget: HTMLElement; target: Element }) => {
    if (e.isTrusted && keyHeld && e.button !== 2) {
      e.preventDefault();
      return;
    }
    // The caller's handler first: it may move focus to what was right-clicked
    // (a table focuses the row), and that is where focus should return.
    callHandler(e, local.onContextMenu);
    const active = document.activeElement;
    if (session) {
      session.returnTo =
        active instanceof HTMLElement && active !== e.currentTarget && e.currentTarget.contains(active) ? active : null;
      // Ours, dispatched from the key above, is the only untrusted one.
      session.byKeyboard = !e.isTrusted;
    }
  };
  onCleanup(() => window.clearTimeout(keyTimer));
  return (
    <KContext.Trigger
      {...(rest as ComponentProps<typeof KContext.Trigger>)}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onContextMenu={onContextMenu}
    />
  );
};

export type ContextMenuContentProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
  /**
   * Where focus goes when the menu closes; call `e.preventDefault()` to put it
   * somewhere yourself (the row or cell the menu was for, say). By default it
   * returns to the trigger.
   */
  onCloseAutoFocus?: (e: Event) => void;
};

export const ContextMenuContent = (props: ContextMenuContentProps) => {
  const [local, rest] = splitProps(props, ["class", "children", "onCloseAutoFocus", "ref"]);
  const session = useContext(MenuSessionContext);
  const onCloseAutoFocus = (e: Event) => {
    local.onCloseAutoFocus?.(e);
    if (e.defaultPrevented) return;
    const el = session?.returnTo;
    if (el?.isConnected) {
      e.preventDefault();
      el.focus({ preventScroll: true });
    }
  };
  return (
    <KContext.Portal>
      <KContext.Content
        {...rest}
        // Opened from the keyboard, the first item is active, as in any menu
        // opened from a key; opened by a right-click, nothing is until you move.
        ref={(el: HTMLDivElement) => {
          // The caller's ref, then ours.
          if (typeof local.ref === "function") (local.ref as (el: HTMLDivElement) => void)(el);
          if (!session?.byKeyboard) return;
          // Kobalte focuses the menu itself once it has opened; the first item
          // takes it from there, once.
          const toFirstItem = (e: FocusEvent) => {
            if (e.target !== el) return;
            el.removeEventListener("focusin", toFirstItem);
            el.querySelector<HTMLElement>('[role^="menuitem"]:not([data-disabled])')?.focus();
          };
          el.addEventListener("focusin", toFirstItem);
        }}
        onCloseAutoFocus={onCloseAutoFocus}
        class={cn(
          "zen-z-50 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md",
          local.class,
        )}
      >
        {local.children}
      </KContext.Content>
    </KContext.Portal>
  );
};

export const ContextMenuPortal = KContext.Portal;
export const ContextMenuItem = DropdownMenuItem;
export const ContextMenuCheckboxItem = DropdownMenuCheckboxItem;
export const ContextMenuRadioGroup = DropdownMenuRadioGroup;
export const ContextMenuRadioItem = DropdownMenuRadioItem;
export const ContextMenuGroup = DropdownMenuGroup;
export const ContextMenuLabel = DropdownMenuLabel;
export const ContextMenuSeparator = DropdownMenuSeparator;
export const ContextMenuShortcut = DropdownMenuShortcut;
export const ContextMenuSub = DropdownMenuSub;
export const ContextMenuSubTrigger = DropdownMenuSubTrigger;
export const ContextMenuSubContent = DropdownMenuSubContent;

export type { ContextMenuRootProps as ContextMenuProps };
export type ContextMenuItemProps = DropdownMenuItemProps;
export type ContextMenuCheckboxItemProps = DropdownMenuCheckboxItemProps;
export type ContextMenuRadioItemProps = DropdownMenuRadioItemProps;
export type ContextMenuLabelProps = DropdownMenuLabelProps;
export type ContextMenuSeparatorProps = DropdownMenuSeparatorProps;
export type ContextMenuShortcutProps = DropdownMenuShortcutProps;
export type ContextMenuSubTriggerProps = DropdownMenuSubTriggerProps;
export type ContextMenuSubContentProps = DropdownMenuSubContentProps;

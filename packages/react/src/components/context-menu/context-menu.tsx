import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import {
  ChevronRightIcon,
  CheckIcon,
  DotIcon,
  menuContentClass,
  menuIndicatorItemClass,
  menuIndicatorSlotClass,
  menuItemClass,
  menuLabelClass,
  menuSeparatorClass,
  menuShortcutClass,
  menuSubTriggerClass,
} from "../dropdown-menu/menu-parts";

/**
 * ContextMenu — the menu a right-click opens, at the pointer. Built on
 * @radix-ui/react-context-menu.
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
 * first item active. A long press opens it on touch (Radix: 700ms).
 *
 * The items, labels, separators and submenus look exactly like DropdownMenu's:
 * they are drawn from the same classes and icons (`menu-parts.tsx`). They
 * cannot be the same components, as they are in Solid, because Radix scopes
 * every part to its own menu root.
 */

/**
 * What had focus inside the trigger when the menu opened: the row, cell or
 * item the menu is for. Closing returns focus there, not to the trigger,
 * which for a list or a table is the whole area: a keyboard user would lose
 * their place every time.
 */
interface MenuSession {
  /** What had focus inside the trigger when the menu opened. */
  returnTo: HTMLElement | null;
  /** Opened from the keyboard: the first item takes focus, not the menu. */
  byKeyboard: boolean;
}
const MenuSessionContext = React.createContext<React.MutableRefObject<MenuSession> | null>(null);

type ContextMenuProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Root>;

const ContextMenu = (props: ContextMenuProps) => {
  const session = React.useRef<MenuSession>({ returnTo: null, byKeyboard: false });
  return (
    <MenuSessionContext.Provider value={session}>
      <ContextMenuPrimitive.Root {...props} />
    </MenuSessionContext.Provider>
  );
};
ContextMenu.displayName = "ContextMenu";

type ContextMenuTriggerProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Trigger>;

/**
 * The area a right-click opens the menu in. Radix places the menu at the
 * event's pointer position, and a menu opened from the keyboard has none worth
 * using; so the menu key and Shift+F10 are read here, the browser's own menu
 * for them is held off, and the menu is opened at the focused element's
 * corner (its bottom start, so it reads from the thing it is for).
 */
const ContextMenuTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Trigger>,
  ContextMenuTriggerProps
>(({ onKeyDown, onKeyUp, onContextMenu, disabled, ...props }, ref) => {
  const session = React.useContext(MenuSessionContext);
  // The browser may still send its own contextmenu event for the key (on
  // Windows, after the menu key comes up): the menu opened from the key is the
  // one, that event is not. A right-click is never mistaken for it: a mouse
  // contextmenu has button 2, a keyboard one does not.
  const keyHeld = React.useRef(false);
  const keyTimer = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(keyTimer.current), []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled) return;
    if (e.key !== "ContextMenu" && !(e.shiftKey && e.key === "F10")) return;
    e.preventDefault();
    const active = document.activeElement;
    const target = active instanceof Element && e.currentTarget.contains(active) ? active : e.currentTarget;
    const r = target.getBoundingClientRect();
    const rtl = getComputedStyle(target).direction === "rtl";
    keyHeld.current = true;
    window.clearTimeout(keyTimer.current);
    keyTimer.current = window.setTimeout(() => (keyHeld.current = false), 1000);
    target.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: rtl ? r.right : r.left,
        clientY: r.bottom,
      }),
    );
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    onKeyUp?.(e);
    if (!keyHeld.current) return;
    window.clearTimeout(keyTimer.current);
    keyTimer.current = window.setTimeout(() => (keyHeld.current = false));
  };

  // Runs before Radix's own handler, which opens the menu only if this one
  // has not called preventDefault.
  const handleContextMenu = (e: React.MouseEvent<HTMLSpanElement>) => {
    const trusted = e.nativeEvent.isTrusted;
    if (trusted && keyHeld.current && e.button !== 2) {
      e.preventDefault();
      return;
    }
    // The caller's handler first: it may move focus to what was right-clicked
    // (a table focuses the row), and that is where focus should return.
    onContextMenu?.(e);
    if (disabled || !session) return;
    const active = document.activeElement;
    session.current.returnTo =
      active instanceof HTMLElement && active !== e.currentTarget && e.currentTarget.contains(active) ? active : null;
    // Ours, dispatched from the key above, is the only untrusted one.
    session.current.byKeyboard = !trusted;
  };

  return (
    <ContextMenuPrimitive.Trigger
      ref={ref}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onContextMenu={handleContextMenu}
      {...props}
    />
  );
});
ContextMenuTrigger.displayName = ContextMenuPrimitive.Trigger.displayName;

type ContextMenuContentProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>;

/**
 * The menu, portalled. `onCloseAutoFocus` decides where focus goes when it
 * closes; call `e.preventDefault()` to put it somewhere yourself. By default
 * it returns to what had focus inside the trigger when the menu opened.
 */
const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  ContextMenuContentProps
>(({ className, onCloseAutoFocus, onFocus, ...props }, ref) => {
  const session = React.useContext(MenuSessionContext);
  // Opened from the keyboard, the first item is active, as in any menu opened
  // from a key; opened by a right-click, nothing is until you move. Radix
  // focuses the menu itself once it has opened; the first item takes it from
  // there, once per opening.
  const firstFocusDone = React.useRef(false);
  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(e);
    if (firstFocusDone.current || e.target !== e.currentTarget) return;
    firstFocusDone.current = true;
    if (!session?.current.byKeyboard) return;
    e.currentTarget.querySelector<HTMLElement>('[role^="menuitem"]:not([data-disabled])')?.focus();
  };
  const handleCloseAutoFocus = (e: Event) => {
    firstFocusDone.current = false;
    onCloseAutoFocus?.(e);
    if (e.defaultPrevented) return;
    const el = session?.current.returnTo;
    if (el?.isConnected) {
      e.preventDefault();
      el.focus({ preventScroll: true });
    }
  };
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={ref}
        className={menuContentClass(className)}
        onFocus={handleFocus}
        onCloseAutoFocus={handleCloseAutoFocus}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
});
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuPortal = ContextMenuPrimitive.Portal;
const ContextMenuGroup = ContextMenuPrimitive.Group;
const ContextMenuSub = ContextMenuPrimitive.Sub;
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger ref={ref} className={menuSubTriggerClass(inset, className)} {...props}>
    {children}
    <ChevronRightIcon />
  </ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  // Not portalled, as DropdownMenuSubContent is not: the two menus' submenus
  // sit in the same place in the tree.
  <ContextMenuPrimitive.SubContent ref={ref} className={menuContentClass(className)} {...props} />
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

type ContextMenuItemProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
};

const ContextMenuItem = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Item>, ContextMenuItemProps>(
  ({ className, inset, variant = "default", ...props }, ref) => (
    <ContextMenuPrimitive.Item ref={ref} className={menuItemClass(variant, inset, className)} {...props} />
  ),
);
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

type ContextMenuCheckboxItemProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>;

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  ContextMenuCheckboxItemProps
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem ref={ref} className={menuIndicatorItemClass(className)} {...props}>
    <span className={menuIndicatorSlotClass}>
      <ContextMenuPrimitive.ItemIndicator>
        <CheckIcon />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

type ContextMenuRadioItemProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>;

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  ContextMenuRadioItemProps
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem ref={ref} className={menuIndicatorItemClass(className)} {...props}>
    <span className={menuIndicatorSlotClass}>
      <ContextMenuPrimitive.ItemIndicator>
        <DotIcon />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label ref={ref} className={menuLabelClass(inset, className)} {...props} />
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator ref={ref} className={menuSeparatorClass(className)} {...props} />
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={menuShortcutClass(className)} {...props} />
);
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
export type {
  ContextMenuProps,
  ContextMenuTriggerProps,
  ContextMenuContentProps,
  ContextMenuItemProps,
  ContextMenuCheckboxItemProps,
  ContextMenuRadioItemProps,
};

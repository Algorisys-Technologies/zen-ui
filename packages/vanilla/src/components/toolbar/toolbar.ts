import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { dismissable } from "../../lib/dismissable";
import { rovingFocus } from "../../lib/roving-focus";
import { setPresence } from "../../lib/presence";
import { Button, type ButtonProps } from "../button/button";
import { Icon, type IconName } from "../icon/icon";

/**
 * Toolbar — a row of actions that collapses into an overflow menu when it runs
 * out of room. The overflow is the point; a row of buttons needs no component.
 *
 * See docs/fiori-gap-analysis.md (Tier 2). Fiori's OverflowToolbar physically
 * MOVES controls into a popover when they don't fit.
 *
 *   const bar = Toolbar({ actions, "aria-label": "Order actions", children: title });
 *   host.append(bar.el);
 *
 * `actions` is DATA, not children — the one deliberate departure from this
 * library's usual composition, and the reason is structural rather than
 * stylistic: an overflowed action has to re-render as a *menu item*, which is a
 * different element than the button it was. The same node cannot be in two
 * places, so the toolbar has to know the action's intent (label, icon, onSelect)
 * to render it either way. Compound children could only be shown or hidden, never
 * moved — which is precisely the behaviour that makes a toolbar worth having.
 * `children` covers leading content (a title) that never overflows.
 *
 * ## Why this builds its own overflow menu
 *
 * React composes DropdownMenu (Radix) for the overflow. Vanilla has no
 * DropdownMenu yet, and a menu on a trigger is exactly the shape `Select`
 * already builds by hand — an absolutely-positioned surface, dismissable, with
 * roving focus over its items. So the menu is inlined here from the same lib
 * primitives rather than porting a whole DropdownMenu family to unblock one
 * component. The class strings are copied verbatim from React's
 * DropdownMenuContent / DropdownMenuItem / DropdownMenuSeparator so the surface
 * renders identically.
 */

export interface ToolbarAction {
  id: string;
  /** Button/menu-item label. Rendered fresh in both places (a node cannot be shared). */
  label: Child;
  icon?: IconName;
  onSelect?: () => void;
  disabled?: boolean;
  variant?: ButtonProps["variant"];
  color?: ButtonProps["color"];
  /** `never` pins the action to the bar; anything else collapses when needed. */
  overflow?: "never" | "auto";
  /** Renders a divider before this action, in the bar and in the menu. */
  separatorBefore?: boolean;
}

export interface ToolbarProps extends BaseProps {
  actions: ToolbarAction[];
  /** Accessible name — a toolbar needs one. Passed through as `aria-label`. */
  "aria-label"?: string;
  overflowLabel?: string;
  size?: ButtonProps["size"];
}

const GAP = 8; // zen-gap-2, in px — the row's gap, needed to sum measured widths

const MENU_CONTENT_CLASS = cn(
  "zen-absolute zen-right-0 zen-top-full zen-mt-1 zen-z-50 zen-min-w-32 zen-overflow-hidden",
  "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-zen-md",
  "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
);

const MENU_ITEM_CLASS = cn(
  "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
  "focus:zen-bg-zen-muted hover:zen-bg-zen-muted",
  "aria-disabled:zen-pointer-events-none aria-disabled:zen-opacity-50",
);

const MENU_SEPARATOR_CLASS = "-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border";
const BAR_SEPARATOR_CLASS = "zen-h-5 zen-w-px zen-shrink-0 zen-bg-zen-border";

/** Fresh nodes for a label, so the same label can render in bar, menu and measure row. */
const freshLabel = (label: Child): Node[] => toNodes(label).map((n) => n.cloneNode(true));

export function Toolbar(props: ToolbarProps): ZenComponent<ToolbarProps> {
  let current: ToolbarProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  // How many `auto` actions currently fit. Starts at "all" so the first paint is
  // the common case (everything fits) rather than an empty bar; the observer's
  // first callback corrects it once there is real layout to measure.
  let visibleCount = current.actions.length;

  let pinned: ToolbarAction[] = [];
  let collapsible: ToolbarAction[] = [];

  // Persistent bar buttons, keyed by action id, so a resize does not rebuild
  // every control (which would drop focus and re-add listeners every frame).
  const barButtons = new Map<string, ZenComponent<ButtonProps>>();
  const buttonsDisposer = new Disposer();
  let measureButtons: ZenComponent<ButtonProps>[] = [];

  // Structural elements, built once.
  const leading = document.createElement("div");
  leading.className = "zen-flex zen-min-w-0 zen-items-center zen-gap-2";
  const actionsRow = document.createElement("div");
  actionsRow.className = "zen-ml-auto zen-flex zen-items-center zen-gap-2";

  // Hidden measurement row: every action at full width, out of flow so it cannot
  // affect layout. `visibility: hidden` removes the subtree from the tab order;
  // aria-hidden keeps it out of the accessibility tree. This is the price of
  // measuring without the circular dependency (hiding an action changes the row's
  // width, which changes what fits, which changes what is hidden).
  const measureRow = document.createElement("div");
  measureRow.setAttribute("aria-hidden", "true");
  measureRow.className =
    "zen-pointer-events-none zen-absolute zen-left-0 zen-top-0 zen-flex zen-gap-2 zen-opacity-0";
  measureRow.style.visibility = "hidden";

  // ---- the overflow menu, inlined (see the header note) --------------------
  const overflowContainer = document.createElement("div");
  overflowContainer.className = "zen-relative";
  const menuTrigger = Button({
    type: "button",
    variant: "ghost",
    size: current.size ?? "sm",
    "aria-haspopup": "menu",
    "aria-expanded": "false",
    children: Icon({ name: "more", size: 16 }),
  });
  const menuPanel = document.createElement("div");
  menuPanel.setAttribute("role", "menu");
  menuPanel.className = MENU_CONTENT_CLASS;
  menuPanel.hidden = true;
  overflowContainer.append(menuTrigger.el, menuPanel);

  let menuItems: HTMLDivElement[] = [];
  const menuItemsDisposer = new Disposer();
  const menuCleanups = new Disposer();
  let menuOpen = false;

  const closeMenu = () => {
    if (!menuOpen) return;
    menuOpen = false;
    menuTrigger.el.setAttribute("aria-expanded", "false");
    setPresence(menuPanel, "closed", () => {
      menuPanel.hidden = true;
    });
    menuCleanups.dispose();
    menuTrigger.el.focus();
  };

  const openMenu = () => {
    if (menuOpen) return;
    menuOpen = true;
    menuTrigger.el.setAttribute("aria-expanded", "true");
    menuPanel.hidden = false;
    setPresence(menuPanel, "open");

    menuCleanups.add(
      dismissable(menuPanel, {
        ignore: [menuTrigger.el],
        onDismiss: () => closeMenu(),
      }),
    );
    menuCleanups.add(
      rovingFocus(menuPanel, {
        items: () => menuItems.filter((i) => i.getAttribute("aria-disabled") !== "true"),
        orientation: "vertical",
      }),
    );
    menuItems.find((i) => i.getAttribute("aria-disabled") !== "true")?.focus();
  };

  const setMenuItems = (hidden: ToolbarAction[]) => {
    menuItemsDisposer.dispose();
    const fresh = new Disposer();
    menuPanel.replaceChildren();
    menuItems = [];

    for (const a of hidden) {
      if (a.separatorBefore) {
        const sep = document.createElement("div");
        sep.setAttribute("role", "separator");
        sep.className = MENU_SEPARATOR_CLASS;
        menuPanel.append(sep);
      }

      const item = document.createElement("div");
      item.setAttribute("role", "menuitem");
      item.className = MENU_ITEM_CLASS;
      item.tabIndex = -1;
      if (a.disabled) item.setAttribute("aria-disabled", "true");
      if (a.icon) {
        const ic = Icon({ name: a.icon, size: 14, class: "zen-mr-2" });
        item.append(ic.el);
        fresh.add(() => ic.destroy());
      }
      item.append(...freshLabel(a.label));

      if (!a.disabled) {
        const pick = () => {
          a.onSelect?.();
          closeMenu();
        };
        const onKey = (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pick();
          }
        };
        item.addEventListener("click", pick);
        item.addEventListener("keydown", onKey);
        fresh.add(() => {
          item.removeEventListener("click", pick);
          item.removeEventListener("keydown", onKey);
        });
      }
      menuPanel.append(item);
      menuItems.push(item);
    }

    menuItemsDisposer.add(() => fresh.dispose());
  };

  const onTriggerClick = () => (menuOpen ? closeMenu() : openMenu());
  const onTriggerKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openMenu();
    }
  };
  menuTrigger.el.addEventListener("click", onTriggerClick);
  menuTrigger.el.addEventListener("keydown", onTriggerKey);

  // ---- building & painting --------------------------------------------------

  const makeButton = (a: ToolbarAction): ZenComponent<ButtonProps> =>
    Button({
      type: "button",
      size: current.size ?? "sm",
      variant: a.variant ?? "ghost",
      color: a.color,
      disabled: a.disabled,
      onClick: a.onSelect,
      iconLeft: a.icon ? Icon({ name: a.icon, size: 14 }) : undefined,
      children: freshLabel(a.label),
    });

  const barButton = (a: ToolbarAction): ZenComponent<ButtonProps> => {
    let b = barButtons.get(a.id);
    if (!b) {
      b = makeButton(a);
      barButtons.set(a.id, b);
      buttonsDisposer.add(() => b!.destroy());
    }
    return b;
  };

  const separator = (cls: string): HTMLElement => {
    const s = document.createElement("span");
    s.className = cls;
    return s;
  };

  const paint = () => {
    const shown = collapsible.slice(0, visibleCount);
    const hidden = collapsible.slice(visibleCount);

    actionsRow.replaceChildren();

    for (const a of pinned) {
      if (a.separatorBefore) actionsRow.append(separator(BAR_SEPARATOR_CLASS));
      actionsRow.append(barButton(a).el);
    }
    for (const a of shown) {
      if (a.separatorBefore) actionsRow.append(separator(BAR_SEPARATOR_CLASS));
      actionsRow.append(barButton(a).el);
    }

    if (hidden.length > 0) {
      menuTrigger.el.setAttribute("aria-label", current.overflowLabel ?? "More actions");
      setMenuItems(hidden);
      actionsRow.append(overflowContainer);
    } else {
      if (menuOpen) closeMenu();
      overflowContainer.remove();
    }
  };

  const recompute = () => {
    const actions = current.actions;
    // Widths come from the hidden row holding every action at full size.
    const widths = Array.from(measureRow.children).map((c) => (c as HTMLElement).offsetWidth);
    const pinnedWidth = pinned.reduce(
      (sum, a) => sum + (widths[actions.indexOf(a)] ?? 0) + GAP,
      0,
    );
    // 36px is the ghost trigger's natural width when the container is not mounted.
    const overflowWidth = (overflowContainer.offsetWidth || 36) + GAP;
    const leadingWidth = leading.isConnected ? leading.offsetWidth : 0;

    let budget = el.offsetWidth - leadingWidth - pinnedWidth;
    let fit = 0;
    for (const a of collapsible) {
      const w = (widths[actions.indexOf(a)] ?? 0) + GAP;
      // Once anything is going to overflow, the trigger needs room too.
      const needsTrigger = fit < collapsible.length - 1;
      if (budget - w < (needsTrigger ? overflowWidth : 0)) break;
      budget -= w;
      fit++;
    }

    if (fit !== visibleCount) {
      visibleCount = fit;
      paint();
    }
  };

  const render = () => {
    const {
      actions,
      class: className,
      size: _size,
      overflowLabel: _ol,
      children,
      ...rest
    } = current;

    // Rebuild the derived action sets and the measurement row from scratch. This
    // runs on init and on update(), never per resize frame.
    pinned = actions.filter((a) => a.overflow === "never");
    collapsible = actions.filter((a) => a.overflow !== "never");

    // Fresh bar buttons: an action's data may have changed under an id.
    buttonsDisposer.dispose();
    barButtons.clear();

    for (const b of measureButtons) b.destroy();
    measureButtons = actions.map(makeButton);
    measureRow.replaceChildren(...measureButtons.map((b) => b.el));

    el.setAttribute("role", "toolbar");
    el.className = cn(
      "zen-relative zen-flex zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden",
      className,
    );

    if (children !== undefined && children !== null && children !== false) {
      leading.replaceChildren(...toNodes(children));
      el.replaceChildren(leading, actionsRow, measureRow);
    } else {
      leading.remove();
      el.replaceChildren(actionsRow, measureRow);
    }

    // visibleCount may exceed the new collapsible length after an update; paint
    // clamps via slice, and the observer corrects the real count.
    paint();

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();

  const ro =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => recompute()) : undefined;
  ro?.observe(el);

  disposer.add(() => ro?.disconnect());
  disposer.add(() => menuTrigger.el.removeEventListener("click", onTriggerClick));
  disposer.add(() => menuTrigger.el.removeEventListener("keydown", onTriggerKey));
  disposer.add(() => menuCleanups.dispose());
  disposer.add(() => menuItemsDisposer.dispose());
  disposer.add(() => menuTrigger.destroy());
  disposer.add(() => buttonsDisposer.dispose());
  disposer.add(() => {
    for (const b of measureButtons) b.destroy();
  });
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if (next.actions) visibleCount = next.actions.length;
      render();
      recompute();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

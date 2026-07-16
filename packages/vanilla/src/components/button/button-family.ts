import { type ButtonVariantProps } from "@algorisys/zen-ui-core/variants";
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
import { dismissable } from "../../lib/dismissable";
import { rovingFocus } from "../../lib/roving-focus";
import { setPresence } from "../../lib/presence";
import { Button, type ButtonProps } from "./button";
import { Icon } from "../icon/icon";

/**
 * Button family — the three Fiori-shaped button forms zen-ui was missing, ported
 * from the React reference (docs/fiori-gap-analysis.md, Tier 2).
 *
 *   ToggleButton     a button with a pressed state
 *   SegmentedButton  mutually exclusive choice, rendered as one joined control
 *   SplitButton      a default action plus a dropdown of related actions
 *
 * All three compose the vanilla `Button` rather than restyling from scratch, so
 * variant/color/size stay consistent and any Button change flows through — the
 * same decision the React reference makes.
 *
 * ## Two shapes diverge from React, for the same reason Select does
 *
 * React's `SegmentedButton` and `SplitButton` use compound children — `<Segmented
 * ButtonItem>` finds its parent through React CONTEXT, and `SplitButton`'s `menu`
 * takes `<DropdownMenuItem>` React nodes. With no framework there is no tree and no
 * context, so the faithful shape would be the caller hand-threading a root handle
 * into every child — which LOOPS XXXVI forbids as syntax-porting. So these take
 * DATA (`items`, `menu` arrays), landing where Select and Tabs already did. Same
 * reasoning, same known-divergence note on the parity check. `ToggleButton` has no
 * children problem and mirrors React's API exactly.
 */

/* ---------------------------- ToggleButton ----------------------------- */

export interface ToggleButtonProps extends ButtonProps {
  /** Controlled pressed state. */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

// A pressed toggle reads as "selected", which `soft` already expresses.
const PRESSED = "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border-zen-primary";

export function ToggleButton(props: ToggleButtonProps): ZenComponent<ToggleButtonProps> {
  let current: ToggleButtonProps = { ...props };

  // Controlled iff `pressed` is provided; the uncontrolled value is kept but
  // ignored in that case, so switching modes mid-life cannot strand a stale value.
  const state = controllable<boolean>({
    value: current.pressed,
    defaultValue: current.defaultPressed ?? false,
    onChange: (v) => current.onPressedChange?.(v),
  });

  const buttonProps = (): ButtonProps => {
    const { pressed, defaultPressed, onPressedChange, variant, class: _c, onClick, ...rest } = current;
    void pressed;
    void defaultPressed;
    void onPressedChange;
    void onClick;
    return { ...rest, variant: variant ?? "outline", type: "button" };
  };

  const btn = Button(buttonProps());

  const paint = () => {
    const isPressed = state.get();
    btn.update({
      class: cn(isPressed && PRESSED, current.class),
      "aria-pressed": String(isPressed),
    });
  };

  const onClick = (e: MouseEvent) => {
    current.onClick?.(e);
    if (e.defaultPrevented) return;
    // controllable.set reports the change always and stores it only when uncontrolled.
    state.set(!state.get());
  };
  btn.el.addEventListener("click", onClick);
  const unsub = state.subscribe(paint);
  paint();

  return {
    el: btn.el,
    update(next) {
      current = { ...current, ...next };
      if (next.pressed !== undefined) state.sync(next.pressed);
      btn.update(buttonProps());
      paint();
    },
    destroy() {
      unsub();
      btn.el.removeEventListener("click", onClick);
      btn.destroy();
    },
  };
}

/* --------------------------- SegmentedButton --------------------------- */

export interface SegmentedButtonItem {
  value: string;
  /** The segment's content. */
  label?: Child;
  disabled?: boolean;
}

export interface SegmentedButtonProps extends BaseProps {
  items: SegmentedButtonItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ButtonVariantProps["size"];
  /** Accessible name for the group — it is a radiogroup, so it needs one. */
  "aria-label"?: string;
}

// Joined control: strip the doubled interior borders and the interior rounding so
// the group reads as one segmented bar. Copied verbatim from the React reference.
const SEG_GROUP = [
  "zen-inline-flex zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border",
  "[&>button]:zen-rounded-none [&>button]:zen-border-0 [&>button:not(:first-child)]:zen-border-l [&>button:not(:first-child)]:zen-border-zen-border",
  "[&>button:first-child]:zen-rounded-l-zen-md [&>button:last-child]:zen-rounded-r-zen-md",
].join(" ");
const SEG_SELECTED = "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-font-semibold";

export function SegmentedButton(props: SegmentedButtonProps): ZenComponent<SegmentedButtonProps> {
  let current: SegmentedButtonProps = { ...props };
  const el = document.createElement("div");
  el.setAttribute("role", "radiogroup");
  const disposer = new Disposer();
  let itemCleanups = new Disposer();
  let removeProps: (() => void) | undefined;
  let buttons: Array<{ value: string; btn: ZenComponent<ButtonProps> }> = [];

  const state = controllable<string>({
    value: current.value,
    defaultValue: current.defaultValue ?? "",
    onChange: (v) => current.onValueChange?.(v),
  });

  const paint = () => {
    const cur = state.get();
    for (const { value, btn } of buttons) {
      const selected = value === cur;
      btn.update({
        class: cn(selected && SEG_SELECTED),
        "aria-checked": String(selected),
      });
    }
  };

  const render = () => {
    const { items, value: _v, defaultValue: _dv, onValueChange: _ov, size, class: className, children: _ch, ...rest } =
      current;
    void _v;
    void _dv;
    void _ov;
    void _ch;

    itemCleanups.dispose();
    itemCleanups = new Disposer();
    buttons = [];
    el.className = cn(SEG_GROUP, className);
    el.replaceChildren();

    for (const item of items) {
      const btn = Button({
        variant: "ghost",
        size: size ?? "sm",
        type: "button",
        disabled: item.disabled,
        children: item.label,
      });
      btn.el.setAttribute("role", "radio");
      const onClick = () => {
        if (!item.disabled) state.set(item.value);
      };
      btn.el.addEventListener("click", onClick);
      itemCleanups.add(() => {
        btn.el.removeEventListener("click", onClick);
        btn.destroy();
      });
      el.append(btn.el);
      buttons.push({ value: item.value, btn });
    }

    paint();

    // A radiogroup needs its accessible name; it and any id/style/data-*/aria-*
    // the caller passed live in `rest`, applied straight to the group element.
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(state.subscribe(paint));
  disposer.add(() => itemCleanups.dispose());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      const structural = next.items !== undefined || next.size !== undefined;
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);
      if (structural) render();
      else paint();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/* ----------------------------- SplitButton ----------------------------- */

export interface SplitButtonMenuItem {
  /** The item's content. Omit with `separator` or a heading `label` only. */
  label?: Child;
  onSelect?: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
  /** Render a divider instead of an interactive item. */
  separator?: boolean;
  /** Render a non-interactive heading (React's DropdownMenuLabel). */
  heading?: boolean;
}

export interface SplitButtonProps extends ButtonProps {
  /**
   * Menu contents. React takes `<DropdownMenuItem>` nodes; vanilla has no
   * DropdownMenu, so it takes the data — see the header note.
   */
  menu: SplitButtonMenuItem[];
  /** Accessible name for the arrow half. */
  menuLabel?: string;
  menuAlign?: "start" | "center" | "end";
}

const ALIGN = {
  start: "zen-left-0",
  center: "zen-left-1/2 -zen-translate-x-1/2",
  end: "zen-right-0",
} as const;

// Classes carried over from the React DropdownMenu, plus `focus:`/`hover:` — Radix
// paints highlight via `data-[highlighted]`, which vanilla's rovingFocus expresses
// as real focus, so both are kept.
const MENU_ITEM =
  "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none focus:zen-bg-zen-muted hover:zen-bg-zen-muted data-[highlighted]:zen-bg-zen-muted aria-disabled:zen-pointer-events-none aria-disabled:zen-opacity-50";
const MENU_ITEM_DESTRUCTIVE =
  "zen-text-zen-error focus:zen-bg-zen-error-soft focus:zen-text-zen-error-soft-fg hover:zen-bg-zen-error-soft hover:zen-text-zen-error-soft-fg data-[highlighted]:zen-bg-zen-error-soft data-[highlighted]:zen-text-zen-error-soft-fg";
const MENU_HEADING = "zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg";
const MENU_SEPARATOR = "-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border";

let splitUid = 0;

export function SplitButton(props: SplitButtonProps): ZenComponent<SplitButtonProps> {
  let current: SplitButtonProps = { ...props };
  const id = `zen-split-${++splitUid}`;
  const el = document.createElement("div");
  const disposer = new Disposer();
  let itemCleanups = new Disposer();
  let open = false;
  let closeBehavior: (() => void) | null = null;

  // Two REAL buttons, not one with a nested trigger: a <button> inside a <button>
  // is invalid HTML and breaks keyboard semantics.
  const mainBtn = Button({ type: "button" });
  const arrowBtn = Button({ type: "button", children: Icon({ name: "chevron-down", size: 14 }) });
  const menu = document.createElement("div");
  menu.id = `${id}-menu`;
  menu.setAttribute("role", "menu");
  menu.hidden = true;
  let menuItems: HTMLElement[] = [];

  arrowBtn.el.setAttribute("aria-haspopup", "menu");
  arrowBtn.el.setAttribute("aria-controls", `${id}-menu`);

  el.append(mainBtn.el, arrowBtn.el, menu);

  const close = () => {
    if (!open) return;
    open = false;
    arrowBtn.el.setAttribute("aria-expanded", "false");
    setPresence(menu, "closed", () => {
      menu.hidden = true;
    });
    closeBehavior?.();
    closeBehavior = null;
    arrowBtn.el.focus();
  };

  const openMenu = () => {
    if (open || current.disabled) return;
    open = true;
    arrowBtn.el.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    setPresence(menu, "open");

    const enabled = () => menuItems.filter((i) => i.getAttribute("aria-disabled") !== "true");
    const c1 = dismissable(menu, {
      ignore: [arrowBtn.el, mainBtn.el],
      onDismiss: () => close(),
    });
    const c2 = rovingFocus(menu, { items: enabled, orientation: "vertical" });
    closeBehavior = () => {
      c1();
      c2();
    };
    enabled()[0]?.focus();
  };

  const render = () => {
    const {
      menu: items,
      menuLabel = "More actions",
      menuAlign = "end",
      variant = "solid",
      color = "primary",
      size = "md",
      disabled,
      class: className,
      children,
      ...rest
    } = current;

    el.className = cn("zen-relative zen-inline-flex zen-items-stretch", className);

    // The main half takes the default styling and every forwarded prop (onClick,
    // data-*, style…) — React's `{...props}` on the primary Button.
    mainBtn.update({ variant, color, size, disabled, children, class: "zen-rounded-r-none", ...rest });
    arrowBtn.update({
      variant,
      color,
      size,
      disabled,
      "aria-label": menuLabel,
      "aria-expanded": String(open),
      class: "zen-rounded-l-none zen-border-l zen-border-l-zen-border zen-px-2",
    });

    menu.className = cn(
      "zen-absolute zen-top-full zen-mt-1 zen-z-50 zen-min-w-32 zen-overflow-hidden",
      "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md",
      ALIGN[menuAlign],
      "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
    );
    menu.hidden = !open;

    itemCleanups.dispose();
    itemCleanups = new Disposer();
    menuItems = [];
    menu.replaceChildren();

    for (const item of items) {
      if (item.separator) {
        const sep = document.createElement("div");
        sep.setAttribute("role", "separator");
        sep.className = MENU_SEPARATOR;
        menu.append(sep);
        continue;
      }
      if (item.heading) {
        const h = document.createElement("div");
        h.className = MENU_HEADING;
        h.replaceChildren(...toNodes(item.label));
        menu.append(h);
        continue;
      }

      const mi = document.createElement("div");
      mi.setAttribute("role", "menuitem");
      mi.tabIndex = -1;
      if (item.disabled) mi.setAttribute("aria-disabled", "true");
      mi.className = cn(MENU_ITEM, item.variant === "destructive" && MENU_ITEM_DESTRUCTIVE);
      mi.replaceChildren(...toNodes(item.label));

      if (!item.disabled) {
        const select = () => {
          item.onSelect?.();
          close();
        };
        const onClick = () => select();
        const onKey = (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            select();
          }
        };
        mi.addEventListener("click", onClick);
        mi.addEventListener("keydown", onKey);
        itemCleanups.add(() => {
          mi.removeEventListener("click", onClick);
          mi.removeEventListener("keydown", onKey);
        });
      }

      menu.append(mi);
      menuItems.push(mi);
    }
  };

  const onArrowClick = () => (open ? close() : openMenu());
  const onArrowKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openMenu();
    }
  };
  arrowBtn.el.addEventListener("click", onArrowClick);
  arrowBtn.el.addEventListener("keydown", onArrowKey);

  render();
  disposer.add(() => arrowBtn.el.removeEventListener("click", onArrowClick));
  disposer.add(() => arrowBtn.el.removeEventListener("keydown", onArrowKey));
  disposer.add(() => closeBehavior?.());
  disposer.add(() => itemCleanups.dispose());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      close();
      disposer.dispose();
      mainBtn.destroy();
      arrowBtn.destroy();
      el.remove();
    },
  };
}

import {
  type JSX,
  createContext,
  createMemo,
  createSignal,
  splitProps,
  useContext,
} from "solid-js";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "./button";
import { Icon } from "../icon/icon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../dropdown-menu/dropdown-menu";

/**
 * Button family — Solid binding. Mirrors packages/react/src/components/button/
 * button-family.tsx: same props, same class strings. See that file for the
 * rationale.
 */

/* ---------------------------- ToggleButton ----------------------------- */

export type ToggleButtonProps = Omit<ButtonProps, "onChange"> & {
  /** Controlled pressed state. */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
};

export const ToggleButton = (props: ToggleButtonProps) => {
  const [local, rest] = splitProps(props, [
    "pressed",
    "defaultPressed",
    "onPressedChange",
    "variant",
    "class",
    "onClick",
  ]);
  const [internal, setInternal] = createSignal(local.defaultPressed ?? false);
  // Controlled iff `pressed` is provided.
  const isPressed = () => local.pressed ?? internal();

  return (
    <Button
      type="button"
      variant={local.variant ?? "outline"}
      aria-pressed={isPressed()}
      class={cn(
        isPressed() &&
          "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border-zen-primary",
        local.class,
      )}
      onClick={(e: MouseEvent) => {
        (local.onClick as ((e: MouseEvent) => void) | undefined)?.(e);
        if (e.defaultPrevented) return;
        const next = !isPressed();
        if (local.pressed === undefined) setInternal(next);
        local.onPressedChange?.(next);
      }}
      {...rest}
    />
  );
};

/* --------------------------- SegmentedButton --------------------------- */

type SegmentedCtx = {
  value: () => string | undefined;
  select: (v: string) => void;
  size: () => ButtonProps["size"];
};
const SegmentedContext = createContext<SegmentedCtx>();

const useSegmented = () => {
  const ctx = useContext(SegmentedContext);
  if (!ctx) throw new Error("SegmentedButtonItem must be used inside a SegmentedButton");
  return ctx;
};

export type SegmentedButtonProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ButtonProps["size"];
};

export const SegmentedButton = (props: SegmentedButtonProps) => {
  const [local, rest] = splitProps(props, [
    "value",
    "defaultValue",
    "onValueChange",
    "size",
    "class",
    "children",
  ]);
  const [internal, setInternal] = createSignal(local.defaultValue);
  const current = createMemo(() => local.value ?? internal());
  const select = (v: string) => {
    if (local.value === undefined) setInternal(v);
    local.onValueChange?.(v);
  };

  return (
    <SegmentedContext.Provider
      value={{ value: current, select, size: () => local.size ?? "sm" }}
    >
      <div
        role="radiogroup"
        class={cn(
          "zen-inline-flex zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border",
          "[&>button]:zen-rounded-none [&>button]:zen-border-0 [&>button:not(:first-child)]:zen-border-l [&>button:not(:first-child)]:zen-border-zen-border",
          "[&>button:first-child]:zen-rounded-l-zen-md [&>button:last-child]:zen-rounded-r-zen-md",
          local.class,
        )}
        {...rest}
      >
        {local.children}
      </div>
    </SegmentedContext.Provider>
  );
};

export type SegmentedButtonItemProps = Omit<ButtonProps, "value"> & {
  value: string;
};

export const SegmentedButtonItem = (props: SegmentedButtonItemProps) => {
  const ctx = useSegmented();
  const [local, rest] = splitProps(props, ["value", "class", "onClick"]);
  const selected = () => ctx.value() === local.value;
  return (
    <Button
      type="button"
      role="radio"
      aria-checked={selected()}
      variant="ghost"
      size={ctx.size()}
      class={cn(
        selected() && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-font-semibold",
        local.class,
      )}
      onClick={(e: MouseEvent) => {
        (local.onClick as ((e: MouseEvent) => void) | undefined)?.(e);
        if (!e.defaultPrevented) ctx.select(local.value);
      }}
      {...rest}
    />
  );
};

/* ----------------------------- SplitButton ----------------------------- */

export type SplitButtonProps = ButtonProps & {
  /** Menu contents — pass DropdownMenuItem children. */
  menu: JSX.Element;
  /** Accessible name for the arrow half. */
  menuLabel?: string;
  menuAlign?: "start" | "center" | "end";
};

export const SplitButton = (props: SplitButtonProps) => {
  const [local, rest] = splitProps(props, [
    "menu",
    "menuLabel",
    "menuAlign",
    "variant",
    "color",
    "size",
    "class",
    "children",
    "disabled",
  ]);
  const variant = () => local.variant ?? "solid";
  const color = () => local.color ?? "primary";
  const size = () => local.size ?? "md";

  return (
    // Two real buttons, not one with a nested trigger: a <button> inside a
    // <button> is invalid HTML and breaks keyboard semantics.
    <div class={cn("zen-inline-flex zen-items-stretch", local.class)}>
      <Button
        type="button"
        variant={variant()}
        color={color()}
        size={size()}
        disabled={local.disabled}
        class="zen-rounded-r-none"
        {...rest}
      >
        {local.children}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          as={Button}
          type="button"
          variant={variant()}
          color={color()}
          size={size()}
          disabled={local.disabled}
          aria-label={local.menuLabel ?? "More actions"}
          class="zen-rounded-l-none zen-border-l zen-border-l-zen-border zen-px-2"
        >
          <Icon name="chevron-down" size={14} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align={local.menuAlign ?? "end"}>
          {local.menu}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

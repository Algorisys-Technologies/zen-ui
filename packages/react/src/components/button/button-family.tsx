import * as React from "react";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "./button";
import { Icon } from "../icon/icon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../dropdown-menu/dropdown-menu";

/**
 * Button family — the three Fiori-shaped button forms zen-ui was missing.
 * See docs/fiori-gap-analysis.md (Tier 2: "cheap, high frequency").
 *
 *   ToggleButton     a button with a pressed state
 *   SegmentedButton  mutually exclusive choice, rendered as one joined control
 *   SplitButton      a default action plus a dropdown of related actions
 *
 * All three compose the existing Button rather than restyling from scratch, so
 * variant/color/size stay consistent and any Button change flows through.
 */

/* ---------------------------- ToggleButton ----------------------------- */

export interface ToggleButtonProps extends Omit<ButtonProps, "onChange"> {
  /** Controlled pressed state. */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

export const ToggleButton = React.forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    { pressed, defaultPressed = false, onPressedChange, variant = "outline", className, onClick, ...props },
    ref,
  ) => {
    const [internal, setInternal] = React.useState(defaultPressed);
    // Controlled iff `pressed` is provided — the uncontrolled state is kept but
    // ignored, so switching modes mid-life can't strand a stale value.
    const isPressed = pressed ?? internal;

    return (
      <Button
        ref={ref}
        type="button"
        variant={variant}
        aria-pressed={isPressed}
        // A pressed toggle reads as "selected", which `soft` already expresses.
        className={cn(isPressed && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border-zen-primary", className)}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          const next = !isPressed;
          if (pressed === undefined) setInternal(next);
          onPressedChange?.(next);
        }}
        {...props}
      />
    );
  },
);
ToggleButton.displayName = "ToggleButton";

/* --------------------------- SegmentedButton --------------------------- */

type SegmentedCtx = {
  value: string | undefined;
  select: (v: string) => void;
  size: ButtonProps["size"];
};
const SegmentedContext = React.createContext<SegmentedCtx | null>(null);

const useSegmented = () => {
  const ctx = React.useContext(SegmentedContext);
  if (!ctx) throw new Error("SegmentedButtonItem must be used inside a SegmentedButton");
  return ctx;
};

export interface SegmentedButtonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ButtonProps["size"];
  /** Accessible name for the group — it is a radiogroup, so it needs one. */
  "aria-label"?: string;
}

export const SegmentedButton = React.forwardRef<HTMLDivElement, SegmentedButtonProps>(
  ({ value, defaultValue, onValueChange, size = "sm", className, children, ...props }, ref) => {
    const [internal, setInternal] = React.useState(defaultValue);
    const current = value ?? internal;
    const select = React.useCallback(
      (v: string) => {
        if (value === undefined) setInternal(v);
        onValueChange?.(v);
      },
      [value, onValueChange],
    );
    const ctx = React.useMemo(() => ({ value: current, select, size }), [current, select, size]);

    return (
      <SegmentedContext.Provider value={ctx}>
        <div
          ref={ref}
          role="radiogroup"
          // Joined control: strip the doubled interior borders and the interior
          // rounding so the group reads as one segmented bar.
          className={cn(
            "zen-inline-flex zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border",
            "[&>button]:zen-rounded-none [&>button]:zen-border-0 [&>button:not(:first-child)]:zen-border-l [&>button:not(:first-child)]:zen-border-zen-border",
            "[&>button:first-child]:zen-rounded-l-zen-md [&>button:last-child]:zen-rounded-r-zen-md",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </SegmentedContext.Provider>
    );
  },
);
SegmentedButton.displayName = "SegmentedButton";

export interface SegmentedButtonItemProps extends Omit<ButtonProps, "value"> {
  value: string;
}

export const SegmentedButtonItem = React.forwardRef<HTMLButtonElement, SegmentedButtonItemProps>(
  ({ value, className, onClick, ...props }, ref) => {
    const ctx = useSegmented();
    const selected = ctx.value === value;
    return (
      <Button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={selected}
        variant="ghost"
        size={ctx.size}
        className={cn(
          selected && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-font-semibold",
          className,
        )}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) ctx.select(value);
        }}
        {...props}
      />
    );
  },
);
SegmentedButtonItem.displayName = "SegmentedButtonItem";

/* ----------------------------- SplitButton ----------------------------- */

export interface SplitButtonProps extends ButtonProps {
  /** Menu contents — pass DropdownMenuItem children. */
  menu: React.ReactNode;
  /** Accessible name for the arrow half. */
  menuLabel?: string;
  menuAlign?: "start" | "center" | "end";
}

export const SplitButton = React.forwardRef<HTMLButtonElement, SplitButtonProps>(
  (
    { menu, menuLabel = "More actions", menuAlign = "end", variant = "solid", color = "primary", size = "md", className, children, disabled, ...props },
    ref,
  ) => (
    // Two real buttons, not one with a nested trigger: a <button> inside a
    // <button> is invalid HTML and breaks keyboard semantics.
    <div className={cn("zen-inline-flex zen-items-stretch", className)}>
      <Button
        ref={ref}
        type="button"
        variant={variant}
        color={color}
        size={size}
        disabled={disabled}
        className="zen-rounded-r-none"
        {...props}
      >
        {children}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={variant}
            color={color}
            size={size}
            disabled={disabled}
            aria-label={menuLabel}
            className="zen-rounded-l-none zen-border-l zen-border-l-zen-border zen-px-2"
          >
            <Icon name="chevron-down" size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={menuAlign}>{menu}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
);
SplitButton.displayName = "SplitButton";

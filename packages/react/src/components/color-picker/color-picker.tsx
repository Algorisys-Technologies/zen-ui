import * as React from "react";
import { colorLabel, normalizeHex, type ColorOption } from "@algorisys/zen-ui-core/color";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Input } from "../form/input/input";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { ColorPalette } from "./color-palette";

/**
 * ColorPicker — a swatch that opens a palette, a hex field and the platform's
 * own picker.
 *
 *   <ColorPicker value={brand} onValueChange={setBrand} />
 *   <ColorPicker colors={BRAND} allowCustom={false} />
 *
 * The gradient area is the OS picker (`<input type="color">`) rather than a
 * hand-rolled saturation/value canvas. That is a deliberate trade: the native
 * one is keyboard-accessible, screen-reader-labelled, eyedropper-equipped and
 * localised on every platform, for free and with no dependency. A canvas would
 * be a drag-maths reimplementation of all of it, worse. `allowCustom={false}`
 * removes it when a brand palette is the whole point.
 *
 * The hex field takes what people actually paste: "3b82f6", "#ABC", " #fff ".
 * It commits only a colour that parses, so the value can never be nonsense —
 * and it does not fight you while typing.
 */

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  /** The palette inside the popover. Omit for none. */
  colors?: (string | ColorOption)[];
  /** The hex field + the platform picker. Default true. */
  allowCustom?: boolean;
  /** Accessible name for the trigger. */
  label?: string;
  /** Text when nothing is chosen yet. */
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_COLORS: ColorOption[] = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#facc15", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#a855f7", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#78716c", label: "Stone" },
  { value: "#000000", label: "Black" },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value: valueProp,
  defaultValue,
  onValueChange,
  colors = DEFAULT_COLORS,
  allowCustom = true,
  label = "Choose a colour",
  placeholder = "Pick a colour",
  disabled,
  className,
}) => {
  const [inner, setInner] = React.useState(() => normalizeHex(defaultValue ?? "") ?? "");
  const isControlled = valueProp !== undefined;
  const value = isControlled ? (normalizeHex(valueProp) ?? "") : inner;

  const [open, setOpen] = React.useState(false);
  // The field holds what is being TYPED, which is not always a colour yet:
  // "#3b8" is three keystrokes from valid. Committing per keystroke would
  // fight the user, so the draft lives here and only valid hex escapes.
  const [draft, setDraft] = React.useState("");
  React.useEffect(() => setDraft(value), [value, open]);

  const update = (hex: string) => {
    const next = normalizeHex(hex);
    if (!next) return;
    if (!isControlled) setInner(next);
    onValueChange?.(next);
  };

  const named = colors.map((c) => (typeof c === "string" ? { value: c } : c)).find(
    (c) => normalizeHex(c.value) === value,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          color="neutral"
          disabled={disabled}
          aria-label={label}
          className={cn("zen-justify-start zen-gap-2 zen-font-normal", className)}
        >
          <span
            aria-hidden
            className="zen-h-4 zen-w-4 zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border"
            style={{ backgroundColor: value || "transparent" }}
          />
          <span className={cn(!value && "zen-text-zen-muted-fg")}>
            {value ? (named ? colorLabel(named) : value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="zen-w-auto zen-flex zen-flex-col zen-gap-3">
        {colors.length ? (
          <ColorPalette colors={colors} value={value} onValueChange={update} label={label} />
        ) : null}

        {allowCustom ? (
          <div className="zen-flex zen-items-center zen-gap-2">
            {/* The platform's picker. A label element rather than a bare input:
                a native colour swatch is unlabelled and near-impossible to
                style, so it hides inside its own trigger. */}
            <label
              className={cn(
                "zen-relative zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-cursor-pointer",
                "zen-items-center zen-justify-center zen-overflow-hidden zen-rounded-zen-sm",
                "zen-border zen-border-zen-border",
              )}
              style={{ backgroundColor: value || "transparent" }}
              title="Custom colour"
            >
              <span className="zen-sr-only">Custom colour</span>
              <input
                type="color"
                value={value || "#000000"}
                onChange={(e) => update(e.target.value)}
                disabled={disabled}
                className="zen-absolute zen-inset-0 zen-cursor-pointer zen-opacity-0"
              />
            </label>
            <Input
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                update(e.target.value);
              }}
              placeholder="#3b82f6"
              aria-label="Hex colour"
              spellCheck={false}
              autoComplete="off"
              className="zen-h-8 zen-w-28 zen-font-mono zen-text-xs"
            />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};

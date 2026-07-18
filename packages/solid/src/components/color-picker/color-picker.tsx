import { Show, createEffect, createMemo, createSignal } from "solid-js";
import { colorLabel, normalizeHex, toColorOption, type ColorOption } from "@algorisys/zen-ui-core/color";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Input } from "../form/input/input";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { ColorPalette } from "./color-palette";

/**
 * ColorPicker — a swatch that opens a palette, a hex field and the platform's
 * own picker.
 *
 * The gradient area is the OS picker (`<input type="color">`) rather than a
 * hand-rolled saturation/value canvas: the native one is keyboard-accessible,
 * screen-reader-labelled, eyedropper-equipped and localised on every platform,
 * for free and with no dependency. `allowCustom={false}` removes it when a
 * brand palette is the whole point.
 *
 * Mirrors the React binding's API.
 */

export type ColorPickerProps = {
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
  class?: string;
};

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

export const ColorPicker = (props: ColorPickerProps) => {
  const [inner, setInner] = createSignal(normalizeHex(props.defaultValue ?? "") ?? "");
  const isControlled = () => props.value !== undefined;
  const value = createMemo(() =>
    isControlled() ? (normalizeHex(props.value as string) ?? "") : inner(),
  );

  const [open, setOpen] = createSignal(false);
  // The field holds what is being TYPED, which is not always a colour yet:
  // "#3b8" is three keystrokes from valid. Committing per keystroke would
  // fight the user, so the draft lives here and only valid hex escapes.
  const [draft, setDraft] = createSignal("");
  createEffect(() => {
    open();
    setDraft(value());
  });

  const colors = () => props.colors ?? DEFAULT_COLORS;

  const update = (hex: string) => {
    const next = normalizeHex(hex);
    if (!next) return;
    if (!isControlled()) setInner(next);
    props.onValueChange?.(next);
  };

  const named = createMemo(() =>
    colors()
      .map(toColorOption)
      .find((c) => normalizeHex(c.value) === value()),
  );

  return (
    <Popover open={open()} onOpenChange={setOpen}>
      <PopoverTrigger
        as={Button}
        variant="outline"
        color="neutral"
        disabled={props.disabled}
        aria-label={props.label ?? "Choose a colour"}
        class={cn("zen-justify-start zen-gap-2 zen-font-normal", props.class)}
      >
        <span
          aria-hidden="true"
          class="zen-h-4 zen-w-4 zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border"
          style={{ "background-color": value() || "transparent" }}
        />
        <span class={cn(!value() && "zen-text-zen-muted-fg")}>
          {value() ? (named() ? colorLabel(named()!) : value()) : (props.placeholder ?? "Pick a colour")}
        </span>
      </PopoverTrigger>
      <PopoverContent class="zen-w-auto zen-flex zen-flex-col zen-gap-3">
        <Show when={colors().length}>
          <ColorPalette
            colors={colors()}
            value={value()}
            onValueChange={update}
            label={props.label ?? "Choose a colour"}
          />
        </Show>

        <Show when={props.allowCustom ?? true}>
          <div class="zen-flex zen-items-center zen-gap-2">
            {/* The platform's picker. A label element rather than a bare input:
                a native colour swatch is unlabelled and near-impossible to
                style, so it hides inside its own trigger. */}
            <label
              class={cn(
                "zen-relative zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-cursor-pointer",
                "zen-items-center zen-justify-center zen-overflow-hidden zen-rounded-zen-sm",
                "zen-border zen-border-zen-border",
              )}
              style={{ "background-color": value() || "transparent" }}
              title="Custom colour"
            >
              <span class="zen-sr-only">Custom colour</span>
              <input
                type="color"
                value={value() || "#000000"}
                onInput={(e) => update(e.currentTarget.value)}
                disabled={props.disabled}
                class="zen-absolute zen-inset-0 zen-cursor-pointer zen-opacity-0"
              />
            </label>
            <Input
              value={draft()}
              onInput={(e) => {
                setDraft(e.currentTarget.value);
                update(e.currentTarget.value);
              }}
              placeholder="#3b82f6"
              aria-label="Hex colour"
              spellcheck={false}
              autocomplete="off"
              class="zen-h-8 zen-w-28 zen-font-mono zen-text-xs"
            />
          </div>
        </Show>
      </PopoverContent>
    </Popover>
  );
};

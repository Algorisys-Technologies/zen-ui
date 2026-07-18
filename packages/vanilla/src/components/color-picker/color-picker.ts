import {
  colorLabel,
  contrastingInk,
  normalizeHex,
  toColorOption,
  type ColorOption,
} from "@algorisys/zen-ui-core/color";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../lib/component";
import { controllable } from "../../lib/state";
import { Button } from "../button/button";
import { Input, type InputHandle } from "../form/input/input";
import { Popover, type PopoverHandle } from "../popover/popover";

/**
 * ColorPicker + ColorPalette — the vanilla port of the React reference.
 *
 *   const pick = ColorPicker({ value: brand, onValueChange: setBrand });
 *   document.body.append(pick.el);
 *
 *   const swatches = ColorPalette({ colors: BRAND, onValueChange: setBrand });
 *
 * The colour maths is core's (`@algorisys/zen-ui-core/color`), the same object
 * React and Solid call, so no binding can disagree about what a colour is. Hex
 * in, hex out — normalised, so "#FFF" and "#ffffff" are one colour, not two.
 *
 * ## What the port keeps
 *
 * The gradient area is the OS picker (`<input type="color">`), not a hand-rolled
 * saturation/value canvas — the native one is keyboard-accessible, screen-reader
 * labelled, eyedropper-equipped and localised for free. `allowCustom: false`
 * removes it and the hex field when a brand palette is the whole point.
 *
 * The hex field takes what people paste ("3b82f6", "#ABC", " #fff ") and commits
 * only a colour that parses, so the value can never be nonsense — and it does not
 * fight you while typing: the field holds the raw draft, and only valid hex
 * escapes to the value. React kept this in a `draft` state + effect; here the
 * field element simply is the draft, and a committed value overwrites it.
 *
 * ## The divergence from React's compound Popover, and why this side of it
 *
 * React composes `<Popover><PopoverTrigger asChild>…</PopoverContent></Popover>`.
 * Vanilla's `Popover` takes trigger/children as data (there is no context to
 * thread a root through — see popover.ts). This file follows suit: it builds the
 * trigger and a persistent content node and hands both to `Popover`.
 */

/* ------------------------------------------------------------------ ColorPalette */

export interface ColorPaletteProps {
  colors: (string | ColorOption)[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  /** The radiogroup's accessible name. */
  label?: string;
  /** Swatch size. Default "md". */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  class?: string;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

const SIZES = { sm: "zen-h-6 zen-w-6", md: "zen-h-8 zen-w-8", lg: "zen-h-10 zen-w-10" } as const;

// Our own trusted markup, never a caller's string — see PORTING.md. The stroke is
// black or white, whichever is readable ON the swatch: a fixed tick colour
// disappears at one end of every palette.
const tickSvg = (ink: string) =>
  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

export function ColorPalette(props: ColorPaletteProps): ZenComponent<ColorPaletteProps> {
  let current: ColorPaletteProps = { ...props };
  const el = document.createElement("div");
  el.setAttribute("role", "radiogroup");

  const disposer = new Disposer();
  const cleanups = new Disposer();
  let removeProps: (() => void) | undefined;

  const state = controllable<string>({
    value: current.value !== undefined ? (normalizeHex(current.value) ?? "") : undefined,
    defaultValue: normalizeHex(current.defaultValue ?? "") ?? "",
    onChange: (v) => current.onValueChange?.(v),
  });

  // hex -> its <button>, so a value change repaints without a rebuild.
  let buttons: Array<{ btn: HTMLButtonElement; hex: string }> = [];

  const optionsNow = () => current.colors.map(toColorOption);

  const commit = (raw: string) => {
    // React normalises but keeps a non-hex string as-is; mirror that so an
    // exotic option value still round-trips.
    state.set(normalizeHex(raw) ?? raw);
  };

  const paint = () => {
    const value = state.get();
    const index = buttons.findIndex((b) => b.hex === value);
    buttons.forEach(({ btn, hex }, i) => {
      const selected = hex === value;
      btn.setAttribute("aria-checked", String(selected));
      btn.tabIndex = selected || (index < 0 && i === 0) ? 0 : -1;
      btn.innerHTML = selected ? tickSvg(contrastingInk(hex)) : "";
    });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (current.disabled) return;
    const options = optionsNow();
    const last = options.length - 1;
    if (last < 0) return;
    const value = state.get();
    const index = options.findIndex((o) => (normalizeHex(o.value) ?? o.value) === value);
    const go = (i: number) => {
      e.preventDefault();
      commit(options[Math.max(0, Math.min(last, i))].value);
    };
    if (e.key === "ArrowRight" || e.key === "ArrowDown") go(index < 0 ? 0 : index + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(index < 0 ? 0 : index - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(last);
  };

  const render = () => {
    const {
      colors: _colors,
      value: _value,
      defaultValue: _defaultValue,
      onValueChange: _onValueChange,
      label,
      size = "md",
      disabled,
      class: className,
      ...rest
    } = current;

    cleanups.dispose();
    el.className = cn("zen-flex zen-flex-wrap zen-gap-1.5", disabled && "zen-opacity-50", className);
    if (label !== undefined) el.setAttribute("aria-label", label);
    else el.removeAttribute("aria-label");
    if (disabled) el.setAttribute("aria-disabled", "true");
    else el.removeAttribute("aria-disabled");

    el.replaceChildren();
    buttons = [];

    for (const o of optionsNow()) {
      const hex = normalizeHex(o.value) ?? o.value;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("role", "radio");
      const name = colorLabel(o);
      btn.setAttribute("aria-label", name);
      btn.title = name;
      btn.disabled = Boolean(disabled);
      btn.className = cn(
        "zen-inline-flex zen-items-center zen-justify-center zen-rounded-zen-sm",
        "zen-cursor-pointer zen-border zen-border-zen-border zen-p-0 zen-transition-transform",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        disabled && "zen-cursor-not-allowed",
        SIZES[size],
      );
      // The swatch IS the colour, so it cannot come from a class — a class per hex
      // is a class UnoCSS never sees and never generates.
      btn.style.backgroundColor = hex;

      const onClick = () => {
        if (!disabled) commit(o.value);
      };
      btn.addEventListener("click", onClick);
      cleanups.add(() => btn.removeEventListener("click", onClick));

      el.append(btn);
      buttons.push({ btn, hex });
    }

    paint();

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  el.addEventListener("keydown", onKeyDown);
  render();

  disposer.add(state.subscribe(paint));
  disposer.add(() => el.removeEventListener("keydown", onKeyDown));
  disposer.add(() => cleanups.dispose());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      const keys = Object.keys(next);
      // A value-only change must NOT rebuild: a rebuild drops the DOM node that
      // currently holds focus, which breaks arrow-key navigation the instant the
      // parent ColorPicker echoes the value back. `state.sync` repaints selection
      // on the existing buttons instead (via the subscription), and focus stays.
      const onlyValue = keys.length > 0 && keys.every((k) => k === "value");
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(normalizeHex(next.value) ?? next.value);
      if (!onlyValue) render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/* -------------------------------------------------------------------- ColorPicker */

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
  class?: string;
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

export function ColorPicker(props: ColorPickerProps): ZenComponent<ColorPickerProps> {
  let current: ColorPickerProps = { ...props };
  const disposer = new Disposer();
  const inner = new Disposer();

  const state = controllable<string>({
    value: current.value !== undefined ? (normalizeHex(current.value) ?? "") : undefined,
    defaultValue: normalizeHex(current.defaultValue ?? "") ?? "",
    onChange: (v) => current.onValueChange?.(v),
  });

  // update() in React: commit only a colour that parses.
  const commit = (raw: string) => {
    const next = normalizeHex(raw);
    if (!next) return;
    state.set(next);
  };

  // ---- the trigger: a swatch preview + a label, on an outline Button.
  const swatch = document.createElement("span");
  swatch.setAttribute("aria-hidden", "true");
  swatch.className = "zen-h-4 zen-w-4 zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border";

  const labelSpan = document.createElement("span");

  const triggerBtn = Button({
    variant: "outline",
    color: "neutral",
    disabled: current.disabled,
    "aria-label": current.label ?? "Choose a colour",
    class: cn("zen-justify-start zen-gap-2 zen-font-normal", current.class),
    children: [swatch, labelSpan],
  });

  // ---- the content: a persistent node handed to Popover, mutated in place.
  const content = document.createElement("div");

  let palette: ZenComponent<ColorPaletteProps> | null = null;
  let colorInput: HTMLInputElement | null = null;
  let hexInput: InputHandle | null = null;

  const paintTrigger = () => {
    const value = state.get();
    swatch.style.backgroundColor = value || "transparent";
    const named = (current.colors ?? DEFAULT_COLORS)
      .map(toColorOption)
      .find((c) => normalizeHex(c.value) === value);
    labelSpan.className = cn(!value && "zen-text-zen-muted-fg");
    labelSpan.textContent = value
      ? named
        ? colorLabel(named)
        : value
      : (current.placeholder ?? "Pick a colour");
  };

  const paint = () => {
    const value = state.get();
    paintTrigger();
    palette?.update({ value });
    if (colorInput) colorInput.value = value || "#000000";
    if (hexInput) hexInput.el.value = value;
  };

  const renderContent = () => {
    inner.dispose();
    palette = null;
    colorInput = null;
    hexInput = null;
    content.replaceChildren();

    const colors = current.colors ?? DEFAULT_COLORS;
    const allowCustom = current.allowCustom ?? true;
    const label = current.label ?? "Choose a colour";

    if (colors.length) {
      palette = ColorPalette({ colors, value: state.get(), onValueChange: commit, label });
      inner.add(() => palette?.destroy());
      content.append(palette.el);
    }

    if (allowCustom) {
      const row = document.createElement("div");
      row.className = "zen-flex zen-items-center zen-gap-2";

      // The platform's picker, hidden inside a styleable trigger: a native colour
      // swatch is unlabelled and near-impossible to style on its own.
      const swatchLabel = document.createElement("label");
      swatchLabel.className = cn(
        "zen-relative zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-cursor-pointer",
        "zen-items-center zen-justify-center zen-overflow-hidden zen-rounded-zen-sm",
        "zen-border zen-border-zen-border",
      );
      swatchLabel.style.backgroundColor = state.get() || "transparent";
      swatchLabel.title = "Custom colour";

      const sr = document.createElement("span");
      sr.className = "zen-sr-only";
      sr.textContent = "Custom colour";

      colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.value = state.get() || "#000000";
      colorInput.disabled = Boolean(current.disabled);
      colorInput.className = "zen-absolute zen-inset-0 zen-cursor-pointer zen-opacity-0";
      const onColor = () => commit(colorInput!.value);
      colorInput.addEventListener("input", onColor);
      inner.add(() => colorInput?.removeEventListener("input", onColor));

      swatchLabel.append(sr, colorInput);

      hexInput = Input({
        placeholder: "#3b82f6",
        "aria-label": "Hex colour",
        class: "zen-h-8 zen-w-28 zen-font-mono zen-text-xs",
        onInput: () => commit(hexInput!.el.value),
      });
      hexInput.el.spellcheck = false;
      hexInput.el.autocomplete = "off";
      hexInput.el.value = state.get();
      inner.add(() => hexInput?.destroy());

      // Keep the swatch backdrop in step with the value.
      inner.add(
        state.subscribe(() => {
          swatchLabel.style.backgroundColor = state.get() || "transparent";
        }),
      );

      row.append(swatchLabel, hexInput.el);
      content.append(row);
    }

    paint();
  };

  renderContent();

  const popover: PopoverHandle = Popover({
    trigger: triggerBtn,
    children: content,
    align: "start",
    class: "zen-w-auto zen-flex zen-flex-col zen-gap-3",
    // React resets the hex draft to the value whenever the popover opens or
    // closes, so a half-typed invalid string never survives a reopen.
    onOpenChange: () => {
      if (hexInput) hexInput.el.value = state.get();
    },
  });

  disposer.add(state.subscribe(paint));
  disposer.add(() => inner.dispose());
  disposer.add(() => popover.destroy());
  disposer.add(() => triggerBtn.destroy());

  return {
    el: popover.el,
    update(next) {
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(normalizeHex(next.value) ?? "");
      triggerBtn.update({
        disabled: current.disabled,
        "aria-label": current.label ?? "Choose a colour",
        class: cn("zen-justify-start zen-gap-2 zen-font-normal", current.class),
        children: [swatch, labelSpan],
      });
      if (next.colors !== undefined || next.allowCustom !== undefined || next.label !== undefined) {
        renderContent();
      } else {
        paint();
      }
    },
    destroy() {
      disposer.dispose();
    },
  };
}

import { type JSX, For, Show, createMemo, createSignal, splitProps } from "solid-js";
import {
  colorLabel,
  contrastingInk,
  normalizeHex,
  toColorOption,
  type ColorOption,
} from "@algorisys/zen-ui-core/color";
import { cn } from "../../lib/cn";

/**
 * ColorPalette — a grid of predefined swatches.
 *
 * Semantically a radiogroup, like Rating and Likert: "pick one of these" is the
 * same question whatever the options look like, so it gets the same keyboard
 * contract — arrows move, Home/End jump.
 *
 * Pass bare hex strings or {value,label}. A bare hex is announced AS its hex,
 * which is why `label` exists.
 *
 * The colour maths is shared via @algorisys/zen-ui-core/color, so this and the
 * React binding cannot disagree about what a colour is.
 *
 * Mirrors the React binding's API.
 */

export type ColorPaletteProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange" | "class"> & {
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
};

const SIZES = { sm: "zen-h-6 zen-w-6", md: "zen-h-8 zen-w-8", lg: "zen-h-10 zen-w-10" } as const;

export const ColorPalette = (props: ColorPaletteProps) => {
  const [local, rest] = splitProps(props, [
    "colors",
    "value",
    "defaultValue",
    "onValueChange",
    "label",
    "size",
    "disabled",
    "class",
  ]);

  const options = createMemo(() => local.colors.map(toColorOption));
  const [inner, setInner] = createSignal(normalizeHex(props.defaultValue ?? "") ?? "");
  const isControlled = () => local.value !== undefined;
  // Normalised before comparing, or "#FFF" and "#ffffff" select two swatches.
  const value = createMemo(() =>
    isControlled() ? (normalizeHex(local.value as string) ?? "") : inner(),
  );

  const update = (hex: string) => {
    const next = normalizeHex(hex) ?? hex;
    if (!isControlled()) setInner(next);
    local.onValueChange?.(next);
  };

  const index = createMemo(() =>
    options().findIndex((o) => normalizeHex(o.value) === value()),
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (local.disabled) return;
    const opts = options();
    const last = opts.length - 1;
    const i = index();
    const go = (n: number) => {
      e.preventDefault();
      update(opts[Math.max(0, Math.min(last, n))].value);
    };
    if (e.key === "ArrowRight" || e.key === "ArrowDown") go(i < 0 ? 0 : i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(i < 0 ? 0 : i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(last);
  };

  return (
    <div
      role="radiogroup"
      aria-label={local.label}
      aria-disabled={local.disabled || undefined}
      onKeyDown={onKeyDown}
      class={cn("zen-flex zen-flex-wrap zen-gap-1.5", local.disabled && "zen-opacity-50", local.class)}
      {...rest}
    >
      <For each={options()}>
        {(o, i) => {
          const hex = () => normalizeHex(o.value) ?? o.value;
          const selected = () => hex() === value();
          return (
            <button
              type="button"
              role="radio"
              aria-checked={selected()}
              aria-label={colorLabel(o)}
              title={colorLabel(o)}
              disabled={local.disabled}
              tabIndex={selected() || (index() < 0 && i() === 0) ? 0 : -1}
              onClick={() => !local.disabled && update(o.value)}
              class={cn(
                "zen-inline-flex zen-items-center zen-justify-center zen-rounded-zen-sm",
                "zen-cursor-pointer zen-border zen-border-zen-border zen-p-0 zen-transition-transform",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                local.disabled && "zen-cursor-not-allowed",
                SIZES[local.size ?? "md"],
              )}
              // The swatch IS the colour, so it cannot come from a class — a
              // class per hex is a class UnoCSS never sees and never generates.
              style={{ "background-color": hex() }}
            >
              <Show when={selected()}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  // Black or white, whichever is readable ON this swatch.
                  stroke={contrastingInk(hex())}
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </Show>
            </button>
          );
        }}
      </For>
    </div>
  );
};

import { type JSX, createMemo, createSignal, splitProps } from "solid-js";
import {
  applyMask,
  extractRaw,
  isMaskComplete,
  maskSkeleton,
  maskSlotCount,
  type MaskRules,
} from "@algorisys/zen-ui-core/mask";
import { cn } from "../../../lib/cn";
import { Input } from "../input/input";

/**
 * MaskInput — one input, a fixed template, and characters that can only land
 * where they are allowed.
 *
 *   <MaskInput mask="99-9999" onValueChange={(masked, raw) => …} />
 *   <MaskInput mask="aa-99" />
 *   <MaskInput mask="+\9\1 99999 99999" />   // escaped dialling code
 *
 * Default symbols: `9` a digit, `a` a letter, `*` either. Anything else is a
 * literal. A backslash escapes the next character — the only way to write a
 * literal that collides with a rule symbol.
 *
 * The engine is in `@algorisys/zen-ui-core/mask`, shared with the React
 * binding, so the two cannot disagree about what a mask means. Only the
 * rendering is ported.
 *
 * `value` is the MASKED string, and it is PARTIAL — "12-3", never "12-3___".
 * See the React binding for why both.
 *
 * Mirrors the React binding's API.
 */

export type MaskInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "class"
> & {
  /** The template, e.g. "99-9999". */
  mask: string;
  /** Extra or overriding symbols. Merged with the defaults, not replacing them. */
  rules?: MaskRules;
  /** Builds the placeholder skeleton — "__-____". Default "_". */
  placeholderChar?: string;
  /** The masked value. Pass "" to clear. */
  value?: string;
  defaultValue?: string;
  /** (masked, raw, complete) — store whichever you need. */
  onValueChange?: (masked: string, raw: string, complete: boolean) => void;
  class?: string;
};

export const MaskInput = (props: MaskInputProps) => {
  const [local, rest] = splitProps(props, [
    "mask",
    "rules",
    "placeholderChar",
    "value",
    "defaultValue",
    "onValueChange",
    "placeholder",
    "onKeyDown",
    "class",
  ]);

  // Read once, on purpose: this is the uncontrolled seed, and it mirrors
  // React's lazy useState initializer. A mask that changes after mount is a
  // different field; the caller re-keys it or drives `value`.
  const [inner, setInner] = createSignal(
    // eslint-disable-next-line solid/reactivity
    applyMask(extractRaw(props.defaultValue ?? "", props.mask, props.rules), props.mask, props.rules),
  );
  const isControlled = () => local.value !== undefined;
  // A controlled caller can hand back anything; run it through the engine so
  // the field can never display something the mask would not have produced.
  const masked = createMemo(() =>
    isControlled()
      ? applyMask(extractRaw(local.value as string, local.mask, local.rules), local.mask, local.rules)
      : inner(),
  );

  const commitRaw = (el: HTMLInputElement, raw: string) => {
    const nextMasked = applyMask(raw, local.mask, local.rules);
    if (!isControlled()) setInner(nextMasked);
    local.onValueChange?.(nextMasked, raw, isMaskComplete(raw, local.mask, local.rules));

    // Force the DOM back to what the engine allows.
    //
    // A rejected keystroke produces the SAME masked value as before, so the
    // signal does not change, so Solid does not re-render, so the character
    // the mask just refused stays sitting in the field. Typing "abc" into an
    // uppercase-only mask left "abc" on screen while the value was "".
    //
    // React's controlled input restores this for us; Solid's binding is a
    // one-way reactive assignment and does not. Hence the explicit write —
    // this is the divergence, not the API.
    if (el.value !== nextMasked) el.value = nextMasked;
  };

  const commit = (el: HTMLInputElement, next: string) =>
    commitRaw(el, extractRaw(next, local.mask, local.rules));

  /**
   * An all-digit mask gets the numeric keypad on a phone. Anything with a
   * letter slot must not: numeric would leave the user unable to type the
   * letters their own mask demands.
   */
  const inputMode = createMemo<"numeric" | "text">(() =>
    maskSlotCount(local.mask, local.rules) > 0 &&
    extractRaw("a".repeat(64), local.mask, local.rules).length === 0
      ? "numeric"
      : "text",
  );

  return (
    <Input
      // Not type="tel" or similar: the mask decides what is allowed, and a
      // type that fights it (number strips leading zeros) would win.
      type="text"
      inputMode={inputMode()}
      value={masked()}
      // Re-formatting whatever the field ends up holding is what makes typing,
      // pasting and deleting all arrive here as one case.
      onInput={(e) => commit(e.currentTarget, e.currentTarget.value)}
      onKeyDown={(e) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (local.onKeyDown as any)?.(e);
        if (e.defaultPrevented) return;
        // Backspace deletes a DATA character, not whatever glyph happens to sit
        // before the caret. Left to the browser it deletes the trailing
        // literal, applyMask puts it straight back, and the field jams:
        // "+91 12345 " swallowed every backspace forever.
        if (e.key === "Backspace" && !e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          commitRaw(e.currentTarget, extractRaw(masked(), local.mask, local.rules).slice(0, -1));
        }
      }}
      placeholder={
        local.placeholder ?? maskSkeleton(local.mask, local.placeholderChar ?? "_", local.rules)
      }
      autocomplete="off"
      class={cn(local.class)}
      {...rest}
    />
  );
};

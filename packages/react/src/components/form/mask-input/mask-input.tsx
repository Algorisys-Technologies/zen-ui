import * as React from "react";
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
 * literal the user never types and never deletes. A backslash escapes the
 * next character, which is the only way to write a literal that collides with
 * a rule symbol — see the note in core/mask.ts.
 *
 * The engine is in `@algorisys/zen-ui-core/mask` so this and the Solid
 * binding cannot disagree about what a mask means.
 *
 * Two decisions worth knowing:
 *
 *   `value` is the MASKED string — "12-3456", what the input shows and what a
 *   native form would submit. onValueChange hands you the raw alongside it, so
 *   whichever you store, it is one destructure away. Making `value` the raw
 *   would mean the prop and the visible field never agree, which is a strange
 *   thing for something called an input.
 *
 *   The value is PARTIAL: it holds what has been typed, formatted — "12-3",
 *   never "12-3___". A skeleton baked into the value has to be parsed back out
 *   on every keystroke and fights the caret for no benefit. The skeleton is the
 *   placeholder, where it costs nothing.
 */

export interface MaskInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> {
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
  className?: string;
}

export const MaskInput = React.forwardRef<HTMLInputElement, MaskInputProps>(
  (
    {
      mask,
      rules,
      placeholderChar = "_",
      value: valueProp,
      defaultValue,
      onValueChange,
      placeholder,
      onKeyDown,
      className,
      ...props
    },
    ref,
  ) => {
    const [inner, setInner] = React.useState(() =>
      applyMask(extractRaw(defaultValue ?? "", mask, rules), mask, rules),
    );
    const isControlled = valueProp !== undefined;
    // A controlled caller can hand back anything; run it through the engine so
    // the field can never display something the mask would not have produced.
    const masked = isControlled ? applyMask(extractRaw(valueProp, mask, rules), mask, rules) : inner;

    const commitRaw = (raw: string) => {
      const nextMasked = applyMask(raw, mask, rules);
      if (!isControlled) setInner(nextMasked);
      onValueChange?.(nextMasked, raw, isMaskComplete(raw, mask, rules));
    };

    const commit = (next: string) => commitRaw(extractRaw(next, mask, rules));

    return (
      <Input
        ref={ref}
        // Not type="tel" or similar: the mask decides what is allowed, and a
        // type that fights it (number strips leading zeros) would win.
        type="text"
        inputMode={maskInputMode(mask, rules)}
        value={masked}
        // Re-formatting whatever the field ends up holding is what makes
        // typing, pasting and deleting all arrive here as one case. Anything
        // the mask rejects never reaches state, so it never renders.
        onChange={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          // Backspace deletes a DATA character, not whatever glyph happens to
          // sit before the caret. Left to the browser it deletes the trailing
          // literal, applyMask puts it straight back, and the field jams:
          // "+91 12345 " swallowed every backspace forever. Literals are not
          // the user's to delete, so deleting through them is the only reading
          // that makes sense.
          if (e.key === "Backspace" && !e.altKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            commitRaw(extractRaw(masked, mask, rules).slice(0, -1));
          }
        }}
        placeholder={placeholder ?? maskSkeleton(mask, placeholderChar, rules)}
        autoComplete="off"
        className={cn(className)}
        {...props}
      />
    );
  },
);
MaskInput.displayName = "MaskInput";

/**
 * An all-digit mask gets the numeric keypad on a phone. Anything with a letter
 * slot must not: `inputMode="numeric"` would leave the user unable to type the
 * letters their own mask demands.
 */
const maskInputMode = (mask: string, rules?: MaskRules): "numeric" | "text" =>
  maskSlotCount(mask, rules) > 0 && extractRaw("a".repeat(64), mask, rules).length === 0
    ? "numeric"
    : "text";

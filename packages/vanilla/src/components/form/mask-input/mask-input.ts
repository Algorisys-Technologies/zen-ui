import {
  applyMask,
  extractRaw,
  isMaskComplete,
  maskSkeleton,
  maskSlotCount,
  type MaskRules,
} from "@algorisys/zen-ui-core/mask";
import { cn } from "../../../lib/cn";
import { Disposer, type ZenComponent } from "../../../lib/component";
import { INPUT_CLASS } from "../input/input";

/**
 * MaskInput — one input, a fixed template, and characters that can only land
 * where they are allowed.
 *
 *   MaskInput({ mask: "99-9999", onValueChange: (masked, raw) => … })
 *   MaskInput({ mask: "aa-99" })
 *   MaskInput({ mask: "+\\9\\1 99999 99999" })   // escaped dialling code
 *
 * **The engine is `@algorisys/zen-ui-core/mask` — the same functions React and
 * Solid call.** Nothing about what a mask MEANS is reimplemented here; this file
 * is only the DOM half. That is the point of including it in the slice: it is the
 * proof that core's pure logic reaches a binding with no framework, and it is the
 * cheapest component in the slice for exactly that reason.
 *
 * The two API decisions are the React reference's, and they carry over unchanged:
 *
 *   `value` is the MASKED string — "12-3456", what the field shows and what a
 *   native form would submit. onValueChange hands you the raw alongside it.
 *
 *   The value is PARTIAL: it holds what has been typed, formatted — "12-3", never
 *   "12-3___". The skeleton is the placeholder, where it costs nothing.
 */
export interface MaskInputProps {
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
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  class?: string;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

/**
 * An all-digit mask gets the numeric keypad on a phone. Anything with a letter
 * slot must not: inputMode="numeric" would leave the user unable to type the
 * letters their own mask demands. Copied from the React reference, engine and all.
 */
const maskInputMode = (mask: string, rules?: MaskRules): "numeric" | "text" =>
  maskSlotCount(mask, rules) > 0 && extractRaw("a".repeat(64), mask, rules).length === 0
    ? "numeric"
    : "text";

export type MaskInputHandle = ZenComponent<MaskInputProps, HTMLInputElement>;

export function MaskInput(props: MaskInputProps): MaskInputHandle {
  let current: MaskInputProps = { ...props };
  const el = document.createElement("input");
  const disposer = new Disposer();

  const controlled = () => current.value !== undefined;

  let inner = applyMask(
    extractRaw(current.defaultValue ?? "", current.mask, current.rules),
    current.mask,
    current.rules,
  );

  /** A controlled caller can hand back anything; run it through the engine so the
   *  field can never display something the mask would not have produced. */
  const masked = () =>
    controlled()
      ? applyMask(extractRaw(current.value!, current.mask, current.rules), current.mask, current.rules)
      : inner;

  const paint = () => {
    const next = masked();
    if (el.value !== next) el.value = next;
  };

  const commitRaw = (raw: string) => {
    const nextMasked = applyMask(raw, current.mask, current.rules);
    if (!controlled()) inner = nextMasked;
    // Repaint before notifying: an uncontrolled field must show the masked value
    // even if the caller does nothing, and a controlled one must snap back to
    // whatever the engine produced rather than keep the raw keystroke on screen.
    paint();
    current.onValueChange?.(nextMasked, raw, isMaskComplete(raw, current.mask, current.rules));
  };

  const commit = (next: string) => commitRaw(extractRaw(next, current.mask, current.rules));

  const onInput = () => commit(el.value);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.defaultPrevented) return;
    // Backspace deletes a DATA character, not whatever glyph happens to sit
    // before the caret. Left to the browser it deletes the trailing literal,
    // applyMask puts it straight back, and the field jams: "+91 12345 "
    // swallowed every backspace forever. Literals are not the user's to delete,
    // so deleting through them is the only reading that makes sense. This is the
    // React binding's bug fix, ported as behaviour rather than as lines.
    if (e.key === "Backspace" && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      commitRaw(extractRaw(masked(), current.mask, current.rules).slice(0, -1));
    }
  };

  const render = () => {
    const { class: className, mask, rules, placeholderChar = "_", placeholder, disabled, name, id } = current;

    el.className = cn(INPUT_CLASS, className);
    // Not type="tel" or similar: the mask decides what is allowed, and a type
    // that fights it (number strips leading zeros) would win.
    el.type = "text";
    el.inputMode = maskInputMode(mask, rules);
    el.placeholder = placeholder ?? maskSkeleton(mask, placeholderChar, rules);
    el.autocomplete = "off";
    el.disabled = Boolean(disabled);
    if (name) el.name = name;
    if (id) el.id = id;
    for (const [k, v] of Object.entries(current)) {
      if (k.startsWith("data-") || k.startsWith("aria-")) el.setAttribute(k, String(v));
    }
    paint();
  };

  el.addEventListener("input", onInput);
  el.addEventListener("keydown", onKeyDown);
  disposer.add(() => el.removeEventListener("input", onInput));
  disposer.add(() => el.removeEventListener("keydown", onKeyDown));

  render();

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export type { MaskRules };

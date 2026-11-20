import * as React from "react";
import { type MaskRules } from "../../../_core/mask";
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
export interface MaskInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> {
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
export declare const MaskInput: React.ForwardRefExoticComponent<MaskInputProps & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=mask-input.d.ts.map
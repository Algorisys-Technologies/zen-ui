import { type JSX } from "solid-js";
import { type MaskRules } from "@algorisys/zen-ui-core/mask";
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
export type MaskInputProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "class"> & {
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
export declare const MaskInput: (props: MaskInputProps) => JSX.Element;
//# sourceMappingURL=mask-input.d.ts.map
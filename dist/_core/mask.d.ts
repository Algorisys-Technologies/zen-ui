/**
 * The mask engine — framework-agnostic, so React and Solid cannot disagree
 * about what a mask means.
 *
 * This lives in core for the same reason the icon geometry does: it is pure
 * logic with no rendering in it, and a copy in each binding is precisely how
 * the two drift. Port the component, share the engine.
 *
 * A mask is a template of RULE SYMBOLS and LITERALS:
 *
 *   "99-9999"        -> 12-3456
 *   "aa-99"          -> ab-12
 *   "+\\9\\1 99999 99999"  -> +91 12345 67890
 *
 * Symbols with a rule are editable slots; every other character is a literal
 * the user never types and never deletes.
 *
 * A backslash escapes the next character into a literal. Without it a dialling
 * code like "+91 …" is unwritable: the 9 is a rule symbol, so it silently
 * becomes an editable slot and the mask quietly holds one more digit than the
 * author meant.
 */
/** A rule maps one mask symbol to the characters allowed in that slot. */
export type MaskRules = Record<string, RegExp>;
/**
 * The defaults, chosen to match what most mask inputs use (and SAP's
 * MaskInput, which is where this component's brief came from):
 *
 *   9  a digit
 *   a  a letter
 *   *  a letter or a digit
 *
 * A caller who needs "A" to mean an uppercase letter passes `rules` — the
 * defaults are merged, not replaced, so overriding one symbol does not
 * silently drop the other two.
 */
export declare const DEFAULT_MASK_RULES: MaskRules;
/** How many characters the mask can hold. */
export declare const maskSlotCount: (mask: string, rules?: MaskRules) => number;
/**
 * The raw characters `masked` carries — literals and anything else stripped.
 *
 * Deliberately validating per-slot rather than "keep every digit": in
 * "aa-99" the letters and the digits are not interchangeable, so a blanket
 * filter would happily move a digit into a letter slot and the mask would
 * lie about what it validated.
 */
export declare const extractRaw: (masked: string, mask: string, rules?: MaskRules) => string;
/**
 * Lay `raw` into `mask`, stopping at the last character actually entered.
 *
 * Partial by design: the value shows what has been typed, formatted, and no
 * further — "12-3", never "12-3___". A skeleton baked into the value has to
 * be parsed back out on every keystroke and fights the caret; the skeleton
 * belongs in the placeholder, where it costs nothing. See maskSkeleton.
 *
 * Literals are emitted ahead of the next character, so "12" in "99-99"
 * formats as "12-" and the user never types the dash.
 */
export declare const applyMask: (raw: string, mask: string, rules?: MaskRules) => string;
/**
 * The full pattern with every slot shown as `placeholderChar` — "__-____".
 * This is the placeholder, not the value.
 */
export declare const maskSkeleton: (mask: string, placeholderChar?: string, rules?: MaskRules) => string;
/** Every slot filled? Useful for "the code is 6 digits or it is not a code". */
export declare const isMaskComplete: (raw: string, mask: string, rules?: MaskRules) => boolean;

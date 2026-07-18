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
export const DEFAULT_MASK_RULES: MaskRules = {
  "9": /\d/,
  a: /[A-Za-z]/,
  "*": /[A-Za-z0-9]/,
};

const rulesFor = (rules?: MaskRules): MaskRules => ({ ...DEFAULT_MASK_RULES, ...rules });

type MaskPart = { slot: true; rule: RegExp } | { slot: false; ch: string };

/**
 * The mask as a list of slots and literals, resolved once.
 *
 * Every function here walks the mask, and each one deciding for itself what a
 * backslash means is how they would come to disagree — so they all read this.
 */
const parseMask = (mask: string, rules?: MaskRules): MaskPart[] => {
  const r = rulesFor(rules);
  const parts: MaskPart[] = [];
  const chars = [...mask];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === "\\" && i + 1 < chars.length) {
      // Escaped: the next character is a literal whatever it would mean.
      parts.push({ slot: false, ch: chars[++i] });
      continue;
    }
    const rule = Object.hasOwn(r, ch) ? r[ch] : undefined;
    parts.push(rule ? { slot: true, rule } : { slot: false, ch });
  }
  return parts;
};

/** How many characters the mask can hold. */
export const maskSlotCount = (mask: string, rules?: MaskRules): number =>
  parseMask(mask, rules).reduce((n, p) => n + (p.slot ? 1 : 0), 0);

/**
 * The raw characters `masked` carries — literals and anything else stripped.
 *
 * Deliberately validating per-slot rather than "keep every digit": in
 * "aa-99" the letters and the digits are not interchangeable, so a blanket
 * filter would happily move a digit into a letter slot and the mask would
 * lie about what it validated.
 */
export const extractRaw = (masked: string, mask: string, rules?: MaskRules): string => {
  const parts = parseMask(mask, rules);
  const chars = [...masked];
  const out: string[] = [];
  let j = 0;

  // Walks the mask and the string TOGETHER rather than filtering for
  // rule-matching characters. Filtering looks simpler and is wrong the moment
  // a literal could satisfy a slot: "+\9\1 99999" parsed by filter reads its
  // own "91" dialling code back as two digits of data.
  //
  // `aligned` is what makes that safe. A literal may only be consumed while
  // the string has matched every mask part before it — i.e. it really is our
  // own formatted value coming back. The moment one literal is absent, the
  // string is bare input and NO later literal may consume anything.
  //
  // Without this, typing "1" into "+\9\1 …" is read as the literal 1 of the
  // dialling code and vanishes: the first keystroke disappears and the user
  // types 10 digits to get 9. An anchored literal cannot do that, because a
  // bare "1" fails at the "+" and never reaches the "1".
  let aligned = true;

  for (const p of parts) {
    if (!p.slot) {
      if (aligned && j < chars.length && chars[j] === p.ch) j++;
      else aligned = false;
      continue;
    }
    // Skip what cannot go here — junk, or literals the caller left in — so
    // pasting "(020) 7946 0018" still finds its digits.
    while (j < chars.length && !p.rule.test(chars[j])) j++;
    if (j >= chars.length) break;
    out.push(chars[j]);
    j++;
  }
  return out.join("");
};

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
export const applyMask = (raw: string, mask: string, rules?: MaskRules): string => {
  if (!raw) return "";

  const parts = parseMask(mask, rules);
  const total = parts.reduce((n, p) => n + (p.slot ? 1 : 0), 0);
  const chars = [...raw];
  let i = 0;
  let out = "";

  for (const p of parts) {
    if (i >= chars.length) {
      // Trailing literals only while more input can still follow them: "12"
      // in "99-99" shows "12-" so the dash is never typed, but a complete
      // value does not grow a dangling separator.
      if (!p.slot && i > 0 && i < total) out += p.ch;
      else break;
      continue;
    }
    if (p.slot) {
      out += chars[i];
      i++;
    } else {
      out += p.ch;
    }
  }
  return out;
};

/**
 * The full pattern with every slot shown as `placeholderChar` — "__-____".
 * This is the placeholder, not the value.
 */
export const maskSkeleton = (mask: string, placeholderChar = "_", rules?: MaskRules): string =>
  parseMask(mask, rules)
    .map((p) => (p.slot ? placeholderChar : p.ch))
    .join("");

/** Every slot filled? Useful for "the code is 6 digits or it is not a code". */
export const isMaskComplete = (raw: string, mask: string, rules?: MaskRules): boolean =>
  [...raw].length === maskSlotCount(mask, rules);

/**
 * Numbers as people read and type them: the pure half of AmountField,
 * QuantityField and ObjectNumber's formatting, shared by every binding.
 *
 *   bun run check:number-format
 *
 * Formatting is Intl's, so every locale is right by construction: India groups
 * 1,00,000.00, Germany writes 1.000,00, Switzerland 1’000.00, France
 * 1 000,00 (a narrow no-break space). An amount takes its currency's own
 * precision (INR 2, JPY 0, KWD 3) unless told otherwise.
 *
 * Parsing is the part Intl does not do, and is strict on purpose: the locale's
 * group and decimal marks, its own digits (Devanagari, Arabic-Indic…),
 * accounting parentheses for a negative, and, when asked, the shorthand
 * clerks type: 2.5k, 2L (lakh), 1.2Cr (crore), 3M. Text that could mean two
 * numbers ("1,234" where "," is the decimal mark) is "invalid", never a guess:
 * a wrong amount on an invoice is worse than a field that says it cannot read
 * what was typed.
 */

/**
 * The locale if Intl accepts it, else undefined (the browser's). A malformed
 * tag from an app's settings must not stop a page from rendering: Intl throws
 * a RangeError on one.
 */
export function validLocale(locale?: string): string | undefined {
  if (!locale) return undefined;
  try {
    Intl.getCanonicalLocales(locale);
    return locale;
  } catch {
    return undefined;
  }
}

export interface NumberParts {
  /** The decimal mark: "." or "," (or "٫" in Arabic). */
  decimal: string;
  /** The group mark: ",", ".", " " (narrow no-break), "’"… */
  group: string;
  /** The locale's digits 0–9 (Latin for most; Devanagari for hi-IN-u-nu-deva…). */
  digits: string[];
}

const partsCache = new Map<string, NumberParts>();

/** The marks and digits a locale writes numbers with. */
export function numberParts(rawLocale?: string): NumberParts {
  const locale = validLocale(rawLocale);
  const key = locale ?? "";
  const hit = partsCache.get(key);
  if (hit) return hit;
  const f = new Intl.NumberFormat(locale, { useGrouping: true, minimumFractionDigits: 1 });
  const parts = f.formatToParts(1234567.5);
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const digitFmt = new Intl.NumberFormat(locale, { useGrouping: false });
  const digits = Array.from({ length: 10 }, (_, i) => digitFmt.format(i));
  const out = { decimal, group, digits };
  partsCache.set(key, out);
  return out;
}

/** A currency's usual decimal places: INR 2, JPY 0, KWD 3. */
export function currencyPrecision(currency: string): number {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

/**
 * Round half away from zero to `digits` places, in decimal, not binary:
 * 1.005 -> 1.01 and -1.005 -> -1.01 (Math.round(1.005 * 100) / 100 gives 1).
 */
export function roundTo(n: number, digits: number): number {
  if (!Number.isFinite(n)) return n;
  const sign = n < 0 ? -1 : 1;
  const [mant, exp] = String(Math.abs(n)).split("e");
  const shifted = Math.round(Number(`${mant}e${Number(exp ?? 0) + digits}`));
  const [m2, e2] = String(shifted).split("e");
  const result = Number(`${m2}e${Number(e2 ?? 0) - digits}`);
  return result === 0 ? 0 : sign * result;
}

export interface FormatOptions {
  locale?: string;
  /** Fixed decimal places (both minimum and maximum). */
  precision?: number;
  /** Group thousands (lakhs in India). Default true. */
  grouping?: boolean;
}

/** A plain number: 1,23,456.5 (en-IN), 123.456,5 (de-DE). */
export function formatNumber(n: number, o: FormatOptions & { maxPrecision?: number } = {}): string {
  return new Intl.NumberFormat(validLocale(o.locale), {
    useGrouping: o.grouping ?? true,
    ...(o.precision !== undefined
      ? { minimumFractionDigits: o.precision, maximumFractionDigits: o.precision }
      : { maximumFractionDigits: o.maxPrecision ?? 20 }),
  }).format(o.precision !== undefined ? roundTo(n, o.precision) : n);
}

export interface AmountOptions extends FormatOptions {
  /** How the currency shows: its symbol (₹, default), its code (INR), its name, or not at all. */
  display?: "symbol" | "narrowSymbol" | "code" | "name" | "none";
  /** Negative amounts in accounting brackets: (1,250.00). Default false (a minus). */
  accounting?: boolean;
}

/** An amount in a currency, at the currency's own precision unless `precision` says otherwise: ₹1,25,000.00. */
export function formatAmount(n: number, currency: string, o: AmountOptions = {}): string {
  const precision = o.precision ?? currencyPrecision(currency);
  const value = roundTo(n, precision);
  const locale = validLocale(o.locale);
  if (o.display === "none") {
    return new Intl.NumberFormat(locale, {
      style: "decimal",
      useGrouping: o.grouping ?? true,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
      ...(o.accounting ? {} : {}),
    }).format(value);
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: o.display ?? "symbol",
    currencySign: o.accounting ? "accounting" : "standard",
    useGrouping: o.grouping ?? true,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

/** A quantity, at the precision its unit counts in (Nos 0, Kg 3), unit after: 1,250.500 Kg. */
export function formatQuantity(n: number, unit?: string, o: FormatOptions = {}): string {
  const s = formatNumber(n, { ...o, precision: o.precision ?? 0 });
  return unit ? `${s} ${unit}` : s;
}

/**
 * A percentage. `value` is the percentage itself (12.5 for 12.5%), as an ERP
 * stores a discount or a tax rate, not Intl's ratio (0.125).
 */
export function formatPercent(value: number, o: FormatOptions = {}): string {
  return new Intl.NumberFormat(validLocale(o.locale), {
    style: "percent",
    useGrouping: o.grouping ?? true,
    minimumFractionDigits: o.precision ?? 0,
    maximumFractionDigits: o.precision ?? 2,
  }).format(roundTo(value, (o.precision ?? 2) + 2) / 100);
}

export interface ParseOptions {
  locale?: string;
  /** Also strip this currency as the locale writes it (its symbol, code or name): needed where a symbol is letters, "ج.م.". */
  currency?: string;
  /** Read k, L (lakh), Cr (crore), M (million), B (billion) after the number. Default false. */
  shorthand?: boolean;
}

const SHORTHAND: Record<string, number> = {
  k: 1e3, thousand: 1e3,
  l: 1e5, lac: 1e5, lacs: 1e5, lakh: 1e5, lakhs: 1e5,
  cr: 1e7, crore: 1e7, crores: 1e7,
  m: 1e6, mn: 1e6, million: 1e6,
  b: 1e9, bn: 1e9, billion: 1e9,
};

// Spaces a group can be written with: ASCII, no-break, narrow no-break, thin.
const SPACES = /[    ]/g;

/**
 * What a typed text means as a number: a number, null for nothing typed, or
 * "invalid" for text that is not one number in this locale. Currency symbols
 * and codes around the number are ignored (₹, INR, $, €); a unit is not.
 */
export function parseNumber(text: string, o: ParseOptions = {}): number | null | "invalid" {
  // Bidi controls Arabic and Hebrew formatting wraps numbers in.
  let t = text.replace(/[\u200e\u200f\u061c\u202a-\u202e\u2066-\u2069]/g, "").trim();
  if (t === "") return null;
  if (o.currency) {
    for (const display of ["symbol", "narrowSymbol", "code", "name"] as const) {
      try {
        // Every plural form the locale names it with ("dollar", "dollars"…), longest first.
        const f = new Intl.NumberFormat(validLocale(o.locale), { style: "currency", currency: o.currency, currencyDisplay: display });
        const forms = new Set([0, 1, 2, 3, 5, 11, 21, 101, 1000.5, 1e6].map((v) => f.formatToParts(v).find((x) => x.type === "currency")?.value ?? ""));
        for (const cur of [...forms].filter(Boolean).sort((x, y) => y.length - x.length)) t = t.split(cur).join(" ");
      } catch {
        /* an unknown currency strips nothing */
      }
    }
    t = t.replace(/[\u200e\u200f\u061c]/g, "").trim();
  }
  const { decimal, group, digits } = numberParts(o.locale);

  // The locale's own digits, and Arabic-Indic / Devanagari typed in a Latin locale, read as 0–9.
  const native = [digits, "٠١٢٣٤٥٦٧٨٩".split(""), "۰۱۲۳۴۵۶۷۸۹".split(""), "०१२३४५६७८९".split("")];
  for (const set of native) for (let i = 0; i < 10; i++) if (set[i] !== String(i)) t = t.split(set[i]).join(String(i));
  t = t.replace(/[−‒–]/g, "-"); // typographic minus

  // Accounting brackets, or a minus before or after.
  let negative = false;
  const bracket = /^\((.*)\)$/.exec(t);
  if (bracket) {
    negative = true;
    t = bracket[1].trim();
  }
  // Currency: symbols (\p{Sc}) and three-letter codes at either end.
  t = t.replace(/^\p{Sc}\s*|\s*\p{Sc}$/gu, "").replace(/^[A-Z]{3}\s+|\s+[A-Z]{3}$/g, "").trim();
  if (t.startsWith("-")) {
    if (negative) return "invalid";
    negative = true;
    t = t.slice(1).trim();
  } else if (t.endsWith("-")) {
    if (negative) return "invalid";
    negative = true;
    t = t.slice(0, -1).trim();
  }
  t = t.replace(/^\p{Sc}\s*/u, "").trim();

  let multiplier = 1;
  if (o.shorthand) {
    const m = /^(.*?)\s*([a-z]+)\.?$/i.exec(t);
    if (m && m[1] !== "") {
      const factor = SHORTHAND[m[2].toLowerCase()];
      if (!factor) return "invalid";
      multiplier = factor;
      t = m[1];
    }
  }

  // Normalise the group mark: any of the space family stands for a space group.
  const groupIsSpace = SPACES.test(group);
  SPACES.lastIndex = 0;
  if (groupIsSpace) t = t.replace(SPACES, " ");
  const g = groupIsSpace ? " " : group === "’" || group === "'" ? "['’]" : escape(group);

  // Which mark is the decimal? The locale's; or ".", when the locale's is ","
  // and the text has a single "." with no "," and it cannot be a group (not
  // followed by exactly three digits).
  let dec = decimal;
  if (!t.includes(decimal) && decimal !== "." && group !== "." && /^\d*\.\d+$/.test(t)) dec = ".";
  if (!t.includes(decimal) && decimal === "," && group === "." && /^\d+\.\d+$/.test(t) && !/^\d{1,3}(\.\d{3})+$/.test(t)) dec = ".";

  const [intPart, frac, extra] = t.split(dec);
  if (extra !== undefined) return "invalid";
  if (frac !== undefined && !/^\d*$/.test(frac)) return "invalid";
  if (intPart === "" && (frac === undefined || frac === "")) return "invalid";

  // The integer part: plain digits, or digits in well-formed groups.
  let int: string;
  if (/^\d*$/.test(intPart)) int = intPart;
  else {
    // Groups of 3, or Indian 2s before the last 3 (1,00,000); the first group 1–3 digits.
    const western = new RegExp(`^\\d{1,3}(${g}\\d{3})+$`);
    const indian = new RegExp(`^\\d{1,2}(${g}\\d{2})*${g}\\d{3}$`);
    if (!western.test(intPart) && !indian.test(intPart)) return "invalid";
    int = intPart.replace(new RegExp(g, "g"), "");
  }
  const n = Number(`${int || "0"}.${frac || "0"}`) * multiplier;
  if (!Number.isFinite(n)) return "invalid";
  const value = multiplier === 1 ? n : roundTo(n, 10);
  return negative ? (value === 0 ? 0 : -value) : value;
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The number as the field shows it while editing: plain digits, the locale's decimal mark, no grouping. */
export function editText(n: number | null | undefined, o: { locale?: string; precision?: number } = {}): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "";
  return formatNumber(n, { locale: o.locale, grouping: false, ...(o.precision !== undefined ? { maxPrecision: o.precision } : {}) });
}

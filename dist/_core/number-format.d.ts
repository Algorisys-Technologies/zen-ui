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
export declare function validLocale(locale?: string): string | undefined;
export interface NumberParts {
    /** The decimal mark: "." or "," (or "٫" in Arabic). */
    decimal: string;
    /** The group mark: ",", ".", " " (narrow no-break), "’"… */
    group: string;
    /** The locale's digits 0–9 (Latin for most; Devanagari for hi-IN-u-nu-deva…). */
    digits: string[];
}
/** The marks and digits a locale writes numbers with. */
export declare function numberParts(rawLocale?: string): NumberParts;
/** A currency's usual decimal places: INR 2, JPY 0, KWD 3. */
export declare function currencyPrecision(currency: string): number;
/**
 * Round half away from zero to `digits` places, in decimal, not binary:
 * 1.005 -> 1.01 and -1.005 -> -1.01 (Math.round(1.005 * 100) / 100 gives 1).
 */
export declare function roundTo(n: number, digits: number): number;
export interface FormatOptions {
    locale?: string;
    /** Fixed decimal places (both minimum and maximum). */
    precision?: number;
    /** Group thousands (lakhs in India). Default true. */
    grouping?: boolean;
}
/** A plain number: 1,23,456.5 (en-IN), 123.456,5 (de-DE). */
export declare function formatNumber(n: number, o?: FormatOptions & {
    maxPrecision?: number;
}): string;
export interface AmountOptions extends FormatOptions {
    /** How the currency shows: its symbol (₹, default), its code (INR), its name, or not at all. */
    display?: "symbol" | "narrowSymbol" | "code" | "name" | "none";
    /** Negative amounts in accounting brackets: (1,250.00). Default false (a minus). */
    accounting?: boolean;
}
/** An amount in a currency, at the currency's own precision unless `precision` says otherwise: ₹1,25,000.00. */
export declare function formatAmount(n: number, currency: string, o?: AmountOptions): string;
/** A quantity, at the precision its unit counts in (Nos 0, Kg 3), unit after: 1,250.500 Kg. */
export declare function formatQuantity(n: number, unit?: string, o?: FormatOptions): string;
/**
 * A percentage. `value` is the percentage itself (12.5 for 12.5%), as an ERP
 * stores a discount or a tax rate, not Intl's ratio (0.125).
 */
export declare function formatPercent(value: number, o?: FormatOptions): string;
export interface ParseOptions {
    locale?: string;
    /** Also strip this currency as the locale writes it (its symbol, code or name): needed where a symbol is letters, "ج.م.". */
    currency?: string;
    /** Read k, L (lakh), Cr (crore), M (million), B (billion) after the number. Default false. */
    shorthand?: boolean;
}
/**
 * What a typed text means as a number: a number, null for nothing typed, or
 * "invalid" for text that is not one number in this locale. Currency symbols
 * and codes around the number are ignored (₹, INR, $, €); a unit is not.
 */
export declare function parseNumber(text: string, o?: ParseOptions): number | null | "invalid";
/** The number as the field shows it while editing: plain digits, the locale's decimal mark, no grouping. */
export declare function editText(n: number | null | undefined, o?: {
    locale?: string;
    precision?: number;
}): string;

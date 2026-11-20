import * as React from "react";
type Common = {
    value?: number | null;
    defaultValue?: number | null;
    /** The number, rounded to the field's precision, or null when emptied. Not called for text that is not a number. */
    onValueChange?: (value: number | null) => void;
    /** Called with the text when what was typed is not an acceptable number. */
    onInvalidInput?: (text: string) => void;
    /** Default: the LocaleProvider's, else the browser's. */
    locale?: string;
    min?: number;
    max?: number;
    /** Read 2.5k, 2L (lakh), 1.2Cr (crore), 3M. Default true. */
    shorthand?: boolean;
    placeholder?: string;
    /** Marked invalid by the form (the field marks text it cannot read itself). */
    invalid?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    /** Lands on the input, so `<label htmlFor>` names it. */
    id?: string;
    name?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    /** Width of the field. Default 100%. */
    width?: string;
    className?: string;
};
export type AmountFieldProps = Common & {
    /** ISO 4217: "INR". Default: the LocaleProvider's. Without one, no symbol, two places. */
    currency?: string;
    /** Decimal places. Default: the currency's own (INR 2, JPY 0, KWD 3). */
    precision?: number;
    /** Allow amounts below zero. Default false: a negative amount is usually a mistake on a form. */
    allowNegative?: boolean;
};
export type QuantityFieldProps = Common & {
    /** Shown after the number: "Kg", "Nos", "Ltr". */
    unit?: string;
    /** Decimal places the unit counts in. Default 0 (Nos); Kg usually 3. */
    precision?: number;
    /** Allow quantities below zero. Default false. */
    allowNegative?: boolean;
};
/**
 * AmountField — an amount in a currency: ₹1,25,000.00 at rest, 125000 while
 * you edit it, at the currency's own precision.
 *
 *   <AmountField currency="INR" value={rate} onValueChange={setRate} />
 *
 * Type it the way clerks do: 125000, 1,25,000, 2.5L, 1.2Cr, 15k (shorthand
 * on by default). Text that is not one number in the locale, or is outside
 * min / max (or below zero, unless allowNegative), is kept as typed and marked
 * aria-invalid, never quietly changed into something else. Esc undoes the
 * typing. The value is a number, rounded half away from zero to the precision
 * (1.005 is 1.01). Formatting and parsing are @algorisys/zen-ui-core/number-format
 * (check:number-format). Forwards a ref to the <input>.
 */
export declare const AmountField: React.ForwardRefExoticComponent<Common & {
    /** ISO 4217: "INR". Default: the LocaleProvider's. Without one, no symbol, two places. */
    currency?: string;
    /** Decimal places. Default: the currency's own (INR 2, JPY 0, KWD 3). */
    precision?: number;
    /** Allow amounts below zero. Default false: a negative amount is usually a mistake on a form. */
    allowNegative?: boolean;
} & React.RefAttributes<HTMLInputElement>>;
/**
 * QuantityField — a quantity in a unit: 1,250.500 Kg at rest, 1250.5 while
 * editing, at the precision the unit counts in. Same typing and validation as
 * AmountField.
 *
 *   <QuantityField unit="Kg" precision={3} value={qty} onValueChange={setQty} />
 */
export declare const QuantityField: React.ForwardRefExoticComponent<Common & {
    /** Shown after the number: "Kg", "Nos", "Ltr". */
    unit?: string;
    /** Decimal places the unit counts in. Default 0 (Nos); Kg usually 3. */
    precision?: number;
    /** Allow quantities below zero. Default false. */
    allowNegative?: boolean;
} & React.RefAttributes<HTMLInputElement>>;
export {};
//# sourceMappingURL=amount-field.d.ts.map
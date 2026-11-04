import * as React from "react";
import {
  currencyPrecision,
  editText,
  formatAmount,
  formatNumber,
  parseNumber,
  roundTo,
} from "@algorisys/zen-ui-core/number-format";
import { cn } from "../../../lib/cn";
import { useLocale } from "../../locale/locale";

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

type Inner = Common & {
  locale: string | undefined;
  precision: number;
  allowNegative?: boolean;
  /** Formatted for display when not editing. */
  display: (n: number) => string;
  /** Before or after the number, and its text. */
  adornment: { text: string; before: boolean } | null;
  /** For assistive tech: "Amount in Indian rupees." */
  hint: string;
  /** For parsing: a currency to strip. */
  currency?: string;
};

/** The shared field: raw digits while editing, formatted at rest. */
const NumberText = React.forwardRef<HTMLInputElement, Inner>(
  (
    {
      value: controlled, defaultValue, onValueChange, onInvalidInput, locale, min, max, shorthand, placeholder, invalid,
      disabled, readOnly, id, name, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, width, className,
      precision, allowNegative, display, adornment, hint, currency,
    },
    ref,
  ) => {
    const hintId = React.useId();
    // The initial value seeds it; the user owns it after.
    const [internal, setInternal] = React.useState<number | null>(defaultValue ?? null);
    const value = controlled !== undefined ? controlled : internal;
    const [editing, setEditing] = React.useState(false);
    const [text, setText] = React.useState("");
    const [bad, setBad] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const setRefs = (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    // A value set from outside while not editing clears a stale "invalid".
    // Not on mount: only a change of value does it.
    const editingNow = React.useRef(editing);
    editingNow.current = editing;
    const firstValue = React.useRef(true);
    React.useEffect(() => {
      if (firstValue.current) {
        firstValue.current = false;
        return;
      }
      if (!editingNow.current) setBad(null);
    }, [value]);

    // Select the raw digits once the focus render has put them in the input.
    const selectPending = React.useRef(false);
    React.useLayoutEffect(() => {
      if (selectPending.current) {
        selectPending.current = false;
        inputRef.current?.select();
      }
    });

    const shown = editing || bad !== null ? text : value === null || value === undefined ? "" : display(value);
    const raw = () => editText(value, { locale, precision });

    const accept = (n: number) =>
      (allowNegative || n >= 0) && (min === undefined || n >= min) && (max === undefined || n <= max);

    /** Read what was typed: a number (set), nothing (cleared), or not a number (kept as typed, marked). */
    const commit = () => {
      const typed = text;
      const parsed = parseNumber(typed, { locale, shorthand: shorthand ?? true, currency });
      if (parsed === "invalid" || (parsed !== null && !accept(roundTo(parsed, precision)))) {
        setBad(typed);
        onInvalidInput?.(typed);
        return;
      }
      setBad(null);
      const next = parsed === null ? null : roundTo(parsed, precision);
      if (next !== value) {
        if (controlled === undefined) setInternal(next);
        onValueChange?.(next);
      }
    };

    const adornmentSpan = adornment ? (
      <span className="zen-shrink-0 zen-text-sm zen-text-zen-muted-fg" aria-hidden="true">{adornment.text}</span>
    ) : null;
    return (
      <div
        className={cn(
          "zen-flex zen-h-zen-control zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-px-zen-control-x",
          "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
          bad !== null || invalid ? "zen-border-zen-error" : "zen-border-zen-border",
          disabled && "zen-cursor-not-allowed zen-opacity-50",
          className,
        )}
        style={{ width: width ?? "100%" }}
      >
        {adornment?.before ? adornmentSpan : null}
        <input
          ref={setRefs}
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={shown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={hintId}
          aria-invalid={bad !== null || invalid ? "true" : undefined}
          onFocus={() => {
            if (bad === null) setText(raw());
            setEditing(true);
            selectPending.current = true;
          }}
          onChange={(e) => {
            setText(e.currentTarget.value);
            setBad(null);
          }}
          onBlur={() => {
            setEditing(false);
            commit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            else if (e.key === "Escape" && (text !== raw() || bad !== null)) {
              e.preventDefault();
              setBad(null);
              setText(raw());
            }
          }}
          className="zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-end zen-text-sm zen-tabular-nums zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg"
        />
        {adornment && !adornment.before ? adornmentSpan : null}
        <span id={hintId} className="zen-sr-only">{hint}</span>
      </div>
    );
  },
);
NumberText.displayName = "NumberText";

/** Where a locale puts a currency's symbol, and the symbol: ₹ before in en-IN, € after in de-DE. */
function currencyAdornment(currency: string, locale?: string) {
  try {
    const parts = new Intl.NumberFormat(locale, { style: "currency", currency }).formatToParts(1);
    const at = parts.findIndex((p) => p.type === "currency");
    const num = parts.findIndex((p) => p.type === "integer");
    return { text: parts[at].value, before: at < num };
  } catch {
    return { text: currency, before: false };
  }
}
function currencyName(currency: string, locale?: string) {
  try {
    return new Intl.DisplayNames(locale ? [locale] : undefined, { type: "currency" }).of(currency) ?? currency;
  } catch {
    return currency;
  }
}

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
export const AmountField = React.forwardRef<HTMLInputElement, AmountFieldProps>((props, ref) => {
  const ctx = useLocale();
  const locale = props.locale ?? ctx.locale;
  const currency = props.currency ?? ctx.currency;
  const precision = props.precision ?? (currency ? currencyPrecision(currency) : 2);
  return (
    <NumberText
      {...props}
      ref={ref}
      locale={locale}
      precision={precision}
      currency={currency}
      display={(n) => (currency ? formatAmount(n, currency, { locale, display: "none", precision }) : formatNumber(n, { locale, precision }))}
      adornment={currency ? currencyAdornment(currency, locale) : null}
      hint={`${currency ? `${ctx.t("amountField.inCurrency", { currency: currencyName(currency, locale) })} ` : ""}${ctx.t("amountField.shorthand")}`}
    />
  );
});
AmountField.displayName = "AmountField";

/**
 * QuantityField — a quantity in a unit: 1,250.500 Kg at rest, 1250.5 while
 * editing, at the precision the unit counts in. Same typing and validation as
 * AmountField.
 *
 *   <QuantityField unit="Kg" precision={3} value={qty} onValueChange={setQty} />
 */
export const QuantityField = React.forwardRef<HTMLInputElement, QuantityFieldProps>(({ unit, ...props }, ref) => {
  const ctx = useLocale();
  const locale = props.locale ?? ctx.locale;
  const precision = props.precision ?? 0;
  return (
    <NumberText
      {...props}
      ref={ref}
      locale={locale}
      precision={precision}
      display={(n) => formatNumber(n, { locale, precision })}
      adornment={unit ? { text: unit, before: false } : null}
      hint={`${unit ? `${ctx.t("quantityField.inUnit", { unit })} ` : ""}${ctx.t("quantityField.shorthand")}`}
    />
  );
});
QuantityField.displayName = "QuantityField";

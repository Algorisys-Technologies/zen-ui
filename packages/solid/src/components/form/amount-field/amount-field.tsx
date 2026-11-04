import { Show, createEffect, createMemo, createSignal, createUniqueId, on, splitProps } from "solid-js";
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
  /** Lands on the input, so `<label for>` names it. */
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Width of the field. Default 100%. */
  width?: string;
  class?: string;
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
  precision: () => number;
  allowNegative?: boolean;
  /** Formatted for display when not editing. */
  display: (n: number) => string;
  /** Before or after the number, and its text. */
  adornment: () => { text: string; before: boolean } | null;
  /** For assistive tech: "Amount in Indian rupees." */
  hint: () => string;
  /** For parsing: a currency to strip. */
  currency?: () => string | undefined;
};

/** The shared field: raw digits while editing, formatted at rest. */
const NumberText = (props: Inner) => {
  const [local] = splitProps(props, [
    "value", "defaultValue", "onValueChange", "onInvalidInput", "locale", "min", "max", "shorthand", "placeholder", "invalid",
    "disabled", "readOnly", "id", "name", "aria-label", "aria-labelledby", "width", "class", "precision", "allowNegative",
    "display", "adornment", "hint", "currency",
  ]);
  const hintId = createUniqueId();
  const ctx = useLocale();
  const locale = () => local.locale ?? ctx.locale();
  // The initial value seeds it; the user owns it after.
  const [internal, setInternal] = createSignal<number | null>(local.defaultValue ?? null);
  const value = () => (local.value !== undefined ? local.value : internal());
  const [editing, setEditing] = createSignal(false);
  const [text, setText] = createSignal("");
  const [bad, setBad] = createSignal<string | null>(null);
  let input: HTMLInputElement | undefined;

  const shown = () => {
    if (editing() || bad() !== null) return text();
    const v = value();
    return v === null || v === undefined ? "" : local.display(v);
  };
  // A value set from outside while not editing clears a stale "invalid".
  createEffect(on(value, () => { if (!editing()) setBad(null); }, { defer: true }));

  const accept = (n: number) =>
    (local.allowNegative || n >= 0) && (local.min === undefined || n >= local.min) && (local.max === undefined || n <= local.max);

  /** Read what was typed: a number (set), nothing (cleared), or not a number (kept as typed, marked). */
  const commit = () => {
    const typed = text();
    const parsed = parseNumber(typed, { locale: locale(), shorthand: local.shorthand ?? true, currency: local.currency?.() });
    if (parsed === "invalid" || (parsed !== null && !accept(roundTo(parsed, local.precision())))) {
      setBad(typed);
      local.onInvalidInput?.(typed);
      return;
    }
    setBad(null);
    const next = parsed === null ? null : roundTo(parsed, local.precision());
    if (next !== value()) {
      if (local.value === undefined) setInternal(next);
      local.onValueChange?.(next);
    }
  };

  const adorn = createMemo(() => local.adornment());
  return (
    <div
      class={cn(
        "zen-flex zen-h-zen-control zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-px-zen-control-x",
        "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
        bad() !== null || local.invalid ? "zen-border-zen-error" : "zen-border-zen-border",
        local.disabled && "zen-cursor-not-allowed zen-opacity-50",
        local.class,
      )}
      style={{ width: local.width ?? "100%" }}
    >
      <Show when={adorn()?.before}>
        <span class="zen-shrink-0 zen-text-sm zen-text-zen-muted-fg" aria-hidden="true">{adorn()!.text}</span>
      </Show>
      <input
        ref={input}
        id={local.id}
        name={local.name}
        type="text"
        inputmode="decimal"
        autocomplete="off"
        spellcheck={false}
        value={shown()}
        placeholder={local.placeholder}
        disabled={local.disabled}
        readOnly={local.readOnly}
        aria-label={local["aria-label"]}
        aria-labelledby={local["aria-labelledby"]}
        aria-describedby={hintId}
        aria-invalid={bad() !== null || local.invalid ? "true" : undefined}
        onFocus={() => {
          if (bad() === null) setText(editText(value(), { locale: locale(), precision: local.precision() }));
          setEditing(true);
          queueMicrotask(() => input?.select());
        }}
        onInput={(e) => {
          setText(e.currentTarget.value);
          setBad(null);
        }}
        onBlur={() => {
          setEditing(false);
          commit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          else if (e.key === "Escape" && (text() !== editText(value(), { locale: locale(), precision: local.precision() }) || bad() !== null)) {
            e.preventDefault();
            setBad(null);
            setText(editText(value(), { locale: locale(), precision: local.precision() }));
          }
        }}
        class="zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-end zen-text-sm zen-tabular-nums zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg"
      />
      <Show when={adorn() && !adorn()!.before}>
        <span class="zen-shrink-0 zen-text-sm zen-text-zen-muted-fg" aria-hidden="true">{adorn()!.text}</span>
      </Show>
      <span id={hintId} class="zen-sr-only">{local.hint()}</span>
    </div>
  );
};

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
 *   <AmountField currency="INR" value={rate()} onValueChange={setRate} />
 *
 * Type it the way clerks do: 125000, 1,25,000, 2.5L, 1.2Cr, 15k (shorthand
 * on by default). Text that is not one number in the locale, or is outside
 * min / max (or below zero, unless allowNegative), is kept as typed and marked
 * aria-invalid, never quietly changed into something else. Esc undoes the
 * typing. The value is a number, rounded half away from zero to the precision
 * (1.005 is 1.01). Formatting and parsing are @algorisys/zen-ui-core/number-format
 * (check:number-format).
 */
export const AmountField = (props: AmountFieldProps) => {
  const loc = useLocale();
  const ctx = useLocale();
  const locale = () => props.locale ?? ctx.locale();
  const currency = () => props.currency ?? ctx.currency();
  const precision = () => props.precision ?? (currency() ? currencyPrecision(currency()!) : 2);
  return (
    <NumberText
      {...props}
      precision={precision}
      currency={currency}
      display={(n) => (currency() ? formatAmount(n, currency()!, { locale: locale(), display: "none", precision: precision() }) : formatNumber(n, { locale: locale(), precision: precision() }))}
      adornment={() => (currency() ? currencyAdornment(currency()!, locale()) : null)}
      hint={() => `${currency() ? `${loc.t("amountField.inCurrency", { currency: currencyName(currency()!, locale()) })} ` : ""}${loc.t("amountField.shorthand")}`}
    />
  );
};

/**
 * QuantityField — a quantity in a unit: 1,250.500 Kg at rest, 1250.5 while
 * editing, at the precision the unit counts in. Same typing and validation as
 * AmountField.
 *
 *   <QuantityField unit="Kg" precision={3} value={qty()} onValueChange={setQty} />
 */
export const QuantityField = (props: QuantityFieldProps) => {
  const loc = useLocale();
  const ctx = useLocale();
  const locale = () => props.locale ?? ctx.locale();
  const precision = () => props.precision ?? 0;
  return (
    <NumberText
      {...props}
      precision={precision}
      display={(n) => formatNumber(n, { locale: locale(), precision: precision() })}
      adornment={() => (props.unit ? { text: props.unit, before: false } : null)}
      hint={() => `${props.unit ? `${loc.t("quantityField.inUnit", { unit: props.unit })} ` : ""}${loc.t("quantityField.shorthand")}`}
    />
  );
};


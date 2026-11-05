import {
  currencyPrecision,
  editText,
  formatAmount,
  formatNumber,
  parseNumber,
  roundTo,
} from "@algorisys/zen-ui-core/number-format";
import { cn } from "../../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../../lib/component";
import { controllable } from "../../../lib/state";
import { useLocale, type LocaleContextValue } from "../../locale/locale";

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
  /** Forwarded to the wrapper, like NumberField's. */
  [key: `data-${string}`]: unknown;
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

/** What differs between the two fields, worked out from the current props on every render. */
interface Flavour {
  locale: string | undefined;
  precision: number;
  /** Formatted for display when not editing. */
  display: (n: number) => string;
  /** Before or after the number, and its text. */
  adornment: { text: string; before: boolean } | null;
  /** For assistive tech: "Amount in Indian rupees." */
  hint: string;
  /** For parsing: a currency to strip. */
  currency?: string;
}

const WRAPPER_CLASS = [
  "zen-flex zen-h-zen-control zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-px-zen-control-x",
  "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
].join(" ");
const INPUT_CLASS =
  "zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-end zen-text-sm zen-tabular-nums zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg";
const ADORN_CLASS = "zen-shrink-0 zen-text-sm zen-text-zen-muted-fg";

let uid = 0;

/**
 * The shared field: raw digits while editing, formatted at rest.
 *
 * `flavour` is re-read on every render, so `update({ currency })` or a
 * rebuilt LocaleProvider changes the symbol, precision and hint in place.
 */
function numberText<P extends Common & { precision?: number; allowNegative?: boolean }>(
  props: P,
  flavour: (p: P) => Flavour,
): ZenComponent<P, HTMLDivElement> {
  let current: P = { ...props };
  const disposer = new Disposer();
  const hintId = `zen-number-text-hint-${++uid}`;
  // The initial value seeds it; the user owns it after (unless `value` is passed).
  const state = controllable<number | null>({
    value: current.value,
    defaultValue: current.defaultValue ?? null,
    onChange: (v) => current.onValueChange?.(v),
  });
  let editing = false;
  let text = "";
  let bad: string | null = null;

  const el = document.createElement("div");
  const before = document.createElement("span");
  const after = document.createElement("span");
  for (const s of [before, after]) {
    s.className = ADORN_CLASS;
    s.setAttribute("aria-hidden", "true");
  }
  const input = document.createElement("input");
  input.type = "text";
  input.inputMode = "decimal";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.className = INPUT_CLASS;
  input.setAttribute("aria-describedby", hintId);
  const hint = document.createElement("span");
  hint.id = hintId;
  hint.className = "zen-sr-only";

  const raw = (f: Flavour) => editText(state.get(), { locale: f.locale, precision: f.precision });

  const accept = (n: number) =>
    (current.allowNegative || n >= 0) &&
    (current.min === undefined || n >= current.min) &&
    (current.max === undefined || n <= current.max);

  /** Read what was typed: a number (set), nothing (cleared), or not a number (kept as typed, marked). */
  const commit = () => {
    const f = flavour(current);
    const typed = text;
    const parsed = parseNumber(typed, { locale: f.locale, shorthand: current.shorthand ?? true, currency: f.currency });
    if (parsed === "invalid" || (parsed !== null && !accept(roundTo(parsed, f.precision)))) {
      bad = typed;
      current.onInvalidInput?.(typed);
      render();
      return;
    }
    bad = null;
    // Sets (uncontrolled) and reports; a no-op when the number did not change.
    state.set(parsed === null ? null : roundTo(parsed, f.precision));
    render();
  };

  // Remove only what this field set: an id a caller put on the <input> itself
  // (the web-components demos name the inner control that way) survives renders.
  const owned = new Set<string>();
  const attr = (name: string, v: string | undefined) => {
    if (v !== undefined) {
      input.setAttribute(name, v);
      owned.add(name);
    } else if (owned.delete(name)) input.removeAttribute(name);
  };

  let removeProps: (() => void) | undefined;
  const render = () => {
    const f = flavour(current);
    const { invalid, disabled, readOnly, placeholder, id, name, width, class: className } = current;
    const marked = bad !== null || Boolean(invalid);
    const value = state.get();

    el.className = cn(
      WRAPPER_CLASS,
      marked ? "zen-border-zen-error" : "zen-border-zen-border",
      disabled && "zen-cursor-not-allowed zen-opacity-50",
      className,
    );
    el.style.width = width ?? "100%";

    const kids: Node[] = [];
    if (f.adornment?.before) {
      before.textContent = f.adornment.text;
      kids.push(before);
    }
    kids.push(input);
    if (f.adornment && !f.adornment.before) {
      after.textContent = f.adornment.text;
      kids.push(after);
    }
    kids.push(hint);
    // Only re-parent when the shape changed: moving a focused <input> blurs it.
    if (kids.length !== el.childNodes.length || kids.some((k, i) => el.childNodes[i] !== k)) {
      el.replaceChildren(...kids);
    }

    // `value` is a PROPERTY; write it only when it differs, so the caret stays put mid-edit.
    const shown = editing || bad !== null ? text : value === null || value === undefined ? "" : f.display(value);
    if (input.value !== shown) input.value = shown;

    attr("id", id);
    attr("name", name);
    attr("placeholder", placeholder);
    attr("aria-label", current["aria-label"]);
    attr("aria-labelledby", current["aria-labelledby"]);
    attr("aria-invalid", marked ? "true" : undefined);
    input.disabled = Boolean(disabled);
    input.readOnly = Boolean(readOnly);
    hint.textContent = f.hint;

    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(current)) if (k.startsWith("data-")) rest[k] = v;
    removeProps?.();
    removeProps = applyProps(el, rest);
  };

  const onFocus = () => {
    if (bad === null) text = raw(flavour(current));
    editing = true;
    render();
    queueMicrotask(() => input.select());
  };
  const onInput = () => {
    text = input.value;
    bad = null;
    render();
  };
  const onBlur = () => {
    editing = false;
    commit();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") {
      const back = raw(flavour(current));
      if (text !== back || bad !== null) {
        e.preventDefault();
        bad = null;
        text = back;
        render();
      }
    }
  };
  input.addEventListener("focus", onFocus);
  input.addEventListener("input", onInput);
  input.addEventListener("blur", onBlur);
  input.addEventListener("keydown", onKeyDown);
  disposer.add(() => {
    input.removeEventListener("focus", onFocus);
    input.removeEventListener("input", onInput);
    input.removeEventListener("blur", onBlur);
    input.removeEventListener("keydown", onKeyDown);
  });

  // A value set from outside while not editing clears a stale "invalid".
  disposer.add(
    state.subscribe(() => {
      if (!editing) bad = null;
      render();
    }),
  );
  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if ("value" in next) state.sync(next.value);
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

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

export type AmountFieldHandle = ZenComponent<AmountFieldProps, HTMLDivElement>;
export type QuantityFieldHandle = ZenComponent<QuantityFieldProps, HTMLDivElement>;

/**
 * AmountField — an amount in a currency: ₹1,25,000.00 at rest, 125000 while
 * you edit it, at the currency's own precision.
 *
 *   const rate = AmountField({ currency: "INR", value: 1250.5, onValueChange: (v) => rate.update({ value: v }) });
 *
 * Type it the way clerks do: 125000, 1,25,000, 2.5L, 1.2Cr, 15k (shorthand
 * on by default). Text that is not one number in the locale, or is outside
 * min / max (or below zero, unless allowNegative), is kept as typed and marked
 * aria-invalid, never quietly changed into something else. Esc undoes the
 * typing. The value is a number, rounded half away from zero to the precision
 * (1.005 is 1.01). Formatting and parsing are @algorisys/zen-ui-core/number-format
 * (check:number-format).
 *
 * Locale and currency: the field's own prop, else the LocaleProvider whose
 * `children` function is building it (read here, at construction), else the
 * browser's locale and no currency. `el` is the wrapper; the <input> inside
 * carries `id`, so `<label for>` names it.
 */
export function AmountField(props: AmountFieldProps = {}): AmountFieldHandle {
  const ctx: LocaleContextValue = useLocale();
  return numberText<AmountFieldProps>(props, (p) => {
    const locale = p.locale ?? ctx.locale;
    const currency = p.currency ?? ctx.currency;
    const precision = p.precision ?? (currency ? currencyPrecision(currency) : 2);
    return {
      locale,
      precision,
      currency,
      display: (n) =>
        currency ? formatAmount(n, currency, { locale, display: "none", precision }) : formatNumber(n, { locale, precision }),
      adornment: currency ? currencyAdornment(currency, locale) : null,
      hint: `${currency ? `${ctx.t("amountField.inCurrency", { currency: currencyName(currency, locale) })} ` : ""}${ctx.t("amountField.shorthand")}`,
    };
  });
}

/**
 * QuantityField — a quantity in a unit: 1,250.500 Kg at rest, 1250.5 while
 * editing, at the precision the unit counts in. Same typing and validation as
 * AmountField.
 *
 *   QuantityField({ unit: "Kg", precision: 3, value: 12.5, onValueChange })
 */
export function QuantityField(props: QuantityFieldProps = {}): QuantityFieldHandle {
  const ctx: LocaleContextValue = useLocale();
  return numberText<QuantityFieldProps>(props, (p) => {
    const locale = p.locale ?? ctx.locale;
    const precision = p.precision ?? 0;
    return {
      locale,
      precision,
      display: (n) => formatNumber(n, { locale, precision }),
      adornment: p.unit ? { text: p.unit, before: false } : null,
      hint: `${p.unit ? `${ctx.t("quantityField.inUnit", { unit: p.unit })} ` : ""}${ctx.t("quantityField.shorthand")}`,
    };
  });
}

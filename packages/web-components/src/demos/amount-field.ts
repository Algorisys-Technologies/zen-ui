import { formatAmount, formatNumber, formatPercent } from "@algorisys/zen-ui-core/number-format";
import { DemoPage } from "./demo-helpers";

/**
 * AmountField / QuantityField demo — the web-components port.
 * <zen-amount-field> and <zen-quantity-field> take their scalars as attributes
 * (`currency`, `unit`, `locale`, `precision`, `default-value`, `min`, `max`, …)
 * and fire `zen-value-change` with the number (or null) and `zen-invalid-input`
 * with text they could not read. <zen-object-number> formats `number` itself.
 *
 * There is no <zen-locale-provider> element yet, so the locale and currency are
 * set on each element; switching them is an attribute write, which re-renders
 * the field in place (the vanilla demo does the same through LocaleProvider).
 */

const LOCALES = [
  { value: "en-IN", label: "India", currency: "INR" },
  { value: "en-US", label: "US", currency: "USD" },
  { value: "de-DE", label: "Germany", currency: "EUR" },
  { value: "fr-FR", label: "France", currency: "EUR" },
  { value: "ja-JP", label: "Japan", currency: "JPY" },
  { value: "ar-EG", label: "Egypt", currency: "EGP" },
];

const div = (className: string, ...kids: Node[]) => {
  const d = document.createElement("div");
  d.className = className;
  d.append(...kids);
  return d;
};

/**
 * The id goes on the INNER <input>, not on the host: every zen element is a
 * `display: contents` wrapper, and an id on the custom element is an id on
 * something `<label for>` cannot name (see LabelDemo). Assigned once the
 * element has mounted its field.
 */
function nameInnerControl(host: HTMLElement, id: string): void {
  requestAnimationFrame(() => {
    const control = host.querySelector("input");
    if (control) control.id = id;
  });
}

/** A <zen-label> over its field. */
function field(id: string, label: string, control: HTMLElement): HTMLElement {
  const l = document.createElement("zen-label");
  l.setAttribute("for", id);
  l.textContent = label;
  nameInnerControl(control, id);
  return div("zen-flex zen-flex-col zen-gap-1.5", l, control);
}

function el(tag: string, attrs: Record<string, string>): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

const detail = (e: Event) => (e as CustomEvent).detail;

/** 1. Rate × quantity × tax, in whichever locale is picked. */
function invoiceLine(): Node[] {
  let rate: number | null = 1250.5;
  let qty: number | null = 12.5;
  let tax: number | null = 18;
  let rejected = "";
  const total = () => (rate ?? 0) * (qty ?? 0) * (1 + (tax ?? 0) / 100);

  const readout = document.createElement("p");
  readout.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  readout.setAttribute("aria-live", "polite");
  const paintReadout = () => {
    const rateSpan = document.createElement("span");
    rateSpan.dataset.testid = "rate-value";
    rateSpan.textContent = String(rate);
    const qtySpan = document.createElement("span");
    qtySpan.dataset.testid = "qty-value";
    qtySpan.textContent = String(qty);
    const kids: (Node | string)[] = ["Values: rate ", rateSpan, ", quantity ", qtySpan];
    if (rejected) {
      const r = document.createElement("span");
      r.dataset.testid = "rejected";
      r.textContent = rejected;
      kids.push(" · not read: ", r);
    }
    readout.replaceChildren(...kids);
  };

  const locale = { locale: "en-IN" };
  const rateEl = el("zen-amount-field", { ...locale, currency: "INR", "default-value": String(rate) });
  const qtyEl = el("zen-quantity-field", { ...locale, unit: "Kg", precision: "3", "default-value": String(qty) });
  const taxEl = el("zen-quantity-field", { ...locale, unit: "%", precision: "2", max: "100", "default-value": String(tax) });
  const totalEl = el("zen-object-number", { ...locale, currency: "INR", emphasized: "", number: String(total()) });
  totalEl.dataset.testid = "total";
  const refresh = () => {
    totalEl.setAttribute("number", String(total()));
    paintReadout();
  };
  rateEl.addEventListener("zen-value-change", (e) => {
    rate = detail(e);
    rejected = "";
    refresh();
  });
  rateEl.addEventListener("zen-invalid-input", (e) => {
    rejected = detail(e);
    paintReadout();
  });
  qtyEl.addEventListener("zen-value-change", (e) => {
    qty = detail(e);
    refresh();
  });
  taxEl.addEventListener("zen-value-change", (e) => {
    tax = detail(e);
    refresh();
  });
  paintReadout();

  const picker = el("zen-segmented-button", { "default-value": "en-IN", "aria-label": "Locale" }) as HTMLElement & {
    items: { value: string; label: string }[];
  };
  picker.items = LOCALES.map((l) => ({ value: l.value, label: l.label }));
  picker.addEventListener("zen-value-change", (e) => {
    const l = LOCALES.find((x) => x.value === detail(e))!;
    for (const f of [rateEl, qtyEl, taxEl, totalEl]) f.setAttribute("locale", l.value);
    rateEl.setAttribute("currency", l.currency);
    totalEl.setAttribute("currency", l.currency);
  });

  const totalLabel = document.createElement("span");
  totalLabel.className = "zen-text-sm zen-text-zen-muted-fg";
  totalLabel.textContent = "Line total";
  return [
    div(
      "zen-flex zen-w-full zen-flex-col zen-gap-4",
      picker,
      div(
        "zen-grid zen-max-w-3xl zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-3",
        field("rate", "Rate", rateEl),
        field("qty", "Quantity", qtyEl),
        field("tax", "GST %", taxEl),
      ),
      div("zen-flex zen-items-baseline zen-gap-3", totalLabel, totalEl),
      readout,
    ),
  ];
}

/** 2. The same field in three currencies, each at its own precision. */
function precisions(): Node {
  const one = (id: string, label: string, locale: string, currency: string, initial: number) =>
    field(id, label, el("zen-amount-field", { locale, currency, "default-value": String(initial) }));
  return div(
    "zen-grid zen-max-w-3xl zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-3",
    one("inr", "Rupees", "en-IN", "INR", 1.005),
    one("jpy", "Yen", "ja-JP", "JPY", 125000),
    one("kwd", "Kuwaiti dinar", "en-US", "KWD", 12.3456),
  );
}

/** 3. <zen-object-number> formatting a number, beside core's helpers. */
function formats(): Node {
  const dl = document.createElement("dl");
  dl.className = "zen-m-0 zen-grid zen-grid-cols-[auto_1fr] zen-gap-x-6 zen-gap-y-2 zen-text-sm";
  dl.dataset.testid = "formats";
  const asGiven = el("zen-object-number", {}) as HTMLElement & { value: string; unit: string };
  asGiven.value = "1,25,000.00";
  asGiven.unit = "INR";
  const rows: [string, Node | string][] = [
    ["ObjectNumber number=", el("zen-object-number", { number: "125000", currency: "INR", locale: "en-IN" })],
    ["ObjectNumber value= (unchanged)", asGiven],
    ["formatAmount, en-IN", formatAmount(12345678.9, "INR", { locale: "en-IN" })],
    ["formatAmount, de-DE", formatAmount(12345678.9, "EUR", { locale: "de-DE" })],
    ["accounting negative", formatAmount(-1250, "USD", { locale: "en-US", accounting: true })],
    ["formatNumber, Devanagari digits", formatNumber(1234567.5, { locale: "hi-IN-u-nu-deva", precision: 2 })],
    ["formatPercent (takes 18, not 0.18)", formatPercent(18, { locale: "de-DE" })],
  ];
  for (const [term, shown] of rows) {
    const dt = document.createElement("dt");
    dt.className = "zen-text-zen-muted-fg";
    dt.textContent = term;
    const dd = document.createElement("dd");
    dd.className = typeof shown === "string" ? "zen-m-0 zen-tabular-nums" : "zen-m-0";
    dd.append(shown);
    dl.append(dt, dd);
  }
  return dl;
}

export default function AmountFieldDemo(): HTMLElement {
  return DemoPage({
    title: "AmountField and QuantityField",
    description:
      "Amounts and quantities as people read and type them: raw digits while editing, formatted at rest, in the locale's grouping (1,00,000 in India, 1.000 in Germany) and the currency's own precision. LocaleProvider sets the locale and currency once; without it, nothing changes.",
    sections: [
      {
        title: "1. An invoice line, in any locale",
        codeTitle: "Each element takes the locale and currency",
        codeDescription:
          "Pick a country. Click into a field: the digits come back raw; leave it and they are formatted. Type 2.5L, 1.2Cr or 15k. Text that is not a number (or a negative amount) is kept and marked, never quietly changed. There is no <zen-locale-provider> element yet, so locale and currency are attributes here; the factories this package re-exports read LocaleProvider (see Localization).",
        code: `<zen-amount-field locale="en-IN" currency="INR" default-value="1250.5"></zen-amount-field>
<zen-quantity-field locale="en-IN" unit="Kg" precision="3" default-value="12.5"></zen-quantity-field>
<zen-object-number locale="en-IN" currency="INR" number="18444.875" emphasized></zen-object-number>

rate.addEventListener("zen-value-change", (e) => { /* e.detail: a number, or null */ });
rate.addEventListener("zen-invalid-input", (e) => { /* e.detail: the text it could not read */ });`,
        render: invoiceLine,
      },
      {
        title: "2. Each currency's own precision",
        codeTitle: "Rupees in paise, yen in whole yen, dinars in fils",
        codeDescription:
          "The same field, three currencies: two places for INR, none for JPY, three for KWD. Rounding is half away from zero, in decimal (1.005 rounds to 1.01, where Math.round(1.005 * 100) / 100 gives 1).",
        code: `<zen-amount-field currency="INR" …></zen-amount-field>   <!-- 2 places -->
<zen-amount-field currency="JPY" …></zen-amount-field>   <!-- 0 -->
<zen-amount-field currency="KWD" …></zen-amount-field>   <!-- 3 -->`,
        render: precisions,
      },
      {
        title: "3. Formatting without a field",
        codeTitle: "ObjectNumber formats a number; core's helpers format anywhere",
        codeDescription:
          "<zen-object-number> still shows a value you have formatted yourself (the value property); give it a number attribute instead and it formats it. The same helpers are in @algorisys/zen-ui-core/number-format for tables, totals and print.",
        code: `<zen-object-number number="125000" currency="INR"></zen-object-number>   <!-- 1,25,000.00 INR -->
objectNumber.value = "1,25,000.00"; objectNumber.unit = "INR";            // as before
formatAmount(125000, "INR", { locale: "en-IN" })                         // ₹1,25,000.00
formatPercent(18, { locale: "de-DE" })                                    // 18 %`,
        render: formats,
      },
    ],
  });
}

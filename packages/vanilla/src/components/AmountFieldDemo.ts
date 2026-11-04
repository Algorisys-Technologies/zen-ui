import { formatAmount, formatNumber, formatPercent } from "@algorisys/zen-ui-core/number-format";
import { LocaleProvider } from "./locale/locale";
import { AmountField, QuantityField } from "./form/amount-field/amount-field";
import { ObjectNumber } from "./object/object";
import { Label } from "./form/label/label";
import { SegmentedButton } from "./button/button-family";
import { DemoPage } from "./demo-helpers";

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
/** A label over its field. */
const field = (id: string, label: string, control: Node) =>
  div("zen-flex zen-flex-col zen-gap-1.5", Label({ for: id, children: label }).el, control);

/** 1. Rate × quantity × tax, in whichever locale is picked. */
function invoiceLine(): Node[] {
  let loc = "en-IN";
  let rate: number | null = 1250.5;
  let qty: number | null = 12.5;
  let tax: number | null = 18;
  let rejected = "";
  const total = () => (rate ?? 0) * (qty ?? 0) * (1 + (tax ?? 0) / 100);
  const currencyOf = (l: string) => LOCALES.find((x) => x.value === l)!.currency;

  // The readout sits outside the provider, so a locale switch does not rebuild it.
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
  paintReadout();

  // Rebuilt by the provider when the locale changes; the values live out here.
  // The provider destroys only components handed back at the top level, and
  // these sit inside layout divs, so the previous set is released here.
  let built: { destroy(): void }[] = [];
  const fields = () => {
    for (const c of built) c.destroy();
    const totalNum = ObjectNumber({ number: total(), currency: currencyOf(loc), emphasized: true, "data-testid": "total" });
    const refresh = () => {
      totalNum.update({ number: total() });
      paintReadout();
    };
    const rateField = AmountField({
      id: "rate",
      value: rate,
      onValueChange: (v) => {
        rate = v;
        rejected = "";
        rateField.update({ value: v });
        refresh();
      },
      onInvalidInput: (t) => {
        rejected = t;
        paintReadout();
      },
    });
    const qtyField = QuantityField({
      id: "qty",
      unit: "Kg",
      precision: 3,
      value: qty,
      onValueChange: (v) => {
        qty = v;
        qtyField.update({ value: v });
        refresh();
      },
    });
    const taxField = QuantityField({
      id: "tax",
      unit: "%",
      precision: 2,
      max: 100,
      value: tax,
      onValueChange: (v) => {
        tax = v;
        taxField.update({ value: v });
        refresh();
      },
    });
    const totalLabel = document.createElement("span");
    totalLabel.className = "zen-text-sm zen-text-zen-muted-fg";
    totalLabel.textContent = "Line total";
    built = [rateField, qtyField, taxField, totalNum];
    return [
      div(
        "zen-grid zen-max-w-3xl zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-3",
        field("rate", "Rate", rateField.el),
        field("qty", "Quantity", qtyField.el),
        field("tax", "GST %", taxField.el),
      ),
      div("zen-flex zen-items-baseline zen-gap-3", totalLabel, totalNum.el),
    ];
  };

  const provider = LocaleProvider({ locale: loc, currency: currencyOf(loc), children: fields });
  const picker = SegmentedButton({
    "aria-label": "Locale",
    value: loc,
    items: LOCALES.map((l) => ({ value: l.value, label: l.label })),
    onValueChange: (v) => {
      loc = v;
      picker.update({ value: v });
      provider.update({ locale: v, currency: currencyOf(v) });
    },
  });
  return [div("zen-flex zen-w-full zen-flex-col zen-gap-4", picker.el, provider.el, readout)];
}

/** 2. The same field in three currencies, each at its own precision. */
function precisions(): Node {
  const one = (id: string, label: string, locale: string, currency: string, initial: number) => {
    const f = AmountField({
      id,
      locale,
      currency,
      value: initial,
      onValueChange: (v) => f.update({ value: v }),
    });
    return field(id, label, f.el);
  };
  return div(
    "zen-grid zen-max-w-3xl zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-3",
    one("inr", "Rupees", "en-IN", "INR", 1.005),
    one("jpy", "Yen", "ja-JP", "JPY", 125000),
    one("kwd", "Kuwaiti dinar", "en-US", "KWD", 12.3456),
  );
}

/** 3. ObjectNumber formatting a number, beside core's helpers. */
function formats(): Node {
  const dl = document.createElement("dl");
  dl.className = "zen-m-0 zen-grid zen-grid-cols-[auto_1fr] zen-gap-x-6 zen-gap-y-2 zen-text-sm";
  dl.dataset.testid = "formats";
  const rows: [string, Node | string][] = [
    ["ObjectNumber number=", ObjectNumber({ number: 125000, currency: "INR", locale: "en-IN" }).el],
    ["ObjectNumber value= (unchanged)", ObjectNumber({ value: "1,25,000.00", unit: "INR" }).el],
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
        codeTitle: "LocaleProvider sets the locale and currency once",
        codeDescription:
          "Pick a country. Click into a field: the digits come back raw; leave it and they are formatted. Type 2.5L, 1.2Cr or 15k. Text that is not a number (or a negative amount) is kept and marked, never quietly changed.",
        code: `LocaleProvider({
  locale: "en-IN",
  currency: "INR",
  // A function, so the fields it builds read this provider.
  children: () => [
    AmountField({ value: rate, onValueChange: setRate, "aria-label": "Rate" }),
    QuantityField({ unit: "Kg", precision: 3, value: qty, onValueChange: setQty, "aria-label": "Quantity" }),
    ObjectNumber({ number: total, currency: "INR", emphasized: true }),
  ],
});`,
        render: invoiceLine,
      },
      {
        title: "2. Each currency's own precision",
        codeTitle: "Rupees in paise, yen in whole yen, dinars in fils",
        codeDescription:
          "The same field, three currencies: two places for INR, none for JPY, three for KWD. Rounding is half away from zero, in decimal (1.005 rounds to 1.01, where Math.round(1.005 * 100) / 100 gives 1).",
        code: `AmountField({ currency: "INR", … })   // 2 places
AmountField({ currency: "JPY", … })   // 0
AmountField({ currency: "KWD", … })   // 3`,
        render: precisions,
      },
      {
        title: "3. Formatting without a field",
        codeTitle: "ObjectNumber formats a number; core's helpers format anywhere",
        codeDescription:
          "ObjectNumber still shows a value you have formatted yourself (value); give it number instead and it formats it. The same helpers are in @algorisys/zen-ui-core/number-format for tables, totals and print.",
        code: `ObjectNumber({ number: 125000, currency: "INR" })          // 1,25,000.00 INR
ObjectNumber({ value: "1,25,000.00", unit: "INR" })         // as before
formatAmount(125000, "INR", { locale: "en-IN" })           // ₹1,25,000.00
formatPercent(18, { locale: "de-DE" })                      // 18 %`,
        render: formats,
      },
    ],
  });
}

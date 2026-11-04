import { useState } from "react";
import { formatAmount, formatNumber, formatPercent } from "@algorisys/zen-ui-core/number-format";
import { LocaleProvider } from "./locale/locale";
import { AmountField, QuantityField } from "./form/amount-field/amount-field";
import { ObjectNumber } from "./object/object";
import { Label } from "./form/label/label";
import { SegmentedButton, SegmentedButtonItem } from "./button/button-family";
import { CodeExample } from "./demo-helpers";

const LOCALES = [
  { value: "en-IN", label: "India", currency: "INR" },
  { value: "en-US", label: "US", currency: "USD" },
  { value: "de-DE", label: "Germany", currency: "EUR" },
  { value: "fr-FR", label: "France", currency: "EUR" },
  { value: "ja-JP", label: "Japan", currency: "JPY" },
  { value: "ar-EG", label: "Egypt", currency: "EGP" },
];

const NewAmountFieldDemo: React.FC = () => {
  const [loc, setLoc] = useState("en-IN");
  const current = LOCALES.find((l) => l.value === loc)!;
  const [rate, setRate] = useState<number | null>(1250.5);
  const [qty, setQty] = useState<number | null>(12.5);
  const [tax, setTax] = useState<number | null>(18);
  const [rejected, setRejected] = useState("");
  const total = (rate ?? 0) * (qty ?? 0) * (1 + (tax ?? 0) / 100);
  const [inr, setInr] = useState<number | null>(1.005);
  const [jpy, setJpy] = useState<number | null>(125000);
  const [kwd, setKwd] = useState<number | null>(12.3456);

  return (
    <div className="demo-page">
      <h1>AmountField and QuantityField</h1>
      <p className="lede">
        Amounts and quantities as people read and type them: raw digits while editing, formatted at rest, in the
        locale's grouping (1,00,000 in India, 1.000 in Germany) and the currency's own precision. LocaleProvider sets
        the locale and currency once; without it, nothing changes.
      </p>

      <section className="demo-section">
        <h2>1. An invoice line, in any locale</h2>
        <CodeExample
          title="LocaleProvider sets the locale and currency once"
          description="Pick a country. Click into a field: the digits come back raw; leave it and they are formatted. Type 2.5L, 1.2Cr or 15k. Text that is not a number (or a negative amount) is kept and marked, never quietly changed."
          code={`<LocaleProvider locale="en-IN" currency="INR">
  <AmountField value={rate} onValueChange={setRate} aria-label="Rate" />
  <QuantityField unit="Kg" precision={3} value={qty} onValueChange={setQty} aria-label="Quantity" />
  <ObjectNumber number={total} currency="INR" emphasized />
</LocaleProvider>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-4">
            <SegmentedButton value={loc} onValueChange={setLoc} aria-label="Locale">
              {LOCALES.map((l) => (
                <SegmentedButtonItem key={l.value} value={l.value}>{l.label}</SegmentedButtonItem>
              ))}
            </SegmentedButton>
            <LocaleProvider locale={loc} currency={current.currency}>
              <div className="zen-grid zen-max-w-3xl zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-3">
                <div className="zen-flex zen-flex-col zen-gap-1.5">
                  <Label htmlFor="rate">Rate</Label>
                  <AmountField id="rate" value={rate} onValueChange={(v) => { setRate(v); setRejected(""); }} onInvalidInput={setRejected} />
                </div>
                <div className="zen-flex zen-flex-col zen-gap-1.5">
                  <Label htmlFor="qty">Quantity</Label>
                  <QuantityField id="qty" unit="Kg" precision={3} value={qty} onValueChange={setQty} />
                </div>
                <div className="zen-flex zen-flex-col zen-gap-1.5">
                  <Label htmlFor="tax">GST %</Label>
                  <QuantityField id="tax" unit="%" precision={2} max={100} value={tax} onValueChange={setTax} />
                </div>
              </div>
              <div className="zen-flex zen-items-baseline zen-gap-3">
                <span className="zen-text-sm zen-text-zen-muted-fg">Line total</span>
                <ObjectNumber number={total} currency={current.currency} emphasized data-testid="total" />
              </div>
            </LocaleProvider>
            <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
              Values: rate <span data-testid="rate-value">{String(rate)}</span>, quantity <span data-testid="qty-value">{String(qty)}</span>
              {rejected ? <> · not read: <span data-testid="rejected">{rejected}</span></> : null}
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Each currency's own precision</h2>
        <CodeExample
          title="Rupees in paise, yen in whole yen, dinars in fils"
          description="The same field, three currencies: two places for INR, none for JPY, three for KWD. Rounding is half away from zero, in decimal (1.005 rounds to 1.01, where Math.round(1.005 * 100) / 100 gives 1)."
          code={`<AmountField currency="INR" … />   // 2 places
<AmountField currency="JPY" … />   // 0
<AmountField currency="KWD" … />   // 3`}
        >
          <div className="zen-grid zen-max-w-3xl zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-3">
            <div className="zen-flex zen-flex-col zen-gap-1.5">
              <Label htmlFor="inr">Rupees</Label>
              <AmountField id="inr" locale="en-IN" currency="INR" value={inr} onValueChange={setInr} />
            </div>
            <div className="zen-flex zen-flex-col zen-gap-1.5">
              <Label htmlFor="jpy">Yen</Label>
              <AmountField id="jpy" locale="ja-JP" currency="JPY" value={jpy} onValueChange={setJpy} />
            </div>
            <div className="zen-flex zen-flex-col zen-gap-1.5">
              <Label htmlFor="kwd">Kuwaiti dinar</Label>
              <AmountField id="kwd" locale="en-US" currency="KWD" value={kwd} onValueChange={setKwd} />
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Formatting without a field</h2>
        <CodeExample
          title="ObjectNumber formats a number; core's helpers format anywhere"
          description="ObjectNumber still shows a value you have formatted yourself (value=); give it number= instead and it formats it. The same helpers are in @algorisys/zen-ui-core/number-format for tables, totals and print."
          code={`<ObjectNumber number={125000} currency="INR" />            // 1,25,000.00 INR
<ObjectNumber value="1,25,000.00" unit="INR" />             // as before
formatAmount(125000, "INR", { locale: "en-IN" })           // ₹1,25,000.00
formatPercent(18, { locale: "de-DE" })                      // 18 %`}
        >
          <dl className="zen-m-0 zen-grid zen-grid-cols-[auto_1fr] zen-gap-x-6 zen-gap-y-2 zen-text-sm" data-testid="formats">
            <dt className="zen-text-zen-muted-fg">ObjectNumber number=</dt>
            <dd className="zen-m-0"><ObjectNumber number={125000} currency="INR" locale="en-IN" /></dd>
            <dt className="zen-text-zen-muted-fg">ObjectNumber value= (unchanged)</dt>
            <dd className="zen-m-0"><ObjectNumber value="1,25,000.00" unit="INR" /></dd>
            <dt className="zen-text-zen-muted-fg">formatAmount, en-IN</dt>
            <dd className="zen-m-0 zen-tabular-nums">{formatAmount(12345678.9, "INR", { locale: "en-IN" })}</dd>
            <dt className="zen-text-zen-muted-fg">formatAmount, de-DE</dt>
            <dd className="zen-m-0 zen-tabular-nums">{formatAmount(12345678.9, "EUR", { locale: "de-DE" })}</dd>
            <dt className="zen-text-zen-muted-fg">accounting negative</dt>
            <dd className="zen-m-0 zen-tabular-nums">{formatAmount(-1250, "USD", { locale: "en-US", accounting: true })}</dd>
            <dt className="zen-text-zen-muted-fg">formatNumber, Devanagari digits</dt>
            <dd className="zen-m-0 zen-tabular-nums">{formatNumber(1234567.5, { locale: "hi-IN-u-nu-deva", precision: 2 })}</dd>
            <dt className="zen-text-zen-muted-fg">formatPercent (takes 18, not 0.18)</dt>
            <dd className="zen-m-0 zen-tabular-nums">{formatPercent(18, { locale: "de-DE" })}</dd>
          </dl>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewAmountFieldDemo;

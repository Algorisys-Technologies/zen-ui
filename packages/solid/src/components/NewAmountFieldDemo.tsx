import { For, createSignal } from "solid-js";
import { formatAmount, formatNumber, formatPercent } from "@algorisys/zen-ui-core/number-format";
import { LocaleProvider } from "./locale/locale";
import { AmountField, QuantityField } from "./form/amount-field/amount-field";
import { ObjectNumber } from "./object/object";
import { Label } from "./form/label/label";
import { SegmentedButton, SegmentedButtonItem } from "./button/button-family";
import { DemoPage, DemoSection } from "./demo-helpers";

const LOCALES = [
  { value: "en-IN", label: "India", currency: "INR" },
  { value: "en-US", label: "US", currency: "USD" },
  { value: "de-DE", label: "Germany", currency: "EUR" },
  { value: "fr-FR", label: "France", currency: "EUR" },
  { value: "ja-JP", label: "Japan", currency: "JPY" },
  { value: "ar-EG", label: "Egypt", currency: "EGP" },
];

const NewAmountFieldDemo = () => {
  const [loc, setLoc] = createSignal("en-IN");
  const current = () => LOCALES.find((l) => l.value === loc())!;
  const [rate, setRate] = createSignal<number | null>(1250.5);
  const [qty, setQty] = createSignal<number | null>(12.5);
  const [tax, setTax] = createSignal<number | null>(18);
  const [rejected, setRejected] = createSignal("");
  const total = () => (rate() ?? 0) * (qty() ?? 0) * (1 + (tax() ?? 0) / 100);
  const [inr, setInr] = createSignal<number | null>(1.005);
  const [jpy, setJpy] = createSignal<number | null>(125000);
  const [kwd, setKwd] = createSignal<number | null>(12.3456);

  return (
    <DemoPage
      title="AmountField and QuantityField"
      description="Amounts and quantities as people read and type them: raw digits while editing, formatted at rest, in the locale's grouping (1,00,000 in India, 1.000 in Germany) and the currency's own precision. LocaleProvider sets the locale and currency once; without it, nothing changes."
    >
      <DemoSection
        title="1. An invoice line, in any locale"
        codeTitle="LocaleProvider sets the locale and currency once"
        codeDescription="Pick a country. Click into a field: the digits come back raw; leave it and they are formatted. Type 2.5L, 1.2Cr or 15k. Text that is not a number (or a negative amount) is kept and marked, never quietly changed."
        code={`<LocaleProvider locale="en-IN" currency="INR">
  <AmountField value={rate()} onValueChange={setRate} aria-label="Rate" />
  <QuantityField unit="Kg" precision={3} value={qty()} onValueChange={setQty} aria-label="Quantity" />
  <ObjectNumber number={total()} currency="INR" emphasized />
</LocaleProvider>`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-4">
          <SegmentedButton value={loc()} onValueChange={setLoc} aria-label="Locale">
            <For each={LOCALES}>{(l) => <SegmentedButtonItem value={l.value}>{l.label}</SegmentedButtonItem>}</For>
          </SegmentedButton>
          <LocaleProvider locale={loc()} currency={current().currency}>
            <div class="zen-grid zen-max-w-3xl zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-3">
              <div class="zen-flex zen-flex-col zen-gap-1.5">
                <Label for="rate">Rate</Label>
                <AmountField id="rate" value={rate()} onValueChange={(v) => { setRate(v); setRejected(""); }} onInvalidInput={setRejected} />
              </div>
              <div class="zen-flex zen-flex-col zen-gap-1.5">
                <Label for="qty">Quantity</Label>
                <QuantityField id="qty" unit="Kg" precision={3} value={qty()} onValueChange={setQty} />
              </div>
              <div class="zen-flex zen-flex-col zen-gap-1.5">
                <Label for="tax">GST %</Label>
                <QuantityField id="tax" unit="%" precision={2} max={100} value={tax()} onValueChange={setTax} />
              </div>
            </div>
            <div class="zen-flex zen-items-baseline zen-gap-3">
              <span class="zen-text-sm zen-text-zen-muted-fg">Line total</span>
              <ObjectNumber number={total()} currency={current().currency} emphasized data-testid="total" />
            </div>
          </LocaleProvider>
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
            Values: rate <span data-testid="rate-value">{String(rate())}</span>, quantity <span data-testid="qty-value">{String(qty())}</span>
            {rejected() ? <> · not read: <span data-testid="rejected">{rejected()}</span></> : null}
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="2. Each currency's own precision"
        codeTitle="Rupees in paise, yen in whole yen, dinars in fils"
        codeDescription="The same field, three currencies: two places for INR, none for JPY, three for KWD. Rounding is half away from zero, in decimal (1.005 rounds to 1.01, where Math.round(1.005 * 100) / 100 gives 1)."
        code={`<AmountField currency="INR" … />   // 2 places
<AmountField currency="JPY" … />   // 0
<AmountField currency="KWD" … />   // 3`}
      >
        <div class="zen-grid zen-max-w-3xl zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-3">
          <div class="zen-flex zen-flex-col zen-gap-1.5">
            <Label for="inr">Rupees</Label>
            <AmountField id="inr" locale="en-IN" currency="INR" value={inr()} onValueChange={setInr} />
          </div>
          <div class="zen-flex zen-flex-col zen-gap-1.5">
            <Label for="jpy">Yen</Label>
            <AmountField id="jpy" locale="ja-JP" currency="JPY" value={jpy()} onValueChange={setJpy} />
          </div>
          <div class="zen-flex zen-flex-col zen-gap-1.5">
            <Label for="kwd">Kuwaiti dinar</Label>
            <AmountField id="kwd" locale="en-US" currency="KWD" value={kwd()} onValueChange={setKwd} />
          </div>
        </div>
      </DemoSection>

      <DemoSection
        title="3. Formatting without a field"
        codeTitle="ObjectNumber formats a number; core's helpers format anywhere"
        codeDescription="ObjectNumber still shows a value you have formatted yourself (value=); give it number= instead and it formats it. The same helpers are in @algorisys/zen-ui-core/number-format for tables, totals and print."
        code={`<ObjectNumber number={125000} currency="INR" />            // 1,25,000.00 INR
<ObjectNumber value="1,25,000.00" unit="INR" />             // as before
formatAmount(125000, "INR", { locale: "en-IN" })           // ₹1,25,000.00
formatPercent(18, { locale: "de-DE" })                      // 18 %`}
      >
        <dl class="zen-m-0 zen-grid zen-grid-cols-[auto_1fr] zen-gap-x-6 zen-gap-y-2 zen-text-sm" data-testid="formats">
          <dt class="zen-text-zen-muted-fg">ObjectNumber number=</dt>
          <dd class="zen-m-0"><ObjectNumber number={125000} currency="INR" locale="en-IN" /></dd>
          <dt class="zen-text-zen-muted-fg">ObjectNumber value= (unchanged)</dt>
          <dd class="zen-m-0"><ObjectNumber value="1,25,000.00" unit="INR" /></dd>
          <dt class="zen-text-zen-muted-fg">formatAmount, en-IN</dt>
          <dd class="zen-m-0 zen-tabular-nums">{formatAmount(12345678.9, "INR", { locale: "en-IN" })}</dd>
          <dt class="zen-text-zen-muted-fg">formatAmount, de-DE</dt>
          <dd class="zen-m-0 zen-tabular-nums">{formatAmount(12345678.9, "EUR", { locale: "de-DE" })}</dd>
          <dt class="zen-text-zen-muted-fg">accounting negative</dt>
          <dd class="zen-m-0 zen-tabular-nums">{formatAmount(-1250, "USD", { locale: "en-US", accounting: true })}</dd>
          <dt class="zen-text-zen-muted-fg">formatNumber, Devanagari digits</dt>
          <dd class="zen-m-0 zen-tabular-nums">{formatNumber(1234567.5, { locale: "hi-IN-u-nu-deva", precision: 2 })}</dd>
          <dt class="zen-text-zen-muted-fg">formatPercent (takes 18, not 0.18)</dt>
          <dd class="zen-m-0 zen-tabular-nums">{formatPercent(18, { locale: "de-DE" })}</dd>
        </dl>
      </DemoSection>
    </DemoPage>
  );
};

export default NewAmountFieldDemo;

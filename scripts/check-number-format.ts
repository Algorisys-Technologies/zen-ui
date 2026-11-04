/**
 * Number formatting contract.
 *
 *   bun run check:number-format
 *
 * Worked examples in the locales an Indian ERP meets (and the ones that break
 * naive code), then a round-trip law over generated numbers in 14 locales:
 * whatever formatNumber / formatAmount / editText writes, parseNumber reads
 * back as the same (rounded) value. Plus what must NOT parse: ambiguous or
 * malformed text is "invalid", never a guess.
 */
import {
  numberParts, currencyPrecision, roundTo, formatNumber, formatAmount, formatQuantity, formatPercent, parseNumber, editText,
} from "../packages/core/src/number-format";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; if (failed <= 400) console.error(`FAIL ${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
};

// Rounding in decimal, not binary.
eq("1.005 -> 1.01", roundTo(1.005, 2), 1.01);
eq("-1.005 -> -1.01 (half away from zero)", roundTo(-1.005, 2), -1.01);
eq("2.675 -> 2.68", roundTo(2.675, 2), 2.68);
eq("1e21-ish stays finite", roundTo(1.23456e21, 2), 1.23456e21);
eq("tiny", roundTo(1e-7, 2), 0);
eq("-0 is 0", Object.is(roundTo(-0.001, 2), 0), true);
eq("0 places", [roundTo(2.5, 0), roundTo(-2.5, 0), roundTo(0.5, 0)], [3, -3, 1]);

// Precision by currency.
eq("currency precision", ["INR", "USD", "JPY", "KWD", "BHD", "EUR"].map(currencyPrecision), [2, 2, 0, 3, 3, 2]);
eq("unknown currency precision", currencyPrecision("ZZZ"), 2);

// Formatting, as each locale writes it.
eq("en-IN lakh grouping", formatNumber(12345678.5, { locale: "en-IN", precision: 2 }), "1,23,45,678.50");
eq("en-US", formatNumber(12345678.5, { locale: "en-US", precision: 2 }), "12,345,678.50");
eq("de-DE", formatNumber(12345678.5, { locale: "de-DE", precision: 2 }), "12.345.678,50");
eq("amount INR", formatAmount(125000, "INR", { locale: "en-IN" }), "₹1,25,000.00");
eq("amount JPY has no decimals", formatAmount(125000.6, "JPY", { locale: "ja-JP" }), "￥125,001");
eq("amount KWD has three", formatAmount(12.3456, "KWD", { locale: "en-US" }).replace(/ /g, " "), "KWD 12.346");
eq("amount: precision override", formatAmount(10, "INR", { locale: "en-IN", precision: 0 }), "₹10");
eq("amount: code", formatAmount(1250, "INR", { locale: "en-IN", display: "code" }).replace(/ /g, " "), "INR 1,250.00");
eq("amount: no currency shown", formatAmount(1250, "EUR", { locale: "de-DE", display: "none" }), "1.250,00");
eq("amount: accounting negative", formatAmount(-1250, "USD", { locale: "en-US", accounting: true }), "($1,250.00)");
eq("amount: rounds half away from zero", formatAmount(1.005, "INR", { locale: "en-IN" }), "₹1.01");
eq("quantity with unit", formatQuantity(1250.5, "Kg", { locale: "en-IN", precision: 3 }), "1,250.500 Kg");
eq("quantity default 0 places", formatQuantity(12.6, "Nos", { locale: "en-IN" }), "13 Nos");
eq("percent takes the percentage", formatPercent(12.5, { locale: "en-IN" }), "12.5%");
eq("percent precision", formatPercent(18, { locale: "en-IN", precision: 2 }), "18.00%");
eq("percent de-DE", formatPercent(12.5, { locale: "de-DE" }).replace(/ /g, " "), "12,5 %");
eq("edit text: plain, locale decimal, no grouping", [editText(1234567.5, { locale: "de-DE" }), editText(1234567.5, { locale: "en-IN" }), editText(null)], ["1234567,5", "1234567.5", ""]);

// Parsing: worked examples.
const P = (t: string, locale?: string, extra: object = {}) => parseNumber(t, { locale, ...extra });
eq("plain", P("125000", "en-IN"), 125000);
eq("blank is null", [P("", "en-IN"), P("   ", "en-IN")], [null, null]);
eq("lakh groups", P("1,25,000.50", "en-IN"), 125000.5);
eq("western groups in en-IN too", P("125,000.50", "en-IN"), 125000.5);
eq("de-DE", P("1.250.000,75", "de-DE"), 1250000.75);
eq("de-DE: a plain '.' decimal is read when it cannot be a group", P("12.5", "de-DE"), 12.5);
eq("de-DE: '1.250' is twelve hundred and fifty (a group)", P("1.250", "de-DE"), 1250);
eq("fr-FR narrow no-break space", P("1 250,5", "fr-FR"), 1250.5);
eq("fr-FR typed with a plain space", P("1 250,5", "fr-FR"), 1250.5);
eq("de-CH apostrophe", P("1’250.50", "de-CH"), 1250.5);
eq("de-CH typed apostrophe", P("1'250.50", "de-CH"), 1250.5);
eq("currency symbol ignored", [P("₹1,25,000", "en-IN"), P("€ 12,50", "de-DE"), P("INR 100", "en-IN")], [125000, 12.5, 100]);
eq("negatives", [P("-125", "en-IN"), P("(125.00)", "en-IN"), P("125-", "en-IN"), P("−125", "sv-SE")], [-125, -125, -125, -125]);
eq("Devanagari digits", P("१,२५,०००.५", "hi-IN"), 125000.5);
eq("Arabic-Indic digits and marks", P("١٢٬٣٤٥٫٦٧", "ar-EG"), 12345.67);
eq("shorthand off by default", P("2.5L", "en-IN"), "invalid");
const SH = { shorthand: true };
eq("shorthand: lakh, crore, k, M", [P("2.5L", "en-IN", SH), P("1.2 Cr", "en-IN", SH), P("15k", "en-IN", SH), P("3M", "en-US", SH), P("2 lakhs", "en-IN", SH)], [250000, 12000000, 15000, 3000000, 200000]);
eq("shorthand with a negative", P("-1.5L", "en-IN", SH), -150000);
eq("shorthand: an unknown suffix is invalid", P("5 kg", "en-IN", SH), "invalid");
eq("shorthand: 0.1 + 0.2 style float noise is not shown", P("0.3k", "en-IN", SH), 300);

// What must not parse.
for (const [t, loc] of [
  ["1,2,3", "en-US"], ["12,34", "en-US"], ["1,2345", "en-IN"], ["1.2.3", "en-US"], ["1,000.5.5", "en-US"], ["abc", "en-IN"],
  ["1.234,5", "en-US"], ["--5", "en-IN"], ["(-5)", "en-IN"], ["5 5", "en-IN"], [".", "en-IN"], ["-", "en-IN"], ["1e5", "en-IN"], ["Infinity", "en-US"], ["0x10", "en-US"],
] as const) eq(`"${t}" in ${loc} is invalid`, P(t, loc), "invalid");
eq("a leading decimal is fine", P(".5", "en-IN"), 0.5);
eq("a trailing decimal is fine", P("5.", "en-IN"), 5);

// A malformed locale must not throw: it behaves as no locale.
for (const bad of ["zz-!!", "en_IN", "", "123"]) {
  let ok = true;
  try {
    eq(`formatNumber with locale ${JSON.stringify(bad)} = the default locale's`, formatNumber(1234.5, { locale: bad, precision: 2 }), formatNumber(1234.5, { precision: 2 }));
    eq(`parseNumber with locale ${JSON.stringify(bad)}`, P("1234.5", bad), 1234.5);
    eq(`formatAmount with locale ${JSON.stringify(bad)}`, formatAmount(5, "INR", { locale: bad }), formatAmount(5, "INR"));
    formatPercent(5, { locale: bad });
  } catch { ok = false; }
  eq(`locale ${JSON.stringify(bad)} never throws`, ok, true);
}

// Round trips over generated numbers in 14 locales.
const LOCALES = ["en-IN", "en-US", "de-DE", "fr-FR", "de-CH", "es-ES", "hi-IN", "hi-IN-u-nu-deva", "ar-EG", "ja-JP", "pt-BR", "it-IT", "sv-SE", "en-GB"];
let seed = 3;
const rnd = (n: number) => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) >>> 8) % n;
const numbers = Array.from({ length: 160 }, () => {
  const mag = 10 ** rnd(12);
  const n = (rnd(1_000_000) / 1_000_000) * mag * (rnd(4) === 0 ? -1 : 1);
  return rnd(5) === 0 ? Math.round(n) : n;
}).concat([0, 1, -1, 999.995, 1000, 100000, 10000000, 1234.5, -0.5, 0.001]);
let trips = 0;
for (const locale of LOCALES) {
  for (const n of numbers) {
    for (const p of [0, 2, 3]) {
      const want = roundTo(n, p);
      eq(`${locale} formatNumber(${n}, ${p}) round-trips`, P(formatNumber(n, { locale, precision: p }), locale), want);
      eq(`${locale} editText(${n}) round-trips`, P(editText(want, { locale }), locale), want);
      trips += 2;
    }
    for (const [cur, disp] of [["INR", "symbol"], ["EUR", "code"], ["JPY", "symbol"], ["EGP", "symbol"], ["USD", "name"]] as const) {
      const want = roundTo(n, currencyPrecision(cur));
      const text = formatAmount(n, cur, { locale, display: disp });
      eq(`${locale} formatAmount(${n}, ${cur}, ${disp}) round-trips: ${text}`, P(text, locale, { currency: cur }), want);
      const acc = formatAmount(n, cur, { locale, accounting: true });
      eq(`${locale} accounting ${acc} round-trips`, P(acc, locale, { currency: cur }), want);
      trips += 2;
    }
  }
}
eq("round trips examined", trips > 30000, true);
eq("the locales give 7 distinct styles of marks and digits", new Set(LOCALES.map((l) => JSON.stringify(numberParts(l)))).size, 7); // measured: en-IN and en-US share marks (they differ in grouping, checked above)

console.log(failed ? `${failed} of ${checked} FAILED` : `all passed (${checked} assertions, ${trips} round trips)`);
process.exit(failed ? 1 : 0);

import { useState } from "react";
import type { ZenMessages } from "@algorisys/zen-ui-core/messages";
import { LocaleProvider } from "./locale/locale";
import { AmountField } from "./form/amount-field/amount-field";
import { Label } from "./form/label/label";
import { SegmentedButton, SegmentedButtonItem } from "./button/button-family";
import { CodeExample } from "./demo-helpers";

/**
 * A sample, partial Hindi translation: an app supplies these (from its own
 * translation files); anything it leaves out stays English. The same sample
 * as the Solid demo's, so a component this binding has not yet moved onto the
 * catalogue picks its words up here the day it does.
 */
const HINDI: Partial<ZenMessages> = {
  "common.close": "बंद करें",
  "common.open": "खोलें",
  "combobox.placeholder": "चुनें…",
  "combobox.searchPlaceholder": "खोजें…",
  "combobox.noResults": "कोई परिणाम नहीं।",
  "dateInput.chooseDate": "तारीख चुनें",
  "dateInput.hint": "तारीख {pattern} की तरह लिखें, आज के लिए t, एक हफ़्ते बाद के लिए +7।",
  "passwordInput.show": "पासवर्ड दिखाएँ",
  "passwordInput.hide": "पासवर्ड छिपाएँ",
  "numberField.decrement": "घटाएँ",
  "numberField.increment": "बढ़ाएँ",
  "amountField.inCurrency": "राशि {currency} में।",
  "amountField.shorthand": "आप 2.5L (2,50,000) या 1.2Cr लिख सकते हैं।",
  "filterBuilder.match": "मिलान",
  "filterBuilder.theseConditions": "ये शर्तें",
  "filterBuilder.all": "सभी",
  "filterBuilder.any": "कोई भी",
  "filterBuilder.none": "कोई नहीं",
  "filterBuilder.notAll": "सभी नहीं",
  "filterBuilder.addCondition": "शर्त",
  "filterBuilder.addGroup": "समूह",
  "filterBuilder.emptyRoot": "कोई शर्त नहीं: हर पंक्ति दिखेगी।",
  "filterBuilder.shows": "दिखाता है: ",
  "filterBuilder.showsEverything": "हर पंक्ति (कोई शर्त अभी पूरी नहीं)",
  "filterBuilder.field": "शर्त {n}, फ़ील्ड",
  "filterBuilder.operator": "शर्त {n}, संक्रिया",
  "lookupField.results": "{count, plural, one {# परिणाम} other {# परिणाम}}",
};

/**
 * The same controls, in whichever language is picked. Only the components
 * whose words already come from the catalogue in this binding are here; the
 * rest join as they move onto it.
 */
const Controls = ({ suffix }: { suffix: string }) => (
  <div className="zen-flex zen-flex-col zen-gap-4" data-testid={`controls-${suffix}`}>
    <div className="zen-grid zen-max-w-3xl zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-2">
      <div className="zen-flex zen-flex-col zen-gap-1.5">
        <Label htmlFor={`amt-${suffix}`}>Amount</Label>
        <AmountField id={`amt-${suffix}`} currency="INR" value={250000} />
      </div>
    </div>
  </div>
);

const NewLocaleDemo: React.FC = () => {
  const [lang, setLang] = useState<"en" | "hi">("hi");
  return (
    <div className="demo-page">
      <h1>Localization</h1>
      <p className="lede">
        Every string zen-ui shows or announces comes from one catalogue (@algorisys/zen-ui-core/messages).
        LocaleProvider takes translations for any part of it; what is left out stays English, and without a provider
        nothing changes. A component's own label props still win over both.
      </p>

      <section className="demo-section">
        <h2>1. Translating the built-in strings</h2>
        <CodeExample
          title="A partial Hindi translation, through LocaleProvider"
          description="Switch the language. The amount's hint, which a screen reader reads with the field, comes from the catalogue, the currency named in the chosen language. In the React binding the rest of the built-in strings are still moving onto the catalogue; each component joins this page as it does. Strings a translation leaves out fall back to English, so a translation can be done a screen at a time."
          code={`import type { ZenMessages } from "@algorisys/zen-ui-core/messages";

const hindi: Partial<ZenMessages> = {
  "combobox.placeholder": "चुनें…",
  "passwordInput.show": "पासवर्ड दिखाएँ",
  "lookupField.results": "{count, plural, one {# परिणाम} other {# परिणाम}}",
  // …any subset; the rest stays English
};

<LocaleProvider locale="hi-IN" currency="INR" messages={hindi}>
  <App />
</LocaleProvider>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-4">
            <SegmentedButton value={lang} onValueChange={(v) => setLang(v as "en" | "hi")} aria-label="Language">
              <SegmentedButtonItem value="hi">हिन्दी</SegmentedButtonItem>
              <SegmentedButtonItem value="en">English</SegmentedButtonItem>
            </SegmentedButton>
            <LocaleProvider locale={lang === "hi" ? "hi-IN" : "en-IN"} messages={lang === "hi" ? HINDI : undefined}>
              <Controls suffix="a" />
            </LocaleProvider>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. No provider: exactly as before</h2>
        <CodeExample
          title="The same controls with no LocaleProvider at all"
          description="English, the browser's locale: what every existing app sees, unchanged."
          code={`<Combobox options={fruits} />   // "Select…", as it always was`}
        >
          <Controls suffix="b" />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewLocaleDemo;

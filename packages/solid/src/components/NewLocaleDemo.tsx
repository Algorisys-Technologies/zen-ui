import { createSignal } from "solid-js";
import type { ZenMessages } from "@algorisys/zen-ui-core/messages";
import { LocaleProvider } from "./locale/locale";
import { Combobox } from "./combobox/combobox";
import { DateInput } from "./form/date-picker/date-input";
import { PasswordInput } from "./form/password-input/password-input";
import { NumberField } from "./form/number-field/number-field";
import { AmountField } from "./form/amount-field/amount-field";
import { FilterBuilder } from "./filter-builder/filter-builder";
import { Label } from "./form/label/label";
import { SegmentedButton, SegmentedButtonItem } from "./button/button-family";
import { DemoPage, DemoSection } from "./demo-helpers";
import type { FilterField, FilterGroup } from "@algorisys/zen-ui-core/filter";

/**
 * A sample, partial Hindi translation: an app supplies these (from its own
 * translation files); anything it leaves out stays English.
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

const FRUITS = ["Mango", "Banana", "Guava", "Papaya"].map((f) => ({ value: f.toLowerCase(), label: f }));
const FIELDS: FilterField[] = [
  { id: "status", label: "Status", type: "enum", options: [{ value: "overdue", label: "Overdue" }, { value: "paid", label: "Paid" }] },
  { id: "amount", label: "Amount", type: "number" },
];

/** The same controls, in whichever language is picked. */
const Controls = (p: { suffix: string }) => {
  // eslint-disable-next-line solid/reactivity -- the suffix is fixed per instance; the filter's root id is set once
  const [filter, setFilter] = createSignal<FilterGroup>({ kind: "group", id: `root-${p.suffix}`, join: "and", children: [] });
  return (
    <div class="zen-flex zen-flex-col zen-gap-4" data-testid={`controls-${p.suffix}`}>
      <div class="zen-grid zen-max-w-3xl zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-2">
        <div class="zen-flex zen-flex-col zen-gap-1.5">
          <Label for={`fruit-${p.suffix}`}>Fruit</Label>
          <Combobox options={FRUITS} id={`fruit-${p.suffix}`} />
        </div>
        <div class="zen-flex zen-flex-col zen-gap-1.5">
          <Label for={`date-${p.suffix}`}>Date</Label>
          <DateInput id={`date-${p.suffix}`} locale="en-IN" />
        </div>
        <div class="zen-flex zen-flex-col zen-gap-1.5">
          <Label for={`pw-${p.suffix}`}>Password</Label>
          <PasswordInput id={`pw-${p.suffix}`} />
        </div>
        <div class="zen-flex zen-flex-col zen-gap-1.5">
          <Label for={`qty-${p.suffix}`}>Count</Label>
          <NumberField id={`qty-${p.suffix}`} value={3} />
        </div>
        <div class="zen-flex zen-flex-col zen-gap-1.5">
          <Label for={`amt-${p.suffix}`}>Amount</Label>
          <AmountField id={`amt-${p.suffix}`} currency="INR" value={250000} />
        </div>
      </div>
      <FilterBuilder fields={FIELDS} value={filter()} onValueChange={setFilter} aria-label={`Filter ${p.suffix}`} />
    </div>
  );
};

const NewLocaleDemo = () => {
  const [lang, setLang] = createSignal<"en" | "hi">("hi");
  return (
    <DemoPage
      title="Localization"
      description="Every string zen-ui shows or announces comes from one catalogue (@algorisys/zen-ui-core/messages). LocaleProvider takes translations for any part of it; what is left out stays English, and without a provider nothing changes. A component's own label props still win over both."
    >
      <DemoSection
        title="1. Translating the built-in strings"
        codeTitle="A partial Hindi translation, through LocaleProvider"
        codeDescription="Switch the language. The placeholders, the buttons' names (Show password, the steppers), the date field's hint, the amount's hint and FilterBuilder's words all come from the catalogue. Strings this sample does not translate fall back to English, so a translation can be done a screen at a time."
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
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-4">
          <SegmentedButton value={lang()} onValueChange={(v) => setLang(v as "en" | "hi")} aria-label="Language">
            <SegmentedButtonItem value="hi">हिन्दी</SegmentedButtonItem>
            <SegmentedButtonItem value="en">English</SegmentedButtonItem>
          </SegmentedButton>
          <LocaleProvider locale={lang() === "hi" ? "hi-IN" : "en-IN"} messages={lang() === "hi" ? HINDI : undefined}>
            <Controls suffix="a" />
          </LocaleProvider>
        </div>
      </DemoSection>
      <DemoSection
        title="2. No provider: exactly as before"
        codeTitle="The same controls with no LocaleProvider at all"
        codeDescription="English, the browser's locale: what every existing app sees, unchanged."
        code={`<Combobox options={fruits} />   // "Select…", as it always was`}
      >
        <Controls suffix="b" />
      </DemoSection>
    </DemoPage>
  );
};

export default NewLocaleDemo;

import type { ZenMessages } from "@algorisys/zen-ui-core/messages";
import { AmountField, Label, LocaleProvider } from "../index";
import { DemoPage } from "./demo-helpers";

/**
 * Localization demo — the web-components port.
 *
 * There is no <zen-locale-provider> element yet: a custom element builds its
 * field when it connects, which is after (and outside) any provider's
 * `children` function, so it could not read one. This package re-exports the
 * vanilla factories, LocaleProvider among them, and that is what this page
 * uses: the factories called inside a provider's `children` function read it.
 */

/**
 * A sample, partial Hindi translation: an app supplies these (from its own
 * translation files); anything it leaves out stays English. The same sample
 * as the other bindings' demos, so a component this binding has not yet moved
 * onto the catalogue picks its words up here the day it does.
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
 * rest join as they move onto it. Called INSIDE a provider's `children`
 * function, which is when a factory reads the provider.
 */
function controls(suffix: string): HTMLElement {
  const id = `amt-${suffix}`;
  const amount = AmountField({ id, currency: "INR", value: 250000 });
  const cell = document.createElement("div");
  cell.className = "zen-flex zen-flex-col zen-gap-1.5";
  cell.append(Label({ for: id, children: "Amount" }).el, amount.el);
  const grid = document.createElement("div");
  grid.className = "zen-grid zen-max-w-3xl zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-2";
  grid.append(cell);
  const root = document.createElement("div");
  root.className = "zen-flex zen-flex-col zen-gap-4";
  root.dataset.testid = `controls-${suffix}`;
  root.append(grid);
  return root;
}

function translated(): Node {
  let lang = "hi";
  const providerProps = () => ({
    locale: lang === "hi" ? "hi-IN" : "en-IN",
    messages: lang === "hi" ? HINDI : undefined,
  });
  // update() calls children() again, so a language switch rebuilds the field in it.
  const provider = LocaleProvider({ ...providerProps(), children: () => controls("a") });
  const picker = document.createElement("zen-segmented-button") as HTMLElement & {
    items: { value: string; label: string }[];
  };
  picker.setAttribute("default-value", lang);
  picker.setAttribute("aria-label", "Language");
  picker.items = [
    { value: "hi", label: "हिन्दी" },
    { value: "en", label: "English" },
  ];
  picker.addEventListener("zen-value-change", (e) => {
    lang = (e as CustomEvent).detail;
    provider.update(providerProps());
  });
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-4";
  wrap.append(picker, provider.el);
  return wrap;
}

export default function LocaleDemo(): HTMLElement {
  return DemoPage({
    title: "Localization",
    description:
      "Every string zen-ui shows or announces comes from one catalogue (@algorisys/zen-ui-core/messages). LocaleProvider takes translations for any part of it; what is left out stays English, and without a provider nothing changes. A component's own label props still win over both.",
    sections: [
      {
        title: "1. Translating the built-in strings",
        codeTitle: "A partial Hindi translation, through LocaleProvider",
        codeDescription:
          "Switch the language. The amount's hint, which a screen reader reads with the field, comes from the catalogue, the currency named in the chosen language. In this binding the rest of the built-in strings are still moving onto the catalogue; each component joins this page as it does. Strings a translation leaves out fall back to English, so a translation can be done a screen at a time. There is no <zen-locale-provider> element yet: this page uses the LocaleProvider factory this package re-exports, with the factories it builds inside.",
        code: `import { LocaleProvider, AmountField } from "@algorisys/zen-ui-web-components";
import type { ZenMessages } from "@algorisys/zen-ui-core/messages";

const hindi: Partial<ZenMessages> = {
  "combobox.placeholder": "चुनें…",
  "passwordInput.show": "पासवर्ड दिखाएँ",
  "lookupField.results": "{count, plural, one {# परिणाम} other {# परिणाम}}",
  // …any subset; the rest stays English
};

// children is a FUNCTION: the factories it calls read this provider.
const app = LocaleProvider({
  locale: "hi-IN",
  currency: "INR",
  messages: hindi,
  children: () => [AmountField({ value: 250000 })],
});
document.body.append(app.el);`,
        render: translated,
      },
      {
        title: "2. No provider: exactly as before",
        codeTitle: "The same controls with no LocaleProvider at all",
        codeDescription: "English, the browser's locale: what every existing app sees, unchanged.",
        code: `<zen-combobox></zen-combobox>   <!-- "Select…", as it always was -->`,
        render: () => controls("b"),
      },
    ],
  });
}

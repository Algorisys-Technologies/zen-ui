import { DemoPage } from "./demo-helpers";

/**
 * PhoneInput demo — the web-components port. <zen-phone-input> carries `value` /
 * `defaultValue` (a { country, number } object) and `countries` (an array) as JS
 * properties, not attributes; `zen-value-change` fires with the whole value.
 */

interface PhoneValue {
  country: string;
  number: string;
}

const box = (node: Node, note?: Node): HTMLElement => {
  const w = document.createElement("div");
  w.style.width = "360px";
  w.append(node);
  if (note) w.append(note);
  return w;
};

export default function PhoneInputDemo(): HTMLElement {
  return DemoPage({
    title: "PhoneInput (composition)",
    description:
      "Country dial-code Select + national-number Input. No god-component: the same building blocks you'd use anywhere else, wired together. React builds it from Radix's compound Select; the vanilla core composes its data-driven Select the same way.",
    sections: [
      {
        title: "1. Basic (controlled)",
        codeTitle: "value = { country, number }",
        codeDescription:
          "The value is one object. zen-value-change fires on both a country pick and a keystroke, always with the whole { country, number }.",
        code: `const field = document.createElement("zen-phone-input");
field.value = { country: "+91", number: "" };
field.addEventListener("zen-value-change", (e) => {
  field.value = e.detail;   // re-apply the whole value
});`,
        render: () => {
          const out = document.createElement("span");
          out.style.marginLeft = "12px";
          out.style.fontSize = "0.8125rem";
          out.style.color = "var(--zen-color-muted-fg)";

          const field = document.createElement("zen-phone-input");
          (field as unknown as { value: PhoneValue }).value = { country: "+91", number: "" };
          const paint = () => {
            const v = (field as unknown as { value: PhoneValue }).value;
            out.textContent = `${v.country} ${v.number || "(empty)"}`;
          };
          field.addEventListener("zen-value-change", (e) => {
            (field as unknown as { value: PhoneValue }).value = (e as CustomEvent).detail as PhoneValue;
            paint();
          });
          paint();
          return box(field, out);
        },
      },
      {
        title: "2. Uncontrolled",
        codeTitle: "defaultValue",
        codeDescription:
          "Give it a starting value and let it own the state — no zen-value-change wiring required.",
        code: `const field = document.createElement("zen-phone-input");
field.defaultValue = { country: "+1", number: "555-0100" };`,
        render: () => {
          const field = document.createElement("zen-phone-input");
          (field as unknown as { defaultValue: PhoneValue }).defaultValue = {
            country: "+1",
            number: "555-0100",
          };
          return box(field);
        },
      },
      {
        title: "3. Restricted country list",
        codeTitle: "Set a custom countries property",
        code: `const field = document.createElement("zen-phone-input");
field.countries = [
  { dialCode: "+91", name: "India" },
  { dialCode: "+1", name: "United States" },
  { dialCode: "+44", name: "United Kingdom" },
];`,
        render: () => {
          const field = document.createElement("zen-phone-input");
          (field as unknown as { countries: unknown }).countries = [
            { dialCode: "+91", name: "India" },
            { dialCode: "+1", name: "United States" },
            { dialCode: "+44", name: "United Kingdom" },
          ];
          return box(field);
        },
      },
      {
        title: "4. Disabled",
        codeTitle: "disabled applies to both children",
        code: `<zen-phone-input disabled></zen-phone-input>
field.defaultValue = { country: "+91", number: "9876543210" };`,
        render: () => {
          const field = document.createElement("zen-phone-input");
          field.setAttribute("disabled", "");
          (field as unknown as { defaultValue: PhoneValue }).defaultValue = {
            country: "+91",
            number: "9876543210",
          };
          return box(field);
        },
      },
    ],
  });
}

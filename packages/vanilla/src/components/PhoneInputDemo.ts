import { PhoneInput, type PhoneValue } from "./form/phone-input/phone-input";
import { DemoPage } from "./demo-helpers";

const box = (node: Node, note?: Node) => {
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
      "Country dial-code Select + national-number Input. No god-component: the same building blocks you'd use anywhere else, wired together. React builds it from Radix's compound Select; vanilla composes its data-driven Select the same way.",
    sections: [
      {
        title: "1. Basic (controlled)",
        codeTitle: "value = { country, number }",
        codeDescription:
          "The value is one object. onValueChange fires on both a country pick and a keystroke, always with the whole { country, number }.",
        code: `let phone = { country: "+91", number: "" };

PhoneInput({
  value: phone,
  onValueChange: (next) => {
    phone = next;
    // re-render / update() with the new value
  },
})`,
        render: () => {
          const out = document.createElement("span");
          out.style.marginLeft = "12px";
          out.style.fontSize = "0.8125rem";
          out.style.color = "var(--zen-color-muted-fg)";

          let phone: PhoneValue = { country: "+91", number: "" };
          const paint = () => {
            out.textContent = `${phone.country} ${phone.number || "(empty)"}`;
          };
          paint();

          const field = PhoneInput({
            value: phone,
            onValueChange: (next) => {
              phone = next;
              field.update({ value: phone });
              paint();
            },
          });
          return box(field.el, out);
        },
      },
      {
        title: "2. Uncontrolled",
        codeTitle: "defaultValue",
        codeDescription:
          "Give it a starting value and let it own the state — no onValueChange wiring required.",
        code: `PhoneInput({ defaultValue: { country: "+1", number: "555-0100" } })`,
        render: () =>
          box(PhoneInput({ defaultValue: { country: "+1", number: "555-0100" } }).el),
      },
      {
        title: "3. Restricted country list",
        codeTitle: "Pass a custom countries prop",
        code: `PhoneInput({
  countries: [
    { dialCode: "+91", name: "India" },
    { dialCode: "+1", name: "United States" },
    { dialCode: "+44", name: "United Kingdom" },
  ],
})`,
        render: () =>
          box(
            PhoneInput({
              countries: [
                { dialCode: "+91", name: "India" },
                { dialCode: "+1", name: "United States" },
                { dialCode: "+44", name: "United Kingdom" },
              ],
            }).el,
          ),
      },
      {
        title: "4. Disabled",
        codeTitle: "disabled applies to both children",
        code: `PhoneInput({ defaultValue: { country: "+91", number: "9876543210" }, disabled: true })`,
        render: () =>
          box(
            PhoneInput({
              defaultValue: { country: "+91", number: "9876543210" },
              disabled: true,
            }).el,
          ),
      },
    ],
  });
}

import { Select } from "./form/select/select";
import { DemoPage } from "./demo-helpers";

const FRUIT = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "durian", label: "Durian", disabled: true },
  { value: "elderberry", label: "Elderberry" },
];

const box = (node: Node, note?: Node) => {
  const w = document.createElement("div");
  w.style.width = "260px";
  w.append(node);
  if (note) w.append(note);
  return w;
};

export default function SelectDemo(): HTMLElement {
  return DemoPage({
    title: "Select",
    description:
      "The known divergence. React exposes Radix's compound parts; Solid takes an options array. This lands on Solid's shape by following React's reasoning — Radix's compound form works because of CONTEXT, and with no framework the same shape would mean hand-threading the root into every child. That is syntax-porting, which LOOPS XXXVI forbids.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "options in, value out",
        codeDescription:
          "Arrow keys open the list from the trigger, the list opens ON the current value, Escape and click-outside close it, and a disabled option is skipped by the arrows rather than merely greyed.",
        code: `Select({
  placeholder: "Pick a fruit",
  options: [
    { value: "apple", label: "Apple" },
    { value: "durian", label: "Durian", disabled: true },
  ],
  onValueChange: (v) => console.log(v),
})`,
        render: () => {
          const out = document.createElement("p");
          out.style.fontSize = "0.75rem";
          out.style.color = "var(--zen-color-muted-fg)";
          out.style.margin = "0.35rem 0 0";
          out.textContent = "value: —";
          return box(
            Select({
              placeholder: "Pick a fruit",
              options: FRUIT,
              onValueChange: (v) => (out.textContent = `value: ${v}`),
            }).el,
            out,
          );
        },
      },
      {
        title: "2. Label + error",
        codeTitle: "label / errorMessage",
        codeDescription:
          "The label is wired with `for`, and the error is wired with aria-describedby + aria-invalid — not merely coloured red.",
        code: `Select({ label: "Fruit", errorMessage: "Pick one to continue", options })`,
        render: () =>
          box(
            Select({
              label: "Fruit",
              placeholder: "Nothing selected",
              errorMessage: "Pick one to continue",
              options: FRUIT,
            }).el,
          ),
      },
      {
        title: "3. Hidden native select",
        description:
          "There is a real <select name> behind this, visually hidden. Without it the component is a div that looks like a form control and submits nothing — Radix and Kobalte both ship one; it is not optional.",
        codeTitle: "name makes it a real form control",
        code: `Select({ name: "fruit", defaultValue: "cherry", options })`,
        render: () => box(Select({ name: "fruit", defaultValue: "cherry", options: FRUIT }).el),
      },
      {
        title: "4. Disabled",
        code: `Select({ disabled: true, placeholder: "Unavailable", options })`,
        render: () => box(Select({ disabled: true, placeholder: "Unavailable", options: FRUIT }).el),
      },
    ],
  });
}

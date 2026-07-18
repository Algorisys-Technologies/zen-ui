import { DemoPage } from "./demo-helpers";

/**
 * Select demo — the web-components port. <zen-select> is data-driven: set
 * `el.options = [...]` (or an `options='[…]'` JSON attribute). `zen-value-change`
 * fires with the chosen value. Divergence from React's compound parts is
 * deliberate — see the vanilla demo's note.
 */

const FRUIT = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "durian", label: "Durian", disabled: true },
  { value: "elderberry", label: "Elderberry" },
];

function select(attrs: Record<string, string>, onChange?: (v: string) => void): HTMLElement {
  const s = document.createElement("zen-select");
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  Object.assign(s, { options: FRUIT });
  if (onChange) s.addEventListener("zen-value-change", (e) => onChange((e as CustomEvent).detail as string));
  return s;
}

const box = (node: Node, note?: Node): HTMLElement => {
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
        code: `<zen-select placeholder="Pick a fruit"
  options='[{"value":"apple","label":"Apple"},{"value":"durian","label":"Durian","disabled":true}]'></zen-select>

const s = document.querySelector("zen-select");
s.addEventListener("zen-value-change", (e) => console.log(e.detail));`,
        render: () => {
          const out = document.createElement("p");
          out.style.fontSize = "0.75rem";
          out.style.color = "var(--zen-color-muted-fg)";
          out.style.margin = "0.35rem 0 0";
          out.textContent = "value: —";
          return box(
            select({ placeholder: "Pick a fruit" }, (v) => (out.textContent = `value: ${v}`)),
            out,
          );
        },
      },
      {
        title: "2. Label + error",
        codeTitle: "label / error-message",
        codeDescription:
          "The label is wired with `for`, and the error is wired with aria-describedby + aria-invalid — not merely coloured red.",
        code: `<zen-select label="Fruit" error-message="Pick one to continue"
  placeholder="Nothing selected" options='[…]'></zen-select>`,
        render: () =>
          box(select({ label: "Fruit", placeholder: "Nothing selected", "error-message": "Pick one to continue" })),
      },
      {
        title: "3. Hidden native select",
        description:
          "There is a real <select name> behind this, visually hidden. Without it the component is a div that looks like a form control and submits nothing — Radix and Kobalte both ship one; it is not optional.",
        codeTitle: "name makes it a real form control",
        code: `<zen-select name="fruit" default-value="cherry" options='[…]'></zen-select>`,
        render: () => box(select({ name: "fruit", "default-value": "cherry" })),
      },
      {
        title: "4. Disabled",
        code: `<zen-select disabled placeholder="Unavailable" options='[…]'></zen-select>`,
        render: () => box(select({ disabled: "", placeholder: "Unavailable" })),
      },
    ],
  });
}

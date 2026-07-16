import { ColorPicker, ColorPalette } from "./color-picker/color-picker";
import { DemoPage } from "./demo-helpers";

/**
 * ColorPicker demo. Mirrors the React NewColorPickerDemo — the picker, a
 * locked brand palette, the palette on its own, and the naming of colours —
 * adapted to the vanilla factory. Each live value read-out is a <p> the
 * onValueChange handler keeps in step, standing in for React's useState.
 */

const BRAND = [
  { value: "#1e3a8a", label: "Navy" },
  { value: "#3b82f6", label: "Ocean" },
  { value: "#facc15", label: "Sun" },
  { value: "#22c55e", label: "Moss" },
  { value: "#ef4444", label: "Signal" },
];

function column(...nodes: Node[]): HTMLElement {
  const col = document.createElement("div");
  col.style.display = "flex";
  col.style.flexDirection = "column";
  col.style.gap = "10px";
  col.style.alignItems = "flex-start";
  col.append(...nodes);
  return col;
}

/** A "value → #hex" read-out that mirrors React's live useState display. */
function readout(initial: string, prefix = ""): { el: HTMLElement; set: (v: string) => void } {
  const p = document.createElement("p");
  p.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
  const code = document.createElement("code");
  const render = (v: string) => {
    p.replaceChildren(document.createTextNode("value → "), code);
    code.textContent = v;
    if (prefix) p.append(document.createTextNode(prefix));
  };
  render(initial);
  return { el: p, set: render };
}

export default function ColorPickerDemo(): HTMLElement {
  return DemoPage({
    title: "ColorPicker",
    description:
      "A swatch that opens a palette, a hex field and the platform's own picker. The colour maths lives in @algorisys/zen-ui-core/color, shared by both bindings, so the two cannot disagree about what a colour is. Hex in, hex out — normalised, so #FFF and #ffffff are one colour rather than two.",
    sections: [
      {
        title: "1. The picker",
        codeTitle: "A palette, a hex field, and the OS picker",
        codeDescription:
          "The gradient area is the platform's own <input type='color'>, not a hand-rolled canvas. That is deliberate: the native one is keyboard-accessible, screen-reader-labelled, eyedropper-equipped and localised everywhere, for free and with no dependency. A canvas would be a worse reimplementation of all of it.",
        code: `let brand = "#3b82f6";
const pick = ColorPicker({ value: brand, onValueChange: (v) => (brand = v) });
document.body.append(pick.el);`,
        render: () => {
          const out = readout("#3b82f6");
          const pick = ColorPicker({
            value: "#3b82f6",
            onValueChange: (v) => {
              pick.update({ value: v });
              out.set(v);
            },
          });
          return column(pick.el, out.el);
        },
      },
      {
        title: "2. A brand palette, and nothing else",
        codeTitle: "allowCustom: false — when off-brand is not an option",
        codeDescription:
          "Pass your own colours and drop the custom field. The picker then cannot produce a colour outside the palette, which is the point: a brand picker that lets someone type #ff00ff is not a brand picker.",
        code: `const BRAND = [
  { value: "#1e3a8a", label: "Navy" },
  { value: "#3b82f6", label: "Ocean" },
  …
];

ColorPicker({ colors: BRAND, allowCustom: false, value: c, onValueChange: setC });`,
        render: () => {
          const out = readout("#7c3aed", " — starts off-palette, and the picker cannot get back there");
          const pick = ColorPicker({
            colors: BRAND,
            allowCustom: false,
            value: "#7c3aed",
            placeholder: "Pick a brand colour",
            onValueChange: (v) => {
              pick.update({ value: v });
              out.set(v);
            },
          });
          return column(pick.el, out.el);
        },
      },
      {
        title: "3. The palette on its own",
        codeTitle: "ColorPalette — a radiogroup that happens to be coloured",
        codeDescription:
          "'Pick one of these' is the same question whatever the options look like, so it gets the same contract as Rating and Likert: arrows move, Home/End jump, one tab stop for the group. The tick is black or white depending on the swatch — a fixed colour disappears at one end of every palette. Try arrowing through it.",
        code: `ColorPalette({
  colors: BRAND,
  value: colour,
  onValueChange: setColour,
  label: "Accent colour",
});`,
        render: () => {
          const out = readout("#22c55e");
          const palette = ColorPalette({
            colors: BRAND,
            value: "#22c55e",
            label: "Accent colour",
            size: "lg",
            onValueChange: (v) => {
              palette.update({ value: v });
              out.set(v);
            },
          });
          return column(palette.el, out.el);
        },
      },
      {
        title: "4. Naming the colours",
        codeTitle: "A hex is not an accessible name",
        codeDescription:
          "Bare hex strings are accepted, and each is announced as its hex — '#3b82f6' tells a listener nothing. Pass a label and the swatch has a name. The two forms can be mixed, because a design system should not force ceremony on a throwaway palette.",
        code: `// announced as "#3b82f6"
ColorPalette({ colors: ["#3b82f6", "#ef4444"] });

// announced as "Ocean"
ColorPalette({ colors: [{ value: "#3b82f6", label: "Ocean" }] });`,
        render: () =>
          column(
            ColorPalette({ colors: ["#3b82f6", "#ef4444", "#22c55e"], label: "Unnamed" }).el,
            ColorPalette({ colors: BRAND, label: "Named" }).el,
          ),
      },
    ],
  });
}

import { DemoPage } from "./demo-helpers";

/**
 * ColorPicker demo — the web-components mirror of the vanilla ColorPickerDemo.
 * Same sections; renders <zen-color-picker> / <zen-color-palette> custom elements
 * instead of the imperative factory. Each live value read-out is a <p> the
 * zen-value-change listener keeps in step.
 */

const BRAND = [
  { value: "#1e3a8a", label: "Navy" },
  { value: "#3b82f6", label: "Ocean" },
  { value: "#facc15", label: "Sun" },
  { value: "#22c55e", label: "Moss" },
  { value: "#ef4444", label: "Signal" },
];

/** Create an element, set string attributes, optionally set text. */
function el(tag: string, attrs: Record<string, string> = {}, text?: string): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
}

function column(...nodes: Node[]): HTMLElement {
  const col = document.createElement("div");
  col.style.display = "flex";
  col.style.flexDirection = "column";
  col.style.gap = "10px";
  col.style.alignItems = "flex-start";
  col.append(...nodes);
  return col;
}

/** A "value → #hex" read-out that mirrors the vanilla live display. */
function readout(initial: string, suffix = ""): { el: HTMLElement; set: (v: string) => void } {
  const p = document.createElement("p");
  p.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
  const code = document.createElement("code");
  const render = (v: string) => {
    p.replaceChildren(document.createTextNode("value → "), code);
    code.textContent = v;
    if (suffix) p.append(document.createTextNode(suffix));
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
        code: `<zen-color-picker value="#3b82f6"></zen-color-picker>

picker.addEventListener("zen-value-change", (e) => {
  picker.setAttribute("value", e.detail);  // keep it controlled
});`,
        render: () => {
          const out = readout("#3b82f6");
          const pick = el("zen-color-picker", { value: "#3b82f6" });
          pick.addEventListener("zen-value-change", (e) => {
            const v = (e as CustomEvent<string>).detail;
            pick.setAttribute("value", v);
            out.set(v);
          });
          return column(pick, out.el);
        },
      },
      {
        title: "2. A brand palette, and nothing else",
        codeTitle: "allowCustom: false — when off-brand is not an option",
        codeDescription:
          "Pass your own colours and drop the custom field. The picker then cannot produce a colour outside the palette, which is the point: a brand picker that lets someone type #ff00ff is not a brand picker.",
        code: `const picker = document.createElement("zen-color-picker");
picker.colors = BRAND;          // [{ value, label }, …]
picker.allowCustom = false;     // no hex field
picker.setAttribute("value", "#7c3aed");`,
        render: () => {
          const out = readout("#7c3aed", " — starts off-palette, and the picker cannot get back there");
          const pick = el("zen-color-picker", {
            value: "#7c3aed",
            placeholder: "Pick a brand colour",
          });
          (pick as unknown as { colors: unknown }).colors = BRAND;
          (pick as unknown as { allowCustom: boolean }).allowCustom = false;
          pick.addEventListener("zen-value-change", (e) => {
            const v = (e as CustomEvent<string>).detail;
            pick.setAttribute("value", v);
            out.set(v);
          });
          return column(pick, out.el);
        },
      },
      {
        title: "3. The palette on its own",
        codeTitle: "zen-color-palette — a radiogroup that happens to be coloured",
        codeDescription:
          "'Pick one of these' is the same question whatever the options look like, so it gets the same contract as Rating and Likert: arrows move, Home/End jump, one tab stop for the group. The tick is black or white depending on the swatch — a fixed colour disappears at one end of every palette. Try arrowing through it.",
        code: `const palette = document.createElement("zen-color-palette");
palette.colors = BRAND;
palette.setAttribute("value", "#22c55e");
palette.setAttribute("label", "Accent colour");`,
        render: () => {
          const out = readout("#22c55e");
          const palette = el("zen-color-palette", {
            value: "#22c55e",
            label: "Accent colour",
            size: "lg",
          });
          (palette as unknown as { colors: unknown }).colors = BRAND;
          palette.addEventListener("zen-value-change", (e) => {
            const v = (e as CustomEvent<string>).detail;
            palette.setAttribute("value", v);
            out.set(v);
          });
          return column(palette, out.el);
        },
      },
      {
        title: "4. Naming the colours",
        codeTitle: "A hex is not an accessible name",
        codeDescription:
          "Bare hex strings are accepted, and each is announced as its hex — '#3b82f6' tells a listener nothing. Pass a label and the swatch has a name. The two forms can be mixed, because a design system should not force ceremony on a throwaway palette.",
        code: `// announced as "#3b82f6"
unnamed.colors = ["#3b82f6", "#ef4444"];

// announced as "Ocean"
named.colors = [{ value: "#3b82f6", label: "Ocean" }];`,
        render: () => {
          const unnamed = el("zen-color-palette", { label: "Unnamed" });
          (unnamed as unknown as { colors: unknown }).colors = ["#3b82f6", "#ef4444", "#22c55e"];
          const named = el("zen-color-palette", { label: "Named" });
          (named as unknown as { colors: unknown }).colors = BRAND;
          return column(unnamed, named);
        },
      },
    ],
  });
}

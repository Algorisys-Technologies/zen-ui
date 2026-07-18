import { RadioGroup, RadioGroupItem, type RadioSize } from "./form/radio/radio-group";
import { DemoPage } from "./demo-helpers";

/**
 * Wraps a RadioGroupItem in a <label> with its text, the shape every section
 * uses. A button is a labelable element, so clicking the text selects the radio
 * without a `for`/`id` pair.
 */
function option(
  item: { el: HTMLElement },
  text: string,
  opts: { row?: boolean; muted?: boolean } = {},
): HTMLLabelElement {
  const label = document.createElement("label");
  label.style.display = opts.row ? "inline-flex" : "flex";
  label.style.alignItems = "center";
  label.style.gap = "8px";
  label.style.fontSize = "0.875rem";
  if (opts.muted) label.style.color = "var(--zen-color-muted-fg)";
  const span = document.createElement("span");
  span.textContent = text;
  label.append(item.el, span);
  return label;
}

export default function RadioGroupDemo(): HTMLElement {
  return DemoPage({
    title: "RadioGroup",
    description:
      "Mutually-exclusive selection. Radix supplied roving tabindex, arrow-key navigation, ARIA and form submission; here the group owns all of it and reaches its items by scanning the DOM subtree it was handed, so the item stays inert markup and the caller keeps React's compound shape.",
    sections: [
      {
        title: "1. Basic (controlled)",
        codeTitle: "value + onValueChange",
        code: `let plan = "pro";
const group = RadioGroup({
  value: plan,
  onValueChange: (v) => { plan = v; group.update({ value: v }); },
  children: [
    option(RadioGroupItem({ value: "free" }), "Free"),
    option(RadioGroupItem({ value: "pro" }),  "Pro"),
    option(RadioGroupItem({ value: "team" }), "Team"),
  ],
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.alignItems = "flex-start";
          wrap.style.gap = "0.75rem";

          const readout = document.createElement("span");
          readout.style.fontSize = "0.8125rem";
          readout.style.color = "var(--zen-color-muted-fg)";

          let plan = "pro";
          const group = RadioGroup({
            value: plan,
            onValueChange: (v) => {
              plan = v;
              readout.textContent = `selected: ${plan}`;
              group.update({ value: v });
            },
            children: [
              option(RadioGroupItem({ value: "free" }), "Free"),
              option(RadioGroupItem({ value: "pro" }), "Pro"),
              option(RadioGroupItem({ value: "team" }), "Team"),
            ],
          });
          readout.textContent = `selected: ${plan}`;
          wrap.append(group.el, readout);
          return wrap;
        },
      },
      {
        title: "2. Uncontrolled",
        codeTitle: "defaultValue",
        code: `RadioGroup({
  defaultValue: "b",
  children: [
    option(RadioGroupItem({ value: "a" }), "A"),
    option(RadioGroupItem({ value: "b" }), "B"),
  ],
})`,
        render: () =>
          RadioGroup({
            defaultValue: "b",
            children: [
              option(RadioGroupItem({ value: "a" }), "A"),
              option(RadioGroupItem({ value: "b" }), "B"),
            ],
          }).el,
      },
      {
        title: "3. Sizes",
        codeTitle: "size sm · md · lg on RadioGroupItem",
        code: `RadioGroup({
  defaultValue: "b",
  style: { display: "flex", flexDirection: "row", gap: "0.75rem" },
  children: [
    RadioGroupItem({ size: "sm", value: "a" }),
    RadioGroupItem({ size: "md", value: "b" }),
    RadioGroupItem({ size: "lg", value: "c" }),
  ],
})`,
        render: () =>
          RadioGroup({
            defaultValue: "b",
            style: { display: "flex", flexDirection: "row", gap: "0.75rem", alignItems: "center" },
            children: (["sm", "md", "lg"] as RadioSize[]).map((size, i) =>
              RadioGroupItem({ size, value: ["a", "b", "c"][i] }).el,
            ),
          }).el,
      },
      {
        title: "4. Horizontal layout",
        codeTitle: "Override the default grid gap with a row layout",
        code: `RadioGroup({
  defaultValue: "opt2",
  style: { display: "flex", flexDirection: "row", gap: "1rem" },
  children: [
    option(RadioGroupItem({ value: "opt1" }), "Option 1", { row: true }),
    option(RadioGroupItem({ value: "opt2" }), "Option 2", { row: true }),
    option(RadioGroupItem({ value: "opt3" }), "Option 3", { row: true }),
  ],
})`,
        render: () =>
          RadioGroup({
            defaultValue: "opt2",
            style: { display: "flex", flexDirection: "row", gap: "1rem" },
            children: [
              option(RadioGroupItem({ value: "opt1" }), "Option 1", { row: true }),
              option(RadioGroupItem({ value: "opt2" }), "Option 2", { row: true }),
              option(RadioGroupItem({ value: "opt3" }), "Option 3", { row: true }),
            ],
          }).el,
      },
      {
        title: "5. Disabled options",
        codeTitle: "Per-item disabled prop",
        code: `RadioGroup({
  defaultValue: "a",
  children: [
    option(RadioGroupItem({ value: "a" }), "Available"),
    option(RadioGroupItem({ value: "locked", disabled: true }), "Locked"),
  ],
})`,
        render: () =>
          RadioGroup({
            defaultValue: "a",
            children: [
              option(RadioGroupItem({ value: "a" }), "Available"),
              option(RadioGroupItem({ value: "locked", disabled: true }), "Locked", { muted: true }),
            ],
          }).el,
      },
      {
        title: "6. Form submission",
        codeTitle: "name on RadioGroup serializes to a single FormData entry",
        code: `const form = document.createElement("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget as HTMLFormElement);
  alert("priority = " + fd.get("priority"));
});
form.append(
  RadioGroup({
    name: "priority",
    defaultValue: "medium",
    style: { display: "flex", flexDirection: "row", gap: "0.75rem" },
    children: [
      option(RadioGroupItem({ value: "low" }),    "Low",    { row: true }),
      option(RadioGroupItem({ value: "medium" }), "Medium", { row: true }),
      option(RadioGroupItem({ value: "high" }),   "High",   { row: true }),
    ],
  }).el,
);`,
        render: () => {
          const form = document.createElement("form");
          form.style.display = "flex";
          form.style.flexDirection = "column";
          form.style.gap = "12px";
          form.addEventListener("submit", (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            alert(`priority = ${fd.get("priority")}`);
          });

          const group = RadioGroup({
            name: "priority",
            defaultValue: "medium",
            style: { display: "flex", flexDirection: "row", gap: "0.75rem" },
            children: [
              option(RadioGroupItem({ value: "low" }), "Low", { row: true }),
              option(RadioGroupItem({ value: "medium" }), "Medium", { row: true }),
              option(RadioGroupItem({ value: "high" }), "High", { row: true }),
            ],
          });

          const submit = document.createElement("button");
          submit.type = "submit";
          submit.textContent = "Submit";
          submit.style.width = "fit-content";
          submit.style.padding = "0.375rem 0.75rem";
          submit.style.background = "var(--zen-color-primary)";
          submit.style.color = "white";
          submit.style.border = "0";
          submit.style.borderRadius = "6px";
          submit.style.cursor = "pointer";
          submit.style.fontSize = "0.8125rem";

          form.append(group.el, submit);
          return form;
        },
      },
    ],
  });
}

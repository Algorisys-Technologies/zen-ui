import { Checkbox, type CheckedState } from "./form/checkbox/checkbox";
import { DemoPage } from "./demo-helpers";

const TOPICS = ["Updates", "Promotions", "Security"] as const;

/** An inline-flex `<label>` wrapping a control and its text, like the React demo. */
const labelRow = (control: Node, text: string, bold = false): HTMLLabelElement => {
  const l = document.createElement("label");
  l.style.display = "inline-flex";
  l.style.alignItems = "center";
  l.style.gap = "8px";
  const t = document.createElement(bold ? "strong" : "span");
  t.textContent = text;
  l.append(control, t);
  return l;
};

export default function CheckboxDemo(): HTMLElement {
  return DemoPage({
    title: "Checkbox",
    description:
      'Tri-state (true / false / "indeterminate") with a single prop — no DOM ref-poking. The visible control is a <button role="checkbox">; a visually-hidden native input rides alongside so name/value reach a form. Keyboard (Space toggles, Enter is swallowed) and ARIA are hand-written here, not Radix.',
    sections: [
      {
        title: "1. Basic (controlled)",
        codeTitle: "checked + onCheckedChange",
        code: `let agreed = false;
const cb = Checkbox({
  checked: agreed,
  onCheckedChange: (v) => cb.update({ checked: (agreed = v === true) }),
});`,
        render: () => {
          let agreed: CheckedState = false;
          const cb = Checkbox({
            checked: agreed,
            onCheckedChange: (v) => cb.update({ checked: (agreed = v === true) }),
          });
          const row = labelRow(cb.el, "I agree to the terms");
          row.style.fontSize = "0.875rem";
          return row;
        },
      },
      {
        title: "2. Uncontrolled",
        codeTitle: "defaultChecked",
        code: `Checkbox({ defaultChecked: true })`,
        render: () => Checkbox({ defaultChecked: true }).el,
      },
      {
        title: "3. Sizes",
        codeTitle: "sm · md · lg",
        code: `Checkbox({ size: "sm", defaultChecked: true })
Checkbox({ size: "md", defaultChecked: true })
Checkbox({ size: "lg", defaultChecked: true })`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.gap = "12px";
          row.append(
            Checkbox({ size: "sm", defaultChecked: true }).el,
            Checkbox({ size: "md", defaultChecked: true }).el,
            Checkbox({ size: "lg", defaultChecked: true }).el,
          );
          return row;
        },
      },
      {
        title: "4. Disabled",
        codeTitle: "disabled prop",
        code: `Checkbox({ disabled: true })
Checkbox({ disabled: true, defaultChecked: true })
Checkbox({ disabled: true, checked: "indeterminate" })`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.gap = "12px";
          row.append(
            Checkbox({ disabled: true }).el,
            Checkbox({ disabled: true, defaultChecked: true }).el,
            Checkbox({ disabled: true, checked: "indeterminate" }).el,
          );
          return row;
        },
      },
      {
        title: "5. Indeterminate / parent-child pattern",
        description:
          "Parent checkbox is true / false / indeterminate based on children. Toggling parent flips all children.",
        codeTitle: 'checked="indeterminate" — tri-state with a single prop',
        code: `const all = selected.length === topics.length;
const some = selected.length > 0 && !all;
const parent = all ? true : some ? "indeterminate" : false;

Checkbox({
  checked: parent,
  onCheckedChange: (v) => setSelected(v === true ? topics : []),
})`,
        render: () => {
          let selected: string[] = ["Updates"];

          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";
          wrap.style.fontSize = "0.875rem";

          const parentCb = Checkbox({ checked: parentState() });
          const parentRow = labelRow(parentCb.el, "All topics", true);

          const children = document.createElement("div");
          children.style.display = "flex";
          children.style.flexDirection = "column";
          children.style.gap = "6px";
          children.style.paddingLeft = "1.5rem";

          const childCbs = TOPICS.map((t) => {
            const cb = Checkbox({
              checked: selected.includes(t),
              onCheckedChange: (v) => {
                selected = v === true ? [...selected, t] : selected.filter((x) => x !== t);
                sync();
              },
            });
            children.append(labelRow(cb.el, t));
            return { t, cb };
          });

          parentCb.update({
            onCheckedChange: (v) => {
              selected = v === true ? [...TOPICS] : [];
              sync();
            },
          });

          function parentState(): CheckedState {
            const all = selected.length === TOPICS.length;
            const some = selected.length > 0 && !all;
            return all ? true : some ? "indeterminate" : false;
          }

          function sync() {
            parentCb.update({ checked: parentState() });
            for (const { t, cb } of childCbs) cb.update({ checked: selected.includes(t) });
          }

          wrap.append(parentRow, children);
          return wrap;
        },
      },
      {
        title: "6. Custom colors via class",
        codeTitle: "Override the checked-state colors with utility classes",
        code: `Checkbox({
  defaultChecked: true,
  class: "data-[state=checked]:zen-bg-zen-success data-[state=checked]:zen-border-zen-success",
})`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.gap = "12px";
          row.append(
            Checkbox({ defaultChecked: true, class: "data-[state=checked]:zen-bg-zen-success data-[state=checked]:zen-border-zen-success" }).el,
            Checkbox({ defaultChecked: true, class: "data-[state=checked]:zen-bg-zen-warning data-[state=checked]:zen-border-zen-warning" }).el,
            Checkbox({ defaultChecked: true, class: "data-[state=checked]:zen-bg-zen-error data-[state=checked]:zen-border-zen-error" }).el,
          );
          return row;
        },
      },
      {
        title: "7. Form submission",
        codeTitle: "name + value participate in a native form",
        code: `const form = document.createElement("form");
form.append(
  Checkbox({ name: "interests", value: "design" }).el,
  Checkbox({ name: "interests", value: "dev" }).el,
);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  alert(fd.getAll("interests").join(", "));
});`,
        render: () => {
          const form = document.createElement("form");
          form.style.display = "flex";
          form.style.alignItems = "center";
          form.style.gap = "0.75rem";
          form.style.fontSize = "0.875rem";

          const design = labelRow(Checkbox({ name: "interests", value: "design" }).el, "Design");
          design.style.gap = "6px";
          const dev = labelRow(Checkbox({ name: "interests", value: "dev" }).el, "Dev");
          dev.style.gap = "6px";

          const submit = document.createElement("button");
          submit.type = "submit";
          submit.textContent = "Submit";
          submit.style.padding = "0.375rem 0.75rem";
          submit.style.background = "var(--zen-color-primary)";
          submit.style.color = "white";
          submit.style.border = "0";
          submit.style.borderRadius = "6px";
          submit.style.cursor = "pointer";
          submit.style.fontSize = "0.8125rem";

          form.addEventListener("submit", (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            alert(`interests = ${fd.getAll("interests").join(", ") || "(none)"}`);
          });

          form.append(design, dev, submit);
          return form;
        },
      },
    ],
  });
}

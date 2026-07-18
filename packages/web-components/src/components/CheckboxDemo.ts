import { DemoPage } from "./demo-helpers";

/**
 * Checkbox demo — the web-components port. <zen-checkbox> is tri-state
 * (true / false / "indeterminate"): `checked` is a JS property (a boolean
 * attribute could only add presence), while `default-checked` seeds the
 * uncontrolled case. It fires `zen-checked-change` with the new state; a
 * visually-hidden native input rides alongside so name/value reach a form.
 */

type CheckedState = boolean | "indeterminate";

const TOPICS = ["Updates", "Promotions", "Security"] as const;

type ZenCheckbox = HTMLElement & { checked: CheckedState };

function checkbox(attrs: Record<string, string> = {}): ZenCheckbox {
  const c = document.createElement("zen-checkbox") as ZenCheckbox;
  for (const [k, v] of Object.entries(attrs)) c.setAttribute(k, v);
  return c;
}

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
        codeTitle: "checked + zen-checked-change",
        code: `<zen-checkbox></zen-checkbox>

const cb = document.querySelector("zen-checkbox");
cb.checked = false;
cb.addEventListener("zen-checked-change", (e) => { cb.checked = e.detail === true; });`,
        render: () => {
          const cb = checkbox();
          cb.checked = false;
          cb.addEventListener("zen-checked-change", (e) => {
            cb.checked = (e as CustomEvent).detail === true;
          });
          const row = labelRow(cb, "I agree to the terms");
          row.style.fontSize = "0.875rem";
          return row;
        },
      },
      {
        title: "2. Uncontrolled",
        codeTitle: "default-checked",
        code: `<zen-checkbox default-checked></zen-checkbox>`,
        render: () => checkbox({ "default-checked": "" }),
      },
      {
        title: "3. Sizes",
        codeTitle: "sm · md · lg",
        code: `<zen-checkbox size="sm" default-checked></zen-checkbox>
<zen-checkbox size="md" default-checked></zen-checkbox>
<zen-checkbox size="lg" default-checked></zen-checkbox>`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.gap = "12px";
          row.append(
            checkbox({ size: "sm", "default-checked": "" }),
            checkbox({ size: "md", "default-checked": "" }),
            checkbox({ size: "lg", "default-checked": "" }),
          );
          return row;
        },
      },
      {
        title: "4. Disabled",
        codeTitle: "disabled",
        code: `<zen-checkbox disabled></zen-checkbox>
<zen-checkbox disabled default-checked></zen-checkbox>
<zen-checkbox disabled></zen-checkbox>   // el.checked = "indeterminate"`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.gap = "12px";
          const indet = checkbox({ disabled: "" });
          indet.checked = "indeterminate";
          row.append(checkbox({ disabled: "" }), checkbox({ disabled: "", "default-checked": "" }), indet);
          return row;
        },
      },
      {
        title: "5. Indeterminate / parent-child pattern",
        description:
          "Parent checkbox is true / false / indeterminate based on children. Toggling parent flips all children.",
        codeTitle: 'checked = "indeterminate" — tri-state with a single prop',
        code: `const all = selected.length === topics.length;
const some = selected.length > 0 && !all;
parent.checked = all ? true : some ? "indeterminate" : false;

parent.addEventListener("zen-checked-change", (e) => {
  setSelected(e.detail === true ? topics : []);
});`,
        render: () => {
          let selected: string[] = ["Updates"];

          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";
          wrap.style.fontSize = "0.875rem";

          function parentState(): CheckedState {
            const all = selected.length === TOPICS.length;
            const some = selected.length > 0 && !all;
            return all ? true : some ? "indeterminate" : false;
          }

          const parentCb = checkbox();
          parentCb.checked = parentState();
          const parentRow = labelRow(parentCb, "All topics", true);

          const childrenBox = document.createElement("div");
          childrenBox.style.display = "flex";
          childrenBox.style.flexDirection = "column";
          childrenBox.style.gap = "6px";
          childrenBox.style.paddingLeft = "1.5rem";

          const childCbs = TOPICS.map((t) => {
            const cb = checkbox();
            cb.checked = selected.includes(t);
            cb.addEventListener("zen-checked-change", (e) => {
              const v = (e as CustomEvent).detail as CheckedState;
              selected = v === true ? [...selected, t] : selected.filter((x) => x !== t);
              sync();
            });
            childrenBox.append(labelRow(cb, t));
            return { t, cb };
          });

          parentCb.addEventListener("zen-checked-change", (e) => {
            const v = (e as CustomEvent).detail as CheckedState;
            selected = v === true ? [...TOPICS] : [];
            sync();
          });

          function sync(): void {
            parentCb.checked = parentState();
            for (const { t, cb } of childCbs) cb.checked = selected.includes(t);
          }

          wrap.append(parentRow, childrenBox);
          return wrap;
        },
      },
      {
        title: "6. Custom colors via class",
        codeTitle: "Override the checked-state colors with utility classes",
        codeDescription:
          "NOTE: the class currently lands on the <zen-checkbox> host, not the inner box the factory renders (the descriptor forwards no `class` prop), so the recolour may not fully apply in this binding.",
        code: `<zen-checkbox default-checked
  class="data-[state=checked]:zen-bg-zen-success data-[state=checked]:zen-border-zen-success">
</zen-checkbox>`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.gap = "12px";
          row.append(
            checkbox({ "default-checked": "", class: "data-[state=checked]:zen-bg-zen-success data-[state=checked]:zen-border-zen-success" }),
            checkbox({ "default-checked": "", class: "data-[state=checked]:zen-bg-zen-warning data-[state=checked]:zen-border-zen-warning" }),
            checkbox({ "default-checked": "", class: "data-[state=checked]:zen-bg-zen-error data-[state=checked]:zen-border-zen-error" }),
          );
          return row;
        },
      },
      {
        title: "7. Form submission",
        codeTitle: "name + value participate in a native form",
        code: `<form>
  <zen-checkbox name="interests" value="design"></zen-checkbox>
  <zen-checkbox name="interests" value="dev"></zen-checkbox>
</form>

form.addEventListener("submit", (e) => {
  e.preventDefault();
  new FormData(form).getAll("interests");   // ["design", …]
});`,
        render: () => {
          const form = document.createElement("form");
          form.style.display = "flex";
          form.style.alignItems = "center";
          form.style.gap = "0.75rem";
          form.style.fontSize = "0.875rem";

          const design = labelRow(checkbox({ name: "interests", value: "design" }), "Design");
          design.style.gap = "6px";
          const dev = labelRow(checkbox({ name: "interests", value: "dev" }), "Dev");
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

import { Switch } from "./form/switch/switch";
import { DemoPage } from "./demo-helpers";

/**
 * Mirrors packages/react/src/components/NewSwitchDemo.tsx — same seven sections,
 * same behaviour, in the vanilla factory idiom.
 */
export default function SwitchDemo(): HTMLElement {
  return DemoPage({
    title: "Switch",
    description:
      "Boolean toggle. A native <button role=\"switch\"> gives space & enter for free; controlled / uncontrolled state, aria-checked, and form submission via name/value are written out — the last through a hidden checkbox, exactly as Radix bubbles internally.",
    sections: [
      {
        title: "1. Basic (controlled)",
        codeTitle: "checked + onCheckedChange",
        code: `let enabled = false;
const s = Switch({
  checked: enabled,
  onCheckedChange: (v) => { enabled = v; s.update({ checked: v }); },
});`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "inline-flex";
          row.style.alignItems = "center";

          const readout = document.createElement("span");
          readout.style.marginLeft = "0.75rem";
          readout.style.fontSize = "0.8125rem";
          readout.style.color = "var(--zen-color-muted-fg)";
          readout.textContent = "Off";

          let enabled = false;
          const s = Switch({
            checked: enabled,
            onCheckedChange: (v) => {
              enabled = v;
              s.update({ checked: v });
              readout.textContent = v ? "On" : "Off";
            },
          });

          row.append(s.el, readout);
          return row;
        },
      },
      {
        title: "2. Uncontrolled with defaultChecked",
        codeTitle: "Internal state",
        code: `Switch({ defaultChecked: true })`,
        render: () => Switch({ defaultChecked: true }).el,
      },
      {
        title: "3. Sizes",
        codeTitle: "sm · md · lg",
        code: `Switch({ size: "sm", defaultChecked: true })
Switch({ size: "md", defaultChecked: true })
Switch({ size: "lg", defaultChecked: true })`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "inline-flex";
          row.style.alignItems = "center";
          row.style.gap = "0.75rem";
          row.append(
            Switch({ size: "sm", defaultChecked: true }).el,
            Switch({ size: "md", defaultChecked: true }).el,
            Switch({ size: "lg", defaultChecked: true }).el,
          );
          return row;
        },
      },
      {
        title: "4. With label",
        codeTitle: "Wrap in a native <label> for proper a11y",
        codeDescription:
          "The switch is keyboard-focusable; pairing it with a label gives click-to-toggle behaviour and screen-reader text.",
        code: `const label = document.createElement("label");
label.style.display = "inline-flex";
label.style.alignItems = "center";
label.style.gap = "8px";

const s = Switch({ defaultChecked: true });
const text = document.createElement("span");
text.textContent = "Autosave drafts";
label.append(s.el, text);`,
        render: () => {
          const label = document.createElement("label");
          label.style.display = "inline-flex";
          label.style.alignItems = "center";
          label.style.gap = "8px";
          label.style.fontSize = "0.875rem";

          const s = Switch({ defaultChecked: true });
          const text = document.createElement("span");
          text.textContent = "Autosave drafts";
          label.append(s.el, text);
          return label;
        },
      },
      {
        title: "5. Disabled",
        codeTitle: "disabled prop",
        code: `Switch({ disabled: true })
Switch({ disabled: true, defaultChecked: true })`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "inline-flex";
          row.style.alignItems = "center";
          row.style.gap = "0.75rem";
          row.append(
            Switch({ disabled: true }).el,
            Switch({ disabled: true, defaultChecked: true }).el,
          );
          return row;
        },
      },
      {
        title: "6. Custom colors via class",
        codeTitle: "Override token defaults with utility classes",
        code: `Switch({ defaultChecked: true, class: "data-[state=checked]:zen-bg-zen-success" })
Switch({ defaultChecked: true, class: "data-[state=checked]:zen-bg-zen-error" })
Switch({ defaultChecked: true, class: "data-[state=checked]:zen-bg-zen-warning" })`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "inline-flex";
          row.style.alignItems = "center";
          row.style.gap = "0.75rem";
          row.append(
            Switch({ defaultChecked: true, class: "data-[state=checked]:zen-bg-zen-success" }).el,
            Switch({ defaultChecked: true, class: "data-[state=checked]:zen-bg-zen-error" }).el,
            Switch({ defaultChecked: true, class: "data-[state=checked]:zen-bg-zen-warning" }).el,
          );
          return row;
        },
      },
      {
        title: "7. Form submission",
        codeTitle: "name + value lets Switch participate in a native form",
        codeDescription:
          "Switch mounts a hidden checkbox internally so the form submission includes its state.",
        code: `const form = document.createElement("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  alert("notifications = " + (fd.get("notifications") || "(unchecked)"));
});
form.append(Switch({ name: "notifications", value: "on", defaultChecked: true }).el);`,
        render: () => {
          const form = document.createElement("form");
          form.style.display = "inline-flex";
          form.style.alignItems = "center";
          form.style.gap = "0.75rem";

          const label = document.createElement("label");
          label.style.display = "inline-flex";
          label.style.alignItems = "center";
          label.style.gap = "8px";
          label.style.fontSize = "0.875rem";
          const s = Switch({ name: "notifications", value: "on", defaultChecked: true });
          const text = document.createElement("span");
          text.textContent = "Email notifications";
          label.append(s.el, text);

          const submit = document.createElement("button");
          submit.type = "submit";
          submit.textContent = "Submit";
          Object.assign(submit.style, {
            padding: "0.375rem 0.75rem",
            background: "var(--zen-color-primary)",
            color: "white",
            border: "0",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.8125rem",
          });

          form.addEventListener("submit", (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            alert(`notifications = ${fd.get("notifications") || "(unchecked)"}`);
          });

          form.append(label, submit);
          return form;
        },
      },
    ],
  });
}

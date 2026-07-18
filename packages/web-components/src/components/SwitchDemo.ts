import { DemoPage } from "./demo-helpers";

/**
 * Mirrors the vanilla SwitchDemo, rendered through the <zen-switch> custom element.
 * `checked` is a controlled JS property; `default-checked`, `size`, `disabled`,
 * `name` and `value` are attributes. onCheckedChange maps to the `zen-checked-change`
 * CustomEvent (detail is the new boolean).
 */
function el(
  tag: string,
  attrs: Record<string, string | number | boolean> = {},
  text?: string,
): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false) continue;
    n.setAttribute(k, v === true ? "" : String(v));
  }
  if (text != null) n.textContent = text;
  return n;
}

export default function SwitchDemo(): HTMLElement {
  return DemoPage({
    title: "Switch",
    description:
      "Boolean toggle. A native <button role=\"switch\"> gives space & enter for free; controlled / uncontrolled state, aria-checked, and form submission via name/value are written out — the last through a hidden checkbox, exactly as Radix bubbles internally.",
    sections: [
      {
        title: "1. Basic (controlled)",
        codeTitle: "checked property + zen-checked-change",
        code: `const s = document.createElement("zen-switch");
s.checked = false;
s.addEventListener("zen-checked-change", (e) => {
  s.checked = e.detail;   // stay controlled
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

          const s = el("zen-switch");
          (s as unknown as { checked: boolean }).checked = false;
          s.addEventListener("zen-checked-change", (e) => {
            const v = (e as CustomEvent<boolean>).detail;
            (s as unknown as { checked: boolean }).checked = v;
            readout.textContent = v ? "On" : "Off";
          });

          row.append(s, readout);
          return row;
        },
      },
      {
        title: "2. Uncontrolled with defaultChecked",
        codeTitle: "Internal state",
        code: `<zen-switch default-checked></zen-switch>`,
        render: () => el("zen-switch", { "default-checked": true }),
      },
      {
        title: "3. Sizes",
        codeTitle: "sm · md · lg",
        code: `<zen-switch size="sm" default-checked></zen-switch>
<zen-switch size="md" default-checked></zen-switch>
<zen-switch size="lg" default-checked></zen-switch>`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "inline-flex";
          row.style.alignItems = "center";
          row.style.gap = "0.75rem";
          row.append(
            el("zen-switch", { size: "sm", "default-checked": true }),
            el("zen-switch", { size: "md", "default-checked": true }),
            el("zen-switch", { size: "lg", "default-checked": true }),
          );
          return row;
        },
      },
      {
        title: "4. With label",
        codeTitle: "Wrap in a native <label> for proper a11y",
        codeDescription:
          "The switch is keyboard-focusable; pairing it with a label gives click-to-toggle behaviour and screen-reader text.",
        code: `<label style="display:inline-flex;align-items:center;gap:8px">
  <zen-switch default-checked></zen-switch>
  <span>Autosave drafts</span>
</label>`,
        render: () => {
          const label = document.createElement("label");
          label.style.display = "inline-flex";
          label.style.alignItems = "center";
          label.style.gap = "8px";
          label.style.fontSize = "0.875rem";

          const text = document.createElement("span");
          text.textContent = "Autosave drafts";
          label.append(el("zen-switch", { "default-checked": true }), text);
          return label;
        },
      },
      {
        title: "5. Disabled",
        codeTitle: "disabled attribute",
        code: `<zen-switch disabled></zen-switch>
<zen-switch disabled default-checked></zen-switch>`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "inline-flex";
          row.style.alignItems = "center";
          row.style.gap = "0.75rem";
          row.append(
            el("zen-switch", { disabled: true }),
            el("zen-switch", { disabled: true, "default-checked": true }),
          );
          return row;
        },
      },
      {
        title: "6. Custom colors via class",
        codeTitle: "Override token defaults with utility classes",
        codeDescription:
          "The rendered <button role=switch> carries the utility classes; set them on the element to tint the checked track.",
        code: `<zen-switch default-checked
  class="data-[state=checked]:zen-bg-zen-success"></zen-switch>
<zen-switch default-checked
  class="data-[state=checked]:zen-bg-zen-error"></zen-switch>
<zen-switch default-checked
  class="data-[state=checked]:zen-bg-zen-warning"></zen-switch>`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "inline-flex";
          row.style.alignItems = "center";
          row.style.gap = "0.75rem";
          row.append(
            el("zen-switch", {
              "default-checked": true,
              class: "data-[state=checked]:zen-bg-zen-success",
            }),
            el("zen-switch", {
              "default-checked": true,
              class: "data-[state=checked]:zen-bg-zen-error",
            }),
            el("zen-switch", {
              "default-checked": true,
              class: "data-[state=checked]:zen-bg-zen-warning",
            }),
          );
          return row;
        },
      },
      {
        title: "7. Form submission",
        codeTitle: "name + value lets Switch participate in a native form",
        codeDescription:
          "Switch mounts a hidden checkbox internally so the form submission includes its state.",
        code: `<form>
  <label>
    <zen-switch name="notifications" value="on" default-checked></zen-switch>
    Email notifications
  </label>
  <button type="submit">Submit</button>
</form>`,
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
          const text = document.createElement("span");
          text.textContent = "Email notifications";
          label.append(
            el("zen-switch", { name: "notifications", value: "on", "default-checked": true }),
            text,
          );

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

import { DemoPage } from "./demo-helpers";

/**
 * Mirrors the vanilla TimePickerDemo, rendered through <zen-time-picker>. Every
 * prop is a plain attribute (value, default-value, format, show-seconds,
 * minute-step, disabled, read-only, name); onValueChange maps to zen-value-change,
 * whose detail is the 24-hour "HH:MM" / "HH:MM:SS" string (or undefined when empty).
 */
function el(
  tag: string,
  attrs: Record<string, string | number | boolean> = {},
): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false) continue;
    n.setAttribute(k, v === true ? "" : String(v));
  }
  return n;
}

export default function TimePickerDemo(): HTMLElement {
  return DemoPage({
    title: "TimePicker",
    description:
      "Segmented numeric time input — hour / minute / optional seconds, with an optional AM/PM toggle. Type two digits and the focus auto-advances; arrow keys step values with wrap. The emitted value is always 24-hour HH:MM (or HH:MM:SS) regardless of display format, so it round-trips cleanly with Zod / a backend that expects ISO time strings.",
    sections: [
      {
        title: "1. Default — 24-hour, HH:MM",
        codeTitle: "Uncontrolled",
        code: `<zen-time-picker default-value="09:30"></zen-time-picker>`,
        render: () => el("zen-time-picker", { "default-value": "09:30" }),
      },
      {
        title: "2. Controlled",
        codeTitle: "value + zen-value-change",
        code: `const tp = document.createElement("zen-time-picker");
tp.addEventListener("zen-value-change", (e) => {
  if (e.detail) tp.setAttribute("value", e.detail);
  else tp.removeAttribute("value");
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";

          let time: string | undefined;
          const status = document.createElement("p");
          status.className = "zen-text-xs zen-text-zen-muted-fg zen-m-0";
          const setStatus = () => {
            status.textContent = "";
            const code = document.createElement("code");
            code.textContent = time ?? "(empty)";
            status.append(document.createTextNode("Value: "), code);
          };

          const tp = el("zen-time-picker");
          tp.addEventListener("zen-value-change", (e) => {
            time = (e as CustomEvent<string | undefined>).detail;
            if (time) tp.setAttribute("value", time);
            else tp.removeAttribute("value");
            setStatus();
          });
          setStatus();
          wrap.append(tp, status);
          return wrap;
        },
      },
      {
        title: "3. 12-hour with AM/PM",
        codeTitle: 'format="12h" — display only; emitted value is still 24h',
        codeDescription: "Press A or P (or arrow keys / space) on the AM/PM segment to toggle.",
        code: `<zen-time-picker format="12h" default-value="14:45"></zen-time-picker>`,
        render: () => el("zen-time-picker", { format: "12h", "default-value": "14:45" }),
      },
      {
        title: "4. With seconds",
        codeTitle: "show-seconds — HH:MM:SS",
        code: `<zen-time-picker show-seconds default-value="08:15:30"></zen-time-picker>`,
        render: () => el("zen-time-picker", { "show-seconds": true, "default-value": "08:15:30" }),
      },
      {
        title: "5. Minute stepping",
        codeTitle: "minute-step=15 — ArrowUp/Down jumps by 15",
        codeDescription: "Useful for appointment booking where slots are quantized.",
        code: `<zen-time-picker minute-step="15" default-value="10:00"></zen-time-picker>`,
        render: () => el("zen-time-picker", { "minute-step": 15, "default-value": "10:00" }),
      },
      {
        title: "6. Read-only / disabled",
        codeTitle: "Display existing values or lock the control",
        code: `<zen-time-picker value="07:00" read-only></zen-time-picker>
<zen-time-picker value="07:00" disabled></zen-time-picker>`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "14px";
          row.append(
            el("zen-time-picker", { value: "07:00", "read-only": true }),
            el("zen-time-picker", { value: "07:00", disabled: true }),
          );
          return row;
        },
      },
      {
        title: "7. Native form submission",
        codeTitle: 'name="meeting_time" — value posts as a hidden input',
        code: `<form>
  <zen-time-picker name="meeting_time" default-value="13:30"></zen-time-picker>
  <button type="submit">Submit</button>
</form>`,
        render: () => {
          const form = document.createElement("form");
          form.style.display = "flex";
          form.style.gap = "8px";
          form.style.alignItems = "center";
          form.addEventListener("submit", (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            alert(`meeting_time = ${fd.get("meeting_time") || "(empty)"}`);
          });

          const submit = document.createElement("button");
          submit.type = "submit";
          submit.textContent = "Submit";
          submit.style.padding = "0.375rem 0.75rem";
          submit.style.background = "var(--zen-color-primary)";
          submit.style.color = "white";
          submit.style.border = "0";
          submit.style.borderRadius = "6px";
          submit.style.cursor = "pointer";

          form.append(
            el("zen-time-picker", { name: "meeting_time", "default-value": "13:30" }),
            submit,
          );
          return form;
        },
      },
    ],
  });
}

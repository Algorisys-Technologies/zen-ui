import { TimePicker } from "./form/time-picker/time-picker";
import { DemoPage } from "./demo-helpers";

export default function TimePickerDemo(): HTMLElement {
  return DemoPage({
    title: "TimePicker",
    description:
      "Segmented numeric time input — hour / minute / optional seconds, with an optional AM/PM toggle. Type two digits and the focus auto-advances; arrow keys step values with wrap. The emitted value is always 24-hour HH:MM (or HH:MM:SS) regardless of display format, so it round-trips cleanly with Zod / a backend that expects ISO time strings.",
    sections: [
      {
        title: "1. Default — 24-hour, HH:MM",
        codeTitle: "Uncontrolled",
        code: `TimePicker({ defaultValue: "09:30" })`,
        render: () => TimePicker({ defaultValue: "09:30" }).el,
      },
      {
        title: "2. Controlled",
        codeTitle: "value + onValueChange",
        code: `let time;
const status = document.createElement("p");
const tp = TimePicker({
  value: time,
  onValueChange: (v) => {
    time = v;
    tp.update({ value: time });
    status.textContent = "Value: " + (time ?? "(empty)");
  },
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
            const label = document.createTextNode("Value: ");
            const code = document.createElement("code");
            code.textContent = time ?? "(empty)";
            status.append(label, code);
          };

          const tp = TimePicker({
            value: time,
            onValueChange: (v) => {
              time = v;
              tp.update({ value: time });
              setStatus();
            },
          });
          setStatus();
          wrap.append(tp.el, status);
          return wrap;
        },
      },
      {
        title: "3. 12-hour with AM/PM",
        codeTitle: 'format="12h" — display only; emitted value is still 24h',
        codeDescription: "Press A or P (or arrow keys / space) on the AM/PM segment to toggle.",
        code: `TimePicker({ format: "12h", defaultValue: "14:45" })`,
        render: () => TimePicker({ format: "12h", defaultValue: "14:45" }).el,
      },
      {
        title: "4. With seconds",
        codeTitle: "showSeconds — HH:MM:SS",
        code: `TimePicker({ showSeconds: true, defaultValue: "08:15:30" })`,
        render: () => TimePicker({ showSeconds: true, defaultValue: "08:15:30" }).el,
      },
      {
        title: "5. Minute stepping",
        codeTitle: "minuteStep: 15 — ArrowUp/Down jumps by 15",
        codeDescription: "Useful for appointment booking where slots are quantized.",
        code: `TimePicker({ minuteStep: 15, defaultValue: "10:00" })`,
        render: () => TimePicker({ minuteStep: 15, defaultValue: "10:00" }).el,
      },
      {
        title: "6. Read-only / disabled",
        codeTitle: "Display existing values or lock the control",
        code: `TimePicker({ value: "07:00", readOnly: true });
TimePicker({ value: "07:00", disabled: true });`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "14px";
          row.append(
            TimePicker({ value: "07:00", readOnly: true }).el,
            TimePicker({ value: "07:00", disabled: true }).el,
          );
          return row;
        },
      },
      {
        title: "7. Native form submission",
        codeTitle: 'name="meeting_time" — value posts as a hidden input',
        code: `const form = document.createElement("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  alert("meeting_time = " + (fd.get("meeting_time") || "(empty)"));
});
form.append(
  TimePicker({ name: "meeting_time", defaultValue: "13:30" }).el,
  submitButton,
);`,
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

          form.append(TimePicker({ name: "meeting_time", defaultValue: "13:30" }).el, submit);
          return form;
        },
      },
    ],
  });
}

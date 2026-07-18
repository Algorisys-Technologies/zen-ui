import { DateTimePicker } from "./form/date-picker/date-time-picker";
import { DemoPage } from "./demo-helpers";

const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function DateTimePickerDemo(): HTMLElement {
  return DemoPage({
    title: "DateTimePicker",
    description:
      "Compound picker for \"when\" questions — a Calendar above the TimePicker, both in one Popover. Picking a day preserves the current time-of-day; picking a time on an empty value defaults the date to today. The emitted value is a real Date, so it round-trips with ISO serialization, date-fns, and form libraries.",
    sections: [
      {
        title: "1. Default — 24-hour",
        codeTitle: "Uncontrolled, starts empty",
        code: `const picker = DateTimePicker();
host.append(picker.el);`,
        render: () => DateTimePicker().el,
      },
      {
        title: "2. Controlled",
        codeTitle: "value + onValueChange",
        code: `let when: Date | undefined;
const picker = DateTimePicker({
  value: when,
  onValueChange: (d) => picker.update({ value: (when = d) }),
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";

          const out = document.createElement("p");
          out.className = "zen-text-xs zen-text-zen-muted-fg zen-m-0";
          const iso = document.createElement("code");
          iso.textContent = "(none)";
          out.append("ISO: ", iso);

          let when: Date | undefined;
          const picker = DateTimePicker({
            value: when,
            onValueChange: (d) => {
              when = d;
              picker.update({ value: when });
              iso.textContent = when?.toISOString() ?? "(none)";
            },
          });

          wrap.append(picker.el, out);
          return wrap;
        },
      },
      {
        title: "3. 12-hour display",
        codeTitle: 'format="12h" — time portion displays AM/PM',
        codeDescription: "Display only — the value is still a normal Date object.",
        code: `DateTimePicker({
  format: "12h",
  defaultValue: new Date(2026, 4, 18, 14, 45),
})`,
        render: () =>
          DateTimePicker({
            format: "12h",
            defaultValue: new Date(2026, 4, 18, 14, 45),
          }).el,
      },
      {
        title: "4. With seconds",
        codeTitle: "showSeconds — granular timestamping",
        code: `DateTimePicker({
  showSeconds: true,
  defaultValue: new Date(2026, 4, 18, 8, 15, 30),
})`,
        render: () =>
          DateTimePicker({
            showSeconds: true,
            defaultValue: new Date(2026, 4, 18, 8, 15, 30),
          }).el,
      },
      {
        title: "5. Quantized minutes — appointment slots",
        codeTitle: "minuteStep: 15",
        codeDescription:
          "ArrowUp/Down on the minutes segment jumps in 15-minute steps — useful for booking calendars.",
        code: `DateTimePicker({ minuteStep: 15, format: "12h" })`,
        render: () => DateTimePicker({ minuteStep: 15, format: "12h" }).el,
      },
      {
        title: "6. Disabled past dates",
        codeTitle: "Disable individual days with a predicate",
        codeDescription:
          "React forwards day-picker's `{ before: new Date() }`; the vanilla API takes a predicate — return true to disable a day.",
        code: `DateTimePicker({
  disabled: (d) => d < startOfToday(),
  format: "12h",
})`,
        render: () =>
          DateTimePicker({
            disabled: (d) => d < startOfToday(),
            format: "12h",
          }).el,
      },
      {
        title: "7. Fully disabled",
        codeTitle: "disabled: true",
        code: `DateTimePicker({ disabled: true, defaultValue: new Date() })`,
        render: () => DateTimePicker({ disabled: true, defaultValue: new Date() }).el,
      },
    ],
  });
}

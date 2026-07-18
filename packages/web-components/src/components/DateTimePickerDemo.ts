import { DemoPage } from "./demo-helpers";

/**
 * DateTimePicker demo — the web-components mirror of the vanilla version. Renders
 * <zen-date-time-picker>; Date values and the `disabled` predicate are JS
 * properties, display flags (format / show-seconds / minute-step) are attributes.
 */

function el(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

const setProp = (node: HTMLElement, name: string, value: unknown): void => {
  (node as unknown as Record<string, unknown>)[name] = value;
};

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
        code: `<zen-date-time-picker></zen-date-time-picker>`,
        render: () => el("zen-date-time-picker"),
      },
      {
        title: "2. Controlled",
        codeTitle: "value + zen-value-change",
        code: `picker.addEventListener("zen-value-change", (e) => {
  when = e.detail;
  picker.value = when;
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

          const picker = el("zen-date-time-picker");
          picker.addEventListener("zen-value-change", (e) => {
            const when = (e as CustomEvent<Date | undefined>).detail;
            setProp(picker, "value", when);
            iso.textContent = when?.toISOString() ?? "(none)";
          });

          wrap.append(picker, out);
          return wrap;
        },
      },
      {
        title: "3. 12-hour display",
        codeTitle: 'format="12h" — time portion displays AM/PM',
        codeDescription: "Display only — the value is still a normal Date object.",
        code: `<zen-date-time-picker format="12h"></zen-date-time-picker>

picker.defaultValue = new Date(2026, 4, 18, 14, 45);`,
        render: () => {
          const picker = el("zen-date-time-picker", { format: "12h" });
          setProp(picker, "defaultValue", new Date(2026, 4, 18, 14, 45));
          return picker;
        },
      },
      {
        title: "4. With seconds",
        codeTitle: "show-seconds — granular timestamping",
        code: `<zen-date-time-picker show-seconds></zen-date-time-picker>

picker.defaultValue = new Date(2026, 4, 18, 8, 15, 30);`,
        render: () => {
          const picker = el("zen-date-time-picker", { "show-seconds": "" });
          setProp(picker, "defaultValue", new Date(2026, 4, 18, 8, 15, 30));
          return picker;
        },
      },
      {
        title: "5. Quantized minutes — appointment slots",
        codeTitle: "minute-step=15",
        codeDescription:
          "ArrowUp/Down on the minutes segment jumps in 15-minute steps — useful for booking calendars.",
        code: `<zen-date-time-picker minute-step="15" format="12h"></zen-date-time-picker>`,
        render: () => el("zen-date-time-picker", { "minute-step": "15", format: "12h" }),
      },
      {
        title: "6. Disabled past dates",
        codeTitle: "Disable individual days with a predicate",
        codeDescription:
          "React forwards day-picker's `{ before: new Date() }`; the vanilla API takes a predicate — return true to disable a day.",
        code: `picker.disabled = (d) => d < startOfToday();`,
        render: () => {
          const picker = el("zen-date-time-picker", { format: "12h" });
          setProp(picker, "disabled", (d: Date) => d < startOfToday());
          return picker;
        },
      },
      {
        title: "7. Fully disabled",
        codeTitle: "disabled",
        code: `<zen-date-time-picker disabled></zen-date-time-picker>

picker.defaultValue = new Date();`,
        render: () => {
          const picker = el("zen-date-time-picker", { disabled: "" });
          setProp(picker, "defaultValue", new Date());
          return picker;
        },
      },
    ],
  });
}

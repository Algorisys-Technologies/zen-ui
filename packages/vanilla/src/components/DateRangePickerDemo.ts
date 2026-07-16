import {
  DateRangePicker,
  type DateRange,
} from "./form/date-picker/date-range-picker";
import { DemoPage } from "./demo-helpers";

/**
 * DateRangePicker demo — mirrors the React NewDateRangePickerDemo: uncontrolled,
 * a controlled booking-style stay, the single-month variant, disabled forms, and
 * plain capture.
 */
export default function DateRangePickerDemo(): HTMLElement {
  return DemoPage({
    title: "DateRangePicker",
    description:
      "Two-month side-by-side calendar in a Popover for picking a { from, to } date pair. Pick an anchor day, then an end day; Done applies the range and closes the popover, Cancel (or Escape / click-outside) discards it. Returns the same DateRange shape as the React binding.",
    sections: [
      {
        title: "1. Uncontrolled",
        codeTitle: "defaultValue + internal state",
        code: `DateRangePicker({
  defaultValue: { from: new Date(2026, 0, 12), to: new Date(2026, 0, 19) },
});`,
        render: () =>
          DateRangePicker({
            defaultValue: {
              from: new Date(2026, 0, 12),
              to: new Date(2026, 0, 19),
            },
          }).el,
      },
      {
        title: "2. Controlled — booking-style stay",
        codeTitle: "value + onValueChange for external state",
        codeDescription:
          "Default stay seeded to 'today through 3 days from now'; pick a different range and the label updates immediately.",
        code: `let stay = { from: today, to: today + 3 days };

const picker = DateRangePicker({
  value: stay,
  onValueChange: (r) => { stay = r; picker.update({ value: r }); },
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";

          const today = new Date();
          const checkout = new Date(today);
          checkout.setDate(today.getDate() + 3);
          let stay: DateRange | undefined = { from: today, to: checkout };

          const info = document.createElement("p");
          info.className = "zen-text-xs zen-text-zen-muted-fg zen-m-0";

          const paint = () => {
            if (stay?.from && stay?.to) {
              const nights = Math.round(
                (stay.to.getTime() - stay.from.getTime()) / 86_400_000,
              );
              info.textContent = `Selected stay: ${stay.from
                .toISOString()
                .slice(0, 10)} → ${stay.to
                .toISOString()
                .slice(0, 10)} (${nights} nights)`;
            } else {
              info.textContent = "Pick a range";
            }
          };

          const picker = DateRangePicker({
            value: stay,
            onValueChange: (r) => {
              stay = r;
              picker.update({ value: r });
              paint();
            },
          });

          paint();
          wrap.append(picker.el, info);
          return wrap;
        },
      },
      {
        title: "3. Single-month variant",
        codeTitle: "numberOfMonths: 1 for narrow layouts",
        codeDescription:
          "Default is 2 months — the conventional Airbnb / Booking layout. Drop to 1 when the popover doesn't have room (mobile, narrow side panels).",
        code: `DateRangePicker({ numberOfMonths: 1 });`,
        render: () => DateRangePicker({ numberOfMonths: 1 }).el,
      },
      {
        title: "4. Disabled",
        codeTitle: "Disable the whole trigger or specific days",
        codeDescription:
          "Pass disabled: true to lock the trigger; pass a predicate and those specific days are disabled while the popover stays open.",
        code: `// Whole trigger disabled
DateRangePicker({ disabled: true, placeholder: "Locked" });

// Disable weekends
DateRangePicker({
  defaultValue: { from: new Date() },
  disabled: (d) => d.getDay() === 0 || d.getDay() === 6,
});`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "12px";
          row.style.flexWrap = "wrap";
          row.append(
            DateRangePicker({ disabled: true, placeholder: "Locked" }).el,
            DateRangePicker({
              defaultValue: { from: new Date() },
              disabled: (d) => d.getDay() === 0 || d.getDay() === 6,
            }).el,
          );
          return row;
        },
      },
      {
        title: "5. Plain capture",
        codeTitle: "Empty start — picks anchor first, then end",
        code: `const picker = DateRangePicker({
  value: range,
  onValueChange: (r) => { range = r; picker.update({ value: r }); },
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";

          let range: DateRange | undefined;

          const info = document.createElement("p");
          info.className = "zen-text-xs zen-text-zen-muted-fg zen-m-0";

          const paint = () => {
            info.textContent = range
              ? JSON.stringify(
                  {
                    from: range.from?.toISOString().slice(0, 10),
                    to: range.to?.toISOString().slice(0, 10),
                  },
                  null,
                  2,
                )
              : "(no range yet)";
          };

          const picker = DateRangePicker({
            value: range,
            onValueChange: (r) => {
              range = r;
              picker.update({ value: r });
              paint();
            },
          });

          paint();
          wrap.append(picker.el, info);
          return wrap;
        },
      },
    ],
  });
}

import type { DateRange } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * DateRangePicker demo — the web-components mirror of the vanilla version. Renders
 * <zen-date-range-picker>; `value`/`defaultValue` (DateRange objects) and the
 * `disabled` predicate are set as JS properties, zen-value-change carries the range.
 */

function el(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

const setProp = (node: HTMLElement, name: string, value: unknown): void => {
  (node as unknown as Record<string, unknown>)[name] = value;
};

export default function DateRangePickerDemo(): HTMLElement {
  return DemoPage({
    title: "DateRangePicker",
    description:
      "Two-month side-by-side calendar in a Popover for picking a { from, to } date pair. Pick an anchor day, then an end day; Done applies the range and closes the popover, Cancel (or Escape / click-outside) discards it. Returns the same DateRange shape as the React binding.",
    sections: [
      {
        title: "1. Uncontrolled",
        codeTitle: "defaultValue + internal state",
        code: `const picker = document.createElement("zen-date-range-picker");
picker.defaultValue = { from: new Date(2026, 0, 12), to: new Date(2026, 0, 19) };`,
        render: () => {
          const picker = el("zen-date-range-picker");
          setProp(picker, "defaultValue", {
            from: new Date(2026, 0, 12),
            to: new Date(2026, 0, 19),
          });
          return picker;
        },
      },
      {
        title: "2. Controlled — booking-style stay",
        codeTitle: "value + zen-value-change for external state",
        codeDescription:
          "Default stay seeded to 'today through 3 days from now'; pick a different range and the label updates immediately.",
        code: `picker.value = stay;   // { from, to }
picker.addEventListener("zen-value-change", (e) => {
  stay = e.detail;
  picker.value = stay;
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
              const nights = Math.round((stay.to.getTime() - stay.from.getTime()) / 86_400_000);
              info.textContent = `Selected stay: ${stay.from.toISOString().slice(0, 10)} → ${stay.to
                .toISOString()
                .slice(0, 10)} (${nights} nights)`;
            } else {
              info.textContent = "Pick a range";
            }
          };

          const picker = el("zen-date-range-picker");
          setProp(picker, "value", stay);
          picker.addEventListener("zen-value-change", (e) => {
            stay = (e as CustomEvent<DateRange | undefined>).detail;
            setProp(picker, "value", stay);
            paint();
          });

          paint();
          wrap.append(picker, info);
          return wrap;
        },
      },
      {
        title: "3. Single-month variant",
        codeTitle: "number-of-months=1 for narrow layouts",
        codeDescription:
          "Default is 2 months — the conventional Airbnb / Booking layout. Drop to 1 when the popover doesn't have room (mobile, narrow side panels).",
        code: `<zen-date-range-picker number-of-months="1"></zen-date-range-picker>`,
        render: () => el("zen-date-range-picker", { "number-of-months": "1" }),
      },
      {
        title: "4. Disabled",
        codeTitle: "Disable the whole trigger or specific days",
        codeDescription:
          "Pass disabled to lock the trigger; pass a predicate property and those specific days are disabled while the popover stays open.",
        code: `<zen-date-range-picker disabled placeholder="Locked"></zen-date-range-picker>

// Disable weekends
picker.disabled = (d) => d.getDay() === 0 || d.getDay() === 6;`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "12px";
          row.style.flexWrap = "wrap";
          const locked = el("zen-date-range-picker", { disabled: "", placeholder: "Locked" });
          const weekends = el("zen-date-range-picker");
          setProp(weekends, "defaultValue", { from: new Date() });
          setProp(weekends, "disabled", (d: Date) => d.getDay() === 0 || d.getDay() === 6);
          row.append(locked, weekends);
          return row;
        },
      },
      {
        title: "5. Plain capture",
        codeTitle: "Empty start — picks anchor first, then end",
        code: `picker.addEventListener("zen-value-change", (e) => {
  range = e.detail;
  picker.value = range;
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

          const picker = el("zen-date-range-picker");
          setProp(picker, "value", range);
          picker.addEventListener("zen-value-change", (e) => {
            range = (e as CustomEvent<DateRange | undefined>).detail;
            setProp(picker, "value", range);
            paint();
          });

          paint();
          wrap.append(picker, info);
          return wrap;
        },
      },
    ],
  });
}

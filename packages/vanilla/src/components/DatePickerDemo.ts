import { Calendar, DatePicker, type DateRange } from "./form/date-picker/date-picker";
import { DemoPage } from "./demo-helpers";

const muted = (text: string): HTMLElement => {
  const s = document.createElement("span");
  s.style.marginLeft = "12px";
  s.style.fontSize = "0.8125rem";
  s.style.color = "var(--zen-color-muted-fg)";
  s.textContent = text;
  return s;
};

const framed = (node: Node): HTMLElement => {
  const box = document.createElement("div");
  box.style.border = "1px solid var(--zen-color-border)";
  box.style.borderRadius = "8px";
  box.style.display = "inline-block";
  box.append(node);
  return box;
};

const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function DatePickerDemo(): HTMLElement {
  return DemoPage({
    title: "DatePicker + Calendar",
    description:
      "React backs this with react-day-picker inside a Radix Popover. There is no react-day-picker for a no-framework binding, so the month-grid is written out — single, multiple and range selection, month navigation, disabled days — behind the same public API. The trigger version opens a Calendar in the vanilla Popover; the bare Calendar is for inline use.",
    sections: [
      {
        title: "1. DatePicker (popover trigger)",
        codeTitle: "Compact trigger that opens a calendar",
        code: `const picker = DatePicker({
  onValueChange: (d) => console.log(d),
});
host.append(picker.el);`,
        render: () => {
          const out = muted("value: (none)");
          const picker = DatePicker({
            onValueChange: (d) => (out.textContent = `value: ${d ? d.toLocaleDateString() : "(none)"}`),
          });
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.append(picker.el, out);
          return row;
        },
      },
      {
        title: "2. Custom format",
        codeTitle: "formatDate prop",
        code: `DatePicker({
  formatDate: (d) =>
    d.toLocaleDateString("en-US", { dateStyle: "long" }),
})`,
        render: () =>
          DatePicker({
            formatDate: (d) => d.toLocaleDateString("en-US", { dateStyle: "long" }),
          }).el,
      },
      {
        title: "3. Disabled dates",
        codeTitle: "Pass a predicate to disable individual days",
        codeDescription:
          "React forwards day-picker's `{ before: new Date() }`; the vanilla API takes a predicate — return true to disable a day.",
        code: `DatePicker({
  disabled: (d) => d < startOfToday(), // no past dates
})`,
        render: () =>
          DatePicker({
            disabled: (d) => d < startOfToday(),
          }).el,
      },
      {
        title: "4. Inline Calendar (single)",
        codeTitle: "Use Calendar directly when you don't want a popover",
        code: `Calendar({ mode: "single", onSelect: (d) => console.log(d) })`,
        render: () =>
          framed(
            Calendar({
              mode: "single",
              onSelect: (d) => console.log(d),
            }).el,
          ),
      },
      {
        title: "5. Inline Calendar (range)",
        codeTitle: 'mode: "range" for date-range selection',
        code: `let range: { from?: Date; to?: Date } = {};
const cal = Calendar({
  mode: "range",
  numberOfMonths: 2,
  onSelect: (r) => cal.update({ selected: (range = r ?? {}) }),
});`,
        render: () => {
          const out = document.createElement("div");
          out.style.marginTop = "8px";
          out.style.fontSize = "0.8125rem";
          out.style.color = "var(--zen-color-muted-fg)";
          out.textContent = "range: — → —";

          let range: DateRange = {};
          const cal = Calendar({
            mode: "range",
            numberOfMonths: 2,
            selected: range,
            onSelect: (r) => {
              range = (r as DateRange | undefined) ?? {};
              cal.update({ selected: range });
              out.textContent = `range: ${range.from?.toLocaleDateString() ?? "—"} → ${range.to?.toLocaleDateString() ?? "—"}`;
            },
          });

          const wrap = document.createElement("div");
          wrap.append(framed(cal.el), out);
          return wrap;
        },
      },
    ],
  });
}

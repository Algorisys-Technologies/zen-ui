import type { DateRange } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * DatePicker demo — the web-components mirror of the vanilla DatePickerDemo. Renders
 * <zen-date-picker> (popover trigger) and <zen-calendar> (inline). Date values and
 * the `disabled` predicate / `formatDate` fn are set as JS properties.
 */

function el(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

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
        code: `<zen-date-picker></zen-date-picker>

picker.addEventListener("zen-value-change", (e) => console.log(e.detail));`,
        render: () => {
          const out = muted("value: (none)");
          const picker = el("zen-date-picker");
          picker.addEventListener("zen-value-change", (e) => {
            const d = (e as CustomEvent<Date | undefined>).detail;
            out.textContent = `value: ${d ? d.toLocaleDateString() : "(none)"}`;
          });
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.append(picker, out);
          return row;
        },
      },
      {
        title: "2. Custom format",
        codeTitle: "formatDate prop",
        code: `picker.formatDate = (d) =>
  d.toLocaleDateString("en-US", { dateStyle: "long" });`,
        render: () => {
          const picker = el("zen-date-picker");
          (picker as unknown as { formatDate: (d: Date) => string }).formatDate = (d) =>
            d.toLocaleDateString("en-US", { dateStyle: "long" });
          return picker;
        },
      },
      {
        title: "3. Disabled dates",
        codeTitle: "Pass a predicate to disable individual days",
        codeDescription:
          "React forwards day-picker's `{ before: new Date() }`; the vanilla API takes a predicate — return true to disable a day.",
        code: `picker.disabled = (d) => d < startOfToday(); // no past dates`,
        render: () => {
          const picker = el("zen-date-picker");
          (picker as unknown as { disabled: (d: Date) => boolean }).disabled = (d) => d < startOfToday();
          return picker;
        },
      },
      {
        title: "4. Inline Calendar (single)",
        codeTitle: "Use zen-calendar directly when you don't want a popover",
        code: `<zen-calendar mode="single"></zen-calendar>

cal.addEventListener("zen-select", (e) => console.log(e.detail));`,
        render: () => {
          const cal = el("zen-calendar", { mode: "single" });
          cal.addEventListener("zen-select", (e) => console.log((e as CustomEvent).detail));
          return framed(cal);
        },
      },
      {
        title: "5. Inline Calendar (range)",
        codeTitle: 'mode="range" for date-range selection',
        code: `<zen-calendar mode="range" number-of-months="2"></zen-calendar>

cal.addEventListener("zen-select", (e) => { cal.selected = e.detail ?? {}; });`,
        render: () => {
          const out = document.createElement("div");
          out.style.marginTop = "8px";
          out.style.fontSize = "0.8125rem";
          out.style.color = "var(--zen-color-muted-fg)";
          out.textContent = "range: — → —";

          const cal = el("zen-calendar", { mode: "range", "number-of-months": "2" });
          (cal as unknown as { selected: DateRange }).selected = {};
          cal.addEventListener("zen-select", (e) => {
            const range = ((e as CustomEvent<DateRange | undefined>).detail as DateRange | undefined) ?? {};
            (cal as unknown as { selected: DateRange }).selected = range;
            out.textContent = `range: ${range.from?.toLocaleDateString() ?? "—"} → ${range.to?.toLocaleDateString() ?? "—"}`;
          });

          const wrap = document.createElement("div");
          wrap.append(framed(cal), out);
          return wrap;
        },
      },
    ],
  });
}

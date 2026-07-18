import {
  resolveDateRange,
  toISODate,
  type DateRangeValue,
} from "@algorisys/zen-ui-core/date-range";
import { DynamicDateRange } from "./form/dynamic-date-range/dynamic-date-range";
import { DemoPage } from "./demo-helpers";

/** A column that stacks its children, left-aligned — the React demo's `COL`. */
const col = (): HTMLElement => {
  const d = document.createElement("div");
  d.style.display = "flex";
  d.style.flexDirection = "column";
  d.style.gap = "10px";
  d.style.alignItems = "flex-start";
  return d;
};

const codeEl = (text: string): HTMLElement => {
  const c = document.createElement("code");
  c.textContent = text;
  return c;
};

/** Renders a value + what it currently resolves to. Mirrors the React `Readout`. */
function Readout(): { el: HTMLElement; set: (value?: DateRangeValue, now?: Date) => void } {
  const el = document.createElement("div");
  el.className = "zen-flex zen-flex-col zen-gap-1 zen-text-xs";

  const storedLine = document.createElement("div");
  const storedCode = codeEl("undefined");
  storedLine.append(document.createTextNode("stored → "), storedCode);

  const resolvedLine = document.createElement("div");
  resolvedLine.className = "zen-text-zen-muted-fg";
  const fromCode = codeEl("—");
  const toCode = codeEl("—");
  resolvedLine.append(
    document.createTextNode("resolves → "),
    fromCode,
    document.createTextNode(" … "),
    toCode,
  );

  el.append(storedLine, resolvedLine);

  const set = (value?: DateRangeValue, now?: Date) => {
    const r = resolveDateRange(value, now);
    storedCode.textContent = value ? JSON.stringify(value) : "undefined";
    fromCode.textContent = r.from ? toISODate(r.from) : "—";
    toCode.textContent = r.to ? toISODate(r.to) : "—";
  };

  return { el, set };
}

export default function DynamicDateRangeDemo(): HTMLElement {
  return DemoPage({
    title: "DynamicDateRange",
    description:
      'A date range you describe rather than point at. The difference from DateRangePicker is the value, not the popover: DateRangePicker answers "which two dates?" and stores two dates. This answers "which period?" and stores the period. All the date maths lives in @algorisys/zen-ui-core/date-range, shared by every binding, and is pinned by a fixed-clock contract.',
    sections: [
      {
        title: "1. The picker",
        codeTitle: "The value is the question; the dates are the answer",
        codeDescription:
          "onValueChange hands back both, because callers need both: the semantic value to store, and the resolved dates to query with. The trigger shows the name AND the dates it currently means — a filter that will not tell you what it resolves to is one people stop trusting.",
        code: `let value: DateRangeValue | undefined = { operator: "LAST_DAYS", count: 7 };

const ddr = DynamicDateRange({
  value,
  onValueChange: (v, resolved) => {
    value = v;                 // store this
    ddr.update({ value });
    query({ from: resolved.from, to: resolved.to });  // query with this
  },
});
host.append(ddr.el);`,
        render: () => {
          const ro = Readout();
          let value: DateRangeValue | undefined = { operator: "LAST_DAYS", count: 7 };
          const ddr = DynamicDateRange({
            value,
            onValueChange: (v) => {
              value = v;
              ddr.update({ value });
              ro.set(value);
            },
          });
          ro.set(value);
          const c = col();
          c.append(ddr.el, ro.el);
          return c;
        },
      },
      {
        title: "2. Why this exists",
        codeTitle: "One saved value, three different days",
        codeDescription:
          "Nothing below changes except the clock. Store `{operator:'LAST_DAYS',count:7}` in a saved filter and it still means the last seven days next year. Store two dates — which is all DateRangePicker can give you — and it means the same frozen week forever. Every one of these is the same value, passed the `now` prop.",
        code: `const saved = { operator: "LAST_DAYS", count: 7 };

resolveDateRange(saved, new Date(2026, 6, 15))  // 2026-07-08 … 2026-07-14
resolveDateRange(saved, new Date(2027, 0, 3))   // 2026-12-27 … 2027-01-02`,
        render: () => {
          const saved: DateRangeValue = { operator: "LAST_DAYS", count: 7 };
          const days = [new Date(2026, 6, 15), new Date(2026, 7, 20), new Date(2027, 0, 3)];

          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-flex-col zen-gap-3";
          for (const d of days) {
            const rowWrap = document.createElement("div");
            rowWrap.className = "zen-flex zen-flex-col zen-gap-1";
            const heading = document.createElement("div");
            heading.className = "zen-text-xs zen-font-medium";
            heading.textContent = `as of ${toISODate(d)}`;
            const ddr = DynamicDateRange({ value: saved, now: d, disabled: true });
            rowWrap.append(heading, ddr.el);
            wrap.append(rowWrap);
          }
          const note = document.createElement("p");
          note.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
          note.textContent = "Note the last one crosses a year boundary without being asked to.";
          wrap.append(note);
          return wrap;
        },
      },
      {
        title: '3. "Last 7 days" — ending when, exactly?',
        codeTitle: "LAST_* means completed periods, so today is excluded",
        codeDescription:
          "Last week means the previous whole week, not a week ending today — so Last 7 days ends yesterday, by the same rule. That is consistent, but it is not what every dashboard wants, and a filter that is quietly off by a day is the kind of bug nobody notices for a quarter. So it is a visible flag rather than a decision made for you, and the trigger says which one you picked. Open either and tick 'Include the current day'.",
        code: `{ operator: "LAST_DAYS", count: 7 }                        // ends yesterday
{ operator: "LAST_DAYS", count: 7, includeCurrent: true }  // ends today

// or say it outright:
{ operator: "MONTH_TO_DATE" }   // 1st of the month → now`,
        render: () => {
          const ro = Readout();
          let rolling: DateRangeValue | undefined = { operator: "LAST_DAYS", count: 30 };
          const ddr = DynamicDateRange({
            value: rolling,
            operators: ["LAST_DAYS", "LAST_WEEKS", "LAST_MONTHS", "MONTH_TO_DATE", "YEAR_TO_DATE"],
            onValueChange: (v) => {
              rolling = v;
              ddr.update({ value: rolling });
              ro.set(rolling);
            },
          });
          ro.set(rolling);
          const c = col();
          c.append(ddr.el, ro.el);
          return c;
        },
      },
      {
        title: "4. Narrowing the list",
        codeTitle: "operators — 32 is a lot to scroll for a quarterly report",
        codeDescription:
          "Pass the operators that make sense for the screen. A finance filter that offers 'Tomorrow' is offering a question nobody asked. The list groups itself; the groups you do not use disappear.",
        code: `DynamicDateRange({
  operators: ["THIS_QUARTER", "LAST_QUARTER", "QUARTER_TO_DATE", "THIS_YEAR", "LAST_YEAR", "BETWEEN"],
})`,
        render: () => {
          const ro = Readout();
          let scoped: DateRangeValue | undefined = { operator: "THIS_QUARTER" };
          const ddr = DynamicDateRange({
            value: scoped,
            operators: ["THIS_QUARTER", "LAST_QUARTER", "QUARTER_TO_DATE", "THIS_YEAR", "LAST_YEAR", "BETWEEN"],
            onValueChange: (v) => {
              scoped = v;
              ddr.update({ value: scoped });
              ro.set(scoped);
            },
          });
          ro.set(scoped);
          const c = col();
          c.append(ddr.el, ro.el);
          return c;
        },
      },
      {
        title: "5. The engine on its own",
        codeTitle: "resolveDateRange — no component required",
        codeDescription:
          "The maths is exported. `now` is always injected rather than read from the clock inside, which is what makes it pure and what lets the contract assert 'This Quarter' against a fixed date instead of against whenever the check happened to run. Ranges end at 23:59:59.999, not midnight — the difference between a filter that includes its last day and one that silently drops it.",
        code: `import { resolveDateRange, formatDateRangeValue } from "@algorisys/zen-ui-core/date-range";

resolveDateRange({ operator: "THIS_QUARTER" }, new Date(2026, 6, 15));
// { from: 2026-07-01 00:00:00.000, to: 2026-09-30 23:59:59.999 }

formatDateRangeValue({ operator: "LAST_DAYS", count: 7 });  // "Last 7 days"`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-flex-col zen-gap-1 zen-text-xs";
          const values: DateRangeValue[] = [
            { operator: "THIS_QUARTER" },
            { operator: "YEAR_TO_DATE" },
            { operator: "LAST_MONTH" },
          ];
          for (const v of values) {
            const ro = Readout();
            ro.set(v, new Date(2026, 6, 15));
            wrap.append(ro.el);
          }
          const note = document.createElement("p");
          note.className = "zen-m-0 zen-mt-1 zen-text-zen-muted-fg";
          note.textContent = "…all as of 2026-07-15.";
          wrap.append(note);
          return wrap;
        },
      },
    ],
  });
}

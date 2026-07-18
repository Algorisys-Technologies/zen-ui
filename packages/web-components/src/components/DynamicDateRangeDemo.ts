import {
  resolveDateRange,
  toISODate,
  type DateRangeValue,
} from "@algorisys/zen-ui-core/date-range";
import { DemoPage } from "./demo-helpers";

/**
 * DynamicDateRange demo — the web-components mirror of the vanilla version. Renders
 * <zen-dynamic-date-range>; `value` / `operators` / `now` are set as JS properties.
 * The date maths (resolveDateRange, toISODate) comes from the shared core module.
 */

function el(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

const setProp = (node: HTMLElement, name: string, value: unknown): void => {
  (node as unknown as Record<string, unknown>)[name] = value;
};

/** A column that stacks its children, left-aligned. */
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

/** Renders a value + what it currently resolves to. */
function Readout(): { el: HTMLElement; set: (value?: DateRangeValue, now?: Date) => void } {
  const element = document.createElement("div");
  element.className = "zen-flex zen-flex-col zen-gap-1 zen-text-xs";

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

  element.append(storedLine, resolvedLine);

  const set = (value?: DateRangeValue, now?: Date) => {
    const r = resolveDateRange(value, now);
    storedCode.textContent = value ? JSON.stringify(value) : "undefined";
    fromCode.textContent = r.from ? toISODate(r.from) : "—";
    toCode.textContent = r.to ? toISODate(r.to) : "—";
  };

  return { el: element, set };
}

/** Value carried in the zen-value-change detail: [value, resolved]. */
const valueOf = (e: Event): DateRangeValue | undefined =>
  (e as CustomEvent<[DateRangeValue | undefined, unknown]>).detail[0];

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
        code: `const ddr = document.createElement("zen-dynamic-date-range");
ddr.value = { operator: "LAST_DAYS", count: 7 };
ddr.addEventListener("zen-value-change", (e) => {
  const [value, resolved] = e.detail;
  ddr.value = value;                        // store this
  query({ from: resolved.from, to: resolved.to });  // query with this
});`,
        render: () => {
          const ro = Readout();
          const ddr = el("zen-dynamic-date-range");
          setProp(ddr, "value", { operator: "LAST_DAYS", count: 7 });
          ddr.addEventListener("zen-value-change", (e) => {
            const value = valueOf(e);
            setProp(ddr, "value", value);
            ro.set(value);
          });
          ro.set({ operator: "LAST_DAYS", count: 7 });
          const c = col();
          c.append(ddr, ro.el);
          return c;
        },
      },
      {
        title: "2. Why this exists",
        codeTitle: "One saved value, three different days",
        codeDescription:
          "Nothing below changes except the clock. Store `{operator:'LAST_DAYS',count:7}` in a saved filter and it still means the last seven days next year. Store two dates — which is all DateRangePicker can give you — and it means the same frozen week forever. Every one of these is the same value, passed the `now` prop.",
        code: `ddr.value = { operator: "LAST_DAYS", count: 7 };
ddr.now = new Date(2026, 6, 15);   // resolves relative to this clock`,
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
            const ddr = el("zen-dynamic-date-range", { disabled: "" });
            setProp(ddr, "value", saved);
            setProp(ddr, "now", d);
            rowWrap.append(heading, ddr);
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
          const rolling: DateRangeValue = { operator: "LAST_DAYS", count: 30 };
          const ddr = el("zen-dynamic-date-range");
          setProp(ddr, "value", rolling);
          setProp(ddr, "operators", ["LAST_DAYS", "LAST_WEEKS", "LAST_MONTHS", "MONTH_TO_DATE", "YEAR_TO_DATE"]);
          ddr.addEventListener("zen-value-change", (e) => {
            const value = valueOf(e);
            setProp(ddr, "value", value);
            ro.set(value);
          });
          ro.set(rolling);
          const c = col();
          c.append(ddr, ro.el);
          return c;
        },
      },
      {
        title: "4. Narrowing the list",
        codeTitle: "operators — 32 is a lot to scroll for a quarterly report",
        codeDescription:
          "Pass the operators that make sense for the screen. A finance filter that offers 'Tomorrow' is offering a question nobody asked. The list groups itself; the groups you do not use disappear.",
        code: `ddr.operators = ["THIS_QUARTER", "LAST_QUARTER", "QUARTER_TO_DATE", "THIS_YEAR", "LAST_YEAR", "BETWEEN"];`,
        render: () => {
          const ro = Readout();
          const scoped: DateRangeValue = { operator: "THIS_QUARTER" };
          const ddr = el("zen-dynamic-date-range");
          setProp(ddr, "value", scoped);
          setProp(ddr, "operators", ["THIS_QUARTER", "LAST_QUARTER", "QUARTER_TO_DATE", "THIS_YEAR", "LAST_YEAR", "BETWEEN"]);
          ddr.addEventListener("zen-value-change", (e) => {
            const value = valueOf(e);
            setProp(ddr, "value", value);
            ro.set(value);
          });
          ro.set(scoped);
          const c = col();
          c.append(ddr, ro.el);
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

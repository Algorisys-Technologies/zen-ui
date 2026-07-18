import { useState } from "react";
import { DynamicDateRange } from "./form/dynamic-date-range/dynamic-date-range";
import {
  resolveDateRange,
  toISODate,
  type DateRangeValue,
} from "@algorisys/zen-ui-core/date-range";
import { CodeExample } from "./demo-helpers";

const COL: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" };

/** Renders a value + what it currently resolves to. */
const Readout: React.FC<{ value?: DateRangeValue; now?: Date }> = ({ value, now }) => {
  const r = resolveDateRange(value, now);
  return (
    <div className="zen-flex zen-flex-col zen-gap-1 zen-text-xs">
      <div>
        stored → <code>{value ? JSON.stringify(value) : "undefined"}</code>
      </div>
      <div className="zen-text-zen-muted-fg">
        resolves → <code>{r.from ? toISODate(r.from) : "—"}</code> …{" "}
        <code>{r.to ? toISODate(r.to) : "—"}</code>
      </div>
    </div>
  );
};

const NewDynamicDateRangeDemo: React.FC = () => {
  const [value, setValue] = useState<DateRangeValue | undefined>({ operator: "LAST_DAYS", count: 7 });
  const [scoped, setScoped] = useState<DateRangeValue | undefined>({ operator: "THIS_QUARTER" });
  const [rolling, setRolling] = useState<DateRangeValue | undefined>({ operator: "LAST_DAYS", count: 30 });

  // The same value, resolved on three different days. Nothing changes but the
  // clock — which is the entire argument for the component.
  const saved: DateRangeValue = { operator: "LAST_DAYS", count: 7 };
  const days = [new Date(2026, 6, 15), new Date(2026, 7, 20), new Date(2027, 0, 3)];

  return (
    <div className="demo-page">
      <h1>DynamicDateRange</h1>
      <p className="lede">
        A date range you <em>describe</em> rather than point at. The difference
        from <code>DateRangePicker</code> is the value, not the popover:
        DateRangePicker answers "which two dates?" and stores two dates. This
        answers "which period?" and stores the period. All the date maths lives
        in <code>@algorisys/zen-ui-core/date-range</code>, shared by both
        bindings, and is pinned by a 99-check contract against a fixed clock.
      </p>

      <section className="demo-section">
        <h2>1. The picker</h2>
        <CodeExample
          title="The value is the question; the dates are the answer"
          description="onValueChange hands back both, because callers need both: the semantic value to store, and the resolved dates to query with. The trigger shows the name AND the dates it currently means — a filter that will not tell you what it resolves to is one people stop trusting."
          code={`const [value, setValue] = useState<DateRangeValue>({ operator: "LAST_DAYS", count: 7 });

<DynamicDateRange
  value={value}
  onValueChange={(v, resolved) => {
    setValue(v);                 // store this
    query({ from: resolved.from, to: resolved.to });  // query with this
  }}
/>`}
        >
          <div style={COL}>
            <DynamicDateRange value={value} onValueChange={(v) => setValue(v)} />
            <Readout value={value} />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Why this exists</h2>
        <CodeExample
          title="One saved value, three different days"
          description="Nothing below changes except the clock. Store `{operator:'LAST_DAYS',count:7}` in a saved filter and it still means the last seven days next year. Store two dates — which is all DateRangePicker can give you — and it means the same frozen week forever. Every one of these is the same value, passed the `now` prop."
          code={`const saved = { operator: "LAST_DAYS", count: 7 };

resolveDateRange(saved, new Date(2026, 6, 15))  // 2026-07-08 … 2026-07-14
resolveDateRange(saved, new Date(2027, 0, 3))   // 2026-12-27 … 2027-01-02`}
        >
          <div className="zen-flex zen-flex-col zen-gap-3">
            {days.map((d) => (
              <div key={d.toISOString()} className="zen-flex zen-flex-col zen-gap-1">
                <div className="zen-text-xs zen-font-medium">
                  as of {toISODate(d)}
                </div>
                <DynamicDateRange value={saved} now={d} disabled />
              </div>
            ))}
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              Note the last one crosses a year boundary without being asked to.
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. "Last 7 days" — ending when, exactly?</h2>
        <CodeExample
          title="LAST_* means completed periods, so today is excluded"
          description="Last week means the previous whole week, not a week ending today — so Last 7 days ends yesterday, by the same rule. That is consistent, but it is not what every dashboard wants, and a filter that is quietly off by a day is the kind of bug nobody notices for a quarter. So it is a visible flag rather than a decision made for you, and the trigger says which one you picked. Open either and tick 'Include the current day'."
          code={`{ operator: "LAST_DAYS", count: 7 }                        // ends yesterday
{ operator: "LAST_DAYS", count: 7, includeCurrent: true }  // ends today

// or say it outright:
{ operator: "MONTH_TO_DATE" }   // 1st of the month → now`}
        >
          <div style={COL}>
            <DynamicDateRange
              value={rolling}
              onValueChange={(v) => setRolling(v)}
              operators={["LAST_DAYS", "LAST_WEEKS", "LAST_MONTHS", "MONTH_TO_DATE", "YEAR_TO_DATE"]}
            />
            <Readout value={rolling} />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Narrowing the list</h2>
        <CodeExample
          title="operators — 32 is a lot to scroll for a quarterly report"
          description="Pass the operators that make sense for the screen. A finance filter that offers 'Tomorrow' is offering a question nobody asked. The list groups itself; the groups you do not use disappear."
          code={`<DynamicDateRange
  operators={["THIS_QUARTER", "LAST_QUARTER", "QUARTER_TO_DATE", "THIS_YEAR", "LAST_YEAR", "BETWEEN"]}
/>`}
        >
          <div style={COL}>
            <DynamicDateRange
              value={scoped}
              onValueChange={(v) => setScoped(v)}
              operators={[
                "THIS_QUARTER",
                "LAST_QUARTER",
                "QUARTER_TO_DATE",
                "THIS_YEAR",
                "LAST_YEAR",
                "BETWEEN",
              ]}
            />
            <Readout value={scoped} />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. The engine on its own</h2>
        <CodeExample
          title="resolveDateRange — no component required"
          description="The maths is exported. `now` is always injected rather than read from the clock inside, which is what makes it pure and what lets the contract assert 'This Quarter' against a fixed date instead of against whenever the check happened to run. Ranges end at 23:59:59.999, not midnight — the difference between a filter that includes its last day and one that silently drops it."
          code={`import { resolveDateRange, formatDateRangeValue } from "@algorisys/zen-ui-core/date-range";

resolveDateRange({ operator: "THIS_QUARTER" }, new Date(2026, 6, 15));
// { from: 2026-07-01 00:00:00.000, to: 2026-09-30 23:59:59.999 }

formatDateRangeValue({ operator: "LAST_DAYS", count: 7 });  // "Last 7 days"`}
        >
          <div className="zen-flex zen-flex-col zen-gap-1 zen-text-xs">
            {(
              [
                { operator: "THIS_QUARTER" },
                { operator: "YEAR_TO_DATE" },
                { operator: "LAST_MONTH" },
              ] as DateRangeValue[]
            ).map((v) => (
              <Readout key={v.operator} value={v} now={new Date(2026, 6, 15)} />
            ))}
            <p className="zen-m-0 zen-mt-1 zen-text-zen-muted-fg">
              …all as of 2026-07-15.
            </p>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewDynamicDateRangeDemo;

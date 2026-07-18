import { useState } from "react";
import {
  DateRangePicker,
  type DateRange,
} from "./form/date-picker/date-range-picker";
import { CodeExample } from "./demo-helpers";

const NewDateRangePickerDemo: React.FC = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  const [stay, setStay] = useState<DateRange | undefined>(() => {
    const today = new Date();
    const checkout = new Date(today);
    checkout.setDate(today.getDate() + 3);
    return { from: today, to: checkout };
  });

  return (
    <div className="demo-page">
      <h1>DateRangePicker</h1>
      <p className="lede">
        Two-month side-by-side calendar in a Popover for picking a
        `&#123;from, to&#125;` date pair. Built on
        react-day-picker's <code>mode="range"</code>, so range anchoring
        and re-anchoring (click outside the active range to start
        over) work out of the box. Returns the same{" "}
        <code>DateRange</code> shape react-day-picker exports.
      </p>

      <section className="demo-section">
        <h2>1. Uncontrolled</h2>
        <CodeExample
          title="defaultValue + internal state"
          code={`<DateRangePicker defaultValue={{ from, to }} />`}
        >
          <DateRangePicker
            defaultValue={{
              from: new Date(2026, 0, 12),
              to: new Date(2026, 0, 19),
            }}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Controlled — booking-style stay</h2>
        <CodeExample
          title="value + onValueChange for external state"
          description="Default stay seeded to 'today through 3 days from now'; pick a different range and the label updates immediately."
          code={`const [stay, setStay] = useState<DateRange | undefined>(...);
<DateRangePicker value={stay} onValueChange={setStay} />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <DateRangePicker value={stay} onValueChange={setStay} />
            <p className="zen-text-xs zen-text-zen-muted-fg zen-m-0">
              {stay?.from && stay?.to ? (
                <>
                  Selected stay:{" "}
                  <code>{stay.from.toISOString().slice(0, 10)}</code> →{" "}
                  <code>{stay.to.toISOString().slice(0, 10)}</code> (
                  {Math.round(
                    (stay.to.getTime() - stay.from.getTime()) / 86_400_000,
                  )}{" "}
                  nights)
                </>
              ) : (
                <em>Pick a range</em>
              )}
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Single-month variant</h2>
        <CodeExample
          title="numberOfMonths={1} for narrow layouts"
          description="Default is 2 months — the conventional Airbnb / Booking layout. Drop to 1 when the popover doesn't have room (mobile, narrow side panels)."
          code={`<DateRangePicker numberOfMonths={1} />`}
        >
          <DateRangePicker numberOfMonths={1} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Disabled</h2>
        <CodeExample
          title="Disable the whole trigger or specific days"
          description="Pass disabled={true} to lock the trigger; pass a matcher (a Date, an array of Dates, a range, a function) and react-day-picker disables those specific days while keeping the popover open."
          code={`{/* Whole trigger disabled */}
<DateRangePicker disabled />

{/* Disable weekends */}
<DateRangePicker disabled={{ dayOfWeek: [0, 6] }} />`}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <DateRangePicker disabled placeholder="Locked" />
            <DateRangePicker
              defaultValue={{ from: new Date() }}
              disabled={{ dayOfWeek: [0, 6] }}
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Plain capture</h2>
        <CodeExample
          title="Empty start — picks anchor first, then end"
          code={`<DateRangePicker value={range} onValueChange={setRange} />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <DateRangePicker value={range} onValueChange={setRange} />
            <p className="zen-text-xs zen-text-zen-muted-fg zen-m-0">
              {range
                ? JSON.stringify(
                    {
                      from: range.from?.toISOString().slice(0, 10),
                      to: range.to?.toISOString().slice(0, 10),
                    },
                    null,
                    2,
                  )
                : "(no range yet)"}
            </p>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewDateRangePickerDemo;

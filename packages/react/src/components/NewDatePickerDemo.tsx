import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar, DatePicker } from "./form/date-picker/date-picker";
import { CodeExample } from "./demo-helpers";

const NewDatePickerDemo: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  return (
    <div className="demo-page">
      <h1>DatePicker + Calendar (new)</h1>
      <p className="lede">
        <code>react-day-picker</code> inside a Radix <code>Popover</code> for
        the trigger version; bare <code>Calendar</code> for inline use. Day
        picker handles month navigation, keyboard nav, RTL, and a11y. Themed
        via the day-picker accent CSS variables, wired to <code>--zen-*</code>.
      </p>

      <section className="demo-section">
        <h2>1. DatePicker (popover trigger)</h2>
        <CodeExample
          title="Compact trigger that opens a calendar"
          code={`const [date, setDate] = useState<Date | undefined>();

<DatePicker value={date} onValueChange={setDate} />`}
        >
          <DatePicker value={date} onValueChange={setDate} />
          <span style={{ marginLeft: 12, fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            value: {date ? date.toLocaleDateString() : "(none)"}
          </span>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Custom format</h2>
        <CodeExample
          title="formatDate prop"
          code={`<DatePicker
  value={date}
  onValueChange={setDate}
  formatDate={(d) => d.toLocaleDateString("en-US", { dateStyle: "long" })}
/>`}
        >
          <DatePicker
            value={date}
            onValueChange={setDate}
            formatDate={(d) =>
              d.toLocaleDateString("en-US", { dateStyle: "long" })
            }
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Disabled dates</h2>
        <CodeExample
          title="Pass disabled to disable individual days (forwarded to day-picker)"
          code={`<DatePicker
  value={date}
  onValueChange={setDate}
  disabled={{ before: new Date() }}  // disable past dates
/>`}
        >
          <DatePicker
            value={date}
            onValueChange={setDate}
            disabled={{ before: new Date() }}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Inline Calendar (single)</h2>
        <CodeExample
          title="Use Calendar directly when you don't want a popover"
          code={`<Calendar mode="single" selected={date} onSelect={setDate} />`}
        >
          <div style={{ border: "1px solid var(--zen-color-border)", borderRadius: 8 }}>
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Inline Calendar (range)</h2>
        <CodeExample
          title={`mode="range" for date-range selection`}
          code={`const [range, setRange] = useState<{ from?: Date; to?: Date }>();

<Calendar mode="range" selected={range} onSelect={setRange} />`}
        >
          <div style={{ border: "1px solid var(--zen-color-border)", borderRadius: 8 }}>
            <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
          </div>
          <div style={{ marginTop: 8, fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            range: {range?.from?.toLocaleDateString() || "—"} →{" "}
            {range?.to?.toLocaleDateString() || "—"}
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewDatePickerDemo;

import { useState } from "react";
import { DateTimePicker } from "./form/date-picker/date-time-picker";
import { CodeExample } from "./demo-helpers";

const NewDateTimePickerDemo: React.FC = () => {
  const [when, setWhen] = useState<Date | undefined>();

  return (
    <div className="demo-page">
      <h1>DateTimePicker</h1>
      <p className="lede">
        Compound picker for "when" questions — a Calendar above the{" "}
        <a href="#/time-picker">TimePicker</a>, both in one Popover.
        Picking a day preserves the current time-of-day; picking a time
        on an empty value defaults the date to today. The emitted value
        is a real <code>Date</code>, so it round-trips with ISO
        serialization, date-fns, and form libraries.
      </p>

      <section className="demo-section">
        <h2>1. Default — 24-hour</h2>
        <CodeExample
          title="Uncontrolled, starts empty"
          code={`<DateTimePicker />`}
        >
          <DateTimePicker />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Controlled</h2>
        <CodeExample
          title="value + onValueChange"
          code={`const [when, setWhen] = useState<Date | undefined>();
<DateTimePicker value={when} onValueChange={setWhen} />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <DateTimePicker value={when} onValueChange={setWhen} />
            <p className="text-xs text-zen-muted-fg m-0">
              ISO: <code>{when?.toISOString() ?? "(none)"}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. 12-hour display</h2>
        <CodeExample
          title='format="12h" — time portion displays AM/PM'
          description="Display only — the value is still a normal Date object."
          code={`<DateTimePicker
  format="12h"
  defaultValue={new Date(2026, 4, 18, 14, 45)}
/>`}
        >
          <DateTimePicker
            format="12h"
            defaultValue={new Date(2026, 4, 18, 14, 45)}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. With seconds</h2>
        <CodeExample
          title="showSeconds — granular timestamping"
          code={`<DateTimePicker showSeconds defaultValue={new Date(2026, 4, 18, 8, 15, 30)} />`}
        >
          <DateTimePicker
            showSeconds
            defaultValue={new Date(2026, 4, 18, 8, 15, 30)}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Quantized minutes — appointment slots</h2>
        <CodeExample
          title="minuteStep={15}"
          description="ArrowUp/Down on the minutes segment jumps in 15-minute steps — useful for booking calendars."
          code={`<DateTimePicker minuteStep={15} format="12h" />`}
        >
          <DateTimePicker minuteStep={15} format="12h" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Disabled past dates</h2>
        <CodeExample
          title="Pass DayPicker's disabled matcher"
          description="Anything DayPicker's disabled prop accepts works here — past dates, weekends, blocked-out ranges."
          code={`<DateTimePicker
  disabled={{ before: new Date() }}
  format="12h"
/>`}
        >
          <DateTimePicker
            disabled={{ before: new Date() }}
            format="12h"
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. Fully disabled</h2>
        <CodeExample
          title="disabled={true}"
          code={`<DateTimePicker disabled defaultValue={new Date()} />`}
        >
          <DateTimePicker disabled defaultValue={new Date()} />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewDateTimePickerDemo;

import { useState } from "react";
import { TimePicker } from "./form/time-picker/time-picker";
import { CodeExample } from "./demo-helpers";

const NewTimePickerDemo: React.FC = () => {
  const [time, setTime] = useState<string | undefined>();

  return (
    <div className="demo-page">
      <h1>TimePicker</h1>
      <p className="lede">
        Segmented numeric time input — hour / minute / optional seconds,
        with an optional AM/PM toggle. Type two digits and the focus
        auto-advances; arrow keys step values with wrap. The emitted
        value is always 24-hour <code>HH:MM</code> (or{" "}
        <code>HH:MM:SS</code>) regardless of display format, so it
        round-trips cleanly with Zod / a backend that expects ISO time
        strings.
      </p>

      <section className="demo-section">
        <h2>1. Default — 24-hour, HH:MM</h2>
        <CodeExample
          title="Uncontrolled"
          code={`<TimePicker defaultValue="09:30" />`}
        >
          <TimePicker defaultValue="09:30" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Controlled</h2>
        <CodeExample
          title="value + onValueChange"
          code={`const [time, setTime] = useState<string | undefined>();
<TimePicker value={time} onValueChange={setTime} />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <TimePicker value={time} onValueChange={setTime} />
            <p className="zen-text-xs zen-text-zen-muted-fg zen-m-0">
              Value: <code>{time ?? "(empty)"}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. 12-hour with AM/PM</h2>
        <CodeExample
          title='format="12h" — display only; emitted value is still 24h'
          description="Press A or P (or arrow keys / space) on the AM/PM segment to toggle."
          code={`<TimePicker format="12h" defaultValue="14:45" />`}
        >
          <TimePicker format="12h" defaultValue="14:45" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. With seconds</h2>
        <CodeExample
          title="showSeconds — HH:MM:SS"
          code={`<TimePicker showSeconds defaultValue="08:15:30" />`}
        >
          <TimePicker showSeconds defaultValue="08:15:30" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Minute stepping</h2>
        <CodeExample
          title="minuteStep={15} — ArrowUp/Down jumps by 15"
          description="Useful for appointment booking where slots are quantized."
          code={`<TimePicker minuteStep={15} defaultValue="10:00" />`}
        >
          <TimePicker minuteStep={15} defaultValue="10:00" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Read-only / disabled</h2>
        <CodeExample
          title="Display existing values or lock the control"
          code={`<TimePicker value="07:00" readOnly />
<TimePicker value="07:00" disabled />`}
        >
          <div style={{ display: "flex", gap: 14 }}>
            <TimePicker value="07:00" readOnly />
            <TimePicker value="07:00" disabled />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. Native form submission</h2>
        <CodeExample
          title='name="meeting_time" — value posts as a hidden input'
          code={`<form onSubmit={(e) => { e.preventDefault();
  const fd = new FormData(e.currentTarget);
  alert(fd.get("meeting_time"));
}}>
  <TimePicker name="meeting_time" defaultValue="13:30" />
  <button type="submit">Submit</button>
</form>`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              alert(`meeting_time = ${fd.get("meeting_time") || "(empty)"}`);
            }}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <TimePicker name="meeting_time" defaultValue="13:30" />
            <button
              type="submit"
              style={{
                padding: "0.375rem 0.75rem",
                background: "var(--zen-color-primary)",
                color: "white",
                border: 0,
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Submit
            </button>
          </form>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewTimePickerDemo;

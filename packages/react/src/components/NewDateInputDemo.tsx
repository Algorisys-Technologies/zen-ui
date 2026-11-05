import { useState } from "react";
import { DateInput } from "./form/date-picker/date-input";
import { Label } from "./form/label/label";
import { CodeExample } from "./demo-helpers";

const fmt = (d: Date | null) =>
  d ? d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "empty";

const NewDateInputDemo = () => {
  const [due, setDue] = useState<Date | null>(() => new Date(2026, 2, 15));
  const [rejected, setRejected] = useState("");
  const [us, setUs] = useState<Date | null>(null);
  const [posting, setPosting] = useState<Date | null>(null);
  const [{ monthStart, monthEnd }] = useState(() => {
    const today = new Date();
    return {
      monthStart: new Date(today.getFullYear(), today.getMonth(), 1),
      monthEnd: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    };
  });
  const [created] = useState(() => new Date(2026, 0, 1));

  return (
    <div className="demo-page">
      <h1>DateInput</h1>
      <p className="lede">
        A date you type, read in the locale's order, with the calendar as a second way in. Built for data entry: 150326 is 15 March 2026, t is today, +7 is a week ahead. A date that does not exist (31/02) is kept as typed and marked, never rolled over into March.
      </p>

      <section className="demo-section">
        <h2>1. Typing a date</h2>
        <CodeExample
          title="Day first (en-IN)"
          description="Try 150326, 15-3, 1503, 15, 2026-03-15, t, y, +7, -1, +2w, +1m. Enter or Tab reads it; ↑ and ↓ move a day (Shift: a month); Alt+↓ opens the calendar; Esc undoes what you typed. Try 31/02/2026: it stays, marked invalid."
          code={`<Label htmlFor="due">Due date</Label>
<DateInput id="due" locale="en-IN" value={due} onValueChange={setDue} onInvalidInput={setRejected} />`}
        >
          <div className="zen-flex zen-flex-col zen-gap-2">
            <Label htmlFor="due">Due date</Label>
            <DateInput
              id="due"
              locale="en-IN"
              value={due}
              onValueChange={(d) => {
                setDue(d);
                setRejected("");
              }}
              onInvalidInput={setRejected}
            />
            <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
              Value: <span data-testid="due-value">{fmt(due)}</span>
              {rejected ? <> · not a date: <span data-testid="due-rejected">{rejected}</span></> : null}
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Month first</h2>
        <CodeExample
          title="en-US reads 03/15/26 as 15 March"
          description={'The order comes from the locale (or order="mdy" directly). ISO 2026-03-15 is read in every locale.'}
          code={`<DateInput locale="en-US" value={d} onValueChange={setD} aria-label="Ship date" />`}
        >
          <div className="zen-flex zen-flex-col zen-gap-2">
            <DateInput locale="en-US" value={us} onValueChange={setUs} aria-label="Ship date" />
            <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
              Value: <span data-testid="us-value">{fmt(us)}</span>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Limits</h2>
        <CodeExample
          title="Only this month, no Sundays"
          description="min, max and isDateDisabled apply to typed dates and the calendar alike. A date outside them is kept and marked, so the clerk sees what they typed."
          code={`<DateInput
  min={monthStart} max={monthEnd}
  isDateDisabled={(d) => d.getDay() === 0}
  value={posting} onValueChange={setPosting}
  aria-label="Posting date"
/>`}
        >
          <div className="zen-flex zen-flex-col zen-gap-2">
            <DateInput
              locale="en-IN"
              min={monthStart}
              max={monthEnd}
              isDateDisabled={(d) => d.getDay() === 0}
              value={posting}
              onValueChange={setPosting}
              aria-label="Posting date"
            />
            <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
              Value: <span data-testid="posting-value">{fmt(posting)}</span>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Disabled</h2>
        <CodeExample
          title="Disabled"
          code={`<DateInput disabled defaultValue={new Date(2026, 0, 1)} aria-label="Created" />`}
        >
          <DateInput locale="en-IN" disabled defaultValue={created} aria-label="Created" />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewDateInputDemo;

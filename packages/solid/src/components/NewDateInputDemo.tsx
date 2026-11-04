import { createSignal } from "solid-js";
import { DateInput } from "./form/date-picker/date-input";
import { Label } from "./form/label/label";
import { DemoPage, DemoSection } from "./demo-helpers";

const fmt = (d: Date | null) =>
  d ? d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "empty";

const NewDateInputDemo = () => {
  const [due, setDue] = createSignal<Date | null>(new Date(2026, 2, 15));
  const [rejected, setRejected] = createSignal("");
  const [us, setUs] = createSignal<Date | null>(null);
  const [posting, setPosting] = createSignal<Date | null>(null);
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return (
    <DemoPage
      title="DateInput"
      description="A date you type, read in the locale's order, with the calendar as a second way in. Built for data entry: 150326 is 15 March 2026, t is today, +7 is a week ahead. A date that does not exist (31/02) is kept as typed and marked, never rolled over into March."
    >
      <DemoSection
        title="1. Typing a date"
        codeTitle="Day first (en-IN)"
        codeDescription="Try 150326, 15-3, 1503, 15, 2026-03-15, t, y, +7, -1, +2w, +1m. Enter or Tab reads it; ↑ and ↓ move a day (Shift: a month); Alt+↓ opens the calendar; Esc undoes what you typed. Try 31/02/2026: it stays, marked invalid."
        code={`<Label for="due">Due date</Label>
<DateInput id="due" locale="en-IN" value={due()} onValueChange={setDue} onInvalidInput={setRejected} />`}
      >
        <div class="zen-flex zen-flex-col zen-gap-2">
          <Label for="due">Due date</Label>
          <DateInput id="due" locale="en-IN" value={due()} onValueChange={(d) => { setDue(d); setRejected(""); }} onInvalidInput={setRejected} />
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
            Value: <span data-testid="due-value">{fmt(due())}</span>
            {rejected() ? <> · not a date: <span data-testid="due-rejected">{rejected()}</span></> : null}
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="2. Month first"
        codeTitle="en-US reads 03/15/26 as 15 March"
        codeDescription="The order comes from the locale (or order=&quot;mdy&quot; directly). ISO 2026-03-15 is read in every locale."
        code={`<DateInput locale="en-US" value={d()} onValueChange={setD} aria-label="Ship date" />`}
      >
        <div class="zen-flex zen-flex-col zen-gap-2">
          <DateInput locale="en-US" value={us()} onValueChange={setUs} aria-label="Ship date" />
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            Value: <span data-testid="us-value">{fmt(us())}</span>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="3. Limits"
        codeTitle="Only this month, no Sundays"
        codeDescription="min, max and isDateDisabled apply to typed dates and the calendar alike. A date outside them is kept and marked, so the clerk sees what they typed."
        code={`<DateInput
  min={monthStart} max={monthEnd}
  isDateDisabled={(d) => d.getDay() === 0}
  value={posting()} onValueChange={setPosting}
  aria-label="Posting date"
/>`}
      >
        <div class="zen-flex zen-flex-col zen-gap-2">
          <DateInput
            locale="en-IN"
            min={monthStart}
            max={monthEnd}
            isDateDisabled={(d) => d.getDay() === 0}
            value={posting()}
            onValueChange={setPosting}
            aria-label="Posting date"
          />
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            Value: <span data-testid="posting-value">{fmt(posting())}</span>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="4. Disabled"
        code={`<DateInput disabled defaultValue={new Date(2026, 0, 1)} aria-label="Created" />`}
      >
        <DateInput locale="en-IN" disabled defaultValue={new Date(2026, 0, 1)} aria-label="Created" />
      </DemoSection>
    </DemoPage>
  );
};

export default NewDateInputDemo;

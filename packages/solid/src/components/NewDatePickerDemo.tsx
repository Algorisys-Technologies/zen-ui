import { createSignal } from "solid-js";
import { DatePicker, Calendar } from "./form/date-picker/date-picker";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewDatePickerDemo = () => {
  const [d, setD] = createSignal<Date | undefined>();
  return (
    <DemoPage
      title="DatePicker"
      description="Date input button that opens a custom Calendar in a Popover. Calendar is also exported standalone for inline use."
    >
      <DemoSection
        title="Controlled"
        codeTitle="value + onValueChange"
        code={`const [d, setD] = createSignal<Date | undefined>();

<DatePicker value={d()} onValueChange={setD} />
<span class="zen-text-xs zen-text-zen-muted-fg">
  {d() ? d()!.toLocaleDateString() : "—"}
</span>`}
      >
        <DatePicker value={d()} onValueChange={setD} />
        <span class="zen-text-xs zen-text-zen-muted-fg">
          {d() ? d()!.toLocaleDateString() : "—"}
        </span>
      </DemoSection>
      <DemoSection
        title="Inline Calendar (single)"
        codeTitle="Use Calendar directly when you don't want a popover"
        codeDescription="Calendar is controlled — pass selected/onSelect to keep the chosen day."
        code={`<Calendar mode="single" />

{/* controlled */}
<Calendar mode="single" selected={d()} onSelect={setD} />`}
      >
        <Calendar mode="single" />
      </DemoSection>
      <DemoSection
        title="Opening on the chosen day"
        codeTitle={'initialFocus="selected"'}
        codeDescription="By default the calendar opens with focus on its first control, Previous month (as it always has). With initialFocus=&quot;selected&quot; it opens on the chosen day, or today, so the arrow keys move between days at once. It becomes the default in the next major version."
        code={`<DatePicker initialFocus="selected" value={d()} onValueChange={setD} />`}
      >
        <div data-testid="initial-focus">
          <DatePicker initialFocus="selected" defaultValue={new Date(2026, 2, 15)} />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewDatePickerDemo;

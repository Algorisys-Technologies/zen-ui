import { createSignal } from "solid-js";
import { DateTimePicker } from "./form/date-picker/date-time-picker";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewDateTimePickerDemo = () => {
  const [when, setWhen] = createSignal<Date | undefined>();
  return (
    <DemoPage
      title="DateTimePicker"
      description="Calendar + TimePicker combo in one popover."
    >
      <DemoSection
        title="24h"
        codeTitle="Controlled — 24-hour is the default"
        codeDescription="The emitted value is a real Date, so it round-trips with ISO serialization and form libraries."
        code={`const [when, setWhen] = createSignal<Date | undefined>();

<DateTimePicker value={when()} onValueChange={setWhen} />
<span class="zen-text-xs zen-text-zen-muted-fg">
  {when()?.toLocaleString() ?? "—"}
</span>`}
      >
        <DateTimePicker value={when()} onValueChange={setWhen} />
        <span class="zen-text-xs zen-text-zen-muted-fg">{when()?.toLocaleString() ?? "—"}</span>
      </DemoSection>
      <DemoSection
        title="12h with seconds"
        codeTitle={`format="12h" + showSeconds`}
        codeDescription="Uncontrolled via defaultValue. format is display-only — the value is still a normal Date."
        code={`<DateTimePicker defaultValue={new Date()} format="12h" showSeconds />`}
      >
        <DateTimePicker defaultValue={new Date()} format="12h" showSeconds />
      </DemoSection>
    </DemoPage>
  );
};

export default NewDateTimePickerDemo;

import { createSignal } from "solid-js";
import { DateRangePicker, type DateRange } from "./form/date-picker/date-range-picker";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewDateRangePickerDemo = () => {
  const [r, setR] = createSignal<DateRange | undefined>();
  return (
    <DemoPage
      title="DateRangePicker"
      description="From–To date range. Two-month calendar by default."
    >
      <DemoSection
        title="Controlled"
        codeTitle="value + onValueChange for external state"
        codeDescription="Pick an anchor day, then an end day; Done applies the range and closes the popover, Cancel discards it."
        code={`const [r, setR] = createSignal<DateRange | undefined>();

<DateRangePicker value={r()} onValueChange={setR} />`}
      >
        <DateRangePicker value={r()} onValueChange={setR} />
      </DemoSection>
      <DemoSection
        title="Single month"
        codeTitle="numberOfMonths={1} for narrow layouts"
        codeDescription="Default is 2 months. Drop to 1 when the popover doesn't have room (mobile, narrow side panels)."
        code={`<DateRangePicker numberOfMonths={1} />`}
      >
        <DateRangePicker numberOfMonths={1} />
      </DemoSection>
    </DemoPage>
  );
};

export default NewDateRangePickerDemo;

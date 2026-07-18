import { createSignal } from "solid-js";
import { TimePicker } from "./form/time-picker/time-picker";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewTimePickerDemo = () => {
  const [t1, setT1] = createSignal<string | undefined>("09:30");
  return (
    <DemoPage
      title="TimePicker"
      description="Segmented HH:MM[:SS] input. 24h or 12h display; emitted value is always 24h."
    >
      <DemoSection
        title="24h (default)"
        codeTitle="value + onValueChange"
        codeDescription={
          <>
            onValueChange emits <code>string | undefined</code> — undefined while
            the hour or minute segment is blank.
          </>
        }
        code={`const [t1, setT1] = createSignal<string | undefined>("09:30");

<TimePicker value={t1()} onValueChange={setT1} />
<span class="zen-text-xs zen-text-zen-muted-fg">Value: {t1() ?? "—"}</span>`}
      >
        <TimePicker value={t1()} onValueChange={setT1} />
        <span class="zen-text-xs zen-text-zen-muted-fg">Value: {t1() ?? "—"}</span>
      </DemoSection>
      <DemoSection
        title="12h with AM/PM toggle"
        codeTitle={`format="12h" — display only; the emitted value is still 24h`}
        code={`<TimePicker defaultValue="14:00" format="12h" />`}
      >
        <TimePicker defaultValue="14:00" format="12h" />
      </DemoSection>
      <DemoSection
        title="With seconds"
        codeTitle="showSeconds — HH:MM:SS"
        code={`<TimePicker defaultValue="08:30:45" showSeconds />`}
      >
        <TimePicker defaultValue="08:30:45" showSeconds />
      </DemoSection>
    </DemoPage>
  );
};

export default NewTimePickerDemo;

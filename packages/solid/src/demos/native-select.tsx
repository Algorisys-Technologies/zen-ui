import { NativeSelect } from "../components/form/native-select/native-select";
import { Label } from "../components/form/label/label";
import { Input } from "../components/form/input/input";
import { DemoPage, DemoSection } from "./demo-helpers";

/**
 * Solid port of React's native-select demo — same four sections. A Solid
 * <select> has no `defaultValue`; NativeSelect applies `value` itself (after
 * the options are inserted) and leaves the control uncontrolled after that, so
 * `value` is the spelling here for what React writes as `defaultValue`.
 */
const NewNativeSelectDemo = () => (
  <DemoPage
    title="Native Select"
    description={
      <>
        A styled <code>&lt;select&gt;</code>. Not a lesser Select — a different
        control for a different job. <strong>Select</strong> is a listbox: reach
        for it when the options need what the platform cannot draw (icons,
        two-line rows, groups, a search field), or when the open state must be
        controlled. <strong>NativeSelect</strong> is the platform control: it
        submits inside a plain <code>&lt;form&gt;</code> with no hidden input and
        no JavaScript, and it opens as the OS picker on a phone.
      </>
    }
  >
    <DemoSection
      title="1. In a form"
      codeTitle="name + value"
      codeDescription="No hidden input and no onChange needed — the browser puts the value in the FormData, which is the whole point of reaching for this over a listbox."
      code={`<form>
  <NativeSelect name="dept_id" value="eng">
    <option value="">Choose a department</option>
    <option value="eng">Engineering</option>
    <option value="sales">Sales</option>
  </NativeSelect>
</form>`}
    >
      <div class="zen-w-72 zen-space-y-1.5">
        <Label for="dept">Department</Label>
        <NativeSelect id="dept" name="dept_id" value="eng">
          <option value="">Choose a department</option>
          <option value="eng">Engineering</option>
          <option value="sales">Sales</option>
          <option value="ops">Operations</option>
        </NativeSelect>
      </div>
    </DemoSection>

    <DemoSection
      title="2. Beside an Input"
      codeTitle="Same height, same border, same focus ring"
      codeDescription="It borrows Input's exact class list, which is the reason it exists — an unstyled browser select next to a styled Input is the mismatch this removes."
      code={`<Input placeholder="Amount" />
<NativeSelect value="inr">…</NativeSelect>`}
    >
      <div class="zen-flex zen-gap-2 zen-w-96">
        <Input placeholder="Amount" />
        <NativeSelect value="inr" class="zen-w-32">
          <option value="inr">INR</option>
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
        </NativeSelect>
      </div>
    </DemoSection>

    <DemoSection
      title="3. Placeholder option"
      codeTitle='An option with value=""'
      codeDescription="The usual way to say 'nothing chosen yet' in a native select, and it pairs with `required` so the browser blocks submission until something is picked. It is NOT greyed: styling the closed control based on which option is selected needs a :has() selector the utility layer does not generate, and dead CSS is worse than none."
      code={`<NativeSelect value="">
  <option value="">Select a shift</option>
  …
</NativeSelect>`}
    >
      <div class="zen-w-72">
        <NativeSelect value="">
          <option value="">Select a shift</option>
          <option value="general">General (09:00–18:00)</option>
          <option value="night">Night (22:00–06:00)</option>
        </NativeSelect>
      </div>
    </DemoSection>

    <DemoSection
      title="4. Disabled and grouped"
      codeTitle="Everything a <select> already does"
      codeDescription="optgroup, disabled options, required — all of it works, because this is the platform control with a class list on it."
      code={`<NativeSelect disabled>…</NativeSelect>

<NativeSelect>
  <optgroup label="Earnings">…</optgroup>
  <optgroup label="Deductions">…</optgroup>
</NativeSelect>`}
    >
      <div class="zen-flex zen-gap-3 zen-w-full">
        <NativeSelect disabled value="locked" class="zen-w-48">
          <option value="locked">Locked</option>
        </NativeSelect>
        <NativeSelect value="basic" class="zen-w-56">
          <optgroup label="Earnings">
            <option value="basic">Basic</option>
            <option value="hra">HRA</option>
          </optgroup>
          <optgroup label="Deductions">
            <option value="pf">Provident Fund</option>
            <option value="tds" disabled>
              TDS (auto)
            </option>
          </optgroup>
        </NativeSelect>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewNativeSelectDemo;

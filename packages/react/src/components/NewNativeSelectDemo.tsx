import { NativeSelect } from "./form/native-select/native-select";
import { Label } from "./form/label/label";
import { Input } from "./form/input/input";
import { CodeExample } from "./demo-helpers";

const NewNativeSelectDemo: React.FC = () => {
  return (
    <div className="demo-page">
      <h1>Native Select</h1>
      <p className="lede">
        A styled <code>&lt;select&gt;</code>. Not a lesser Select — a different
        control for a different job. <strong>Select</strong> is a listbox: reach
        for it when the options need what the platform cannot draw (icons,
        two-line rows, groups, a search field), or when the open state must be
        controlled. <strong>NativeSelect</strong> is the platform control: it
        submits inside a plain <code>&lt;form&gt;</code> with no hidden input and
        no JavaScript, and it opens as the OS picker on a phone.
      </p>

      <section className="demo-section">
        <h2>1. In a form</h2>
        <CodeExample
          title="name + defaultValue"
          description="No hidden input and no onChange needed — the browser puts the value in the FormData, which is the whole point of reaching for this over a listbox."
          code={`<form>
  <NativeSelect name="dept_id" defaultValue="eng">
    <option value="">Choose a department</option>
    <option value="eng">Engineering</option>
    <option value="sales">Sales</option>
  </NativeSelect>
</form>`}
        >
          <div className="zen-w-72 zen-space-y-1.5">
            <Label htmlFor="dept">Department</Label>
            <NativeSelect id="dept" name="dept_id" defaultValue="eng">
              <option value="">Choose a department</option>
              <option value="eng">Engineering</option>
              <option value="sales">Sales</option>
              <option value="ops">Operations</option>
            </NativeSelect>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Beside an Input</h2>
        <CodeExample
          title="Same height, same border, same focus ring"
          description="It borrows Input's exact class list, which is the reason it exists — an unstyled browser select next to a styled Input is the mismatch this removes."
          code={`<Input placeholder="Amount" />
<NativeSelect defaultValue="inr">…</NativeSelect>`}
        >
          <div className="zen-flex zen-gap-2 zen-w-96">
            <Input placeholder="Amount" />
            <NativeSelect defaultValue="inr" className="zen-w-32">
              <option value="inr">INR</option>
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
            </NativeSelect>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Placeholder option</h2>
        <CodeExample
          title="An option with value=&quot;&quot;"
          description="The usual way to say 'nothing chosen yet' in a native select, and it pairs with `required` so the browser blocks submission until something is picked. It is NOT greyed: styling the closed control based on which option is selected needs a :has() selector the utility layer does not generate, and dead CSS is worse than none."
          code={`<NativeSelect defaultValue="">
  <option value="">Select a shift</option>
  …
</NativeSelect>`}
        >
          <div className="zen-w-72">
            <NativeSelect defaultValue="">
              <option value="">Select a shift</option>
              <option value="general">General (09:00–18:00)</option>
              <option value="night">Night (22:00–06:00)</option>
            </NativeSelect>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Disabled and grouped</h2>
        <CodeExample
          title="Everything a <select> already does"
          description="optgroup, disabled options, required — all of it works, because this is the platform control with a class list on it."
          code={`<NativeSelect disabled>…</NativeSelect>

<NativeSelect>
  <optgroup label="Earnings">…</optgroup>
  <optgroup label="Deductions">…</optgroup>
</NativeSelect>`}
        >
          <div className="zen-flex zen-gap-3 zen-w-full">
            <NativeSelect disabled defaultValue="locked" className="zen-w-48">
              <option value="locked">Locked</option>
            </NativeSelect>
            <NativeSelect defaultValue="basic" className="zen-w-56">
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
        </CodeExample>
      </section>
    </div>
  );
};

export default NewNativeSelectDemo;

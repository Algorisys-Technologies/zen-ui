import { createSignal } from "solid-js";
import { Select } from "./form/select/select";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewSelectDemo = () => {
  const [v, setV] = createSignal<string | null>(null);
  return (
    <DemoPage
      title="Select"
      description={
        <>
          Single-select dropdown built on Kobalte Select. Data-driven via{" "}
          <code>options</code> array.
        </>
      }
    >
      <DemoSection
        title="Default"
        codeTitle="Data-driven: pass an options array, not SelectItem children"
        code={`const [v, setV] = createSignal<string | null>(null);

<Select
  options={[
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" },
    { value: "au", label: "Australia" },
  ]}
  value={v() ?? undefined}
  onChange={setV}
  placeholder="Choose a country"
  label="Country"
/>`}
      >
        <div class="zen-w-64">
          <Select
            options={[
              { value: "us", label: "United States" },
              { value: "ca", label: "Canada" },
              { value: "uk", label: "United Kingdom" },
              { value: "au", label: "Australia" },
            ]}
            value={v() ?? undefined}
            onChange={setV}
            placeholder="Choose a country"
            label="Country"
          />
        </div>
      </DemoSection>

      <DemoSection
        title="With error"
        codeTitle="errorMessage marks the trigger invalid and renders below it"
        code={`<Select
  options={[
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ]}
  placeholder="Pick one"
  label="Required field"
  errorMessage="Please pick an option"
/>`}
      >
        <div class="zen-w-64">
          <Select
            options={[
              { value: "a", label: "Option A" },
              { value: "b", label: "Option B" },
            ]}
            placeholder="Pick one"
            label="Required field"
            errorMessage="Please pick an option"
          />
        </div>
      </DemoSection>

      <DemoSection
        title="Disabled"
        codeTitle="disabled on the Select root; per-option via options[].disabled"
        code={`<Select
  options={[{ value: "a", label: "Only option" }]}
  defaultValue="a"
  disabled
  label="Locked field"
/>`}
      >
        <div class="zen-w-64">
          <Select
            options={[{ value: "a", label: "Only option" }]}
            defaultValue="a"
            disabled
            label="Locked field"
          />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewSelectDemo;

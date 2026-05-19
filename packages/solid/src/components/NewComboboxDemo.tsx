import { createSignal } from "solid-js";
import { Combobox } from "./combobox/combobox";
import { DemoPage, DemoSection } from "./demo-helpers";

const FRAMEWORKS = [
  { value: "solid", label: "SolidJS" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
  { value: "preact", label: "Preact" },
  { value: "qwik", label: "Qwik" },
];

const NewComboboxDemo = () => {
  const [picked, setPicked] = createSignal("");
  return (
    <DemoPage
      title="Combobox"
      description="Searchable single-select. Built on Kobalte Combobox."
    >
      <DemoSection title="Sync · in-memory options">
        <Combobox
          options={FRAMEWORKS}
          value={picked()}
          onValueChange={setPicked}
          placeholder="Pick a framework"
        />
      </DemoSection>

      <DemoSection title="Async · server-driven">
        <Combobox
          onSearch={async (q) => {
            await new Promise((r) => setTimeout(r, 200));
            return FRAMEWORKS.filter((f) =>
              f.label.toLowerCase().includes(q.toLowerCase()),
            );
          }}
          placeholder="Search frameworks…"
          debounceMs={150}
        />
      </DemoSection>
    </DemoPage>
  );
};

export default NewComboboxDemo;

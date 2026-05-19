import { createSignal } from "solid-js";
import { MultiCombobox } from "./combobox/multi-combobox";
import { DemoPage, DemoSection } from "./demo-helpers";

const SKILLS = [
  { value: "ts", label: "TypeScript" },
  { value: "rs", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "py", label: "Python" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "elixir", label: "Elixir" },
];

const NewMultiComboboxDemo = () => {
  const [picks, setPicks] = createSignal<string[]>([]);
  return (
    <DemoPage
      title="MultiCombobox"
      description="Searchable multi-select with removable chips."
    >
      <DemoSection title="Controlled">
        <MultiCombobox
          options={SKILLS}
          value={picks()}
          onValueChange={setPicks}
          placeholder="Pick some skills"
        />
        <div class="text-xs text-zen-muted-fg">
          Picked: {picks().join(", ") || "—"}
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewMultiComboboxDemo;

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
  const [tags, setTags] = createSignal([
    { value: "bug", label: "bug" },
    { value: "docs", label: "docs" },
  ]);
  const [picked, setPicked] = createSignal<string[]>([]);
  return (
    <DemoPage
      title="MultiCombobox"
      description="Searchable multi-select with removable chips."
    >
      <DemoSection
        title="Creatable"
        codeTitle="Create a tag and keep going"
        codeDescription="Same contract as Combobox, one difference that follows from the selection model: returning the new option APPENDS it to the selection rather than replacing it, and the popover stays open — creating one tag usually means creating another. Adding the option to your list is still yours."
        code={`const [tags, setTags] = createSignal([{ value: "bug", label: "bug" }, …]);
const [picked, setPicked] = createSignal<string[]>([]);

<MultiCombobox
  options={tags()}
  value={picked()}
  onValueChange={setPicked}
  creatable
  onCreate={(label) => {
    const opt = { value: label.toLowerCase(), label };
    setTags((prev) => [...prev, opt]);   // adding is always yours
    return opt;                           // returning it appends to the selection
  }}
/>`}
      >
        <div style={{ display: "flex", "flex-direction": "column", gap: "10px" }}>
          <MultiCombobox
            options={tags()}
            value={picked()}
            onValueChange={setPicked}
            creatable
            onCreate={(label) => {
              const opt = { value: label.toLowerCase(), label };
              setTags((prev) => [...prev, opt]);
              return opt;
            }}
            placeholder="Pick or create tags"
            searchPlaceholder="Type a tag…"
            width={280}
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            selected → <code>{picked().join(", ") || "none"}</code>
            {"  ·  "}
            all tags → <code>{tags().map((t) => t.label).join(", ")}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="Controlled"
        codeTitle="value as string[] + onValueChange"
        codeDescription="Selected options render as removable chips in the trigger; picking an option in the popover toggles it instead of closing."
        code={`const SKILLS = [
  { value: "ts", label: "TypeScript" },
  { value: "rs", label: "Rust" },
  { value: "go", label: "Go" },
];

const [picks, setPicks] = createSignal<string[]>([]);

<MultiCombobox
  options={SKILLS}
  value={picks()}
  onValueChange={setPicks}
  placeholder="Pick some skills"
/>

<div class="zen-text-xs zen-text-zen-muted-fg">
  Picked: {picks().join(", ") || "—"}
</div>`}
      >
        <MultiCombobox
          options={SKILLS}
          value={picks()}
          onValueChange={setPicks}
          placeholder="Pick some skills"
        />
        <div class="zen-text-xs zen-text-zen-muted-fg">
          Picked: {picks().join(", ") || "—"}
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewMultiComboboxDemo;

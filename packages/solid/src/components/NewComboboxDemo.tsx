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
  // The component never touches `options` — creating and selecting is the
  // caller's job, which is exactly what this section demonstrates.
  const [tags, setTags] = createSignal([
    { value: "bug", label: "bug" },
    { value: "docs", label: "docs" },
  ]);
  const [tag, setTag] = createSignal("");

  return (
    <DemoPage
      title="Combobox"
      description="Searchable single-select. Built on Kobalte Combobox."
    >
      <DemoSection
        title="Creatable"
        codeTitle="Offer the typed text when it matches nothing"
        codeDescription="Type a tag that does not exist — 'design', say — and the list offers to create it instead of saying 'No results'. Adding the option is always yours: the component cannot know where your list lives or what a new value should be. RETURN the new option and it is selected for you; return nothing and the value is left alone. Typing an existing label offers nothing, because it already exists."
        code={`const [tags, setTags] = createSignal([{ value: "bug", label: "bug" }, …]);

<Combobox
  options={tags()}
  value={tag()}
  onValueChange={setTag}
  creatable
  onCreate={(label) => {
    const opt = { value: label.toLowerCase(), label };
    setTags((prev) => [...prev, opt]);   // adding is always yours
    return opt;                           // returning it selects it for you
  }}
/>`}
      >
        <div style={{ display: "flex", "flex-direction": "column", gap: "10px" }}>
          <Combobox
            options={tags()}
            value={tag()}
            onValueChange={setTag}
            creatable
            onCreate={(label) => {
              const opt = { value: label.toLowerCase(), label };
              setTags((prev) => [...prev, opt]);
              return opt;
            }}
            placeholder="Pick or create a tag"
            searchPlaceholder="Type a tag…"
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            tags → <code>{tags().map((t) => t.label).join(", ")}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="Sync · in-memory options"
        codeTitle="Static list, filtered as you type"
        code={`const FRAMEWORKS = [
  { value: "solid", label: "SolidJS" },
  { value: "react", label: "React" },
  // …
];

const [picked, setPicked] = createSignal("");

<Combobox
  options={FRAMEWORKS}
  value={picked()}
  onValueChange={setPicked}
  placeholder="Pick a framework"
/>`}
      >
        <Combobox
          options={FRAMEWORKS}
          value={picked()}
          onValueChange={setPicked}
          placeholder="Pick a framework"
        />
      </DemoSection>

      <DemoSection
        title="Async · server-driven"
        codeTitle="Pass onSearch instead of options"
        codeDescription="Debounced; stale responses are discarded. A loading row shows while the request is in flight."
        code={`<Combobox
  onSearch={async (query) => {
    const res = await fetch(\`/api/frameworks?q=\${query}\`);
    return res.json(); // [{ value, label }]
  }}
  placeholder="Search frameworks…"
  debounceMs={150}
/>`}
      >
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

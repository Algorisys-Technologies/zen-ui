import { useMemo, useState } from "react";
import { Combobox, type ComboboxOption } from "./combobox/combobox";
import { CodeExample } from "./demo-helpers";

/* -------------------------- sample data --------------------------- */
const FRAMEWORKS: ComboboxOption[] = [
  { value: "next", label: "Next.js", keywords: ["vercel", "react"] },
  { value: "sveltekit", label: "SvelteKit", keywords: ["svelte"] },
  { value: "nuxt", label: "Nuxt", keywords: ["vue"] },
  { value: "remix", label: "Remix", keywords: ["react", "router"] },
  { value: "astro", label: "Astro", keywords: ["static"] },
  { value: "solid-start", label: "SolidStart", keywords: ["solid"] },
  { value: "qwik", label: "Qwik", keywords: ["resumability"] },
];

// Larger list for the fuzzy-filter demo
const NAMES = Array.from({ length: 500 }, (_, i) => ({
  value: `n-${i}`,
  label: `Contact #${i + 1}`,
}));

// Simulated remote search — returns results after a fake network delay
const fakeSearch = async (query: string): Promise<ComboboxOption[]> => {
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
  const q = query.trim().toLowerCase();
  if (!q) {
    // Default "starter" list
    return NAMES.slice(0, 10);
  }
  return NAMES.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 30);
};

const NewComboboxDemo: React.FC = () => {
  const [pickedSync, setPickedSync] = useState("");
  // The component never touches `options` — creating and selecting is the
  // caller's job, which is exactly what this section demonstrates.
  const [tags, setTags] = useState<ComboboxOption[]>([
    { value: "bug", label: "bug" },
    { value: "docs", label: "docs" },
  ]);
  const [tag, setTag] = useState("");
  const [pickedLarge, setPickedLarge] = useState("");
  const [pickedAsync, setPickedAsync] = useState("");

  const grouped = useMemo(() => FRAMEWORKS, []);

  return (
    <div className="demo-page">
      <h1>Combobox + Async select</h1>
      <p className="lede">
        Searchable single-select on <code>cmdk</code> (fuzzy filtering +
        keyboard) inside a Radix <code>Popover</code>. Sync (in-memory) and
        async (server-driven with debounce + abort) modes share one
        component — pass <code>options</code> or <code>onSearch</code>.
      </p>

      <section className="demo-section">
        <h2>0. Creatable</h2>
        <CodeExample
          title="Offer the typed text when it matches nothing"
          description="Type a tag that does not exist — 'design', say — and the list offers to create it instead of saying 'No results'. Adding the option is always yours: the component cannot know where your list lives or what a new value should be. RETURN the new option and it is selected for you; return nothing and the value is left alone. Typing an existing label offers nothing, because it already exists."
          code={`const [tags, setTags] = useState([{ value: "bug", label: "bug" }, …]);

<Combobox
  options={tags}
  value={tag}
  onValueChange={setTag}
  creatable
  onCreate={(label) => {
    const opt = { value: label.toLowerCase(), label };
    setTags((prev) => [...prev, opt]);   // adding is always yours
    return opt;                           // returning it selects it for you
  }}
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Combobox
              options={tags}
              value={tag}
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
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              tags → <code>{tags.map((t) => t.label).join(", ")}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>1. Basic — in-memory options</h2>
        <CodeExample
          title="Static list, fuzzy-filtered as you type"
          code={`const options = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  ...
];

<Combobox
  options={options}
  value={value}
  onValueChange={setValue}
  placeholder="Pick a framework"
/>`}
        >
          <Combobox
            options={grouped}
            value={pickedSync}
            onValueChange={(v) => setPickedSync(v)}
            placeholder="Pick a framework"
            searchPlaceholder="Search frameworks…"
          />
          <span style={{ marginLeft: 12, fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            value: {pickedSync || "(none)"}
          </span>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. With keywords — extra fuzzy-match terms</h2>
        <CodeExample
          title="Per-option keywords boost the filter"
          description={`Type "vercel" or "router" — cmdk matches via the keywords array even though the label doesn't contain those words.`}
          code={`<Combobox
  options={[
    { value: "next", label: "Next.js", keywords: ["vercel", "react"] },
    { value: "remix", label: "Remix", keywords: ["react", "router"] },
    ...
  ]}
  ...
/>`}
        >
          <Combobox
            options={grouped}
            placeholder="Search by alias"
            searchPlaceholder="Try 'vercel' or 'router'…"
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. 500-option list — cmdk filters fast</h2>
        <CodeExample
          title="cmdk handles a few hundred items without virtualization"
          description="For ≥ 5,000 items you'd combine Combobox with VirtualizedItems on the result list."
          code={`<Combobox options={makeOptions(500)} ... />`}
        >
          <Combobox
            options={NAMES}
            value={pickedLarge}
            onValueChange={(v) => setPickedLarge(v)}
            placeholder="Pick a contact"
            width={280}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Async — server-driven search</h2>
        <CodeExample
          title="Pass onSearch instead of options"
          description="Debounced, stale-request-aborted, with loading + empty states. Try typing slowly to see the loader."
          code={`<Combobox
  value={value}
  onValueChange={setValue}
  onSearch={async (query) => {
    const res = await fetch(\`/api/contacts?q=\${query}\`);
    return res.json();        // [{ value, label }]
  }}
  debounceMs={250}
  searchPlaceholder="Search contacts…"
/>`}
        >
          <Combobox
            value={pickedAsync}
            onValueChange={(v) => setPickedAsync(v)}
            onSearch={fakeSearch}
            placeholder="Search the server"
            searchPlaceholder="Type to query…"
            width={280}
            debounceMs={250}
          />
          <span style={{ marginLeft: 12, fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            value: {pickedAsync || "(none)"}
          </span>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Disabled options</h2>
        <CodeExample
          title="Per-option disabled flag"
          code={`<Combobox
  options={[
    { value: "free", label: "Free" },
    { value: "pro",  label: "Pro" },
    { value: "team", label: "Team (waitlist)", disabled: true },
  ]}
/>`}
        >
          <Combobox
            options={[
              { value: "free", label: "Free" },
              { value: "pro", label: "Pro" },
              { value: "team", label: "Team (waitlist)", disabled: true },
            ]}
            placeholder="Choose a plan"
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Disabled trigger</h2>
        <CodeExample
          title="Whole combobox disabled"
          code={`<Combobox options={...} disabled />`}
        >
          <Combobox options={grouped} disabled placeholder="Locked" />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewComboboxDemo;

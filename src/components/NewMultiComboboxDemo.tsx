import { useState } from "react";
import { MultiCombobox } from "./combobox/multi-combobox";
import type { ComboboxOption } from "./combobox/combobox";
import { CodeExample } from "./demo-helpers";

const ROLES: ComboboxOption[] = [
  { value: "engineer", label: "Engineer" },
  { value: "designer", label: "Designer" },
  { value: "pm", label: "Product Manager" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "marketing", label: "Marketing" },
  { value: "ops", label: "Operations" },
  { value: "finance", label: "Finance" },
];

const COUNTRIES: ComboboxOption[] = [
  { value: "in", label: "India", keywords: ["IN"] },
  { value: "us", label: "United States", keywords: ["USA", "America"] },
  { value: "gb", label: "United Kingdom", keywords: ["UK", "Britain"] },
  { value: "de", label: "Germany", keywords: ["DE"] },
  { value: "fr", label: "France", keywords: ["FR"] },
  { value: "jp", label: "Japan", keywords: ["JP"] },
  { value: "br", label: "Brazil", keywords: ["BR"] },
  { value: "au", label: "Australia", keywords: ["AU"] },
];

/* Fake server lookup for the async demo: filter a large in-memory list
 * after a 300ms delay. */
const ALL_USERS: ComboboxOption[] = Array.from({ length: 200 }, (_, i) => ({
  value: `user-${i + 1}`,
  label: `User ${i + 1}`,
  keywords: [`u${i + 1}`],
}));
const fakeSearch = (q: string): Promise<ComboboxOption[]> =>
  new Promise((res) =>
    setTimeout(() => {
      const needle = q.toLowerCase();
      res(
        ALL_USERS.filter(
          (o) =>
            o.label.toLowerCase().includes(needle) ||
            o.value.toLowerCase().includes(needle),
        ).slice(0, 30),
      );
    }, 300),
  );

const NewMultiComboboxDemo: React.FC = () => {
  const [roles, setRoles] = useState<string[]>(["engineer", "designer"]);
  const [countries, setCountries] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  return (
    <div className="demo-page">
      <h1>MultiCombobox</h1>
      <p className="lede">
        Multi-select sibling of <code>&lt;Combobox&gt;</code>. Selected
        options render as removable chips inside the trigger; clicking
        an option in the popover toggles it instead of closing. Same
        sync / async option-loading story.
      </p>

      <section className="demo-section">
        <h2>1. Synchronous — pick multiple roles</h2>
        <CodeExample
          title="value as string[] + onValueChange"
          code={`const [roles, setRoles] = useState<string[]>(["engineer", "designer"]);

<MultiCombobox
  options={ROLES}
  value={roles}
  onValueChange={setRoles}
  placeholder="Pick roles"
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <MultiCombobox
              options={ROLES}
              value={roles}
              onValueChange={setRoles}
              placeholder="Pick roles"
              width={320}
            />
            <p className="text-xs text-zen-muted-fg m-0">
              Picked: <code>{JSON.stringify(roles)}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Overflow — many selections collapse into "+N more"</h2>
        <CodeExample
          title="maxDisplayed (default 3) caps chips in the trigger"
          description="Selected items beyond the cap appear as '+N more' so the trigger doesn't grow unbounded. Click the trigger to see / remove items from inside the popover (or click a chip's ✕)."
          code={`<MultiCombobox
  options={COUNTRIES}
  value={countries}
  onValueChange={setCountries}
  maxDisplayed={2}
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <MultiCombobox
              options={COUNTRIES}
              value={countries}
              onValueChange={setCountries}
              placeholder="Pick countries"
              maxDisplayed={2}
              width={320}
            />
            <p className="text-xs text-zen-muted-fg m-0">
              {countries.length === 0
                ? "Pick a few countries to see the +N overflow"
                : `Picked: ${countries.join(", ")}`}
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Async — server-driven option loading</h2>
        <CodeExample
          title="onSearch replaces options; same debounce + abort-on-stale as Combobox"
          description="The label-cache lets chips keep their human label even after the async result page rotates to a different query."
          code={`<MultiCombobox
  onSearch={async (q) => {
    const res = await fetch(\`/api/users?q=\${q}\`);
    return res.json();
  }}
  value={users}
  onValueChange={setUsers}
  debounceMs={300}
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <MultiCombobox
              onSearch={fakeSearch}
              value={users}
              onValueChange={setUsers}
              placeholder="Assign users"
              debounceMs={300}
              width={360}
            />
            <p className="text-xs text-zen-muted-fg m-0">
              Picked {users.length} user(s). Try typing then clearing
              the query — chips keep their labels even when the
              underlying option list rotates.
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Uncontrolled + clear-all</h2>
        <CodeExample
          title='defaultValue + the built-in "Clear all" affordance'
          description="When ≥ 1 item is selected, a Clear all button shows at the bottom of the popover. Toggle off via showClearAll={false} if you want to hide it."
          code={`<MultiCombobox
  options={ROLES}
  defaultValue={["engineer", "pm"]}
  placeholder="Pick roles"
/>`}
        >
          <MultiCombobox
            options={ROLES}
            defaultValue={["engineer", "pm"]}
            placeholder="Pick roles"
            width={300}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Disabled</h2>
        <CodeExample
          title="disabled locks the whole control"
          code={`<MultiCombobox options={ROLES} defaultValue={["engineer"]} disabled />`}
        >
          <MultiCombobox
            options={ROLES}
            defaultValue={["engineer"]}
            disabled
            placeholder="Locked"
            width={280}
          />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewMultiComboboxDemo;

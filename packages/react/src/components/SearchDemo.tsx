import { useState } from "react";
import { Search } from "./form/search/search";
import { CodeExample } from "./demo-helpers";

const FRUITS = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Grape", "Lemon", "Mango", "Orange", "Peach"];

const SearchDemo: React.FC = () => {
  const [q, setQ] = useState("");
  const matches = FRUITS.filter((f) => f.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="demo-page">
      <h1>Search</h1>
      <p className="lede">
        A search field as one component instead of a pattern reinvented per screen. Magnifier, a{" "}
        <code>type="search"</code> input (so the platform gives it <code>role="searchbox"</code>), and a
        keyboard-reachable clear button that shows only when there is text. zen-ui inlined this affordance
        seven times — ShellBar, ValueHelp, SelectDialog, DataTable, the select list, Combobox and
        MultiCombobox — before it was extracted here.
      </p>

      <section className="demo-section">
        <h2>1. Basic</h2>
        <CodeExample title="Uncontrolled" code={`<Search placeholder="Search components" />`}>
          <div style={{ width: "100%", maxWidth: 360 }}>
            <Search placeholder="Search components" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Controlled, with live filtering</h2>
        <CodeExample
          title="value + onValueChange"
          code={`const [q, setQ] = useState("");
<Search value={q} onValueChange={setQ} placeholder="Filter fruit…" />`}
        >
          <div style={{ width: "100%", maxWidth: 360 }}>
            <Search value={q} onValueChange={setQ} placeholder="Filter fruit…" />
            <ul style={{ marginTop: 12, display: "grid", gap: 4, fontSize: "0.8125rem" }}>
              {matches.length > 0 ? (
                matches.map((m) => <li key={m}>{m}</li>)
              ) : (
                <li style={{ color: "var(--zen-color-muted-fg)" }}>No matches for “{q}”.</li>
              )}
            </ul>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Sizes</h2>
        <CodeExample
          title="sm / md / lg"
          code={`<Search size="sm" placeholder="Small" />
<Search size="md" placeholder="Medium (default)" />
<Search size="lg" placeholder="Large" />`}
        >
          <div style={{ display: "grid", gap: 10, width: "100%", maxWidth: 360 }}>
            <Search size="sm" placeholder="Small" />
            <Search size="md" placeholder="Medium (default)" />
            <Search size="lg" placeholder="Large" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Disabled</h2>
        <CodeExample title="disabled" code={`<Search disabled defaultValue="Read only" />`}>
          <div style={{ width: "100%", maxWidth: 360 }}>
            <Search disabled defaultValue="Read only" />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default SearchDemo;

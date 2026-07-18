import { createSignal, For, Show } from "solid-js";
import { Search } from "./form/search/search";
import { DemoPage, DemoSection } from "./demo-helpers";

const FRUITS = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Grape", "Lemon", "Mango", "Orange", "Peach"];

const SearchDemo = () => {
  const [q, setQ] = createSignal("");
  const matches = () => FRUITS.filter((f) => f.toLowerCase().includes(q().toLowerCase()));

  return (
    <DemoPage
      title="Search"
      description="A search field as one component instead of a pattern reinvented per screen. Magnifier, a type='search' input (role='searchbox'), and a keyboard-reachable clear button that shows only when there is text. zen-ui inlined this affordance seven times before it was extracted here."
    >
      <DemoSection
        title="Basic"
        codeTitle="Uncontrolled"
        code={`<Search placeholder="Search components" />`}
      >
        <div class="zen-w-full" style={{ "max-width": "360px" }}>
          <Search placeholder="Search components" />
        </div>
      </DemoSection>

      <DemoSection
        title="Controlled, with live filtering"
        codeTitle="value + onValueChange"
        code={`const [q, setQ] = createSignal("");
<Search value={q()} onValueChange={setQ} placeholder="Filter fruit…" />`}
      >
        <div class="zen-w-full" style={{ "max-width": "360px" }}>
          <Search value={q()} onValueChange={setQ} placeholder="Filter fruit…" />
          <ul class="zen-mt-3 zen-grid zen-gap-1 zen-text-sm">
            <Show
              when={matches().length > 0}
              fallback={<li class="zen-text-zen-muted-fg">No matches for “{q()}”.</li>}
            >
              <For each={matches()}>{(m) => <li>{m}</li>}</For>
            </Show>
          </ul>
        </div>
      </DemoSection>

      <DemoSection
        title="Sizes"
        codeTitle="sm / md / lg"
        code={`<Search size="sm" placeholder="Small" />
<Search size="md" placeholder="Medium (default)" />
<Search size="lg" placeholder="Large" />`}
      >
        <div class="zen-grid zen-gap-2.5 zen-w-full" style={{ "max-width": "360px" }}>
          <Search size="sm" placeholder="Small" />
          <Search size="md" placeholder="Medium (default)" />
          <Search size="lg" placeholder="Large" />
        </div>
      </DemoSection>

      <DemoSection title="Disabled" codeTitle="disabled" code={`<Search disabled defaultValue="Read only" />`}>
        <div class="zen-w-full" style={{ "max-width": "360px" }}>
          <Search disabled defaultValue="Read only" />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default SearchDemo;

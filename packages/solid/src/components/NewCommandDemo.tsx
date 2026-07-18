import { type JSX, createSignal, For, Show } from "solid-js";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandLoading,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "./command/command";
import { DemoPage, DemoSection } from "./demo-helpers";

/** Framed shell so each palette reads as a floating surface. */
const Shell = (props: { children: JSX.Element }) => (
  <div class="zen-w-full zen-max-w-md zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background">
    {props.children}
  </div>
);

const NewCommandDemo = () => {
  const [picked, setPicked] = createSignal("(none)");
  const [loading, setLoading] = createSignal(false);
  const [results, setResults] = createSignal<string[]>([]);

  // Simulated remote search — mirrors how you'd drive CommandLoading from a
  // real request. shouldFilter={false} hands filtering to the server.
  let seq = 0;
  const search = (q: string) => {
    const mine = ++seq;
    if (!q.trim()) {
      setLoading(false);
      setResults([]);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (mine !== seq) return; // stale response
      setResults(
        Array.from({ length: 5 }, (_, i) => `${q} — result ${i + 1}`),
      );
      setLoading(false);
    }, 500);
  };

  return (
    <DemoPage
      title="Command"
      description="Command-palette / autocomplete engine: filtering, keyboard nav (arrow keys, home/end, enter), grouping, accessibility. The React binding wraps cmdk, which is React-only; this is a from-scratch Solid engine mirroring cmdk's public API and its DOM contract (same cmdk-* and data-selected attributes), so styling is identical across both bindings."
    >
      <DemoSection
        title="1. Basic palette"
        codeTitle="Command + CommandInput + CommandList"
        codeDescription="Type to filter; use ↑/↓ and Enter. Items infer their value from textContent."
        code={`<Command label="Command menu">
  <CommandInput placeholder="Type a command or search…" />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem onSelect={setPicked}>Calendar</CommandItem>
      <CommandItem onSelect={setPicked}>Search Emoji</CommandItem>
      <CommandItem onSelect={setPicked}>Calculator</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`}
      >
        <Shell>
          <Command label="Command menu">
            <CommandInput placeholder="Type a command or search…" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem onSelect={setPicked}>Calendar</CommandItem>
                <CommandItem onSelect={setPicked}>Search Emoji</CommandItem>
                <CommandItem onSelect={setPicked}>Calculator</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </Shell>
        <span class="zen-text-sm zen-text-zen-muted-fg">selected: {picked()}</span>
      </DemoSection>

      <DemoSection
        title="2. Groups + separator"
        codeTitle="CommandGroup headings with CommandSeparator between"
        code={`<CommandList>
  <CommandGroup heading="Suggestions">
    <CommandItem>Calendar</CommandItem>
  </CommandGroup>
  <CommandSeparator />
  <CommandGroup heading="Settings">
    <CommandItem>Profile</CommandItem>
    <CommandItem>Billing</CommandItem>
  </CommandGroup>
</CommandList>`}
      >
        <Shell>
          <Command label="Grouped command menu">
            <CommandInput placeholder="Search…" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>Calendar</CommandItem>
                <CommandItem>Search Emoji</CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem>Profile</CommandItem>
                <CommandItem>Billing</CommandItem>
                <CommandItem>Keyboard shortcuts</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </Shell>
      </DemoSection>

      <DemoSection
        title="3. Keywords — extra fuzzy-match terms"
        codeTitle="Per-item keywords boost the filter"
        codeDescription={`Type "vercel" or "router" — the item matches via its keywords even though the label doesn't contain those words.`}
        code={`<CommandItem keywords={["vercel", "react"]}>Next.js</CommandItem>
<CommandItem keywords={["react", "router"]}>Remix</CommandItem>`}
      >
        <Shell>
          <Command label="Keyword search">
            <CommandInput placeholder="Try 'vercel' or 'router'…" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Frameworks">
                <CommandItem keywords={["vercel", "react"]}>Next.js</CommandItem>
                <CommandItem keywords={["svelte"]}>SvelteKit</CommandItem>
                <CommandItem keywords={["vue"]}>Nuxt</CommandItem>
                <CommandItem keywords={["react", "router"]}>Remix</CommandItem>
                <CommandItem keywords={["solid"]}>SolidStart</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </Shell>
      </DemoSection>

      <DemoSection
        title="4. Disabled items"
        codeTitle="Per-item disabled flag"
        codeDescription="Disabled items stay visible and filterable but are skipped by keyboard nav and can't be selected."
        code={`<CommandItem>Free</CommandItem>
<CommandItem>Pro</CommandItem>
<CommandItem disabled>Team (waitlist)</CommandItem>`}
      >
        <Shell>
          <Command label="Plan picker">
            <CommandInput placeholder="Choose a plan…" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Plans">
                <CommandItem>Free</CommandItem>
                <CommandItem>Pro</CommandItem>
                <CommandItem disabled>Team (waitlist)</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </Shell>
      </DemoSection>

      <DemoSection
        title="5. Async — server-driven search"
        codeTitle="shouldFilter={false} + CommandLoading"
        codeDescription="Turn off local filtering and render whatever the server returned. Try typing to see the loader."
        code={`<Command shouldFilter={false}>
  <CommandInput onValueChange={search} placeholder="Type to query…" />
  <CommandList>
    <Show when={loading()}>
      <CommandLoading>Searching…</CommandLoading>
    </Show>
    <Show when={!loading()}>
      <CommandEmpty>No results found.</CommandEmpty>
    </Show>
    <For each={results()}>
      {(r) => <CommandItem>{r}</CommandItem>}
    </For>
  </CommandList>
</Command>`}
      >
        <Shell>
          <Command label="Async search" shouldFilter={false}>
            <CommandInput onValueChange={search} placeholder="Type to query…" />
            <CommandList>
              <Show when={loading()}>
                <CommandLoading>Searching…</CommandLoading>
              </Show>
              <Show when={!loading()}>
                <CommandEmpty>No results found.</CommandEmpty>
              </Show>
              <For each={results()}>
                {(r) => <CommandItem onSelect={setPicked}>{r}</CommandItem>}
              </For>
            </CommandList>
          </Command>
        </Shell>
      </DemoSection>

      <DemoSection
        title="6. Looping keyboard nav"
        codeTitle="loop wraps ↑/↓ around the ends"
        code={`<Command loop>…</Command>`}
      >
        <Shell>
          <Command label="Looping menu" loop>
            <CommandInput placeholder="Hold ↓ past the last item…" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Items">
                <CommandItem>First</CommandItem>
                <CommandItem>Second</CommandItem>
                <CommandItem>Third</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </Shell>
      </DemoSection>
    </DemoPage>
  );
};

export default NewCommandDemo;

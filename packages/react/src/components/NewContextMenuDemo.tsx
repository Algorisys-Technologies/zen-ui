import { useState } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "./context-menu/context-menu";
import { CodeExample } from "./demo-helpers";

const DOCUMENTS = [
  { name: "SI/26/00012", kind: "Sales Invoice", party: "Acme Traders" },
  { name: "SO/26/00031", kind: "Sales Order", party: "Acme Traders" },
  { name: "PO/26/00007", kind: "Purchase Order", party: "Kaveri Steel" },
  { name: "DN/26/00019", kind: "Delivery Note", party: "Nilgiri Foods" },
];

const NewContextMenuDemo: React.FC = () => {
  const [grid, setGrid] = useState(true);
  const [sortBy, setSortBy] = useState("name");
  const [last, setLast] = useState("");
  // The document the menu was opened on: read from the element right-clicked
  // (or focused, from the keyboard) when the menu opens.
  const [target, setTarget] = useState(DOCUMENTS[0]);

  return (
    <div className="demo-page">
      <h1>ContextMenu</h1>
      <p className="lede">
        The menu a right-click opens, at the pointer. Opens from the keyboard too (the menu key or Shift+F10), and on
        a long press on touch. Its items are DropdownMenu&apos;s.
      </p>

      <section className="demo-section">
        <h2>1. Right-click an area</h2>
        <CodeExample
          title="Trigger + content + items"
          description="Right-click inside the box. Items, checkbox and radio items, submenus and shortcuts look and behave as DropdownMenu's, under ContextMenu names."
          code={`<ContextMenu>
  <ContextMenuTrigger className="…">Right-click here</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onSelect={refresh}>Refresh<ContextMenuShortcut>F5</ContextMenuShortcut></ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuCheckboxItem checked={grid} onCheckedChange={setGrid}>Show grid</ContextMenuCheckboxItem>
    <ContextMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
      <ContextMenuLabel>Sort by</ContextMenuLabel>
      <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
      <ContextMenuRadioItem value="date">Date</ContextMenuRadioItem>
    </ContextMenuRadioGroup>
    <ContextMenuSub>
      <ContextMenuSubTrigger>New</ContextMenuSubTrigger>
      <ContextMenuSubContent>…</ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuContent>
</ContextMenu>`}
        >
          <ContextMenu>
            <ContextMenuTrigger
              data-testid="area"
              className="zen-flex zen-h-40 zen-w-full zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-dashed zen-border-zen-border zen-text-sm zen-text-zen-muted-fg"
            >
              Right-click here
            </ContextMenuTrigger>
            <ContextMenuContent className="zen-w-56">
              <ContextMenuItem onSelect={() => setLast("Refresh")}>
                Refresh<ContextMenuShortcut>F5</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => setLast("Paste")}>
                Paste<ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuCheckboxItem checked={grid} onCheckedChange={setGrid}>
                Show grid
              </ContextMenuCheckboxItem>
              <ContextMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                <ContextMenuLabel inset>Sort by</ContextMenuLabel>
                <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
                <ContextMenuRadioItem value="date">Date</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
              <ContextMenuSeparator />
              <ContextMenuSub>
                <ContextMenuSubTrigger>New</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem onSelect={() => setLast("New Sales Invoice")}>Sales Invoice</ContextMenuItem>
                  <ContextMenuItem onSelect={() => setLast("New Purchase Order")}>Purchase Order</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuContent>
          </ContextMenu>
          <p className="zen-mt-2 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
            Grid {grid ? "on" : "off"} · sorted by {sortBy}
          </p>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. On the things it acts on, and from the keyboard</h2>
        <CodeExample
          title="One menu for a list; the item is read from what was right-clicked"
          description="Right-click a document, or Tab to one and press the menu key or Shift+F10: the menu opens at that document, its first item active. Esc closes it and focus returns to the document."
          code={`const [target, setTarget] = useState<Doc>(docs[0]);
<ContextMenu>
  <ContextMenuTrigger
    onContextMenu={(e) => {
      const el = (e.target as Element).closest<HTMLElement>("[data-doc]");
      if (el) setTarget(byName(el.dataset.doc));
    }}
  >
    {docs.map((d) => <button key={d.name} data-doc={d.name}>…</button>)}
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuLabel>{target.name}</ContextMenuLabel>
    <ContextMenuItem onSelect={() => openInNewTab(target)}>Open in new tab</ContextMenuItem>
    …
  </ContextMenuContent>
</ContextMenu>`}
        >
          <ContextMenu>
            <ContextMenuTrigger
              className="zen-grid zen-w-full zen-max-w-xl zen-gap-1"
              onContextMenu={(e) => {
                const el = (e.target as Element).closest<HTMLElement>("[data-doc]");
                const doc = DOCUMENTS.find((d) => d.name === el?.dataset.doc);
                if (doc) setTarget(doc);
              }}
            >
              {DOCUMENTS.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  data-doc={d.name}
                  className="zen-flex zen-items-baseline zen-gap-3 zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-px-2 zen-py-2 zen-text-start zen-text-sm hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
                >
                  <span className="zen-font-medium zen-tabular-nums">{d.name}</span>
                  <span className="zen-text-zen-muted-fg">
                    {d.kind} · {d.party}
                  </span>
                </button>
              ))}
            </ContextMenuTrigger>
            <ContextMenuContent className="zen-w-60">
              <ContextMenuLabel>{target.name}</ContextMenuLabel>
              <ContextMenuItem onSelect={() => setLast(`Opened ${target.name} in a new tab`)}>
                Open in new tab<ContextMenuShortcut>Ctrl+Enter</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => setLast(`Opened ${target.name} beside`)}>Open beside</ContextMenuItem>
              <ContextMenuItem onSelect={() => setLast(`Copied "${target.name}"`)}>Copy name</ContextMenuItem>
              <ContextMenuItem onSelect={() => setLast(`Duplicated ${target.name}`)}>Duplicate</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem variant="destructive" onSelect={() => setLast(`Asked to delete ${target.name}`)}>
                Delete…
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <p className="zen-mt-2 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
            <span data-testid="last-action">{last || "Nothing chosen yet."}</span>
          </p>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewContextMenuDemo;

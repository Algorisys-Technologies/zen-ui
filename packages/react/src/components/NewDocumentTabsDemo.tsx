import { useState } from "react";
import { DocumentTabs, type DocumentTab } from "./document-tabs/document-tabs";
import { CodeExample } from "./demo-helpers";

/**
 * DocumentTabs demo. The panels are the page's own (a workspace keeps each
 * document alive while it is hidden), so the demo shows the strip and what it
 * reports.
 */

const START: DocumentTab[] = [
  { id: "home", label: "Dashboard", pinned: true },
  { id: "si12", label: "SI/26/00012", description: "Sales Invoice", dirty: true },
  { id: "so4", label: "SO/26/00004", description: "Sales Order" },
  { id: "it", label: "STEEL-SHEET-2MM", description: "Item" },
  { id: "cu", label: "Flipkart Internet Private Limited", description: "Customer" },
];

const MANY: DocumentTab[] = Array.from({ length: 10 }, (_, i) => ({
  id: `t${i}`,
  label: `SI/26/0001${i}`,
  description: "Sales Invoice",
}));
const noop = () => undefined;
const closeHint = () => "Close (Alt+W)";

const NewDocumentTabsDemo = () => {
  const [tabs, setTabs] = useState<DocumentTab[]>(START);
  const [active, setActive] = useState<string | null>("si12");
  const [log, setLog] = useState("Select, close (✕, middle-click, Delete) or pin a tab.");
  const close = (id: string) => {
    const i = tabs.findIndex((t) => t.id === id);
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (active === id) setActive(next[Math.min(i, next.length - 1)]?.id ?? null);
    setLog(`closed ${id}`);
  };
  const pin = (id: string, pinned: boolean) => {
    const list = tabs.map((t) => (t.id === id ? { ...t, pinned } : t));
    // Pinned tabs first, as a browser keeps them.
    setTabs([...list.filter((t) => t.pinned), ...list.filter((t) => !t.pinned)]);
    setLog(`${pinned ? "pinned" : "unpinned"} ${id}`);
  };
  return (
    <div className="demo-page">
      <h1>Document tabs</h1>
      <p className="lede">
        A workspace's open documents as tabs: closable, pinnable, marked when they hold unsaved
        changes. The strip reports intent and the page owns the panels, so a hidden document keeps
        its state. <code>tabs</code> is data, as with Toolbar, because the "all tabs" menu needs
        every label.
      </p>

      <section className="demo-section">
        <h2>1. A working set</h2>
        <CodeExample
          title="Select, close, pin"
          description="←/→ move, Enter opens, Delete closes; middle-click closes too. Pinned tabs cannot be closed."
          code={`<DocumentTabs
  tabs={tabs}
  activeId={active}
  onSelect={setActive}
  onClose={close}
  onPinChange={pin}
  closeLabel={() => "Close (Alt+W)"}
/>`}
        >
          <div className="zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border">
            <DocumentTabs
              tabs={tabs}
              activeId={active}
              onSelect={(id) => { setActive(id); setLog(`selected ${id}`); }}
              onClose={close}
              onPinChange={pin}
              closeLabel={closeHint}
            />
            <p className="zen-m-0 zen-p-3 zen-text-sm zen-text-zen-muted-fg" role="status">{log}</p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. More than fit</h2>
        <CodeExample
          title="The strip scrolls; the menu lists them all"
          description="The active tab is kept in view, and the ⌄ menu at the end opens any of them."
          code={`<div style={{ width: 420 }}>
  <DocumentTabs tabs={many} activeId="t7" onSelect={…} onClose={…} />
</div>`}
        >
          <div className="zen-rounded-zen-md zen-border zen-border-zen-border" style={{ width: 420 }}>
            <DocumentTabs tabs={MANY} activeId="t7" onSelect={noop} onClose={noop} />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewDocumentTabsDemo;

import { createSignal } from "solid-js";
import { DocumentTabs, type DocumentTab } from "./document-tabs/document-tabs";
import { DemoPage, DemoSection } from "./demo-helpers";

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

const NewDocumentTabsDemo = () => {
  const [tabs, setTabs] = createSignal<DocumentTab[]>(START);
  const [active, setActive] = createSignal<string | null>("si12");
  const [log, setLog] = createSignal("Select, close (✕, middle-click, Delete) or pin a tab.");
  const close = (id: string) => {
    const list = tabs();
    const i = list.findIndex((t) => t.id === id);
    const next = list.filter((t) => t.id !== id);
    setTabs(next);
    if (active() === id) setActive(next[Math.min(i, next.length - 1)]?.id ?? null);
    setLog(`closed ${id}`);
  };
  const pin = (id: string, pinned: boolean) => {
    const list = tabs().map((t) => (t.id === id ? { ...t, pinned } : t));
    // Pinned tabs first, as a browser keeps them.
    setTabs([...list.filter((t) => t.pinned), ...list.filter((t) => !t.pinned)]);
    setLog(`${pinned ? "pinned" : "unpinned"} ${id}`);
  };
  return (
    <DemoPage
      title="Document tabs"
      description={
        <>
          A workspace's open documents as tabs: closable, pinnable, marked when they hold unsaved
          changes. The strip reports intent and the page owns the panels, so a hidden document keeps
          its state. <code>tabs</code> is data, as with Toolbar, because the "all tabs" menu needs
          every label.
        </>
      }
    >
      <DemoSection
        title="1. A working set"
        codeTitle="Select, close, pin"
        codeDescription="←/→ move, Enter opens, Delete closes; middle-click closes too. Pinned tabs cannot be closed."
        code={`<DocumentTabs
  tabs={tabs()}
  activeId={active()}
  onSelect={setActive}
  onClose={close}
  onPinChange={pin}
  closeLabel={() => "Close (Alt+W)"}
/>`}
      >
        <div class="zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border">
          <DocumentTabs tabs={tabs()} activeId={active()} onSelect={(id) => { setActive(id); setLog(`selected ${id}`); }} onClose={close} onPinChange={pin} closeLabel={() => "Close (Alt+W)"} />
          <p class="zen-m-0 zen-p-3 zen-text-sm zen-text-zen-muted-fg" role="status">{log()}</p>
        </div>
      </DemoSection>

      <DemoSection
        title="2. More than fit"
        codeTitle="The strip scrolls; the menu lists them all"
        codeDescription="The active tab is kept in view, and the ⌄ menu at the end opens any of them."
        code={`<div style={{ width: "420px" }}>
  <DocumentTabs tabs={many} activeId="t7" onSelect={…} onClose={…} />
</div>`}
      >
        <div class="zen-rounded-zen-md zen-border zen-border-zen-border" style={{ width: "420px" }}>
          <DocumentTabs
            tabs={Array.from({ length: 10 }, (_, i) => ({ id: `t${i}`, label: `SI/26/0001${i}`, description: "Sales Invoice" }))}
            activeId="t7"
            onSelect={() => undefined}
            onClose={() => undefined}
          />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewDocumentTabsDemo;

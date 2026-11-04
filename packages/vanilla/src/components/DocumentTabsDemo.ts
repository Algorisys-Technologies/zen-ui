import { DocumentTabs, type DocumentTab } from "./document-tabs/document-tabs";
import { DemoPage } from "./demo-helpers";

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

export default function DocumentTabsDemo(): HTMLElement {
  return DemoPage({
    title: "Document tabs",
    description:
      'A workspace\'s open documents as tabs: closable, pinnable, marked when they hold unsaved changes. The strip reports intent and the page owns the panels, so a hidden document keeps its state. tabs is data, as with Toolbar, because the "all tabs" menu needs every label.',
    sections: [
      {
        title: "1. A working set",
        codeTitle: "Select, close, pin",
        codeDescription:
          "←/→ move, Enter opens, Delete closes; middle-click closes too. Pinned tabs cannot be closed.",
        code: `let tabs = [...];
let active = "si12";
const strip = DocumentTabs({
  tabs,
  activeId: active,
  onSelect: (id) => strip.update({ activeId: (active = id) }),
  onClose: (id) => {
    const i = tabs.findIndex((t) => t.id === id);
    tabs = tabs.filter((t) => t.id !== id);
    if (active === id) active = tabs[Math.min(i, tabs.length - 1)]?.id ?? null;
    strip.update({ tabs, activeId: active });
  },
  onPinChange: (id, pinned) => {
    const list = tabs.map((t) => (t.id === id ? { ...t, pinned } : t));
    tabs = [...list.filter((t) => t.pinned), ...list.filter((t) => !t.pinned)];
    strip.update({ tabs });
  },
  closeLabel: () => "Close (Alt+W)",
});`,
        render: () => {
          let tabs = START;
          let active: string | null = "si12";
          const log = document.createElement("p");
          log.className = "zen-m-0 zen-p-3 zen-text-sm zen-text-zen-muted-fg";
          log.setAttribute("role", "status");
          log.textContent = "Select, close (✕, middle-click, Delete) or pin a tab.";
          const strip = DocumentTabs({
            tabs,
            activeId: active,
            onSelect: (id) => {
              active = id;
              strip.update({ activeId: id });
              log.textContent = `selected ${id}`;
            },
            onClose: (id) => {
              const i = tabs.findIndex((t) => t.id === id);
              tabs = tabs.filter((t) => t.id !== id);
              if (active === id) active = tabs[Math.min(i, tabs.length - 1)]?.id ?? null;
              strip.update({ tabs, activeId: active });
              log.textContent = `closed ${id}`;
            },
            onPinChange: (id, pinned) => {
              const list = tabs.map((t) => (t.id === id ? { ...t, pinned } : t));
              // Pinned tabs first, as a browser keeps them.
              tabs = [...list.filter((t) => t.pinned), ...list.filter((t) => !t.pinned)];
              strip.update({ tabs });
              log.textContent = `${pinned ? "pinned" : "unpinned"} ${id}`;
            },
            closeLabel: () => "Close (Alt+W)",
          });
          const box = document.createElement("div");
          box.className = "zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border";
          box.append(strip.el, log);
          return box;
        },
      },
      {
        title: "2. More than fit",
        codeTitle: "The strip scrolls; the menu lists them all",
        codeDescription: "The active tab is kept in view, and the ⌄ menu at the end opens any of them.",
        code: `const box = document.createElement("div");
box.style.width = "420px";
box.append(DocumentTabs({ tabs: many, activeId: "t7", onSelect: …, onClose: … }).el);`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-rounded-zen-md zen-border zen-border-zen-border";
          box.style.width = "420px";
          box.append(DocumentTabs({ tabs: MANY, activeId: "t7", onSelect: noop, onClose: noop }).el);
          return box;
        },
      },
    ],
  });
}

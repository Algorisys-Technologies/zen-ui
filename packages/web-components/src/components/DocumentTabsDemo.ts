import type { DocumentTab } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * DocumentTabs demo — the web-components port. The panels are the page's own
 * (a workspace keeps each document alive while it is hidden), so the demo
 * shows the strip and what it reports. `tabs` is a JS property; select, close
 * and pin arrive as zen-select / zen-close / zen-pin-change.
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

type StripEl = HTMLElement & {
  tabs: DocumentTab[];
  activeId?: string | null;
  closeLabel?: (tab: DocumentTab) => string;
};

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
        code: `<zen-document-tabs id="docs" active-id="si12"></zen-document-tabs>

<script type="module">
  const strip = document.querySelector("#docs");
  strip.tabs = tabs;
  strip.closeLabel = () => "Close (Alt+W)";
  strip.addEventListener("zen-select", (e) => (strip.activeId = e.detail));
  strip.addEventListener("zen-close", (e) => {
    const i = strip.tabs.findIndex((t) => t.id === e.detail);
    const next = strip.tabs.filter((t) => t.id !== e.detail);
    if (strip.activeId === e.detail) strip.activeId = next[Math.min(i, next.length - 1)]?.id ?? null;
    strip.tabs = next;
  });
  strip.addEventListener("zen-pin-change", (e) => {
    const [id, pinned] = e.detail;
    const list = strip.tabs.map((t) => (t.id === id ? { ...t, pinned } : t));
    strip.tabs = [...list.filter((t) => t.pinned), ...list.filter((t) => !t.pinned)];
  });
</script>`,
        render: () => {
          const log = document.createElement("p");
          log.className = "zen-m-0 zen-p-3 zen-text-sm zen-text-zen-muted-fg";
          log.setAttribute("role", "status");
          log.textContent = "Select, close (✕, middle-click, Delete) or pin a tab.";
          const strip = document.createElement("zen-document-tabs") as StripEl;
          strip.setAttribute("active-id", "si12");
          strip.tabs = START;
          strip.closeLabel = () => "Close (Alt+W)";
          strip.addEventListener("zen-select", (e) => {
            const id = (e as CustomEvent<string>).detail;
            strip.activeId = id;
            log.textContent = `selected ${id}`;
          });
          strip.addEventListener("zen-close", (e) => {
            const id = (e as CustomEvent<string>).detail;
            const i = strip.tabs.findIndex((t) => t.id === id);
            const next = strip.tabs.filter((t) => t.id !== id);
            // An attribute cannot say null: no active tab is no attribute.
            if (strip.activeId === id) strip.activeId = next[Math.min(i, next.length - 1)]?.id ?? null;
            strip.tabs = next;
            log.textContent = `closed ${id}`;
          });
          strip.addEventListener("zen-pin-change", (e) => {
            const [id, pinned] = (e as CustomEvent<[string, boolean]>).detail;
            const list = strip.tabs.map((t) => (t.id === id ? { ...t, pinned } : t));
            // Pinned tabs first, as a browser keeps them.
            strip.tabs = [...list.filter((t) => t.pinned), ...list.filter((t) => !t.pinned)];
            log.textContent = `${pinned ? "pinned" : "unpinned"} ${id}`;
          });
          const box = document.createElement("div");
          box.className = "zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border";
          box.append(strip, log);
          return box;
        },
      },
      {
        title: "2. More than fit",
        codeTitle: "The strip scrolls; the menu lists them all",
        codeDescription: "The active tab is kept in view, and the ⌄ menu at the end opens any of them.",
        code: `<div style="width: 420px">
  <zen-document-tabs id="many" active-id="t7"></zen-document-tabs>
</div>

<script type="module">
  const strip = document.querySelector("#many");
  strip.tabs = many;
  strip.addEventListener("zen-select", …);
  strip.addEventListener("zen-close", …);
</script>`,
        render: () => {
          const strip = document.createElement("zen-document-tabs") as StripEl;
          strip.setAttribute("active-id", "t7");
          strip.tabs = MANY;
          // Listening is what gives the tabs their close buttons, as onClose does elsewhere.
          strip.addEventListener("zen-select", () => {});
          strip.addEventListener("zen-close", () => {});
          const box = document.createElement("div");
          box.className = "zen-rounded-zen-md zen-border zen-border-zen-border";
          box.style.width = "420px";
          box.append(strip);
          return box;
        },
      },
    ],
  });
}

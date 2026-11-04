import { ContextMenu } from "./context-menu/context-menu";
import type { DropdownMenuItemSpec } from "./dropdown-menu/dropdown-menu";
import { DemoPage } from "./demo-helpers";

/**
 * ContextMenuDemo — mirrors NewContextMenuDemo.tsx section-for-section. The
 * compound React parts become entries in the `items` array, the same specs
 * DropdownMenu takes (see the divergence note in context-menu.ts).
 */

interface Doc {
  name: string;
  kind: string;
  party: string;
}

const DOCUMENTS: Doc[] = [
  { name: "SI/26/00012", kind: "Sales Invoice", party: "Acme Traders" },
  { name: "SO/26/00031", kind: "Sales Order", party: "Acme Traders" },
  { name: "PO/26/00007", kind: "Purchase Order", party: "Kaveri Steel" },
  { name: "DN/26/00019", kind: "Delivery Note", party: "Nilgiri Foods" },
];

const status = (): HTMLParagraphElement => {
  const p = document.createElement("p");
  p.className = "zen-mt-2 zen-text-sm zen-text-zen-muted-fg";
  p.setAttribute("aria-live", "polite");
  return p;
};

export default function ContextMenuDemo(): HTMLElement {
  // The last action, shown under the second section: both menus write to it, as
  // in the React demo.
  const last = document.createElement("span");
  last.dataset.testid = "last-action";
  last.textContent = "Nothing chosen yet.";
  const say = (text: string) => (last.textContent = text);

  return DemoPage({
    title: "ContextMenu",
    description:
      "The menu a right-click opens, at the pointer. Opens from the keyboard too (the menu key or Shift+F10), and on a long press on touch. Its items are DropdownMenu's.",
    sections: [
      {
        title: "1. Right-click an area",
        codeTitle: "Trigger area + items",
        codeDescription:
          "Right-click inside the box. Items, checkbox and radio items, submenus and shortcuts look and behave as DropdownMenu's: the same `items` specs, drawn by the same code.",
        code: `let grid = true;
let sortBy = "name";

const cm = ContextMenu({
  class: "…",
  children: "Right-click here",
  contentClass: "zen-w-56",
  items: buildItems(),
});

function buildItems() {
  return [
    { label: "Refresh", shortcut: "F5", onSelect: refresh },
    { label: "Paste", shortcut: "Ctrl+V", onSelect: paste },
    { type: "separator" },
    { type: "checkbox", label: "Show grid", checked: grid,
      onCheckedChange: (v) => { grid = v; cm.update({ items: buildItems() }); } },
    { type: "label", label: "Sort by", inset: true },
    { type: "radio", value: sortBy,
      onValueChange: (v) => { sortBy = v; cm.update({ items: buildItems() }); },
      options: [{ value: "name", label: "Name" }, { value: "date", label: "Date" }] },
    { type: "separator" },
    { type: "sub", label: "New", items: [
      { label: "Sales Invoice", onSelect: … },
      { label: "Purchase Order", onSelect: … },
    ] },
  ];
}`,
        render: () => {
          let grid = true;
          let sortBy = "name";
          const out = status();
          const paint = () => (out.textContent = `Grid ${grid ? "on" : "off"} · sorted by ${sortBy}`);
          const buildItems = (): DropdownMenuItemSpec[] => [
            { label: "Refresh", shortcut: "F5", onSelect: () => say("Refresh") },
            { label: "Paste", shortcut: "Ctrl+V", onSelect: () => say("Paste") },
            { type: "separator" },
            {
              type: "checkbox",
              label: "Show grid",
              checked: grid,
              onCheckedChange: (v) => {
                grid = v;
                paint();
                cm.update({ items: buildItems() });
              },
            },
            { type: "label", label: "Sort by", inset: true },
            {
              type: "radio",
              value: sortBy,
              onValueChange: (v) => {
                sortBy = v;
                paint();
                cm.update({ items: buildItems() });
              },
              options: [
                { value: "name", label: "Name" },
                { value: "date", label: "Date" },
              ],
            },
            { type: "separator" },
            {
              type: "sub",
              label: "New",
              items: [
                { label: "Sales Invoice", onSelect: () => say("New Sales Invoice") },
                { label: "Purchase Order", onSelect: () => say("New Purchase Order") },
              ],
            },
          ];
          const cm = ContextMenu({
            "data-testid": "area",
            class:
              "zen-flex zen-h-40 zen-w-full zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-dashed zen-border-zen-border zen-text-sm zen-text-zen-muted-fg",
            children: "Right-click here",
            contentClass: "zen-w-56",
            items: buildItems(),
          });
          paint();
          return [cm.el, out];
        },
      },
      {
        title: "2. On the things it acts on, and from the keyboard",
        codeTitle: "One menu for a list; the item is read from what was right-clicked",
        codeDescription:
          "Right-click a document, or Tab to one and press the menu key or Shift+F10: the menu opens at that document, its first item active. Esc closes it and focus returns to the document.",
        code: `const cm = ContextMenu({
  class: "zen-grid zen-w-full zen-max-w-xl zen-gap-1",
  children: docs.map((d) => rowButton(d)),   // each with data-doc="…"
  items: itemsFor(docs[0]),
  // Runs before the menu opens: read the target, give the menu its items.
  onContextMenu: (e) => {
    const el = e.target.closest("[data-doc]");
    if (el) cm.update({ items: itemsFor(byName(el.dataset.doc)) });
  },
});

const itemsFor = (doc) => [
  { type: "label", label: doc.name },
  { label: "Open in new tab", shortcut: "Ctrl+Enter", onSelect: () => openInNewTab(doc) },
  …
];`,
        render: () => {
          const out = status();
          out.append(last);

          const itemsFor = (d: Doc): DropdownMenuItemSpec[] => [
            { type: "label", label: d.name },
            {
              label: "Open in new tab",
              shortcut: "Ctrl+Enter",
              onSelect: () => say(`Opened ${d.name} in a new tab`),
            },
            { label: "Open beside", onSelect: () => say(`Opened ${d.name} beside`) },
            { label: "Copy name", onSelect: () => say(`Copied "${d.name}"`) },
            { label: "Duplicate", onSelect: () => say(`Duplicated ${d.name}`) },
            { type: "separator" },
            { label: "Delete…", variant: "destructive", onSelect: () => say(`Asked to delete ${d.name}`) },
          ];

          const rows = DOCUMENTS.map((d) => {
            const b = document.createElement("button");
            b.type = "button";
            b.dataset.doc = d.name;
            b.className =
              "zen-flex zen-items-baseline zen-gap-3 zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-px-2 zen-py-2 zen-text-start zen-text-sm hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";
            const name = document.createElement("span");
            name.className = "zen-font-medium zen-tabular-nums";
            name.textContent = d.name;
            const meta = document.createElement("span");
            meta.className = "zen-text-zen-muted-fg";
            meta.textContent = `${d.kind} · ${d.party}`;
            b.append(name, meta);
            return b;
          });

          const cm = ContextMenu({
            class: "zen-grid zen-w-full zen-max-w-xl zen-gap-1",
            children: rows,
            contentClass: "zen-w-60",
            items: itemsFor(DOCUMENTS[0]),
            onContextMenu: (e) => {
              const el = (e.target as Element).closest<HTMLElement>("[data-doc]");
              const d = DOCUMENTS.find((x) => x.name === el?.dataset.doc);
              if (d) cm.update({ items: itemsFor(d) });
            },
          });
          return [cm.el, out];
        },
      },
    ],
  });
}

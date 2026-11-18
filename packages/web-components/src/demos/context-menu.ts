import type { DropdownMenuItemSpec } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * ContextMenu demo — the web-components mirror of the vanilla ContextMenuDemo
 * (itself NewContextMenuDemo.tsx section-for-section). <zen-context-menu> wraps
 * its trigger area's content; `items` takes the same specs as
 * <zen-dropdown-menu>, set as a JS property because they carry callbacks.
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

type MenuEl = HTMLElement & { items: DropdownMenuItemSpec[] };

const status = (): HTMLParagraphElement => {
  const p = document.createElement("p");
  p.className = "zen-mt-2 zen-text-sm zen-text-zen-muted-fg";
  p.setAttribute("aria-live", "polite");
  return p;
};

export default function ContextMenuDemo(): HTMLElement {
  // The last action, shown under the second section: both menus write to it.
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
        code: `<zen-context-menu class="…" content-class="zen-w-56">Right-click here</zen-context-menu>

const cm = document.querySelector("zen-context-menu");
cm.items = buildItems();

function buildItems() {
  return [
    { label: "Refresh", shortcut: "F5", onSelect: refresh },
    { label: "Paste", shortcut: "Ctrl+V", onSelect: paste },
    { type: "separator" },
    { type: "checkbox", label: "Show grid", checked: grid,
      onCheckedChange: (v) => { grid = v; cm.items = buildItems(); } },
    { type: "label", label: "Sort by", inset: true },
    { type: "radio", value: sortBy,
      onValueChange: (v) => { sortBy = v; cm.items = buildItems(); },
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
          const cm = document.createElement("zen-context-menu") as MenuEl;
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
                cm.items = buildItems();
              },
            },
            { type: "label", label: "Sort by", inset: true },
            {
              type: "radio",
              value: sortBy,
              onValueChange: (v) => {
                sortBy = v;
                paint();
                cm.items = buildItems();
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
          cm.dataset.testid = "area";
          cm.className =
            "zen-flex zen-h-40 zen-w-full zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-dashed zen-border-zen-border zen-text-sm zen-text-zen-muted-fg";
          cm.setAttribute("content-class", "zen-w-56");
          cm.textContent = "Right-click here";
          cm.items = buildItems();
          paint();
          return [cm, out];
        },
      },
      {
        title: "2. On the things it acts on, and from the keyboard",
        codeTitle: "One menu for a list; the item is read from what was right-clicked",
        codeDescription:
          "Right-click a document, or Tab to one and press the menu key or Shift+F10: the menu opens at that document, its first item active. Esc closes it and focus returns to the document.",
        code: `<zen-context-menu class="zen-grid zen-w-full zen-max-w-xl zen-gap-1" content-class="zen-w-60">
  <button data-doc="SI/26/00012">…</button>
  …
</zen-context-menu>

// Fires before the menu opens: read the target, give the menu its items.
cm.addEventListener("zen-context-menu", (e) => {
  const el = e.detail.target.closest("[data-doc]");
  if (el) cm.items = itemsFor(byName(el.dataset.doc));
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

          const cm = document.createElement("zen-context-menu") as MenuEl;
          cm.className = "zen-grid zen-w-full zen-max-w-xl zen-gap-1";
          cm.setAttribute("content-class", "zen-w-60");
          for (const d of DOCUMENTS) {
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
            cm.append(b);
          }
          cm.items = itemsFor(DOCUMENTS[0]);
          cm.addEventListener("zen-context-menu", (e) => {
            const target = (e as CustomEvent<MouseEvent>).detail.target as Element;
            const el = target.closest<HTMLElement>("[data-doc]");
            const d = DOCUMENTS.find((x) => x.name === el?.dataset.doc);
            if (d) cm.items = itemsFor(d);
          });
          return [cm, out];
        },
      },
    ],
  });
}

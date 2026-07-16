import { SelectDialog, type SelectDialogItem } from "./select-dialog/select-dialog";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

/**
 * SelectDialog demo. Every section drives real state, because the point of the
 * component is what comes back out of `onConfirm` — a dialog that opens is not
 * evidence that it picked anything.
 */

const SUPPLIERS: SelectDialogItem[] = [
  { id: "s1", label: "Nordwind Logistik", description: "Oslo, Norway", info: "Preferred", icon: "users" },
  { id: "s2", label: "Alpine Components", description: "Innsbruck, Austria", info: "Active", icon: "users" },
  { id: "s3", label: "Baltic Steel", description: "Gdansk, Poland", info: "Active", icon: "users" },
  { id: "s4", label: "Iberia Plastics", description: "Valencia, Spain", info: "On hold", icon: "users", disabled: true },
  { id: "s5", label: "Rhein Fittings", description: "Duisburg, Germany", info: "Active", icon: "users" },
  { id: "s6", label: "Loire Textiles", description: "Nantes, France", info: "Active", icon: "users" },
  { id: "s7", label: "Thames Instruments", description: "Reading, UK", info: "New", icon: "users" },
  { id: "s8", label: "Adria Marine", description: "Split, Croatia", info: "Active", icon: "users" },
];

const label = (id: string) => SUPPLIERS.find((s) => s.id === id)?.label ?? id;

function resultLine(prefix: string): { el: HTMLParagraphElement; set: (text: string) => void } {
  const p = document.createElement("p");
  p.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
  p.append(document.createTextNode(`${prefix} → `));
  const code = document.createElement("code");
  code.textContent = "—";
  p.append(code);
  return { el: p, set: (text) => (code.textContent = text) };
}

function column(...nodes: Node[]): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-col zen-items-start zen-gap-2";
  wrap.append(...nodes);
  return wrap;
}

export default function SelectDialogDemo(): HTMLElement {
  return DemoPage({
    title: "SelectDialog",
    description:
      "The list picker: a modal with a search field, a scrollable list and a footer. Single-select commits on click — picking IS the answer, so there is no OK button. Multi-select draws checkboxes and defers everything to OK, so a mis-click costs nothing. Selection is drafted inside the dialog and only escapes through onConfirm.",
    sections: [
      {
        title: "1. Single select — the click is the answer",
        codeTitle: "No OK button",
        codeDescription:
          "Picking a row confirms and closes. Cancel is the only footer action, because OK would be a second click that says nothing new. The current selection is marked when the dialog re-opens.",
        code: `let supplier: string | null = null;

const dlg = SelectDialog({
  title: "Select supplier",
  description: "Pick the supplier this order is raised against.",
  items: SUPPLIERS,
  onConfirm: (ids) => { supplier = ids[0] ?? null; },
});

openBtn.el.addEventListener("click", () => {
  dlg.update({ selectedIds: supplier ? [supplier] : [] });
  dlg.open();
});`,
        render: () => {
          let supplier: string | null = null;
          const result = resultLine("onConfirm");
          const dlg = SelectDialog({
            title: "Select supplier",
            description: "Pick the supplier this order is raised against.",
            items: SUPPLIERS,
            onConfirm: (ids) => {
              supplier = ids[0] ?? null;
              result.set(supplier ? label(supplier) : "—");
            },
          });
          const open = Button({ type: "button", children: "Select supplier" });
          open.el.addEventListener("click", () => {
            dlg.update({ selectedIds: supplier ? [supplier] : [] });
            dlg.open();
          });
          return column(open.el, result.el);
        },
      },
      {
        title: "2. Multi select — nothing commits until OK",
        codeTitle: "multiple + Clear",
        codeDescription:
          "Checkbox rows, and a Clear that is disabled while the draft is empty. Cancel (or Escape / click-outside) restores whatever was selected when the dialog opened — the ticks you made in between are thrown away, which is the whole point of a draft.",
        code: `let shortlist: string[] = ["s2", "s5"];

const dlg = SelectDialog({
  multiple: true,
  title: "Shortlist suppliers",
  items: SUPPLIERS,
  onConfirm: (ids) => { shortlist = ids; },
});

openBtn.el.addEventListener("click", () => {
  dlg.update({ selectedIds: shortlist });
  dlg.open();
});`,
        render: () => {
          let shortlist: string[] = ["s2", "s5"];
          const result = resultLine("onConfirm");
          result.set(shortlist.map(label).join(", ") || "—");
          const open = Button({ type: "button", children: `Shortlist suppliers (${shortlist.length})` });
          const dlg = SelectDialog({
            multiple: true,
            title: "Shortlist suppliers",
            description: "Everything ticked here is committed on OK, not before.",
            items: SUPPLIERS,
            onConfirm: (ids) => {
              shortlist = ids;
              result.set(shortlist.map(label).join(", ") || "—");
              open.update({ children: `Shortlist suppliers (${shortlist.length})` });
            },
          });
          open.el.addEventListener("click", () => {
            dlg.update({ selectedIds: shortlist });
            dlg.open();
          });
          return column(open.el, result.el);
        },
      },
      {
        title: "3. Without search, and the empty state",
        codeTitle: "searchable: false",
        codeDescription:
          "For a short, fixed list a search field is furniture. In the searchable sections above, type a query that matches nothing to see emptyText instead.",
        code: `const dlg = SelectDialog({
  searchable: false,
  emptyText: "No suppliers match that name",
  title: "Select region",
  items: REGIONS,
  onConfirm: (ids) => { region = ids[0] ?? null; },
});`,
        render: () => {
          let region: string | null = null;
          const result = resultLine("onConfirm");
          const dlg = SelectDialog({
            searchable: false,
            title: "Select region",
            items: [
              { id: "emea", label: "EMEA", description: "Europe, Middle East, Africa" },
              { id: "amer", label: "Americas", description: "North + South America" },
              { id: "apac", label: "APAC", description: "Asia Pacific" },
            ],
            onConfirm: (ids) => {
              region = ids[0] ?? null;
              result.set(region ?? "—");
            },
          });
          const open = Button({ type: "button", variant: "outline", color: "neutral", children: "Select region" });
          open.el.addEventListener("click", () => {
            dlg.update({ selectedIds: region ? [region] : [] });
            dlg.open();
          });
          return column(open.el, result.el);
        },
      },
    ],
  });
}

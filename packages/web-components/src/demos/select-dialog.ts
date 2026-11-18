import { DemoPage } from "./demo-helpers";

/**
 * SelectDialog demo — the web-components port. <zen-select-dialog> is data-driven
 * (`el.items = [...]`), and its open()/close() handle is forwarded onto the
 * element. `zen-confirm` fires with the chosen id array. The draft `selectedIds`
 * is re-applied before opening via `el.selectedIds = [...]`.
 */

interface Supplier {
  id: string;
  label: string;
  description?: string;
  info?: string;
  icon?: string;
  disabled?: boolean;
}

const SUPPLIERS: Supplier[] = [
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

type DialogEl = HTMLElement & { selectedIds: string[]; open(): void };

function button(text: string, attrs: Record<string, string> = {}): HTMLElement {
  const b = document.createElement("zen-button");
  b.setAttribute("type", "button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.textContent = text;
  return b;
}

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
        code: `const dlg = document.createElement("zen-select-dialog");
dlg.setAttribute("title", "Select supplier");
dlg.items = SUPPLIERS;
dlg.addEventListener("zen-confirm", (e) => { supplier = e.detail[0] ?? null; });
document.body.append(dlg);

openBtn.addEventListener("click", () => {
  dlg.selectedIds = supplier ? [supplier] : [];
  dlg.open();
});`,
        render: () => {
          let supplier: string | null = null;
          const result = resultLine("onConfirm");
          const dlg = document.createElement("zen-select-dialog") as DialogEl;
          dlg.setAttribute("title", "Select supplier");
          dlg.setAttribute("description", "Pick the supplier this order is raised against.");
          Object.assign(dlg, { items: SUPPLIERS });
          dlg.addEventListener("zen-confirm", (e) => {
            const ids = (e as CustomEvent).detail as string[];
            supplier = ids[0] ?? null;
            result.set(supplier ? label(supplier) : "—");
          });
          const open = button("Select supplier");
          open.addEventListener("click", () => {
            dlg.selectedIds = supplier ? [supplier] : [];
            dlg.open();
          });
          return column(open, dlg, result.el);
        },
      },
      {
        title: "2. Multi select — nothing commits until OK",
        codeTitle: "multiple + Clear",
        codeDescription:
          "Checkbox rows, and a Clear that is disabled while the draft is empty. Cancel (or Escape / click-outside) restores whatever was selected when the dialog opened — the ticks you made in between are thrown away, which is the whole point of a draft.",
        code: `const dlg = document.createElement("zen-select-dialog");
dlg.setAttribute("multiple", "");
dlg.items = SUPPLIERS;
dlg.addEventListener("zen-confirm", (e) => { shortlist = e.detail; });

openBtn.addEventListener("click", () => {
  dlg.selectedIds = shortlist;
  dlg.open();
});`,
        render: () => {
          let shortlist: string[] = ["s2", "s5"];
          const result = resultLine("onConfirm");
          result.set(shortlist.map(label).join(", ") || "—");
          const open = button(`Shortlist suppliers (${shortlist.length})`);
          const dlg = document.createElement("zen-select-dialog") as DialogEl;
          dlg.setAttribute("multiple", "");
          dlg.setAttribute("title", "Shortlist suppliers");
          dlg.setAttribute("description", "Everything ticked here is committed on OK, not before.");
          Object.assign(dlg, { items: SUPPLIERS });
          dlg.addEventListener("zen-confirm", (e) => {
            shortlist = (e as CustomEvent).detail as string[];
            result.set(shortlist.map(label).join(", ") || "—");
            open.textContent = `Shortlist suppliers (${shortlist.length})`;
          });
          open.addEventListener("click", () => {
            dlg.selectedIds = shortlist;
            dlg.open();
          });
          return column(open, dlg, result.el);
        },
      },
      {
        title: "3. Without search, and the empty state",
        codeTitle: "searchable: false",
        codeDescription:
          "For a short, fixed list a search field is furniture. In the searchable sections above, type a query that matches nothing to see emptyText instead.",
        code: `const dlg = document.createElement("zen-select-dialog");
dlg.searchable = false;                 // default is true → set the JS property
dlg.setAttribute("empty-text", "No suppliers match that name");
dlg.items = REGIONS;
dlg.addEventListener("zen-confirm", (e) => { region = e.detail[0] ?? null; });`,
        render: () => {
          let region: string | null = null;
          const result = resultLine("onConfirm");
          const dlg = document.createElement("zen-select-dialog") as DialogEl;
          dlg.setAttribute("title", "Select region");
          Object.assign(dlg, {
            searchable: false,
            items: [
              { id: "emea", label: "EMEA", description: "Europe, Middle East, Africa" },
              { id: "amer", label: "Americas", description: "North + South America" },
              { id: "apac", label: "APAC", description: "Asia Pacific" },
            ],
          });
          dlg.addEventListener("zen-confirm", (e) => {
            const ids = (e as CustomEvent).detail as string[];
            region = ids[0] ?? null;
            result.set(region ?? "—");
          });
          const open = button("Select region", { variant: "outline", color: "neutral" });
          open.addEventListener("click", () => {
            dlg.selectedIds = region ? [region] : [];
            dlg.open();
          });
          return column(open, dlg, result.el);
        },
      },
    ],
  });
}

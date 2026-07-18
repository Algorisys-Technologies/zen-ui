import { DemoPage } from "./demo-helpers";
import type {
  ValueHelpItem,
  ValueHelpCondition,
  ValueHelpResult,
} from "@algorisys/zen-ui-vanilla";

/**
 * Mirrors the vanilla ValueHelpDemo, rendered through <zen-value-help>. `items` is
 * the data collection; `open` is a controlled JS property (set `el.open = true` to
 * show it, mirror zen-open-change back to stay controlled); `selectedIds` and
 * `conditions` are JS properties; `title`/`description`/`multiple` are attributes.
 * onConfirm maps to zen-confirm (detail is `{ ids, conditions }`).
 */
const SUPPLIERS: ValueHelpItem[] = [
  { id: "s1", label: "Nordwind Logistik", description: "Oslo, Norway", info: "Preferred", icon: "users" },
  { id: "s2", label: "Alpine Components", description: "Innsbruck, Austria", info: "Active", icon: "users" },
  { id: "s3", label: "Baltic Steel", description: "Gdansk, Poland", info: "Active", icon: "users" },
  { id: "s4", label: "Iberia Plastics", description: "Valencia, Spain", info: "On hold", icon: "users", disabled: true },
  { id: "s5", label: "Rhein Fittings", description: "Duisburg, Germany", info: "Active", icon: "users" },
  { id: "s6", label: "Loire Textiles", description: "Nantes, France", info: "Active", icon: "users" },
];

const labelOf = (id: string) => SUPPLIERS.find((s) => s.id === id)?.label ?? id;

const describe = (c: ValueHelpCondition) =>
  `${c.exclude ? "NOT " : ""}${c.operator}(${c.value}${c.valueTo ? `..${c.valueTo}` : ""})`;

const out = (label: string): { el: HTMLElement; set: (text: string) => void } => {
  const p = document.createElement("p");
  p.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
  const strong = document.createElement("span");
  strong.textContent = `${label} → `;
  const code = document.createElement("code");
  code.textContent = "—";
  p.append(strong, code);
  return { el: p, set: (text: string) => (code.textContent = text || "—") };
};

function button(attrs: Record<string, string>, label: string): HTMLElement {
  const b = document.createElement("zen-button");
  b.setAttribute("type", "button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.textContent = label;
  return b;
}

export default function ValueHelpDemo(): HTMLElement {
  return DemoPage({
    title: "ValueHelp",
    description:
      "The F4 lookup dialog. SelectDialog answers 'which of these?'; ValueHelp also answers 'everything matching these rules'. The Select tab is the same searchable list; the Conditions tab builds rules (include/exclude, an operator, one or two values) that a caller turns into a query. Unlike SelectDialog, clicking a row never commits on its own — the second tab needs an OK too, so OK is the only way out. Blank-valued rules are dropped on commit, since a rule with no value filters nothing.",
    sections: [
      {
        title: "1. List + conditions, committed together",
        codeTitle: "<zen-value-help> with both tabs",
        codeDescription:
          "Pick rows on the Select tab, add rules on the Conditions tab, then OK. Both halves arrive together in one zen-confirm payload, because a real filter is usually 'these three, plus anything starting with X'.",
        code: `const vh = document.createElement("zen-value-help");
vh.setAttribute("title", "Supplier value help");
vh.setAttribute("multiple", "");
vh.items = SUPPLIERS;
vh.addEventListener("zen-open-change", (e) => { vh.open = e.detail; });
vh.addEventListener("zen-confirm", (e) => {
  vh.selectedIds = e.detail.ids;
  vh.conditions = e.detail.conditions;
});
openBtn.addEventListener("click", () => { vh.open = true; });`,
        render: () => {
          const idsOut = out("ids");
          const condOut = out("conditions");
          const open = button({}, "Open value help");

          const vh = document.createElement("zen-value-help");
          vh.setAttribute("title", "Supplier value help");
          vh.setAttribute("description", "Pick suppliers, or describe them with rules.");
          vh.setAttribute("multiple", "");
          const bag = vh as unknown as Record<string, unknown>;
          bag.items = SUPPLIERS;
          bag.selectedIds = [];
          bag.conditions = [];
          bag.open = false;

          vh.addEventListener("zen-open-change", (e) => {
            bag.open = (e as CustomEvent<boolean>).detail;
          });
          vh.addEventListener("zen-confirm", (e) => {
            const r = (e as CustomEvent<ValueHelpResult>).detail;
            bag.selectedIds = r.ids;
            bag.conditions = r.conditions;
            idsOut.set(r.ids.map(labelOf).join(", "));
            condOut.set(r.conditions.map(describe).join(" AND "));
          });
          open.addEventListener("click", () => {
            bag.open = true;
          });

          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-flex-col zen-items-start zen-gap-2";
          wrap.append(open, idsOut.el, condOut.el, vh);
          return wrap;
        },
      },
      {
        title: "2. Seeded, and Cancel restores",
        codeTitle: "selectedIds + conditions are read on open",
        codeDescription:
          "Both seeds are read when the dialog opens, not live-bound: this is a picker, not a field. Edit anything and hit Cancel — the draft is thrown away and the seeds below are unchanged.",
        code: `vh.items = SUPPLIERS;
vh.selectedIds = ["s2"];
vh.conditions = [{ id: "seed-1", exclude: false, operator: "StartsWith", value: "Nord" }];`,
        render: () => {
          const seededIds = ["s2"];
          const seededConditions: ValueHelpCondition[] = [
            { id: "seed-1", exclude: false, operator: "StartsWith", value: "Nord" },
          ];

          const idsOut = out("ids");
          const condOut = out("conditions");
          idsOut.set(seededIds.map(labelOf).join(", "));
          condOut.set(seededConditions.map(describe).join(" AND "));

          const open = button({ variant: "outline", color: "neutral" }, "Open seeded value help");

          const vh = document.createElement("zen-value-help");
          vh.setAttribute("title", "Seeded value help");
          vh.setAttribute("description", "Opens with one row picked and one rule already defined.");
          const bag = vh as unknown as Record<string, unknown>;
          bag.items = SUPPLIERS;
          bag.selectedIds = seededIds;
          bag.conditions = seededConditions;
          bag.open = false;

          vh.addEventListener("zen-open-change", (e) => {
            bag.open = (e as CustomEvent<boolean>).detail;
          });
          vh.addEventListener("zen-confirm", (e) => {
            const r = (e as CustomEvent<ValueHelpResult>).detail;
            bag.selectedIds = r.ids;
            bag.conditions = r.conditions;
            idsOut.set(r.ids.map(labelOf).join(", "));
            condOut.set(r.conditions.map(describe).join(" AND "));
          });
          open.addEventListener("click", () => {
            bag.open = true;
          });

          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-flex-col zen-items-start zen-gap-2";
          wrap.append(open, idsOut.el, condOut.el, vh);
          return wrap;
        },
      },
    ],
  });
}

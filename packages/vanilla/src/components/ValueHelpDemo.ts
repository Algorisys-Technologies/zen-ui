import { ValueHelp, type ValueHelpItem, type ValueHelpCondition } from "./value-help/value-help";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

/**
 * ValueHelp demo. Every section drives real state, because the point of the
 * component is what comes back out of `onConfirm` — a dialog that opens is not
 * evidence that it picked anything. Mirrors the React NewValueHelpDemo.
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

const out = (label: string) => {
  const p = document.createElement("p");
  p.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
  const strong = document.createElement("span");
  strong.textContent = `${label} → `;
  const code = document.createElement("code");
  code.textContent = "—";
  p.append(strong, code);
  return { el: p, set: (text: string) => (code.textContent = text || "—") };
};

export default function ValueHelpDemo(): HTMLElement {
  return DemoPage({
    title: "ValueHelp",
    description:
      "The F4 lookup dialog. SelectDialog answers 'which of these?'; ValueHelp also answers 'everything matching these rules'. The Select tab is the same searchable list; the Conditions tab builds rules (include/exclude, an operator, one or two values) that a caller turns into a query. Unlike SelectDialog, clicking a row never commits on its own — the second tab needs an OK too, so OK is the only way out. Blank-valued rules are dropped on commit, since a rule with no value filters nothing.",
    sections: [
      {
        title: "1. List + conditions, committed together",
        codeTitle: "ValueHelp with both tabs",
        codeDescription:
          "Pick rows on the Select tab, add rules on the Conditions tab, then OK. Both halves arrive together in one onConfirm payload, because a real filter is usually 'these three, plus anything starting with X'.",
        code: `let ids: string[] = [];
let conditions: ValueHelpCondition[] = [];

const vh = ValueHelp({
  open: false,
  onOpenChange: (o) => vh.update({ open: o }),
  title: "Supplier value help",
  description: "Pick suppliers, or describe them with rules.",
  items: SUPPLIERS,
  multiple: true,
  selectedIds: ids,
  conditions,
  onConfirm: (r) => {
    ids = r.ids;
    conditions = r.conditions;
    vh.update({ selectedIds: ids, conditions });
  },
});
openBtn.el.addEventListener("click", () => vh.update({ open: true }));`,
        render: () => {
          let ids: string[] = [];
          let conditions: ValueHelpCondition[] = [];

          const idsOut = out("ids");
          const condOut = out("conditions");

          const open = Button({ type: "button", children: "Open value help" });

          const vh = ValueHelp({
            open: false,
            onOpenChange: (o) => vh.update({ open: o }),
            title: "Supplier value help",
            description: "Pick suppliers, or describe them with rules.",
            items: SUPPLIERS,
            multiple: true,
            selectedIds: ids,
            conditions,
            onConfirm: (r) => {
              ids = r.ids;
              conditions = r.conditions;
              vh.update({ selectedIds: ids, conditions });
              idsOut.set(ids.map(labelOf).join(", "));
              condOut.set(conditions.map(describe).join(" AND "));
            },
          });
          open.el.addEventListener("click", () => vh.update({ open: true }));

          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-flex-col zen-items-start zen-gap-2";
          wrap.append(open.el, idsOut.el, condOut.el, vh.el);
          return wrap;
        },
      },
      {
        title: "2. Seeded, and Cancel restores",
        codeTitle: "selectedIds + conditions are read on open",
        codeDescription:
          "Both seeds are read when the dialog opens, not live-bound: this is a picker, not a field. Edit anything and hit Cancel — the draft is thrown away and the seeds below are unchanged.",
        code: `let ids = ["s2"];
let conditions: ValueHelpCondition[] = [
  { id: "seed-1", exclude: false, operator: "StartsWith", value: "Nord" },
];

const vh = ValueHelp({
  open: false,
  onOpenChange: (o) => vh.update({ open: o }),
  title: "Seeded value help",
  items: SUPPLIERS,
  selectedIds: ids,
  conditions,
  onConfirm: (r) => { ids = r.ids; conditions = r.conditions; },
});`,
        render: () => {
          let ids: string[] = ["s2"];
          let conditions: ValueHelpCondition[] = [
            { id: "seed-1", exclude: false, operator: "StartsWith", value: "Nord" },
          ];

          const idsOut = out("ids");
          const condOut = out("conditions");
          idsOut.set(ids.map(labelOf).join(", "));
          condOut.set(conditions.map(describe).join(" AND "));

          const open = Button({ type: "button", variant: "outline", color: "neutral", children: "Open seeded value help" });

          const vh = ValueHelp({
            open: false,
            onOpenChange: (o) => vh.update({ open: o }),
            title: "Seeded value help",
            description: "Opens with one row picked and one rule already defined.",
            items: SUPPLIERS,
            selectedIds: ids,
            conditions,
            onConfirm: (r) => {
              ids = r.ids;
              conditions = r.conditions;
              vh.update({ selectedIds: ids, conditions });
              idsOut.set(ids.map(labelOf).join(", "));
              condOut.set(conditions.map(describe).join(" AND "));
            },
          });
          open.el.addEventListener("click", () => vh.update({ open: true }));

          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-flex-col zen-items-start zen-gap-2";
          wrap.append(open.el, idsOut.el, condOut.el, vh.el);
          return wrap;
        },
      },
    ],
  });
}

import { useState } from "react";
import { ValueHelp, type ValueHelpCondition } from "./value-help/value-help";
import { type SelectDialogItem } from "./select-dialog/select-dialog";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

/**
 * ValueHelp demo. Every section drives real state, because the point of the
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
];

const label = (id: string) => SUPPLIERS.find((s) => s.id === id)?.label ?? id;

const describe = (c: ValueHelpCondition) =>
  `${c.exclude ? "NOT " : ""}${c.operator}(${c.value}${c.valueTo ? `..${c.valueTo}` : ""})`;

const NewValueHelpDemo = () => {
  const [open, setOpen] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [conditions, setConditions] = useState<ValueHelpCondition[]>([]);

  const [seededOpen, setSeededOpen] = useState(false);
  const [seededIds, setSeededIds] = useState<string[]>(["s2"]);
  const [seededConditions, setSeededConditions] = useState<ValueHelpCondition[]>([
    { id: "seed-1", exclude: false, operator: "StartsWith", value: "Nord" },
  ]);

  return (
    <div className="demo-page">
      <h1>ValueHelp</h1>
      <p className="lede">
        The F4 lookup dialog. <code>SelectDialog</code> answers "which of these?";
        ValueHelp also answers "everything matching these rules". The{" "}
        <strong>Select</strong> tab is the same searchable list; the{" "}
        <strong>Conditions</strong> tab builds rules (include/exclude, an operator, one or
        two values) that a caller turns into a query. Unlike SelectDialog, clicking a row
        never commits on its own — the second tab needs an OK too, so OK is the only way
        out. Blank-valued rules are dropped on commit, since a rule with no value filters
        nothing.
      </p>

      <section className="demo-section">
        <h2>1. List + conditions, committed together</h2>
        <CodeExample
          title="ValueHelp with both tabs"
          description="Pick rows on the Select tab, add rules on the Conditions tab, then OK. Both halves arrive together in one onConfirm payload, because a real filter is usually 'these three, plus anything starting with X'."
          code={`const [ids, setIds] = useState<string[]>([]);
const [conditions, setConditions] = useState<ValueHelpCondition[]>([]);

<ValueHelp
  open={open}
  onOpenChange={setOpen}
  title="Supplier value help"
  description="Pick suppliers, or describe them with rules."
  items={SUPPLIERS}
  multiple
  selectedIds={ids}
  conditions={conditions}
  onConfirm={(r) => {
    setIds(r.ids);
    setConditions(r.conditions);
  }}
/>`}
        >
          <div className="zen-flex zen-flex-col zen-items-start zen-gap-2">
            <Button type="button" onClick={() => setOpen(true)}>
              Open value help
            </Button>
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              ids → <code>{ids.length ? ids.map(label).join(", ") : "—"}</code>
            </p>
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              conditions → <code>{conditions.length ? conditions.map(describe).join(" AND ") : "—"}</code>
            </p>
            <ValueHelp
              open={open}
              onOpenChange={setOpen}
              title="Supplier value help"
              description="Pick suppliers, or describe them with rules."
              items={SUPPLIERS}
              multiple
              selectedIds={ids}
              conditions={conditions}
              onConfirm={(r) => {
                setIds(r.ids);
                setConditions(r.conditions);
              }}
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Seeded, and Cancel restores</h2>
        <CodeExample
          title="selectedIds + conditions are read on open"
          description="Both seeds are read when the dialog opens, not live-bound: this is a picker, not a field. Edit anything and hit Cancel — the draft is thrown away and the seeds below are unchanged."
          code={`<ValueHelp
  open={open}
  onOpenChange={setOpen}
  title="Seeded value help"
  items={SUPPLIERS}
  selectedIds={["s2"]}
  conditions={[
    { id: "seed-1", exclude: false, operator: "StartsWith", value: "Nord" },
  ]}
  onConfirm={(r) => { … }}
/>`}
        >
          <div className="zen-flex zen-flex-col zen-items-start zen-gap-2">
            <Button type="button" variant="outline" color="neutral" onClick={() => setSeededOpen(true)}>
              Open seeded value help
            </Button>
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              ids → <code>{seededIds.length ? seededIds.map(label).join(", ") : "—"}</code>
            </p>
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              conditions →{" "}
              <code>{seededConditions.length ? seededConditions.map(describe).join(" AND ") : "—"}</code>
            </p>
            <ValueHelp
              open={seededOpen}
              onOpenChange={setSeededOpen}
              title="Seeded value help"
              description="Opens with one row picked and one rule already defined."
              items={SUPPLIERS}
              selectedIds={seededIds}
              conditions={seededConditions}
              onConfirm={(r) => {
                setSeededIds(r.ids);
                setSeededConditions(r.conditions);
              }}
            />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewValueHelpDemo;

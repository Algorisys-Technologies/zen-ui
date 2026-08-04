import { useState } from "react";
import { DiffView } from "./diff-view/diff-view";
import { Timeline, type TimelineItem } from "./timeline/timeline";
import { Badge } from "./badge/badge";
import { CodeExample } from "./demo-helpers";

const BEFORE = {
  status: "pending",
  amount: 1200,
  currency: "EUR",
  vendor: "Rotterdam Freight BV",
  reference: null,
};
const AFTER = {
  status: "approved",
  amount: 1250,
  currency: "EUR",
  vendor: "Rotterdam Freight BV",
  reference: "PO-4417",
};

const AUDIT: TimelineItem[] = [
  {
    id: "3",
    group: "Today",
    state: "success",
    icon: "check-circle",
    title: "Approved",
    timestamp: "09:14",
    description: "R. Iyer · finance",
    collapsible: true,
    children: <DiffView before={BEFORE} after={AFTER} density="compact" />,
  },
  {
    id: "2",
    group: "Today",
    state: "warning",
    title: "Amount corrected",
    timestamp: "08:51",
    description: "S. Menon · gate",
    collapsible: true,
    children: (
      <DiffView before={{ amount: 1200, weight_kg: 840 }} after={{ amount: 1250, weight_kg: 862 }} density="compact" />
    ),
  },
  {
    id: "1",
    group: "Yesterday",
    state: "info",
    title: "Created",
    timestamp: "17:02",
    description: "Scanned at gate 3",
    collapsible: true,
    children: <DiffView after={BEFORE} density="compact" />,
  },
];

const NewDiffViewDemo: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="demo-page">
      <h1>DiffView</h1>
      <p className="lede">
        What changed between two snapshots of the same record — an audit payload,
        a revision, a form's dirty state. It renders a table, because that is what
        it is: the fields are rows and the two snapshots are columns.
      </p>

      <section className="demo-section">
        <h2>1. Two snapshots in, the changes out</h2>
        <CodeExample
          title="Unchanged keys drop out"
          description="An audit entry is about what changed, so a field that stayed the same is noise — currency and vendor are identical here and never reach the table. Pass changedOnly={false} for the full record, which is right for a side-by-side review screen and wrong for a history feed."
          code={`<DiffView
  before={{ status: "pending",  amount: 1200, currency: "EUR" }}
  after={{  status: "approved", amount: 1250, currency: "EUR" }}
/>
// two rows: status, amount. currency is identical, so it is not shown.`}
        >
          <DiffView before={BEFORE} after={AFTER} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Added, removed, and cleared</h2>
        <CodeExample
          title="`null` is a value; absence is not"
          description="Three different events that a naive diff collapses into one. A field set to null was cleared by someone and renders as the literal word. A field that is simply gone renders as a dash with a screen-reader label reading 'not set'. Kind is never signalled by colour alone: the replaced value is struck through, so the diff still reads in greyscale."
          code={`<DiffView
  before={{ note: "chase vendor", tag: "urgent", ref: null }}
  after={{  note: null,           owner: "R. Iyer" }}
/>`}
        >
          <DiffView
            before={{ note: "chase vendor", tag: "urgent", ref: null }}
            after={{ note: null, owner: "R. Iyer" }}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. What an audit column actually holds</h2>
        <CodeExample
          title="Strings in, and not all of them are objects"
          description="A real audit table is nvarchar, not JSON: one row holds a serialised object, the next a bare array, the next a line of prose someone typed, and an empty string when there was no before at all. A bare JSON.parse takes the panel down on three of those. Pass the raw values — strings are parsed with a parse that never throws, empty means absence, and text that is not JSON stays the text it is. Two objects get the field table; anything else is shown whole."
          code={`<DiffView before={log.old_value} after={log.new_value} />

// '{"status":"pending"}'  -> field table
// '[{"code":"E12"}]'      -> shown whole, both sides
// 'cancelled by operator' -> shown whole, as text
// ''                      -> "not set" on that side alone`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
            <DiffView before={'{"status":"pending","qty":40}'} after={'{"status":"approved","qty":42}'} />
            <DiffView before="" after={'[{"code":"E12","field":"weight"},{"code":"E19","field":"po_ref"}]'} />
            <DiffView before="awaiting gate clearance" after="cancelled by operator" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Naming and formatting</h2>
        <CodeExample
          title="`keys`, `labels` and `format`"
          description="keys selects and orders; a key you list that is absent from both snapshots yields no row, so you can hand it a fixed field list without filtering first. Neither labels nor humanising is applied by default — turning weight_kg into 'Weight kg' would be guessing at your wording, and the repo would rather print the key it actually compared."
          code={`<DiffView
  before={before}
  after={after}
  keys={["amount", "status"]}
  labels={{ amount: "Amount (EUR)" }}
  format={(value, key) => (key === "amount" ? \`€\${value}\` : String(value))}
/>`}
        >
          <DiffView
            before={BEFORE}
            after={AFTER}
            keys={["amount", "status"]}
            labels={{ amount: "Amount (EUR)", status: "Approval" }}
            format={(value, key) => {
              if (key === "amount") return `€${Number(value).toLocaleString("en-IE")}`;
              if (key === "status")
                return <Badge variant="soft" color={value === "approved" ? "success" : "neutral"}>{String(value)}</Badge>;
              return String(value);
            }}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Inside a Timeline</h2>
        <CodeExample
          title="The reason it exists"
          description="An audit trail is a Timeline of events, each carrying the payload that changed. Put the DiffView in the item's children and set collapsible, and the events stay scannable while the detail is one click away. Pass open and onOpenChange to make it single-open, as an audit panel usually is."
          code={`<Timeline items={log.map((e) => ({
  id: e.id,
  title: e.action,
  timestamp: e.at,
  collapsible: true,
  open: openId === e.id,
  onOpenChange: (o) => setOpenId(o ? e.id : null),
  children: <DiffView before={e.before} after={e.after} density="compact" />,
}))} />`}
        >
          <Timeline
            items={AUDIT.map((item) => ({
              ...item,
              open: open === item.id,
              onOpenChange: (o: boolean) => setOpen(o ? item.id : null),
            }))}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Nothing changed</h2>
        <CodeExample
          title="The common case, not an error"
          description="A re-save that touched nothing is a real event worth logging, and it should not render an empty table with three headings."
          code={`<DiffView before={record} after={record} emptyMessage="Re-saved, nothing changed" />`}
        >
          <DiffView before={AFTER} after={AFTER} emptyMessage="Re-saved, nothing changed" />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewDiffViewDemo;

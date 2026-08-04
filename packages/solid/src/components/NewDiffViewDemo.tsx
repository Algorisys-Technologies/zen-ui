import { DiffView } from "./diff-view/diff-view";
import { Badge } from "./badge/badge";
import { Timeline, type TimelineItem } from "./timeline/timeline";
import { DemoPage, DemoSection } from "./demo-helpers";

const INVOICE_BEFORE = {
  status: "pending",
  amount: 1200,
  currency: "EUR",
  vendor: "Rotterdam Freight BV",
  reference: null,
};

const INVOICE_AFTER = {
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
    dateTime: "2026-08-04T09:14",
    description: "R. Iyer · finance",
    collapsible: true,
    children: <DiffView before={INVOICE_BEFORE} after={INVOICE_AFTER} density="compact" />,
  },
  {
    id: "2",
    group: "Today",
    state: "warning",
    title: "Amount corrected",
    timestamp: "08:51",
    dateTime: "2026-08-04T08:51",
    description: "S. Menon · gate",
    collapsible: true,
    children: (
      <DiffView
        before={{ amount: 1200, weight_kg: 840 }}
        after={{ amount: 1250, weight_kg: 862 }}
        density="compact"
      />
    ),
  },
  {
    id: "1",
    group: "Yesterday",
    state: "info",
    title: "Created",
    timestamp: "17:02",
    dateTime: "2026-08-03T17:02",
    description: "Scanned at gate 3",
    collapsible: true,
    children: <DiffView after={INVOICE_BEFORE} density="compact" />,
  },
];

const NewDiffViewDemo = () => (
  <DemoPage
    title="DiffView"
    description={
      <>
        What changed between two snapshots of the same record — an audit
        payload, a revision, a form's dirty state. It renders a table, because
        that is what it is: the fields are rows and the two snapshots are
        columns.
      </>
    }
  >
    <DemoSection
      title="1. Two snapshots in, the changes out"
      codeTitle="Unchanged keys drop out"
      codeDescription="An audit entry is about what changed, so a field that stayed the same is noise — `currency` and `vendor` are identical here and never reach the table. Pass changedOnly={false} when you want the full record, which is the right call for a side-by-side review screen and the wrong one for a history feed."
      code={`<DiffView
  before={{ status: "pending",  amount: 1200, currency: "EUR" }}
  after={{  status: "approved", amount: 1250, currency: "EUR" }}
/>
// two rows: status, amount. currency is identical, so it is not shown.`}
    >
      <DiffView before={INVOICE_BEFORE} after={INVOICE_AFTER} />
    </DemoSection>

    <DemoSection
      title="2. The whole record"
      codeTitle="changedOnly={false}"
      codeDescription="Every compared key, changed or not. The unchanged rows stay muted so the changed ones still carry the eye — the point of showing them at all is context, not equal billing."
      code={`<DiffView before={before} after={after} changedOnly={false} />`}
    >
      <DiffView before={INVOICE_BEFORE} after={INVOICE_AFTER} changedOnly={false} />
    </DemoSection>

    <DemoSection
      title="3. Added, removed, and cleared"
      codeTitle="`null` is a value; absence is not"
      codeDescription="Three different events that a naive diff collapses into one. A field set to null was cleared by someone and renders as the literal word. A field that is simply gone renders as a dash with a screen-reader label reading 'not set'. Kind is never signalled by colour alone: the replaced value is struck through, so the diff still reads in greyscale."
      code={`<DiffView
  before={{ note: "chase vendor", tag: "urgent", ref: null }}
  after={{  note: null,           owner: "R. Iyer" }}
/>
// note   changed  -> null   (cleared)
// tag    removed  -> —      (not set)
// ref    removed  -> —
// owner  added    -> R. Iyer`}
    >
      <DiffView
        before={{ note: "chase vendor", tag: "urgent", ref: null }}
        after={{ note: null, owner: "R. Iyer" }}
      />
    </DemoSection>

    <DemoSection
      title="4. Naming and ordering the fields"
      codeTitle="`keys` and `labels`"
      codeDescription="keys selects and orders; a key you list that is absent from both snapshots yields no row, so you can hand it a fixed field list without filtering it first. labels renames for display. Neither is applied by default — humanising `weight_kg` into 'Weight kg' would be guessing at your wording, and the repo would rather print the key it actually compared."
      code={`<DiffView
  before={before}
  after={after}
  keys={["amount", "status"]}
  labels={{ amount: "Amount (EUR)", status: "Approval" }}
/>`}
    >
      <DiffView
        before={INVOICE_BEFORE}
        after={INVOICE_AFTER}
        keys={["amount", "status"]}
        labels={{ amount: "Amount (EUR)", status: "Approval" }}
      />
    </DemoSection>

    <DemoSection
      title="5. Formatting the values"
      codeTitle="`format` is per value, not per row"
      codeDescription="The default prints strings verbatim, numbers and booleans through String(), and anything else through JSON.stringify. Pass format when the raw value is not what a reader wants — a currency, a status chip, a date in the viewer's timezone. It receives the key too, so one function can handle a whole record."
      code={`<DiffView
  before={before}
  after={after}
  format={(value, key) =>
    key === "amount"
      ? \`€\${Number(value).toLocaleString("en-IE")}\`
      : String(value)
  }
/>`}
    >
      <DiffView
        before={INVOICE_BEFORE}
        after={INVOICE_AFTER}
        keys={["amount", "status"]}
        format={(value, key) => {
          if (key === "amount") return `€${Number(value).toLocaleString("en-IE")}`;
          if (key === "status") {
            return (
              <Badge variant="soft" color={value === "approved" ? "success" : "neutral"}>
                {String(value)}
              </Badge>
            );
          }
          return String(value);
        }}
      />
    </DemoSection>

    <DemoSection
      title="6. Inside a Timeline"
      codeTitle="The reason it exists"
      codeDescription="An audit trail is a Timeline of events, each carrying the payload that changed. Put the DiffView in the item's children and set collapsible, and the events stay scannable while the detail is one click away. density='compact' tightens the table for the narrower column. A record that was just created has no before at all — pass only after and every field reads as added."
      code={`const items = [
  {
    id: "3",
    title: "Approved",
    timestamp: "09:14",
    description: "R. Iyer · finance",
    state: "success",
    collapsible: true,
    children: <DiffView before={before} after={after} density="compact" />,
  },
];

<Timeline items={items} />`}
    >
      <Timeline items={AUDIT} />
    </DemoSection>

    <DemoSection
      title="7. What an audit column actually holds"
      codeTitle="Strings in, and not all of them are objects"
      codeDescription="A real audit table is nvarchar, not JSON: one row holds a serialised object, the next a bare array, the next an ad-hoc map, the next a line of prose someone typed, and an empty string when there was no before at all. A bare JSON.parse takes the panel down on three of those. Pass the raw values — strings are parsed with a parse that never throws, empty means absence, and text that is not JSON stays the text it is. Two objects get the field table; anything else is shown whole, side by side, because an array has no field names to put in the left column."
      code={`// straight from the row, unparsed
<DiffView before={log.old_value} after={log.new_value} />

// '{"status":"pending"}'  -> field table
// '[{"code":"E12"}]'      -> shown whole, both sides
// 'cancelled by operator' -> shown whole, as text
// ''                      -> "not set" on that side alone`}
    >
      <div class="zen-flex zen-flex-col zen-gap-4">
        <DiffView
          before={'{"status":"pending","qty":40}'}
          after={'{"status":"approved","qty":42}'}
        />
        <DiffView
          before=""
          after={'[{"code":"E12","field":"weight"},{"code":"E19","field":"po_ref"}]'}
        />
        <DiffView before="awaiting gate clearance" after="cancelled by operator" />
      </div>
    </DemoSection>

    <DemoSection
      title="8. Nothing changed"
      codeTitle="The common case, not an error"
      codeDescription="A re-save that touched nothing is a real event worth logging, and it should not render an empty table with three headings. emptyMessage replaces the default 'No changes'."
      code={`<DiffView before={record} after={record} emptyMessage="Re-saved, nothing changed" />`}
    >
      <DiffView
        before={INVOICE_AFTER}
        after={INVOICE_AFTER}
        emptyMessage="Re-saved, nothing changed"
      />
    </DemoSection>
  </DemoPage>
);

export default NewDiffViewDemo;

import { DiffView } from "./diff-view/diff-view";
import { Timeline, type TimelineItem } from "./timeline/timeline";
import { Badge } from "./badge/badge";
import { DemoPage } from "./demo-helpers";

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

export default function DiffViewDemo(): HTMLElement {
  /* Single-open, as an audit panel usually is. Held here because the Timeline is
     data-driven: the demo owns which row is open and re-renders the list. */
  let open: string | null = null;

  const audit = (): TimelineItem[] => [
    {
      id: "3",
      group: "Today",
      state: "success",
      icon: "check-circle",
      title: "Approved",
      timestamp: "09:14",
      description: "R. Iyer · finance",
      collapsible: true,
      open: open === "3",
      onOpenChange: (o) => {
        open = o ? "3" : null;
        repaint();
      },
      children: DiffView({ before: BEFORE, after: AFTER, density: "compact" }).el,
    },
    {
      id: "2",
      group: "Today",
      state: "warning",
      title: "Amount corrected",
      timestamp: "08:51",
      description: "S. Menon · gate",
      collapsible: true,
      open: open === "2",
      onOpenChange: (o) => {
        open = o ? "2" : null;
        repaint();
      },
      children: DiffView({
        before: { amount: 1200, weight_kg: 840 },
        after: { amount: 1250, weight_kg: 862 },
        density: "compact",
      }).el,
    },
    {
      id: "1",
      group: "Yesterday",
      state: "info",
      title: "Created",
      timestamp: "17:02",
      description: "Scanned at gate 3",
      collapsible: true,
      open: open === "1",
      onOpenChange: (o) => {
        open = o ? "1" : null;
        repaint();
      },
      children: DiffView({ after: BEFORE, density: "compact" }).el,
    },
  ];

  const timeline = Timeline({ items: audit() });
  const repaint = () => timeline.update({ items: audit() });

  return DemoPage({
    title: "DiffView",
    description:
      "What changed between two snapshots of the same record — an audit payload, a revision, a form's dirty state. It renders a table, because that is what it is: the fields are rows and the two snapshots are columns.",
    sections: [
      {
        title: "1. Two snapshots in, the changes out",
        codeTitle: "Unchanged keys drop out",
        codeDescription:
          "An audit entry is about what changed, so a field that stayed the same is noise — currency and vendor are identical here and never reach the table. Pass changedOnly: false for the full record, which is right for a side-by-side review screen and wrong for a history feed.",
        code: `DiffView({
  before: { status: "pending",  amount: 1200, currency: "EUR" },
  after:  { status: "approved", amount: 1250, currency: "EUR" },
}).el
// two rows: status, amount. currency is identical, so it is not shown.`,
        render: () => DiffView({ before: BEFORE, after: AFTER }).el,
      },
      {
        title: "2. Added, removed, and cleared",
        codeTitle: "`null` is a value; absence is not",
        codeDescription:
          "Three different events that a naive diff collapses into one. A field set to null was cleared by someone and renders as the literal word. A field that is simply gone renders as a dash with a screen-reader label reading 'not set'. Kind is never signalled by colour alone: the replaced value is struck through, so the diff still reads in greyscale.",
        code: `DiffView({
  before: { note: "chase vendor", tag: "urgent", ref: null },
  after:  { note: null,           owner: "R. Iyer" },
}).el`,
        render: () =>
          DiffView({
            before: { note: "chase vendor", tag: "urgent", ref: null },
            after: { note: null, owner: "R. Iyer" },
          }).el,
      },
      {
        title: "3. What an audit column actually holds",
        codeTitle: "Strings in, and not all of them are objects",
        codeDescription:
          "A real audit table is nvarchar, not JSON: one row holds a serialised object, the next a bare array, the next a line of prose someone typed, and an empty string when there was no before at all. A bare JSON.parse takes the panel down on three of those. Pass the raw values — strings go through a parse that never throws, empty means absence, and text that is not JSON stays the text it is.",
        code: `DiffView({ before: log.old_value, after: log.new_value }).el

// '{"status":"pending"}'  -> field table
// '[{"code":"E12"}]'      -> shown whole, both sides
// 'cancelled by operator' -> shown whole, as text
// ''                      -> "not set" on that side alone`,
        render: () => {
          const stack = document.createElement("div");
          stack.style.display = "flex";
          stack.style.flexDirection = "column";
          stack.style.gap = "1rem";
          stack.style.width = "100%";
          stack.append(
            DiffView({ before: '{"status":"pending","qty":40}', after: '{"status":"approved","qty":42}' }).el,
            DiffView({ before: "", after: '[{"code":"E12","field":"weight"},{"code":"E19","field":"po_ref"}]' }).el,
            DiffView({ before: "awaiting gate clearance", after: "cancelled by operator" }).el,
          );
          return stack;
        },
      },
      {
        title: "4. Naming and formatting",
        codeTitle: "`keys`, `labels` and `format`",
        codeDescription:
          "keys selects and orders; a key you list that is absent from both snapshots yields no row, so you can hand it a fixed field list without filtering first. Neither labels nor humanising is applied by default — turning weight_kg into 'Weight kg' would be guessing at your wording, and the repo would rather print the key it actually compared.",
        code: `DiffView({
  before, after,
  keys: ["amount", "status"],
  labels: { amount: "Amount (EUR)" },
  format: (value, key) => (key === "amount" ? \`€\${value}\` : String(value)),
}).el`,
        render: () =>
          DiffView({
            before: BEFORE,
            after: AFTER,
            keys: ["amount", "status"],
            labels: { amount: "Amount (EUR)", status: "Approval" },
            format: (value, key) => {
              if (key === "amount") return `€${Number(value).toLocaleString("en-IE")}`;
              if (key === "status")
                return Badge({
                  variant: "soft",
                  color: value === "approved" ? "success" : "neutral",
                  children: String(value),
                }).el;
              return String(value);
            },
          }).el,
      },
      {
        title: "5. Inside a Timeline",
        codeTitle: "The reason it exists",
        codeDescription:
          "An audit trail is a Timeline of events, each carrying the payload that changed. Put the DiffView in the item's children and set collapsible, and the events stay scannable while the detail is one click away. Pass open and onOpenChange to make it single-open, as an audit panel usually is.",
        code: `Timeline({ items: log.map((e) => ({
  id: e.id,
  title: e.action,
  timestamp: e.at,
  collapsible: true,
  open: openId === e.id,
  onOpenChange: (o) => setOpen(o ? e.id : null),
  children: DiffView({ before: e.before, after: e.after, density: "compact" }).el,
})) }).el`,
        render: () => timeline.el,
      },
      {
        title: "6. Nothing changed",
        codeTitle: "The common case, not an error",
        codeDescription:
          "A re-save that touched nothing is a real event worth logging, and it should not render an empty table with three headings.",
        code: `DiffView({ before: record, after: record, emptyMessage: "Re-saved, nothing changed" }).el`,
        render: () => DiffView({ before: AFTER, after: AFTER, emptyMessage: "Re-saved, nothing changed" }).el,
      },
    ],
  });
}

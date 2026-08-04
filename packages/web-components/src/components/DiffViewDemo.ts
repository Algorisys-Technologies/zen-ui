import { DemoPage } from "./demo-helpers";

const BEFORE = { status: "pending", amount: 1200, currency: "EUR", vendor: "Rotterdam Freight BV", reference: null };
const AFTER = { status: "approved", amount: 1250, currency: "EUR", vendor: "Rotterdam Freight BV", reference: "PO-4417" };

/** A <zen-diff-view> built from attributes — the declarative path. */
function diff(attrs: Record<string, string>): HTMLElement {
  const el = document.createElement("zen-diff-view");
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function stack(...nodes: HTMLElement[]): HTMLElement {
  const box = document.createElement("div");
  box.style.display = "flex";
  box.style.flexDirection = "column";
  box.style.gap = "1rem";
  box.style.width = "100%";
  box.append(...nodes);
  return box;
}

export default function DiffViewDemo(): HTMLElement {
  return DemoPage({
    title: "DiffView",
    description:
      "What changed between two snapshots of the same record — an audit payload, a revision, a form's dirty state. It renders a table, because that is what it is: the fields are rows and the two snapshots are columns.",
    sections: [
      {
        title: "1. Two snapshots in, the changes out",
        codeTitle: "Unchanged keys drop out",
        codeDescription:
          "An audit entry is about what changed, so a field that stayed the same is noise — currency and vendor are identical here and never reach the table. changed-only='false' shows the full record, which is right for a side-by-side review screen and wrong for a history feed.",
        code: `<zen-diff-view
  before='{"status":"pending","amount":1200,"currency":"EUR"}'
  after='{"status":"approved","amount":1250,"currency":"EUR"}'>
</zen-diff-view>
<!-- two rows: status, amount. currency is identical, so it is not shown. -->`,
        render: () => diff({ before: JSON.stringify(BEFORE), after: JSON.stringify(AFTER) }),
      },
      {
        title: "2. Added, removed, and cleared",
        codeTitle: "`null` is a value; absence is not",
        codeDescription:
          "Three different events that a naive diff collapses into one. A field set to null was cleared by someone and renders as the literal word. A field that is simply gone renders as a dash with a screen-reader label reading 'not set'. Kind is never signalled by colour alone: the replaced value is struck through, so the diff still reads in greyscale.",
        code: `<zen-diff-view
  before='{"note":"chase vendor","tag":"urgent","ref":null}'
  after='{"note":null,"owner":"R. Iyer"}'>
</zen-diff-view>`,
        render: () =>
          diff({
            before: JSON.stringify({ note: "chase vendor", tag: "urgent", ref: null }),
            after: JSON.stringify({ note: null, owner: "R. Iyer" }),
          }),
      },
      {
        title: "3. Why `before` is a string attribute, not json",
        codeTitle: "The audit column is nvarchar, not JSON",
        codeDescription:
          "One row holds a serialised object, the next a bare array, the next a line of prose someone typed, and an empty string where there was no before at all. The component's own parse never throws and keeps non-JSON text as the text it is — so the attribute stays a plain string and lets it do that job. Declared json instead, the attribute coercion would take over: measured, it logs a parse error and yields undefined, so before='cancelled by operator' would render as 'not set' and print to the console.",
        code: `<zen-diff-view before='{"status":"pending","qty":40}' after='{"status":"approved","qty":42}'></zen-diff-view>
<zen-diff-view before="" after='[{"code":"E12"},{"code":"E19"}]'></zen-diff-view>
<zen-diff-view before="awaiting gate clearance" after="cancelled by operator"></zen-diff-view>`,
        render: () =>
          stack(
            diff({ before: '{"status":"pending","qty":40}', after: '{"status":"approved","qty":42}' }),
            diff({ before: "", after: '[{"code":"E12","field":"weight"},{"code":"E19","field":"po_ref"}]' }),
            diff({ before: "awaiting gate clearance", after: "cancelled by operator" }),
          ),
      },
      {
        title: "4. Naming and formatting",
        codeTitle: "`keys` and `labels` are attributes; `format` is a property",
        codeDescription:
          "keys selects and orders; a key you list that is absent from both snapshots yields no row, so you can hand it a fixed field list without filtering first. format returns a Node or a string and so has no attribute form — it is set as a property, like every render function in this binding.",
        code: `<zen-diff-view keys='["amount","status"]' labels='{"amount":"Amount (EUR)"}'></zen-diff-view>

el.format = (value, key) => (key === "amount" ? \`€\${value}\` : String(value));`,
        render: () => {
          const el = diff({
            before: JSON.stringify(BEFORE),
            after: JSON.stringify(AFTER),
            keys: '["amount","status"]',
            labels: '{"amount":"Amount (EUR)","status":"Approval"}',
          });
          (el as unknown as { format: (v: unknown, k: string) => unknown }).format = (value, key) => {
            if (key === "amount") return `€${Number(value).toLocaleString("en-IE")}`;
            if (key === "status") {
              const b = document.createElement("zen-badge");
              b.setAttribute("variant", "soft");
              b.setAttribute("color", value === "approved" ? "success" : "neutral");
              b.textContent = String(value);
              return b;
            }
            return String(value);
          };
          return el;
        },
      },
      {
        title: "5. Inside a Timeline",
        codeTitle: "The reason it exists",
        codeDescription:
          "An audit trail is a Timeline of events, each carrying the payload that changed. A timeline item's children may be a Node, which JSON cannot express, so this is the case that goes through the items PROPERTY rather than the attribute — set collapsible and the events stay scannable while the detail is one click away.",
        code: `const rows = log.map((e) => ({
  id: e.id, title: e.action, timestamp: e.at, collapsible: true,
  children: Object.assign(document.createElement("zen-diff-view"), {
    before: e.before, after: e.after, density: "compact",
  }),
}));
document.querySelector("zen-timeline").items = rows;`,
        render: () => {
          const mkDiff = (before: unknown, after: unknown) => {
            const d = document.createElement("zen-diff-view");
            if (before !== undefined) d.setAttribute("before", JSON.stringify(before));
            d.setAttribute("after", JSON.stringify(after));
            d.setAttribute("density", "compact");
            return d;
          };
          const items = [
            { id: "3", group: "Today", state: "success", icon: "check-circle", title: "Approved",
              timestamp: "09:14", description: "R. Iyer · finance", collapsible: true,
              children: mkDiff(BEFORE, AFTER) },
            { id: "2", group: "Today", state: "warning", title: "Amount corrected",
              timestamp: "08:51", description: "S. Menon · gate", collapsible: true,
              children: mkDiff({ amount: 1200, weight_kg: 840 }, { amount: 1250, weight_kg: 862 }) },
            { id: "1", group: "Yesterday", state: "info", title: "Created",
              timestamp: "17:02", description: "Scanned at gate 3", collapsible: true,
              children: mkDiff(undefined, BEFORE) },
          ];
          const tl = document.createElement("zen-timeline");
          (tl as unknown as { items: unknown[] }).items = items;
          return tl;
        },
      },
      {
        title: "6. Nothing changed",
        codeTitle: "The common case, not an error",
        codeDescription:
          "A re-save that touched nothing is a real event worth logging, and it should not render an empty table with three headings.",
        code: `<zen-diff-view before="…" after="…" empty-message="Re-saved, nothing changed"></zen-diff-view>`,
        render: () =>
          diff({
            before: JSON.stringify(AFTER),
            after: JSON.stringify(AFTER),
            "empty-message": "Re-saved, nothing changed",
          }),
      },
    ],
  });
}

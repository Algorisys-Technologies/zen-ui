import { For, Show, createMemo, createSignal } from "solid-js";
import { filterPredicate, loadFilter, type FilterField, type FilterGroup } from "@algorisys/zen-ui-core/filter";
import { FilterBuilder } from "./filter-builder/filter-builder";
import { DemoPage, DemoSection } from "./demo-helpers";

type Invoice = { no: string; customer: string; status: string; amount: number; due: string; gst: boolean };
const CUSTOMERS = [
  { value: "acme", label: "Acme Traders" },
  { value: "bharat", label: "Bharat Steels" },
  { value: "coastal", label: "Coastal Agencies" },
  { value: "deccan", label: "Deccan Engineering" },
];
const INVOICES: Invoice[] = [
  { no: "SI/26/0101", customer: "acme", status: "overdue", amount: 48500, due: "2026-10-05", gst: true },
  { no: "SI/26/0102", customer: "coastal", status: "overdue", amount: 236000, due: "2026-10-12", gst: true },
  { no: "SI/26/0103", customer: "deccan", status: "overdue", amount: 91200, due: "2026-10-20", gst: false },
  { no: "SI/26/0104", customer: "bharat", status: "paid", amount: 412000, due: "2026-09-30", gst: true },
  { no: "SI/26/0105", customer: "bharat", status: "overdue", amount: 17800, due: "2026-10-28", gst: true },
  { no: "SI/26/0106", customer: "coastal", status: "draft", amount: 152000, due: "2026-11-15", gst: false },
  { no: "SI/26/0107", customer: "acme", status: "paid", amount: 9400, due: "2026-10-01", gst: true },
  { no: "SI/26/0108", customer: "deccan", status: "overdue", amount: 128900, due: "2026-11-02", gst: true },
];
const FIELDS: FilterField[] = [
  { id: "no", label: "Invoice", type: "text" },
  { id: "customer", label: "Customer", type: "enum", options: CUSTOMERS },
  { id: "status", label: "Status", type: "enum", options: [{ value: "draft", label: "Draft" }, { value: "overdue", label: "Overdue" }, { value: "paid", label: "Paid" }] },
  { id: "amount", label: "Amount", type: "number" },
  { id: "due", label: "Due", type: "date" },
  { id: "gst", label: "GST invoice", type: "boolean" },
];
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const format = (v: string | number, f: FilterField) =>
  f.type === "number" ? inr.format(Number(v)) : f.type === "date" ? new Date(`${v}T00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : String(v);

// The review's example: status is Overdue AND (customer is Acme or Bharat OR amount > 1,00,000).
const REVIEW: FilterGroup = {
  kind: "group", id: "root", join: "and", children: [
    { kind: "condition", id: "c1", field: "status", op: "in", value: ["overdue"] },
    { kind: "group", id: "g1", join: "or", children: [
      { kind: "condition", id: "c2", field: "customer", op: "in", value: ["acme", "bharat"] },
      { kind: "condition", id: "c3", field: "amount", op: "gt", value: 100000 },
    ] },
  ],
};

// A view saved last quarter, before "Region" was dropped and "Disputed" retired.
const SAVED = {
  kind: "group", join: "and", children: [
    { kind: "condition", field: "region", op: "in", value: ["west"] },
    { kind: "condition", field: "status", op: "in", value: ["overdue", "disputed"] },
    { kind: "condition", field: "due", op: "lt", value: "2026-11-01" },
  ],
};

const NewFilterBuilderDemo = () => {
  const [filter, setFilter] = createSignal<FilterGroup>(REVIEW);
  const matches = createMemo(() => INVOICES.filter(filterPredicate(filter(), FIELDS, (r, f) => r[f as keyof Invoice])));
  const loaded = loadFilter(SAVED, FIELDS);
  const [restored, setRestored] = createSignal<FilterGroup>(loaded.filter);

  return (
    <DemoPage
      title="FilterBuilder"
      description="Nested AND/OR conditions on any field, edited as a tree and held as one plain object: save it in a view, send it to the server as report criteria, or filter rows with filterPredicate. A condition still missing its value filters nothing, and the summary says what the filter does now."
    >
      <DemoSection
        title="1. Overdue, for these customers or large"
        codeTitle="The review's example, live over eight invoices"
        codeDescription="Change anything: a field's type picks its operators and editor (text, number, a typed date with a calendar, a list of choices, yes or no). Each group's Match covers all, any, none and not all. Add a group for brackets."
        code={`const fields: FilterField[] = [
  { id: "customer", label: "Customer", type: "enum", options: customers },
  { id: "status", label: "Status", type: "enum", options: statuses },
  { id: "amount", label: "Amount", type: "number" },
  { id: "due", label: "Due", type: "date" },
];
<FilterBuilder fields={fields} value={filter()} onValueChange={setFilter} />

// Filter here, or send filter() to the server as it is.
const rows = invoices.filter(filterPredicate(filter(), fields, (r, f) => r[f]));`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-4">
          <FilterBuilder fields={FIELDS} value={filter()} onValueChange={setFilter} formatValue={format} aria-label="Invoice filter" />
          <div class="zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border">
            <p class="zen-m-0 zen-border-0 zen-border-b zen-border-solid zen-border-zen-border zen-px-3 zen-py-2 zen-text-sm zen-font-medium" data-testid="match-count">
              {matches().length} of {INVOICES.length} invoices
            </p>
            <table class="zen-w-full zen-border-collapse zen-text-sm" data-testid="matches">
              <thead>
                <tr class="zen-text-start zen-text-xs zen-text-zen-muted-fg">
                  <th class="zen-px-3 zen-py-1.5 zen-text-start zen-font-medium">Invoice</th>
                  <th class="zen-px-3 zen-py-1.5 zen-text-start zen-font-medium">Customer</th>
                  <th class="zen-px-3 zen-py-1.5 zen-text-start zen-font-medium">Status</th>
                  <th class="zen-px-3 zen-py-1.5 zen-text-end zen-font-medium">Amount</th>
                  <th class="zen-px-3 zen-py-1.5 zen-text-start zen-font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                <For each={matches()}>
                  {(r) => (
                    <tr class="zen-border-0 zen-border-t zen-border-solid zen-border-zen-border">
                      <td class="zen-px-3 zen-py-1.5">{r.no}</td>
                      <td class="zen-px-3 zen-py-1.5">{CUSTOMERS.find((c) => c.value === r.customer)?.label}</td>
                      <td class="zen-px-3 zen-py-1.5 zen-capitalize">{r.status}</td>
                      <td class="zen-px-3 zen-py-1.5 zen-text-end zen-tabular-nums">{inr.format(r.amount)}</td>
                      <td class="zen-px-3 zen-py-1.5 zen-tabular-nums">{r.due}</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
          <details>
            <summary class="zen-cursor-pointer zen-text-sm zen-text-zen-muted-fg">The value, as it would be saved</summary>
            <pre class="zen-m-0 zen-mt-2 zen-max-h-64 zen-overflow-auto zen-rounded-zen-md zen-bg-zen-muted zen-p-3 zen-text-xs" data-testid="filter-json">{JSON.stringify(filter(), null, 2)}</pre>
          </details>
        </div>
      </DemoSection>

      <DemoSection
        title="2. Loading a saved filter"
        codeTitle="loadFilter: what still means something is kept, the rest is named"
        codeDescription="A view saved last quarter filtered on Region (since removed) and on a Disputed status (since retired). Loading it keeps the rest and says what it could not keep, instead of failing or silently filtering on nothing."
        code={`const { filter, dropped } = loadFilter(savedView.filter, fields);
// dropped: ["region (no longer a field)", "Status: disputed (no longer an option)"]`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-3">
          <Show when={loaded.dropped.length}>
            <div role="note" class="zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-warning zen-bg-zen-warning-soft zen-px-3 zen-py-2 zen-text-sm zen-text-zen-warning-soft-fg" data-testid="dropped">
              Some of this saved filter no longer applies and was left out: {loaded.dropped.join("; ")}.
            </div>
          </Show>
          <FilterBuilder fields={FIELDS} value={restored()} onValueChange={setRestored} formatValue={format} aria-label="Restored filter" />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewFilterBuilderDemo;

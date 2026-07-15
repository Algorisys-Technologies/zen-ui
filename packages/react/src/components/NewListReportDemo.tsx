import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  resolveDateRange,
  type DateRangeValue,
} from "@algorisys/zen-ui-core/date-range";
import { FilterBar } from "./filter-bar/filter-bar";
import { DataTable } from "./data-table/data-table";
import { DynamicDateRange } from "./form/dynamic-date-range/dynamic-date-range";
import { Combobox } from "./combobox/combobox";
import { NumberField } from "./form/number-field/number-field";
import { Badge } from "./badge/badge";
import { CodeExample } from "./demo-helpers";
import {
  AS_OF,
  ORDERS,
  STATUS_OPTIONS,
  SUPPLIER_OPTIONS,
  money,
  statusColor,
  type Order,
} from "./patterns/list-report-data";

/** The filters, as one value. Draft and applied are the same shape. */
type Filters = {
  supplier: string;
  status: string;
  date?: DateRangeValue;
  minAmount?: number;
};

const EMPTY: Filters = { supplier: "", status: "", date: undefined, minAmount: undefined };

/** Named once, so neither state is seeded from the other. */
const INITIAL: Filters = { ...EMPTY, date: { operator: "LAST_MONTHS", count: 3 } };

const matches = (o: Order, f: Filters): boolean => {
  if (f.supplier && o.supplier !== f.supplier) return false;
  if (f.status && o.status !== f.status) return false;
  if (f.minAmount != null && o.amount < f.minAmount) return false;
  if (f.date) {
    // The saved value is a PERIOD; it becomes dates only here, at query time.
    const { from, to } = resolveDateRange(f.date, AS_OF);
    const d = new Date(o.date + "T12:00:00");
    if (from && d < from) return false;
    if (to && d > to) return false;
  }
  return true;
};

const columns: ColumnDef<Order>[] = [
  { accessorKey: "id", header: "Order" },
  { accessorKey: "supplier", header: "Supplier" },
  { accessorKey: "city", header: "City" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="soft" color={statusColor(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: "date", header: "Ordered" },
  {
    accessorKey: "amount",
    header: () => <span className="zen-block zen-text-right">Amount</span>,
    cell: ({ row }) => (
      <span className="zen-block zen-text-right zen-tabular-nums">{money(row.original.amount)}</span>
    ),
  },
];

const NewListReportDemo: React.FC = () => {
  // Two states, not one. `draft` is what the controls hold; `applied` is what
  // the table is showing. Go copies one to the other. That split IS the List
  // Report contract — see section 2.
  const [draft, setDraft] = useState<Filters>(INITIAL);
  const [applied, setApplied] = useState<Filters>(INITIAL);

  const rows = useMemo(() => ORDERS.filter((o) => matches(o, applied)), [applied]);

  const fields = [
    {
      id: "supplier",
      label: "Supplier",
      render: () => (
        <Combobox
          options={SUPPLIER_OPTIONS}
          value={draft.supplier}
          onValueChange={(v) => setDraft((d) => ({ ...d, supplier: v }))}
          placeholder="Any supplier"
        />
      ),
    },
    {
      id: "status",
      label: "Status",
      render: () => (
        <Combobox
          options={STATUS_OPTIONS}
          value={draft.status}
          onValueChange={(v) => setDraft((d) => ({ ...d, status: v }))}
          placeholder="Any status"
        />
      ),
    },
    {
      id: "date",
      label: "Ordered",
      render: () => (
        <DynamicDateRange
          value={draft.date}
          onValueChange={(v) => setDraft((d) => ({ ...d, date: v }))}
          now={AS_OF}
          placeholder="Any time"
        />
      ),
    },
    {
      id: "amount",
      label: "Amount at least",
      // Off the bar until someone asks for it via Adapt filters — a filter
      // nobody uses is a filter in everybody's way.
      hiddenByDefault: true,
      render: () => (
        <NumberField
          value={draft.minAmount ?? 0}
          onValueChange={(n) => setDraft((d) => ({ ...d, minAmount: n || undefined }))}
          min={0}
          step={1000}
        />
      ),
    },
  ];

  return (
    <div className="demo-page">
      <h1>Pattern · List Report</h1>
      <p className="lede">
        The screen a business app is mostly made of: filter a set, look at the
        result, act on a row. It is <code>FilterBar</code> +{" "}
        <code>DataTable</code> and nothing else — no new component, no
        list-report prop. Both <code>filter-bar.tsx</code> files have said since
        they were written that the gap analysis calls this screen unbuildable
        without them; this is the screen.
      </p>

      <section className="demo-section">
        <h2>1. The screen</h2>
        <CodeExample
          title="FilterBar over DataTable"
          description="Change a filter and press Go. Add 'Amount at least' from Adapt filters — it starts off the bar. The date filter is a DynamicDateRange, so the saved filter means a period rather than two frozen dates."
          code={`const [draft, setDraft] = useState(EMPTY);      // what the controls hold
const [applied, setApplied] = useState(EMPTY);  // what the table shows

const rows = useMemo(() => ORDERS.filter((o) => matches(o, applied)), [applied]);

<FilterBar
  fields={fields}
  onGo={() => setApplied(draft)}
  onClear={() => { setDraft(EMPTY); setApplied(EMPTY); }}
/>
<DataTable data={rows} columns={columns} enableSorting enablePagination />`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-3">
            <FilterBar
              fields={fields}
              variant={<Badge variant="soft">Standard view</Badge>}
              onGo={() => setApplied(draft)}
              onClear={() => {
                setDraft(EMPTY);
                setApplied(EMPTY);
              }}
            />
            <DataTable
              data={rows}
              columns={columns}
              getRowId={(o) => o.id}
              enableSorting
              enablePagination
              enableRowSelection
              enableExport
              exportFilename="orders"
              headerVariant="underline"
              pageSize={8}
              emptyMessage="No orders match these filters."
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Who owns what</h2>
        <CodeExample
          title="FilterBar owns nothing, and that is the point"
          description="It has no onChange, and onGo takes no arguments. It is a layout and a reveal mechanism — it never sees a filter value, so it can never disagree with you about one. You hold the state, you close over it in render(), and Go is just a cue to run the query with values you already have. That is why the draft/applied split lives here and not inside the component: the bar could not implement it without owning the values, and a bar that owned the values could not host an arbitrary control."
          code={`// FilterBar never sees these:
const [draft, setDraft] = useState(EMPTY);

const fields = [
  {
    id: "supplier",
    label: "Supplier",
    render: () => (
      <Combobox
        value={draft.supplier}
        onValueChange={(v) => setDraft((d) => ({ ...d, supplier: v }))}
      />
    ),
  },
];

<FilterBar fields={fields} onGo={() => setApplied(draft)} />
//                              ^ no arguments — you already have them`}
        >
          <div className="zen-flex zen-flex-col zen-gap-2 zen-text-xs">
            <div>
              draft → <code>{JSON.stringify(draft)}</code>
            </div>
            <div className="zen-text-zen-muted-fg">
              applied → <code>{JSON.stringify(applied)}</code>
            </div>
            <p className="zen-m-0 zen-text-zen-muted-fg">
              Edit a filter above without pressing Go: the two diverge, and the
              table keeps showing the old answer. That is deliberate — a filter
              that re-queries per keystroke is fine over 48 rows and hostile over
              48,000.
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. The date filter is a period, not two dates</h2>
        <CodeExample
          title="Why this composition wants DynamicDateRange"
          description="A saved List Report view is the whole reason FilterBar has a variant slot. Save two dates and the view means the same frozen fortnight forever; save a period and it still means the last three months next quarter. resolveDateRange turns the question into dates at query time — inside matches(), not inside the control."
          code={`// stored in the view:
{ operator: "LAST_MONTHS", count: 3 }

// resolved when the query runs, never before:
const { from, to } = resolveDateRange(filters.date, new Date());
if (from && orderDate < from) return false;
if (to && orderDate > to) return false;`}
        >
          <div className="zen-flex zen-flex-col zen-gap-1 zen-text-xs">
            <div>
              stored → <code>{JSON.stringify(applied.date) ?? "undefined"}</code>
            </div>
            <div className="zen-text-zen-muted-fg">
              resolved (as of {AS_OF.toLocaleDateString()}) →{" "}
              <code>
                {(() => {
                  const r = resolveDateRange(applied.date, AS_OF);
                  return r.from || r.to
                    ? `${r.from?.toLocaleDateString() ?? "—"} … ${r.to?.toLocaleDateString() ?? "—"}`
                    : "—";
                })()}
              </code>
            </div>
            <div className="zen-text-zen-muted-fg">
              matching {rows.length} of {ORDERS.length} orders
            </div>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewListReportDemo;

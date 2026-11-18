import { resolveDateRange, type DateRangeValue } from "@algorisys/zen-ui-core/date-range";
import { FilterBar, type FilterBarField } from "../components/filter-bar/filter-bar";
import { DataTable, type DataTableColumn } from "../components/data-table/data-table";
import { DynamicDateRange } from "../components/form/dynamic-date-range/dynamic-date-range";
import { Combobox } from "../components/combobox/combobox";
import { NumberField } from "../components/form/number-field/number-field";
import { Badge } from "../components/badge/badge";
import { DemoPage } from "./demo-helpers";

/* ------------------------------------------------------------------ fixture */
/* The same deterministic fixture the React and Solid pages read from their
 * components/patterns/list-report-data.ts. Vanilla has no patterns folder, so it
 * is carried here — kept identical so the three tables show the same rows. */

type OrderStatus = "open" | "confirmed" | "shipped" | "invoiced" | "blocked";

type Order = {
  id: string;
  supplier: string;
  city: string;
  status: OrderStatus;
  /** ISO yyyy-mm-dd. */
  date: string;
  amount: number;
};

const SUPPLIERS = [
  ["Talpa Industrial", "Pune"],
  ["Nordwind Components", "Hamburg"],
  ["Kestrel Metalworks", "Sheffield"],
  ["Alto Precision", "Turin"],
  ["Meridian Supply Co", "Chicago"],
  ["Sakura Fabrication", "Osaka"],
];

const STATUSES: OrderStatus[] = ["open", "confirmed", "shipped", "invoiced", "blocked"];

/** Dates spread backwards from a FIXED day, so the screenshots do not drift. */
const AS_OF = new Date(2026, 6, 15);

const day = (n: number) => {
  const d = new Date(AS_OF.getFullYear(), AS_OF.getMonth(), AS_OF.getDate() - n);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const ORDERS: Order[] = Array.from({ length: 48 }, (_, i) => {
  const [supplier, city] = SUPPLIERS[i % SUPPLIERS.length];
  return {
    id: `PO-${4200 + i}`,
    supplier,
    city,
    status: STATUSES[(i * 3) % STATUSES.length],
    date: day((i * 2) % 94),
    amount: 1200 + ((i * 977) % 48000),
  };
});

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  ...STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
];

const SUPPLIER_OPTIONS = [
  { value: "", label: "Any supplier" },
  ...SUPPLIERS.map(([s]) => ({ value: s, label: s })),
];

/** Badge colour per status. Blocked is the only one that should alarm anyone. */
const statusColor = (s: OrderStatus): "neutral" | "info" | "success" | "warning" | "error" =>
  s === "blocked" ? "error" : s === "invoiced" ? "success" : s === "shipped" ? "info" : s === "confirmed" ? "neutral" : "warning";

const money = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/* ------------------------------------------------------------------ filters */

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

const columns: DataTableColumn<Order>[] = [
  { accessorKey: "id", header: "Order" },
  { accessorKey: "supplier", header: "Supplier" },
  { accessorKey: "city", header: "City" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => Badge({ variant: "soft", color: statusColor(row.status), children: row.status }),
  },
  { accessorKey: "date", header: "Ordered" },
  {
    accessorKey: "amount",
    header: "Amount",
    // header is a string here; the right-alignment React gets from a header
    // render function is the column meta's headerClassName. NOTE: vanilla's
    // DataTable declares meta.headerClassName but does not apply it yet, so the
    // header currently stays start-aligned.
    meta: { headerClassName: "zen-text-right" },
    cell: ({ row }) => {
      const s = document.createElement("span");
      s.className = "zen-block zen-text-right zen-tabular-nums";
      s.textContent = money(row.amount);
      return s;
    },
  },
];

const codeEl = (text: string): HTMLElement => {
  const c = document.createElement("code");
  c.textContent = text;
  return c;
};

const line = (className: string, ...parts: (string | Node)[]): HTMLElement => {
  const d = document.createElement("div");
  if (className) d.className = className;
  d.append(...parts);
  return d;
};

const stringify = (v: unknown) => JSON.stringify(v) ?? "undefined";

export default function ListReportDemo(): HTMLElement {
  // Two states, not one. `draft` is what the controls hold; `applied` is what
  // the table is showing. Go copies one to the other. That split IS the List
  // Report contract — see section 2.
  let draft: Filters = { ...INITIAL };
  let applied: Filters = { ...INITIAL };
  const rows = () => ORDERS.filter((o) => matches(o, applied));

  /* The readouts sections 2 and 3 show. Built up front so every state change can
   * write to them; sections render once, in order. */
  const draftCode = codeEl("");
  const appliedCode = codeEl("");
  const storedCode = codeEl("");
  const resolvedCode = codeEl("");
  const countText = document.createElement("span");

  const paintReadouts = () => {
    draftCode.textContent = stringify(draft);
    appliedCode.textContent = stringify(applied);
    storedCode.textContent = stringify(applied.date);
    const r = resolveDateRange(applied.date, AS_OF);
    resolvedCode.textContent =
      r.from || r.to
        ? `${r.from?.toLocaleDateString() ?? "—"} … ${r.to?.toLocaleDateString() ?? "—"}`
        : "—";
    countText.textContent = `matching ${rows().length} of ${ORDERS.length} orders`;
  };

  const setDraft = (patch: Partial<Filters>) => {
    draft = { ...draft, ...patch };
    paintReadouts();
  };

  /* The controls. FilterBar calls each field's render() once and moves the node,
   * so they are built here and Clear writes back to them with update(). */
  const supplier = Combobox({
    options: SUPPLIER_OPTIONS,
    defaultValue: draft.supplier,
    onValueChange: (v) => setDraft({ supplier: v }),
    placeholder: "Any supplier",
  });
  const status = Combobox({
    options: STATUS_OPTIONS,
    defaultValue: draft.status,
    onValueChange: (v) => setDraft({ status: v }),
    placeholder: "Any status",
  });
  // update({ value: undefined }) cannot clear a DynamicDateRange — `undefined`
  // means "key omitted" to update() — so Clear swaps in a fresh, empty one.
  const makeDate = (value: DateRangeValue | undefined) =>
    DynamicDateRange({
      defaultValue: value,
      onValueChange: (v) => setDraft({ date: v }),
      now: AS_OF,
      placeholder: "Any time",
    });
  let date = makeDate(draft.date);
  const dateHost = document.createElement("div");
  dateHost.append(date.el);
  const amount = NumberField({
    defaultValue: draft.minAmount ?? 0,
    onValueChange: (n) => setDraft({ minAmount: n || undefined }),
    min: 0,
    step: 1000,
  });

  const fields: FilterBarField[] = [
    { id: "supplier", label: "Supplier", render: () => supplier },
    { id: "status", label: "Status", render: () => status },
    { id: "date", label: "Ordered", render: () => dateHost },
    {
      id: "amount",
      label: "Amount at least",
      // Off the bar until someone asks for it via Adapt filters — a filter
      // nobody uses is a filter in everybody's way.
      hiddenByDefault: true,
      render: () => amount,
    },
  ];

  const table = DataTable<Order>({
    data: rows(),
    columns,
    getRowId: (o) => o.id,
    enableSorting: true,
    enablePagination: true,
    enableRowSelection: true,
    enableExport: true,
    exportFilename: "orders",
    headerVariant: "underline",
    pageSize: 8,
    emptyMessage: "No orders match these filters.",
  });

  const apply = () => {
    applied = { ...draft };
    table.update({ data: rows() });
    paintReadouts();
  };

  const bar = FilterBar({
    fields,
    variant: Badge({ variant: "soft", children: "Standard view" }),
    onGo: apply,
    onClear: () => {
      draft = { ...EMPTY };
      supplier.update({ value: "" });
      status.update({ value: "" });
      date.destroy();
      date = makeDate(undefined);
      dateHost.replaceChildren(date.el);
      amount.update({ value: 0 });
      apply();
    },
  });

  paintReadouts();

  return DemoPage({
    title: "Pattern · List Report",
    description:
      "The screen a business app is mostly made of: filter a set, look at the result, act on a row. It is FilterBar + DataTable and nothing else — no new component, no list-report option. Both filter-bar files have said since they were written that the gap analysis calls this screen unbuildable without them; this is the screen.",
    sections: [
      {
        title: "1. The screen",
        codeTitle: "FilterBar over DataTable",
        codeDescription:
          "Change a filter and press Go. Add 'Amount at least' from Adapt filters — it starts off the bar. The date filter is a DynamicDateRange, so the saved filter means a period rather than two frozen dates.",
        code: `let draft = EMPTY;     // what the controls hold
let applied = EMPTY;   // what the table shows

const table = DataTable({
  data: ORDERS.filter((o) => matches(o, applied)),
  columns,
  enableSorting: true,
  enablePagination: true,
});

FilterBar({
  fields,
  onGo: () => {
    applied = draft;
    table.update({ data: ORDERS.filter((o) => matches(o, applied)) });
  },
  onClear: () => { draft = EMPTY; /* reset the controls */ applied = EMPTY; },
});`,
        render: () => line("zen-flex zen-w-full zen-flex-col zen-gap-3", bar.el, table.el),
      },
      {
        title: "2. Who owns what",
        codeTitle: "FilterBar owns nothing, and that is the point",
        codeDescription:
          "It has no onChange, and onGo takes no arguments. It is a layout and a reveal mechanism — it never sees a filter value, so it can never disagree with you about one. You hold the state, the controls write to it, and Go is just a cue to run the query with values you already have. That is why the draft/applied split lives here and not inside the component: the bar could not implement it without owning the values, and a bar that owned the values could not host an arbitrary control.",
        code: `// FilterBar never sees these:
let draft = EMPTY;

const fields = [
  {
    id: "supplier",
    label: "Supplier",
    render: () =>
      Combobox({
        value: draft.supplier,
        onValueChange: (v) => { draft = { ...draft, supplier: v }; },
      }),
  },
];

FilterBar({ fields, onGo: () => runQuery(draft) });
//                       ^ no arguments — you already have them`,
        render: () => {
          const p = document.createElement("p");
          p.className = "zen-m-0 zen-text-zen-muted-fg";
          p.textContent =
            "Edit a filter above without pressing Go: the two diverge, and the table keeps showing the old answer. That is deliberate — a filter that re-queries per keystroke is fine over 48 rows and hostile over 48,000.";
          return line(
            "zen-flex zen-flex-col zen-gap-2 zen-text-xs",
            line("", "draft → ", draftCode),
            line("zen-text-zen-muted-fg", "applied → ", appliedCode),
            p,
          );
        },
      },
      {
        title: "3. The date filter is a period, not two dates",
        codeTitle: "Why this composition wants DynamicDateRange",
        codeDescription:
          "A saved List Report view is the whole reason FilterBar has a variant slot. Save two dates and the view means the same frozen fortnight forever; save a period and it still means the last three months next quarter. resolveDateRange turns the question into dates at query time — inside matches(), not inside the control.",
        code: `// stored in the view:
{ operator: "LAST_MONTHS", count: 3 }

// resolved when the query runs, never before:
const { from, to } = resolveDateRange(filters.date, new Date());
if (from && orderDate < from) return false;
if (to && orderDate > to) return false;`,
        render: () =>
          line(
            "zen-flex zen-flex-col zen-gap-1 zen-text-xs",
            line("", "stored → ", storedCode),
            line("zen-text-zen-muted-fg", `resolved (as of ${AS_OF.toLocaleDateString()}) → `, resolvedCode),
            line("zen-text-zen-muted-fg", countText),
          ),
      },
    ],
  });
}

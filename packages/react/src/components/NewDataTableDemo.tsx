import { useMemo, useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table/data-table";
import type { ExportFormat, ExportRequest } from "@algorisys/zen-ui-core/export-request";
import { Badge } from "./badge/badge";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

/* -------------------------- sample data --------------------------- */
type Person = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Member" | "Guest";
  status: "active" | "invited" | "suspended";
  lastSeen: string;
  /* extra columns used by the pinning demo to push the row width past
   * the viewport so horizontal scrolling actually happens. */
  department: string;
  location: string;
  phone: string;
  manager: string;
  salary: number;
  joinedYear: number;
};

const DEPARTMENTS = ["Engineering", "Product", "Design", "Sales", "Support", "Ops"];
const LOCATIONS = ["Bengaluru", "Mumbai", "Pune", "Delhi", "Hyderabad", "Chennai"];
const MANAGERS = ["Frances Allen", "Adele Goldberg", "Radia Perlman", "Barbara Liskov"];

const NAMES = [
  "Ada Lovelace", "Alan Turing", "Grace Hopper", "Edsger Dijkstra", "Donald Knuth",
  "Margaret Hamilton", "Tim Berners-Lee", "Linus Torvalds", "Barbara Liskov",
  "Brian Kernighan", "Dennis Ritchie", "Ken Thompson", "Niklaus Wirth",
  "Hedy Lamarr", "Bjarne Stroustrup", "John McCarthy", "Vint Cerf",
  "Frances Allen", "Adele Goldberg", "Radia Perlman",
];
const ROLES: Person["role"][] = ["Admin", "Manager", "Member", "Guest"];
const STATUSES: Person["status"][] = ["active", "invited", "suspended"];

const makePeople = (count: number): Person[] =>
  Array.from({ length: count }, (_, i) => {
    const name = NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : "");
    return {
      id: `p-${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@algorisys.com`,
      role: ROLES[i % ROLES.length],
      status: STATUSES[i % STATUSES.length],
      lastSeen: new Date(Date.now() - i * 86_400_000).toLocaleDateString(),
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      location: LOCATIONS[i % LOCATIONS.length],
      phone: `+91 9${String(800000000 + i * 137).padStart(9, "0")}`,
      manager: MANAGERS[i % MANAGERS.length],
      salary: 60_000 + (i * 1234) % 240_000,
      joinedYear: 2018 + (i % 8),
    };
  });

const SMALL = makePeople(8);
const MEDIUM = makePeople(40);
const LARGE = makePeople(2000);

const statusBadgeColor = (s: Person["status"]) =>
  s === "active" ? "success" : s === "invited" ? "info" : "error";

/* -------------------------- columns -------------------------------- */
const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="soft" color={statusBadgeColor(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: "lastSeen", header: "Last seen" },
];

/* Filter-variant columns — show the per-column filter operators.
 * `meta.filterVariant` picks the input control AND wires the matching
 * filterFn automatically. `filterOptions` feeds the `select` variant. */
const variantColumns: ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { filterVariant: "text" },
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { filterVariant: "text" },
  },
  {
    accessorKey: "role",
    header: "Role",
    meta: {
      filterVariant: "select",
      filterOptions: ROLES.map((r) => ({ label: r, value: r })),
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="soft" color={statusBadgeColor(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
    meta: {
      filterVariant: "select",
      filterOptions: STATUSES.map((s) => ({ label: s, value: s })),
    },
  },
  {
    accessorKey: "salary",
    header: "Salary (₹)",
    cell: ({ row }) => row.original.salary.toLocaleString("en-IN"),
    meta: { filterVariant: "numberRange" },
  },
  {
    accessorKey: "joinedYear",
    header: "Joined",
    meta: { filterVariant: "number" },
  },
];

/* Grouped columns — Role is the group key, Salary aggregates as a sum
 * (Σ), Status as a count. Other columns are passthrough so when a group
 * is expanded the sub-rows look like a normal slice of the table. */
const groupedColumns: ColumnDef<Person>[] = [
  { accessorKey: "role", header: "Role" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "salary",
    header: "Salary (₹)",
    aggregationFn: "sum",
    cell: ({ row }) => row.original.salary.toLocaleString("en-IN"),
    aggregatedCell: ({ getValue }) => (
      <strong>Σ {(getValue() as number).toLocaleString("en-IN")}</strong>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="soft" color={statusBadgeColor(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
    aggregationFn: "count",
    aggregatedCell: ({ getValue }) =>
      `${getValue() as number} row${(getValue() as number) === 1 ? "" : "s"}`,
  },
];

/* Sized columns — every leaf has an explicit `size`, so the virtualized
 * grid (which uses px widths when given) emits a row wider than the
 * viewport. That horizontal overflow is what column pinning pins against.
 * Eleven columns at ~1900 px total > the demo viewport, so the middle
 * columns scroll while pinned name (left) + last seen (right) stay put. */
const sizedColumns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name", size: 180 },
  { accessorKey: "email", header: "Email", size: 240 },
  { accessorKey: "phone", header: "Phone", size: 160 },
  { accessorKey: "role", header: "Role", size: 110 },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => (
      <Badge variant="soft" color={statusBadgeColor(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: "department", header: "Department", size: 140 },
  { accessorKey: "location", header: "Location", size: 130 },
  { accessorKey: "manager", header: "Manager", size: 180 },
  {
    accessorKey: "salary",
    header: "Salary (₹)",
    size: 130,
    cell: ({ row }) => row.original.salary.toLocaleString("en-IN"),
  },
  { accessorKey: "joinedYear", header: "Joined", size: 100 },
  { accessorKey: "lastSeen", header: "Last seen", size: 140 },
];

/* An order's lines, for the cell-navigation grid (section 6c). */
type Line = { id: string; item: string; qty: number; rate: number; uom: string; note: string };
const UOMS = ["Nos", "Kg", "Box", "Litre"];
const makeLines = (count: number): Line[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `l-${i + 1}`,
    item: `ITEM-${String(1000 + i)}`,
    qty: 1 + (i % 12),
    rate: 50 + ((i * 37) % 950),
    uom: UOMS[i % UOMS.length],
    note: "",
  }));
const lineColumns: ColumnDef<Line>[] = [
  { accessorKey: "item", header: "Item", meta: { editable: true } },
  { accessorKey: "qty", header: "Qty", meta: { editable: true, editVariant: "number" } },
  {
    accessorKey: "uom",
    header: "UOM",
    meta: { editable: true, editVariant: "select", editOptions: UOMS.map((u) => ({ label: u, value: u })) },
  },
  { accessorKey: "rate", header: "Rate (₹)", meta: { editable: true, editVariant: "number" } },
  {
    id: "amount",
    header: "Amount (₹)",
    accessorFn: (l) => l.qty * l.rate,
    cell: (info) => (info.getValue() as number).toLocaleString("en-IN"),
  },
  { accessorKey: "note", header: "Note", meta: { editable: true } },
];

/* -------------------------- section 26: totals --------------------- */
type TotalLine = { item: string; customer: string; qty: number; rate: number; amount: number; due: string };
const TOTAL_CUSTOMERS = ["Acme Traders", "Bharat Steels", "Coastal Agencies"];
const TOTAL_ITEMS = ["Hex Bolt M8", "MS Sheet 2mm", "Cutting Oil", "Bearing 6204", "V-Belt B-48", "SS Rod 12mm"];
// Rates in paise-precise rupees: summing them as doubles drifts; the totals here do not.
const LINES: TotalLine[] = Array.from({ length: 60 }, (_, i) => {
  const qty = 1 + ((i * 7) % 23);
  const rate = Math.round((10.1 + ((i * 37) % 900) * 1.37) * 100) / 100;
  return {
    item: TOTAL_ITEMS[i % TOTAL_ITEMS.length],
    customer: TOTAL_CUSTOMERS[(i * 5) % 3],
    qty,
    rate,
    amount: Math.round(qty * rate * 100) / 100,
    due: `2026-${String(10 + (i % 3)).padStart(2, "0")}-${String(1 + ((i * 3) % 28)).padStart(2, "0")}`,
  };
});
const inrTotal = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const totalColumns: ColumnDef<TotalLine>[] = [
  { accessorKey: "item", header: "Item" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "qty", header: "Qty", meta: { aggregate: "sum" }, cell: (c) => <span className="zen-block zen-text-end zen-tabular-nums">{c.getValue<number>()}</span> },
  { accessorKey: "rate", header: "Rate", meta: { aggregate: "avg" }, cell: (c) => <span className="zen-block zen-text-end zen-tabular-nums">{inrTotal.format(c.getValue<number>())}</span> },
  { accessorKey: "amount", header: "Amount", meta: { aggregate: "sum", formatTotal: (v) => `₹${inrTotal.format(v as number)}` }, cell: (c) => <span className="zen-block zen-text-end zen-tabular-nums">{inrTotal.format(c.getValue<number>())}</span> },
  { accessorKey: "due", header: "Latest due", meta: { aggregate: "max" } },
];

/* -------------------------- section 27: export on the server ------- */
// A stand-in for your server: 100,000 ledger lines that never come to the browser.
// The table asks it for one page at a time; Export hands it an ExportRequest.
type Entry = { id: string; date: string; account: string; party: string; amount: number };
const LEDGER_SIZE = 100_000;
const ACCOUNTS = ["Sales", "Purchases", "Bank", "Cash", "Debtors", "Creditors"];
const PARTIES = ["Acme Traders", "Bharat Steels", "Coastal Agencies", "Deccan Engineering", "Eastern Mills"];
const entryAt = (i: number): Entry => ({
  id: `GL-${String(i + 1).padStart(6, "0")}`,
  date: `2026-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + ((i * 7) % 28)).padStart(2, "0")}`,
  account: ACCOUNTS[(i * 13) % ACCOUNTS.length],
  party: PARTIES[(i * 7) % PARTIES.length],
  amount: Math.round(((i * 7919) % 2_500_000) + 99) / 100,
});
const mockServer = {
  /** The rows matching a search, column filters and sort: what a SQL query would select. */
  match(search: string, filters: { id: string; value: unknown }[], sort: { id: string; desc: boolean }[]) {
    const s = search.trim().toLowerCase();
    const textOf = (v: unknown) => (v && typeof v === "object" && "value" in (v as object) ? String((v as { value: unknown }).value ?? "") : String(v ?? "")).toLowerCase();
    const idx: number[] = [];
    for (let i = 0; i < LEDGER_SIZE; i++) {
      const e = entryAt(i);
      if (s && !`${e.id} ${e.account} ${e.party}`.toLowerCase().includes(s)) continue;
      if (filters.some((f) => !String(e[f.id as keyof Entry]).toLowerCase().includes(textOf(f.value)))) continue;
      idx.push(i);
    }
    const [first] = sort;
    if (first) {
      const k = first.id as keyof Entry;
      idx.sort((a, b) => { const x = entryAt(a)[k], y = entryAt(b)[k]; return (x < y ? -1 : x > y ? 1 : 0) * (first.desc ? -1 : 1); });
    }
    return idx;
  },
};
const entryColumns: ColumnDef<Entry>[] = [
  { accessorKey: "id", header: "Entry" },
  { accessorKey: "date", header: "Date", meta: { exportFormat: { kind: "date" } } },
  { accessorKey: "account", header: "Account" },
  { accessorKey: "party", header: "Party" },
  {
    accessorKey: "amount",
    header: "Amount",
    meta: { exportFormat: { kind: "amount", currency: "INR", precision: 2 } },
    cell: (c) => <span className="zen-block zen-text-end zen-tabular-nums">{inrTotal.format(c.getValue<number>())}</span>,
  },
];

/** Section 27's table, wired to the mock server. */
const ServerLedger: React.FC = () => {
  const pageSize = 25;
  const [page, setPage] = useState(0);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [filters, setFilters] = useState<{ id: string; value: unknown }[]>([]);
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const [lastRequest, setLastRequest] = useState("");
  const [serverSaid, setServerSaid] = useState("");
  const failNext = useRef(false);
  const [failChecked, setFailChecked] = useState(false);
  const matching = useMemo(() => mockServer.match(search, filters, sorting), [search, filters, sorting]);
  const pageRows = useMemo(() => matching.slice(page * pageSize, (page + 1) * pageSize).map(entryAt), [matching, page]);
  const fmt = new Intl.NumberFormat("en-IN");
  /** The mock server's export endpoint. */
  const serve = async (format: ExportFormat, request: ExportRequest): Promise<Blob | void> => {
    setLastRequest(JSON.stringify(request, null, 2));
    await new Promise((r) => setTimeout(r, 700)); // the server at work
    if (failNext.current) {
      failNext.current = false;
      setFailChecked(false);
      throw new Error("the server is busy, try again");
    }
    const rows = request.scope.kind === "selected" ? request.scope.ids.length : mockServer.match(request.filters.search ?? "", request.filters.columns, request.sort).length;
    if (format !== "csv") {
      setServerSaid(`Your server would now build ledger.${format} from this request: ${fmt.format(rows)} rows. (This demo has no ${format} writer; CSV below is real.)`);
      return;
    }
    // CSV: built from ALL the matching rows, not the page.
    const ids = request.scope.kind === "selected" ? request.scope.ids : mockServer.match(request.filters.search ?? "", request.filters.columns, request.sort).map((i) => entryAt(i).id);
    const byId = (id: string) => entryAt(Number(id.slice(3)) - 1);
    const cols = request.columns;
    const lines = [cols.map((c) => c.header).join(","), ...ids.map((id) => cols.map((c) => String(byId(id)[c.id as keyof Entry])).join(","))];
    setServerSaid(`The server built ledger.csv: ${fmt.format(ids.length)} rows.`);
    return new Blob([lines.join("\n")], { type: "text/csv" });
  };
  return (
    <div className="zen-flex zen-w-full zen-flex-col zen-gap-3">
      <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg" data-testid="ledger-counts">
        The server holds <strong>{fmt.format(LEDGER_SIZE)}</strong> entries; {fmt.format(matching.length)} match; the browser has <strong>{pageRows.length}</strong>.
      </p>
      <DataTable
        data={pageRows}
        columns={entryColumns}
        getRowId={(e) => e.id}
        enableSorting
        manualSorting
        sorting={sorting}
        onSortingChange={(s) => { setSorting(s); setPage(0); }}
        enableColumnFilters
        enablePerColumnFilters
        manualFiltering
        columnFilters={filters}
        onColumnFiltersChange={(f) => { setFilters(f); setPage(0); }}
        globalFilter={search}
        onGlobalFilterChange={(v) => { setSearch(v); setPage(0); }}
        enableRowSelection
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        enablePagination
        pageSize={pageSize}
        manualPagination={{ pageIndex: page, pageCount: Math.max(1, Math.ceil(matching.length / pageSize)), pageSize, onPageChange: setPage }}
        exportFilename="ledger"
        exportTitle="General ledger"
        exportContext={LEDGER_CONTEXT}
        onExport={serve}
      />
      <label className="zen-flex zen-items-center zen-gap-2 zen-text-sm">
        <input
          type="checkbox"
          checked={failChecked}
          onChange={(e) => { failNext.current = e.currentTarget.checked; setFailChecked(e.currentTarget.checked); }}
        />{" "}
        Make the next export fail (to see the error)
      </label>
      {serverSaid ? (
        <p className="zen-m-0 zen-rounded-zen-md zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-sm" data-testid="server-said">{serverSaid}</p>
      ) : null}
      {lastRequest ? (
        <details open>
          <summary className="zen-cursor-pointer zen-text-sm zen-text-zen-muted-fg">What your server received</summary>
          <pre className="zen-m-0 zen-mt-2 zen-max-h-72 zen-overflow-auto zen-rounded-zen-md zen-bg-zen-muted zen-p-3 zen-text-xs" data-testid="export-request">{lastRequest}</pre>
        </details>
      ) : null}
    </div>
  );
};
const LEDGER_CONTEXT = { ledger: "FY 2026-27" };

/* -------------------------- demo ----------------------------------- */
const NewDataTableDemo: React.FC = () => {
  const [serverPage, setServerPage] = useState(0);
  const serverPageSize = 10;
  const serverPageCount = Math.ceil(LARGE.length / serverPageSize);
  const serverSlice = useMemo(
    () => LARGE.slice(serverPage * serverPageSize, (serverPage + 1) * serverPageSize),
    [serverPage],
  );

  // Section 9 — row reorder. We own the data array; on drag-end we
  // re-arrange it. Stable IDs are critical: without `getRowId` TanStack
  // would key by row.index (which changes after a reorder) and the
  // orderedIds → Person.id lookup below would silently come back empty.
  const [orderable, setOrderable] = useState<Person[]>(() => makePeople(6));
  const handleRowOrderChange = (orderedIds: string[]) => {
    setOrderable((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      return orderedIds.map((id) => byId.get(id)).filter(Boolean) as Person[];
    });
  };

  const [activated, setActivated] = useState("");
  const [lines, setLines] = useState(() => makeLines(2000));
  const [lastEdit, setLastEdit] = useState("");
  const applyLineEdits = (edits: { rowId: string; columnId: string; value: unknown }[]) => {
    const byRow = new Map<string, Record<string, unknown>>();
    for (const e of edits) byRow.set(e.rowId, { ...byRow.get(e.rowId), [e.columnId]: e.value });
    setLines((prev) => prev.map((l) => (byRow.has(l.id) ? { ...l, ...byRow.get(l.id) } : l)));
    setLastEdit(`${edits.length} cell${edits.length === 1 ? "" : "s"} changed`);
  };

  return (
    <div className="demo-page">
      <h1>DataTable (new — TanStack Table + Virtual)</h1>
      <p className="lede">
        Headless data layer (<code>@tanstack/react-table</code>) +
        windowing (<code>@tanstack/react-virtual</code>), wrapped in
        the styled <code>Table</code> markup and the rest of the new
        primitives. Every capability is opt-in via a flag.
      </p>

      <section className="demo-section">
        <h2>0. headerVariant — brand intensity of the column header</h2>
        <CodeExample
          title='headerVariant: "plain" (default) | "underline" | "branded"'
          description="Pick how much brand color shows up in the header. Plain keeps neutral chrome (recommended for tables that share the screen with other content). Underline adds a 2-px primary rule under the header row. Branded fills the band with primary-soft + dark-primary label text — best for tables that anchor a page."
          code={`<DataTable data={people} columns={columns} />                              // plain
<DataTable data={people} columns={columns} headerVariant="underline" />
<DataTable data={people} columns={columns} headerVariant="branded" />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
                plain (default)
              </h4>
              <DataTable data={SMALL} columns={columns} />
            </div>
            <div>
              <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
                underline
              </h4>
              <DataTable data={SMALL} columns={columns} headerVariant="underline" />
            </div>
            <div>
              <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
                branded
              </h4>
              <DataTable data={SMALL} columns={columns} headerVariant="branded" />
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>1. Minimal — no toggles</h2>
        <CodeExample
          title="Just data + columns"
          code={`<DataTable data={people} columns={columns} />`}
        >
          <DataTable data={SMALL} columns={columns} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Sorting (per-column toggle in the header)</h2>
        <CodeExample
          title="enableSorting"
          description="Click a column header to cycle asc → desc → unsorted."
          code={`<DataTable data={people} columns={columns} enableSorting />`}
        >
          <DataTable data={SMALL} columns={columns} enableSorting />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Pagination (client-side)</h2>
        <CodeExample
          title="enablePagination with page-size selector"
          code={`<DataTable data={medium} columns={columns} enablePagination pageSize={10} />`}
        >
          <DataTable
            data={MEDIUM}
            columns={columns}
            enablePagination
            pageSize={10}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Global filter + column visibility</h2>
        <CodeExample
          title="enableColumnFilters (global) + enableColumnVisibility"
          description="The toolbar shows a search input and a Columns dropdown."
          code={`<DataTable
  data={medium}
  columns={columns}
  enableColumnFilters
  enableColumnVisibility
  enablePagination
  globalFilterPlaceholder="Search people…"
/>`}
        >
          <DataTable
            data={MEDIUM}
            columns={columns}
            enableColumnFilters
            enableColumnVisibility
            enablePagination
            globalFilterPlaceholder="Search people…"
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Row selection</h2>
        <CodeExample
          title="enableRowSelection prepends a select column"
          description="Header checkbox supports tri-state (none / some / all)."
          code={`<DataTable data={small} columns={columns} enableRowSelection enablePagination />`}
        >
          <DataTable
            data={SMALL}
            columns={columns}
            enableRowSelection
            enablePagination
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5b. Keyboard rows</h2>
        <CodeExample
          title="enableKeyboardNavigation + onRowActivate"
          description="Tab into the table once, then ↑/↓, Home/End and PageUp/PageDown move between rows. Enter opens the row (Ctrl+Enter reports the modifier); Space selects it and Ctrl+A selects the page."
          code={`<DataTable
  data={small}
  columns={columns}
  enableRowSelection
  enableKeyboardNavigation
  onRowActivate={(row, e) => open(row.original, { newTab: e.ctrlKey || e.metaKey })}
  rowLabel={(row) => row.original.name}
/>`}
        >
          <DataTable
            data={SMALL}
            columns={columns}
            enableRowSelection
            enableKeyboardNavigation
            onRowActivate={(row, e) => setActivated(`${row.original.name}${e.ctrlKey || e.metaKey ? " (Ctrl+Enter)" : ""}`)}
            rowLabel={(row) => row.original.name}
          />
          <p className="zen-text-sm zen-text-zen-muted-fg zen-mt-2" aria-live="polite">
            Opened: <span data-testid="kb-activated">{activated || "nothing yet"}</span>
          </p>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Virtualized — 2 000 rows, no pagination</h2>
        <CodeExample
          title="enableVirtualization renders only the visible window"
          description="Scroll the table body. Sticky header stays in view."
          code={`<DataTable
  data={largeDataset}
  columns={columns}
  enableSorting
  enableVirtualization
  maxBodyHeight={400}
/>`}
        >
          <DataTable
            data={LARGE}
            columns={columns}
            enableSorting
            enableVirtualization
            maxBodyHeight={400}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6c. Cell navigation — work in it like a spreadsheet</h2>
        <CodeExample
          title="enableCellNavigation: cell by cell, ranges, copy and paste"
          description="Click a cell, then move with the arrows, PageUp/PageDown, Home/End and Ctrl+Home/End. Enter or F2 edits, or just type; Enter in the editor moves down, Tab across, Esc goes back. Shift+arrows, Shift+click or a drag selects a range. Copy it into a spreadsheet, or paste a block from one; Delete clears. A cell takes only what its editor could produce: Amount is computed, so paste and Delete leave it alone, and UOM is a select with no empty option, so Delete leaves it as it is and a paste must match one of its options."
          code={`<DataTable
  data={lines}
  columns={columns} // meta: { editable: true, editVariant: "number" | "select" }
  getRowId={(l) => l.id}
  enableCellNavigation
  enableRowVirtualization
  onCellEdit={(edit) => apply([edit])}
  onCellsEdit={(edits) => apply(edits)} // a paste, or Delete over a range
  fillHeight
/>`}
        >
          <div className="zen-flex zen-h-[420px] zen-flex-col">
            <DataTable
              data={lines}
              columns={lineColumns}
              getRowId={(l) => l.id}
              enableCellNavigation
              onCellEdit={(edit) => applyLineEdits([edit])}
              onCellsEdit={applyLineEdits}
              fillHeight
            />
          </div>
          <p className="zen-text-sm zen-text-zen-muted-fg zen-mt-2" aria-live="polite">
            <span data-testid="cells-edited">{lastEdit || "No changes yet."}</span>
          </p>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. Server-driven pagination (manual)</h2>
        <CodeExample
          title="manualPagination overrides client-side paging"
          description={`Pass { pageIndex, pageCount, onPageChange }. The DataTable shows the slice you give it; it does not slice further. Use this when fetching from an API.`}
          code={`const [page, setPage] = useState(0);
const slice = await fetch(\`/api/people?page=\${page}\`);

<DataTable
  data={slice}
  columns={columns}
  manualPagination={{
    pageIndex: page,
    pageCount: serverPageCount,
    pageSize: 10,
    onPageChange: setPage,
  }}
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <DataTable
              data={serverSlice}
              columns={columns}
              manualPagination={{
                pageIndex: serverPage,
                pageCount: serverPageCount,
                pageSize: serverPageSize,
                onPageChange: setServerPage,
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <Button size="sm" variant="outline" onClick={() => setServerPage(0)}>
                Reset to page 1
              </Button>
              <span style={{ alignSelf: "center", fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
                page {serverPage + 1} / {serverPageCount} (simulated server)
              </span>
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>8. Column separators (Zen theme opt-in)</h2>
        <CodeExample
          title="enableColumnSeparators draws 1-px vertical dividers"
          description="Per Zen theme table spec — opt-in. Renders border-r on every cell except the last."
          code={`<DataTable
  data={people}
  columns={columns}
  enableColumnSeparators
/>`}
        >
          <DataTable
            data={SMALL}
            columns={columns}
            enableColumnSeparators
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>9. Row reorder (drag handle)</h2>
        <CodeExample
          title="enableRowOrdering + onRowOrderChange"
          description="Grip-handle column appears as the leading column. Drag a row up or down — the callback fires with the new ID order; caller re-arranges the source data. Not compatible with enableVirtualization (mutually exclusive)."
          code={`const [data, setData] = useState(initial);

const handleOrderChange = (orderedIds: string[]) => {
  const byId = new Map(data.map((d) => [d.id, d]));
  setData(orderedIds.map((id) => byId.get(id)!));
};

<DataTable
  data={data}
  columns={columns}
  getRowId={(row) => row.id}   // stable identity across reorders
  enableRowOrdering
  onRowOrderChange={handleOrderChange}
/>`}
        >
          <DataTable
            data={orderable}
            columns={columns}
            getRowId={(row) => row.id}
            enableRowOrdering
            onRowOrderChange={handleRowOrderChange}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>10. Multi-sort (Shift-click a second header)</h2>
        <CodeExample
          title="enableSorting + enableMultiSort"
          description="Click one header to sort, then Shift-click another to add it as a secondary sort. A small priority badge (1, 2, …) appears next to the header label."
          code={`<DataTable
  data={medium}
  columns={columns}
  enableSorting
  enableMultiSort
  enablePagination
/>`}
        >
          <DataTable
            data={MEDIUM}
            columns={columns}
            enableSorting
            enableMultiSort
            enablePagination
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>11. Column resizing (drag the right edge)</h2>
        <CodeExample
          title="enableColumnResizing"
          description="A 4-px resize handle appears on the right edge of every header. Drag to resize; double-click handle to reset (TanStack default). Resize mode is `onChange` so the body updates while dragging."
          code={`<DataTable
  data={small}
  columns={columns}
  enableColumnResizing
/>`}
        >
          <DataTable
            data={SMALL}
            columns={columns}
            enableColumnResizing
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>12. Column ordering (drag headers)</h2>
        <CodeExample
          title="enableColumnOrdering + optional onColumnOrderChange"
          description="Drag a header sideways to reorder. The callback fires with the new column-id order — persist it to localStorage if you want it to stick across reloads."
          code={`<DataTable
  data={small}
  columns={columns}
  enableColumnOrdering
  onColumnOrderChange={(order) => localStorage.setItem("cols", JSON.stringify(order))}
/>`}
        >
          <DataTable
            data={SMALL}
            columns={columns}
            enableColumnOrdering
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>13. Per-column filters</h2>
        <CodeExample
          title="enablePerColumnFilters"
          description="A second header row renders an Input under every filterable column. Caller can combine with the global filter (`enableColumnFilters`) — both feed TanStack's filter model."
          code={`<DataTable
  data={medium}
  columns={columns}
  enablePerColumnFilters
  enablePagination
/>`}
        >
          <DataTable
            data={MEDIUM}
            columns={columns}
            enablePerColumnFilters
            enablePagination
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>14. CSV / JSON export</h2>
        <CodeExample
          title="enableExport (+ exportFilename, exportOnlySelected)"
          description="Adds an Export menu to the toolbar with CSV and JSON items. Exports the currently filtered rows; set `exportOnlySelected` to limit to checked rows. The `__select` / `__drag` utility columns are excluded automatically."
          code={`<DataTable
  data={medium}
  columns={columns}
  enableRowSelection
  enableColumnFilters
  enablePagination
  enableExport
  exportFilename="people"
/>`}
        >
          <DataTable
            data={MEDIUM}
            columns={columns}
            enableRowSelection
            enableColumnFilters
            enablePagination
            enableExport
            exportFilename="people"
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>15. Sticky header</h2>
        <CodeExample
          title="stickyHeader pins the <thead> while the body scrolls"
          description="Body is constrained to maxBodyHeight (default 480 px) so the sticky header has a real scroll context. In virtualized mode the header is already sticky and the prop is a no-op."
          code={`<DataTable
  data={medium}
  columns={columns}
  enableSorting
  stickyHeader
  maxBodyHeight={280}
/>`}
        >
          <DataTable
            data={MEDIUM}
            columns={columns}
            enableSorting
            stickyHeader
            maxBodyHeight={280}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>16. Column pinning</h2>
        <CodeExample
          title="Freeze columns to the left or right edge"
          description={`enableColumnPinning + initialColumnPinning={{ left, right }}. Pinned cells get a 1-px divider + soft shadow on their inner edge. The 11 columns here total ~1900 px so scrolling sideways slides the middle columns past the pinned Name (left) and Last seen (right). Combine with stickyHeader for a 2-D freeze.`}
          code={`<DataTable
  data={medium}
  columns={sizedColumns}     // 11 columns, all with explicit \`size\`
  enableColumnPinning
  initialColumnPinning={{ left: ["name"], right: ["lastSeen"] }}
  enableSorting
  enableColumnResizing
  stickyHeader
  maxBodyHeight={320}
/>`}
        >
          <DataTable
            data={MEDIUM}
            columns={sizedColumns}
            enableColumnPinning
            initialColumnPinning={{ left: ["name"], right: ["lastSeen"] }}
            enableSorting
            enableColumnResizing
            stickyHeader
            maxBodyHeight={320}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>17. Virtualization + pinning + resize + reorder + filters</h2>
        <CodeExample
          title="The virtualized grid now wires column resize, reorder, and per-column filters"
          description={`Drag any header sideways to reorder; drag the right edge to resize (and the body re-flows because the grid template reads the live columnSizing state). Per-column filters render as a second sticky row under the header — pinned columns keep their offsets so the inputs travel with the column on horizontal scroll. All on 2 000 virtualized rows.`}
          code={`<DataTable
  data={large}
  columns={sizedColumns}      // each column has \`size: <px>\`
  enableVirtualization
  enableColumnPinning
  initialColumnPinning={{ left: ["name"], right: ["lastSeen"] }}
  enableColumnResizing
  enableColumnOrdering
  enablePerColumnFilters
  enableSorting
  maxBodyHeight={360}
/>`}
        >
          <DataTable
            data={LARGE}
            columns={sizedColumns}
            enableVirtualization
            enableColumnPinning
            initialColumnPinning={{ left: ["name"], right: ["lastSeen"] }}
            enableColumnResizing
            enableColumnOrdering
            enablePerColumnFilters
            enableSorting
            maxBodyHeight={360}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>18. Per-column filter operators</h2>
        <CodeExample
          title="meta.filterVariant picks the input control + filterFn"
          description={`Each column declares meta.filterVariant: "text" | "number" | "numberRange" | "select" | "boolean". The matching control renders in the filter row and the matching filterFn is wired in automatically. Text and number variants get a tiny op-select (=, ≠, >, <, ≥, ≤, contains, starts with, ends with).`}
          code={`const columns = [
  { accessorKey: "name",   header: "Name",
    meta: { filterVariant: "text" } },
  { accessorKey: "role",   header: "Role",
    meta: { filterVariant: "select",
            filterOptions: [{ label: "Admin", value: "Admin" }, …] } },
  { accessorKey: "salary", header: "Salary",
    meta: { filterVariant: "numberRange" } },
  { accessorKey: "joinedYear", header: "Joined",
    meta: { filterVariant: "number" } },
];

<DataTable
  data={medium}
  columns={columns}
  enableSorting
  enableColumnFilters
  enablePerColumnFilters
/>`}
        >
          <DataTable
            data={MEDIUM}
            columns={variantColumns}
            enableSorting
            enableColumnFilters
            enablePerColumnFilters
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>19. Inline cell editing</h2>
        <CodeExample
          title="meta.editable opts a column in; onCellEdit gets the commit"
          description={`Double-click (or focus + Enter / Space) any editable cell. Text columns get an <Input>, number columns get <NumberField> (with ± steppers), select columns open the Select primitive. Enter or blur commits, Esc cancels. The caller owns the data array — onCellEdit returns the new value and you decide how to apply it.`}
          code={`const [rows, setRows] = useState(makePeople(8));

const columns = [
  { accessorKey: "name",   header: "Name",   meta: { editable: true } },
  { accessorKey: "email",  header: "Email",  meta: { editable: true } },
  { accessorKey: "role",   header: "Role",
    meta: { editable: true, editVariant: "select",
            editOptions: ROLES.map(r => ({ label: r, value: r })) } },
  { accessorKey: "salary", header: "Salary",
    meta: { editable: true, editVariant: "number" } },
];

<DataTable
  data={rows}
  columns={columns}
  onCellEdit={({ rowId, columnId, value }) =>
    setRows(prev => prev.map(r =>
      r.id === rowId ? { ...r, [columnId]: value } : r))}
/>`}
        >
          <InlineEditDemo />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>20. Bulk actions + select-all-across-pages</h2>
        <CodeExample
          title="renderBulkActions shows when ≥ 1 row is selected"
          description={`Caller supplies the action buttons; DataTable supplies the selected count, the dismiss ✕, and the "Select all N matching" link that appears when only the current page is fully checked but more rows match the filter.`}
          code={`<DataTable
  data={medium}
  columns={columns}
  enableRowSelection
  enablePagination
  enableColumnFilters
  renderBulkActions={({ rows, clear }) => (
    <>
      <Button size="sm" onClick={() => alert(\`Delete \${rows.length}\`)}>
        Delete
      </Button>
      <Button size="sm" variant="outline" onClick={clear}>
        Cancel
      </Button>
    </>
  )}
/>`}
        >
          <DataTable
            data={MEDIUM}
            columns={columns}
            enableRowSelection
            enablePagination
            enableColumnFilters
            renderBulkActions={({ rows, clear }) => (
              <>
                <Button
                  size="sm"
                  color="error"
                  onClick={() => {
                    alert(`Pretend-deleting ${rows.length} row(s)`);
                    clear();
                  }}
                >
                  Delete
                </Button>
                <Button size="sm" variant="outline" color="neutral" onClick={clear}>
                  Cancel
                </Button>
              </>
            )}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>21. Expandable rows</h2>
        <CodeExample
          title="renderSubRow renders a full-width detail panel under each expanded row"
          description={`Prepends a chevron toggle column. Click it (or press Enter/Space when focused) to reveal the sub-row. Caller controls the panel content; DataTable just owns the toggle + the slot. Not wired into virtualized mode in this release.`}
          code={`<DataTable
  data={small}
  columns={columns}
  renderSubRow={(row) => (
    <div className="px-6 py-3 text-sm">
      <strong>Email:</strong> {row.original.email}<br />
      <strong>Department:</strong> {row.original.department}<br />
      <strong>Manager:</strong> {row.original.manager}
    </div>
  )}
/>`}
        >
          <DataTable
            data={SMALL}
            columns={columns}
            renderSubRow={(row) => (
              <div
                style={{
                  padding: "0.625rem 1rem",
                  fontSize: "0.8125rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.375rem 1rem",
                  color: "var(--zen-color-foreground)",
                }}
              >
                <div>
                  <strong>Department:</strong> {row.original.department}
                </div>
                <div>
                  <strong>Location:</strong> {row.original.location}
                </div>
                <div>
                  <strong>Manager:</strong> {row.original.manager}
                </div>
                <div>
                  <strong>Phone:</strong> {row.original.phone}
                </div>
                <div>
                  <strong>Salary:</strong> ₹{row.original.salary.toLocaleString("en-IN")}
                </div>
                <div>
                  <strong>Joined:</strong> {row.original.joinedYear}
                </div>
              </div>
            )}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>22. rowClassName — per-row styling</h2>
        <CodeExample
          title="Tint rows based on data — e.g. suspended users get a red wash"
          description={`The hook is called once per rendered body row. The returned string is merged after the built-in classes, so it composes with hover / selected styling instead of replacing it.`}
          code={`<DataTable
  data={small}
  columns={columns}
  rowClassName={(row) =>
    row.original.status === "suspended" ? "bg-zen-error-soft/40"
    : row.original.status === "invited" ? "bg-zen-info-soft/30"
    : undefined
  }
/>`}
        >
          <DataTable
            data={SMALL}
            columns={columns}
            rowClassName={(row) =>
              row.original.status === "suspended"
                ? "bg-zen-error-soft/40"
                : row.original.status === "invited"
                ? "bg-zen-info-soft/30"
                : undefined
            }
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>23. Row grouping</h2>
        <CodeExample
          title="enableGrouping + initialGrouping — group by one or more columns"
          description={`Rows that share the grouped column's value are nested under a "▶ value (N)" header row; clicking it expands/collapses. Other columns can declare an aggregationFn ("sum" / "mean" / "count" / etc.) and an aggregatedCell render fn — those values appear in the header row. The toolbar "Group by" menu adds / removes columns; multi-grouping is supported.`}
          code={`const cols = [
  { accessorKey: "role",   header: "Role" },
  { accessorKey: "name",   header: "Name" },
  { accessorKey: "salary", header: "Salary (₹)",
    aggregationFn: "sum",
    cell: (info) => info.getValue<number>().toLocaleString("en-IN"),
    aggregatedCell: (info) => (
      <strong>Σ {info.getValue<number>().toLocaleString("en-IN")}</strong>
    ) },
  { accessorKey: "status", header: "Status",
    aggregationFn: "count",
    aggregatedCell: (info) => \`\${info.getValue()} rows\` },
];

<DataTable
  data={medium}
  columns={cols}
  enableGrouping
  enableColumnVisibility   // shows the Group-by trigger in the toolbar
  initialGrouping={["role"]}
/>`}
        >
          <DataTable
            data={MEDIUM}
            columns={groupedColumns}
            enableGrouping
            enableColumnVisibility
            initialGrouping={["role"]}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>24. Column footers</h2>
        <CodeExample
          title="`footer` on a ColumnDef"
          description="Declaring footer on any column gives the table a <tfoot>. Columns without one render an empty cell, so the row stays aligned. This is where a column total goes — the thing every financial table needs and TanStack has always carried."
          code={`const columns = [
  { accessorKey: "name", header: "Name", footer: "TOTALS" },
  {
    accessorKey: "salary",
    header: "Salary",
    cell: (i) => money(i.getValue()),
    footer: ({ table }) =>
      money(
        table
          .getFilteredRowModel()
          .rows.reduce((sum, r) => sum + r.original.salary, 0),
      ),
  },
]`}
        >
          <DataTable
            data={SMALL}
            columns={[
              { accessorKey: "name", header: "Name", footer: () => "TOTALS" },
              { accessorKey: "role", header: "Role" },
              {
                accessorKey: "salary",
                header: "Salary",
                cell: (info) => `$${(info.getValue() as number).toLocaleString()}`,
                footer: ({ table }) =>
                  `$${table
                    .getFilteredRowModel()
                    .rows.reduce((sum, r) => sum + r.original.salary, 0)
                    .toLocaleString()}`,
              },
            ]}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>25. Everything together</h2>
        <CodeExample
          title="All toggles on, virtualization off (uses pagination instead)"
          code={`<DataTable
  data={medium}
  columns={columns}
  enableSorting
  enableMultiSort
  enablePagination
  enableColumnFilters
  enablePerColumnFilters
  enableRowSelection
  enableColumnVisibility
  enableColumnOrdering
  enableColumnResizing
  enableExport
/>`}
        >
          <DataTable
            data={MEDIUM}
            columns={columns}
            enableSorting
            enableMultiSort
            enablePagination
            enableColumnFilters
            enablePerColumnFilters
            enableRowSelection
            enableColumnVisibility
            enableColumnOrdering
            enableColumnResizing
            enableExport
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>26. Totals</h2>
        <CodeExample
          title="meta.aggregate: a total that computes itself, exact in decimal"
          description="Sum, count, avg, min, max or your own function, per column. The footer totals every row the filters let through (across pages; totalsOver=&quot;page&quot; for this page only), stays in view as the rows scroll, and a grouped table shows each group's subtotal from the same declaration. Filter the Customer column and watch the totals follow."
          code={`const columns: ColumnDef<Line>[] = [
  { accessorKey: "item", header: "Item" },                       // "Total" goes here
  { accessorKey: "qty", header: "Qty", meta: { aggregate: "sum" } },
  { accessorKey: "rate", header: "Rate", meta: { aggregate: "avg" } },
  { accessorKey: "amount", header: "Amount",
    meta: { aggregate: "sum", formatTotal: (v) => \`₹\${inr.format(v)}\` } },
  { accessorKey: "due", header: "Latest due", meta: { aggregate: "max" } },
];

<DataTable data={lines} columns={columns} fillHeight enablePerColumnFilters />`}
        >
          <div className="zen-flex zen-h-80 zen-flex-col" data-testid="totals-table">
            <DataTable data={LINES} columns={totalColumns} fillHeight enableColumnFilters enablePerColumnFilters />
          </div>
        </CodeExample>
        <CodeExample
          title="Grouped: each customer's subtotal, from the same declaration"
          code={`<DataTable data={lines} columns={columns} enableGrouping initialGrouping={["customer"]} />`}
        >
          <div data-testid="totals-grouped">
            <DataTable data={LINES} columns={totalColumns} enableGrouping initialGrouping={["customer"]} />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>27. Export on the server</h2>
        <CodeExample
          title="onExport: the browser describes, the server builds"
          description="For data too large for the browser. Export hands your server an ExportRequest: the visible columns (header, width, format, total), filters, sort, grouping, locale, and all matching rows or the selected ids (even on pages never loaded). Your endpoint queries the full data and returns the file. Try a search, a sort, or selecting rows on two pages, then Export."
          code={`<DataTable
  data={page.rows} manualPagination={…} manualSorting manualFiltering
  getRowId={(e) => e.id} enableRowSelection
  exportFilename="ledger" exportTitle="General ledger"
  onExport={(format, request) =>
    fetch("/api/method/myapp.export_ledger", {
      method: "POST", body: JSON.stringify(request),
    }).then((r) => (r.ok ? r.blob() : Promise.reject(new Error(r.statusText))))}
/>

// The server (yours): read request.columns / filters / sort / scope,
// query the full ledger, write the .xlsx / .pdf / .csv, send it back.`}
        >
          <div data-testid="server-ledger" className="zen-w-full">
            <ServerLedger />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

/* -------------------------- inline-edit demo ---------------------- */
/**
 * Owns its own data so onCellEdit can patch it. Stable IDs (Person.id)
 * mean the editing-cell pointer survives re-renders even after a commit
 * updates the row.
 */
const editColumns: ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { editable: true },
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { editable: true },
  },
  {
    accessorKey: "role",
    header: "Role",
    meta: {
      editable: true,
      editVariant: "select",
      editOptions: ROLES.map((r) => ({ label: r, value: r })),
    },
  },
  {
    accessorKey: "salary",
    header: "Salary (₹)",
    cell: ({ row }) =>
      typeof row.original.salary === "number"
        ? row.original.salary.toLocaleString("en-IN")
        : row.original.salary,
    meta: { editable: true, editVariant: "number" },
  },
  { accessorKey: "lastSeen", header: "Last seen" },
];

const InlineEditDemo: React.FC = () => {
  const [rows, setRows] = useState<Person[]>(() => makePeople(8));
  return (
    <DataTable
      data={rows}
      columns={editColumns}
      getRowId={(row) => row.id}
      onCellEdit={({ rowId, columnId, value }) => {
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId
              ? {
                  ...r,
                  [columnId]:
                    columnId === "salary" ? Number(value ?? 0) : value,
                }
              : r,
          ),
        );
      }}
    />
  );
};

export default NewDataTableDemo;

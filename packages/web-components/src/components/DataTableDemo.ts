import type { CellEditPayload, DataTableColumn, DataTableMenuTarget, SortingState } from "@algorisys/zen-ui-vanilla";
import type { ExportFormat, ExportRequest } from "@algorisys/zen-ui-core/export-request";
import { DemoPage } from "./demo-helpers";

/**
 * DataTable demo — the web-components mirror of the vanilla DataTableDemo. Renders
 * <zen-data-table>; `columns` (carrying the cell render fn) and `data` are set as
 * JS properties. Feature flags are boolean/enum attributes.
 */

/* -------------------------- sample data --------------------------- */
type Person = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Member" | "Guest";
  status: "active" | "invited" | "suspended";
  lastSeen: string;
  department: string;
  location: string;
  manager: string;
  phone: string;
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
      manager: MANAGERS[i % MANAGERS.length],
      phone: `+91 9${String(800000000 + i * 137).padStart(9, "0")}`,
      salary: 60_000 + (i * 1234) % 240_000,
      joinedYear: 2018 + (i % 8),
    };
  });

const SMALL = makePeople(8);
const MEDIUM = makePeople(40);
const LARGE = makePeople(2000);
const MENU_PEOPLE = makePeople(1000);
const HUGE = makePeople(10_000);

const statusColor = (s: Person["status"]) =>
  s === "active" ? "success" : s === "invited" ? "info" : "error";

/* -------------------------- helpers -------------------------------- */
function el(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

/** Build a <zen-data-table> with columns + data JS properties and flag attrs. */
function table(data: Person[], attrs: Record<string, string> = {}): HTMLElement {
  const t = el("zen-data-table", attrs);
  (t as unknown as { columns: DataTableColumn<Person>[] }).columns = columns;
  (t as unknown as { data: Person[] }).data = data;
  return t;
}

/* -------------------------- columns -------------------------------- */
/** Section 33: what an expanded row shows. */
function personDetail(p: Person): HTMLElement {
  const d = document.createElement("div");
  d.className = "zen-px-6 zen-py-3 zen-text-sm zen-text-zen-muted-fg";
  d.dataset.detail = p.id;
  d.textContent = `${p.name} · ${p.department}, ${p.location} · reports to ${p.manager} · ${p.phone}`;
  return d;
}

// Section 34: React's grouping demo (section 23), with zen totals as subtotals.
const GROUP_COLUMNS: DataTableColumn<Person>[] = [
  { accessorKey: "role", header: "Role" },
  { accessorKey: "name", header: "Name", enableGrouping: false },
  { accessorKey: "salary", header: "Salary", enableGrouping: false, meta: { aggregate: "sum" }, cell: ({ row }) => row.salary.toLocaleString("en-IN") },
  { accessorKey: "status", header: "Status", meta: { aggregate: "count" } },
  { accessorKey: "department", header: "Department" },
];

// Sections 31-32: one column per filter variant.
const FILTER_COLUMNS: DataTableColumn<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role", meta: { filterVariant: "select", filterOptions: ROLES.map((r) => ({ label: r, value: r })) } },
  { accessorKey: "status", header: "Status", meta: { filterVariant: "select", filterOptions: STATUSES.map((r) => ({ label: r, value: r })) } },
  { accessorKey: "joinedYear", header: "Joined", meta: { filterVariant: "number" } },
  { accessorKey: "salary", header: "Salary", meta: { filterVariant: "numberRange" }, cell: ({ row }) => row.salary.toLocaleString("en-IN") },
  { id: "admin", header: "Admin", accessorFn: (p) => p.role === "Admin", meta: { filterVariant: "boolean" }, cell: ({ row }) => (row.role === "Admin" ? "Yes" : "No") },
];
const SERVER_COLUMNS: DataTableColumn<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role", meta: { filterVariant: "select", filterOptions: ROLES.map((r) => ({ label: r, value: r })) } },
  { accessorKey: "salary", header: "Salary", cell: ({ row }) => row.salary.toLocaleString("en-IN") },
];
/** A stand-in for your endpoint: it reads the request the table reports. */
function serverQuery(filters: { id: string; value: unknown }[], sorting: { id: string; desc: boolean }[]): Person[] {
  let rows = MEDIUM.filter((p) =>
    filters.every((f) =>
      f.id === "name" ? p.name.toLowerCase().includes(String(f.value).toLowerCase()) : f.id === "role" ? p.role === f.value : true,
    ),
  );
  const s = sorting[0];
  if (s) rows = [...rows].sort((a, b) => (a[s.id as keyof Person] > b[s.id as keyof Person] ? 1 : -1) * (s.desc ? -1 : 1));
  return rows;
}

// Section 29: the same four columns React's and Solid's section uses.
const MANAGE_COLUMNS: DataTableColumn<Person>[] = [
  { accessorKey: "name", header: "Name", size: 180 },
  { accessorKey: "role", header: "Role", size: 120 },
  { accessorKey: "department", header: "Department", size: 150 },
  { accessorKey: "salary", header: "Salary", size: 140, cell: ({ row }) => row.salary.toLocaleString("en-IN") },
];
// Section 30: wide enough to scroll sideways.
const WIDE_COLUMNS: DataTableColumn<Person>[] = [
  { accessorKey: "name", header: "Name", size: 180 },
  { accessorKey: "email", header: "Email", size: 260 },
  { accessorKey: "phone", header: "Phone", size: 170 },
  { accessorKey: "role", header: "Role", size: 120 },
  { accessorKey: "department", header: "Department", size: 160 },
  { accessorKey: "location", header: "Location", size: 150 },
  { accessorKey: "manager", header: "Manager", size: 180 },
  { accessorKey: "salary", header: "Salary", size: 140, cell: ({ row }) => row.salary.toLocaleString("en-IN") },
];

const columns: DataTableColumn<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const badge = el("zen-badge", { variant: "soft", color: statusColor(row.status) });
      badge.textContent = row.status;
      return badge;
    },
  },
  { accessorKey: "lastSeen", header: "Last seen" },
];

/** A <zen-data-table> with any columns, flag attributes and JS properties. */
function zenTable<T>(data: T[], cols: DataTableColumn<T>[], attrs: Record<string, string> = {}, props: Record<string, unknown> = {}): HTMLElement {
  const t = el("zen-data-table", attrs);
  Object.assign(t, { columns: cols, data, ...props });
  return t;
}

/* -------------------------- section 6b: row virtualization -------- */
/* React's grouped columns, without the group aggregates (this binding does
 * not group rows). */
const virtColumns: DataTableColumn<Person>[] = [
  { accessorKey: "role", header: "Role" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "salary", header: "Salary (₹)", cell: ({ row }) => row.salary.toLocaleString("en-IN") },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const badge = el("zen-badge", { variant: "soft", color: statusColor(row.status) });
      badge.textContent = row.status;
      return badge;
    },
  },
];

/* -------------------------- section 6c: cell navigation ----------- */
/* An order's lines, for the cell-navigation grid. */
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
const lineColumns: DataTableColumn<Line>[] = [
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
    cell: ({ value }) => (value as number).toLocaleString("en-IN"),
  },
  { accessorKey: "note", header: "Note", meta: { editable: true } },
];

/* -------------------------- section 19: inline editing ------------ */
const editColumns: DataTableColumn<Person>[] = [
  { accessorKey: "name", header: "Name", meta: { editable: true } },
  { accessorKey: "email", header: "Email", meta: { editable: true } },
  {
    accessorKey: "role",
    header: "Role",
    meta: { editable: true, editVariant: "select", editOptions: ROLES.map((r) => ({ label: r, value: r })) },
  },
  {
    accessorKey: "salary",
    header: "Salary (₹)",
    cell: ({ row }) =>
      typeof row.salary === "number" ? row.salary.toLocaleString("en-IN") : String(row.salary ?? ""),
    meta: { editable: true, editVariant: "number" },
  },
  { accessorKey: "lastSeen", header: "Last seen" },
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
const endAligned = (text: string): HTMLElement => {
  const span = document.createElement("span");
  span.className = "zen-block zen-text-end zen-tabular-nums";
  span.textContent = text;
  return span;
};
const totalColumns: DataTableColumn<TotalLine>[] = [
  { accessorKey: "item", header: "Item" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "qty", header: "Qty", meta: { aggregate: "sum" }, cell: ({ row }) => endAligned(String(row.qty)) },
  { accessorKey: "rate", header: "Rate", meta: { aggregate: "avg" }, cell: ({ row }) => endAligned(inrTotal.format(row.rate)) },
  {
    accessorKey: "amount",
    header: "Amount",
    meta: { aggregate: "sum", formatTotal: (v) => `₹${inrTotal.format(v as number)}` },
    cell: ({ row }) => endAligned(inrTotal.format(row.amount)),
  },
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
    const textOf = (v: unknown) =>
      (v && typeof v === "object" && "value" in (v as object) ? String((v as { value: unknown }).value ?? "") : String(v ?? "")).toLowerCase();
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
      idx.sort((a, b) => {
        const x = entryAt(a)[k], y = entryAt(b)[k];
        return (x < y ? -1 : x > y ? 1 : 0) * (first.desc ? -1 : 1);
      });
    }
    return idx;
  },
};
const entryColumns: DataTableColumn<Entry>[] = [
  { accessorKey: "id", header: "Entry" },
  { accessorKey: "date", header: "Date", meta: { exportFormat: { kind: "date" } } },
  { accessorKey: "account", header: "Account" },
  { accessorKey: "party", header: "Party" },
  {
    accessorKey: "amount",
    header: "Amount",
    meta: { exportFormat: { kind: "amount", currency: "INR", precision: 2 } },
    cell: ({ row }) => endAligned(inrTotal.format(row.amount)),
  },
];
const LEDGER_CONTEXT = { ledger: "FY 2026-27" };

/** Section 27's table, wired to the mock server. */
function ServerLedger(): HTMLElement {
  const pageSize = 25;
  let page = 0;
  let sorting: SortingState = [];
  let search = "";
  let selection: string[] = [];
  let failNext = false;
  const fmt = new Intl.NumberFormat("en-IN");
  let matching = mockServer.match(search, [], sorting);
  const pageRows = () => matching.slice(page * pageSize, (page + 1) * pageSize).map(entryAt);

  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-3";
  const counts = document.createElement("p");
  counts.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  counts.dataset.testid = "ledger-counts";
  const paintCounts = () => {
    const total = document.createElement("strong");
    total.textContent = fmt.format(LEDGER_SIZE);
    const here = document.createElement("strong");
    here.textContent = String(pageRows().length);
    counts.replaceChildren("The server holds ", total, ` entries; ${fmt.format(matching.length)} match; the browser has `, here, ".");
  };
  paintCounts();

  const said = document.createElement("p");
  said.className = "zen-m-0 zen-rounded-zen-md zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-sm";
  said.dataset.testid = "server-said";
  const details = document.createElement("details");
  details.open = true;
  const summary = document.createElement("summary");
  summary.className = "zen-cursor-pointer zen-text-sm zen-text-zen-muted-fg";
  summary.textContent = "What your server received";
  const pre = document.createElement("pre");
  pre.className = "zen-m-0 zen-mt-2 zen-max-h-72 zen-overflow-auto zen-rounded-zen-md zen-bg-zen-muted zen-p-3 zen-text-xs";
  pre.dataset.testid = "export-request";
  details.append(summary, pre);

  const failBox = document.createElement("input");
  failBox.type = "checkbox";
  failBox.addEventListener("change", () => (failNext = failBox.checked));
  const failLabel = document.createElement("label");
  failLabel.className = "zen-flex zen-items-center zen-gap-2 zen-text-sm";
  failLabel.append(failBox, " Make the next export fail (to see the error)");

  /** The mock server's export endpoint. */
  const serve = async (format: ExportFormat, request: ExportRequest): Promise<Blob | void> => {
    pre.textContent = JSON.stringify(request, null, 2);
    if (!details.isConnected) wrap.append(details);
    await new Promise((r) => setTimeout(r, 700)); // the server at work
    if (failNext) {
      failNext = false;
      failBox.checked = false;
      throw new Error("the server is busy, try again");
    }
    const all = () => mockServer.match(request.filters.search ?? "", request.filters.columns, request.sort);
    const rows = request.scope.kind === "selected" ? request.scope.ids.length : all().length;
    const say = (text: string) => {
      said.textContent = text;
      if (!said.isConnected) wrap.insertBefore(said, details.isConnected ? details : null);
    };
    if (format !== "csv") {
      say(`Your server would now build ledger.${format} from this request: ${fmt.format(rows)} rows. (This demo has no ${format} writer; CSV below is real.)`);
      return;
    }
    // CSV: built from ALL the matching rows, not the page.
    const ids = request.scope.kind === "selected" ? request.scope.ids : all().map((i) => entryAt(i).id);
    const byId = (id: string) => entryAt(Number(id.slice(3)) - 1);
    const cols = request.columns;
    const lines = [cols.map((c) => c.header).join(","), ...ids.map((id) => cols.map((c) => String(byId(id)[c.id as keyof Entry])).join(","))];
    say(`The server built ledger.csv: ${fmt.format(ids.length)} rows.`);
    return new Blob([lines.join("\n")], { type: "text/csv" });
  };

  const manual = () => ({
    pageIndex: page,
    pageCount: Math.max(1, Math.ceil(matching.length / pageSize)),
    pageSize,
    onPageChange: (next: number) => {
      page = next;
      refresh();
    },
  });
  const requery = () => {
    matching = mockServer.match(search, [], sorting);
    page = 0;
  };
  const dt = zenTable(
    pageRows(),
    entryColumns,
    {
      "enable-sorting": "",
      "enable-column-filters": "",
      "enable-row-selection": "",
      "enable-pagination": "",
      "page-size": String(pageSize),
      "export-filename": "ledger",
      "export-title": "General ledger",
    },
    {
      getRowId: (e: Entry) => e.id,
      sorting,
      globalFilter: search,
      rowSelection: selection,
      manualPagination: manual(),
      exportContext: LEDGER_CONTEXT,
      onExport: serve,
    },
  );
  dt.addEventListener("zen-sorting-change", (e) => {
    sorting = (e as CustomEvent<SortingState>).detail;
    requery();
    refresh();
  });
  dt.addEventListener("zen-global-filter-change", (e) => {
    search = (e as CustomEvent<string>).detail;
    requery();
    refresh();
  });
  dt.addEventListener("zen-row-selection-change", (e) => {
    selection = (e as CustomEvent<string[]>).detail;
    refresh();
  });
  function refresh(): void {
    Object.assign(dt, { data: pageRows(), sorting, globalFilter: search, rowSelection: selection, manualPagination: manual() });
    paintCounts();
  }
  wrap.append(counts, dt, failLabel);
  return wrap;
}

const labeled = (text: string, node: Node): HTMLElement => {
  const wrap = document.createElement("div");
  const h4 = document.createElement("h4");
  h4.style.margin = "0 0 0.25rem 0";
  h4.style.fontSize = "0.8125rem";
  h4.style.color = "var(--zen-color-muted-fg)";
  h4.textContent = text;
  wrap.append(h4, node);
  return wrap;
};

/* -------------------------- demo ----------------------------------- */
export default function DataTableDemo(): HTMLElement {
  return DemoPage({
    title: "DataTable",
    description:
      "A headless data grid — columns, rows, sorting, pagination, row selection, and row virtualization — hand-written for the framework-free binding. Every capability is opt-in via a flag, mirroring React's DataTable.",
    sections: [
      {
        title: "0. headerVariant — brand intensity of the column header",
        codeTitle: 'headerVariant: "plain" (default) | "underline" | "branded"',
        codeDescription:
          "Pick how much brand color shows up in the header. Plain keeps neutral chrome. Underline adds a 2-px primary rule under the header row. Branded fills the band with primary-soft + dark-primary label text.",
        code: `<zen-data-table></zen-data-table>                              <!-- plain -->
<zen-data-table header-variant="underline"></zen-data-table>
<zen-data-table header-variant="branded"></zen-data-table>

table.columns = columns;
table.data = people;`,
        render: () => {
          const stack = document.createElement("div");
          stack.style.display = "flex";
          stack.style.flexDirection = "column";
          stack.style.gap = "24px";
          stack.append(
            labeled("plain (default)", table(SMALL)),
            labeled("underline", table(SMALL, { "header-variant": "underline" })),
            labeled("branded", table(SMALL, { "header-variant": "branded" })),
          );
          return stack;
        },
      },
      {
        title: "1. Minimal — no toggles",
        codeTitle: "Just data + columns",
        code: `table.columns = columns;
table.data = people;`,
        render: () => table(SMALL),
      },
      {
        title: "2. Sorting (per-column toggle in the header)",
        codeTitle: "enable-sorting",
        codeDescription: "Click a column header to cycle asc → desc → unsorted.",
        code: `<zen-data-table enable-sorting></zen-data-table>`,
        render: () => table(SMALL, { "enable-sorting": "" }),
      },
      {
        title: "3. Pagination (client-side)",
        codeTitle: "enable-pagination with page-size selector",
        code: `<zen-data-table enable-pagination page-size="10"></zen-data-table>`,
        render: () => table(MEDIUM, { "enable-pagination": "", "page-size": "10" }),
      },
      {
        title: "4. Global filter",
        codeTitle: "enable-column-filters shows a search box in the toolbar",
        codeDescription:
          "The toolbar renders a search input; rows whose visible values contain the query are kept. (React additionally ships a Columns visibility menu, which this binding does not.)",
        code: `<zen-data-table
  enable-column-filters
  enable-pagination
  global-filter-placeholder="Search people…"
></zen-data-table>`,
        render: () =>
          table(MEDIUM, {
            "enable-column-filters": "",
            "enable-pagination": "",
            "global-filter-placeholder": "Search people…",
          }),
      },
      {
        title: "5. Row selection",
        codeTitle: "enable-row-selection prepends a select column",
        codeDescription: "Header checkbox supports tri-state (none / some / all).",
        code: `<zen-data-table enable-row-selection enable-pagination></zen-data-table>`,
        render: () => table(SMALL, { "enable-row-selection": "", "enable-pagination": "" }),
      },
      {
        title: "5b. Keyboard rows",
        codeTitle: "enable-keyboard-navigation + zen-row-activate",
        codeDescription:
          "Tab into the table once, then ↑/↓, Home/End and PageUp/PageDown move between rows. Enter opens the row (Ctrl+Enter reports the modifier); Space selects it and Ctrl+A selects the page.",
        code: `<zen-data-table enable-row-selection enable-keyboard-navigation></zen-data-table>

table.rowLabel = (row) => row.name;
table.addEventListener("zen-row-activate", (e) => {
  const [row, keyEvent] = e.detail;
  open(row, { newTab: keyEvent.ctrlKey || keyEvent.metaKey });
});`,
        render: () => {
          const opened = document.createElement("span");
          opened.dataset.testid = "kb-activated";
          opened.textContent = "nothing yet";
          const note = document.createElement("p");
          note.className = "zen-text-sm zen-text-zen-muted-fg zen-mt-2";
          note.setAttribute("aria-live", "polite");
          note.append("Opened: ", opened);
          const dt = zenTable(
            SMALL,
            columns,
            { "enable-row-selection": "", "enable-keyboard-navigation": "" },
            { rowLabel: (row: Person) => row.name },
          );
          dt.addEventListener("zen-row-activate", (e) => {
            const [row, ev] = (e as CustomEvent<[Person, KeyboardEvent]>).detail;
            opened.textContent = `${row.name}${ev.ctrlKey || ev.metaKey ? " (Ctrl+Enter)" : ""}`;
          });
          const wrap = document.createElement("div");
          wrap.append(dt, note);
          return wrap;
        },
      },
      {
        title: "6. Virtualized — 2 000 rows, no pagination",
        codeTitle: "enable-virtualization renders only the visible window",
        codeDescription: "Scroll the table body. The header stays in view above the viewport.",
        code: `<zen-data-table
  enable-sorting
  enable-virtualization
  max-body-height="400"
></zen-data-table>

table.data = largeDataset;   // 2 000 rows`,
        render: () =>
          table(LARGE, {
            "enable-sorting": "",
            "enable-virtualization": "",
            "max-body-height": "400",
          }),
      },
      {
        title: "6b. Row virtualization — 10 000 rows, every feature on",
        codeTitle: "enable-row-virtualization keeps sorting, selection and the keyboard",
        codeDescription:
          "Only the rows in view are rendered, inside the regular table. Sort a column, select rows, or click a row and move with ↑/↓, PageUp/PageDown and Home/End: the focused row is scrolled into view and stays mounted while you scroll away. (React's version of this table also groups and expands rows, which this binding does not do yet.)",
        code: `<zen-data-table
  enable-row-virtualization
  enable-sorting
  enable-row-selection
  enable-keyboard-navigation
  fill-height
></zen-data-table>   <!-- inside a frame with a height; or max-body-height="420" -->

table.data = tenThousandPeople;
table.getRowId = (p) => p.id;
table.addEventListener("zen-row-activate", (e) => open(e.detail[0]));`,
        render: () => {
          const opened = document.createElement("span");
          opened.dataset.testid = "virt-activated";
          opened.textContent = "nothing yet";
          const dt = zenTable(
            HUGE,
            virtColumns,
            {
              "enable-row-virtualization": "",
              "enable-sorting": "",
              "enable-row-selection": "",
              "enable-keyboard-navigation": "",
              "fill-height": "",
            },
            { getRowId: (p: Person) => p.id, rowLabel: (row: Person) => row.name },
          );
          dt.addEventListener("zen-row-activate", (e) => {
            const [row] = (e as CustomEvent<[Person, KeyboardEvent]>).detail;
            opened.textContent = row.name;
          });
          // fill-height: the table fills this frame, as a list that is a page's main pane.
          const frame = document.createElement("div");
          frame.className = "zen-flex zen-h-[440px] zen-flex-col";
          frame.append(dt);
          const note = document.createElement("p");
          note.className = "zen-text-sm zen-text-zen-muted-fg zen-mt-2";
          note.setAttribute("aria-live", "polite");
          note.append("Opened: ", opened);
          const wrap = document.createElement("div");
          wrap.append(frame, note);
          return wrap;
        },
      },
      {
        title: "6c. Cell navigation — work in it like a spreadsheet",
        codeTitle: "enable-cell-navigation: cell by cell, ranges, copy and paste",
        codeDescription:
          "Click a cell, then move with the arrows, PageUp/PageDown, Home/End and Ctrl+Home/End. Enter or F2 edits, or just type; Enter in the editor moves down, Tab across, Esc goes back. Shift+arrows, Shift+click or a drag selects a range. Copy it into a spreadsheet, or paste a block from one; Delete clears. A cell takes only what its editor could produce: Amount is computed, so paste and Delete leave it alone, and UOM is a select with no empty option, so Delete leaves it as it is and a paste must match one of its options.",
        code: `<zen-data-table enable-cell-navigation enable-row-virtualization fill-height></zen-data-table>

table.columns = columns; // meta: { editable: true, editVariant: "number" | "select" }
table.data = lines;
table.getRowId = (l) => l.id;
table.addEventListener("zen-cell-edit", (e) => apply([e.detail]));
table.addEventListener("zen-cells-edit", (e) => apply(e.detail)); // a paste, or Delete over a range`,
        render: () => {
          let lines = makeLines(2000);
          const said = document.createElement("span");
          said.dataset.testid = "cells-edited";
          said.textContent = "No changes yet.";
          const dt = zenTable(
            lines,
            lineColumns,
            { "enable-cell-navigation": "", "enable-row-virtualization": "", "fill-height": "" },
            { getRowId: (l: Line) => l.id },
          );
          const apply = (edits: CellEditPayload[]) => {
            const byRow = new Map<string, Record<string, unknown>>();
            for (const e of edits) byRow.set(e.rowId, { ...byRow.get(e.rowId), [e.columnId]: e.value });
            lines = lines.map((l) => (byRow.has(l.id) ? { ...l, ...byRow.get(l.id) } : l));
            (dt as unknown as { data: Line[] }).data = lines;
            said.textContent = `${edits.length} cell${edits.length === 1 ? "" : "s"} changed`;
          };
          dt.addEventListener("zen-cell-edit", (e) => apply([(e as CustomEvent<CellEditPayload>).detail]));
          dt.addEventListener("zen-cells-edit", (e) => apply((e as CustomEvent<CellEditPayload[]>).detail));
          const frame = document.createElement("div");
          frame.className = "zen-flex zen-h-[420px] zen-flex-col";
          frame.append(dt);
          const note = document.createElement("p");
          note.className = "zen-text-sm zen-text-zen-muted-fg zen-mt-2";
          note.setAttribute("aria-live", "polite");
          note.append(said);
          const wrap = document.createElement("div");
          wrap.append(frame, note);
          return wrap;
        },
      },
      {
        title: "6d. Context menu on rows",
        codeTitle: "contextMenu: a right-click menu for the row, or the selected rows",
        codeDescription:
          "Right-click a row, or focus one (click it, then use the arrows) and press the menu key or Shift+F10. The row becomes the focused one and the menu is for it; select a few rows first and a right-click on one of them acts on all of them. The header keeps the browser's own menu.",
        code: `<zen-data-table enable-row-selection enable-keyboard-navigation fill-height></zen-data-table>

table.getRowId = (p) => p.id;
table.contextMenu = ({ row, selection }) => [
  { type: "label", label: selection.length > 1 ? \`\${selection.length} rows\` : row.name },
  { label: "Open in new tab", onSelect: () => openInNewTab(row) },
  { label: "Copy name", onSelect: () => copy(selection) },
  { type: "separator" },
  { label: "Delete…", variant: "destructive", onSelect: () => remove(selection) },
];`,
        render: () => {
          const action = document.createElement("span");
          action.dataset.testid = "menu-action";
          action.textContent = "Nothing chosen yet.";
          const note = document.createElement("p");
          note.className = "zen-text-sm zen-text-zen-muted-fg zen-mt-2";
          note.setAttribute("aria-live", "polite");
          note.append(action);
          const say = (text: string) => (action.textContent = text);
          const frame = document.createElement("div");
          frame.className = "zen-flex zen-h-[360px] zen-flex-col";
          frame.append(
            zenTable(
              MENU_PEOPLE,
              columns,
              { "enable-row-selection": "", "enable-keyboard-navigation": "", "fill-height": "" },
              {
                getRowId: (p: Person) => p.id,
                rowLabel: (row: Person) => row.name,
                contextMenu: ({ row, selection }: DataTableMenuTarget<Person>) => [
                  { type: "label", label: selection.length > 1 ? `${selection.length} rows` : row.name },
                  { label: "Open in new tab", shortcut: "Ctrl+Enter", onSelect: () => say(`Opened ${row.name} in a new tab`) },
                  { label: "Copy name", onSelect: () => say(`Copied ${selection.map((r) => r.name).join(", ")}`) },
                  { label: "Duplicate", onSelect: () => say(`Duplicated ${row.name}`) },
                  { type: "separator" },
                  {
                    label: "Delete…",
                    variant: "destructive",
                    onSelect: () => say(`Asked to delete ${selection.length} row${selection.length === 1 ? "" : "s"}`),
                  },
                ],
              },
            ),
          );
          const wrap = document.createElement("div");
          wrap.append(frame, note);
          return wrap;
        },
      },
      {
        title: "7. Server-driven pagination (manual)",
        codeTitle: "manualPagination overrides client-side paging",
        codeDescription:
          "Pass { pageIndex, pageCount, pageSize, onPageChange }. The DataTable shows the slice you give it; it does not slice further. Use this when fetching from an API.",
        code: `table.manualPagination = {
  pageIndex: page,
  pageCount: serverPageCount,
  pageSize: 10,
  onPageChange: (next) => {
    page = next;
    table.data = sliceFor(page);
    table.manualPagination = { ...state, pageIndex: page };
  },
};`,
        render: () => {
          const serverPageSize = 10;
          const serverPageCount = Math.ceil(LARGE.length / serverPageSize);
          let serverPage = 0;
          const sliceFor = (p: number) => LARGE.slice(p * serverPageSize, (p + 1) * serverPageSize);

          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";

          const controls = document.createElement("div");
          controls.style.display = "flex";
          controls.style.gap = "8px";
          const pageLabel = document.createElement("span");
          pageLabel.style.alignSelf = "center";
          pageLabel.style.fontSize = "0.8125rem";
          pageLabel.style.color = "var(--zen-color-muted-fg)";

          const setLabel = () => {
            pageLabel.textContent = `page ${serverPage + 1} / ${serverPageCount} (simulated server)`;
          };

          const dt = table(sliceFor(serverPage));
          const goTo = (next: number) => {
            serverPage = next;
            (dt as unknown as { data: Person[] }).data = sliceFor(serverPage);
            (dt as unknown as { manualPagination: unknown }).manualPagination = {
              pageIndex: serverPage,
              pageCount: serverPageCount,
              pageSize: serverPageSize,
              onPageChange: goTo,
            };
            setLabel();
          };
          (dt as unknown as { manualPagination: unknown }).manualPagination = {
            pageIndex: serverPage,
            pageCount: serverPageCount,
            pageSize: serverPageSize,
            onPageChange: goTo,
          };

          const reset = el("zen-button", { size: "sm", variant: "outline" });
          reset.textContent = "Reset to page 1";
          reset.addEventListener("click", () => goTo(0));
          setLabel();
          controls.append(reset, pageLabel);
          wrap.append(dt, controls);
          return wrap;
        },
      },
      {
        title: "8. Column separators (Zen theme opt-in)",
        codeTitle: "enable-column-separators draws 1-px vertical dividers",
        codeDescription:
          "Per Zen theme table spec — opt-in. Renders a right border on every cell except the last.",
        code: `<zen-data-table enable-column-separators></zen-data-table>`,
        render: () => table(SMALL, { "enable-column-separators": "" }),
      },
      {
        title: "9. Row reorder (drag handle)",
        codeTitle: "enable-row-ordering + zen-row-order-change",
        codeDescription:
          "Grip-handle column appears as the leading column. Drag a row up or down — the event carries the new ID order; the caller re-arranges the source data. Esc cancels a drag. Not compatible with enable-virtualization (mutually exclusive); with enable-row-virtualization the rows drag to anywhere in the table, which scrolls near its edges.",
        code: `<zen-data-table enable-row-ordering></zen-data-table>

table.getRowId = (row) => row.id;   // stable identity across reorders
table.addEventListener("zen-row-order-change", (e) => {
  const byId = new Map(table.data.map((d) => [d.id, d]));
  table.data = e.detail.map((id) => byId.get(id));
});`,
        render: () => {
          let data = makePeople(6);
          const dt = zenTable(data, columns, { "enable-row-ordering": "" }, { getRowId: (row: Person) => row.id });
          dt.addEventListener("zen-row-order-change", (e) => {
            const byId = new Map(data.map((d) => [d.id, d]));
            data = (e as CustomEvent<string[]>).detail.map((id) => byId.get(id)).filter((d): d is Person => !!d);
            (dt as unknown as { data: Person[] }).data = data;
          });
          return dt;
        },
      },
      {
        title: "9. Multi-sort (Shift-click a second header)",
        codeTitle: "enable-sorting + enable-multi-sort",
        codeDescription:
          "Click one header to sort, then Shift-click another to add it as a secondary sort. A small priority badge (1, 2, …) appears next to each sorted header label.",
        code: `<zen-data-table enable-sorting enable-multi-sort enable-pagination></zen-data-table>`,
        render: () =>
          table(MEDIUM, {
            "enable-sorting": "",
            "enable-multi-sort": "",
            "enable-pagination": "",
          }),
      },
      {
        title: "10. Sticky header",
        codeTitle: "sticky-header pins the header while the body scrolls",
        codeDescription:
          "Body is constrained to max-body-height so the sticky header has a real scroll context. In virtualized mode the header is already fixed and the prop is a no-op.",
        code: `<zen-data-table enable-sorting sticky-header max-body-height="280"></zen-data-table>`,
        render: () =>
          table(MEDIUM, {
            "enable-sorting": "",
            "sticky-header": "",
            "max-body-height": "280",
          }),
      },
      {
        title: "11. rowClassName — per-row styling",
        codeTitle: "Tint rows based on data — e.g. suspended users get a red wash",
        codeDescription:
          "The hook is called once per rendered body row. The returned string is merged after the built-in classes, so it composes with hover / selected styling instead of replacing it.",
        code: `table.rowClassName = (row) =>
  row.status === "suspended" ? "zen-bg-zen-error-soft/40"
  : row.status === "invited" ? "zen-bg-zen-info-soft/30"
  : undefined;`,
        render: () => {
          const dt = table(SMALL);
          (dt as unknown as { rowClassName: (row: Person) => string | undefined }).rowClassName = (row) =>
            row.status === "suspended"
              ? "zen-bg-zen-error-soft/40"
              : row.status === "invited"
                ? "zen-bg-zen-info-soft/30"
                : undefined;
          return dt;
        },
      },
      {
        title: "19. Inline cell editing",
        codeTitle: "meta.editable opts a column in; zen-cell-edit carries the commit",
        codeDescription:
          "Double-click (or focus + Enter / Space) any editable cell. Text columns get an Input, number columns get a NumberField (with ± steppers), select columns open a list of their options. Enter or blur commits, Esc cancels. The caller owns the data array — zen-cell-edit hands you the new value and you decide how to apply it.",
        code: `<zen-data-table></zen-data-table>

table.columns = [
  { accessorKey: "name",   header: "Name",   meta: { editable: true } },
  { accessorKey: "email",  header: "Email",  meta: { editable: true } },
  { accessorKey: "role",   header: "Role",
    meta: { editable: true, editVariant: "select",
            editOptions: ROLES.map((r) => ({ label: r, value: r })) } },
  { accessorKey: "salary", header: "Salary",
    meta: { editable: true, editVariant: "number" } },
];
table.data = rows;
table.getRowId = (r) => r.id;
table.addEventListener("zen-cell-edit", (e) => {
  const { rowId, columnId, value } = e.detail;
  rows = rows.map((r) => (r.id === rowId ? { ...r, [columnId]: value } : r));
  table.data = rows;
});`,
        render: () => {
          let rows = makePeople(8);
          const dt = zenTable(rows, editColumns, {}, { getRowId: (row: Person) => row.id });
          dt.addEventListener("zen-cell-edit", (e) => {
            const { rowId, columnId, value } = (e as CustomEvent<CellEditPayload>).detail;
            rows = rows.map((r) =>
              r.id === rowId ? { ...r, [columnId]: columnId === "salary" ? Number(value ?? 0) : value } : r,
            );
            (dt as unknown as { data: Person[] }).data = rows;
          });
          return dt;
        },
      },
      {
        title: "26. Totals",
        codeTitle: "meta.aggregate: a total that computes itself, exact in decimal",
        codeDescription:
          'Sum, count, avg, min, max or your own function, per column. The footer totals every row the filters let through (across pages; totals-over="page" for this page only) and stays in view as the rows scroll. Search for a customer and watch the totals follow.',
        code: `<zen-data-table fill-height enable-column-filters></zen-data-table>

table.columns = [
  { accessorKey: "item", header: "Item" },                       // "Total" goes here
  { accessorKey: "qty", header: "Qty", meta: { aggregate: "sum" } },
  { accessorKey: "rate", header: "Rate", meta: { aggregate: "avg" } },
  { accessorKey: "amount", header: "Amount",
    meta: { aggregate: "sum", formatTotal: (v) => \`₹\${inr.format(v)}\` } },
  { accessorKey: "due", header: "Latest due", meta: { aggregate: "max" } },
];
table.data = lines;`,
        render: () => {
          const frame = document.createElement("div");
          frame.className = "zen-flex zen-h-80 zen-flex-col";
          frame.dataset.testid = "totals-table";
          frame.append(zenTable(LINES, totalColumns, { "fill-height": "", "enable-column-filters": "" }));
          return frame;
        },
      },
      {
        title: "27. Export on the server",
        codeTitle: "onExport: the browser describes, the server builds",
        codeDescription:
          "For data too large for the browser. Export hands your server an ExportRequest: the columns (header, width, format, total), search, sort, locale, and all matching rows or the selected ids (even on pages never loaded). Your endpoint queries the full data and returns the file. Try a search, a sort, or selecting rows on two pages, then Export.",
        code: `<zen-data-table enable-sorting enable-column-filters enable-row-selection enable-pagination
  export-filename="ledger" export-title="General ledger"></zen-data-table>

table.data = page.rows;
table.manualPagination = { … };
// A property, not an event: the table waits on what it returns.
table.onExport = (format, request) =>
  fetch("/api/method/myapp.export_ledger", {
    method: "POST", body: JSON.stringify(request),
  }).then((r) => (r.ok ? r.blob() : Promise.reject(new Error(r.statusText))));

// The server (yours): read request.columns / filters / sort / scope,
// query the full ledger, write the .xlsx / .pdf / .csv, send it back.`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full";
          box.dataset.testid = "server-ledger";
          box.append(ServerLedger());
          return box;
        },
      },
      {
        title: "28. Toolbar buttons in the pager row",
        codeTitle: 'toolbar-placement="pagination"',
        codeDescription:
          "A table whose toolbar would be one button need not spend a row on it: the Export menu moves into the pager row, beside the page buttons. The search box, when there is one, stays above the table. Without a pager it stays on top.",
        code: `<zen-data-table enable-sorting enable-pagination toolbar-placement="pagination"></zen-data-table>
<script>
  el.columns = columns; el.data = people;
  el.onExport = (format, request) => fetch(…);
</script>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full";
          box.dataset.testid = "pager-toolbar";
          const el = table(MEDIUM, { "enable-sorting": "", "enable-pagination": "", "toolbar-placement": "pagination" }) as HTMLElement & {
            onExport?: (format: ExportFormat, request: ExportRequest) => Promise<Blob>;
          };
          el.onExport = (_format: ExportFormat, request: ExportRequest) =>
            // A stand-in for your endpoint: the visible columns, as CSV.
            Promise.resolve(new Blob([request.columns.map((c) => c.header).join(",") + "\n"], { type: "text/csv" }));
          box.append(el);
          return box;
        },
      },
      {
        title: "29. Manage columns from the keyboard",
        codeTitle: "enable-column-visibility, -ordering, -resizing, persist-key",
        codeDescription:
          "Open Columns (Enter works): arrow to a column and press Alt+↑ or Alt+↓ to move it, Space to hide it; Reset columns restores order, widths, visibility and pinning. Drag a header sideways to move it. Tab to a header's right edge and use the arrow keys to resize it (Shift for bigger steps), or drag the edge. The layout is remembered (persist-key) until you reset it.",
        code: `<zen-data-table enable-sorting enable-column-visibility enable-column-ordering
  enable-column-resizing persist-key="demo-manage-columns"></zen-data-table>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full";
          box.dataset.testid = "manage-columns";
          const t = el("zen-data-table", {
            "enable-sorting": "",
            "enable-column-visibility": "",
            "enable-column-ordering": "",
            "enable-column-resizing": "",
            "persist-key": "demo-manage-columns",
          });
          (t as unknown as { columns: DataTableColumn<Person>[] }).columns = MANAGE_COLUMNS;
          (t as unknown as { data: Person[] }).data = SMALL;
          box.append(t);
          return box;
        },
      },
      {
        title: "30. Pinned columns",
        codeTitle: "enable-column-pinning + initialColumnPinning",
        codeDescription:
          "Scroll sideways: Name stays on the left, Salary on the right. Change it from Columns: each column has its own submenu (show it; not pinned, left or right), all of it reachable from the keyboard.",
        code: `<zen-data-table enable-column-visibility enable-column-pinning enable-column-resizing></zen-data-table>
<script>el.initialColumnPinning = { left: ["name"], right: ["salary"] };</script>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full";
          box.dataset.testid = "pinned-columns";
          const t = el("zen-data-table", {
            "enable-column-visibility": "",
            "enable-column-pinning": "",
            "enable-column-resizing": "",
            "enable-row-selection": "",
            "sticky-header": "",
            "max-body-height": "320",
          });
          Object.assign(t, { columns: WIDE_COLUMNS, data: MEDIUM, initialColumnPinning: { left: ["name"], right: ["salary"] } });
          box.append(t);
          return box;
        },
      },
      {
        title: "31. Per-column filters",
        codeTitle: "enable-per-column-filters + meta.filterVariant",
        codeDescription:
          "A filter row under the header: text with an operator (contains, equals, starts, ends), a select, a number with an operator, a range, and yes / no. Active filters show as chips above the table; remove one, or Clear all.",
        code: `<zen-data-table enable-per-column-filters enable-column-filters enable-sorting enable-pagination></zen-data-table>
<script>el.columns = [ …, { accessorKey: "salary", header: "Salary", meta: { filterVariant: "numberRange" } } ];</script>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full";
          box.dataset.testid = "column-filters";
          const t = el("zen-data-table", { "enable-per-column-filters": "", "enable-column-filters": "", "enable-sorting": "", "enable-pagination": "" });
          Object.assign(t, { columns: FILTER_COLUMNS, data: MEDIUM });
          box.append(t);
          return box;
        },
      },
      {
        title: "32. Filtering and sorting on the server",
        codeTitle: "manual-filtering + manual-sorting, enable-filter-operators=\"false\"",
        codeDescription:
          "The table takes data as already filtered and sorted, and reports each change for you to re-fetch. Operators are off: a server that only does contains / equals must not be offered starts-with. Below: what your endpoint would receive.",
        code: `<zen-data-table enable-sorting enable-per-column-filters enable-filter-operators="false"
  manual-filtering manual-sorting></zen-data-table>
<script>
  el.addEventListener("zen-column-filters-change", (e) => refetch({ filters: e.detail }));
  el.addEventListener("zen-sorting-change", (e) => refetch({ sorting: e.detail }));
</script>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full zen-space-y-2";
          box.dataset.testid = "server-filters";
          const said = document.createElement("pre");
          said.className = "zen-m-0 zen-rounded-zen-md zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-xs";
          said.dataset.testid = "server-request";
          let filters: { id: string; value: unknown }[] = [];
          let sorting: { id: string; desc: boolean }[] = [];
          const t = el("zen-data-table", {
            "enable-sorting": "",
            "enable-per-column-filters": "",
            "enable-filter-operators": "false",
            "manual-filtering": "",
            "manual-sorting": "",
          }) as HTMLElement & { data: Person[] };
          const refetch = () => {
            said.textContent = JSON.stringify({ filters, sorting });
            t.data = serverQuery(filters, sorting);
          };
          t.addEventListener("zen-column-filters-change", (e) => {
            filters = (e as CustomEvent).detail;
            refetch();
          });
          t.addEventListener("zen-sorting-change", (e) => {
            sorting = (e as CustomEvent).detail;
            refetch();
          });
          Object.assign(t, { columns: SERVER_COLUMNS, data: serverQuery(filters, sorting) });
          said.textContent = JSON.stringify({ filters, sorting });
          box.append(t, said);
          return box;
        },
      },
      {
        title: "33. Expandable rows",
        codeTitle: "renderSubRow (+ expanded / zen-expanded-change)",
        codeDescription:
          "A chevron column toggles a detail row under each row. It works in a paged table and inside row virtualization, where an open row and its detail scroll as one.",
        code: `<zen-data-table enable-pagination></zen-data-table>
<script>el.renderSubRow = ({ row }) => personDetail(row);</script>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full zen-space-y-4";
          box.dataset.testid = "expandable";
          const paged = el("zen-data-table", { "enable-pagination": "" });
          Object.assign(paged, { columns, data: MEDIUM, getRowId: (p: Person) => p.id, renderSubRow: ({ row }: { row: Person }) => personDetail(row) });
          const pw = document.createElement("div");
          pw.dataset.testid = "expandable-paged";
          pw.append(paged);
          const virt = el("zen-data-table", { "enable-row-virtualization": "", "max-body-height": "320" });
          Object.assign(virt, { columns, data: LARGE, getRowId: (p: Person) => p.id, renderSubRow: ({ row }: { row: Person }) => personDetail(row) });
          const vw = document.createElement("div");
          vw.dataset.testid = "expandable-virtual";
          vw.append(virt);
          box.append(pw, vw);
          return box;
        },
      },
      {
        title: "34. Row grouping",
        codeTitle: "enable-grouping + initialGrouping, subtotals from meta.aggregate",
        codeDescription:
          'Rows that share the grouped column\'s value nest under a "value (N)" row that expands and collapses. Columns with meta.aggregate show the group\'s subtotal there. The Group by menu adds and removes columns; grouping by two nests them.',
        code: `<zen-data-table enable-grouping enable-sorting enable-pagination></zen-data-table>
<script>el.initialGrouping = ["role"];</script>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full";
          box.dataset.testid = "grouping";
          const t = el("zen-data-table", { "enable-grouping": "", "enable-sorting": "", "enable-pagination": "" });
          Object.assign(t, { columns: GROUP_COLUMNS, data: MEDIUM, initialGrouping: ["role"] });
          box.append(t);
          return box;
        },
      },
      {
        title: "35. Export and bulk actions",
        codeTitle: "enable-export + export-only-selected, renderBulkActions",
        codeDescription:
          "Select rows: a bar shows how many, offers to select every matching row when a whole page is selected, and holds your actions. Export downloads the selected rows (all rows when none is selected) as CSV or JSON.",
        code: `<zen-data-table enable-row-selection enable-pagination enable-export export-only-selected></zen-data-table>
<script>el.renderBulkActions = ({ rows, clear }) => [archiveButton(rows, clear)];</script>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full zen-space-y-2";
          box.dataset.testid = "bulk";
          const said = document.createElement("p");
          said.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
          said.dataset.testid = "bulk-said";
          said.textContent = "Nothing done yet.";
          const t = el("zen-data-table", { "enable-row-selection": "", "enable-pagination": "", "enable-export": "", "export-only-selected": "", "export-filename": "people" });
          Object.assign(t, {
            columns,
            data: MEDIUM,
            getRowId: (p: Person) => p.id,
            renderBulkActions: ({ rows, ids, clear }: { rows: Person[]; ids: string[]; clear: () => void }) => {
              const b = document.createElement("zen-button");
              b.setAttribute("size", "sm");
              b.setAttribute("variant", "outline");
              b.textContent = "Archive";
              b.addEventListener("click", () => {
                said.textContent = `Archived ${rows.length}: ${ids.join(", ")}`;
                clear();
              });
              return [b];
            },
          });
          box.append(t, said);
          return box;
        },
      },
    ],
  });
}

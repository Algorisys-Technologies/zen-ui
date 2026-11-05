import { DataTable, type DataTableColumn, type SortingState } from "./data-table/data-table";
import type { CellEditPayload } from "./data-table/edit-cell";
import type { ExportFormat, ExportRequest } from "@algorisys/zen-ui-core/export-request";
import { Badge } from "./badge/badge";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

/**
 * DataTableDemo — mirrors React's NewDataTableDemo for the features the vanilla
 * binding ships: header variants, sorting, pagination, global filter, row
 * selection, keyboard rows, virtualization, server-driven (manual) pagination,
 * column separators, multi-sort, sticky header, per-row styling, inline
 * editing, totals and server export.
 *
 * React's TanStack/Radix-only sections (column visibility menu, per-column
 * filters, grouping, pinning, resizing, drag reorder, client export,
 * expandable rows) are not part of this binding and are omitted.
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

/* -------------------------- columns -------------------------------- */
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
    cell: ({ row }) =>
      Badge({ variant: "soft", color: statusColor(row.status), children: row.status }),
  },
  { accessorKey: "lastSeen", header: "Last seen" },
];

/* -------------------------- section 6b: row virtualization -------- */
/* React's grouped columns, without the group aggregates (this binding does
 * not group rows). */
const virtColumns: DataTableColumn<Person>[] = [
  { accessorKey: "role", header: "Role" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "salary",
    header: "Salary (₹)",
    cell: ({ row }) => row.salary.toLocaleString("en-IN"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => Badge({ variant: "soft", color: statusColor(row.status), children: row.status }),
  },
];

function RowVirtDemo(): HTMLElement {
  const opened = document.createElement("span");
  opened.dataset.testid = "virt-activated";
  opened.textContent = "nothing yet";
  // fillHeight: the table fills this frame, as a list that is a page's main pane.
  const frame = document.createElement("div");
  frame.className = "zen-flex zen-h-[440px] zen-flex-col";
  frame.append(
    DataTable<Person>({
      data: HUGE,
      columns: virtColumns,
      getRowId: (p) => p.id,
      enableRowVirtualization: true,
      enableSorting: true,
      enableRowSelection: true,
      enableKeyboardNavigation: true,
      rowLabel: (row) => row.name,
      onRowActivate: (row) => (opened.textContent = row.name),
      fillHeight: true,
    }).el,
  );
  const note = document.createElement("p");
  note.className = "zen-text-sm zen-text-zen-muted-fg zen-mt-2";
  note.setAttribute("aria-live", "polite");
  note.append("Opened: ", opened);
  const wrap = document.createElement("div");
  wrap.append(frame, note);
  return wrap;
}

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

/** Section 6c's grid: the caller owns the lines and applies each edit, or a block of them. */
function CellNavDemo(): HTMLElement {
  let lines = makeLines(2000);
  const said = document.createElement("span");
  said.dataset.testid = "cells-edited";
  said.textContent = "No changes yet.";
  const apply = (edits: CellEditPayload[]) => {
    const byRow = new Map<string, Record<string, unknown>>();
    for (const e of edits) byRow.set(e.rowId, { ...byRow.get(e.rowId), [e.columnId]: e.value });
    lines = lines.map((l) => (byRow.has(l.id) ? { ...l, ...byRow.get(l.id) } : l));
    table.update({ data: lines });
    said.textContent = `${edits.length} cell${edits.length === 1 ? "" : "s"} changed`;
  };
  const table = DataTable<Line>({
    data: lines,
    columns: lineColumns,
    getRowId: (l) => l.id,
    enableCellNavigation: true,
    enableRowVirtualization: true,
    onCellEdit: (edit) => apply([edit]),
    onCellsEdit: apply,
    fillHeight: true,
  });
  const frame = document.createElement("div");
  frame.className = "zen-flex zen-h-[420px] zen-flex-col";
  frame.append(table.el);
  const note = document.createElement("p");
  note.className = "zen-text-sm zen-text-zen-muted-fg zen-mt-2";
  note.setAttribute("aria-live", "polite");
  note.append(said);
  const wrap = document.createElement("div");
  wrap.append(frame, note);
  return wrap;
}

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
  const table = DataTable<Entry>({
    data: pageRows(),
    columns: entryColumns,
    getRowId: (e) => e.id,
    enableSorting: true,
    sorting,
    onSortingChange: (next) => {
      sorting = next;
      requery();
      refresh();
    },
    enableColumnFilters: true,
    globalFilter: search,
    onGlobalFilterChange: (v) => {
      search = v;
      requery();
      refresh();
    },
    enableRowSelection: true,
    rowSelection: selection,
    onRowSelectionChange: (ids) => {
      selection = ids;
      refresh();
    },
    enablePagination: true,
    pageSize,
    manualPagination: manual(),
    exportFilename: "ledger",
    exportTitle: "General ledger",
    exportContext: LEDGER_CONTEXT,
    onExport: serve,
  });
  function refresh(): void {
    table.update({ data: pageRows(), sorting, globalFilter: search, rowSelection: selection, manualPagination: manual() });
    paintCounts();
  }
  wrap.append(counts, table.el, failLabel);
  return wrap;
}

/* -------------------------- section 19: inline editing ------------ */
const editColumns: DataTableColumn<Person>[] = [
  { accessorKey: "name", header: "Name", meta: { editable: true } },
  { accessorKey: "email", header: "Email", meta: { editable: true } },
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
      typeof row.salary === "number" ? row.salary.toLocaleString("en-IN") : String(row.salary ?? ""),
    meta: { editable: true, editVariant: "number" },
  },
  { accessorKey: "lastSeen", header: "Last seen" },
];

/** Section 19's table: the caller owns the rows and applies each commit. */
function InlineEditDemo(): HTMLElement {
  let rows = makePeople(8);
  const table = DataTable<Person>({
    data: rows,
    columns: editColumns,
    getRowId: (row) => row.id,
    onCellEdit: ({ rowId, columnId, value }) => {
      rows = rows.map((r) =>
        r.id === rowId
          ? { ...r, [columnId]: columnId === "salary" ? Number(value ?? 0) : value }
          : r,
      );
      table.update({ data: rows });
    },
  });
  return table.el;
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
        code: `DataTable({ data: people, columns });                              // plain
DataTable({ data: people, columns, headerVariant: "underline" });
DataTable({ data: people, columns, headerVariant: "branded" });`,
        render: () => {
          const stack = document.createElement("div");
          stack.style.display = "flex";
          stack.style.flexDirection = "column";
          stack.style.gap = "24px";
          stack.append(
            labeled("plain (default)", DataTable({ data: SMALL, columns }).el),
            labeled("underline", DataTable({ data: SMALL, columns, headerVariant: "underline" }).el),
            labeled("branded", DataTable({ data: SMALL, columns, headerVariant: "branded" }).el),
          );
          return stack;
        },
      },
      {
        title: "1. Minimal — no toggles",
        codeTitle: "Just data + columns",
        code: `DataTable({ data: people, columns });`,
        render: () => DataTable({ data: SMALL, columns }).el,
      },
      {
        title: "2. Sorting (per-column toggle in the header)",
        codeTitle: "enableSorting",
        codeDescription: "Click a column header to cycle asc → desc → unsorted.",
        code: `DataTable({ data: people, columns, enableSorting: true });`,
        render: () => DataTable({ data: SMALL, columns, enableSorting: true }).el,
      },
      {
        title: "3. Pagination (client-side)",
        codeTitle: "enablePagination with page-size selector",
        code: `DataTable({ data: medium, columns, enablePagination: true, pageSize: 10 });`,
        render: () =>
          DataTable({ data: MEDIUM, columns, enablePagination: true, pageSize: 10 }).el,
      },
      {
        title: "4. Global filter",
        codeTitle: "enableColumnFilters shows a search box in the toolbar",
        codeDescription:
          "The toolbar renders a search input; rows whose visible values contain the query are kept. (React additionally ships a Columns visibility menu, which this binding does not.)",
        code: `DataTable({
  data: medium,
  columns,
  enableColumnFilters: true,
  enablePagination: true,
  globalFilterPlaceholder: "Search people…",
});`,
        render: () =>
          DataTable({
            data: MEDIUM,
            columns,
            enableColumnFilters: true,
            enablePagination: true,
            globalFilterPlaceholder: "Search people…",
          }).el,
      },
      {
        title: "5. Row selection",
        codeTitle: "enableRowSelection prepends a select column",
        codeDescription: "Header checkbox supports tri-state (none / some / all).",
        code: `DataTable({ data: small, columns, enableRowSelection: true, enablePagination: true });`,
        render: () =>
          DataTable({
            data: SMALL,
            columns,
            enableRowSelection: true,
            enablePagination: true,
          }).el,
      },
      {
        title: "5b. Keyboard rows",
        codeTitle: "enableKeyboardNavigation + onRowActivate",
        codeDescription:
          "Tab into the table once, then ↑/↓, Home/End and PageUp/PageDown move between rows. Enter opens the row (Ctrl+Enter reports the modifier); Space selects it and Ctrl+A selects the page.",
        code: `DataTable({
  data: small,
  columns,
  enableRowSelection: true,
  enableKeyboardNavigation: true,
  onRowActivate: (row, e) => open(row, { newTab: e.ctrlKey || e.metaKey }),
  rowLabel: (row) => row.name,
});`,
        render: () => {
          const opened = document.createElement("span");
          opened.dataset.testid = "kb-activated";
          opened.textContent = "nothing yet";
          const note = document.createElement("p");
          note.className = "zen-text-sm zen-text-zen-muted-fg zen-mt-2";
          note.setAttribute("aria-live", "polite");
          note.append("Opened: ", opened);
          const table = DataTable({
            data: SMALL,
            columns,
            enableRowSelection: true,
            enableKeyboardNavigation: true,
            onRowActivate: (row, e) => {
              opened.textContent = `${row.name}${e.ctrlKey || e.metaKey ? " (Ctrl+Enter)" : ""}`;
            },
            rowLabel: (row) => row.name,
          });
          const wrap = document.createElement("div");
          wrap.append(table.el, note);
          return wrap;
        },
      },
      {
        title: "6. Virtualized — 2 000 rows, no pagination",
        codeTitle: "enableVirtualization renders only the visible window",
        codeDescription: "Scroll the table body. The header stays in view above the viewport.",
        code: `DataTable({
  data: largeDataset,   // 2 000 rows
  columns,
  enableSorting: true,
  enableVirtualization: true,
  maxBodyHeight: 400,
});`,
        render: () =>
          DataTable({
            data: LARGE,
            columns,
            enableSorting: true,
            enableVirtualization: true,
            maxBodyHeight: 400,
          }).el,
      },
      {
        title: "6b. Row virtualization — 10 000 rows, every feature on",
        codeTitle: "enableRowVirtualization keeps sorting, selection and the keyboard",
        codeDescription:
          "Only the rows in view are rendered, inside the regular table. Sort a column, select rows, or click a row and move with ↑/↓, PageUp/PageDown and Home/End: the focused row is scrolled into view and stays mounted while you scroll away. (React's version of this table also groups and expands rows, which this binding does not do yet.)",
        code: `DataTable({
  data: tenThousandPeople,
  columns,
  getRowId: (p) => p.id,
  enableRowVirtualization: true,
  enableSorting: true,
  enableRowSelection: true,
  enableKeyboardNavigation: true,
  onRowActivate: (row) => open(row),
  fillHeight: true, // inside a frame with a height; or maxBodyHeight: 420
});`,
        render: () => RowVirtDemo(),
      },
      {
        title: "6c. Cell navigation — work in it like a spreadsheet",
        codeTitle: "enableCellNavigation: cell by cell, ranges, copy and paste",
        codeDescription:
          "Click a cell, then move with the arrows, PageUp/PageDown, Home/End and Ctrl+Home/End. Enter or F2 edits, or just type; Enter in the editor moves down, Tab across, Esc goes back. Shift+arrows, Shift+click or a drag selects a range. Copy it into a spreadsheet, or paste a block from one; Delete clears. A cell takes only what its editor could produce: Amount is computed, so paste and Delete leave it alone, and UOM is a select with no empty option, so Delete leaves it as it is and a paste must match one of its options.",
        code: `DataTable({
  data: lines,
  columns, // meta: { editable: true, editVariant: "number" | "select" }
  getRowId: (l) => l.id,
  enableCellNavigation: true,
  enableRowVirtualization: true,
  onCellEdit: (edit) => apply([edit]),
  onCellsEdit: (edits) => apply(edits), // a paste, or Delete over a range
  fillHeight: true,
});`,
        render: () => CellNavDemo(),
      },
      {
        title: "6d. Context menu on rows",
        codeTitle: "contextMenu: a right-click menu for the row, or the selected rows",
        codeDescription:
          "Right-click a row, or focus one (click it, then use the arrows) and press the menu key or Shift+F10. The row becomes the focused one and the menu is for it; select a few rows first and a right-click on one of them acts on all of them. The header keeps the browser's own menu.",
        code: `DataTable({
  data: people,
  columns,
  getRowId: (p) => p.id,
  enableRowSelection: true,
  enableKeyboardNavigation: true,
  contextMenu: ({ row, selection }) => [
    { type: "label", label: selection.length > 1 ? \`\${selection.length} rows\` : row.name },
    { label: "Open in new tab", onSelect: () => openInNewTab(row) },
    { label: "Copy name", onSelect: () => copy(selection) },
    { type: "separator" },
    { label: "Delete…", variant: "destructive", onSelect: () => remove(selection) },
  ],
  fillHeight: true,
});`,
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
            DataTable({
              data: MENU_PEOPLE,
              columns,
              getRowId: (p) => p.id,
              enableRowSelection: true,
              enableKeyboardNavigation: true,
              rowLabel: (row) => row.name,
              contextMenu: ({ row, selection }) => [
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
              fillHeight: true,
            }).el,
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
        code: `let page = 0;
const table = DataTable({
  data: sliceFor(page),
  columns,
  manualPagination: {
    pageIndex: page,
    pageCount: serverPageCount,
    pageSize: 10,
    onPageChange: (next) => {
      page = next;
      table.update({ data: sliceFor(page), manualPagination: { ...state, pageIndex: page } });
    },
  },
});`,
        render: () => {
          const serverPageSize = 10;
          const serverPageCount = Math.ceil(LARGE.length / serverPageSize);
          let serverPage = 0;
          const sliceFor = (p: number) =>
            LARGE.slice(p * serverPageSize, (p + 1) * serverPageSize);

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

          // goTo() below closes over `table` before it is assigned, so this must be
          // `let` even though it is written once — a forward reference, not a const.
          // eslint-disable-next-line prefer-const
          let table: ReturnType<typeof DataTable<Person>>;
          const goTo = (next: number) => {
            serverPage = next;
            table.update({
              data: sliceFor(serverPage),
              manualPagination: {
                pageIndex: serverPage,
                pageCount: serverPageCount,
                pageSize: serverPageSize,
                onPageChange: goTo,
              },
            });
            setLabel();
          };

          table = DataTable({
            data: sliceFor(serverPage),
            columns,
            manualPagination: {
              pageIndex: serverPage,
              pageCount: serverPageCount,
              pageSize: serverPageSize,
              onPageChange: goTo,
            },
          });

          const reset = Button({
            size: "sm",
            variant: "outline",
            children: "Reset to page 1",
            onClick: () => goTo(0),
          });
          setLabel();
          controls.append(reset.el, pageLabel);
          wrap.append(table.el, controls);
          return wrap;
        },
      },
      {
        title: "8. Column separators (Zen theme opt-in)",
        codeTitle: "enableColumnSeparators draws 1-px vertical dividers",
        codeDescription:
          "Per Zen theme table spec — opt-in. Renders a right border on every cell except the last.",
        code: `DataTable({ data: people, columns, enableColumnSeparators: true });`,
        render: () =>
          DataTable({ data: SMALL, columns, enableColumnSeparators: true }).el,
      },
      {
        title: "9. Row reorder (drag handle)",
        codeTitle: "enableRowOrdering + onRowOrderChange",
        codeDescription:
          "Grip-handle column appears as the leading column. Drag a row up or down — the callback fires with the new ID order; caller re-arranges the source data. Esc cancels a drag. Not compatible with enableVirtualization (mutually exclusive); with enableRowVirtualization the rows drag to anywhere in the table, which scrolls near its edges.",
        code: `let data = initial;

const table = DataTable({
  data,
  columns,
  getRowId: (row) => row.id,   // stable identity across reorders
  enableRowOrdering: true,
  onRowOrderChange: (orderedIds) => {
    const byId = new Map(data.map((d) => [d.id, d]));
    data = orderedIds.map((id) => byId.get(id)!);
    table.update({ data });
  },
});`,
        render: () => {
          let data = makePeople(6);
          const table = DataTable<Person>({
            data,
            columns,
            getRowId: (row) => row.id,
            enableRowOrdering: true,
            onRowOrderChange: (orderedIds) => {
              const byId = new Map(data.map((d) => [d.id, d]));
              data = orderedIds.map((id) => byId.get(id)).filter((d): d is Person => !!d);
              table.update({ data });
            },
          });
          return table.el;
        },
      },
      {
        title: "9. Multi-sort (Shift-click a second header)",
        codeTitle: "enableSorting + enableMultiSort",
        codeDescription:
          "Click one header to sort, then Shift-click another to add it as a secondary sort. A small priority badge (1, 2, …) appears next to each sorted header label.",
        code: `DataTable({
  data: medium,
  columns,
  enableSorting: true,
  enableMultiSort: true,
  enablePagination: true,
});`,
        render: () =>
          DataTable({
            data: MEDIUM,
            columns,
            enableSorting: true,
            enableMultiSort: true,
            enablePagination: true,
          }).el,
      },
      {
        title: "10. Sticky header",
        codeTitle: "stickyHeader pins the header while the body scrolls",
        codeDescription:
          "Body is constrained to maxBodyHeight so the sticky header has a real scroll context. In virtualized mode the header is already fixed and the prop is a no-op.",
        code: `DataTable({
  data: medium,
  columns,
  enableSorting: true,
  stickyHeader: true,
  maxBodyHeight: 280,
});`,
        render: () =>
          DataTable({
            data: MEDIUM,
            columns,
            enableSorting: true,
            stickyHeader: true,
            maxBodyHeight: 280,
          }).el,
      },
      {
        title: "11. rowClassName — per-row styling",
        codeTitle: "Tint rows based on data — e.g. suspended users get a red wash",
        codeDescription:
          "The hook is called once per rendered body row. The returned string is merged after the built-in classes, so it composes with hover / selected styling instead of replacing it.",
        code: `DataTable({
  data: small,
  columns,
  rowClassName: (row) =>
    row.status === "suspended" ? "zen-bg-zen-error-soft/40"
    : row.status === "invited" ? "zen-bg-zen-info-soft/30"
    : undefined,
});`,
        render: () =>
          DataTable({
            data: SMALL,
            columns,
            rowClassName: (row) =>
              row.status === "suspended"
                ? "zen-bg-zen-error-soft/40"
                : row.status === "invited"
                  ? "zen-bg-zen-info-soft/30"
                  : undefined,
          }).el,
      },
      {
        title: "19. Inline cell editing",
        codeTitle: "meta.editable opts a column in; onCellEdit gets the commit",
        codeDescription:
          "Double-click (or focus + Enter / Space) any editable cell. Text columns get an Input, number columns get a NumberField (with ± steppers), select columns open a list of their options. Enter or blur commits, Esc cancels. The caller owns the data array — onCellEdit hands you the new value and you decide how to apply it.",
        code: `let rows = makePeople(8);

const columns: DataTableColumn<Person>[] = [
  { accessorKey: "name",   header: "Name",   meta: { editable: true } },
  { accessorKey: "email",  header: "Email",  meta: { editable: true } },
  { accessorKey: "role",   header: "Role",
    meta: { editable: true, editVariant: "select",
            editOptions: ROLES.map((r) => ({ label: r, value: r })) } },
  { accessorKey: "salary", header: "Salary",
    meta: { editable: true, editVariant: "number" } },
];

const table = DataTable({
  data: rows,
  columns,
  getRowId: (r) => r.id,
  onCellEdit: ({ rowId, columnId, value }) => {
    rows = rows.map((r) => (r.id === rowId ? { ...r, [columnId]: value } : r));
    table.update({ data: rows });
  },
});`,
        render: () => InlineEditDemo(),
      },
      {
        title: "26. Totals",
        codeTitle: "meta.aggregate: a total that computes itself, exact in decimal",
        codeDescription:
          'Sum, count, avg, min, max or your own function, per column. The footer totals every row the filters let through (across pages; totalsOver: "page" for this page only) and stays in view as the rows scroll. Search for a customer and watch the totals follow.',
        code: `const columns: DataTableColumn<Line>[] = [
  { accessorKey: "item", header: "Item" },                       // "Total" goes here
  { accessorKey: "qty", header: "Qty", meta: { aggregate: "sum" } },
  { accessorKey: "rate", header: "Rate", meta: { aggregate: "avg" } },
  { accessorKey: "amount", header: "Amount",
    meta: { aggregate: "sum", formatTotal: (v) => \`₹\${inr.format(v)}\` } },
  { accessorKey: "due", header: "Latest due", meta: { aggregate: "max" } },
];

DataTable({ data: lines, columns, fillHeight: true, enableColumnFilters: true });`,
        render: () => {
          const frame = document.createElement("div");
          frame.className = "zen-flex zen-h-80 zen-flex-col";
          frame.dataset.testid = "totals-table";
          frame.append(
            DataTable({ data: LINES, columns: totalColumns, fillHeight: true, enableColumnFilters: true }).el,
          );
          return frame;
        },
      },
      {
        title: "27. Export on the server",
        codeTitle: "onExport: the browser describes, the server builds",
        codeDescription:
          "For data too large for the browser. Export hands your server an ExportRequest: the columns (header, width, format, total), search, sort, locale, and all matching rows or the selected ids (even on pages never loaded). Your endpoint queries the full data and returns the file. Try a search, a sort, or selecting rows on two pages, then Export.",
        code: `DataTable({
  data: page.rows, manualPagination: { … }, sorting, globalFilter, // the server's page
  getRowId: (e) => e.id, enableRowSelection: true,
  exportFilename: "ledger", exportTitle: "General ledger",
  onExport: (format, request) =>
    fetch("/api/method/myapp.export_ledger", {
      method: "POST", body: JSON.stringify(request),
    }).then((r) => (r.ok ? r.blob() : Promise.reject(new Error(r.statusText)))),
});

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
        codeTitle: 'toolbarPlacement: "pagination"',
        codeDescription:
          "A table whose toolbar would be one button need not spend a row on it: the Export menu moves into the pager row, beside the page buttons. The search box, when there is one, stays above the table. Without a pager it stays on top.",
        code: `DataTable({ data: people, columns, enableSorting: true, enablePagination: true,
  onExport: (format, request) => fetch(…), toolbarPlacement: "pagination" })`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full";
          box.dataset.testid = "pager-toolbar";
          box.append(
            DataTable({
              data: MEDIUM,
              columns,
              enableSorting: true,
              enablePagination: true,
              toolbarPlacement: "pagination",
              onExport: (_format: ExportFormat, request: ExportRequest) =>
            // A stand-in for your endpoint: the visible columns, as CSV.
            Promise.resolve(new Blob([request.columns.map((c) => c.header).join(",") + "\n"], { type: "text/csv" })),
            }).el,
          );
          return box;
        },
      },
      {
        title: "29. Manage columns from the keyboard",
        codeTitle: "enableColumnVisibility, enableColumnOrdering, enableColumnResizing, persistKey",
        codeDescription:
          "Open Columns (Enter works): arrow to a column and press Alt+↑ or Alt+↓ to move it, Space to hide it; Reset columns restores order, widths, visibility and pinning. Drag a header sideways to move it. Tab to a header's right edge and use the arrow keys to resize it (Shift for bigger steps), or drag the edge. The layout is remembered (persistKey) until you reset it.",
        code: `DataTable({
  data: people, columns, enableSorting: true,
  enableColumnVisibility: true, enableColumnOrdering: true, enableColumnResizing: true,
  persistKey: "demo-manage-columns",
});`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full";
          box.dataset.testid = "manage-columns";
          box.append(
            DataTable({
              data: SMALL,
              columns: MANAGE_COLUMNS,
              enableSorting: true,
              enableColumnVisibility: true,
              enableColumnOrdering: true,
              enableColumnResizing: true,
              persistKey: "demo-manage-columns",
            }).el,
          );
          return box;
        },
      },
      {
        title: "30. Pinned columns",
        codeTitle: "enableColumnPinning + initialColumnPinning",
        codeDescription:
          "Scroll sideways: Name stays on the left, Salary on the right. Change it from Columns: each column has its own submenu (show it; not pinned, left or right), all of it reachable from the keyboard.",
        code: `DataTable({
  data: people, columns: wideColumns, enableColumnVisibility: true,
  enableColumnPinning: true, initialColumnPinning: { left: ["name"], right: ["salary"] },
  enableColumnResizing: true,
});`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full";
          box.dataset.testid = "pinned-columns";
          box.append(
            DataTable({
              data: MEDIUM,
              columns: WIDE_COLUMNS,
              enableColumnVisibility: true,
              enableColumnPinning: true,
              initialColumnPinning: { left: ["name"], right: ["salary"] },
              enableColumnResizing: true,
              enableRowSelection: true,
              maxBodyHeight: 320,
              stickyHeader: true,
            }).el,
          );
          return box;
        },
      },
      {
        title: "31. Per-column filters",
        codeTitle: "enablePerColumnFilters + meta.filterVariant",
        codeDescription:
          "A filter row under the header: text with an operator (contains, equals, starts, ends), a select, a number with an operator, a range, and yes / no. Active filters show as chips above the table; remove one, or Clear all.",
        code: `DataTable({ data: people, enablePerColumnFilters: true, enableSorting: true, enablePagination: true,
  columns: [
    { accessorKey: "name", header: "Name" },                                   // text
    { accessorKey: "role", header: "Role", meta: { filterVariant: "select", filterOptions } },
    { accessorKey: "joinedYear", header: "Joined", meta: { filterVariant: "number" } },
    { accessorKey: "salary", header: "Salary", meta: { filterVariant: "numberRange" } },
    { id: "admin", header: "Admin", accessorFn: (p) => p.role === "Admin", meta: { filterVariant: "boolean" } },
  ] })`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full";
          box.dataset.testid = "column-filters";
          box.append(
            DataTable({
              data: MEDIUM,
              columns: FILTER_COLUMNS,
              enablePerColumnFilters: true,
              enableColumnFilters: true,
              enableSorting: true,
              enablePagination: true,
            }).el,
          );
          return box;
        },
      },
      {
        title: "32. Filtering and sorting on the server",
        codeTitle: "manualFiltering + manualSorting, enableFilterOperators: false",
        codeDescription:
          "The table takes data as already filtered and sorted, and reports each change for you to re-fetch. Operators are off: a server that only does contains / equals must not be offered starts-with. Below: what your endpoint would receive.",
        code: `const table = DataTable({
  data: firstPage, columns, enableSorting: true, enablePerColumnFilters: true,
  enableFilterOperators: false, manualFiltering: true, manualSorting: true,
  onColumnFiltersChange: (f) => refetch({ filters: f }),
  onSortingChange: (s) => refetch({ sorting: s }),
});
// refetch → table.update({ data: rows })`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full zen-space-y-2";
          box.dataset.testid = "server-filters";
          const said = document.createElement("pre");
          said.className = "zen-m-0 zen-rounded-zen-md zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-xs";
          said.dataset.testid = "server-request";
          let filters: { id: string; value: unknown }[] = [];
          let sorting: { id: string; desc: boolean }[] = [];
          const refetch = () => {
            said.textContent = JSON.stringify({ filters, sorting });
            table.update({ data: serverQuery(filters, sorting) });
          };
          const table = DataTable({
            data: serverQuery(filters, sorting),
            columns: SERVER_COLUMNS,
            enableSorting: true,
            enablePerColumnFilters: true,
            enableFilterOperators: false,
            manualFiltering: true,
            manualSorting: true,
            onColumnFiltersChange: (f) => {
              filters = f;
              refetch();
            },
            onSortingChange: (s) => {
              sorting = s;
              refetch();
            },
          });
          said.textContent = JSON.stringify({ filters, sorting });
          box.append(table.el, said);
          return box;
        },
      },
    ],
  });
}

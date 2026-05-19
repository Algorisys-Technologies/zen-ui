import { createMemo, createSignal } from "solid-js";
import type { ColumnDef } from "@tanstack/solid-table";
import { DataTable } from "./data-table/data-table";
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
    const name =
      NAMES[i % NAMES.length] +
      (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : "");
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
      salary: 60_000 + ((i * 1234) % 240_000),
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
    cell: (info) => (
      <Badge variant="soft" color={statusBadgeColor(info.row.original.status)}>
        {info.row.original.status}
      </Badge>
    ),
  },
  { accessorKey: "lastSeen", header: "Last seen" },
];

const variantColumns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name", meta: { filterVariant: "text" } },
  { accessorKey: "email", header: "Email", meta: { filterVariant: "text" } },
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
    cell: (info) => (
      <Badge variant="soft" color={statusBadgeColor(info.row.original.status)}>
        {info.row.original.status}
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
    cell: (info) => info.row.original.salary.toLocaleString("en-IN"),
    meta: { filterVariant: "numberRange" },
  },
  { accessorKey: "joinedYear", header: "Joined", meta: { filterVariant: "number" } },
];

const groupedColumns: ColumnDef<Person>[] = [
  { accessorKey: "role", header: "Role" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "salary",
    header: "Salary (₹)",
    aggregationFn: "sum",
    cell: (info) => info.row.original.salary.toLocaleString("en-IN"),
    aggregatedCell: (info) => (
      <strong>Σ {(info.getValue() as number).toLocaleString("en-IN")}</strong>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => (
      <Badge variant="soft" color={statusBadgeColor(info.row.original.status)}>
        {info.row.original.status}
      </Badge>
    ),
    aggregationFn: "count",
    aggregatedCell: (info) =>
      `${info.getValue() as number} row${(info.getValue() as number) === 1 ? "" : "s"}`,
  },
];

const sizedColumns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name", size: 180 },
  { accessorKey: "email", header: "Email", size: 240 },
  { accessorKey: "phone", header: "Phone", size: 160 },
  { accessorKey: "role", header: "Role", size: 110 },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: (info) => (
      <Badge variant="soft" color={statusBadgeColor(info.row.original.status)}>
        {info.row.original.status}
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
    cell: (info) => info.row.original.salary.toLocaleString("en-IN"),
  },
  { accessorKey: "joinedYear", header: "Joined", size: 100 },
  { accessorKey: "lastSeen", header: "Last seen", size: 140 },
];

const editColumns: ColumnDef<Person>[] = [
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
    cell: (info) =>
      typeof info.row.original.salary === "number"
        ? info.row.original.salary.toLocaleString("en-IN")
        : info.row.original.salary,
    meta: { editable: true, editVariant: "number" },
  },
  { accessorKey: "lastSeen", header: "Last seen" },
];

/* -------------------------- demo ----------------------------------- */
const NewDataTableDemo = () => {
  const [serverPage, setServerPage] = createSignal(0);
  const serverPageSize = 10;
  const serverPageCount = Math.ceil(LARGE.length / serverPageSize);
  const serverSlice = createMemo(() =>
    LARGE.slice(serverPage() * serverPageSize, (serverPage() + 1) * serverPageSize),
  );

  const [orderable, setOrderable] = createSignal<Person[]>(makePeople(6));
  const handleRowOrderChange = (orderedIds: string[]) => {
    const byId = new Map(orderable().map((p) => [p.id, p]));
    setOrderable(orderedIds.map((id) => byId.get(id)).filter(Boolean) as Person[]);
  };

  const [editRows, setEditRows] = createSignal<Person[]>(makePeople(8));

  return (
    <div class="space-y-8">
      <header>
        <h1 class="text-2xl font-semibold m-0">DataTable</h1>
        <p class="text-zen-muted-fg mt-2 max-w-2xl">
          Headless data layer (<code>@tanstack/solid-table</code>) + windowing
          (<code>@tanstack/solid-virtual</code>) + DnD via{" "}
          <code>@thisbeyond/solid-dnd</code>, wrapped in the styled Table
          markup and the rest of the new primitives. Every capability is
          opt-in via a flag.
        </p>
      </header>

      <section>
        <h2 class="text-base font-semibold mb-2">0. headerVariant — brand intensity of the column header</h2>
        <CodeExample
          title='headerVariant: "plain" (default) | "underline" | "branded"'
          description="Pick how much brand color shows up in the header."
          code={`<DataTable data={people} columns={columns} />                              // plain
<DataTable data={people} columns={columns} headerVariant="underline" />
<DataTable data={people} columns={columns} headerVariant="branded" />`}
        >
          <div class="flex flex-col gap-6">
            <div>
              <h4 class="m-0 mb-1 text-sm text-zen-muted-fg">plain (default)</h4>
              <DataTable data={SMALL} columns={columns} />
            </div>
            <div>
              <h4 class="m-0 mb-1 text-sm text-zen-muted-fg">underline</h4>
              <DataTable data={SMALL} columns={columns} headerVariant="underline" />
            </div>
            <div>
              <h4 class="m-0 mb-1 text-sm text-zen-muted-fg">branded</h4>
              <DataTable data={SMALL} columns={columns} headerVariant="branded" />
            </div>
          </div>
        </CodeExample>
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">1. Minimal — no toggles</h2>
        <CodeExample
          title="Just data + columns"
          code={`<DataTable data={people} columns={columns} />`}
        >
          <DataTable data={SMALL} columns={columns} />
        </CodeExample>
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">2. Sorting (per-column toggle in the header)</h2>
        <CodeExample
          title="enableSorting"
          description="Click a column header to cycle asc → desc → unsorted."
          code={`<DataTable data={people} columns={columns} enableSorting />`}
        >
          <DataTable data={SMALL} columns={columns} enableSorting />
        </CodeExample>
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">3. Pagination (client-side)</h2>
        <CodeExample
          title="enablePagination with page-size selector"
          code={`<DataTable data={medium} columns={columns} enablePagination pageSize={10} />`}
        >
          <DataTable data={MEDIUM} columns={columns} enablePagination pageSize={10} />
        </CodeExample>
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">4. Global filter + column visibility</h2>
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

      <section>
        <h2 class="text-base font-semibold mb-2">5. Row selection</h2>
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

      <section>
        <h2 class="text-base font-semibold mb-2">6. Virtualized — 2 000 rows, no pagination</h2>
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

      <section>
        <h2 class="text-base font-semibold mb-2">7. Server-driven pagination (manual)</h2>
        <CodeExample
          title="manualPagination overrides client-side paging"
          description="Pass { pageIndex, pageCount, onPageChange }. The DataTable shows the slice you give it; it does not slice further."
          code={`const [page, setPage] = createSignal(0);
const slice = await fetch(\`/api/people?page=\${page()}\`);

<DataTable
  data={slice}
  columns={columns}
  manualPagination={{
    pageIndex: page(),
    pageCount: serverPageCount,
    pageSize: 10,
    onPageChange: setPage,
  }}
/>`}
        >
          <div class="flex flex-col gap-2">
            <DataTable
              data={serverSlice()}
              columns={columns}
              manualPagination={{
                pageIndex: serverPage(),
                pageCount: serverPageCount,
                pageSize: serverPageSize,
                onPageChange: setServerPage,
              }}
            />
            <div class="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setServerPage(0)}>
                Reset to page 1
              </Button>
              <span class="self-center text-xs text-zen-muted-fg">
                page {serverPage() + 1} / {serverPageCount} (simulated server)
              </span>
            </div>
          </div>
        </CodeExample>
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">8. Column separators (Zen theme opt-in)</h2>
        <CodeExample
          title="enableColumnSeparators draws 1-px vertical dividers"
          description="Per Zen theme table spec — opt-in. Renders border-r on every cell except the last."
          code={`<DataTable
  data={people}
  columns={columns}
  enableColumnSeparators
/>`}
        >
          <DataTable data={SMALL} columns={columns} enableColumnSeparators />
        </CodeExample>
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">9. Row reorder (drag handle)</h2>
        <CodeExample
          title="enableRowOrdering + onRowOrderChange"
          description="Grip-handle column appears as the leading column. Drag a row up or down — the callback fires with the new ID order. Not compatible with virtualization."
          code={`const [data, setData] = createSignal(initial);

const handleOrderChange = (orderedIds: string[]) => {
  const byId = new Map(data().map((d) => [d.id, d]));
  setData(orderedIds.map((id) => byId.get(id)!));
};

<DataTable
  data={data()}
  columns={columns}
  getRowId={(row) => row.id}
  enableRowOrdering
  onRowOrderChange={handleOrderChange}
/>`}
        >
          <DataTable
            data={orderable()}
            columns={columns}
            getRowId={(row) => row.id}
            enableRowOrdering
            onRowOrderChange={handleRowOrderChange}
          />
        </CodeExample>
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">10. Multi-sort (Shift-click a second header)</h2>
        <CodeExample
          title="enableSorting + enableMultiSort"
          description="Click one header to sort, then Shift-click another to add it as a secondary sort."
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

      <section>
        <h2 class="text-base font-semibold mb-2">11. Column resizing (drag the right edge)</h2>
        <CodeExample
          title="enableColumnResizing"
          description="A 4-px resize handle appears on the right edge of every header."
          code={`<DataTable data={small} columns={columns} enableColumnResizing />`}
        >
          <DataTable data={SMALL} columns={columns} enableColumnResizing />
        </CodeExample>
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">12. Column ordering (drag headers)</h2>
        <CodeExample
          title="enableColumnOrdering + optional onColumnOrderChange"
          description="Drag a header sideways to reorder."
          code={`<DataTable
  data={small}
  columns={columns}
  enableColumnOrdering
  onColumnOrderChange={(order) => localStorage.setItem("cols", JSON.stringify(order))}
/>`}
        >
          <DataTable data={SMALL} columns={columns} enableColumnOrdering />
        </CodeExample>
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">13. Per-column filters</h2>
        <CodeExample
          title="enablePerColumnFilters"
          description="A second header row renders an Input under every filterable column."
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

      <section>
        <h2 class="text-base font-semibold mb-2">14. CSV / JSON export</h2>
        <CodeExample
          title="enableExport (+ exportFilename, exportOnlySelected)"
          description="Adds an Export menu to the toolbar with CSV and JSON items."
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

      <section>
        <h2 class="text-base font-semibold mb-2">15. Sticky header</h2>
        <CodeExample
          title="stickyHeader pins the <thead> while the body scrolls"
          description="Body is constrained to maxBodyHeight (default 480 px) so the sticky header has a real scroll context."
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

      <section>
        <h2 class="text-base font-semibold mb-2">16. Column pinning</h2>
        <CodeExample
          title="Freeze columns to the left or right edge"
          description="enableColumnPinning + initialColumnPinning={{ left, right }}."
          code={`<DataTable
  data={medium}
  columns={sizedColumns}
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

      <section>
        <h2 class="text-base font-semibold mb-2">
          17. Virtualization + pinning + resize + reorder + filters
        </h2>
        <CodeExample
          title="The virtualized grid wires resize, reorder, and per-column filters"
          description="Drag any header sideways to reorder; drag the right edge to resize. All on 2 000 virtualized rows."
          code={`<DataTable
  data={large}
  columns={sizedColumns}
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

      <section>
        <h2 class="text-base font-semibold mb-2">18. Per-column filter operators</h2>
        <CodeExample
          title="meta.filterVariant picks the input control + filterFn"
          description="text | number | numberRange | select | boolean — each gets a tailored input."
          code={`const columns = [
  { accessorKey: "name", header: "Name", meta: { filterVariant: "text" } },
  { accessorKey: "role", header: "Role",
    meta: { filterVariant: "select", filterOptions: [...] } },
  { accessorKey: "salary", header: "Salary", meta: { filterVariant: "numberRange" } },
  { accessorKey: "joinedYear", header: "Joined", meta: { filterVariant: "number" } },
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

      <section>
        <h2 class="text-base font-semibold mb-2">19. Inline cell editing</h2>
        <CodeExample
          title="meta.editable opts a column in; onCellEdit gets the commit"
          description="Double-click (or focus + Enter / Space) any editable cell."
          code={`const [rows, setRows] = createSignal(makePeople(8));

const columns = [
  { accessorKey: "name", header: "Name", meta: { editable: true } },
  { accessorKey: "role", header: "Role",
    meta: { editable: true, editVariant: "select",
            editOptions: ROLES.map(r => ({ label: r, value: r })) } },
  { accessorKey: "salary", header: "Salary",
    meta: { editable: true, editVariant: "number" } },
];

<DataTable
  data={rows()}
  columns={columns}
  getRowId={(r) => r.id}
  onCellEdit={({ rowId, columnId, value }) =>
    setRows(prev => prev.map(r =>
      r.id === rowId ? { ...r, [columnId]: value } : r))}
/>`}
        >
          <DataTable
            data={editRows()}
            columns={editColumns}
            getRowId={(row) => row.id}
            onCellEdit={({ rowId, columnId, value }) => {
              setEditRows((prev) =>
                prev.map((r) =>
                  r.id === rowId
                    ? {
                        ...r,
                        [columnId]:
                          columnId === "salary" ? Number(value ?? 0) : (value as never),
                      }
                    : r,
                ),
              );
            }}
          />
        </CodeExample>
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">20. Bulk actions + select-all-across-pages</h2>
        <CodeExample
          title="renderBulkActions shows when ≥ 1 row is selected"
          description="Caller supplies the action buttons; DataTable supplies the count, ✕, and Select-all-N-matching link."
          code={`<DataTable
  data={medium}
  columns={columns}
  enableRowSelection
  enablePagination
  enableColumnFilters
  renderBulkActions={({ rows, clear }) => (
    <>
      <Button size="sm" color="error" onClick={() => alert(\`Delete \${rows.length}\`)}>
        Delete
      </Button>
      <Button size="sm" variant="outline" onClick={clear}>Cancel</Button>
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

      <section>
        <h2 class="text-base font-semibold mb-2">21. Expandable rows</h2>
        <CodeExample
          title="renderSubRow renders a full-width detail panel under each expanded row"
          description="Prepends a chevron toggle column. Not wired into virtualized mode in this release."
          code={`<DataTable
  data={small}
  columns={columns}
  renderSubRow={(row) => (
    <div class="px-6 py-3 text-sm">
      <strong>Email:</strong> {row.original.email}<br />
      <strong>Department:</strong> {row.original.department}
    </div>
  )}
/>`}
        >
          <DataTable
            data={SMALL}
            columns={columns}
            renderSubRow={(row) => (
              <div class="px-6 py-3 text-sm grid grid-cols-3 gap-x-6 gap-y-2 text-zen-foreground">
                <div><strong>Department:</strong> {row.original.department}</div>
                <div><strong>Location:</strong> {row.original.location}</div>
                <div><strong>Manager:</strong> {row.original.manager}</div>
                <div><strong>Phone:</strong> {row.original.phone}</div>
                <div><strong>Salary:</strong> ₹{row.original.salary.toLocaleString("en-IN")}</div>
                <div><strong>Joined:</strong> {row.original.joinedYear}</div>
              </div>
            )}
          />
        </CodeExample>
      </section>

      <section>
        <h2 class="text-base font-semibold mb-2">22. rowClassName — per-row styling</h2>
        <CodeExample
          title="Tint rows based on data — e.g. suspended users get a red wash"
          description="The hook is called once per rendered body row. Returned class merges after the built-in classes."
          code={`<DataTable
  data={small}
  columns={columns}
  rowClassName={(row) =>
    row.original.status === "suspended" ? "bg-zen-error-soft/40"
    : row.original.status === "invited"   ? "bg-zen-info-soft/30"
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

      <section>
        <h2 class="text-base font-semibold mb-2">23. Row grouping</h2>
        <CodeExample
          title="enableGrouping + initialGrouping — group by one or more columns"
          description="Rows that share a value nest under a header row; aggregations show in the header."
          code={`<DataTable
  data={medium}
  columns={groupedCols}
  enableGrouping
  enableColumnVisibility
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

      <section>
        <h2 class="text-base font-semibold mb-2">24. Everything together</h2>
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
    </div>
  );
};

export default NewDataTableDemo;

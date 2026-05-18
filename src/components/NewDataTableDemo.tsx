import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
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
};

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
  // re-arrange it. Stable IDs are critical, so we pass getRowId via the
  // table props (TanStack uses row index by default which changes after
  // a reorder).
  const [orderable, setOrderable] = useState<Person[]>(() => makePeople(6));
  const handleRowOrderChange = (orderedIds: string[]) => {
    setOrderable((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      return orderedIds.map((id) => byId.get(id)).filter(Boolean) as Person[];
    });
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
              <span style={{ alignSelf: "center", fontSize: "1.3rem", color: "var(--zen-color-muted-fg)" }}>
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
  enableRowOrdering
  onRowOrderChange={handleOrderChange}
/>`}
        >
          <DataTable
            data={orderable}
            columns={columns}
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
          description={`enableColumnPinning + initialColumnPinning={{ left, right }}. Pinned cells get a 1-px divider + soft shadow on their inner edge. Combine freely with stickyHeader so the corner cells stay locked in both directions.`}
          code={`<DataTable
  data={medium}
  columns={columns}
  enableColumnPinning
  initialColumnPinning={{ left: ["name"], right: ["lastSeen"] }}
  enableSorting
  enableColumnResizing
  stickyHeader
  maxBodyHeight={280}
/>`}
        >
          <DataTable
            data={MEDIUM}
            columns={columns}
            enableColumnPinning
            initialColumnPinning={{ left: ["name"], right: ["lastSeen"] }}
            enableSorting
            enableColumnResizing
            stickyHeader
            maxBodyHeight={280}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>17. Everything together</h2>
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

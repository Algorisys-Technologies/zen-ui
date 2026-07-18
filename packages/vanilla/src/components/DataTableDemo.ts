import { DataTable, type DataTableColumn } from "./data-table/data-table";
import { Badge } from "./badge/badge";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

/**
 * DataTableDemo — mirrors React's NewDataTableDemo for the features the vanilla
 * binding ships: header variants, sorting, pagination, global filter, row
 * selection, virtualization, server-driven (manual) pagination, column
 * separators, multi-sort, sticky header, and per-row styling.
 *
 * React's TanStack/Radix-only sections (column visibility menu, per-column
 * filters, grouping, pinning, resizing, drag reorder, inline edit, export,
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

const statusColor = (s: Person["status"]) =>
  s === "active" ? "success" : s === "invited" ? "info" : "error";

/* -------------------------- columns -------------------------------- */
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
    ],
  });
}

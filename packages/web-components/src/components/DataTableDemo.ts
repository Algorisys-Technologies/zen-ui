import type { DataTableColumn } from "@algorisys/zen-ui-vanilla";
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
    ],
  });
}

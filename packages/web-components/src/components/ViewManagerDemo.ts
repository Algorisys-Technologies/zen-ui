import { describeFilter, filterPredicate, loadFilter, newGroup } from "@algorisys/zen-ui-core/filter";
// A separate `import type`: check:parity greps for the keyword followed by the
// name and would read an inline type import as a type this binding defines.
import type { FilterField, FilterGroup } from "@algorisys/zen-ui-core/filter";
import { decodeView, withDefault } from "@algorisys/zen-ui-core/views";
import type { SavedView } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * ViewManager demo — the web-components mirror of the vanilla ViewManagerDemo
 * (itself NewViewManagerDemo.tsx section-for-section), rendered through
 * <zen-view-manager>, <zen-select> and <zen-checkbox>. The storage callbacks
 * are ASSIGNED, not listened for: an assigned callback's throw or Promise
 * reaches the element, so Save as can wait for storage and show its error.
 * Picking a view is an event (zen-select). The filter is shown in words, as
 * React's demo shows it.
 */

type Invoice = { no: string; customer: string; status: string; amount: number; due: string };
const CUSTOMERS = [
  { value: "acme", label: "Acme Traders" },
  { value: "bharat", label: "Bharat Steels" },
  { value: "coastal", label: "Coastal Agencies" },
  { value: "deccan", label: "Deccan Engineering" },
];
const INVOICES: Invoice[] = [
  { no: "SI/26/0101", customer: "acme", status: "overdue", amount: 48500, due: "2026-10-05" },
  { no: "SI/26/0102", customer: "coastal", status: "overdue", amount: 236000, due: "2026-10-12" },
  { no: "SI/26/0103", customer: "deccan", status: "overdue", amount: 91200, due: "2026-10-20" },
  { no: "SI/26/0104", customer: "bharat", status: "paid", amount: 412000, due: "2026-09-30" },
  { no: "SI/26/0105", customer: "bharat", status: "overdue", amount: 17800, due: "2026-10-28" },
  { no: "SI/26/0106", customer: "coastal", status: "draft", amount: 152000, due: "2026-11-15" },
  { no: "SI/26/0107", customer: "acme", status: "paid", amount: 9400, due: "2026-10-01" },
  { no: "SI/26/0108", customer: "deccan", status: "overdue", amount: 128900, due: "2026-11-02" },
];
const FIELDS: FilterField[] = [
  { id: "customer", label: "Customer", type: "enum", options: CUSTOMERS },
  { id: "status", label: "Status", type: "enum", options: [{ value: "draft", label: "Draft" }, { value: "overdue", label: "Overdue" }, { value: "paid", label: "Paid" }] },
  { id: "amount", label: "Amount", type: "number" },
  { id: "due", label: "Due", type: "date" },
];
const COLUMNS = [
  { id: "customer", label: "Customer" },
  { id: "status", label: "Status" },
  { id: "amount", label: "Amount" },
  { id: "due", label: "Due" },
] as const;
const SORTS = [
  { value: "due:asc", label: "Due, soonest first" },
  { value: "due:desc", label: "Due, latest first" },
  { value: "amount:desc", label: "Amount, largest first" },
  { value: "no:asc", label: "Invoice number" },
];
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/** Everything the screen needs to come back to, as one plain object. */
type ScreenState = { filter: FilterGroup; sort: string; columns: Record<string, boolean> };
const STANDARD: ScreenState = {
  filter: { kind: "group", id: "root", join: "and", children: [] },
  sort: "due:asc",
  columns: { customer: true, status: true, amount: true, due: true },
};
const STARTER: SavedView<ScreenState>[] = [
  {
    id: "overdue", name: "My overdue",
    state: { ...STANDARD, filter: { kind: "group", id: "root", join: "and", children: [{ kind: "condition", id: "c1", field: "status", op: "in", value: ["overdue"] }] } },
  },
  {
    id: "team-large", name: "Team: large unpaid", shared: true, readOnly: true,
    state: { ...STANDARD, sort: "amount:desc", columns: { ...STANDARD.columns, due: false }, filter: { kind: "group", id: "root", join: "and", children: [{ kind: "condition", id: "c1", field: "status", op: "notIn", value: ["paid"] }, { kind: "condition", id: "c2", field: "amount", op: "gt", value: 100000 }] } },
  },
];
// The demo's storage: views live in localStorage. A real app keeps them per user, on its server.
const KEY = "zenui.demo.invoice-views";
const load = (): SavedView<ScreenState>[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return Array.isArray(raw) ? raw : STARTER;
  } catch {
    return STARTER;
  }
};
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

const h = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const CODE = `<zen-view-manager standard-name="All invoices" aria-label="Invoices view"></zen-view-manager>

const vm = document.querySelector("zen-view-manager");
vm.views = views;
vm.state = screenState;
vm.standardState = STANDARD;
vm.addEventListener("zen-select", (e) => apply(e.detail));   // apply sets vm.activeId and vm.state

// Assigned, not listened for: these may return a Promise, and a dialog waits for it.
vm.onSave = (v) => api.views.update(v);
vm.onCreate = (v) => api.views.create(v).then(() => (vm.activeId = v.id));
vm.onRename = (id, name) => api.views.rename(id, name);
vm.onDelete = (id) => api.views.delete(id);
vm.onDefaultChange = (id) => api.views.setDefault(id);
vm.onShare = (v, token) => navigator.clipboard.writeText(\`\${location.origin}\${location.pathname}?view=\${token}\`);

// On load: a shared link wins, then the default view.
const shared = decodeView(new URLSearchParams(location.search).get("view"));`;

type ViewManagerElement = HTMLElement & {
  views: SavedView<ScreenState>[];
  state: ScreenState;
  standardState: ScreenState;
  activeId: string | null;
  onSave: (v: SavedView<ScreenState>) => void;
  onCreate: (v: SavedView<ScreenState>) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onDefaultChange: (id: string | null) => void;
  onShare: (v: SavedView<ScreenState>, token: string) => void;
};
type ValueElement<T> = HTMLElement & T;

function screen(): HTMLElement {
  let views: SavedView<ScreenState>[] = STARTER;
  let activeId: string | null = null;
  let state: ScreenState = clone(STANDARD);

  const wrap = h("div", "zen-flex zen-w-full zen-flex-col zen-gap-4");
  const notice = h("p", "zen-m-0 zen-rounded-zen-md zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-sm");
  notice.setAttribute("role", "status");
  notice.dataset.testid = "notice";
  const setNotice = (text: string) => {
    notice.textContent = text;
    if (text) {
      if (!notice.isConnected) vm.after(notice);
    } else notice.remove();
  };

  const filterEl = h("p", "zen-m-0 zen-text-sm");
  filterEl.dataset.testid = "filter";

  const sort = document.createElement("zen-select") as ValueElement<{ options: typeof SORTS; value: string }>;
  sort.className = "zen-w-52";
  sort.options = SORTS;
  sort.setAttribute("value", state.sort);
  sort.addEventListener("zen-value-change", (e) => {
    const next = (e as CustomEvent<string>).detail;
    if (next && next !== state.sort) setState({ ...state, sort: next });
  });
  const sortLabel = h("span", "zen-text-sm zen-text-zen-muted-fg", "Sort");
  const sortRow = h("div", "zen-flex zen-items-center zen-gap-2");
  sortRow.append(sortLabel, sort);
  // <zen-select> takes no id or aria-label for its trigger yet, and the trigger
  // exists once the element is connected (a microtask later, in this page): it
  // is named there, as React's demo names it with aria-label.
  queueMicrotask(() => sort.querySelector("[role=combobox]")?.setAttribute("aria-label", "Sort"));

  const columns = h("div", "zen-flex zen-flex-wrap zen-items-center zen-gap-3");
  columns.setAttribute("role", "group");
  columns.setAttribute("aria-label", "Columns");
  columns.append(h("span", "zen-text-sm zen-text-zen-muted-fg", "Columns"));
  const boxes: Record<string, ValueElement<{ checked: boolean }>> = {};
  for (const c of COLUMNS) {
    const label = h("label", "zen-inline-flex zen-items-center zen-gap-2");
    const box = document.createElement("zen-checkbox") as ValueElement<{ checked: boolean }>;
    box.checked = state.columns[c.id] !== false;
    box.addEventListener("zen-checked-change", (e) => {
      const on = (e as CustomEvent<boolean | "indeterminate">).detail === true;
      setState({ ...state, columns: { ...state.columns, [c.id]: on } });
    });
    boxes[c.id] = box;
    label.append(box, h("span", "zen-text-sm", c.label));
    columns.append(label);
  }
  const controls = h("div", "zen-flex zen-flex-wrap zen-items-center zen-gap-x-6 zen-gap-y-2");
  controls.append(sortRow, columns);

  const table = h("table", "zen-w-full zen-border-collapse zen-text-sm");
  table.dataset.testid = "rows";
  const thead = h("thead");
  const tbody = h("tbody");
  table.append(thead, tbody);

  const shown = (c: string) => state.columns[c] !== false;
  const paintScreen = () => {
    const span = h("span", "zen-text-zen-muted-fg", "Filter: ");
    filterEl.replaceChildren(span, describeFilter(state.filter, FIELDS) || "none");
    sort.setAttribute("value", state.sort);
    for (const c of COLUMNS) boxes[c.id].checked = shown(c.id);

    const head = h("tr", "zen-text-xs zen-text-zen-muted-fg");
    head.append(h("th", "zen-px-3 zen-py-1.5 zen-text-start zen-font-medium", "Invoice"));
    if (shown("customer")) head.append(h("th", "zen-px-3 zen-py-1.5 zen-text-start zen-font-medium", "Customer"));
    if (shown("status")) head.append(h("th", "zen-px-3 zen-py-1.5 zen-text-start zen-font-medium", "Status"));
    if (shown("amount")) head.append(h("th", "zen-px-3 zen-py-1.5 zen-text-end zen-font-medium", "Amount"));
    if (shown("due")) head.append(h("th", "zen-px-3 zen-py-1.5 zen-text-start zen-font-medium", "Due"));
    thead.replaceChildren(head);

    const [key, dir] = state.sort.split(":");
    const k = key as keyof Invoice;
    const rows = INVOICES.filter(filterPredicate(state.filter, FIELDS, (r, f) => r[f as keyof Invoice]))
      .slice()
      .sort((a, b) => (a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0) * (dir === "desc" ? -1 : 1));
    tbody.replaceChildren(
      ...rows.map((r) => {
        const tr = h("tr", "zen-border-0 zen-border-t zen-border-solid zen-border-zen-border");
        tr.append(h("td", "zen-px-3 zen-py-1.5", r.no));
        if (shown("customer")) tr.append(h("td", "zen-px-3 zen-py-1.5", CUSTOMERS.find((c) => c.value === r.customer)?.label));
        if (shown("status")) tr.append(h("td", "zen-px-3 zen-py-1.5 zen-capitalize", r.status));
        if (shown("amount")) tr.append(h("td", "zen-px-3 zen-py-1.5 zen-text-end zen-tabular-nums", inr.format(r.amount)));
        if (shown("due")) tr.append(h("td", "zen-px-3 zen-py-1.5 zen-tabular-nums", r.due));
        return tr;
      }),
    );
  };

  /** Controlled: every change to the list, the active view or the screen goes back in. */
  const refresh = () => {
    vm.views = views;
    vm.activeId = activeId;
    vm.state = state;
    paintScreen();
  };
  const setState = (next: ScreenState) => {
    state = next;
    refresh();
  };
  // Stored first: if storage refuses, the list on screen is not ahead of it,
  // and the throw reaches ViewManager, which shows it.
  const persist = (next: SavedView<ScreenState>[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    views = next;
    refresh();
  };
  const apply = (v: SavedView<ScreenState> | null) => {
    activeId = v?.id ?? null;
    // A saved filter is read against today's fields: anything that no longer exists is left out.
    const s = clone(v?.state ?? STANDARD);
    s.filter = loadFilter(s.filter, FIELDS).filter;
    setState(s);
  };

  const vm = document.createElement("zen-view-manager") as ViewManagerElement;
  vm.setAttribute("standard-name", "All invoices");
  vm.setAttribute("aria-label", "Invoices view");
  vm.standardState = STANDARD;
  vm.views = views;
  vm.state = state;
  vm.addEventListener("zen-select", (e) => apply((e as CustomEvent<SavedView<ScreenState> | null>).detail));
  vm.onSave = (v) => persist(views.map((x) => (x.id === v.id ? clone(v) : x)));
  vm.onCreate = (v) => {
    persist([...views, clone(v)]);
    activeId = v.id;
    refresh();
  };
  vm.onRename = (id, name) => persist(views.map((x) => (x.id === id ? { ...x, name } : x)));
  vm.onDelete = (id) => {
    persist(views.filter((x) => x.id !== id));
    if (activeId === id) {
      activeId = null;
      refresh();
    }
  };
  vm.onDefaultChange = (id) => persist(withDefault(views, id));
  vm.onShare = (_v, token) => {
    const url = `${location.origin}${location.pathname}?view=${token}`;
    void navigator.clipboard?.writeText(url).catch(() => {});
    setNotice(`Link copied: ${url.length > 90 ? `${url.slice(0, 90)}…` : url}`);
  };

  const reset = h(
    "button",
    "zen-self-start zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-muted-fg zen-underline",
    "Reset the demo's saved views",
  );
  reset.type = "button";
  reset.addEventListener("click", () => {
    localStorage.removeItem(KEY);
    views = STARTER;
    apply(null);
    setNotice("Demo views reset.");
  });

  wrap.append(vm, filterEl, controls, table, reset);

  // On load: a shared link (?view=…) wins; else the default view; else Standard.
  views = load();
  const shared = decodeView(new URLSearchParams(location.search).get("view"));
  if (shared) {
    const s = shared.state as Partial<ScreenState>;
    const filter = loadFilter(s?.filter ?? newGroup(), FIELDS);
    activeId = null;
    setState({
      filter: filter.filter,
      sort: SORTS.some((o) => o.value === s?.sort) ? s.sort! : STANDARD.sort,
      columns: { ...STANDARD.columns, ...(s?.columns ?? {}) },
    });
    setNotice(`Opened a shared view, “${shared.name}”. Save as to keep it.${filter.dropped.length ? ` Left out: ${filter.dropped.join("; ")}.` : ""}`);
  } else {
    apply(views.find((v) => v.isDefault) ?? null);
  }
  return wrap;
}

export default function ViewManagerDemo(): HTMLElement {
  return DemoPage({
    title: "ViewManager",
    description:
      "Named list setups a person keeps and returns to: filters, sort and columns as one object, picked beside the page title. It says when the screen has drifted from the view; storage is the app's, through callbacks (here, localStorage). A view shared by a colleague can be used and copied, not overwritten.",
    sections: [
      {
        title: "1. A list screen with saved views",
        codeTitle: "Change the filter, sort or columns, then Save, Save as, or switch views",
        codeDescription:
          "The view name is the page title. Modified appears as soon as the screen differs from the view. Save as offers a free name and can make the view the one the screen opens with. Manage views renames, deletes (in two presses) and picks the default. Copy link puts the view in the address; open it in another tab.",
        code: CODE,
        render: screen,
      },
    ],
  });
}

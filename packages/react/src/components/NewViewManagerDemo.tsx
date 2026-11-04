import { useEffect, useMemo, useRef, useState } from "react";
import { describeFilter, filterPredicate, loadFilter, newGroup } from "@algorisys/zen-ui-core/filter";
// A separate `import type`: check:parity greps for the keyword followed by the
// name and would read an inline type import as a type this binding defines.
import type { FilterField, FilterGroup } from "@algorisys/zen-ui-core/filter";
import { decodeView, withDefault } from "@algorisys/zen-ui-core/views";
import { ViewManager, type SavedView } from "./view-manager/view-manager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./form/select/select";
import { Checkbox } from "./form/checkbox/checkbox";
import { CodeExample } from "./demo-helpers";

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
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

const NewViewManagerDemo = () => {
  const [views, setViews] = useState<SavedView<ScreenState>[]>(STARTER);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [state, setState] = useState<ScreenState>(() => clone(STANDARD));
  const [notice, setNotice] = useState("");
  // The list as it is now, for callbacks that run one after another inside a
  // single action (Save as, then make it the default): each must build on the
  // last one's result, not on the list this render closed over.
  const current = useRef(views);
  // Stored first: if storage refuses, the list on screen is not ahead of it,
  // and the throw reaches ViewManager, which shows it.
  const persist = (next: SavedView<ScreenState>[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    current.current = next;
    setViews(next);
  };
  const apply = (v: SavedView<ScreenState> | null) => {
    setActiveId(v?.id ?? null);
    // A saved filter is read against today's fields: anything that no longer exists is left out.
    const s = clone(v?.state ?? STANDARD);
    s.filter = loadFilter(s.filter, FIELDS).filter;
    setState(s);
  };

  useEffect(() => {
    const stored = load();
    current.current = stored;
    setViews(stored);
    // A shared link (?view=…) wins; else the default view; else Standard.
    const shared = decodeView(new URLSearchParams(location.search).get("view"));
    if (shared) {
      const s = shared.state as Partial<ScreenState>;
      const filter = loadFilter(s?.filter ?? newGroup(), FIELDS);
      setState({ filter: filter.filter, sort: SORTS.some((o) => o.value === s?.sort) ? s.sort! : STANDARD.sort, columns: { ...STANDARD.columns, ...(s?.columns ?? {}) } });
      setActiveId(null);
      setNotice(`Opened a shared view, “${shared.name}”. Save as to keep it.${filter.dropped.length ? ` Left out: ${filter.dropped.join("; ")}.` : ""}`);
      return;
    }
    apply(stored.find((v) => v.isDefault) ?? null);
  }, []);

  const rows = useMemo(() => {
    const [key, dir] = state.sort.split(":");
    const k = key as keyof Invoice;
    return INVOICES.filter(filterPredicate(state.filter, FIELDS, (r, f) => r[f as keyof Invoice]))
      .slice()
      .sort((a, b) => (a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0) * (dir === "desc" ? -1 : 1));
  }, [state]);
  const shown = (c: string) => state.columns[c] !== false;

  return (
    <div className="demo-page">
      <h1>ViewManager</h1>
      <p className="lede">
        Named list setups a person keeps and returns to: filters, sort and columns as one object, picked
        beside the page title. It says when the screen has drifted from the view; storage is the app's,
        through callbacks (here, localStorage). A view shared by a colleague can be used and copied, not
        overwritten.
      </p>

      <section className="demo-section">
        <h2>1. A list screen with saved views</h2>
        <CodeExample
          title="Change the filter, sort or columns, then Save, Save as, or switch views"
          description="The view name is the page title. Modified appears as soon as the screen differs from the view. Save as offers a free name and can make the view the one the screen opens with. Manage views renames, deletes (in two presses) and picks the default. Copy link puts the view in the address; open it in another tab."
          code={`<ViewManager
  views={views} activeId={activeId} state={screenState} standardState={STANDARD}
  onSelect={(v) => apply(v)}
  onSave={(v) => api.views.update(v)}            // may return a Promise
  onCreate={(v) => api.views.create(v).then(() => setActiveId(v.id))}
  onRename={(id, name) => api.views.rename(id, name)}
  onDelete={(id) => api.views.delete(id)}
  onDefaultChange={(id) => api.views.setDefault(id)}
  onShare={(v, token) => navigator.clipboard.writeText(\`\${location.origin}\${location.pathname}?view=\${token}\`)}
/>

// On load: a shared link wins, then the default view.
const shared = decodeView(new URLSearchParams(location.search).get("view"));`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-4">
            <ViewManager
              views={views}
              activeId={activeId}
              state={state}
              standardState={STANDARD}
              standardName="All invoices"
              aria-label="Invoices view"
              onSelect={apply}
              onSave={(v) => persist(current.current.map((x) => (x.id === v.id ? clone(v) : x)))}
              onCreate={(v) => {
                persist([...current.current, clone(v)]);
                setActiveId(v.id);
              }}
              onRename={(id, name) => persist(current.current.map((x) => (x.id === id ? { ...x, name } : x)))}
              onDelete={(id) => {
                persist(current.current.filter((x) => x.id !== id));
                setActiveId((a) => (a === id ? null : a));
              }}
              onDefaultChange={(id) => persist(withDefault(current.current, id))}
              onShare={(_v, token) => {
                const url = `${location.origin}${location.pathname}?view=${token}`;
                void navigator.clipboard?.writeText(url).catch(() => {});
                setNotice(`Link copied: ${url.length > 90 ? `${url.slice(0, 90)}…` : url}`);
              }}
            />
            {notice && (
              <p className="zen-m-0 zen-rounded-zen-md zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-sm" role="status" data-testid="notice">{notice}</p>
            )}
            {/* The filter, in words. Solid's demo edits it with FilterBuilder here; React's
                FilterBuilder is a separate port, and the view carries the filter either way. */}
            <p className="zen-m-0 zen-text-sm" data-testid="filter">
              <span className="zen-text-zen-muted-fg">Filter: </span>
              {describeFilter(state.filter, FIELDS) || "none"}
            </p>
            <div className="zen-flex zen-flex-wrap zen-items-center zen-gap-x-6 zen-gap-y-2">
              <div className="zen-flex zen-items-center zen-gap-2">
                <span className="zen-text-sm zen-text-zen-muted-fg" id="sort-label">Sort</span>
                <Select value={state.sort} onValueChange={(sort) => sort && sort !== state.sort && setState({ ...state, sort })}>
                  <SelectTrigger aria-label="Sort" className="zen-w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORTS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="zen-flex zen-flex-wrap zen-items-center zen-gap-3" role="group" aria-label="Columns">
                <span className="zen-text-sm zen-text-zen-muted-fg">Columns</span>
                {COLUMNS.map((c) => (
                  <label key={c.id} className="zen-inline-flex zen-items-center zen-gap-2">
                    <Checkbox
                      checked={shown(c.id)}
                      onCheckedChange={(on) => setState({ ...state, columns: { ...state.columns, [c.id]: on === true } })}
                    />
                    <span className="zen-text-sm">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <table className="zen-w-full zen-border-collapse zen-text-sm" data-testid="rows">
              <thead>
                <tr className="zen-text-xs zen-text-zen-muted-fg">
                  <th className="zen-px-3 zen-py-1.5 zen-text-start zen-font-medium">Invoice</th>
                  {shown("customer") && <th className="zen-px-3 zen-py-1.5 zen-text-start zen-font-medium">Customer</th>}
                  {shown("status") && <th className="zen-px-3 zen-py-1.5 zen-text-start zen-font-medium">Status</th>}
                  {shown("amount") && <th className="zen-px-3 zen-py-1.5 zen-text-end zen-font-medium">Amount</th>}
                  {shown("due") && <th className="zen-px-3 zen-py-1.5 zen-text-start zen-font-medium">Due</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.no} className="zen-border-0 zen-border-t zen-border-solid zen-border-zen-border">
                    <td className="zen-px-3 zen-py-1.5">{r.no}</td>
                    {shown("customer") && <td className="zen-px-3 zen-py-1.5">{CUSTOMERS.find((c) => c.value === r.customer)?.label}</td>}
                    {shown("status") && <td className="zen-px-3 zen-py-1.5 zen-capitalize">{r.status}</td>}
                    {shown("amount") && <td className="zen-px-3 zen-py-1.5 zen-text-end zen-tabular-nums">{inr.format(r.amount)}</td>}
                    {shown("due") && <td className="zen-px-3 zen-py-1.5 zen-tabular-nums">{r.due}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="zen-self-start zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-muted-fg zen-underline"
              onClick={() => {
                localStorage.removeItem(KEY);
                current.current = STARTER;
                setViews(STARTER);
                apply(null);
                setNotice("Demo views reset.");
              }}
            >
              Reset the demo's saved views
            </button>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewViewManagerDemo;

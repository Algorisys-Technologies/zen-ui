import type { LookupColumn, ValueHelpResult } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * LookupField demo — the web-components port. `columns`, `rows`, `rowKey`,
 * `rowLabel`, `value`, `onSearch` and `onValueHelp` are JS properties; a pick
 * arrives as `zen-value-change` with the row (or null), and the page answers by
 * setting `value`. `input-id` puts the id on the inner input, so <zen-label
 * for> names the field.
 */

type Item = { code: string; name: string; group: string; uom: string; stock: number; rate: number };
const ITEMS: Item[] = [
  { code: "ITM-0042", name: "Hex Bolt M8 x 40", group: "Fasteners", uom: "Nos", stock: 1240, rate: 4.5 },
  { code: "ITM-0043", name: "Hex Nut M8", group: "Fasteners", uom: "Nos", stock: 3100, rate: 1.2 },
  { code: "ITM-0044", name: "Flat Washer M8", group: "Fasteners", uom: "Nos", stock: 0, rate: 0.4 },
  { code: "ITM-0051", name: "Hex Bolt M10 x 50", group: "Fasteners", uom: "Nos", stock: 860, rate: 6.8 },
  { code: "ITM-0100", name: "Carbolt Adhesive", group: "Consumables", uom: "Kg", stock: 42, rate: 310 },
  { code: "ITM-0120", name: "Cutting Oil", group: "Consumables", uom: "Ltr", stock: 75, rate: 185 },
  { code: "ITM-0200", name: "MS Sheet 2mm", group: "Raw Material", uom: "Kg", stock: 5400, rate: 68 },
  { code: "ITM-0201", name: "MS Sheet 3mm", group: "Raw Material", uom: "Kg", stock: 2100, rate: 67.5 },
  { code: "ITM-0210", name: "SS Rod 12mm", group: "Raw Material", uom: "Kg", stock: 380, rate: 240 },
  { code: "ITM-0300", name: "Bearing 6204 ZZ", group: "Spares", uom: "Nos", stock: 64, rate: 145 },
  { code: "ITM-0301", name: "Bearing 6205 ZZ", group: "Spares", uom: "Nos", stock: 18, rate: 162 },
  { code: "ITM-0310", name: "V-Belt B-48", group: "Spares", uom: "Nos", stock: 25, rate: 210 },
  { code: "ITM-0400", name: "Café Table Top", group: "Finished Goods", uom: "Nos", stock: 12, rate: 4200 },
  { code: "ITM-0401", name: "Bolted Frame Assembly", group: "Finished Goods", uom: "Nos", stock: 7, rate: 8900 },
];
const qty = new Intl.NumberFormat("en-IN");
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
const itemColumns: LookupColumn<Item>[] = [
  { key: "code", header: "Code", width: "6.5rem" },
  { key: "name", header: "Item" },
  { key: "group", header: "Group", width: "7.5rem" },
  { key: "stock", header: "In stock", align: "end", width: "5.5rem", value: (i) => `${qty.format(i.stock)} ${i.uom}`, searchable: false },
  { key: "rate", header: "Rate", align: "end", width: "6.5rem", value: (i) => inr.format(i.rate), searchable: false },
];

type Customer = { id: string; name: string; city: string; gstin: string };
const customerColumns: LookupColumn<Customer>[] = [
  { key: "id", header: "ID", width: "7rem" },
  { key: "name", header: "Customer" },
  { key: "city", header: "City", width: "6.5rem" },
  { key: "gstin", header: "GSTIN", width: "9.5rem" },
];
const CITIES = ["Mumbai", "Pune", "Chennai", "Delhi", "Bengaluru", "Ahmedabad", "Kolkata", "Hyderabad"];
const WORDS = ["Shree", "Ganesh", "Apex", "Sai", "Royal", "Metro", "Prime", "Sunrise", "National", "Om"];
const KINDS = ["Traders", "Industries", "Enterprises", "Engineering", "Agencies", "Steels"];
const CUSTOMERS: Customer[] = Array.from({ length: 2000 }, (_, n) => ({
  id: `CUST-${String(n + 1).padStart(5, "0")}`,
  name: `${WORDS[n % WORDS.length]} ${WORDS[(n * 7 + 3) % WORDS.length]} ${KINDS[n % KINDS.length]}`,
  city: CITIES[(n * 3) % CITIES.length],
  gstin: `27AAB${String((n * 7919) % 100000).padStart(5, "0")}Z${n % 10}`,
}));
/** A stand-in for a server: 400 ms away, searching 2,000 customers. */
const searchCustomers = (q: string, signal: AbortSignal) =>
  new Promise<Customer[]>((resolve, reject) => {
    const t = setTimeout(() => {
      const ws = q.toLowerCase().split(/\s+/).filter(Boolean);
      resolve(CUSTOMERS.filter((c) => ws.every((w) => `${c.id} ${c.name} ${c.city} ${c.gstin}`.toLowerCase().includes(w))).slice(0, 50));
    }, 400);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("aborted", "AbortError"));
    });
  });

/** The element's JS properties, typed for this page. */
type LookupEl<T> = HTMLElement & {
  columns: LookupColumn<T>[];
  rows?: T[];
  rowKey: (row: T) => string;
  rowLabel?: (row: T) => string;
  value?: T | null;
  defaultValue?: T | null;
  onSearch?: (query: string, signal: AbortSignal) => Promise<T[]>;
  onValueHelp?: (query: string) => void;
};

function lookup<T>(attrs: Record<string, string>, props: Partial<LookupEl<T>>): LookupEl<T> {
  const el = document.createElement("zen-lookup-field") as LookupEl<T>;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  Object.assign(el, props);
  return el;
}

const div = (className: string, ...kids: (Node | string)[]) => {
  const d = document.createElement("div");
  d.className = className;
  d.append(...kids);
  return d;
};
const p = (...kids: (Node | string)[]) => {
  const el = document.createElement("p");
  el.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  el.append(...kids);
  return el;
};
const span = (testid: string, text: string) => {
  const s = document.createElement("span");
  s.dataset.testid = testid;
  s.textContent = text;
  return s;
};
const picked = <T>(e: Event) => (e as CustomEvent).detail as T | null;

export default function LookupFieldDemo(): HTMLElement {
  return DemoPage({
    title: "LookupField",
    description:
      "Pick a row from a table of choices, seeing several facts at once: code, name, stock, rate. Type any part of any column, words in any order; the likeliest row comes first. The chosen row comes back whole, so its rate and UOM are there without a second lookup.",
    sections: [
      {
        title: "1. Items, searched here",
        codeTitle: "Columns, headers, search across them",
        codeDescription:
          "Try bolt m8 (two words, two columns), itm-02 (a code prefix comes first), fast (a group), cafe (accents ignored). ↓ opens, ↑ ↓ PageUp PageDown move, Enter picks, Tab picks the active row after a search, Esc closes and then undoes the typing. Stock and Rate are shown, not searched.",
        code: `<zen-label for="item">Item</zen-label>
<zen-lookup-field input-id="item" placeholder="Code, name or group"></zen-lookup-field>

field.columns = [
  { key: "code", header: "Code", width: "6.5rem" },
  { key: "name", header: "Item" },
  { key: "group", header: "Group", width: "7.5rem" },
  { key: "stock", header: "In stock", align: "end", value: (i) => \`\${qty.format(i.stock)} \${i.uom}\`, searchable: false },
  { key: "rate", header: "Rate", align: "end", value: (i) => inr.format(i.rate), searchable: false },
];
field.rows = items;
field.rowKey = (i) => i.code;
field.rowLabel = (i) => \`\${i.code} · \${i.name}\`;
field.value = items[0];
field.addEventListener("zen-value-change", (e) => { field.value = e.detail; });`,
        render: () => {
          const describe = (i: Item | null) =>
            i ? `${i.code}: ${i.uom} at ${inr.format(i.rate)}, ${qty.format(i.stock)} in stock` : "No item";
          const label = document.createElement("zen-label");
          label.setAttribute("for", "item");
          label.textContent = "Item";
          const readout = p();
          readout.dataset.testid = "item-value";
          readout.textContent = describe(ITEMS[0]);
          const field = lookup<Item>(
            { "input-id": "item", placeholder: "Code, name or group" },
            { columns: itemColumns, rows: ITEMS, rowKey: (i) => i.code, rowLabel: (i) => `${i.code} · ${i.name}`, value: ITEMS[0] },
          );
          field.addEventListener("zen-value-change", (e) => {
            const row = picked<Item>(e);
            field.value = row;
            readout.textContent = describe(row);
          });
          return div("zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-2", label, field, readout);
        },
      },
      {
        title: "2. Customers, from a server",
        codeTitle: "onSearch: debounced, the stale request aborted",
        codeDescription:
          "2,000 customers behind a 400 ms stand-in server. Search by name, city, ID or GSTIN (try sai pune, or 27AAB0). Typing quickly sends one request, not one per key; a slower earlier answer never replaces a newer one.",
        code: `<zen-lookup-field aria-label="Customer" list-width="40rem"></zen-lookup-field>

field.columns = [
  { key: "id", header: "ID", width: "7rem" },
  { key: "name", header: "Customer" },
  { key: "city", header: "City", width: "6.5rem" },
  { key: "gstin", header: "GSTIN", width: "9.5rem" },
];
field.onSearch = (q, signal) => api.customers(q, { signal });
field.rowKey = (c) => c.id;
field.rowLabel = (c) => c.name;
field.value = null;
field.addEventListener("zen-value-change", (e) => { field.value = e.detail; });`,
        render: () => {
          let searches = 0;
          const shown = span("customer-value", "No customer");
          const count = span("searches", "0");
          const field = lookup<Customer>(
            { "aria-label": "Customer", placeholder: "Name, city, ID or GSTIN", "list-width": "40rem" },
            {
              columns: customerColumns,
              onSearch: (q, signal) => {
                count.textContent = String(++searches);
                return searchCustomers(q, signal);
              },
              rowKey: (c) => c.id,
              rowLabel: (c) => c.name,
              value: null,
            },
          );
          field.addEventListener("zen-value-change", (e) => {
            const c = picked<Customer>(e);
            field.value = c;
            shown.textContent = c ? `${c.id} · ${c.name}, ${c.city} · GSTIN ${c.gstin}` : "No customer";
          });
          return div("zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-2", field, p(shown, " · requests sent: ", count));
        },
      },
      {
        title: "3. F4: the full search",
        codeTitle: "onValueHelp opens your ValueHelp with what was typed",
        codeDescription:
          "Type something and press F4 (or the search button): the field hands its text to onValueHelp, and the app opens ValueHelp, then sets the value from what is confirmed there.",
        code: `<zen-lookup-field aria-label="Part"></zen-lookup-field>
<zen-value-help title="Items"></zen-value-help>

field.onValueHelp = (q) => { help.description = \`Searched for “\${q}” in the field\`; help.open = true; };
help.items = items.map((i) => ({ id: i.code, label: i.name, description: i.group }));
help.addEventListener("zen-open-change", (e) => { help.open = e.detail; });
help.addEventListener("zen-confirm", (e) => {
  field.value = items.find((i) => i.code === e.detail.ids[0]) ?? null;
});`,
        render: () => {
          const partOut = span("part-value", "none");
          const helpNote = document.createElement("span");
          const readout = p("Part: ", partOut, helpNote);
          const help = document.createElement("zen-value-help") as HTMLElement & {
            open: boolean;
            items: unknown[];
            selectedIds: string[];
            description: string | null;
          };
          help.setAttribute("title", "Items");
          help.open = false;
          help.items = ITEMS.map((i) => ({ id: i.code, label: `${i.code} · ${i.name}`, description: i.group, info: inr.format(i.rate) }));
          help.selectedIds = [];
          const field = lookup<Item>(
            { "aria-label": "Part", placeholder: "Code or name; F4 for the full search" },
            {
              columns: itemColumns,
              rows: ITEMS,
              rowKey: (i) => i.code,
              rowLabel: (i) => `${i.code} · ${i.name}`,
              value: null,
              onValueHelp: (q) => {
                if (q) helpNote.replaceChildren(" · F4 was pressed with “", span("help-query", q), "”");
                else helpNote.replaceChildren();
                help.description = q ? `Searched for “${q}” in the field` : null;
                help.open = true;
              },
            },
          );
          const setPart = (row: Item | null) => {
            field.value = row;
            help.selectedIds = row ? [row.code] : [];
            partOut.textContent = row ? row.code : "none";
          };
          field.addEventListener("zen-value-change", (e) => setPart(picked<Item>(e)));
          help.addEventListener("zen-open-change", (e) => {
            help.open = (e as CustomEvent).detail as boolean;
          });
          help.addEventListener("zen-confirm", (e) => {
            const { ids } = (e as CustomEvent).detail as ValueHelpResult;
            setPart(ITEMS.find((i) => i.code === ids[0]) ?? null);
          });
          return div("zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-2", field, readout, help);
        },
      },
      {
        title: "4. Invalid and disabled",
        codeTitle: "Invalid and disabled",
        code: `<zen-lookup-field invalid aria-label="Required item" placeholder="Required"></zen-lookup-field>
<zen-lookup-field disabled aria-label="Locked item"></zen-lookup-field>   <!-- field.defaultValue = items[2] -->`,
        render: () =>
          div(
            "zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-3",
            lookup<Item>(
              { invalid: "", "aria-label": "Required item", placeholder: "Required" },
              { columns: itemColumns, rows: ITEMS, rowKey: (i) => i.code },
            ),
            lookup<Item>(
              { disabled: "", "aria-label": "Locked item" },
              { columns: itemColumns, rows: ITEMS, rowKey: (i) => i.code, rowLabel: (i) => `${i.code} · ${i.name}`, defaultValue: ITEMS[2] },
            ),
          ),
      },
    ],
  });
}

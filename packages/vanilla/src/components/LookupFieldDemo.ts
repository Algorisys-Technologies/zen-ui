import { LookupField, type LookupColumn } from "./lookup-field/lookup-field";
import { ValueHelp } from "./value-help/value-help";
import { Label } from "./form/label/label";
import { DemoPage } from "./demo-helpers";

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
        code: `const columns: LookupColumn<Item>[] = [
  { key: "code", header: "Code", width: "6.5rem" },
  { key: "name", header: "Item" },
  { key: "group", header: "Group", width: "7.5rem" },
  { key: "stock", header: "In stock", align: "end", value: (i) => \`\${qty.format(i.stock)} \${i.uom}\`, searchable: false },
  { key: "rate", header: "Rate", align: "end", value: (i) => inr.format(i.rate), searchable: false },
];

let item = items[0];
const field = LookupField({
  id: "item", columns, rows: items,
  rowKey: (i) => i.code, rowLabel: (i) => \`\${i.code} · \${i.name}\`,
  value: item, onValueChange: (row) => field.update({ value: (item = row) }),
  placeholder: "Code, name or group",
});
form.append(Label({ for: "item", children: "Item" }).el, field.el);`,
        render: () => {
          const describe = (i: Item | null) =>
            i ? `${i.code}: ${i.uom} at ${inr.format(i.rate)}, ${qty.format(i.stock)} in stock` : "No item";
          const readout = p();
          readout.dataset.testid = "item-value";
          readout.textContent = describe(ITEMS[0]);
          const field = LookupField<Item>({
            id: "item",
            columns: itemColumns,
            rows: ITEMS,
            rowKey: (i) => i.code,
            rowLabel: (i) => `${i.code} · ${i.name}`,
            value: ITEMS[0],
            onValueChange: (row) => {
              field.update({ value: row });
              readout.textContent = describe(row);
            },
            placeholder: "Code, name or group",
          });
          return div(
            "zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-2",
            Label({ for: "item", children: "Item" }).el,
            field.el,
            readout,
          );
        },
      },
      {
        title: "2. Customers, from a server",
        codeTitle: "onSearch: debounced, the stale request aborted",
        codeDescription:
          "2,000 customers behind a 400 ms stand-in server. Search by name, city, ID or GSTIN (try sai pune, or 27AAB0). Typing quickly sends one request, not one per key; a slower earlier answer never replaces a newer one.",
        code: `const field = LookupField({
  columns: [
    { key: "id", header: "ID", width: "7rem" },
    { key: "name", header: "Customer" },
    { key: "city", header: "City", width: "6.5rem" },
    { key: "gstin", header: "GSTIN", width: "9.5rem" },
  ],
  onSearch: (q, signal) => api.customers(q, { signal }),
  rowKey: (c) => c.id, rowLabel: (c) => c.name,
  value: customer, onValueChange: (row) => field.update({ value: (customer = row) }),
  "aria-label": "Customer", listWidth: "40rem",
});`,
        render: () => {
          let searches = 0;
          const shown = span("customer-value", "No customer");
          const count = span("searches", "0");
          const field = LookupField<Customer>({
            columns: customerColumns,
            onSearch: (q, signal) => {
              count.textContent = String(++searches);
              return searchCustomers(q, signal);
            },
            rowKey: (c) => c.id,
            rowLabel: (c) => c.name,
            value: null,
            onValueChange: (c) => {
              field.update({ value: c });
              shown.textContent = c ? `${c.id} · ${c.name}, ${c.city} · GSTIN ${c.gstin}` : "No customer";
            },
            "aria-label": "Customer",
            placeholder: "Name, city, ID or GSTIN",
            listWidth: "40rem",
          });
          return div("zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-2", field.el, p(shown, " · requests sent: ", count));
        },
      },
      {
        title: "3. F4: the full search",
        codeTitle: "onValueHelp opens your ValueHelp with what was typed",
        codeDescription:
          "Type something and press F4 (or the search button): the field hands its text to onValueHelp, and the app opens ValueHelp, then sets the value from what is confirmed there.",
        code: `const field = LookupField({ columns, rows: items, rowKey: (i) => i.code,
  value: part, onValueChange: (row) => field.update({ value: (part = row) }),
  onValueHelp: (q) => help.update({ open: true, description: \`Searched for “\${q}” in the field\` }) });
const help = ValueHelp({ open: false, onOpenChange: (o) => help.update({ open: o }), title: "Items",
  items: items.map((i) => ({ id: i.code, label: i.name, description: i.group })),
  onConfirm: ({ ids }) => field.update({ value: (part = items.find((i) => i.code === ids[0]) ?? null) }) });`,
        render: () => {
          const partOut = span("part-value", "none");
          const helpNote = document.createElement("span");
          const readout = p("Part: ", partOut, helpNote);
          const setPart = (row: Item | null) => {
            field.update({ value: row });
            help.update({ selectedIds: row ? [row.code] : [] });
            partOut.textContent = row ? row.code : "none";
          };
          const field = LookupField<Item>({
            columns: itemColumns,
            rows: ITEMS,
            rowKey: (i) => i.code,
            rowLabel: (i) => `${i.code} · ${i.name}`,
            value: null,
            onValueChange: setPart,
            "aria-label": "Part",
            placeholder: "Code or name; F4 for the full search",
            onValueHelp: (q) => {
              if (q) helpNote.replaceChildren(" · F4 was pressed with “", span("help-query", q), "”");
              else helpNote.replaceChildren();
              help.update({ open: true, description: q ? `Searched for “${q}” in the field` : undefined });
            },
          });
          const help = ValueHelp({
            open: false,
            onOpenChange: (o) => help.update({ open: o }),
            title: "Items",
            items: ITEMS.map((i) => ({ id: i.code, label: `${i.code} · ${i.name}`, description: i.group, info: inr.format(i.rate) })),
            selectedIds: [],
            onConfirm: ({ ids }) => setPart(ITEMS.find((i) => i.code === ids[0]) ?? null),
          });
          return div("zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-2", field.el, readout, help.el);
        },
      },
      {
        title: "4. Invalid and disabled",
        codeTitle: "Invalid and disabled",
        code: `LookupField({ invalid: true, …, "aria-label": "Required item" });
LookupField({ disabled: true, defaultValue: items[2], …, "aria-label": "Locked item" });`,
        render: () =>
          div(
            "zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-3",
            LookupField<Item>({
              columns: itemColumns,
              rows: ITEMS,
              rowKey: (i) => i.code,
              invalid: true,
              "aria-label": "Required item",
              placeholder: "Required",
            }).el,
            LookupField<Item>({
              columns: itemColumns,
              rows: ITEMS,
              rowKey: (i) => i.code,
              rowLabel: (i) => `${i.code} · ${i.name}`,
              disabled: true,
              defaultValue: ITEMS[2],
              "aria-label": "Locked item",
            }).el,
          ),
      },
    ],
  });
}

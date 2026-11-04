import { createSignal } from "solid-js";
import { LookupField, type LookupColumn } from "./lookup-field/lookup-field";
import { ValueHelp } from "./value-help/value-help";
import { Label } from "./form/label/label";
import { DemoPage, DemoSection } from "./demo-helpers";

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

const NewLookupFieldDemo = () => {
  const [item, setItem] = createSignal<Item | null>(ITEMS[0]);
  const [customer, setCustomer] = createSignal<Customer | null>(null);
  const [searches, setSearches] = createSignal(0);
  const [part, setPart] = createSignal<Item | null>(null);
  const [helpOpen, setHelpOpen] = createSignal(false);
  const [helpQuery, setHelpQuery] = createSignal("");

  return (
    <DemoPage
      title="LookupField"
      description="Pick a row from a table of choices, seeing several facts at once: code, name, stock, rate. Type any part of any column, words in any order; the likeliest row comes first. The chosen row comes back whole, so its rate and UOM are there without a second lookup."
    >
      <DemoSection
        title="1. Items, searched here"
        codeTitle="Columns, headers, search across them"
        codeDescription="Try bolt m8 (two words, two columns), itm-02 (a code prefix comes first), fast (a group), cafe (accents ignored). ↓ opens, ↑ ↓ PageUp PageDown move, Enter picks, Tab picks the active row after a search, Esc closes and then undoes the typing. Stock and Rate are shown, not searched."
        code={`const columns: LookupColumn<Item>[] = [
  { key: "code", header: "Code", width: "6.5rem" },
  { key: "name", header: "Item" },
  { key: "group", header: "Group", width: "7.5rem" },
  { key: "stock", header: "In stock", align: "end", value: (i) => \`\${qty.format(i.stock)} \${i.uom}\`, searchable: false },
  { key: "rate", header: "Rate", align: "end", value: (i) => inr.format(i.rate), searchable: false },
];

<Label for="item">Item</Label>
<LookupField id="item" columns={columns} rows={items}
  rowKey={(i) => i.code} rowLabel={(i) => \`\${i.code} · \${i.name}\`}
  value={item()} onValueChange={setItem} placeholder="Code, name or group" />`}
      >
        <div class="zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-2">
          <Label for="item">Item</Label>
          <LookupField
            id="item"
            columns={itemColumns}
            rows={ITEMS}
            rowKey={(i) => i.code}
            rowLabel={(i) => `${i.code} · ${i.name}`}
            value={item()}
            onValueChange={setItem}
            placeholder="Code, name or group"
          />
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg" data-testid="item-value">
            {item() ? `${item()!.code}: ${item()!.uom} at ${inr.format(item()!.rate)}, ${qty.format(item()!.stock)} in stock` : "No item"}
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="2. Customers, from a server"
        codeTitle="onSearch: debounced, the stale request aborted"
        codeDescription="2,000 customers behind a 400 ms stand-in server. Search by name, city, ID or GSTIN (try sai pune, or 27AAB0). Typing quickly sends one request, not one per key; a slower earlier answer never replaces a newer one."
        code={`<LookupField
  columns={[
    { key: "id", header: "ID", width: "7rem" },
    { key: "name", header: "Customer" },
    { key: "city", header: "City", width: "6.5rem" },
    { key: "gstin", header: "GSTIN", width: "9.5rem" },
  ]}
  onSearch={(q, signal) => api.customers(q, { signal })}
  rowKey={(c) => c.id} rowLabel={(c) => c.name}
  value={customer()} onValueChange={setCustomer}
  aria-label="Customer" listWidth="40rem"
/>`}
      >
        <div class="zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-2">
          <LookupField
            columns={[
              { key: "id", header: "ID", width: "7rem" },
              { key: "name", header: "Customer" },
              { key: "city", header: "City", width: "6.5rem" },
              { key: "gstin", header: "GSTIN", width: "9.5rem" },
            ]}
            onSearch={(q, signal) => {
              setSearches((n) => n + 1);
              return searchCustomers(q, signal);
            }}
            rowKey={(c) => c.id}
            rowLabel={(c) => c.name}
            value={customer()}
            onValueChange={setCustomer}
            aria-label="Customer"
            placeholder="Name, city, ID or GSTIN"
            listWidth="40rem"
          />
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            <span data-testid="customer-value">{customer() ? `${customer()!.id} · ${customer()!.name}, ${customer()!.city} · GSTIN ${customer()!.gstin}` : "No customer"}</span>
            {" · "}requests sent: <span data-testid="searches">{searches()}</span>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="3. F4: the full search"
        codeTitle="onValueHelp opens your ValueHelp with what was typed"
        codeDescription="Type something and press F4 (or the search button): the field hands its text to onValueHelp, and the app opens ValueHelp, then sets the value from what is confirmed there."
        code={`<LookupField columns={columns} rows={items} rowKey={(i) => i.code}
  value={part()} onValueChange={setPart}
  onValueHelp={(q) => { setHelpQuery(q); setHelpOpen(true); }} />
<ValueHelp open={helpOpen()} onOpenChange={setHelpOpen} title="Items"
  items={items.map((i) => ({ id: i.code, label: i.name, description: i.group }))}
  onConfirm={({ ids }) => setPart(items.find((i) => i.code === ids[0]) ?? null)} />`}
      >
        <div class="zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-2">
          <LookupField
            columns={itemColumns}
            rows={ITEMS}
            rowKey={(i) => i.code}
            rowLabel={(i) => `${i.code} · ${i.name}`}
            value={part()}
            onValueChange={setPart}
            aria-label="Part"
            placeholder="Code or name; F4 for the full search"
            onValueHelp={(q) => {
              setHelpQuery(q);
              setHelpOpen(true);
            }}
          />
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            Part: <span data-testid="part-value">{part() ? part()!.code : "none"}</span>
            {helpQuery() ? <> · F4 was pressed with “<span data-testid="help-query">{helpQuery()}</span>”</> : null}
          </p>
          <ValueHelp
            open={helpOpen()}
            onOpenChange={setHelpOpen}
            title="Items"
            description={helpQuery() ? `Searched for “${helpQuery()}” in the field` : undefined}
            items={ITEMS.map((i) => ({ id: i.code, label: `${i.code} · ${i.name}`, description: i.group, info: inr.format(i.rate) }))}
            selectedIds={part() ? [part()!.code] : []}
            onConfirm={({ ids }) => setPart(ITEMS.find((i) => i.code === ids[0]) ?? null)}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="4. Invalid and disabled"
        code={`<LookupField invalid … aria-label="Required item" />
<LookupField disabled defaultValue={items[2]} … aria-label="Locked item" />`}
      >
        <div class="zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-3">
          <LookupField columns={itemColumns} rows={ITEMS} rowKey={(i) => i.code} invalid aria-label="Required item" placeholder="Required" />
          <LookupField columns={itemColumns} rows={ITEMS} rowKey={(i) => i.code} rowLabel={(i) => `${i.code} · ${i.name}`} disabled defaultValue={ITEMS[2]} aria-label="Locked item" />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewLookupFieldDemo;

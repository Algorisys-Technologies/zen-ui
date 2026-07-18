/**
 * Fixture for the List Report pattern demo. Shared by both bindings' copies.
 *
 * Deterministic on purpose — no Math.random. A demo that reshuffles itself on
 * every reload makes the visual check's screenshots differ for no reason, and
 * "is this row here because of my filter or because the data moved?" is not a
 * question anyone should have to ask while reading a demo.
 */

export type OrderStatus = "open" | "confirmed" | "shipped" | "invoiced" | "blocked";

export type Order = {
  id: string;
  supplier: string;
  city: string;
  status: OrderStatus;
  /** ISO yyyy-mm-dd. */
  date: string;
  amount: number;
};

const SUPPLIERS = [
  ["Talpa Industrial", "Pune"],
  ["Nordwind Components", "Hamburg"],
  ["Kestrel Metalworks", "Sheffield"],
  ["Alto Precision", "Turin"],
  ["Meridian Supply Co", "Chicago"],
  ["Sakura Fabrication", "Osaka"],
];

const STATUSES: OrderStatus[] = ["open", "confirmed", "shipped", "invoiced", "blocked"];

/**
 * Dates are spread backwards from a FIXED day rather than from today, so the
 * demo's date filter has something to find whenever anyone opens it, and the
 * screenshots do not drift.
 */
export const AS_OF = new Date(2026, 6, 15);

const day = (n: number) => {
  const d = new Date(AS_OF.getFullYear(), AS_OF.getMonth(), AS_OF.getDate() - n);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const ORDERS: Order[] = Array.from({ length: 48 }, (_, i) => {
  const [supplier, city] = SUPPLIERS[i % SUPPLIERS.length];
  return {
    id: `PO-${4200 + i}`,
    supplier,
    city,
    status: STATUSES[(i * 3) % STATUSES.length],
    // 0,2,4… days back — spread across roughly three months.
    date: day((i * 2) % 94),
    amount: 1200 + ((i * 977) % 48000),
  };
});

export const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  ...STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
];

export const SUPPLIER_OPTIONS = [
  { value: "", label: "Any supplier" },
  ...SUPPLIERS.map(([s]) => ({ value: s, label: s })),
];

/** Badge colour per status. Blocked is the only one that should alarm anyone. */
export const statusColor = (s: OrderStatus): "neutral" | "info" | "success" | "warning" | "error" =>
  s === "blocked" ? "error" : s === "invoiced" ? "success" : s === "shipped" ? "info" : s === "confirmed" ? "neutral" : "warning";

export const money = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

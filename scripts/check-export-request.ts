/**
 * Server-side export request contract.
 *
 *   bun run check:export-request
 *
 * buildExportRequest drops what means nothing (empty filters, duplicate
 * sorts, a blank search) and keeps everything else; every request it builds
 * survives a JSON round trip and is accepted by parseExportRequest; and
 * parseExportRequest rejects, without throwing, anything a server should not
 * trust. The request stays small whatever the data's size.
 */
import { buildExportRequest, parseExportRequest, EXPORT_FILE, type ExportColumn } from "../packages/core/src/export-request";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; if (failed <= 30) console.error(`FAIL ${label}: got ${JSON.stringify(got)?.slice(0, 220)}, want ${JSON.stringify(want)?.slice(0, 220)}`); }
};

const COLS: ExportColumn[] = [
  { id: "no", header: "Invoice", width: 120, align: "start", format: { kind: "text" } },
  { id: "amount", header: "Amount", width: 140, align: "end", format: { kind: "amount", currency: "INR", precision: 2 }, total: "sum" },
  { id: "due", header: "Due", width: 110, align: "start", format: { kind: "date" } },
];
const base = { format: "xlsx" as const, filename: "invoices", columns: COLS };

const r = buildExportRequest({
  ...base,
  locale: "en-IN",
  sort: [{ id: "due", desc: false }, { id: "amount", desc: true }, { id: "due", desc: true }],
  search: "  acme  ",
  columnFilters: [
    { id: "no", value: { op: "starts", value: "SI/26" } },
    { id: "amount", value: [null, null] },
    { id: "due", value: "" },
    { id: "status", value: ["overdue"] },
    { id: "x", value: { op: "contains", value: "" } },
  ],
  grouping: ["customer", "customer"],
  context: { filterTree: { kind: "group", join: "and", children: [] } },
});
eq("version and format", [r.version, r.format, r.filename, r.locale], [1, "xlsx", "invoices", "en-IN"]);
eq("all rows when nothing is selected", r.scope, { kind: "all" });
eq("duplicate sorts keep the first (priority order)", r.sort, [{ id: "due", desc: false }, { id: "amount", desc: true }]);
eq("search trimmed", r.filters.search, "acme");
eq("empty filters dropped (blank, empty range, empty operator value); real ones kept as the table holds them", r.filters.columns, [{ id: "no", value: { op: "starts", value: "SI/26" } }, { id: "status", value: ["overdue"] }]);
eq("grouping deduplicated", r.grouping, ["customer"]);
eq("context carried", r.context, { filterTree: { kind: "group", join: "and", children: [] } });
eq("selected ids, deduplicated", buildExportRequest({ ...base, selectedIds: ["a", "b", "a"] }).scope, { kind: "selected", ids: ["a", "b"] });
eq("an empty selection means all", buildExportRequest({ ...base, selectedIds: [] }).scope, { kind: "all" });
eq("a blank search is left out", "search" in buildExportRequest({ ...base, search: "   " }).filters, false);
eq("no context, no key", "context" in buildExportRequest({ ...base, context: {} }), false);
eq("columns are copied, not shared", buildExportRequest(base).columns[0] === COLS[0], false);
eq("file types", [EXPORT_FILE.xlsx.extension, EXPORT_FILE.pdf.mime, EXPORT_FILE.csv.mime], ["xlsx", "application/pdf", "text/csv;charset=utf-8"]);

// Everything built parses, after travelling as JSON.
let seed = 4;
const rnd = (n: number) => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) >>> 8) % n;
const pick = <T,>(xs: readonly T[]) => xs[rnd(xs.length)];
let built = 0, biggest = 0;
for (let i = 0; i < 300; i++) {
  const ncols = 1 + rnd(40);
  const columns: ExportColumn[] = Array.from({ length: ncols }, (_, k) => ({
    id: `c${k}`, header: pick(["Invoice", "राशि", "Amount (₹)", "Due"]), width: 60 + rnd(200), align: pick(["start", "end"] as const),
    format: pick([{ kind: "text" }, { kind: "number", precision: 2 }, { kind: "amount", currency: "INR" }, { kind: "date" }, { kind: "boolean" }] as const),
    ...(rnd(3) === 0 ? { total: pick(["sum", "count", "avg", "custom"] as const) } : {}),
  }));
  const req = buildExportRequest({
    format: pick(["xlsx", "pdf", "csv"] as const), filename: "f", columns,
    selectedIds: rnd(3) === 0 ? Array.from({ length: rnd(5000) }, (_, j) => `id-${j}`) : null,
    sort: Array.from({ length: rnd(4) }, () => ({ id: `c${rnd(ncols)}`, desc: !!rnd(2) })),
    columnFilters: Array.from({ length: rnd(5) }, () => ({ id: `c${rnd(ncols)}`, value: pick(["", "x", { op: "gt", value: 5 }, [1, null], [], true]) })),
    grouping: rnd(2) ? [`c${rnd(ncols)}`] : [],
  });
  const json = JSON.stringify(req);
  if (req.scope.kind === "all") biggest = Math.max(biggest, json.length);
  const parsed = parseExportRequest(json);
  eq(`request ${i}: survives JSON and parses`, [parsed.problems, JSON.stringify(parsed.request)], [[], json]);
  built++;
}
eq("requests built", built, 300);
eq("a 40-column request (all rows) stays a few KB, whatever the data's size", biggest < 12_000, true);

// What a server must refuse, without throwing.
const good = JSON.parse(JSON.stringify(r));
const bad: [string, unknown][] = [
  ["not JSON", "{oops"], ["null", null], ["an array", []], ["a number", 3],
  ["version 2", { ...good, version: 2 }], ["unknown format", { ...good, format: "docx" }], ["no filename", { ...good, filename: "" }],
  ["no columns", { ...good, columns: [] }], ["a column without id", { ...good, columns: [{ header: "x", format: { kind: "text" } }] }],
  ["duplicate column ids", { ...good, columns: [good.columns[0], good.columns[0]] }],
  ["an unknown column format", { ...good, columns: [{ ...good.columns[0], format: { kind: "money" } }] }],
  ["an unknown total", { ...good, columns: [{ ...good.columns[1], total: "median" }] }],
  ["a bad scope", { ...good, scope: { kind: "selected", ids: [1, 2] } }], ["a bad sort", { ...good, sort: [{ desc: true }] }],
  ["no filters", { ...good, filters: null }], ["bad grouping", { ...good, grouping: "customer" }],
];
for (const [label, input] of bad) {
  let res: ReturnType<typeof parseExportRequest> | "threw" = "threw";
  try { res = parseExportRequest(input); } catch { /* stays "threw" */ }
  eq(`refuses ${label}, never throws`, res !== "threw" && res.request === null && res.problems.length > 0, true);
}
eq("the good one parses", parseExportRequest(good).problems, []);

console.log(failed ? `${failed} of ${checked} FAILED` : `all passed (${checked} assertions; largest 'all rows' request ${biggest} bytes)`);
process.exit(failed ? 1 : 0);

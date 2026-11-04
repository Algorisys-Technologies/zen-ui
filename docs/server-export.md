# Server-side export (DataTable `onExport`)

For a list too large to live in the browser (a ledger of a million lines shows
one page of it), an export cannot be built from the rows on screen. zen-ui's
part is the **frontend half**: the Export menu, the busy state and errors, and
an **`ExportRequest`**, a JSON description of exactly what the user is looking
at. Your server does the rest: query the full data, write the file, send it
back. zen-ui runs nothing on the server.

```
browser (zen-ui)                         your server (e.g. Frappe)
────────────────                         ─────────────────────────
user picks Export → Excel
DataTable builds an ExportRequest  ──►   reads columns / filters / sort / scope
(a few KB, whatever the data size)       queries the FULL data (permissions apply)
                                         writes .xlsx / .pdf / .csv
download / error shown            ◄──    returns the file (or a URL to it)
```

## The frontend

```tsx
<DataTable
  data={page.rows}
  manualPagination={…} manualSorting manualFiltering   // server-driven table
  getRowId={(row) => row.name}                         // selection survives paging
  enableRowSelection
  exportFilename="sales-invoices"
  exportTitle="Sales invoices"
  exportContext={{ filterTree: filter(), view: activeViewId() }}  // anything else
  onExport={(format, request) =>
    fetch("/api/method/myapp.api.export_list", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Frappe-CSRF-Token": csrf },
      body: JSON.stringify(request),
    }).then((r) => (r.ok ? r.blob() : r.text().then((t) => Promise.reject(new Error(t)))))}
/>
```

`onExport` may return:

| return | what zen-ui does |
|---|---|
| a `Blob` | downloads it as `exportFilename.<ext>` |
| `{ url, filename? }` | starts a download from the URL (a prepared file, a background job's result) |
| nothing | assumes you handled it (e.g. "we'll email it when it's ready") |
| a rejected Promise | shows "Export failed: *reason*" by the button |

Columns describe their format with `meta.exportFormat` (otherwise `number` for a
column with a total or a number filter, `text` for the rest):

```ts
{ accessorKey: "grand_total", header: "Amount",
  meta: { aggregate: "sum", exportFormat: { kind: "amount", currency: "INR", precision: 2 } } }
```

## The request (version 1)

The type is `ExportRequest` in `@algorisys/zen-ui-core/export-request`. It only
ever grows: a server written for version 1 keeps working.

```jsonc
{
  "version": 1,
  "format": "xlsx",                       // "xlsx" | "pdf" | "csv"
  "filename": "sales-invoices",
  "title": "Sales invoices",
  "locale": "en-IN",                      // for number and date formatting
  "scope": { "kind": "all" },             // or { "kind": "selected", "ids": ["SINV-0042", …] }
  "columns": [                            // visible columns, in screen order
    { "id": "name", "header": "Invoice", "width": 140, "align": "start", "format": { "kind": "text" } },
    { "id": "grand_total", "header": "Amount", "width": 120, "align": "end",
      "format": { "kind": "amount", "currency": "INR", "precision": 2 }, "total": "sum" }
  ],
  "sort": [{ "id": "posting_date", "desc": true }],               // priority order
  "filters": {
    "search": "acme",                                             // the search box, if used
    "columns": [                                                  // as the table holds them
      { "id": "customer", "value": { "op": "contains", "value": "Acme" } },
      { "id": "grand_total", "value": [100000, null] },           // a number range
      { "id": "status", "value": ["Overdue", "Unpaid"] }          // a choice list
    ]
  },
  "grouping": ["customer"],
  "context": { "filterTree": { … }, "view": "my-overdue" }        // exportContext, as given
}
```

Filter operator names are DataTable's: `contains`, `equals`, `starts`, `ends`
(text); `eq`, `ne`, `gt`, `gte`, `lt`, `lte` (number). A FilterBuilder tree, if
you pass one in `exportContext`, uses the same names
(`@algorisys/zen-ui-core/filter`).

Selected ids are the table's `getRowId` values, so rows selected on pages the
browser no longer holds are included.

## A server sketch (Frappe)

Not part of zen-ui: an outline of the endpoint an app writes.

```python
import json, frappe
from frappe.utils.xlsxutils import make_xlsx

OPS = {"contains": "like", "starts": "like", "ends": "like", "equals": "=",
       "eq": "=", "ne": "!=", "gt": ">", "gte": ">=", "lt": "<", "lte": "<="}

@frappe.whitelist()
def export_list():
    req = json.loads(frappe.request.data)
    assert req.get("version") == 1
    fields = [c["id"] for c in req["columns"]]          # check against the DocType's fields!

    filters = []
    for f in req["filters"]["columns"]:
        v = f["value"]
        if isinstance(v, dict):                          # { op, value }
            op, val = OPS[v["op"]], v["value"]
            if v["op"] == "contains": val = f"%{val}%"
            if v["op"] == "starts":   val = f"{val}%"
            if v["op"] == "ends":     val = f"%{val}"
            filters.append([f["id"], op, val])
        elif isinstance(v, list) and len(v) == 2:        # [min, max]
            if v[0] is not None: filters.append([f["id"], ">=", v[0]])
            if v[1] is not None: filters.append([f["id"], "<=", v[1]])
        # … choice lists, booleans, the search box, context.filterTree
    if req["scope"]["kind"] == "selected":
        filters.append(["name", "in", req["scope"]["ids"]])

    order_by = ", ".join(f'{s["id"]} {"desc" if s["desc"] else "asc"}' for s in req["sort"]) or None
    rows = frappe.get_list("Sales Invoice", fields=fields, filters=filters,
                           order_by=order_by, limit_page_length=0)   # permissions apply

    data = [[c["header"] for c in req["columns"]]] + [[r[f] for f in fields] for r in rows]
    if req["format"] == "xlsx":
        xlsx = make_xlsx(data, req.get("title") or "Export")
        frappe.response.filename = req["filename"] + ".xlsx"
        frappe.response.filecontent = xlsx.getvalue()
        frappe.response.type = "binary"
    # pdf: render a print format / Jinja template with the same rows and columns
```

Two rules for the server:

- **Never trust the request's field names.** Check every `columns[].id`,
  `sort[].id` and `filters.columns[].id` against the fields the user may read;
  the request came from the browser. A JavaScript server can start with
  `parseExportRequest(body)`, which validates the shape and never throws.
- **Permissions are the server's.** `frappe.get_list` (not `get_all`) applies
  the user's; a selected id the user may not see is simply not returned.

For a very large export, return `{ url }` from a background job (or nothing,
and notify the user when the file is ready) rather than holding the request
open.

import { DataTable, type DataTableProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// TABLE EXCEPTION: only <zen-data-table> (the DataTable factory) is registered.
// Table/TableRow/TableCell/TableHeader/TableBody/TableFooter/TableHead/TableCaption
// stay factory-only — a custom element cannot sit where a <tr>/<td> must be a direct
// child of a <table>/<tr>, so wrapping those primitives would break table semantics.
//
// Data-driven: `columns` (carries cell/sortingFn render fns) and `data` are JS
// properties. `data` also gets a json attr so a pure-HTML author can seed rows.
//
// A callback whose RETURN VALUE the table uses is a JS property, not an event
// (an event's listener returns nothing): `rowLabel` (a string), `contextMenu`
// (the menu's items) and `onExport` (the Blob / { url } / Promise the download
// waits on). Callbacks that only report are events: `zen-row-activate`
// (detail: [row, keyboardEvent]).
defineZenElement<DataTableProps<Record<string, unknown>>>({
  tag: "zen-data-table",
  factory: DataTable,
  attrs: {
    "enable-sorting": "boolean",
    "enable-multi-sort": "boolean",
    "enable-pagination": "boolean",
    "enable-column-filters": "boolean",
    "enable-row-selection": "boolean",
    "enable-virtualization": "boolean",
    "enable-column-separators": "boolean",
    "enable-keyboard-navigation": "boolean",
    "fill-height": "boolean",
    "totals-over": "string",
    "export-title": "string",
    "export-filename": "string",
    "header-variant": "string",
    "sticky-header": "boolean",
    "page-size": "number",
    "max-body-height": "number",
    "row-estimated-height": "number",
    "global-filter-placeholder": "string",
    "empty-message": "string",
    "global-filter": "string",
    loading: "boolean",
    data: "json",
  },
  props: [
    "data",
    "columns",
    "pageSizeOptions",
    "getRowId",
    "rowClassName",
    "manualPagination",
    "sorting",
    "rowSelection",
    "rowLabel",
    "contextMenu",
    "onExport",
    "exportFormats",
    "exportContext",
  ],
  events: {
    onSortingChange: "zen-sorting-change",
    onRowSelectionChange: "zen-row-selection-change",
    onGlobalFilterChange: "zen-global-filter-change",
    onRowActivate: "zen-row-activate",
  },
  childrenProp: false,
});

import { TreeTable, type TreeTableProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Same TABLE EXCEPTION as <zen-data-table>: only the factory element is
// registered. The inner <tr>/<td> must stay real table elements, so nothing
// below the root gets wrapped in a custom element.
//
// Data-driven: `columns` (carries the cell render fns) and `data` are JS
// properties. `data` also gets a json attr so a pure-HTML author can seed a
// tree; `default-expanded` is json because it takes `true` OR an array of ids.
defineZenElement<TreeTableProps<Record<string, unknown>>>({
  tag: "zen-tree-table",
  factory: TreeTable,
  attrs: {
    "enable-sorting": "boolean",
    "enable-global-filter": "boolean",
    "enable-row-selection": "boolean",
    "hierarchy-column-id": "string",
    "header-variant": "string",
    "enable-pagination": "boolean",
    "page-size": "number",
    "enable-virtualization": "boolean",
    "row-estimated-height": "number",
    "sticky-header": "boolean",
    "global-filter-placeholder": "string",
    "empty-message": "string",
    "max-body-height": "number",
    indent: "number",
    loading: "boolean",
    "default-expanded": "json",
    // Controlled search text, as on <zen-data-table>: absent means uncontrolled.
    "global-filter": "string",
    data: "json",
  },
  // `enableExpandAll` and `enableSubRowSelection` default to TRUE, and an
  // absent boolean ATTRIBUTE resolves to false (see lib/define.ts) — declaring
  // them there would silently invert both defaults for every pure-HTML author.
  // Default-true booleans are properties, which is the rule define.ts states.
  props: [
    "data",
    "columns",
    "getSubRows",
    "getRowId",
    "defaultExpanded",
    "enableExpandAll",
    "enableSubRowSelection",
    // Functions, so properties by necessity — there is no attribute form of
    // "call this and await a Promise".
    "hasChildren",
    "loadChildren",
    "onLoadChildrenError",
    "pageSizeOptions",
    // Controlled state, as <zen-data-table> exposes it: present -> the caller
    // owns it and an interaction only reports (through the matching event) until
    // the new value is assigned back. `expanded` is ids or `true`, `sorting` a
    // SortingState (only the first entry is read), `rowSelection` the ids.
    "expanded",
    "sorting",
    "rowSelection",
    // A function of the row and its depth, so a property.
    "rowClassName",
  ],
  events: {
    onExpandedChange: "zen-expanded-change",
    onRowSelectionChange: "zen-row-selection-change",
    onRowClick: "zen-row-click",
    onPaginationChange: "zen-pagination-change",
    onSortingChange: "zen-sorting-change",
    onGlobalFilterChange: "zen-global-filter-change",
  },
  childrenProp: false,
});

/**
 * Every string zen-ui shows or announces, in one place: the pure half of
 * LocaleProvider's `messages`, shared by every binding.
 *
 *   bun run check:messages
 *   bun run check:strings     (no hard-coded strings in swept components)
 *
 * A component never hard-codes a user-visible string. It asks for a key, and
 * gets, in order: the instance's own prop (DocumentTabs' `closeLabel`, a
 * Combobox's `placeholder`), the app's translation (LocaleProvider
 * `messages`), then the English here, which is exactly what the component
 * showed before this catalogue existed. So an app that translates nothing sees
 * no change, and `bun run check:strings` fails on a new hard-coded string.
 *
 * Values interpolate `{name}` and choose plural forms the way ICU
 * MessageFormat does, by the locale's own rules (Intl.PluralRules), which is
 * what Hindi, Arabic or Polish need and "s" on the end does not give:
 *
 *   "{count, plural, one {# result} other {# results}}"
 */

/** Fill a message: `{name}` is replaced, `{n, plural, one {…} other {…}}` chooses by the locale's plural rules (`#` is the number). */
export function formatMessage(template: string, values: Record<string, string | number> = {}, locale?: string): string {
  let out = "";
  let i = 0;
  while (i < template.length) {
    const open = template.indexOf("{", i);
    if (open < 0) {
      out += template.slice(i);
      break;
    }
    out += template.slice(i, open);
    const close = matchBrace(template, open);
    if (close < 0) {
      out += template.slice(open);
      break;
    }
    out += placeholder(template.slice(open + 1, close), values, locale);
    i = close + 1;
  }
  return out;
}

function matchBrace(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}" && --depth === 0) return i;
  }
  return -1;
}

function placeholder(body: string, values: Record<string, string | number>, locale?: string): string {
  const m = /^\s*(\w+)\s*(?:,\s*plural\s*,(.*))?$/s.exec(body);
  if (!m) return `{${body}}`;
  const [, name, plural] = m;
  const v = values[name];
  if (plural === undefined) return v === undefined ? `{${name}}` : String(v);
  const n = typeof v === "number" ? v : Number(v);
  const forms = new Map<string, string>();
  const re = /\s*(=\d+|zero|one|two|few|many|other)\s*\{/g;
  let mm: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((mm = re.exec(plural))) {
    const start = mm.index + mm[0].length - 1;
    const end = matchBrace(plural, start);
    if (end < 0) break;
    forms.set(mm[1], plural.slice(start + 1, end));
    re.lastIndex = end + 1;
  }
  let rule = "other";
  try {
    rule = new Intl.PluralRules(locale).select(n);
  } catch {
    /* an unknown locale uses "other" */
  }
  const chosen = forms.get(`=${n}`) ?? forms.get(rule) ?? forms.get("other") ?? "";
  let num = String(v);
  if (Number.isFinite(n)) {
    try {
      num = new Intl.NumberFormat(locale).format(n);
    } catch {
      num = String(n); // an invalid locale tag must not break rendering
    }
  }
  // `#` is the number, but not inside a nested placeholder's braces.
  return formatMessage(chosen.replace(/#(?![^{]*})/g, num), values, locale);
}

/**
 * The message catalogue, English. Keys are grouped by component; a value may
 * use `{placeholders}`. Translating means supplying any subset of these to
 * LocaleProvider `messages`: what is left out stays English.
 */
export const DEFAULT_MESSAGES = {
  // Shared
  "common.close": "Close",
  "common.open": "Open",
  "common.cancel": "Cancel",
  "common.ok": "OK",
  "common.done": "Done",
  "common.clear": "Clear",
  "common.search": "Search",
  "common.delete": "Delete",

  // Combobox, MultiCombobox
  "combobox.placeholder": "Select…",
  "combobox.searchPlaceholder": "Search…",
  "combobox.noResults": "No results.",
  "combobox.loading": "Loading…",
  "combobox.create": "Create",
  "combobox.createOption": "{verb} “{text}”",
  "combobox.remove": "Remove {label}",

  // DatePicker, Calendar, DateInput, DateRangePicker, DateTimePicker, TimePicker
  "calendar.previousMonth": "Previous month",
  "calendar.nextMonth": "Next month",
  "datePicker.placeholder": "Pick a date",
  "dateInput.chooseDate": "Choose a date",
  "dateInput.hint": "Type a date as {pattern}, or t for today, +7 for a week ahead. Arrow keys move a day.",
  "dateRangePicker.placeholder": "Pick a date range",
  "dateTimePicker.placeholder": "Pick date & time",
  "dateTimePicker.time": "Time",
  "timePicker.label": "Time",
  "timePicker.hours": "Hours",
  "timePicker.minutes": "Minutes",
  "timePicker.seconds": "Seconds",
  "timePicker.am": "AM",
  "timePicker.pm": "PM",

  // NumberField, PasswordInput, PhoneInput, Search, TagInput
  "numberField.decrement": "Decrement",
  "numberField.increment": "Increment",
  "passwordInput.show": "Show password",
  "passwordInput.hide": "Hide password",
  "phoneInput.placeholder": "Phone number",
  "search.clear": "Clear search",
  "tagInput.placeholder": "Add a tag…",
  "tagInput.remove": "Remove {tag}",

  // AmountField, QuantityField
  "amountField.inCurrency": "Amount in {currency}.",
  "amountField.shorthand": "You can type 2.5L for 2,50,000, 1.2Cr, or 15k.",
  "quantityField.inUnit": "Quantity in {unit}.",
  "quantityField.shorthand": "You can type 2.5k for 2,500.",

  // LookupField
  "lookupField.typeMore": "Type {count} or more characters to search",
  "lookupField.searching": "Searching…",
  "lookupField.failed": "The search failed",
  "lookupField.noMatches": "No matches",
  "lookupField.results": "{count, plural, one {# result} other {# results}}",
  "lookupField.searchAll": "Search all (F4)",

  // FilterBuilder
  "filterBuilder.label": "Filter",
  "filterBuilder.match": "Match",
  "filterBuilder.theseConditions": "these conditions",
  "filterBuilder.all": "All of",
  "filterBuilder.any": "Any of",
  "filterBuilder.none": "None of",
  "filterBuilder.notAll": "Not all of",
  "filterBuilder.groupLabel": "Group: {match} these",
  "filterBuilder.removeGroup": "Remove group",
  "filterBuilder.addCondition": "Condition",
  "filterBuilder.addGroup": "Group",
  "filterBuilder.emptyGroup": "An empty group filters nothing.",
  "filterBuilder.emptyRoot": "No conditions: every row matches.",
  "filterBuilder.field": "Condition {n}, field",
  "filterBuilder.operator": "Condition {n}, operator",
  "filterBuilder.values": "Condition {n}, values",
  "filterBuilder.value": "Condition {n}, value",
  "filterBuilder.from": "Condition {n}, from",
  "filterBuilder.to": "Condition {n}, to",
  "filterBuilder.and": "and",
  "filterBuilder.choose": "Choose…",
  "filterBuilder.removeCondition": "Remove condition",
  "filterBuilder.removeConditionN": "Remove condition {n}",
  "filterBuilder.shows": "Shows: ",
  "filterBuilder.showsEverything": "every row (no condition is finished yet)",

  // ViewManager
  "viewManager.label": "View",
  "viewManager.standard": "Standard",
  "viewManager.trigger": "{label}: {name}",
  "viewManager.triggerModified": "{label}: {name}, modified",
  "viewManager.modified": "Modified",
  "viewManager.views": "Views",
  "viewManager.shared": "Shared",
  "viewManager.default": "Default",
  "viewManager.save": "Save",
  "viewManager.saveAs": "Save as…",
  "viewManager.openWithThis": "Open with this view",
  "viewManager.openWith": "Open with {name}",
  "viewManager.openWithQuoted": "Open with “{name}”",
  "viewManager.copyLink": "Copy link",
  "viewManager.manage": "Manage views…",
  "viewManager.saved": "Saved “{name}”.",
  "viewManager.saveFailed": "Could not save “{name}”: {error}",
  "viewManager.linkCopied": "Link to “{name}” copied.",
  "viewManager.newView": "New view",
  "viewManager.saveAsTitle": "Save view as",
  "viewManager.saveAsDescription": "Saves the filters, sort and columns on screen now under a new name.",
  "viewManager.name": "Name",
  "viewManager.openByDefault": "Open the screen with this view",
  "viewManager.notSaved": "Not saved: {error}",
  "viewManager.manageTitle": "Manage views",
  "viewManager.manageDescription": "Rename or delete your views, and choose the one the screen opens with.",
  "viewManager.nameOf": "Name of “{name}”",
  "viewManager.notRenamed": "Not renamed: {error}",
  "viewManager.sharedWithYou": "· shared with you",
  "viewManager.readOnly": "· read only",
  "viewManager.deleteView": "Delete “{name}”",
  "viewManager.confirmDelete": "Confirm: delete “{name}”",
  "viewManager.pressAgain": "Press again to delete",

  // TreeSelect, SelectList, SelectDialog
  "selectList.placeholder": "Search",
  "selectList.empty": "No matching items",
  "treeSelect.noMatches": "No matches",

  // FilterBar
  "filterBar.adapt": "Adapt filters",
  "filterBar.collapse": "Collapse filters",
  "filterBar.expand": "Expand filters",
  "filterBar.go": "Go",
  "filterBar.adaptDescription": "Choose which filters appear on the bar.",

  // ValueHelp
  "valueHelp.selectTab": "Select from list",
  "valueHelp.conditionsTab": "Define conditions",
  "valueHelp.addCondition": "Add condition",
  "valueHelp.noConditions": "No conditions yet.",
  "valueHelp.exclude": "Exclude condition {id}",
  "valueHelp.excludeLabel": "Exclude",
  "valueHelp.operator": "Operator",
  "valueHelp.value": "Value",
  "valueHelp.to": "To",
  "valueHelp.toValue": "To value",
  "valueHelp.removeCondition": "Remove condition",
  "valueHelp.op.EQ": "equals",
  "valueHelp.op.Contains": "contains",
  "valueHelp.op.StartsWith": "starts with",
  "valueHelp.op.EndsWith": "ends with",
  "valueHelp.op.BT": "between",
  "valueHelp.op.LT": "less than",
  "valueHelp.op.LE": "less or equal",
  "valueHelp.op.GT": "greater than",
  "valueHelp.op.GE": "greater or equal",

  // DataTable
  "dataTable.total": "Total",
  "dataTable.export": "Export",
  "dataTable.exportTo": "Export to",
  "dataTable.exportExcel": "Excel (.xlsx)",
  "dataTable.exportPdf": "PDF (.pdf)",
  "dataTable.exportCsv": "CSV (.csv)",
  "dataTable.exportOnlySelected": "{count, plural, one {Only the selected row} other {Only the # selected rows}}",
  "dataTable.exportPreparing": "Preparing export…",
  "dataTable.exportReady": "Export ready.",
  "dataTable.exportFailed": "Export failed: {error}",
  "dataTable.reorder": "Reorder",
  "dataTable.expand": "Expand",
  "dataTable.selectAll": "Select all rows",
  "dataTable.selectRow": "Select row {n}",
  "dataTable.noResults": "No results.",
  "dataTable.search": "Search…",
  "dataTable.groupRowsBy": "Group rows by",
  "dataTable.bulkActions": "Bulk actions for selected rows",
  "dataTable.clearSelection": "Clear selection",
  "dataTable.activeFilters": "Active filters",
  "dataTable.filtersLabel": "Filters:",
  "dataTable.searchChip": "Search: {value}",
  "dataTable.filterChip": "{column}: {value}",
  "dataTable.clearAll": "Clear all",
  "dataTable.removeChip": "Remove {label}",
  "dataTable.exportSelectedRows": "Export selected rows",
  "dataTable.exportVisibleRows": "Export visible rows",
  "dataTable.exportJson": "JSON (.json)",
  "dataTable.columns": "Columns",
  "dataTable.toggleColumn": "Toggle visibility of {label}",
  "dataTable.dragRow": "Drag to reorder row",
  "dataTable.sortBy": "Sort by {column}, currently {state}",
  "dataTable.sortAscending": "ascending",
  "dataTable.sortDescending": "descending",
  "dataTable.sortNone": "none",
  "dataTable.sortPriority": "Sort priority {n}",
  "dataTable.resize": "Resize {column}",
  "dataTable.rowsPerPage": "Rows per page",
  "dataTable.firstPage": "First page",
  "dataTable.previousPage": "Previous page",
  "dataTable.nextPage": "Next page",
  "dataTable.lastPage": "Last page",
  "dataTable.pageOf": "Page {page} of {pages}",
  "dataTable.selectedOf": "{selected} of {total} row(s) selected.",
  "dataTable.filterPlaceholder": "Filter…",
  "dataTable.filterColumn": "Filter {column}",
  "dataTable.min": "min",
  "dataTable.max": "max",
  "dataTable.columnMinimum": "{column} minimum",
  "dataTable.columnMaximum": "{column} maximum",
  "dataTable.any": "Any",
  "dataTable.yes": "Yes",
  "dataTable.no": "No",
  "dataTable.actions": "Actions",
  "treeTable.search": "Search",
  "treeTable.loading": "Loading…",
  "treeTable.previous": "Previous",
  "treeTable.next": "Next",
  "pagination.label": "pagination",
  "pagination.previous": "Go to previous page",
  "pagination.next": "Go to next page",
  "pivot.values": "{label} values",
  "pivot.loadingValue": "Loading value",
  "pivot.loadingMore": "Loading more…",
  "pivot.dropHere": "Drop fields here",
  "pivot.move": "Move {label}",
  "pivot.removeFromLayout": "Remove from layout",
  "pivot.nSelected": "{count} selected",
  "pivot.aggregationFor": "Aggregation for {label}",
  "pivot.removeFrom": "Remove {label} from {zone}",
  "pivot.removeField": "Remove field",
  "pivot.sortOrFilter": "Sort or filter {label}",
  "pivot.filterFor": "{label} filter",
  "pivot.sortAscending": "Sort ascending",
  "pivot.sortDescending": "Sort descending",
  "pivot.searchPlaceholder": "Search {label}…",
  "pivot.searchValues": "Search {label} values",
  "pivot.selectAll": "Select all",
  "pivot.loadingValues": "Loading values…",
  "pivot.loadFailed": "Could not load values.",
  "pivot.tryAgain": "Try again",
  "pivot.noMatchingValues": "No matching values",
  "pivot.clearFilter": "Clear filter",
  "pivot.grid": "Pivot grid",
  "pivot.clearFilters": "Clear filters",
  "pivot.availableFields": "Available Fields",
  "pivot.valuesZone": "Values",
  "pivot.rowsZone": "Rows",
  "pivot.columnsZone": "Columns",
  "pivot.valueRequired": "Value field required",
  "pivot.valueRequiredHelp": "Drop at least one field into Values to calculate data.",
  "pivot.dimensionRequired": "Dimension required",
  "pivot.dimensionRequiredHelp": "Drop at least one field into Rows or Columns.",
  "spreadsheet.row": "Row",
  "chart.label": "{type} chart",
  "chart.data": "Chart data",
  "chart.value": "Value",
  "chart.share": "Share",
  "microChart.line": "Line chart, {count} points, {trend}",
  "microChart.rising": "rising",
  "microChart.falling": "falling",
  "microChart.flat": "flat",
  "microChart.bar": "Bar chart, {count} bars",
  "microChart.bullet": "{value} of {max}",
  "microChart.bulletTarget": "{value} of {max}, target {target}",
  "microChart.delta": "{from} to {to}, {direction} {amount}",
  "microChart.up": "up",
  "microChart.down": "down",
  "microChart.unchanged": "unchanged",
  "microChart.percent": "{value} percent",
  "chart.donut": "Donut chart",
  "chart.pie": "Pie chart",
  "treeTable.collapseAll": "Collapse all",
  "treeTable.expandAll": "Expand all",
  "pivot.removedFromLayout": "{field} removed from the layout.",
  "pivot.movedTo": "{field} moved to {zone}.",
  "pivot.movedToAt": "{field} moved to {zone} at position {position}.",
  "pivot.moveCancelled": "Move cancelled.",
  "pivot.zoneAvailable": "Available fields",
  "pivot.zoneRows": "Rows",
  "pivot.zoneColumns": "Columns",
  "pivot.zoneValues": "Values",

  // ViewSettingsDialog
  "viewSettings.title": "View settings",
  "viewSettings.sort": "Sort",
  "viewSettings.group": "Group",
  "viewSettings.filter": "Filter",
  "viewSettings.reset": "Reset",
  "viewSettings.descending": "Descending",
  "viewSettings.noValues": "No values",
  "viewSettings.noGroupFields": "No group fields",
  "viewSettings.noSortFields": "No sort fields",
} as const satisfies Record<string, string>;

export type MessageKey = keyof typeof DEFAULT_MESSAGES;
export type ZenMessages = { [K in MessageKey]: string };

import type { Column, FilterFn } from "@tanstack/react-table";

/** Pick the human-readable header label off a column, falling back to id when
 *  the header is a function / JSX node. Used to build accessible names like
 *  "Filter Status" instead of "Filter status". */
const headerLabel = (column: Column<unknown, unknown>): string => {
  const h = column.columnDef.header;
  return typeof h === "string" ? h : column.id;
};
import { cn } from "../../lib/cn";
import { Input } from "../form/input/input";
import { NumberField } from "../form/number-field/number-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../form/select/select";

/**
 * Filter variants for per-column filters in DataTable.
 *
 * Declare on each column's `meta.filterVariant`. When set, DataTable
 * renders the matching input control (instead of the default <Input>)
 * AND auto-attaches the matching `filterFn` if the column hasn't
 * specified its own.
 *
 *   columns = [
 *     { accessorKey: "name",   header: "Name",   meta: { filterVariant: "text" } },
 *     { accessorKey: "score",  header: "Score",  meta: { filterVariant: "numberRange" } },
 *     { accessorKey: "role",   header: "Role",
 *       meta: { filterVariant: "select",
 *               filterOptions: [{ label: "Admin", value: "Admin" }, …] } },
 *   ];
 */
export type FilterVariant =
  | "text"
  | "number"
  | "numberRange"
  | "select"
  | "boolean";

export type TextOp = "contains" | "equals" | "starts" | "ends";
export interface TextFilterValue {
  op: TextOp;
  value: string;
}

export type NumberOp = "eq" | "ne" | "gt" | "lt" | "gte" | "lte";
export interface NumberFilterValue {
  op: NumberOp;
  value: number | null;
}

export type NumberRangeFilterValue = [number | null, number | null];

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends unknown, TValue> {
    filterVariant?: FilterVariant;
    /** Options used by the `select` variant. */
    filterOptions?: { label: string; value: string }[];
  }
}

/* ---------------------------- filter functions ----------------------------- */

const empty = (s: unknown) =>
  s === null || s === undefined || (typeof s === "string" && s.length === 0);

const textFilterFn: FilterFn<unknown> = (row, columnId, filter) => {
  const f = filter as TextFilterValue | string | undefined;
  // Back-compat: if someone passes a bare string, treat as "contains".
  const op: TextOp = typeof f === "object" && f ? f.op : "contains";
  const needle = String(typeof f === "object" && f ? f.value : f ?? "")
    .toLowerCase()
    .trim();
  if (!needle) return true;
  const cell = String(row.getValue(columnId) ?? "").toLowerCase();
  switch (op) {
    case "equals":
      return cell === needle;
    case "starts":
      return cell.startsWith(needle);
    case "ends":
      return cell.endsWith(needle);
    case "contains":
    default:
      return cell.includes(needle);
  }
};

const numberFilterFn: FilterFn<unknown> = (row, columnId, filter) => {
  const f = filter as NumberFilterValue | undefined;
  if (!f || empty(f.value)) return true;
  const cell = Number(row.getValue(columnId));
  if (Number.isNaN(cell)) return false;
  const target = f.value as number;
  switch (f.op) {
    case "eq":
      return cell === target;
    case "ne":
      return cell !== target;
    case "gt":
      return cell > target;
    case "lt":
      return cell < target;
    case "gte":
      return cell >= target;
    case "lte":
      return cell <= target;
    default:
      return true;
  }
};

const numberRangeFilterFn: FilterFn<unknown> = (row, columnId, filter) => {
  const [min, max] = (filter as NumberRangeFilterValue | undefined) ?? [null, null];
  if (empty(min) && empty(max)) return true;
  const cell = Number(row.getValue(columnId));
  if (Number.isNaN(cell)) return false;
  if (!empty(min) && cell < (min as number)) return false;
  if (!empty(max) && cell > (max as number)) return false;
  return true;
};

const selectFilterFn: FilterFn<unknown> = (row, columnId, filter) => {
  if (filter === undefined || filter === null || filter === "") return true;
  return String(row.getValue(columnId)) === String(filter);
};

const booleanFilterFn: FilterFn<unknown> = (row, columnId, filter) => {
  if (filter === null || filter === undefined || filter === "any") return true;
  const cell = Boolean(row.getValue(columnId));
  return cell === (filter === true || filter === "true");
};

export const filterFnByVariant: Record<FilterVariant, FilterFn<unknown>> = {
  text: textFilterFn,
  number: numberFilterFn,
  numberRange: numberRangeFilterFn,
  select: selectFilterFn,
  boolean: booleanFilterFn,
};

/* ---------------------------- variant inputs ------------------------------ */

const TEXT_OPS: { value: TextOp; label: string; symbol: string }[] = [
  { value: "contains", label: "Contains", symbol: "≈" },
  { value: "equals", label: "Equals", symbol: "=" },
  { value: "starts", label: "Starts with", symbol: "a…" },
  { value: "ends", label: "Ends with", symbol: "…a" },
];

const NUMBER_OPS: { value: NumberOp; label: string; symbol: string }[] = [
  { value: "eq", label: "Equals", symbol: "=" },
  { value: "ne", label: "Not equal", symbol: "≠" },
  { value: "gt", label: "Greater than", symbol: ">" },
  { value: "lt", label: "Less than", symbol: "<" },
  { value: "gte", label: "Greater or equal", symbol: "≥" },
  { value: "lte", label: "Less or equal", symbol: "≤" },
];

/** Tiny op-button styled to fit alongside the value input in a filter row. */
function OpSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string; symbol: string }[];
  ariaLabel: string;
}) {
  const current = options.find((o) => o.value === value) ?? options[0];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      aria-label={ariaLabel}
      title={current.label}
      className={cn(
        "zen-h-7 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background",
        "zen-px-1 zen-text-xs zen-cursor-pointer",
        "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
      )}
      style={{ minWidth: 36 }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.symbol}
        </option>
      ))}
    </select>
  );
}

function TextFilter({ column }: { column: Column<unknown> }) {
  const raw = column.getFilterValue() as TextFilterValue | undefined;
  const op = raw?.op ?? "contains";
  const value = raw?.value ?? "";
  const setNext = (next: Partial<TextFilterValue>) =>
    column.setFilterValue({ op, value, ...next });
  return (
    <div className="zen-flex zen-items-center zen-gap-1">
      <OpSelect
        value={op}
        onChange={(o) => setNext({ op: o })}
        options={TEXT_OPS}
        ariaLabel={`${headerLabel(column)} filter operator`}
      />
      <Input
        value={value}
        onChange={(e) => setNext({ value: e.target.value })}
        placeholder="Filter…"
        aria-label={`Filter ${headerLabel(column)}`}
        className="zen-h-7 zen-text-xs zen-flex-1 zen-min-w-0"
      />
    </div>
  );
}

function NumberFilter({ column }: { column: Column<unknown> }) {
  const raw = column.getFilterValue() as NumberFilterValue | undefined;
  const op = raw?.op ?? "eq";
  const value = raw?.value ?? null;
  return (
    <div className="zen-flex zen-items-center zen-gap-1">
      <OpSelect
        value={op}
        onChange={(o) =>
          column.setFilterValue({ op: o, value } satisfies NumberFilterValue)
        }
        options={NUMBER_OPS}
        ariaLabel={`${headerLabel(column)} filter operator`}
      />
      <NumberField
        value={value ?? undefined}
        onValueChange={(v) =>
          column.setFilterValue({
            op,
            value: v ?? null,
          } satisfies NumberFilterValue)
        }
        placeholder="…"
        aria-label={`Filter ${headerLabel(column)}`}
        className="zen-h-7 zen-text-xs zen-flex-1 zen-min-w-0"
      />
    </div>
  );
}

function NumberRangeFilter({ column }: { column: Column<unknown> }) {
  const [min, max] = (column.getFilterValue() as NumberRangeFilterValue | undefined) ?? [
    null,
    null,
  ];
  return (
    <div className="zen-flex zen-items-center zen-gap-1">
      <NumberField
        value={min ?? undefined}
        onValueChange={(v) =>
          column.setFilterValue([v ?? null, max] satisfies NumberRangeFilterValue)
        }
        placeholder="min"
        aria-label={`${headerLabel(column)} minimum`}
        className="zen-h-7 zen-text-xs zen-min-w-0 zen-flex-1"
      />
      <span className="zen-text-zen-muted-fg zen-text-xs" aria-hidden>
        –
      </span>
      <NumberField
        value={max ?? undefined}
        onValueChange={(v) =>
          column.setFilterValue([min, v ?? null] satisfies NumberRangeFilterValue)
        }
        placeholder="max"
        aria-label={`${headerLabel(column)} maximum`}
        className="zen-h-7 zen-text-xs zen-min-w-0 zen-flex-1"
      />
    </div>
  );
}

function SelectFilter({
  column,
  options,
}: {
  column: Column<unknown>;
  options: { label: string; value: string }[];
}) {
  const value = (column.getFilterValue() as string | undefined) ?? "";
  return (
    <Select
      value={value || "__all__"}
      onValueChange={(v) =>
        column.setFilterValue(v === "__all__" ? undefined : v)
      }
    >
      <SelectTrigger
        aria-label={`Filter ${headerLabel(column)}`}
        className="zen-h-7 zen-text-xs"
      >
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function BooleanFilter({ column }: { column: Column<unknown> }) {
  const value = column.getFilterValue();
  const current =
    value === true || value === "true"
      ? "true"
      : value === false || value === "false"
      ? "false"
      : "any";
  return (
    <select
      value={current}
      onChange={(e) => {
        const v = e.target.value;
        column.setFilterValue(v === "any" ? undefined : v === "true");
      }}
      aria-label={`Filter ${headerLabel(column)}`}
      className={cn(
        "zen-h-7 zen-w-full zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background",
        "zen-px-2 zen-text-xs zen-cursor-pointer",
        "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
      )}
    >
      <option value="any">Any</option>
      <option value="true">Yes</option>
      <option value="false">No</option>
    </select>
  );
}

/* ---------------------------- dispatcher ----------------------------------- */

export function FilterCell<TData>({
  column,
}: {
  column: Column<TData, unknown>;
}) {
  if (!column.getCanFilter()) return null;
  const meta = column.columnDef.meta as
    | {
        filterVariant?: FilterVariant;
        filterOptions?: { label: string; value: string }[];
      }
    | undefined;
  // Cast to the unbranded Column<unknown> the variant inputs accept — the
  // filter helpers don't introspect TData, so widening here is safe.
  const c = column as unknown as Column<unknown>;
  switch (meta?.filterVariant) {
    case "number":
      return <NumberFilter column={c} />;
    case "numberRange":
      return <NumberRangeFilter column={c} />;
    case "select":
      return <SelectFilter column={c} options={meta.filterOptions ?? []} />;
    case "boolean":
      return <BooleanFilter column={c} />;
    case "text":
    default:
      return <TextFilter column={c} />;
  }
}

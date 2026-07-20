import { For, type JSX, Show } from "solid-js";
import type { Column, FilterFn, RowData } from "@tanstack/solid-table";
import { cn } from "../../lib/cn";
import { Input } from "../form/input/input";
import { NumberField } from "../form/number-field/number-field";
import { Select } from "../form/select/select";

/**
 * Per-column filter variants for the Solid DataTable.
 *
 * Declare on each column's `meta.filterVariant`. When set, DataTable
 * renders the matching input control (instead of the default <Input>)
 * AND auto-attaches the matching `filterFn` if the column hasn't
 * specified its own. Mirrors the React binding's filter machinery.
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

declare module "@tanstack/solid-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
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
    case "eq": return cell === target;
    case "ne": return cell !== target;
    case "gt": return cell > target;
    case "lt": return cell < target;
    case "gte": return cell >= target;
    case "lte": return cell <= target;
    default: return true;
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

const headerLabel = (column: Column<unknown, unknown>): string => {
  const h = column.columnDef.header;
  return typeof h === "string" ? h : column.id;
};

function OpSelect<T extends string>(props: {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string; symbol: string }[];
  ariaLabel: string;
}): JSX.Element {
  return (
    <select
      value={props.value}
      onChange={(e) => props.onChange(e.currentTarget.value as T)}
      aria-label={props.ariaLabel}
      class={cn(
        "zen-h-7 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background",
        "zen-px-1 zen-text-xs zen-cursor-pointer",
        "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
      )}
      style={{ "min-width": "36px" }}
    >
      <For each={props.options}>
        {(o) => <option value={o.value}>{o.symbol}</option>}
      </For>
    </select>
  );
}

function TextFilter(props: { column: Column<unknown, unknown> }) {
  const raw = () => props.column.getFilterValue() as TextFilterValue | undefined;
  const op = () => raw()?.op ?? "contains";
  const value = () => raw()?.value ?? "";
  const setNext = (next: Partial<TextFilterValue>) =>
    props.column.setFilterValue({ op: op(), value: value(), ...next });
  return (
    <div class="zen-flex zen-items-center zen-gap-1">
      <OpSelect
        value={op()}
        onChange={(o) => setNext({ op: o })}
        options={TEXT_OPS}
        ariaLabel={`${headerLabel(props.column)} filter operator`}
      />
      <Input
        value={value()}
        onInput={(e) => setNext({ value: e.currentTarget.value })}
        placeholder="Filter…"
        aria-label={`Filter ${headerLabel(props.column)}`}
        class="zen-h-7 zen-text-xs zen-flex-1 zen-min-w-0"
      />
    </div>
  );
}

function NumberFilter(props: { column: Column<unknown, unknown> }) {
  const raw = () => props.column.getFilterValue() as NumberFilterValue | undefined;
  const op = () => raw()?.op ?? "eq";
  const value = () => raw()?.value ?? null;
  return (
    <div class="zen-flex zen-items-center zen-gap-1">
      <OpSelect
        value={op()}
        onChange={(o) =>
          props.column.setFilterValue({ op: o, value: value() } satisfies NumberFilterValue)
        }
        options={NUMBER_OPS}
        ariaLabel={`${headerLabel(props.column)} filter operator`}
      />
      <NumberField
        value={value() ?? undefined}
        onValueChange={(v) =>
          props.column.setFilterValue({
            op: op(),
            value: v ?? null,
          } satisfies NumberFilterValue)
        }
        placeholder="…"
        aria-label={`Filter ${headerLabel(props.column)}`}
        class="zen-h-7 zen-text-xs zen-flex-1 zen-min-w-0"
      />
    </div>
  );
}

function NumberRangeFilter(props: { column: Column<unknown, unknown> }) {
  const range = () =>
    (props.column.getFilterValue() as NumberRangeFilterValue | undefined) ?? [null, null];
  return (
    <div class="zen-flex zen-items-center zen-gap-1">
      <NumberField
        value={range()[0] ?? undefined}
        onValueChange={(v) =>
          props.column.setFilterValue([
            v ?? null,
            range()[1],
          ] satisfies NumberRangeFilterValue)
        }
        placeholder="min"
        aria-label={`${headerLabel(props.column)} minimum`}
        class="zen-h-7 zen-text-xs zen-min-w-0 zen-flex-1"
      />
      <span class="zen-text-zen-muted-fg zen-text-xs" aria-hidden>–</span>
      <NumberField
        value={range()[1] ?? undefined}
        onValueChange={(v) =>
          props.column.setFilterValue([
            range()[0],
            v ?? null,
          ] satisfies NumberRangeFilterValue)
        }
        placeholder="max"
        aria-label={`${headerLabel(props.column)} maximum`}
        class="zen-h-7 zen-text-xs zen-min-w-0 zen-flex-1"
      />
    </div>
  );
}

function SelectFilter(props: {
  column: Column<unknown, unknown>;
  options: { label: string; value: string }[];
}) {
  const value = () => (props.column.getFilterValue() as string | undefined) ?? "";
  return (
    <Select
      options={[{ value: "__all__", label: "All" }, ...props.options]}
      value={value() || "__all__"}
      onChange={(v) =>
        props.column.setFilterValue(v === "__all__" ? undefined : v)
      }
    />
  );
}

function BooleanFilter(props: { column: Column<unknown, unknown> }) {
  const value = () => props.column.getFilterValue();
  const current = () =>
    value() === true || value() === "true"
      ? "true"
      : value() === false || value() === "false"
        ? "false"
        : "any";
  return (
    <select
      value={current()}
      onChange={(e) => {
        const v = e.currentTarget.value;
        props.column.setFilterValue(v === "any" ? undefined : v === "true");
      }}
      aria-label={`Filter ${headerLabel(props.column)}`}
      class={cn(
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

export function FilterCell<TData>(props: { column: Column<TData, unknown> }) {
  return (
    <Show when={props.column.getCanFilter()}>
      {(() => {
        const meta = props.column.columnDef.meta as
          | {
              filterVariant?: FilterVariant;
              filterOptions?: { label: string; value: string }[];
            }
          | undefined;
        const c = props.column as unknown as Column<unknown, unknown>;
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
      })()}
    </Show>
  );
}

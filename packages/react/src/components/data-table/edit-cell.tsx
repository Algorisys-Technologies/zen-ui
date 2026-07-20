import * as React from "react";
import type { Cell, RowData } from "@tanstack/react-table";
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
 * Inline cell editing.
 *
 * Declare `meta.editable: true` on a column (or a function
 * `(row) => boolean` for per-row control) and DataTable will:
 *
 *   - render the cell normally until activated
 *   - activate on double-click or Enter / Space when the cell is focused
 *   - swap the cell content for the matching input control
 *     (text by default, number / select via `meta.editVariant`)
 *   - commit on Enter or blur via the caller's `onCellEdit(payload)`
 *   - cancel on Escape (restore prior render)
 *
 * The component is uncontrolled with respect to data — the caller still
 * owns the source `data` array and updates it from `onCellEdit`.
 *
 *   <DataTable
 *     data={rows}
 *     columns={[
 *       { accessorKey: "name", header: "Name",
 *         meta: { editable: true } },
 *       { accessorKey: "salary", header: "Salary",
 *         meta: { editable: true, editVariant: "number" } },
 *       { accessorKey: "role", header: "Role",
 *         meta: { editable: true, editVariant: "select",
 *                 editOptions: [{ label: "Admin", value: "Admin" }, …] } },
 *     ]}
 *     onCellEdit={({ rowId, columnId, value }) => {
 *       setRows(prev => prev.map(r =>
 *         r.id === rowId ? { ...r, [columnId]: value } : r));
 *     }}
 *   />
 */

export type EditVariant = "text" | "number" | "select";

export interface CellEditPayload {
  /** Stable row id — pass `getRowId` on your column defs for reliable identity. */
  rowId: string;
  columnId: string;
  /** Newly committed value. Stringified for text; number-or-null for number. */
  value: unknown;
}

export interface EditingState {
  rowId: string;
  columnId: string;
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    editable?: boolean | ((row: TData) => boolean);
    editVariant?: EditVariant;
    /** Options used by the `select` edit variant. */
    editOptions?: { label: string; value: string }[];
  }
}

/* ---------------------------- editor inputs -------------------------------- */

interface EditorProps {
  initialValue: unknown;
  onCommit: (value: unknown) => void;
  onCancel: () => void;
}

const editorWrapClass =
  "zen-flex zen-items-center zen-w-full zen-h-full zen-m-[-0.5rem] zen-p-[0.4rem] zen-bg-zen-background zen-ring-2 zen-ring-zen-ring zen-rounded-zen-sm";

function TextEditor({ initialValue, onCommit, onCancel }: EditorProps) {
  const [value, setValue] = React.useState(String(initialValue ?? ""));
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <div className={editorWrapClass}>
      <Input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onCommit(value);
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        onBlur={() => onCommit(value)}
        className="zen-h-7 zen-text-sm zen-border-0 zen-ring-0 focus-visible:zen-ring-0 zen-px-1"
      />
    </div>
  );
}

function NumberEditor({ initialValue, onCommit, onCancel }: EditorProps) {
  const initial =
    typeof initialValue === "number"
      ? initialValue
      : initialValue === "" || initialValue === null || initialValue === undefined
      ? null
      : Number(initialValue);
  const [value, setValue] = React.useState<number | null>(
    Number.isNaN(initial as number) ? null : initial,
  );
  // NumberField doesn't expose a ref-to-input; we approximate auto-focus
  // by mounting and letting the inner <input> take focus through the
  // wrapper's tabIndex chain. Most browsers focus the first focusable
  // child of a freshly-mounted control here.
  return (
    <div
      className={editorWrapClass}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCommit(value);
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      onBlur={(e) => {
        // Only commit when focus leaves the whole wrapper, not on internal
        // focus jumps (e.g. clicking the ± steppers).
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          onCommit(value);
        }
      }}
      tabIndex={-1}
    >
      <NumberField
        value={value ?? undefined}
        onValueChange={setValue}
        className="zen-h-7 zen-text-sm zen-border-0 zen-ring-0 focus-visible:zen-ring-0 zen-px-1"
      />
    </div>
  );
}

function SelectEditor({
  initialValue,
  onCommit,
  onCancel,
  options,
}: EditorProps & { options: { label: string; value: string }[] }) {
  return (
    <div
      className={editorWrapClass}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
    >
      <Select
        defaultValue={String(initialValue ?? "")}
        onValueChange={(v) => onCommit(v)}
        open
        onOpenChange={(open) => {
          // Closing the popover without picking = cancel back to the
          // last rendered value.
          if (!open) onCancel();
        }}
      >
        <SelectTrigger className="zen-h-7 zen-text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ---------------------------- public editor cell -------------------------- */

export interface EditableCellProps<TData> {
  cell: Cell<TData, unknown>;
  /** When true, this is the cell currently in edit mode. */
  editing: boolean;
  onStartEdit: () => void;
  onCommit: (value: unknown) => void;
  onCancel: () => void;
  /** The cell's rendered (non-edit) content. */
  children: React.ReactNode;
}

/**
 * EditableCell — wraps a cell renderer with double-click-to-edit + the
 * matching editor. Read-only / non-editable cells render through unchanged.
 */
export function EditableCell<TData>({
  cell,
  editing,
  onStartEdit,
  onCommit,
  onCancel,
  children,
}: EditableCellProps<TData>) {
  const meta = cell.column.columnDef.meta as
    | {
        editable?: boolean | ((row: TData) => boolean);
        editVariant?: EditVariant;
        editOptions?: { label: string; value: string }[];
      }
    | undefined;
  const editable =
    typeof meta?.editable === "function"
      ? meta.editable(cell.row.original)
      : !!meta?.editable;

  if (!editable) return <>{children}</>;

  if (editing) {
    const variant = meta?.editVariant ?? "text";
    const value = cell.getValue();
    const props = { initialValue: value, onCommit, onCancel };
    switch (variant) {
      case "number":
        return <NumberEditor {...props} />;
      case "select":
        return <SelectEditor {...props} options={meta?.editOptions ?? []} />;
      case "text":
      default:
        return <TextEditor {...props} />;
    }
  }

  const colHeader = cell.column.columnDef.header;
  const columnName = typeof colHeader === "string" ? colHeader : cell.column.id;
  return (
    <div
      onDoubleClick={onStartEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStartEdit();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Edit ${columnName}`}
      className={cn(
        "zen-w-full zen-h-full zen-inline-flex zen-items-center zen-cursor-text",
        "zen-rounded-zen-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
      )}
    >
      {children}
    </div>
  );
}

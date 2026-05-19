import { type JSX, Show, createSignal, onMount } from "solid-js";
import type { Cell } from "@tanstack/solid-table";
import { cn } from "../../lib/cn";
import { Input } from "../form/input/input";
import { NumberField } from "../form/number-field/number-field";
import { Select } from "../form/select/select";

/**
 * Inline cell editing for the Solid DataTable. Mirrors the React
 * binding's edit-cell.tsx: declare `meta.editable: true` on a column
 * (or a `(row) => boolean`) and DataTable will activate inline editing
 * on double-click / Enter / Space; the matching editor (text / number /
 * select) renders in place and commits on Enter / blur, cancels on Esc.
 */

export type EditVariant = "text" | "number" | "select";

export interface CellEditPayload {
  rowId: string;
  columnId: string;
  value: unknown;
}

export interface EditingState {
  rowId: string;
  columnId: string;
}

declare module "@tanstack/solid-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends unknown, TValue> {
    editable?: boolean | ((row: TData) => boolean);
    editVariant?: EditVariant;
    editOptions?: { label: string; value: string }[];
  }
}

interface EditorProps {
  initialValue: unknown;
  onCommit: (value: unknown) => void;
  onCancel: () => void;
}

const editorWrapClass =
  "flex items-center w-full h-full m-[-0.5rem] p-[0.4rem] bg-zen-background ring-2 ring-zen-ring rounded-zen-sm";

function TextEditor(props: EditorProps) {
  const [value, setValue] = createSignal(String(props.initialValue ?? ""));
  let ref: HTMLInputElement | undefined;
  onMount(() => {
    ref?.focus();
    ref?.select();
  });
  return (
    <div class={editorWrapClass}>
      <Input
        ref={ref}
        value={value()}
        onInput={(e) => setValue(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            props.onCommit(value());
          } else if (e.key === "Escape") {
            e.preventDefault();
            props.onCancel();
          }
        }}
        onBlur={() => props.onCommit(value())}
        class="h-7 text-sm border-0 ring-0 focus-visible:ring-0 px-1"
      />
    </div>
  );
}

function NumberEditor(props: EditorProps) {
  const initial =
    typeof props.initialValue === "number"
      ? props.initialValue
      : props.initialValue === "" ||
          props.initialValue === null ||
          props.initialValue === undefined
        ? null
        : Number(props.initialValue);
  const [value, setValue] = createSignal<number | null>(
    Number.isNaN(initial as number) ? null : initial,
  );
  return (
    <div
      class={editorWrapClass}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          props.onCommit(value());
        } else if (e.key === "Escape") {
          e.preventDefault();
          props.onCancel();
        }
      }}
      onFocusOut={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          props.onCommit(value());
        }
      }}
      tabIndex={-1}
    >
      <NumberField
        value={value() ?? undefined}
        onValueChange={setValue}
        class="h-7 text-sm border-0 ring-0 focus-visible:ring-0 px-1"
      />
    </div>
  );
}

function SelectEditor(
  props: EditorProps & { options: { label: string; value: string }[] },
) {
  return (
    <div
      class={editorWrapClass}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          props.onCancel();
        }
      }}
    >
      <Select
        options={props.options}
        defaultValue={String(props.initialValue ?? "")}
        onChange={(v) => (v ? props.onCommit(v) : props.onCancel())}
      />
    </div>
  );
}

export interface EditableCellProps<TData> {
  cell: Cell<TData, unknown>;
  editing: boolean;
  onStartEdit: () => void;
  onCommit: (value: unknown) => void;
  onCancel: () => void;
  children: JSX.Element;
}

export function EditableCell<TData>(props: EditableCellProps<TData>) {
  const meta = () =>
    props.cell.column.columnDef.meta as
      | {
          editable?: boolean | ((row: TData) => boolean);
          editVariant?: EditVariant;
          editOptions?: { label: string; value: string }[];
        }
      | undefined;
  const editable = () => {
    const m = meta();
    if (!m) return false;
    return typeof m.editable === "function"
      ? m.editable(props.cell.row.original)
      : !!m.editable;
  };

  return (
    <Show
      when={editable()}
      fallback={<>{props.children}</>}
    >
      <Show
        when={props.editing}
        fallback={
          <div
            onDblClick={props.onStartEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                props.onStartEdit();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Edit ${
              typeof props.cell.column.columnDef.header === "string"
                ? props.cell.column.columnDef.header
                : props.cell.column.id
            }`}
            class={cn(
              "w-full h-full inline-flex items-center cursor-text",
              "rounded-zen-sm",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zen-ring",
            )}
          >
            {props.children}
          </div>
        }
      >
        {(() => {
          const variant = meta()?.editVariant ?? "text";
          const value = props.cell.getValue();
          const editorProps: EditorProps = {
            initialValue: value,
            onCommit: props.onCommit,
            onCancel: props.onCancel,
          };
          switch (variant) {
            case "number":
              return <NumberEditor {...editorProps} />;
            case "select":
              return <SelectEditor {...editorProps} options={meta()?.editOptions ?? []} />;
            case "text":
            default:
              return <TextEditor {...editorProps} />;
          }
        })()}
      </Show>
    </Show>
  );
}

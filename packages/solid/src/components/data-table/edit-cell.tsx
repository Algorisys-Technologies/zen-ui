import { type JSX, Show, createContext, createSignal, onMount, useContext } from "solid-js";
import type { Cell, RowData } from "@tanstack/solid-table";
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
  /** What was typed to start the edit (cell navigation): the editor starts from it. */
  seed?: string;
}

declare module "@tanstack/solid-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    editable?: boolean | ((row: TData) => boolean);
    editVariant?: EditVariant;
    editOptions?: { label: string; value: string }[];
  }
}

interface EditorProps {
  initialValue: unknown;
  /** The edit began by typing: keep the cursor after what was typed, not select it. */
  seeded?: boolean;
  onCommit: (value: unknown) => void;
  onCancel: () => void;
}

/**
 * Set by a virtualized table while it moves rows in the DOM. Moving a focused
 * element blurs it, synchronously, mid-update; that blur is not the user
 * leaving the editor, so it must not commit. The table puts the focus back
 * once the update is done.
 */
export const RowMoveContext = createContext<{ moving: boolean }>();

const editorWrapClass =
  "zen-flex zen-items-center zen-w-full zen-h-full zen-m-[-0.5rem] zen-p-[0.4rem] zen-bg-zen-background zen-ring-2 zen-ring-zen-ring zen-rounded-zen-sm";

function TextEditor(props: EditorProps) {
  const rowMove = useContext(RowMoveContext);
  const [value, setValue] = createSignal(String(props.initialValue ?? ""));
  // An editor ends once. Cancelling removes the input, and removing a focused
  // input fires its blur, which would otherwise save what Esc threw away.
  let done = false;
  const commit = () => {
    if (done) return;
    done = true;
    props.onCommit(value());
  };
  const cancel = () => {
    if (done) return;
    done = true;
    props.onCancel();
  };
  let ref: HTMLInputElement | undefined;
  onMount(() => {
    ref?.focus();
    if (props.seeded) ref?.setSelectionRange(ref.value.length, ref.value.length);
    else ref?.select();
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
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
        onBlur={() => {
          if (!rowMove?.moving) commit();
        }}
        class="zen-h-7 zen-text-sm zen-border-0 zen-ring-0 focus-visible:zen-ring-0 zen-px-1"
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
  // Ends once: see TextEditor.
  let done = false;
  const commit = () => {
    if (done) return;
    done = true;
    props.onCommit(value());
  };
  const cancel = () => {
    if (done) return;
    done = true;
    props.onCancel();
  };
  const rowMove = useContext(RowMoveContext);
  // NumberField does not hand out its input, so it is found and focused here:
  // without this the editor opened with focus nowhere and typing went to the
  // page.
  let wrap: HTMLDivElement | undefined;
  onMount(() => {
    const input = wrap?.querySelector("input");
    input?.focus();
    // A number input has no settable cursor; focusing leaves it after the value.
    if (!props.seeded) input?.select();
  });
  return (
    <div
      ref={wrap}
      class={editorWrapClass}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        }
      }}
      onFocusOut={(e) => {
        if (rowMove?.moving) return;
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) commit();
      }}
      tabIndex={-1}
    >
      <NumberField
        value={value() ?? undefined}
        onValueChange={setValue}
        class="zen-h-7 zen-text-sm zen-border-0 zen-ring-0 focus-visible:zen-ring-0 zen-px-1"
      />
    </div>
  );
}

function SelectEditor(
  props: EditorProps & { options: { label: string; value: string }[] },
) {
  let picked = false;
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
      {/* Opens at once, as React's does; closing it without a pick cancels.
          The close is read a tick later, so a pick's onChange lands first. */}
      <Select
        options={props.options}
        defaultValue={String(props.initialValue ?? "")}
        defaultOpen
        onChange={(v) => {
          picked = true;
          if (v) props.onCommit(v);
          else props.onCancel();
        }}
        onOpenChange={(open) => {
          if (open) return;
          const cancel = props.onCancel;
          queueMicrotask(() => !picked && cancel());
        }}
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
  /**
   * The table moves focus cell by cell (enableCellNavigation): the cell itself
   * is the focus target and starts the edit, so the display is not a button
   * of its own.
   */
  navigable?: boolean;
  /** What was typed to start this edit. */
  seed?: string;
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
          <Show
            when={!props.navigable}
            fallback={
              <div
                onDblClick={props.onStartEdit}
                class="zen-w-full zen-h-full zen-inline-flex zen-items-center zen-cursor-text"
              >
                {props.children}
              </div>
            }
          >
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
              "zen-w-full zen-h-full zen-inline-flex zen-items-center zen-cursor-text",
              "zen-rounded-zen-sm",
              "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
            )}
          >
            {props.children}
          </div>
          </Show>
        }
      >
        {/* eslint-disable solid/components-return-once --
            Not a component body. Solid's compiler treats an IIFE returning JSX
            as a DYNAMIC child and hoists it into the arrow it passes to
            insert(), which is the same shape it emits for a reactive
            `{props.x}` — verified by compiling this exact pattern with
            babel-preset-solid against reactive and static controls. The switch
            re-runs, so the rule's premise does not hold here. Same case as
            filters.tsx. */}
        {(() => {
          const variant = meta()?.editVariant ?? "text";
          const value = props.cell.getValue();
          // Typing a character starts the edit from it: a digit for a number,
          // anything for text; a select just opens.
          const seed = props.seed;
          const initialValue =
            seed === undefined || variant === "select"
              ? value
              : variant === "number"
                ? /^[0-9]$/.test(seed) ? Number(seed) : null
                : seed;
          const editorProps: EditorProps = {
            initialValue,
            seeded: seed !== undefined && variant !== "select",
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
        {/* eslint-enable solid/components-return-once */}
      </Show>
    </Show>
  );
}

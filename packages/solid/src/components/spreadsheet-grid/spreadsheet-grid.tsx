import { createMemo, createSignal, Index, Show, type JSX } from "solid-js";
import {
  parseRef,
  formatRef,
  evaluateFormula,
  formatCellValue,
  isCellError,
  type CellMap,
  type CellValue,
  type CellFormat,
} from "@algorisys/zen-ui-core/spreadsheet";
import { cn } from "../../lib/cn";

/**
 * SpreadsheetGrid — an editable grid of cells with formulas.
 *
 *   <SpreadsheetGrid rows={20} cols={8} cells={cells()} onCellsChange={setCells} />
 *
 * The evaluator is `@algorisys/zen-ui-core/spreadsheet` — a recursive-descent
 * parser, not `eval`, because a formula is text a candidate types and running it
 * as JavaScript hands them the page. It is small on purpose and honest about its
 * limits: anything it cannot work out renders as `#NAME?` or `#ERROR!` rather
 * than a plausible wrong number, which in an assessment is the difference
 * between failing and being failed incorrectly.
 *
 * Cells are a flat `{A1: value}` map rather than a 2-D array. A sparse sheet is
 * the normal case, the keys are the addresses users type, and it serialises to
 * JSON without a shape conversion at either end.
 *
 * Editing shows the FORMULA; the cell shows the RESULT.
 */

export type { CellMap, CellValue, CellFormat };

export interface SpreadsheetGridProps {
  rows?: number;
  cols?: number;
  /** `{A1: 10, B1: "=A1*2"}`. Controlled. */
  cells?: CellMap;
  onCellsChange?: (cells: CellMap) => void;
  /** Per-cell or per-column display format, keyed by address or column letter. */
  formats?: Record<string, CellFormat>;
  readOnly?: boolean;
  /** Column width. Default `"6rem"`. */
  colWidth?: string;
  onCellCommit?: (ref: string, raw: CellValue, evaluated: CellValue) => void;
  class?: string;
}

export const SpreadsheetGrid = (props: SpreadsheetGridProps) => {
  const [editing, setEditing] = createSignal<string | null>(null);
  const [draft, setDraft] = createSignal("");
  const [selected, setSelected] = createSignal("A1");

  const rows = () => props.rows ?? 12;
  const cols = () => props.cols ?? 6;
  const cells = () => props.cells ?? {};

  /* Every cell evaluated once per change, not per render — a 500-cell sheet
     re-parsing every formula on each keystroke is the difference between typing
     and waiting. */
  const evaluated = createMemo(() => {
    const source = cells();
    const out: CellMap = {};
    for (const key of Object.keys(source)) out[key] = evaluateFormula(source[key], source);
    return out;
  });

  const formatFor = (ref: string): CellFormat => {
    const col = ref.replace(/[0-9]/g, "");
    return props.formats?.[ref] ?? props.formats?.[col] ?? {};
  };

  const commit = (ref: string, raw: string) => {
    const next = { ...cells() };
    /* An emptied cell is DELETED, not stored as "". Otherwise a sheet slowly
       fills with empty strings that COUNT and AVERAGE then reason about. */
    if (raw === "") delete next[ref];
    else next[ref] = /^-?[0-9]*\.?[0-9]+$/.test(raw.trim()) ? Number(raw) : raw;

    props.onCellsChange?.(next);
    props.onCellCommit?.(ref, next[ref], evaluateFormula(next[ref], next));
    setEditing(null);
  };

  const move = (ref: string, dCol: number, dRow: number) => {
    const at = parseRef(ref);
    if (!at) return;
    setSelected(
      formatRef(
        Math.min(cols() - 1, Math.max(0, at.col + dCol)),
        Math.min(rows() - 1, Math.max(0, at.row + dRow)),
      ),
    );
  };

  const NAV: Record<string, [number, number]> = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
  };

  const onKeyDown = (e: KeyboardEvent, ref: string) => {
    const readOnly = props.readOnly ?? false;

    if (editing() === ref) {
      if (e.key === "Enter") {
        e.preventDefault();
        commit(ref, draft());
        move(ref, 0, 1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        /* Escape abandons the edit — a grid that commits on Escape is one you
           cannot back out of a mistake in. */
        setEditing(null);
      } else if (e.key === "Tab") {
        e.preventDefault();
        commit(ref, draft());
        move(ref, e.shiftKey ? -1 : 1, 0);
      }
      return;
    }

    const step = NAV[e.key];
    if (step) {
      e.preventDefault();
      move(ref, step[0], step[1]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      move(ref, e.shiftKey ? -1 : 1, 0);
    } else if (!readOnly && (e.key === "Enter" || e.key === "F2")) {
      e.preventDefault();
      setDraft(String(cells()[ref] ?? ""));
      setEditing(ref);
    } else if (!readOnly && (e.key === "Delete" || e.key === "Backspace")) {
      e.preventDefault();
      commit(ref, "");
    } else if (!readOnly && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      /*
       * Typing over a selected cell replaces it, as a spreadsheet does.
       *
       * preventDefault matters: without it the character is seeded into the
       * draft here AND inserted again by the browser into the input that
       * autofocuses on the next render, so the first keystroke lands twice —
       * "=" becomes "==" and every formula a user types is #ERROR!. Measured in
       * the React binding; the parser was never at fault.
       */
      e.preventDefault();
      setDraft(e.key);
      setEditing(ref);
    }
  };

  const headerCell =
    "zen-bg-zen-muted zen-text-zen-muted-fg zen-text-xs zen-font-medium zen-text-center zen-sticky";

  return (
    <div
      class={cn(
        "zen-w-full zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border",
        props.class,
      )}
    >
      {/*
        `table-fixed` with an explicit colgroup, so a column's width comes from
        the layout and never from its contents. Without it an <input> carries an
        intrinsic width of about twenty characters, so entering edit mode widened
        the cell from 96px to 186px and the whole table from 425 to 515 — the
        grid visibly jumped under the cursor on every edit.
      */}
      <table class="zen-table-fixed zen-border-collapse zen-text-sm">
        <colgroup>
          <col style={{ width: "2.5rem" }} />
          <Index each={Array.from({ length: cols() })}>
            {() => <col style={{ width: props.colWidth ?? "6rem" }} />}
          </Index>
        </colgroup>
        <thead>
          <tr>
            <th scope="col" class={cn(headerCell, "zen-start-0 zen-top-0 zen-z-20 zen-w-10")}>
              <span class="zen-sr-only">Row</span>
            </th>
            <Index each={Array.from({ length: cols() })}>
              {(_, c) => (
                <th
                  scope="col"
                  class={cn(
                    headerCell,
                    "zen-top-0 zen-z-10 zen-border zen-border-zen-border zen-px-1 zen-py-1",
                  )}
                >
                  {formatRef(c, 0).replace(/[0-9]/g, "")}
                </th>
              )}
            </Index>
          </tr>
        </thead>
        <tbody>
          <Index each={Array.from({ length: rows() })}>
            {(_, r) => (
              <tr>
                <th
                  scope="row"
                  class={cn(
                    headerCell,
                    "zen-start-0 zen-z-10 zen-border zen-border-zen-border zen-px-1",
                  )}
                >
                  {r + 1}
                </th>
                <Index each={Array.from({ length: cols() })}>
                  {(__, c) => {
                    const ref = () => formatRef(c, r);
                    const value = () => evaluated()[ref()];
                    return (
                      <td
                        class={cn(
                          "zen-border zen-border-zen-border zen-p-0",
                          selected() === ref() &&
                            "zen-outline zen-outline-2 -zen-outline-offset-2 zen-outline-zen-primary",
                        )}
                      >
                        <Show
                          when={editing() === ref()}
                          fallback={
                            <div
                              role="gridcell"
                              tabIndex={selected() === ref() ? 0 : -1}
                              aria-label={ref()}
                              aria-readonly={props.readOnly || undefined}
                              onFocus={() => setSelected(ref())}
                              onClick={() => setSelected(ref())}
                              onDblClick={() => {
                                if (props.readOnly) return;
                                setDraft(String(cells()[ref()] ?? ""));
                                setEditing(ref());
                              }}
                              onKeyDown={(e) => onKeyDown(e, ref())}
                              class={cn(
                                "zen-min-h-6 zen-cursor-cell zen-truncate zen-px-1 zen-py-0.5 focus:zen-outline-none",
                                /* Numbers right, text left — the alignment IS
                                   the type signal in a sheet. */
                                typeof value() === "number"
                                  ? "zen-text-end zen-tabular-nums"
                                  : "zen-text-start",
                                isCellError(value()) && "zen-text-zen-error",
                              )}
                              title={
                                typeof cells()[ref()] === "string" &&
                                String(cells()[ref()]).startsWith("=")
                                  ? String(cells()[ref()])
                                  : undefined
                              }
                            >
                              {formatCellValue(value(), formatFor(ref()))}
                            </div>
                          }
                        >
                          <input
                            ref={(el) => queueMicrotask(() => el.focus())}
                            size={1}
                            value={draft()}
                            aria-label={ref()}
                            onInput={(e) => setDraft(e.currentTarget.value)}
                            onBlur={() => commit(ref(), draft())}
                            onKeyDown={(e) => onKeyDown(e, ref())}
                            class="zen-block zen-w-full zen-min-w-0 zen-border-0 zen-bg-zen-background zen-px-1 zen-py-0.5 zen-font-mono zen-text-sm focus:zen-outline-none"
                          />
                        </Show>
                      </td>
                    );
                  }}
                </Index>
              </tr>
            )}
          </Index>
        </tbody>
      </table>
    </div>
  );
};

export interface SheetCalculatorProps extends SpreadsheetGridProps {
  /** Shown beside the formula bar. */
  summary?: JSX.Element;
}

/**
 * SheetCalculator — SpreadsheetGrid with a formula bar.
 *
 * The bar shows the RAW contents of the selected cell, which is the only place a
 * formula is visible without entering edit mode.
 */
export const SheetCalculator = (props: SheetCalculatorProps) => {
  const [selected, setSelected] = createSignal("A1");
  const raw = () => props.cells?.[selected()];

  return (
    <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-2", props.class)}>
      <div class="zen-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-px-2 zen-py-1">
        <span class="zen-w-12 zen-shrink-0 zen-text-xs zen-font-medium zen-text-zen-muted-fg">
          {selected()}
        </span>
        <span class="zen-min-w-0 zen-flex-1 zen-truncate zen-font-mono zen-text-xs zen-text-zen-foreground">
          {raw() === undefined || raw() === null ? "" : String(raw())}
        </span>
        <Show when={props.summary}>
          <span class="zen-shrink-0 zen-text-xs">{props.summary}</span>
        </Show>
      </div>
      <SpreadsheetGrid
        {...props}
        class=""
        onCellCommit={(ref, rawValue, evaluatedValue) => {
          setSelected(ref);
          props.onCellCommit?.(ref, rawValue, evaluatedValue);
        }}
      />
    </div>
  );
};

import * as React from "react";
import {
  parseRef,
  formatRef,
  evaluateFormula,
  formatCellValue,
  isCellError,
  type CellMap,
  type CellValue,
  type CellFormat,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";

/**
 * SpreadsheetGrid — an editable grid of cells with formulas.
 *
 *   <SpreadsheetGrid rows={20} cols={8} cells={cells} onCellsChange={setCells} />
 *
 * For a financial or data-analytics assessment: the candidate types `=SUM(B2:B9)`
 * and sees a number.
 *
 * The evaluator is `@algorisys/zen-ui-core/spreadsheet` — a recursive-descent
 * parser, not `eval`, because a formula is text a candidate types and running it
 * as JavaScript hands them the page. It is small on purpose (arithmetic,
 * references, ranges, eight functions) and honest about its limits: anything it
 * cannot work out renders as `#NAME?` or `#ERROR!` rather than a plausible
 * wrong number, which in an assessment is the difference between failing and
 * being failed incorrectly.
 *
 * Cells are a flat `{A1: value}` map rather than a 2-D array. A sparse sheet is
 * the normal case, the keys are the addresses users actually type, and it
 * serialises to JSON without a shape conversion at both ends.
 *
 * Editing shows the FORMULA; the cell shows the RESULT. A grid that shows the
 * result while you are editing it is one you cannot correct a formula in.
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
  /** Fires with the evaluated value whenever a cell is committed. */
  onCellCommit?: (ref: string, raw: CellValue, evaluated: CellValue) => void;
  className?: string;
}

export const SpreadsheetGrid = ({
  rows = 12,
  cols = 6,
  cells = {},
  onCellsChange,
  formats = {},
  readOnly = false,
  colWidth = "6rem",
  onCellCommit,
  className,
}: SpreadsheetGridProps) => {
  const [editing, setEditing] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [selected, setSelected] = React.useState("A1");

  /* Every cell evaluated once per change, rather than per render — a 500-cell
     sheet re-parsing every formula on each keystroke is the difference between
     typing and waiting. */
  const evaluated = React.useMemo(() => {
    const out: CellMap = {};
    for (const key of Object.keys(cells)) out[key] = evaluateFormula(cells[key], cells);
    return out;
  }, [cells]);

  const formatFor = (ref: string): CellFormat => {
    const col = ref.replace(/[0-9]/g, "");
    return formats[ref] ?? formats[col] ?? {};
  };

  const commit = (ref: string, raw: string) => {
    const next = { ...cells };
    /* An emptied cell is DELETED, not stored as "". Otherwise a sheet slowly
       fills with empty strings that COUNT and AVERAGE then have to reason
       about. */
    if (raw === "") delete next[ref];
    else next[ref] = /^-?[0-9]*\.?[0-9]+$/.test(raw.trim()) ? Number(raw) : raw;

    onCellsChange?.(next);
    onCellCommit?.(ref, next[ref], evaluateFormula(next[ref], next));
    setEditing(null);
  };

  const move = (ref: string, dCol: number, dRow: number) => {
    const at = parseRef(ref);
    if (!at) return;
    const col = Math.min(cols - 1, Math.max(0, at.col + dCol));
    const row = Math.min(rows - 1, Math.max(0, at.row + dRow));
    setSelected(formatRef(col, row));
  };

  const onKeyDown = (e: React.KeyboardEvent, ref: string) => {
    if (editing === ref) {
      if (e.key === "Enter") {
        e.preventDefault();
        commit(ref, draft);
        move(ref, 0, 1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        /* Escape abandons the edit and restores what was there — a grid that
           commits on Escape is one you cannot back out of a mistake in. */
        setEditing(null);
      } else if (e.key === "Tab") {
        e.preventDefault();
        commit(ref, draft);
        move(ref, e.shiftKey ? -1 : 1, 0);
      }
      return;
    }

    const NAV: Record<string, [number, number]> = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };
    const step = NAV[e.key];
    if (step) {
      e.preventDefault();
      move(ref, step[0], step[1]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      move(ref, e.shiftKey ? -1 : 1, 0);
    } else if (!readOnly && (e.key === "Enter" || e.key === "F2")) {
      e.preventDefault();
      setDraft(String(cells[ref] ?? ""));
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
       * "=" becomes "==" and every formula a user types is #ERROR!. Measured;
       * the parser was never at fault.
       */
      e.preventDefault();
      setDraft(e.key);
      setEditing(ref);
    }
  };

  const headerCell = "zen-bg-zen-muted zen-text-zen-muted-fg zen-text-xs zen-font-medium zen-text-center zen-sticky";

  return (
    <div
      className={cn(
        "zen-w-full zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border",
        className,
      )}
    >
      {/*
        `table-fixed` with an explicit colgroup, so a column's width comes from
        the layout and never from its contents. Without it an <input> carries an
        intrinsic width of about twenty characters, so entering edit mode widened
        the cell from 96px to 186px and the whole table from 425 to 515 — the
        grid visibly jumped under the cursor on every edit.
      */}
      <table className="zen-table-fixed zen-border-collapse zen-text-sm">
        <colgroup>
          <col style={{ width: "2.5rem" }} />
          {Array.from({ length: cols }, (_, c) => (
            <col key={c} style={{ width: colWidth }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={cn(headerCell, "zen-start-0 zen-top-0 zen-z-20 zen-w-10")}>
              <span className="zen-sr-only">Row</span>
            </th>
            {Array.from({ length: cols }, (_, c) => (
              <th
                key={c}
                scope="col"
                className={cn(headerCell, "zen-top-0 zen-z-10 zen-border zen-border-zen-border zen-px-1 zen-py-1")}
              >
                {formatRef(c, 0).replace(/[0-9]/g, "")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              <th
                scope="row"
                className={cn(headerCell, "zen-start-0 zen-z-10 zen-border zen-border-zen-border zen-px-1")}
              >
                {r + 1}
              </th>
              {Array.from({ length: cols }, (_, c) => {
                const ref = formatRef(c, r);
                const isEditing = editing === ref;
                const isSelected = selected === ref;
                const value = evaluated[ref];
                const error = isCellError(value);

                return (
                  <td
                    key={c}
                    className={cn(
                      "zen-border zen-border-zen-border zen-p-0",
                      isSelected && "zen-outline zen-outline-2 -zen-outline-offset-2 zen-outline-zen-primary",
                    )}
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        value={draft}
                        aria-label={ref}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => commit(ref, draft)}
                        onKeyDown={(e) => onKeyDown(e, ref)}
                        size={1}
                        className="zen-block zen-w-full zen-min-w-0 zen-border-0 zen-bg-zen-background zen-px-1 zen-py-0.5 zen-font-mono zen-text-sm focus:zen-outline-none"
                      />
                    ) : (
                      <div
                        role="gridcell"
                        tabIndex={isSelected ? 0 : -1}
                        aria-label={ref}
                        aria-readonly={readOnly || undefined}
                        onFocus={() => setSelected(ref)}
                        onClick={() => setSelected(ref)}
                        onDoubleClick={() => {
                          if (readOnly) return;
                          setDraft(String(cells[ref] ?? ""));
                          setEditing(ref);
                        }}
                        onKeyDown={(e) => onKeyDown(e, ref)}
                        className={cn(
                          "zen-min-h-6 zen-cursor-cell zen-truncate zen-px-1 zen-py-0.5 focus:zen-outline-none",
                          /* Numbers right, text left — the alignment IS the
                             type signal in a sheet. */
                          typeof value === "number" ? "zen-text-end zen-tabular-nums" : "zen-text-start",
                          error && "zen-text-zen-error",
                        )}
                        title={typeof cells[ref] === "string" && String(cells[ref]).startsWith("=") ? String(cells[ref]) : undefined}
                      >
                        {formatCellValue(value, formatFor(ref))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export interface SheetCalculatorProps extends SpreadsheetGridProps {
  /** Shown above the grid — the formula of the selected cell, and a total. */
  summary?: React.ReactNode;
}

/**
 * SheetCalculator — SpreadsheetGrid with a formula bar.
 *
 * The bar shows the RAW contents of the selected cell, which is the only place
 * a formula is visible without entering edit mode.
 */
export const SheetCalculator = ({ summary, className, ...grid }: SheetCalculatorProps) => {
  const [selected, setSelected] = React.useState("A1");
  const raw = grid.cells?.[selected];

  return (
    <div className={cn("zen-flex zen-w-full zen-flex-col zen-gap-2", className)}>
      <div className="zen-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-px-2 zen-py-1">
        <span className="zen-w-12 zen-shrink-0 zen-text-xs zen-font-medium zen-text-zen-muted-fg">
          {selected}
        </span>
        <span className="zen-min-w-0 zen-flex-1 zen-truncate zen-font-mono zen-text-xs zen-text-zen-foreground">
          {raw === undefined || raw === null ? "" : String(raw)}
        </span>
        {summary ? <span className="zen-shrink-0 zen-text-xs">{summary}</span> : null}
      </div>
      <SpreadsheetGrid
        {...grid}
        onCellCommit={(ref, rawValue, evaluatedValue) => {
          setSelected(ref);
          grid.onCellCommit?.(ref, rawValue, evaluatedValue);
        }}
      />
    </div>
  );
};

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
import { applyProps, Disposer, setChildren, type BaseProps, type Child, type ZenComponent } from "../../lib/component";

/**
 * SpreadsheetGrid — an editable grid of cells with formulas.
 *
 *   SpreadsheetGrid({ rows: 20, cols: 8, cells, onCellsChange }).el
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * The evaluator is `@algorisys/zen-ui-core/spreadsheet` — a recursive-descent
 * parser, not `eval`, because a formula is text a candidate types and running it
 * as JavaScript hands them the page. It is small on purpose and honest about its
 * limits: anything it cannot work out renders as `#NAME?` or `#ERROR!` rather
 * than a plausible wrong number, which in an assessment is the difference
 * between failing and being failed incorrectly.
 *
 * Cells are a flat `{A1: value}` map rather than a 2-D array: a sparse sheet is
 * the normal case, the keys are the addresses users actually type, and it
 * serialises to JSON without a shape conversion at both ends.
 *
 * Editing shows the FORMULA; the cell shows the RESULT.
 */

export type { CellMap, CellValue, CellFormat };

export interface SpreadsheetGridProps extends BaseProps {
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
}

const HEADER_CELL =
  "zen-bg-zen-muted zen-text-zen-muted-fg zen-text-xs zen-font-medium zen-text-center zen-sticky";

export function SpreadsheetGrid(props: SpreadsheetGridProps): ZenComponent<SpreadsheetGridProps> {
  let current: SpreadsheetGridProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let editing: string | null = null;
  let draft = "";
  let selected = "A1";
  let evaluated: CellMap = {};

  const el = document.createElement("div");
  const table = document.createElement("table");
  const colgroup = document.createElement("colgroup");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  table.append(colgroup, thead, tbody);
  el.append(table);

  /** ref -> the <td>, so a paint can patch one cell without rebuilding the grid. */
  const cellEls = new Map<string, HTMLTableCellElement>();
  /** What the structure was built for. Rebuilt only when the dimensions move. */
  let builtRows = -1;
  let builtCols = -1;

  const rowsOf = () => current.rows ?? 12;
  const colsOf = () => current.cols ?? 6;
  const cellsOf = (): CellMap => current.cells ?? {};

  const reevaluate = () => {
    /* Every cell evaluated once per CHANGE rather than per render — a 500-cell
       sheet re-parsing every formula on each keystroke is the difference between
       typing and waiting. */
    const cells = cellsOf();
    const out: CellMap = {};
    for (const key of Object.keys(cells)) out[key] = evaluateFormula(cells[key], cells);
    evaluated = out;
  };

  const formatFor = (ref: string): CellFormat => {
    const formats = current.formats ?? {};
    const col = ref.replace(/[0-9]/g, "");
    return formats[ref] ?? formats[col] ?? {};
  };

  const commit = (ref: string, raw: string) => {
    const cells = cellsOf();
    const next: CellMap = { ...cells };
    /* An emptied cell is DELETED, not stored as "". Otherwise a sheet slowly
       fills with empty strings that COUNT and AVERAGE then have to reason about. */
    if (raw === "") delete next[ref];
    else next[ref] = /^-?[0-9]*\.?[0-9]+$/.test(raw.trim()) ? Number(raw) : raw;

    editing = null;
    /* Applied locally as well as announced. The caller is the owner, but an
       uncontrolled demo that never passes `cells` back would otherwise type into
       a grid that never changes. */
    current.cells = next;
    reevaluate();
    current.onCellsChange?.(next);
    current.onCellCommit?.(ref, next[ref], evaluateFormula(next[ref], next));
    paint();
  };

  const move = (ref: string, dCol: number, dRow: number) => {
    const at = parseRef(ref);
    if (!at) return;
    const col = Math.min(colsOf() - 1, Math.max(0, at.col + dCol));
    const row = Math.min(rowsOf() - 1, Math.max(0, at.row + dRow));
    selected = formatRef(col, row);
    paint();
    focusSelected();
  };

  const startEdit = (ref: string, seed: string) => {
    draft = seed;
    editing = ref;
    paint();
  };

  const onKeyDown = (e: KeyboardEvent, ref: string) => {
    const readOnly = current.readOnly ?? false;

    if (editing === ref) {
      if (e.key === "Enter") {
        e.preventDefault();
        commit(ref, draft);
        move(ref, 0, 1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        /* Escape abandons the edit and restores what was there — a grid that
           commits on Escape is one you cannot back out of a mistake in. */
        editing = null;
        paint();
        focusSelected();
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
      startEdit(ref, String(cellsOf()[ref] ?? ""));
    } else if (!readOnly && (e.key === "Delete" || e.key === "Backspace")) {
      e.preventDefault();
      commit(ref, "");
    } else if (!readOnly && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      /*
       * Typing over a selected cell replaces it, as a spreadsheet does.
       *
       * preventDefault matters: without it the character is seeded into the draft
       * here AND typed again by the browser into the input that takes focus on
       * the next paint, so the first keystroke lands twice — "=" becomes "==" and
       * every formula a user types is #ERROR!. Measured in React; the parser was
       * never at fault.
       */
      e.preventDefault();
      startEdit(ref, e.key);
    }
  };

  const focusSelected = () => {
    const td = cellEls.get(selected);
    const target = td?.querySelector<HTMLElement>("input, [role=gridcell]");
    target?.focus();
  };

  /** Structure. Rebuilt only when rows/cols move — never on a keystroke. */
  const build = () => {
    const rows = rowsOf();
    const cols = colsOf();
    cellEls.clear();

    /* table-fixed with an explicit colgroup, so a column's width comes from the
       layout and never from its contents. Without it an <input> carries an
       intrinsic width of about twenty characters, so entering edit mode widened
       the cell from 96px to 186px and the whole table from 425 to 515 — the grid
       visibly jumped under the cursor on every edit. */
    table.className = "zen-table-fixed zen-border-collapse zen-text-sm";
    colgroup.replaceChildren();
    const rowHead = document.createElement("col");
    rowHead.style.width = "2.5rem";
    colgroup.append(rowHead);
    for (let c = 0; c < cols; c++) {
      const col = document.createElement("col");
      col.style.width = current.colWidth ?? "6rem";
      colgroup.append(col);
    }

    thead.replaceChildren();
    const hr = document.createElement("tr");
    const corner = document.createElement("th");
    corner.scope = "col";
    corner.className = cn(HEADER_CELL, "zen-start-0 zen-top-0 zen-z-20 zen-w-10");
    const srRow = document.createElement("span");
    srRow.className = "zen-sr-only";
    srRow.textContent = "Row";
    corner.append(srRow);
    hr.append(corner);
    for (let c = 0; c < cols; c++) {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = cn(HEADER_CELL, "zen-top-0 zen-z-10 zen-border zen-border-zen-border zen-px-1 zen-py-1");
      th.textContent = formatRef(c, 0).replace(/[0-9]/g, "");
      hr.append(th);
    }
    thead.append(hr);

    tbody.replaceChildren();
    for (let r = 0; r < rows; r++) {
      const tr = document.createElement("tr");
      const rowTh = document.createElement("th");
      rowTh.scope = "row";
      rowTh.className = cn(HEADER_CELL, "zen-start-0 zen-z-10 zen-border zen-border-zen-border zen-px-1");
      rowTh.textContent = String(r + 1);
      tr.append(rowTh);

      for (let c = 0; c < cols; c++) {
        const ref = formatRef(c, r);
        const td = document.createElement("td");
        cellEls.set(ref, td);
        tr.append(td);
      }
      tbody.append(tr);
    }

    builtRows = rows;
    builtCols = cols;
  };

  /** Contents. Runs on every state change; touches no structure. */
  const paint = () => {
    const readOnly = current.readOnly ?? false;
    const cells = cellsOf();

    for (const [ref, td] of cellEls) {
      const isEditing = editing === ref;
      const isSelected = selected === ref;
      const value = evaluated[ref];
      const error = isCellError(value);

      td.className = cn(
        "zen-border zen-border-zen-border zen-p-0",
        /* The negative marker goes BEFORE the prefix: `zen--outline-offset-2`
           generates no CSS at all and check:css-live catches it. */
        isSelected && "zen-outline zen-outline-2 -zen-outline-offset-2 zen-outline-zen-primary",
      );

      if (isEditing) {
        const existing = td.querySelector("input");
        if (existing) {
          if (existing.value !== draft) existing.value = draft;
          continue;
        }
        const input = document.createElement("input");
        input.value = draft;
        input.setAttribute("aria-label", ref);
        input.size = 1;
        input.className =
          "zen-block zen-w-full zen-min-w-0 zen-border-0 zen-bg-zen-background zen-px-1 zen-py-0.5 zen-font-mono zen-text-sm focus:zen-outline-none";
        input.addEventListener("input", () => {
          draft = input.value;
        });
        input.addEventListener("blur", () => {
          /* Only if this is still the live edit: a blur caused by Escape or by
             Enter has already committed, and committing twice writes the draft
             over the cell the selection moved to. */
          if (editing === ref) commit(ref, draft);
        });
        input.addEventListener("keydown", (e) => onKeyDown(e, ref));
        td.replaceChildren(input);
        input.focus();
        /* Caret to the END, never select-all. Typing over a cell seeds the draft
           with that first character, and a selected "=" is replaced by the next
           keystroke — so "=1+2*3" commits as the literal text "1+2*3" and every
           formula silently stops being one. Measured; it looked like the parser
           failing, exactly as the doubled-keystroke bug did in React. */
        input.setSelectionRange(input.value.length, input.value.length);
        continue;
      }

      let cell = td.querySelector<HTMLDivElement>("[role=gridcell]");
      if (!cell) {
        cell = document.createElement("div");
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("aria-label", ref);
        cell.addEventListener("focus", () => {
          selected = ref;
          paintSelection();
        });
        cell.addEventListener("click", () => {
          selected = ref;
          paintSelection();
        });
        cell.addEventListener("dblclick", () => {
          if (current.readOnly) return;
          startEdit(ref, String(cellsOf()[ref] ?? ""));
        });
        cell.addEventListener("keydown", (e) => onKeyDown(e, ref));
        td.replaceChildren(cell);
      }

      cell.tabIndex = isSelected ? 0 : -1;
      if (readOnly) cell.setAttribute("aria-readonly", "true");
      else cell.removeAttribute("aria-readonly");
      cell.className = cn(
        "zen-min-h-6 zen-cursor-cell zen-truncate zen-px-1 zen-py-0.5 focus:zen-outline-none",
        /* Numbers right, text left — the alignment IS the type signal in a sheet. */
        typeof value === "number" ? "zen-text-end zen-tabular-nums" : "zen-text-start",
        error && "zen-text-zen-error",
      );
      const raw = cells[ref];
      if (typeof raw === "string" && raw.startsWith("=")) cell.title = raw;
      else cell.removeAttribute("title");

      const text = formatCellValue(value, formatFor(ref));
      if (cell.textContent !== text) cell.textContent = text;
    }
  };

  /** Selection only — cheap enough to run on every click and focus. */
  const paintSelection = () => {
    for (const [ref, td] of cellEls) {
      const isSelected = selected === ref;
      td.classList.toggle("zen-outline", isSelected);
      td.classList.toggle("zen-outline-2", isSelected);
      td.classList.toggle("-zen-outline-offset-2", isSelected);
      td.classList.toggle("zen-outline-zen-primary", isSelected);
      const cell = td.querySelector<HTMLElement>("[role=gridcell]");
      if (cell) cell.tabIndex = isSelected ? 0 : -1;
    }
  };

  const render = () => {
    el.className = cn(
      "zen-w-full zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border",
      current.class,
    );
    if (rowsOf() !== builtRows || colsOf() !== builtCols) build();
    reevaluate();
    paint();

    const {
      rows: _r, cols: _c, cells: _ce, onCellsChange: _oc, formats: _f, readOnly: _ro,
      colWidth: _cw, onCellCommit: _occ, class: _cl, children: _ch,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
    /** The address the keyboard is currently on. SheetCalculator reads it. */
    get selected() {
      return selected;
    },
  } as ZenComponent<SpreadsheetGridProps> & { readonly selected: string };
}

export interface SheetCalculatorProps extends SpreadsheetGridProps {
  /** Shown above the grid — a total, a hint, whatever belongs beside the formula. */
  summary?: Child;
}

/**
 * SheetCalculator — SpreadsheetGrid with a formula bar.
 *
 * The bar shows the RAW contents of the selected cell, which is the only place a
 * formula is visible without entering edit mode.
 *
 * It tracks the selection through `onCellCommit`, exactly as React does. That
 * means the bar follows the cell you last EDITED rather than the one you last
 * clicked — a shared limit, kept rather than fixed here, because fixing it in one
 * binding is how two bindings stop behaving the same.
 */
export function SheetCalculator(props: SheetCalculatorProps): ZenComponent<SheetCalculatorProps> {
  let current: SheetCalculatorProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let selected = "A1";

  const el = document.createElement("div");
  const bar = document.createElement("div");
  const refEl = document.createElement("span");
  const formulaEl = document.createElement("span");
  const summaryEl = document.createElement("span");

  bar.className =
    "zen-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-px-2 zen-py-1";
  refEl.className = "zen-w-12 zen-shrink-0 zen-text-xs zen-font-medium zen-text-zen-muted-fg";
  formulaEl.className = "zen-min-w-0 zen-flex-1 zen-truncate zen-font-mono zen-text-xs zen-text-zen-foreground";
  summaryEl.className = "zen-shrink-0 zen-text-xs";

  const gridOf = (p: SheetCalculatorProps): SpreadsheetGridProps => {
    const { summary: _s, class: _c, children: _ch, ...grid } = p;
    return {
      ...grid,
      onCellCommit: (ref, raw, value) => {
        selected = ref;
        current.onCellCommit?.(ref, raw, value);
        paintBar();
      },
    };
  };

  const grid = SpreadsheetGrid(gridOf(current));
  disposer.add(() => grid.destroy());

  const paintBar = () => {
    const raw = current.cells?.[selected];
    refEl.textContent = selected;
    formulaEl.textContent = raw === undefined || raw === null ? "" : String(raw);

    bar.replaceChildren(refEl, formulaEl);
    if (current.summary !== undefined && current.summary !== null && current.summary !== false) {
      setChildren(summaryEl, current.summary);
      bar.append(summaryEl);
    }
  };

  const render = () => {
    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-2", current.class);
    paintBar();
    el.replaceChildren(bar, grid.el);

    const { summary: _s, class: _c, children: _ch, ...rest } = current;
    const {
      rows: _r, cols: _co, cells: _ce, onCellsChange: _oc, formats: _f, readOnly: _ro,
      colWidth: _cw, onCellCommit: _occ,
      ...forwarded
    } = rest;
    removeProps?.();
    removeProps = applyProps(el, forwarded as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      grid.update(gridOf(current));
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

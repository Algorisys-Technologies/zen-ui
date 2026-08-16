import * as React from "react";
import { type CellMap, type CellValue, type CellFormat } from "../../_core/index";
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
export declare const SpreadsheetGrid: ({ rows, cols, cells, onCellsChange, formats, readOnly, colWidth, onCellCommit, className, }: SpreadsheetGridProps) => React.JSX.Element;
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
export declare const SheetCalculator: ({ summary, className, ...grid }: SheetCalculatorProps) => React.JSX.Element;
//# sourceMappingURL=spreadsheet-grid.d.ts.map
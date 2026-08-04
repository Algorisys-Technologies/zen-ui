/**
 * Spreadsheet contract.
 *
 *   bun run check:spreadsheet
 *
 * The pure half of SpreadsheetGrid: cell references, a formula evaluator, and
 * number formatting. No DOM.
 *
 * The evaluator is deliberately small — arithmetic, references, ranges and a
 * handful of aggregate functions. It is not Excel and does not try to be. What
 * it must be is HONEST: a formula it cannot evaluate returns an error value
 * that renders as an error, rather than a plausible-looking wrong number, which
 * in an assessment is the difference between a candidate failing and a
 * candidate being failed incorrectly.
 *
 * Circular references get particular attention. Left unguarded they are not a
 * wrong answer, they are a stack overflow that takes the page down.
 */
import {
  parseRef,
  formatRef,
  expandRange,
  evaluateFormula,
  formatCellValue,
  type CellMap,
} from "../packages/core/src/spreadsheet";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(58)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

console.log("\nparseRef / formatRef — A1 notation");
t(parseRef("A1"), { col: 0, row: 0 }, "A1 is the origin");
t(parseRef("B3"), { col: 1, row: 2 }, "both are zero-based internally");
t(parseRef("Z1"), { col: 25, row: 0 }, "the end of the first letter run");
t(parseRef("AA1"), { col: 26, row: 0 }, "two letters carry, so AA follows Z");
t(parseRef("AB1"), { col: 27, row: 0 }, "…and AB follows AA");
t(parseRef("a1"), { col: 0, row: 0 }, "lower case is the same cell");
t(parseRef("$B$3"), { col: 1, row: 2 }, "absolute markers are not part of the address");
t(parseRef("A0"), null, "there is no row zero");
t(parseRef("1A"), null, "back to front is not a reference");
t(parseRef(""), null, "empty");
t(parseRef("AA"), null, "a column with no row is not a cell");
t(formatRef(0, 0), "A1", "round trips");
t(formatRef(26, 0), "AA1", "…including the carry");
t(formatRef(27, 4), "AB5", "column and row together");

console.log("\nexpandRange");
t(expandRange("A1:A3"), ["A1", "A2", "A3"], "down a column");
t(expandRange("A1:C1"), ["A1", "B1", "C1"], "across a row");
t(expandRange("A1:B2"), ["A1", "B1", "A2", "B2"], "a block, row-major");
t(expandRange("B2:A1"), ["A1", "B1", "A2", "B2"], "a reversed range is normalised, not empty");
t(expandRange("A1:A1"), ["A1"], "a range of one");
t(expandRange("A1"), [], "a single ref is not a range");
t(expandRange("nonsense"), [], "unparseable is empty rather than a throw");

const cells: CellMap = {
  A1: 10,
  A2: 20,
  A3: 30,
  B1: 5,
  B2: "text",
  C1: "=A1+A2",
  C2: "=SUM(A1:A3)",
};

console.log("\nevaluateFormula — arithmetic");
t(evaluateFormula("=1+2", {}), 3, "addition");
t(evaluateFormula("=10-4", {}), 6, "subtraction");
t(evaluateFormula("=6*7", {}), 42, "multiplication");
t(evaluateFormula("=10/4", {}), 2.5, "division");
t(evaluateFormula("=2^10", {}), 1024, "exponent");
t(evaluateFormula("=(1+2)*3", {}), 9, "parentheses beat precedence");
t(evaluateFormula("=1+2*3", {}), 7, "…and precedence beats left-to-right");
t(evaluateFormula("=-5+1", {}), -4, "a leading minus");
t(evaluateFormula("=10/0", {}), "#DIV/0!", "division by zero is an error value, not Infinity");
t(evaluateFormula("2+2", {}), "2+2", "no leading = is not a formula, it is text");

console.log("\nevaluateFormula — references");
t(evaluateFormula("=A1", cells), 10, "a reference");
t(evaluateFormula("=A1+A2", cells), 30, "two");
t(evaluateFormula("=A1*2", cells), 20, "mixed with a literal");
t(evaluateFormula("=Z9", cells), 0, "an empty cell is zero in arithmetic");
t(evaluateFormula("=B2+1", cells), "#VALUE!", "text in arithmetic is an error, not NaN");
t(evaluateFormula("=C1", cells), 30, "a reference to a formula evaluates it");
t(evaluateFormula("=C2*2", cells), 120, "…including one containing a range");

console.log("\nevaluateFormula — functions");
t(evaluateFormula("=SUM(A1:A3)", cells), 60, "SUM over a range");
t(evaluateFormula("=SUM(A1,A2)", cells), 30, "SUM over arguments");
t(evaluateFormula("=SUM(A1:A3,B1)", cells), 65, "…and a mix");
t(evaluateFormula("=AVERAGE(A1:A3)", cells), 20, "AVERAGE");
t(evaluateFormula("=MIN(A1:A3)", cells), 10, "MIN");
t(evaluateFormula("=MAX(A1:A3)", cells), 30, "MAX");
t(evaluateFormula("=COUNT(A1:A3)", cells), 3, "COUNT counts numbers");
t(evaluateFormula("=COUNT(A1:B2)", cells), 3, "…skipping the text cell: 4 cells, 3 numbers");
t(evaluateFormula("=SUM(A1:B2)", cells), 35, "SUM likewise ignores a label sitting in the range");
t(evaluateFormula("=SUM(A1:A3)", { ...cells, A2: "=A1*2" }), 60, "a formula inside a range is evaluated, not skipped");
t(evaluateFormula("=SUM(A1:A2)", { A1: 1, A2: "=1/0" }), "#DIV/0!", "but a formula that ERRORS inside a range still propagates");
t(evaluateFormula("=ROUND(2.567,2)", {}), 2.57, "ROUND to places");
t(evaluateFormula("=ROUND(2.5)", {}), 3, "ROUND with no places");
t(evaluateFormula("=ABS(-7)", {}), 7, "ABS");
t(evaluateFormula("=sum(A1:A3)", cells), 60, "function names are case-insensitive");
t(evaluateFormula("=AVERAGE(Z1:Z9)", cells), "#DIV/0!", "an average of nothing is an error, not zero");
t(evaluateFormula("=NOPE(1)", {}), "#NAME?", "an unknown function is named as such");

console.log("\nevaluateFormula — the errors that must not be silent");
/* A circular reference is not a wrong number; unguarded it is a stack overflow
   that takes the page with it. */
t(evaluateFormula("=A1", { A1: "=A1" }), "#CIRCULAR!", "a cell referring to itself");
t(evaluateFormula("=A1", { A1: "=B1", B1: "=A1" }), "#CIRCULAR!", "a two-step cycle");
t(evaluateFormula("=A1", { A1: "=B1", B1: "=C1", C1: "=A1" }), "#CIRCULAR!", "a longer cycle");
t(evaluateFormula("=1+", {}), "#ERROR!", "a truncated formula");
t(evaluateFormula("=((1+2)", {}), "#ERROR!", "unbalanced parentheses");
t(evaluateFormula("=1;2", {}), "#ERROR!", "a stray separator");
/* The evaluator must never run caller text as code. */
t(evaluateFormula("=alert(1)", {}), "#NAME?", "an unknown identifier is not invoked");
t(evaluateFormula("=constructor", {}), "#NAME?", "a property name is an unknown NAME, not a lookup on an object");

console.log("\nformatCellValue");
t(formatCellValue(1234.5, { type: "number" }), "1234.5", "plain");
t(formatCellValue(1234.5, { type: "number", decimals: 2 }), "1234.50", "fixed decimals");
t(formatCellValue(0.256, { type: "percent", decimals: 1 }), "25.6%", "percent multiplies by 100");
t(formatCellValue(1234.5, { type: "currency", currency: "EUR", locale: "en-IE" }), "€1,234.50", "currency");
t(formatCellValue("text", { type: "number" }), "text", "text is not coerced into a number");
t(formatCellValue("#DIV/0!", { type: "number" }), "#DIV/0!", "an error value renders as itself");
t(formatCellValue(undefined, { type: "number" }), "", "an empty cell is empty, not 0");
t(formatCellValue(null, { type: "number" }), "", "…and so is null");
t(formatCellValue(true, {}), "TRUE", "booleans render uppercase, as a sheet does");

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);

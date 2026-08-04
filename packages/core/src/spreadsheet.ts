/**
 * Spreadsheet maths — the pure half of SpreadsheetGrid.
 *
 * A1 references, a small formula evaluator, and number formatting. No DOM, so
 * every awkward case is testable: a circular reference, text in arithmetic, an
 * average of nothing.
 *
 * The evaluator is a RECURSIVE-DESCENT PARSER, not `new Function` and not
 * `eval`. That is not fastidiousness — a formula is text a candidate types, and
 * evaluating it as JavaScript hands them the page. It also means an unknown
 * name is `#NAME?` rather than a call into whatever happens to be in scope.
 *
 * It is small on purpose: arithmetic, references, ranges, and eight functions.
 * It is not Excel. What it must be is honest — anything it cannot work out
 * returns an error value that renders AS an error, because in an assessment a
 * plausible-looking wrong number is worse than a visible failure.
 */

/** What a cell holds: a literal, or a formula string beginning `=`. */
export type CellValue = number | string | boolean | null | undefined;
export type CellMap = Record<string, CellValue>;

/** The error values, spelled as a spreadsheet spells them. */
export const CELL_ERRORS = ["#DIV/0!", "#VALUE!", "#NAME?", "#CIRCULAR!", "#ERROR!", "#REF!"] as const;
export type CellError = (typeof CELL_ERRORS)[number];

export const isCellError = (v: unknown): v is CellError =>
  typeof v === "string" && (CELL_ERRORS as readonly string[]).includes(v);

export interface CellRef {
  col: number;
  row: number;
}

/** `A1` → `{col: 0, row: 0}`. `$` markers are stripped: they affect copying, not address. */
export const parseRef = (ref: string): CellRef | null => {
  const m = /^\$?([A-Za-z]+)\$?([0-9]+)$/.exec(ref.trim());
  if (!m) return null;
  const [, letters, digits] = m;
  const row = parseInt(digits!, 10) - 1;
  if (row < 0) return null;

  let col = 0;
  for (const ch of letters!.toUpperCase()) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { col: col - 1, row };
};

/** `{0, 0}` → `A1`. The inverse of parseRef, carrying past Z into AA. */
export const formatRef = (col: number, row: number): string => {
  let letters = "";
  for (let n = col + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters;
  }
  return `${letters}${row + 1}`;
};

/**
 * `A1:B2` → every cell in the block, row-major.
 *
 * A reversed range is normalised rather than returning nothing: `B2:A1` is a
 * selection dragged up-left, which is a normal thing to do.
 */
export const expandRange = (range: string): string[] => {
  const [from, to] = range.split(":");
  if (!from || !to) return [];
  const a = parseRef(from);
  const b = parseRef(to);
  if (!a || !b) return [];

  const cells: string[] = [];
  for (let row = Math.min(a.row, b.row); row <= Math.max(a.row, b.row); row++) {
    for (let col = Math.min(a.col, b.col); col <= Math.max(a.col, b.col); col++) {
      cells.push(formatRef(col, row));
    }
  }
  return cells;
};

/* ---- the evaluator ----------------------------------------------------- */

type Num = number | CellError;

const FUNCTIONS: Record<string, (args: number[]) => Num> = {
  SUM: (a) => a.reduce((x, y) => x + y, 0),
  AVERAGE: (a) => (a.length === 0 ? "#DIV/0!" : a.reduce((x, y) => x + y, 0) / a.length),
  MIN: (a) => (a.length === 0 ? "#DIV/0!" : Math.min(...a)),
  MAX: (a) => (a.length === 0 ? "#DIV/0!" : Math.max(...a)),
  COUNT: (a) => a.length,
  ABS: (a) => Math.abs(a[0] ?? 0),
  ROUND: (a) => {
    const p = 10 ** Math.trunc(a[1] ?? 0);
    return Math.round((a[0] ?? 0) * p) / p;
  },
  SQRT: (a) => {
    const v = a[0] ?? 0;
    return v < 0 ? "#VALUE!" : Math.sqrt(v);
  },
};

/**
 * Evaluate one formula against a sheet.
 *
 * Anything not starting with `=` is not a formula and is returned unchanged —
 * a cell containing `2+2` is the text "2+2", exactly as a spreadsheet treats it.
 *
 * `seen` carries the cells already being evaluated further up the stack, which
 * is what makes a circular reference an error value instead of a stack
 * overflow that takes the page down.
 */
export const evaluateFormula = (
  input: CellValue,
  cells: CellMap,
  seen: ReadonlySet<string> = new Set(),
): CellValue => {
  if (typeof input !== "string" || !input.startsWith("=")) return input;

  const src = input.slice(1);
  let i = 0;

  const ws = () => {
    while (i < src.length && src[i] === " ") i++;
  };

  /** The value of a named cell, evaluated if it is itself a formula. */
  const cellValue = (name: string): Num => {
    const key = name.toUpperCase();
    if (seen.has(key)) return "#CIRCULAR!";
    const raw = cells[key] ?? cells[name];
    if (raw === undefined || raw === null || raw === "") return 0;
    const value =
      typeof raw === "string" && raw.startsWith("=")
        ? evaluateFormula(raw, cells, new Set([...seen, key]))
        : raw;
    if (isCellError(value)) return value;
    if (typeof value === "boolean") return value ? 1 : 0;
    if (typeof value === "number") return value;
    /* Text in arithmetic is #VALUE!, never NaN — NaN propagates silently and
       renders as "NaN", which reads like a bug rather than a wrong formula. */
    return "#VALUE!";
  };

  /** Numbers gathered from an argument, which may be a range. */
  const argValues = (token: string): Num[] => {
    if (token.includes(":")) {
      const out: Num[] = [];
      for (const name of expandRange(token)) {
        const key = name.toUpperCase();
        const raw = cells[key];
        /* Empty and TEXT cells are skipped in an aggregate — that is what makes
           COUNT(A1:B2) four rather than five, and lets AVERAGE ignore a column
           label sitting in the range. A label is not a #VALUE! error; it is
           simply not a number, and erroring on it would make every aggregate
           over a headed column fail. */
        if (raw === undefined || raw === null || raw === "") continue;
        if (typeof raw === "string" && !raw.startsWith("=")) continue;
        const v = cellValue(name);
        /* A referenced FORMULA that errors still propagates — that is a real
           failure in the sheet, not a label. */
        if (isCellError(v)) return [v];
        out.push(v);
      }
      return out;
    }
    return [];
  };

  let error: CellError | null = null;

  const parseExpression = (): Num => {
    let left = parseTerm();
    for (;;) {
      ws();
      const op = src[i];
      if (op !== "+" && op !== "-") return left;
      i++;
      const right = parseTerm();
      if (isCellError(left)) return left;
      if (isCellError(right)) return right;
      left = op === "+" ? left + right : left - right;
    }
  };

  const parseTerm = (): Num => {
    let left = parsePower();
    for (;;) {
      ws();
      const op = src[i];
      if (op !== "*" && op !== "/") return left;
      i++;
      const right = parsePower();
      if (isCellError(left)) return left;
      if (isCellError(right)) return right;
      if (op === "/" && right === 0) return "#DIV/0!";
      left = op === "*" ? left * right : left / right;
    }
  };

  const parsePower = (): Num => {
    const base = parseUnary();
    ws();
    if (src[i] !== "^") return base;
    i++;
    const exp = parsePower();
    if (isCellError(base)) return base;
    if (isCellError(exp)) return exp;
    return base ** exp;
  };

  const parseUnary = (): Num => {
    ws();
    if (src[i] === "-") {
      i++;
      const v = parseUnary();
      return isCellError(v) ? v : -v;
    }
    if (src[i] === "+") {
      i++;
      return parseUnary();
    }
    return parsePrimary();
  };

  const parsePrimary = (): Num => {
    ws();
    if (i >= src.length) {
      error = "#ERROR!";
      return 0;
    }

    if (src[i] === "(") {
      i++;
      const v = parseExpression();
      ws();
      if (src[i] !== ")") {
        error = "#ERROR!";
        return 0;
      }
      i++;
      return v;
    }

    const numberMatch = /^[0-9]+(\.[0-9]+)?/.exec(src.slice(i));
    if (numberMatch) {
      i += numberMatch[0].length;
      return parseFloat(numberMatch[0]);
    }

    /* An identifier: a function call, a range, or a cell reference. Nothing
       else — a bare name that is none of these is #NAME?, never a lookup into
       an object that happens to have that property. */
    const identMatch = /^\$?[A-Za-z]+\$?[0-9]*/.exec(src.slice(i));
    if (!identMatch) {
      error = "#ERROR!";
      return 0;
    }
    let ident = identMatch[0];
    i += ident.length;
    ws();

    if (src[i] === "(") {
      i++;
      const fn = FUNCTIONS[ident.toUpperCase()];
      const args: number[] = [];
      let argError: CellError | null = null;

      for (;;) {
        ws();
        if (src[i] === ")") {
          i++;
          break;
        }
        /* A range argument is consumed whole before the expression parser sees
           the colon, which is not an operator it knows. */
        const rangeMatch = /^\$?[A-Za-z]+\$?[0-9]+:\$?[A-Za-z]+\$?[0-9]+/.exec(src.slice(i));
        if (rangeMatch) {
          i += rangeMatch[0].length;
          for (const v of argValues(rangeMatch[0])) {
            if (isCellError(v)) argError = v;
            else args.push(v);
          }
        } else {
          const v = parseExpression();
          if (isCellError(v)) argError = v;
          else args.push(v);
        }
        ws();
        if (src[i] === "," ) {
          i++;
          continue;
        }
        if (src[i] === ")") {
          i++;
          break;
        }
        error = "#ERROR!";
        return 0;
      }

      if (!fn) return "#NAME?";
      if (argError) return argError;
      return fn(args);
    }

    /* Not a call, so it must be a cell reference. A bare word is not. */
    if (!parseRef(ident)) return "#NAME?";
    return cellValue(ident);
  };

  const result = parseExpression();
  ws();
  /* Trailing rubbish means the formula was not fully understood, and a
     partially-understood formula must not return a number. */
  if (error || i < src.length) return error ?? "#ERROR!";
  return result;
};

/* ---- formatting -------------------------------------------------------- */

export interface CellFormat {
  type?: "text" | "number" | "currency" | "percent";
  decimals?: number;
  /** ISO 4217, for `currency`. */
  currency?: string;
  /** BCP 47. Defaults to the runtime's. */
  locale?: string;
}

/**
 * A cell value as it should read.
 *
 * An empty cell formats as empty rather than `0` — a grid of zeros where the
 * data has not arrived is indistinguishable from a grid of real zeros. An error
 * value formats as itself, never as `NaN`.
 */
export const formatCellValue = (value: CellValue, format: CellFormat = {}): string => {
  if (value === undefined || value === null || value === "") return "";
  if (isCellError(value)) return value;
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value !== "number") return String(value);

  const { type = "number", decimals, currency = "USD", locale } = format;
  const opts: Intl.NumberFormatOptions = {};
  if (decimals !== undefined) {
    opts.minimumFractionDigits = decimals;
    opts.maximumFractionDigits = decimals;
  }

  if (type === "currency") {
    return new Intl.NumberFormat(locale, {
      ...opts,
      style: "currency",
      currency,
      ...(decimals === undefined ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {}),
    }).format(value);
  }
  if (type === "percent") {
    return new Intl.NumberFormat(locale, { ...opts, style: "percent" }).format(value);
  }
  if (decimals !== undefined) return value.toFixed(decimals);
  return String(value);
};

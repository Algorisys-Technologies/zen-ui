/**
 * Column mapper — the pure half of ColumnMapper.
 *
 *   bun run check:column-mapper
 *
 * Parse a delimited file (quotes, doubled quotes, newlines in quotes, BOM,
 * CRLF), detect its delimiter, map its columns onto an app's fields by exact
 * normalised name (never a fuzzy guess — a wrong guess imports bad data
 * silently), and validate every cell against its field's type.
 */
import { parseNumber } from "./number-format";
import { makeDate, orderForLocale } from "./date-input";

export interface MapperField {
  id: string;
  label: string;
  required?: boolean;
  type?: "text" | "number" | "date";
  /** Other headers that mean this field ("Item code", "Material"). */
  aliases?: string[];
}

/** Source header → field id. Headers absent from it are ignored. */
export type ColumnMapping = Record<string, string>;

const DELIMITERS = [",", ";", "\t", "|"] as const;

export function parseDelimited(text: string, options: { delimiter?: string } = {}): string[][] {
  const src = text.replace(/^﻿/, "");
  const d = options.delimiter ?? detectDelimiter(src);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let i = 0;
  const endRow = () => {
    row.push(field);
    field = "";
    if (!(row.length === 1 && row[0] === "")) rows.push(row); // a blank line is not a row
    row = [];
  };
  while (i < src.length) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
      } else field += c;
      i++;
      continue;
    }
    if (c === '"' && field === "") quoted = true;
    else if (c === d) {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // CRLF or a bare CR ends the row; the LF of a CRLF is skipped below.
      endRow();
      if (src[i + 1] === "\n") i++;
    } else if (c === "\n") endRow();
    else field += c;
    i++;
  }
  if (field !== "" || row.length) endRow();
  return rows;
}

/** The delimiter that splits the first lines into the same, largest number of columns. */
export function detectDelimiter(text: string): string {
  const sample = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim()).slice(0, 10);
  let best: string = ",";
  let bestCols = 1;
  for (const d of DELIMITERS) {
    const counts = sample.map((line) => parseLineCount(line, d));
    const consistent = counts.length > 0 && counts.every((n) => n === counts[0]);
    if (consistent && counts[0] > bestCols) {
      best = d;
      bestCols = counts[0];
    }
  }
  return best;
}

function parseLineCount(line: string, d: string): number {
  let n = 1;
  let quoted = false;
  for (const c of line) {
    if (c === '"') quoted = !quoted;
    else if (c === d && !quoted) n++;
  }
  return n;
}

const norm = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/** Exact matches on id, label or alias (normalised). Each field is used once, by the first header that matches. */
export function autoMap(headers: readonly string[], fields: readonly MapperField[]): ColumnMapping {
  const used = new Set<string>();
  const out: ColumnMapping = {};
  for (const h of headers) {
    const n = norm(h);
    if (!n) continue;
    const field = fields.find(
      (f) => !used.has(f.id) && [f.id, f.label, ...(f.aliases ?? [])].some((name) => norm(name) === n),
    );
    if (field) {
      out[h] = field.id;
      used.add(field.id);
    }
  }
  return out;
}

export type CellErrorKind = "required" | "number" | "date";

export interface MappingValidation {
  /** Required field ids no column is mapped to. */
  missing: string[];
  /** Field ids more than one column is mapped to. */
  duplicates: string[];
  /** Row is 1-based over the data (the header row is not counted). */
  cellErrors: { row: number; column: string; field: string; kind: CellErrorKind; value: string }[];
  validRows: number;
  totalRows: number;
  ok: boolean;
}

/** An import date: ISO, or a full three-part date in the locale's order. No shortcuts, no guessing. */
export function parseImportDate(text: string, locale?: string): Date | null {
  const t = text.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(t);
  if (iso) return makeDate(+iso[1], +iso[2], +iso[3]);
  const parts = t.split(/[/.\-]/);
  if (parts.length !== 3 || parts.some((p) => !/^\d{1,4}$/.test(p))) return null;
  const order = orderForLocale(locale);
  const [y, m, d] = order === "ymd" ? parts : order === "mdy" ? [parts[2], parts[0], parts[1]] : [parts[2], parts[1], parts[0]];
  if (y.length !== 4) return null;
  return makeDate(+y, +m, +d);
}

export function validateMapping(
  mapping: ColumnMapping,
  fields: readonly MapperField[],
  rows: readonly string[][],
  options: { locale?: string } = {},
): MappingValidation {
  const [header = [], ...data] = rows;
  const targets = Object.values(mapping);
  const missing = fields.filter((f) => f.required && !targets.includes(f.id)).map((f) => f.id);
  const duplicates = [...new Set(targets.filter((id, i) => targets.indexOf(id) !== i))];
  const cellErrors: MappingValidation["cellErrors"] = [];
  const bad = new Set<number>();
  data.forEach((cells, r) => {
    header.forEach((h, c) => {
      const field = fields.find((f) => f.id === mapping[h]);
      if (!field) return;
      const value = (cells[c] ?? "").trim();
      let kind: CellErrorKind | null = null;
      if (value === "") kind = field.required ? "required" : null;
      else if (field.type === "number" && typeof parseNumber(value, { locale: options.locale }) !== "number") kind = "number";
      else if (field.type === "date" && !parseImportDate(value, options.locale)) kind = "date";
      if (kind) {
        cellErrors.push({ row: r + 1, column: h, field: field.id, kind, value });
        bad.add(r);
      }
    });
  });
  return {
    missing,
    duplicates,
    cellErrors,
    validRows: data.length - bad.size,
    totalRows: data.length,
    ok: missing.length === 0 && duplicates.length === 0 && cellErrors.length === 0,
  };
}

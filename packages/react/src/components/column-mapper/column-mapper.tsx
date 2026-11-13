import * as React from "react";
import {
  autoMap,
  validateMapping,
  type ColumnMapping,
  type MapperField,
  type MappingValidation,
} from "@algorisys/zen-ui-core/column-mapper";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";
import { NativeSelect } from "../form/native-select/native-select";
import { Icon } from "../icon/icon";

/**
 * ColumnMapper — map a spreadsheet's columns onto your fields, and see what
 * will import before it does.
 *
 *   const rows = parseDelimited(await file.text());   // or rows from an .xlsx reader
 *   <ColumnMapper rows={rows} fields={workOrderFields}
 *     onChange={(mapping, check) => setReady(check.ok)} />
 *
 * Columns are matched by name on arrival — the field's id, label or aliases,
 * ignoring case, accents and punctuation — and never guessed beyond that: a
 * wrong guess imports bad data silently, an unmapped column is merely visible.
 * Each column shows sample values and a "Maps to" select. Above, a summary and
 * every problem in words: a required field nobody mapped, two columns onto one
 * field. Below, a preview of the first rows as they will import, every bad
 * cell marked with its reason (an empty required value, a number or date that
 * does not read in the user's locale).
 */

export type ColumnMapperProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
  /** The file's rows, header first. */
  rows: string[][];
  fields: MapperField[];
  mapping?: ColumnMapping;
  /** Defaults to the automatic match. */
  defaultMapping?: ColumnMapping;
  onChange?: (mapping: ColumnMapping, validation: MappingValidation) => void;
  /** Rows shown in the preview. Default 5. */
  previewRows?: number;
};

const CELL_KEY = {
  required: "columnMapper.cell.required",
  number: "columnMapper.cell.number",
  date: "columnMapper.cell.date",
} as const;

export const ColumnMapper = React.forwardRef<HTMLDivElement, ColumnMapperProps>(
  ({ rows, fields, mapping: mappingProp, defaultMapping, onChange, previewRows, className, ...rest }, ref) => {
    const loc = useLocale();
    const id = React.useId();
    const headers = rows[0] ?? [];
    // The first automatic match, remembered so the status can say "matched by name".
    const [auto] = React.useState(() => autoMap(rows[0] ?? [], fields));
    const [own, setOwn] = React.useState<ColumnMapping>(() => defaultMapping ?? auto);
    const mapping = mappingProp ?? own;
    const check = React.useMemo(
      () => validateMapping(mapping, fields, rows, { locale: loc.locale }),
      [mapping, fields, rows, loc.locale],
    );
    const fieldOf = (fid: string) => fields.find((f) => f.id === fid);
    const errorsIn = (header: string) => check.cellErrors.filter((e) => e.column === header).length;

    const set = (header: string, fid: string) => {
      const next = { ...mapping };
      if (fid) next[header] = fid;
      else delete next[header];
      setOwn(next);
      onChange?.(next, validateMapping(next, fields, rows, { locale: loc.locale }));
    };

    const shown = rows.slice(1, 1 + (previewRows ?? 5));
    const mappedHeaders = headers.filter((h) => mapping[h]);
    const errorAt = (row: number, header: string) =>
      check.cellErrors.find((e) => e.row === row && e.column === header);
    const num = (n: number) => new Intl.NumberFormat(loc.locale).format(n);

    return (
      <div ref={ref} className={cn("zen-flex zen-w-full zen-flex-col zen-gap-4", className)} {...rest}>
        <div className="zen-flex zen-flex-col zen-gap-1" role="status">
          <p className="zen-m-0 zen-flex zen-items-center zen-gap-2 zen-text-sm zen-font-medium zen-tabular-nums zen-text-zen-foreground">
            {check.ok && <Icon name="check-circle" size={16} className="zen-text-zen-success-soft-fg" />}
            {loc.t("columnMapper.summary", {
              mapped: num(mappedHeaders.length),
              columns: num(headers.length),
              valid: num(check.validRows),
              rows: num(check.totalRows),
            })}
            {check.ok && (
              <span className="zen-text-zen-success-soft-fg">
                {"·"} {loc.t("columnMapper.ready")}
              </span>
            )}
          </p>
          {check.missing.map((fid) => (
            <p key={fid} className="zen-m-0 zen-text-sm zen-font-medium zen-text-zen-error">
              {loc.t("columnMapper.missing", { label: fieldOf(fid)?.label ?? fid })}
            </p>
          ))}
          {check.duplicates.map((fid) => (
            <p key={fid} className="zen-m-0 zen-text-sm zen-font-medium zen-text-zen-error">
              {loc.t("columnMapper.duplicate", { label: fieldOf(fid)?.label ?? fid })}
            </p>
          ))}
        </div>

        <div className="zen-w-full zen-overflow-x-auto">
          <table className="zen-w-full zen-border-collapse zen-text-sm">
            <caption className="zen-sr-only">{loc.t("columnMapper.label")}</caption>
            <thead>
              <tr className="zen-text-start zen-text-zen-muted-fg">
                <th scope="col" className="zen-px-2 zen-py-1.5 zen-text-start zen-font-medium">
                  {loc.t("columnMapper.column")}
                </th>
                <th scope="col" className="zen-px-2 zen-py-1.5 zen-text-start zen-font-medium">
                  {loc.t("columnMapper.sample")}
                </th>
                <th scope="col" className="zen-px-2 zen-py-1.5 zen-text-start zen-font-medium">
                  {loc.t("columnMapper.mapsTo")}
                </th>
                <th scope="col" className="zen-px-2 zen-py-1.5 zen-text-start zen-font-medium">
                  {loc.t("columnMapper.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {headers.map((h, c) => {
                const target = mapping[h] ?? "";
                // Keyed by the index: a new file can reorder the columns.
                const selectId = [id, c].join("-");
                const duplicated = !!target && check.duplicates.includes(target);
                const problems = errorsIn(h);
                return (
                  <tr
                    key={selectId}
                    className="zen-border-0 zen-border-t zen-border-solid zen-border-zen-border"
                    data-mapped={target ? "" : undefined}
                  >
                    <th scope="row" className="zen-px-2 zen-py-2 zen-text-start zen-font-medium zen-text-zen-foreground">
                      <label htmlFor={selectId}>{h}</label>
                    </th>
                    <td className="zen-max-w-xs zen-truncate zen-px-2 zen-py-2 zen-font-mono zen-text-xs zen-text-zen-foreground">
                      {rows
                        .slice(1, 3)
                        .map((r) => r[c] ?? "")
                        .filter(Boolean)
                        .join(" · ")}
                    </td>
                    <td className="zen-px-2 zen-py-2">
                      <NativeSelect
                        id={selectId}
                        value={target}
                        aria-invalid={duplicated ? true : undefined}
                        className={cn("zen-w-full zen-min-w-40", duplicated && "zen-border-zen-error")}
                        onChange={(e) => set(h, e.currentTarget.value)}
                      >
                        <option value="">{loc.t("columnMapper.ignore")}</option>
                        {fields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.required ? loc.t("columnMapper.required", { label: f.label }) : f.label}
                          </option>
                        ))}
                      </NativeSelect>
                    </td>
                    <td className="zen-whitespace-nowrap zen-px-2 zen-py-2">
                      {!target ? (
                        <span className="zen-text-zen-muted-fg">{loc.t("columnMapper.ignored")}</span>
                      ) : problems !== 0 ? (
                        <span className="zen-font-medium zen-text-zen-error">
                          {loc.t("columnMapper.problems", { count: problems })}
                        </span>
                      ) : (
                        <span className="zen-text-zen-success-soft-fg">
                          {auto[h] === target ? loc.t("columnMapper.auto") : loc.t("columnMapper.manual")}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {mappedHeaders.length > 0 && (
          <div className="zen-flex zen-flex-col zen-gap-1.5">
            <p className="zen-m-0 zen-text-sm zen-font-medium zen-text-zen-foreground">
              {loc.t("columnMapper.preview")}{" "}
              <span className="zen-font-normal zen-text-zen-muted-fg">
                {loc.t("columnMapper.previewOf", { shown: num(shown.length), rows: num(check.totalRows) })}
              </span>
            </p>
            <div className="zen-w-full zen-overflow-x-auto">
              <table className="zen-w-full zen-border-collapse zen-text-sm">
                <thead>
                  <tr>
                    {mappedHeaders.map((h) => (
                      <th key={h} scope="col" className="zen-px-2 zen-py-1.5 zen-text-start zen-font-medium zen-text-zen-muted-fg">
                        {fieldOf(mapping[h])?.label ?? mapping[h]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((row, r) => (
                    <tr key={r} className="zen-border-0 zen-border-t zen-border-solid zen-border-zen-border">
                      {mappedHeaders.map((h) => {
                        const err = errorAt(r + 1, h);
                        const value = row[headers.indexOf(h)] ?? "";
                        return (
                          <td
                            key={h}
                            data-error={err?.kind}
                            title={err ? loc.t(CELL_KEY[err.kind]) : undefined}
                            className={cn(
                              "zen-px-2 zen-py-1.5 zen-tabular-nums",
                              err ? "zen-bg-zen-error-soft zen-text-zen-error-soft-fg" : "zen-text-zen-foreground",
                            )}
                          >
                            {value || "—"}
                            {err && <span className="zen-sr-only">, {loc.t(CELL_KEY[err.kind])}</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  },
);
ColumnMapper.displayName = "ColumnMapper";

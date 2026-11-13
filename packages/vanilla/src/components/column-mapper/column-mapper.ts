import {
  autoMap,
  validateMapping,
  type ColumnMapping,
  type MapperField,
  type MappingValidation,
} from "@algorisys/zen-ui-core/column-mapper";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";
import { NativeSelect } from "../form/native-select/native-select";
import { Icon } from "../icon/icon";

/**
 * ColumnMapper — map a spreadsheet's columns onto your fields, and see what
 * will import before it does. The vanilla port of the React reference.
 *
 *   const rows = parseDelimited(await file.text());   // or rows from an .xlsx reader
 *   ColumnMapper({ rows, fields: workOrderFields,
 *     onChange: (mapping, check) => setReady(check.ok) }).el
 *
 * Columns are matched by name on arrival — the field's id, label or aliases,
 * ignoring case, accents and punctuation — and never guessed beyond that: a
 * wrong guess imports bad data silently, an unmapped column is merely visible.
 * Each column shows sample values and a "Maps to" select. Above, a summary and
 * every problem in words: a required field nobody mapped, two columns onto one
 * field. Below, a preview of the first rows as they will import, every bad
 * cell marked with its reason (an empty required value, a number or date that
 * does not read in the user's locale).
 *
 * Every change rebuilds the body; the select that made it gets its focus back
 * (found by its id, which is keyed by the column's index as in React).
 */

export interface ColumnMapperProps extends Omit<BaseProps, "children"> {
  /** The file's rows, header first. */
  rows: string[][];
  fields: MapperField[];
  /** Controlled. */
  mapping?: ColumnMapping;
  /** Defaults to the automatic match. */
  defaultMapping?: ColumnMapping;
  onChange?: (mapping: ColumnMapping, validation: MappingValidation) => void;
  /** Rows shown in the preview. Default 5. */
  previewRows?: number;
}

export type ColumnMapperHandle = ZenComponent<ColumnMapperProps, HTMLDivElement>;

const CELL_KEY = {
  required: "columnMapper.cell.required",
  number: "columnMapper.cell.number",
  date: "columnMapper.cell.date",
} as const;

const node = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
};

let uid = 0;

export function ColumnMapper(props: ColumnMapperProps): ColumnMapperHandle {
  let current: ColumnMapperProps = { ...props };
  const loc = useLocale();
  const id = `zen-column-mapper-${++uid}`;
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  /** What the last render built, destroyed by the next one. */
  const built = new Disposer();
  disposer.add(() => built.dispose());

  // The first automatic match, remembered so the status can say "matched by name".
  const auto = autoMap(current.rows[0] ?? [], current.fields);
  let own: ColumnMapping = current.defaultMapping ?? auto;

  const el = document.createElement("div");

  const set = (header: string, fid: string) => {
    const mapping = current.mapping ?? own;
    const next = { ...mapping };
    if (fid) next[header] = fid;
    else delete next[header];
    own = next;
    current.onChange?.(next, validateMapping(next, current.fields, current.rows, { locale: loc.locale }));
    render();
  };

  const render = () => {
    const {
      class: className,
      rows,
      fields,
      mapping: mappingProp,
      defaultMapping: _defaultMapping,
      onChange: _onChange,
      previewRows,
      ...rest
    } = current;
    const mapping = mappingProp ?? own;
    const headers = rows[0] ?? [];
    const check = validateMapping(mapping, fields, rows, { locale: loc.locale });
    const fieldOf = (fid: string) => fields.find((f) => f.id === fid);
    const errorsIn = (header: string) => check.cellErrors.filter((e) => e.column === header).length;
    const errorAt = (row: number, header: string) => check.cellErrors.find((e) => e.row === row && e.column === header);
    const num = (n: number) => new Intl.NumberFormat(loc.locale).format(n);
    const shown = rows.slice(1, 1 + (previewRows ?? 5));
    const mappedHeaders = headers.filter((h) => mapping[h]);

    const focusedId = el.contains(document.activeElement) ? document.activeElement?.id : undefined;
    built.dispose();
    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-4", className);

    // ---- status ---------------------------------------------------------------
    const status = node("div", "zen-flex zen-flex-col zen-gap-1");
    status.setAttribute("role", "status");
    const summary = node(
      "p",
      "zen-m-0 zen-flex zen-items-center zen-gap-2 zen-text-sm zen-font-medium zen-tabular-nums zen-text-zen-foreground",
    );
    if (check.ok) {
      const icon = Icon({ name: "check-circle", size: 16, class: "zen-text-zen-success-soft-fg" });
      built.add(() => icon.destroy());
      summary.append(icon.el);
    }
    summary.append(
      loc.t("columnMapper.summary", {
        mapped: num(mappedHeaders.length),
        columns: num(headers.length),
        valid: num(check.validRows),
        rows: num(check.totalRows),
      }),
    );
    if (check.ok) summary.append(node("span", "zen-text-zen-success-soft-fg", ["·", loc.t("columnMapper.ready")].join(" ")));
    status.append(summary);
    for (const fid of check.missing) {
      status.append(
        node("p", "zen-m-0 zen-text-sm zen-font-medium zen-text-zen-error", loc.t("columnMapper.missing", { label: fieldOf(fid)?.label ?? fid })),
      );
    }
    for (const fid of check.duplicates) {
      status.append(
        node("p", "zen-m-0 zen-text-sm zen-font-medium zen-text-zen-error", loc.t("columnMapper.duplicate", { label: fieldOf(fid)?.label ?? fid })),
      );
    }

    // ---- mapping table --------------------------------------------------------
    const mapScroll = node("div", "zen-w-full zen-overflow-x-auto");
    const table = node("table", "zen-w-full zen-border-collapse zen-text-sm");
    table.append(node("caption", "zen-sr-only", loc.t("columnMapper.label")));
    const thead = node("thead");
    const headRow = node("tr", "zen-text-start zen-text-zen-muted-fg");
    for (const key of ["columnMapper.column", "columnMapper.sample", "columnMapper.mapsTo", "columnMapper.status"] as const) {
      const th = node("th", "zen-px-2 zen-py-1.5 zen-text-start zen-font-medium", loc.t(key));
      th.scope = "col";
      headRow.append(th);
    }
    thead.append(headRow);
    const tbody = node("tbody");
    headers.forEach((h, c) => {
      const target = mapping[h] ?? "";
      // Keyed by the index: a new file can reorder the columns.
      const selectId = [id, c].join("-");
      const duplicated = !!target && check.duplicates.includes(target);
      const problems = errorsIn(h);

      const tr = node("tr", "zen-border-0 zen-border-t zen-border-solid zen-border-zen-border");
      if (target) tr.dataset.mapped = "";

      const th = node("th", "zen-px-2 zen-py-2 zen-text-start zen-font-medium zen-text-zen-foreground");
      th.scope = "row";
      const lab = node("label", undefined, h);
      lab.htmlFor = selectId;
      th.append(lab);

      const sample = node(
        "td",
        "zen-max-w-xs zen-truncate zen-px-2 zen-py-2 zen-font-mono zen-text-xs zen-text-zen-foreground",
        rows
          .slice(1, 3)
          .map((r) => r[c] ?? "")
          .filter(Boolean)
          .join(" · "),
      );

      const selCell = node("td", "zen-px-2 zen-py-2");
      // NativeSelect appends its options BEFORE setting the value, so the
      // mapped field is the one selected.
      const select = NativeSelect({
        id: selectId,
        value: target,
        "aria-invalid": duplicated ? true : undefined,
        class: cn("zen-w-full zen-min-w-40", duplicated && "zen-border-zen-error"),
        options: [
          { value: "", label: loc.t("columnMapper.ignore") },
          ...fields.map((f) => ({
            value: f.id,
            label: f.required ? loc.t("columnMapper.required", { label: f.label }) : f.label,
          })),
        ],
        onChange: (v) => set(h, v),
      });
      built.add(() => select.destroy());
      selCell.append(select.el);

      const state = node("td", "zen-whitespace-nowrap zen-px-2 zen-py-2");
      state.append(
        !target
          ? node("span", "zen-text-zen-muted-fg", loc.t("columnMapper.ignored"))
          : problems !== 0
            ? node("span", "zen-font-medium zen-text-zen-error", loc.t("columnMapper.problems", { count: problems }))
            : node(
                "span",
                "zen-text-zen-success-soft-fg",
                auto[h] === target ? loc.t("columnMapper.auto") : loc.t("columnMapper.manual"),
              ),
      );

      tr.append(th, sample, selCell, state);
      tbody.append(tr);
    });
    table.append(thead, tbody);
    mapScroll.append(table);

    const children: Node[] = [status, mapScroll];

    // ---- preview --------------------------------------------------------------
    if (mappedHeaders.length > 0) {
      const wrap = node("div", "zen-flex zen-flex-col zen-gap-1.5");
      const heading = node("p", "zen-m-0 zen-text-sm zen-font-medium zen-text-zen-foreground", loc.t("columnMapper.preview"));
      heading.append(
        " ",
        node(
          "span",
          "zen-font-normal zen-text-zen-muted-fg",
          loc.t("columnMapper.previewOf", { shown: num(shown.length), rows: num(check.totalRows) }),
        ),
      );
      const scroll = node("div", "zen-w-full zen-overflow-x-auto");
      const pt = node("table", "zen-w-full zen-border-collapse zen-text-sm");
      const ph = node("thead");
      const phr = node("tr");
      for (const h of mappedHeaders) {
        const th = node(
          "th",
          "zen-px-2 zen-py-1.5 zen-text-start zen-font-medium zen-text-zen-muted-fg",
          fieldOf(mapping[h])?.label ?? mapping[h],
        );
        th.scope = "col";
        phr.append(th);
      }
      ph.append(phr);
      const pb = node("tbody");
      shown.forEach((row, r) => {
        const tr = node("tr", "zen-border-0 zen-border-t zen-border-solid zen-border-zen-border");
        for (const h of mappedHeaders) {
          const err = errorAt(r + 1, h);
          const value = row[headers.indexOf(h)] ?? "";
          const td = node(
            "td",
            cn(
              "zen-px-2 zen-py-1.5 zen-tabular-nums",
              err ? "zen-bg-zen-error-soft zen-text-zen-error-soft-fg" : "zen-text-zen-foreground",
            ),
            value || "—",
          );
          if (err) {
            td.dataset.error = err.kind;
            td.title = loc.t(CELL_KEY[err.kind]);
            td.append(node("span", "zen-sr-only", [",", loc.t(CELL_KEY[err.kind])].join(" ")));
          }
          tr.append(td);
        }
        pb.append(tr);
      });
      pt.append(ph, pb);
      scroll.append(pt);
      wrap.append(heading, scroll);
      children.push(wrap);
    }

    el.replaceChildren(...children);
    if (focusedId) document.getElementById(focusedId)?.focus();

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
  };
}

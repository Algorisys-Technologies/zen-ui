import { type JSX, For, Show, createMemo, createSignal, createUniqueId, splitProps, untrack } from "solid-js";
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

export type ColumnMapperProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
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

export const ColumnMapper = (props: ColumnMapperProps) => {
  const [local, rest] = splitProps(props, ["rows", "fields", "mapping", "defaultMapping", "onChange", "previewRows", "class"]);
  const loc = useLocale();
  const id = createUniqueId();
  const headers = () => local.rows[0] ?? [];
  // The first automatic match, remembered so the status can say "matched by name".
  const auto = untrack(() => autoMap(local.rows[0] ?? [], local.fields));
  const [own, setOwn] = createSignal<ColumnMapping>(untrack(() => local.defaultMapping ?? auto));
  const mapping = () => local.mapping ?? own();
  const check = createMemo(() => validateMapping(mapping(), local.fields, local.rows, { locale: loc.locale() }));
  const fieldOf = (fid: string) => local.fields.find((f) => f.id === fid);
  const errorsIn = (header: string) => check().cellErrors.filter((e) => e.column === header).length;

  const set = (header: string, fid: string) => {
    const next = { ...mapping() };
    if (fid) next[header] = fid;
    else delete next[header];
    setOwn(next);
    local.onChange?.(next, validateMapping(next, local.fields, local.rows, { locale: loc.locale() }));
  };

  const shown = () => local.rows.slice(1, 1 + (local.previewRows ?? 5));
  const mappedHeaders = () => headers().filter((h) => mapping()[h]);
  const errorAt = (row: number, header: string) => check().cellErrors.find((e) => e.row === row && e.column === header);
  const num = (n: number) => new Intl.NumberFormat(loc.locale()).format(n);

  return (
    <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-4", local.class)} {...rest}>
      <div class="zen-flex zen-flex-col zen-gap-1" role="status">
        <p class="zen-m-0 zen-flex zen-items-center zen-gap-2 zen-text-sm zen-font-medium zen-tabular-nums zen-text-zen-foreground">
          <Show when={check().ok}>
            <Icon name="check-circle" size={16} class="zen-text-zen-success-soft-fg" />
          </Show>
          {loc.t("columnMapper.summary", {
            mapped: num(mappedHeaders().length),
            columns: num(headers().length),
            valid: num(check().validRows),
            rows: num(check().totalRows),
          })}
          <Show when={check().ok}>
            <span class="zen-text-zen-success-soft-fg">{"\u00b7"} {loc.t("columnMapper.ready")}</span>
          </Show>
        </p>
        <For each={check().missing}>
          {(fid) => (
            <p class="zen-m-0 zen-text-sm zen-font-medium zen-text-zen-error">{loc.t("columnMapper.missing", { label: fieldOf(fid)?.label ?? fid })}</p>
          )}
        </For>
        <For each={check().duplicates}>
          {(fid) => (
            <p class="zen-m-0 zen-text-sm zen-font-medium zen-text-zen-error">{loc.t("columnMapper.duplicate", { label: fieldOf(fid)?.label ?? fid })}</p>
          )}
        </For>
      </div>

      <div class="zen-w-full zen-overflow-x-auto">
        <table class="zen-w-full zen-border-collapse zen-text-sm">
          <caption class="zen-sr-only">{loc.t("columnMapper.label")}</caption>
          <thead>
            <tr class="zen-text-start zen-text-zen-muted-fg">
              <th scope="col" class="zen-px-2 zen-py-1.5 zen-text-start zen-font-medium">{loc.t("columnMapper.column")}</th>
              <th scope="col" class="zen-px-2 zen-py-1.5 zen-text-start zen-font-medium">{loc.t("columnMapper.sample")}</th>
              <th scope="col" class="zen-px-2 zen-py-1.5 zen-text-start zen-font-medium">{loc.t("columnMapper.mapsTo")}</th>
              <th scope="col" class="zen-px-2 zen-py-1.5 zen-text-start zen-font-medium">{loc.t("columnMapper.status")}</th>
            </tr>
          </thead>
          <tbody>
            <For each={headers()}>
              {(h, c) => {
                const target = () => mapping()[h] ?? "";
                // Tracks the index: a new file can reorder the columns.
                const selectId = () => [id, c()].join("-");
                const duplicated = () => !!target() && check().duplicates.includes(target());
                const problems = () => errorsIn(h);
                return (
                  <tr class="zen-border-0 zen-border-t zen-border-solid zen-border-zen-border" data-mapped={target() ? "" : undefined}>
                    <th scope="row" class="zen-px-2 zen-py-2 zen-text-start zen-font-medium zen-text-zen-foreground">
                      <label for={selectId()}>{h}</label>
                    </th>
                    <td class="zen-max-w-xs zen-truncate zen-px-2 zen-py-2 zen-font-mono zen-text-xs zen-text-zen-foreground">
                      {local.rows.slice(1, 3).map((r) => r[c()] ?? "").filter(Boolean).join(" · ")}
                    </td>
                    <td class="zen-px-2 zen-py-2">
                      <NativeSelect
                        id={selectId()}
                        value={target()}
                        aria-invalid={duplicated() ? true : undefined}
                        class={cn("zen-w-full zen-min-w-40", duplicated() && "zen-border-zen-error")}
                        onChange={(e) => set(h, e.currentTarget.value)}
                      >
                        <option value="">{loc.t("columnMapper.ignore")}</option>
                        <For each={local.fields}>
                          {(f) => (
                            <option value={f.id}>
                              {f.required ? loc.t("columnMapper.required", { label: f.label }) : f.label}
                            </option>
                          )}
                        </For>
                      </NativeSelect>
                    </td>
                    <td class="zen-whitespace-nowrap zen-px-2 zen-py-2">
                      <Show
                        when={target()}
                        fallback={<span class="zen-text-zen-muted-fg">{loc.t("columnMapper.ignored")}</span>}
                      >
                        <Show
                          when={problems() === 0}
                          fallback={<span class="zen-font-medium zen-text-zen-error">{loc.t("columnMapper.problems", { count: problems() })}</span>}
                        >
                          <span class="zen-text-zen-success-soft-fg">
                            {auto[h] === target() ? loc.t("columnMapper.auto") : loc.t("columnMapper.manual")}
                          </span>
                        </Show>
                      </Show>
                    </td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>

      <Show when={mappedHeaders().length > 0}>
        <div class="zen-flex zen-flex-col zen-gap-1.5">
          <p class="zen-m-0 zen-text-sm zen-font-medium zen-text-zen-foreground">
            {loc.t("columnMapper.preview")}{" "}
            <span class="zen-font-normal zen-text-zen-muted-fg">
              {loc.t("columnMapper.previewOf", { shown: num(shown().length), rows: num(check().totalRows) })}
            </span>
          </p>
          <div class="zen-w-full zen-overflow-x-auto">
            <table class="zen-w-full zen-border-collapse zen-text-sm">
              <thead>
                <tr>
                  <For each={mappedHeaders()}>
                    {(h) => (
                      <th scope="col" class="zen-px-2 zen-py-1.5 zen-text-start zen-font-medium zen-text-zen-muted-fg">
                        {fieldOf(mapping()[h])?.label ?? mapping()[h]}
                      </th>
                    )}
                  </For>
                </tr>
              </thead>
              <tbody>
                <For each={shown()}>
                  {(row, r) => (
                    <tr class="zen-border-0 zen-border-t zen-border-solid zen-border-zen-border">
                      <For each={mappedHeaders()}>
                        {(h) => {
                          const err = () => errorAt(r() + 1, h);
                          const value = () => row[headers().indexOf(h)] ?? "";
                          return (
                            <td
                              data-error={err()?.kind}
                              title={err() ? loc.t(CELL_KEY[err()!.kind]) : undefined}
                              class={cn(
                                "zen-px-2 zen-py-1.5 zen-tabular-nums",
                                err() ? "zen-bg-zen-error-soft zen-text-zen-error-soft-fg" : "zen-text-zen-foreground",
                              )}
                            >
                              {value() || "—"}
                              <Show when={err()}>
                                {(e) => <span class="zen-sr-only">, {loc.t(CELL_KEY[e().kind])}</span>}
                              </Show>
                            </td>
                          );
                        }}
                      </For>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </Show>
    </div>
  );
};

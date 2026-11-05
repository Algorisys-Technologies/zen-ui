import { type JSX, For, Show, createEffect, createMemo, createSignal, on, onCleanup, onMount, splitProps } from "solid-js";
import {
  chartTable,
  getChartKind,
  makeFormatter,
  selectionAt,
  tableToCsv,
  type AnalyticChartSpec,
  type ChartContext,
  type ChartSelection,
  type EChartsOption,
  type ValueFormat,
} from "@algorisys/zen-ui-core/analytic-chart";
import type { ChartController } from "@algorisys/zen-ui-core/analytic-chart-echarts";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";
import { Button } from "../button/button";
import { SegmentedButton, SegmentedButtonItem } from "../button/button-family";
import { Icon } from "../icon/icon";

/**
 * AnalyticChart — the interactive chart for business screens: bar, line, area,
 * combo (two axes), pie, donut, waterfall, funnel, gauge, heatmap, scatter and
 * treemap, plus any kind an app registers (`registerChartKind`). Click a mark to
 * drill down or filter; switch to the table view; download PNG or CSV.
 *
 *   <AnalyticChart type="combo" data={months} x="month" format="currency"
 *     series={[{ key: "revenue", label: "Revenue" }, { key: "margin", label: "Margin", axis: "secondary" }]}
 *     secondaryFormat="percent" onSelect={(s) => setMonth(s.row.month)} title="Revenue and margin" />
 *
 * Drawn by ECharts, an OPTIONAL peer (`npm i echarts`) loaded when the first
 * chart mounts, so an app that does not chart pays nothing. Without it the
 * chart shows its data as the table, with a one-line note: it still answers the
 * question it was asked.
 *
 * The table view is the keyboard and screen-reader path, not an extra: ECharts
 * cannot be operated by keyboard, so with `onSelect` each table row is a button
 * that selects exactly what a click on its mark does.
 *
 * Series colours are `--zen-chart-1` … `-8`, a categorical set stepped per
 * theme (not the semantic colours, so no category reads as an error), text and
 * grid come from `--zen-color-*`, and all of it follows a theme change; numbers format in
 * the locale and currency of the prop, else the LocaleProvider; right to left
 * mirrors the axes. Everything but the drawing lives in
 * @algorisys/zen-ui-core/analytic-chart, shared by every binding.
 */
export interface AnalyticChartProps
  extends AnalyticChartSpec,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "title" | "onSelect"> {
  /** How values read. Default `number`. */
  format?: ValueFormat;
  /** How values on the secondary axis read (a combo's margin as `percent`). Default: `format`. */
  secondaryFormat?: ValueFormat;
  /** ISO 4217 for `currency`. Default: the LocaleProvider's. */
  currency?: string;
  /** BCP 47. Default: the LocaleProvider's, else the browser's. */
  locale?: string;
  /** A click on a mark, or a table row's button. Without it nothing is clickable. */
  onSelect?: (selection: ChartSelection) => void;
  /** The Chart / Table switch and the downloads. Default true. */
  toolbar?: boolean;
  /** Controlled view. */
  view?: "chart" | "table";
  defaultView?: "chart" | "table";
  onViewChange?: (view: "chart" | "table") => void;
  /** Height of the chart (and of the table view, so switching does not reflow). Default 320. */
  height?: number | string;
  /** `svg` (default) or `canvas` for very large data. Read once, when the chart mounts. */
  renderer?: "svg" | "canvas";
  /** Raw ECharts settings, deep-merged over what the kind built: for what the spec does not cover. */
  option?: EChartsOption;
  /** Download file name, without extension. Default: the title, else "chart". */
  fileName?: string;
}

const SPEC_KEYS = [
  "type",
  "data",
  "x",
  "y",
  "series",
  "stacked",
  "horizontal",
  "total",
  "max",
  "target",
  "zoom",
  "legend",
  "title",
  "description",
] as const;

const NO_THEME: ChartContext["theme"] = {
  palette: [],
  foreground: "",
  muted: "",
  border: "",
  background: "",
  surface: "",
  positive: "",
  negative: "",
  fontFamily: "",
};

const download = (href: string, name: string) => {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
};

const safeName = (s: string) => s.replace(/[\\/:*?"<>|]+/g, " ").trim() || "chart";

export const AnalyticChart = (props: AnalyticChartProps) => {
  const [specProps, local, rest] = splitProps(
    props,
    SPEC_KEYS,
    [
      "format",
      "secondaryFormat",
      "currency",
      "locale",
      "onSelect",
      "toolbar",
      "view",
      "defaultView",
      "onViewChange",
      "height",
      "renderer",
      "option",
      "fileName",
      "class",
    ],
  );
  const locale = useLocale();
  const t = locale.t;

  const [status, setStatus] = createSignal<"loading" | "ready" | "unavailable">("loading");
  const [innerView, setInnerView] = createSignal(local.defaultView ?? "chart");
  const view = () => (status() === "unavailable" ? "table" : (local.view ?? innerView()));
  const setView = (v: "chart" | "table") => {
    if (local.view === undefined) setInnerView(v);
    local.onViewChange?.(v);
  };

  const spec = createMemo<AnalyticChartSpec>(() => {
    const s = {} as Record<string, unknown>;
    for (const k of SPEC_KEYS) s[k] = specProps[k];
    return s as unknown as AnalyticChartSpec;
  });

  const base = createMemo<Pick<ChartContext, "format" | "t">>(() => {
    const opts = { locale: local.locale ?? locale.locale(), currency: local.currency ?? locale.currency() };
    const primary = makeFormatter(local.format, opts);
    const secondary = local.secondaryFormat ? makeFormatter(local.secondaryFormat, opts) : primary;
    return {
      format: (v, axis) => (axis === "secondary" ? secondary(v) : primary(v)),
      t: t as ChartContext["t"],
    };
  });

  const empty = () => spec().data.length === 0;
  const height = () => {
    const h = local.height ?? 320;
    return typeof h === "number" ? `${h}px` : h;
  };
  const name = () => spec().title ?? "";

  // The table is a pure function of the spec; the chart's context only lends
  // it words and formats (theme and direction do not apply to a table).
  const table = createMemo(() => chartTable(spec(), { ...base(), rtl: false, theme: NO_THEME }));
  const columnAxis = (i: number) => table().columns[i]?.axis;
  const cellText = (v: string | number | null, i: number) =>
    v === null ? "" : typeof v === "number" ? base().format(v, columnAxis(i)) : v;

  let host: HTMLDivElement | undefined;
  let controller: ChartController | undefined;
  let disposed = false;

  onMount(async () => {
    try {
      const { createChartController } = await import("@algorisys/zen-ui-core/analytic-chart-echarts");
      if (disposed || !host) return;
      controller = await createChartController(host, {
        renderer: local.renderer,
        // Read the handler when a click happens, so a new one is used without remounting.
        onSelect: (s) => local.onSelect?.(s),
        // The wrapper above always exists; whether a click does anything is this.
        selectable: () => local.onSelect !== undefined,
      });
      if (disposed) {
        controller.dispose();
        return;
      }
      setStatus("ready");
    } catch {
      // echarts is not installed (or failed to load): the table answers instead.
      setStatus("unavailable");
    }
  });

  createEffect(
    // `selectable` is a dep only so the cursor follows onSelect coming and going.
    on([status, spec, base, () => local.option, empty, () => local.onSelect !== undefined], () => {
      if (status() !== "ready" || !controller || empty()) return;
      if (!getChartKind(spec().type)) {
        console.error(`AnalyticChart: unknown type "${spec().type}"`);
        return;
      }
      void controller.render(spec(), base(), local.option);
    }),
  );

  onCleanup(() => {
    disposed = true;
    controller?.dispose();
  });

  const downloadPng = async () => {
    if (!controller) return;
    download(await controller.toPng(), `${safeName(local.fileName ?? (name() || "chart"))}.png`);
  };
  const downloadCsv = () => {
    // A byte-order mark, so Excel reads ₹ and € as UTF-8 rather than mojibake.
    const blob = new Blob(["﻿", tableToCsv(table())], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    download(url, `${safeName(local.fileName ?? (name() || "chart"))}.csv`);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div class={cn("zen-flex zen-flex-col zen-gap-2", local.class)} {...rest}>
      <Show when={local.toolbar !== false}>
        <div class="zen-flex zen-flex-wrap zen-items-center zen-justify-end zen-gap-2">
          <Show when={status() !== "unavailable"}>
            <SegmentedButton
              aria-label={t("analyticChart.view")}
              value={view()}
              onValueChange={(v) => setView(v as "chart" | "table")}
            >
              <SegmentedButtonItem value="chart">{t("analyticChart.chart")}</SegmentedButtonItem>
              <SegmentedButtonItem value="table">{t("analyticChart.table")}</SegmentedButtonItem>
            </SegmentedButton>
          </Show>
          <Show when={view() === "chart" && status() === "ready" && !empty()}>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t("analyticChart.downloadPng")}
              title={t("analyticChart.downloadPng")}
              onClick={() => void downloadPng()}
            >
              <Icon name="download" />
              {t("analyticChart.png")}
            </Button>
          </Show>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("analyticChart.downloadCsv")}
            title={t("analyticChart.downloadCsv")}
            onClick={downloadCsv}
            disabled={empty()}
          >
            <Icon name="download" />
            {t("analyticChart.csv")}
          </Button>
        </div>
      </Show>

      <Show when={status() === "unavailable"}>
        <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">{t("analyticChart.unavailable")}</p>
      </Show>

      {/* The chart host stays mounted in the table view (hidden), so switching
          back does not reload or re-animate it; the ResizeObserver redraws it
          at its size when it reappears. */}
      <div class="zen-relative" style={{ height: height() }} hidden={view() !== "chart"}>
        <div
          ref={host}
          role="img"
          aria-label={[spec().title, spec().description].filter(Boolean).join(". ") || undefined}
          class="zen-h-full zen-w-full"
        />
        <Show when={status() === "loading" || empty()}>
          <div class="zen-absolute zen-inset-0 zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg">
            {empty() ? t("analyticChart.noData") : t("analyticChart.loading")}
          </div>
        </Show>
      </div>

      <Show when={view() === "table"}>
        <div
          class="zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border"
          style={{ "max-height": height() }}
        >
          <table class="zen-w-full zen-border-collapse zen-text-sm">
            <Show when={spec().title}>
              <caption class="zen-sr-only">{spec().title}</caption>
            </Show>
            <thead class="zen-sticky zen-top-0 zen-bg-zen-muted">
              <tr>
                <For each={table().columns}>
                  {(c) => (
                    <th
                      scope="col"
                      class={cn(
                        "zen-px-3 zen-py-2 zen-font-medium zen-text-zen-foreground",
                        c.numeric ? "zen-text-end" : "zen-text-start",
                      )}
                    >
                      {c.label}
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <Show
                when={table().rows.length > 0}
                fallback={
                  <tr>
                    <td class="zen-px-3 zen-py-6 zen-text-center zen-text-zen-muted-fg" colSpan={Math.max(1, table().columns.length)}>
                      {t("analyticChart.noData")}
                    </td>
                  </tr>
                }
              >
                <For each={table().rows}>
                  {(r) => (
                    <tr class="zen-border-t zen-border-zen-border">
                      <For each={r.cells}>
                        {(v, i) => {
                          const numeric = () => table().columns[i()]?.numeric;
                          return (
                            <td
                              class={cn(
                                "zen-px-3 zen-py-1.5 zen-text-zen-foreground",
                                numeric() ? "zen-text-end zen-tabular-nums" : "zen-text-start",
                              )}
                            >
                              <Show when={i() === 0 && local.onSelect} fallback={cellText(v, i())}>
                                <button
                                  type="button"
                                  class="zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-start zen-font-medium zen-text-zen-primary zen-underline-offset-2 hover:zen-underline focus-visible:zen-rounded-zen-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
                                  onClick={() => {
                                    const selection = selectionAt(spec(), r.index, r.seriesKey);
                                    if (selection) local.onSelect?.(selection);
                                  }}
                                >
                                  {cellText(v, i()) || String(r.index + 1)}
                                </button>
                              </Show>
                            </td>
                          );
                        }}
                      </For>
                    </tr>
                  )}
                </For>
              </Show>
            </tbody>
          </table>
        </div>
      </Show>
    </div>
  );
};

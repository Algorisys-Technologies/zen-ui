import * as React from "react";
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
 * grid come from `--zen-color-*`, and all of it follows a theme change; numbers
 * format in the locale and currency of the prop, else the LocaleProvider; right
 * to left mirrors the axes. Everything but the drawing lives in
 * @algorisys/zen-ui-core/analytic-chart, shared by every binding.
 */
export interface AnalyticChartProps
  extends AnalyticChartSpec,
    Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onSelect"> {
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

export const AnalyticChart = React.forwardRef<HTMLDivElement, AnalyticChartProps>(
  (
    {
      type,
      data,
      x,
      y,
      series,
      stacked,
      horizontal,
      total,
      max,
      target,
      threshold,
      zoom,
      legend,
      title,
      description,
      format,
      secondaryFormat,
      currency,
      locale: localeProp,
      onSelect,
      toolbar = true,
      view: viewProp,
      defaultView,
      onViewChange,
      height: heightProp = 320,
      renderer,
      option,
      fileName,
      className,
      ...rest
    },
    ref,
  ) => {
    const locale = useLocale();
    const t = locale.t;

    const [status, setStatus] = React.useState<"loading" | "ready" | "unavailable">("loading");
    const [innerView, setInnerView] = React.useState(defaultView ?? "chart");
    const view = status === "unavailable" ? "table" : (viewProp ?? innerView);
    const setView = (v: "chart" | "table") => {
      if (viewProp === undefined) setInnerView(v);
      onViewChange?.(v);
    };

    // Rebuilt only when a spec field changes, so a parent re-render that passes
    // the same rows does not redraw the chart.
    const spec = React.useMemo<AnalyticChartSpec>(
      () => ({ type, data, x, y, series, stacked, horizontal, total, max, target, threshold, zoom, legend, title, description }),
      [type, data, x, y, series, stacked, horizontal, total, max, target, threshold, zoom, legend, title, description],
    );

    const fmtLocale = localeProp ?? locale.locale;
    const fmtCurrency = currency ?? locale.currency;
    const base = React.useMemo<Pick<ChartContext, "format" | "t" | "locale">>(() => {
      const opts = { locale: fmtLocale, currency: fmtCurrency };
      const primary = makeFormatter(format, opts);
      const secondary = secondaryFormat ? makeFormatter(secondaryFormat, opts) : primary;
      return {
        format: (v, axis) => (axis === "secondary" ? secondary(v) : primary(v)),
        t: t as ChartContext["t"],
        locale: opts.locale,
      };
    }, [fmtLocale, fmtCurrency, format, secondaryFormat, t]);

    const empty = data.length === 0;
    const height = typeof heightProp === "number" ? `${heightProp}px` : heightProp;
    const name = title ?? "";

    // The table is a pure function of the spec; the chart's context only lends
    // it words and formats (theme and direction do not apply to a table).
    const table = React.useMemo(() => chartTable(spec, { ...base, rtl: false, theme: NO_THEME }), [spec, base]);
    const cellText = (v: string | number | null, i: number) =>
      v === null ? "" : typeof v === "number" ? base.format(v, table.columns[i]?.axis) : v;

    const hostRef = React.useRef<HTMLDivElement>(null);
    const controllerRef = React.useRef<ChartController | undefined>(undefined);
    // Read the handler when a click happens, so a new one is used without remounting.
    const onSelectRef = React.useRef(onSelect);
    onSelectRef.current = onSelect;
    const rendererRef = React.useRef(renderer);
    const selectable = onSelect !== undefined;

    React.useEffect(() => {
      let disposed = false;
      void (async () => {
        try {
          const { createChartController } = await import("@algorisys/zen-ui-core/analytic-chart-echarts");
          if (disposed || !hostRef.current) return;
          const controller = await createChartController(hostRef.current, {
            renderer: rendererRef.current,
            onSelect: (s) => onSelectRef.current?.(s),
            // The wrapper above always exists; whether a click does anything is this.
            selectable: () => onSelectRef.current !== undefined,
          });
          if (disposed) {
            controller.dispose();
            return;
          }
          controllerRef.current = controller;
          setStatus("ready");
        } catch {
          // echarts is not installed (or failed to load): the table answers instead.
          if (!disposed) setStatus("unavailable");
        }
      })();
      return () => {
        disposed = true;
        controllerRef.current?.dispose();
        controllerRef.current = undefined;
      };
    }, []);

    React.useEffect(() => {
      const controller = controllerRef.current;
      if (status !== "ready" || !controller || empty) return;
      if (!getChartKind(spec.type)) {
        console.error(`AnalyticChart: unknown type "${spec.type}"`);
        return;
      }
      void controller.render(spec, base, option);
      // `selectable` is a dep only so the cursor follows onSelect coming and going.
    }, [status, spec, base, option, empty, selectable]);

    const downloadPng = async () => {
      const controller = controllerRef.current;
      if (!controller) return;
      download(await controller.toPng(), `${safeName(fileName ?? (name || "chart"))}.png`);
    };
    const downloadCsv = () => {
      // A byte-order mark, so Excel reads ₹ and € as UTF-8 rather than mojibake.
      const blob = new Blob(["﻿", tableToCsv(table)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      download(url, `${safeName(fileName ?? (name || "chart"))}.csv`);
      setTimeout(() => URL.revokeObjectURL(url), 0);
    };

    return (
      <div ref={ref} className={cn("zen-flex zen-flex-col zen-gap-2", className)} {...rest}>
        {toolbar && (
          <div className="zen-flex zen-flex-wrap zen-items-center zen-justify-end zen-gap-2">
            {status !== "unavailable" && (
              <SegmentedButton
                aria-label={t("analyticChart.view")}
                value={view}
                onValueChange={(v) => setView(v as "chart" | "table")}
              >
                <SegmentedButtonItem value="chart">{t("analyticChart.chart")}</SegmentedButtonItem>
                <SegmentedButtonItem value="table">{t("analyticChart.table")}</SegmentedButtonItem>
              </SegmentedButton>
            )}
            {view === "chart" && status === "ready" && !empty && (
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
            )}
            <Button
              variant="ghost"
              size="sm"
              aria-label={t("analyticChart.downloadCsv")}
              title={t("analyticChart.downloadCsv")}
              onClick={downloadCsv}
              disabled={empty}
            >
              <Icon name="download" />
              {t("analyticChart.csv")}
            </Button>
          </div>
        )}

        {status === "unavailable" && (
          <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">{t("analyticChart.unavailable")}</p>
        )}

        {/* The chart host stays mounted in the table view (hidden), so switching
            back does not reload or re-animate it; the ResizeObserver redraws it
            at its size when it reappears. */}
        <div className="zen-relative" style={{ height }} hidden={view !== "chart"}>
          <div
            ref={hostRef}
            role="img"
            aria-label={[title, description].filter(Boolean).join(". ") || undefined}
            className="zen-h-full zen-w-full"
          />
          {(status === "loading" || empty) && (
            <div className="zen-absolute zen-inset-0 zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg">
              {empty ? t("analyticChart.noData") : t("analyticChart.loading")}
            </div>
          )}
        </div>

        {view === "table" && (
          <div
            className="zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border"
            style={{ maxHeight: height }}
          >
            <table className="zen-w-full zen-border-collapse zen-text-sm">
              {title && <caption className="zen-sr-only">{title}</caption>}
              <thead className="zen-sticky zen-top-0 zen-bg-zen-muted">
                <tr>
                  {table.columns.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className={cn(
                        "zen-px-3 zen-py-2 zen-font-medium zen-text-zen-foreground",
                        c.numeric ? "zen-text-end" : "zen-text-start",
                      )}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.length === 0 ? (
                  <tr>
                    <td
                      className="zen-px-3 zen-py-6 zen-text-center zen-text-zen-muted-fg"
                      colSpan={Math.max(1, table.columns.length)}
                    >
                      {t("analyticChart.noData")}
                    </td>
                  </tr>
                ) : (
                  table.rows.map((r, ri) => (
                    <tr key={`${r.index}:${r.seriesKey ?? ""}:${ri}`} className="zen-border-t zen-border-zen-border">
                      {r.cells.map((v, i) => (
                        <td
                          key={table.columns[i]?.key ?? i}
                          className={cn(
                            "zen-px-3 zen-py-1.5 zen-text-zen-foreground",
                            table.columns[i]?.numeric ? "zen-text-end zen-tabular-nums" : "zen-text-start",
                          )}
                        >
                          {i === 0 && onSelect ? (
                            <button
                              type="button"
                              className="zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-start zen-font-medium zen-text-zen-primary zen-underline-offset-2 hover:zen-underline focus-visible:zen-rounded-zen-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
                              onClick={() => {
                                const selection = selectionAt(spec, r.index, r.seriesKey);
                                if (selection) onSelect(selection);
                              }}
                            >
                              {cellText(v, i) || String(r.index + 1)}
                            </button>
                          ) : (
                            cellText(v, i)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  },
);
AnalyticChart.displayName = "AnalyticChart";

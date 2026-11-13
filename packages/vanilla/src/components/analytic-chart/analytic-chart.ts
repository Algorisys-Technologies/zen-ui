import {
  chartTable,
  getChartKind,
  makeFormatter,
  selectionAt,
  tableToCsv,
  type AnalyticChartSpec,
  type ChartContext,
  type ChartSelection,
  type ChartTable,
  type EChartsOption,
  type ValueFormat,
} from "@algorisys/zen-ui-core/analytic-chart";
import type { ChartController } from "@algorisys/zen-ui-core/analytic-chart-echarts";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";
import { Button } from "../button/button";
import { SegmentedButton } from "../button/button-family";
import { Icon } from "../icon/icon";

/**
 * AnalyticChart — the interactive chart for business screens: bar, line, area,
 * combo (two axes), pie, donut, waterfall, funnel, gauge, heatmap, scatter and
 * treemap, plus any kind an app registers (`registerChartKind`). Click a mark to
 * drill down or filter; switch to the table view; download PNG or CSV.
 *
 *   const chart = AnalyticChart({ type: "combo", data: months, x: "month", format: "currency",
 *     series: [{ key: "revenue", label: "Revenue" }, { key: "margin", label: "Margin", axis: "secondary" }],
 *     secondaryFormat: "percent", onSelect: (s) => pick(s.row.month), title: "Revenue and margin" });
 *   host.append(chart.el);
 *
 * Vanilla port of the React reference: same props, same behaviour. Drawn by
 * ECharts, an OPTIONAL peer (`npm i echarts`) loaded when the first chart is
 * built, so an app that does not chart pays nothing. Without it the chart
 * shows its data as the table, with a one-line note.
 *
 * The table view is the keyboard and screen-reader path: ECharts cannot be
 * operated by keyboard, so with `onSelect` each table row is a button that
 * selects exactly what a click on its mark does.
 *
 * Series colours are `--zen-chart-1` … `-8` (per theme), text and grid come
 * from `--zen-color-*`, and all of it follows a theme change. Numbers format in
 * the locale and currency of the prop, else the LocaleProvider the chart was
 * built in. Everything but the drawing lives in
 * @algorisys/zen-ui-core/analytic-chart, shared by every binding.
 */
export interface AnalyticChartProps extends AnalyticChartSpec, Omit<BaseProps, "children" | "title"> {
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
  /** `svg` (default) or `canvas` for very large data. Read once, when the chart is built. */
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
  "threshold",
  "zoom",
  "legend",
  "title",
  "description",
] as const;

const OWN_KEYS = new Set<string>([
  ...SPEC_KEYS,
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
  "children",
]);

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

const LINK_BUTTON =
  "zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-start zen-font-medium zen-text-zen-primary zen-underline-offset-2 hover:zen-underline focus-visible:zen-rounded-zen-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";

export function AnalyticChart(props: AnalyticChartProps): ZenComponent<AnalyticChartProps> {
  let current: AnalyticChartProps = { ...props };
  const loc = useLocale();
  const t = loc.t;
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let status: "loading" | "ready" | "unavailable" = "loading";
  let innerView: "chart" | "table" = current.defaultView ?? "chart";
  let controller: ChartController | undefined;
  let disposed = false;

  const view = (): "chart" | "table" => (status === "unavailable" ? "table" : (current.view ?? innerView));
  const setView = (v: "chart" | "table") => {
    if (current.view === undefined) innerView = v;
    current.onViewChange?.(v);
    paint();
  };

  const spec = (): AnalyticChartSpec => {
    const s = {} as Record<string, unknown>;
    for (const k of SPEC_KEYS) s[k] = current[k];
    return s as unknown as AnalyticChartSpec;
  };
  const base = (): Pick<ChartContext, "format" | "t" | "locale"> => {
    const opts = { locale: current.locale ?? loc.locale, currency: current.currency ?? loc.currency };
    const primary = makeFormatter(current.format, opts);
    const secondary = current.secondaryFormat ? makeFormatter(current.secondaryFormat, opts) : primary;
    return {
      format: (v, axis) => (axis === "secondary" ? secondary(v) : primary(v)),
      t: t as ChartContext["t"],
      locale: opts.locale,
    };
  };
  const empty = () => current.data.length === 0;
  const height = () => {
    const h = current.height ?? 320;
    return typeof h === "number" ? `${h}px` : h;
  };
  // The table is a pure function of the spec; the chart's context only lends
  // it words and formats (theme and direction do not apply to a table).
  const table = (): ChartTable => chartTable(spec(), { ...base(), rtl: false, theme: NO_THEME });
  const fileBase = () => safeName(current.fileName ?? (current.title || "chart"));

  // ---- DOM. The chart host is built once and never replaced: ECharts lives in
  // it, and it stays mounted (hidden) in the table view so switching back does
  // not reload or re-animate it. Toolbar, note and table are repainted.
  const el = document.createElement("div");
  const toolbarEl = document.createElement("div");
  toolbarEl.className = "zen-flex zen-flex-wrap zen-items-center zen-justify-end zen-gap-2";
  const note = document.createElement("p");
  note.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
  const frame = document.createElement("div");
  frame.className = "zen-relative";
  const host = document.createElement("div");
  host.setAttribute("role", "img");
  host.className = "zen-h-full zen-w-full";
  const overlay = document.createElement("div");
  overlay.className =
    "zen-absolute zen-inset-0 zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg";
  frame.append(host);
  const tableWrap = document.createElement("div");
  tableWrap.className = "zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border";

  const segmented = SegmentedButton({
    "aria-label": t("analyticChart.view"),
    items: [
      { value: "chart", label: t("analyticChart.chart") },
      { value: "table", label: t("analyticChart.table") },
    ],
    value: view(),
    onValueChange: (v) => setView(v as "chart" | "table"),
  });
  const pngButton = Button({
    variant: "ghost",
    size: "sm",
    "aria-label": t("analyticChart.downloadPng"),
    title: t("analyticChart.downloadPng"),
    iconLeft: Icon({ name: "download" }),
    children: t("analyticChart.png"),
    onClick: () => void downloadPng(),
  } as Parameters<typeof Button>[0]);
  const csvButton = Button({
    variant: "ghost",
    size: "sm",
    "aria-label": t("analyticChart.downloadCsv"),
    title: t("analyticChart.downloadCsv"),
    iconLeft: Icon({ name: "download" }),
    children: t("analyticChart.csv"),
    onClick: () => downloadCsv(),
  } as Parameters<typeof Button>[0]);
  disposer.add(() => {
    segmented.destroy();
    pngButton.destroy();
    csvButton.destroy();
  });

  const downloadPng = async () => {
    if (!controller) return;
    download(await controller.toPng(), `${fileBase()}.png`);
  };
  const downloadCsv = () => {
    // A byte-order mark, so Excel reads ₹ and € as UTF-8 rather than mojibake.
    const blob = new Blob(["﻿", tableToCsv(table())], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    download(url, `${fileBase()}.csv`);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const paintTable = () => {
    const tbl = table();
    const b = base();
    const cellText = (v: string | number | null, i: number) =>
      v === null ? "" : typeof v === "number" ? b.format(v, tbl.columns[i]?.axis) : v;

    const tableEl = document.createElement("table");
    tableEl.className = "zen-w-full zen-border-collapse zen-text-sm";
    if (current.title) {
      const caption = document.createElement("caption");
      caption.className = "zen-sr-only";
      caption.textContent = current.title;
      tableEl.append(caption);
    }
    const thead = document.createElement("thead");
    thead.className = "zen-sticky zen-top-0 zen-bg-zen-muted";
    const headRow = document.createElement("tr");
    for (const c of tbl.columns) {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = cn(
        "zen-px-3 zen-py-2 zen-font-medium zen-text-zen-foreground",
        c.numeric ? "zen-text-end" : "zen-text-start",
      );
      th.textContent = c.label;
      headRow.append(th);
    }
    thead.append(headRow);

    const tbody = document.createElement("tbody");
    if (tbl.rows.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.className = "zen-px-3 zen-py-6 zen-text-center zen-text-zen-muted-fg";
      td.colSpan = Math.max(1, tbl.columns.length);
      td.textContent = t("analyticChart.noData");
      tr.append(td);
      tbody.append(tr);
    }
    for (const r of tbl.rows) {
      const tr = document.createElement("tr");
      tr.className = "zen-border-t zen-border-zen-border";
      r.cells.forEach((v, i) => {
        const td = document.createElement("td");
        td.className = cn(
          "zen-px-3 zen-py-1.5 zen-text-zen-foreground",
          tbl.columns[i]?.numeric ? "zen-text-end zen-tabular-nums" : "zen-text-start",
        );
        if (i === 0 && current.onSelect) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = LINK_BUTTON;
          btn.textContent = cellText(v, i) || String(r.index + 1);
          // The listener dies with the button when the table is repainted.
          btn.addEventListener("click", () => {
            const selection = selectionAt(spec(), r.index, r.seriesKey);
            if (selection) current.onSelect?.(selection);
          });
          td.append(btn);
        } else {
          td.textContent = cellText(v, i);
        }
        tr.append(td);
      });
      tbody.append(tr);
    }
    tableEl.append(thead, tbody);
    tableWrap.replaceChildren(tableEl);
  };

  const paint = () => {
    const v = view();
    el.className = cn("zen-flex zen-flex-col zen-gap-2", current.class);

    toolbarEl.replaceChildren();
    if (current.toolbar !== false) {
      if (status !== "unavailable") {
        segmented.update({ value: v });
        toolbarEl.append(segmented.el);
      }
      if (v === "chart" && status === "ready" && !empty()) toolbarEl.append(pngButton.el);
      csvButton.update({ disabled: empty() });
      toolbarEl.append(csvButton.el);
    }

    note.textContent = t("analyticChart.unavailable");

    frame.style.height = height();
    frame.hidden = v !== "chart";
    const label = [current.title, current.description].filter(Boolean).join(". ");
    if (label) host.setAttribute("aria-label", label);
    else host.removeAttribute("aria-label");
    overlay.textContent = empty() ? t("analyticChart.noData") : t("analyticChart.loading");
    // Removed rather than `hidden`: its zen-flex beats the [hidden] UA rule, so
    // a hidden overlay still covered the chart and swallowed every click.
    if (status === "loading" || empty()) frame.append(overlay);
    else overlay.remove();

    tableWrap.style.maxHeight = height();
    if (v === "table") paintTable();

    el.replaceChildren(
      ...(current.toolbar !== false ? [toolbarEl] : []),
      ...(status === "unavailable" ? [note] : []),
      frame,
      ...(v === "table" ? [tableWrap] : []),
    );
  };

  const draw = () => {
    if (status !== "ready" || !controller || empty()) return;
    const s = spec();
    if (!getChartKind(s.type)) {
      console.error(`AnalyticChart: unknown type "${s.type}"`);
      return;
    }
    void controller.render(s, base(), current.option);
  };

  const applyRest = () => {
    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(current)) if (!OWN_KEYS.has(k)) rest[k] = v;
    removeProps?.();
    removeProps = applyProps(el, rest);
  };

  const boot = async () => {
    try {
      const { createChartController } = await import("@algorisys/zen-ui-core/analytic-chart-echarts");
      if (disposed) return;
      const made = await createChartController(host, {
        renderer: current.renderer,
        // Read when a click happens, so update({ onSelect }) takes effect at once.
        onSelect: (s) => current.onSelect?.(s),
        selectable: () => current.onSelect !== undefined,
      });
      if (disposed) {
        made.dispose();
        return;
      }
      controller = made;
      status = "ready";
    } catch {
      // echarts is not installed (or failed to load): the table answers instead.
      if (disposed) return;
      status = "unavailable";
    }
    paint();
    draw();
  };

  paint();
  applyRest();
  void boot();
  disposer.add(() => removeProps?.());
  disposer.add(() => {
    disposed = true;
    controller?.dispose();
  });

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      applyRest();
      paint();
      draw();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/**
 * AnalyticChart's DOM half: mounting an ECharts instance on an element and
 * keeping it right. Shared by every binding, so they load, theme, resize,
 * select and export identically; a binding only renders the shell around it
 * (toolbar, table view, fallback).
 *
 * ECharts is an OPTIONAL peer, imported here on first use and never statically,
 * so an app that does not chart pays nothing. `createChartController` rejects
 * when it is not installed; the component catches that and shows the table.
 *
 * What it keeps right without being asked:
 *   - SIZE: follows the element (ResizeObserver), not the window, so a chart in
 *     a resizable pane or a collapsing sidebar redraws.
 *   - THEME: colours come from `--zen-*` on the element, re-read when
 *     `data-theme`, `dir`, `class` or `style` changes on it or any ancestor
 *     (themes can be set on any element, not only <html>).
 *   - DIRECTION: right to left is read from the element's computed direction.
 */
import {
  buildChartOption,
  getChartKind,
  selectionAt,
  type AnalyticChartSpec,
  type ChartContext,
  type ChartSelection,
  type ChartTheme,
  type EChartsOption,
} from "./analytic-chart";

/**
 * Eight categorical colours, `--zen-chart-1` … `--zen-chart-8` (tokens.css,
 * stepped per theme). Deliberately NOT the semantic tokens: drawn from
 * error / success, a plain category read as bad or good news. The fallbacks
 * are the light set, for a page that has not loaded tokens.css. The order
 * is the colour-blind safety; see the CHART block in tokens.css.
 */
const PALETTE_FALLBACK = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];

/** The chart's colours and type, read from the `--zen-*` tokens on (or above) `el`. */
export function readChartTheme(el: Element): ChartTheme {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const foreground = v("--zen-color-foreground", "#343434");
  return {
    palette: PALETTE_FALLBACK.map((hex, i) => v(`--zen-chart-${i + 1}`, hex)),
    foreground,
    muted: v("--zen-color-muted-fg", foreground),
    border: v("--zen-color-border", "#D5D5D5"),
    background: v("--zen-color-background", "#ffffff"),
    surface: v("--zen-color-muted", "#F5F5F5"),
    positive: v("--zen-chart-positive", v("--zen-color-success", "#1A7A1E")),
    negative: v("--zen-chart-negative", v("--zen-color-error", "#CE1010")),
    fontFamily: v("--zen-font-sans", cs.fontFamily),
  };
}

export interface ChartControllerOptions {
  /** `svg` (default): crisp, prints, scales. `canvas`: for tens of thousands of points. */
  renderer?: "svg" | "canvas";
  /** A click on a mark. Without it the marks are not clickable (and do not look it). */
  onSelect?: (selection: ChartSelection) => void;
  /**
   * Whether a click does anything right now. A binding that hands over a
   * stable wrapper (to pick up a new handler without remounting) passes
   * `() => props.onSelect !== undefined` here: the wrapper itself always
   * exists, so without this every chart's marks looked clickable. Read on
   * every draw. Default: whether `onSelect` was given.
   */
  selectable?: () => boolean;
}

export interface ChartController {
  /** Draw (or redraw) a spec. Loads the kind's ECharts parts on first use. */
  render(spec: AnalyticChartSpec, base: Pick<ChartContext, "format" | "t">, extra?: EChartsOption): Promise<void>;
  /** The chart as a PNG data URL, on the theme's background, at 2x. */
  toPng(): Promise<string>;
  dispose(): void;
}

type EChartsCore = typeof import("echarts/core");

let corePromise: Promise<EChartsCore> | undefined;
const loadedKinds = new Set<string>();

/** echarts/core with what every chart uses: tooltip, legend, aria, both renderers. */
function loadCore(): Promise<EChartsCore> {
  corePromise ??= Promise.all([
    import("echarts/core"),
    import("echarts/components").then(({ TooltipComponent, LegendComponent, AriaComponent }) => [
      TooltipComponent,
      LegendComponent,
      AriaComponent,
    ]),
    import("echarts/renderers").then(({ SVGRenderer, CanvasRenderer }) => [SVGRenderer, CanvasRenderer]),
  ])
    .then(([core, components, renderers]) => {
      core.use([...components, ...renderers] as Parameters<EChartsCore["use"]>[0]);
      return core;
    })
    .catch((err) => {
      // Let a later mount retry (the package may be installed by then in dev).
      corePromise = undefined;
      throw err;
    });
  return corePromise;
}

/**
 * Mount ECharts on `el`. Rejects when echarts is not installed (or cannot be
 * loaded), which the component turns into its table fallback.
 */
export async function createChartController(el: HTMLElement, opts: ChartControllerOptions = {}): Promise<ChartController> {
  const core = await loadCore();
  const selectable = opts.selectable ?? (() => opts.onSelect !== undefined);
  const renderer = opts.renderer ?? "svg";
  type Instance = ReturnType<EChartsCore["init"]>;
  let chart: Instance | undefined;
  // The kinds registered when `chart` was created. ECharts fixes an instance's
  // layout and processing steps at init, so a kind registered later (lazily,
  // by this or another chart on the page) is half-present on it: measured, a
  // funnel drew nothing ("reading 'points'"), a treemap nothing, and pie labels
  // and zoom threw. An instance that predates its kind is made again.
  let kindsAtInit = new Set<string>();
  let disposed = false;
  let last: { spec: AnalyticChartSpec; base: Pick<ChartContext, "format" | "t">; extra?: EChartsOption } | undefined;
  let frame = 0;

  const draw = () => {
    if (disposed || !last) return;
    const { spec, base, extra } = last;
    const ctx: ChartContext = {
      ...base,
      theme: readChartTheme(el),
      rtl: getComputedStyle(el).direction === "rtl",
      width: el.clientWidth || undefined,
    };
    const option = buildChartOption(spec, ctx, extra);
    // A mark that does nothing when clicked must not look clickable.
    const cursor = selectable() ? "pointer" : "default";
    const series = Array.isArray(option.series) ? option.series : option.series ? [option.series] : [];
    option.series = series.map((s: EChartsOption) => ({ cursor, ...s }));
    chart?.setOption(option, { notMerge: true });
  };
  const redrawSoon = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  };

  const createInstance = () => {
    chart?.dispose();
    chart = core.init(el, undefined, { renderer });
    kindsAtInit = new Set(loadedKinds);
    chart.on("click", (p: { dataIndex: number; seriesId?: string; value?: unknown }) => {
      if (!opts.onSelect || !selectable() || !last || p.seriesId?.startsWith("__")) return;
      const selection = selectionAt(last.spec, p.dataIndex, p.seriesId);
      if (selection) opts.onSelect(selection);
    });
    // The series `cursor` set in draw() is honoured by some ECharts types and
    // not others: measured, a funnel with no onSelect still showed a pointer.
    // zrender sets the hover cursor BEFORE it fires its own mousemove, so
    // overriding it here covers every kind, an app's own included.
    const zr = chart.getZr();
    zr.on("mousemove", () => {
      if (!selectable()) zr.setCursorStyle("default");
    });
  };

  // Resize, then rebuild: category labels wrap to the width they get.
  const resize = new ResizeObserver(() => {
    if (disposed) return;
    chart?.resize();
    redrawSoon();
  });
  resize.observe(el);

  // Themes and direction can be set on any ancestor, so watch the chain (a
  // handful of nodes) rather than the whole document's subtree.
  const themeWatch = new MutationObserver(redrawSoon);
  for (let n: Element | null = el; n; n = n.parentElement) {
    themeWatch.observe(n, { attributes: true, attributeFilter: ["data-theme", "dir", "class", "style"] });
  }

  return {
    async render(spec, base, extra) {
      const kind = getChartKind(spec.type);
      if (!kind) throw new Error(`AnalyticChart: unknown type "${spec.type}".`);
      if (!loadedKinds.has(kind.id)) {
        core.use((await kind.modules()) as Parameters<EChartsCore["use"]>[0]);
        loadedKinds.add(kind.id);
      }
      if (disposed) return;
      if (!chart || !kindsAtInit.has(kind.id)) createInstance();
      last = { spec, base, extra };
      draw();
    },
    async toPng() {
      if (!chart) throw new Error("AnalyticChart: nothing drawn yet");
      const background = readChartTheme(el).background;
      if (renderer === "canvas") return chart.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: background });
      // The SVG renderer exports SVG only: rasterise the SVG on screen. Neither
      // of ECharts' own exports decoded as an image here (getDataURL's and
      // renderToSVGString's, measured); the serialised live <svg> does.
      const svgEl = el.querySelector("svg");
      if (!svgEl) throw new Error("AnalyticChart: nothing drawn yet");
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svgEl)], { type: "image/svg+xml" }));
      const img = new Image();
      img.src = url;
      try {
        await img.decode();
      } finally {
        URL.revokeObjectURL(url);
      }
      const canvas = document.createElement("canvas");
      const w = el.clientWidth;
      const h = el.clientHeight;
      canvas.width = w * 2;
      canvas.height = h * 2;
      const g = canvas.getContext("2d");
      if (!g) throw new Error("AnalyticChart: no 2D canvas to export with");
      g.scale(2, 2);
      g.fillStyle = background;
      g.fillRect(0, 0, w, h);
      g.drawImage(img, 0, 0, w, h);
      return canvas.toDataURL("image/png");
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      themeWatch.disconnect();
      chart?.dispose();
    },
  };
}

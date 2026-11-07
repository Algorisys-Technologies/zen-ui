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
import { type AnalyticChartSpec, type ChartContext, type ChartSelection, type ChartTheme, type EChartsOption } from "./analytic-chart";
/** The chart's colours and type, read from the `--zen-*` tokens on (or above) `el`. */
export declare function readChartTheme(el: Element): ChartTheme;
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
/**
 * Mount ECharts on `el`. Rejects when echarts is not installed (or cannot be
 * loaded), which the component turns into its table fallback.
 */
export declare function createChartController(el: HTMLElement, opts?: ChartControllerOptions): Promise<ChartController>;

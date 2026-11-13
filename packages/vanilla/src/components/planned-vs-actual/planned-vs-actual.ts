import { plannedVsActual, planAt, type CountPoint } from "@algorisys/zen-ui-core/planned-vs-actual";
import { timelineTicks } from "@algorisys/zen-ui-core/state-timeline";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";

/**
 * PlannedVsActual — pieces made this shift against the plan.
 *
 *   PlannedVsActual({
 *     start: shift.start, end: shift.end,
 *     planTotal: 2000,                 // or plan: [{ at, value }, …] with breaks
 *     actual: counterReadings,          // cumulative readings
 *     unit: "pcs", timeZone: "Asia/Kolkata",
 *   }).el
 *
 * Vanilla port of the React reference; same DOM, classes and message keys.
 *
 * The headline is the gap in words — "304 pcs behind plan" — with what was
 * made against what was planned so far, and, once 15% of the shift has run,
 * where the pace so far will end up. Under it a chart: the plan dashed over
 * the whole shift, the actual as steps up to now (a counter reading holds until
 * the next one; nothing is drawn after now), and the gap marked at now.
 *
 * "On plan" within `tolerance` of the plan total (default 2%), so one piece
 * does not flip the headline. After the shift ends the figures are final.
 * The chart is drawn in plain SVG. The 30 s clock that runs while `now` is not
 * given stops on `destroy()`.
 */

export interface PlannedVsActualProps extends Omit<BaseProps, "children"> {
  start: Date | number;
  end: Date | number;
  /** Defaults to a clock that advances every 30 s. */
  now?: Date | number;
  plan?: CountPoint[];
  planTotal?: number;
  actual: CountPoint[];
  /** Appended to counts ("pcs", "kg"). */
  unit?: string;
  /** "On plan" within this fraction of the plan total. Default 0.02. */
  tolerance?: number;
  /** IANA zone the time axis reads in. */
  timeZone?: string;
  /** Hide the chart, keeping the figures (a tile, a table cell). */
  hideChart?: boolean;
}

const SVG = "http://www.w3.org/2000/svg";
const CLOCK_MS = 30_000;

const svg = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) => {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
};

const text = (tag: "span", className: string, content: string) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = content;
  return node;
};

export function PlannedVsActual(props: PlannedVsActualProps): ZenComponent<PlannedVsActualProps> {
  let current: PlannedVsActualProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  let clock = Date.now();
  let timer: ReturnType<typeof setInterval> | undefined;

  const el = document.createElement("div");

  const render = () => {
    const {
      start,
      end,
      now: nowProp,
      plan,
      planTotal,
      actual,
      unit,
      tolerance,
      timeZone,
      hideChart,
      class: className,
      ...rest
    } = current;
    const s = +start;
    const e = +end;
    const nowMs = +(nowProp ?? clock);
    const r = plannedVsActual({ start: s, end: e, now: nowMs, plan, planTotal, actual, tolerance });
    const numFormat = new Intl.NumberFormat(loc.locale, { maximumFractionDigits: 0 });
    const qty = (n: number) => (unit ? numFormat.format(n) + " " + unit : numFormat.format(n));

    const headline =
      r.status === "on"
        ? loc.t("plannedVsActual.on")
        : loc.t(r.status === "behind" ? "plannedVsActual.behind" : "plannedVsActual.ahead", { count: qty(Math.abs(r.gap)) });
    let detail: string;
    if (r.final) {
      detail = loc.t("plannedVsActual.final", { actual: qty(r.actualNow), total: qty(r.planTotal) });
    } else {
      const made = loc.t("plannedVsActual.made", { actual: qty(r.actualNow), plan: qty(r.planNow) });
      detail =
        r.projected === null
          ? made
          : made + ". " + loc.t("plannedVsActual.projection", { projected: qty(r.projected), total: qty(r.planTotal) });
    }
    const tone =
      r.status === "behind" ? "zen-text-zen-error" : r.status === "ahead" ? "zen-text-zen-success-soft-fg" : "zen-text-zen-foreground";

    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-3", className);
    el.dataset.status = r.status;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);

    const figures = document.createElement("div");
    figures.className = "zen-flex zen-flex-col zen-gap-0.5";
    figures.append(
      text("span", cn("zen-text-2xl zen-font-bold zen-tabular-nums zen-leading-tight", tone), headline),
      text("span", "zen-text-sm zen-tabular-nums zen-text-zen-foreground", detail),
    );

    if (hideChart) {
      el.replaceChildren(figures);
      return;
    }

    // Chart geometry in a 0..100 box; the SVG stretches, strokes do not.
    const X = (t: number) => (e > s ? ((t - s) / (e - s)) * 100 : 0);
    const top = Math.max(r.planTotal, ...actual.map((p) => p.value), r.projected ?? 0, 1) * 1.08;
    const Y = (v: number) => 100 - (v / top) * 100;
    const pts = plan ?? [
      { at: s, value: 0 },
      { at: e, value: planTotal ?? 0 },
    ];
    const times = [s, ...pts.map((p) => +p.at).filter((t) => t > s && t < e), e].sort((a, b) => a - b);
    const planPath = times.map((t, i) => `${i ? "L" : "M"}${X(t)} ${Y(planAt(pts, t))}`).join(" ");
    const sorted = actual
      .map((p) => ({ t: +p.at, v: p.value }))
      .filter((p) => p.t >= s && p.t <= r.at)
      .sort((a, b) => a.t - b.t);
    let actualPath = `M${X(s)} ${Y(0)}`;
    for (const p of sorted) actualPath += ` H${X(p.t)} V${Y(p.v)}`;
    actualPath += ` H${X(r.at)}`;
    const ticks = timelineTicks(s, e, { timeZone, maxTicks: 6 });
    const clockFormat = new Intl.DateTimeFormat(loc.locale, { hour: "2-digit", minute: "2-digit", timeZone });

    const chart = document.createElement("div");
    chart.className = "zen-flex zen-flex-col zen-gap-1";
    chart.setAttribute("aria-hidden", "true");

    const legend = document.createElement("div");
    legend.className = "zen-flex zen-gap-4 zen-text-xs zen-text-zen-muted-fg";
    const planKey = text("span", "zen-inline-flex zen-items-center zen-gap-1.5", "");
    const dash = svg("svg", { width: 18, height: 6, class: "zen-overflow-visible" });
    dash.append(svg("line", { x1: 0, y1: 3, x2: 18, y2: 3, stroke: "currentColor", "stroke-width": 2, "stroke-dasharray": "4 3" }));
    planKey.append(dash, loc.t("plannedVsActual.plan"));
    const actualKey = text("span", "zen-inline-flex zen-items-center zen-gap-1.5", "");
    actualKey.append(text("span", "zen-h-0.5 zen-w-4 zen-bg-zen-primary", ""), loc.t("plannedVsActual.actual"));
    legend.append(planKey, actualKey);

    const plot = document.createElement("div");
    plot.className =
      "zen-relative zen-h-40 zen-w-full zen-border-0 zen-border-b zen-border-s zen-border-solid zen-border-zen-border";
    const canvas = svg("svg", {
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      class: "zen-absolute zen-inset-0 zen-h-full zen-w-full zen-overflow-visible rtl:-zen-scale-x-100",
    });
    canvas.append(
      svg("path", {
        d: planPath,
        fill: "none",
        stroke: "var(--zen-color-muted-fg)",
        "stroke-width": 2,
        "stroke-dasharray": "6 4",
        "vector-effect": "non-scaling-stroke",
      }),
      svg("path", {
        d: actualPath,
        fill: "none",
        stroke: "var(--zen-color-primary)",
        "stroke-width": 2.5,
        "vector-effect": "non-scaling-stroke",
      }),
    );
    if (!r.final && r.at > s) {
      canvas.append(
        svg("line", {
          x1: X(r.at),
          x2: X(r.at),
          y1: 0,
          y2: 100,
          stroke: "var(--zen-color-border)",
          "stroke-width": 1,
          "vector-effect": "non-scaling-stroke",
        }),
        svg("line", {
          "data-part": "gap",
          x1: X(r.at),
          x2: X(r.at),
          y1: Y(r.actualNow),
          y2: Y(r.planNow),
          stroke:
            r.status === "behind"
              ? "var(--zen-color-error)"
              : r.status === "ahead"
                ? "var(--zen-color-success)"
                : "var(--zen-color-muted-fg)",
          "stroke-width": 4,
          "vector-effect": "non-scaling-stroke",
        }),
      );
    }
    plot.append(canvas);

    const axis = document.createElement("div");
    axis.className = "zen-relative zen-h-4 zen-text-xs zen-tabular-nums zen-text-zen-muted-fg";
    for (const tick of ticks.ticks) {
      const label = text(
        "span",
        cn(
          "zen-absolute zen-top-0 zen-whitespace-nowrap",
          tick.left < 0.04
            ? ""
            : tick.left > 0.96
              ? "-zen-translate-x-full rtl:zen-translate-x-full"
              : "-zen-translate-x-1/2 rtl:zen-translate-x-1/2",
        ),
        clockFormat.format(tick.at),
      );
      label.style.insetInlineStart = `${tick.left * 100}%`;
      axis.append(label);
    }

    chart.append(legend, plot, axis);
    el.replaceChildren(figures, chart);
  };

  const syncClock = () => {
    const ticking = current.now === undefined;
    if (ticking && timer === undefined) {
      clock = Date.now();
      timer = setInterval(() => {
        clock = Date.now();
        render();
      }, CLOCK_MS);
    } else if (!ticking && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
  disposer.add(() => {
    clearInterval(timer);
    timer = undefined;
  });
  disposer.add(() => removeProps?.());

  syncClock();
  render();

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      syncClock();
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

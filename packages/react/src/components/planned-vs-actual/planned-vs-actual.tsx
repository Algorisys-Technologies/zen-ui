import * as React from "react";
import { plannedVsActual, planAt, type CountPoint } from "@algorisys/zen-ui-core/planned-vs-actual";
import { timelineTicks } from "@algorisys/zen-ui-core/state-timeline";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * PlannedVsActual — pieces made this shift against the plan.
 *
 *   <PlannedVsActual
 *     start={shift.start} end={shift.end}
 *     planTotal={2000}                 // or plan={[{ at, value }, …]} with breaks
 *     actual={counterReadings}          // cumulative readings
 *     unit="pcs" timeZone="Asia/Kolkata"
 *   />
 *
 * The headline is the gap in words — "304 pcs behind plan" — with what was
 * made against what was planned so far, and, once 15% of the shift has run,
 * where the pace so far will end up. Under it a chart: the plan dashed over
 * the whole shift, the actual as steps up to now (a counter reading holds until
 * the next one; nothing is drawn after now), and the gap marked at now.
 *
 * "On plan" within `tolerance` of the plan total (default 2%), so one piece
 * does not flip the headline. After the shift ends the figures are final.
 * The chart is drawn in plain SVG — no chart library to load for a board.
 */

export type PlannedVsActualProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
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
};

const PlannedVsActual = React.forwardRef<HTMLDivElement, PlannedVsActualProps>(
  ({ start, end, now: nowProp, plan, planTotal, actual, unit, tolerance, timeZone, hideChart, className, ...rest }, ref) => {
    const loc = useLocale();
    const [clock, setClock] = React.useState(() => Date.now());
    const ticking = nowProp === undefined;
    React.useEffect(() => {
      if (!ticking) return;
      setClock(Date.now());
      const timer = setInterval(() => setClock(Date.now()), 30_000);
      return () => clearInterval(timer);
    }, [ticking]);

    const s = +start;
    const e = +end;
    const nowMs = +(nowProp ?? clock);
    const r = React.useMemo(
      () => plannedVsActual({ start: s, end: e, now: nowMs, plan, planTotal, actual, tolerance }),
      [s, e, nowMs, plan, planTotal, actual, tolerance],
    );
    const num = (n: number) => new Intl.NumberFormat(loc.locale, { maximumFractionDigits: 0 }).format(n);
    const qty = (n: number) => (unit ? `${num(n)} ${unit}` : num(n));

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
          : `${made}. ${loc.t("plannedVsActual.projection", { projected: qty(r.projected), total: qty(r.planTotal) })}`;
    }

    // Chart geometry in a 0..100 box; the SVG stretches, strokes do not.
    const X = (t: number) => (e > s ? ((t - s) / (e - s)) * 100 : 0);
    const top = Math.max(r.planTotal, ...actual.map((p) => p.value), r.projected ?? 0, 1) * 1.08;
    const Y = (v: number) => 100 - (v / top) * 100;
    const pts = plan ?? [{ at: s, value: 0 }, { at: e, value: planTotal ?? 0 }];
    const times = [s, ...pts.map((p) => +p.at).filter((t) => t > s && t < e), e].sort((a, b) => a - b);
    const planPath = times.map((t, i) => `${i ? "L" : "M"}${X(t)} ${Y(planAt(pts, t))}`).join(" ");
    const sorted = actual
      .map((p) => ({ t: +p.at, v: p.value }))
      .filter((p) => p.t >= s && p.t <= r.at)
      .sort((a, b) => a.t - b.t);
    let actualPath = `M${X(s)} ${Y(0)}`;
    for (const p of sorted) actualPath += ` H${X(p.t)} V${Y(p.v)}`;
    actualPath += ` H${X(r.at)}`;
    const ticks = React.useMemo(() => timelineTicks(s, e, { timeZone, maxTicks: 6 }), [s, e, timeZone]);
    const clockText = (t: number) =>
      new Intl.DateTimeFormat(loc.locale, { hour: "2-digit", minute: "2-digit", timeZone }).format(t);

    const tone =
      r.status === "behind" ? "zen-text-zen-error" : r.status === "ahead" ? "zen-text-zen-success-soft-fg" : "zen-text-zen-foreground";

    return (
      <div ref={ref} className={cn("zen-flex zen-w-full zen-flex-col zen-gap-3", className)} data-status={r.status} {...rest}>
        <div className="zen-flex zen-flex-col zen-gap-0.5">
          <span className={cn("zen-text-2xl zen-font-bold zen-tabular-nums zen-leading-tight", tone)}>{headline}</span>
          <span className="zen-text-sm zen-tabular-nums zen-text-zen-foreground">{detail}</span>
        </div>

        {!hideChart ? (
          <div className="zen-flex zen-flex-col zen-gap-1" aria-hidden="true">
            <div className="zen-flex zen-gap-4 zen-text-xs zen-text-zen-muted-fg">
              <span className="zen-inline-flex zen-items-center zen-gap-1.5">
                <svg width="18" height="6" className="zen-overflow-visible">
                  <line x1="0" y1="3" x2="18" y2="3" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
                </svg>
                {loc.t("plannedVsActual.plan")}
              </span>
              <span className="zen-inline-flex zen-items-center zen-gap-1.5">
                <span className="zen-h-0.5 zen-w-4 zen-bg-zen-primary" />
                {loc.t("plannedVsActual.actual")}
              </span>
            </div>
            <div className="zen-relative zen-h-40 zen-w-full zen-border-0 zen-border-b zen-border-s zen-border-solid zen-border-zen-border">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="zen-absolute zen-inset-0 zen-h-full zen-w-full zen-overflow-visible rtl:-zen-scale-x-100">
                <path d={planPath} fill="none" stroke="var(--zen-color-muted-fg)" strokeWidth="2" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
                <path d={actualPath} fill="none" stroke="var(--zen-color-primary)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                {!r.final && r.at > s ? (
                  <>
                    <line x1={X(r.at)} x2={X(r.at)} y1="0" y2="100" stroke="var(--zen-color-border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    <line
                      data-part="gap"
                      x1={X(r.at)}
                      x2={X(r.at)}
                      y1={Y(r.actualNow)}
                      y2={Y(r.planNow)}
                      stroke={r.status === "behind" ? "var(--zen-color-error)" : r.status === "ahead" ? "var(--zen-color-success)" : "var(--zen-color-muted-fg)"}
                      strokeWidth="4"
                      vectorEffect="non-scaling-stroke"
                    />
                  </>
                ) : null}
              </svg>
            </div>
            <div className="zen-relative zen-h-4 zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">
              {ticks.ticks.map((tick) => (
                <span
                  key={tick.at}
                  className={cn(
                    "zen-absolute zen-top-0 zen-whitespace-nowrap",
                    tick.left < 0.04 ? "" : tick.left > 0.96 ? "-zen-translate-x-full rtl:zen-translate-x-full" : "-zen-translate-x-1/2 rtl:zen-translate-x-1/2",
                  )}
                  style={{ insetInlineStart: `${tick.left * 100}%` }}
                >
                  {clockText(tick.at)}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);
PlannedVsActual.displayName = "PlannedVsActual";

export { PlannedVsActual };

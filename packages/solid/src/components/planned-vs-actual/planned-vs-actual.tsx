import { type JSX, For, Show, createMemo, createSignal, onCleanup, splitProps } from "solid-js";
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
 *     actual={counterReadings()}        // cumulative readings
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

export type PlannedVsActualProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
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

export const PlannedVsActual = (props: PlannedVsActualProps) => {
  const [local, rest] = splitProps(props, [
    "start", "end", "now", "plan", "planTotal", "actual", "unit", "tolerance", "timeZone", "hideChart", "class",
  ]);
  const loc = useLocale();
  const [clock, setClock] = createSignal(Date.now());
  const timer = setInterval(() => setClock(Date.now()), 30_000);
  onCleanup(() => clearInterval(timer));

  const r = createMemo(() =>
    plannedVsActual({
      start: local.start,
      end: local.end,
      now: local.now ?? clock(),
      plan: local.plan,
      planTotal: local.planTotal,
      actual: local.actual,
      tolerance: local.tolerance,
    }),
  );
  const num = (n: number) => new Intl.NumberFormat(loc.locale(), { maximumFractionDigits: 0 }).format(n);
  const qty = (n: number) => (local.unit ? `${num(n)} ${local.unit}` : num(n));

  const headline = () => {
    const x = r();
    if (x.status === "on") return loc.t("plannedVsActual.on");
    return loc.t(x.status === "behind" ? "plannedVsActual.behind" : "plannedVsActual.ahead", { count: qty(Math.abs(x.gap)) });
  };
  const detail = () => {
    const x = r();
    if (x.final) return loc.t("plannedVsActual.final", { actual: qty(x.actualNow), total: qty(x.planTotal) });
    const made = loc.t("plannedVsActual.made", { actual: qty(x.actualNow), plan: qty(x.planNow) });
    return x.projected === null ? made : `${made}. ${loc.t("plannedVsActual.projection", { projected: qty(x.projected), total: qty(x.planTotal) })}`;
  };

  // Chart geometry in a 0..100 box; the SVG stretches, strokes do not.
  const s = () => +local.start;
  const e = () => +local.end;
  const X = (t: number) => (e() > s() ? ((t - s()) / (e() - s())) * 100 : 0);
  const top = createMemo(() => {
    const x = r();
    const max = Math.max(x.planTotal, ...local.actual.map((p) => p.value), x.projected ?? 0, 1);
    return max * 1.08;
  });
  const Y = (v: number) => 100 - (v / top()) * 100;
  const planPath = createMemo(() => {
    const pts = local.plan ?? [{ at: s(), value: 0 }, { at: e(), value: local.planTotal ?? 0 }];
    const times = [s(), ...pts.map((p) => +p.at).filter((t) => t > s() && t < e()), e()].sort((a, b) => a - b);
    return times.map((t, i) => `${i ? "L" : "M"}${X(t)} ${Y(planAt(pts, t))}`).join(" ");
  });
  const actualPath = createMemo(() => {
    const at = r().at;
    const readings = local.actual
      .map((p) => ({ t: +p.at, v: p.value }))
      .filter((p) => p.t >= s() && p.t <= at)
      .sort((a, b) => a.t - b.t);
    let d = `M${X(s())} ${Y(0)}`;
    for (const p of readings) d += ` H${X(p.t)} V${Y(p.v)}`;
    return `${d} H${X(at)}`;
  });
  const ticks = createMemo(() => timelineTicks(local.start, local.end, { timeZone: local.timeZone, maxTicks: 6 }));
  const clockText = (t: number) =>
    new Intl.DateTimeFormat(loc.locale(), { hour: "2-digit", minute: "2-digit", timeZone: local.timeZone }).format(t);

  const tone = () =>
    r().status === "behind" ? "zen-text-zen-error" : r().status === "ahead" ? "zen-text-zen-success-soft-fg" : "zen-text-zen-foreground";

  return (
    <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-3", local.class)} data-status={r().status} {...rest}>
      <div class="zen-flex zen-flex-col zen-gap-0.5">
        <span class={cn("zen-text-2xl zen-font-bold zen-tabular-nums zen-leading-tight", tone())}>{headline()}</span>
        <span class="zen-text-sm zen-tabular-nums zen-text-zen-foreground">{detail()}</span>
      </div>

      <Show when={!local.hideChart}>
        <div class="zen-flex zen-flex-col zen-gap-1" aria-hidden="true">
          <div class="zen-flex zen-gap-4 zen-text-xs zen-text-zen-muted-fg">
            <span class="zen-inline-flex zen-items-center zen-gap-1.5">
              <svg width="18" height="6" class="zen-overflow-visible">
                <line x1="0" y1="3" x2="18" y2="3" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3" />
              </svg>
              {loc.t("plannedVsActual.plan")}
            </span>
            <span class="zen-inline-flex zen-items-center zen-gap-1.5">
              <span class="zen-h-0.5 zen-w-4 zen-bg-zen-primary" />
              {loc.t("plannedVsActual.actual")}
            </span>
          </div>
          <div class="zen-relative zen-h-40 zen-w-full zen-border-0 zen-border-b zen-border-s zen-border-solid zen-border-zen-border">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="zen-absolute zen-inset-0 zen-h-full zen-w-full zen-overflow-visible rtl:-zen-scale-x-100">
              <path d={planPath()} fill="none" stroke="var(--zen-color-muted-fg)" stroke-width="2" stroke-dasharray="6 4" vector-effect="non-scaling-stroke" />
              <path d={actualPath()} fill="none" stroke="var(--zen-color-primary)" stroke-width="2.5" vector-effect="non-scaling-stroke" />
              <Show when={!r().final && r().at > s()}>
                <line x1={X(r().at)} x2={X(r().at)} y1="0" y2="100" stroke="var(--zen-color-border)" stroke-width="1" vector-effect="non-scaling-stroke" />
                <line
                  data-part="gap"
                  x1={X(r().at)}
                  x2={X(r().at)}
                  y1={Y(r().actualNow)}
                  y2={Y(r().planNow)}
                  stroke={r().status === "behind" ? "var(--zen-color-error)" : r().status === "ahead" ? "var(--zen-color-success)" : "var(--zen-color-muted-fg)"}
                  stroke-width="4"
                  vector-effect="non-scaling-stroke"
                />
              </Show>
            </svg>
          </div>
          <div class="zen-relative zen-h-4 zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">
            <For each={ticks().ticks}>
              {(tick) => (
                <span
                  class={cn(
                    "zen-absolute zen-top-0 zen-whitespace-nowrap",
                    tick.left < 0.04 ? "" : tick.left > 0.96 ? "-zen-translate-x-full rtl:zen-translate-x-full" : "-zen-translate-x-1/2 rtl:zen-translate-x-1/2",
                  )}
                  style={{ "inset-inline-start": `${tick.left * 100}%` }}
                >
                  {clockText(tick.at)}
                </span>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
};

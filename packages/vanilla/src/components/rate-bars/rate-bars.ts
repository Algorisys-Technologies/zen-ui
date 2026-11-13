import { machineStateMessageKey, machineStateTone, type MachineStateTone } from "@algorisys/zen-ui-core/machine-state";
import { rateBuckets, type RateBucketsInput } from "@algorisys/zen-ui-core/rate-bars";
import type { CountPoint } from "@algorisys/zen-ui-core/planned-vs-actual";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";

/**
 * RateBars — output in equal time buckets, each bar coloured by what the
 * machine was doing.
 *
 *   RateBars({
 *     readings: counter, segments: stateRecord,
 *     from: hourAgo, to: now, bucketMs: 2 * 60_000,
 *     target: 300, unit: "pcs",
 *   }).el
 *
 * Vanilla port of the React reference; same DOM, classes and message keys.
 *
 * A dip reads at a glance: a short green bar ran slow, a red stub stopped.
 * Every bar keeps a 3px stub in its state colour, so a bucket that made
 * nothing still says why. The bucket that contains now is still filling — it is
 * drawn hatched and its rate is over the elapsed part only, so it never reads
 * as a sudden collapse.
 *
 * The figures above the bars — the rate now (the last complete bucket), the
 * average, the target — are the accessible summary; the bars repeat them.
 * The 15 s clock that runs while `now` is not given stops on `destroy()`.
 */

export interface RateBarsProps extends Omit<BaseProps, "children"> {
  readings: CountPoint[];
  segments?: RateBucketsInput["segments"];
  from: Date | number;
  to: Date | number;
  /** Bucket width. Default 2 minutes. */
  bucketMs?: number;
  /** Defaults to a clock that advances every 15 s. */
  now?: Date | number;
  /** Per hour, drawn as a line. */
  target?: number;
  /** Appended to rates ("pcs"). */
  unit?: string;
  timeZone?: string;
}

const FILL: Record<MachineStateTone, string> = {
  running: "zen-bg-zen-state-running",
  down: "zen-bg-zen-state-down",
  setup: "zen-bg-zen-state-setup",
  planned: "zen-bg-zen-state-planned",
  idle: "zen-bg-zen-state-idle",
  unknown: "zen-bg-zen-state-unknown",
};

const PARTIAL_HATCH = "repeating-linear-gradient(135deg, rgba(255,255,255,0.55) 0 2px, transparent 2px 5px)";
const CLOCK_MS = 15_000;

export function RateBars(props: RateBarsProps): ZenComponent<RateBarsProps> {
  let current: RateBarsProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  let clock = Date.now();
  let timer: ReturnType<typeof setInterval> | undefined;

  const el = document.createElement("div");

  const span = (className: string, text: string) => {
    const s = document.createElement("span");
    if (className) s.className = className;
    s.textContent = text;
    return s;
  };

  const render = () => {
    const { readings, segments, from, to, bucketMs, now: nowProp, target, unit, timeZone, class: className, ...rest } =
      current;
    const width = bucketMs ?? 120_000;
    const fromMs = +from;
    const toMs = +to;
    const nowMs = +(nowProp ?? clock);
    const buckets = rateBuckets({ readings, segments, from: fromMs, to: toMs, bucketMs: width, now: nowMs });
    const complete = buckets.filter((b) => !b.partial);
    const currentRate = complete.at(-1)?.perHour ?? null;
    const spanMs = complete.reduce((n, b) => n + (b.end - b.start), 0);
    const average = spanMs > 0 ? (complete.reduce((n, b) => n + b.count, 0) / spanMs) * 3_600_000 : null;
    const top = Math.max(1, target ?? 0, ...buckets.map((b) => b.perHour)) * 1.1;
    const slots = Math.max(1, Math.ceil((toMs - fromMs) / width));

    const numFormat = new Intl.NumberFormat(loc.locale, { maximumFractionDigits: 0 });
    const rate = (n: number) => {
      const v = numFormat.format(n);
      return unit ? v + " " + unit : v;
    };
    const clockFormat = new Intl.DateTimeFormat(loc.locale, { hour: "2-digit", minute: "2-digit", timeZone });
    const clockText = (t: number) => clockFormat.format(t);

    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-2", className);
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);

    const figures = document.createElement("div");
    figures.className = "zen-flex zen-flex-wrap zen-items-baseline zen-gap-x-4 zen-gap-y-1";
    figures.append(
      span(
        "zen-text-xl zen-font-bold zen-tabular-nums zen-text-zen-foreground",
        currentRate === null ? "—" : loc.t("rateBars.current", { rate: rate(currentRate) }),
      ),
    );
    if (average !== null) {
      figures.append(
        span("zen-text-sm zen-tabular-nums zen-text-zen-foreground", loc.t("rateBars.average", { rate: rate(average) })),
      );
    }
    if (target !== undefined) {
      figures.append(
        span("zen-text-sm zen-tabular-nums zen-text-zen-muted-fg", loc.t("rateBars.target", { rate: rate(target) })),
      );
    }

    const plot = document.createElement("div");
    plot.className = "zen-relative zen-h-28 zen-w-full zen-border-0 zen-border-b zen-border-solid zen-border-zen-border";
    plot.setAttribute("aria-hidden", "true");
    const grid = document.createElement("div");
    grid.className = "zen-absolute zen-inset-0 zen-grid zen-items-end zen-gap-px";
    grid.style.gridTemplateColumns = `repeat(${slots}, minmax(0, 1fr))`;
    for (const b of buckets) {
      const tone = machineStateTone(b.state);
      const bar = document.createElement("div");
      bar.dataset.tone = tone;
      if (b.partial) bar.dataset.partial = "";
      const words = loc.t("rateBars.bucket", {
        from: clockText(b.start),
        to: clockText(b.end),
        count: rate(b.count),
        state: loc.t(machineStateMessageKey(b.state)),
      });
      bar.title = b.partial ? words + " " + loc.t("rateBars.filling") : words;
      bar.className = cn("zen-rounded-t-zen-sm", FILL[tone], b.partial && "zen-opacity-50");
      bar.style.height = `${(b.perHour / top) * 100}%`;
      bar.style.minHeight = "3px";
      if (b.partial) bar.style.backgroundImage = PARTIAL_HATCH;
      grid.append(bar);
    }
    plot.append(grid);
    if (target !== undefined) {
      const line = document.createElement("span");
      line.className = "zen-absolute zen-inset-x-0 zen-border-0 zen-border-t-2 zen-border-dashed zen-border-zen-foreground";
      line.style.bottom = `${(target / top) * 100}%`;
      plot.append(line);
    }

    const ends = document.createElement("div");
    ends.className = "zen-flex zen-justify-between zen-text-xs zen-tabular-nums zen-text-zen-muted-fg";
    ends.setAttribute("aria-hidden", "true");
    ends.append(span("", clockText(fromMs)), span("", clockText(toMs)));

    el.replaceChildren(figures, plot, ends);
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

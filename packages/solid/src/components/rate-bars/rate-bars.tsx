import { type JSX, For, Show, createMemo, createSignal, onCleanup, splitProps } from "solid-js";
import { machineStateMessageKey, machineStateTone, type MachineStateTone } from "@algorisys/zen-ui-core/machine-state";
import { rateBuckets, type RateBucketsInput } from "@algorisys/zen-ui-core/rate-bars";
import type { CountPoint } from "@algorisys/zen-ui-core/planned-vs-actual";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * RateBars — output in equal time buckets, each bar coloured by what the
 * machine was doing.
 *
 *   <RateBars
 *     readings={counter()} segments={stateRecord()}
 *     from={hourAgo} to={now} bucketMs={2 * 60_000}
 *     target={300} unit="pcs"
 *   />
 *
 * A dip reads at a glance: a short green bar ran slow, a red stub stopped.
 * Every bar keeps a 3px stub in its state colour, so a bucket that made
 * nothing still says why. The bucket that contains now is still filling — it is
 * drawn hatched and its rate is over the elapsed part only, so it never reads
 * as a sudden collapse.
 *
 * The figures above the bars — the rate now (the last complete bucket), the
 * average, the target — are the accessible summary; the bars repeat them.
 */

export type RateBarsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
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
};

const FILL: Record<MachineStateTone, string> = {
  running: "zen-bg-zen-state-running",
  down: "zen-bg-zen-state-down",
  setup: "zen-bg-zen-state-setup",
  planned: "zen-bg-zen-state-planned",
  idle: "zen-bg-zen-state-idle",
  unknown: "zen-bg-zen-state-unknown",
};

export const RateBars = (props: RateBarsProps) => {
  const [local, rest] = splitProps(props, ["readings", "segments", "from", "to", "bucketMs", "now", "target", "unit", "timeZone", "class"]);
  const loc = useLocale();
  const [clock, setClock] = createSignal(Date.now());
  const timer = setInterval(() => setClock(Date.now()), 15_000);
  onCleanup(() => clearInterval(timer));

  const buckets = createMemo(() =>
    rateBuckets({
      readings: local.readings,
      segments: local.segments,
      from: local.from,
      to: local.to,
      bucketMs: local.bucketMs ?? 120_000,
      now: local.now ?? clock(),
    }),
  );
  const complete = () => buckets().filter((b) => !b.partial);
  const current = () => complete().at(-1)?.perHour ?? null;
  const average = () => {
    const c = complete();
    const span = c.reduce((n, b) => n + (b.end - b.start), 0);
    return span > 0 ? (c.reduce((n, b) => n + b.count, 0) / span) * 3_600_000 : null;
  };
  const top = () => Math.max(1, local.target ?? 0, ...buckets().map((b) => b.perHour)) * 1.1;
  const slots = () => Math.max(1, Math.ceil((+local.to - +local.from) / (local.bucketMs ?? 120_000)));

  const rate = (n: number) => {
    const v = new Intl.NumberFormat(loc.locale(), { maximumFractionDigits: 0 }).format(n);
    return local.unit ? `${v} ${local.unit}` : v;
  };
  const clockText = (t: number) =>
    new Intl.DateTimeFormat(loc.locale(), { hour: "2-digit", minute: "2-digit", timeZone: local.timeZone }).format(t);

  return (
    <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-2", local.class)} {...rest}>
      <div class="zen-flex zen-flex-wrap zen-items-baseline zen-gap-x-4 zen-gap-y-1">
        <span class="zen-text-xl zen-font-bold zen-tabular-nums zen-text-zen-foreground">
          {current() === null ? "—" : loc.t("rateBars.current", { rate: rate(current() as number) })}
        </span>
        <Show when={average() !== null}>
          <span class="zen-text-sm zen-tabular-nums zen-text-zen-foreground">{loc.t("rateBars.average", { rate: rate(average() as number) })}</span>
        </Show>
        <Show when={local.target !== undefined}>
          <span class="zen-text-sm zen-tabular-nums zen-text-zen-muted-fg">{loc.t("rateBars.target", { rate: rate(local.target as number) })}</span>
        </Show>
      </div>
      <div class="zen-relative zen-h-28 zen-w-full zen-border-0 zen-border-b zen-border-solid zen-border-zen-border" aria-hidden="true">
        <div class="zen-absolute zen-inset-0 zen-grid zen-items-end zen-gap-px" style={{ "grid-template-columns": `repeat(${slots()}, minmax(0, 1fr))` }}>
          <For each={buckets()}>
            {(b) => {
              const tone = machineStateTone(b.state);
              return (
                <div
                  data-tone={tone}
                  data-partial={b.partial ? "" : undefined}
                  title={`${loc.t("rateBars.bucket", {
                    from: clockText(b.start),
                    to: clockText(b.end),
                    count: rate(b.count),
                    state: loc.t(machineStateMessageKey(b.state)),
                  })}${b.partial ? ` ${loc.t("rateBars.filling")}` : ""}`}
                  class={cn("zen-rounded-t-zen-sm", FILL[tone], b.partial && "zen-opacity-50")}
                  style={{
                    height: `${(b.perHour / top()) * 100}%`,
                    "min-height": "3px",
                    ...(b.partial
                      ? { "background-image": "repeating-linear-gradient(135deg, rgba(255,255,255,0.55) 0 2px, transparent 2px 5px)" }
                      : {}),
                  }}
                />
              );
            }}
          </For>
        </div>
        <Show when={local.target !== undefined}>
          <span
            class="zen-absolute zen-inset-x-0 zen-border-0 zen-border-t-2 zen-border-dashed zen-border-zen-foreground"
            style={{ bottom: `${((local.target as number) / top()) * 100}%` }}
          />
        </Show>
      </div>
      <div class="zen-flex zen-justify-between zen-text-xs zen-tabular-nums zen-text-zen-muted-fg" aria-hidden="true">
        <span>{clockText(+local.from)}</span>
        <span>{clockText(+local.to)}</span>
      </div>
    </div>
  );
};

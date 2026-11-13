import * as React from "react";
import { directionOf } from "@algorisys/zen-ui-core";
import { machineStateMessageKey, type MachineStateTone } from "@algorisys/zen-ui-core/machine-state";
import {
  durationMessage,
  layoutStateTimeline,
  layoutTimelineEvents,
  stateTimelineTotals,
  timelineTicks,
  type StateSegment,
  type StateSegmentInput,
  type TimelineEventInput,
} from "@algorisys/zen-ui-core/state-timeline";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * StateTimeline — one machine's states along a window of time.
 *
 *   <StateTimeline
 *     label="Press 4"
 *     from={shiftStart} to={shiftEnd}
 *     segments={record}
 *     onSegmentClick={(seg) => openCausePicker(seg)}
 *   />
 *
 * Every stretch is exactly as wide as its duration. A hole in the record is
 * hatched "no data" rather than absorbed by its neighbours, and nothing is drawn
 * after `now`. Stack several with the same `from` / `to` to compare machines.
 *
 * Interactive only when `onSegmentClick` is given: segments become buttons in
 * one tab stop, walked with the arrow keys (Home / End for the ends). Without
 * it the strip is a picture, and the group's accessible name carries the
 * totals so a screen reader still gets what it shows.
 *
 * `now` defaults to a clock that advances every 30 s, so an open segment grows
 * on a live board. Pass `now` to pin it.
 */

export type StateTimelineSize = "sm" | "md" | "lg";

export type StateTimelineProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onClick"> & {
  /** Names the strip — the machine, line or person it is the record of. */
  label: string;
  segments: StateSegmentInput[];
  from: Date | number;
  to: Date | number;
  now?: Date | number;
  /** Moments rather than stretches: a batch change, an issue raised. */
  events?: TimelineEventInput[];
  /** IANA zone the axis and times read in — the plant's. Defaults to the browser's. */
  timeZone?: string;
  /** Makes segments buttons. Called with the laid-out segment (its `id` is the record's). */
  onSegmentClick?: (segment: StateSegment) => void;
  /** Which segments can be clicked. Defaults to every segment that is not a hole. */
  isSegmentClickable?: (segment: StateSegment) => boolean;
  /** The selected segment's id, drawn raised. */
  selectedId?: string;
  hideAxis?: boolean;
  size?: StateTimelineSize;
};

const FILL: Record<MachineStateTone, string> = {
  running: "zen-bg-zen-state-running",
  down: "zen-bg-zen-state-down",
  setup: "zen-bg-zen-state-setup",
  planned: "zen-bg-zen-state-planned",
  idle: "zen-bg-zen-state-idle",
  unknown: "",
};

// Hatched, not filled: any solid colour would claim something about minutes
// nobody has information about.
const HATCH: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(135deg, var(--zen-state-unknown) 0 1px, transparent 1px 6px)",
};

const HEIGHT: Record<StateTimelineSize, string> = {
  sm: "zen-h-3",
  md: "zen-h-6",
  lg: "zen-h-10",
};

/** Date.now(), advancing every `ms` while `enabled`. */
function useClock(ms: number, enabled: boolean) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(timer);
  }, [ms, enabled]);
  return now;
}

const box = (s: StateSegment): React.CSSProperties => ({
  insetInlineStart: `${s.left * 100}%`,
  width: `${s.width * 100}%`,
  // True position, never moved; a stop too short to see still gets 2px.
  minWidth: "2px",
  ...(s.tone === "unknown" ? HATCH : {}),
});

const StateTimeline = React.forwardRef<HTMLDivElement, StateTimelineProps>(
  (
    {
      label,
      segments: segmentsInput,
      from,
      to,
      now: nowProp,
      events: eventsInput,
      timeZone,
      onSegmentClick,
      isSegmentClickable,
      selectedId,
      hideAxis,
      size,
      className,
      ...rest
    },
    ref,
  ) => {
    const loc = useLocale();
    const clock = useClock(30_000, nowProp === undefined);
    const now = nowProp === undefined ? clock : nowProp;

    const fromMs = +from;
    const toMs = +to;
    const nowMs = +now;
    const segments = React.useMemo(
      () => layoutStateTimeline(segmentsInput, { from: fromMs, to: toMs, now: nowMs }),
      [segmentsInput, fromMs, toMs, nowMs],
    );
    const events = React.useMemo(
      () => layoutTimelineEvents(eventsInput ?? [], { from: fromMs, to: toMs, now: nowMs }),
      [eventsInput, fromMs, toMs, nowMs],
    );
    // About one label per 88px — "06:00 AM" in text-xs is ~60px, plus a gap — so a narrow
    // strip gets fewer, longer steps instead of labels drawn over each other.
    const [stripWidth, setStripWidth] = React.useState(576);
    const ticks = React.useMemo(
      () => timelineTicks(fromMs, toMs, { timeZone, maxTicks: Math.max(2, Math.floor(stripWidth / 88)) }),
      [fromMs, toMs, timeZone, stripWidth],
    );
    const nowLeft = nowMs > fromMs && nowMs < toMs ? (nowMs - fromMs) / (toMs - fromMs) : null;

    const timeFormat = new Intl.DateTimeFormat(
      loc.locale,
      ticks.stepMs >= 24 * 3_600_000
        ? { month: "short", day: "numeric", timeZone }
        : { hour: "2-digit", minute: "2-digit", timeZone },
    );
    const clockText = (t: number) =>
      new Intl.DateTimeFormat(loc.locale, { hour: "2-digit", minute: "2-digit", timeZone }).format(t);
    const duration = (msLong: number) => {
      const d = durationMessage(msLong);
      return loc.t(d.key, d.values);
    };
    const stateName = (s: StateSegment) => s.label ?? loc.t(machineStateMessageKey(s.state));
    const describe = (s: StateSegment) =>
      s.open
        ? loc.t("stateTimeline.ongoing", { state: stateName(s), from: clockText(s.start), duration: duration(s.durationMs) })
        : loc.t("stateTimeline.segment", {
            state: stateName(s),
            from: clockText(s.start),
            to: clockText(s.end),
            duration: duration(s.durationMs),
          });
    const summary = loc.t("stateTimeline.summary", {
      label,
      from: clockText(fromMs),
      to: clockText(toMs),
      totals: stateTimelineTotals(segments)
        .map((x) => loc.t("stateTimeline.total", { state: loc.t(machineStateMessageKey(x.state)), duration: duration(x.ms) }))
        .join(", "),
    });

    const interactive = onSegmentClick !== undefined;
    const clickable = (s: StateSegment) =>
      interactive && (isSegmentClickable ? isSegmentClickable(s) : !s.gap);
    const targets = segments.filter(clickable);

    // One tab stop for the whole strip: the selected segment, else the first.
    const [active, setActive] = React.useState<string | undefined>();
    const want = active ?? selectedId;
    const stopId = targets.find((s) => s.id === want)?.id ?? targets[0]?.id;

    const stripRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      const strip = stripRef.current;
      if (!strip || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(([entry]) => setStripWidth(entry.contentRect.width));
      ro.observe(strip);
      return () => ro.disconnect();
    }, []);
    const focusSegment = (id: string) => {
      setActive(id);
      stripRef.current?.querySelector<HTMLElement>(`[data-segment-id="${CSS.escape(id)}"]`)?.focus();
    };
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      const i = targets.findIndex((s) => s.id === stopId);
      if (i < 0) return;
      // Arrow keys follow the visual direction: in RTL time runs leftwards.
      const rtl = directionOf(stripRef.current) === "rtl";
      const next = rtl ? "ArrowLeft" : "ArrowRight";
      const prev = rtl ? "ArrowRight" : "ArrowLeft";
      let target = -1;
      if (e.key === next) target = Math.min(targets.length - 1, i + 1);
      else if (e.key === prev) target = Math.max(0, i - 1);
      else if (e.key === "Home") target = 0;
      else if (e.key === "End") target = targets.length - 1;
      else return;
      e.preventDefault();
      focusSegment(targets[target].id);
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label={summary}
        className={cn("zen-flex zen-w-full zen-flex-col zen-gap-1", className)}
        {...rest}
      >
        {events.length > 0 && (
          <>
            <div className="zen-relative zen-h-2" aria-hidden="true">
              {events.map((ev) => (
                <span
                  key={ev.id}
                  className="zen-absolute zen-top-0 zen-h-2 zen-w-2 -zen-translate-x-1/2 zen-rotate-45 zen-rounded-zen-sm zen-bg-zen-foreground rtl:zen-translate-x-1/2"
                  style={{ insetInlineStart: `${ev.left * 100}%` }}
                  title={`${clockText(ev.at)} ${ev.label}`}
                />
              ))}
            </div>
            <ul className="zen-sr-only" aria-label={loc.t("stateTimeline.events")}>
              {events.map((ev) => (
                <li key={ev.id}>{loc.t("stateTimeline.event", { time: clockText(ev.at), label: ev.label })}</li>
              ))}
            </ul>
          </>
        )}

        <div
          ref={stripRef}
          className={cn(
            "zen-relative zen-w-full zen-overflow-hidden zen-rounded-zen-sm zen-bg-zen-muted",
            HEIGHT[size ?? "md"],
          )}
          onKeyDown={onKeyDown}
        >
          {segments.map((s) =>
            clickable(s) ? (
              <button
                key={s.id}
                type="button"
                data-segment-id={s.id}
                data-tone={s.tone}
                aria-label={describe(s)}
                aria-pressed={selectedId === undefined ? undefined : selectedId === s.id}
                title={describe(s)}
                tabIndex={stopId === s.id ? 0 : -1}
                className={cn(
                  "zen-absolute zen-inset-y-0 zen-m-0 zen-cursor-pointer zen-border-0 zen-p-0",
                  "hover:zen-brightness-110 focus-visible:zen-z-10 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
                  selectedId === s.id && "zen-z-10 zen-ring-2 zen-ring-zen-foreground zen-ring-inset",
                  FILL[s.tone],
                )}
                style={box(s)}
                onFocus={() => setActive(s.id)}
                onClick={() => onSegmentClick?.(s)}
              />
            ) : (
              <div
                key={s.id}
                aria-hidden="true"
                data-tone={s.tone}
                className={cn("zen-absolute zen-inset-y-0", FILL[s.tone])}
                style={box(s)}
                title={describe(s)}
              />
            ),
          )}
          {nowLeft !== null && (
            <span
              aria-hidden="true"
              className="zen-absolute zen-inset-y-0 zen-w-px zen-bg-zen-foreground"
              style={{ insetInlineStart: `${nowLeft * 100}%` }}
            />
          )}
        </div>

        {!hideAxis && (
          <div className="zen-relative zen-h-4 zen-text-xs zen-text-zen-muted-fg zen-tabular-nums" aria-hidden="true">
            {ticks.ticks.map((tick) => (
              <span
                key={tick.at}
                className={cn(
                  "zen-absolute zen-top-0 zen-whitespace-nowrap",
                  // A label within half a label's width of either end is
                  // aligned to that end instead of centred, so it never hangs
                  // past the strip. Measured in pixels: a percentage threshold
                  // let a tick 13px in overflow by 12px on a narrow strip.
                  tick.left * stripWidth < 32
                    ? ""
                    : (1 - tick.left) * stripWidth < 32
                      ? "-zen-translate-x-full rtl:zen-translate-x-full"
                      : "-zen-translate-x-1/2 rtl:zen-translate-x-1/2",
                )}
                style={{ insetInlineStart: `${tick.left * 100}%` }}
              >
                {timeFormat.format(tick.at)}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  },
);
StateTimeline.displayName = "StateTimeline";

export { StateTimeline };

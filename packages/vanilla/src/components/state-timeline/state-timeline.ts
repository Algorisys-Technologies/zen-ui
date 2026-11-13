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
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";

/**
 * StateTimeline — one machine's states along a window of time.
 *
 *   StateTimeline({
 *     label: "Press 4",
 *     from: shiftStart, to: shiftEnd,
 *     segments: record,
 *     onSegmentClick: (seg) => openCausePicker(seg),
 *   }).el
 *
 * Vanilla port of the React reference; same DOM, classes, ARIA and keys.
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
 * on a live board. Pass `now` to pin it. The clock and the strip's
 * ResizeObserver are released by `destroy()`.
 *
 * A re-render rebuilds the segments, so a focused segment would lose focus on
 * every clock tick; the render puts focus back on the segment with the same id.
 */

export type StateTimelineSize = "sm" | "md" | "lg";

export interface StateTimelineProps extends Omit<BaseProps, "children"> {
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
}

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
const HATCH = "repeating-linear-gradient(135deg, var(--zen-state-unknown) 0 1px, transparent 1px 6px)";

const HEIGHT: Record<StateTimelineSize, string> = {
  sm: "zen-h-3",
  md: "zen-h-6",
  lg: "zen-h-10",
};

const CLOCK_MS = 30_000;

const place = (node: HTMLElement, s: StateSegment) => {
  node.style.insetInlineStart = `${s.left * 100}%`;
  node.style.width = `${s.width * 100}%`;
  // True position, never moved; a stop too short to see still gets 2px.
  node.style.minWidth = "2px";
  if (s.tone === "unknown") node.style.backgroundImage = HATCH;
};

export function StateTimeline(props: StateTimelineProps): ZenComponent<StateTimelineProps> {
  let current: StateTimelineProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let clock = Date.now();
  let timer: ReturnType<typeof setInterval> | undefined;
  // About one label per 88px — "06:00 AM" in text-xs is ~60px, plus a gap — so a narrow
  // strip gets fewer, longer steps instead of labels drawn over each other.
  let stripWidth = 576;
  /** The roving tab stop the user last moved to. */
  let active: string | undefined;
  /** Kept between renders for the key handler. */
  let targets: StateSegment[] = [];
  let stopId: string | undefined;

  const el = document.createElement("div");
  el.setAttribute("role", "group");

  const markers = document.createElement("div");
  markers.className = "zen-relative zen-h-2";
  markers.setAttribute("aria-hidden", "true");
  const eventList = document.createElement("ul");
  eventList.className = "zen-sr-only";

  const strip = document.createElement("div");
  const axis = document.createElement("div");
  axis.className = "zen-relative zen-h-4 zen-text-xs zen-text-zen-muted-fg zen-tabular-nums";
  axis.setAttribute("aria-hidden", "true");

  const focusSegment = (id: string) => {
    active = id;
    strip.querySelector<HTMLElement>(`[data-segment-id="${CSS.escape(id)}"]`)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (current.onSegmentClick === undefined) return;
    const i = targets.findIndex((s) => s.id === stopId);
    if (i < 0) return;
    // Arrow keys follow the visual direction: in RTL time runs leftwards.
    const rtl = directionOf(strip) === "rtl";
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const prev = rtl ? "ArrowRight" : "ArrowLeft";
    let target = -1;
    if (e.key === next) target = Math.min(targets.length - 1, i + 1);
    else if (e.key === prev) target = Math.max(0, i - 1);
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = targets.length - 1;
    else return;
    e.preventDefault();
    stopId = targets[target].id;
    for (const b of strip.querySelectorAll<HTMLElement>("[data-segment-id]")) {
      b.tabIndex = b.dataset.segmentId === stopId ? 0 : -1;
    }
    focusSegment(stopId);
  };
  strip.addEventListener("keydown", onKeyDown);
  disposer.add(() => strip.removeEventListener("keydown", onKeyDown));

  const render = () => {
    const {
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
      class: className,
      ...rest
    } = current;

    const fromMs = +from;
    const toMs = +to;
    const nowMs = nowProp === undefined ? clock : +nowProp;
    const segments = layoutStateTimeline(segmentsInput, { from: fromMs, to: toMs, now: nowMs });
    const events = layoutTimelineEvents(eventsInput ?? [], { from: fromMs, to: toMs, now: nowMs });
    const ticks = timelineTicks(fromMs, toMs, { timeZone, maxTicks: Math.max(2, Math.floor(stripWidth / 88)) });
    const nowLeft = nowMs > fromMs && nowMs < toMs ? (nowMs - fromMs) / (toMs - fromMs) : null;

    const timeFormat = new Intl.DateTimeFormat(
      loc.locale,
      ticks.stepMs >= 24 * 3_600_000
        ? { month: "short", day: "numeric", timeZone }
        : { hour: "2-digit", minute: "2-digit", timeZone },
    );
    const clockFormat = new Intl.DateTimeFormat(loc.locale, { hour: "2-digit", minute: "2-digit", timeZone });
    const clockText = (t: number) => clockFormat.format(t);
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
    const clickable = (s: StateSegment) => interactive && (isSegmentClickable ? isSegmentClickable(s) : !s.gap);
    targets = segments.filter(clickable);
    // One tab stop for the whole strip: the selected segment, else the first.
    const want = active ?? selectedId;
    stopId = targets.find((s) => s.id === want)?.id ?? targets[0]?.id;

    // A rebuild would otherwise drop the focus a keyboard user is holding.
    const focused = (document.activeElement as HTMLElement | null)?.closest?.("[data-segment-id]");
    const refocus = focused && strip.contains(focused) ? (focused as HTMLElement).dataset.segmentId : undefined;

    el.setAttribute("aria-label", summary);
    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-1", className);
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);

    // Events: a row of diamonds over the strip, and the same as a list for a screen reader.
    markers.replaceChildren(
      ...events.map((ev) => {
        const mark = document.createElement("span");
        mark.className =
          "zen-absolute zen-top-0 zen-h-2 zen-w-2 -zen-translate-x-1/2 zen-rotate-45 zen-rounded-zen-sm zen-bg-zen-foreground rtl:zen-translate-x-1/2";
        mark.style.insetInlineStart = `${ev.left * 100}%`;
        mark.title = clockText(ev.at) + " " + ev.label;
        return mark;
      }),
    );
    eventList.setAttribute("aria-label", loc.t("stateTimeline.events"));
    eventList.replaceChildren(
      ...events.map((ev) => {
        const li = document.createElement("li");
        li.textContent = loc.t("stateTimeline.event", { time: clockText(ev.at), label: ev.label });
        return li;
      }),
    );

    strip.className = cn(
      "zen-relative zen-w-full zen-overflow-hidden zen-rounded-zen-sm zen-bg-zen-muted",
      HEIGHT[size ?? "md"],
    );
    const parts: HTMLElement[] = segments.map((s) => {
      if (clickable(s)) {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.segmentId = s.id;
        b.dataset.tone = s.tone;
        b.setAttribute("aria-label", describe(s));
        if (selectedId !== undefined) b.setAttribute("aria-pressed", String(selectedId === s.id));
        b.title = describe(s);
        b.tabIndex = stopId === s.id ? 0 : -1;
        b.className = cn(
          "zen-absolute zen-inset-y-0 zen-m-0 zen-cursor-pointer zen-border-0 zen-p-0",
          "hover:zen-brightness-110 focus-visible:zen-z-10 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
          selectedId === s.id && "zen-z-10 zen-ring-2 zen-ring-zen-foreground zen-ring-inset",
          FILL[s.tone],
        );
        place(b, s);
        b.addEventListener("focus", () => {
          active = s.id;
        });
        b.addEventListener("click", () => current.onSegmentClick?.(s));
        return b;
      }
      const d = document.createElement("div");
      d.setAttribute("aria-hidden", "true");
      d.dataset.tone = s.tone;
      d.className = cn("zen-absolute zen-inset-y-0", FILL[s.tone]);
      place(d, s);
      d.title = describe(s);
      return d;
    });
    if (nowLeft !== null) {
      const line = document.createElement("span");
      line.setAttribute("aria-hidden", "true");
      line.className = "zen-absolute zen-inset-y-0 zen-w-px zen-bg-zen-foreground";
      line.style.insetInlineStart = `${nowLeft * 100}%`;
      parts.push(line);
    }
    strip.replaceChildren(...parts);

    axis.replaceChildren(
      ...ticks.ticks.map((tick) => {
        const span = document.createElement("span");
        span.className = cn(
          "zen-absolute zen-top-0 zen-whitespace-nowrap",
          // A label within half a label's width of either end is aligned to
          // that end instead of centred, so it never hangs past the strip.
          tick.left * stripWidth < 32
            ? ""
            : (1 - tick.left) * stripWidth < 32
              ? "-zen-translate-x-full rtl:zen-translate-x-full"
              : "-zen-translate-x-1/2 rtl:zen-translate-x-1/2",
        );
        span.style.insetInlineStart = `${tick.left * 100}%`;
        span.textContent = timeFormat.format(tick.at);
        return span;
      }),
    );

    const children: HTMLElement[] = [];
    if (events.length > 0) children.push(markers, eventList);
    children.push(strip);
    if (!hideAxis) children.push(axis);
    el.replaceChildren(...children);

    if (refocus !== undefined) focusSegment(refocus);
  };

  /** Starts or stops the internal clock to match whether `now` is pinned. */
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

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w === stripWidth) return;
      stripWidth = w;
      render();
    });
    ro.observe(strip);
    disposer.add(() => ro.disconnect());
  }
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

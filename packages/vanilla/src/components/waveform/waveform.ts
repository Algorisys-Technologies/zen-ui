import {
  MIN_MEDIA_RANGE,
  type WaveformClip,
  clampBadgePct,
  dragClipEdge,
  formatMediaTime,
  moveClip,
  waveformPath,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";

/**
 * Waveform — an audio lane with an optional draggable clip window. The vanilla
 * port of the React reference.
 *
 *   const wf = Waveform({
 *     peaks,                       // number[] 0..1, decoded by the app
 *     duration: video.duration,    // the lane's time axis
 *     audioDuration: audio.duration,
 *     clip,
 *     onClipInput: (c) => wf.update({ clip: c }),
 *   });
 *   root.append(wf.el);
 *
 * The lane's axis is `duration`; the clip's `offset` lives on it while
 * `start`/`end` trim within the audio behind the peaks. Dragging the left edge
 * moves offset and start together so the tail stays put — core's
 * `dragClipEdge`, contract-tested in scripts/check-media.ts. Controlled-only,
 * same Input/Commit drag grammar as MediaTimeline.
 *
 * The peaks path is built once per peaks array as ONE svg path; the clip
 * window shows its trimmed slice by moving the svg viewBox, so a trim drag
 * re-frames the path instead of rebuilding it.
 */

export interface WaveformProps extends BaseProps {
  /** Peak amplitudes, 0..1, evenly spread across `audioDuration`. */
  peaks: number[];
  /** The lane's time axis, seconds — the video's length when composed. */
  duration: number;
  /** Length of the audio behind `peaks`. Defaults to `duration`. */
  audioDuration?: number;
  /** The clip window (controlled). Omit to render the whole lane as audio. */
  clip?: WaveformClip;
  /** Committed edits — keyboard nudges land here. */
  onClipChange?: (clip: WaveformClip) => void;
  /** Per-pointermove during a drag, no history. Falls back to onClipChange. */
  onClipInput?: (clip: WaveformClip) => void;
  /** Once, when a drag ends — commit to history here. */
  onClipCommit?: (clip: WaveformClip) => void;
  /** Click-to-seek on the lane, in lane time. */
  onSeek?: (time: number) => void;
  /** Playhead position in lane time. Omit to hide the playhead. */
  currentTime?: number;
  /** Lane width multiplier, >= 1. Match the MediaTimeline's to align lanes. */
  zoom?: number;
  /** Smallest span a trim can shrink the clip to. Default 0.1s. */
  minClipDuration?: number;
  /** Timestamp formatter for tooltips. Default formatMediaTime (HH:MM:SS.cc). */
  formatTime?: (seconds: number) => string;
  /** Colour treatment for the clip window. Replaces the default tint + ring. */
  clipClass?: string;
  /** Names the lane for a screen reader. */
  label?: string;
}

const tint = (pct: number) => `color-mix(in srgb, var(--zen-color-primary) ${pct}%, transparent)`;

const BADGE_CLASS = cn(
  "zen-absolute zen-top-0.5 -zen-translate-x-1/2 zen-whitespace-nowrap zen-rounded-zen-sm",
  "zen-bg-zen-foreground zen-px-1.5 zen-text-xs zen-font-mono zen-text-zen-background",
  "zen-pointer-events-none zen-z-20",
);

const SVG_NS = "http://www.w3.org/2000/svg";

const makeEnvelope = (): { svg: SVGSVGElement; path: SVGPathElement } => {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute(
    "class",
    "zen-absolute zen-inset-0 zen-h-full zen-w-full zen-text-zen-primary zen-pointer-events-none",
  );
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute("fill-opacity", "0.7");
  svg.append(path);
  return { svg, path };
};

export function Waveform(props: WaveformProps): ZenComponent<WaveformProps> {
  let current: WaveformProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let dragging: "move" | "start" | "end" | null = null;
  let draggedClip: WaveformClip | null = null;
  // Lane-time distance from the grab point to the clip's left edge, so a body
  // drag holds the clip where it was grabbed instead of snapping offset there.
  let grabDelta = 0;
  let suppressClick = false;
  let renderedPeaks: number[] | undefined;

  const fmt = (s: number) => (current.formatTime ?? formatMediaTime)(s);
  const minDur = () => current.minClipDuration ?? MIN_MEDIA_RANGE;
  const audioDur = () => current.audioDuration ?? current.duration;
  const toPct = (time: number) => (time / current.duration) * 100;
  const toTime = (clientX: number) => {
    const rect = lane.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * current.duration;
  };

  const el = document.createElement("div");
  const scroll = document.createElement("div");
  scroll.className = "zen-w-full zen-overflow-x-auto zen-rounded-zen-md";
  const lane = document.createElement("div");
  // Time axes read left-to-right even in RTL locales — every editor's.
  lane.setAttribute("dir", "ltr");
  lane.setAttribute("role", "group");
  lane.className = cn(
    "zen-relative zen-h-12 zen-select-none zen-overflow-hidden zen-rounded-zen-md",
    "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair",
  );
  scroll.append(lane);
  el.append(scroll);

  // Two envelopes: the full-lane one (no clip) and the windowed one inside the
  // clip. Both draw the same path; paint() shows whichever mode is active.
  const full = makeEnvelope();
  const clipWin = document.createElement("div");
  const windowed = makeEnvelope();
  clipWin.append(windowed.svg);

  const playhead = document.createElement("div");
  playhead.className =
    "zen-absolute zen-top-0 zen-h-full zen-w-px zen-bg-zen-foreground zen-pointer-events-none zen-z-10";
  const hoverBadge = document.createElement("div");
  hoverBadge.className = BADGE_CLASS;
  hoverBadge.style.display = "none";
  const dragBadge = document.createElement("div");
  dragBadge.className = BADGE_CLASS;
  dragBadge.style.display = "none";
  lane.append(full.svg, clipWin, playhead, hoverBadge, dragBadge);

  const emitInput = (clip: WaveformClip) => (current.onClipInput ?? current.onClipChange)?.(clip);

  const startDrag = (mode: "move" | "start" | "end", e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (mode === "move") grabDelta = toTime(e.clientX) - current.clip!.offset;
    dragging = mode;
    draggedClip = null;
    hoverBadge.style.display = "none";
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) {
      const t = toTime(e.clientX);
      hoverBadge.textContent = fmt(t);
      hoverBadge.style.left = `${clampBadgePct(toPct(t))}%`;
      hoverBadge.style.display = "";
      return;
    }
    e.preventDefault();
    const time = toTime(e.clientX);
    const c = current.clip!;
    let next: WaveformClip;
    let tipTime: number;
    if (dragging === "move") {
      next = moveClip(c, time - grabDelta, current.duration);
      tipTime = next.offset;
    } else {
      next = dragClipEdge(c, dragging, time, {
        audioDuration: audioDur(),
        laneDuration: current.duration,
        minDuration: minDur(),
      });
      tipTime = dragging === "start" ? next.offset : next.offset + (next.end - next.start);
    }
    draggedClip = next;
    dragBadge.textContent = `${fmt(tipTime)} · ${(next.end - next.start).toFixed(1)}s`;
    dragBadge.style.left = `${clampBadgePct(toPct(tipTime))}%`;
    dragBadge.style.display = "";
    emitInput(next);
  };

  const onPointerUp = () => {
    // Bail when no drag is in flight — see MediaTimeline's pointerup note.
    if (!dragging) return;
    if (draggedClip) {
      current.onClipCommit?.(draggedClip);
      suppressClick = true;
    }
    dragging = null;
    draggedClip = null;
    dragBadge.style.display = "none";
    paint();
  };

  const onClick = (e: MouseEvent) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    current.onSeek?.(toTime(e.clientX));
  };

  const onPointerLeave = () => {
    hoverBadge.style.display = "none";
  };

  // See MediaTimeline: a fresh lane press clears stale click suppression;
  // drag presses are stopped at the clip and never bubble here.
  const onLanePointerDown = () => {
    suppressClick = false;
  };
  lane.addEventListener("pointerdown", onLanePointerDown);
  lane.addEventListener("pointermove", onPointerMove);
  lane.addEventListener("pointerup", onPointerUp);
  lane.addEventListener("click", onClick);
  lane.addEventListener("pointerleave", onPointerLeave);
  disposer.add(() => {
    lane.removeEventListener("pointerdown", onLanePointerDown);
    lane.removeEventListener("pointermove", onPointerMove);
    lane.removeEventListener("pointerup", onPointerUp);
    lane.removeEventListener("click", onClick);
    lane.removeEventListener("pointerleave", onPointerLeave);
  });

  const nudge = (mode: "move" | "start" | "end", e: KeyboardEvent) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const step = dir * (e.shiftKey ? 1 : minDur());
    const c = current.clip!;
    const next =
      mode === "move"
        ? moveClip(c, c.offset + step, current.duration)
        : dragClipEdge(c, mode, (mode === "start" ? c.offset : c.offset + (c.end - c.start)) + step, {
            audioDuration: audioDur(),
            laneDuration: current.duration,
            minDuration: minDur(),
          });
    current.onClipChange?.(next);
  };

  // The clip body and its two trim handles, built once — the drag repositions
  // them via paint(); rebuilding mid-drag would drop pointer capture.
  clipWin.setAttribute("role", "slider");
  clipWin.tabIndex = 0;
  clipWin.setAttribute("aria-orientation", "horizontal");
  clipWin.setAttribute("aria-label", "Clip position");
  const bodyDown = (e: PointerEvent) => startDrag("move", e);
  const bodyKey = (e: KeyboardEvent) => nudge("move", e);
  const bodyClick = (e: MouseEvent) => e.stopPropagation();
  clipWin.addEventListener("pointerdown", bodyDown);
  clipWin.addEventListener("keydown", bodyKey);
  clipWin.addEventListener("click", bodyClick);
  disposer.add(() => {
    clipWin.removeEventListener("pointerdown", bodyDown);
    clipWin.removeEventListener("keydown", bodyKey);
    clipWin.removeEventListener("click", bodyClick);
  });

  const edgeHandles = {} as Record<"start" | "end", HTMLDivElement>;
  for (const edge of ["start", "end"] as const) {
    const h = document.createElement("div");
    h.setAttribute("role", "slider");
    h.tabIndex = 0;
    h.setAttribute("aria-orientation", "horizontal");
    h.setAttribute("aria-label", `Clip trim ${edge}`);
    h.className = cn(
      "zen-absolute zen-top-0 zen-h-full zen-w-2 zen-cursor-ew-resize",
      "zen-bg-zen-primary hover:zen-opacity-80",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      edge === "start" ? "zen-left-0" : "zen-right-0",
    );
    const down = (e: PointerEvent) => startDrag(edge, e);
    const key = (e: KeyboardEvent) => nudge(edge, e);
    h.addEventListener("pointerdown", down);
    h.addEventListener("keydown", key);
    disposer.add(() => {
      h.removeEventListener("pointerdown", down);
      h.removeEventListener("keydown", key);
    });
    edgeHandles[edge] = h;
    clipWin.append(h);
  }

  const renderPeaks = () => {
    renderedPeaks = current.peaks;
    const d = waveformPath(current.peaks);
    full.path.setAttribute("d", d);
    windowed.path.setAttribute("d", d);
    full.svg.setAttribute("viewBox", `0 0 ${Math.max(1, current.peaks.length)} 2`);
  };

  const paint = () => {
    el.className = cn("zen-flex zen-w-full zen-flex-col", current.class);
    removeProps?.();
    removeProps = applyProps(el, pickRest());

    lane.setAttribute("aria-label", current.label ?? "Audio waveform");
    lane.style.width = `${(current.zoom ?? 1) * 100}%`;
    lane.style.minWidth = "100%";

    const clip = current.clip;
    if (clip) {
      full.svg.style.display = "none";
      clipWin.style.display = "";
      clipWin.className = cn(
        "zen-absolute zen-top-0 zen-h-full",
        dragging === "move" ? "zen-cursor-grabbing" : "zen-cursor-grab",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        current.clipClass ?? "zen-ring-1 zen-ring-zen-primary",
      );
      clipWin.style.left = `${toPct(clip.offset)}%`;
      clipWin.style.width = `${toPct(clip.end - clip.start)}%`;
      clipWin.style.background = current.clipClass ? "" : tint(25);
      const n = current.peaks.length;
      const x = (clip.start / audioDur()) * n;
      const w = ((clip.end - clip.start) / audioDur()) * n;
      windowed.svg.setAttribute("viewBox", `${x} 0 ${w} 2`);
      clipWin.setAttribute("aria-valuemin", "0");
      clipWin.setAttribute("aria-valuemax", String(current.duration - (clip.end - clip.start)));
      clipWin.setAttribute("aria-valuenow", String(clip.offset));
      clipWin.setAttribute("aria-valuetext", fmt(clip.offset));
      for (const edge of ["start", "end"] as const) {
        const h = edgeHandles[edge];
        h.setAttribute("aria-valuemin", String(edge === "start" ? 0 : clip.start + minDur()));
        h.setAttribute(
          "aria-valuemax",
          String(edge === "start" ? clip.end - minDur() : audioDur()),
        );
        h.setAttribute("aria-valuenow", String(clip[edge]));
        h.setAttribute("aria-valuetext", fmt(clip[edge]));
      }
    } else {
      full.svg.style.display = "";
      clipWin.style.display = "none";
    }

    if (current.currentTime !== undefined && current.duration > 0) {
      playhead.style.left = `${toPct(current.currentTime)}%`;
      playhead.style.display = "";
    } else {
      playhead.style.display = "none";
    }
  };

  /** BaseProps passthrough (id, style, data-*, aria-*) minus everything this factory owns. */
  const OWN_KEYS = new Set([
    "peaks", "duration", "audioDuration", "clip", "onClipChange", "onClipInput",
    "onClipCommit", "onSeek", "currentTime", "zoom", "minClipDuration",
    "formatTime", "clipClass", "label", "class",
  ]);
  const pickRest = (): Record<string, unknown> =>
    Object.fromEntries(
      Object.entries(current as unknown as Record<string, unknown>).filter(([k]) => !OWN_KEYS.has(k)),
    );

  renderPeaks();
  paint();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if ("peaks" in next && next.peaks !== renderedPeaks) renderPeaks();
      paint();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

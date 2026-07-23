import * as React from "react";
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

/**
 * Waveform — an audio lane: peaks rendered as a filled envelope, with an
 * optional draggable clip window (move to place, edge-drag to trim).
 *
 *   <Waveform
 *     peaks={peaks}                 // number[] 0..1, decoded by the app
 *     duration={video.duration}     // the lane's time axis
 *     audioDuration={audio.duration}
 *     clip={clip}
 *     onClipInput={setClip}
 *     onClipCommit={commitToHistory}
 *     currentTime={playhead}
 *   />
 *
 * The lane's axis is `duration` — under a MediaTimeline that is the VIDEO's
 * length, and giving both the same `zoom` keeps the lanes aligned. The clip's
 * `offset` lives on that axis; its `start`/`end` are trim points within the
 * AUDIO the peaks describe (`audioDuration`, defaults to `duration` for the
 * standalone case). Dragging the left edge moves offset and start together so
 * the clip's tail stays put — core's `dragClipEdge`, contract-tested in
 * scripts/check-media.ts.
 *
 * Assets come from the caller: `peaks` is plain numbers. Nothing here decodes
 * audio. Controlled-only, with the same Input/Commit drag grammar as
 * MediaTimeline.
 */

export interface WaveformProps extends React.HTMLAttributes<HTMLDivElement> {
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
  className?: string;
}

const tint = (pct: number) => `color-mix(in srgb, var(--zen-color-primary) ${pct}%, transparent)`;

const badgeClass =
  "zen-absolute zen-top-0.5 -zen-translate-x-1/2 zen-whitespace-nowrap zen-rounded-zen-sm " +
  "zen-bg-zen-foreground zen-px-1.5 zen-text-xs zen-font-mono zen-text-zen-background " +
  "zen-pointer-events-none zen-z-20";

export const Waveform = React.forwardRef<HTMLDivElement, WaveformProps>(
  (
    {
      peaks,
      duration,
      audioDuration = duration,
      clip,
      onClipChange,
      onClipInput,
      onClipCommit,
      onSeek,
      currentTime,
      zoom = 1,
      minClipDuration = MIN_MEDIA_RANGE,
      formatTime = formatMediaTime,
      clipClass,
      label = "Audio waveform",
      className,
      ...props
    },
    ref,
  ) => {
    const laneRef = React.useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = React.useState<"move" | "start" | "end" | null>(null);
    const [dragTip, setDragTip] = React.useState<{ pct: number; text: string } | null>(null);
    const [hoverTime, setHoverTime] = React.useState<number | null>(null);

    const draggedClip = React.useRef<WaveformClip | null>(null);
    // Lane-time distance from the grab point to the clip's left edge, so a body
    // drag holds the clip where it was grabbed instead of snapping offset there.
    const grabDelta = React.useRef(0);
    const suppressClick = React.useRef(false);

    const toPct = (time: number) => (time / duration) * 100;
    const toTime = (clientX: number) => {
      const el = laneRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * duration;
    };

    // One path over ALL peaks, rebuilt only when they change. The clip window
    // shows its trimmed slice by moving the svg viewBox, so a trim drag never
    // rebuilds the path — it just re-frames it.
    const path = React.useMemo(() => waveformPath(peaks), [peaks]);
    const clipViewBox = clip
      ? `${(clip.start / audioDuration) * peaks.length} 0 ${((clip.end - clip.start) / audioDuration) * peaks.length} 2`
      : "";

    const emitInput = (next: WaveformClip) => (onClipInput ?? onClipChange)?.(next);

    const startDrag = (mode: "move" | "start" | "end", e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      if (mode === "move") grabDelta.current = toTime(e.clientX) - clip!.offset;
      setDragging(mode);
      setHoverTime(null);
      draggedClip.current = null;
    };

    const onLanePointerMove = (e: React.PointerEvent) => {
      if (!dragging) {
        setHoverTime(toTime(e.clientX));
        return;
      }
      e.preventDefault();
      const time = toTime(e.clientX);
      const c = clip!;
      let next: WaveformClip;
      let tipTime: number;
      if (dragging === "move") {
        next = moveClip(c, time - grabDelta.current, duration);
        tipTime = next.offset;
      } else {
        next = dragClipEdge(c, dragging, time, {
          audioDuration,
          laneDuration: duration,
          minDuration: minClipDuration,
        });
        tipTime = dragging === "start" ? next.offset : next.offset + (next.end - next.start);
      }
      draggedClip.current = next;
      setDragTip({
        pct: clampBadgePct(toPct(tipTime)),
        text: `${formatTime(tipTime)} · ${(next.end - next.start).toFixed(1)}s`,
      });
      emitInput(next);
    };

    const onLanePointerUp = () => {
      // Bail when no drag is in flight — see MediaTimeline's onTrackPointerUp:
      // a spurious setState between pointerup and mouseup makes the browser
      // suppress the click that follows.
      if (!dragging) return;
      if (draggedClip.current) {
        onClipCommit?.(draggedClip.current);
        suppressClick.current = true;
      }
      setDragging(null);
      setDragTip(null);
      draggedClip.current = null;
    };

    const onLaneClick = (e: React.MouseEvent) => {
      if (suppressClick.current) {
        suppressClick.current = false;
        return;
      }
      onSeek?.(toTime(e.clientX));
    };

    const nudge = (mode: "move" | "start" | "end", e: React.KeyboardEvent) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const step = dir * (e.shiftKey ? 1 : minClipDuration);
      const c = clip!;
      const next =
        mode === "move"
          ? moveClip(c, c.offset + step, duration)
          : dragClipEdge(c, mode, (mode === "start" ? c.offset : c.offset + (c.end - c.start)) + step, {
              audioDuration,
              laneDuration: duration,
              minDuration: minClipDuration,
            });
      onClipChange?.(next);
    };

    const envelope = (viewBox: string) => (
      <svg
        aria-hidden="true"
        className="zen-absolute zen-inset-0 zen-h-full zen-w-full zen-text-zen-primary zen-pointer-events-none"
        viewBox={viewBox}
        preserveAspectRatio="none"
      >
        <path d={path} fill="currentColor" fillOpacity="0.7" />
      </svg>
    );

    return (
      <div ref={ref} className={cn("zen-flex zen-w-full zen-flex-col", className)} {...props}>
        <div className="zen-w-full zen-overflow-x-auto zen-rounded-zen-md">
          <div
            ref={laneRef}
            role="group"
            aria-label={label}
            // Time axes read left-to-right even in RTL locales — every editor's.
            dir="ltr"
            className={cn(
              "zen-relative zen-h-12 zen-select-none zen-overflow-hidden zen-rounded-zen-md",
              "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair",
            )}
            style={{ width: `${zoom * 100}%`, minWidth: "100%" }}
            onClick={onLaneClick}
            // See MediaTimeline: a fresh track press clears stale click
            // suppression; drag presses are stopped at the clip, never here.
            onPointerDown={() => (suppressClick.current = false)}
            onPointerMove={onLanePointerMove}
            onPointerUp={onLanePointerUp}
            onPointerLeave={() => setHoverTime(null)}
          >
            {clip === undefined ? (
              envelope(`0 0 ${Math.max(1, peaks.length)} 2`)
            ) : (
              <div
                role="slider"
                tabIndex={0}
                aria-orientation="horizontal"
                aria-label="Clip position"
                aria-valuemin={0}
                aria-valuemax={duration - (clip.end - clip.start)}
                aria-valuenow={clip.offset}
                aria-valuetext={formatTime(clip.offset)}
                className={cn(
                  "zen-absolute zen-top-0 zen-h-full",
                  dragging === "move" ? "zen-cursor-grabbing" : "zen-cursor-grab",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  clipClass ?? "zen-ring-1 zen-ring-zen-primary",
                )}
                style={{
                  left: `${toPct(clip.offset)}%`,
                  width: `${toPct(clip.end - clip.start)}%`,
                  ...(clipClass ? {} : { background: tint(25) }),
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => startDrag("move", e)}
                onKeyDown={(e) => nudge("move", e)}
              >
                {envelope(clipViewBox)}
                {(["start", "end"] as const).map((edge) => (
                  <div
                    key={edge}
                    role="slider"
                    tabIndex={0}
                    aria-orientation="horizontal"
                    aria-label={`Clip trim ${edge}`}
                    aria-valuemin={edge === "start" ? 0 : clip.start + minClipDuration}
                    aria-valuemax={edge === "start" ? clip.end - minClipDuration : audioDuration}
                    aria-valuenow={clip[edge]}
                    aria-valuetext={formatTime(clip[edge])}
                    className={cn(
                      "zen-absolute zen-top-0 zen-h-full zen-w-2 zen-cursor-ew-resize",
                      "zen-bg-zen-primary hover:zen-opacity-80",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      edge === "start" ? "zen-left-0" : "zen-right-0",
                    )}
                    onPointerDown={(e) => startDrag(edge, e)}
                    onKeyDown={(e) => nudge(edge, e)}
                  />
                ))}
              </div>
            )}

            {currentTime !== undefined && duration > 0 ? (
              <div
                className="zen-absolute zen-top-0 zen-h-full zen-w-px zen-bg-zen-foreground zen-pointer-events-none zen-z-10"
                style={{ left: `${toPct(currentTime)}%` }}
              />
            ) : null}

            {hoverTime !== null && !dragging ? (
              <div className={badgeClass} style={{ left: `${clampBadgePct(toPct(hoverTime))}%` }}>
                {formatTime(hoverTime)}
              </div>
            ) : null}

            {dragTip ? (
              <div className={badgeClass} style={{ left: `${dragTip.pct}%` }}>
                {dragTip.text}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);
Waveform.displayName = "Waveform";

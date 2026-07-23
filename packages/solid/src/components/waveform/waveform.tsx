import { type JSX, For, Show, createMemo, createSignal, splitProps } from "solid-js";
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
 *     clip={clip()}
 *     onClipInput={setClip}
 *     onClipCommit={commitToHistory}
 *     currentTime={playhead()}
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
 *
 * Mirrors the React binding's API.
 */

export type WaveformProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
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
  class?: string;
};

export const Waveform = (props: WaveformProps) => {
  const [local, rest] = splitProps(props, [
    "peaks",
    "duration",
    "audioDuration",
    "clip",
    "onClipChange",
    "onClipInput",
    "onClipCommit",
    "onSeek",
    "currentTime",
    "zoom",
    "minClipDuration",
    "formatTime",
    "clipClass",
    "label",
    "class",
  ]);

  let laneRef: HTMLDivElement | undefined;
  const [dragging, setDragging] = createSignal<"move" | "start" | "end" | null>(null);
  const [dragTip, setDragTip] = createSignal<{ pct: number; text: string } | null>(null);
  const [hoverTime, setHoverTime] = createSignal<number | null>(null);

  const fmt = (s: number) => (local.formatTime ?? formatMediaTime)(s);
  const minDur = () => local.minClipDuration ?? MIN_MEDIA_RANGE;
  const audioDur = () => local.audioDuration ?? local.duration;
  const toPct = (time: number) => (time / local.duration) * 100;
  const toTime = (clientX: number) => {
    if (!laneRef) return 0;
    const rect = laneRef.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * local.duration;
  };

  // One path over ALL peaks, built once per peaks array. The clip window shows
  // its trimmed slice by moving the svg viewBox, so a trim drag never rebuilds
  // the path — it just re-frames it.
  const path = createMemo(() => waveformPath(local.peaks));
  const clipViewBox = () => {
    const n = local.peaks.length;
    const c = local.clip!;
    const x = (c.start / audioDur()) * n;
    const w = ((c.end - c.start) / audioDur()) * n;
    return `${x} 0 ${w} 2`;
  };

  let draggedClip: WaveformClip | null = null;
  // Lane-time distance from the grab point to the clip's left edge, so a body
  // drag holds the clip where it was grabbed instead of snapping offset there.
  let grabDelta = 0;
  let suppressClick = false;

  const emitInput = (clip: WaveformClip) => (local.onClipInput ?? local.onClipChange)?.(clip);

  const startDrag = (mode: "move" | "start" | "end", e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (mode === "move") grabDelta = toTime(e.clientX) - local.clip!.offset;
    setDragging(mode);
    draggedClip = null;
  };

  const onLanePointerMove = (e: PointerEvent) => {
    const mode = dragging();
    if (!mode) {
      setHoverTime(toTime(e.clientX));
      return;
    }
    e.preventDefault();
    const time = toTime(e.clientX);
    const c = local.clip!;
    let next: WaveformClip;
    let tipTime: number;
    if (mode === "move") {
      next = moveClip(c, time - grabDelta, local.duration);
      tipTime = next.offset;
    } else {
      next = dragClipEdge(c, mode, time, {
        audioDuration: audioDur(),
        laneDuration: local.duration,
        minDuration: minDur(),
      });
      tipTime = mode === "start" ? next.offset : next.offset + (next.end - next.start);
    }
    draggedClip = next;
    setDragTip({
      pct: clampBadgePct(toPct(tipTime)),
      text: `${fmt(tipTime)} · ${(next.end - next.start).toFixed(1)}s`,
    });
    emitInput(next);
  };

  const onLanePointerUp = () => {
    // Bail when no drag is in flight — see MediaTimeline's onTrackPointerUp.
    if (!dragging()) return;
    if (draggedClip) {
      local.onClipCommit?.(draggedClip);
      suppressClick = true;
    }
    setDragging(null);
    setDragTip(null);
    draggedClip = null;
  };

  const onLaneClick = (e: MouseEvent) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    local.onSeek?.(toTime(e.clientX));
  };

  const nudge = (mode: "move" | "start" | "end", e: KeyboardEvent) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const step = dir * (e.shiftKey ? 1 : minDur());
    const c = local.clip!;
    const next =
      mode === "move"
        ? moveClip(c, c.offset + step, local.duration)
        : dragClipEdge(c, mode, (mode === "start" ? c.offset : c.offset + (c.end - c.start)) + step, {
            audioDuration: audioDur(),
            laneDuration: local.duration,
            minDuration: minDur(),
          });
    local.onClipChange?.(next);
  };

  const tint = (pct: number) => `color-mix(in srgb, var(--zen-color-primary) ${pct}%, transparent)`;

  const badgeClass =
    "zen-absolute zen-top-0.5 -zen-translate-x-1/2 zen-whitespace-nowrap zen-rounded-zen-sm " +
    "zen-bg-zen-foreground zen-px-1.5 zen-text-xs zen-font-mono zen-text-zen-background " +
    "zen-pointer-events-none zen-z-20";

  return (
    <div class={cn("zen-flex zen-w-full zen-flex-col", local.class)} {...rest}>
      <div class="zen-w-full zen-overflow-x-auto zen-rounded-zen-md">
        <div
          ref={laneRef}
          role="group"
          aria-label={local.label ?? "Audio waveform"}
          // Time axes read left-to-right even in RTL locales — every editor's.
          dir="ltr"
          class={cn(
            "zen-relative zen-h-12 zen-select-none zen-overflow-hidden zen-rounded-zen-md",
            "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair",
          )}
          style={{ width: `${(local.zoom ?? 1) * 100}%`, "min-width": "100%" }}
          onClick={onLaneClick}
          // See MediaTimeline: a fresh track press clears stale click
          // suppression; drag presses are stopped at the clip and never bubble.
          onPointerDown={() => (suppressClick = false)}
          onPointerMove={onLanePointerMove}
          onPointerUp={onLanePointerUp}
          onPointerLeave={() => setHoverTime(null)}
        >
          {/* Non-keyed Show: keyed (callback) form would key the subtree on the
              clip OBJECT, which is replaced every onClipInput pointermove —
              tearing down the element holding pointer capture mid-drag. */}
          <Show
            when={local.clip !== undefined}
            fallback={
              <svg
                aria-hidden="true"
                class="zen-absolute zen-inset-0 zen-h-full zen-w-full zen-text-zen-primary zen-pointer-events-none"
                viewBox={`0 0 ${Math.max(1, local.peaks.length)} 2`}
                preserveAspectRatio="none"
              >
                <path d={path()} fill="currentColor" fill-opacity="0.7" />
              </svg>
            }
          >
            <div
              role="slider"
              tabIndex={0}
              aria-orientation="horizontal"
              aria-label="Clip position"
              aria-valuemin={0}
              aria-valuemax={local.duration - (local.clip!.end - local.clip!.start)}
              aria-valuenow={local.clip!.offset}
              aria-valuetext={fmt(local.clip!.offset)}
              class={cn(
                "zen-absolute zen-top-0 zen-h-full",
                dragging() === "move" ? "zen-cursor-grabbing" : "zen-cursor-grab",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                local.clipClass ?? "zen-ring-1 zen-ring-zen-primary",
              )}
              style={{
                left: `${toPct(local.clip!.offset)}%`,
                width: `${toPct(local.clip!.end - local.clip!.start)}%`,
                ...(local.clipClass ? {} : { background: tint(25) }),
              }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => startDrag("move", e)}
              onKeyDown={(e) => nudge("move", e)}
            >
              <svg
                aria-hidden="true"
                class="zen-absolute zen-inset-0 zen-h-full zen-w-full zen-text-zen-primary zen-pointer-events-none"
                viewBox={clipViewBox()}
                preserveAspectRatio="none"
              >
                <path d={path()} fill="currentColor" fill-opacity="0.7" />
              </svg>
              <For each={["start", "end"] as const}>
                {(edge) => (
                  <div
                    role="slider"
                    tabIndex={0}
                    aria-orientation="horizontal"
                    aria-label={`Clip trim ${edge}`}
                    aria-valuemin={edge === "start" ? 0 : local.clip!.start + minDur()}
                    aria-valuemax={edge === "start" ? local.clip!.end - minDur() : audioDur()}
                    aria-valuenow={local.clip![edge]}
                    aria-valuetext={fmt(local.clip![edge])}
                    class={cn(
                      "zen-absolute zen-top-0 zen-h-full zen-w-2 zen-cursor-ew-resize",
                      "zen-bg-zen-primary hover:zen-opacity-80",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      edge === "start" ? "zen-left-0" : "zen-right-0",
                    )}
                    onPointerDown={(e) => startDrag(edge, e)}
                    onKeyDown={(e) => nudge(edge, e)}
                  />
                )}
              </For>
            </div>
          </Show>

          <Show when={local.currentTime !== undefined && local.duration > 0}>
            <div
              class="zen-absolute zen-top-0 zen-h-full zen-w-px zen-bg-zen-foreground zen-pointer-events-none zen-z-10"
              style={{ left: `${toPct(local.currentTime!)}%` }}
            />
          </Show>

          <Show when={hoverTime() !== null && !dragging()}>
            <div class={badgeClass} style={{ left: `${clampBadgePct(toPct(hoverTime()!))}%` }}>
              {fmt(hoverTime()!)}
            </div>
          </Show>

          <Show when={dragTip()}>
            {(tip) => (
              <div class={badgeClass} style={{ left: `${tip().pct}%` }}>
                {tip().text}
              </div>
            )}
          </Show>
        </div>
      </div>
    </div>
  );
};

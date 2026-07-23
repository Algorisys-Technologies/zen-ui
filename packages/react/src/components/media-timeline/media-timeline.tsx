import * as React from "react";
import {
  MIN_MEDIA_RANGE,
  type MediaRange,
  type MediaRangeMode,
  clampBadgePct,
  dragRangeEdge,
  formatMediaTime,
  moveRange,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";

/**
 * MediaTimeline — a filmstrip trim track: draggable ranges over optional
 * thumbnails, with a playhead, hover scrubbing and zoom.
 *
 *   <MediaTimeline
 *     duration={video.duration}
 *     ranges={ranges}
 *     activeIndex={active}
 *     onActiveIndexChange={setActive}
 *     onRangesInput={setRanges}
 *     onRangesCommit={commitToHistory}
 *     onSeek={(t) => (video.currentTime = t)}
 *     thumbnails={thumbs}
 *     currentTime={playhead}
 *   />
 *
 * NOT the event/audit `Timeline` — that one lists things that happened; this
 * one edits time. Semantics are deliberately generic: a range is just a range,
 * and whether it means "cut this" or "keep this" (and what colour that is)
 * belongs to the caller via `rangeClass`. Assets come from the caller too —
 * `thumbnails` is image URLs; nothing here decodes media.
 *
 * Controlled-only: the app owns `ranges`, `activeIndex`, `zoom` and
 * `currentTime`, matching DataTable's posture. During a handle drag the
 * component emits `onRangesInput` per move (no history), live-seeks via
 * `onSeek` so a preview can follow the dragged edge, then fires
 * `onRangesCommit` once on release — the three-callback grammar the drag/undo
 * split needs. The clamp math is core's `dragRangeEdge`, contract-tested in
 * scripts/check-media.ts. No Radix dependency — the pointer logic is plain DOM
 * math, shared with the Solid binding through core.
 */

export interface MediaTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Total media length, seconds. The track maps [0, duration] to its width. */
  duration: number;
  /**
   * The spans. In `"partition"` mode: sorted, non-overlapping. In
   * `"independent"` mode: free — overlap allowed, z-order is array order.
   * The app owns the array either way (controlled).
   */
  ranges: MediaRange[];
  /**
   * How the ranges relate: `"partition"` (a trim track — edge drags clamp
   * against neighbours) or `"independent"` (an overlay-element lane — spans
   * move and overlap freely, bars carry labels/colors). Default "partition".
   */
  rangeMode?: MediaRangeMode;
  /**
   * Which range is highlighted; the remove affordance renders on it. `-1` (the
   * DOM's own selectedIndex convention) or omitted = none. In independent
   * mode, clicking empty track emits `onActiveIndexChange(-1)` — deselect.
   */
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  /** Committed edits — keyboard nudges land here. */
  onRangesChange?: (ranges: MediaRange[]) => void;
  /** Per-pointermove during a drag, no history. Falls back to onRangesChange. */
  onRangesInput?: (ranges: MediaRange[]) => void;
  /** Once, when a handle drag ends — commit to history here. */
  onRangesCommit?: (ranges: MediaRange[]) => void;
  /** When provided, the active range shows a remove button that calls this. */
  onRangeRemove?: (index: number) => void;
  /** Click-to-seek, and live-seek under a dragged edge. */
  onSeek?: (time: number) => void;
  /** Double-click on the track. Whether that means "add a range" is the app's call. */
  onTrackDblClick?: (time: number) => void;
  /** Evenly-spread filmstrip images under the ranges. */
  thumbnails?: string[];
  /** Playhead position, seconds. Omit to hide the playhead. */
  currentTime?: number;
  /** Track width multiplier, >= 1; the track scrolls horizontally when > 1. */
  zoom?: number;
  /** Smallest span a drag can shrink a range to. Default 0.1s. */
  minRangeDuration?: number;
  /** Timestamp formatter for tooltips. Default formatMediaTime (HH:MM:SS.cc). */
  formatTime?: (seconds: number) => string;
  /**
   * Colour treatment for a range. Replaces the default primary tint + ring —
   * the positioning stays. This is the "a range is just a range" hook.
   * Precedence: rangeClass > rangeColor > default.
   */
  rangeClass?: (index: number, active: boolean) => string;
  /**
   * A CSS color per range (any color — StudioX feeds hex from a palette,
   * which class tokens cannot express). The component derives the fill
   * (color-mix, 40% active / 25% not) and an inset ring (full color, 2px
   * active / 1px not), and paints the edge handles with it. `rangeClass`
   * wins if both are provided.
   */
  rangeColor?: (index: number, active: boolean) => string;
  /**
   * Rendered inside the bar — element text, a clip name. Truncated, and
   * pointer-events: none so the body-drag surface stays whole.
   */
  rangeLabel?: (index: number) => React.ReactNode;
  /** Names the timeline for a screen reader. */
  label?: string;
  className?: string;
}

// The tints are inline color-mix, not utilities: token colours are opaque
// var(--zen-color-*), so there is no slash-opacity to reach for, and the
// filmstrip must stay readable through a range.
const tint = (pct: number) => `color-mix(in srgb, var(--zen-color-primary) ${pct}%, transparent)`;

const badgeClass =
  "zen-absolute zen-top-0.5 -zen-translate-x-1/2 zen-whitespace-nowrap zen-rounded-zen-sm " +
  "zen-bg-zen-foreground zen-px-1.5 zen-text-xs zen-font-mono zen-text-zen-background " +
  "zen-pointer-events-none zen-z-20";

export const MediaTimeline = React.forwardRef<HTMLDivElement, MediaTimelineProps>(
  (
    {
      duration,
      ranges,
      rangeMode = "partition",
      activeIndex,
      onActiveIndexChange,
      onRangesChange,
      onRangesInput,
      onRangesCommit,
      onRangeRemove,
      onSeek,
      onTrackDblClick,
      thumbnails,
      currentTime,
      zoom = 1,
      minRangeDuration = MIN_MEDIA_RANGE,
      formatTime = formatMediaTime,
      rangeClass,
      rangeColor,
      rangeLabel,
      label = "Media timeline",
      className,
      ...props
    },
    ref,
  ) => {
    const independent = rangeMode === "independent";
    const trackRef = React.useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = React.useState<{
      index: number;
      edge: "start" | "end" | "move";
    } | null>(null);
    const [dragTip, setDragTip] = React.useState<{ pct: number; text: string } | null>(null);
    const [hoverTime, setHoverTime] = React.useState<number | null>(null);

    // The drag's own output, handed to onRangesCommit on release. props.ranges
    // would do only for a consumer that applied every onRangesInput — one that
    // listens to commit alone would be handed its own unchanged array back.
    const draggedRanges = React.useRef<MediaRange[] | null>(null);
    // A drag ends with a click on the track; without this it would also seek.
    const suppressClick = React.useRef(false);
    // Lane-time distance from the grab point to the range's start, so a body
    // drag holds the bar where it was grabbed instead of snapping start there.
    const grabDelta = React.useRef(0);

    const toPct = (time: number) => (time / duration) * 100;
    const toTime = (clientX: number) => {
      const el = trackRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * duration;
    };

    const emitInput = (next: MediaRange[]) => (onRangesInput ?? onRangesChange)?.(next);

    const onHandleDown = (index: number, edge: "start" | "end", e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging({ index, edge });
      setHoverTime(null);
      draggedRanges.current = null;
      onActiveIndexChange?.(index);
    };

    // Body-drag is independent-mode-only: moving a partition range through
    // its neighbours has no defined meaning, so a partition body stays a
    // click target and nothing more.
    const onBodyDown = (index: number, e: React.PointerEvent) => {
      if (!independent) return;
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      grabDelta.current = toTime(e.clientX) - ranges[index].start;
      setDragging({ index, edge: "move" });
      setHoverTime(null);
      draggedRanges.current = null;
      onActiveIndexChange?.(index);
    };

    const onTrackPointerMove = (e: React.PointerEvent) => {
      if (!dragging) {
        setHoverTime(toTime(e.clientX));
        return;
      }
      e.preventDefault();
      if (dragging.edge === "move") {
        const { ranges: next, start } = moveRange(
          ranges,
          dragging.index,
          toTime(e.clientX) - grabDelta.current,
          duration,
        );
        draggedRanges.current = next;
        const r = next[dragging.index];
        setDragTip({
          pct: clampBadgePct(toPct(start)),
          text: `${formatTime(start)} · ${(r.end - r.start).toFixed(1)}s`,
        });
        emitInput(next);
        return;
      }
      const { ranges: next, edgeTime } = dragRangeEdge(
        ranges,
        dragging.index,
        dragging.edge,
        toTime(e.clientX),
        duration,
        minRangeDuration,
        rangeMode,
      );
      draggedRanges.current = next;
      const r = next[dragging.index];
      setDragTip({
        pct: clampBadgePct(toPct(edgeTime)),
        text: `${formatTime(edgeTime)} · ${(r.end - r.start).toFixed(1)}s`,
      });
      emitInput(next);
      onSeek?.(edgeTime);
    };

    const onTrackPointerUp = () => {
      // Bail when no drag is in flight: an unconditional setState here commits
      // a re-render BETWEEN pointerup and mouseup of a plain click, and that
      // commit re-sets the remove button's Icon innerHTML — detaching the SVG
      // node the mousedown targeted, which makes the browser suppress the
      // click. Measured: the remove button ate every click until this guard.
      if (!dragging) return;
      if (draggedRanges.current) {
        onRangesCommit?.(draggedRanges.current);
        suppressClick.current = true;
      }
      setDragging(null);
      setDragTip(null);
      draggedRanges.current = null;
    };

    const onTrackClick = (e: React.MouseEvent) => {
      if (suppressClick.current) {
        suppressClick.current = false;
        return;
      }
      // An overlay lane's empty track is the deselect surface (bars stop
      // their clicks), and the click still seeks — StudioX's grammar.
      if (independent) onActiveIndexChange?.(-1);
      onSeek?.(toTime(e.clientX));
    };

    const onHandleKeyDown = (index: number, edge: "start" | "end", e: React.KeyboardEvent) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const range = ranges[index];
      const from = edge === "start" ? range.start : range.end;
      const { ranges: next } = dragRangeEdge(
        ranges,
        index,
        edge,
        from + dir * (e.shiftKey ? 1 : minRangeDuration),
        duration,
        minRangeDuration,
        rangeMode,
      );
      onRangesChange?.(next);
    };

    const onBodyKeyDown = (index: number, e: React.KeyboardEvent) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const { ranges: next } = moveRange(
        ranges,
        index,
        ranges[index].start + dir * (e.shiftKey ? 1 : minRangeDuration),
        duration,
      );
      onRangesChange?.(next);
    };

    return (
      <div ref={ref} className={cn("zen-flex zen-w-full zen-flex-col", className)} {...props}>
        <div className="zen-w-full zen-overflow-x-auto zen-rounded-zen-md">
          <div
            ref={trackRef}
            role="group"
            aria-label={label}
            // Time axes read left-to-right even in RTL locales — every editor's.
            dir="ltr"
            className={cn(
              // Overlay lanes are shorter than filmstrip tracks — the height
              // is a per-mode default because the caller's `className` lands
              // on the ROOT, where a height utility could not reach this.
              independent ? "zen-h-10" : "zen-h-14",
              "zen-relative zen-select-none zen-overflow-hidden zen-rounded-zen-md",
              "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair",
            )}
            style={{ width: `${zoom * 100}%`, minWidth: "100%" }}
            onClick={onTrackClick}
            onDoubleClick={(e) => onTrackDblClick?.(toTime(e.clientX))}
            // A drag's own ending click targets the captured handle and is
            // stopped by the range's click handler, so it never reaches the
            // track — without this reset the armed suppressClick would
            // swallow the NEXT genuine track click instead.
            onPointerDown={() => (suppressClick.current = false)}
            onPointerMove={onTrackPointerMove}
            onPointerUp={onTrackPointerUp}
            onPointerLeave={() => setHoverTime(null)}
          >
            {thumbnails && thumbnails.length > 0 ? (
              <div
                aria-hidden="true"
                className="zen-absolute zen-inset-0 zen-flex zen-overflow-hidden zen-opacity-60 zen-pointer-events-none"
              >
                {thumbnails.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    draggable={false}
                    className="zen-h-full zen-shrink-0 zen-object-cover"
                    style={{ width: `${100 / thumbnails.length}%` }}
                  />
                ))}
              </div>
            ) : null}

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

            {ranges.map((range, i) => {
              const active = i === activeIndex;
              const custom = rangeClass?.(i, active);
              // Precedence: rangeClass > rangeColor > default primary tint.
              const color = custom ? undefined : rangeColor?.(i, active);
              const moving = dragging?.edge === "move" && dragging.index === i;
              return (
                <div
                  key={i}
                  role={independent ? "slider" : undefined}
                  tabIndex={independent ? 0 : undefined}
                  aria-orientation={independent ? "horizontal" : undefined}
                  aria-label={independent ? `Range ${i + 1} position` : undefined}
                  aria-valuemin={independent ? 0 : undefined}
                  aria-valuemax={independent ? duration - (range.end - range.start) : undefined}
                  aria-valuenow={independent ? range.start : undefined}
                  aria-valuetext={independent ? formatTime(range.start) : undefined}
                  className={cn(
                    "zen-absolute",
                    independent
                      ? cn(
                          "zen-top-1 zen-bottom-1 zen-rounded-zen-sm zen-overflow-hidden",
                          moving ? "zen-cursor-grabbing" : "zen-cursor-grab",
                          // Outline, not ring: the colour treatment owns the
                          // bar's box-shadow inline, and an inline style would
                          // silently beat a focus ring built from box-shadow.
                          "focus-visible:zen-outline focus-visible:zen-outline-2 focus-visible:zen-outline-zen-ring",
                        )
                      : "zen-top-0 zen-h-full",
                    custom ??
                      (color
                        ? ""
                        : active
                          ? "zen-ring-2 zen-ring-zen-primary"
                          : "zen-ring-1 zen-ring-zen-primary"),
                  )}
                  style={{
                    left: `${toPct(range.start)}%`,
                    width: `${toPct(range.end - range.start)}%`,
                    // A sliver of a span must stay visible and grabbable.
                    ...(independent ? { minWidth: "4px" } : {}),
                    ...(custom
                      ? {}
                      : color
                        ? {
                            background: `color-mix(in srgb, ${color} ${active ? 40 : 25}%, transparent)`,
                            boxShadow: `inset 0 0 0 ${active ? 2 : 1}px ${color}`,
                          }
                        : { background: tint(active ? 40 : 20) }),
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onActiveIndexChange?.(i);
                  }}
                  onPointerDown={(e) => onBodyDown(i, e)}
                  onKeyDown={(e) => independent && onBodyKeyDown(i, e)}
                >
                  {(["start", "end"] as const).map((edge) => (
                    <div
                      key={edge}
                      role="slider"
                      tabIndex={0}
                      aria-orientation="horizontal"
                      aria-label={`Range ${i + 1} ${edge}`}
                      aria-valuemin={0}
                      aria-valuemax={duration}
                      aria-valuenow={range[edge]}
                      aria-valuetext={formatTime(range[edge])}
                      className={cn(
                        "zen-absolute zen-top-0 zen-h-full zen-w-3 zen-cursor-ew-resize",
                        "zen-bg-zen-primary hover:zen-opacity-80",
                        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                        edge === "start" ? "zen-left-0" : "zen-right-0",
                      )}
                      style={color ? { background: color } : undefined}
                      onPointerDown={(e) => onHandleDown(i, edge, e)}
                      onKeyDown={(e) => onHandleKeyDown(i, edge, e)}
                    />
                  ))}
                  {rangeLabel ? (
                    <span className="zen-pointer-events-none zen-absolute zen-inset-0 zen-flex zen-items-center zen-px-3 zen-text-xs zen-text-zen-foreground">
                      <span className="zen-truncate">{rangeLabel(i)}</span>
                    </span>
                  ) : null}
                  {active && onRangeRemove ? (
                    <button
                      type="button"
                      aria-label={`Remove range ${i + 1}`}
                      className={cn(
                        "zen-absolute zen-top-1 zen-left-1/2 -zen-translate-x-1/2 zen-z-10",
                        "zen-flex zen-h-4 zen-w-4 zen-cursor-pointer zen-items-center zen-justify-center",
                        "zen-rounded-zen-full zen-border zen-border-zen-border zen-bg-zen-background zen-p-0",
                        "zen-text-zen-muted-fg hover:zen-border-zen-error hover:zen-bg-zen-error hover:zen-text-zen-error-fg",
                        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      )}
                      // Stop the pointerdown too: in independent mode the bar
                      // body starts a drag on pointerdown, and a drag started
                      // under this button would eat its own click.
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRangeRemove(i);
                      }}
                    >
                      <Icon name="x" size={10} />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);
MediaTimeline.displayName = "MediaTimeline";

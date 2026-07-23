import { type JSX } from "solid-js";
import { type MediaRange } from "@algorisys/zen-ui-core";
/**
 * MediaTimeline — a filmstrip trim track: draggable ranges over optional
 * thumbnails, with a playhead, hover scrubbing and zoom.
 *
 *   <MediaTimeline
 *     duration={video.duration}
 *     ranges={ranges()}
 *     activeIndex={active()}
 *     onActiveIndexChange={setActive}
 *     onRangesInput={setRanges}
 *     onRangesCommit={commitToHistory}
 *     onSeek={(t) => (video.currentTime = t)}
 *     thumbnails={thumbs}
 *     currentTime={playhead()}
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
 * scripts/check-media.ts.
 *
 * Mirrors the React binding's API.
 */
export type MediaTimelineProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    /** Total media length, seconds. The track maps [0, duration] to its width. */
    duration: number;
    /** Sorted, non-overlapping spans. The app owns the array (controlled). */
    ranges: MediaRange[];
    /** Which range is highlighted; the remove affordance renders on it. */
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
     */
    rangeClass?: (index: number, active: boolean) => string;
    /** Names the timeline for a screen reader. */
    label?: string;
    class?: string;
};
export declare const MediaTimeline: (props: MediaTimelineProps) => JSX.Element;
//# sourceMappingURL=media-timeline.d.ts.map
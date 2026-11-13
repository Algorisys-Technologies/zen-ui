import * as React from "react";
import { type StateSegment, type StateSegmentInput, type TimelineEventInput } from "../../_core/state-timeline";
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
declare const StateTimeline: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onClick"> & {
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
} & React.RefAttributes<HTMLDivElement>>;
export { StateTimeline };
//# sourceMappingURL=state-timeline.d.ts.map
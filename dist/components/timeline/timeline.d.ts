import { type JSX } from "solid-js";
import type { IconName } from "@algorisys/zen-ui-core";
/**
 * Timeline — a sequence of things that happened, in order.
 *
 *   <Timeline items={events} />
 *
 * An audit trail, an order's history, a ticket's comments. Data-driven rather
 * than compound: the shape is always the same (a rail, a marker, a time, a
 * body), so compound parts would only let a caller build one that is subtly
 * wrong — a marker with no rail, or two rails.
 *
 * It renders an ORDERED list, because the order is the content. A `<div>` stack
 * would tell a screen-reader user nothing about sequence or length, and this is
 * a component whose entire subject is sequence.
 *
 * Grouping is by a `group` string on the item rather than a `groupBy` function.
 * The caller already knows whether two events belong to the same day — deriving
 * it here would mean guessing at their timezone and their idea of "today".
 */
export type TimelineState = "default" | "info" | "success" | "warning" | "error";
export interface TimelineItem {
    id: string;
    /** What happened. Keep it to a line; the body is for the rest. */
    title: JSX.Element;
    description?: JSX.Element;
    /**
     * Shown beside the title. A display string, not a Date — formatting a date is
     * a locale and timezone decision the caller has already made elsewhere.
     */
    timestamp?: string;
    /** Machine-readable form for `<time datetime>`, when `timestamp` is prose. */
    dateTime?: string;
    /** Replaces the dot. */
    icon?: IconName;
    state?: TimelineState;
    /** A heading that starts a new run of items — "Today", "March". */
    group?: string;
    /** Anything richer than a description: a diff, a quote, an attachment. */
    children?: JSX.Element;
}
export interface TimelineProps {
    items: TimelineItem[];
    /**
     * `"compact"` drops the description and body and tightens the spacing, for a
     * sidebar or a popover where the timeline is context rather than the subject.
     */
    density?: "default" | "compact";
    /** Message when there is nothing yet. */
    emptyMessage?: JSX.Element;
    class?: string;
}
export declare const Timeline: (props: TimelineProps) => JSX.Element;
//# sourceMappingURL=timeline.d.ts.map
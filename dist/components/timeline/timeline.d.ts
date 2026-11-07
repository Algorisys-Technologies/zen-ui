import * as React from "react";
import type { IconName } from "../../_core/index";
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
    title: React.ReactNode;
    description?: React.ReactNode;
    /**
     * Shown beside the title. A display string, not a Date — formatting a date is
     * a locale and timezone decision the caller has already made elsewhere.
     */
    timestamp?: string;
    /** Machine-readable form for `<time dateTime>`, when `timestamp` is prose. */
    dateTime?: string;
    /** Replaces the dot. */
    icon?: IconName;
    state?: TimelineState;
    /** A heading that starts a new run of items — "Today", "March". */
    group?: string;
    /** Anything richer than a description: a diff, a quote, an attachment. */
    children?: React.ReactNode;
    /**
     * Put `children` behind a disclosure. A history where every entry carries a
     * payload is unreadable fully expanded — the events stop being scannable,
     * which is the one thing a timeline is for.
     */
    collapsible?: boolean;
    /** Starting state when the disclosure is uncontrolled. */
    defaultOpen?: boolean;
    /**
     * Controlled disclosure. Pass it with `onOpenChange` and the caller owns which
     * items are open — the only way to build a single-open accordion, where
     * opening one row closes the others.
     */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /**
     * The disclosure's label. Defaults to "Details". A function receives the
     * current state, for a toggle that reads "Show" / "Hide" rather than one
     * fixed word.
     */
    collapseLabel?: React.ReactNode | ((open: boolean) => React.ReactNode);
}
export interface TimelineProps {
    items: TimelineItem[];
    /**
     * `"compact"` drops the description and body and tightens the spacing, for a
     * sidebar or a popover where the timeline is context rather than the subject.
     */
    density?: "default" | "compact";
    /** Message when there is nothing yet. */
    emptyMessage?: React.ReactNode;
    className?: string;
}
export declare const Timeline: ({ items, density, emptyMessage, className }: TimelineProps) => React.JSX.Element;
//# sourceMappingURL=timeline.d.ts.map
import * as React from "react";
import type { IconName } from "@algorisys/zen-ui-core";
import { Icon } from "../icon/icon";
import { cn } from "../../lib/cn";

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

const DOT_CLASS: Record<TimelineState, string> = {
  default: "zen-bg-zen-muted-fg",
  info: "zen-bg-zen-info",
  success: "zen-bg-zen-success",
  warning: "zen-bg-zen-warning",
  error: "zen-bg-zen-error",
};

const ICON_CLASS: Record<TimelineState, string> = {
  default: "zen-text-zen-muted-fg",
  info: "zen-text-zen-info",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error",
};

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

/**
 * The body of one item, disclosed or not.
 *
 * A native `<details>` rather than the Accordion: it is keyboard-operable and
 * findable by the browser's in-page search with no JS at all, and an audit trail
 * is exactly the place someone hits Ctrl+F expecting to match text inside a
 * collapsed row. The open state is mirrored into React state only so the chevron
 * can point the right way — the disclosure itself stays uncontrolled unless the
 * caller passes `open`.
 */
const TimelineBody = ({ item }: { item: TimelineItem }) => {
  const [internal, setInternal] = React.useState(!!item.defaultOpen);
  const open = item.open ?? internal;

  const label =
    item.collapseLabel === undefined
      ? "Details"
      : typeof item.collapseLabel === "function"
        ? item.collapseLabel(open)
        : item.collapseLabel;

  if (!item.collapsible) return <div className="zen-mt-1">{item.children}</div>;

  return (
    <details
      className="zen-mt-1"
      open={open}
      onToggle={(e) => {
        /* A controlled caller may refuse the change, so the element's own state
           is not the truth — push it back if it drifted. */
        const next = (e.currentTarget as HTMLDetailsElement).open;
        if (next === open) return;
        setInternal(next);
        item.onOpenChange?.(next);
      }}
    >
      <summary className="zen-inline-flex zen-cursor-pointer zen-list-none zen-items-center zen-gap-1 zen-rounded-zen-sm zen-text-xs zen-font-medium zen-text-zen-muted-fg hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring">
        <Icon
          name="chevron-down"
          size={14}
          className={cn("zen-transition-transform", open ? undefined : "-zen-rotate-90 rtl:zen-rotate-90")}
        />
        {label}
      </summary>
      <div className="zen-mt-2">{item.children}</div>
    </details>
  );
};

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

export const Timeline = ({ items, density, emptyMessage, className }: TimelineProps) => {
  /* Group boundaries are computed once per render rather than by comparing
   * against the previous item inside the loop, which would re-derive it for
   * every item and read the array out of order. */
  const rows = React.useMemo(
    () =>
      (items ?? []).map((item, i, all) => ({
        item,
        startsGroup: !!item.group && item.group !== all[i - 1]?.group,
        isLast: i === all.length - 1,
      })),
    [items],
  );

  const compact = density === "compact";

  if (rows.length === 0) {
    return (
      <p className="zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg">
        {emptyMessage ?? "Nothing yet"}
      </p>
    );
  }

  return (
    <ol className={cn("zen-m-0 zen-list-none zen-p-0", className)}>
      {rows.map((row) => (
        <React.Fragment key={row.item.id}>
          {row.startsGroup && (
            /* Not an <li>: a heading is not one of the events, and putting it
               in the list would inflate the count a screen reader announces. */
            <p className="zen-mb-2 zen-mt-4 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg first:zen-mt-0">
              {row.item.group}
            </p>
          )}
          <li className={cn("zen-relative zen-ps-8", compact ? "zen-pb-3" : "zen-pb-6")}>
            {/*
              The rail. Logical inset so it moves to the right-hand side under
              RTL rather than stranding the markers across the text. Hidden on
              the last item: a line running past the final event reads as "more
              below", which is exactly wrong at the end.
            */}
            {!row.isLast && (
              <span
                aria-hidden="true"
                className="zen-absolute zen-top-2 zen-bottom-0 zen-start-[7px] zen-w-px zen-bg-zen-border"
              />
            )}

            {row.item.icon ? (
              <span
                aria-hidden="true"
                className={cn(
                  "zen-absolute zen-start-0 zen-top-0.5 zen-flex zen-h-4 zen-w-4 zen-items-center zen-justify-center zen-rounded-zen-full zen-bg-zen-background",
                  ICON_CLASS[row.item.state ?? "default"],
                )}
              >
                <Icon name={row.item.icon} size={14} />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className={cn(
                  "zen-absolute zen-start-1 zen-top-1.5 zen-h-2 zen-w-2 zen-rounded-zen-full",
                  DOT_CLASS[row.item.state ?? "default"],
                )}
              />
            )}

            <div className="zen-flex zen-flex-col zen-gap-0.5">
              <div className="zen-flex zen-flex-wrap zen-items-baseline zen-gap-x-2">
                <span className="zen-text-sm zen-font-medium zen-text-zen-foreground">
                  {row.item.title}
                </span>
                {row.item.timestamp && (
                  <time dateTime={row.item.dateTime} className="zen-text-xs zen-text-zen-muted-fg">
                    {row.item.timestamp}
                  </time>
                )}
              </div>
              {!compact && row.item.description && (
                <p className="zen-m-0 zen-text-sm zen-leading-relaxed zen-text-zen-muted-fg">
                  {row.item.description}
                </p>
              )}
              {!compact && row.item.children && <TimelineBody item={row.item} />}
            </div>
          </li>
        </React.Fragment>
      ))}
    </ol>
  );
};

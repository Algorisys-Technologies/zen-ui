import { For, Show, createMemo, type JSX } from "solid-js";
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

export const Timeline = (props: TimelineProps) => {
  /* Group boundaries are computed once per render rather than by comparing
   * against the previous item inside the loop, which would re-derive it for
   * every item and read the array out of order. */
  const rows = createMemo(() =>
    (props.items ?? []).map((item, i, all) => ({
      item,
      startsGroup: !!item.group && item.group !== all[i - 1]?.group,
      isLast: i === all.length - 1,
    })),
  );

  const compact = () => props.density === "compact";

  return (
    <Show
      when={rows().length > 0}
      fallback={
        <p class="zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg">
          {props.emptyMessage ?? "Nothing yet"}
        </p>
      }
    >
      <ol class={cn("zen-m-0 zen-list-none zen-p-0", props.class)}>
        <For each={rows()}>
          {(row) => (
            <>
              <Show when={row.startsGroup}>
                {/* Not an <li>: a heading is not one of the events, and putting
                    it in the list would inflate the count a screen reader
                    announces. */}
                <p class="zen-mb-2 zen-mt-4 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg first:zen-mt-0">
                  {row.item.group}
                </p>
              </Show>
              <li class={cn("zen-relative zen-ps-8", compact() ? "zen-pb-3" : "zen-pb-6")}>
                {/*
                  The rail. Logical inset so it moves to the right-hand side
                  under RTL rather than stranding the markers across the text.
                  Hidden on the last item: a line running past the final event
                  reads as "more below", which is exactly wrong at the end.
                */}
                <Show when={!row.isLast}>
                  <span
                    aria-hidden="true"
                    class="zen-absolute zen-top-2 zen-bottom-0 zen-start-[7px] zen-w-px zen-bg-zen-border"
                  />
                </Show>

                <Show
                  when={row.item.icon}
                  fallback={
                    <span
                      aria-hidden="true"
                      class={cn(
                        "zen-absolute zen-start-1 zen-top-1.5 zen-h-2 zen-w-2 zen-rounded-zen-full",
                        DOT_CLASS[row.item.state ?? "default"],
                      )}
                    />
                  }
                >
                  {(name) => (
                    <span
                      aria-hidden="true"
                      class={cn(
                        "zen-absolute zen-start-0 zen-top-0.5 zen-flex zen-h-4 zen-w-4 zen-items-center zen-justify-center zen-rounded-zen-full zen-bg-zen-background",
                        ICON_CLASS[row.item.state ?? "default"],
                      )}
                    >
                      <Icon name={name()} size={14} />
                    </span>
                  )}
                </Show>

                <div class="zen-flex zen-flex-col zen-gap-0.5">
                  <div class="zen-flex zen-flex-wrap zen-items-baseline zen-gap-x-2">
                    <span class="zen-text-sm zen-font-medium zen-text-zen-foreground">
                      {row.item.title}
                    </span>
                    <Show when={row.item.timestamp}>
                      <time
                        datetime={row.item.dateTime}
                        class="zen-text-xs zen-text-zen-muted-fg"
                      >
                        {row.item.timestamp}
                      </time>
                    </Show>
                  </div>
                  <Show when={!compact() && row.item.description}>
                    <p class="zen-m-0 zen-text-sm zen-leading-relaxed zen-text-zen-muted-fg">
                      {row.item.description}
                    </p>
                  </Show>
                  <Show when={!compact() && row.item.children}>
                    <div class="zen-mt-1">{row.item.children}</div>
                  </Show>
                </div>
              </li>
            </>
          )}
        </For>
      </ol>
    </Show>
  );
};

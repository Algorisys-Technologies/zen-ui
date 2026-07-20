import { type JSX, createMemo, createSignal, For, Show } from "solid-js";
import type { IconName } from "@algorisys/zen-ui-core/icons";
import {
  formatTimeRange,
  layoutLanes,
  nowPct,
  placeAppointment,
  planningColumns,
  planningRange,
  planningRangeLabel,
  shiftPlanningAnchor,
  type PlanningView,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";

/**
 * PlanningCalendar — who is busy, and when.
 *
 *   <PlanningCalendar rows={people} view="week" />
 *
 * A resource-by-time grid: one row per person, room or machine, one axis of
 * time, appointments as blocks on it. The question it answers is a comparison
 * ACROSS rows — who is free on Thursday, which room is double-booked — which is
 * why a month is one long axis of 31 columns rather than a 6×7 page. Wrapping
 * the month into weeks would give each resource six separate rows and destroy
 * the only comparison the component exists to make. For a single month page,
 * that is `Calendar`.
 *
 * All the arithmetic — ranges, columns, block placement, overlap lanes, the now
 * line — is in @algorisys/zen-ui-core/planning and pinned by
 * scripts/check-planning.ts, so four renderers cannot drift on where 09:30 is.
 *
 * It does NOT edit. There is no drag-to-move, no drag-to-create, no resize
 * handles. Those need a conflict policy, an undo story and a permission model
 * that belong to the caller's domain, and a component that half-implements them
 * is worse than one that clearly does not: `onAppointmentClick` hands you the
 * appointment and you open your own editor.
 *
 * Times are the caller's local `Date`s, deliberately unconverted — see the
 * module's note in core.
 */

export type PlanningAppointmentState =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "error";

const BLOCK_CLASS: Record<PlanningAppointmentState, string> = {
  default: "zen-bg-zen-muted zen-text-zen-foreground zen-border-zen-border",
  info: "zen-bg-zen-info-soft zen-text-zen-info zen-border-zen-info/40",
  success: "zen-bg-zen-success-soft zen-text-zen-success zen-border-zen-success/40",
  warning: "zen-bg-zen-warning-soft zen-text-zen-warning zen-border-zen-warning/40",
  error: "zen-bg-zen-error-soft zen-text-zen-error zen-border-zen-error/40",
};

export interface PlanningAppointment {
  id: string;
  start: Date;
  end: Date;
  title: string;
  /** Second line, when the block is tall enough to show it. */
  subtitle?: string;
  state?: PlanningAppointmentState;
  icon?: IconName;
}

export interface PlanningRow {
  id: string;
  /** The resource: a person, a room, a machine. */
  title: string;
  subtitle?: string;
  appointments: PlanningAppointment[];
}

export interface PlanningCalendarProps {
  rows: PlanningRow[];
  /** Uncontrolled starting view. */
  defaultView?: PlanningView;
  /** Controlled view; pair with `onViewChange`. */
  view?: PlanningView;
  onViewChange?: (view: PlanningView) => void;
  /** Which views the switcher offers. Default all three. */
  views?: PlanningView[];
  /** Any date inside the range to open on. Default today. */
  defaultDate?: Date;
  /** Controlled anchor date; pair with `onDateChange`. */
  date?: Date;
  onDateChange?: (date: Date) => void;
  onAppointmentClick?: (appointment: PlanningAppointment, row: PlanningRow) => void;
  /** Reference "now" for the marker and today highlight. Injectable for tests. */
  now?: Date;
  /** Hide the toolbar when your page already has one. */
  hideToolbar?: boolean;
  /** Message when there are no resources. */
  emptyMessage?: JSX.Element;
  class?: string;
}

const VIEW_LABEL: Record<PlanningView, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
};

/** Row height per lane. A block is 28px tall; lanes stack inside the row. */
const LANE_PX = 30;

/**
 * Below this width, a block shows no text at all.
 *
 * A 90-minute meeting is 0.9% of a week. At that size a label is not "clipped",
 * it is an empty bordered pill — which reads as a component that failed to
 * render rather than as a busy hour. Under the threshold the block becomes what
 * it actually is at that zoom: an occupancy mark, with its name and time still
 * in the accessible name and the tooltip, and the day view a click away.
 *
 * 3% is ~5 hours of a week and ~45 minutes of a day, so a real meeting keeps its
 * label in the view meant for reading meetings and loses it in the view meant
 * for comparing people.
 */
const TEXT_MIN_WIDTH_PCT = 3;

export const PlanningCalendar = (props: PlanningCalendarProps) => {
  const [innerView, setInnerView] = createSignal<PlanningView>(props.defaultView ?? "week");
  const [innerDate, setInnerDate] = createSignal<Date>(props.defaultDate ?? new Date());

  const view = () => props.view ?? innerView();
  const anchor = () => props.date ?? innerDate();
  const now = () => props.now ?? new Date();

  const setView = (next: PlanningView) => {
    if (props.view === undefined) setInnerView(next);
    props.onViewChange?.(next);
  };
  const setDate = (next: Date) => {
    if (props.date === undefined) setInnerDate(next);
    props.onDateChange?.(next);
  };

  const range = createMemo(() => planningRange(view(), anchor()));
  const columns = createMemo(() => planningColumns(view(), anchor(), { now: now() }));
  const marker = createMemo(() => nowPct(range(), now()));

  /* Placement and lanes are computed once per row per render rather than inside
     the block loop, which would re-run the whole lane assignment for every
     appointment — O(n²) on a row with a busy day. */
  const laidOut = createMemo(() =>
    (props.rows ?? []).map((row) => {
      const visible = row.appointments
        .map((appointment) => ({ appointment, placement: placeAppointment(appointment, range()) }))
        .filter((entry): entry is { appointment: PlanningAppointment; placement: NonNullable<typeof entry.placement> } =>
          entry.placement !== null,
        );
      const { lanes, laneCount } = layoutLanes(visible.map((v) => v.appointment));
      return {
        row,
        blocks: visible.map((v, i) => ({ ...v, lane: lanes[i] })),
        laneCount: Math.max(laneCount, 1),
      };
    }),
  );

  return (
    /* w-full, because the grid is a chart: shrink-wrapped to its content it
       reports a 490px week where the columns are too narrow to read, and the
       caller cannot fix it from outside without knowing the internals. */
    <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-3", props.class)}>
      {/* The toolbar is gated on there being rows, not only on `hideToolbar`.
          With no resources, Previous / Today / Next and the view switcher are
          controls that cannot change anything the user can see — every view of
          an empty resource list is the same empty list. Drawing them would be
          the dead-control anti-pattern with extra steps. */}
      <Show when={!props.hideToolbar && laidOut().length > 0}>
        <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="Previous"
            onClick={() => setDate(shiftPlanningAnchor(view(), anchor(), -1))}
          >
            {/* Logical, not physical: under RTL the axis runs the other way, so a
                left-pointing chevron would send you forward. */}
            <Icon name="chevron-left" size={14} class="rtl:zen-rotate-180" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDate(now())}>
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Next"
            onClick={() => setDate(shiftPlanningAnchor(view(), anchor(), 1))}
          >
            <Icon name="chevron-right" size={14} class="rtl:zen-rotate-180" />
          </Button>

          <span class="zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground">
            {planningRangeLabel(view(), anchor())}
          </span>

          <div class="zen-ms-auto zen-flex zen-gap-1" role="group" aria-label="View">
            <For each={props.views ?? (["day", "week", "month"] as PlanningView[])}>
              {(v) => (
                <Button
                  variant={view() === v ? "solid" : "outline"}
                  size="sm"
                  aria-pressed={view() === v}
                  onClick={() => setView(v)}
                >
                  {VIEW_LABEL[v]}
                </Button>
              )}
            </For>
          </div>
        </div>
      </Show>

      <Show
        when={laidOut().length > 0}
        fallback={
          <p class="zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg">
            {props.emptyMessage ?? "No resources"}
          </p>
        }
      >
        {/* One horizontal scroller holding the header and every row, so the time
            axis and the blocks under it cannot scroll out of alignment — the
            failure you get from scrolling them as two panes. */}
        <div class="zen-overflow-x-auto zen-rounded-zen-md zen-border zen-border-zen-border">
          <div class="zen-min-w-[45rem]">
            <div class="zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted/30">
              <div class="zen-w-40 zen-shrink-0 zen-border-e zen-border-zen-border zen-px-3 zen-py-2 zen-text-xs zen-font-semibold zen-text-zen-muted-fg">
                Resource
              </div>
              <div class="zen-flex zen-flex-1">
                <For each={columns()}>
                  {(column) => (
                    <div
                      class={cn(
                        "zen-flex-1 zen-border-e zen-border-zen-border zen-px-1 zen-py-2 zen-text-center last:zen-border-e-0",
                        column.nonWorking && "zen-bg-zen-muted/40",
                        column.today && "zen-bg-zen-primary-soft",
                      )}
                    >
                      <div class="zen-text-xs zen-font-medium zen-text-zen-foreground">
                        {column.label}
                      </div>
                      <Show when={column.sublabel}>
                        <div class="zen-text-[10px] zen-text-zen-muted-fg">{column.sublabel}</div>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </div>

            <For each={laidOut()}>
              {(entry) => (
                <div class="zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0">
                  <div class="zen-w-40 zen-shrink-0 zen-border-e zen-border-zen-border zen-px-3 zen-py-2">
                    <div class="zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground">
                      {entry.row.title}
                    </div>
                    <Show when={entry.row.subtitle}>
                      <div class="zen-truncate zen-text-xs zen-text-zen-muted-fg">
                        {entry.row.subtitle}
                      </div>
                    </Show>
                  </div>

                  <div
                    class="zen-relative zen-flex-1"
                    style={{ "min-height": `${entry.laneCount * LANE_PX + 8}px` }}
                  >
                    {/* The column rules, drawn as a background layer rather than
                        as parents of the blocks: a block that spans four hours
                        cannot live inside one column's box. */}
                    <div aria-hidden="true" class="zen-absolute zen-inset-0 zen-flex">
                      <For each={columns()}>
                        {(column) => (
                          <div
                            class={cn(
                              "zen-flex-1 zen-border-e zen-border-zen-border last:zen-border-e-0",
                              column.nonWorking && "zen-bg-zen-muted/30",
                              column.today && "zen-bg-zen-primary-soft/40",
                            )}
                          />
                        )}
                      </For>
                    </div>

                    <Show when={marker() !== null}>
                      <div
                        aria-hidden="true"
                        class="zen-absolute zen-top-0 zen-bottom-0 zen-w-px zen-bg-zen-error"
                        style={{ "inset-inline-start": `${marker()}%` }}
                      />
                    </Show>

                    <For each={entry.blocks}>
                      {(block) => (
                        <button
                          type="button"
                          onClick={() => props.onAppointmentClick?.(block.appointment, entry.row)}
                          /* A button whether or not a handler was passed: these
                             are the only things in the grid worth reaching by
                             keyboard, and a div with no tabindex takes the whole
                             calendar out of the tab order. Without a handler it
                             is inert but still focusable and still readable. */
                          class={cn(
                            "zen-absolute zen-flex zen-items-center zen-gap-1 zen-overflow-hidden zen-rounded-zen-sm zen-border zen-px-1.5 zen-text-start zen-text-xs",
                            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                            BLOCK_CLASS[block.appointment.state ?? "default"],
                            /* Square off the cut edge so a block continuing past
                               the view does not look like it ends there. */
                            block.placement.clippedStart && "zen-rounded-s-none zen-border-s-0",
                            block.placement.clippedEnd && "zen-rounded-e-none zen-border-e-0",
                            props.onAppointmentClick && "hover:zen-brightness-95",
                          )}
                          style={{
                            "inset-inline-start": `${block.placement.startPct}%`,
                            width: `${block.placement.widthPct}%`,
                            top: `${block.lane * LANE_PX + 4}px`,
                            height: `${LANE_PX - 6}px`,
                          }}
                          title={`${block.appointment.title} · ${formatTimeRange(block.appointment.start, block.appointment.end)}`}
                        >
                          {/* The time is in the accessible name, not only the
                              title attribute: a block narrow enough to clip its
                              own text is exactly when someone needs it, and
                              title is not reliably announced. */}
                          <span class="zen-sr-only">
                            {formatTimeRange(block.appointment.start, block.appointment.end)}
                          </span>
                          <Show when={block.placement.widthPct >= TEXT_MIN_WIDTH_PCT}>
                            <Show when={block.appointment.icon}>
                              <Icon name={block.appointment.icon as IconName} size={12} class="zen-shrink-0" />
                            </Show>
                            <span class="zen-truncate zen-font-medium">{block.appointment.title}</span>
                            <Show when={block.appointment.subtitle}>
                              <span class="zen-truncate zen-opacity-70">
                                {block.appointment.subtitle}
                              </span>
                            </Show>
                          </Show>
                        </button>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
};

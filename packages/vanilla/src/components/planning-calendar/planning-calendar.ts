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
import {
  applyProps,
  Disposer,
  toNodes,
  type AnyZenComponent,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";

/**
 * PlanningCalendar — who is busy, and when.
 *
 *   PlanningCalendar({ rows: people, defaultView: "week" }).el
 *
 * A resource-by-time grid: one row per person, room or machine, one axis of
 * time, appointments as blocks on it. The question it answers is a comparison
 * ACROSS rows, which is why a month is one long axis of 31 columns rather than a
 * 6×7 page — wrapping it into weeks would give each resource six separate rows.
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 * All the arithmetic is imported from @algorisys/zen-ui-core/planning and pinned
 * by scripts/check-planning.ts, so four renderers cannot drift on where 09:30
 * is.
 *
 * It does NOT edit: no drag-to-move, no drag-to-create, no resize handles.
 * `onAppointmentClick` hands you the appointment and its row.
 */

export type PlanningAppointmentState = "default" | "info" | "success" | "warning" | "error";

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
  /** Second line, when the block is wide enough to show it. */
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

export interface PlanningCalendarProps extends BaseProps {
  rows: PlanningRow[];
  /** Starting view. The factory owns it after that; call update() to control it. */
  defaultView?: PlanningView;
  view?: PlanningView;
  onViewChange?: (view: PlanningView) => void;
  /** Which views the switcher offers. Default all three. */
  views?: PlanningView[];
  /** Any date inside the range to open on. Default today. */
  defaultDate?: Date;
  date?: Date;
  onDateChange?: (date: Date) => void;
  onAppointmentClick?: (appointment: PlanningAppointment, row: PlanningRow) => void;
  /** Reference "now" for the marker and today highlight. Injectable for tests. */
  now?: Date;
  hideToolbar?: boolean;
  emptyMessage?: Child;
}

const VIEW_LABEL: Record<PlanningView, string> = { day: "Day", week: "Week", month: "Month" };
const ALL_VIEWS: PlanningView[] = ["day", "week", "month"];

/** Row height per lane. A block is 24px tall; lanes stack inside the row. */
const LANE_PX = 30;

/**
 * Below this width, a block renders no text at all.
 *
 * A 90-minute meeting is 0.9% of a week. At that size a label is not "clipped",
 * it is an empty bordered pill — which reads as a component that failed to
 * render rather than as a busy hour. Under the threshold the block is what it
 * actually is at that zoom: an occupancy mark, with its name and time still in
 * the accessible name and the tooltip.
 */
const TEXT_MIN_WIDTH_PCT = 3;

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export function PlanningCalendar(
  props: PlanningCalendarProps,
): ZenComponent<PlanningCalendarProps> {
  let current: PlanningCalendarProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  /* The factory owns the uncontrolled view and date, because there is no state
     hook here — `update({ view })` is how a caller takes control, and passing
     `view` explicitly wins over what the toolbar last set. */
  let innerView: PlanningView = props.defaultView ?? "week";
  let innerDate: Date = props.defaultDate ?? new Date();

  const root = el("div");

  /* Handles built by the CURRENT render, destroyed before the next one: a
     Button holds a real listener on a node this component created, and there is
     no unmount here to take it away. Without this every re-render — and the
     toolbar re-renders on every click — leaks a listener per control. */
  let owned: AnyZenComponent[] = [];
  const keep = <T extends AnyZenComponent>(comp: T): T => {
    owned.push(comp);
    return comp;
  };

  /* Block click listeners sit on plain <button>s this file builds, so no handle
     releases them. Kept in a per-render list rather than pushed onto the
     Disposer: the Disposer only runs at destroy(), so pushing there would grow
     an array by one entry per block on EVERY render — a slow leak that survives
     the nodes it refers to. */
  let blockCleanups: Array<() => void> = [];

  const viewOf = () => current.view ?? innerView;
  const dateOf = () => current.date ?? innerDate;

  const setView = (next: PlanningView) => {
    if (current.view === undefined) innerView = next;
    current.onViewChange?.(next);
    render();
  };
  const setDate = (next: Date) => {
    if (current.date === undefined) innerDate = next;
    current.onDateChange?.(next);
    render();
  };

  function toolbar(view: PlanningView, anchor: Date, now: Date): HTMLElement {
    const bar = el("div", "zen-flex zen-flex-wrap zen-items-center zen-gap-2");

    const prev = keep(
      Button({
        variant: "outline",
        size: "sm",
        "aria-label": "Previous",
        // Logical, not physical: under RTL the axis runs the other way, so a
        // left-pointing chevron would send you forward.
        children: keep(Icon({ name: "chevron-left", size: 14, class: "rtl:zen-rotate-180" })),
        onClick: () => setDate(shiftPlanningAnchor(view, anchor, -1)),
      }),
    );
    const today = keep(
      Button({ variant: "outline", size: "sm", children: "Today", onClick: () => setDate(now) }),
    );
    const next = keep(
      Button({
        variant: "outline",
        size: "sm",
        "aria-label": "Next",
        children: keep(Icon({ name: "chevron-right", size: 14, class: "rtl:zen-rotate-180" })),
        onClick: () => setDate(shiftPlanningAnchor(view, anchor, 1)),
      }),
    );

    const label = el(
      "span",
      "zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground",
      planningRangeLabel(view, anchor),
    );

    const switcher = el("div", "zen-ms-auto zen-flex zen-gap-1");
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "View");
    for (const v of current.views ?? ALL_VIEWS) {
      switcher.append(
        keep(
          Button({
            variant: view === v ? "solid" : "outline",
            size: "sm",
            "aria-pressed": view === v,
            children: VIEW_LABEL[v],
            onClick: () => setView(v),
          }),
        ).el,
      );
    }

    bar.append(prev.el, today.el, next.el, label, switcher);
    return bar;
  }

  function render(): void {
    for (const comp of owned) comp.destroy();
    owned = [];
    for (const off of blockCleanups) off();
    blockCleanups = [];
    root.replaceChildren();

    const {
      rows,
      emptyMessage,
      class: className,
      children: _children,
      defaultView: _dv,
      defaultDate: _dd,
      view: _v,
      date: _d,
      views: _vs,
      now: _n,
      hideToolbar: _ht,
      onViewChange: _ovc,
      onDateChange: _odc,
      onAppointmentClick: _oac,
      ...rest
    } = current;

    // w-full, because the grid is a chart: shrink-wrapped to its content it
    // reports a 490px week whose columns are too narrow to read.
    root.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-3", className);

    const view = viewOf();
    const anchor = dateOf();
    const now = current.now ?? new Date();
    const range = planningRange(view, anchor);
    const columns = planningColumns(view, anchor, { now });
    const marker = nowPct(range, now);

    const laidOut = (rows ?? []).map((row) => {
      const visible = row.appointments
        .map((appointment) => ({ appointment, placement: placeAppointment(appointment, range) }))
        .filter(
          (entry): entry is { appointment: PlanningAppointment; placement: NonNullable<typeof entry.placement> } =>
            entry.placement !== null,
        );
      const { lanes, laneCount } = layoutLanes(visible.map((v) => v.appointment));
      return {
        row,
        blocks: visible.map((v, i) => ({ ...v, lane: lanes[i] })),
        laneCount: Math.max(laneCount, 1),
      };
    });

    /* The toolbar is gated on there being rows, not only on `hideToolbar`. With
       no resources, Previous / Today / Next and the view switcher cannot change
       anything the user can see. */
    if (!current.hideToolbar && laidOut.length > 0) {
      root.append(toolbar(view, anchor, now));
    }

    if (laidOut.length === 0) {
      const p = el("p", "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg");
      p.append(...toNodes(emptyMessage ?? "No resources"));
      root.append(p);
    } else {
      // One horizontal scroller holding the header and every row, so the axis
      // and the blocks under it cannot scroll out of alignment.
      const scroller = el(
        "div",
        "zen-overflow-x-auto zen-rounded-zen-md zen-border zen-border-zen-border",
      );
      const inner = el("div", "zen-min-w-[45rem]");

      const head = el("div", "zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted/30");
      head.append(
        el(
          "div",
          "zen-w-40 zen-shrink-0 zen-border-e zen-border-zen-border zen-px-3 zen-py-2 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
          "Resource",
        ),
      );
      const headCols = el("div", "zen-flex zen-flex-1");
      for (const column of columns) {
        const cell = el(
          "div",
          cn(
            "zen-flex-1 zen-border-e zen-border-zen-border zen-px-1 zen-py-2 zen-text-center last:zen-border-e-0",
            column.nonWorking && "zen-bg-zen-muted/40",
            column.today && "zen-bg-zen-primary-soft",
          ),
        );
        cell.append(el("div", "zen-text-xs zen-font-medium zen-text-zen-foreground", column.label));
        if (column.sublabel) {
          cell.append(el("div", "zen-text-[10px] zen-text-zen-muted-fg", column.sublabel));
        }
        headCols.append(cell);
      }
      head.append(headCols);
      inner.append(head);

      for (const entry of laidOut) {
        const rowEl = el("div", "zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0");

        const label = el(
          "div",
          "zen-w-40 zen-shrink-0 zen-border-e zen-border-zen-border zen-px-3 zen-py-2",
        );
        label.append(
          el("div", "zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground", entry.row.title),
        );
        if (entry.row.subtitle) {
          label.append(el("div", "zen-truncate zen-text-xs zen-text-zen-muted-fg", entry.row.subtitle));
        }
        rowEl.append(label);

        const track = el("div", "zen-relative zen-flex-1");
        track.style.minHeight = `${entry.laneCount * LANE_PX + 8}px`;

        // The column rules as a background layer rather than as parents of the
        // blocks: a block spanning four hours cannot live inside one column.
        const rules = el("div", "zen-absolute zen-inset-0 zen-flex");
        rules.setAttribute("aria-hidden", "true");
        for (const column of columns) {
          rules.append(
            el(
              "div",
              cn(
                "zen-flex-1 zen-border-e zen-border-zen-border last:zen-border-e-0",
                column.nonWorking && "zen-bg-zen-muted/30",
                column.today && "zen-bg-zen-primary-soft/40",
              ),
            ),
          );
        }
        track.append(rules);

        if (marker !== null) {
          const line = el("div", "zen-absolute zen-top-0 zen-bottom-0 zen-w-px zen-bg-zen-error");
          line.setAttribute("aria-hidden", "true");
          line.style.setProperty("inset-inline-start", `${marker}%`);
          track.append(line);
        }

        for (const block of entry.blocks) {
          /* A real <button> whether or not a handler was passed: these are the
             only things in the grid worth reaching by keyboard, and a div with
             no tabindex takes the whole calendar out of the tab order. */
          const button = document.createElement("button");
          button.type = "button";
          button.className = cn(
            "zen-absolute zen-flex zen-items-center zen-gap-1 zen-overflow-hidden zen-rounded-zen-sm zen-border zen-px-1.5 zen-text-start zen-text-xs",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            BLOCK_CLASS[block.appointment.state ?? "default"],
            // Square off the cut edge so a block continuing past the view does
            // not look like it ends there.
            block.placement.clippedStart && "zen-rounded-s-none zen-border-s-0",
            block.placement.clippedEnd && "zen-rounded-e-none zen-border-e-0",
            current.onAppointmentClick && "hover:zen-brightness-95",
          );
          button.style.setProperty("inset-inline-start", `${block.placement.startPct}%`);
          button.style.width = `${block.placement.widthPct}%`;
          button.style.top = `${block.lane * LANE_PX + 4}px`;
          button.style.height = `${LANE_PX - 6}px`;
          const time = formatTimeRange(block.appointment.start, block.appointment.end);
          button.title = `${block.appointment.title} · ${time}`;

          // The time is in the accessible name, not only the title attribute: a
          // block narrow enough to drop its own label is exactly when someone
          // needs it, and title is not reliably announced.
          button.append(el("span", "zen-sr-only", time));

          if (block.placement.widthPct >= TEXT_MIN_WIDTH_PCT) {
            if (block.appointment.icon) {
              button.append(keep(Icon({ name: block.appointment.icon, size: 12, class: "zen-shrink-0" })).el);
            }
            button.append(el("span", "zen-truncate zen-font-medium", block.appointment.title));
            if (block.appointment.subtitle) {
              button.append(el("span", "zen-truncate zen-opacity-70", block.appointment.subtitle));
            }
          }

          const handler = current.onAppointmentClick;
          if (handler) {
            const onClick = () => handler(block.appointment, entry.row);
            button.addEventListener("click", onClick);
            /* Its own cleanup: this listener is on a node the factory built,
               not on a Button handle, so nothing else would release it. */
            const node = button;
            blockCleanups.push(() => node.removeEventListener("click", onClick));
          }

          track.append(button);
        }

        rowEl.append(track);
        inner.append(rowEl);
      }

      scroller.append(inner);
      root.append(scroller);
    }

    removeProps?.();
    removeProps = applyProps(root, rest as Record<string, unknown>);
  }

  render();
  disposer.add(() => removeProps?.());
  disposer.add(() => {
    for (const comp of owned) comp.destroy();
    owned = [];
    for (const off of blockCleanups) off();
    blockCleanups = [];
  });

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      root.remove();
    },
  };
}

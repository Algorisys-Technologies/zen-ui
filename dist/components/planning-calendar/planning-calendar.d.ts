import { type JSX } from "solid-js";
import type { IconName } from "@algorisys/zen-ui-core/icons";
import { type PlanningView } from "@algorisys/zen-ui-core";
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
export type PlanningAppointmentState = "default" | "info" | "success" | "warning" | "error";
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
export declare const PlanningCalendar: (props: PlanningCalendarProps) => JSX.Element;
//# sourceMappingURL=planning-calendar.d.ts.map
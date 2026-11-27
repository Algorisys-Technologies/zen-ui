import * as React from "react";
/**
 * ScheduleBacklog — the work not yet on the schedule, ready to be placed.
 *
 *   <ScheduleBacklog
 *     items={unscheduled} resources={workCentres}
 *     onPlace={({ operationId, resourceId, start }) =>
 *       propose(productionPlaceProposal(ops, deps, find(operationId), {
 *         resourceId, start: start ?? productionNextFreeStart(ops, resourceId, new Date()),
 *       }))}
 *   />
 *   <ProductionSchedule … onPlace={sameHandler} />
 *
 * Each job can be dragged onto a work centre in a ProductionSchedule with
 * `onPlace`, AND placed from its Place button — choose a work centre and it
 * goes after that centre's last job. The button is not a nicety: drag and drop
 * does not exist on a touch screen or from a keyboard. Both paths report the
 * same shape; `start` is absent for "at the end".
 *
 * Overdue work sorts first, then by due date, then as given.
 */
export interface BacklogItem {
    id: string;
    name: string;
    order?: string;
    /** Run time in working minutes, shown as a duration. */
    runMinutes?: number;
    due?: Date;
}
export type ScheduleBacklogProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
    items: BacklogItem[];
    /** Work centres the Place button offers — leaves only, as the chart accepts. */
    resources: {
        id: string;
        name: string;
    }[];
    onPlace: (at: {
        operationId: string;
        resourceId: string;
        start?: Date;
    }) => void;
    /** Pins the clock for the overdue test, in tests and screenshots. */
    now?: Date | number;
    timeZone?: string;
};
export declare const ScheduleBacklog: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
    items: BacklogItem[];
    /** Work centres the Place button offers — leaves only, as the chart accepts. */
    resources: {
        id: string;
        name: string;
    }[];
    onPlace: (at: {
        operationId: string;
        resourceId: string;
        start?: Date;
    }) => void;
    /** Pins the clock for the overdue test, in tests and screenshots. */
    now?: Date | number;
    timeZone?: string;
} & React.RefAttributes<HTMLElement>>;
//# sourceMappingURL=schedule-backlog.d.ts.map
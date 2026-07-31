import {
  ProductionSchedule,
  type ProductionOperation,
  type ProductionResource,
  type ProductionScheduleProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";
import { reviveCalendar } from "./gantt";

/**
 * <zen-production-schedule resources='[…]' operations='[…]'>
 *
 * Same argument as <zen-gantt>: JSON has no date type, so the ISO strings a
 * markup author writes have to become Dates before any working-time arithmetic
 * sees them. Three shapes need it here rather than one — the resource tree
 * (recursive, and each node may carry its own `calendar`), the operations
 * (`start` and `end`), and `until`, the date float is measured against.
 *
 * An operation is the one place where a missing date is NORMAL and must survive
 * as `undefined`: a booking states either an `end` or a `runMinutes`, and
 * turning the absent one into `Invalid Date` would make the placement silently
 * unresolvable. `new Date(undefined)` is exactly that trap.
 *
 * Rescheduling comes through as `zen-reschedule`, whose detail is the proposal.
 * It PROPOSES and never applies — the element re-renders when you set
 * `operations` again, and not before, which is what keeps undo the caller's.
 * `canReschedule` is a function, so it is a property only; there is no attribute
 * form and there should not be one.
 *
 * No slot: the schedule comes from `resources` and `operations`.
 */

type RawResource = Omit<ProductionResource, "children" | "calendar"> & {
  children?: RawResource[];
  calendar?: unknown;
};
type RawOperation = Omit<ProductionOperation, "start" | "end"> & {
  start: string | Date;
  end?: string | Date;
};

const asDate = (value: string | Date | undefined): Date | undefined =>
  value === undefined || value === null ? undefined : value instanceof Date ? value : new Date(value);

const reviveResources = (resources: RawResource[] | undefined): ProductionResource[] =>
  (resources ?? []).map((resource) => ({
    ...resource,
    calendar: reviveCalendar(resource.calendar as never),
    // Depth-first: a cell's machines are where the work actually is.
    children: resource.children ? reviveResources(resource.children) : undefined,
  })) as ProductionResource[];

const reviveOperations = (operations: RawOperation[] | undefined): ProductionOperation[] =>
  (operations ?? []).map((operation) => ({
    ...operation,
    start: asDate(operation.start)!,
    /* Left undefined rather than made Invalid: an operation states its end OR
       its runMinutes, and the absent one is the normal case. */
    end: asDate(operation.end),
  })) as ProductionOperation[];

defineZenElement<ProductionScheduleProps>({
  tag: "zen-production-schedule",
  factory: (props) =>
    ProductionSchedule({
      ...props,
      resources: reviveResources(props.resources as unknown as RawResource[]),
      operations: reviveOperations(props.operations as unknown as RawOperation[]),
      calendar: reviveCalendar(props.calendar as never),
      date: asDate(props.date as unknown as string | Date | undefined),
      defaultDate: asDate(props.defaultDate as unknown as string | Date | undefined),
      now: asDate(props.now as unknown as string | Date | undefined),
      until: asDate(props.until as unknown as string | Date | undefined),
    }),
  attrs: {
    resources: "json",
    operations: "json",
    dependencies: "json",
    calendar: "json",
    "hour-step": "number",
    "setup-matrix": "json",
    view: "string",
    "default-view": "string",
    views: "json",
    date: "string",
    "default-date": "string",
    expanded: "json",
    "default-expanded": "json",
    "max-lanes": "number",
    "show-critical-path": "boolean",
    until: "string",
    now: "string",
    "column-width": "number",
    "hide-toolbar": "boolean",
    columns: "json",
    loading: "boolean",
    "loading-rows": "number",
  },
  /* `showDependencies` and `showLoad` are PROPERTIES rather than attributes,
     because both default to TRUE and an ABSENT boolean attribute coerces to
     `false` (see lib/define.ts, and the note in ./gantt.ts). Declared as
     attributes they switched the load strip off on all eight charts, which is
     how this was found — the DOM harness caught it, not a build. */
  props: [
    "resources",
    "operations",
    "dependencies",
    "showDependencies",
    "showLoad",
    "calendar",
    "setupMatrix",
    "views",
    "date",
    "defaultDate",
    "expanded",
    "defaultExpanded",
    "until",
    "now",
    "columns",
    "canReschedule",
    "emptyState",
  ],
  events: {
    onOperationClick: "zen-operation-click",
    onReschedule: "zen-reschedule",
    onViewChange: "zen-view-change",
    onDateChange: "zen-date-change",
    onExpandedChange: "zen-expanded-change",
  },
  childrenProp: false,
});

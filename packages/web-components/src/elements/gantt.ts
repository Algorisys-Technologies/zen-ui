import { Gantt, type GanttProps, type GanttTask } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-gantt tasks='[…]'>
 *
 * `tasks` is json AND a property, and the json attribute is real here despite
 * the Dates inside it: JSON has no date type, so a markup author writes ISO
 * strings and those must be revived before the working-time maths sees them.
 * Without that every bar lands at `Invalid Date` and the chart draws an empty
 * axis over the right number of rows — which looks like a data problem rather
 * than a parsing one, and is the reason this is done here rather than left to
 * the caller.
 *
 * THE TASK TREE IS RECURSIVE, and that is the one thing this revival has to get
 * right that PlanningCalendar's does not: a task carries `children`, so a
 * shallow pass over the top level would revive the phases and leave every leaf
 * broken. `calendar` needs the same treatment one level down — its `exceptions`
 * carry a `date` each.
 *
 * `date`, `default-date` and `now` are strings for the same reason. `view` /
 * `default-view` are plain enums, and `views` a json array of them.
 *
 * onTaskClick becomes `zen-task-click`, whose detail is the pair [task, row] —
 * a CustomEvent carries one payload, and the row is half the answer to "what
 * did I just click".
 *
 * No slot: the plan comes from `tasks`.
 */

type RawTask = Omit<GanttTask, "start" | "end" | "baselineStart" | "baselineEnd" | "children"> & {
  start?: string | Date;
  end?: string | Date;
  baselineStart?: string | Date;
  baselineEnd?: string | Date;
  children?: RawTask[];
};

/**
 * Turn the ISO strings a json attribute can carry back into Dates.
 *
 * Tolerant of a caller who set the PROPERTY with real Dates already — that is
 * the other half of this element's API and must not be corrupted by passing
 * through here. `undefined` survives as `undefined`, because a task with no
 * dates is a rolled-up parent rather than a broken one.
 */
const asDate = (value: string | Date | undefined): Date | undefined =>
  value === undefined || value === null ? undefined : value instanceof Date ? value : new Date(value);

const reviveTasks = (tasks: RawTask[] | undefined): GanttTask[] =>
  (tasks ?? []).map((task) => ({
    ...task,
    start: asDate(task.start),
    end: asDate(task.end),
    baselineStart: asDate(task.baselineStart),
    baselineEnd: asDate(task.baselineEnd),
    // Depth-first, because a shallow pass would leave every leaf at Invalid Date.
    children: task.children ? reviveTasks(task.children) : undefined,
  })) as GanttTask[];

/** A calendar's exceptions carry a date each, one level below the calendar. */
export const reviveCalendar = <C extends { exceptions?: Array<{ date: string | Date }> } | undefined>(
  calendar: C,
): C =>
  calendar === undefined || calendar === null || !calendar.exceptions
    ? calendar
    : ({
        ...calendar,
        exceptions: calendar.exceptions.map((exception) => ({
          ...exception,
          date: asDate(exception.date)!,
        })),
      } as C);

defineZenElement<GanttProps>({
  tag: "zen-gantt",
  factory: (props) =>
    Gantt({
      ...props,
      tasks: reviveTasks(props.tasks as unknown as RawTask[]),
      calendar: reviveCalendar(props.calendar as never),
      // Same treatment, same reason: an attribute can only hand over a string.
      date: asDate(props.date as unknown as string | Date | undefined),
      defaultDate: asDate(props.defaultDate as unknown as string | Date | undefined),
      now: asDate(props.now as unknown as string | Date | undefined),
    }),
  attrs: {
    tasks: "json",
    dependencies: "json",
    calendar: "json",
    "hour-step": "number",
    view: "string",
    "default-view": "string",
    views: "json",
    date: "string",
    "default-date": "string",
    expanded: "json",
    "default-expanded": "json",
    now: "string",
    "column-width": "number",
    "hide-toolbar": "boolean",
    columns: "json",
    loading: "boolean",
    "loading-rows": "number",
  },
  /* `showDependencies` is a PROPERTY rather than an attribute, and the rule it
     follows is lib/define.ts's: an ABSENT boolean attribute coerces to `false`,
     so that removing one resets the prop rather than leaving the old value
     merged in. That is right for a flag defaulting to false and wrong for one
     defaulting to TRUE — declared as an attribute, `show-dependencies` would
     switch the routing layer off on every element that did not opt back in.
     Its sibling `showLoad` on <zen-production-schedule> is the same case, and
     it is where I actually found this: the load strip was missing from all
     eight charts. Every other boolean attribute in this directory defaults to
     false, so these two are the whole exception. */
  props: [
    "tasks",
    "dependencies",
    "showDependencies",
    "calendar",
    "views",
    "date",
    "defaultDate",
    "expanded",
    "defaultExpanded",
    "now",
    "columns",
    "emptyState",
  ],
  events: {
    onTaskClick: "zen-task-click",
    onViewChange: "zen-view-change",
    onDateChange: "zen-date-change",
    onExpandedChange: "zen-expanded-change",
  },
  childrenProp: false,
});

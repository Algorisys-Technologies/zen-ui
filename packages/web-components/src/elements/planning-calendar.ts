import { PlanningCalendar, type PlanningCalendarProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-planning-calendar rows='[…]'>
 *
 * `rows` is json AND a property. The json attribute is real here despite the
 * Dates inside it — JSON has no date type, so a markup author writes ISO
 * strings, and those must be revived before the maths sees them. That is what
 * `reviveRows` below is for; without it every appointment lands at `Invalid
 * Date` and the whole grid silently renders empty.
 *
 * `default-date` and `now` are strings for the same reason. `view` /
 * `default-view` are plain enums.
 *
 * onAppointmentClick becomes `zen-appointment-click`, whose detail is the pair
 * [appointment, row] — a CustomEvent carries one payload, and the row is half
 * the answer to "what did I just click".
 *
 * No slot: the plan comes from `rows`.
 */

type RawAppointment = Omit<PlanningCalendarProps["rows"][number]["appointments"][number], "start" | "end"> & {
  start: string | Date;
  end: string | Date;
};
type RawRow = Omit<PlanningCalendarProps["rows"][number], "appointments"> & {
  appointments: RawAppointment[];
};

/**
 * Turn the ISO strings a json attribute can carry back into Dates.
 *
 * Tolerant of a caller who set the PROPERTY with real Dates already — that is
 * the other half of this element's API and must not be corrupted by passing
 * through here.
 */
const asDate = (value: string | Date): Date => (value instanceof Date ? value : new Date(value));

const reviveRows = (rows: RawRow[] | undefined): PlanningCalendarProps["rows"] =>
  (rows ?? []).map((row) => ({
    ...row,
    appointments: (row.appointments ?? []).map((appointment) => ({
      ...appointment,
      start: asDate(appointment.start),
      end: asDate(appointment.end),
    })),
  }));

defineZenElement<PlanningCalendarProps>({
  tag: "zen-planning-calendar",
  factory: (props) =>
    PlanningCalendar({
      ...props,
      rows: reviveRows(props.rows as unknown as RawRow[]),
      // Same treatment, same reason: an attribute can only hand over a string.
      date: props.date ? asDate(props.date as unknown as string | Date) : undefined,
      defaultDate: props.defaultDate
        ? asDate(props.defaultDate as unknown as string | Date)
        : undefined,
      now: props.now ? asDate(props.now as unknown as string | Date) : undefined,
    }),
  attrs: {
    rows: "json",
    view: "string",
    "default-view": "string",
    views: "json",
    date: "string",
    "default-date": "string",
    now: "string",
    "hide-toolbar": "boolean",
    "empty-message": "string",
  },
  props: ["rows", "views", "date", "defaultDate", "now", "emptyMessage"],
  events: { onAppointmentClick: "zen-appointment-click" },
  childrenProp: false,
});

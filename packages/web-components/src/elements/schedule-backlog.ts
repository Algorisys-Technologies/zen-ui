import { ScheduleBacklog, type BacklogItem, type ScheduleBacklogProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-schedule-backlog items='[…]' resources='[{"id":"cnc3","name":"CNC-3"}]'>
 *
 * The work not yet on a <zen-production-schedule>, ready to be placed: drag a
 * job onto a work centre there, or use its Place button. Both report through
 * `zen-place` (detail: `{ operationId, resourceId, start }`, `start` absent
 * for "at the end"), the same event and shape the chart fires for a drop — so
 * one listener can serve both. It proposes: an item stays listed until you set
 * `items` again without it.
 *
 * Dates: `due` on each item, and `now`, arrive from a json attribute as ISO
 * strings and are revived into Dates here, as <zen-gantt> does — the overdue
 * test compares times, and a string compares to nothing. An item with no `due`
 * keeps none: undefined is "nobody said when", and `new Date(undefined)` would
 * be an Invalid Date that sorts as nothing at all.
 *
 * `onPlace` is required by the factory, which calls it unguarded from the
 * Place button; with nobody listening the element passes a no-op, so pressing
 * Place on an unwired backlog does nothing rather than throw.
 */

type RawItem = Omit<BacklogItem, "due"> & { due?: string | Date };

const asDate = (value: string | number | Date | undefined): Date | undefined =>
  value === undefined || value === null ? undefined : value instanceof Date ? value : new Date(value);

const reviveItems = (items: RawItem[] | undefined): BacklogItem[] =>
  (items ?? []).map((item) => ({ ...item, due: asDate(item.due) }));

const noop = (): void => {};

/** Everything the factory needs in its own types, from whatever an attribute or property gave. */
const revive = (props: ScheduleBacklogProps): ScheduleBacklogProps => ({
  ...props,
  items: reviveItems(props.items as unknown as RawItem[]),
  resources: props.resources ?? [],
  onPlace: props.onPlace ?? noop,
  // A number is already a time; only a string needs reading.
  now: typeof props.now === "number" ? props.now : asDate(props.now as unknown as string | Date | undefined),
});

defineZenElement<ScheduleBacklogProps>({
  tag: "zen-schedule-backlog",
  /* The revival wraps update() as well as the first build: define.ts sends
     every later change straight to the handle's update(), so a factory-only
     revival would read `items` set as an attribute AFTER connect as strings. */
  factory: (props) => {
    const handle = ScheduleBacklog(revive(props));
    const update = handle.update.bind(handle);
    handle.update = (next) => update(revive(next as ScheduleBacklogProps));
    return handle;
  },
  attrs: {
    items: "json",
    resources: "json",
    now: "string",
    "time-zone": "string",
  },
  props: ["items", "resources", "now"],
  events: { onPlace: "zen-place" },
  childrenProp: false,
});

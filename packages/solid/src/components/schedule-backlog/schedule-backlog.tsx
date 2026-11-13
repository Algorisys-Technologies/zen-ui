import { type JSX, For, Show, createMemo, createSignal, splitProps } from "solid-js";
import { PRODUCTION_DRAG_TYPE, durationMessage } from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";
import { NativeSelect } from "../form/native-select/native-select";
import { Button } from "../button/button";

/**
 * ScheduleBacklog — the work not yet on the schedule, ready to be placed.
 *
 *   <ScheduleBacklog
 *     items={unscheduled()} resources={workCentres}
 *     onPlace={({ operationId, resourceId, start }) =>
 *       propose(productionPlaceProposal(ops(), deps, find(operationId), {
 *         resourceId, start: start ?? productionNextFreeStart(ops(), resourceId, new Date()),
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

export type ScheduleBacklogProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> & {
  items: BacklogItem[];
  /** Work centres the Place button offers — leaves only, as the chart accepts. */
  resources: { id: string; name: string }[];
  onPlace: (at: { operationId: string; resourceId: string; start?: Date }) => void;
  /** Pins the clock for the overdue test, in tests and screenshots. */
  now?: Date | number;
  timeZone?: string;
};

export const ScheduleBacklog = (props: ScheduleBacklogProps) => {
  const [local, rest] = splitProps(props, ["items", "resources", "onPlace", "now", "timeZone", "class"]);
  const loc = useLocale();
  const now = () => +(local.now ?? Date.now());
  const overdue = (i: BacklogItem) => !!i.due && i.due.getTime() < now();
  const sorted = createMemo(() => {
    const t = now(); // read once: the comparator below is plain arithmetic
    const late = (i: BacklogItem) => Number(!!i.due && i.due.getTime() < t);
    return local.items
      .map((item, index) => ({ item, index }))
      .sort(
        (a, b) =>
          late(b.item) - late(a.item) ||
          (a.item.due?.getTime() ?? Infinity) - (b.item.due?.getTime() ?? Infinity) ||
          a.index - b.index,
      )
      .map((x) => x.item);
  });
  const [placing, setPlacing] = createSignal<string>();
  const [target, setTarget] = createSignal("");
  const dateText = (d: Date) =>
    new Intl.DateTimeFormat(loc.locale(), { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: local.timeZone }).format(d);
  const run = (min: number) => {
    const d = durationMessage(min * 60_000);
    return loc.t(d.key, d.values);
  };

  return (
    <section class={cn("zen-flex zen-flex-col zen-gap-2", local.class)} aria-label={loc.t("scheduleBacklog.label")} {...rest}>
      <div class="zen-flex zen-flex-col zen-gap-0.5">
        <h3 class="zen-m-0 zen-text-sm zen-font-semibold zen-text-zen-foreground">{loc.t("scheduleBacklog.label")}</h3>
        <Show when={local.items.length} fallback={<span class="zen-text-xs zen-text-zen-muted-fg">{loc.t("scheduleBacklog.empty")}</span>}>
          <span class="zen-text-xs zen-text-zen-foreground">{loc.t("scheduleBacklog.count", { count: local.items.length })}</span>
          <span class="zen-text-xs zen-text-zen-muted-fg">{loc.t("scheduleBacklog.hint")}</span>
        </Show>
      </div>
      <ul class="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0">
        <For each={sorted()}>
          {(item) => (
            <li
              draggable={true}
              data-backlog-item={item.id}
              class={cn(
                "zen-flex zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-p-3 zen-cursor-grab active:zen-cursor-grabbing",
                overdue(item) ? "zen-border-zen-error" : "zen-border-zen-border",
              )}
              onDragStart={(e) => {
                e.dataTransfer?.setData(PRODUCTION_DRAG_TYPE, item.id);
                e.dataTransfer?.setData("text/plain", item.name);
                if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
              }}
            >
              <div class="zen-flex zen-items-start zen-justify-between zen-gap-2">
                <div class="zen-flex zen-min-w-0 zen-flex-col">
                  <span class="zen-text-sm zen-font-medium zen-text-zen-foreground">{item.name}</span>
                  <span class="zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">
                    {[item.order, item.runMinutes ? run(item.runMinutes) : null].filter(Boolean).join(" · ")}
                  </span>
                  <Show when={item.due}>
                    {(due) => (
                      <span class={cn("zen-text-xs zen-tabular-nums", overdue(item) ? "zen-font-medium zen-text-zen-error" : "zen-text-zen-foreground")}>
                        {overdue(item) ? `${loc.t("scheduleBacklog.overdue")} · ` : ""}
                        {loc.t("scheduleBacklog.due", { date: dateText(due()) })}
                      </span>
                    )}
                  </Show>
                </div>
                <Show when={placing() !== item.id}>
                  {/* Default size, not sm: this button IS the touch and keyboard
                      path, so it follows density up to 48px. */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPlacing(item.id);
                      setTarget("");
                    }}
                  >
                    {loc.t("scheduleBacklog.place")}
                  </Button>
                </Show>
              </div>
              <Show when={placing() === item.id}>
                <div class="zen-flex zen-flex-wrap zen-items-end zen-gap-2">
                  <label class="zen-flex zen-flex-col zen-gap-1 zen-text-xs zen-font-medium zen-text-zen-muted-fg">
                    {loc.t("scheduleBacklog.placeOn")}
                    <NativeSelect class="zen-min-w-40" value={target()} onChange={(e) => setTarget(e.currentTarget.value)}>
                      <option value="" disabled>—</option>
                      <For each={local.resources}>
                        {(r) => <option value={r.id}>{r.name}</option>}
                      </For>
                    </NativeSelect>
                  </label>
                  <Button
                    disabled={!target()}
                    onClick={() => {
                      local.onPlace({ operationId: item.id, resourceId: target() });
                      setPlacing(undefined);
                    }}
                  >
                    {loc.t("scheduleBacklog.placeAtEnd")}
                  </Button>
                  <Button variant="ghost" onClick={() => setPlacing(undefined)}>
                    {loc.t("scheduleBacklog.cancel")}
                  </Button>
                </div>
              </Show>
            </li>
          )}
        </For>
      </ul>
    </section>
  );
};

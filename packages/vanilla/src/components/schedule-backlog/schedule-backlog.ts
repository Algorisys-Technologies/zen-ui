import { PRODUCTION_DRAG_TYPE, durationMessage } from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type AnyZenComponent, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale, withLocale } from "../locale/locale";
import { NativeSelect } from "../form/native-select/native-select";
import { Button } from "../button/button";

/**
 * ScheduleBacklog — the work not yet on the schedule, ready to be placed.
 *
 *   const backlog = ScheduleBacklog({
 *     items: unscheduled, resources: workCentres,
 *     onPlace: ({ operationId, resourceId, start }) =>
 *       propose(productionPlaceProposal(ops, deps, find(operationId), {
 *         resourceId, start: start ?? productionNextFreeStart(ops, resourceId, new Date()),
 *       })),
 *   });
 *   ProductionSchedule({ …, onPlace: sameHandler });
 *
 * Each job can be dragged onto a work centre in a ProductionSchedule with
 * `onPlace`, AND placed from its Place button — choose a work centre and it
 * goes after that centre's last job. The button is not a nicety: drag and drop
 * does not exist on a touch screen or from a keyboard. Both paths report the
 * same shape; `start` is absent for "at the end".
 *
 * Overdue work sorts first, then by due date, then as given. Like the chart it
 * feeds, it proposes and never applies: placing an item does not remove it —
 * the caller passes the new `items` through `update()`.
 */

export interface BacklogItem {
  id: string;
  name: string;
  order?: string;
  /** Run time in working minutes, shown as a duration. */
  runMinutes?: number;
  due?: Date;
}

export interface ScheduleBacklogProps extends Omit<BaseProps, "children"> {
  items: BacklogItem[];
  /** Work centres the Place button offers — leaves only, as the chart accepts. */
  resources: { id: string; name: string }[];
  onPlace: (at: { operationId: string; resourceId: string; start?: Date }) => void;
  /** Pins the clock for the overdue test, in tests and screenshots. */
  now?: Date | number;
  timeZone?: string;
}

const node = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
};

export function ScheduleBacklog(props: ScheduleBacklogProps): ZenComponent<ScheduleBacklogProps> {
  let current: ScheduleBacklogProps = { ...props };
  const loc = useLocale();
  const root = document.createElement("section");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  let owned: AnyZenComponent[] = [];
  const keep = <T extends AnyZenComponent>(c: T): T => (owned.push(c), c);

  /** The item whose Place panel is open, and the work centre chosen in it. */
  let placing: string | undefined;
  let target = "";

  const dateText = (d: Date) =>
    new Intl.DateTimeFormat(loc.locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: current.timeZone,
    }).format(d);
  const run = (min: number) => {
    const d = durationMessage(min * 60_000);
    return loc.t(d.key, d.values);
  };

  const render = () => withLocale(loc, renderNow);
  function renderNow(): void {
    for (const c of owned) c.destroy();
    owned = [];
    const { items, resources, onPlace: _onPlace, now: nowProp, timeZone: _tz, class: className, ...rest } = current;
    const now = +(nowProp ?? Date.now());
    const overdue = (i: BacklogItem) => !!i.due && i.due.getTime() < now;
    const late = (i: BacklogItem) => Number(overdue(i));
    const sorted = items
      .map((item, index) => ({ item, index }))
      .sort(
        (a, b) =>
          late(b.item) - late(a.item) ||
          (a.item.due?.getTime() ?? Infinity) - (b.item.due?.getTime() ?? Infinity) ||
          a.index - b.index,
      )
      .map((x) => x.item);
    if (placing !== undefined && !items.some((i) => i.id === placing)) placing = undefined;

    root.className = cn("zen-flex zen-flex-col zen-gap-2", className);
    root.setAttribute("aria-label", loc.t("scheduleBacklog.label"));
    removeProps?.();
    removeProps = applyProps(root, rest as Record<string, unknown>);

    const head = node("div", "zen-flex zen-flex-col zen-gap-0.5");
    head.append(node("h3", "zen-m-0 zen-text-sm zen-font-semibold zen-text-zen-foreground", loc.t("scheduleBacklog.label")));
    if (items.length) {
      head.append(
        node("span", "zen-text-xs zen-text-zen-foreground", loc.t("scheduleBacklog.count", { count: items.length })),
        node("span", "zen-text-xs zen-text-zen-muted-fg", loc.t("scheduleBacklog.hint")),
      );
    } else {
      head.append(node("span", "zen-text-xs zen-text-zen-muted-fg", loc.t("scheduleBacklog.empty")));
    }

    const list = node("ul", "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0");
    for (const item of sorted) {
      const li = node(
        "li",
        cn(
          "zen-flex zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-p-3 zen-cursor-grab active:zen-cursor-grabbing",
          overdue(item) ? "zen-border-zen-error" : "zen-border-zen-border",
        ),
      );
      li.draggable = true;
      li.setAttribute("data-backlog-item", item.id);
      li.addEventListener("dragstart", (e) => {
        if (!e.dataTransfer) return;
        e.dataTransfer.setData(PRODUCTION_DRAG_TYPE, item.id);
        e.dataTransfer.setData("text/plain", item.name);
        e.dataTransfer.effectAllowed = "move";
      });

      const top = node("div", "zen-flex zen-items-start zen-justify-between zen-gap-2");
      const text = node("div", "zen-flex zen-min-w-0 zen-flex-col");
      text.append(
        node("span", "zen-text-sm zen-font-medium zen-text-zen-foreground", item.name),
        node(
          "span",
          "zen-text-xs zen-tabular-nums zen-text-zen-muted-fg",
          [item.order, item.runMinutes ? run(item.runMinutes) : null].filter(Boolean).join(" · "),
        ),
      );
      if (item.due) {
        text.append(
          node(
            "span",
            cn("zen-text-xs zen-tabular-nums", overdue(item) ? "zen-font-medium zen-text-zen-error" : "zen-text-zen-foreground"),
            (overdue(item) ? [loc.t("scheduleBacklog.overdue"), ""].join(" · ") : "") +
              loc.t("scheduleBacklog.due", { date: dateText(item.due) }),
          ),
        );
      }
      top.append(text);
      if (placing !== item.id) {
        /* Default size, not sm: this button IS the touch and keyboard path, so
           it follows density up to 48px. */
        top.append(
          keep(
            Button({
              variant: "outline",
              children: loc.t("scheduleBacklog.place"),
              onClick: () => {
                placing = item.id;
                target = "";
                render();
              },
            }),
          ).el,
        );
      }
      li.append(top);

      if (placing === item.id) {
        const row = node("div", "zen-flex zen-flex-wrap zen-items-end zen-gap-2");
        const label = node(
          "label",
          "zen-flex zen-flex-col zen-gap-1 zen-text-xs zen-font-medium zen-text-zen-muted-fg",
          loc.t("scheduleBacklog.placeOn"),
        );
        const confirm = keep(
          Button({
            disabled: !target,
            children: loc.t("scheduleBacklog.placeAtEnd"),
            onClick: () => {
              const resourceId = target;
              placing = undefined;
              render();
              current.onPlace({ operationId: item.id, resourceId });
            },
          }),
        );
        const select = keep(
          NativeSelect({
            class: "zen-min-w-40",
            value: target,
            options: [{ value: "", label: "—", disabled: true }, ...resources.map((r) => ({ value: r.id, label: r.name }))],
            /* Not a re-render: that would rebuild the select under the user. */
            onChange: (v) => {
              target = v;
              confirm.update({ disabled: !target });
            },
          }),
        );
        label.append(select.el);
        row.append(
          label,
          confirm.el,
          keep(
            Button({
              variant: "ghost",
              children: loc.t("scheduleBacklog.cancel"),
              onClick: () => {
                placing = undefined;
                render();
              },
            }),
          ).el,
        );
        li.append(row);
      }
      list.append(li);
    }
    root.replaceChildren(head, list);
  }

  render();
  disposer.add(() => removeProps?.());

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      for (const c of owned) c.destroy();
      owned = [];
      disposer.dispose();
      root.remove();
    },
  };
}

import { cn } from "../../../lib/cn";
import {
  Disposer,
  type Child,
  type ZenComponent,
} from "../../../lib/component";
import { controllable } from "../../../lib/state";
import { Button } from "../../button/button";
import { Popover } from "../../popover/popover";

/**
 * Calendar + DatePicker — the vanilla binding's port.
 *
 * React backs its Calendar with `react-day-picker` and its DatePicker with a
 * Radix Popover. There is no react-day-picker for a no-framework binding, so —
 * exactly as the Solid binding did — the calendar month-grid is written out:
 * single / multiple / range selection via `mode`, month navigation, disabled
 * days, and the same `--zen-*`-driven class strings React's day-picker theme
 * maps onto. The public API (prop names, exported names) mirrors React and
 * Solid; only the internals differ, because the dependency cannot be ported.
 *
 *   const cal = Calendar({ mode: "single", selected: date, onSelect: setDate });
 *   host.append(cal.el);
 *
 *   const picker = DatePicker({ value: date, onValueChange: setDate });
 *   host.append(picker.el);
 */

export type CalendarMode = "single" | "multiple" | "range";
export type DateRange = { from?: Date; to?: Date };

/** What a Calendar's `selected` holds, keyed off `mode`. */
export type CalendarSelected = Date | Date[] | DateRange;

export interface CalendarProps {
  /** "single" (default), "multiple", or "range". */
  mode?: CalendarMode;
  /** Date for "single", Date[] for "multiple", {from,to} for "range". */
  selected?: CalendarSelected;
  /** Fired with the next selection: Date|undefined, Date[], or DateRange|undefined. */
  onSelect?: (value: CalendarSelected | undefined) => void;
  /** Months shown side by side. Only honoured in "range" mode. Default 1. */
  numberOfMonths?: number;
  /** Disable every day (boolean true) or specific days (predicate). */
  disabled?: boolean | ((d: Date) => boolean);
  class?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const sameDay = (a: Date | undefined, b: Date | undefined): boolean =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const inRange = (d: Date, r: DateRange | undefined): boolean => {
  if (!r?.from) return false;
  if (!r.to) return sameDay(d, r.from);
  return d >= startOfDay(r.from) && d <= startOfDay(r.to);
};

const monthStart = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth() + n, 1);

/** Six weeks of Dates covering the month `anchor` falls in, Sunday-first. */
const monthMatrix = (anchor: Date): Date[][] => {
  const first = monthStart(anchor);
  const offset = first.getDay();
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d));
    }
    weeks.push(row);
  }
  return weeks;
};

/**
 * Our own trusted markup (never a caller's string — PORTING.md). Matches React's
 * inline CalendarIcon exactly.
 */
const CALENDAR_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

const calendarIcon = (): Node => {
  const t = document.createElement("template");
  t.innerHTML = CALENDAR_ICON;
  return t.content.firstChild!;
};

export function Calendar(props: CalendarProps): ZenComponent<CalendarProps> {
  let current: CalendarProps = { ...props };
  const root = document.createElement("div");
  const disposer = new Disposer();

  // The viewed month is UI state, not a prop: it survives update() so a caller
  // pushing a new `selected` does not yank the user back off the month they
  // navigated to. Seeded once from the initial selection.
  let viewMonth = initialView(current);

  function initialView(p: CalendarProps): Date {
    if (p.mode === "range") return (p.selected as DateRange | undefined)?.from ?? new Date();
    if (p.mode === "multiple") return (p.selected as Date[] | undefined)?.[0] ?? new Date();
    return (p.selected as Date | undefined) ?? new Date();
  }

  const disabledFn = (d: Date): boolean => {
    const fn = current.disabled;
    if (typeof fn === "function") return fn(d);
    if (fn === true) return true;
    return false;
  };

  const isSelected = (d: Date): boolean => {
    if (current.mode === "multiple") {
      return ((current.selected as Date[] | undefined) ?? []).some((s) => sameDay(s, d));
    }
    if (current.mode === "range") {
      return inRange(d, current.selected as DateRange | undefined);
    }
    return sameDay(d, current.selected as Date | undefined);
  };

  const isRangeEdge = (d: Date): "from" | "to" | false => {
    if (current.mode !== "range") return false;
    const sel = current.selected as DateRange | undefined;
    if (!sel) return false;
    if (sameDay(d, sel.from)) return "from";
    if (sameDay(d, sel.to)) return "to";
    return false;
  };

  const handleSelect = (d: Date): void => {
    if (disabledFn(d)) return;
    if (current.mode === "multiple") {
      const sel = (current.selected as Date[] | undefined) ?? [];
      const exists = sel.some((s) => sameDay(s, d));
      const next = exists ? sel.filter((s) => !sameDay(s, d)) : [...sel, d];
      current.onSelect?.(next);
    } else if (current.mode === "range") {
      const sel = current.selected as DateRange | undefined;
      if (!sel?.from || sel.to) {
        current.onSelect?.({ from: d, to: undefined });
      } else if (d < sel.from) {
        current.onSelect?.({ from: d, to: sel.from });
      } else {
        current.onSelect?.({ from: sel.from, to: d });
      }
    } else {
      const same = sameDay(d, current.selected as Date | undefined);
      current.onSelect?.(same ? undefined : d);
    }
  };

  const numberOfMonths = (): number =>
    current.mode === "range" ? current.numberOfMonths ?? 1 : 1;

  const navButton = (dir: -1 | 1): HTMLButtonElement => {
    const b = document.createElement("button");
    b.type = "button";
    b.className =
      "zen-h-7 zen-w-7 zen-inline-flex zen-items-center zen-justify-center zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer hover:zen-bg-zen-muted";
    b.setAttribute("aria-label", dir < 0 ? "Previous month" : "Next month");
    b.textContent = dir < 0 ? "‹" : "›";
    b.addEventListener("click", () => {
      viewMonth = addMonths(viewMonth, dir);
      render();
    });
    return b;
  };

  const dayButton = (d: Date, month: Date): HTMLTableCellElement => {
    const td = document.createElement("td");
    td.className = "zen-p-0";
    const btn = document.createElement("button");
    btn.type = "button";

    const isOutside = d.getMonth() !== month.getMonth();
    const isSel = isSelected(d);
    const isToday = sameDay(d, new Date());
    const edge = isRangeEdge(d);
    const isDisabled = disabledFn(d);

    btn.disabled = isDisabled;
    btn.setAttribute("aria-label", d.toDateString());
    btn.setAttribute("aria-pressed", String(isSel));
    btn.className = cn(
      "zen-h-8 zen-w-8 zen-inline-flex zen-items-center zen-justify-center zen-rounded-zen-sm",
      "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-sm zen-transition-colors",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      isOutside && "zen-text-zen-muted-fg zen-opacity-60",
      !isSel && !isOutside && "hover:zen-bg-zen-muted",
      isSel && current.mode !== "range" && "zen-bg-zen-primary zen-text-zen-primary-fg",
      isSel && current.mode === "range" && !edge && "zen-bg-zen-primary-soft",
      edge && "zen-bg-zen-primary zen-text-zen-primary-fg",
      isToday && !isSel && "zen-border zen-border-zen-border",
      isDisabled && "zen-opacity-30 zen-cursor-not-allowed",
    );
    btn.textContent = String(d.getDate());
    btn.addEventListener("click", () => handleSelect(d));
    td.append(btn);
    return td;
  };

  const monthEl = (monthOffset: number): HTMLElement => {
    const month = addMonths(viewMonth, monthOffset);
    const weeks = monthMatrix(month);
    const monthLabel = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });

    const col = document.createElement("div");

    if (monthOffset === 0) {
      const header = document.createElement("div");
      header.className = "zen-flex zen-items-center zen-justify-between zen-mb-2";
      const label = document.createElement("div");
      label.className = "zen-text-sm zen-font-medium";
      label.setAttribute("aria-live", "polite");
      label.textContent = monthLabel;
      header.append(navButton(-1), label, navButton(1));
      col.append(header);
    } else {
      const label = document.createElement("div");
      label.className = "zen-text-sm zen-font-medium zen-mb-2 zen-text-center";
      label.textContent = monthLabel;
      col.append(label);
    }

    const table = document.createElement("table");
    table.className = "zen-border-collapse zen-text-sm";

    const thead = document.createElement("thead");
    const hrow = document.createElement("tr");
    for (const wd of WEEKDAYS) {
      const th = document.createElement("th");
      th.className = "zen-h-8 zen-w-8 zen-text-xs zen-font-normal zen-text-zen-muted-fg";
      th.textContent = wd;
      hrow.append(th);
    }
    thead.append(hrow);

    const tbody = document.createElement("tbody");
    for (const week of weeks) {
      const tr = document.createElement("tr");
      for (const d of week) tr.append(dayButton(d, month));
      tbody.append(tr);
    }

    table.append(thead, tbody);
    col.append(table);
    return col;
  };

  function render(): void {
    root.className = cn("zen-p-3 zen-inline-block", current.class);
    const container = document.createElement("div");
    container.className = "zen-flex zen-gap-4";
    const n = numberOfMonths();
    for (let i = 0; i < n; i++) container.append(monthEl(i));
    // Day/nav buttons are recreated every render, so their listeners die with
    // the discarded nodes — nothing document-level is registered to leak.
    root.replaceChildren(container);
  }

  render();

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

/* ---------------------------- DatePicker ---------------------------- */

export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  /** `true` disables the trigger; a predicate disables individual days. */
  disabled?: boolean | ((d: Date) => boolean);
  class?: string;
  /** Format shown in the trigger. Defaults to `toLocaleDateString()`. */
  formatDate?: (date: Date) => string;
}

export function DatePicker(props: DatePickerProps): ZenComponent<DatePickerProps> {
  let current: DatePickerProps = { ...props };

  const state = controllable<Date | undefined>({
    value: current.value,
    defaultValue: current.defaultValue,
    onChange: (d) => current.onValueChange?.(d),
  });

  const fmt = (d: Date): string =>
    (current.formatDate ?? ((x: Date) => x.toLocaleDateString()))(d);

  const label = (): Child => {
    const d = state.get();
    return d ? fmt(d) : current.placeholder ?? "Pick a date";
  };

  const buttonClass = (): string =>
    cn(
      "zen-w-60 zen-justify-between zen-font-normal",
      !state.get() && "zen-text-zen-muted-fg",
      current.class,
    );

  const triggerDisabled = (): boolean | undefined =>
    typeof current.disabled === "boolean" ? current.disabled : undefined;

  const dayDisabled = (): ((d: Date) => boolean) | undefined =>
    typeof current.disabled === "function" ? current.disabled : undefined;

  const button = Button({
    variant: "outline",
    color: "neutral",
    disabled: triggerDisabled(),
    class: buttonClass(),
    iconLeft: calendarIcon(),
    children: label(),
  });

  const calendar = Calendar({
    mode: "single",
    selected: state.get(),
    onSelect: (d) => {
      state.set(d as Date | undefined);
      // A controlled caller has not changed `value` yet, so state.get() is stale
      // for one tick; refresh from what was just picked so the trigger tracks it
      // uncontrolled and mirrors React's `if (d) setOpen(false)`.
      if (d) popover.close();
    },
    disabled: dayDisabled(),
  });

  const refresh = (): void => {
    button.update({
      children: label(),
      class: buttonClass(),
      disabled: triggerDisabled(),
    });
    calendar.update({ selected: state.get(), disabled: dayDisabled() });
  };

  const popover = Popover({
    trigger: button,
    children: calendar,
    align: "start",
    class: "zen-w-auto zen-p-0",
  });

  const disposer = new Disposer();
  disposer.add(state.subscribe(() => refresh()));
  disposer.add(() => popover.destroy());
  disposer.add(() => button.destroy());
  disposer.add(() => calendar.destroy());

  return {
    el: popover.el,
    update(next) {
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);
      refresh();
    },
    destroy() {
      disposer.dispose();
    },
  };
}

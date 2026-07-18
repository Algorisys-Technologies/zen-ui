import { cn } from "../../../lib/cn";
import { Disposer, type ZenComponent } from "../../../lib/component";
import { controllable } from "../../../lib/state";
import { Button } from "../../button/button";
import { Popover } from "../../popover/popover";
import { Calendar, type CalendarSelected } from "./date-picker";
import { TimePicker } from "../time-picker/time-picker";

/**
 * DateTimePicker — the vanilla binding's port.
 *
 * React opens a Radix Popover from a Button; the panel stacks a Calendar above a
 * TimePicker. This port composes the vanilla Popover, Button, Calendar and
 * TimePicker to the same effect. The public API (prop names, exported names)
 * mirrors React; only the plumbing differs, because there is no Radix context to
 * thread the parts through — the compound tree becomes one factory that owns its
 * sub-parts, exactly as the vanilla DatePicker did.
 *
 *   const picker = DateTimePicker({ onValueChange: (d) => console.log(d) });
 *   host.append(picker.el);
 *
 * The trigger label combines the formatted date and time. Picking a day
 * preserves the current time-of-day; picking a time on an empty value defaults
 * the date to today. Pass `format="12h"` to display AM/PM in the time portion;
 * the emitted value is always a real `Date`.
 *
 * React's `disabled` accepts a boolean or a react-day-picker matcher. There is no
 * day-picker here, so — as the vanilla Calendar/DatePicker already do — a
 * function `disabled` is a per-day predicate (return true to disable a day) and a
 * boolean disables the whole control.
 */

type Format = "24h" | "12h";

export interface DateTimePickerProps {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  /** `true` disables the trigger; a predicate disables individual days. */
  disabled?: boolean | ((d: Date) => boolean);
  class?: string;
  /** "24h" (default) or "12h" — controls only the displayed time format. */
  format?: Format;
  /** Show seconds segment in the time picker. */
  showSeconds?: boolean;
  /** Minute stepping for ArrowUp/Down on the minutes segment. Default 1. */
  minuteStep?: number;
  /** Render the date portion of the trigger label. */
  formatDate?: (date: Date) => string;
  /** Render the time portion of the trigger label. */
  formatTime?: (date: Date, format: Format) => string;
}

export type DateTimePickerHandle = ZenComponent<DateTimePickerProps>;

const pad = (n: number) => n.toString().padStart(2, "0");

const dateToTimeString = (d: Date | undefined, showSeconds: boolean): string | undefined => {
  if (!d) return undefined;
  const base = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return showSeconds ? `${base}:${pad(d.getSeconds())}` : base;
};

const applyTimeString = (date: Date, time: string | undefined): Date => {
  if (!time) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const m = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(time);
  if (!m) return date;
  const d = new Date(date);
  d.setHours(Number(m[1]), Number(m[2]), m[3] ? Number(m[3]) : 0, 0);
  return d;
};

const defaultFormatDate = (d: Date) => d.toLocaleDateString();
const defaultFormatTime = (d: Date, format: Format) =>
  d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === "12h",
  });

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

export function DateTimePicker(props: DateTimePickerProps = {}): DateTimePickerHandle {
  let current: DateTimePickerProps = { ...props };

  const state = controllable<Date | undefined>({
    value: current.value,
    defaultValue: current.defaultValue,
    onChange: (d) => current.onValueChange?.(d),
  });

  const format = (): Format => current.format ?? "24h";
  const showSeconds = () => Boolean(current.showSeconds);

  const triggerDisabled = (): boolean | undefined =>
    typeof current.disabled === "boolean" ? current.disabled : undefined;

  const dayDisabled = (): ((d: Date) => boolean) | undefined =>
    typeof current.disabled === "function" ? current.disabled : undefined;

  const fmtDate = (d: Date): string => (current.formatDate ?? defaultFormatDate)(d);
  const fmtTime = (d: Date): string => (current.formatTime ?? defaultFormatTime)(d, format());

  const triggerLabel = (): string => {
    const d = state.get();
    return d ? `${fmtDate(d)} ${fmtTime(d)}` : current.placeholder ?? "Pick date & time";
  };

  const buttonClass = (): string =>
    cn(
      "zen-w-72 zen-justify-between zen-font-normal",
      !state.get() && "zen-text-zen-muted-fg",
      current.class,
    );

  // Picking a day keeps the current time-of-day; an empty value starts at
  // midnight on the chosen day. Mirrors React's onDaySelect.
  const onDaySelect = (value: CalendarSelected | undefined): void => {
    const d = value as Date | undefined;
    if (!d) {
      state.set(undefined);
      return;
    }
    const prior = state.get();
    const next = new Date(d);
    if (prior) {
      next.setHours(
        prior.getHours(),
        prior.getMinutes(),
        prior.getSeconds(),
        prior.getMilliseconds(),
      );
    } else {
      next.setHours(0, 0, 0, 0);
    }
    state.set(next);
  };

  // Picking a time on an empty value defaults the date to today.
  const onTimeChange = (t: string | undefined): void => {
    const base = state.get() ?? new Date();
    state.set(applyTimeString(base, t));
  };

  const button = Button({
    variant: "outline",
    color: "neutral",
    disabled: triggerDisabled(),
    class: buttonClass(),
    iconLeft: calendarIcon(),
    children: triggerLabel(),
  });

  const calendar = Calendar({
    mode: "single",
    selected: state.get(),
    onSelect: onDaySelect,
    disabled: dayDisabled(),
  });

  const timePicker = TimePicker({
    value: dateToTimeString(state.get(), showSeconds()),
    onValueChange: onTimeChange,
    format: format(),
    showSeconds: showSeconds(),
    minuteStep: current.minuteStep ?? 1,
    disabled: triggerDisabled(),
  });

  // The Calendar sits above a bordered Time row, exactly as React's PopoverContent.
  const timeRow = document.createElement("div");
  timeRow.className =
    "zen-flex zen-items-center zen-justify-between zen-gap-3 zen-border-t zen-border-zen-border zen-px-3 zen-py-2.5";
  const timeLabel = document.createElement("label");
  timeLabel.className = "zen-text-xs zen-text-zen-muted-fg";
  timeLabel.textContent = "Time";
  timeRow.append(timeLabel, timePicker.el);

  const popover = Popover({
    trigger: button,
    children: [calendar, timeRow],
    align: "start",
    class: "zen-w-auto zen-p-0",
  });

  const refresh = (): void => {
    button.update({
      children: triggerLabel(),
      class: buttonClass(),
      disabled: triggerDisabled(),
    });
    calendar.update({ selected: state.get(), disabled: dayDisabled() });
    timePicker.update({
      value: dateToTimeString(state.get(), showSeconds()),
      format: format(),
      showSeconds: showSeconds(),
      minuteStep: current.minuteStep ?? 1,
      disabled: triggerDisabled(),
    });
  };

  const disposer = new Disposer();
  disposer.add(state.subscribe(() => refresh()));
  disposer.add(() => popover.destroy());
  disposer.add(() => button.destroy());
  disposer.add(() => calendar.destroy());
  disposer.add(() => timePicker.destroy());

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

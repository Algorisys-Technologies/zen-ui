import { createMemo, createSignal, splitProps } from "solid-js";
import { cn } from "../../../lib/cn";
import { Button } from "../../button/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover/popover";
import { Calendar } from "./date-picker";
import { TimePicker } from "../time-picker/time-picker";

/**
 * DateTimePicker — Solid port. Combines a single-month Calendar with a
 * segmented TimePicker inside a Popover. Picking a day preserves the
 * current time-of-day; picking a time on an empty date defaults to
 * today at the selected time.
 */

type Format = "24h" | "12h";

export type DateTimePickerProps = {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean | ((d: Date) => boolean);
  class?: string;
  format?: Format;
  showSeconds?: boolean;
  minuteStep?: number;
  formatDate?: (date: Date) => string;
  formatTime?: (date: Date, format: Format) => string;
};

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
const defaultFormatTime = (d: Date, fmt: Format) =>
  d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: fmt === "12h",
  });

export const DateTimePicker = (rawProps: DateTimePickerProps) => {
  const [props] = splitProps(rawProps, [
    "value",
    "defaultValue",
    "onValueChange",
    "placeholder",
    "disabled",
    "class",
    "format",
    "showSeconds",
    "minuteStep",
    "formatDate",
    "formatTime",
  ]);
  const isControlled = () => props.value !== undefined;
  const [inner, setInner] = createSignal<Date | undefined>(props.defaultValue);
  const date = createMemo<Date | undefined>(() =>
    isControlled() ? props.value : inner(),
  );
  const update = (d: Date | undefined) => {
    if (!isControlled()) setInner(d);
    props.onValueChange?.(d);
  };

  const onDaySelect = (d: Date | undefined) => {
    if (!d) {
      update(undefined);
      return;
    }
    if (!date()) {
      const next = new Date(d);
      next.setHours(0, 0, 0, 0);
      update(next);
      return;
    }
    const next = new Date(d);
    const cur = date()!;
    next.setHours(cur.getHours(), cur.getMinutes(), cur.getSeconds(), cur.getMilliseconds());
    update(next);
  };

  const onTimeChange = (t: string | undefined) => {
    const base = date() ?? new Date();
    update(applyTimeString(base, t));
  };

  const triggerLabel = () => {
    const d = date();
    if (!d) return props.placeholder ?? "Pick date & time";
    const fmtD = props.formatDate ?? defaultFormatDate;
    const fmtT = props.formatTime ?? defaultFormatTime;
    return `${fmtD(d)} ${fmtT(d, props.format ?? "24h")}`;
  };

  return (
    <Popover>
      <PopoverTrigger
        as={Button}
        variant="outline"
        color="neutral"
        disabled={props.disabled === true}
        iconLeft={<CalendarIcon />}
        class={cn(
          "zen-w-72 zen-justify-between zen-font-normal",
          !date() && "zen-text-zen-muted-fg",
          props.class,
        )}
      >
        {triggerLabel()}
      </PopoverTrigger>
      <PopoverContent class="zen-w-auto zen-p-0">
        <Calendar
          mode="single"
          selected={date()}
          onSelect={onDaySelect}
          disabled={typeof props.disabled === "function" ? props.disabled : undefined}
        />
        <div class="zen-flex zen-items-center zen-justify-between zen-gap-3 zen-border-t zen-border-zen-border zen-px-3 zen-py-2.5">
          <label class="zen-text-xs zen-text-zen-muted-fg">Time</label>
          <TimePicker
            value={dateToTimeString(date(), !!props.showSeconds)}
            onValueChange={onTimeChange}
            format={props.format ?? "24h"}
            showSeconds={props.showSeconds}
            minuteStep={props.minuteStep ?? 1}
            disabled={props.disabled === true}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

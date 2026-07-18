import * as React from "react";
import type { DayPickerProps } from "react-day-picker";
import { cn } from "../../../lib/cn";
import { Calendar } from "./date-picker";
import { Button } from "../../button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../popover/popover";
import { TimePicker } from "../time-picker/time-picker";

/**
 * DateTimePicker — date-input button that opens a Popover containing a
 * Calendar (above) and a TimePicker (below).
 *
 *   const [when, setWhen] = useState<Date | undefined>();
 *   <DateTimePicker value={when} onValueChange={setWhen} />
 *
 * The trigger label combines the formatted date and time. Picking a day
 * preserves the current time-of-day; picking a time on an empty date
 * defaults the date to today. Pass `format="12h"` to display AM/PM in
 * the time portion; the emitted Date is always a real `Date` object.
 */

type Format = "24h" | "12h";

export interface DateTimePickerProps {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean | DayPickerProps["disabled"];
  className?: string;
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

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Pick date & time",
  disabled,
  className,
  format = "24h",
  showSeconds = false,
  minuteStep = 1,
  formatDate = defaultFormatDate,
  formatTime = defaultFormatTime,
}) => {
  const [internal, setInternal] = React.useState<Date | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const date = isControlled ? value : internal;

  const update = (d: Date | undefined) => {
    if (!isControlled) setInternal(d);
    onValueChange?.(d);
  };

  const onDaySelect = (d: Date | undefined) => {
    if (!d) {
      update(undefined);
      return;
    }
    if (!date) {
      // No prior value — start at midnight on the picked day.
      const next = new Date(d);
      next.setHours(0, 0, 0, 0);
      update(next);
      return;
    }
    // Preserve current time-of-day across day changes.
    const next = new Date(d);
    next.setHours(
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    );
    update(next);
  };

  const onTimeChange = (t: string | undefined) => {
    const base = date ?? new Date();
    update(applyTimeString(base, t));
  };

  const triggerLabel = date
    ? `${formatDate(date)} ${formatTime(date, format)}`
    : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          color="neutral"
          disabled={typeof disabled === "boolean" ? disabled : undefined}
          className={cn(
            "zen-w-72 zen-justify-between zen-font-normal",
            !date && "zen-text-zen-muted-fg",
            className,
          )}
          iconLeft={<CalendarIcon />}
        >
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="zen-w-auto zen-p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDaySelect}
          disabled={typeof disabled === "boolean" ? undefined : disabled}
        />
        <div className="zen-flex zen-items-center zen-justify-between zen-gap-3 zen-border-t zen-border-zen-border zen-px-3 zen-py-2.5">
          <label className="zen-text-xs zen-text-zen-muted-fg">Time</label>
          <TimePicker
            value={dateToTimeString(date, showSeconds)}
            onValueChange={onTimeChange}
            format={format}
            showSeconds={showSeconds}
            minuteStep={minuteStep}
            disabled={typeof disabled === "boolean" ? disabled : undefined}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export { DateTimePicker };

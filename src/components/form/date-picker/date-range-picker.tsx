import * as React from "react";
import type { DayPickerProps, DateRange } from "react-day-picker";
import { cn } from "../../../lib/cn";
import { Button } from "../../button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../popover/popover";
import { Calendar } from "./date-picker";

/**
 * DateRangePicker — pair-of-dates input. Trigger button shows a
 * "From – To" summary, opens a two-month Calendar in a Popover with
 * range selection enabled (`mode="range"` on react-day-picker).
 *
 *   const [range, setRange] = useState<DateRange | undefined>();
 *   <DateRangePicker value={range} onValueChange={setRange} />
 *
 * Returns the same `DateRange` shape react-day-picker exports —
 * `{ from?: Date, to?: Date }`. The user clicks the first day to
 * anchor the range, then a second day to close it; clicking outside
 * the existing range resets the anchor.
 *
 * Defaults to a 2-month side-by-side calendar (the conventional
 * range-picker layout from Airbnb / Booking patterns); override via
 * `numberOfMonths`.
 */
export interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean | DayPickerProps["disabled"];
  className?: string;
  /** How many months to show side-by-side. Default 2. */
  numberOfMonths?: number;
  /** Format used in the trigger label for each side. Defaults to
   *  toLocaleDateString(). */
  formatDate?: (date: Date) => string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Pick a date range",
  disabled,
  className,
  numberOfMonths = 2,
  formatDate = (d) => d.toLocaleDateString(),
}) => {
  const [internal, setInternal] = React.useState<DateRange | undefined>(
    defaultValue,
  );
  const isControlled = value !== undefined;
  const range = isControlled ? value : internal;

  const update = (next: DateRange | undefined) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  const label = range?.from
    ? range.to
      ? `${formatDate(range.from)} – ${formatDate(range.to)}`
      : formatDate(range.from)
    : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          color="neutral"
          disabled={typeof disabled === "boolean" ? disabled : undefined}
          className={cn(
            "min-w-[16rem] justify-between font-normal",
            !range?.from && "text-zen-muted-fg",
            className,
          )}
          iconLeft={<CalendarIcon />}
        >
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={update}
          numberOfMonths={numberOfMonths}
          disabled={typeof disabled === "boolean" ? undefined : disabled}
        />
      </PopoverContent>
    </Popover>
  );
};

const CalendarIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export type { DateRange };

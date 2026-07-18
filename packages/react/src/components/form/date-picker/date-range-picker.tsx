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
 * The popover stays open while dates are selected. Use Done to apply and
 * close, or Cancel to discard changes.
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
  /** Label for the cancel action in the popover footer. */
  cancelLabel?: string;
  /** Label for the apply action in the popover footer. */
  doneLabel?: string;
}

function isCompleteRange(range: DateRange | undefined): boolean {
  return Boolean(range?.from && range?.to);
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
  cancelLabel = "Cancel",
  doneLabel = "Done",
}) => {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<DateRange | undefined>(
    defaultValue,
  );
  const isControlled = value !== undefined;
  const committed = isControlled ? value : internal;

  const [draft, setDraft] = React.useState<DateRange | undefined>(committed);
  const rangeAtOpenRef = React.useRef<DateRange | undefined>(committed);

  React.useEffect(() => {
    if (!open) {
      setDraft(committed);
    }
  }, [committed, open]);

  const commit = React.useCallback(
    (next: DateRange | undefined) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      rangeAtOpenRef.current = committed;
      setDraft(committed);
    } else {
      setDraft(rangeAtOpenRef.current);
    }
    setOpen(nextOpen);
  };

  const handleSelect = (next: DateRange | undefined) => {
    setDraft(next);
  };

  const handleDone = () => {
    if (!isCompleteRange(draft)) return;
    commit(draft);
    setOpen(false);
  };

  const handleCancel = () => {
    setDraft(rangeAtOpenRef.current);
    setOpen(false);
  };

  const label = committed?.from
    ? committed.to
      ? `${formatDate(committed.from)} – ${formatDate(committed.to)}`
      : formatDate(committed.from)
    : placeholder;

  const calendarMonth = draft?.from ?? committed?.from;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          color="neutral"
          disabled={typeof disabled === "boolean" ? disabled : undefined}
          className={cn(
            "zen-min-w-[16rem] zen-justify-between zen-font-normal",
            !committed?.from && "zen-text-zen-muted-fg",
            className,
          )}
          iconLeft={<CalendarIcon />}
        >
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="zen-w-auto zen-p-0" align="start">
        <Calendar
          mode="range"
          selected={draft}
          onSelect={handleSelect}
          numberOfMonths={numberOfMonths}
          defaultMonth={calendarMonth}
          disabled={typeof disabled === "boolean" ? undefined : disabled}
        />
        <div className="zen-flex zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-3 zen-py-2">
          <Button
            type="button"
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={handleCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="solid"
            color="primary"
            size="sm"
            onClick={handleDone}
            disabled={!isCompleteRange(draft)}
          >
            {doneLabel}
          </Button>
        </div>
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

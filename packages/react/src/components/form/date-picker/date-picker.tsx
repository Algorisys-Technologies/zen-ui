import * as React from "react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "./calendar.css";
import { cn } from "../../../lib/cn";
import { Button } from "../../button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../popover/popover";

/**
 * Calendar — bare react-day-picker, styled. Use directly when you want an
 * inline calendar (no popover), or compose inside <DatePicker /> below.
 */
export type CalendarProps = DayPickerProps;

const Calendar: React.FC<CalendarProps> = ({ className, ...props }) => (
  <DayPicker
    className={cn(
      "zen-calendar zen-p-3 zen-[--rdp-accent-color:var(--zen-color-primary)] zen-[--rdp-accent-background-color:var(--zen-color-primary-soft)]",
      className,
    )}
    {...props}
  />
);

/**
 * DatePicker — date-input button that opens a Calendar inside a Popover.
 *
 *   const [date, setDate] = useState<Date | undefined>();
 *   <DatePicker value={date} onValueChange={setDate} />
 *
 * For range selection use Calendar directly with mode="range".
 */
export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean | DayPickerProps["disabled"];
  className?: string;
  /** Format displayed in the trigger. Defaults to toLocaleDateString(). */
  formatDate?: (date: Date) => string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Pick a date",
  disabled,
  className,
  formatDate = (d) => d.toLocaleDateString(),
}) => {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<Date | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const date = isControlled ? value : internal;

  const update = (d: Date | undefined) => {
    if (!isControlled) setInternal(d);
    onValueChange?.(d);
    if (d) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          color="neutral"
          disabled={typeof disabled === "boolean" ? disabled : undefined}
          className={cn(
            "zen-w-60 zen-justify-between zen-font-normal",
            !date && "zen-text-zen-muted-fg",
            className,
          )}
          iconLeft={<CalendarIcon />}
        >
          {date ? formatDate(date) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="zen-w-auto zen-p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={update}
          disabled={typeof disabled === "boolean" ? undefined : disabled}
        />
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

export { Calendar, DatePicker };

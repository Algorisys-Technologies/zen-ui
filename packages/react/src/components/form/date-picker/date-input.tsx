import * as React from "react";
import {
  addDays,
  addMonths,
  formatDateInput,
  orderForLocale,
  parseDateInput,
  patternFor,
  type DateOrder,
} from "@algorisys/zen-ui-core/date-input";
import { cn } from "../../../lib/cn";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../../popover/popover";
import { Calendar, focusableDay } from "./date-picker";
import { useLocale } from "../../locale/locale";

export type { DateOrder };

/**
 * DateInput — a date you type, with the calendar as a second way in.
 *
 *   <DateInput value={due} onValueChange={setDue} locale="en-IN" />
 *
 * Read in the locale's order (day first for en-IN): 15/03/2026, 15-3-26,
 * 150326, 1503 (this year), 15 (this month), or ISO 2026-03-15. Shortcuts:
 * t today, y yesterday, +7 / -1 days, +2w, +1m, +1y. ↑ ↓ move a day (with
 * Shift, a month); Alt+↓ opens the calendar; Esc undoes what was typed. Text
 * that is not a date, or a date outside min / max, is kept as typed and marked
 * aria-invalid, never silently changed. The reading is
 * @algorisys/zen-ui-core/date-input (check:date-input).
 */
export type DateInputProps = {
  value?: Date | null;
  defaultValue?: Date | null;
  /** A date, or null when the field is cleared. Not called for text that is not a date. */
  onValueChange?: (date: Date | null) => void;
  /** Called with the text when what was typed is not an acceptable date. */
  onInvalidInput?: (text: string) => void;
  /** The order dates are read and shown in, from this locale. Default: the browser's. */
  locale?: string;
  /** Overrides the locale's order. */
  order?: DateOrder;
  /** The earliest date accepted. */
  min?: Date;
  /** The latest date accepted. */
  max?: Date;
  /** Dates that cannot be chosen (holidays, say). */
  isDateDisabled?: (date: Date) => boolean;
  /** Default: the order's pattern, DD/MM/YYYY. */
  placeholder?: string;
  /** Marked invalid by the form (the field marks typed text that is not a date itself). */
  invalid?: boolean;
  disabled?: boolean;
  /** Lands on the input, so `<label htmlFor>` names it. */
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Width of the field. Default: the --zen-date-input-width token. */
  width?: string;
  className?: string;
};

const sameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  (!a && !b) || (!!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());

export const DateInput = ({
  value: valueProp,
  defaultValue,
  onValueChange,
  onInvalidInput,
  locale,
  order: orderProp,
  min,
  max,
  isDateDisabled,
  placeholder,
  invalid,
  disabled,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  width,
  className,
}: DateInputProps) => {
  const loc = useLocale();
  const hintId = React.useId();
  const order: DateOrder = orderProp ?? orderForLocale(locale);
  // The initial value seeds it; the user owns it after.
  const [internal, setInternal] = React.useState<Date | null>(defaultValue ?? null);
  const value = valueProp !== undefined ? valueProp : internal;
  const show = (d: Date | null) => (d ? formatDateInput(d, order) : "");
  const [text, setText] = React.useState(() => show(value));
  const [bad, setBad] = React.useState(false);
  const [open, setOpenState] = React.useState(false);
  // Read by onBlur, which can run before the render that follows Alt+↓.
  const openRef = React.useRef(false);
  const setOpen = (o: boolean) => {
    openRef.current = o;
    setOpenState(o);
  };
  const input = React.useRef<HTMLInputElement>(null);

  // A value set from outside (or a new order) shows, unless the user is mid-edit.
  const valueKey = value ? value.getTime() : null;
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (document.activeElement !== input.current) {
      setText(value ? formatDateInput(value, order) : "");
      setBad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the day, not the Date object's identity
  }, [valueKey, order]);

  const acceptable = (d: Date) =>
    !(min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate())) &&
    !(max && d > new Date(max.getFullYear(), max.getMonth(), max.getDate())) &&
    !isDateDisabled?.(d);

  const set = (d: Date | null) => {
    setBad(false);
    setText(show(d));
    if (sameDay(d, value)) return;
    if (valueProp === undefined) setInternal(d);
    onValueChange?.(d);
  };
  /** Read what was typed: a date (set), nothing (cleared), or not a date (kept, marked). */
  const commit = () => {
    const typed = text;
    const result = parseDateInput(typed, order, new Date());
    if (result === "invalid" || (result && !acceptable(result))) {
      setBad(true);
      onInvalidInput?.(typed);
      return false;
    }
    set(result);
    return true;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commit();
      return;
    }
    if (e.key === "Escape" && text !== show(value)) {
      e.preventDefault();
      setText(show(value));
      setBad(false);
      return;
    }
    if (e.key === "ArrowDown" && e.altKey) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.altKey && !e.ctrlKey && !e.metaKey) {
      // Step from what is typed if it is a date, else from the value, else today.
      const typed = parseDateInput(text, order, new Date());
      const from = typed instanceof Date ? typed : (value ?? new Date());
      const dir = e.key === "ArrowUp" ? 1 : -1;
      const next = e.shiftKey ? addMonths(from, dir) : addDays(from, dir);
      e.preventDefault();
      if (acceptable(next)) set(next);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor
        className={cn(
          "zen-inline-flex zen-h-zen-control zen-items-center zen-gap-1 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-px-zen-control-x",
          "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
          bad || invalid ? "zen-border-zen-error" : "zen-border-zen-border",
          disabled && "zen-cursor-not-allowed zen-opacity-50",
          className,
        )}
        style={{ width: width ?? "var(--zen-date-input-width)" }}
      >
        <input
          ref={input}
          id={id}
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          value={text}
          placeholder={placeholder ?? patternFor(order)}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={hintId}
          aria-invalid={bad || invalid ? "true" : undefined}
          onChange={(e) => {
            setText(e.currentTarget.value);
            setBad(false);
          }}
          onBlur={() => {
            if (!openRef.current) commit();
          }}
          onKeyDown={onKeyDown}
          className="zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-sm zen-tabular-nums zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg"
        />
        <span id={hintId} className="zen-sr-only">
          {loc.t("dateInput.hint", { pattern: patternFor(order) })}
        </span>
        <PopoverTrigger
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={loc.t("dateInput.chooseDate")}
          className="zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0.5 zen-text-zen-muted-fg hover:zen-text-zen-foreground"
        >
          <CalendarIcon />
        </PopoverTrigger>
      </PopoverAnchor>
      <PopoverContent
        className="zen-w-auto zen-p-0"
        align="start"
        onOpenAutoFocus={(e) => {
          // Open on the chosen day (else today), not on "Previous month": the dates are what the keys are for.
          const panel = e.currentTarget as HTMLElement;
          const day = focusableDay(panel);
          if (day) {
            e.preventDefault();
            day.focus();
          }
        }}
        onCloseAutoFocus={(e) => {
          // Back to the field, not the calendar button: the field is the control.
          e.preventDefault();
          input.current?.focus();
        }}
      >
        <Calendar
          mode="single"
          selected={value ?? undefined}
          // The month of the chosen day, so the calendar can open on it.
          defaultMonth={value ?? undefined}
          onSelect={(d: Date | undefined) => {
            if (d && acceptable(d)) set(d);
            setOpen(false);
          }}
          disabled={(d: Date) => !acceptable(d)}
        />
      </PopoverContent>
    </Popover>
  );
};


/** Whether a date-input's text reads as a date: for a form's own validation. */
export const isTypedDate = (text: string, order: DateOrder = orderForLocale()) =>
  parseDateInput(text, order, new Date()) instanceof Date;

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

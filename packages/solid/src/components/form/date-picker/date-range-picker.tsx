import { createEffect, createMemo, createSignal, splitProps } from "solid-js";
import { cn } from "../../../lib/cn";
import { Button } from "../../button/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover/popover";
import { Calendar, type DateRange } from "./date-picker";

/**
 * DateRangePicker — Solid port. Trigger shows "From – To" summary, opens
 * a two-month calendar (default) in a Popover. Returns the same
 * `{ from?, to? }` shape as the React binding.
 *
 * The popover stays open while dates are selected. Use Done to apply and
 * close, or Cancel to discard changes.
 */

export type DateRangePickerProps = {
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean | ((d: Date) => boolean);
  class?: string;
  numberOfMonths?: number;
  formatDate?: (date: Date) => string;
  /** Label for the cancel action in the popover footer. */
  cancelLabel?: string;
  /** Label for the apply action in the popover footer. */
  doneLabel?: string;
};

const isCompleteRange = (range: DateRange | undefined): boolean =>
  Boolean(range?.from && range?.to);

export const DateRangePicker = (rawProps: DateRangePickerProps) => {
  const [props] = splitProps(rawProps, [
    "value",
    "defaultValue",
    "onValueChange",
    "placeholder",
    "disabled",
    "class",
    "numberOfMonths",
    "formatDate",
    "cancelLabel",
    "doneLabel",
  ]);
  const isControlled = () => props.value !== undefined;
  const [open, setOpen] = createSignal(false);
  const [inner, setInner] = createSignal<DateRange | undefined>(props.defaultValue);
  const committed = createMemo<DateRange | undefined>(() =>
    isControlled() ? props.value : inner(),
  );

  const [draft, setDraft] = createSignal<DateRange | undefined>(committed());
  let rangeAtOpen = committed();

  // Keep the draft mirrored to the committed value while the popover is closed.
  createEffect(() => {
    if (!open()) setDraft(committed());
  });

  const commit = (next: DateRange | undefined) => {
    if (!isControlled()) setInner(next);
    props.onValueChange?.(next);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      rangeAtOpen = committed();
      setDraft(committed());
    } else {
      setDraft(rangeAtOpen);
    }
    setOpen(next);
  };

  const handleDone = () => {
    if (!isCompleteRange(draft())) return;
    commit(draft());
    setOpen(false);
  };

  const handleCancel = () => {
    setDraft(rangeAtOpen);
    setOpen(false);
  };

  const fmt = (d: Date) => (props.formatDate ?? ((x: Date) => x.toLocaleDateString()))(d);

  const label = () => {
    const r = committed();
    if (!r?.from) return props.placeholder ?? "Pick a date range";
    if (!r.to) return fmt(r.from);
    return `${fmt(r.from)} – ${fmt(r.to)}`;
  };

  return (
    <Popover open={open()} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        as={Button}
        variant="outline"
        color="neutral"
        disabled={props.disabled === true}
        iconLeft={<CalendarIcon />}
        class={cn(
          "zen-min-w-[16rem] zen-justify-between zen-font-normal",
          !committed()?.from && "zen-text-zen-muted-fg",
          props.class,
        )}
      >
        {label()}
      </PopoverTrigger>
      <PopoverContent class="zen-w-auto zen-p-0">
        <Calendar
          mode="range"
          selected={draft()}
          onSelect={setDraft}
          numberOfMonths={props.numberOfMonths ?? 2}
          disabled={typeof props.disabled === "function" ? props.disabled : undefined}
        />
        <div class="zen-flex zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-3 zen-py-2">
          <Button type="button" variant="ghost" color="neutral" size="sm" onClick={handleCancel}>
            {props.cancelLabel ?? "Cancel"}
          </Button>
          <Button
            type="button"
            variant="solid"
            color="primary"
            size="sm"
            onClick={handleDone}
            disabled={!isCompleteRange(draft())}
          >
            {props.doneLabel ?? "Done"}
          </Button>
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

export type { DateRange };

import { cn } from "../../../lib/cn";
import { Disposer, type ZenComponent } from "../../../lib/component";
import { controllable } from "../../../lib/state";
import { Button } from "../../button/button";
import { Popover } from "../../popover/popover";
import { Calendar, type DateRange } from "./date-picker";

/**
 * DateRangePicker — the vanilla binding's port.
 *
 * A pair-of-dates input: the trigger button shows a "From – To" summary and opens
 * a two-month Calendar (React's Airbnb / Booking default) in a Popover with range
 * selection. Same public API as the React and Solid bindings — same prop names,
 * same `{ from?, to? }` shape.
 *
 *   const picker = DateRangePicker({ onValueChange: (r) => save(r) });
 *   host.append(picker.el);
 *
 * ## The draft / commit dance
 *
 * React holds three pieces of state: the committed value (controlled or not), a
 * `draft` the Calendar edits while the popover is open, and a snapshot taken at
 * open time so Cancel / dismiss can revert. The popover stays open while dates are
 * picked — Done applies the draft and closes, Cancel (or Escape / click-outside)
 * discards it. This mirrors that exactly, because the Calendar is data-driven and
 * does not self-store its `selected` (it reports through `onSelect` and waits for
 * the parent to push the value back), which is precisely the draft edge React's
 * `draft` state is.
 */

export interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  /** `true` disables the trigger; a predicate disables individual days. */
  disabled?: boolean | ((d: Date) => boolean);
  class?: string;
  /** How many months to show side-by-side. Default 2. */
  numberOfMonths?: number;
  /** Format used in the trigger label for each side. Defaults to `toLocaleDateString()`. */
  formatDate?: (date: Date) => string;
  /** Label for the cancel action in the popover footer. */
  cancelLabel?: string;
  /** Label for the apply action in the popover footer. */
  doneLabel?: string;
}

function isCompleteRange(range: DateRange | undefined): boolean {
  return Boolean(range?.from && range?.to);
}

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

export function DateRangePicker(
  props: DateRangePickerProps,
): ZenComponent<DateRangePickerProps> {
  let current: DateRangePickerProps = { ...props };
  const disposer = new Disposer();

  // The committed value: controlled when `value` is present, uncontrolled otherwise.
  const state = controllable<DateRange | undefined>({
    value: current.value,
    defaultValue: current.defaultValue,
    onChange: (r) => current.onValueChange?.(r),
  });

  // The in-progress selection the Calendar edits while open, and the snapshot taken
  // at open time that Cancel / dismiss reverts to.
  let draft: DateRange | undefined = state.get();
  let rangeAtOpen: DateRange | undefined = state.get();

  const fmt = (d: Date): string =>
    (current.formatDate ?? ((x: Date) => x.toLocaleDateString()))(d);

  const label = (): string => {
    const r = state.get();
    if (!r?.from) return current.placeholder ?? "Pick a date range";
    if (!r.to) return fmt(r.from);
    return `${fmt(r.from)} – ${fmt(r.to)}`;
  };

  const buttonClass = (): string =>
    cn(
      "zen-min-w-[16rem] zen-justify-between zen-font-normal",
      !state.get()?.from && "zen-text-zen-muted-fg",
      current.class,
    );

  const triggerDisabled = (): boolean | undefined =>
    typeof current.disabled === "boolean" ? current.disabled : undefined;

  const dayDisabled = (): ((d: Date) => boolean) | undefined =>
    typeof current.disabled === "function" ? current.disabled : undefined;

  const numberOfMonths = (): number => current.numberOfMonths ?? 2;

  const trigger = Button({
    variant: "outline",
    color: "neutral",
    disabled: triggerDisabled(),
    class: buttonClass(),
    iconLeft: calendarIcon(),
    children: label(),
  });

  const calendar = Calendar({
    mode: "range",
    selected: draft,
    onSelect: (v) => {
      draft = v as DateRange | undefined;
      paintCalendar();
      syncDone();
    },
    numberOfMonths: numberOfMonths(),
    disabled: dayDisabled(),
  });

  const cancelBtn = Button({
    type: "button",
    variant: "ghost",
    color: "neutral",
    size: "sm",
    children: current.cancelLabel ?? "Cancel",
    onClick: () => handleCancel(),
  });

  const doneBtn = Button({
    type: "button",
    variant: "solid",
    color: "primary",
    size: "sm",
    disabled: !isCompleteRange(draft),
    children: current.doneLabel ?? "Done",
    onClick: () => handleDone(),
  });

  const footer = document.createElement("div");
  footer.className =
    "zen-flex zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-3 zen-py-2";
  footer.append(cancelBtn.el, doneBtn.el);

  const panel = document.createElement("div");
  panel.append(calendar.el, footer);

  const popover = Popover({
    trigger,
    children: panel,
    align: "start",
    class: "zen-w-auto zen-p-0",
    onOpenChange: (nextOpen) => handleOpenChange(nextOpen),
  });

  const refreshTrigger = (): void => {
    trigger.update({
      children: label(),
      class: buttonClass(),
      disabled: triggerDisabled(),
    });
  };

  const paintCalendar = (): void => {
    calendar.update({
      selected: draft,
      numberOfMonths: numberOfMonths(),
      disabled: dayDisabled(),
    });
  };

  const syncDone = (): void => {
    doneBtn.update({ disabled: !isCompleteRange(draft) });
  };

  function handleOpenChange(nextOpen: boolean): void {
    if (nextOpen) {
      // Snapshot the committed value so a later Cancel / dismiss can revert to it,
      // and seed the draft the Calendar edits.
      rangeAtOpen = state.get();
      draft = state.get();
    } else {
      // Close for any reason other than Done reverts the draft. Done pre-points
      // rangeAtOpen at the value it committed, so this revert lands there instead.
      draft = rangeAtOpen;
    }
    paintCalendar();
    syncDone();
  }

  function handleDone(): void {
    if (!isCompleteRange(draft)) return;
    state.set(draft); // commit; reports onValueChange, stores when uncontrolled
    rangeAtOpen = draft; // so the close-revert lands on the committed value
    popover.close();
    refreshTrigger();
  }

  function handleCancel(): void {
    draft = rangeAtOpen;
    popover.close();
  }

  disposer.add(
    state.subscribe(() => {
      refreshTrigger();
      if (!popover.isOpen) {
        draft = state.get();
        rangeAtOpen = state.get();
        paintCalendar();
        syncDone();
      }
    }),
  );
  disposer.add(() => popover.destroy());
  disposer.add(() => trigger.destroy());
  disposer.add(() => calendar.destroy());
  disposer.add(() => cancelBtn.destroy());
  disposer.add(() => doneBtn.destroy());

  return {
    el: popover.el,
    update(next) {
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);
      if (!popover.isOpen) {
        draft = state.get();
        rangeAtOpen = state.get();
      }
      refreshTrigger();
      paintCalendar();
      cancelBtn.update({ children: current.cancelLabel ?? "Cancel" });
      doneBtn.update({
        children: current.doneLabel ?? "Done",
        disabled: !isCompleteRange(draft),
      });
    },
    destroy() {
      disposer.dispose();
    },
  };
}

export type { DateRange };

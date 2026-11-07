import { createEffect, createMemo, createSignal, createUniqueId, on, Show, splitProps } from "solid-js";
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
import { Popover, PopoverContent } from "../../popover/popover";
import { Calendar } from "./date-picker";
import { useLocale } from "../../locale/locale";

export type { DateOrder };

/**
 * DateInput — a date you type, with the calendar as a second way in.
 *
 *   <DateInput value={due()} onValueChange={setDue} locale="en-IN" />
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
  /** Lands on the input, so `<label for>` names it. */
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Width of the field. Default: the --zen-date-input-width token. */
  width?: string;
  class?: string;
};

const sameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  (!a && !b) || (!!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());

export const DateInput = (props: DateInputProps) => {
  const loc = useLocale();
  const [local] = splitProps(props, [
    "value", "defaultValue", "onValueChange", "onInvalidInput", "locale", "order", "min", "max",
    "isDateDisabled", "placeholder", "invalid", "disabled", "id", "aria-label", "aria-labelledby", "width", "class",
  ]);
  const hintId = createUniqueId();
  const order = createMemo<DateOrder>(() => local.order ?? orderForLocale(local.locale));
  // The initial value seeds it; the user owns it after.
  const [internal, setInternal] = createSignal<Date | null>(local.defaultValue ?? null);
  const value = () => (local.value !== undefined ? local.value : internal());
  const show = (d: Date | null) => (d ? formatDateInput(d, order()) : "");
  const [text, setText] = createSignal(show(value()));
  const [bad, setBad] = createSignal(false);
  const [open, setOpen] = createSignal(false);
  let input: HTMLInputElement | undefined;

  // A value set from outside (or a new order) shows, unless the user is mid-edit.
  createEffect(on([value, order], () => {
    if (document.activeElement !== input) {
      setText(show(value()));
      setBad(false);
    }
  }, { defer: true }));

  const acceptable = (d: Date) =>
    !(local.min && d < new Date(local.min.getFullYear(), local.min.getMonth(), local.min.getDate())) &&
    !(local.max && d > new Date(local.max.getFullYear(), local.max.getMonth(), local.max.getDate())) &&
    !local.isDateDisabled?.(d);

  const set = (d: Date | null) => {
    setBad(false);
    setText(show(d));
    if (sameDay(d, value())) return;
    if (local.value === undefined) setInternal(d);
    local.onValueChange?.(d);
  };
  /** Read what was typed: a date (set), nothing (cleared), or not a date (kept, marked). */
  const commit = () => {
    const typed = text();
    const result = parseDateInput(typed, order(), new Date());
    if (result === "invalid" || (result && !acceptable(result))) {
      setBad(true);
      local.onInvalidInput?.(typed);
      return false;
    }
    set(result);
    return true;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      commit();
      return;
    }
    if (e.key === "Escape" && text() !== show(value())) {
      e.preventDefault();
      setText(show(value()));
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
      const typed = parseDateInput(text(), order(), new Date());
      const from = typed instanceof Date ? typed : (value() ?? new Date());
      const dir = e.key === "ArrowUp" ? 1 : -1;
      const next = e.shiftKey ? addMonths(from, dir) : addDays(from, dir);
      e.preventDefault();
      if (acceptable(next)) set(next);
    }
  };

  // The calendar is mounted only while it is open. Mounted with every field
  // (a Popover root, anchor, trigger and content per date field, opened or
  // not), a form of date fields kept about 7 MB of the last closed form alive
  // in a consumer's leak check; mounted on demand there is nothing to keep.
  // The field is plain markup, and the open Popover anchors to it.
  let anchor: HTMLDivElement | undefined;
  let panel: HTMLElement | undefined;
  const close = () => {
    // Back to the field when focus was in the calendar (a day picked, Esc);
    // left where it went when the user clicked elsewhere.
    const inPanel = !!panel && panel.contains(document.activeElement);
    setOpen(false);
    if (inPanel) input?.focus();
  };
  // A press on the field itself (its box, its calendar button) is not
  // "outside": the button toggles, the box keeps the calendar open.
  const dismiss = {
    onInteractOutside: (e: Event) => {
      if (anchor?.contains(e.target as Node)) e.preventDefault();
    },
  };

  return (
    <>
      <div
        ref={anchor}
        class={cn(
          "zen-inline-flex zen-h-zen-control zen-items-center zen-gap-1 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-px-zen-control-x",
          "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
          bad() || local.invalid ? "zen-border-zen-error" : "zen-border-zen-border",
          local.disabled && "zen-cursor-not-allowed zen-opacity-50",
          local.class,
        )}
        style={{ width: local.width ?? "var(--zen-date-input-width)" }}
      >
        <input
          ref={input}
          id={local.id}
          type="text"
          inputmode="text"
          autocomplete="off"
          spellcheck={false}
          value={text()}
          placeholder={local.placeholder ?? patternFor(order())}
          disabled={local.disabled}
          aria-label={local["aria-label"]}
          aria-labelledby={local["aria-labelledby"]}
          aria-describedby={hintId}
          aria-invalid={bad() || local.invalid ? "true" : undefined}
          onInput={(e) => {
            setText(e.currentTarget.value);
            setBad(false);
          }}
          onBlur={() => {
            if (!open()) commit();
          }}
          onKeyDown={onKeyDown}
          class="zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-sm zen-tabular-nums zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg"
        />
        <span id={hintId} class="zen-sr-only">
          {loc.t("dateInput.hint", { pattern: patternFor(order()) })}
        </span>
        <button
          type="button"
          tabIndex={-1}
          disabled={local.disabled}
          aria-label={loc.t("dateInput.chooseDate")}
          aria-haspopup="dialog"
          aria-expanded={open()}
          onClick={() => (open() ? close() : setOpen(true))}
          class="zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0.5 zen-text-zen-muted-fg hover:zen-text-zen-foreground"
        >
          <CalendarIcon />
        </button>
      </div>
      <Show when={open()}>
        <Popover open onOpenChange={(o) => (o ? setOpen(true) : close())} placement="bottom-start" anchorRef={() => anchor}>
          <PopoverContent
            class="zen-w-auto zen-p-0"
            {...dismiss}
            onOpenAutoFocus={(e: Event) => {
              // Open on the chosen day (else today), not on "Previous month": the dates are what the keys are for.
              panel = e.currentTarget as HTMLElement;
              const day =
                panel.querySelector<HTMLButtonElement>('button[aria-pressed="true"]:not(:disabled)') ??
                panel.querySelector<HTMLButtonElement>(`button[aria-label="${new Date().toDateString()}"]:not(:disabled)`); // i18n-ignore (a selector, not text)
              if (day) {
                e.preventDefault();
                day.focus();
              }
            }}
            onCloseAutoFocus={(e: Event) => {
              // Focus is placed by close(), not by the Popover.
              e.preventDefault();
            }}
          >
            <Calendar
              mode="single"
              selected={value() ?? undefined}
              onSelect={(d) => {
                if (d && acceptable(d)) set(d);
                close();
              }}
              disabled={(d: Date) => !acceptable(d)}
            />
          </PopoverContent>
        </Popover>
      </Show>
    </>
  );
};

/** Whether a date-input's text reads as a date: for a form's own validation. */
export const isTypedDate = (text: string, order: DateOrder = orderForLocale()) =>
  parseDateInput(text, order, new Date()) instanceof Date;

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

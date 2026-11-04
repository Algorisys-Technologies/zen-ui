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
import { Disposer, type ZenComponent } from "../../../lib/component";
import { controllable } from "../../../lib/state";
import { Popover } from "../../popover/popover";
import { useLocale } from "../../locale/locale";
import { Calendar, focusableDay, type CalendarProps } from "./date-picker";

export type { DateOrder };

/**
 * DateInput — a date you type, with the calendar as a second way in.
 *
 *   const due = DateInput({ value: date, onValueChange: (d) => due.update({ value: d }), locale: "en-IN" });
 *   host.append(due.el);
 *
 * Read in the locale's order (day first for en-IN): 15/03/2026, 15-3-26,
 * 150326, 1503 (this year), 15 (this month), or ISO 2026-03-15. Shortcuts:
 * t today, y yesterday, +7 / -1 days, +2w, +1m, +1y. ↑ ↓ move a day (with
 * Shift, a month); Alt+↓ opens the calendar; Esc undoes what was typed. Text
 * that is not a date, or a date outside min / max, is kept as typed and marked
 * aria-invalid, never silently changed. The reading is
 * @algorisys/zen-ui-core/date-input (check:date-input), the same function the
 * React and Solid bindings call.
 *
 * The vanilla Popover takes its parts as data (see popover.ts), so the field
 * box is its `anchor` and the calendar button its `trigger`; the button is put
 * back inside the box, where React's PopoverAnchor holds it. `el` is that box,
 * as React's root is the anchor.
 */
export interface DateInputProps {
  /** Controlled: present (a Date or null) means the caller owns it and pushes it back with update(). */
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
}

const sameDay = (a: Date | null | undefined, b: Date | null | undefined): boolean =>
  (!a && !b) ||
  (!!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());

/** Our own trusted markup (never a caller's string — PORTING.md). React's CalendarIcon, 16px. */
const CALENDAR_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

let uid = 0;

export function DateInput(props: DateInputProps = {}): ZenComponent<DateInputProps> {
  let current: DateInputProps = { ...props };
  const loc = useLocale();
  const hintId = `zen-date-input-hint-${++uid}`;
  const disposer = new Disposer();

  const order = (): DateOrder => current.order ?? orderForLocale(current.locale);
  const show = (d: Date | null): string => (d ? formatDateInput(d, order()) : "");

  // The initial value seeds it; the user owns it after.
  const state = controllable<Date | null>({
    value: current.value,
    defaultValue: current.defaultValue ?? null,
    onChange: (d) => current.onValueChange?.(d),
    equals: sameDay,
  });

  const box = document.createElement("div");
  const input = document.createElement("input");
  input.type = "text";
  input.inputMode = "text";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.className =
    "zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-sm zen-tabular-nums zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg";
  input.setAttribute("aria-describedby", hintId);
  input.value = show(state.get());

  const hint = document.createElement("span");
  hint.id = hintId;
  hint.className = "zen-sr-only";

  const button = document.createElement("button");
  button.type = "button";
  // The field is the tab stop; the button is for the mouse (Alt+↓ from the keys).
  button.tabIndex = -1;
  button.className =
    "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0.5 zen-text-zen-muted-fg hover:zen-text-zen-foreground";
  const icon = document.createElement("template");
  icon.innerHTML = CALENDAR_ICON;
  button.append(icon.content);
  button.setAttribute("aria-label", loc.t("dateInput.chooseDate"));

  let bad = false;
  const setBad = (b: boolean) => {
    bad = b;
    paint();
  };

  /** Everything the props and the invalid mark decide, written out. */
  function paint(): void {
    box.className = cn(
      "zen-inline-flex zen-h-zen-control zen-items-center zen-gap-1 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-px-zen-control-x",
      "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
      bad || current.invalid ? "zen-border-zen-error" : "zen-border-zen-border",
      current.disabled && "zen-cursor-not-allowed zen-opacity-50",
      current.class,
    );
    box.style.width = current.width ?? "var(--zen-date-input-width)";
    if (current.id) input.id = current.id;
    else input.removeAttribute("id");
    input.placeholder = current.placeholder ?? patternFor(order());
    input.disabled = !!current.disabled;
    button.disabled = !!current.disabled;
    for (const a of ["aria-label", "aria-labelledby"] as const) {
      const v = current[a];
      if (v) input.setAttribute(a, v);
      else input.removeAttribute(a);
    }
    if (bad || current.invalid) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    hint.textContent = loc.t("dateInput.hint", { pattern: patternFor(order()) });
  }

  const acceptable = (d: Date): boolean => {
    const { min, max, isDateDisabled } = current;
    return (
      !(min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate())) &&
      !(max && d > new Date(max.getFullYear(), max.getMonth(), max.getDate())) &&
      !isDateDisabled?.(d)
    );
  };

  const set = (d: Date | null): void => {
    bad = false;
    input.value = show(d);
    paint();
    state.set(d);
  };

  /** Read what was typed: a date (set), nothing (cleared), or not a date (kept, marked). */
  const commit = (): boolean => {
    const typed = input.value;
    const result = parseDateInput(typed, order(), new Date());
    if (result === "invalid" || (result && !acceptable(result))) {
      setBad(true);
      current.onInvalidInput?.(typed);
      return false;
    }
    set(result);
    return true;
  };

  /* ---------------- the calendar ---------------- */

  let open = false;
  let calendar: ZenComponent<CalendarProps> | null = null;

  const setOpen = (o: boolean): void => {
    if (o === open) return;
    open = o;
    if (o) {
      // A fresh calendar each time, on the chosen day's month (React's
      // PopoverContent remounts its Calendar with defaultMonth = value).
      calendar?.destroy();
      calendar = Calendar({
        mode: "single",
        selected: state.get() ?? undefined,
        onSelect: (d) => {
          if (d instanceof Date && acceptable(d)) set(d);
          setOpen(false);
        },
        disabled: (d: Date) => !acceptable(d),
      });
      popover.update({ children: calendar, open: true });
      // Open on the chosen day (else today), not on the panel: the dates are what the keys are for.
      focusableDay(calendar.el)?.focus();
    } else {
      popover.update({ open: false });
      // The popover hands focus to its trigger; back to the field instead, the
      // field is the control. A click elsewhere moves focus on after this.
      const a = document.activeElement;
      if (a === button || a === document.body || !a) input.focus();
    }
  };

  const popover = Popover({
    trigger: button,
    anchor: box,
    align: "start",
    class: "zen-w-auto zen-p-0",
    open: false,
    onOpenChange: setOpen,
  });
  // The popover lays anchor and trigger side by side in its own wrapper; the
  // button belongs inside the field's box.
  box.append(input, hint, button);

  /* ---------------- keys and edits ---------------- */

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Enter") {
      commit();
      return;
    }
    if (e.key === "Escape" && input.value !== show(state.get())) {
      e.preventDefault();
      input.value = show(state.get());
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
      const typed = parseDateInput(input.value, order(), new Date());
      const from = typed instanceof Date ? typed : (state.get() ?? new Date());
      const dir = e.key === "ArrowUp" ? 1 : -1;
      const next = e.shiftKey ? addMonths(from, dir) : addDays(from, dir);
      e.preventDefault();
      if (acceptable(next)) set(next);
    }
  };
  const onInput = () => {
    if (bad) setBad(false);
  };
  const onBlur = () => {
    if (!open) commit();
  };
  input.addEventListener("keydown", onKeyDown);
  input.addEventListener("input", onInput);
  input.addEventListener("blur", onBlur);
  disposer.add(() => input.removeEventListener("keydown", onKeyDown));
  disposer.add(() => input.removeEventListener("input", onInput));
  disposer.add(() => input.removeEventListener("blur", onBlur));

  // A value set from outside (or a new order) shows, unless the user is mid-edit.
  const showOutside = () => {
    if (document.activeElement !== input) {
      input.value = show(state.get());
      bad = false;
    }
    paint();
  };
  disposer.add(state.subscribe(showOutside));
  disposer.add(() => calendar?.destroy());
  disposer.add(() => popover.destroy());

  paint();

  return {
    el: box,
    update(next) {
      const before = order();
      current = { ...current, ...next };
      if ("value" in next && state.controlled) state.sync(next.value);
      if (order() !== before) showOutside();
      else paint();
    },
    destroy() {
      disposer.dispose();
      box.remove();
    },
  };
}

/** Whether a date-input's text reads as a date: for a form's own validation. */
export const isTypedDate = (text: string, order: DateOrder = orderForLocale()): boolean =>
  parseDateInput(text, order, new Date()) instanceof Date;

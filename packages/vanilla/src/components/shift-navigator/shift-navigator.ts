import { nextShift, previousShift, shiftAt, shiftWindow, type ShiftDef, type ShiftRef } from "@algorisys/zen-ui-core/shifts";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";
import { Icon } from "../icon/icon";

/**
 * ShiftNavigator — step through a plant's shifts: previous, next, back to now.
 * The vanilla port of the React reference.
 *
 *   const nav = ShiftNavigator({
 *     shifts: [{ id: "A", start: "06:00", end: "14:00" }, …],
 *     timeZone: "Asia/Kolkata",
 *     onChange: (ref, window) => load(ref),
 *   });
 *
 * Times are the plant's: pass `timeZone` and a supervisor in another city sees
 * the shift as the floor works it. A night shift belongs to the day it starts.
 * Without `value` it starts on the current shift (or the next one, in a gap
 * between shifts).
 *
 * Future shifts have no data yet, so "next" stops at the current shift unless
 * `allowFuture` is set — a planning screen sets it.
 *
 * Without `now` the clock is re-read once a minute, so "Now" and the limit on
 * "next" move on their own when a shift changes; `destroy()` stops that timer.
 */

export interface ShiftNavigatorProps extends Omit<BaseProps, "children"> {
  shifts: ShiftDef[];
  /** IANA zone the shifts are worked in. Defaults to the browser's. */
  timeZone?: string;
  /** Controlled. */
  value?: ShiftRef;
  defaultValue?: ShiftRef;
  onChange?: (ref: ShiftRef, window: { start: number; end: number }) => void;
  /** Let "next" go past the current shift. Default false. */
  allowFuture?: boolean;
  /** Pins the clock, for tests and screenshots. */
  now?: Date | number;
}

export type ShiftNavigatorHandle = ZenComponent<ShiftNavigatorProps, HTMLDivElement>;

const step = cn(
  "zen-inline-flex zen-h-zen-control zen-aspect-square zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-cursor-pointer",
  "hover:zen-bg-zen-muted disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
);

export function ShiftNavigator(props: ShiftNavigatorProps): ShiftNavigatorHandle {
  let current: ShiftNavigatorProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let clock = Date.now();
  let own: ShiftRef | undefined = current.defaultValue;

  const el = document.createElement("div");
  el.setAttribute("role", "group");

  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = step;
  const prevIcon = Icon({ name: "chevron-left", size: 18, class: "rtl:zen-rotate-180" });
  prev.append(prevIcon.el);

  const middle = document.createElement("div");
  middle.className = "zen-flex zen-min-w-0 zen-flex-col zen-px-1";
  middle.setAttribute("aria-live", "polite");
  const title = document.createElement("span");
  title.className = "zen-flex zen-items-center zen-gap-2 zen-text-base zen-font-semibold zen-text-zen-foreground";
  const titleText = document.createTextNode("");
  const nowBadge = document.createElement("span");
  nowBadge.className =
    "zen-rounded-zen-full zen-bg-zen-success-soft zen-px-2 zen-py-px zen-text-xs zen-font-medium zen-text-zen-success-soft-fg";
  title.append(titleText);
  const times = document.createElement("span");
  times.className = "zen-text-sm zen-tabular-nums zen-text-zen-muted-fg";
  middle.append(title, times);

  const next = document.createElement("button");
  next.type = "button";
  next.className = step;
  const nextIcon = Icon({ name: "chevron-right", size: 18, class: "rtl:zen-rotate-180" });
  next.append(nextIcon.el);

  const back = document.createElement("button");
  back.type = "button";
  back.className = cn(step, "zen-aspect-auto zen-px-zen-control-x zen-text-sm zen-font-medium");

  el.append(prev, middle, next);

  // Derived state, recomputed by render() and read by the click handlers.
  let value: ShiftRef | undefined;
  let currentShift: ShiftRef | null = null;
  let nextRef: ShiftRef | null = null;

  const go = (r: ShiftRef | null) => {
    if (!r) return;
    const w = shiftWindow(r, current.shifts, current.timeZone);
    if (!w) return;
    own = r;
    current.onChange?.(r, w);
    render();
  };

  const onPrev = () => go(value ? previousShift(value, current.shifts) : null);
  const onNext = () => go(nextRef);
  const onBack = () => go(currentShift);
  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);
  back.addEventListener("click", onBack);
  disposer.add(() => {
    prev.removeEventListener("click", onPrev);
    next.removeEventListener("click", onNext);
    back.removeEventListener("click", onBack);
  });

  const timer = setInterval(() => {
    clock = Date.now();
    // A pinned clock does not move; skip the work.
    if (current.now === undefined) render();
  }, 60_000);
  disposer.add(() => clearInterval(timer));

  const render = () => {
    const {
      class: className,
      shifts,
      timeZone,
      value: valueProp,
      defaultValue: _defaultValue,
      onChange: _onChange,
      allowFuture,
      now: nowProp,
      ...rest
    } = current;
    const now = +(nowProp ?? clock);

    currentShift = shiftAt(now, shifts, timeZone, { orNext: true });
    value = valueProp ?? own ?? currentShift ?? undefined;
    const span = value ? shiftWindow(value, shifts, timeZone) : null;
    const isCurrent = !!value && !!currentShift && value.id === currentShift.id && value.day === currentShift.day;

    nextRef = value ? nextShift(value, shifts) : null;
    let nextBlocked = false;
    if (!allowFuture) {
      const w = nextRef ? shiftWindow(nextRef, shifts, timeZone) : null;
      nextBlocked = !w || w.start > now;
    }

    const def = shifts.find((s) => s.id === value?.id);
    const name = def?.label ?? loc.t("shifts.named", { name: value?.id ?? "" });
    const dayText = span
      ? new Intl.DateTimeFormat(loc.locale, { weekday: "short", day: "numeric", month: "short", timeZone }).format(span.start)
      : "";
    let timeText = "";
    if (span) {
      const f = new Intl.DateTimeFormat(loc.locale, { hour: "2-digit", minute: "2-digit", timeZone });
      timeText = [f.format(span.start), f.format(span.end)].join("–");
    }

    el.className = cn("zen-flex zen-flex-wrap zen-items-center zen-gap-2", className);
    el.setAttribute("aria-label", loc.t("shifts.label"));
    prev.setAttribute("aria-label", loc.t("shifts.previous"));
    next.setAttribute("aria-label", loc.t("shifts.next"));
    next.disabled = nextBlocked;

    titleText.data = [name, dayText].join(" · ");
    nowBadge.textContent = loc.t("shifts.now");
    if (isCurrent && nowBadge.parentNode !== title) title.append(nowBadge);
    else if (!isCurrent) nowBadge.remove();
    times.textContent = timeText;

    back.textContent = loc.t("shifts.current");
    if (!isCurrent && back.parentNode !== el) el.append(back);
    else if (isCurrent) back.remove();

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());
  disposer.add(() => {
    prevIcon.destroy();
    nextIcon.destroy();
  });

  return {
    el,
    update(nextProps) {
      current = { ...current, ...nextProps };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

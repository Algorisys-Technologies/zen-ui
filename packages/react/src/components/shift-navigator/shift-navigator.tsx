import * as React from "react";
import { nextShift, previousShift, shiftAt, shiftWindow, type ShiftDef, type ShiftRef } from "@algorisys/zen-ui-core/shifts";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";
import { Icon } from "../icon/icon";

/**
 * ShiftNavigator — step through a plant's shifts: previous, next, back to now.
 *
 *   <ShiftNavigator
 *     shifts={[{ id: "A", start: "06:00", end: "14:00" }, …]}
 *     timeZone="Asia/Kolkata"
 *     value={shift} onChange={setShift}
 *   />
 *
 * Times are the plant's: pass `timeZone` and a supervisor in another city sees
 * the shift as the floor works it. A night shift belongs to the day it starts.
 * Without `value` it starts on the current shift (or the next one, in a gap
 * between shifts).
 *
 * Future shifts have no data yet, so "next" stops at the current shift unless
 * `allowFuture` is set — a planning screen sets it.
 */

export type ShiftNavigatorProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange" | "defaultValue"
> & {
  shifts: ShiftDef[];
  /** IANA zone the shifts are worked in. Defaults to the browser's. */
  timeZone?: string;
  value?: ShiftRef;
  defaultValue?: ShiftRef;
  onChange?: (ref: ShiftRef, window: { start: number; end: number }) => void;
  /** Let "next" go past the current shift. Default false. */
  allowFuture?: boolean;
  /** Pins the clock, for tests and screenshots. */
  now?: Date | number;
};

const step = cn(
  "zen-inline-flex zen-h-zen-control zen-aspect-square zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-cursor-pointer",
  "hover:zen-bg-zen-muted disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
);

export const ShiftNavigator = React.forwardRef<HTMLDivElement, ShiftNavigatorProps>(
  ({ shifts, timeZone, value: valueProp, defaultValue, onChange, allowFuture, now: nowProp, className, ...rest }, ref) => {
    const loc = useLocale();
    const [clock, setClock] = React.useState(() => Date.now());
    React.useEffect(() => {
      const timer = setInterval(() => setClock(Date.now()), 60_000);
      return () => clearInterval(timer);
    }, []);
    const now = +(nowProp ?? clock);

    const current = React.useMemo(() => shiftAt(now, shifts, timeZone, { orNext: true }), [now, shifts, timeZone]);
    const [own, setOwn] = React.useState<ShiftRef | undefined>(defaultValue);
    const value = valueProp ?? own ?? current ?? undefined;
    const span = value ? shiftWindow(value, shifts, timeZone) : null;
    const isCurrent = !!value && !!current && value.id === current.id && value.day === current.day;

    const go = (r: ShiftRef | null) => {
      if (!r) return;
      const w = shiftWindow(r, shifts, timeZone);
      if (!w) return;
      setOwn(r);
      onChange?.(r, w);
    };
    const nextRef = value ? nextShift(value, shifts) : null;
    const nextBlocked = (() => {
      if (allowFuture) return false;
      const w = nextRef ? shiftWindow(nextRef, shifts, timeZone) : null;
      return !w || w.start > now;
    })();

    const def = shifts.find((s) => s.id === value?.id);
    const name = def?.label ?? loc.t("shifts.named", { name: value?.id ?? "" });
    const dayText = span
      ? new Intl.DateTimeFormat(loc.locale, { weekday: "short", day: "numeric", month: "short", timeZone }).format(span.start)
      : "";
    const timeText = (() => {
      if (!span) return "";
      const f = new Intl.DateTimeFormat(loc.locale, { hour: "2-digit", minute: "2-digit", timeZone });
      return `${f.format(span.start)}–${f.format(span.end)}`;
    })();

    return (
      <div
        ref={ref}
        role="group"
        aria-label={loc.t("shifts.label")}
        className={cn("zen-flex zen-flex-wrap zen-items-center zen-gap-2", className)}
        {...rest}
      >
        <button
          type="button"
          className={step}
          aria-label={loc.t("shifts.previous")}
          onClick={() => go(value ? previousShift(value, shifts) : null)}
        >
          <Icon name="chevron-left" size={18} className="rtl:zen-rotate-180" />
        </button>
        <div className="zen-flex zen-min-w-0 zen-flex-col zen-px-1" aria-live="polite">
          <span className="zen-flex zen-items-center zen-gap-2 zen-text-base zen-font-semibold zen-text-zen-foreground">
            {name} · {dayText}
            {isCurrent && (
              <span className="zen-rounded-zen-full zen-bg-zen-success-soft zen-px-2 zen-py-px zen-text-xs zen-font-medium zen-text-zen-success-soft-fg">
                {loc.t("shifts.now")}
              </span>
            )}
          </span>
          <span className="zen-text-sm zen-tabular-nums zen-text-zen-muted-fg">{timeText}</span>
        </div>
        <button
          type="button"
          className={step}
          aria-label={loc.t("shifts.next")}
          disabled={nextBlocked}
          onClick={() => go(nextRef)}
        >
          <Icon name="chevron-right" size={18} className="rtl:zen-rotate-180" />
        </button>
        {!isCurrent && (
          <button
            type="button"
            className={cn(step, "zen-aspect-auto zen-px-zen-control-x zen-text-sm zen-font-medium")}
            onClick={() => go(current)}
          >
            {loc.t("shifts.current")}
          </button>
        )}
      </div>
    );
  },
);
ShiftNavigator.displayName = "ShiftNavigator";

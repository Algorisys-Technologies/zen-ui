import { type JSX, Show, createMemo, createSignal, onCleanup, splitProps } from "solid-js";
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
 *     value={shift()} onChange={setShift}
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

export type ShiftNavigatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
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

export const ShiftNavigator = (props: ShiftNavigatorProps) => {
  const [local, rest] = splitProps(props, ["shifts", "timeZone", "value", "defaultValue", "onChange", "allowFuture", "now", "class"]);
  const loc = useLocale();
  const [clock, setClock] = createSignal(Date.now());
  const timer = setInterval(() => setClock(Date.now()), 60_000);
  onCleanup(() => clearInterval(timer));
  const now = () => +(local.now ?? clock());

  const current = createMemo(() => shiftAt(now(), local.shifts, local.timeZone, { orNext: true }));
  const [own, setOwn] = createSignal<ShiftRef | undefined>(local.defaultValue);
  const value = () => local.value ?? own() ?? current() ?? undefined;
  const span = () => {
    const v = value();
    return v ? shiftWindow(v, local.shifts, local.timeZone) : null;
  };
  const isCurrent = () => {
    const v = value();
    const c = current();
    return !!v && !!c && v.id === c.id && v.day === c.day;
  };

  const go = (ref: ShiftRef | null) => {
    if (!ref) return;
    const w = shiftWindow(ref, local.shifts, local.timeZone);
    if (!w) return;
    setOwn(ref);
    local.onChange?.(ref, w);
  };
  const nextRef = () => {
    const v = value();
    return v ? nextShift(v, local.shifts) : null;
  };
  const nextBlocked = () => {
    if (local.allowFuture) return false;
    const n = nextRef();
    const w = n ? shiftWindow(n, local.shifts, local.timeZone) : null;
    return !w || w.start > now();
  };

  const name = () => {
    const v = value();
    const def = local.shifts.find((s) => s.id === v?.id);
    return def?.label ?? loc.t("shifts.named", { name: v?.id ?? "" });
  };
  const dayText = () => {
    const w = span();
    return w
      ? new Intl.DateTimeFormat(loc.locale(), { weekday: "short", day: "numeric", month: "short", timeZone: local.timeZone }).format(w.start)
      : "";
  };
  const timeText = () => {
    const w = span();
    if (!w) return "";
    const f = new Intl.DateTimeFormat(loc.locale(), { hour: "2-digit", minute: "2-digit", timeZone: local.timeZone });
    return `${f.format(w.start)}–${f.format(w.end)}`;
  };

  const step = cn(
    "zen-inline-flex zen-h-zen-control zen-aspect-square zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-cursor-pointer",
    "hover:zen-bg-zen-muted disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
  );

  return (
    <div role="group" aria-label={loc.t("shifts.label")} class={cn("zen-flex zen-flex-wrap zen-items-center zen-gap-2", local.class)} {...rest}>
      <button type="button" class={step} aria-label={loc.t("shifts.previous")} onClick={() => go(value() ? previousShift(value() as ShiftRef, local.shifts) : null)}>
        <Icon name="chevron-left" size={18} class="rtl:zen-rotate-180" />
      </button>
      <div class="zen-flex zen-min-w-0 zen-flex-col zen-px-1" aria-live="polite">
        <span class="zen-flex zen-items-center zen-gap-2 zen-text-base zen-font-semibold zen-text-zen-foreground">
          {name()} · {dayText()}
          <Show when={isCurrent()}>
            <span class="zen-rounded-zen-full zen-bg-zen-success-soft zen-px-2 zen-py-px zen-text-xs zen-font-medium zen-text-zen-success-soft-fg">
              {loc.t("shifts.now")}
            </span>
          </Show>
        </span>
        <span class="zen-text-sm zen-tabular-nums zen-text-zen-muted-fg">{timeText()}</span>
      </div>
      <button type="button" class={step} aria-label={loc.t("shifts.next")} disabled={nextBlocked()} onClick={() => go(nextRef())}>
        <Icon name="chevron-right" size={18} class="rtl:zen-rotate-180" />
      </button>
      <Show when={!isCurrent()}>
        <button
          type="button"
          class={cn(step, "zen-aspect-auto zen-px-zen-control-x zen-text-sm zen-font-medium")}
          onClick={() => go(current())}
        >
          {loc.t("shifts.current")}
        </button>
      </Show>
    </div>
  );
};

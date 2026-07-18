import * as React from "react";
import { cn } from "../../../lib/cn";

/**
 * TimePicker — segmented numeric time input.
 *
 *   const [time, setTime] = useState<string | undefined>();      // "HH:MM" 24h
 *   <TimePicker value={time} onValueChange={setTime} />
 *
 * Segments behave like Apple / Google date-time inputs: type two digits,
 * focus auto-advances; arrow up/down increment with wrap; backspace clears.
 * The emitted value is ALWAYS 24-hour `HH:MM` (or `HH:MM:SS` with
 * `showSeconds`), regardless of the displayed 12h/24h format. A hidden
 * <input> mirrors the value so the picker submits inside native forms.
 */

type Format = "24h" | "12h";
type Period = "AM" | "PM";

export interface TimePickerProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  /** "24h" (default) or "12h" — controls what the user sees, not the emitted value. */
  format?: Format;
  /** Render seconds segment. Emitted value becomes "HH:MM:SS". */
  showSeconds?: boolean;
  /** Step in minutes for ArrowUp/Down on the minutes segment. Default 1. */
  minuteStep?: number;
  disabled?: boolean;
  readOnly?: boolean;
  /** Name for the hidden input so the value submits with native forms. */
  name?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

interface Parts {
  h: number | null; // 0–23 always; display layer converts for 12h
  m: number | null;
  s: number | null;
}

const EMPTY: Parts = { h: null, m: null, s: null };

const pad = (n: number) => n.toString().padStart(2, "0");

const partsFromString = (v: string | undefined, showSeconds: boolean): Parts => {
  if (!v) return EMPTY;
  const m = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(v.trim());
  if (!m) return EMPTY;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  const s = m[3] !== undefined ? Number(m[3]) : 0;
  if (h < 0 || h > 23 || mm < 0 || mm > 59 || s < 0 || s > 59) return EMPTY;
  return { h, m: mm, s: showSeconds ? s : 0 };
};

const stringFromParts = (p: Parts, showSeconds: boolean): string | undefined => {
  if (p.h === null || p.m === null) return undefined;
  if (showSeconds && p.s === null) return undefined;
  return showSeconds
    ? `${pad(p.h)}:${pad(p.m)}:${pad(p.s ?? 0)}`
    : `${pad(p.h)}:${pad(p.m)}`;
};

const periodFromHour = (h: number | null): Period =>
  h === null ? "AM" : h < 12 ? "AM" : "PM";

const to12h = (h: number | null): number | null => {
  if (h === null) return null;
  const v = h % 12;
  return v === 0 ? 12 : v;
};

const to24h = (h12: number, period: Period): number => {
  const base = h12 % 12; // 12 -> 0
  return period === "PM" ? base + 12 : base;
};

type SegmentKey = "h" | "m" | "s" | "p";

const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      format = "24h",
      showSeconds = false,
      minuteStep = 1,
      disabled,
      readOnly,
      name,
      id,
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<Parts>(() =>
      partsFromString(defaultValue, showSeconds),
    );
    const parts = isControlled ? partsFromString(value, showSeconds) : internal;

    const commit = React.useCallback(
      (next: Parts) => {
        if (!isControlled) setInternal(next);
        onValueChange?.(stringFromParts(next, showSeconds));
      },
      [isControlled, onValueChange, showSeconds],
    );

    // Per-segment typed-digit buffer. Resets on focus and on segment change.
    const bufferRef = React.useRef<{ key: SegmentKey | null; chars: string }>({
      key: null,
      chars: "",
    });
    const segRefs = React.useRef<Partial<Record<SegmentKey, HTMLDivElement | null>>>({});

    const focusSegment = (k: SegmentKey) => {
      const el = segRefs.current[k];
      if (el) el.focus();
    };

    const advance = (k: SegmentKey) => {
      if (k === "h") focusSegment("m");
      else if (k === "m") focusSegment(showSeconds ? "s" : format === "12h" ? "p" : "m");
      else if (k === "s") focusSegment(format === "12h" ? "p" : "s");
    };

    const setPart = (k: Exclude<SegmentKey, "p">, n: number | null) => {
      const next: Parts = { ...parts, [k]: n };
      commit(next);
    };

    const setPeriod = (p: Period) => {
      if (parts.h === null) {
        commit({ ...parts, h: p === "AM" ? 0 : 12 });
        return;
      }
      const h12 = to12h(parts.h) ?? 12;
      commit({ ...parts, h: to24h(h12, p) });
    };

    const segMax = (k: Exclude<SegmentKey, "p">) =>
      k === "h" ? (format === "12h" ? 12 : 23) : 59;
    const segMin = (k: Exclude<SegmentKey, "p">) =>
      k === "h" && format === "12h" ? 1 : 0;

    const displayHour = format === "12h" ? to12h(parts.h) : parts.h;

    const handleSegmentKeyDown = (
      e: React.KeyboardEvent<HTMLDivElement>,
      k: Exclude<SegmentKey, "p">,
    ) => {
      if (disabled || readOnly) return;
      const max = segMax(k);
      const min = segMin(k);
      const step = k === "m" ? minuteStep : 1;
      const current = k === "h" ? displayHour : parts[k];

      const setFromDisplay = (raw: number) => {
        const clamped = Math.min(Math.max(raw, min), max);
        if (k === "h" && format === "12h") {
          // Convert display hour back to 24h based on current period.
          setPart("h", to24h(clamped === 0 ? 12 : clamped, periodFromHour(parts.h)));
        } else {
          setPart(k, clamped);
        }
      };

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        bufferRef.current = { key: k, chars: "" };
        const dir = e.key === "ArrowUp" ? 1 : -1;
        if (current === null) {
          setFromDisplay(dir > 0 ? min : max);
        } else {
          const range = max - min + 1;
          const next = ((current - min + dir * step) % range + range) % range + min;
          setFromDisplay(next);
        }
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        bufferRef.current = { key: null, chars: "" };
        advance(k);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        bufferRef.current = { key: null, chars: "" };
        if (k === "m") focusSegment("h");
        else if (k === "s") focusSegment("m");
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        bufferRef.current = { key: k, chars: "" };
        setPart(k, null);
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        const buf =
          bufferRef.current.key === k ? bufferRef.current.chars + e.key : e.key;
        const trimmed = buf.length > 2 ? buf.slice(-2) : buf;
        const num = Number(trimmed);
        if (Number.isFinite(num)) {
          setFromDisplay(num);
        }
        bufferRef.current = { key: k, chars: trimmed };
        // Auto-advance after 2 digits or when first digit overflows max tens slot.
        const wouldOverflowTens =
          trimmed.length === 1 && num * 10 > max;
        if (trimmed.length === 2 || wouldOverflowTens) {
          bufferRef.current = { key: null, chars: "" };
          advance(k);
        }
      }
    };

    const handlePeriodKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled || readOnly) return;
      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setPeriod(periodFromHour(parts.h) === "AM" ? "PM" : "AM");
        return;
      }
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        setPeriod("AM");
        return;
      }
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        setPeriod("PM");
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusSegment(showSeconds ? "s" : "m");
      }
    };

    const segmentDisplay = (k: Exclude<SegmentKey, "p">) => {
      const v = k === "h" ? displayHour : parts[k];
      if (v === null) return "––";
      return pad(v);
    };

    const empty = parts.h === null && parts.m === null;
    const period = periodFromHour(parts.h);

    const segmentClass = (k: SegmentKey) => {
      const v =
        k === "p"
          ? period
          : k === "h"
            ? displayHour
            : parts[k as Exclude<SegmentKey, "p">];
      const isEmpty = k === "p" ? empty : v === null;
      return cn(
        "zen-px-1 zen-tabular-nums zen-rounded-zen-sm zen-select-none",
        "focus:zen-outline-none focus-visible:zen-bg-zen-primary-soft focus-visible:zen-text-zen-primary",
        isEmpty && "zen-text-zen-muted-fg",
      );
    };

    const handleFocus = (k: SegmentKey) => () => {
      bufferRef.current = { key: k === "p" ? null : (k as Exclude<SegmentKey, "p">), chars: "" };
    };

    return (
      <div
        ref={ref}
        id={id}
        role="group"
        aria-label={ariaLabel ?? "Time"}
        aria-labelledby={ariaLabelledBy}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        className={cn(
          "zen-inline-flex zen-h-10 zen-items-center zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-text-sm",
          "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-border-zen-primary",
          disabled && "zen-opacity-50 zen-cursor-not-allowed zen-pointer-events-none",
          readOnly && "zen-bg-zen-muted",
          className,
        )}
      >
        <ClockIcon />
        <div className="zen-ml-2 zen-flex zen-items-center zen-gap-0.5 zen-text-zen-foreground">
          <div
            ref={(el) => {
              segRefs.current.h = el;
            }}
            tabIndex={disabled ? -1 : 0}
            role="spinbutton"
            aria-label="Hours"
            aria-valuemin={segMin("h")}
            aria-valuemax={segMax("h")}
            aria-valuenow={displayHour ?? undefined}
            aria-valuetext={parts.h === null ? "empty" : pad(displayHour ?? 0)}
            onKeyDown={(e) => handleSegmentKeyDown(e, "h")}
            onFocus={handleFocus("h")}
            className={segmentClass("h")}
          >
            {segmentDisplay("h")}
          </div>
          <span aria-hidden className="zen-text-zen-muted-fg">
            :
          </span>
          <div
            ref={(el) => {
              segRefs.current.m = el;
            }}
            tabIndex={disabled ? -1 : 0}
            role="spinbutton"
            aria-label="Minutes"
            aria-valuemin={0}
            aria-valuemax={59}
            aria-valuenow={parts.m ?? undefined}
            aria-valuetext={parts.m === null ? "empty" : pad(parts.m)}
            onKeyDown={(e) => handleSegmentKeyDown(e, "m")}
            onFocus={handleFocus("m")}
            className={segmentClass("m")}
          >
            {segmentDisplay("m")}
          </div>
          {showSeconds && (
            <>
              <span aria-hidden className="zen-text-zen-muted-fg">
                :
              </span>
              <div
                ref={(el) => {
                  segRefs.current.s = el;
                }}
                tabIndex={disabled ? -1 : 0}
                role="spinbutton"
                aria-label="Seconds"
                aria-valuemin={0}
                aria-valuemax={59}
                aria-valuenow={parts.s ?? undefined}
                aria-valuetext={parts.s === null ? "empty" : pad(parts.s ?? 0)}
                onKeyDown={(e) => handleSegmentKeyDown(e, "s")}
                onFocus={handleFocus("s")}
                className={segmentClass("s")}
              >
                {segmentDisplay("s")}
              </div>
            </>
          )}
          {format === "12h" && (
            <div
              ref={(el) => {
                segRefs.current.p = el;
              }}
              tabIndex={disabled ? -1 : 0}
              role="spinbutton"
              aria-label="AM/PM"
              aria-valuetext={period}
              onKeyDown={handlePeriodKeyDown}
              onFocus={handleFocus("p")}
              className={cn(segmentClass("p"), "zen-ml-1 zen-uppercase")}
            >
              {period}
            </div>
          )}
        </div>
        {name && (
          <input
            type="hidden"
            name={name}
            value={stringFromParts(parts, showSeconds) ?? ""}
          />
        )}
      </div>
    );
  },
);
TimePicker.displayName = "TimePicker";

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="zen-text-zen-muted-fg"
    aria-hidden
  >
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 16 14" />
  </svg>
);

export { TimePicker };

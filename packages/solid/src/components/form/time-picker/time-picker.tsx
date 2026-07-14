import { type JSX, Show, createMemo, createSignal, mergeProps, splitProps } from "solid-js";
import { cn } from "../../../lib/cn";

/**
 * TimePicker — segmented HH:MM[:SS] input. 24h emitted regardless of
 * display format. Solid port — somewhat tighter than the React version
 * (skips the AM/PM toggle styled affordance; uses inline numeric inputs
 * with arrow-key step instead).
 */

type Format = "24h" | "12h";

export type TimePickerProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "id" | "aria-label"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  format?: Format;
  showSeconds?: boolean;
  minuteStep?: number;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  id?: string;
  class?: string;
  "aria-label"?: string;
};

const pad = (n: number) => n.toString().padStart(2, "0");

interface Parts {
  h: number | null;
  m: number | null;
  s: number | null;
}
const EMPTY: Parts = { h: null, m: null, s: null };

const parsePartsFromString = (v: string | undefined, showSeconds: boolean): Parts => {
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
  return showSeconds
    ? `${pad(p.h)}:${pad(p.m)}:${pad(p.s ?? 0)}`
    : `${pad(p.h)}:${pad(p.m)}`;
};
const to12h = (h: number | null) => (h === null ? null : ((h % 12) || 12));
const periodFromHour = (h: number | null): "AM" | "PM" => (h === null ? "AM" : h < 12 ? "AM" : "PM");
const fromTwelve = (h12: number, period: "AM" | "PM"): number => {
  const base = h12 % 12;
  return period === "PM" ? base + 12 : base;
};

export const TimePicker = (rawProps: TimePickerProps) => {
  const props = mergeProps(
    {
      format: "24h" as Format,
      showSeconds: false,
      minuteStep: 1,
    },
    rawProps,
  );
  const [local, rest] = splitProps(props, [
    "value",
    "defaultValue",
    "onValueChange",
    "format",
    "showSeconds",
    "minuteStep",
    "disabled",
    "readOnly",
    "name",
    "id",
    "class",
    "aria-label",
  ]);
  const isControlled = () => local.value !== undefined;
  const [inner, setInner] = createSignal<string | undefined>(local.defaultValue);
  const current = createMemo<string | undefined>(() =>
    isControlled() ? local.value : inner(),
  );
  const parts = createMemo<Parts>(() => parsePartsFromString(current(), !!local.showSeconds));

  const emit = (next: Parts) => {
    const str = stringFromParts(next, !!local.showSeconds);
    if (!isControlled()) setInner(str);
    local.onValueChange?.(str);
  };

  const setHour = (val: number | null) => {
    const clamped = val === null ? null : Math.max(0, Math.min(23, val));
    emit({ ...parts(), h: clamped });
  };
  const setMinute = (val: number | null) => {
    const clamped = val === null ? null : Math.max(0, Math.min(59, val));
    emit({ ...parts(), m: clamped });
  };
  const setSecond = (val: number | null) => {
    const clamped = val === null ? null : Math.max(0, Math.min(59, val));
    emit({ ...parts(), s: clamped });
  };

  const period = createMemo<"AM" | "PM">(() => periodFromHour(parts().h));
  const togglePeriod = () => {
    const p = parts();
    if (p.h === null) return;
    const newPeriod: "AM" | "PM" = period() === "AM" ? "PM" : "AM";
    setHour(fromTwelve(to12h(p.h) ?? 12, newPeriod));
  };

  const segmentStyle =
    "zen-h-9 zen-w-10 zen-inline-flex zen-items-center zen-justify-center zen-text-sm zen-tabular-nums " +
    "zen-bg-transparent zen-border zen-border-zen-border zen-rounded-zen-sm zen-text-center " +
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";

  const handleArrow = (
    e: KeyboardEvent,
    cur: number | null,
    set: (v: number | null) => void,
    max: number,
    step = 1,
  ) => {
    if (local.readOnly || local.disabled) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      set(cur === null ? 0 : (cur + step) % (max + 1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      set(cur === null ? max : (cur - step + max + 1) % (max + 1));
    } else if (e.key === "Backspace") {
      set(null);
    }
  };

  return (
    <div
      {...rest}
      id={local.id}
      class={cn("zen-inline-flex zen-items-center zen-gap-1", local.class)}
      role="group"
      aria-label={local["aria-label"] ?? "Time"}
    >
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        value={
          parts().h === null
            ? ""
            : local.format === "12h"
              ? pad(to12h(parts().h) as number)
              : pad(parts().h as number)
        }
        onInput={(e) => {
          const v = e.currentTarget.value.replace(/\D/g, "");
          if (v === "") {
            setHour(null);
            return;
          }
          const num = Number(v);
          if (local.format === "12h") {
            const valid = Math.max(1, Math.min(12, num));
            setHour(fromTwelve(valid, period()));
          } else {
            setHour(Math.min(23, num));
          }
        }}
        onKeyDown={(e) =>
          handleArrow(e, parts().h, (v) => {
            if (local.format === "12h" && v !== null) {
              setHour(fromTwelve(((v - 1 + 12) % 12) + 1, period()));
            } else {
              setHour(v === null ? null : v % 24);
            }
          }, 23)
        }
        disabled={local.disabled}
        readOnly={local.readOnly}
        class={segmentStyle}
        aria-label="Hours"
      />
      <span class="zen-text-zen-muted-fg">:</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        value={parts().m === null ? "" : pad(parts().m as number)}
        onInput={(e) => {
          const v = e.currentTarget.value.replace(/\D/g, "");
          if (v === "") {
            setMinute(null);
            return;
          }
          setMinute(Math.min(59, Number(v)));
        }}
        onKeyDown={(e) => handleArrow(e, parts().m, setMinute, 59, local.minuteStep)}
        disabled={local.disabled}
        readOnly={local.readOnly}
        class={segmentStyle}
        aria-label="Minutes"
      />
      <Show when={local.showSeconds}>
        <span class="zen-text-zen-muted-fg">:</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={parts().s === null ? "" : pad(parts().s as number)}
          onInput={(e) => {
            const v = e.currentTarget.value.replace(/\D/g, "");
            setSecond(v === "" ? null : Math.min(59, Number(v)));
          }}
          onKeyDown={(e) => handleArrow(e, parts().s, setSecond, 59)}
          disabled={local.disabled}
          readOnly={local.readOnly}
          class={segmentStyle}
          aria-label="Seconds"
        />
      </Show>
      <Show when={local.format === "12h"}>
        <button
          type="button"
          onClick={togglePeriod}
          disabled={local.disabled || local.readOnly}
          class={cn(
            "zen-h-9 zen-px-2 zen-text-xs zen-font-medium zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-transparent zen-cursor-pointer",
            "hover:zen-bg-zen-muted",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          )}
        >
          {period()}
        </button>
      </Show>
      <Show when={local.name}>
        <input type="hidden" name={local.name} value={current() ?? ""} />
      </Show>
    </div>
  );
};

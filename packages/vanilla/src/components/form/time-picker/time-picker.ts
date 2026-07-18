import { cn } from "../../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../../lib/component";

/**
 * TimePicker — segmented numeric time input.
 *
 *   const tp = TimePicker({ value: time, onValueChange: setTime }); // "HH:MM" 24h
 *   document.body.append(tp.el);
 *
 * Segments behave like Apple / Google date-time inputs: type two digits,
 * focus auto-advances; arrow up/down increment with wrap; backspace clears.
 * The emitted value is ALWAYS 24-hour `HH:MM` (or `HH:MM:SS` with
 * `showSeconds`), regardless of the displayed 12h/24h format. A hidden
 * <input> mirrors the value so the picker submits inside native forms.
 *
 * The React reference stores its part state internally (not the joined string)
 * so a half-entered time — hour set, minute still empty — survives; this port
 * does the same rather than round-tripping through `controllable()`, which would
 * collapse a partial time to `undefined` and lose the typed hour.
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
  class?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
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
type NumSegment = Exclude<SegmentKey, "p">;

export type TimePickerHandle = ZenComponent<TimePickerProps, HTMLDivElement>;

const clockIcon = (): SVGSVGElement => {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "14");
  svg.setAttribute("height", "14");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "zen-text-zen-muted-fg");
  const circle = document.createElementNS(ns, "circle");
  circle.setAttribute("cx", "12");
  circle.setAttribute("cy", "12");
  circle.setAttribute("r", "9");
  const poly = document.createElementNS(ns, "polyline");
  poly.setAttribute("points", "12 7 12 12 16 14");
  svg.append(circle, poly);
  return svg;
};

export function TimePicker(props: TimePickerProps = {}): TimePickerHandle {
  let current: TimePickerProps = { ...props };
  const disposer = new Disposer();

  const showSeconds = () => Boolean(current.showSeconds);
  const format = (): Format => current.format ?? "24h";
  const minuteStep = () => current.minuteStep ?? 1;

  const isControlled = () => current.value !== undefined;
  // Owned only while uncontrolled. Controlled runs derive parts from `value`.
  let internal: Parts = partsFromString(current.defaultValue, Boolean(current.showSeconds));

  const getParts = (): Parts =>
    isControlled() ? partsFromString(current.value, showSeconds()) : internal;

  const commit = (next: Parts) => {
    if (!isControlled()) internal = next;
    current.onValueChange?.(stringFromParts(next, showSeconds()));
    render();
  };

  // Per-segment typed-digit buffer. Resets on focus and on segment change.
  let buffer: { key: SegmentKey | null; chars: string } = { key: null, chars: "" };

  const segEls: Partial<Record<SegmentKey, HTMLDivElement>> = {};
  const colonEls: HTMLElement[] = [];

  const focusSegment = (k: SegmentKey) => {
    segEls[k]?.focus();
  };

  const advance = (k: SegmentKey) => {
    if (k === "h") focusSegment("m");
    else if (k === "m") focusSegment(showSeconds() ? "s" : format() === "12h" ? "p" : "m");
    else if (k === "s") focusSegment(format() === "12h" ? "p" : "s");
  };

  const setPart = (k: NumSegment, n: number | null) => {
    commit({ ...getParts(), [k]: n });
  };

  const setPeriod = (p: Period) => {
    const parts = getParts();
    if (parts.h === null) {
      commit({ ...parts, h: p === "AM" ? 0 : 12 });
      return;
    }
    const h12 = to12h(parts.h) ?? 12;
    commit({ ...parts, h: to24h(h12, p) });
  };

  const segMax = (k: NumSegment) => (k === "h" ? (format() === "12h" ? 12 : 23) : 59);
  const segMin = (k: NumSegment) => (k === "h" && format() === "12h" ? 1 : 0);

  const displayHour = () => (format() === "12h" ? to12h(getParts().h) : getParts().h);

  const handleSegmentKeyDown = (e: KeyboardEvent, k: NumSegment) => {
    if (current.disabled || current.readOnly) return;
    const parts = getParts();
    const max = segMax(k);
    const min = segMin(k);
    const step = k === "m" ? minuteStep() : 1;
    const current12 = k === "h" ? displayHour() : parts[k];

    const setFromDisplay = (raw: number) => {
      const clamped = Math.min(Math.max(raw, min), max);
      if (k === "h" && format() === "12h") {
        // Convert display hour back to 24h based on current period.
        setPart("h", to24h(clamped === 0 ? 12 : clamped, periodFromHour(parts.h)));
      } else {
        setPart(k, clamped);
      }
    };

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      buffer = { key: k, chars: "" };
      const dir = e.key === "ArrowUp" ? 1 : -1;
      if (current12 === null) {
        setFromDisplay(dir > 0 ? min : max);
      } else {
        const range = max - min + 1;
        const next = ((((current12 - min + dir * step) % range) + range) % range) + min;
        setFromDisplay(next);
      }
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      buffer = { key: null, chars: "" };
      advance(k);
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      buffer = { key: null, chars: "" };
      if (k === "m") focusSegment("h");
      else if (k === "s") focusSegment("m");
      return;
    }
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      buffer = { key: k, chars: "" };
      setPart(k, null);
      return;
    }
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const buf = buffer.key === k ? buffer.chars + e.key : e.key;
      const trimmed = buf.length > 2 ? buf.slice(-2) : buf;
      const num = Number(trimmed);
      if (Number.isFinite(num)) {
        setFromDisplay(num);
      }
      buffer = { key: k, chars: trimmed };
      // Auto-advance after 2 digits or when first digit overflows max tens slot.
      const wouldOverflowTens = trimmed.length === 1 && num * 10 > max;
      if (trimmed.length === 2 || wouldOverflowTens) {
        buffer = { key: null, chars: "" };
        advance(k);
      }
    }
  };

  const handlePeriodKeyDown = (e: KeyboardEvent) => {
    if (current.disabled || current.readOnly) return;
    const parts = getParts();
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
      focusSegment(showSeconds() ? "s" : "m");
    }
  };

  const handleFocus = (k: SegmentKey) => () => {
    buffer = { key: k === "p" ? null : (k as NumSegment), chars: "" };
  };

  const segmentDisplay = (k: NumSegment): string => {
    const v = k === "h" ? displayHour() : getParts()[k];
    if (v === null) return "––";
    return pad(v);
  };

  const segmentClass = (k: SegmentKey): string => {
    const parts = getParts();
    const empty = parts.h === null && parts.m === null;
    const period = periodFromHour(parts.h);
    const v =
      k === "p" ? period : k === "h" ? displayHour() : parts[k as NumSegment];
    const isEmpty = k === "p" ? empty : v === null;
    return cn(
      "zen-px-1 zen-tabular-nums zen-rounded-zen-sm zen-select-none",
      "focus:zen-outline-none focus-visible:zen-bg-zen-primary-soft focus-visible:zen-text-zen-primary",
      isEmpty && "zen-text-zen-muted-fg",
    );
  };

  // --- DOM -----------------------------------------------------------------

  const el = document.createElement("div");
  el.setAttribute("role", "group");

  const inner = document.createElement("div");
  inner.className = "zen-ml-2 zen-flex zen-items-center zen-gap-0.5 zen-text-zen-foreground";

  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";

  const makeColon = (): HTMLElement => {
    const span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");
    span.className = "zen-text-zen-muted-fg";
    span.textContent = ":";
    return span;
  };

  const makeNumSegment = (k: NumSegment, label: string): HTMLDivElement => {
    const seg = document.createElement("div");
    seg.setAttribute("role", "spinbutton");
    seg.setAttribute("aria-label", label);
    const onKey = (e: KeyboardEvent) => handleSegmentKeyDown(e, k);
    const onFoc = handleFocus(k);
    seg.addEventListener("keydown", onKey);
    seg.addEventListener("focus", onFoc);
    disposer.add(() => seg.removeEventListener("keydown", onKey));
    disposer.add(() => seg.removeEventListener("focus", onFoc));
    segEls[k] = seg;
    return seg;
  };

  const makePeriodSegment = (): HTMLDivElement => {
    const seg = document.createElement("div");
    seg.setAttribute("role", "spinbutton");
    seg.setAttribute("aria-label", "AM/PM");
    const onKey = (e: KeyboardEvent) => handlePeriodKeyDown(e);
    const onFoc = handleFocus("p");
    seg.addEventListener("keydown", onKey);
    seg.addEventListener("focus", onFoc);
    disposer.add(() => seg.removeEventListener("keydown", onKey));
    disposer.add(() => seg.removeEventListener("focus", onFoc));
    segEls.p = seg;
    return seg;
  };

  // Build every possible segment once; visibility is toggled in render() so a
  // format/showSeconds change is a re-parent, never a rebuild that would drop
  // focus or leak the listeners registered above.
  const hSeg = makeNumSegment("h", "Hours");
  const mSeg = makeNumSegment("m", "Minutes");
  const sSeg = makeNumSegment("s", "Seconds");
  const pSeg = makePeriodSegment();
  const colonHM = makeColon();
  const colonMS = makeColon();
  colonEls.push(colonHM, colonMS);

  el.append(clockIcon(), inner);

  let removeProps: (() => void) | undefined;

  function render(): void {
    const parts = getParts();
    const fmt = format();
    const withSeconds = showSeconds();
    const disabled = Boolean(current.disabled);
    const readOnly = Boolean(current.readOnly);

    el.className = cn(
      "zen-inline-flex zen-h-10 zen-items-center zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-text-sm",
      "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-border-zen-primary",
      disabled && "zen-opacity-50 zen-cursor-not-allowed zen-pointer-events-none",
      readOnly && "zen-bg-zen-muted",
      current.class,
    );

    // Assemble the visible segment order for the current format.
    const children: Node[] = [hSeg, colonHM, mSeg];
    if (withSeconds) children.push(colonMS, sSeg);
    if (fmt === "12h") children.push(pSeg);
    inner.replaceChildren(...children);

    const tabIndex = disabled ? -1 : 0;
    const updateNum = (seg: HTMLDivElement, k: NumSegment) => {
      seg.tabIndex = tabIndex;
      seg.className = segmentClass(k);
      seg.textContent = segmentDisplay(k);
      const displayed = k === "h" ? displayHour() : parts[k];
      seg.setAttribute("aria-valuemin", String(segMin(k)));
      seg.setAttribute("aria-valuemax", String(segMax(k)));
      if (displayed === null) {
        seg.removeAttribute("aria-valuenow");
        seg.setAttribute("aria-valuetext", "empty");
      } else {
        seg.setAttribute("aria-valuenow", String(displayed));
        seg.setAttribute("aria-valuetext", pad(displayed));
      }
    };
    updateNum(hSeg, "h");
    updateNum(mSeg, "m");
    if (withSeconds) updateNum(sSeg, "s");

    if (fmt === "12h") {
      const period = periodFromHour(parts.h);
      pSeg.tabIndex = tabIndex;
      pSeg.className = cn(segmentClass("p"), "zen-ml-1 zen-uppercase");
      pSeg.textContent = period;
      pSeg.setAttribute("aria-valuetext", period);
    }

    // aria on the group
    el.setAttribute("aria-label", current["aria-label"] ?? "Time");
    if (current["aria-labelledby"] !== undefined) {
      el.setAttribute("aria-labelledby", String(current["aria-labelledby"]));
    } else {
      el.removeAttribute("aria-labelledby");
    }
    if (disabled) el.setAttribute("aria-disabled", "true");
    else el.removeAttribute("aria-disabled");
    if (readOnly) el.setAttribute("aria-readonly", "true");
    else el.removeAttribute("aria-readonly");
    if (current.id !== undefined) el.id = current.id;
    else el.removeAttribute("id");

    // Hidden form input mirrors the emitted value.
    if (current.name) {
      hiddenInput.name = current.name;
      hiddenInput.value = stringFromParts(parts, withSeconds) ?? "";
      if (!hiddenInput.isConnected) el.append(hiddenInput);
    } else if (hiddenInput.isConnected) {
      hiddenInput.remove();
    }

    // Forward leftover data-*/aria-* (beyond label/labelledby) onto the group.
    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(current)) {
      if (k === "aria-label" || k === "aria-labelledby") continue;
      if (k.startsWith("data-") || k.startsWith("aria-")) rest[k] = v;
    }
    removeProps?.();
    removeProps = applyProps(el, rest);
  }

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      const prevControlled = isControlled();
      current = { ...current, ...next };
      // Leaving controlled mode seeds the owned state from the last value.
      if (prevControlled && !isControlled()) {
        internal = partsFromString(next.value, showSeconds());
      }
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

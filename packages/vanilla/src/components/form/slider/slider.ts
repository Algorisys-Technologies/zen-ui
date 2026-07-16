import { cn } from "../../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../../lib/component";
import { controllable } from "../../../lib/state";

/**
 * Slider — single-thumb or range (multi-thumb), the vanilla port of the
 * Radix-backed React Slider.
 *
 *   Slider({ defaultValue: [50], max: 100, step: 1 })
 *   Slider({ defaultValue: [20, 80], max: 100, step: 1 })
 *   Slider({ defaultValue: [3], min: 1, max: 5,
 *            marks: [{ value: 1, label: "Never" }, …] })
 *
 * Radix supplies pointer drag, keyboard control (Arrow / PgUp / PgDn / Home /
 * End), ARIA and orientation for free. With no primitive library those are
 * this file's job — written out below, not reinvented from a framework.
 *
 * The value is always an array, controlled or not, so a single-thumb slider is
 * `[n]` and a range is `[lo, hi]`: the shape is what decides how many thumbs
 * render. That mirrors React's Radix API exactly (`value` / `defaultValue` /
 * `onValueChange` are `number[]`).
 */

export interface SliderMark {
  value: number;
  /** Rendered under the tick. A tick with no label is just a tick. */
  label?: string;
}

export interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  /** Fired once when a drag or key interaction settles, with the final value. */
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  /** Emitted as hidden inputs so the slider submits inside a native form. */
  name?: string;
  /**
   * Tick marks along the track, with optional labels.
   *
   * Marks are decoration over the scale, not the scale itself: `step` still
   * decides which values are reachable. Marks at values `step` cannot land on
   * would draw a tick the thumb can never sit on.
   *
   * Horizontal only. A vertical slider needs the ticks laid out down the track,
   * and nothing here needed that yet — rather than ship a broken half, marks are
   * ignored when orientation="vertical".
   */
  marks?: SliderMark[];
  class?: string;
  id?: string;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

const arraysEqual = (a: number[], b: number[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

/** Kill float drift from repeated step arithmetic (0.1 + 0.2 …). */
const clean = (n: number) => Math.round(n * 1e6) / 1e6;

export function Slider(props: SliderProps): ZenComponent<SliderProps> {
  let current: SliderProps = { ...props };
  const el = document.createElement("span");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const state = controllable<number[]>({
    value: current.value,
    defaultValue: current.defaultValue ?? [current.min ?? 0],
    onChange: (v) => current.onValueChange?.(v),
    equals: arraysEqual,
  });

  // Persistent nodes: rebuilt content, stable identity so the pointer listener
  // on the root never dangles.
  const track = document.createElement("span");
  const range = document.createElement("span");
  let thumbEls: HTMLElement[] = [];
  let marksLayer: HTMLElement | null = null;
  let hiddenInputs: HTMLInputElement[] = [];

  const minOf = () => current.min ?? 0;
  const maxOf = () => current.max ?? 100;
  const stepOf = () => current.step ?? 1;
  const isVertical = () => current.orientation === "vertical";

  /** Where a value sits along the track, 0–100. */
  const percent = (v: number) => {
    const min = minOf();
    const max = maxOf();
    return max === min ? 0 : Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  };

  /** Snap a raw value to the step grid and clamp to [min, max]. */
  const snap = (raw: number) => {
    const min = minOf();
    const max = maxOf();
    const step = stepOf();
    const snapped = Math.round((raw - min) / step) * step + min;
    return clean(Math.max(min, Math.min(max, snapped)));
  };

  /** Keep a thumb between its neighbours so thumbs never cross. */
  const clampToNeighbours = (values: number[], idx: number, v: number) => {
    const lo = idx > 0 ? values[idx - 1] : minOf();
    const hi = idx < values.length - 1 ? values[idx + 1] : maxOf();
    return Math.max(lo, Math.min(hi, v));
  };

  const paint = () => {
    const values = state.get();
    const disabled = Boolean(current.disabled);
    const vertical = isVertical();

    // Range fill: from the low end (or 0 for a single thumb) to the high end.
    const single = values.length === 1;
    const startP = single ? 0 : percent(Math.min(...values));
    const endP = percent(Math.max(...values));
    range.style.cssText = "";
    range.style.position = "absolute";
    if (vertical) {
      range.style.bottom = `${startP}%`;
      range.style.top = `${100 - endP}%`;
    } else {
      range.style.left = `${startP}%`;
      range.style.right = `${100 - endP}%`;
    }

    thumbEls.forEach((thumb, i) => {
      const p = percent(values[i]);
      thumb.style.position = "absolute";
      if (vertical) {
        thumb.style.left = "50%";
        thumb.style.bottom = `${p}%`;
        thumb.style.top = "";
        thumb.style.right = "";
        thumb.style.transform = "translate(-50%, 50%)";
      } else {
        thumb.style.left = `${p}%`;
        thumb.style.top = "50%";
        thumb.style.bottom = "";
        thumb.style.right = "";
        thumb.style.transform = "translate(-50%, -50%)";
      }
      thumb.setAttribute("aria-valuenow", String(values[i]));
      thumb.setAttribute("aria-valuemin", String(minOf()));
      thumb.setAttribute("aria-valuemax", String(maxOf()));
      thumb.tabIndex = disabled ? -1 : 0;
    });

    hiddenInputs.forEach((input, i) => (input.value = String(values[i])));
  };

  /** Pointer position → snapped value, read from the track's own rect. */
  const valueFromPointer = (clientX: number, clientY: number) => {
    const rect = track.getBoundingClientRect();
    const pct = isVertical()
      ? rect.height === 0
        ? 0
        : (rect.bottom - clientY) / rect.height
      : rect.width === 0
        ? 0
        : (clientX - rect.left) / rect.width;
    const min = minOf();
    const max = maxOf();
    return snap(min + Math.max(0, Math.min(1, pct)) * (max - min));
  };

  const nearestIndex = (values: number[], v: number) => {
    let idx = 0;
    let best = Infinity;
    values.forEach((tv, i) => {
      const d = Math.abs(tv - v);
      if (d < best) {
        best = d;
        idx = i;
      }
    });
    return idx;
  };

  const setThumb = (idx: number, v: number) => {
    const values = [...state.get()];
    values[idx] = clampToNeighbours(values, idx, v);
    state.set(values);
  };

  let activeIndex = -1;

  const onPointerDown = (e: PointerEvent) => {
    if (current.disabled || e.button !== 0) return;
    e.preventDefault();
    const values = state.get();
    const v = valueFromPointer(e.clientX, e.clientY);
    activeIndex = nearestIndex(values, v);
    setThumb(activeIndex, v);
    thumbEls[activeIndex]?.focus();
    el.setPointerCapture?.(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      if (activeIndex < 0) return;
      setThumb(activeIndex, valueFromPointer(ev.clientX, ev.clientY));
    };
    const onUp = () => {
      activeIndex = -1;
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      current.onValueCommit?.(state.get());
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
  };

  const onThumbKey = (idx: number, e: KeyboardEvent) => {
    if (current.disabled) return;
    const step = stepOf();
    const big = step * 10;
    const values = [...state.get()];
    let v = values[idx];
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        v += step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        v -= step;
        break;
      case "PageUp":
        v += big;
        break;
      case "PageDown":
        v -= big;
        break;
      case "Home":
        v = minOf();
        break;
      case "End":
        v = maxOf();
        break;
      default:
        return;
    }
    e.preventDefault();
    setThumb(idx, clean(Math.max(minOf(), Math.min(maxOf(), v))));
    current.onValueCommit?.(state.get());
  };

  const render = () => {
    const {
      value: _v,
      defaultValue: _dv,
      onValueChange: _oc,
      onValueCommit: _ocm,
      min: _min,
      max: _max,
      step: _step,
      disabled,
      orientation,
      name,
      marks,
      class: className,
      id: _id,
      ...rest
    } = current;

    const values = state.get();
    const vertical = orientation === "vertical";
    const showMarks = Boolean(marks?.length) && !vertical;
    const hasLabels = Boolean(marks?.some((m) => m.label !== undefined));

    el.className = cn(
      "zen-relative zen-flex zen-w-full zen-touch-none zen-select-none zen-items-center",
      "data-[orientation=vertical]:zen-h-full data-[orientation=vertical]:zen-w-2 data-[orientation=vertical]:zen-flex-col",
      // The marks layer is absolutely positioned, so it reserves no height of
      // its own. Without this the labels sit on top of whatever follows.
      showMarks && (hasLabels ? "zen-mb-7" : "zen-mb-3"),
      className,
    );
    el.setAttribute("data-orientation", vertical ? "vertical" : "horizontal");
    if (disabled) el.setAttribute("data-disabled", "");
    else el.removeAttribute("data-disabled");

    track.className = cn(
      "zen-relative zen-h-2 zen-w-full zen-grow zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted",
      "data-[orientation=vertical]:zen-h-full data-[orientation=vertical]:zen-w-2",
    );
    track.setAttribute("data-orientation", vertical ? "vertical" : "horizontal");

    range.className = cn(
      "zen-absolute zen-h-full zen-bg-zen-primary",
      "data-[orientation=vertical]:zen-w-full",
    );
    range.setAttribute("data-orientation", vertical ? "vertical" : "horizontal");
    track.replaceChildren(range);

    // Thumbs: one per value. Rebuilt so a controlled switch from single to range
    // grows the right number.
    thumbEls = values.map((_, i) => {
      const thumb = document.createElement("span");
      thumb.setAttribute("role", "slider");
      thumb.setAttribute("aria-orientation", vertical ? "vertical" : "horizontal");
      thumb.setAttribute("data-orientation", vertical ? "vertical" : "horizontal");
      if (disabled) {
        thumb.setAttribute("aria-disabled", "true");
        thumb.setAttribute("data-disabled", "");
      }
      thumb.className = cn(
        "zen-block zen-h-5 zen-w-5 zen-rounded-zen-full zen-border-2 zen-border-zen-primary zen-bg-zen-background",
        "zen-transition-colors",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-pointer-events-none disabled:zen-opacity-50",
      );
      thumb.addEventListener("keydown", (e) => onThumbKey(i, e));
      return thumb;
    });

    // Hidden inputs for form submission (Radix ships these too).
    hiddenInputs = name
      ? values.map(() => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          return input;
        })
      : [];

    // Marks layer — outside the Track on purpose: the Track is overflow-hidden,
    // so ticks at the ends would be sliced in half by their own container.
    marksLayer = null;
    if (showMarks) {
      const layer = document.createElement("span");
      layer.setAttribute("aria-hidden", "true");
      // pointer-events-none so a tick never eats a click meant for the track.
      layer.className = "zen-pointer-events-none zen-absolute zen-inset-x-0 zen-top-full zen-mt-1";
      for (const m of marks!) {
        const wrap = document.createElement("span");
        wrap.className = "zen-absolute zen-flex zen-flex-col zen-items-center zen-gap-1";
        // Computed, so inline: a class per percentage would be a class UnoCSS
        // never sees and never generates.
        wrap.style.left = `${percent(m.value)}%`;
        wrap.style.transform = "translateX(-50%)";
        const tick = document.createElement("span");
        tick.className = "zen-h-1.5 zen-w-px zen-bg-zen-border";
        wrap.append(tick);
        if (m.label !== undefined) {
          const lbl = document.createElement("span");
          lbl.className = "zen-whitespace-nowrap zen-text-xs zen-text-zen-muted-fg";
          lbl.textContent = String(m.label);
          wrap.append(lbl);
        }
        layer.append(wrap);
      }
      marksLayer = layer;
    }

    el.replaceChildren(track, ...thumbEls, ...hiddenInputs, ...(marksLayer ? [marksLayer] : []));

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);

    paint();
  };

  el.addEventListener("pointerdown", onPointerDown);
  render();
  disposer.add(state.subscribe(paint));
  disposer.add(() => el.removeEventListener("pointerdown", onPointerDown));
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

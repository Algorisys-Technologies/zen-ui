import { cn } from "../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../lib/component";
import { controllable } from "../../lib/state";

/**
 * NPS — Net Promoter Score input. The canonical "How likely are you to
 * recommend us to a friend?" question rendered as an 0–10 strip with
 * promoter / detractor cues. Vanilla port of the React reference.
 *
 *   const nps = NPS({ onValueChange: (n) => console.log("nps:", n) });
 *   document.body.append(nps.el);
 *
 * Score buckets follow the standard NPS definition:
 *   - 0–6 detractors  → tinted with destructive-soft
 *   - 7–8 passives    → tinted with warning-soft
 *   - 9–10 promoters  → tinted with success-soft
 *
 * The selected score gets the saturated equivalent of its bucket. Below the
 * strip, low/high anchor labels surface the meaning of the extremes (override
 * via `lowLabel` / `highLabel`).
 *
 * Semantically a radiogroup with one radio per integer — full keyboard nav
 * (arrows + Home/End) comes for free.
 */

export interface NPSProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Accessible name for the radiogroup. Default question copy. */
  label?: string;
  /** Anchor label under the leftmost button. Default "Not at all likely". */
  lowLabel?: string;
  /** Anchor label under the rightmost button. Default "Extremely likely". */
  highLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  class?: string;
  /** Optional hidden input name for native form submission. */
  name?: string;
  /** Show the score-bucket caption ("You're a Promoter") under the
   *  selection. Default true. */
  showBucket?: boolean;
}

type Bucket = "detractor" | "passive" | "promoter";

const bucketOf = (n: number): Bucket => (n <= 6 ? "detractor" : n <= 8 ? "passive" : "promoter");

const bucketLabel: Record<Bucket, string> = {
  detractor: "Detractor",
  passive: "Passive",
  promoter: "Promoter",
};

const buttonClass = (n: number, selected: boolean, disabled?: boolean, readOnly?: boolean): string => {
  const bucket = bucketOf(n);
  return cn(
    "zen-h-9 zen-min-w-9 zen-px-2",
    "zen-inline-flex zen-items-center zen-justify-center",
    "zen-text-sm zen-font-medium zen-tabular-nums",
    "zen-rounded-zen-sm zen-border zen-cursor-pointer zen-transition-colors",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
    /* unselected — soft bucket tint */
    !selected && [
      "zen-bg-zen-background",
      bucket === "detractor" && "zen-border-zen-error-soft zen-text-zen-error-soft-fg hover:zen-bg-zen-error-soft",
      bucket === "passive" && "zen-border-zen-warning-soft zen-text-zen-warning-soft-fg hover:zen-bg-zen-warning-soft",
      bucket === "promoter" && "zen-border-zen-success-soft zen-text-zen-success-soft-fg hover:zen-bg-zen-success-soft",
    ],
    /* selected — saturated bucket fill */
    selected && [
      bucket === "detractor" && "zen-bg-zen-error zen-text-zen-error-fg zen-border-zen-error",
      bucket === "passive" && "zen-bg-zen-warning zen-text-zen-warning-fg zen-border-zen-warning",
      bucket === "promoter" && "zen-bg-zen-success zen-text-zen-success-fg zen-border-zen-success",
    ],
    (disabled || readOnly) && "zen-cursor-default",
    disabled && "hover:!zen-bg-zen-background",
  );
};

const captionClass = (value: number): string =>
  cn(
    "zen-text-xs zen-mt-1 zen-m-0 zen-font-medium",
    bucketOf(value) === "detractor" && "zen-text-zen-error",
    bucketOf(value) === "passive" && "zen-text-zen-warning-soft-fg",
    bucketOf(value) === "promoter" && "zen-text-zen-success",
  );

export function NPS(props: NPSProps = {}): ZenComponent<NPSProps> {
  let current: NPSProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const state = controllable<number | undefined>({
    value: current.value,
    defaultValue: current.defaultValue,
    onChange: (v) => {
      if (v !== undefined) current.onValueChange?.(v);
    },
  });

  const el = document.createElement("div");
  el.setAttribute("role", "radiogroup");

  const strip = document.createElement("div");
  strip.className = "zen-flex zen-items-center zen-gap-1 zen-overflow-x-auto";

  const scores = Array.from({ length: 11 }, (_, i) => i);
  const buttons: Array<{ n: number; button: HTMLButtonElement }> = [];

  for (const n of scores) {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "radio");
    button.textContent = String(n);

    const onClick = () => {
      if (!current.disabled && !current.readOnly) state.set(n);
    };
    button.addEventListener("click", onClick);
    disposer.add(() => button.removeEventListener("click", onClick));

    strip.append(button);
    buttons.push({ n, button });
  }

  const anchors = document.createElement("div");
  anchors.className = "zen-flex zen-justify-between zen-text-xs zen-text-zen-muted-fg zen-px-1";
  const lowSpan = document.createElement("span");
  const highSpan = document.createElement("span");
  anchors.append(lowSpan, highSpan);

  const caption = document.createElement("p");
  caption.setAttribute("aria-live", "polite");

  const hidden = document.createElement("input");
  hidden.type = "hidden";

  el.append(strip, anchors);

  const onKeyDown = (e: KeyboardEvent) => {
    if (current.disabled || current.readOnly) return;
    const value = state.get();
    if (value === undefined) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      state.set(Math.min(10, value + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      state.set(Math.max(0, value - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      state.set(0);
    } else if (e.key === "End") {
      e.preventDefault();
      state.set(10);
    }
  };
  el.addEventListener("keydown", onKeyDown);
  disposer.add(() => el.removeEventListener("keydown", onKeyDown));

  const paintStatic = () => {
    const {
      label = "How likely are you to recommend us?",
      lowLabel = "Not at all likely",
      highLabel = "Extremely likely",
      disabled,
      readOnly,
      class: className,
      value: _v,
      defaultValue: _dv,
      onValueChange: _ov,
      name: _n,
      showBucket: _sb,
      ...rest
    } = current;

    el.className = cn(
      // flex (not inline-flex) + max-w-full so it fits its container; the
      // 0–10 strip scrolls horizontally on narrow widths instead of clipping
      "zen-flex zen-flex-col zen-gap-2 zen-max-w-full",
      disabled && "zen-opacity-50",
      className,
    );
    if (disabled) el.setAttribute("aria-disabled", "true");
    else el.removeAttribute("aria-disabled");
    if (readOnly) el.setAttribute("aria-readonly", "true");
    else el.removeAttribute("aria-readonly");
    el.setAttribute("aria-label", label);

    lowSpan.textContent = lowLabel;
    highSpan.textContent = highLabel;

    for (const { n, button } of buttons) {
      button.setAttribute(
        "aria-label",
        `${n}${n === 0 ? " — " + lowLabel : n === 10 ? " — " + highLabel : ""}`,
      );
      button.disabled = !!disabled;
    }

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  const paintValue = () => {
    const value = state.get();
    const { disabled, readOnly, showBucket = true, name } = current;

    for (const { n, button } of buttons) {
      const selected = value === n;
      button.setAttribute("aria-checked", String(selected));
      button.tabIndex = selected || (value === undefined && n === 0) ? 0 : -1;
      button.className = buttonClass(n, selected, disabled, readOnly);
    }

    // bucket caption — present only when a value is set and showBucket is on
    if (showBucket && value !== undefined) {
      caption.className = captionClass(value);
      caption.textContent = `${value} · ${bucketLabel[bucketOf(value)]}`;
      if (caption.parentNode !== el) el.append(caption);
    } else if (caption.parentNode === el) {
      caption.remove();
    }

    // hidden input — native form submission
    if (name && value !== undefined) {
      hidden.name = name;
      hidden.value = String(value);
      if (hidden.parentNode !== el) el.append(hidden);
    } else if (hidden.parentNode === el) {
      hidden.remove();
    }
  };

  paintStatic();
  paintValue();
  disposer.add(state.subscribe(paintValue));
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);
      paintStatic();
      paintValue();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

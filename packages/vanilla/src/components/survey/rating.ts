import { cn } from "../../lib/cn";
import { arrowStep } from "@algorisys/zen-ui-core";
import {
  applyProps,
  Disposer,
  type BaseProps,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";

/**
 * Rating — the vanilla port of the React reference.
 *
 *   let stars = 0;
 *   const r = Rating({
 *     value: stars,
 *     onValueChange: (v) => { stars = v; r.update({ value: v }); },
 *     label: "Rate the support agent",
 *   });
 *   document.body.append(r.el);
 *
 * 5-star (or N-star) rating input. Semantically a radiogroup (per WAI-ARIA
 * Authoring Practices § "Rating") so screen readers announce "1 of 5", "2 of 5"
 * on arrow-key nav. Hover preview tints stars up to the pointed-at index but does
 * not commit until click. Click an already-selected star to clear the rating
 * (skip via `allowClear: false`).
 *
 * `allowHalf` keeps all of that and doubles the options: each star grows a left
 * and a right hit target, arrows step by 0.5, and the radios announce "2.5
 * stars". The stars stay whole — it is the options that halve, not the picture.
 *
 * ## What Radix/React supplied, written out
 *
 * There is no framework here: `controllable` gives controlled / uncontrolled
 * `value`, the arrow-key handler is the radiogroup keyboard story hand-written,
 * hover is a plain closure variable that repaints on mouse events, and a hidden
 * `<input>` carries the value into a native form submission.
 *
 * ## State vocabulary
 *
 * The options are `<button role="radio">` and carry `aria-checked`, matching
 * React. See PORTING.md.
 */

export type RatingSize = "sm" | "md" | "lg";

export interface RatingProps extends BaseProps {
  /** Controlled. Present → the caller owns the value; we never write it. */
  value?: number;
  /** Uncontrolled initial value. */
  defaultValue?: number;
  /** Fires on every change, controlled or not, with the value to adopt. */
  onValueChange?: (value: number) => void;
  /** Number of stars rendered. Default 5. */
  max?: number;
  /**
   * Allow half-star values (0.5, 1, 1.5 …). Each star becomes two options
   * rather than each half becoming a star.
   */
  allowHalf?: boolean;
  /** Accessible name for the radiogroup. Required for a11y. */
  label?: string;
  /** Optional caption rendered next to the stars. */
  showValue?: boolean;
  /** Star size. Default md (24px). */
  size?: RatingSize;
  /** Click on the currently-selected star clears it. Default true. */
  allowClear?: boolean;
  disabled?: boolean;
  /** Render without click handlers — display-only. */
  readOnly?: boolean;
  /** Name attached to a hidden input so the rating participates in a native
   *  form submission. */
  name?: string;
}

const SIZES: Record<RatingSize, number> = { sm: 16, md: 24, lg: 32 };
const GAPS: Record<RatingSize, string> = {
  sm: "zen-gap-0.5",
  md: "zen-gap-1",
  lg: "zen-gap-1.5",
};

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * A star polygon, filled or outline. Built with the SVG namespace — an <svg>
 * created with createElement (HTML namespace) renders nothing.
 */
function starSvg(size: number, filled: boolean): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", filled ? "currentColor" : "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.5");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  const poly = document.createElementNS(SVG_NS, "polygon");
  poly.setAttribute(
    "points",
    "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",
  );
  svg.append(poly);
  return svg;
}

/**
 * A star drawn once with the lit copy clipped over the unlit one, so a half star
 * is one star half-lit rather than two half-stars butted together — those seam
 * down the middle at every size. The returned `litSpan` has its width painted
 * (0%, 50% or 100%) as the value changes.
 */
function starVisual(size: number): { wrap: HTMLSpanElement; litSpan: HTMLSpanElement } {
  const wrap = document.createElement("span");
  wrap.className = "zen-relative zen-inline-block zen-shrink-0 zen-text-zen-border";
  wrap.style.width = `${size}px`;
  wrap.style.height = `${size}px`;
  wrap.append(starSvg(size, false));

  const litSpan = document.createElement("span");
  litSpan.className =
    "zen-absolute zen-inset-y-0 zen-start-0 zen-overflow-hidden zen-text-zen-warning";
  litSpan.style.width = "0%";
  litSpan.append(starSvg(size, true));
  wrap.append(litSpan);

  return { wrap, litSpan };
}

const stepLabel = (s: number) => `${s} ${s === 1 ? "star" : "stars"}`;

export function Rating(props: RatingProps = {}): ZenComponent<RatingProps> {
  let current: RatingProps = { ...props };

  const el = document.createElement("div");
  el.setAttribute("role", "radiogroup");

  const disposer = new Disposer();
  // Cleared and rebuilt on every render() — the star row is torn down and rebuilt
  // when structural props (max, allowHalf, size) change.
  let starDisposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const state = controllable<number>({
    value: current.value,
    defaultValue: current.defaultValue ?? 0,
    onChange: (v) => current.onValueChange?.(v),
  });

  /** Hover preview index — 0 when the pointer is off the control. DOM-only. */
  let hover = 0;

  // Populated by render(), read by paint().
  let stars: HTMLSpanElement[] = [];
  let buttons: Array<{ step: number; btn: HTMLButtonElement }> = [];
  let valueSpan: HTMLSpanElement | null = null;
  let hiddenInput: HTMLInputElement | null = null;

  const commit = (next: number) => {
    const max = current.max ?? 5;
    state.set(Math.max(0, Math.min(max, next)));
  };

  const paint = () => {
    const value = state.get();
    const max = current.max ?? 5;
    const step = current.allowHalf ? 0.5 : 1;
    const firstStep = step;
    const display = hover || value;

    stars.forEach((wrap, i) => {
      const n = i + 1;
      const fill = Math.max(0, Math.min(1, display - (n - 1)));
      const lit = wrap.querySelector<HTMLSpanElement>("span");
      if (lit) lit.style.width = `${fill * 100}%`;
    });

    for (const { step: s, btn } of buttons) {
      btn.setAttribute("aria-checked", String(value === s));
      btn.tabIndex = value === s || (value === 0 && s === firstStep) ? 0 : -1;
    }

    if (valueSpan) {
      valueSpan.textContent = value > 0 ? `${value} / ${max}` : "—";
      valueSpan.className = cn(
        "zen-ml-1 zen-text-sm zen-font-medium zen-tabular-nums",
        value > 0 ? "zen-text-zen-foreground" : "zen-text-zen-muted-fg",
      );
    }

    if (hiddenInput) hiddenInput.value = String(value);
  };

  const render = () => {
    starDisposer.dispose();
    starDisposer = new Disposer();
    stars = [];
    buttons = [];
    valueSpan = null;
    hiddenInput = null;

    const max = current.max ?? 5;
    const size = current.size ?? "md";
    const px = SIZES[size];
    const allowHalf = !!current.allowHalf;
    const allowClear = current.allowClear ?? true;
    const disabled = !!current.disabled;
    const readOnly = !!current.readOnly;
    const interactive = !disabled && !readOnly;

    if (current.label != null) el.setAttribute("aria-label", current.label);
    else el.removeAttribute("aria-label");
    if (disabled) el.setAttribute("aria-disabled", "true");
    else el.removeAttribute("aria-disabled");
    if (readOnly) el.setAttribute("aria-readonly", "true");
    else el.removeAttribute("aria-readonly");

    el.className = cn(
      "zen-inline-flex zen-items-center",
      GAPS[size],
      disabled && "zen-opacity-50 zen-cursor-not-allowed",
      current.class,
    );

    const stepButton = (s: number, half?: "left" | "right"): HTMLButtonElement => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-label", stepLabel(s));
      btn.disabled = disabled;
      btn.className = cn(
        "zen-absolute zen-inset-y-0 zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0",
        "zen-rounded-zen-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        (disabled || readOnly) && "zen-cursor-default",
        half === "left" && "zen-left-0 zen-w-1/2",
        half === "right" && "zen-right-0 zen-w-1/2",
        !half && "zen-inset-x-0",
      );

      const onClick = () => {
        if (!interactive) return;
        if (allowClear && state.get() === s) commit(0);
        else commit(s);
      };
      const onEnter = () => {
        if (!interactive) return;
        hover = s;
        paint();
      };
      const onLeave = () => {
        if (!interactive) return;
        hover = 0;
        paint();
      };
      const onFocus = () => {
        if (!interactive) return;
        hover = 0;
        paint();
      };
      btn.addEventListener("click", onClick);
      btn.addEventListener("mouseenter", onEnter);
      btn.addEventListener("mouseleave", onLeave);
      btn.addEventListener("focus", onFocus);
      starDisposer.add(() => {
        btn.removeEventListener("click", onClick);
        btn.removeEventListener("mouseenter", onEnter);
        btn.removeEventListener("mouseleave", onLeave);
        btn.removeEventListener("focus", onFocus);
      });
      return btn;
    };

    const children: Node[] = [];
    for (let n = 1; n <= max; n++) {
      // The star is drawn once and the options sit over it, rather than each
      // option drawing half a star: two clipped halves side by side seam
      // visibly down the middle of every star.
      const wrap = document.createElement("span");
      wrap.className = "zen-relative zen-inline-flex zen-p-0.5";
      const vis = starVisual(px);
      wrap.append(vis.wrap);
      stars.push(vis.wrap);

      if (allowHalf) {
        const left = stepButton(n - 0.5, "left");
        const right = stepButton(n, "right");
        buttons.push({ step: n - 0.5, btn: left });
        buttons.push({ step: n, btn: right });
        wrap.append(left, right);
      } else {
        const whole = stepButton(n);
        buttons.push({ step: n, btn: whole });
        wrap.append(whole);
      }
      children.push(wrap);
    }

    if (current.showValue) {
      valueSpan = document.createElement("span");
      valueSpan.setAttribute("aria-hidden", "true");
      children.push(valueSpan);
    }

    if (current.name != null) {
      hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = current.name;
      children.push(hiddenInput);
    }

    el.replaceChildren(...children);

    // Forward anything this component does not interpret (id, style, data-*).
    const {
      value: _v,
      defaultValue: _dv,
      onValueChange: _ovc,
      max: _m,
      allowHalf: _ah,
      label: _l,
      showValue: _sv,
      size: _s,
      allowClear: _ac,
      disabled: _d,
      readOnly: _ro,
      name: _n,
      class: _cl,
      children: _ch,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);

    paint();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const interactive = !current.disabled && !current.readOnly;
    if (!interactive) return;
    const max = current.max ?? 5;
    const step = current.allowHalf ? 0.5 : 1;
    const value = state.get();
    // Horizontal arrows follow reading direction; vertical ones never do.
    const dirStep = arrowStep(e.key, e.currentTarget as Element);
    if (dirStep === 1 || e.key === "ArrowUp") {
      e.preventDefault();
      commit(Math.min(max, value + step));
    } else if (dirStep === -1 || e.key === "ArrowDown") {
      e.preventDefault();
      commit(Math.max(0, value - step));
    } else if (e.key === "Home") {
      e.preventDefault();
      commit(step);
    } else if (e.key === "End") {
      e.preventDefault();
      commit(max);
    }
  };
  el.addEventListener("keydown", onKeyDown);
  disposer.add(() => el.removeEventListener("keydown", onKeyDown));

  render();
  disposer.add(state.subscribe(paint));
  disposer.add(() => starDisposer.dispose());
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

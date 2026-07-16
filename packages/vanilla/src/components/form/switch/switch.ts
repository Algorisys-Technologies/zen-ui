import { cn } from "../../../lib/cn";
import {
  applyProps,
  Disposer,
  type BaseProps,
  type ZenComponent,
} from "../../../lib/component";
import { controllable } from "../../../lib/state";

/**
 * Switch — the vanilla port of the Radix-backed React reference.
 *
 *   const s = Switch({ checked: value, onCheckedChange: (v) => setValue(v) });
 *   document.body.append(s.el);
 *
 * ## What Radix supplied, written out
 *
 * Radix's `Switch.Root` is a `<button role="switch">`; a `<button>` already gives
 * space/enter → click for free, so the keyboard story is the native one. What has
 * to be hand-written is the rest of what Radix did: controlled / uncontrolled
 * state (`controllable`), the `data-state` / `aria-checked` bookkeeping, and — the
 * part that is easy to forget — a hidden native checkbox so the control
 * participates in a `<form>` submission. Radix mounts exactly such a "bubble
 * input" internally; without one, `name`/`value` submit nothing.
 *
 * ## State vocabulary
 *
 * Emits React's `data-state="checked" | "unchecked"` on both the root and the
 * thumb (the thumb's translate variants read its OWN data-state). See PORTING.md.
 *
 * Theming via --zen-* tokens; size is a CVA-style variant.
 */

export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps extends BaseProps {
  /** Controlled. Present → the caller owns the state; we never write it. */
  checked?: boolean;
  /** Uncontrolled initial state. */
  defaultChecked?: boolean;
  /** Fires on every toggle, controlled or not, with the value the caller should adopt. */
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  /** Form field name. When present, a hidden checkbox carries the state into submits. */
  name?: string;
  /** The value submitted when checked. Matches Radix's default of "on". */
  value?: string;
  size?: SwitchSize;
}

const TRACK_SIZES: Record<SwitchSize, string> = {
  sm: "zen-h-4 zen-w-7",
  md: "zen-h-5 zen-w-9",
  lg: "zen-h-6 zen-w-11",
};
const THUMB_SIZES: Record<SwitchSize, string> = {
  sm: "zen-h-3 zen-w-3 data-[state=checked]:zen-translate-x-3 data-[state=unchecked]:zen-translate-x-0.5",
  md: "zen-h-4 zen-w-4 data-[state=checked]:zen-translate-x-4 data-[state=unchecked]:zen-translate-x-0.5",
  lg: "zen-h-5 zen-w-5 data-[state=checked]:zen-translate-x-5 data-[state=unchecked]:zen-translate-x-0.5",
};

export function Switch(props: SwitchProps): ZenComponent<SwitchProps> {
  let current: SwitchProps = { ...props };

  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("role", "switch");

  const thumb = document.createElement("span");
  el.append(thumb);

  // The bubble input: a hidden native checkbox that carries name/value into a
  // native form submission. Only attached when `name` is set — matching Radix,
  // which only bubbles when there is something to submit.
  const bubble = document.createElement("input");
  bubble.type = "checkbox";
  bubble.setAttribute("aria-hidden", "true");
  bubble.tabIndex = -1;
  // Visually gone but still a form participant. `display:none` would drop it from
  // submission on some engines, so hide it geometrically instead.
  Object.assign(bubble.style, {
    position: "absolute",
    pointerEvents: "none",
    opacity: "0",
    margin: "0",
    width: "100%",
    height: "100%",
  });

  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const state = controllable<boolean>({
    value: current.checked,
    defaultValue: current.defaultChecked ?? false,
    onChange: (v) => current.onCheckedChange?.(v),
  });

  const paint = (checked: boolean) => {
    const s = checked ? "checked" : "unchecked";
    el.setAttribute("data-state", s);
    el.setAttribute("aria-checked", String(checked));
    thumb.setAttribute("data-state", s);
    bubble.checked = checked;
  };

  const render = () => {
    const size = current.size ?? "md";

    el.className = cn(
      "zen-peer zen-relative zen-inline-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-rounded-zen-full",
      "zen-transition-colors",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      "data-[state=checked]:zen-bg-zen-primary data-[state=unchecked]:zen-bg-zen-muted",
      TRACK_SIZES[size],
      current.class,
    );

    thumb.className = cn(
      "zen-block zen-rounded-zen-full zen-bg-zen-background zen-shadow-md zen-ring-0",
      "zen-transition-transform",
      THUMB_SIZES[size],
    );

    el.disabled = current.disabled ?? false;
    if (current.disabled) el.setAttribute("data-disabled", "");
    else el.removeAttribute("data-disabled");
    bubble.disabled = current.disabled ?? false;

    if (current.required) el.setAttribute("aria-required", "true");
    else el.removeAttribute("aria-required");
    bubble.required = current.required ?? false;

    // Attach / detach the bubble input, and keep its name/value current.
    if (current.name !== undefined) {
      bubble.name = current.name;
      bubble.value = current.value ?? "on";
      if (!bubble.isConnected) el.append(bubble);
    } else if (bubble.isConnected) {
      bubble.remove();
    }

    // Everything this component does not interpret is forwarded to the button.
    const {
      checked: _c,
      defaultChecked: _dc,
      onCheckedChange: _occ,
      disabled: _d,
      required: _r,
      name: _n,
      value: _v,
      size: _s,
      class: _cl,
      children: _ch,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);

    paint(state.get());
  };

  const onClick = () => {
    if (current.disabled) return;
    state.set(!state.get());
  };
  el.addEventListener("click", onClick);
  disposer.add(() => el.removeEventListener("click", onClick));

  render();
  disposer.add(state.subscribe(paint));
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if (next.checked !== undefined) state.sync(next.checked);
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

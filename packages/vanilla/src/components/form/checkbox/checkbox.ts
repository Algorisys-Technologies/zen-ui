import { cn } from "../../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../../lib/component";
import { controllable } from "../../../lib/state";

/**
 * Checkbox — the tri-state control Radix backs in React, hand-written here.
 *
 *   Checkbox({ checked: value, onCheckedChange: setValue })
 *   Checkbox({ checked: "indeterminate", onCheckedChange: setValue })
 *
 * React leans on `@radix-ui/react-checkbox` for the three things that make a
 * checkbox more than a styled box, and this file writes each of them out:
 *
 *  - **The tri-state.** `checked` is `boolean | "indeterminate"`. Clicking an
 *    indeterminate box makes it TRUE (never false), matching Radix's toggle rule;
 *    otherwise it flips the boolean.
 *  - **Form participation.** The visible control is a `<button role="checkbox">`,
 *    which submits nothing. A visually-hidden native `<input type="checkbox">`
 *    rides alongside so `name`/`value` reach `FormData` — Radix and Kobalte both
 *    ship this (BubbleInput); it is not optional.
 *  - **The keyboard contract.** A native button already toggles on Space; Enter is
 *    swallowed so a checkbox inside a form does not submit it.
 *
 * The caller's `class` and the `data-[state=…]` variants land on the button (the
 * box), not the structural wrapper, so a caller override like
 * `data-[state=checked]:zen-bg-zen-success` behaves exactly as it does in React.
 */

export type CheckboxSize = "sm" | "md" | "lg";
export type CheckedState = boolean | "indeterminate";

export interface CheckboxProps {
  /** Controlled state. `"indeterminate"` is a first-class value, not a DOM poke. */
  checked?: CheckedState;
  /** Uncontrolled initial state. Ignored once `checked` is supplied. */
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
  size?: CheckboxSize;
  disabled?: boolean;
  required?: boolean;
  /** Submitted with the enclosing form when checked. */
  name?: string;
  /** The value submitted when checked. Defaults to `"on"`, like a native checkbox. */
  value?: string;
  id?: string;
  class?: string;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

const BOX_SIZES: Record<CheckboxSize, string> = {
  sm: "zen-h-3.5 zen-w-3.5",
  md: "zen-h-4 zen-w-4",
  lg: "zen-h-5 zen-w-5",
};

const BOX_CLASS = [
  "zen-peer zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
  "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
  "data-[state=checked]:zen-bg-zen-primary data-[state=checked]:zen-border-zen-primary data-[state=checked]:zen-text-zen-primary-fg",
  "data-[state=indeterminate]:zen-bg-zen-primary data-[state=indeterminate]:zen-border-zen-primary data-[state=indeterminate]:zen-text-zen-primary-fg",
].join(" ");

// Our own trusted SVG markup — the one innerHTML exception PORTING.md names. The
// geometry matches React's CheckIcon / DashIcon exactly, sized to fill the box.
const CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%"><polyline points="20 6 9 17 4 12"/></svg>`;
const DASH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" width="100%" height="100%"><line x1="6" y1="12" x2="18" y2="12"/></svg>`;

const stateOf = (v: CheckedState): "checked" | "unchecked" | "indeterminate" =>
  v === "indeterminate" ? "indeterminate" : v ? "checked" : "unchecked";

export type CheckboxHandle = ZenComponent<CheckboxProps, HTMLElement>;

export function Checkbox(props: CheckboxProps): CheckboxHandle {
  let current: CheckboxProps = { ...props };

  // A structural wrapper so the button and its BubbleInput are siblings without a
  // wrapper generating layout: `display: contents` means the box keeps behaving as
  // the single inline element React ships.
  const el = document.createElement("span");
  el.style.display = "contents";

  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("role", "checkbox");

  const indicator = document.createElement("span");
  indicator.className = "zen-flex zen-items-center zen-justify-center zen-text-current";
  button.append(indicator);

  const hidden = document.createElement("input");
  hidden.type = "checkbox";
  hidden.tabIndex = -1;
  hidden.setAttribute("aria-hidden", "true");
  hidden.className = "zen-sr-only zen-pointer-events-none";

  el.append(button, hidden);

  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const state = controllable<CheckedState>({
    value: current.checked,
    defaultValue: current.defaultChecked ?? false,
    onChange: (v) => current.onCheckedChange?.(v),
  });

  const paint = () => {
    const v = state.get();
    const s = stateOf(v);
    button.setAttribute("data-state", s);
    button.setAttribute("aria-checked", v === "indeterminate" ? "mixed" : String(v));
    indicator.setAttribute("data-state", s);

    if (v === false) {
      indicator.hidden = true;
      indicator.replaceChildren();
    } else {
      indicator.hidden = false;
      indicator.innerHTML = v === "indeterminate" ? DASH : CHECK;
    }

    // The hidden native control carries the value into a form. Indeterminate is
    // reflected but submits nothing, exactly like a native indeterminate checkbox.
    hidden.checked = v === true;
    hidden.indeterminate = v === "indeterminate";
  };

  const render = () => {
    const { checked, defaultChecked, onCheckedChange, size = "md", disabled, required, name, value, id, class: className, ...rest } = current;
    void checked;
    void defaultChecked;
    void onCheckedChange;

    button.className = cn(BOX_CLASS, BOX_SIZES[size], className);
    button.disabled = Boolean(disabled);
    if (id !== undefined) button.id = id;
    else button.removeAttribute("id");

    if (name !== undefined) hidden.name = name;
    else hidden.removeAttribute("name");
    hidden.value = value ?? "on";
    hidden.disabled = Boolean(disabled);
    hidden.required = Boolean(required);

    // data-*, aria-* and any on* handlers ride on the box, where React spreads them.
    removeProps?.();
    removeProps = applyProps(button, rest as Record<string, unknown>);

    paint();
  };

  const toggle = () => {
    if (current.disabled) return;
    const v = state.get();
    state.set(v === "indeterminate" ? true : !v);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    // A checkbox never activates on Enter; left alone it would submit the form.
    if (e.key === "Enter") e.preventDefault();
  };
  button.addEventListener("click", toggle);
  button.addEventListener("keydown", onKeyDown);

  render();
  disposer.add(state.subscribe(paint));
  disposer.add(() => button.removeEventListener("click", toggle));
  disposer.add(() => button.removeEventListener("keydown", onKeyDown));
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

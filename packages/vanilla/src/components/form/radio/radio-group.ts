import { cn } from "../../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../../lib/component";
import { controllable } from "../../../lib/state";
import { rovingFocus } from "../../../lib/roving-focus";

/**
 * RadioGroup + RadioGroupItem — the vanilla port of the React reference, which
 * is built on @radix-ui/react-radio-group.
 *
 *   const group = RadioGroup({
 *     defaultValue: "pro",
 *     children: [
 *       labelled(RadioGroupItem({ value: "free" }), "Free"),
 *       labelled(RadioGroupItem({ value: "pro" }),  "Pro"),
 *       labelled(RadioGroupItem({ value: "team" }), "Team"),
 *     ],
 *   });
 *
 * ## Why this stays compound rather than going data-driven
 *
 * Select took an `options` array because Radix's compound `<SelectItem>` only
 * works through React CONTEXT — with no tree there is nothing for a standalone
 * item to find, so mirroring it would mean the caller hand-threading the parent
 * into every child (see select.ts). RadioGroup does not hit that wall: the item
 * is inert markup with no keyboard or selection logic of its own, so the group
 * can own all the behaviour and reach its items by scanning the DOM subtree it
 * was handed. That keeps React's exact public shape — `RadioGroup` wrapping
 * `RadioGroupItem`s, arbitrary label markup interleaved — which is the whole
 * point of the demo, without inventing a context system to do it.
 *
 * What Radix supplied and this owns: roving tabindex (the checked item is the
 * single tab stop), arrow-key navigation that also selects, click/Space to
 * select, ARIA, and form submission via a hidden input named after the group.
 */

export type RadioSize = "sm" | "md" | "lg";

const ITEM_SIZES: Record<RadioSize, string> = {
  sm: "zen-h-3.5 zen-w-3.5",
  md: "zen-h-4 zen-w-4",
  lg: "zen-h-5 zen-w-5",
};

const ITEM_BASE = [
  "zen-aspect-square zen-rounded-zen-full zen-border zen-border-zen-border zen-text-zen-primary",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
  "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
  "data-[state=checked]:zen-border-zen-primary",
];

export interface RadioGroupItemProps extends BaseProps {
  /** The value this item contributes when it is the chosen one. */
  value: string;
  size?: RadioSize;
  disabled?: boolean;
}

/**
 * A single radio button. It renders inert markup — a `role="radio"` button with
 * the indicator dot — and carries its `value` on `data-value`. The enclosing
 * RadioGroup finds it by scanning for `[role="radio"]` and drives its state, so
 * an item used outside a group simply renders unchecked and does nothing.
 */
export function RadioGroupItem(props: RadioGroupItemProps): ZenComponent<RadioGroupItemProps> {
  let current: RadioGroupItemProps = { ...props };
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("role", "radio");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  // The Radix Indicator: a centring wrapper around the filled dot, shown only
  // when the group marks this item checked. Built once and toggled, never
  // re-created, so the group's paint can reach it by attribute.
  const indicator = document.createElement("span");
  indicator.setAttribute("data-zen-radio-indicator", "");
  indicator.className = "zen-flex zen-items-center zen-justify-center";
  const dot = document.createElement("span");
  dot.className = "zen-block zen-h-2 zen-w-2 zen-rounded-zen-full zen-bg-zen-primary";
  indicator.append(dot);

  const render = () => {
    const { value, size = "md", disabled, class: className, children: _ch, ...rest } = current;

    el.className = cn(ITEM_BASE, ITEM_SIZES[size], className);
    el.dataset.value = value;
    if (!el.hasAttribute("data-state")) el.setAttribute("data-state", "unchecked");
    if (!el.hasAttribute("aria-checked")) el.setAttribute("aria-checked", "false");
    el.disabled = Boolean(disabled);
    indicator.hidden = el.getAttribute("data-state") !== "checked";
    el.replaceChildren(indicator);

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export interface RadioGroupProps extends BaseProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Disable every item in the group. */
  disabled?: boolean;
  /** Serializes the chosen value to one FormData entry under this name. */
  name?: string;
  required?: boolean;
  /** Which arrow-key axis navigates. Both axes work when omitted, matching Radix. */
  orientation?: "horizontal" | "vertical";
  children?: Child;
}

export function RadioGroup(props: RadioGroupProps): ZenComponent<RadioGroupProps> {
  let current: RadioGroupProps = { ...props };
  const el = document.createElement("div");
  el.setAttribute("role", "radiogroup");
  const disposer = new Disposer();
  const cleanups = new Disposer();
  let removeProps: (() => void) | undefined;

  // One hidden input reflects the chosen value so a native <form> submits it as a
  // single entry — the equivalent of Radix's per-item BubbleInput collapsed to the
  // one value a radio group can hold. Only attached when `name` is given.
  const hidden = document.createElement("input");
  hidden.type = "hidden";

  const state = controllable<string>({
    value: current.value,
    defaultValue: current.defaultValue ?? "",
    onChange: (v) => current.onValueChange?.(v),
  });

  const itemEls = () => Array.from(el.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
  const enabledItems = () => itemEls().filter((b) => !b.disabled);

  const paint = () => {
    const v = state.get();
    const items = itemEls();
    for (const item of items) {
      const checked = v !== "" && item.dataset.value === v;
      item.setAttribute("data-state", checked ? "checked" : "unchecked");
      item.setAttribute("aria-checked", String(checked));
      const ind = item.querySelector<HTMLElement>("[data-zen-radio-indicator]");
      if (ind) ind.hidden = !checked;
    }
    // The checked item is the group's single tab stop; with nothing chosen, the
    // first enabled item. Tab enters the group once and lands where selection is.
    const stop = items.find((i) => v !== "" && i.dataset.value === v) ?? enabledItems()[0] ?? null;
    for (const i of items) i.tabIndex = i === stop ? 0 : -1;
    if (current.name) hidden.value = v;
  };

  const render = () => {
    const {
      value: _v,
      defaultValue: _dv,
      onValueChange: _ov,
      disabled,
      name,
      required,
      orientation,
      class: className,
      children,
      ...rest
    } = current;

    cleanups.dispose();
    el.className = cn("zen-grid zen-gap-2", className);
    if (required) el.setAttribute("aria-required", "true");
    else el.removeAttribute("aria-required");
    if (orientation) el.setAttribute("aria-orientation", orientation);
    else el.removeAttribute("aria-orientation");

    el.replaceChildren(...toNodes(children));

    // Group-level disabled cascades to every item the caller handed us.
    if (disabled) for (const item of itemEls()) item.disabled = true;

    if (name) {
      hidden.name = name;
      el.append(hidden);
    }

    // One delegated click handler survives re-renders and works whether the user
    // clicks the button or a <label> wrapping it (a button is a labelable element,
    // so the label forwards the click to it).
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLButtonElement>('[role="radio"]');
      if (!target || !el.contains(target) || target.disabled) return;
      state.set(target.dataset.value ?? "");
    };
    el.addEventListener("click", onClick);
    cleanups.add(() => el.removeEventListener("click", onClick));

    cleanups.add(
      rovingFocus(el, {
        items: enabledItems,
        orientation: orientation ?? "both",
        // A radio group selects as the arrow keys reach an item, unlike a tab list
        // with manual activation — matching native radios and Radix.
        onFocus: (item) => state.set((item as HTMLButtonElement).dataset.value ?? ""),
      }),
    );

    // After rovingFocus has set its own initial tab stop on item[0], paint moves
    // it to the checked item and writes the checked visuals.
    paint();

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(state.subscribe(paint));
  disposer.add(() => cleanups.dispose());
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

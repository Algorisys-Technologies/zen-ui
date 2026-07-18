import { cn } from "../../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../../lib/component";
import { controllable } from "../../../lib/state";
import { dismissable } from "../../../lib/dismissable";
import { rovingFocus } from "../../../lib/roving-focus";
import { setPresence } from "../../../lib/presence";

/**
 * Select — a listbox on a trigger.
 *
 *   Select({
 *     placeholder: "Pick one",
 *     options: [
 *       { value: "a", label: "Apple" },
 *       { value: "b", label: "Banana", disabled: true },
 *     ],
 *     onValueChange: (v) => …,
 *   })
 *
 * ## The divergence, and why this side of it
 *
 * React exposes Radix's compound parts (SelectTrigger / SelectContent / SelectItem /
 * SelectGroup); Solid takes an `options` array because Kobalte is data-driven.
 * check-parity lists both as a known DESIGN divergence rather than a gap.
 *
 * React is this repo's reference binding, so the instinct is to mirror its compound
 * API. That instinct is wrong here, and it is worth writing down why: Radix's
 * compound form works because of CONTEXT — `<SelectItem>` finds its root through
 * the React tree without the caller wiring anything. With no framework there is no
 * tree and no context, so the same shape would have to be
 * `SelectItem({ root: sel, value: "a" })`: the caller hand-threading the parent
 * into every child, with a chance to get it wrong on each one, purely to look like
 * React. That is syntax-porting, which LOOPS XXXVI exists to forbid.
 *
 * So this takes the data, landing on Solid's shape by following React's reasoning.
 * The compound API's real capabilities — option groups, custom item rendering —
 * are the part worth keeping, and `options` can grow a `group` field for the first
 * without inventing a context system for it.
 *
 * These exports belong on check-parity's DIVERGENT list for the same reason
 * Solid's do.
 */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  /** Rendered above the trigger and wired with `for`. */
  label?: string;
  /** Shown below the trigger; also flips the trigger to the error border. */
  errorMessage?: string;
  class?: string;
  [key: `data-${string}`]: unknown;
}

const CHEVRON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
const CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

let uid = 0;

export function Select(props: SelectProps): ZenComponent<SelectProps> {
  let current: SelectProps = { ...props };
  const id = current.id ?? `zen-select-${++uid}`;
  const el = document.createElement("div");
  const disposer = new Disposer();
  const cleanups = new Disposer();
  let removeProps: (() => void) | undefined;
  let open = false;

  const state = controllable<string>({
    value: current.value,
    defaultValue: current.defaultValue ?? "",
    onChange: (v) => current.onValueChange?.(v),
  });

  const trigger = document.createElement("button");
  const valueSpan = document.createElement("span");
  const listbox = document.createElement("div");
  /**
   * A real <select>, visually hidden. Without it the component is a div that looks
   * like a form control and submits nothing — `name` would be a lie, and a native
   * form reset or an uncontrolled `<form>` read would miss it entirely. Radix and
   * Kobalte both ship this (HiddenSelect); it is not optional.
   */
  const hidden = document.createElement("select");

  let items: HTMLDivElement[] = [];

  const labelOf = (v: string) => current.options.find((o) => o.value === v)?.label;

  const paintValue = () => {
    const v = state.get();
    const text = labelOf(v);
    valueSpan.textContent = text ?? current.placeholder ?? "";
    valueSpan.classList.toggle("zen-text-zen-muted-fg", text === undefined);
    hidden.value = v;
    for (const item of items) {
      const selected = item.dataset.value === v;
      item.setAttribute("aria-selected", String(selected));
      (item.firstElementChild as HTMLElement).style.visibility = selected ? "visible" : "hidden";
    }
  };

  const close = () => {
    if (!open) return;
    open = false;
    trigger.setAttribute("aria-expanded", "false");
    setPresence(listbox, "closed", () => {
      listbox.hidden = true;
    });
    cleanups.dispose();
    trigger.focus();
  };

  const openList = () => {
    if (open || current.disabled) return;
    open = true;
    trigger.setAttribute("aria-expanded", "true");
    listbox.hidden = false;
    setPresence(listbox, "open");

    cleanups.add(
      dismissable(listbox, {
        ignore: [trigger],
        onDismiss: () => close(),
      }),
    );
    cleanups.add(
      rovingFocus(listbox, {
        items: () => items.filter((i) => i.getAttribute("aria-disabled") !== "true"),
        orientation: "vertical",
      }),
    );
    // Open ON the current value, not at the top: a list of 40 options with the
    // 30th selected should not make the user arrow down 30 times to see where
    // they are.
    const selected = items.find((i) => i.dataset.value === state.get());
    (selected ?? items.find((i) => i.getAttribute("aria-disabled") !== "true"))?.focus();
  };

  const render = () => {
    const { options, class: className, label, errorMessage, disabled, name, placeholder: _p, ...rest } = current;

    el.className = cn("zen-relative zen-w-full", className);
    el.replaceChildren();
    items = [];

    if (label) {
      const l = document.createElement("label");
      l.setAttribute("for", `${id}-trigger`);
      l.className = "zen-text-sm zen-font-medium zen-text-zen-foreground zen-block zen-mb-1";
      l.textContent = label;
      el.append(l);
    }

    trigger.type = "button";
    trigger.id = `${id}-trigger`;
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-controls", `${id}-listbox`);
    if (errorMessage) {
      trigger.setAttribute("aria-invalid", "true");
      trigger.setAttribute("aria-describedby", `${id}-error`);
    } else {
      trigger.removeAttribute("aria-invalid");
      trigger.removeAttribute("aria-describedby");
    }
    trigger.disabled = Boolean(disabled);
    trigger.className = cn(
      "zen-flex zen-items-center zen-justify-between zen-gap-2 zen-h-10 zen-px-3 zen-w-full",
      "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-sm zen-text-zen-foreground",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      errorMessage && "zen-border-zen-error",
    );
    valueSpan.className = "zen-truncate";
    const chev = document.createElement("span");
    chev.className = "zen-text-zen-muted-fg";
    chev.innerHTML = CHEVRON;
    trigger.replaceChildren(valueSpan, chev);

    hidden.name = name ?? "";
    hidden.tabIndex = -1;
    hidden.setAttribute("aria-hidden", "true");
    hidden.className = "zen-sr-only zen-absolute zen-pointer-events-none";
    hidden.replaceChildren(
      ...options.map((o) => {
        const opt = document.createElement("option");
        opt.value = o.value;
        opt.textContent = o.label;
        return opt;
      }),
    );

    listbox.id = `${id}-listbox`;
    listbox.setAttribute("role", "listbox");
    listbox.setAttribute("aria-labelledby", `${id}-trigger`);
    listbox.className = cn(
      "zen-absolute zen-left-0 zen-top-full zen-mt-1 zen-z-50 zen-w-full zen-min-w-32 zen-overflow-y-auto zen-max-h-72",
      "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-zen-md",
      "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
    );
    listbox.hidden = !open;
    listbox.replaceChildren();

    for (const o of options) {
      const item = document.createElement("div");
      item.setAttribute("role", "option");
      item.dataset.value = o.value;
      item.tabIndex = -1;
      if (o.disabled) item.setAttribute("aria-disabled", "true");
      item.className = cn(
        "zen-relative zen-flex zen-w-full zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
        "focus:zen-bg-zen-muted hover:zen-bg-zen-muted",
        "aria-disabled:zen-pointer-events-none aria-disabled:zen-opacity-50",
      );
      const tick = document.createElement("span");
      tick.className =
        "zen-absolute zen-left-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center";
      tick.innerHTML = CHECK;
      tick.style.visibility = "hidden";
      const text = document.createElement("span");
      text.textContent = o.label;
      item.append(tick, text);

      if (!o.disabled) {
        const pick = () => {
          state.set(o.value);
          close();
        };
        item.addEventListener("click", pick);
        const onKey = (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pick();
          }
        };
        item.addEventListener("keydown", onKey);
        cleanups.add(() => {
          item.removeEventListener("click", pick);
          item.removeEventListener("keydown", onKey);
        });
      }
      listbox.append(item);
      items.push(item);
    }

    el.append(trigger, hidden, listbox);

    if (errorMessage) {
      const err = document.createElement("p");
      err.id = `${id}-error`;
      err.className = "zen-text-xs zen-text-zen-error zen-mt-1";
      err.textContent = errorMessage;
      el.append(err);
    }

    paintValue();
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  const onTriggerClick = () => (open ? close() : openList());
  const onTriggerKey = (e: KeyboardEvent) => {
    // ArrowDown/Up open the list from the trigger — the listbox keyboard contract.
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openList();
    }
  };
  trigger.addEventListener("click", onTriggerClick);
  trigger.addEventListener("keydown", onTriggerKey);

  render();
  disposer.add(state.subscribe(paintValue));
  disposer.add(() => trigger.removeEventListener("click", onTriggerClick));
  disposer.add(() => trigger.removeEventListener("keydown", onTriggerKey));
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

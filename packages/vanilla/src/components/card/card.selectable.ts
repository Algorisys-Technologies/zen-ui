import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  type BaseProps,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { rovingFocus } from "../../lib/roving-focus";

/**
 * SelectableCard — radio-as-a-card pattern for onboarding "pick one" questions
 * (goal picker, plan picker, use-case picker). Selectable cards consistently
 * outperform classic radio lists for these questions: bigger tap targets, room
 * for icon + description, decision-feel rather than option-feel.
 *
 *   const group = SelectableCardGroup({
 *     value: goal,
 *     onValueChange: setGoal,
 *     "aria-label": "What do you want to do first?",
 *     items: [
 *       { value: "invoice", title: "Send invoices", icon: I, description: "Bill customers and track payments." },
 *       { value: "track",   title: "Track expenses", icon: E, description: "Log receipts and categorize spending." },
 *     ],
 *   });
 *
 * ## Why `items` rather than compound children
 *
 * React composes `<SelectableCardGroup>` / `<SelectableCard>` and wires them
 * through Radix's RadioGroup context: a card finds its group, its checked state
 * and its keyboard cohort without being handed anything. With no framework there
 * is no context, so the honest options are to thread the group into every card by
 * hand at the call site — `SelectableCard({ group, value })`, a shape that exists
 * only to look like React and gives the caller a fresh chance to wire it wrong —
 * or to take the data. This takes the data, exactly as accordion.ts and select.ts
 * do for the same reason. These exports belong on check-parity's DIVERGENT list.
 *
 * ## Behaviour (what Radix's RadioGroup supplied)
 *
 *   - exactly-one selection, single tab stop, arrow / Home / End navigation that
 *     also selects (roving focus — see roving-focus.ts),
 *   - controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`),
 *   - `disabled` per-item or at the group level,
 *   - a hidden `<input type="radio">` per option when `name` is set, so the group
 *     submits and resets with a native form (Radix ships this; it is not optional).
 *
 * ## State vocabulary
 *
 * Emits React's `data-state="checked" | "unchecked"`, so the shared class strings
 * hoisted from the React source (`data-[state=checked]:…`, `group-data-[state=…]`)
 * paint unchanged. See PORTING.md.
 */

/** Anything renderable inside a card slot. Pass a component's `.el` for the rest. */
type Slot = string | Node;

export interface SelectableCardItemSpec {
  value: string;
  /** Bold label, top row. */
  title?: Slot;
  /** Leading glyph, tinted with the card when checked. */
  icon?: Slot;
  /** Trailing badge slot (top-right) — typically a Badge with "Most popular" /
   *  "Best value" / "5+ users" copy. */
  badge?: Slot;
  /** Secondary line under the title (React's `children`). */
  description?: Slot;
  disabled?: boolean;
}

export interface SelectableCardGroupProps extends BaseProps {
  items: SelectableCardItemSpec[];
  /** Controlled selection. */
  value?: string;
  /** Uncontrolled initial selection. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Locks every card. Individual cards can also carry their own `disabled`. */
  disabled?: boolean;
  /** When set, a hidden radio per option submits with a native form. */
  name?: string;
}

const CHECK = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

const appendSlot = (parent: Node, slot: Slot | undefined): void => {
  if (slot === undefined || slot === null) return;
  parent.appendChild(typeof slot === "string" ? document.createTextNode(slot) : slot);
};

export function SelectableCardGroup(
  props: SelectableCardGroupProps,
): ZenComponent<SelectableCardGroupProps> {
  let current: SelectableCardGroupProps = { ...props };
  const el = document.createElement("div");
  el.setAttribute("role", "radiogroup");
  const disposer = new Disposer();
  const cleanups = new Disposer();
  let removeProps: (() => void) | undefined;

  const state = controllable<string>({
    value: current.value,
    defaultValue: current.defaultValue ?? "",
    onChange: (v) => current.onValueChange?.(v),
  });

  interface ItemRefs {
    value: string;
    button: HTMLButtonElement;
    indicator: HTMLSpanElement;
    input?: HTMLInputElement;
    disabled: boolean;
  }
  let refs: ItemRefs[] = [];

  const isDisabled = (item: SelectableCardItemSpec) =>
    Boolean(current.disabled || item.disabled);

  const render = () => {
    const {
      items,
      class: className,
      value: _v,
      defaultValue: _dv,
      onValueChange: _ov,
      disabled: _d,
      name,
      children: _ch,
      ...rest
    } = current;

    cleanups.dispose();
    refs = [];
    el.className = cn("zen-grid zen-gap-3", className);
    el.replaceChildren();

    const selected = state.get();

    for (const item of items) {
      const disabled = isDisabled(item);
      const checked = item.value === selected;

      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(checked));
      button.setAttribute("data-state", checked ? "checked" : "unchecked");
      button.value = item.value;
      button.tabIndex = -1;
      if (disabled) {
        button.disabled = true;
        button.setAttribute("data-disabled", "");
      }
      button.className = cn(
        "zen-group zen-relative zen-w-full zen-text-start",
        "zen-rounded-zen-md zen-border-2 zen-border-zen-border zen-bg-zen-background",
        "zen-p-4 zen-cursor-pointer zen-transition-colors",
        /* hover (only when not selected and not disabled) */
        "hover:zen-border-zen-muted-fg",
        /* selected state — primary ring + soft tint */
        "data-[state=checked]:zen-border-zen-primary data-[state=checked]:zen-bg-zen-primary-soft",
        /* disabled */
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50 disabled:hover:zen-border-zen-border",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      );

      /* Top row: icon + title (+ optional badge) + description. */
      const row = document.createElement("div");
      row.className = "zen-flex zen-items-start zen-gap-3";

      if (item.icon !== undefined) {
        const iconWrap = document.createElement("span");
        iconWrap.setAttribute("aria-hidden", "true");
        iconWrap.className = cn(
          "zen-inline-flex zen-items-center zen-justify-center zen-flex-shrink-0",
          "zen-h-8 zen-w-8 zen-rounded-zen-sm",
          "zen-bg-zen-muted zen-text-zen-muted-fg",
          "group-data-[state=checked]:zen-bg-zen-primary group-data-[state=checked]:zen-text-zen-primary-fg",
        );
        appendSlot(iconWrap, item.icon);
        row.append(iconWrap);
      }

      const body = document.createElement("div");
      body.className = "zen-flex-1 zen-min-w-0";

      const titleRow = document.createElement("div");
      titleRow.className = "zen-flex zen-items-center zen-gap-2";
      if (item.title !== undefined) {
        const title = document.createElement("span");
        title.className = "zen-text-sm zen-font-semibold zen-text-zen-foreground";
        appendSlot(title, item.title);
        titleRow.append(title);
      }
      if (item.badge !== undefined) {
        const badge = document.createElement("span");
        badge.className = "zen-ml-auto";
        appendSlot(badge, item.badge);
        titleRow.append(badge);
      }
      body.append(titleRow);

      if (item.description !== undefined) {
        const desc = document.createElement("div");
        desc.className = "zen-text-xs zen-text-zen-muted-fg zen-mt-1 zen-leading-relaxed";
        appendSlot(desc, item.description);
        body.append(desc);
      }

      row.append(body);
      button.append(row);

      /* Top-right check indicator — only visible when selected. */
      const indicator = document.createElement("span");
      indicator.className = cn(
        "zen-absolute zen-top-2.5 zen-end-2.5",
        "zen-inline-flex zen-items-center zen-justify-center",
        "zen-h-5 zen-w-5 zen-rounded-zen-full",
        "zen-bg-zen-primary zen-text-zen-primary-fg",
      );
      indicator.innerHTML = CHECK;
      indicator.hidden = !checked;
      button.append(indicator);

      const onClick = () => {
        if (isDisabled(item)) return;
        state.set(item.value);
      };
      button.addEventListener("click", onClick);
      cleanups.add(() => button.removeEventListener("click", onClick));

      let input: HTMLInputElement | undefined;
      if (name) {
        input = document.createElement("input");
        input.type = "radio";
        input.name = name;
        input.value = item.value;
        input.checked = checked;
        input.disabled = disabled;
        input.tabIndex = -1;
        input.setAttribute("aria-hidden", "true");
        input.className = "zen-sr-only zen-pointer-events-none";
        button.append(input);
      }

      el.append(button);
      refs.push({ value: item.value, button, indicator, input, disabled });
    }

    /**
     * One tab stop for the whole group. Arrow / Home / End move within it and,
     * because a radio group selects on move, `onFocus` also commits the value —
     * the same contract Radix's RadioGroup gives. Disabled cards are skipped, so
     * they are re-read on every key.
     */
    cleanups.add(
      rovingFocus(el, {
        items: () => refs.filter((r) => !r.disabled).map((r) => r.button),
        orientation: "vertical",
        onFocus: (button) => {
          const ref = refs.find((r) => r.button === button);
          if (ref) state.set(ref.value);
        },
      }),
    );

    // rovingFocus seeds the tab stop from data-state="active"; radio uses
    // "checked", so seed it here: the selected card is the entry point, else the
    // first enabled one (matching where focus lands on Tab into a radio group).
    const enabled = refs.filter((r) => !r.disabled);
    const entry =
      enabled.find((r) => r.value === state.get()) ?? enabled[0];
    if (entry) entry.button.tabIndex = 0;

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  /** Selection changed: repaint state on the existing cards, no re-render. */
  const paint = (selected: string) => {
    for (const { value, button, indicator, input } of refs) {
      const checked = value === selected;
      button.setAttribute("aria-checked", String(checked));
      button.setAttribute("data-state", checked ? "checked" : "unchecked");
      indicator.hidden = !checked;
      if (input) input.checked = checked;
    }
  };

  render();
  disposer.add(state.subscribe(paint));
  disposer.add(() => cleanups.dispose());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      const structural = next.items !== undefined || next.name !== undefined || next.disabled !== undefined;
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);
      if (structural) render();
      else paint(state.get());
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

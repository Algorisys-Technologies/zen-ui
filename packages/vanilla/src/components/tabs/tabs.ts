import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { controllable } from "../../lib/state";
import { rovingFocus } from "../../lib/roving-focus";

/**
 * Tabs — the vanilla port of the React reference.
 *
 *   Tabs({
 *     defaultValue: "overview",
 *     tabs: [
 *       { value: "overview", label: "Overview", content: "…" },
 *       { value: "activity", label: "Activity", content: "…" },
 *     ],
 *   })
 *
 * ## Why these variants are NOT in core
 *
 * `tabsTriggerVariants` selects with `data-[state=active]`, and Solid's selects
 * with `data-[selected]`, because Radix and Kobalte disagree. A variant table that
 * names a state attribute is not shareable, so Button and Badge hoist to
 * @algorisys/zen-ui-core/variants and this one cannot. See the note at the top of
 * that file. This binding emits React's vocabulary, so this table is a copy of
 * React's — and it is the copy the parity checks should watch.
 *
 * ## The bug this port does not reproduce
 *
 * In React and Solid, `variant` is a prop on BOTH the list and each trigger, with
 * nothing passing it down: `variant="pills"` on the list alone leaves the triggers
 * styled `underline`, and the list's `data-variant` attribute is written but never
 * read. Taking the data means the variant is set once and applied to both, which
 * is what a caller means. Flagged rather than mirrored — see PORTING.md (port
 * behaviour, not syntax; a faithful port of a bug is still a bug).
 */

const tabsListVariants = cva("zen-inline-flex zen-items-stretch", {
  variants: {
    variant: {
      underline: "zen-border-b zen-border-zen-border zen-w-full zen-gap-1",
      pills: "zen-rounded-zen-md zen-bg-zen-muted zen-p-1 zen-gap-1",
    },
    orientation: {
      // flex-wrap so a horizontal tab list with many tabs wraps to multiple rows
      // instead of overflowing/clipping its container.
      horizontal: "zen-flex-row zen-flex-wrap",
      vertical: "zen-flex-col zen-items-start",
    },
  },
  compoundVariants: [
    { variant: "underline", orientation: "vertical", class: "zen-border-b-0 zen-border-r zen-border-zen-border" },
    { variant: "pills", orientation: "vertical", class: "zen-items-stretch" },
  ],
  defaultVariants: { variant: "underline", orientation: "horizontal" },
});

const tabsTriggerVariants = cva(
  [
    "zen-inline-flex zen-items-center zen-justify-center zen-whitespace-nowrap",
    "zen-text-sm zen-font-medium",
    "zen-border-0 zen-bg-transparent zen-cursor-pointer",
    "zen-transition-colors",
    "disabled:zen-opacity-50 disabled:zen-cursor-not-allowed",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
  ].join(" "),
  {
    variants: {
      variant: {
        underline: [
          "zen-px-3 zen-py-2 -zen-mb-px zen-text-zen-muted-fg",
          "zen-border-b-2 zen-border-transparent",
          "hover:zen-text-zen-foreground",
          "data-[state=active]:zen-text-zen-primary data-[state=active]:zen-border-zen-primary",
        ].join(" "),
        pills: [
          "zen-px-3 zen-py-1.5 zen-rounded-zen-sm zen-text-zen-muted-fg",
          "hover:zen-text-zen-foreground",
          "data-[state=active]:zen-bg-zen-background data-[state=active]:zen-text-zen-foreground data-[state=active]:zen-shadow-zen-xs",
        ].join(" "),
      },
    },
    defaultVariants: { variant: "underline" },
  },
);

export interface TabSpec {
  value: string;
  label: string | Node;
  content: string | Node;
  disabled?: boolean;
}

export interface TabsProps extends BaseProps, VariantProps<typeof tabsListVariants> {
  tabs: TabSpec[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Select a tab as soon as the arrow keys reach it. Default true, matching Radix. */
  activationMode?: "automatic" | "manual";
}

let uid = 0;

export function Tabs(props: TabsProps): ZenComponent<TabsProps> {
  let current: TabsProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  const cleanups = new Disposer();
  let removeProps: (() => void) | undefined;

  interface TabRefs {
    value: string;
    trigger: HTMLButtonElement;
    panel: HTMLDivElement;
  }
  let refs: TabRefs[] = [];

  const state = controllable<string>({
    value: current.value,
    defaultValue: current.defaultValue ?? current.tabs[0]?.value ?? "",
    onChange: (v) => current.onValueChange?.(v),
  });

  const render = () => {
    const {
      tabs,
      class: className,
      variant,
      orientation,
      value: _v,
      defaultValue: _dv,
      onValueChange: _ov,
      activationMode: _am,
      children: _ch,
      ...rest
    } = current;

    cleanups.dispose();
    refs = [];
    el.className = cn(className);
    el.replaceChildren();

    const list = document.createElement("div");
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-orientation", orientation ?? "horizontal");
    list.className = cn(tabsListVariants({ variant, orientation }));

    const panels = document.createElement("div");
    const active = state.get();

    for (const tab of tabs) {
      const id = `zen-tab-${++uid}`;
      const isActive = tab.value === active;

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.id = `${id}-trigger`;
      trigger.setAttribute("role", "tab");
      trigger.setAttribute("aria-selected", String(isActive));
      trigger.setAttribute("aria-controls", `${id}-panel`);
      trigger.setAttribute("data-state", isActive ? "active" : "inactive");
      // Unlike React's, the trigger inherits the list's variant: setting it in one
      // place is what the caller means. See the header note.
      trigger.className = cn(tabsTriggerVariants({ variant }));
      if (tab.disabled) trigger.disabled = true;
      trigger.append(...(typeof tab.label === "string" ? [document.createTextNode(tab.label)] : [tab.label]));

      const panel = document.createElement("div");
      panel.id = `${id}-panel`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `${id}-trigger`);
      panel.setAttribute("data-state", isActive ? "active" : "inactive");
      panel.className = cn(
        "zen-mt-3 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring zen-rounded-zen-sm",
      );
      // The panel is a tab stop: after Tab leaves the tablist it must land on the
      // panel's content, and an empty-ish panel would otherwise be skipped.
      panel.tabIndex = 0;
      panel.hidden = !isActive;
      panel.append(...(typeof tab.content === "string" ? [document.createTextNode(tab.content)] : [tab.content]));

      const onClick = () => state.set(tab.value);
      trigger.addEventListener("click", onClick);
      cleanups.add(() => trigger.removeEventListener("click", onClick));

      list.append(trigger);
      panels.append(panel);
      refs.push({ value: tab.value, trigger, panel });
    }

    el.append(list, panels);

    cleanups.add(
      rovingFocus(list, {
        items: () => refs.map((r) => r.trigger).filter((t) => !t.disabled),
        orientation: orientation === "vertical" ? "vertical" : "horizontal",
        onFocus: (item) => {
          if ((current.activationMode ?? "automatic") !== "automatic") return;
          const hit = refs.find((r) => r.trigger === item);
          if (hit) state.set(hit.value);
        },
      }),
    );

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  const paint = (active: string) => {
    for (const { value, trigger, panel } of refs) {
      const isActive = value === active;
      trigger.setAttribute("aria-selected", String(isActive));
      trigger.setAttribute("data-state", isActive ? "active" : "inactive");
      panel.setAttribute("data-state", isActive ? "active" : "inactive");
      panel.hidden = !isActive;
    }
  };

  render();
  disposer.add(state.subscribe(paint));
  disposer.add(() => cleanups.dispose());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      const structural = next.tabs !== undefined || next.variant !== undefined || next.orientation !== undefined;
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);
      if (structural) render();
      paint(state.get());
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export { tabsListVariants, tabsTriggerVariants };

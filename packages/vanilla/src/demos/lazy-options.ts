import { cn } from "../lib/cn";
import { Button } from "../components/button/button";
import { Input } from "../components/form/input/input";
import { Icon } from "../components/icon/icon";
import { Popover } from "../components/popover/popover";
import { VirtualizedItems } from "../components/listbox/virtualized-items";
import { DemoPage } from "./demo-helpers";

/**
 * Lazy-loaded options — the vanilla mirror of the React page.
 *
 * React drops <VirtualizedItems> INSIDE Radix's SelectContent / DropdownMenuContent.
 * Vanilla's Select and DropdownMenu are data-driven (`options` / `items`) with no
 * content slot to nest a viewport into, so here the same windowed list sits in a
 * Popover on a trigger: the popup, the trigger label and the selection are the
 * caller's, the windowing is VirtualizedItems'.
 */

type Option = { value: string; label: string };

const makeOptions = (n: number): Option[] =>
  Array.from({ length: n }, (_, i) => ({ value: `opt-${i}`, label: `Option ${i + 1}` }));

const FIVE_K = makeOptions(5000);
const TEN_K = makeOptions(10000);

/** One option row, styled like a Select item (classes carried over from select.ts). */
const OPTION_ROW =
  "zen-relative zen-flex zen-w-full zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-px-3 zen-py-1.5 zen-text-sm zen-outline-none hover:zen-bg-zen-muted";

/** The panel width — the popover's own padding/border wrap the viewport. */
const PANEL = "zen-w-64 zen-p-1";

const muted = (text: string, marginLeft = 0): HTMLElement => {
  const s = document.createElement("span");
  if (marginLeft) s.style.marginLeft = `${marginLeft}px`;
  s.style.fontSize = "0.8125rem";
  s.style.color = "var(--zen-color-muted-fg)";
  s.textContent = text;
  return s;
};

const flexRow = (children: Node[], wrap = false): HTMLElement => {
  const d = document.createElement("div");
  d.style.display = "flex";
  d.style.alignItems = "center";
  d.style.gap = "12px";
  if (wrap) d.style.flexWrap = "wrap";
  d.append(...children);
  return d;
};

/**
 * A select-shaped trigger: Popover + windowed option list. Returns the root and a
 * way to swap the items (section 3 filters them from outside).
 */
function lazySelect(opts: {
  items: Option[];
  value?: string;
  placeholder: string;
  width?: number;
  onValueChange?: (value: string) => void;
}): { el: HTMLElement; setItems: (items: Option[]) => void; setPlaceholder: (text: string) => void } {
  let value = opts.value;
  let items = opts.items;
  let placeholder = opts.placeholder;
  // value -> label, so the trigger can show a selection whose row has been
  // windowed away — the same lookup the React page builds for <SelectValue>.
  let labels = new Map(items.map((o) => [o.value, o.label]));

  const label = document.createElement("span");
  label.style.flex = "1";
  label.style.textAlign = "start";
  label.style.overflow = "hidden";
  label.style.whiteSpace = "nowrap";
  label.style.textOverflow = "ellipsis";
  const paintLabel = () => {
    label.textContent = value ? (labels.get(value) ?? value) : placeholder;
    label.style.color = value ? "var(--zen-color-foreground)" : "var(--zen-color-muted-fg)";
  };
  paintLabel();

  const trigger = Button({
    variant: "outline",
    iconRight: Icon({ name: "chevron-down", class: "zen-opacity-50" }),
    class: "zen-justify-between",
    children: label,
  });
  trigger.el.style.width = `${opts.width ?? 260}px`;

  const list = VirtualizedItems<Option>({
    items,
    estimateSize: 36,
    maxHeight: 300,
    children: ({ item }) => {
      const row = document.createElement("div");
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", String(item.value === value));
      row.className = cn(OPTION_ROW, item.value === value && "zen-bg-zen-muted zen-font-medium");
      row.textContent = item.label;
      row.addEventListener("click", () => {
        value = item.value;
        paintLabel();
        opts.onValueChange?.(item.value);
        list.update({});
        pop.close();
      });
      return row;
    },
  });
  list.el.setAttribute("role", "listbox");

  const pop = Popover({ trigger, align: "start", class: PANEL, children: list });

  return {
    el: pop.el,
    setItems(next) {
      items = next;
      labels = new Map(items.map((o) => [o.value, o.label]));
      list.update({ items });
    },
    setPlaceholder(text) {
      placeholder = text;
      paintLabel();
    },
  };
}

export default function LazyOptionsDemo(): HTMLElement {
  return DemoPage({
    title: "Lazy-loaded options (Select + DropdownMenu)",
    description:
      "Drop VirtualizedItems into a popup when the option list would otherwise be too large for the DOM (typically ≥ 1,000 entries). Vanilla's Select and DropdownMenu are data-driven, with no content slot to nest it in, so the windowed list sits in a Popover on a trigger — VirtualizedItems owns the scroll container and mounts only the visible rows.",
    sections: [
      {
        title: "1. Select — 5,000 options",
        codeTitle: "VirtualizedItems inside a Popover",
        codeDescription:
          "Renders only the visible window. Click sets the value and repaints the window.\n\nGotcha: with virtualization the selected row may scroll out of the rendered window, so the trigger cannot read its label from the row. Render the label yourself via a lookup map.",
        code: `const labels = new Map(options.map((o) => [o.value, o.label]));
let value = "opt-42";

const label = document.createElement("span");
label.textContent = labels.get(value) ?? "Pick an option";

const list = VirtualizedItems({
  items: options,
  estimateSize: 36,
  maxHeight: 300,
  children: ({ item }) => {
    const row = document.createElement("div");
    row.textContent = item.label;
    row.addEventListener("click", () => {
      value = item.value;
      label.textContent = labels.get(value);
      list.update({});      // repaint the visible window
      pop.close();
    });
    return row;
  },
});

const pop = Popover({
  trigger: Button({ variant: "outline", children: label }),
  children: list,
});`,
        render: () => {
          const readout = muted("value: opt-42");
          const sel = lazySelect({
            items: FIVE_K,
            value: "opt-42",
            placeholder: "Pick an option",
            onValueChange: (v) => {
              readout.textContent = `value: ${v}`;
            },
          });
          return flexRow([sel.el, readout]);
        },
      },
      {
        title: "2. DropdownMenu — 5,000 actions",
        codeTitle: "VirtualizedItems as a menu",
        codeDescription:
          "Each row is its own action with its own click handler. Useful for jump-to-record menus.",
        code: `const menu = VirtualizedItems({
  items: options,
  estimateSize: 32,
  maxHeight: 300,
  children: ({ item }) => {
    const row = document.createElement("div");
    row.setAttribute("role", "menuitem");
    row.textContent = item.label;
    row.addEventListener("click", () => { goTo(item); pop.close(); });
    return row;
  },
});

const pop = Popover({
  trigger: Button({ variant: "outline", children: "Jump to record" }),
  class: "zen-min-w-56",
  children: [heading("Records"), separator(), menu],
});`,
        render: () => {
          const picked = muted("picked: (none)");
          const heading = document.createElement("div");
          heading.className = "zen-px-2 zen-py-1.5 zen-text-sm zen-font-semibold";
          heading.textContent = "Records";
          const sep = document.createElement("div");
          sep.className = "-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border";
          sep.setAttribute("role", "separator");

          const menu = VirtualizedItems<Option>({
            items: FIVE_K,
            estimateSize: 32,
            maxHeight: 300,
            children: ({ item }) => {
              const row = document.createElement("div");
              row.setAttribute("role", "menuitem");
              row.className = cn(OPTION_ROW, "zen-cursor-pointer zen-px-2");
              row.textContent = item.label;
              row.addEventListener("click", () => {
                picked.textContent = `picked: ${item.label}`;
                pop.close();
              });
              return row;
            },
          });
          menu.el.setAttribute("role", "menu");

          const pop = Popover({
            trigger: Button({ variant: "outline", children: "Jump to record" }),
            align: "start",
            class: "zen-min-w-56 zen-p-1",
            children: [heading, sep, menu],
          });
          return flexRow([pop.el, picked]);
        },
      },
      {
        title: "3. Filter before virtualize — 10,000 options",
        codeTitle: "Apply a cheap text filter outside; pass the filtered slice in",
        codeDescription:
          "VirtualizedItems doesn't filter — that's by design. Filtering the source list keeps the visible window small AND keeps keyboard typeahead useful. For richer ranking + async sources, use Combobox.",
        code: `let filter = "";
const filtered = () =>
  filter ? all.filter((o) => o.label.toLowerCase().includes(filter)) : all;

const list = VirtualizedItems({ items: filtered(), estimateSize: 36, maxHeight: 300, children });

Input({
  placeholder: "Type to filter…",
  onInput: (e) => {
    filter = (e.target as HTMLInputElement).value.toLowerCase();
    list.update({ items: filtered() });
  },
});`,
        render: () => {
          let filter = "";
          const filtered = (): Option[] =>
            filter ? TEN_K.filter((o) => o.label.toLowerCase().includes(filter)) : TEN_K;
          const countLabel = (n: number) => `${n.toLocaleString()} options`;

          const sel = lazySelect({ items: filtered(), placeholder: countLabel(TEN_K.length) });
          const input = Input({
            placeholder: "Type to filter…",
            class: "zen-w-56",
            onInput: (e) => {
              filter = (e.target as HTMLInputElement).value.toLowerCase();
              const next = filtered();
              sel.setItems(next);
              sel.setPlaceholder(countLabel(next.length));
            },
          });
          return flexRow([input.el, sel.el], true);
        },
      },
      {
        title: "4. Why not just render all items?",
        codeTitle: "Three trade-offs at scale",
        code: `Without virtualization, the popup mounts every option row upfront:

  100  items   ≈ 1.5 ms  mount, fine
  1,000 items  ≈ 50 ms   noticeable jank on open
  10,000 items ≈ 500 ms+ unusable on lower-end devices

VirtualizedItems mounts ~12–20 rows regardless of dataset size.

Trade-off: keyboard typeahead can only see mounted rows. For
truly large sets with free-text search, the Combobox primitive
(filters first, then renders) is the right tool.`,
        render: () => {
          const p = document.createElement("p");
          p.style.color = "var(--zen-color-muted-fg)";
          p.style.margin = "0";
          p.style.fontSize = "0.8125rem";
          p.textContent = "See the code block for the rundown.";
          return p;
        },
      },
    ],
  });
}

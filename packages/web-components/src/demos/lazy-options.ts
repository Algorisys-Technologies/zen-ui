import { DemoPage } from "./demo-helpers";
import { cn } from "../index";

/**
 * Lazy-loaded options — the web-components mirror of the vanilla page.
 *
 * React drops <VirtualizedItems> INSIDE Radix's SelectContent / DropdownMenuContent.
 * <zen-select> and <zen-dropdown-menu> are data-driven (`options` / `items`) with
 * no content slot to nest a viewport into, so — as in vanilla — the windowed list
 * sits in a <zen-popover> on a trigger: the popup, the trigger label and the
 * selection are the caller's, the windowing is <zen-virtualized-items>'.
 *
 * `items` and the `children` render-prop are JS properties on the viewport; the
 * vanilla `list.update({})` repaint is `el.component.update({})`, and the
 * popover's `close()` is forwarded onto the element.
 */

type Option = { value: string; label: string };
type RowArgs = { item: Option; index: number };

const makeOptions = (n: number): Option[] =>
  Array.from({ length: n }, (_, i) => ({ value: `opt-${i}`, label: `Option ${i + 1}` }));

const FIVE_K = makeOptions(5000);
const TEN_K = makeOptions(10000);

/** One option row, styled like a Select item (classes carried over from select.ts). */
const OPTION_ROW =
  "zen-relative zen-flex zen-w-full zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-px-3 zen-py-1.5 zen-text-sm zen-outline-none hover:zen-bg-zen-muted";

/** The panel width — the popover's own padding/border wrap the viewport. */
const PANEL = "zen-w-64 zen-p-1";

const setProp = (node: HTMLElement, name: string, value: unknown): void => {
  (node as unknown as Record<string, unknown>)[name] = value;
};

/** Force a <zen-virtualized-items>' live component to repaint the visible window. */
function repaint(node: HTMLElement): void {
  (node as unknown as { component?: { update(p: Record<string, unknown>): void } }).component?.update({});
}

/** <zen-popover>'s close(), forwarded from the vanilla handle. */
function closePopover(pop: HTMLElement): void {
  (pop as unknown as { close?: () => void }).close?.();
}

function viewport(items: Option[], estimateSize: number, render: (args: RowArgs) => HTMLElement): HTMLElement {
  const list = document.createElement("zen-virtualized-items");
  list.setAttribute("estimate-size", String(estimateSize));
  list.setAttribute("max-height", "300");
  setProp(list, "items", items);
  setProp(list, "children", render);
  return list;
}

function popover(trigger: HTMLElement, panelClass: string, children: Node[]): HTMLElement {
  const pop = document.createElement("zen-popover");
  pop.setAttribute("align", "start");
  pop.setAttribute("class", panelClass);
  setProp(pop, "trigger", trigger);
  pop.append(...children);
  return pop;
}

function button(attrs: Record<string, string>, children: (Node | string)[]): HTMLElement {
  const b = document.createElement("zen-button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.append(...children);
  return b;
}

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
 * A select-shaped trigger: <zen-popover> + windowed option list. Returns the root
 * and a way to swap the items (section 3 filters them from outside).
 */
function lazySelect(opts: {
  items: Option[];
  value?: string;
  placeholder: string;
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

  const chevron = document.createElement("zen-icon");
  chevron.setAttribute("name", "chevron-down");
  chevron.setAttribute("class", "zen-opacity-50");

  // The host is a `display: contents` wrapper, so the 260px width the vanilla
  // page writes to `trigger.el.style` is a class here (zen-w-65 = 16.25rem).
  const trigger = button({ variant: "outline", class: "zen-justify-between zen-w-65" }, [label]);
  setProp(trigger, "iconRight", chevron);

  const list = viewport(items, 36, ({ item }) => {
    const row = document.createElement("div");
    row.setAttribute("role", "option");
    row.setAttribute("aria-selected", String(item.value === value));
    row.className = cn(OPTION_ROW, item.value === value && "zen-bg-zen-muted zen-font-medium");
    row.textContent = item.label;
    row.addEventListener("click", () => {
      value = item.value;
      paintLabel();
      opts.onValueChange?.(item.value);
      repaint(list);
      closePopover(pop);
    });
    return row;
  });
  list.setAttribute("role", "listbox");

  const pop = popover(trigger, PANEL, [list]);

  return {
    el: pop,
    setItems(next) {
      items = next;
      labels = new Map(items.map((o) => [o.value, o.label]));
      setProp(list, "items", items);
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
      "Drop VirtualizedItems into a popup when the option list would otherwise be too large for the DOM (typically ≥ 1,000 entries). <zen-select> and <zen-dropdown-menu> are data-driven, with no content slot to nest it in, so the windowed list sits in a <zen-popover> on a trigger — <zen-virtualized-items> owns the scroll container and mounts only the visible rows.",
    sections: [
      {
        title: "1. Select — 5,000 options",
        codeTitle: "<zen-virtualized-items> inside a <zen-popover>",
        codeDescription:
          "Renders only the visible window. Click sets the value and repaints the window.\n\nGotcha: with virtualization the selected row may scroll out of the rendered window, so the trigger cannot read its label from the row. Render the label yourself via a lookup map.",
        code: `const labels = new Map(options.map((o) => [o.value, o.label]));
let value = "opt-42";

const label = document.createElement("span");
label.textContent = labels.get(value) ?? "Pick an option";

const list = document.createElement("zen-virtualized-items");
list.setAttribute("estimate-size", "36");
list.setAttribute("max-height", "300");
list.items = options;
list.children = ({ item }) => {
  const row = document.createElement("div");
  row.textContent = item.label;
  row.addEventListener("click", () => {
    value = item.value;
    label.textContent = labels.get(value);
    list.component.update({});   // repaint the visible window
    pop.close();
  });
  return row;
};

const trigger = document.createElement("zen-button");
trigger.setAttribute("variant", "outline");
trigger.append(label);

const pop = document.createElement("zen-popover");
pop.trigger = trigger;
pop.append(list);`,
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
        codeTitle: "<zen-virtualized-items> as a menu",
        codeDescription:
          "Each row is its own action with its own click handler. Useful for jump-to-record menus.",
        code: `const menu = document.createElement("zen-virtualized-items");
menu.setAttribute("estimate-size", "32");
menu.setAttribute("max-height", "300");
menu.items = options;
menu.children = ({ item }) => {
  const row = document.createElement("div");
  row.setAttribute("role", "menuitem");
  row.textContent = item.label;
  row.addEventListener("click", () => { goTo(item); pop.close(); });
  return row;
};

const pop = document.createElement("zen-popover");
pop.setAttribute("class", "zen-min-w-56");
pop.trigger = jumpButton;   // <zen-button variant="outline">Jump to record</zen-button>
pop.append(heading("Records"), separator(), menu);`,
        render: () => {
          const picked = muted("picked: (none)");
          const heading = document.createElement("div");
          heading.className = "zen-px-2 zen-py-1.5 zen-text-sm zen-font-semibold";
          heading.textContent = "Records";
          const sep = document.createElement("div");
          sep.className = "-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border";
          sep.setAttribute("role", "separator");

          const menu = viewport(FIVE_K, 32, ({ item }) => {
            const row = document.createElement("div");
            row.setAttribute("role", "menuitem");
            row.className = cn(OPTION_ROW, "zen-cursor-pointer zen-px-2");
            row.textContent = item.label;
            row.addEventListener("click", () => {
              picked.textContent = `picked: ${item.label}`;
              closePopover(pop);
            });
            return row;
          });
          menu.setAttribute("role", "menu");

          const pop = popover(button({ variant: "outline" }, ["Jump to record"]), "zen-min-w-56 zen-p-1", [
            heading,
            sep,
            menu,
          ]);
          return flexRow([pop, picked]);
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

list.items = filtered();

const input = document.createElement("zen-input");
input.setAttribute("placeholder", "Type to filter…");
input.addEventListener("input", (e) => {
  filter = (e.target as HTMLInputElement).value.toLowerCase();
  list.items = filtered();
});`,
        render: () => {
          let filter = "";
          const filtered = (): Option[] =>
            filter ? TEN_K.filter((o) => o.label.toLowerCase().includes(filter)) : TEN_K;
          const countLabel = (n: number) => `${n.toLocaleString()} options`;

          const sel = lazySelect({ items: filtered(), placeholder: countLabel(TEN_K.length) });
          const input = document.createElement("zen-input");
          input.setAttribute("placeholder", "Type to filter…");
          input.setAttribute("class", "zen-w-56");
          // The native `input` event bubbles from the inner <input> to the host.
          input.addEventListener("input", (e) => {
            filter = (e.target as HTMLInputElement).value.toLowerCase();
            const next = filtered();
            sel.setItems(next);
            sel.setPlaceholder(countLabel(next.length));
          });
          return flexRow([input, sel.el], true);
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

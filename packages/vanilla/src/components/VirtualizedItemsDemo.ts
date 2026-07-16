import { cn } from "../lib/cn";
import { Input } from "./form/input/input";
import { VirtualizedItems } from "./listbox/virtualized-items";
import { DemoPage } from "./demo-helpers";

type Option = { value: string; label: string };

const makeOptions = (n: number): Option[] =>
  Array.from({ length: n }, (_, i) => ({ value: `opt-${i}`, label: `Option ${i + 1}` }));

const FIVE_K = makeOptions(5000);
const TEN_K = makeOptions(10000);

/* A listbox-shaped surface — the same border/shadow the vanilla Select popover
 * uses, so a windowed list reads as the option panel it stands in for. */
const SURFACE =
  "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-zen-md zen-w-72";

/* One option row, styled like a Select item; classes carried over from select.ts. */
const OPTION_ROW =
  "zen-relative zen-flex zen-w-full zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-px-3 zen-py-1.5 zen-text-sm zen-outline-none hover:zen-bg-zen-muted";

const readout = (text: string): HTMLElement => {
  const s = document.createElement("span");
  s.style.marginLeft = "12px";
  s.style.fontSize = "0.8125rem";
  s.style.color = "var(--zen-color-muted-fg)";
  s.textContent = text;
  return s;
};

export default function VirtualizedItemsDemo(): HTMLElement {
  return DemoPage({
    title: "VirtualizedItems",
    description:
      "A drop-in scrolling viewport that mounts only the visible window of a long list — ~15 rows on screen instead of 10,000 in the DOM. The React binding wraps @tanstack/react-virtual and nests inside SelectContent; vanilla has no such dependency and no compound Select to nest in, so it owns its own scroll container and the windowing maths are written out. Same prop names, same two modes.",
    sections: [
      {
        title: "1. A 5,000-option listbox",
        codeTitle: "VirtualizedItems as an option panel",
        codeDescription:
          "Renders only the visible window. The children render-prop produces one row per index; click sets the value and forces a repaint so the tick follows the selection.",
        code: `let selected = "opt-42";

const list = VirtualizedItems({
  items: options,          // 5,000 { value, label }
  estimateSize: 36,
  maxHeight: 300,
  children: ({ item }) => {
    const row = document.createElement("div");
    row.className = optionRowClass;
    row.textContent = item.label;
    if (item.value === selected) row.dataset.selected = "";
    row.addEventListener("click", () => {
      selected = item.value;
      list.update({});       // no re-render — repaint the visible window
    });
    return row;
  },
});
surface.append(list.el);`,
        render: () => {
          let selected = "opt-42";
          const value = readout("value: opt-42");
          const list = VirtualizedItems<Option>({
            items: FIVE_K,
            estimateSize: 36,
            maxHeight: 300,
            class: SURFACE,
            children: ({ item }) => {
              const row = document.createElement("div");
              row.className = cn(
                OPTION_ROW,
                item.value === selected && "zen-bg-zen-muted zen-font-medium",
              );
              row.textContent = item.label;
              row.addEventListener("click", () => {
                selected = item.value;
                value.textContent = `value: ${item.value}`;
                list.update({});
              });
              return row;
            },
          });
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.alignItems = "flex-start";
          wrap.append(list.el, value);
          return wrap;
        },
      },
      {
        title: "2. A 5,000-action menu",
        codeTitle: "Each row is its own action",
        codeDescription:
          "The same viewport, denser rows (estimateSize 32). Useful for jump-to-record menus where every row triggers an onSelect.",
        code: `const menu = VirtualizedItems({
  items: records,
  estimateSize: 32,
  maxHeight: 300,
  children: ({ item }) => {
    const row = document.createElement("div");
    row.className = menuItemClass;
    row.textContent = item.label;
    row.addEventListener("click", () => goTo(item));
    return row;
  },
});`,
        render: () => {
          const picked = readout("picked: (none)");
          const menu = VirtualizedItems<Option>({
            items: FIVE_K,
            estimateSize: 32,
            maxHeight: 300,
            class: SURFACE,
            children: ({ item }) => {
              const row = document.createElement("div");
              row.className = cn(OPTION_ROW, "zen-cursor-pointer");
              row.textContent = item.label;
              row.addEventListener("click", () => {
                picked.textContent = `picked: ${item.label}`;
              });
              return row;
            },
          });
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.alignItems = "flex-start";
          wrap.append(menu.el, picked);
          return wrap;
        },
      },
      {
        title: "3. Filter before virtualize — 10,000 options",
        codeTitle: "Filter the source list outside; feed the slice in with update()",
        codeDescription:
          "VirtualizedItems does not filter — that is by design. Filtering the source keeps the window small AND keeps a caller's own typeahead useful. For richer ranking + async sources, use Combobox.",
        code: `let filter = "";
const filtered = () =>
  filter ? all.filter((o) => o.label.toLowerCase().includes(filter)) : all;

const list = VirtualizedItems({ items: filtered(), estimateSize: 36, maxHeight: 300, children });

const input = Input({
  placeholder: "Type to filter…",
  onInput: (e) => {
    filter = (e.target as HTMLInputElement).value.toLowerCase();
    list.update({ items: filtered() });   // targeted DOM write, not a re-render
  },
});`,
        render: () => {
          let filter = "";
          const filtered = (): Option[] =>
            filter ? TEN_K.filter((o) => o.label.toLowerCase().includes(filter)) : TEN_K;

          const count = readout(`${TEN_K.length.toLocaleString()} options`);
          const list = VirtualizedItems<Option>({
            items: filtered(),
            estimateSize: 36,
            maxHeight: 300,
            class: SURFACE,
            children: ({ item }) => {
              const row = document.createElement("div");
              row.className = OPTION_ROW;
              row.textContent = item.label;
              return row;
            },
          });

          const input = Input({
            placeholder: "Type to filter…",
            class: "zen-w-56",
            onInput: (e) => {
              filter = (e.target as HTMLInputElement).value.toLowerCase();
              const next = filtered();
              count.textContent = `${next.length.toLocaleString()} options`;
              list.update({ items: next });
            },
          });

          const controls = document.createElement("div");
          controls.style.display = "flex";
          controls.style.alignItems = "center";
          controls.style.marginBottom = "8px";
          controls.append(input.el, count);

          const wrap = document.createElement("div");
          wrap.append(controls, list.el);
          return wrap;
        },
      },
      {
        title: "4. Sparse mode — a server-paged list",
        codeTitle: "totalCount + getItem + onVisibleRange",
        codeDescription:
          "When the whole list is not in memory: totalCount rows exist, getItem answers for the ones that have arrived and undefined for the rest, and onVisibleRange says which page to fetch. Scroll fast — rows render a skeleton, then fill once their page 'loads' (simulated here with a timer).",
        code: `const loaded = new Map<number, Option>();

const list = VirtualizedItems({
  totalCount: 40000,
  estimateSize: 36,
  maxHeight: 300,
  getItem: (i) => loaded.get(i),
  onVisibleRange: (min, max) => fetchPage(min, max),   // fill loaded, then list.update({})
  children: ({ item }) =>
    item ? row(item.label) : skeletonRow(),            // undefined = not yet loaded
});`,
        render: () => {
          const TOTAL = 40000;
          const loaded = new Map<number, Option>();
          const pending = new Set<number>();
          const PAGE = 50;

          const list = VirtualizedItems<Option>({
            totalCount: TOTAL,
            estimateSize: 36,
            maxHeight: 300,
            class: SURFACE,
            getItem: (i) => loaded.get(i),
            onVisibleRange: (min, max) => {
              // Round to page boundaries and "fetch" any not already loaded/in-flight.
              const first = Math.floor(min / PAGE) * PAGE;
              const lastPage = Math.floor(max / PAGE) * PAGE;
              for (let start = first; start <= lastPage; start += PAGE) {
                if (pending.has(start)) continue;
                if (loaded.has(start)) continue;
                pending.add(start);
                setTimeout(() => {
                  for (let i = start; i < Math.min(start + PAGE, TOTAL); i++) {
                    loaded.set(i, { value: `row-${i}`, label: `Record #${i + 1}` });
                  }
                  pending.delete(start);
                  list.update({});
                }, 250);
              }
            },
            children: ({ item }) => {
              const row = document.createElement("div");
              row.className = OPTION_ROW;
              if (item) {
                row.textContent = item.label;
              } else {
                const bar = document.createElement("div");
                bar.className = "zen-h-3 zen-w-32 zen-rounded-zen-sm zen-bg-zen-muted zen-animate-pulse";
                row.append(bar);
              }
              return row;
            },
          });
          return list.el;
        },
      },
      {
        title: "5. Why not just render all rows?",
        codeTitle: "The trade-off at scale",
        code: `Without windowing, a surface mounts every row upfront:

  100  rows   ≈ 1.5 ms  mount, fine
  1,000 rows  ≈ 50 ms   noticeable jank on open
  10,000 rows ≈ 500 ms+ unusable on lower-end devices

VirtualizedItems mounts ~12–20 rows regardless of dataset size, and
rebuilds them only when the visible WINDOW changes — scrolling inside
the current window touches nothing.

Trade-off: a caller's own keyboard typeahead can only see mounted rows.
For truly large sets with free-text search, filter first (section 3) or
reach for Combobox, which filters before it renders.`,
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

import { DemoPage } from "./demo-helpers";
import { cn } from "../index";

/**
 * Mirrors the vanilla VirtualizedItemsDemo, rendered through <zen-virtualized-items>.
 * `items` and the `children` render-prop are JS properties; `estimate-size`,
 * `max-height` and `total-count` are attributes; sparse mode adds the `getItem`
 * property and the zen-visible-range event. The vanilla `list.update({})` repaint is
 * reproduced by calling `el.component.update({})` on the element's live component.
 */
type Option = { value: string; label: string };
type RowArgs = { item: Option; index: number };
type SparseRowArgs = { item: Option | undefined; index: number };

const makeOptions = (n: number): Option[] =>
  Array.from({ length: n }, (_, i) => ({ value: `opt-${i}`, label: `Option ${i + 1}` }));

const FIVE_K = makeOptions(5000);
const TEN_K = makeOptions(10000);

const SURFACE =
  "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-zen-md zen-w-72";

const OPTION_ROW =
  "zen-relative zen-flex zen-w-full zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-px-3 zen-py-1.5 zen-text-sm zen-outline-none hover:zen-bg-zen-muted";

/** Force the element's live component to repaint the visible window. */
function repaint(node: HTMLElement): void {
  (node as unknown as { component?: { update(p: Record<string, unknown>): void } }).component?.update(
    {},
  );
}

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
      "A drop-in scrolling viewport that mounts only the visible window of a long list — ~15 rows on screen instead of 10,000 in the DOM. It owns its own scroll container and the windowing maths are written out. Set `items` + a `children` render-prop, or drive it in sparse mode with `total-count` + `getItem` + the zen-visible-range event.",
    sections: [
      {
        title: "1. A 5,000-option listbox",
        codeTitle: "VirtualizedItems as an option panel",
        codeDescription:
          "Renders only the visible window. The children render-prop produces one row per index; click sets the value and repaints so the tick follows the selection.",
        code: `const list = document.createElement("zen-virtualized-items");
list.setAttribute("estimate-size", "36");
list.setAttribute("max-height", "300");
list.items = options;   // 5,000 { value, label }
list.children = ({ item }) => {
  const row = document.createElement("div");
  row.textContent = item.label;
  row.addEventListener("click", () => { selected = item.value; list.component.update({}); });
  return row;
};`,
        render: () => {
          let selected = "opt-42";
          const value = readout("value: opt-42");
          const list = document.createElement("zen-virtualized-items");
          list.setAttribute("class", SURFACE);
          list.setAttribute("estimate-size", "36");
          list.setAttribute("max-height", "300");
          const bag = list as unknown as Record<string, unknown>;
          bag.items = FIVE_K;
          bag.children = ({ item }: RowArgs) => {
            const row = document.createElement("div");
            row.className = cn(
              OPTION_ROW,
              item.value === selected && "zen-bg-zen-muted zen-font-medium",
            );
            row.textContent = item.label;
            row.addEventListener("click", () => {
              selected = item.value;
              value.textContent = `value: ${item.value}`;
              repaint(list);
            });
            return row;
          };

          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.alignItems = "flex-start";
          wrap.append(list, value);
          return wrap;
        },
      },
      {
        title: "2. A 5,000-action menu",
        codeTitle: "Each row is its own action",
        codeDescription:
          "The same viewport, denser rows (estimate-size 32). Useful for jump-to-record menus where every row triggers a select.",
        code: `list.setAttribute("estimate-size", "32");
list.children = ({ item }) => {
  const row = document.createElement("div");
  row.textContent = item.label;
  row.addEventListener("click", () => goTo(item));
  return row;
};`,
        render: () => {
          const picked = readout("picked: (none)");
          const menu = document.createElement("zen-virtualized-items");
          menu.setAttribute("class", SURFACE);
          menu.setAttribute("estimate-size", "32");
          menu.setAttribute("max-height", "300");
          const bag = menu as unknown as Record<string, unknown>;
          bag.items = FIVE_K;
          bag.children = ({ item }: RowArgs) => {
            const row = document.createElement("div");
            row.className = cn(OPTION_ROW, "zen-cursor-pointer");
            row.textContent = item.label;
            row.addEventListener("click", () => {
              picked.textContent = `picked: ${item.label}`;
            });
            return row;
          };

          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.alignItems = "flex-start";
          wrap.append(menu, picked);
          return wrap;
        },
      },
      {
        title: "3. Filter before virtualize — 10,000 options",
        codeTitle: "Filter the source list outside; feed the slice in via el.items",
        codeDescription:
          "VirtualizedItems does not filter — that is by design. Filtering the source keeps the window small AND keeps a caller's own typeahead useful. For richer ranking + async sources, use Combobox.",
        code: `input.addEventListener("input", () => {
  filter = input.value.toLowerCase();
  list.items = filtered();   // targeted DOM write, not a re-render
});`,
        render: () => {
          let filter = "";
          const filtered = (): Option[] =>
            filter ? TEN_K.filter((o) => o.label.toLowerCase().includes(filter)) : TEN_K;

          const count = readout(`${TEN_K.length.toLocaleString()} options`);
          const list = document.createElement("zen-virtualized-items");
          list.setAttribute("class", SURFACE);
          list.setAttribute("estimate-size", "36");
          list.setAttribute("max-height", "300");
          const bag = list as unknown as Record<string, unknown>;
          bag.items = filtered();
          bag.children = ({ item }: RowArgs) => {
            const row = document.createElement("div");
            row.className = OPTION_ROW;
            row.textContent = item.label;
            return row;
          };

          const input = document.createElement("zen-input");
          input.setAttribute("placeholder", "Type to filter…");
          input.style.width = "14rem";
          input.addEventListener("input", () => {
            const field = input.querySelector("input");
            filter = (field ? field.value : "").toLowerCase();
            const next = filtered();
            count.textContent = `${next.length.toLocaleString()} options`;
            bag.items = next;
          });

          const controls = document.createElement("div");
          controls.style.display = "flex";
          controls.style.alignItems = "center";
          controls.style.marginBottom = "8px";
          controls.append(input, count);

          const wrap = document.createElement("div");
          wrap.append(controls, list);
          return wrap;
        },
      },
      {
        title: "4. Sparse mode — a server-paged list",
        codeTitle: "total-count + getItem + zen-visible-range",
        codeDescription:
          "When the whole list is not in memory: total-count rows exist, getItem answers for the ones that have arrived and undefined for the rest, and zen-visible-range says which page to fetch. Scroll fast — rows render a skeleton, then fill once their page 'loads' (simulated here with a timer).",
        code: `const list = document.createElement("zen-virtualized-items");
list.setAttribute("total-count", "40000");
list.getItem = (i) => loaded.get(i);
list.onVisibleRange = (min, max) => fetchPage(min, max);   // fill loaded, then list.component.update({})
list.children = ({ item }) => (item ? row(item.label) : skeletonRow());`,
        render: () => {
          const TOTAL = 40000;
          const loaded = new Map<number, Option>();
          const pending = new Set<number>();
          const PAGE = 50;

          const list = document.createElement("zen-virtualized-items");
          list.setAttribute("class", SURFACE);
          list.setAttribute("total-count", String(TOTAL));
          list.setAttribute("estimate-size", "36");
          list.setAttribute("max-height", "300");
          const bag = list as unknown as Record<string, unknown>;
          bag.getItem = (i: number) => loaded.get(i);
          bag.onVisibleRange = (min: number, max: number) => {
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
                repaint(list);
              }, 250);
            }
          };
          bag.children = ({ item }: SparseRowArgs) => {
            const row = document.createElement("div");
            row.className = OPTION_ROW;
            if (item) {
              row.textContent = item.label;
            } else {
              const skeleton = document.createElement("div");
              skeleton.className =
                "zen-h-3 zen-w-32 zen-rounded-zen-sm zen-bg-zen-muted zen-animate-pulse";
              row.append(skeleton);
            }
            return row;
          };
          return list;
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

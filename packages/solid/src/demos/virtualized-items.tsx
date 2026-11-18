import { type JSX, createMemo, createSignal } from "solid-js";
import { cn } from "../lib/cn";
import { Input } from "../components/form/input/input";
import { VirtualizedItems } from "../components/listbox/virtualized-items";
import { DemoPage, DemoSection } from "./demo-helpers";

/**
 * Solid port of the vanilla VirtualizedItems demo — same five sections. The
 * vanilla factory repaints through `list.update()`; here the same moments are
 * signals the row JSX reads, so the window repaints itself.
 */

type Option = { value: string; label: string };

const makeOptions = (n: number): Option[] =>
  Array.from({ length: n }, (_, i) => ({ value: `opt-${i}`, label: `Option ${i + 1}` }));

const FIVE_K = makeOptions(5000);
const TEN_K = makeOptions(10000);

/* A listbox-shaped surface — the same border/shadow the Select popover uses,
 * so a windowed list reads as the option panel it stands in for. */
const SURFACE =
  "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-zen-md zen-w-72";

/* One option row, styled like a Select item. */
const OPTION_ROW =
  "zen-relative zen-flex zen-w-full zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-px-3 zen-py-1.5 zen-text-sm zen-outline-none hover:zen-bg-zen-muted";

const READOUT: JSX.CSSProperties = {
  "margin-left": "12px",
  "font-size": "0.8125rem",
  color: "var(--zen-color-muted-fg)",
};

const ROW_WRAP: JSX.CSSProperties = { display: "flex", "align-items": "flex-start" };

/** Section 4: a 40,000-row list whose pages "arrive" on a timer. */
const SparseList = () => {
  const TOTAL = 40000;
  const PAGE = 50;
  const loaded = new Map<number, Option>();
  const pending = new Set<number>();
  // The Map is not reactive; bumping this is what tells getItem to be re-read.
  const [version, setVersion] = createSignal(0);

  const onVisibleRange = (min: number, max: number) => {
    // Round to page boundaries and "fetch" any not already loaded/in-flight.
    const first = Math.floor(min / PAGE) * PAGE;
    const lastPage = Math.floor(max / PAGE) * PAGE;
    for (let start = first; start <= lastPage; start += PAGE) {
      if (pending.has(start) || loaded.has(start)) continue;
      pending.add(start);
      setTimeout(() => {
        for (let i = start; i < Math.min(start + PAGE, TOTAL); i++) {
          loaded.set(i, { value: `row-${i}`, label: `Record #${i + 1}` });
        }
        pending.delete(start);
        setVersion((v) => v + 1);
      }, 250);
    }
  };

  return (
    <VirtualizedItems<Option>
      totalCount={TOTAL}
      estimateSize={36}
      maxHeight={300}
      class={SURFACE}
      getItem={(i) => {
        version();
        return loaded.get(i);
      }}
      onVisibleRange={onVisibleRange}
    >
      {(row) => (
        <div class={OPTION_ROW}>
          {row.item ? (
            row.item.label
          ) : (
            <div class="zen-h-3 zen-w-32 zen-rounded-zen-sm zen-bg-zen-muted zen-animate-pulse" />
          )}
        </div>
      )}
    </VirtualizedItems>
  );
};

const NewVirtualizedItemsDemo = () => {
  const [selected, setSelected] = createSignal("opt-42");
  const [picked, setPicked] = createSignal("(none)");
  const [filter, setFilter] = createSignal("");
  const filtered = createMemo(() => {
    const f = filter();
    return f ? TEN_K.filter((o) => o.label.toLowerCase().includes(f)) : TEN_K;
  });

  return (
    <DemoPage
      title="VirtualizedItems"
      description="A drop-in scrolling viewport that mounts only the visible window of a long list — ~15 rows on screen instead of 10,000 in the DOM. The Solid binding wraps @tanstack/solid-virtual, as React wraps @tanstack/react-virtual; vanilla has no such dependency and writes the windowing maths out. Same prop names, same two modes."
    >
      <DemoSection
        title="1. A 5,000-option listbox"
        codeTitle="VirtualizedItems as an option panel"
        codeDescription="Renders only the visible window. The children render-prop produces one row per index; click sets the value, and the row reads the selection signal so the tick follows it."
        code={`const [selected, setSelected] = createSignal("opt-42");

<VirtualizedItems
  items={options}          // 5,000 { value, label }
  estimateSize={36}
  maxHeight={300}
>
  {({ item }) => (
    <div
      class={cn(optionRowClass, item.value === selected() && "zen-bg-zen-muted")}
      onClick={() => setSelected(item.value)}
    >
      {item.label}
    </div>
  )}
</VirtualizedItems>`}
      >
        <div style={ROW_WRAP}>
          <VirtualizedItems items={FIVE_K} estimateSize={36} maxHeight={300} class={SURFACE}>
            {(row) => (
              <div
                class={cn(
                  OPTION_ROW,
                  row.item.value === selected() && "zen-bg-zen-muted zen-font-medium",
                )}
                onClick={() => setSelected(row.item.value)}
              >
                {row.item.label}
              </div>
            )}
          </VirtualizedItems>
          <span style={READOUT}>value: {selected()}</span>
        </div>
      </DemoSection>

      <DemoSection
        title="2. A 5,000-action menu"
        codeTitle="Each row is its own action"
        codeDescription="The same viewport, denser rows (estimateSize 32). Useful for jump-to-record menus where every row triggers an onSelect."
        code={`<VirtualizedItems items={records} estimateSize={32} maxHeight={300}>
  {({ item }) => (
    <div class={menuItemClass} onClick={() => goTo(item)}>
      {item.label}
    </div>
  )}
</VirtualizedItems>`}
      >
        <div style={ROW_WRAP}>
          <VirtualizedItems items={FIVE_K} estimateSize={32} maxHeight={300} class={SURFACE}>
            {(row) => (
              <div
                class={cn(OPTION_ROW, "zen-cursor-pointer")}
                onClick={() => setPicked(row.item.label)}
              >
                {row.item.label}
              </div>
            )}
          </VirtualizedItems>
          <span style={READOUT}>picked: {picked()}</span>
        </div>
      </DemoSection>

      <DemoSection
        title="3. Filter before virtualize — 10,000 options"
        codeTitle="Filter the source list outside; feed the slice in as items"
        codeDescription="VirtualizedItems does not filter — that is by design. Filtering the source keeps the window small AND keeps a caller's own typeahead useful. For richer ranking + async sources, use Combobox."
        code={`const [filter, setFilter] = createSignal("");
const filtered = createMemo(() =>
  filter() ? all.filter((o) => o.label.toLowerCase().includes(filter())) : all,
);

<Input
  placeholder="Type to filter…"
  onInput={(e) => setFilter(e.currentTarget.value.toLowerCase())}
/>
<VirtualizedItems items={filtered()} estimateSize={36} maxHeight={300}>
  {({ item }) => <div class={optionRowClass}>{item.label}</div>}
</VirtualizedItems>`}
      >
        <div>
          <div style={{ display: "flex", "align-items": "center", "margin-bottom": "8px" }}>
            <Input
              placeholder="Type to filter…"
              class="zen-w-56"
              onInput={(e) => setFilter(e.currentTarget.value.toLowerCase())}
            />
            <span style={READOUT}>{filtered().length.toLocaleString()} options</span>
          </div>
          <VirtualizedItems items={filtered()} estimateSize={36} maxHeight={300} class={SURFACE}>
            {(row) => <div class={OPTION_ROW}>{row.item.label}</div>}
          </VirtualizedItems>
        </div>
      </DemoSection>

      <DemoSection
        title="4. Sparse mode — a server-paged list"
        codeTitle="totalCount + getItem + onVisibleRange"
        codeDescription="When the whole list is not in memory: totalCount rows exist, getItem answers for the ones that have arrived and undefined for the rest, and onVisibleRange says which page to fetch. Scroll fast — rows render a skeleton, then fill once their page 'loads' (simulated here with a timer)."
        code={`const loaded = new Map<number, Option>();
const [version, setVersion] = createSignal(0);   // bump when a page lands

<VirtualizedItems
  totalCount={40000}
  estimateSize={36}
  maxHeight={300}
  getItem={(i) => (version(), loaded.get(i))}
  onVisibleRange={(min, max) => fetchPage(min, max)}   // fill loaded, then setVersion
>
  {({ item }) => (item ? row(item.label) : skeletonRow())}   // undefined = not yet loaded
</VirtualizedItems>`}
      >
        <SparseList />
      </DemoSection>

      <DemoSection
        title="5. Why not just render all rows?"
        codeTitle="The trade-off at scale"
        code={`Without windowing, a surface mounts every row upfront:

  100  rows   ≈ 1.5 ms  mount, fine
  1,000 rows  ≈ 50 ms   noticeable jank on open
  10,000 rows ≈ 500 ms+ unusable on lower-end devices

VirtualizedItems mounts ~12–20 rows regardless of dataset size, and
rebuilds them only when the visible WINDOW changes — scrolling inside
the current window touches nothing.

Trade-off: a caller's own keyboard typeahead can only see mounted rows.
For truly large sets with free-text search, filter first (section 3) or
reach for Combobox, which filters before it renders.`}
      >
        <p style={{ color: "var(--zen-color-muted-fg)", margin: "0", "font-size": "0.8125rem" }}>
          See the code block for the rundown.
        </p>
      </DemoSection>
    </DemoPage>
  );
};

export default NewVirtualizedItemsDemo;

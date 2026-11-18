import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { Input } from "../components/form/input/input";
import { VirtualizedItems } from "../components/listbox/virtualized-items";
import { CodeExample } from "./demo-helpers";

type Option = { value: string; label: string };

const makeOptions = (n: number): Option[] =>
  Array.from({ length: n }, (_, i) => ({ value: `opt-${i}`, label: `Option ${i + 1}` }));

const FIVE_K = makeOptions(5000);
const TEN_K = makeOptions(10000);

/* A listbox-shaped surface — the same border/shadow the Select popover uses, so
 * a windowed list reads as the option panel it stands in for. */
const SURFACE =
  "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-zen-md zen-w-72";

/* One option row, styled like a Select item. */
const OPTION_ROW =
  "zen-relative zen-flex zen-w-full zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-px-3 zen-py-1.5 zen-text-sm zen-outline-none hover:zen-bg-zen-muted";

const READOUT = "zen-ml-3 zen-text-xs zen-text-zen-muted-fg";

const ROW_WRAP: React.CSSProperties = { display: "flex", alignItems: "flex-start" };

function OptionListbox() {
  const [selected, setSelected] = useState("opt-42");
  return (
    <div style={ROW_WRAP}>
      <VirtualizedItems items={FIVE_K} estimateSize={36} maxHeight={300} className={SURFACE}>
        {({ item }) => (
          <div
            className={cn(OPTION_ROW, item.value === selected && "zen-bg-zen-muted zen-font-medium")}
            onClick={() => setSelected(item.value)}
          >
            {item.label}
          </div>
        )}
      </VirtualizedItems>
      <span className={READOUT}>value: {selected}</span>
    </div>
  );
}

function ActionMenu() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div style={ROW_WRAP}>
      <VirtualizedItems items={FIVE_K} estimateSize={32} maxHeight={300} className={SURFACE}>
        {({ item }) => (
          <div className={cn(OPTION_ROW, "zen-cursor-pointer")} onClick={() => setPicked(item.label)}>
            {item.label}
          </div>
        )}
      </VirtualizedItems>
      <span className={READOUT}>picked: {picked ?? "(none)"}</span>
    </div>
  );
}

function FilteredList() {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => {
    const f = filter.toLowerCase();
    return f ? TEN_K.filter((o) => o.label.toLowerCase().includes(f)) : TEN_K;
  }, [filter]);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <Input
          placeholder="Type to filter…"
          className="zen-w-56"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <span className={READOUT}>{filtered.length.toLocaleString()} options</span>
      </div>
      <VirtualizedItems
        items={filtered}
        estimateSize={36}
        maxHeight={300}
        className={SURFACE}
        getKey={(o) => o.value}
      >
        {({ item }) => <div className={OPTION_ROW}>{item.label}</div>}
      </VirtualizedItems>
    </div>
  );
}

const TOTAL = 40000;
const PAGE = 50;

function SparseList() {
  // The loaded rows live in a ref (the cache), and a version counter re-renders
  // the list when a page lands — the React equivalent of vanilla's update({}).
  const loaded = useRef(new Map<number, Option>());
  const pending = useRef(new Set<number>());
  const [, setVersion] = useState(0);

  const onVisibleRange = useCallback((min: number, max: number) => {
    // Round to page boundaries and "fetch" any not already loaded/in-flight.
    const first = Math.floor(min / PAGE) * PAGE;
    const lastPage = Math.floor(max / PAGE) * PAGE;
    for (let start = first; start <= lastPage; start += PAGE) {
      if (pending.current.has(start) || loaded.current.has(start)) continue;
      pending.current.add(start);
      setTimeout(() => {
        for (let i = start; i < Math.min(start + PAGE, TOTAL); i++) {
          loaded.current.set(i, { value: `row-${i}`, label: `Record #${i + 1}` });
        }
        pending.current.delete(start);
        setVersion((v) => v + 1);
      }, 250);
    }
  }, []);

  return (
    <VirtualizedItems<Option>
      totalCount={TOTAL}
      estimateSize={36}
      maxHeight={300}
      className={SURFACE}
      getItem={(i) => loaded.current.get(i)}
      onVisibleRange={onVisibleRange}
    >
      {({ item }) => (
        <div className={OPTION_ROW}>
          {item ? (
            item.label
          ) : (
            <div className="zen-h-3 zen-w-32 zen-rounded-zen-sm zen-bg-zen-muted zen-animate-pulse" />
          )}
        </div>
      )}
    </VirtualizedItems>
  );
}

const NewVirtualizedItemsDemo: React.FC = () => (
  <div className="demo-page">
    <h1>VirtualizedItems</h1>
    <p className="lede">
      A drop-in scrolling viewport that mounts only the visible window of a long list
      — ~15 rows on screen instead of 10,000 in the DOM. The React binding wraps
      @tanstack/react-virtual and nests inside SelectContent, DropdownMenuContent or
      PopoverContent; on its own, as here, it owns its own scroll container. Same prop
      names as every binding, same two modes.
    </p>

    <section className="demo-section">
      <h2>1. A 5,000-option listbox</h2>
      <CodeExample
        title="VirtualizedItems as an option panel"
        description="Renders only the visible window. The children render-prop produces one row per index; click sets the value in state and the tick follows the selection on the next render."
        code={`const [selected, setSelected] = useState("opt-42");

<VirtualizedItems
  items={options}          // 5,000 { value, label }
  estimateSize={36}
  maxHeight={300}
>
  {({ item }) => (
    <div
      className={cn(optionRowClass, item.value === selected && "zen-bg-zen-muted")}
      onClick={() => setSelected(item.value)}
    >
      {item.label}
    </div>
  )}
</VirtualizedItems>`}
      >
        <OptionListbox />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. A 5,000-action menu</h2>
      <CodeExample
        title="Each row is its own action"
        description="The same viewport, denser rows (estimateSize 32). Useful for jump-to-record menus where every row triggers an onSelect."
        code={`<VirtualizedItems items={records} estimateSize={32} maxHeight={300}>
  {({ item }) => (
    <div className={menuItemClass} onClick={() => goTo(item)}>
      {item.label}
    </div>
  )}
</VirtualizedItems>`}
      >
        <ActionMenu />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Filter before virtualize — 10,000 options</h2>
      <CodeExample
        title="Filter the source list outside; feed the slice in as items"
        description="VirtualizedItems does not filter — that is by design. Filtering the source keeps the window small AND keeps a caller's own typeahead useful. For richer ranking + async sources, use Combobox."
        code={`const [filter, setFilter] = useState("");
const filtered = useMemo(
  () => (filter ? all.filter((o) => o.label.toLowerCase().includes(filter)) : all),
  [filter],
);

<Input
  placeholder="Type to filter…"
  value={filter}
  onChange={(e) => setFilter(e.target.value.toLowerCase())}
/>
<VirtualizedItems items={filtered} estimateSize={36} maxHeight={300}>
  {({ item }) => <div className={optionRowClass}>{item.label}</div>}
</VirtualizedItems>`}
      >
        <FilteredList />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. Sparse mode — a server-paged list</h2>
      <CodeExample
        title="totalCount + getItem + onVisibleRange"
        description="When the whole list is not in memory: totalCount rows exist, getItem answers for the ones that have arrived and undefined for the rest, and onVisibleRange says which page to fetch. Scroll fast — rows render a skeleton, then fill once their page 'loads' (simulated here with a timer)."
        code={`const loaded = useRef(new Map<number, Option>());
const [, setVersion] = useState(0);

<VirtualizedItems
  totalCount={40000}
  estimateSize={36}
  maxHeight={300}
  getItem={(i) => loaded.current.get(i)}
  onVisibleRange={(min, max) => fetchPage(min, max)}  // fill loaded, then setVersion(v => v + 1)
>
  {({ item }) =>
    item ? <Row>{item.label}</Row> : <SkeletonRow />   // undefined = not yet loaded
  }
</VirtualizedItems>`}
      >
        <SparseList />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. Why not just render all rows?</h2>
      <CodeExample
        title="The trade-off at scale"
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
        <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">See the code block for the rundown.</p>
      </CodeExample>
    </section>
  </div>
);

export default NewVirtualizedItemsDemo;

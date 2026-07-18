import { useMemo, useState } from "react";
import { Button } from "./button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./form/select/select";
import { VirtualizedItems } from "./listbox/virtualized-items";
import { CodeExample } from "./demo-helpers";

type Option = { value: string; label: string };

const makeOptions = (n: number): Option[] =>
  Array.from({ length: n }, (_, i) => ({
    value: `opt-${i}`,
    label: `Option ${i + 1}`,
  }));

const FIVE_K = makeOptions(5000);
const TEN_K = makeOptions(10000);

const NewLazyOptionsDemo: React.FC = () => {
  const [selected, setSelected] = useState("opt-42");
  const [picked, setPicked] = useState<Option | null>(null);

  // Cheap text filter — applied to the source list BEFORE virtualization.
  // Without this, all 10k items participate in keyboard typeahead.
  const [filter, setFilter] = useState("");
  const filtered = useMemo(
    () =>
      filter
        ? TEN_K.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase()))
        : TEN_K,
    [filter],
  );

  return (
    <div className="demo-page">
      <h1>Lazy-loaded options (Select + DropdownMenu)</h1>
      <p className="lede">
        Drop <code>&lt;VirtualizedItems&gt;</code> into{" "}
        <code>SelectContent</code> or <code>DropdownMenuContent</code> when
        the option list would otherwise be too large for the DOM (typically
        ≥ 1,000 entries). The helper reuses the same TanStack Virtual engine
        that powers <code>DataTable</code>.
      </p>

      <section className="demo-section">
        <h2>1. Select — 5,000 options</h2>
        <CodeExample
          title="VirtualizedItems inside SelectContent"
          description={`Renders only the visible window. Arrow / Home / End / hover work for currently-mounted items.\n\nGotcha: Radix's <SelectValue> reads the label from the SELECTED <SelectItem> when it's mounted. With virtualization the selected row may scroll out of the rendered window, so SelectValue goes blank. Workaround: render the label yourself via a lookup map.`}
          code={`const optionsById = useMemo(
  () => new Map(options.map((o) => [o.value, o.label])),
  [options],
);

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    {/* don't use <SelectValue/> — we display the label manually */}
    <span>{value ? optionsById.get(value) : "Pick an option"}</span>
  </SelectTrigger>
  <SelectContent>
    <VirtualizedItems items={options} estimateSize={36} maxHeight={300}>
      {({ item }) => (
        <SelectItem key={item.value} value={item.value}>
          {item.label}
        </SelectItem>
      )}
    </VirtualizedItems>
  </SelectContent>
</Select>`}
        >
          <LazySelect5K
            options={FIVE_K}
            value={selected}
            onValueChange={setSelected}
          />
          <span style={{ marginLeft: 12, fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            value: {selected}
          </span>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. DropdownMenu — 5,000 actions</h2>
        <CodeExample
          title="VirtualizedItems inside DropdownMenuContent"
          description="Each row is a DropdownMenuItem with its own onSelect. Useful for jump-to-record menus."
          code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Jump to record</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="min-w-56">
    <DropdownMenuLabel>Records</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <VirtualizedItems items={options} estimateSize={32} maxHeight={300}>
      {({ item }) => (
        <DropdownMenuItem key={item.value} onSelect={() => goTo(item)}>
          {item.label}
        </DropdownMenuItem>
      )}
    </VirtualizedItems>
  </DropdownMenuContent>
</DropdownMenu>`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Jump to record</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="zen-min-w-56">
                <DropdownMenuLabel>Records</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <VirtualizedItems items={FIVE_K} estimateSize={32} maxHeight={300}>
                  {({ item }) => (
                    <DropdownMenuItem
                      key={item.value}
                      onSelect={() => setPicked(item)}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  )}
                </VirtualizedItems>
              </DropdownMenuContent>
            </DropdownMenu>
            <span style={{ fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
              picked: {picked?.label ?? "(none)"}
            </span>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Filter before virtualize — 10,000 options</h2>
        <CodeExample
          title="Apply a cheap text filter outside; pass the filtered slice in"
          description="VirtualizedItems doesn't filter — that's by design. Filtering the source list keeps the visible window small AND keeps keyboard typeahead useful. For richer ranking + async sources, use Combobox."
          code={`const [filter, setFilter] = useState("");
const filtered = useMemo(
  () => filter ? all.filter((o) => o.label.includes(filter)) : all,
  [filter],
);

<Input placeholder="Type to filter…" value={filter} onChange={(e) => setFilter(e.target.value)} />
<Select>
  <SelectContent>
    <VirtualizedItems items={filtered}>...</VirtualizedItems>
  </SelectContent>
</Select>`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Type to filter…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                height: 40,
                padding: "0 12px",
                fontSize: "0.875rem",
                border: "1px solid var(--zen-color-border)",
                borderRadius: "var(--zen-radius-md)",
                background: "var(--zen-color-background)",
                color: "var(--zen-color-foreground)",
              }}
            />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={`${filtered.length.toLocaleString()} options`} />
              </SelectTrigger>
              <SelectContent>
                <VirtualizedItems items={filtered} estimateSize={36} maxHeight={300}>
                  {({ item }) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  )}
                </VirtualizedItems>
              </SelectContent>
            </Select>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Why not just render all items?</h2>
        <CodeExample
          title="Three trade-offs at scale"
          code={`Without virtualization, the popover content mounts every <SelectItem>
or <DropdownMenuItem> upfront:

  100  items   ≈ 1.5 ms  mount, fine
  1,000 items  ≈ 50 ms   noticeable jank on open
  10,000 items ≈ 500 ms+ unusable on lower-end devices

VirtualizedItems mounts ~12–20 rows regardless of dataset size.

Trade-off: Radix's keyboard typeahead can only see mounted rows. For
truly large sets with free-text search, the Combobox primitive
(filters first, then renders) is the right tool — coming next.`}
        >
          <p style={{ color: "var(--zen-color-muted-fg)", margin: 0, fontSize: "0.8125rem" }}>
            See the code block for the rundown.
          </p>
        </CodeExample>
      </section>
    </div>
  );
};

/**
 * Local wrapper for the 5,000-option Select. Builds a value→label lookup
 * map and renders the label manually in the trigger (because <SelectValue>
 * relies on a mounted <SelectItem>, which may be virtualized away).
 */
const LazySelect5K: React.FC<{
  options: Option[];
  value: string;
  onValueChange: (v: string) => void;
}> = ({ options, value, onValueChange }) => {
  const labelMap = useMemo(
    () => new Map(options.map((o) => [o.value, o.label])),
    [options],
  );
  return (
    <div style={{ width: 260 }}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <span
            style={{
              flex: 1,
              textAlign: "left",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              color: value
                ? "var(--zen-color-foreground)"
                : "var(--zen-color-muted-fg)",
            }}
          >
            {value ? labelMap.get(value) : "Pick an option"}
          </span>
        </SelectTrigger>
        <SelectContent>
          <VirtualizedItems items={options} estimateSize={36} maxHeight={300}>
            {({ item }) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            )}
          </VirtualizedItems>
        </SelectContent>
      </Select>
    </div>
  );
};

export default NewLazyOptionsDemo;

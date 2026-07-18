import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "../../lib/cn";

/**
 * VirtualizedItems — drop-in scrolling viewport that renders only the
 * visible window of a long item list. Use inside any popover-style
 * surface (SelectContent, DropdownMenuContent, PopoverContent) where the
 * full list would blow up the DOM.
 *
 *   <SelectContent>
 *     <VirtualizedItems items={hugeList} estimateSize={() => 36}>
 *       {({ item }) => <SelectItem value={item.value}>{item.label}</SelectItem>}
 *     </VirtualizedItems>
 *   </SelectContent>
 *
 * Two modes:
 *   items={[…]}                         everything is in memory
 *   totalCount={n} getItem={fn}         a server-paged list; getItem returns
 *                                       undefined for rows not yet loaded, and
 *                                       onVisibleRange says what to fetch
 *
 * Powered by @tanstack/react-virtual.
 *
 * Caveat: Radix's keyboard typeahead can only jump to items currently
 * mounted in the DOM. Within the visible window arrow / Home / End / hover
 * all work correctly; jumping to letters that haven't been scrolled into
 * view won't. For "search across 50,000 options" use <Combobox> (next
 * commit) instead — it filters first, then renders.
 *
 * For the SelectContent and DropdownMenuContent you'll typically want to
 * pass `className="max-h-none"` to disable Radix's own viewport scroll;
 * this helper owns the scroll container.
 */

interface VirtualizedItemsCommon {
  /** Estimated height of a row, in px. Defaults to 36. */
  estimateSize?: number | ((index: number) => number);
  /** Max height of the scrolling viewport in px. Defaults to 280. */
  maxHeight?: number;
  /** Number of rows to render above / below the viewport for smoother scroll. */
  overscan?: number;
  className?: string;
}

/** Every item is in memory. */
export interface VirtualizedItemsDenseProps<T> extends VirtualizedItemsCommon {
  items: T[];
  children: (args: { item: T; index: number }) => React.ReactNode;
  /** Optional key extractor; defaults to index. */
  getKey?: (item: T, index: number) => string | number;
}

/**
 * The list is longer than what is loaded: `totalCount` rows exist, `getItem`
 * answers for the ones that have arrived and `undefined` for the ones that have
 * not, and `onVisibleRange` says which are needed next.
 *
 * This is the mode a server-paged list needs, and its absence is why the pivot
 * grew a second virtualizer of its own — you cannot hand a materialized array to
 * something with 40,000 values behind an API.
 */
export interface VirtualizedItemsSparseProps<T> extends VirtualizedItemsCommon {
  totalCount: number;
  getItem: (index: number) => T | undefined;
  /** Fires when the visible window changes. Fetch here. */
  onVisibleRange?: (minIndex: number, maxIndex: number) => void;
  /** `item` is undefined where the page has not loaded — render a skeleton. */
  children: (args: { item: T | undefined; index: number }) => React.ReactNode;
}

/**
 * A discriminated union rather than one loose shape: dense callers keep
 * `item: T` exactly as before, and only sparse ones have to think about
 * `undefined`.
 */
export type VirtualizedItemsProps<T> = VirtualizedItemsDenseProps<T> | VirtualizedItemsSparseProps<T>;

const isSparse = <T,>(p: VirtualizedItemsProps<T>): p is VirtualizedItemsSparseProps<T> =>
  (p as VirtualizedItemsSparseProps<T>).totalCount !== undefined;

// Overloads, not a bare union parameter. TypeScript cannot infer T THROUGH a
// union, so a single `props: Dense<T> | Sparse<T>` signature silently made every
// existing `children={({ item }) => …}` an implicit any. Overloads let it pick a
// branch first and infer from `items` exactly as before.
export function VirtualizedItems<T>(props: VirtualizedItemsDenseProps<T>): React.ReactElement;
export function VirtualizedItems<T>(props: VirtualizedItemsSparseProps<T>): React.ReactElement;
export function VirtualizedItems<T>(props: VirtualizedItemsProps<T>): React.ReactElement {
  const { estimateSize = 36, maxHeight = 280, overscan = 6, className } = props;
  const sparse = isSparse(props);
  const count = sparse ? props.totalCount : props.items.length;

  const parentRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize:
      typeof estimateSize === "function"
        ? estimateSize
        : () => estimateSize as number,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Reported through a ref and only when it CHANGES: this fires per scroll
  // frame, and as a dependency it would re-render the list in order to tell
  // someone what the list is showing.
  const onRange = sparse ? props.onVisibleRange : undefined;
  const report = React.useRef(onRange);
  report.current = onRange;
  const last = React.useRef("");
  React.useLayoutEffect(() => {
    if (!virtualItems.length || !report.current) return;
    const min = virtualItems[0].index;
    const max = virtualItems[virtualItems.length - 1].index;
    const key = `${min}:${max}`;
    if (key === last.current) return;
    last.current = key;
    report.current(min, max);
  }, [virtualItems]);

  return (
    <div
      ref={parentRef}
      className={cn("zen-overflow-y-auto", className)}
      style={{ maxHeight }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: "relative",
          width: "100%",
        }}
      >
        {virtualItems.map((v) => {
          const item = sparse ? props.getItem(v.index) : props.items[v.index];
          return (
            <div
              key={!sparse && props.getKey && item !== undefined ? props.getKey(item, v.index) : v.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${v.start}px)`,
                height: v.size,
              }}
            >
              {/* The union is resolved here: sparse children accept undefined,
                  dense ones never see it. */}
              {sparse
                ? props.children({ item, index: v.index })
                : props.children({ item: item as T, index: v.index })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { type JSX, For, createMemo, createEffect, onCleanup } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { cn } from "../../lib/cn";

/**
 * VirtualizedItems — drop-in scrolling viewport that renders only the
 * visible window of a long item list. Use inside Popover / Dropdown /
 * Select content surfaces where the full list would blow up the DOM.
 *
 *   <VirtualizedItems items={hugeList} estimateSize={36}>
 *     {({ item }) => <div>{item.label}</div>}
 *   </VirtualizedItems>
 *
 * Two modes:
 *   items={[…]}                   everything is in memory
 *   totalCount={n} getItem={fn}   a server-paged list; getItem returns undefined
 *                                 for rows not yet loaded, and onVisibleRange
 *                                 says what to fetch
 *
 * For "search across 50,000 options" use <Combobox> instead — it filters
 * before rendering.
 *
 * Mirrors the React binding.
 */

interface VirtualizedItemsCommon {
  /** Estimated height of a row, in px. Defaults to 36. */
  estimateSize?: number | ((index: number) => number);
  /** Max height of the scrolling viewport in px. Defaults to 280. */
  maxHeight?: number;
  /** Number of rows to render above / below the viewport. */
  overscan?: number;
  class?: string;
}

/** Every item is in memory. */
export interface VirtualizedItemsDenseProps<T> extends VirtualizedItemsCommon {
  items: T[];
  children: (args: { item: T; index: number }) => JSX.Element;
  /** Optional key extractor; defaults to index. */
  getKey?: (item: T, index: number) => string | number;
}

/**
 * The list is longer than what is loaded.
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
  children: (args: { item: T | undefined; index: number }) => JSX.Element;
}

export type VirtualizedItemsProps<T> = VirtualizedItemsDenseProps<T> | VirtualizedItemsSparseProps<T>;

const isSparse = <T,>(p: VirtualizedItemsProps<T>): p is VirtualizedItemsSparseProps<T> =>
  (p as VirtualizedItemsSparseProps<T>).totalCount !== undefined;

// Overloads, not a bare union parameter. TypeScript cannot infer T THROUGH a
// union, so a single `props: Dense<T> | Sparse<T>` signature silently turned
// every existing `{({ item }) => …}` into an implicit any. Overloads let it pick
// a branch first and infer from `items` exactly as before. (The React binding
// needs the same trick for the same reason.)
export function VirtualizedItems<T>(props: VirtualizedItemsDenseProps<T>): JSX.Element;
export function VirtualizedItems<T>(props: VirtualizedItemsSparseProps<T>): JSX.Element;
export function VirtualizedItems<T>(props: VirtualizedItemsProps<T>): JSX.Element {
  let parentRef: HTMLDivElement | undefined;

  const count = () => (isSparse(props) ? props.totalCount : props.items.length);

  const virtualizer = createVirtualizer({
    get count() {
      return count();
    },
    getScrollElement: () => parentRef ?? null,
    estimateSize: (index: number) =>
      typeof props.estimateSize === "function"
        ? props.estimateSize(index)
        : ((props.estimateSize as number | undefined) ?? 36),
    overscan: props.overscan ?? 6,
  });

  // Report the visible window so pages can be fetched, and ONLY when it
  // changes: this runs on every scroll frame, and re-reporting the same range
  // would restart a consumer's debounce forever.
  let lastRange = "";
  createEffect(() => {
    const items = virtualizer.getVirtualItems();
    if (!items.length || !isSparse(props) || !props.onVisibleRange) return;
    const min = items[0].index;
    const max = items[items.length - 1].index;
    const key = `${min}:${max}`;
    if (key === lastRange) return;
    lastRange = key;
    props.onVisibleRange(min, max);
  });
  onCleanup(() => (lastRange = ""));

  return (
    <div
      ref={parentRef}
      class={cn("zen-overflow-y-auto", props.class)}
      style={{ "max-height": `${props.maxHeight ?? 280}px` }}
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative", width: "100%" }}>
        <For each={virtualizer.getVirtualItems()}>
          {(v) => {
            // An accessor, not a const: <For>'s child body runs ONCE per item,
            // so reading the item here froze it. In sparse mode that is the
            // whole feature — the row would never stop being a skeleton.
            const item = createMemo(() => (isSparse(props) ? props.getItem(v.index) : props.items[v.index]));
            return (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${v.start}px)`,
                  height: `${v.size}px`,
                }}
              >
                {isSparse(props)
                  ? props.children({ item: item(), index: v.index })
                  : props.children({ item: item() as T, index: v.index })}
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}

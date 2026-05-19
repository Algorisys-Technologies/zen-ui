import { type JSX, For } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { cn } from "../../lib/cn";

/**
 * VirtualizedItems — drop-in scrolling viewport that renders only the
 * visible window of a long item list. Use inside Popover / Dropdown /
 * Select content surfaces where the full list would blow up the DOM.
 *
 *   <VirtualizedItems items={hugeList} estimateSize={36}>
 *     {(item) => <div>{item.label}</div>}
 *   </VirtualizedItems>
 *
 * For "search across 50,000 options" use <Combobox> instead — it filters
 * before rendering.
 */

export interface VirtualizedItemsProps<T> {
  items: T[];
  /** Estimated height of a row, in px. Defaults to 36. */
  estimateSize?: number | ((index: number) => number);
  /** Max height of the scrolling viewport in px. Defaults to 280. */
  maxHeight?: number;
  /** Number of rows to render above / below the viewport. */
  overscan?: number;
  class?: string;
  children: (args: { item: T; index: number }) => JSX.Element;
  /** Optional key extractor; defaults to index. */
  getKey?: (item: T, index: number) => string | number;
}

export function VirtualizedItems<T>(props: VirtualizedItemsProps<T>) {
  let parentRef: HTMLDivElement | undefined;
  const virtualizer = createVirtualizer({
    get count() {
      return props.items.length;
    },
    getScrollElement: () => parentRef ?? null,
    estimateSize: (index: number) =>
      typeof props.estimateSize === "function"
        ? props.estimateSize(index)
        : ((props.estimateSize as number | undefined) ?? 36),
    overscan: props.overscan ?? 6,
  });

  return (
    <div
      ref={parentRef}
      class={cn("overflow-y-auto", props.class)}
      style={{ "max-height": `${props.maxHeight ?? 280}px` }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
          width: "100%",
        }}
      >
        <For each={virtualizer.getVirtualItems()}>
          {(v) => {
            const item = props.items[v.index];
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
                {props.children({ item, index: v.index })}
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}

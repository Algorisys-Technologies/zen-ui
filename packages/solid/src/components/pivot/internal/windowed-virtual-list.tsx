import { createVirtualizer } from "@tanstack/solid-virtual";
import {
  type Component,
  type JSX,
  For,
  Show,
  createEffect,
  onCleanup,
} from "solid-js";
import { Loading } from "../../loading/loading";
import {
  pivotFilterWindowValueAt,
  type PivotFilterOptionsWindow,
} from "@algorisys/zen-ui-core/virtual-window";

const DEFAULT_ROW_HEIGHT_PX = 36;
const DEFAULT_OVERSCAN_ROWS = 4;

export type WindowedVirtualListProps = {
  label: string;
  totalCount: number;
  optionsWindows: PivotFilterOptionsWindow[];
  loadingWindow: boolean;
  onVisibleRange: (minIndex: number, maxIndex: number) => void;
  rowHeight?: number;
  overscan?: number;
  class?: string;
  listClass?: string;
  ariaLabel?: string;
  renderRow: (value: string) => JSX.Element;
  isSelected?: (value: string) => boolean;
  renderSkeleton?: () => JSX.Element;
};

/** Virtualized fixed-height option list with RAF-synced visible-range reporting. */
export const WindowedVirtualList: Component<WindowedVirtualListProps> = (
  props,
) => {
  let listScrollRef: HTMLDivElement | undefined;
  let syncRaf: number | undefined;
  let lastReportedRange: { min: number; max: number } | null = null;
  const rowHeight = () => props.rowHeight ?? DEFAULT_ROW_HEIGHT_PX;
  const overscan = () => props.overscan ?? DEFAULT_OVERSCAN_ROWS;

  const rowVirtualizer = createVirtualizer({
    get count() {
      return props.totalCount;
    },
    getScrollElement: () => listScrollRef ?? null,
    estimateSize: () => rowHeight(),
    get overscan() {
      return overscan();
    },
    onChange: () => {
      scheduleSync();
    },
  });

  function syncVisibleRange() {
    const items = rowVirtualizer.getVirtualItems();
    if (items.length === 0) {
      return;
    }
    const minIndex = items[0].index;
    const maxIndex = items[items.length - 1].index;
    if (
      lastReportedRange &&
      lastReportedRange.min === minIndex &&
      lastReportedRange.max === maxIndex
    ) {
      return;
    }
    lastReportedRange = { min: minIndex, max: maxIndex };
    props.onVisibleRange(minIndex, maxIndex);
  }

  function scheduleSync() {
    if (syncRaf !== undefined) {
      cancelAnimationFrame(syncRaf);
    }
    syncRaf = requestAnimationFrame(() => {
      syncRaf = undefined;
      syncVisibleRange();
    });
  }

  // Scroll parent is available after first paint; sync once without tying
  // visible-range callbacks to optionsWindows updates (that feedback loop
  // toggled loading footers inside the scrollport and froze the page).
  createEffect(() => {
    // Read to SUBSCRIBE: a bare `props.totalCount;` is a dependency
    // registration, and reads as a typo without this. void makes the intent
    // explicit and satisfies no-unused-expressions.
    void props.totalCount;
    lastReportedRange = null;
    scheduleSync();
  });

  createEffect(() => {
    listScrollRef?.addEventListener("scroll", scheduleSync, { passive: true });
    onCleanup(() => {
      listScrollRef?.removeEventListener("scroll", scheduleSync);
      if (syncRaf !== undefined) {
        cancelAnimationFrame(syncRaf);
      }
    });
  });

  return (
    <div class="zen-flex zen-flex-col">
      <div
        ref={listScrollRef}
        role="listbox"
        aria-label={props.ariaLabel ?? `${props.label} values`}
        aria-multiselectable="true"
        class={props.listClass ?? "zen-max-h-64 zen-overflow-y-auto zen-p-1"}
        aria-busy={props.loadingWindow || undefined}
      >
        <div
          class="zen-relative zen-w-full"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          <For each={rowVirtualizer.getVirtualItems()}>
            {(virtualRow) => {
              const value = () =>
                pivotFilterWindowValueAt(
                  props.optionsWindows,
                  virtualRow.index,
                );
              return (
                <div
                  role="option"
                  aria-selected={
                    value() ? (props.isSelected?.(value()!) ?? false) : false
                  }
                  class={props.class ?? "zen-absolute zen-left-0 zen-w-full zen-px-0"}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <Show
                    when={value()}
                    fallback={
                      props.renderSkeleton?.() ?? (
                        <div
                          class="zen-flex zen-h-full zen-items-center zen-gap-2 zen-px-2"
                          aria-busy="true"
                          aria-label="Loading value"
                        >
                          <span
                            class="zen-size-4 zen-shrink-0 zen-rounded-sm zen-border zen-border-zen-border zen-bg-zen-muted/60 motion-safe:zen-animate-pulse"
                            aria-hidden="true"
                          />
                          <div
                            class="zen-h-3 zen-w-3/4 zen-rounded-sm zen-bg-zen-muted motion-safe:zen-animate-pulse"
                            aria-hidden="true"
                          />
                        </div>
                      )
                    }
                  >
                    {(rowValue) => props.renderRow(rowValue())}
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </div>
      <Show when={props.loadingWindow}>
        <div class="zen-flex zen-justify-center zen-border-t zen-border-zen-border zen-px-2 zen-py-2">
          <Loading size="sm" label="Loading more…" />
        </div>
      </Show>
    </div>
  );
};

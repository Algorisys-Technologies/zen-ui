import { type Component, type JSX, Show } from "solid-js";
import {
  pivotFilterWindowValueAt,
  type PivotFilterOptionsWindow,
} from "@algorisys/zen-ui-core/virtual-window";
import { Loading } from "../../loading/loading";
import { VirtualizedItems } from "../../listbox/virtualized-items";

/**
 * A listbox over values that are not all loaded.
 *
 * The windowing is VirtualizedItems' sparse mode now. This file used to carry
 * its own createVirtualizer, its own absolute-positioned row layer and its own
 * RAF-throttled scroll listener — all of which VirtualizedItems already had in
 * dense form. The one thing genuinely missing from the library was "the list is
 * longer than what is loaded", so that went INTO VirtualizedItems, where every
 * other listbox and DataTable's filters can reach it, rather than staying in an
 * `internal/` folder where nothing could. This file's own sibling said as much:
 * the constants exist to keep "pivot grids, filter dropdowns, and future large
 * lists" consistent — a cross-cutting intent with nowhere to cross to.
 *
 * What is left is the part that IS about pivot filters: the option row and the
 * skeleton for a row whose page has not arrived.
 *
 * Mirrors the React binding.
 */

const DEFAULT_ROW_HEIGHT_PX = 36;
const DEFAULT_OVERSCAN_ROWS = 4;

export type WindowedVirtualListProps = {
  label: string;
  totalCount: number;
  optionsWindows: PivotFilterOptionsWindow[];
  loadingWindow: boolean;
  onVisibleRange: (minIndex: number, maxIndex: number) => void;
  renderRow: (value: string) => JSX.Element;
  isSelected?: (value: string) => boolean;
  // rowHeight / overscan / class / listClass / ariaLabel / renderSkeleton are
  // gone: every one was optional, defaulted, and passed by nobody. They were
  // generalisation for a reuse an `internal/` folder forbids — and the reuse
  // that DID want them is served by VirtualizedItems, which is public.
};

export const WindowedVirtualList: Component<WindowedVirtualListProps> = (props) => (
  <div class="zen-flex zen-flex-col">
    <div role="listbox" aria-label={`${props.label} values`} aria-multiselectable="true" aria-busy={props.loadingWindow || undefined}>
      <VirtualizedItems<string>
        totalCount={props.totalCount}
        // Sparse by GLOBAL index: value 120 lives at offset 20 of the page that
        // starts at 100. undefined means "not loaded", not "no value".
        getItem={(index) => pivotFilterWindowValueAt(props.optionsWindows, index)}
        onVisibleRange={(min, max) => props.onVisibleRange(min, max)}
        estimateSize={DEFAULT_ROW_HEIGHT_PX}
        overscan={DEFAULT_OVERSCAN_ROWS}
        maxHeight={256}
        class="zen-p-1"
      >
        {({ item }) => (
          <div role="option" aria-selected={item ? (props.isSelected?.(item) ?? false) : false} class="zen-h-full zen-w-full">
            <Show
              when={item}
              fallback={
                // A skeleton, not a blank: an empty row reads as "no value"
                // rather than "not yet".
                <div class="zen-flex zen-h-full zen-items-center zen-gap-2 zen-px-2" aria-busy="true" aria-label="Loading value">
                  <span
                    class="zen-size-4 zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-muted/60 motion-safe:zen-animate-pulse"
                    aria-hidden="true"
                  />
                  <div
                    class="zen-h-3 zen-w-3/4 zen-rounded-zen-sm zen-bg-zen-muted motion-safe:zen-animate-pulse"
                    aria-hidden="true"
                  />
                </div>
              }
            >
              {(value) => props.renderRow(value())}
            </Show>
          </div>
        )}
      </VirtualizedItems>
    </div>
    <Show when={props.loadingWindow}>
      <div class="zen-flex zen-justify-center zen-border-t zen-border-zen-border zen-px-2 zen-py-2">
        <Loading size="sm" label="Loading more…" />
      </div>
    </Show>
  </div>
);

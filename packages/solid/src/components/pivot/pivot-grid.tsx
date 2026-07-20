import { createEffect, createMemo, createSignal, For, Index, onCleanup, Show, untrack } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import type { PivotLayout } from "@algorisys/zen-ui-core/pivot";
import { cn } from "../../lib/cn";

const PIVOT_ROW_CLASS = "zen-border-b zen-border-zen-border/60 zen-bg-transparent even:zen-bg-transparent hover:zen-bg-transparent";
const CORNER_HEADER_CLASS = "zen-px-2 zen-py-1 zen-text-start zen-text-sm zen-font-medium zen-text-zen-muted-fg zen-capitalize";
const ROW_LABEL_CLASS = "zen-px-2 zen-py-1 zen-text-start zen-text-xs zen-font-medium zen-normal-case zen-tracking-normal zen-text-zen-foreground zen-break-words zen-leading-tight";

const STICKY_HEAD = "zen-bg-zen-muted";
const STICKY_CORNER = "zen-sticky zen-z-30 zen-box-border zen-border-r zen-border-zen-border zen-bg-zen-muted zen-shadow-[1px_0_0_0_var(--zen-border)]";
const STICKY_ROW_LABEL = "zen-sticky zen-z-20 zen-border-r zen-border-zen-border zen-shadow-[1px_0_0_0_var(--zen-border)]";

export interface PivotGridProps {
  layout: PivotLayout;
  
  // Dimensions
  totalRows: number;
  totalCols: number;
  rowHeaderDepth: number;
  colHeaderDepth: number;

  // Data Accessors
  getCell: (row: number, col: number) => { value: unknown; isLoading?: boolean } | null;
  getRowHeader: (row: number, depth: number) => { value: string; rowSpan?: number; isVisible?: boolean; isLoading?: boolean } | null;
  getColHeader: (depth: number, col: number) => { value: string; colSpan?: number; isVisible?: boolean; isLoading?: boolean } | null;

  // Sizes
  rowHeight?: number;
  colWidth?: number;
  rowHeaderWidth?: number;

  /**
   * Names the grid for a screen reader. It was hardcoded to "Data Grid" — a
   * library component cannot know what its consumer's data is, and every pivot
   * on a page announcing the same generic name is no name at all.
   */
  label?: string;

  // Fetching
  onVisibleRangeChange?: (range: { rowStart: number; rowEnd: number; colStart: number; colEnd: number }) => void;
}

function rowStripeBg(rowIndex: number): string {
  return rowIndex % 2 === 1 ? "zen-bg-zen-muted" : "zen-bg-zen-background";
}

function colPadStyle(width: number): Record<string, string> {
  return { width: `${width}px`, "min-width": `${width}px` };
}

const SKELETON_BAR = "zen-rounded-sm zen-bg-zen-muted-fg/25 motion-safe:zen-animate-pulse";

export function PivotGrid(props: PivotGridProps) {
  const rowHeight = () => props.rowHeight || 25;
  const colWidth = () => props.colWidth || 200;
  const rowHeaderWidth = () => props.rowHeaderWidth || 160;

  // A function, not a const. As a component-body object it read props.rowHeight
  // ONCE at setup and froze: change the prop and the header keeps its old height
  // while the virtualizer's estimateSize picks up the new one, so the body and
  // the header quietly desynchronise.
  const headerCellStyle = (): Record<string, string> => ({
    height: `${rowHeight()}px`,
    "min-height": `${rowHeight()}px`,
    "max-height": `${rowHeight()}px`,
  });

  function stickyRowLeftStyle(depth: number): Record<string, string> {
    return { left: `${depth * rowHeaderWidth()}px` };
  }

  function stickyHeaderTopStyle(headerRowIndex: number): Record<string, string> {
    return { top: `${headerRowIndex * rowHeight()}px` };
  }

  let scrollRef!: HTMLDivElement;

  const rowVirtualizer = createVirtualizer({
    get count() { return props.totalRows; },
    getScrollElement: () => scrollRef,
    estimateSize: () => rowHeight(),
    overscan: 8,
  });

  const [scrollLeft, setScrollLeft] = createSignal(0);
  const [viewportWidth, setViewportWidth] = createSignal(1024);

  const onScroll = () => {
    if (scrollRef) {
      setScrollLeft(scrollRef.scrollLeft);
    }
  };

  createEffect(() => {
    if (scrollRef) {
      const observer = new ResizeObserver((entries) => {
        setViewportWidth(entries[0].contentRect.width);
      });
      observer.observe(scrollRef);
      onCleanup(() => observer.disconnect());
    }
  });

  const frozenLabelsWidthPx = () => props.rowHeaderDepth * rowHeaderWidth();

  /**
   * Memoized. It was a plain function called from ten places, once per row —
   * each call re-running the loop and allocating a fresh items array. In the
   * component whose entire job is virtualization, that is O(rows x cols) of
   * garbage per scroll frame. It is also what made the grid appear to work
   * despite the bug below: a new array identity every call forced <For> to
   * recreate every row, which re-read the data by accident.
   */
  const visibleColWindow = createMemo(() => {
    const total = props.totalCols;
    const frozen = frozenLabelsWidthPx();
    if (total <= 0) return { minIndex: 0, maxIndex: -1, items: [], paddingLeft: 0, paddingRight: 0 };
    
    const sLeft = Math.max(0, scrollLeft());
    const minIndex = Math.max(0, Math.floor((sLeft - frozen) / colWidth()) - 4);
    const maxIndex = Math.min(total - 1, Math.ceil((sLeft + viewportWidth() - frozen) / colWidth()) + 4);
    const safeMax = Math.max(minIndex, maxIndex);
    
    const items = [];
    for (let i = minIndex; i <= safeMax; i++) {
      items.push({ index: i, size: colWidth() });
    }
    
    return {
      minIndex,
      maxIndex: safeMax,
      items,
      paddingLeft: minIndex * colWidth(),
      paddingRight: Math.max(0, (total - safeMax - 1) * colWidth()),
    };
  });

  createEffect(() => {
    const vRows = rowVirtualizer.getVirtualItems();
    const cols = visibleColWindow();
    if (vRows.length === 0) return;
    // untrack: this is the DATA-FETCH hook, so consumers write signals in it.
    // Tracked, anything it reads becomes a dependency of this effect and
    // anything it writes that feeds totalRows/totalCols re-runs it — the
    // write-what-you-read loop. windowed-virtual-list.tsx already avoids exactly
    // this and says why; the grid did not.
    untrack(() =>
      props.onVisibleRangeChange?.({
        rowStart: vRows[0].index,
        rowEnd: vRows[vRows.length - 1].index,
        colStart: cols.minIndex,
        colEnd: cols.maxIndex,
      }),
    );
  });

  const paddingTop = () => {
    const items = rowVirtualizer.getVirtualItems();
    return items.length > 0 ? items[0].start : 0;
  };

  const paddingBottom = () => {
    const items = rowVirtualizer.getVirtualItems();
    if (items.length === 0) return Math.max(0, rowVirtualizer.getTotalSize());
    const last = items[items.length - 1];
    return Math.max(0, rowVirtualizer.getTotalSize() - last.end);
  };

  const tableWidthPx = () => frozenLabelsWidthPx() + props.totalCols * colWidth();
  const totalColSpan = () => props.rowHeaderDepth + Math.max(visibleColWindow().items.length, 1) + 2;

  const headerRows = () => Array.from({ length: Math.max(props.colHeaderDepth, 1) }, (_, index) => index);

  return (
    <div class="zen-flex zen-flex-col zen-gap-2 zen-w-full zen-h-full zen-min-h-0 zen-min-w-0">
      <div
        ref={scrollRef}
        class="zen-flex-1 zen-min-h-0 zen-min-w-0 zen-w-full zen-overflow-auto zen-overscroll-contain zen-rounded-none zen-border-l zen-border-t zen-border-zen-border zen-bg-zen-background"
        role="region"
        aria-label={props.label ?? "Pivot grid"}
        tabIndex={0}
        onScroll={onScroll}
      >
        {/* A native <table>, so role="table" is implicit and correct.
            It said role="grid", which is a CONTRACT: a grid owes arrow-key cell
            navigation and a roving tabindex, and there was none — one tab stop
            on the scroller and no way to move a cell at a time. Claiming grid
            semantics tells a screen-reader user to navigate a way that does not
            work, which is worse than claiming nothing. The roles below were
            removed for the same reason: every one restated what the native
            element already means, and  is what forced the
            contract. */}
        <table
          class="zen-w-max zen-min-w-full zen-shrink-0 zen-border-separate zen-border-spacing-0 zen-text-zen-foreground"
          style={{
            "border-collapse": "separate",
            width: `${tableWidthPx()}px`,
          }}
        >
          <thead class={STICKY_HEAD}>
            <For each={headerRows()}>
              {(headerRowIndex) => (
                <tr class={PIVOT_ROW_CLASS}>
                  <Show when={props.rowHeaderDepth > 0}>
                    {/* Index, not For — Array.from({length}) is a list of
                        identical undefineds and For keys by identity. */}
                    <Index each={Array.from({ length: props.rowHeaderDepth })}>
                      {(_, depth) => {
                        // An accessor: read once, this froze. Reorder the row
                        // fields without changing how many there are and the
                        // corner labels kept the old names.
                        const label = createMemo(() => props.layout.rows[depth]?.replace(/_/g, " ") || "");
                        return (
                          <th
                            role="columnheader"
                            scope="col"
                            class={cn(STICKY_CORNER, CORNER_HEADER_CLASS, "zen-align-bottom")}
                            style={{
                              // Index hands back a NUMBER, where For hands back
                              // an accessor. Calling it would throw.
                              ...stickyRowLeftStyle(depth),
                              ...stickyHeaderTopStyle(headerRowIndex),
                              ...headerCellStyle(),
                              width: `${rowHeaderWidth()}px`,
                              "min-width": `${rowHeaderWidth()}px`,
                              "max-width": `${rowHeaderWidth()}px`,
                            }}
                          >
                            <Show when={headerRowIndex === headerRows().length - 1}>
                              <span class="zen-block zen-mt-auto" title={label()}>
                                {label()}
                              </span>
                            </Show>
                          </th>
                        );
                      }}
                    </Index>
                  </Show>
                  <Show when={visibleColWindow().paddingLeft > 0}>
                    <th
                      class="zen-sticky zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0"
                      style={{
                        ...stickyHeaderTopStyle(headerRowIndex),
                        ...headerCellStyle(),
                        ...colPadStyle(visibleColWindow().paddingLeft),
                      }}
                      aria-hidden="true"
                    />
                  </Show>
                  <For each={visibleColWindow().items}>
                    {(virtualCol) => {
                      // Same trap as the data cells: read through an accessor or
                      // the header freezes at whatever the first call returned.
                      const header = createMemo(() => props.getColHeader(headerRowIndex, virtualCol.index));
                      // getColHeader may report a header as merged into its
                      // neighbour (isVisible: false), in which case this cell is
                      // not drawn — a <Show>, not an early `return null`, which
                      // runs once and can never change its mind.
                      return (
                        <Show when={header()?.isVisible !== false}>
                        <th
                          role="columnheader"
                          scope="col"
                          class="zen-sticky zen-z-10 zen-bg-zen-background zen-border-b zen-border-r zen-border-zen-border/50 zen-px-2 zen-py-1 zen-text-start zen-text-xs zen-font-medium zen-text-zen-foreground zen-truncate"
                          colSpan={header()?.colSpan || 1}
                          style={{
                            width: `${virtualCol.size * (header()?.colSpan || 1)}px`,
                            "min-width": `${virtualCol.size * (header()?.colSpan || 1)}px`,
                            "max-width": `${virtualCol.size * (header()?.colSpan || 1)}px`,
                            ...headerCellStyle(),
                            ...stickyHeaderTopStyle(headerRowIndex),
                          }}
                        >
                          <Show when={!header()?.isLoading} fallback={<div class={cn("zen-h-3 zen-w-full", SKELETON_BAR)} />}>
                            {header()?.value || ""}
                          </Show>
                        </th>
                        </Show>
                      );
                    }}
                  </For>
                  <Show when={visibleColWindow().paddingRight > 0}>
                    <th
                      class="zen-sticky zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0"
                      style={{
                        ...stickyHeaderTopStyle(headerRowIndex),
                        ...headerCellStyle(),
                        ...colPadStyle(visibleColWindow().paddingRight),
                      }}
                      aria-hidden="true"
                    />
                  </Show>
                </tr>
              )}
            </For>
          </thead>
          <tbody>
            <Show when={paddingTop() > 0}>
              <tr class="zen-border-0 hover:zen-bg-transparent">
                <td
                  
                  colSpan={Math.max(totalColSpan(), 1)}
                  class="zen-border-0 zen-p-0"
                  style={{ height: `${paddingTop()}px` }}
                  aria-hidden="true"
                />
              </tr>
            </Show>
            <For each={rowVirtualizer.getVirtualItems()}>
              {(virtualRow) => {
                const rowIndex = virtualRow.index;
                
                return (
                  <tr
                    class={PIVOT_ROW_CLASS}
                    style={{ height: `${virtualRow.size}px` }}
                    data-index={virtualRow.index}
                  >
                    {/* Row Headers */}
                    <Show when={props.rowHeaderDepth > 0}>
                      {/* Index, not For: `Array.from({length: n})` is a list of
                          identical undefineds and For keys by referential
                          identity, so every element is the same element to it. */}
                      <Index each={Array.from({ length: props.rowHeaderDepth })}>
                        {(_, depth) => {
                          // An accessor, like the data cells — this froze too.
                          const header = createMemo(() => props.getRowHeader(rowIndex, depth));
                          return (
                            <Show when={header()?.isVisible !== false}>
                              <th
                                role="rowheader"
                                // Names the row for its cells. Without it, a
                                // screen reader reads a row of bare numbers.
                                scope="row"
                                class={cn(
                                  STICKY_ROW_LABEL,
                                  ROW_LABEL_CLASS,
                                  "zen-bg-zen-background zen-align-top",
                                  rowIndex > 0 && header()?.isVisible !== false ? "zen-border-t zen-border-zen-border/50" : "zen-border-t-0"
                                )}
                                rowSpan={header()?.rowSpan || 1}
                                style={{
                                  ...stickyRowLeftStyle(depth),
                                  width: `${rowHeaderWidth()}px`,
                                  "min-width": `${rowHeaderWidth()}px`,
                                  "max-width": `${rowHeaderWidth()}px`,
                                }}
                              >
                                <Show when={!header()?.isLoading} fallback={<div class={cn("zen-h-3 zen-w-1/2", SKELETON_BAR)} />}>
                                  <span class="zen-block" title={header()?.value}>
                                    {header()?.value || ""}
                                  </span>
                                </Show>
                              </th>
                            </Show>
                          );
                        }}
                      </Index>
                    </Show>

                    {/* Left Padding for Virtual Columns */}
                    <Show when={visibleColWindow().paddingLeft > 0}>
                      <td
                        class={cn("zen-border-0 zen-p-0", rowStripeBg(rowIndex))}
                        style={colPadStyle(visibleColWindow().paddingLeft)}
                        aria-hidden="true"
                      />
                    </Show>

                    {/* Data Cells */}
                    <For each={visibleColWindow().items}>
                      {(virtualCol) => {
                        // An accessor, NOT a const. <For>'s child body runs ONCE
                        // per item, so `const cell = props.getCell(...)` captured
                        // the first answer forever: when the data arrived the
                        // grid never re-rendered and the isLoading skeleton could
                        // never flip. It only looked right because the column
                        // window reallocated on every scroll and forced <For> to
                        // rebuild the rows — so it repainted while you scrolled
                        // and never when data landed, which is the one case it
                        // exists for.
                        const cell = createMemo(() => props.getCell(rowIndex, virtualCol.index));
                        return (
                          <td
                            class={cn(
                              "zen-border-r zen-border-b zen-border-zen-border/50 zen-px-2 zen-py-1 zen-text-end zen-text-sm zen-tabular-nums zen-truncate",
                              rowStripeBg(rowIndex)
                            )}
                            style={{
                              width: `${virtualCol.size}px`,
                              "min-width": `${virtualCol.size}px`,
                              "max-width": `${virtualCol.size}px`,
                            }}
                          >
                            <Show when={!cell()?.isLoading} fallback={<div class={cn("zen-ml-auto zen-h-3 zen-w-10", SKELETON_BAR)} />}>
                              {(cell()?.value as string) ?? "-"}
                            </Show>
                          </td>
                        );
                      }}
                    </For>

                    {/* Right Padding for Virtual Columns */}
                    <Show when={visibleColWindow().paddingRight > 0}>
                      <td
                        class={cn("zen-border-0 zen-p-0", rowStripeBg(rowIndex))}
                        style={colPadStyle(visibleColWindow().paddingRight)}
                        aria-hidden="true"
                      />
                    </Show>
                  </tr>
                );
              }}
            </For>
            <Show when={paddingBottom() > 0}>
              <tr class="zen-border-0 hover:zen-bg-transparent">
                <td
                  
                  colSpan={Math.max(totalColSpan(), 1)}
                  class="zen-border-0 zen-p-0"
                  style={{ height: `${paddingBottom()}px` }}
                  aria-hidden="true"
                />
              </tr>
            </Show>
          </tbody>
        </table>
      </div>
    </div>
  );
}

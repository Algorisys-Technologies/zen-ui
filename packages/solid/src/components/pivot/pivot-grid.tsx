import { type JSX, createEffect, createMemo, createSignal, For, Index, onCleanup, Show, untrack } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import type { PivotLayout } from "@algorisys/zen-ui-core/pivot";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

const PIVOT_ROW_CLASS = "zen-border-b zen-border-zen-border/60 zen-bg-transparent even:zen-bg-transparent hover:zen-bg-transparent";
const CORNER_HEADER_CLASS = "zen-px-2 zen-py-1 zen-text-start zen-text-sm zen-font-medium zen-text-zen-muted-fg zen-capitalize";
const ROW_LABEL_CLASS = "zen-px-2 zen-py-1 zen-text-start zen-text-xs zen-font-medium zen-normal-case zen-tracking-normal zen-text-zen-foreground zen-break-words zen-leading-tight";

const STICKY_HEAD = "zen-bg-zen-muted";
const STICKY_CORNER = "zen-sticky zen-z-30 zen-box-border zen-border-e zen-border-zen-border zen-bg-zen-muted zen-shadow-[1px_0_0_0_var(--zen-border)]";
const STICKY_ROW_LABEL = "zen-sticky zen-z-20 zen-border-e zen-border-zen-border zen-shadow-[1px_0_0_0_var(--zen-border)]";

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

  /**
   * Grand totals, asked for like the cells: a totals column per value (pinned
   * to the end edge) and a totals row (pinned to the bottom). The grid sums
   * nothing itself — an average's total is not the sum of averages, and the
   * data may live on a server — so each part is an accessor. Give only the
   * parts you want: `row` draws the totals columns, `column` the totals row.
   */
  totals?: PivotTotals;

  class?: string;
  style?: JSX.CSSProperties;
  /** The grid's height (px, or any CSS length). Default: fills its parent, as before. */
  height?: number | string;
  /** Classes for every column-header cell (the corner and the totals header too), after their own. */
  headerClassName?: string;
  /** Classes for every row-label cell, after their own. */
  rowHeaderClassName?: string;
  /** Keep the column headers at the top while the grid scrolls down. Default true. */
  stickyHeader?: boolean;
  /** Keep the row labels at the start edge while the grid scrolls sideways. Default true. */
  stickyRowHeaders?: boolean;
}

export type PivotTotalCell = { value: unknown; isLoading?: boolean } | null;

export interface PivotTotals {
  /** How many totals columns — usually one per value field. Default 1. */
  columns?: number;
  /** Totals column i's header. Default "Total". */
  columnHeader?: (i: number) => string;
  /** Row `row`'s total in totals column i. */
  row?: (row: number, i: number) => PivotTotalCell;
  /** Column `col`'s total, in the totals row. */
  column?: (col: number) => PivotTotalCell;
  /** Where the totals row meets totals column i. */
  grand?: (i: number) => PivotTotalCell;
  /** The totals row's label. Default "Total". */
  label?: string;
}

function rowStripeBg(rowIndex: number): string {
  return rowIndex % 2 === 1 ? "zen-bg-zen-muted" : "zen-bg-zen-background";
}

function colPadStyle(width: number): Record<string, string> {
  return { width: `${width}px`, "min-width": `${width}px` };
}

const SKELETON_BAR = "zen-rounded-sm zen-bg-zen-muted-fg/25 motion-safe:zen-animate-pulse";

export function PivotGrid(props: PivotGridProps) {
  const loc = useLocale();
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

  // Logical, so the row labels freeze at the START edge: on the right in a
  // right-to-left page, where they used to stick on the wrong side.
  function stickyRowLeftStyle(depth: number): Record<string, string> {
    // A sticky cell with no offset scrolls like any other: that is the switch.
    if (props.stickyRowHeaders === false) return {};
    return { "inset-inline-start": `${depth * rowHeaderWidth()}px` };
  }

  const totalsCols = () => (props.totals?.row ? Math.max(1, props.totals.columns ?? 1) : 0);
  const hasTotalsRow = () => !!props.totals?.column;
  /** Totals column i, pinned to the end edge; the last one sits at the edge. */
  const totalsColStyle = (i: number): Record<string, string> => ({
    "inset-inline-end": `${(totalsCols() - 1 - i) * colWidth()}px`,
    width: `${colWidth()}px`,
    "min-width": `${colWidth()}px`,
    "max-width": `${colWidth()}px`,
  });
  const totalsIdx = () => Array.from({ length: totalsCols() }, (_, i) => i);

  function stickyHeaderTopStyle(headerRowIndex: number): Record<string, string> {
    if (props.stickyHeader === false) return {};
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
    
    // abs: a right-to-left scroller reports scrollLeft as 0 down to a negative
    // number, which Math.max(0, …) pinned at 0 — the window never moved and
    // the columns past the first screen were never drawn.
    const sLeft = Math.abs(scrollLeft());
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

  const tableWidthPx = () => frozenLabelsWidthPx() + (props.totalCols + totalsCols()) * colWidth();
  const totalColSpan = () => props.rowHeaderDepth + Math.max(visibleColWindow().items.length, 1) + 2 + totalsCols();

  const totalCellContent = (cell: PivotTotalCell) => (
    <Show when={!cell?.isLoading} fallback={<div class={cn("zen-ml-auto zen-h-3 zen-w-10", SKELETON_BAR)} />}>
      {(cell?.value as string) ?? "-"}
    </Show>
  );

  const headerRows = () => Array.from({ length: Math.max(props.colHeaderDepth, 1) }, (_, index) => index);

  return (
    <div
      class={cn("zen-flex zen-flex-col zen-gap-2 zen-w-full zen-h-full zen-min-h-0 zen-min-w-0", props.class)}
      style={{
        ...(props.height !== undefined
          ? { height: typeof props.height === "number" ? `${props.height}px` : props.height }
          : {}),
        ...(props.style ?? {}),
      }}
    >
      <div
        ref={scrollRef}
        class="zen-flex-1 zen-min-h-0 zen-min-w-0 zen-w-full zen-overflow-auto zen-overscroll-contain zen-rounded-none zen-border-l zen-border-t zen-border-zen-border zen-bg-zen-background"
        role="region"
        aria-label={props.label ?? loc.t("pivot.grid")}
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
                            class={cn(STICKY_CORNER, CORNER_HEADER_CLASS, "zen-align-bottom", props.headerClassName)}
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
                      class={cn("zen-sticky zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0", props.headerClassName)}
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
                          class={cn(
                            "zen-sticky zen-z-10 zen-bg-zen-background zen-border-b zen-border-r zen-border-zen-border/50 zen-px-2 zen-py-1 zen-text-start zen-text-xs zen-font-medium zen-text-zen-foreground zen-truncate",
                            props.headerClassName,
                          )}
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
                      class={cn("zen-sticky zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0", props.headerClassName)}
                      style={{
                        ...stickyHeaderTopStyle(headerRowIndex),
                        ...headerCellStyle(),
                        ...colPadStyle(visibleColWindow().paddingRight),
                      }}
                      aria-hidden="true"
                    />
                  </Show>
                  <Show when={headerRowIndex === 0}>
                    <For each={totalsIdx()}>
                      {(i) => (
                        <th
                          role="columnheader"
                          scope="col"
                          data-pivot-total="column"
                          rowSpan={headerRows().length}
                          class={cn(
                            "zen-sticky zen-top-0 zen-z-30 zen-border-b zen-border-s zen-border-zen-border zen-bg-zen-muted zen-px-2 zen-py-1 zen-text-end zen-align-bottom zen-text-xs zen-font-semibold zen-text-zen-foreground zen-truncate",
                            props.headerClassName,
                          )}
                          style={totalsColStyle(i)}
                        >
                          {props.totals?.columnHeader?.(i) ?? loc.t("pivot.total")}
                        </th>
                      )}
                    </For>
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
                                  rowIndex > 0 && header()?.isVisible !== false ? "zen-border-t zen-border-zen-border/50" : "zen-border-t-0",
                                  props.rowHeaderClassName,
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

                    {/* Row totals, pinned to the end edge */}
                    <For each={totalsIdx()}>
                      {(i) => {
                        const cell = createMemo(() => props.totals?.row?.(rowIndex, i) ?? null);
                        return (
                          <td
                            data-pivot-total="row"
                            class={cn(
                              "zen-sticky zen-z-20 zen-border-b zen-border-s zen-border-zen-border/50 zen-px-2 zen-py-1 zen-text-end zen-text-sm zen-font-semibold zen-tabular-nums zen-truncate",
                              rowStripeBg(rowIndex),
                            )}
                            style={totalsColStyle(i)}
                          >
                            {totalCellContent(cell())}
                          </td>
                        );
                      }}
                    </For>
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
          <Show when={hasTotalsRow()}>
            <tfoot>
              <tr data-pivot-total="totals-row">
                <Show when={props.rowHeaderDepth > 0}>
                  <th
                    scope="row"
                    colSpan={props.rowHeaderDepth}
                    class="zen-sticky zen-bottom-0 zen-z-30 zen-border-t zen-border-e zen-border-zen-border zen-bg-zen-muted zen-px-2 zen-py-1 zen-text-start zen-text-xs zen-font-semibold zen-text-zen-foreground"
                    style={{ "inset-inline-start": "0px", ...headerCellStyle() }}
                  >
                    {props.totals?.label ?? loc.t("pivot.total")}
                  </th>
                </Show>
                <Show when={visibleColWindow().paddingLeft > 0}>
                  <td
                    class="zen-sticky zen-bottom-0 zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0"
                    style={colPadStyle(visibleColWindow().paddingLeft)}
                    aria-hidden="true"
                  />
                </Show>
                <For each={visibleColWindow().items}>
                  {(virtualCol) => {
                    const cell = createMemo(() => props.totals?.column?.(virtualCol.index) ?? null);
                    return (
                      <td
                        class="zen-sticky zen-bottom-0 zen-z-10 zen-border-t zen-border-e zen-border-zen-border/50 zen-bg-zen-muted zen-px-2 zen-py-1 zen-text-end zen-text-sm zen-font-semibold zen-tabular-nums zen-truncate"
                        style={{
                          width: `${virtualCol.size}px`,
                          "min-width": `${virtualCol.size}px`,
                          "max-width": `${virtualCol.size}px`,
                          ...headerCellStyle(),
                        }}
                      >
                        {totalCellContent(cell())}
                      </td>
                    );
                  }}
                </For>
                <Show when={visibleColWindow().paddingRight > 0}>
                  <td
                    class="zen-sticky zen-bottom-0 zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0"
                    style={colPadStyle(visibleColWindow().paddingRight)}
                    aria-hidden="true"
                  />
                </Show>
                <For each={totalsIdx()}>
                  {(i) => {
                    const cell = createMemo(() => props.totals?.grand?.(i) ?? null);
                    return (
                      <td
                        data-pivot-total="grand"
                        class="zen-sticky zen-bottom-0 zen-z-30 zen-border-t zen-border-s zen-border-zen-border zen-bg-zen-muted zen-px-2 zen-py-1 zen-text-end zen-text-sm zen-font-semibold zen-tabular-nums zen-truncate"
                        style={{ ...totalsColStyle(i), ...headerCellStyle() }}
                      >
                        {totalCellContent(cell())}
                      </td>
                    );
                  }}
                </For>
              </tr>
            </tfoot>
          </Show>
        </table>
      </div>
    </div>
  );
}

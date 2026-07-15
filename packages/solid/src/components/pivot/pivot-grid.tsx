import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import type { PivotLayout } from "./pivot-layout";
import { cn } from "../../lib/cn";

const PIVOT_ROW_CLASS = "zen-border-b zen-border-zen-border/60 zen-bg-transparent even:zen-bg-transparent hover:zen-bg-transparent";
const CORNER_HEADER_CLASS = "zen-px-2 zen-py-1 zen-text-left zen-text-sm zen-font-medium zen-text-zen-muted-foreground zen-capitalize";
const ROW_LABEL_CLASS = "zen-px-2 zen-py-1 zen-text-left zen-text-xs zen-font-medium zen-normal-case zen-tracking-normal zen-text-zen-foreground zen-break-words zen-leading-tight";

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

  // Fetching
  onVisibleRangeChange?: (range: { rowStart: number; rowEnd: number; colStart: number; colEnd: number }) => void;
}

function rowStripeBg(rowIndex: number): string {
  return rowIndex % 2 === 1 ? "zen-bg-zen-muted" : "zen-bg-zen-background";
}

function colPadStyle(width: number): Record<string, string> {
  return { width: `${width}px`, "min-width": `${width}px` };
}

const SKELETON_BAR = "zen-rounded-sm zen-bg-zen-muted-foreground/25 motion-safe:zen-animate-pulse";

export function PivotGrid(props: PivotGridProps) {
  const rowHeight = () => props.rowHeight || 25;
  const colWidth = () => props.colWidth || 200;
  const rowHeaderWidth = () => props.rowHeaderWidth || 160;

  const HEADER_CELL_STYLE = {
    height: `${rowHeight()}px`,
    "min-height": `${rowHeight()}px`,
    "max-height": `${rowHeight()}px`,
  };

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

  const visibleColWindow = () => {
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
  };

  createEffect(() => {
    const vRows = rowVirtualizer.getVirtualItems();
    if (vRows.length > 0 && props.onVisibleRangeChange) {
      const cols = visibleColWindow();
      props.onVisibleRangeChange({
        rowStart: vRows[0].index,
        rowEnd: vRows[vRows.length - 1].index,
        colStart: cols.minIndex,
        colEnd: cols.maxIndex,
      });
    }
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
        aria-label="Data Grid"
        tabIndex={0}
        onScroll={onScroll}
      >
        <table
          role="grid"
          class="zen-w-max zen-min-w-full zen-shrink-0 zen-border-separate zen-border-spacing-0 zen-text-zen-foreground"
          style={{
            "border-collapse": "separate",
            width: `${tableWidthPx()}px`,
          }}
        >
          <thead role="rowgroup" class={STICKY_HEAD}>
            <For each={headerRows()}>
              {(headerRowIndex) => (
                <tr role="row" class={PIVOT_ROW_CLASS}>
                  <Show when={props.rowHeaderDepth > 0}>
                    <For each={Array.from({ length: props.rowHeaderDepth })}>
                      {(_, depth) => {
                        const label = props.layout.rows[depth()]?.replace(/_/g, ' ') || "";
                        return (
                          <th
                            role="columnheader"
                            class={cn(STICKY_CORNER, CORNER_HEADER_CLASS, "zen-align-bottom")}
                            style={{
                              ...stickyRowLeftStyle(depth()),
                              ...stickyHeaderTopStyle(headerRowIndex),
                              ...HEADER_CELL_STYLE,
                              width: `${rowHeaderWidth()}px`,
                              "min-width": `${rowHeaderWidth()}px`,
                              "max-width": `${rowHeaderWidth()}px`,
                            }}
                          >
                            <Show when={headerRowIndex === headerRows().length - 1}>
                              <span class="zen-block zen-mt-auto" title={label}>
                                {label}
                              </span>
                            </Show>
                          </th>
                        );
                      }}
                    </For>
                  </Show>
                  <Show when={visibleColWindow().paddingLeft > 0}>
                    <th
                      class="zen-sticky zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0"
                      style={{
                        ...stickyHeaderTopStyle(headerRowIndex),
                        ...HEADER_CELL_STYLE,
                        ...colPadStyle(visibleColWindow().paddingLeft),
                      }}
                      aria-hidden="true"
                    />
                  </Show>
                  <For each={visibleColWindow().items}>
                    {(virtualCol) => {
                      const header = props.getColHeader(headerRowIndex, virtualCol.index);
                      // In the original, colSpans were handled via the data model returning merged cells. 
                      // For a generalized UI, if we receive a colSpan from getColHeader, we respect it.
                      // But since we are windowing, a cell might start out of bounds. The original used PivotHeaderCell to style merged boundaries.
                      if (header && header.isVisible === false) return null;
                      
                      return (
                        <th
                          role="columnheader"
                          class="zen-sticky zen-z-10 zen-bg-zen-background zen-border-b zen-border-r zen-border-zen-border/50 zen-px-2 zen-py-1 zen-text-left zen-text-xs zen-font-medium zen-text-zen-foreground zen-truncate"
                          colSpan={header?.colSpan || 1}
                          style={{
                            width: `${virtualCol.size * (header?.colSpan || 1)}px`,
                            "min-width": `${virtualCol.size * (header?.colSpan || 1)}px`,
                            "max-width": `${virtualCol.size * (header?.colSpan || 1)}px`,
                            ...HEADER_CELL_STYLE,
                            ...stickyHeaderTopStyle(headerRowIndex),
                          }}
                        >
                          <Show when={!header?.isLoading} fallback={<div class={cn("zen-h-3 zen-w-full", SKELETON_BAR)} />}>
                            {header?.value || ""}
                          </Show>
                        </th>
                      );
                    }}
                  </For>
                  <Show when={visibleColWindow().paddingRight > 0}>
                    <th
                      class="zen-sticky zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0"
                      style={{
                        ...stickyHeaderTopStyle(headerRowIndex),
                        ...HEADER_CELL_STYLE,
                        ...colPadStyle(visibleColWindow().paddingRight),
                      }}
                      aria-hidden="true"
                    />
                  </Show>
                </tr>
              )}
            </For>
          </thead>
          <tbody role="rowgroup">
            <Show when={paddingTop() > 0}>
              <tr role="row" class="zen-border-0 hover:zen-bg-transparent">
                <td
                  role="gridcell"
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
                    role="row"
                    class={PIVOT_ROW_CLASS}
                    style={{ height: `${virtualRow.size}px` }}
                    data-index={virtualRow.index}
                  >
                    {/* Row Headers */}
                    <Show when={props.rowHeaderDepth > 0}>
                      <For each={Array.from({ length: props.rowHeaderDepth })}>
                        {(_, depth) => {
                          const header = props.getRowHeader(rowIndex, depth());
                          // Hide if it's merged into a previous cell
                          if (header && header.isVisible === false) return null;
                          
                          return (
                            <th
                              role="rowheader"
                              class={cn(
                                STICKY_ROW_LABEL,
                                ROW_LABEL_CLASS,
                                "zen-bg-zen-background zen-align-top",
                                rowIndex > 0 && (!header || header.isVisible !== false) ? "zen-border-t zen-border-zen-border/50" : "zen-border-t-0"
                              )}
                              rowSpan={header?.rowSpan || 1}
                              style={{
                                ...stickyRowLeftStyle(depth()),
                                width: `${rowHeaderWidth()}px`,
                                "min-width": `${rowHeaderWidth()}px`,
                                "max-width": `${rowHeaderWidth()}px`,
                              }}
                            >
                              <Show when={!header?.isLoading} fallback={<div class={cn("zen-h-3 zen-w-1/2", SKELETON_BAR)} />}>
                                <span class="zen-block" title={header?.value}>
                                  {header?.value || ""}
                                </span>
                              </Show>
                            </th>
                          );
                        }}
                      </For>
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
                        const cell = props.getCell(rowIndex, virtualCol.index);
                        return (
                          <td
                            role="gridcell"
                            class={cn(
                              "zen-border-r zen-border-b zen-border-zen-border/50 zen-px-2 zen-py-1 zen-text-right zen-text-sm zen-tabular-nums zen-truncate",
                              rowStripeBg(rowIndex)
                            )}
                            style={{
                              width: `${virtualCol.size}px`,
                              "min-width": `${virtualCol.size}px`,
                              "max-width": `${virtualCol.size}px`,
                            }}
                          >
                            <Show when={!cell?.isLoading} fallback={<div class={cn("zen-ml-auto zen-h-3 zen-w-10", SKELETON_BAR)} />}>
                              {(cell?.value as string) ?? "-"}
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
              <tr role="row" class="zen-border-0 hover:zen-bg-transparent">
                <td
                  role="gridcell"
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

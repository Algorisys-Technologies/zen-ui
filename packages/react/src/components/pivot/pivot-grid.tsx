import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { PivotLayout } from "@algorisys/zen-ui-core/pivot";
import { cn } from "../../lib/cn";

/**
 * PivotGrid — a table windowed in BOTH directions.
 *
 * Mirrors the Solid binding. It never sees your data: it works out which
 * coordinates are visible and asks for those, so what you return can come from
 * memory, a cache, or a request still in flight.
 *
 * Rows are virtualized by @tanstack/react-virtual; columns by hand, because a
 * pivot's columns are uniform and a second virtualizer buys nothing.
 *
 * Not role="grid". A native <table> means table semantics already, and
 * role="grid" is a CONTRACT — arrow-key cell navigation and a roving tabindex.
 * Claiming it without honouring it tells a screen-reader user to navigate a way
 * that does not work.
 */

export interface PivotGridProps {
  layout: PivotLayout;
  totalRows: number;
  totalCols: number;
  rowHeaderDepth: number;
  colHeaderDepth: number;
  getCell: (row: number, col: number) => { value: unknown; isLoading?: boolean } | null;
  getRowHeader: (row: number, depth: number) => { value: string; rowSpan?: number; isVisible?: boolean; isLoading?: boolean } | null;
  getColHeader: (depth: number, col: number) => { value: string; colSpan?: number; isVisible?: boolean; isLoading?: boolean } | null;
  rowHeight?: number;
  colWidth?: number;
  rowHeaderWidth?: number;
  /** Names the grid for a screen reader. */
  label?: string;
  onVisibleRangeChange?: (range: { rowStart: number; rowEnd: number; colStart: number; colEnd: number }) => void;
}

const SKELETON_BAR = "zen-rounded-zen-sm zen-bg-zen-muted-fg/25 motion-safe:zen-animate-pulse";
const STICKY_CORNER =
  "zen-sticky zen-z-30 zen-box-border zen-border-r zen-border-zen-border zen-bg-zen-muted zen-shadow-[1px_0_0_0_var(--zen-border)]";
const STICKY_ROW_LABEL =
  "zen-sticky zen-z-20 zen-border-r zen-border-zen-border zen-shadow-[1px_0_0_0_var(--zen-border)]";

export const PivotGrid: React.FC<PivotGridProps> = ({
  layout,
  totalRows,
  totalCols,
  rowHeaderDepth,
  colHeaderDepth,
  getCell,
  getRowHeader,
  getColHeader,
  rowHeight = 25,
  colWidth = 200,
  rowHeaderWidth = 160,
  label,
  onVisibleRangeChange,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [viewportWidth, setViewportWidth] = React.useState(0);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Measured, not declared.
    const ro = new ResizeObserver((entries) => setViewportWidth(entries[0]?.contentRect.width ?? el.clientWidth));
    ro.observe(el);
    setViewportWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 6,
  });

  const frozenWidth = rowHeaderDepth * rowHeaderWidth;

  // Memoized. As a plain function this was called once per row, ten times over,
  // reallocating its items array each time — O(rows x cols) of garbage per
  // scroll frame in the component whose entire job is virtualization.
  const cols = React.useMemo(() => {
    if (totalCols <= 0) return { minIndex: 0, maxIndex: -1, items: [] as number[], padLeft: 0, padRight: 0 };
    const left = Math.max(0, scrollLeft);
    const minIndex = Math.max(0, Math.floor((left - frozenWidth) / colWidth) - 4);
    const maxIndex = Math.min(totalCols - 1, Math.ceil((left + viewportWidth - frozenWidth) / colWidth) + 4);
    const safeMax = Math.max(minIndex, maxIndex);
    const items: number[] = [];
    for (let i = minIndex; i <= safeMax; i++) items.push(i);
    return {
      minIndex,
      maxIndex: safeMax,
      items,
      padLeft: minIndex * colWidth,
      padRight: Math.max(0, (totalCols - safeMax - 1) * colWidth),
    };
  }, [totalCols, scrollLeft, viewportWidth, frozenWidth, colWidth]);

  // The fetch hook, called from an effect and read through a ref. It is where
  // consumers write state: as a dependency, anything it writes that feeds
  // totalRows/totalCols would re-run this — the write-what-you-read loop.
  const report = React.useRef(onVisibleRangeChange);
  report.current = onVisibleRangeChange;
  const virtualRows = rowVirtualizer.getVirtualItems();
  React.useEffect(() => {
    if (!virtualRows.length) return;
    report.current?.({
      rowStart: virtualRows[0].index,
      rowEnd: virtualRows[virtualRows.length - 1].index,
      colStart: cols.minIndex,
      colEnd: cols.maxIndex,
    });
  }, [virtualRows, cols.minIndex, cols.maxIndex]);

  const headerRows = Array.from({ length: Math.max(colHeaderDepth, 1) }, (_, i) => i);
  const headerCellStyle: React.CSSProperties = {
    height: `${rowHeight}px`,
    minHeight: `${rowHeight}px`,
    maxHeight: `${rowHeight}px`,
  };
  const stickyLeft = (depth: number): React.CSSProperties => ({ left: `${depth * rowHeaderWidth}px` });
  const stickyTop = (i: number): React.CSSProperties => ({ position: "sticky", top: `${i * rowHeight}px` });
  const stripe = (row: number) => (row % 2 === 1 ? "zen-bg-zen-muted" : "zen-bg-zen-background");

  return (
    <div className="zen-flex zen-h-full zen-w-full zen-min-h-0 zen-min-w-0 zen-flex-col zen-gap-2">
      <div
        ref={scrollRef}
        className="zen-min-h-0 zen-w-full zen-min-w-0 zen-flex-1 zen-overflow-auto zen-overscroll-contain zen-border-l zen-border-t zen-border-zen-border zen-bg-zen-background"
        role="region"
        aria-label={label ?? "Pivot grid"}
        tabIndex={0}
        onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
      >
        <table
          className="zen-w-max zen-min-w-full zen-shrink-0 zen-border-separate zen-border-spacing-0 zen-text-zen-foreground"
          style={{ borderCollapse: "separate", width: `${frozenWidth + totalCols * colWidth}px` }}
        >
          <thead className="zen-bg-zen-muted">
            {headerRows.map((headerRowIndex) => (
              <tr key={headerRowIndex}>
                {rowHeaderDepth > 0
                  ? Array.from({ length: rowHeaderDepth }, (_, depth) => (
                      <th
                        key={depth}
                        // scope names the column for its cells; without it,
                        // association is left to AT guesswork.
                        scope="col"
                        className={cn(
                          STICKY_CORNER,
                          "zen-px-2 zen-py-1 zen-text-left zen-align-bottom zen-text-sm zen-font-medium zen-capitalize zen-text-zen-muted-fg",
                        )}
                        style={{
                          ...stickyLeft(depth),
                          ...stickyTop(headerRowIndex),
                          ...headerCellStyle,
                          width: `${rowHeaderWidth}px`,
                          minWidth: `${rowHeaderWidth}px`,
                          maxWidth: `${rowHeaderWidth}px`,
                        }}
                      >
                        {headerRowIndex === headerRows.length - 1 ? (
                          <span className="zen-mt-auto zen-block" title={layout.rows[depth]?.replace(/_/g, " ") || ""}>
                            {layout.rows[depth]?.replace(/_/g, " ") || ""}
                          </span>
                        ) : null}
                      </th>
                    ))
                  : null}

                {cols.padLeft > 0 ? (
                  <th
                    aria-hidden
                    className="zen-sticky zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0"
                    style={{ ...stickyTop(headerRowIndex), ...headerCellStyle, width: `${cols.padLeft}px`, minWidth: `${cols.padLeft}px` }}
                  />
                ) : null}

                {cols.items.map((colIndex) => {
                  const header = getColHeader(headerRowIndex, colIndex);
                  if (header?.isVisible === false) return null;
                  const span = header?.colSpan || 1;
                  return (
                    <th
                      key={colIndex}
                      scope="col"
                      colSpan={span}
                      className="zen-sticky zen-z-10 zen-truncate zen-border-b zen-border-r zen-border-zen-border/50 zen-bg-zen-background zen-px-2 zen-py-1 zen-text-left zen-text-xs zen-font-medium zen-text-zen-foreground"
                      style={{
                        width: `${colWidth * span}px`,
                        minWidth: `${colWidth * span}px`,
                        maxWidth: `${colWidth * span}px`,
                        ...headerCellStyle,
                        ...stickyTop(headerRowIndex),
                      }}
                    >
                      {header?.isLoading ? (
                        <div className={cn("zen-h-3 zen-w-full", SKELETON_BAR)} />
                      ) : (
                        header?.value || ""
                      )}
                    </th>
                  );
                })}

                {cols.padRight > 0 ? (
                  <th
                    aria-hidden
                    className="zen-border-0 zen-bg-zen-muted zen-p-0"
                    style={{ width: `${cols.padRight}px`, minWidth: `${cols.padRight}px` }}
                  />
                ) : null}
              </tr>
            ))}
          </thead>

          <tbody>
            {rowVirtualizer.getVirtualItems().length > 0 && rowVirtualizer.getVirtualItems()[0].start > 0 ? (
              <tr aria-hidden>
                <td style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} className="zen-border-0 zen-p-0" />
              </tr>
            ) : null}

            {rowVirtualizer.getVirtualItems().map((vRow) => {
              const rowIndex = vRow.index;
              return (
                <tr key={vRow.key} className="zen-border-b zen-border-zen-border/60">
                  {rowHeaderDepth > 0
                    ? Array.from({ length: rowHeaderDepth }, (_, depth) => {
                        const header = getRowHeader(rowIndex, depth);
                        if (header?.isVisible === false) return null;
                        return (
                          <th
                            key={depth}
                            // scope names the ROW for its cells. Without it a
                            // screen reader reads a row of bare numbers.
                            scope="row"
                            rowSpan={header?.rowSpan || 1}
                            className={cn(
                              STICKY_ROW_LABEL,
                              "zen-break-words zen-bg-zen-background zen-px-2 zen-py-1 zen-text-left zen-align-top zen-text-xs zen-font-medium zen-leading-tight zen-text-zen-foreground",
                              rowIndex > 0 ? "zen-border-t zen-border-zen-border/50" : "zen-border-t-0",
                            )}
                            style={{
                              ...stickyLeft(depth),
                              width: `${rowHeaderWidth}px`,
                              minWidth: `${rowHeaderWidth}px`,
                              maxWidth: `${rowHeaderWidth}px`,
                            }}
                          >
                            {header?.isLoading ? (
                              <div className={cn("zen-h-3 zen-w-1/2", SKELETON_BAR)} />
                            ) : (
                              <span className="zen-block" title={header?.value}>
                                {header?.value || ""}
                              </span>
                            )}
                          </th>
                        );
                      })
                    : null}

                  {cols.padLeft > 0 ? (
                    <td aria-hidden className={cn("zen-border-0 zen-p-0", stripe(rowIndex))} style={{ width: `${cols.padLeft}px` }} />
                  ) : null}

                  {cols.items.map((colIndex) => {
                    const cell = getCell(rowIndex, colIndex);
                    return (
                      <td
                        key={colIndex}
                        className={cn(
                          "zen-truncate zen-border-b zen-border-r zen-border-zen-border/50 zen-px-2 zen-py-1 zen-text-right zen-text-sm zen-tabular-nums",
                          stripe(rowIndex),
                        )}
                        style={{ width: `${colWidth}px`, minWidth: `${colWidth}px`, maxWidth: `${colWidth}px` }}
                      >
                        {cell?.isLoading ? (
                          <div className={cn("zen-ml-auto zen-h-3 zen-w-10", SKELETON_BAR)} />
                        ) : (
                          ((cell?.value as string) ?? "-")
                        )}
                      </td>
                    );
                  })}

                  {cols.padRight > 0 ? (
                    <td aria-hidden className={cn("zen-border-0 zen-p-0", stripe(rowIndex))} style={{ width: `${cols.padRight}px` }} />
                  ) : null}
                </tr>
              );
            })}

            {(() => {
              const items = rowVirtualizer.getVirtualItems();
              const rest = items.length
                ? rowVirtualizer.getTotalSize() - items[items.length - 1].end
                : rowVirtualizer.getTotalSize();
              return rest > 0 ? (
                <tr aria-hidden>
                  <td style={{ height: `${rest}px` }} className="zen-border-0 zen-p-0" />
                </tr>
              ) : null;
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};
PivotGrid.displayName = "PivotGrid";

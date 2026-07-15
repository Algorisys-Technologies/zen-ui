import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { pivotFilterWindowValueAt, type PivotFilterOptionsWindow } from "@algorisys/zen-ui-core/virtual-window";
import { cn } from "../../../lib/cn";

/**
 * A listbox over values that are not all loaded.
 *
 * VirtualizedItems (this binding's existing windowing) takes `items: T[]` — a
 * materialized array. This takes a totalCount and a set of sparse WINDOWS, and
 * resolves each row by global index, rendering a skeleton where a page has not
 * arrived. That is the difference, and it is why this is not simply the other
 * one: you cannot hand a materialized array to something that has 40,000 values
 * on a server.
 *
 * Mirrors the Solid binding.
 */

export interface WindowedVirtualListProps {
  totalCount: number;
  optionsWindows: PivotFilterOptionsWindow[];
  isSelected: (value: string) => boolean;
  onToggle: (value: string) => void;
  onVisibleRange: (minIndex: number, maxIndex: number) => void;
  formatValue?: (value: string) => string;
  label: string;
  rowHeight?: number;
  overscan?: number;
  className?: string;
}

export const WindowedVirtualList: React.FC<WindowedVirtualListProps> = ({
  totalCount,
  optionsWindows,
  isSelected,
  onToggle,
  onVisibleRange,
  formatValue,
  label,
  rowHeight = 36,
  overscan = 4,
  className,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: totalCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const items = virtualizer.getVirtualItems();

  // Report the visible range so the pages can be fetched. In a layout effect
  // and via a ref, because this fires on every scroll frame: as state it would
  // re-render the list in order to tell someone what the list is showing.
  const report = React.useRef(onVisibleRange);
  report.current = onVisibleRange;
  const lastRange = React.useRef<string>("");
  React.useLayoutEffect(() => {
    if (!items.length) return;
    const min = items[0].index;
    const max = items[items.length - 1].index;
    const key = `${min}:${max}`;
    // Only when it actually changed: the same range twice is not news, and
    // reporting it would restart the debounce forever.
    if (key === lastRange.current) return;
    lastRange.current = key;
    report.current(min, max);
  }, [items]);

  return (
    <div ref={parentRef} className={cn("zen-max-h-64 zen-overflow-y-auto zen-p-1", className)}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative", width: "100%" }}>
        <ul role="listbox" aria-label={`${label} values`} className="zen-m-0 zen-list-none zen-p-0">
          {items.map((row) => {
            const value = pivotFilterWindowValueAt(optionsWindows, row.index);
            return (
              <li
                key={row.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${row.size}px`,
                  transform: `translateY(${row.start}px)`,
                }}
              >
                {value === undefined ? (
                  // This row's page has not arrived. A skeleton, not a blank:
                  // an empty row reads as "no value" rather than "not yet".
                  <div className="zen-flex zen-h-full zen-w-full zen-items-center zen-gap-2 zen-px-2" aria-hidden>
                    <div className="zen-size-4 zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-muted/60 motion-safe:zen-animate-pulse" />
                    <div className="zen-h-3 zen-w-3/4 zen-rounded-zen-sm zen-bg-zen-muted motion-safe:zen-animate-pulse" />
                  </div>
                ) : (
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected(value)}
                    onClick={() => onToggle(value)}
                    className={cn(
                      "zen-flex zen-h-full zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-px-2 zen-text-left zen-text-sm zen-text-zen-foreground zen-transition-colors",
                      "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50",
                    )}
                  >
                    <span
                      className={cn(
                        "zen-flex zen-size-4 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border zen-border-zen-border",
                        isSelected(value) && "zen-bg-zen-primary zen-text-zen-primary-fg",
                      )}
                      aria-hidden
                    >
                      {isSelected(value) ? "✓" : ""}
                    </span>
                    <span className="zen-truncate">{formatValue ? formatValue(value) : value}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
WindowedVirtualList.displayName = "WindowedVirtualList";

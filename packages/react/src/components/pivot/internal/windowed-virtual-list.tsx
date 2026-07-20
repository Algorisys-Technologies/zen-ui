import * as React from "react";
import { pivotFilterWindowValueAt, type PivotFilterOptionsWindow } from "@algorisys/zen-ui-core/virtual-window";
import { cn } from "../../../lib/cn";
import { VirtualizedItems } from "../../listbox/virtualized-items";

/**
 * A listbox over values that are not all loaded.
 *
 * The windowing is VirtualizedItems' sparse mode — this file used to carry its
 * own createVirtualizer, its own absolute-positioned row layer and its own
 * visible-range reporting, all of which VirtualizedItems already had in dense
 * form. The only thing that was genuinely missing was "the list is longer than
 * what is loaded", so that went into VirtualizedItems where every other listbox
 * in the library can reach it, rather than staying here where nothing could.
 *
 * What is left is the part that IS about pivot filters: an option row, a
 * checkbox, and a skeleton for rows whose page has not arrived.
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
  className?: string;
  /**
   * Draw the indicator as a radio rather than a checkbox. A square box is a
   * promise you can tick more than one; when the menu takes a single value that
   * promise is a lie, and the user only finds out by trying. Mirrors Solid.
   */
  singleSelect?: boolean;
}

const ROW_HEIGHT = 36;

export const WindowedVirtualList: React.FC<WindowedVirtualListProps> = ({
  totalCount,
  optionsWindows,
  isSelected,
  onToggle,
  onVisibleRange,
  formatValue,
  label,
  className,
  singleSelect,
}) => (
  <ul role="listbox" aria-label={`${label} values`} className="zen-m-0 zen-list-none zen-p-0">
    <VirtualizedItems<string>
      totalCount={totalCount}
      // Sparse by global index: value 120 lives at offset 20 of the page that
      // starts at 100. undefined means "not loaded", not "no value".
      getItem={(index) => pivotFilterWindowValueAt(optionsWindows, index)}
      onVisibleRange={onVisibleRange}
      estimateSize={ROW_HEIGHT}
      maxHeight={256}
      overscan={4}
      className={cn("zen-p-1", className)}
    >
      {({ item }) =>
        item === undefined ? (
          // A skeleton, not a blank: an empty row reads as "no value" rather
          // than "not yet".
          <div className="zen-flex zen-h-full zen-w-full zen-items-center zen-gap-2 zen-px-2" aria-hidden>
            <div className="zen-size-4 zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-muted/60 motion-safe:zen-animate-pulse" />
            <div className="zen-h-3 zen-w-3/4 zen-rounded-zen-sm zen-bg-zen-muted motion-safe:zen-animate-pulse" />
          </div>
        ) : (
          <button
            type="button"
            role="option"
            aria-selected={isSelected(item)}
            onClick={() => onToggle(item)}
            className={cn(
              "zen-flex zen-h-full zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-px-2 zen-text-start zen-text-sm zen-text-zen-foreground zen-transition-colors",
              "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "zen-flex zen-size-4 zen-shrink-0 zen-items-center zen-justify-center zen-border zen-border-zen-border",
                singleSelect ? "zen-rounded-full" : "zen-rounded-zen-sm",
                isSelected(item) && "zen-bg-zen-primary zen-text-zen-primary-fg",
              )}
            >
              {isSelected(item) ? "✓" : ""}
            </span>
            <span className="zen-truncate">{formatValue ? formatValue(item) : item}</span>
          </button>
        )
      }
    </VirtualizedItems>
  </ul>
);
WindowedVirtualList.displayName = "WindowedVirtualList";

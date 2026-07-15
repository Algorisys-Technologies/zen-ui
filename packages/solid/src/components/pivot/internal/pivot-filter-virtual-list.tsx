import { type Component, Show } from "solid-js";
import { WindowedVirtualList } from "./windowed-virtual-list";
import type { PivotFilterSelection } from "../pivot-filter-state";
import { isPivotValueSelected } from "../pivot-filter-state";
import type { PivotFilterOptionsWindow } from "./pivot-filter-options-window";
import { Icon } from "../../icon/icon";
import { cn } from "../../../lib/cn";

export interface PivotFilterVirtualListProps {
  label: string;
  totalCount: number;
  optionsWindows: PivotFilterOptionsWindow[];
  loadingWindow: boolean;
  selection: () => PivotFilterSelection | undefined;
  formatValue: (value: string) => string;
  onToggleValue: (value: string) => void;
  onVisibleRange: (minIndex: number, maxIndex: number) => void;
  singleSelect?: boolean;
}

/** Virtualized option list; remounts with the panel so scroll state stays fresh. */
export const PivotFilterVirtualList: Component<PivotFilterVirtualListProps> = (
  props,
) => {
  return (
    <WindowedVirtualList
      label={props.label}
      totalCount={props.totalCount}
      optionsWindows={props.optionsWindows}
      loadingWindow={props.loadingWindow}
      onVisibleRange={props.onVisibleRange}
      isSelected={(value) => isPivotValueSelected(props.selection(), value)}
      renderRow={(value) => {
        const selected = () =>
          isPivotValueSelected(props.selection(), value);
        return (
          <button
            type="button"
            class="zen-flex zen-h-full zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-md zen-px-2 zen-text-left zen-text-sm zen-transition-colors hover:zen-bg-zen-secondary hover:zen-text-zen-secondary-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50"
            onClick={() => {
              props.onToggleValue(value);
            }}
          >
            <span
              class={cn(
                "zen-flex zen-size-4 zen-shrink-0 zen-items-center zen-justify-center zen-border zen-border-zen-input zen-text-zen-primary-fg",
                props.singleSelect ? "zen-rounded-full" : "zen-rounded-sm",
                selected() && "zen-border-zen-primary zen-bg-zen-primary",
              )}
              aria-hidden="true"
            >
              <Show when={selected()}>
                <Icon name="check" class={cn(props.singleSelect ? "zen-size-2.5" : "zen-size-3")} />
              </Show>
            </span>
            <span class="zen-truncate" title={props.formatValue(value)}>
              {props.formatValue(value)}
            </span>
          </button>
        );
      }}
    />
  );
};

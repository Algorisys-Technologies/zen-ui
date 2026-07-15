import { Show, createMemo, untrack } from "solid-js";
import { cn } from "../../lib/cn";
import { Badge } from "../badge/badge";
import { Icon } from "../icon/icon";
import type { PivotZone, PivotAggregation, PivotField, PivotMembersRequest, PivotMembersResult } from "./pivot-state";
import { fieldLabel, defaultAggregationForField } from "./pivot-state";
import type { PivotFilterSelection } from "./pivot-filter-state";
import { PivotFilterMenu } from "./pivot-filter-menu";

export interface PivotFieldChipProps {
  fieldKey: string;
  fields: PivotField[];
  hasActiveFilter?: boolean;
  selection?: PivotFilterSelection;
  filters?: Record<string, PivotFilterSelection>;
  loadMembers?: (request: PivotMembersRequest) => Promise<PivotMembersResult>;
  onSelectionChange?: (selection: PivotFilterSelection | null) => void;
  onRemove?: () => void;
  zone?: PivotZone;
  aggregation?: PivotAggregation;
  onAggregationChange?: (aggregation: PivotAggregation) => void;
  singleSelect?: boolean;
  disabled?: boolean;
}

export function PivotFieldChip(props: PivotFieldChipProps) {
  const label = createMemo(() => fieldLabel(props.fields, props.fieldKey));
  const selectedField = createMemo(() => props.fields.find((f) => f.key === props.fieldKey));
  const isMeasure = createMemo(() => selectedField()?.type === "measure");
  const filtered = createMemo(() => props.hasActiveFilter ?? (props.selection && (props.selection.kind === "include" ? props.selection.values.length > 0 : true)));

  return (
    <div
      class={cn(
        "zen-group zen-relative zen-flex zen-items-center zen-gap-1 zen-max-w-full",
      )}
    >
      <Badge
        variant="outline"
        class={cn(
          "zen-cursor-grab zen-select-none active:zen-cursor-grabbing zen-bg-zen-surface zen-shadow-sm zen-max-w-full zen-h-7",
          (props.zone === "rows" || props.zone === "values") && "zen-w-full",
          filtered() ? "zen-text-zen-primary zen-border-zen-primary/30" : "zen-text-zen-foreground",
          props.disabled && "zen-opacity-50 zen-cursor-not-allowed"
        )}
      >
        <Icon name="more-vertical" class="zen-h-3 zen-w-3 zen-text-zen-muted-foreground/50 zen-shrink-0" />
        <Icon name={props.zone === "values" ? "plus" : "file"} class="zen-h-3 zen-w-3 zen-text-zen-muted-foreground zen-shrink-0" />
        
        <span class={cn("zen-truncate zen-flex-1 zen-min-w-0", filtered() && "zen-italic")}>
          <span class="zen-font-medium">{label()}</span>
          <Show when={props.selection?.kind === "include" && props.selection.values.length > 0}>
            <span class="zen-font-normal">
              : {props.selection!.values.length === 1 
                  ? (isMeasure() ? Number((props.selection as any)!.values[0]).toLocaleString("en-US", { maximumFractionDigits: 2 }) : (props.selection as any)!.values[0])
                  : `${props.selection!.values.length} selected`}
            </span>
          </Show>
          <Show when={props.selection?.kind === "all" && props.selection.exclude.length > 0}>
             <span class="zen-font-normal">: All (except {props.selection!.exclude.length})</span>
          </Show>
        </span>
        
        <Show when={props.zone === "values" && isMeasure() && props.onAggregationChange && selectedField()}>
          {(resolved) => (
            <div class="zen-inline-block zen-shrink-0 zen-text-xs" onPointerDown={(e) => e.stopPropagation()}>
              <select
                value={props.aggregation ?? defaultAggregationForField(resolved())}
                onChange={(e) =>
                  props.onAggregationChange?.(e.currentTarget.value as PivotAggregation)
                }
                class="zen-h-6 zen-min-w-[3.5rem] zen-rounded-sm zen-px-1.5 zen-py-0 zen-text-xs zen-uppercase zen-bg-transparent zen-border-transparent hover:zen-bg-zen-muted focus:zen-ring-0"
                aria-label={`Aggregation for ${fieldLabel(props.fields, props.fieldKey)}`}
              >
                <option value="sum">SUM</option>
                <option value="count">COUNT</option>
                <option value="avg">AVG</option>
                <option value="min">MIN</option>
                <option value="max">MAX</option>
              </select>
            </div>
          )}
        </Show>

        <Show when={props.zone !== "values" && props.loadMembers && props.onSelectionChange}>
          <PivotFilterMenu
            columnKey={props.fieldKey}
            label={label()}
            selection={() => props.selection}
            onChange={(sel) => props.onSelectionChange?.(sel)}
            loadOptions={async (columnKey, optionSearch, pagination) => {
              const otherFilters = untrack(() => {
                if (!props.filters) return undefined;
                const { [props.fieldKey]: _omit, ...rest } = props.filters;
                return rest;
              });
              return props.loadMembers!({
                fieldKey: columnKey,
                search: optionSearch.trim() ? optionSearch.trim() : undefined,
                offset: pagination?.offset,
                limit: pagination?.limit,
                filters: otherFilters as any,
              }).then(res => ({
                values: res.values,
                hasMore: res.hasMore,
                total: res.total ?? res.values.length
              }));
            }}
            formatValue={(val) => (isMeasure() ? Number(val).toLocaleString("en-US", { maximumFractionDigits: 2 }) : val)}
            triggerClass={cn(
              "zen-flex zen-shrink-0 zen-items-center zen-justify-center zen-rounded-sm zen-p-1 zen-transition-colors",
              filtered() ? "zen-text-zen-primary hover:zen-bg-zen-muted hover:zen-text-zen-primary-fg" : "zen-text-zen-muted-foreground hover:zen-bg-zen-muted hover:zen-text-zen-foreground"
            )}
            triggerChildren={<Icon name="chevron-down" class="zen-h-3.5 zen-w-3.5" />}
            singleSelect={props.singleSelect}
          />
        </Show>
        
        <Show when={props.zone !== "values" && (!props.loadMembers || !props.onSelectionChange)}>
           <button
             type="button"
             class="zen-flex zen-shrink-0 zen-items-center zen-justify-center zen-rounded-sm zen-p-1 zen-text-zen-muted-foreground zen-transition-colors hover:zen-bg-zen-muted hover:zen-text-zen-foreground"
           >
             <Icon name="chevron-down" class="zen-h-3.5 zen-w-3.5" />
           </button>
        </Show>

        <Show when={props.zone !== "available" && props.onRemove}>
          <button
            type="button"
            class="zen-ml-1 zen-rounded-sm hover:zen-bg-zen-muted zen-p-1 zen-text-zen-muted-foreground focus:zen-outline-none"
            onClick={(e) => {
              e.stopPropagation();
              props.onRemove?.();
            }}
            title="Remove field"
          >
            <Icon name="x" class="zen-h-3.5 zen-w-3.5" />
          </button>
        </Show>
      </Badge>
    </div>
  );
}

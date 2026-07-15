import * as React from "react";
import {
  PIVOT_ZONES,
  defaultAggregationForField,
  describeFilterSelection,
  fieldLabel,
  isFilterActive,
  zoneLabel,
  type PivotAggregation,
  type PivotField,
  type PivotFilterSelection,
  type PivotFilters,
  type PivotMembersRequest,
  type PivotMembersResult,
  type PivotZone,
} from "@algorisys/zen-ui-core/pivot";
import { cn } from "../../lib/cn";
import { Badge } from "../badge/badge";
import { Icon } from "../icon/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { PivotFilterMenu } from "./pivot-filter-menu";

/**
 * PivotFieldChip — one field, in one zone.
 *
 * Mirrors the Solid binding. The chip label, the filter summary and the move
 * menu's wording all come from @algorisys/zen-ui-core/pivot, so the two cannot
 * describe the same state differently.
 */

export interface PivotFieldChipProps {
  fieldKey: string;
  fields: PivotField[];
  hasActiveFilter?: boolean;
  selection?: PivotFilterSelection;
  filters?: PivotFilters;
  loadMembers?: (request: PivotMembersRequest) => Promise<PivotMembersResult>;
  onSelectionChange?: (selection: PivotFilterSelection | null) => void;
  onRemove?: () => void;
  zone?: PivotZone;
  aggregation?: PivotAggregation;
  onAggregationChange?: (aggregation: PivotAggregation) => void;
  /**
   * Move this field to another zone. THE KEYBOARD PATH.
   *
   * dnd-kit does ship a KeyboardSensor, but it emulates a drag with arrow keys —
   * which for a four-bin builder means memorising a spatial layout you cannot
   * see. WAI-ARIA asks for an ALTERNATIVE to dragging rather than a keyboard
   * mime of it, so the ⋮ handle opens a menu of zones. The Solid binding has no
   * keyboard sensor at all, so this is also what makes the two behave alike.
   */
  onMoveToZone?: (zone: PivotZone) => void;
  singleSelect?: boolean;
  disabled?: boolean;
  /** Drag handle props from the sortable wrapper. */
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

export const PivotFieldChip: React.FC<PivotFieldChipProps> = (props) => {
  const {
    fieldKey,
    fields,
    hasActiveFilter,
    selection,
    filters,
    loadMembers,
    onSelectionChange,
    onRemove,
    zone,
    aggregation,
    onAggregationChange,
    onMoveToZone,
    singleSelect,
    disabled,
  } = props;

  const label = fieldLabel(fields, fieldKey);
  const field = fields.find((f) => f.key === fieldKey);
  const isMeasure = field?.type === "measure";
  const filtered = hasActiveFilter ?? isFilterActive(selection);
  const summary = describeFilterSelection(selection);

  return (
    <div className="zen-group zen-relative zen-flex zen-max-w-full zen-items-center zen-gap-1">
      <Badge
        variant="outline"
        className={cn(
          "zen-h-7 zen-max-w-full zen-cursor-grab zen-select-none zen-bg-zen-background zen-shadow-sm active:zen-cursor-grabbing",
          (zone === "rows" || zone === "values") && "zen-w-full",
          filtered ? "zen-border-zen-primary/30 zen-text-zen-primary" : "zen-text-zen-foreground",
          disabled && "zen-cursor-not-allowed zen-opacity-50",
        )}
      >
        {/* The ⋮ handle: a decorative icon in the original, the keyboard path
            here. Everything dragging can do, reachable from a menu. */}
        {onMoveToZone ? (
          // The pointer guard is on this wrapper, never on the trigger: passing
          // onPointerDown to the trigger would replace its own handler and the
          // menu would never open.
          <span className="zen-flex zen-shrink-0" onPointerDown={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Move ${label}`}
                  disabled={disabled}
                  className="zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-0 zen-text-zen-muted-fg hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
                >
                  <Icon name="more-vertical" className="zen-h-3 zen-w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Move {label} to</DropdownMenuLabel>
                {PIVOT_ZONES.filter((z) => z !== "available" && z !== zone).map((z) => (
                  <DropdownMenuItem key={z} onSelect={() => onMoveToZone(z)}>
                    {zoneLabel(z)}
                  </DropdownMenuItem>
                ))}
                {zone !== "available" ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => onMoveToZone("available")}>
                      Remove from layout
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        ) : (
          <Icon name="more-vertical" className="zen-h-3 zen-w-3 zen-shrink-0 zen-text-zen-muted-fg/50" />
        )}

        <Icon
          name={zone === "values" ? "plus" : "file"}
          className="zen-h-3 zen-w-3 zen-shrink-0 zen-text-zen-muted-fg"
        />

        <span className={cn("zen-min-w-0 zen-flex-1 zen-truncate", filtered && "zen-italic")}>
          <span className="zen-font-medium">{label}</span>
          {summary ? <span className="zen-font-normal">: {summary}</span> : null}
        </span>

        {zone === "values" && isMeasure && onAggregationChange && field ? (
          <span className="zen-inline-block zen-shrink-0 zen-text-xs" onPointerDown={(e) => e.stopPropagation()}>
            <label className="zen-sr-only" htmlFor={`agg-${fieldKey}`}>
              Aggregation for {label}
            </label>
            <select
              id={`agg-${fieldKey}`}
              value={aggregation ?? defaultAggregationForField(field)}
              onChange={(e) => onAggregationChange(e.target.value as PivotAggregation)}
              className="zen-h-6 zen-min-w-14 zen-cursor-pointer zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-1.5 zen-text-xs zen-text-zen-foreground"
            >
              {(["sum", "count", "avg", "min", "max"] as const).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </span>
        ) : null}

        {zone !== "values" && loadMembers && onSelectionChange ? (
          <PivotFilterMenu
            columnKey={fieldKey}
            label={label}
            selection={selection}
            onChange={onSelectionChange}
            loadOptions={async (columnKey, optionSearch, pagination) => {
              // Every filter EXCEPT this field's own: a column's options are
              // narrowed by the other columns, never by itself, or picking a
              // value would hide every other value you might pick instead.
              const otherFilters: PivotFilters = {};
              for (const [key, sel] of Object.entries(filters ?? {})) {
                if (key !== fieldKey) otherFilters[key] = sel;
              }
              const res = await loadMembers({
                fieldKey: columnKey,
                search: optionSearch.trim() ? optionSearch.trim() : undefined,
                offset: pagination?.offset,
                limit: pagination?.limit,
                filters: otherFilters,
              });
              return { values: res.values, hasMore: res.hasMore, total: res.total ?? res.values.length };
            }}
            formatValue={(v) => (isMeasure ? Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 }) : v)}
            singleSelect={singleSelect}
          />
        ) : null}

        {zone !== "available" && onRemove ? (
          <button
            type="button"
            className="zen-ml-1 zen-cursor-pointer zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-1 zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
            aria-label={`Remove ${label} from ${zoneLabel(zone ?? "available")}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Icon name="x" className="zen-h-3.5 zen-w-3.5" />
          </button>
        ) : null}
      </Badge>
    </div>
  );
};
PivotFieldChip.displayName = "PivotFieldChip";

import { For, Show, createMemo, untrack } from "solid-js";
import { cn } from "../../lib/cn";
import { Badge } from "../badge/badge";
import { Icon } from "../icon/icon";
import {
  PIVOT_ZONES,
  defaultAggregationForField,
  fieldLabel,
  zoneLabel,
  type PivotAggregation,
  type PivotField,
  type PivotFilterSelection,
  type PivotFilters,
  type PivotMembersRequest,
  type PivotMembersResult,
  type PivotZone,
} from "@algorisys/zen-ui-core/pivot";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { PivotFilterMenu } from "./pivot-filter-menu";

export interface PivotFieldChipProps {
  fieldKey: string;
  fields: PivotField[];
  hasActiveFilter?: boolean;
  selection?: PivotFilterSelection;
  /** Typed now — this was `Record<string, PivotFilterSelection>` restated by hand. */
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
   * Dragging is a pointer gesture with no keyboard equivalent — solid-dnd ships
   * pointer sensors only — so without this a keyboard user could remove a field
   * and never add or move one, which is most of the component. WAI-ARIA's advice
   * for drag and drop is to provide an alternative rather than to emulate
   * dragging with arrow keys, so the ⋮ handle opens a menu. It is also faster
   * than dragging for everyone.
   */
  onMoveToZone?: (zone: PivotZone) => void;
  singleSelect?: boolean;
  disabled?: boolean;
}

export function PivotFieldChip(props: PivotFieldChipProps) {
  const label = createMemo(() => fieldLabel(props.fields, props.fieldKey));
  const selectedField = createMemo(() => props.fields.find((f) => f.key === props.fieldKey));
  const isMeasure = createMemo(() => selectedField()?.type === "measure");
  const filtered = createMemo(() => props.hasActiveFilter ?? (props.selection && (props.selection.kind === "include" ? props.selection.values.length > 0 : true)));

  // Narrowed accessors, because `<Show when={x.kind === "include"}>` narrows the
  // CONDITION and not the children — they are a separate scope, so `values` was
  // being read off a union that may be the "all" variant. Half the reads were
  // patched with `as any` and half were left to fail the build; both hid the
  // same thing. Handing Show the narrowed value gives the children a typed
  // accessor and needs no casts.
  const included = createMemo(() =>
    props.selection?.kind === "include" && props.selection.values.length > 0 ? props.selection : undefined,
  );
  const excluded = createMemo(() =>
    props.selection?.kind === "all" && props.selection.exclude.length > 0 ? props.selection : undefined,
  );

  return (
    <div
      class={cn(
        "zen-group zen-relative zen-flex zen-items-center zen-gap-1 zen-max-w-full",
      )}
    >
      <Badge
        variant="outline"
        class={cn(
          "zen-cursor-grab zen-select-none active:zen-cursor-grabbing zen-bg-zen-background zen-shadow-sm zen-max-w-full zen-h-7",
          (props.zone === "rows" || props.zone === "values") && "zen-w-full",
          filtered() ? "zen-text-zen-primary zen-border-zen-primary/30" : "zen-text-zen-foreground",
          props.disabled && "zen-opacity-50 zen-cursor-not-allowed"
        )}
      >
        {/* This handle used to be a decorative icon. It is the keyboard path now:
            everything dragging can do, reachable from a menu. */}
        <Show
          when={props.onMoveToZone}
          fallback={<Icon name="more-vertical" class="zen-h-3 zen-w-3 zen-text-zen-muted-fg/50 zen-shrink-0" />}
        >
          {/* The stopPropagation lives on this wrapper, NOT on the trigger.
              Kobalte's Trigger opens on pointerdown via its own handler, and
              passing onPointerDown to the component replaces that handler rather
              than composing with it — so guarding the drag there silently
              stopped the menu from ever opening. The wrapper stops the event
              reaching the chip's drag activators without touching the trigger. */}
          <div class="zen-flex zen-shrink-0" onPointerDown={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              class="zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-0 zen-text-zen-muted-fg hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
              aria-label={`Move ${label()}`}
              disabled={props.disabled}
            >
              <Icon name="more-vertical" class="zen-h-3 zen-w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* The Label must live inside a Group: Kobalte's label reads its
                  group's context and throws without one. It threw here, the
                  demo's ErrorBoundary swallowed it, and the whole workbench
                  unmounted on first click — no console error, because the
                  boundary caught it. */}
              <DropdownMenuGroup>
                <DropdownMenuLabel>Move {label()} to</DropdownMenuLabel>
                <For each={PIVOT_ZONES.filter((z) => z !== "available" && z !== props.zone)}>
                  {(z) => (
                    <DropdownMenuItem onSelect={() => props.onMoveToZone?.(z)}>{zoneLabel(z)}</DropdownMenuItem>
                  )}
                </For>
              </DropdownMenuGroup>
              <Show when={props.zone !== "available"}>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => props.onMoveToZone?.("available")}>
                  Remove from layout
                </DropdownMenuItem>
              </Show>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </Show>
        <Icon name={props.zone === "values" ? "plus" : "file"} class="zen-h-3 zen-w-3 zen-text-zen-muted-fg zen-shrink-0" />
        
        <span class={cn("zen-truncate zen-flex-1 zen-min-w-0", filtered() && "zen-italic")}>
          <span class="zen-font-medium">{label()}</span>
          <Show when={included()}>
            {(sel) => (
              <span class="zen-font-normal">
                : {sel().values.length === 1
                    ? isMeasure()
                      ? Number(sel().values[0]).toLocaleString("en-US", { maximumFractionDigits: 2 })
                      : sel().values[0]
                    : `${sel().values.length} selected`}
              </span>
            )}
          </Show>
          <Show when={excluded()}>
            {(sel) => <span class="zen-font-normal">: All (except {sel().exclude.length})</span>}
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
                class="zen-h-6 zen-min-w-14 zen-rounded-sm zen-px-1.5 zen-py-0 zen-text-xs zen-uppercase zen-bg-transparent zen-border-transparent hover:zen-bg-zen-muted focus:zen-ring-0"
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
            // A callback prop the menu invokes on demand, not a tracked scope —
            // the rule cannot tell the difference. The one reactive read inside
            // is already wrapped in untrack() for exactly this reason.
            // eslint-disable-next-line solid/reactivity
            loadOptions={async (columnKey, optionSearch, pagination) => {
              // Every filter EXCEPT this field's own: a column's option list is
              // narrowed by the other columns, never by itself, or picking a
              // value would hide every other value you might pick instead.
              // untracked, because this runs inside an async fetch — reading
              // props there would register dependencies on nothing.
              const otherFilters = untrack(() => {
                if (!props.filters) return undefined;
                const rest: PivotFilters = {};
                for (const [key, sel] of Object.entries(props.filters)) {
                  if (key !== props.fieldKey) rest[key] = sel;
                }
                return rest;
              });
              return props.loadMembers!({
                fieldKey: columnKey,
                search: optionSearch.trim() ? optionSearch.trim() : undefined,
                offset: pagination?.offset,
                limit: pagination?.limit,
                filters: otherFilters,
              }).then(res => ({
                values: res.values,
                hasMore: res.hasMore,
                total: res.total ?? res.values.length
              }));
            }}
            formatValue={(val) => (isMeasure() ? Number(val).toLocaleString("en-US", { maximumFractionDigits: 2 }) : val)}
            triggerClass={cn(
              "zen-flex zen-shrink-0 zen-items-center zen-justify-center zen-rounded-sm zen-p-1 zen-transition-colors",
              filtered() ? "zen-text-zen-primary hover:zen-bg-zen-muted hover:zen-text-zen-primary-fg" : "zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground"
            )}
            triggerChildren={<Icon name="chevron-down" class="zen-h-3.5 zen-w-3.5" />}
            singleSelect={props.singleSelect}
          />
        </Show>
        
        <Show when={props.zone !== "available" && props.onRemove}>
          <button
            type="button"
            class="zen-ml-1 zen-rounded-sm hover:zen-bg-zen-muted zen-p-1 zen-text-zen-muted-fg focus:zen-outline-none"
            onClick={(e) => {
              e.stopPropagation();
              props.onRemove?.();
            }}
            aria-label={`Remove ${label()} from ${zoneLabel(props.zone ?? "available")}`}
            title="Remove field"
          >
            <Icon name="x" class="zen-h-3.5 zen-w-3.5" />
          </button>
        </Show>
      </Badge>
    </div>
  );
}

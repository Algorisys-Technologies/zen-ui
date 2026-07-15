import { createSignal, For, Show } from "solid-js";
import {
  DragDropProvider,
  DragDropSensors,
  SortableProvider,
  closestCenter,
  mostIntersecting,
  createSortable,
} from "@thisbeyond/solid-dnd";
import type { DragEvent } from "@thisbeyond/solid-dnd";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Alert, AlertIcon, AlertContent, AlertTitle, AlertDescription } from "../alert/alert";
import { Icon } from "../icon/icon";
import { PivotDropZone } from "./pivot-drop-zone";
import { PivotFieldChip } from "./pivot-field-chip";
import {
  createEmptyLayout,
  addFieldToZone,
  updateValueAggregation,
  removeFieldFromLayout,
} from "./pivot-layout";
import type {
  PivotLayout,
  ZoneType,
  AggregationType,
} from "./pivot-layout";
import type { PivotField, PivotMembersRequest, PivotMembersResult } from "./pivot-state";
import type { PivotFilterSelection } from "./pivot-filter-state";
export type { PivotField, PivotMembersRequest, PivotMembersResult, PivotFilterSelection };

export interface PivotWorkbenchProps {
  fields: PivotField[];
  initialLayout?: PivotLayout;
  onLayoutApply?: (layout: PivotLayout) => void;
  
  // Custom collision detector or other advanced settings
  class?: string;
  
  // Children to render the grid (passing the applied layout)
  children?: any;
  
  // Stats and toolbar
  totalRows?: number;
  totalCols?: number;
  onClearFilters?: () => void;
  
  // Controls visibility of the drag-and-drop builder
  showBuilder?: boolean;

  // Backend callbacks for filter loading
  loadMembers?: (request: PivotMembersRequest) => Promise<PivotMembersResult>;
}

// Custom collision detector that prefers closestCenter for sorting chips,
// but falls back to mostIntersecting for empty zones.
const pivotCollisionDetector = (draggable: unknown, droppables: any[], context: unknown) => {
  // First try to find a sortable chip we are hovering over
  const sortableDroppables = droppables.filter((d) => d.data?.sortable);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const closest = closestCenter(draggable as any, sortableDroppables, context as any);
  
  if (closest) {
    return closest;
  }
  
  // If not hovering over a specific chip, find the zone we are in
  const zoneDroppables = droppables.filter((d) => !d.data?.sortable);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mostIntersecting(draggable as any, zoneDroppables, context as any);
};

const SortableChip = (props: any) => {
  const sortable = createSortable(props.fieldKey, { zone: props.zone });
  return (
    <div
      ref={sortable.ref}
      {...sortable.dragActivators}
      class={cn(
        "zen-max-w-full zen-touch-none",
        (props.zone === "rows" || props.zone === "values") ? "zen-flex zen-w-full" : "zen-inline-flex",
        sortable.isActiveDraggable && "zen-opacity-50 zen-z-50 zen-relative"
      )}
      style={{
        transform: sortable.transform
          ? `translate3d(${sortable.transform.x}px, ${sortable.transform.y}px, 0)`
          : undefined,
      }}
    >
      <PivotFieldChip {...props} />
    </div>
  );
};

export function PivotWorkbench(props: PivotWorkbenchProps) {
  const [draftLayout, setDraftLayout] = createSignal<PivotLayout>(
    props.initialLayout || createEmptyLayout()
  );
  
  // appliedLayout could be passed to the children if using a render prop,
  // but for this demo, we assume the parent reads it from onLayoutApply.
  const [appliedLayout, setAppliedLayout] = createSignal<PivotLayout>(
    props.initialLayout || createEmptyLayout()
  );

  const availableFields = () => {
    const layout = draftLayout();
    const usedIds = new Set([
      ...layout.rows,
      ...layout.columns,
      ...layout.values.map(v => v.id)
    ]);
    return props.fields.filter((f) => !usedIds.has(f.key));
  };

  const getFieldDef = (id: string) => props.fields.find(f => f.key === id);
  
  const hasAnyFilters = () => {
    const layout = draftLayout();
    if (!layout.filters) return false;
    return Object.keys(layout.filters).length > 0;
  };

  const onDragEnd = (event: DragEvent) => {
    const { draggable, droppable } = event;
    if (!droppable) return;

    const fieldId = draggable.id as string;
    const toZone = (droppable.id as string).split("-")[0] as ZoneType; // support zone or zone-chip

    // Determine if it's a reorder within same zone or moving between zones
    const sourceZone = props.fields.find(f => f.key === fieldId) ? 
      (draftLayout().rows.includes(fieldId) ? "rows" :
       draftLayout().columns.includes(fieldId) ? "columns" :
       draftLayout().values.some(v => v.id === fieldId) ? "values" : "available") : "available";

    if (sourceZone === toZone && droppable.data?.sortable) {
      // Reordering within the same zone
      setDraftLayout(prev => addFieldToZone(removeFieldFromLayout(prev, fieldId), fieldId, toZone));
    } else {
      // Moving to a new zone
      if (toZone === "available") {
         setDraftLayout(prev => removeFieldFromLayout(prev, fieldId));
      } else {
         setDraftLayout(prev => addFieldToZone(prev, fieldId, toZone));
      }
    }
  };

  const applyLayout = () => {
    const newLayout = { ...draftLayout() };
    setAppliedLayout(newLayout);
    props.onLayoutApply?.(newLayout);
  };

  const handleAggregationChange = (fieldId: string, agg: AggregationType) => {
    setDraftLayout(prev => updateValueAggregation(prev, fieldId, agg));
  };

  const handleRemoveField = (fieldId: string) => {
    setDraftLayout(prev => removeFieldFromLayout(prev, fieldId));
  };

  const handleSelectionChange = (fieldId: string, selection: PivotFilterSelection | null) => {
    setDraftLayout(prev => {
      const filters = { ...prev.filters };
      if (selection) {
        filters[fieldId] = selection;
      } else {
        delete filters[fieldId];
      }
      return { ...prev, filters };
    });
  };

  return (
    <div class={cn("zen-flex zen-flex-col zen-h-full zen-w-full zen-min-h-0 zen-min-w-0 zen-border zen-border-zen-border zen-rounded-md zen-overflow-hidden", props.class)}>
      <Show 
        when={props.showBuilder !== false}
        fallback={
          <div class="zen-flex-1 zen-min-h-0 zen-min-w-0 zen-relative zen-bg-zen-background">
            <Show when={props.children}>
              {props.children}
            </Show>
          </div>
        }
      >
        <div class="zen-flex zen-flex-col zen-w-full zen-h-full zen-min-h-0 zen-min-w-0 zen-border zen-border-zen-border zen-rounded-md zen-overflow-hidden zen-bg-zen-background">
          <DragDropProvider onDragEnd={onDragEnd} collisionDetector={pivotCollisionDetector}>
            <DragDropSensors>
              <div class="zen-flex zen-flex-col zen-flex-1 zen-w-full zen-h-full zen-min-h-0 zen-min-w-0 zen-text-zen-foreground zen-font-sans">
                {/* Header Section */}
                <div class="zen-border-b zen-border-zen-border zen-bg-zen-muted/30 zen-p-3">
                  <div class="zen-mb-3 zen-flex zen-items-center zen-justify-between">
                    <div class="zen-text-sm zen-font-semibold zen-text-zen-foreground zen-select-none">
                      Available Fields
                    </div>
                    <div class="zen-flex zen-items-center zen-gap-4">
                      <Show when={props.totalRows !== undefined || props.totalCols !== undefined}>
                        <div class="zen-text-xs zen-text-zen-muted-foreground zen-leading-relaxed">
                          <div class="zen-flex zen-items-center zen-gap-1.5">
                            <Show when={props.totalRows !== undefined}>
                              <span>
                                <span class="zen-font-medium zen-text-zen-foreground">{props.totalRows?.toLocaleString("en-IN")}</span> rows
                              </span>
                            </Show>
                            <Show when={props.totalRows !== undefined && props.totalCols !== undefined}>
                              <span>&middot;</span>
                            </Show>
                            <Show when={props.totalCols !== undefined}>
                              <span>
                                <span class="zen-font-medium zen-text-zen-foreground">{props.totalCols?.toLocaleString("en-IN")}</span> cols
                              </span>
                            </Show>
                          </div>
                        </div>
                      </Show>
                      <Show when={hasAnyFilters()}>
                        <button
                          type="button"
                          class="zen-text-sm zen-text-zen-muted-foreground hover:zen-text-zen-foreground zen-transition-colors zen-p-1 -zen-m-1"
                          onClick={() => {
                            if (props.onClearFilters) {
                              props.onClearFilters();
                            } else {
                              setDraftLayout(prev => ({ ...prev, filters: {} }));
                            }
                          }}
                        >
                          Clear filters
                        </button>
                      </Show>
                      <Button onClick={applyLayout} variant="solid" size="sm">
                        View Data
                      </Button>
                    </div>
                  </div>
                  <PivotDropZone id="available" title="Available Fields" hideTitle horizontal class="zen-border-0 zen-bg-transparent zen-p-0" isEmpty={availableFields().length === 0}>
                    <SortableProvider ids={availableFields().map(f => f.key)}>
                      <For each={availableFields()}>
                        {(field) => (
                          <SortableChip
                            fieldKey={field.key}
                            fields={props.fields}
                            zone="available"
                            onRemove={() => handleRemoveField(field.key)}
                            selection={draftLayout().filters?.[field.key]}
                            filters={draftLayout().filters}
                            loadMembers={props.loadMembers}
                            onSelectionChange={(sel: any) => handleSelectionChange(field.key, sel)}
                            singleSelect={true}
                          />
                        )}
                      </For>
                    </SortableProvider>
                  </PivotDropZone>
                </div>

                {/* Main Content Area */}
                <div class="zen-flex zen-flex-col lg:zen-flex-row zen-flex-1 zen-min-h-0 zen-min-w-0">
                  
                  {/* Sidebar */}
                  <div class="zen-flex zen-flex-col zen-w-full lg:zen-w-64 zen-shrink-0 zen-border-b lg:zen-border-b-0 lg:zen-border-r zen-border-zen-border">
                    <PivotDropZone id="values" title="Values" class="zen-min-h-24 lg:zen-min-h-16" isEmpty={draftLayout().values.length === 0}>
                      <SortableProvider ids={draftLayout().values.map(v => v.id)}>
                        <For each={draftLayout().values}>
                          {(val) => (
                            <SortableChip
                              fieldKey={val.id}
                              fields={props.fields}
                              zone="values"
                              aggregation={val.aggregation}
                              onAggregationChange={(agg: any) => handleAggregationChange(val.id, agg)}
                              onRemove={() => handleRemoveField(val.id)}
                              selection={draftLayout().filters?.[val.id]}
                              filters={draftLayout().filters}
                              loadMembers={props.loadMembers}
                              onSelectionChange={(sel: any) => handleSelectionChange(val.id, sel)}
                            />
                          )}
                        </For>
                      </SortableProvider>
                    </PivotDropZone>
                    <PivotDropZone id="rows" title="Rows" class="zen-flex-1 zen-min-h-24 lg:zen-min-h-16 zen-border-t zen-border-zen-border" isEmpty={draftLayout().rows.length === 0}>
                      <SortableProvider ids={draftLayout().rows}>
                        <For each={draftLayout().rows}>
                          {(fieldId) => {
                            return (
                              <SortableChip
                                fieldKey={fieldId}
                                fields={props.fields}
                                zone="rows"
                                onRemove={() => handleRemoveField(fieldId)}
                                selection={draftLayout().filters?.[fieldId]}
                                filters={draftLayout().filters}
                                loadMembers={props.loadMembers}
                                onSelectionChange={(sel: any) => handleSelectionChange(fieldId, sel)}
                              />
                            );
                          }}
                        </For>
                      </SortableProvider>
                    </PivotDropZone>
                  </div>

                  {/* Grid Area */}
                  <div class="zen-flex zen-flex-col zen-flex-1 zen-min-w-0 zen-min-h-0">
                    <PivotDropZone id="columns" title="Columns" horizontal class="zen-bg-zen-muted/10 zen-border-b zen-border-zen-border zen-shrink-0 zen-min-h-16" isEmpty={draftLayout().columns.length === 0}>
                      <SortableProvider ids={draftLayout().columns}>
                        <For each={draftLayout().columns}>
                          {(fieldId) => {
                            return (
                              <SortableChip
                                fieldKey={fieldId}
                                fields={props.fields}
                                zone="columns"
                                onRemove={() => handleRemoveField(fieldId)}
                                selection={draftLayout().filters?.[fieldId]}
                                filters={draftLayout().filters}
                                loadMembers={props.loadMembers}
                                onSelectionChange={(sel: any) => handleSelectionChange(fieldId, sel)}
                              />
                            );
                          }}
                        </For>
                      </SortableProvider>
                    </PivotDropZone>
                    <div class="zen-flex-1 zen-relative zen-bg-zen-background lg:zen-h-[500px] zen-h-[350px] zen-min-h-0 zen-min-w-0">
                      <Show when={appliedLayout().values.length === 0 || (appliedLayout().rows.length === 0 && appliedLayout().columns.length === 0)}>
                        <div class="zen-p-4 zen-flex zen-flex-col zen-gap-2">
                          <Show when={appliedLayout().values.length === 0}>
                            <Alert color="warning" variant="soft">
                               <AlertIcon><Icon name="info" /></AlertIcon>
                               <AlertContent>
                                 <AlertTitle>Value field required</AlertTitle>
                                 <AlertDescription>Please drop at least one field into the Values section to calculate data.</AlertDescription>
                               </AlertContent>
                            </Alert>
                          </Show>
                          <Show when={appliedLayout().rows.length === 0 && appliedLayout().columns.length === 0}>
                            <Alert color="warning" variant="soft">
                               <AlertIcon><Icon name="info" /></AlertIcon>
                               <AlertContent>
                                 <AlertTitle>Dimension required</AlertTitle>
                                 <AlertDescription>Please drop at least one field into the Rows or Columns section.</AlertDescription>
                               </AlertContent>
                            </Alert>
                          </Show>
                        </div>
                      </Show>
                      
                      <Show when={appliedLayout().values.length > 0 && (appliedLayout().rows.length > 0 || appliedLayout().columns.length > 0)}>
                        <div class="zen-absolute zen-inset-0">
                          <Show when={props.children}>
                            {props.children}
                          </Show>
                        </div>
                      </Show>
                    </div>
                  </div>
                </div>
              </div>
            </DragDropSensors>
          </DragDropProvider>
        </div>
      </Show>
    </div>
  );
}

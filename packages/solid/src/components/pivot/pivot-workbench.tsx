import { type JSX, createEffect, createSignal, For, Show, onCleanup, untrack } from "solid-js";
import {
  DragDropProvider,
  DragDropSensors,
  SortableProvider,
  createSortable,
  mostIntersecting,
  useDragDropContext,
} from "@thisbeyond/solid-dnd";
import type { CollisionDetector, DragEvent } from "@thisbeyond/solid-dnd";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Alert, AlertIcon, AlertContent, AlertTitle, AlertDescription } from "../alert/alert";
import { Icon } from "../icon/icon";
import { PivotDropZone } from "./pivot-drop-zone";
import { PivotFieldChip, type PivotFieldChipProps } from "./pivot-field-chip";
import {
  availableFields as availableFieldsIn,
  createEmptyLayout,
  describeMove,
  fieldLabel,
  hasActiveFilters,
  isLayoutRenderable,
  moveFieldToZone,
  updateValueAggregation,
} from "@algorisys/zen-ui-core/pivot";
import type {
  PivotLayout,
  PivotZone,
  PivotAggregation,
} from "@algorisys/zen-ui-core/pivot";
import type { PivotField, PivotMembersRequest, PivotMembersResult } from "@algorisys/zen-ui-core/pivot";
import type { PivotFilterSelection } from "@algorisys/zen-ui-core/pivot";
export type { PivotField, PivotMembersRequest, PivotMembersResult, PivotFilterSelection };

export interface PivotWorkbenchProps {
  fields: PivotField[];
  initialLayout?: PivotLayout;
  onLayoutApply?: (layout: PivotLayout) => void;
  
  // Custom collision detector or other advanced settings
  class?: string;
  
  // Children to render the grid (passing the applied layout)
  children?: JSX.Element;
  
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
/**
 * Prefer the chip you are over; fall back to the zone you are in.
 *
 * Both halves are load-bearing and the first one was dead: it filters on
 * `d.data.sortable`, which nothing ever set, so `sortableDroppables` was always
 * empty, closestCenter always returned null, and EVERY droppable — zones and
 * chips alike — went to mostIntersecting. That scores by overlap ratio, so a
 * chip-sized target always beat a zone-sized one, and the chip's id (a field
 * key) was then read as a zone name. createSortable marks its data now, so the
 * detector does what it says.
 *
 * Typed against solid-dnd's own CollisionDetector — it exports Draggable,
 * Droppable and this signature, so the four `as any` casts were never needed.
 */
const pivotCollisionDetector: CollisionDetector = (draggable, droppables, context) => {
  // mostIntersecting for BOTH, not closestCenter for the chips.
  //
  // closestCenter returns the nearest candidate whatever the distance — it never
  // returns null while any candidate exists. Over a list of chips that means
  // "some chip, somewhere", so every drop resolved to whichever chip happened to
  // be nearest (usually a neighbour in Available Fields), its zone came back as
  // "available", and the drop was a silent no-op. mostIntersecting requires
  // actual overlap and returns null without it, which is the question being
  // asked: are we ON a chip, or merely in a zone?
  //
  // The dragged chip is excluded because a sortable is its own droppable too:
  // it always overlaps itself, so it would win every time and every drop would
  // resolve to where the field already is.
  const chips = droppables.filter((d) => d.data?.sortable && d.id !== draggable.id);
  const overChip = mostIntersecting(draggable, chips, context);
  if (overChip) return overChip;

  const zones = droppables.filter((d) => !d.data?.sortable);
  return mostIntersecting(draggable, zones, context);
};

const SortableChip = (props: PivotFieldChipProps) => {
  // `sortable: true` is what the collision detector filters on. Without it the
  // detector's chip branch is unreachable and every drop resolves against a
  // zone list that also contains chips.
  // <For> keys chips by field key, so a chip is RECREATED rather than reassigned
  // when a field changes zone: fieldKey and zone are fixed for this instance's
  // life. solid-dnd registers the sortable once; a reactive read would
  // re-register it mid-drag.
  // eslint-disable-next-line solid/reactivity
  const sortable = createSortable(props.fieldKey, { zone: props.zone, sortable: true });
  return (
    <div
      ref={sortable.ref}
      {...sortable.dragActivators}
      // A stable hook for the drag surface, so the shared contract can grab a
      // chip in either binding without depending on a utility class that is an
      // implementation detail.
      data-pivot-chip={fieldLabel(props.fields, props.fieldKey)}
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

/**
 * Escape cancels the drag.
 *
 * @dnd-kit gives React this for free; solid-dnd ships pointer sensors and no
 * cancel, so a drag begun by accident could only be finished. Escaping out of a
 * gesture is a reflex, and the alternative — drop it somewhere wrong and drag it
 * back — is not one.
 *
 * solid-dnd has no "abort": dragEnd() ENDS the drag and fires onDragEnd, which
 * performs the drop. So this raises a flag first and the drop handler reads it.
 * Lives inside DragDropProvider because useDragDropContext only exists there.
 */
const CancelDragOnEscape = (props: { onCancel: () => void }) => {
  const ctx = useDragDropContext();
  if (!ctx) return null;
  const [state, { dragEnd }] = ctx;

  createEffect(() => {
    if (!state.active.draggable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      props.onCancel();
      dragEnd();
    };
    // Capture, and on window: focus is nowhere useful mid-drag.
    window.addEventListener("keydown", onKey, true);
    onCleanup(() => window.removeEventListener("keydown", onKey, true));
  });

  return null;
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

  const availableFields = () => availableFieldsIn(draftLayout(), props.fields);

  /**
   * What a screen reader has just been told. Drag changes the layout silently:
   * to anyone not watching the chips, nothing happened. Both the pointer path
   * and the keyboard path below announce through here, so they cannot diverge.
   */
  const [announcement, setAnnouncement] = createSignal("");

  /**
   * The ONE way a field moves — drag calls it, the chip's menu calls it.
   *
   * Two paths that each did their own layout surgery is how the drag handler
   * ended up deleting fields while the menu did not exist at all.
   */
  const moveField = (fieldId: string, zone: PivotZone, index?: number) => {
    setDraftLayout((prev) => moveFieldToZone(prev, fieldId, zone, { index }));
    setAnnouncement(describeMove(untrack(() => props.fields), fieldId, zone, index));
  };

  // Set by Escape, read by the very next onDragEnd. A signal would be a render
  // for something nothing renders.
  let cancelled = false;

  const onDragEnd = (event: DragEvent) => {
    const { draggable, droppable } = event;
    if (cancelled) {
      cancelled = false;
      setAnnouncement("Move cancelled.");
      return;
    }
    if (!droppable) return;

    const fieldId = draggable.id as string;

    // The zone comes from the droppable's DATA, not from parsing its id.
    //
    // Zones are createDroppable("rows") — id IS the zone, no data. Chips are
    // createSortable(fieldKey, { zone }) — id is a FIELD KEY, and the zone is in
    // the data. Once a zone holds a chip, that chip is the droppable that wins
    // (mostIntersecting scores by overlap ratio, and a chip-sized target beats a
    // zone-sized one), so the old `droppable.id.split("-")[0]` read "country" as
    // a zone, moveFieldToZone hit its `default: return cleanLayout`, and the drop
    // silently removed the field instead of adding it.
    //
    // The effect: the first field into an empty zone worked and every one after
    // it did nothing. A pivot that holds one field per zone is not a pivot.
    const toZone = ((droppable.data?.zone ?? droppable.id) as string) as PivotZone;

    // Dropped ON a chip? Land at that chip's position. Dropped on bare zone?
    // Append. The old code appended in both cases, so a reorder flung the chip
    // to the bottom — and the two functions written to honour a drop index were
    // exported and never called.
    const overFieldId = droppable.data?.zone ? (droppable.id as string) : undefined;
    const index =
      overFieldId && overFieldId !== fieldId ? indexInZone(untrack(draftLayout), overFieldId, toZone) : undefined;

    moveField(fieldId, toZone, index);
  };

  /** Where a field sits inside its zone, or undefined if it is not in one. */
  const indexInZone = (layout: PivotLayout, fieldId: string, zone: PivotZone): number | undefined => {
    const i =
      zone === "rows"
        ? layout.rows.indexOf(fieldId)
        : zone === "columns"
          ? layout.columns.indexOf(fieldId)
          : zone === "values"
            ? layout.values.findIndex((v) => v.id === fieldId)
            : -1;
    return i === -1 ? undefined : i;
  };

  const applyLayout = () => {
    const newLayout = { ...draftLayout() };
    setAppliedLayout(newLayout);
    props.onLayoutApply?.(newLayout);
  };

  const handleAggregationChange = (fieldId: string, agg: PivotAggregation) => {
    setDraftLayout(prev => updateValueAggregation(prev, fieldId, agg));
  };

  const handleRemoveField = (fieldId: string) => moveField(fieldId, "available");

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
    <div class={cn("zen-flex zen-h-full zen-w-full zen-min-w-0 zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border", props.class)}>
      {/* Every layout change says so out loud. A drag is invisible to a screen
          reader: the chips move and nothing is announced. Polite, so it waits
          for a pause rather than interrupting. */}
      <div aria-live="polite" aria-atomic="true" class="zen-sr-only">
        {announcement()}
      </div>
      <DragDropProvider onDragEnd={onDragEnd} collisionDetector={pivotCollisionDetector}>
        <CancelDragOnEscape onCancel={() => (cancelled = true)} />
        <DragDropSensors>
          <div class="zen-flex zen-w-full zen-flex-col zen-gap-2 zen-bg-zen-background zen-p-2">
            <Show when={props.showBuilder !== false}>
              <div class="zen-flex zen-items-center zen-justify-between zen-gap-2">
                <span class="zen-text-xs zen-text-zen-muted-fg">
                  {(props.totalRows ?? 0).toLocaleString()} rows &middot; {(props.totalCols ?? 0).toLocaleString()} cols
                </span>
                <div class="zen-flex zen-items-center zen-gap-2">
                  <Show when={hasActiveFilters(draftLayout().filters)}>
                    <button
                      type="button"
                      class="-zen-m-1 zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-1 zen-text-sm zen-text-zen-muted-fg hover:zen-text-zen-foreground"
                      onClick={() => {
                        if (props.onClearFilters) props.onClearFilters();
                        else setDraftLayout((prev) => ({ ...prev, filters: {} }));
                      }}
                    >
                      Clear filters
                    </button>
                  </Show>
                  <Button size="sm" onClick={applyLayout}>
                    View Data
                  </Button>
                </div>
              </div>

              <PivotDropZone id="available" title="Available Fields" horizontal isEmpty={availableFields().length === 0}>
                <SortableProvider ids={availableFields().map((f) => f.key)}>
                  <For each={availableFields()}>
                    {(field) => (
                      <SortableChip
                        fieldKey={field.key}
                        onMoveToZone={(z: PivotZone) => moveField(field.key, z)}
                        fields={props.fields}
                        zone="available"
                        selection={draftLayout().filters?.[field.key]}
                        filters={draftLayout().filters}
                        loadMembers={props.loadMembers}
                        onSelectionChange={(sel: PivotFilterSelection | null) => handleSelectionChange(field.key, sel)}
                        // Available is a preview of a field you have not placed
                        // yet, so its filter picks ONE member — it answers "what
                        // is in here", not "which of these do I want".
                        singleSelect={true}
                      />
                    )}
                  </For>
                </SortableProvider>
              </PivotDropZone>

              <div class="zen-grid zen-grid-cols-1 zen-gap-2 sm:zen-grid-cols-3">
                <PivotDropZone id="values" title="Values" isEmpty={draftLayout().values.length === 0}>
                  <SortableProvider ids={draftLayout().values.map((v) => v.id)}>
                    <For each={draftLayout().values}>
                      {(val) => (
                        <SortableChip
                          fieldKey={val.id}
                          onMoveToZone={(z: PivotZone) => moveField(val.id, z)}
                          fields={props.fields}
                          zone="values"
                          aggregation={val.aggregation}
                          onAggregationChange={(agg: PivotAggregation) => handleAggregationChange(val.id, agg)}
                          onRemove={() => handleRemoveField(val.id)}
                          selection={draftLayout().filters?.[val.id]}
                          filters={draftLayout().filters}
                          loadMembers={props.loadMembers}
                          onSelectionChange={(sel: PivotFilterSelection | null) => handleSelectionChange(val.id, sel)}
                        />
                      )}
                    </For>
                  </SortableProvider>
                </PivotDropZone>

                <PivotDropZone id="rows" title="Rows" isEmpty={draftLayout().rows.length === 0}>
                  <SortableProvider ids={draftLayout().rows}>
                    <For each={draftLayout().rows}>
                      {(fieldId) => (
                        <SortableChip
                          fieldKey={fieldId}
                          onMoveToZone={(z: PivotZone) => moveField(fieldId, z)}
                          fields={props.fields}
                          zone="rows"
                          onRemove={() => handleRemoveField(fieldId)}
                          selection={draftLayout().filters?.[fieldId]}
                          filters={draftLayout().filters}
                          loadMembers={props.loadMembers}
                          onSelectionChange={(sel: PivotFilterSelection | null) => handleSelectionChange(fieldId, sel)}
                        />
                      )}
                    </For>
                  </SortableProvider>
                </PivotDropZone>

                <PivotDropZone id="columns" title="Columns" isEmpty={draftLayout().columns.length === 0}>
                  <SortableProvider ids={draftLayout().columns}>
                    <For each={draftLayout().columns}>
                      {(fieldId) => (
                        <SortableChip
                          fieldKey={fieldId}
                          onMoveToZone={(z: PivotZone) => moveField(fieldId, z)}
                          fields={props.fields}
                          zone="columns"
                          onRemove={() => handleRemoveField(fieldId)}
                          selection={draftLayout().filters?.[fieldId]}
                          filters={draftLayout().filters}
                          loadMembers={props.loadMembers}
                          onSelectionChange={(sel: PivotFilterSelection | null) => handleSelectionChange(fieldId, sel)}
                        />
                      )}
                    </For>
                  </SortableProvider>
                </PivotDropZone>
              </div>
            </Show>
          </div>
        </DragDropSensors>
      </DragDropProvider>

      <div class="zen-relative zen-min-h-0 zen-min-w-0 zen-flex-1 zen-bg-zen-background zen-p-2">
        <Show
          when={isLayoutRenderable(appliedLayout())}
          fallback={
            <div class="zen-flex zen-flex-col zen-gap-2">
              <Show when={appliedLayout().values.length === 0}>
                <Alert color="warning">
                  <AlertIcon><Icon name="info" /></AlertIcon>
                  <AlertContent>
                    <AlertTitle>Value field required</AlertTitle>
                    <AlertDescription>Drop at least one field into Values to calculate data.</AlertDescription>
                  </AlertContent>
                </Alert>
              </Show>
              <Show when={appliedLayout().rows.length === 0 && appliedLayout().columns.length === 0}>
                <Alert color="warning">
                  <AlertIcon><Icon name="info" /></AlertIcon>
                  <AlertContent>
                    <AlertTitle>Dimension required</AlertTitle>
                    <AlertDescription>Drop at least one field into Rows or Columns.</AlertDescription>
                  </AlertContent>
                </Alert>
              </Show>
            </div>
          }
        >
          {props.children}
        </Show>
      </div>
    </div>
  );
}

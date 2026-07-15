import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  availableFields as availableFieldsIn,
  createEmptyLayout,
  describeMove,
  fieldLabel,
  hasActiveFilters,
  isLayoutRenderable,
  moveFieldToZone,
  updateValueAggregation,
  zoneOf,
  type PivotField,
  type PivotFilterSelection,
  type PivotLayout,
  type PivotMembersRequest,
  type PivotMembersResult,
  type PivotZone,
} from "@algorisys/zen-ui-core/pivot";
import { cn } from "../../lib/cn";
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "../alert/alert";
import { Button } from "../button/button";
import { PivotDropZone } from "./pivot-drop-zone";
import { PivotFieldChip, type PivotFieldChipProps } from "./pivot-field-chip";

/**
 * PivotWorkbench — drag fields into zones, press View Data, get a layout.
 *
 * Mirrors the Solid binding's API exactly. Every layout rule comes from
 * @algorisys/zen-ui-core/pivot, so the two bindings cannot disagree about what a
 * drop means — which matters here more than anywhere, because they share no drag
 * library: @dnd-kit here, @thisbeyond/solid-dnd there.
 *
 * It computes nothing and holds no data. You get a PivotLayout; answering for
 * the cells is yours.
 */

export interface PivotWorkbenchProps {
  fields: PivotField[];
  initialLayout?: PivotLayout;
  /** Fires on "View Data", not on every drag. */
  onLayoutApply?: (layout: PivotLayout) => void;
  className?: string;
  /** The grid. Rendered, never talked to. */
  children?: React.ReactNode;
  totalRows?: number;
  totalCols?: number;
  onClearFilters?: () => void;
  showBuilder?: boolean;
  loadMembers?: (request: PivotMembersRequest) => Promise<PivotMembersResult>;
}

/** A chip that can be dragged. The chip itself knows nothing about dragging. */
const SortableChip: React.FC<PivotFieldChipProps> = (props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: props.fieldKey,
    // `zone` is what the drop handler reads. It must never parse the zone out of
    // a droppable's id: once a zone holds a chip, the CHIP is the droppable that
    // wins, and its id is a field key. Reading an id as a zone is what deleted
    // fields.
    data: { zone: props.zone, sortable: true },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-pivot-chip={fieldLabel(props.fields, props.fieldKey)}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "zen-max-w-full zen-touch-none",
        props.zone === "rows" || props.zone === "values" ? "zen-flex zen-w-full" : "zen-inline-flex",
        isDragging && "zen-relative zen-z-50 zen-opacity-50",
      )}
    >
      <PivotFieldChip {...props} />
    </div>
  );
};

/**
 * Prefer the chip you are over; fall back to the zone you are in.
 *
 * pointerWithin, not closestCenter: closestCenter returns the nearest candidate
 * at ANY distance and never returns null while one exists, so over a list of
 * chips it means "some chip, somewhere" — every drop would resolve to whichever
 * chip happened to be closest, usually one still sitting in Available Fields.
 * pointerWithin asks the question actually being asked: is the pointer ON a chip,
 * or merely in a zone?
 *
 * The dragged chip is excluded because a sortable is its own droppable: it always
 * contains its own pointer, so it would win every time.
 */
const pivotCollisionDetection: CollisionDetection = (args) => {
  const chips = args.droppableContainers.filter(
    (d) => d.data.current?.sortable && d.id !== args.active.id,
  );
  const overChip = pointerWithin({ ...args, droppableContainers: chips });
  if (overChip.length) return overChip;

  const zones = args.droppableContainers.filter((d) => !d.data.current?.sortable);
  return pointerWithin({ ...args, droppableContainers: zones });
};

export const PivotWorkbench: React.FC<PivotWorkbenchProps> = ({
  fields,
  initialLayout,
  onLayoutApply,
  className,
  children,
  totalRows,
  totalCols,
  onClearFilters,
  showBuilder = true,
  loadMembers,
}) => {
  // Draft vs applied: dragging edits the draft, View Data publishes it. Same
  // split the List Report makes between its filter bar and its table, for the
  // same reason — re-querying a pivot on every drag is fine over 48 rows and
  // hostile over 48 million.
  const [draft, setDraft] = React.useState<PivotLayout>(initialLayout ?? createEmptyLayout());
  const [applied, setApplied] = React.useState<PivotLayout>(initialLayout ?? createEmptyLayout());

  /** What a screen reader has just been told. A drag is otherwise silent. */
  const [announcement, setAnnouncement] = React.useState("");

  /**
   * The chip under the pointer, rendered into a DragOverlay.
   *
   * dnd-kit does not move the drag source across containers: useSortable only
   * displaces it while `overIndex` is valid, and `overIndex` is an index WITHIN
   * the same SortableContext — so dragging a chip from Available onto the Rows
   * zone leaves it at -1 and the chip never moves. That is by design; the
   * library's answer for multi-container dragging is an overlay, which also
   * escapes the zone's overflow instead of being clipped by it.
   */
  const [dragging, setDragging] = React.useState<string | null>(null);

  const sensors = useSensors(
    // A small distance, so a click on the ⋮ handle or the remove button is not
    // read as the start of a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  /** The ONE way a field moves — drag calls it, the chip's menu calls it. */
  const moveField = React.useCallback(
    (fieldId: string, zone: PivotZone, index?: number) => {
      setDraft((prev) => moveFieldToZone(prev, fieldId, zone, { index }));
      setAnnouncement(describeMove(fields, fieldId, zone, index));
    },
    [fields],
  );

  const onDragStart = (event: DragStartEvent) => setDragging(String(event.active.id));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDragging(null);
    if (!over) return;
    const fieldId = String(active.id);

    // From the droppable's DATA, never from parsing its id.
    const zone = (over.data.current?.zone ?? over.id) as PivotZone;
    const overIsChip = Boolean(over.data.current?.sortable);
    const index = overIsChip ? indexInZone(draft, String(over.id), zone) : undefined;
    moveField(fieldId, zone, index);
  };

  const available = availableFieldsIn(draft, fields);
  const renderable = isLayoutRenderable(applied);

  const chipProps = (fieldKey: string, zone: PivotZone): PivotFieldChipProps => ({
    fieldKey,
    fields,
    zone,
    filters: draft.filters,
    selection: draft.filters[fieldKey],
    loadMembers,
    // Available is a preview of a field you have not placed yet, so its filter
    // picks ONE member — it answers "what is in here", not "which of these do I
    // want". A placed field filters for real and takes as many as you like.
    // The prop was implemented in the chip and the menu but never passed here,
    // so React's available fields multi-selected while Solid's did not. Mirrors
    // the Solid binding.
    singleSelect: zone === "available",
    onSelectionChange: (sel) => setDraft((prev) => withFilter(prev, fieldKey, sel)),
    onMoveToZone: (z) => moveField(fieldKey, z),
    onRemove: zone === "available" ? undefined : () => moveField(fieldKey, "available"),
  });

  return (
    <div
      className={cn(
        "zen-flex zen-h-full zen-w-full zen-min-w-0 zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        className,
      )}
    >
      {/* Every layout change says so out loud. */}
      <div aria-live="polite" aria-atomic="true" className="zen-sr-only">
        {announcement}
      </div>

      <DndContext
          sensors={sensors}
          collisionDetection={pivotCollisionDetection}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => {
            // dnd-kit cancels internally (Escape) and fires THIS rather than
            // onDragEnd — so without it the cancel was silent here while Solid
            // announced it. Same gesture, same sentence.
            setDragging(null);
            setAnnouncement("Move cancelled.");
          }}
        >
        <div className="zen-flex zen-w-full zen-flex-col zen-gap-2 zen-bg-zen-background zen-p-2">
          {showBuilder ? (
            <>
              <div className="zen-flex zen-items-center zen-justify-between zen-gap-2">
                <span className="zen-text-xs zen-text-zen-muted-fg">
                  {(totalRows ?? 0).toLocaleString()} rows · {(totalCols ?? 0).toLocaleString()} cols
                </span>
                <div className="zen-flex zen-items-center zen-gap-2">
                  {hasActiveFilters(draft.filters) ? (
                    <button
                      type="button"
                      className="-zen-m-1 zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-1 zen-text-sm zen-text-zen-muted-fg hover:zen-text-zen-foreground"
                      onClick={() => {
                        if (onClearFilters) onClearFilters();
                        else setDraft((prev) => ({ ...prev, filters: {} }));
                      }}
                    >
                      Clear filters
                    </button>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={() => {
                      setApplied(draft);
                      onLayoutApply?.(draft);
                    }}
                  >
                    View Data
                  </Button>
                </div>
              </div>

              <PivotDropZone
                id="available"
                title="Available Fields"
                horizontal
                isEmpty={available.length === 0}
              >
                {/* SortableContext per zone — the analogue of Solid's
                    SortableProvider. useSortable's `transform` is computed by
                    the sorting strategy, and without a context there is no
                    strategy: the chip registers as draggable and dims while
                    dragging, but never moves. rectSortingStrategy rather than a
                    list strategy because this zone wraps. */}
                <SortableContext items={available.map((f) => f.key)} strategy={rectSortingStrategy}>
                  {available.map((f) => (
                    <SortableChip key={f.key} {...chipProps(f.key, "available")} />
                  ))}
                </SortableContext>
              </PivotDropZone>

              <div className="zen-grid zen-grid-cols-1 zen-gap-2 sm:zen-grid-cols-3">
                <PivotDropZone id="values" title="Values" isEmpty={draft.values.length === 0}>
                  <SortableContext items={draft.values.map((v) => v.id)} strategy={rectSortingStrategy}>
                    {draft.values.map((v) => (
                      <SortableChip
                        key={v.id}
                        {...chipProps(v.id, "values")}
                        aggregation={v.aggregation}
                        onAggregationChange={(agg) => setDraft((prev) => updateValueAggregation(prev, v.id, agg))}
                      />
                    ))}
                  </SortableContext>
                </PivotDropZone>

                <PivotDropZone id="rows" title="Rows" isEmpty={draft.rows.length === 0}>
                  <SortableContext items={draft.rows} strategy={rectSortingStrategy}>
                    {draft.rows.map((id) => (
                      <SortableChip key={id} {...chipProps(id, "rows")} />
                    ))}
                  </SortableContext>
                </PivotDropZone>

                <PivotDropZone id="columns" title="Columns" isEmpty={draft.columns.length === 0}>
                  <SortableContext items={draft.columns} strategy={rectSortingStrategy}>
                    {draft.columns.map((id) => (
                      <SortableChip key={id} {...chipProps(id, "columns")} />
                    ))}
                  </SortableContext>
                </PivotDropZone>
              </div>
            </>
          ) : null}
        </div>

        {/* The chip that follows the pointer. Rendered in a portal above
            everything, so a zone's overflow cannot clip it. */}
        <DragOverlay>
          {dragging ? (
            <div data-pivot-drag-overlay className="zen-inline-flex zen-cursor-grabbing zen-opacity-90 zen-shadow-md">
              <PivotFieldChip fieldKey={dragging} fields={fields} zone={zoneOf(draft, dragging)} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="zen-relative zen-min-h-0 zen-min-w-0 zen-flex-1 zen-bg-zen-background zen-p-2">
        {renderable ? (
          children
        ) : (
          <div className="zen-flex zen-flex-col zen-gap-2">
            {applied.values.length === 0 ? (
              <Alert color="warning">
                <AlertIcon />
                <AlertContent>
                  <AlertTitle>Value field required</AlertTitle>
                  <AlertDescription>Drop at least one field into Values to calculate data.</AlertDescription>
                </AlertContent>
              </Alert>
            ) : null}
            {applied.rows.length === 0 && applied.columns.length === 0 ? (
              <Alert color="warning">
                <AlertIcon />
                <AlertContent>
                  <AlertTitle>Dimension required</AlertTitle>
                  <AlertDescription>Drop at least one field into Rows or Columns.</AlertDescription>
                </AlertContent>
              </Alert>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
PivotWorkbench.displayName = "PivotWorkbench";

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

/** Set or clear one field's filter. */
const withFilter = (layout: PivotLayout, fieldKey: string, sel: PivotFilterSelection | null): PivotLayout => {
  const filters = { ...layout.filters };
  if (sel) filters[fieldKey] = sel;
  else delete filters[fieldKey];
  return { ...layout, filters };
};

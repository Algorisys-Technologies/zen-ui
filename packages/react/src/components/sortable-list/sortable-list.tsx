import * as React from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  moveItem,
  reduceReorder,
  keyToReorderAction,
  DEFAULT_REORDER_ANNOUNCEMENTS,
  type PickedUp,
  type ReorderOrientation,
  type ReorderAnnouncements,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";

/**
 * SortableList — a list whose order the user can change.
 *
 *   <SortableList items={ids} onReorder={setIds}>
 *     {ids.map((id) => (
 *       <SortableListItem key={id} id={id}>
 *         <SortableListHandle />
 *         <ChapterRow id={id} />
 *       </SortableListItem>
 *     ))}
 *   </SortableList>
 *
 * This is extraction, not addition: `@dnd-kit` is already a dependency and
 * already reorders DataTable columns and Pivot fields. It was simply never
 * exposed.
 *
 * Pointer dragging comes from dnd-kit. KEYBOARD reordering does NOT — it comes
 * from `@algorisys/zen-ui-core/sortable`, shared with every other binding.
 * dnd-kit's `KeyboardSensor` is deliberately unused: `@thisbeyond/solid-dnd`
 * ships no keyboard handling at all and vanilla and web-components have no drag
 * library, so three of four bindings need one written by hand regardless.
 * Taking the free one here would leave React with different cancel semantics and
 * different announcement timing from the other three — a behavioural divergence,
 * which is the kind check-parity cannot see.
 *
 * `items` is ALWAYS controlled. A sortable list holding its own order is one
 * that silently disagrees with the array the caller rendered from.
 */

export type { ReorderOrientation };

interface SortableListContextValue {
  items: string[];
  orientation: ReorderOrientation;
  disabled: boolean;
  usesHandle: boolean;
  picked: PickedUp | null;
  onKeyDown: (event: React.KeyboardEvent, id: string) => void;
}

const SortableListContext = React.createContext<SortableListContextValue | null>(null);
/**
 * Which item a handle belongs to. A separate context rather than a prop: the
 * caller already wrote the id on `SortableListItem`, and making them repeat it
 * on the handle invites two different ones — a handle that reorders a row the
 * user was not pointing at.
 */
const SortableItemIdContext = React.createContext<string>("");

const useSortableList = () => {
  const ctx = React.useContext(SortableListContext);
  if (!ctx) throw new Error("SortableListItem and SortableListHandle must be inside a SortableList.");
  return ctx;
};

export interface SortableListProps {
  /** Ordered ids. Controlled — there is no uncontrolled mode by design. */
  items: string[];
  /** Called once per committed change, with the whole new order. */
  onReorder: (ids: string[]) => void;
  orientation?: ReorderOrientation;
  disabled?: boolean;
  /**
   * `true` (the default) means only the handle starts a drag. Whole-item
   * dragging is the wrong default for a library: real rows hold buttons, links
   * and selectable text, and making the row a drag target breaks all three.
   */
  handle?: boolean;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string) => void;
  /** Replace the screen-reader messages, e.g. for a localised app. */
  announcements?: Partial<ReorderAnnouncements>;
  className?: string;
  children?: React.ReactNode;
}

export const SortableList = ({
  items,
  onReorder,
  orientation = "vertical",
  disabled = false,
  handle = true,
  onDragStart,
  onDragEnd,
  announcements,
  className,
  children,
}: SortableListProps) => {
  const [picked, setPicked] = React.useState<PickedUp | null>(null);
  const [message, setMessage] = React.useState("");

  const say = React.useMemo(
    () => ({ ...DEFAULT_REORDER_ANNOUNCEMENTS, ...announcements }),
    [announcements],
  );

  /* dnd-kit's own keyboard sensor is deliberately not registered — see the note
     at the top of this file. */
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const onKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (disabled) return;
    const intent = keyToReorderAction(event.key, orientation, picked !== null, items.length);
    /* Not ours — let it bubble. A sortable list inside a dialog that swallows
       Escape is a dialog that stops closing. */
    if (!intent) return;

    event.preventDefault();
    const index = items.indexOf(id);
    if (index < 0) return;

    const action = intent.type === "pickup" ? { type: "pickup" as const, id, index } : intent;
    const result = reduceReorder(picked, action, items.length);

    if (result.commit) onReorder(moveItem(items, result.commit.from, result.commit.to));

    /* Cancel is checked BEFORE the commit, because cancelling DOES commit — the
       return trip to where the item started. Testing the commit first announces
       "moved from 3 to 1" for a press the user experienced as an undo. */
    if (intent.type === "cancel") setMessage(say.onCancel());
    else if (intent.type === "pickup" && result.picked)
      setMessage(say.onPickUp(id, result.picked.index, items.length));
    else if (intent.type === "drop" && picked) setMessage(say.onDrop(id, picked.index));
    else if (result.commit) setMessage(say.onMove(id, result.commit.from, result.commit.to));

    setPicked(result.picked);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const id = String(event.active.id);
    onDragEnd?.(id);
    if (!event.over) return;
    const from = items.indexOf(id);
    const to = items.indexOf(String(event.over.id));
    if (from < 0 || to < 0 || from === to) return;
    /* The same moveItem the keyboard path uses, which is what stops the two
       drifting apart. */
    onReorder(moveItem(items, from, to));
    setMessage(say.onDrop(id, to));
  };

  return (
    <SortableListContext.Provider
      value={{ items, orientation, disabled, usesHandle: handle, picked, onKeyDown }}
    >
      {/* A drag nobody announces is invisible to a screen reader. Polite, and
          outside the drag tree so re-ordering cannot tear the region out. */}
      <div aria-live="polite" aria-atomic className="zen-sr-only">
        {message}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e: DragStartEvent) => onDragStart?.(String(e.active.id))}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items}
          strategy={orientation === "vertical" ? verticalListSortingStrategy : horizontalListSortingStrategy}
        >
          <ul
            className={cn(
              "zen-m-0 zen-flex zen-list-none zen-p-0",
              orientation === "vertical" ? "zen-flex-col zen-gap-1" : "zen-flex-row zen-gap-1",
              className,
            )}
          >
            {children}
          </ul>
        </SortableContext>
      </DndContext>
    </SortableListContext.Provider>
  );
};

export interface SortableListItemProps {
  id: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const SortableListItem = ({ id, disabled, className, children }: SortableListItemProps) => {
  const ctx = useSortableList();
  const sortable = useSortable({ id });
  const inert = ctx.disabled || (disabled ?? false);
  const isPicked = ctx.picked?.id === id;

  return (
    <li
      ref={sortable.setNodeRef}
      style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition }}
      data-dragging={sortable.isDragging ? "" : undefined}
      data-picked={isPicked ? "" : undefined}
      aria-roledescription="sortable item"
      className={cn(
        "zen-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1.5",
        "zen-transition-shadow",
        sortable.isDragging && "zen-opacity-60",
        isPicked && "zen-ring-2 zen-ring-zen-ring",
        inert && "zen-opacity-60",
        className,
      )}
      /* Whole-item dragging only when there is no handle. */
      {...(ctx.usesHandle || inert
        ? {}
        : {
            ...sortable.attributes,
            ...sortable.listeners,
            tabIndex: 0,
            onKeyDown: (e: React.KeyboardEvent) => ctx.onKeyDown(e, id),
          })}
    >
      <SortableItemIdContext.Provider value={id}>{children}</SortableItemIdContext.Provider>
    </li>
  );
};

export interface SortableListHandleProps {
  /** Accessible name. Defaults to "Reorder". */
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="zen-shrink-0">
    <circle cx="9" cy="6" r="1.6" />
    <circle cx="15" cy="6" r="1.6" />
    <circle cx="9" cy="12" r="1.6" />
    <circle cx="15" cy="12" r="1.6" />
    <circle cx="9" cy="18" r="1.6" />
    <circle cx="15" cy="18" r="1.6" />
  </svg>
);

/**
 * The grab handle. A real `<button>`, so it is reachable by Tab and operable by
 * Space or Enter with no extra wiring, and `aria-pressed` says whether the item
 * is currently picked up.
 */
export const SortableListHandle = ({ label, className, children }: SortableListHandleProps) => {
  const ctx = useSortableList();
  const id = React.useContext(SortableItemIdContext);
  const sortable = useSortable({ id });

  return (
    <button
      type="button"
      ref={sortable.setActivatorNodeRef}
      aria-label={label ?? "Reorder"}
      disabled={ctx.disabled}
      {...sortable.attributes}
      {...sortable.listeners}
      /* AFTER the spread on purpose: dnd-kit sets aria-pressed from its own
         drag state, but the keyboard layer is ours, so ours is the one that
         describes whether the item is picked up. */
      aria-pressed={ctx.picked?.id === id}
      onKeyDown={(e) => ctx.onKeyDown(e, id)}
      className={cn(
        "zen-inline-flex zen-cursor-grab zen-items-center zen-rounded-zen-sm zen-p-1 zen-text-zen-muted-fg",
        "hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        /* Or the page scrolls instead of the item moving. */
        "zen-touch-none",
        className,
      )}
    >
      {children ?? <GripIcon />}
    </button>
  );
};

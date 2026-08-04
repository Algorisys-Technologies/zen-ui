import {
  createContext,
  createSignal,
  useContext,
  type JSX,
  Show,
} from "solid-js";
import {
  DragDropProvider,
  DragDropSensors,
  SortableProvider,
  createSortable,
  closestCenter,
} from "@thisbeyond/solid-dnd";
import type { DragEvent } from "@thisbeyond/solid-dnd";
import {
  moveItem,
  reduceReorder,
  keyToReorderAction,
  DEFAULT_REORDER_ANNOUNCEMENTS,
  type PickedUp,
  type ReorderOrientation,
  type ReorderAnnouncements,
} from "@algorisys/zen-ui-core/sortable";
import { cn } from "../../lib/cn";

/**
 * SortableList — a list whose order the user can change.
 *
 *   <SortableList items={ids} onReorder={setIds}>
 *     <For each={ids}>{(id) => (
 *       <SortableListItem id={id}>
 *         <SortableListHandle />
 *         <ChapterRow id={id} />
 *       </SortableListItem>
 *     )}</For>
 *   </SortableList>
 *
 * This is extraction, not addition: `@thisbeyond/solid-dnd` is already a
 * dependency and already reorders DataTable columns and Pivot fields. It was
 * simply never exposed, so every consumer that wanted a reorderable list built
 * one.
 *
 * Pointer dragging comes from solid-dnd. KEYBOARD reordering does not — it
 * comes from `@algorisys/zen-ui-core/sortable`, shared with every other
 * binding, because solid-dnd ships no keyboard handling at all and vanilla and
 * web-components have no drag library. Three of four need it written by hand
 * regardless, so writing it once beats taking dnd-kit's `KeyboardSensor` in
 * React alone and leaving that binding with different cancel semantics.
 *
 * `items` is ALWAYS controlled. A sortable list holding its own order is one
 * that silently disagrees with the array the caller rendered from, and the bug
 * surfaces as a row snapping back a second after the drop. One source of truth,
 * and it is the caller's.
 */

export type { ReorderOrientation };

interface SortableListContextValue {
  items: () => string[];
  orientation: () => ReorderOrientation;
  disabled: () => boolean;
  usesHandle: () => boolean;
  picked: () => PickedUp | null;
  onKeyDown: (event: KeyboardEvent, id: string) => void;
}

const SortableListContext = createContext<SortableListContextValue>();

/**
 * Which item a handle belongs to.
 *
 * A separate context rather than a prop on the handle: the caller already wrote
 * the id on `SortableListItem`, and making them repeat it on the handle is an
 * invitation to write two different ones — a handle that reorders a row the
 * user was not pointing at.
 */
const SortableItemIdContext = createContext<() => string>();

const useSortableList = () => {
  const ctx = useContext(SortableListContext);
  if (!ctx) {
    throw new Error("SortableListItem and SortableListHandle must be inside a SortableList.");
  }
  return ctx;
};

export interface SortableListProps {
  /** Ordered ids. Controlled — there is no uncontrolled mode by design. */
  items: string[];
  /** Called once per committed change, with the whole new order. */
  onReorder: (ids: string[]) => void;
  /** Decides the arrow keys and the collision axis. */
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
  class?: string;
  children?: JSX.Element;
}

export const SortableList = (props: SortableListProps) => {
  const [picked, setPicked] = createSignal<PickedUp | null>(null);
  const [message, setMessage] = createSignal("");

  const items = () => props.items;
  const orientation = () => props.orientation ?? "vertical";
  const disabled = () => props.disabled ?? false;
  const usesHandle = () => props.handle ?? true;
  const say = () => ({ ...DEFAULT_REORDER_ANNOUNCEMENTS, ...props.announcements });

  const onKeyDown = (event: KeyboardEvent, id: string) => {
    if (disabled()) return;
    const list = items();
    const held = picked();
    const intent = keyToReorderAction(event.key, orientation(), held !== null, list.length);
    /* Not ours — let it bubble. A sortable list inside a dialog that swallows
       Escape is a dialog that stops closing. */
    if (!intent) return;

    event.preventDefault();
    const index = list.indexOf(id);
    if (index < 0) return;

    const action = intent.type === "pickup" ? { type: "pickup" as const, id, index } : intent;
    const result = reduceReorder(held, action, list.length);

    if (result.commit) props.onReorder(moveItem(list, result.commit.from, result.commit.to));

    /* Cancel is checked BEFORE the commit, because cancelling DOES commit — the
       return trip to where the item started. Testing the commit first announces
       "moved from 3 to 1" for a press the user experienced as an undo. */
    const messages = say();
    if (intent.type === "cancel") {
      setMessage(messages.onCancel());
    } else if (intent.type === "pickup" && result.picked) {
      setMessage(messages.onPickUp(id, result.picked.index, list.length));
    } else if (intent.type === "drop" && held) {
      setMessage(messages.onDrop(id, held.index));
    } else if (result.commit) {
      setMessage(messages.onMove(id, result.commit.from, result.commit.to));
    }

    setPicked(result.picked);
  };

  const onDragEnd = ({ draggable, droppable }: DragEvent) => {
    props.onDragEnd?.(String(draggable.id));
    if (!droppable) return;
    const list = items();
    const from = list.indexOf(String(draggable.id));
    const to = list.indexOf(String(droppable.id));
    if (from < 0 || to < 0 || from === to) return;
    /* The same moveItem the keyboard path uses, which is what stops the two
       drifting apart. */
    props.onReorder(moveItem(list, from, to));
    setMessage(say().onDrop(String(draggable.id), to));
  };

  return (
    <SortableListContext.Provider
      value={{ items, orientation, disabled, usesHandle, picked, onKeyDown }}
    >
      {/*
        A drag nobody announces is invisible to a screen reader. Polite, so it
        does not interrupt, and outside the drag tree so re-ordering the list
        cannot tear the live region out and stop it announcing.
      */}
      <div aria-live="polite" aria-atomic="true" class="zen-sr-only">
        {message()}
      </div>
      <DragDropProvider
        onDragStart={({ draggable }: DragEvent) => props.onDragStart?.(String(draggable.id))}
        onDragEnd={onDragEnd}
        collisionDetector={closestCenter}
      >
        <DragDropSensors />
        <SortableProvider ids={items()}>
          <ul
            class={cn(
              "zen-m-0 zen-flex zen-list-none zen-p-0",
              orientation() === "vertical" ? "zen-flex-col zen-gap-1" : "zen-flex-row zen-gap-1",
              props.class,
            )}
          >
            {props.children}
          </ul>
        </SortableProvider>
      </DragDropProvider>
    </SortableListContext.Provider>
  );
};

export interface SortableListItemProps {
  id: string;
  disabled?: boolean;
  class?: string;
  children?: JSX.Element;
}

export const SortableListItem = (props: SortableListItemProps) => {
  const ctx = useSortableList();
  /* Registered once for the item's life: solid-dnd registers the sortable on
     creation and a reactive read would re-register it mid-drag. */
  // eslint-disable-next-line solid/reactivity
  const sortable = createSortable(props.id);

  const isPicked = () => ctx.picked()?.id === props.id;
  const inert = () => ctx.disabled() || (props.disabled ?? false);

  return (
    <li
      // @ts-expect-error solid-dnd's directive is applied through a use: prop
      use:sortable
      data-dragging={sortable.isActiveDraggable ? "" : undefined}
      data-picked={isPicked() ? "" : undefined}
      aria-roledescription="sortable item"
      class={cn(
        "zen-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1.5",
        "zen-transition-shadow",
        sortable.isActiveDraggable && "zen-opacity-60",
        isPicked() && "zen-ring-2 zen-ring-zen-ring",
        inert() && "zen-opacity-60",
        props.class,
      )}
      /* Whole-item dragging only when there is no handle. */
      {...(ctx.usesHandle() || inert()
        ? {}
        : { onKeyDown: (e: KeyboardEvent) => ctx.onKeyDown(e, props.id), tabIndex: 0 })}
    >
      {/* A getter, not a value: the getter is the tracked scope, so a handle
          rendered before its item's id settles still reads the current one. */}
      {/* eslint-disable-next-line solid/reactivity */}
      <SortableItemIdContext.Provider value={() => props.id}>
        {props.children}
      </SortableItemIdContext.Provider>
    </li>
  );
};

export interface SortableListHandleProps {
  /** Accessible name. Defaults to "Reorder". */
  label?: string;
  class?: string;
  children?: JSX.Element;
}

const GripIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    class="zen-shrink-0"
  >
    <circle cx="9" cy="6" r="1.6" />
    <circle cx="15" cy="6" r="1.6" />
    <circle cx="9" cy="12" r="1.6" />
    <circle cx="15" cy="12" r="1.6" />
    <circle cx="9" cy="18" r="1.6" />
    <circle cx="15" cy="18" r="1.6" />
  </svg>
);

/**
 * The grab handle. It is a real `<button>`, so it is reachable by Tab and
 * operable by Space or Enter with no extra wiring, and `aria-pressed` says
 * whether the item is currently picked up.
 */
export const SortableListHandle = (props: SortableListHandleProps) => {
  const ctx = useSortableList();
  const item = useContext(SortableItemIdContext);

  return (
    <button
      type="button"
      aria-label={props.label ?? "Reorder"}
      aria-pressed={ctx.picked()?.id === item?.() ? "true" : "false"}
      disabled={ctx.disabled()}
      class={cn(
        "zen-inline-flex zen-cursor-grab zen-items-center zen-rounded-zen-sm zen-p-1 zen-text-zen-muted-fg",
        "hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        /* Or the page scrolls instead of the item moving. */
        "zen-touch-none",
        props.class,
      )}
      onKeyDown={(e) => {
        const id = item?.();
        if (id) ctx.onKeyDown(e, id);
      }}
    >
      <Show when={props.children} fallback={<GripIcon />}>
        {props.children}
      </Show>
    </button>
  );
};


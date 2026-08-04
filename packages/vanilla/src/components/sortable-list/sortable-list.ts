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
import { applyProps, Disposer, setChildren, type BaseProps, type Child, type ZenComponent } from "../../lib/component";

/**
 * SortableList — a list whose order the user can change.
 *
 *   SortableList({
 *     items: [{ id: "ch-1", content: "The gate at first light" }, …],
 *     onReorder: (ids) => setOrder(ids),
 *   }).el
 *
 * Vanilla port; see the React binding for the reasoning. Same keyboard, same
 * announcements, same reducer.
 *
 * The binding's standing deviation applies: React composes `<SortableListItem>`
 * and `<SortableListHandle>` as children through a context, and with no framework
 * there is none, so the rows are DATA and each carries its own id.
 *
 * The real difference from React is under the surface rather than in the API.
 * React gets POINTER dragging from dnd-kit, which is already a dependency there.
 * This binding has no drag library and is not gaining one for a single component,
 * so the pointer path is written here — some 60 lines of pointermove against the
 * measured row boxes. The KEYBOARD path is not written here: it is
 * `@algorisys/zen-ui-core/sortable`, the same reducer React runs, which is what
 * makes the two announce the same words and cancel the same way.
 *
 * `items` is ALWAYS controlled, exactly as in React. A sortable list holding its
 * own order is one that silently disagrees with the array the caller rendered.
 */

export type { ReorderOrientation, PickedUp, ReorderAnnouncements };

export interface SortableItemSpec {
  id: string;
  /** The row. Anything: a string, a node, another component's `el`. */
  content?: Child;
  /** Locks this row alone. The list's own `disabled` locks all of them. */
  disabled?: boolean;
  class?: string;
  /** Accessible name for this row's grab handle. Defaults to "Reorder". */
  handleLabel?: string;
}

export interface SortableListProps extends BaseProps {
  /** Ordered rows. Controlled — there is no uncontrolled mode by design. */
  items: SortableItemSpec[];
  /** Called once per committed change, with the whole new order of ids. */
  onReorder: (ids: string[]) => void;
  orientation?: ReorderOrientation;
  disabled?: boolean;
  /**
   * `true` (the default) means only the handle starts a drag. Whole-row dragging
   * is the wrong default for a library: real rows hold buttons, links and
   * selectable text, and making the row a drag target breaks all three.
   */
  handle?: boolean;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string) => void;
  /** Replace the screen-reader messages, e.g. for a localised app. */
  announcements?: Partial<ReorderAnnouncements>;
}

const GRIP =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="zen-shrink-0">' +
  '<circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/>' +
  '<circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/>' +
  '<circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';

export function SortableList(props: SortableListProps): ZenComponent<SortableListProps> {
  let current: SortableListProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let picked: PickedUp | null = null;

  const el = document.createElement("div");

  /* A drag nobody announces is invisible to a screen reader. Polite, and OUTSIDE
     the list so re-ordering the rows cannot tear the region out of the document
     mid-announcement. */
  const live = document.createElement("div");
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");
  live.className = "zen-sr-only";

  const list = document.createElement("ul");
  el.append(live, list);

  const ids = () => current.items.map((i) => i.id);
  const say = (): ReorderAnnouncements => ({ ...DEFAULT_REORDER_ANNOUNCEMENTS, ...current.announcements });

  const announce = (message: string) => {
    /* Cleared first: an identical string assigned twice is not a change, and a
       polite region that has not changed announces nothing — so moving an item
       one step, twice, would be spoken once. */
    live.textContent = "";
    live.textContent = message;
  };

  const onKeyDown = (event: KeyboardEvent, id: string) => {
    if (current.disabled) return;
    const order = ids();
    const intent = keyToReorderAction(event.key, current.orientation ?? "vertical", picked !== null, order.length);
    /* Not ours — let it bubble. A sortable list inside a dialog that swallows
       Escape is a dialog that stops closing. */
    if (!intent) return;

    event.preventDefault();
    const index = order.indexOf(id);
    if (index < 0) return;

    const action = intent.type === "pickup" ? ({ type: "pickup", id, index } as const) : intent;
    const result = reduceReorder(picked, action, order.length);

    if (result.commit) current.onReorder(moveItem(order, result.commit.from, result.commit.to));

    /* Cancel is checked BEFORE the commit, because cancelling DOES commit — the
       return trip to where the item started. Testing the commit first announces
       "moved from 3 to 1" for a press the user experienced as an undo. */
    const words = say();
    if (intent.type === "cancel") announce(words.onCancel());
    else if (intent.type === "pickup" && result.picked) announce(words.onPickUp(id, result.picked.index, order.length));
    else if (intent.type === "drop" && picked) announce(words.onDrop(id, picked.index));
    else if (result.commit) announce(words.onMove(id, result.commit.from, result.commit.to));

    picked = result.picked;
    paintPicked();

    /* Focus follows the item, not the position. The row moved; without this the
       next arrow press would drive whatever row slid into the old slot. */
    if (result.commit) queueMicrotask(() => focusGrabber(id));
  };

  /** The element the keyboard drives for a row: its handle, or the row itself. */
  const grabbers = new Map<string, HTMLElement>();
  const rows = new Map<string, HTMLLIElement>();

  const focusGrabber = (id: string) => grabbers.get(id)?.focus();

  const paintPicked = () => {
    for (const [id, li] of rows) {
      const isPicked = picked?.id === id;
      li.toggleAttribute("data-picked", isPicked);
      li.classList.toggle("zen-ring-2", isPicked);
      li.classList.toggle("zen-ring-zen-ring", isPicked);
      const grab = grabbers.get(id);
      if (grab?.tagName === "BUTTON") grab.setAttribute("aria-pressed", String(isPicked));
    }
  };

  /**
   * Pointer dragging, written by hand because this binding has no drag library.
   *
   * It measures the row boxes ONCE per gesture and works out which index the
   * pointer is over from their midpoints. Re-measuring per move would read the
   * boxes mid-transition and jitter between two indices at every boundary.
   */
  const startPointerDrag = (event: PointerEvent, id: string) => {
    if (current.disabled) return;
    const order = ids();
    const from = order.indexOf(id);
    if (from < 0) return;

    const horizontal = (current.orientation ?? "vertical") === "horizontal";
    const boxes = order
      .map((rowId) => rows.get(rowId)?.getBoundingClientRect())
      .filter((b): b is DOMRect => b !== undefined);
    if (boxes.length !== order.length) return;

    const target = event.currentTarget as HTMLElement;
    event.preventDefault();
    target.focus();
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      /* No capture; the drag still works until the pointer leaves the handle. */
    }

    current.onDragStart?.(id);
    const dragged = rows.get(id);
    dragged?.classList.add("zen-opacity-60");
    dragged?.setAttribute("data-dragging", "");

    let to = from;

    const onMove = (e: PointerEvent) => {
      const pos = horizontal ? e.clientX : e.clientY;
      let next = 0;
      for (let i = 0; i < boxes.length; i++) {
        const mid = horizontal ? boxes[i].left + boxes[i].width / 2 : boxes[i].top + boxes[i].height / 2;
        if (pos > mid) next = i;
      }
      to = next;
    };

    const finish = (e: PointerEvent) => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", finish);
      target.removeEventListener("pointercancel", finish);
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {
        /* Never captured, or already released. */
      }
      dragged?.classList.remove("zen-opacity-60");
      dragged?.removeAttribute("data-dragging");
      current.onDragEnd?.(id);

      if (to !== from) {
        /* The same moveItem the keyboard path uses, which is what stops the two
           drifting apart. */
        current.onReorder(moveItem(order, from, to));
        announce(say().onDrop(id, to));
      }
    };

    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", finish);
    target.addEventListener("pointercancel", finish);
  };

  const render = () => {
    const { items, orientation = "vertical", disabled = false, handle = true, class: className } = current;

    grabbers.clear();
    rows.clear();
    list.replaceChildren();

    el.className = cn(className);
    list.className = cn(
      "zen-m-0 zen-flex zen-list-none zen-p-0",
      orientation === "vertical" ? "zen-flex-col zen-gap-1" : "zen-flex-row zen-gap-1",
    );

    for (const spec of items) {
      const inert = disabled || (spec.disabled ?? false);
      const li = document.createElement("li");
      li.setAttribute("aria-roledescription", "sortable item");
      li.className = cn(
        "zen-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1.5",
        "zen-transition-shadow",
        inert && "zen-opacity-60",
        spec.class,
      );

      let grabber: HTMLElement;

      if (handle) {
        /* A real <button>, so it is reachable by Tab and operable by Space or
           Enter with no extra wiring, and aria-pressed says whether the row is
           currently picked up. */
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("aria-label", spec.handleLabel ?? "Reorder");
        btn.setAttribute("aria-pressed", "false");
        btn.disabled = inert;
        btn.className = cn(
          "zen-inline-flex zen-cursor-grab zen-items-center zen-rounded-zen-sm zen-p-1 zen-text-zen-muted-fg",
          "hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
          /* Or the page scrolls instead of the row moving. */
          "zen-touch-none",
        );
        btn.innerHTML = GRIP;
        li.append(btn);
        grabber = btn;
      } else {
        /* No handle: the ROW takes the keyboard, so it has to be focusable. */
        li.tabIndex = inert ? -1 : 0;
        li.classList.add("zen-cursor-grab", "zen-touch-none");
        grabber = li;
      }

      if (spec.content !== undefined && spec.content !== null) {
        const body = document.createElement("div");
        body.className = "zen-flex zen-min-w-0 zen-flex-1 zen-items-center zen-gap-2";
        setChildren(body, spec.content);
        li.append(body);
      }

      if (!inert) {
        const key = (e: KeyboardEvent) => onKeyDown(e, spec.id);
        const down = (e: PointerEvent) => startPointerDrag(e, spec.id);
        grabber.addEventListener("keydown", key);
        grabber.addEventListener("pointerdown", down);
        disposer.add(() => {
          grabber.removeEventListener("keydown", key);
          grabber.removeEventListener("pointerdown", down);
        });
      }

      grabbers.set(spec.id, grabber);
      rows.set(spec.id, li);
      list.append(li);
    }

    /* A re-render during a keyboard drag rebuilds the rows, so the picked state
       has to be re-applied and focus put back where the user left it. */
    paintPicked();

    const {
      items: _i, onReorder: _r, orientation: _o, disabled: _d, handle: _h,
      onDragStart: _ds, onDragEnd: _de, announcements: _a, class: _c, children: _ch,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      const hadFocus = picked?.id ?? focusedRowId();
      current = { ...current, ...next };
      render();
      if (hadFocus) focusGrabber(hadFocus);
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };

  /** Which row holds focus right now, so a re-render can hand it back. */
  function focusedRowId(): string | undefined {
    for (const [id, grab] of grabbers) if (grab.contains(document.activeElement)) return id;
    return undefined;
  }
}

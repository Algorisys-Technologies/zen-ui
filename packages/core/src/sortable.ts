/**
 * Keyboard reordering — the pure half of SortableList.
 *
 * It lives here rather than in a binding because three of the four need it
 * written by hand: `@thisbeyond/solid-dnd` ships no keyboard handling at all,
 * and vanilla and web-components have no drag library. Only React would get one
 * free, from dnd-kit's `KeyboardSensor` — and adopting it there alone would
 * leave React with different cancel semantics, different announcement timing
 * and different modifier handling from the other three. That is a behavioural
 * divergence, which is the one kind `check-parity` cannot see and users can.
 *
 * So the split is deliberate: core owns the keyboard model, each binding owns
 * pointer dragging only. Keyboard reordering never touches pointers, collision
 * detection or transforms — it is array-index arithmetic — so it separates
 * cleanly and is testable with no DOM. Pinned by scripts/check-sortable.ts.
 */

/** An item currently picked up for keyboard reordering. */
export interface PickedUp {
  id: string;
  /** Where it was when it was picked up, so Escape can put it back. */
  origin: number;
  /** Where it sits now. */
  index: number;
}

export type ReorderOrientation = "vertical" | "horizontal";

export type ReorderAction =
  | { type: "pickup"; id: string; index: number }
  | { type: "move"; delta: number }
  | { type: "moveTo"; index: number }
  | { type: "drop" }
  | { type: "cancel" };

/**
 * What a key press means, before the binding knows which item it landed on.
 *
 * `pickup` carries no id or index here: the key handler knows the key, the
 * element knows the item. The binding fills them in when it forwards this to
 * `reduceReorder`.
 */
export type ReorderIntent =
  | { type: "pickup" }
  | { type: "move"; delta: number }
  | { type: "moveTo"; index: number }
  | { type: "drop" }
  | { type: "cancel" };

export interface ReorderResult {
  picked: PickedUp | null;
  /**
   * The move to apply, or `null` when nothing changed. A no-op must be `null`
   * rather than `{from: n, to: n}` so a caller can wire it straight to
   * `onReorder` without firing a change event for a key press that did nothing.
   */
  commit: { from: number; to: number } | null;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Move one item, returning a new array. The single place an order changes, so
 * the keyboard and pointer paths cannot drift apart — both end here.
 *
 * Indices are clamped rather than validated: a drop past the end of a list is a
 * drop at the end, which is what the user meant, and throwing there would take
 * down a component mid-gesture.
 */
export const moveItem = <T>(items: readonly T[], from: number, to: number): T[] => {
  const next = [...items];
  if (next.length === 0) return next;
  const a = clamp(Math.trunc(from), 0, next.length - 1);
  const b = clamp(Math.trunc(to), 0, next.length - 1);
  if (a === b) return next;
  const [moved] = next.splice(a, 1);
  next.splice(b, 0, moved as T);
  return next;
};

/**
 * Advance the keyboard-reorder state machine.
 *
 * Moves commit IMMEDIATELY rather than previewing until drop: someone arrowing
 * an item down expects to see it move, and a preview that only lands on Enter
 * reads as a broken control. That makes `drop` a release with nothing to apply,
 * and `cancel` the one action that has to undo — it commits the return trip
 * from wherever the item got to back to where it started.
 */
export const reduceReorder = (
  picked: PickedUp | null,
  action: ReorderAction,
  total: number,
): ReorderResult => {
  if (action.type === "pickup") {
    if (total <= 0) return { picked: null, commit: null };
    const index = clamp(Math.trunc(action.index), 0, total - 1);
    return { picked: { id: action.id, origin: index, index }, commit: null };
  }

  /* Every other action needs something in hand. A stray Escape or arrow with
     nothing picked up must fall through untouched. */
  if (!picked) return { picked: null, commit: null };

  switch (action.type) {
    case "move":
    case "moveTo": {
      const target =
        action.type === "move"
          ? clamp(picked.index + Math.trunc(action.delta), 0, total - 1)
          : clamp(Math.trunc(action.index), 0, total - 1);
      if (target === picked.index) return { picked, commit: null };
      return { picked: { ...picked, index: target }, commit: { from: picked.index, to: target } };
    }
    case "drop":
      return { picked: null, commit: null };
    case "cancel":
      return {
        picked: null,
        commit: picked.index === picked.origin ? null : { from: picked.index, to: picked.origin },
      };
  }
};

/**
 * What a key press means, or `null` for one this component does not claim.
 *
 * The `null` matters as much as the actions. A sortable list that swallows
 * Escape while nothing is picked up is a list that stops the dialog around it
 * from closing, and one that claims the arrows at rest takes them from the page.
 * Only the axis's own arrows are claimed, and only while something is held.
 *
 * `total` is a parameter because End means "the last index", which cannot be
 * expressed without knowing how many there are — the alternative is a sentinel
 * index that relies on clamping, which reads as a bug at the call site.
 */
export const keyToReorderAction = (
  key: string,
  orientation: ReorderOrientation,
  isPickedUp: boolean,
  total: number,
): ReorderIntent | null => {
  if (key === " " || key === "Spacebar" || key === "Enter") {
    return isPickedUp ? { type: "drop" } : { type: "pickup" };
  }

  if (!isPickedUp) return null;

  if (key === "Escape") return { type: "cancel" };
  if (key === "Home") return { type: "moveTo", index: 0 };
  if (key === "End") return { type: "moveTo", index: Math.max(0, total - 1) };

  const back = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
  const forward = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
  if (key === back) return { type: "move", delta: -1 };
  if (key === forward) return { type: "move", delta: 1 };

  return null;
};

/**
 * The default screen-reader announcements. A drag with nothing announced is
 * invisible, and English defaults mean the common case needs no configuration;
 * a localised app replaces the whole set.
 *
 * Positions are 1-based because they are spoken to a person.
 */
export interface ReorderAnnouncements {
  onPickUp: (id: string, index: number, total: number) => string;
  onMove: (id: string, from: number, to: number) => string;
  onDrop: (id: string, index: number) => string;
  onCancel: () => string;
}

export const DEFAULT_REORDER_ANNOUNCEMENTS: ReorderAnnouncements = {
  onPickUp: (_id, index, total) => `Picked up item ${index + 1} of ${total}.`,
  onMove: (_id, from, to) => `Moved from position ${from + 1} to ${to + 1}.`,
  onDrop: (_id, index) => `Dropped at position ${index + 1}.`,
  onCancel: () => "Reorder cancelled.",
};

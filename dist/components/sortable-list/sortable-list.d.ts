import * as React from "react";
import { type ReorderOrientation, type ReorderAnnouncements } from "../../_core/index";
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
export declare const SortableList: ({ items, onReorder, orientation, disabled, handle, onDragStart, onDragEnd, announcements, className, children, }: SortableListProps) => React.JSX.Element;
export interface SortableListItemProps {
    id: string;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}
export declare const SortableListItem: ({ id, disabled, className, children }: SortableListItemProps) => React.JSX.Element;
export interface SortableListHandleProps {
    /** Accessible name. Defaults to "Reorder". */
    label?: string;
    className?: string;
    children?: React.ReactNode;
}
/**
 * The grab handle. A real `<button>`, so it is reachable by Tab and operable by
 * Space or Enter with no extra wiring, and `aria-pressed` says whether the item
 * is currently picked up.
 */
export declare const SortableListHandle: ({ label, className, children }: SortableListHandleProps) => React.JSX.Element;
//# sourceMappingURL=sortable-list.d.ts.map
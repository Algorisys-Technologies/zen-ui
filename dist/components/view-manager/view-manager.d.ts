import * as React from "react";
import { type SavedView } from "../../_core/views";
export type { SavedView };
/**
 * ViewManager — named list setups a person keeps and returns to ("My overdue
 * invoices, this quarter, these columns"), as a picker beside the page title.
 *
 *   <ViewManager
 *     views={views} activeId={active} state={screenState}
 *     onSelect={(v) => apply(v?.state ?? standard)}
 *     onSave={save} onCreate={create} onRename={rename} onDelete={remove}
 *     onDefaultChange={setDefault} onShare={(v, token) => copy(`${url}?view=${token}`)}
 *   />
 *
 * The state is one serialisable object of the app's choosing (a FilterBuilder
 * value, sort, grouping, columns); this picker never looks inside it. It says
 * when the screen has drifted from the view (key order is not a change), and
 * storage is the app's: every change arrives as a callback, which may return a
 * Promise. A dialog waits for it, and shows the error if it fails rather than
 * closing on a save that did not happen. A view marked readOnly (shared by
 * someone else, or the app's own) can be used and copied, not saved over,
 * renamed or deleted. The pure half is @algorisys/zen-ui-core/views
 * (check:views), which also reads share links back (decodeView).
 */
export type ViewManagerProps<S> = {
    views: SavedView<S>[];
    /** The view on screen; null for the standard (unsaved) one. */
    activeId: string | null;
    /** The screen's state now, to tell when it has drifted from the view. */
    state: S;
    /** The state with no view applied: with it, "Standard" shows Modified too. */
    standardState?: S;
    /** Default "Standard". */
    standardName?: string;
    /** A view was chosen (null: the standard one). Apply its state. */
    onSelect: (view: SavedView<S> | null) => void;
    /** Save: the active view, with the current state. Without it, no Save. */
    onSave?: (view: SavedView<S>) => void | Promise<void>;
    /** Save as: a new view of the current state. Without it, no Save as. */
    onCreate?: (view: SavedView<S>) => void | Promise<void>;
    onRename?: (id: string, name: string) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
    /** The view the screen opens with changed (null: the standard one). */
    onDefaultChange?: (id: string | null) => void | Promise<void>;
    /** Copy link: the view with the current state as a URL-safe token. Without it, no Copy link. */
    onShare?: (view: SavedView<S>, token: string) => void;
    /** Names the trigger for assistive tech, before the view name. Default "View". */
    "aria-label"?: string;
    className?: string;
};
export declare function ViewManager<S>({ views, activeId, state, standardState, standardName: standardNameProp, onSelect, onSave, onCreate, onRename, onDelete, onDefaultChange, onShare, "aria-label": ariaLabel, className, }: ViewManagerProps<S>): React.JSX.Element;
//# sourceMappingURL=view-manager.d.ts.map
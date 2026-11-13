/**
 * Saved views: the pure half of ViewManager, shared by every binding.
 *
 *   bun run check:views
 *
 * A view is a name over one serialisable state object: whatever a list screen
 * needs to come back to ("My overdue invoices, this quarter, these columns"):
 * filters (a FilterBuilder value), sort, grouping, column order, widths and
 * visibility. This module does not know the state's shape. It answers the
 * questions every view picker has: has the screen drifted from the view
 * (key order is not a change), is this name usable, which view is the
 * default, and how does a view travel in a link.
 */
export interface SavedView<S = unknown> {
    id: string;
    name: string;
    state: S;
    /** Opens with the screen. At most one view is the default. */
    isDefault?: boolean;
    /** Seen by others (the app decides who). */
    shared?: boolean;
    /** Someone else's, or the app's own: can be used, not saved over, renamed or deleted. */
    readOnly?: boolean;
}
/** JSON with object keys sorted at every depth: equal states give equal strings. */
export declare function stableStringify(value: unknown): string;
/** Whether two states mean the same: deep, key order ignored, undefined keys ignored. */
export declare function sameViewState(a: unknown, b: unknown): boolean;
/** Whether the screen has drifted from a view (true when there is no view to compare with and a baseline is given that differs). */
export declare function isViewModified<S>(current: S, view: SavedView<S> | null | undefined, baseline?: S): boolean;
/**
 * Why a name cannot be used, or null if it can. Names are compared trimmed,
 * with runs of spaces as one and case ignored: "My view" and " my  VIEW " are
 * the same view to the person choosing between them.
 */
export declare function viewNameProblem(name: string, views: readonly SavedView[], exceptId?: string): string | null;
/** A free name based on `base`: "Overdue", else "Overdue (2)", "Overdue (3)"… */
export declare function freeViewName(base: string, views: readonly SavedView[]): string;
/** The view the screen opens with: the one marked default, else none. */
export declare function defaultView<S>(views: readonly SavedView<S>[]): SavedView<S> | null;
/** Make one view the default (or none, with null): every other view loses the mark. Returns new objects only where something changed. */
export declare function withDefault<S>(views: readonly SavedView<S>[], id: string | null): SavedView<S>[];
/** A view's name and state as one URL-safe string, for a share link (?view=…). UTF-8 throughout. */
export declare function encodeView(view: Pick<SavedView, "name" | "state">): string;
/**
 * Read a shared view back: its name and state, or null for anything that is
 * not one (a truncated link, a hand-edited one, another app's parameter).
 * Never throws. The state is the sender's: check it against today's fields
 * (loadFilter does, for a filter) before applying it.
 */
export declare function decodeView(text: string | null | undefined): {
    name: string;
    state: unknown;
} | null;

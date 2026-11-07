/**
 * Picking from a hierarchy: the pure half of TreeSelect, shared by every
 * binding.
 *
 *   bun run check:tree-select
 *
 * A chart of accounts, item groups, cost centres, warehouses: trees where the
 * same name can sit under different parents ("Cash" under two companies), and
 * where a search has to show a match in its place, under its ancestors.
 */
export interface TreeSelectNode {
    id: string;
    label: string;
    children?: TreeSelectNode[];
    disabled?: boolean;
}
/** A row as shown: the node, how deep it is, and its place among its siblings. */
export interface TreeRow {
    node: TreeSelectNode;
    level: number;
    parentId: string | null;
    hasChildren: boolean;
    expanded: boolean;
    posInSet: number;
    setSize: number;
}
/** The rows on screen: depth first, into expanded nodes only. */
export declare function visibleRows(items: TreeSelectNode[], expanded: ReadonlySet<string>, level?: number, parentId?: string | null): TreeRow[];
/** Labels from the root down to the node, or null when the id is not in the tree. */
export declare function pathTo(items: TreeSelectNode[], id: string): TreeSelectNode[] | null;
export declare function findNode(items: TreeSelectNode[], id: string): TreeSelectNode | null;
/** A node can be picked: not disabled, and a leaf when only leaves may be. */
export declare function isSelectable(node: TreeSelectNode, leavesOnly: boolean): boolean;
/**
 * The tree cut down to what matches a query, every match kept under its
 * ancestors, and the ancestors to open so each match shows. A node that
 * matches keeps all its children (you were looking for that group). An empty
 * query is the whole tree, nothing opened.
 */
export declare function filterTree(items: TreeSelectNode[], query: string): {
    items: TreeSelectNode[];
    expand: Set<string>;
    matches: Set<string>;
};
/**
 * Where a key moves the active row, from the row at `index`, or what it does
 * to the tree: as in a tree view. ↓ ↑ move; → opens a closed group or steps
 * into an open one; ← closes an open group or steps out to the parent.
 */
export type TreeMove = {
    kind: "move";
    index: number;
} | {
    kind: "expand";
    id: string;
} | {
    kind: "collapse";
    id: string;
} | null;
export declare function treeKeyTarget(key: string, rows: TreeRow[], index: number): TreeMove;

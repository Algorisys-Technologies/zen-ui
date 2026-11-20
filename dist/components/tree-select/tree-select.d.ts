import * as React from "react";
import { findNode, type TreeSelectNode } from "../../_core/tree-select";
export type { TreeSelectNode };
/**
 * TreeSelect — pick one node from a hierarchy: an account from the chart of
 * accounts, an item group, a cost centre, a warehouse.
 *
 *   <TreeSelect items={accounts} value={account} onValueChange={setAccount}
 *     placeholder="Account" leavesOnly showPath />
 *
 * A field you can type into: the list under it is the tree, cut down to what
 * matches, every match under its ancestors (opened), so "Cash" under two
 * parents reads as two different things. With `showPath` the closed field says
 * "Assets › Current Assets › Cash" for the same reason. `leavesOnly` lets only
 * the end nodes be picked; groups just open and close.
 *
 * Keys: ↓ opens it; ↑ ↓ move; → opens a group or steps into it, ← closes it or
 * steps out (when nothing is typed: with text, they are the text's); Enter
 * picks (or opens a group that cannot be picked); Esc closes. Focus stays in
 * the field; the active row is announced through aria-activedescendant. The
 * tree logic is @algorisys/zen-ui-core/tree-select (check:tree-select).
 */
export type TreeSelectProps = {
    items: TreeSelectNode[];
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (id: string, node: TreeSelectNode) => void;
    placeholder?: string;
    /** Only nodes without children can be picked; groups open and close. */
    leavesOnly?: boolean;
    /** The closed field shows the node's path from the root, not just its name. */
    showPath?: boolean;
    /** Between the path's names. Default " › ". */
    pathSeparator?: string;
    /** Groups open when the list first opens, besides the picked node's ancestors. */
    defaultExpanded?: string[];
    /** Shown when nothing matches what was typed. Default "No matches". */
    emptyMessage?: string;
    /** Marked aria-invalid, with the error border. */
    invalid?: boolean;
    disabled?: boolean;
    /** Width of the field. Default 100%. */
    width?: number | string;
    /** Lands on the input, so `<label htmlFor>` names it. */
    id?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    className?: string;
};
export declare const TreeSelect: React.ForwardRefExoticComponent<TreeSelectProps & React.RefAttributes<HTMLInputElement>>;
/** The node for an id, for showing a picked value elsewhere. */
export declare const findTreeSelectNode: typeof findNode;
//# sourceMappingURL=tree-select.d.ts.map
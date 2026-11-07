import * as React from "react";
import { type IconName } from "../icon/icon";
/**
 * Tree — hierarchical, expandable list.
 *
 * A genuine absence rather than merely a Fiori gap: zen-ui had no tree of any
 * kind (docs/fiori-gap-analysis.md, Tier 1).
 *
 * Data-driven (`items`) rather than compound, which is the one place this
 * library departs from its usual Radix-style composition — deliberately.
 * WAI-ARIA tree navigation is defined over the *flattened, visible* node list
 * (ArrowDown goes to the next visible row, which may be a nephew several levels
 * up), so the keyboard model needs the whole tree anyway. Compound children
 * would mean rebuilding that list from the DOM on every keystroke. DataTable
 * makes the same trade for the same reason.
 *
 *   <Tree items={nodes} defaultExpanded={["root"]} onSelectedChange={setSel} />
 *
 * Implements the ARIA tree pattern: roving tabindex (one tab stop), Arrow
 * up/down over visible rows, Right to expand-or-descend, Left to
 * collapse-or-ascend, Home/End, Enter/Space to select.
 */
export interface TreeNode {
    id: string;
    label: React.ReactNode;
    icon?: IconName;
    children?: TreeNode[];
    disabled?: boolean;
}
export interface TreeProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "onSelect"> {
    items: TreeNode[];
    /** Controlled expanded ids. */
    expanded?: string[];
    defaultExpanded?: string[];
    onExpandedChange?: (ids: string[]) => void;
    /** Controlled selected id. */
    selected?: string | null;
    defaultSelected?: string | null;
    onSelectedChange?: (id: string) => void;
    /** Accessible name — a tree must have one. */
    "aria-label"?: string;
}
export declare const Tree: React.ForwardRefExoticComponent<TreeProps & React.RefAttributes<HTMLUListElement>>;
//# sourceMappingURL=tree.d.ts.map
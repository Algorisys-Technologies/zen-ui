import { type JSX } from "solid-js";
import { type IconName } from "../icon/icon";
/**
 * Tree — Solid binding. Mirrors packages/react/src/components/tree/tree.tsx:
 * same props, same class strings, same ARIA. See that file for why this one is
 * data-driven rather than compound.
 */
export interface TreeNode {
    id: string;
    label: JSX.Element;
    icon?: IconName;
    children?: TreeNode[];
    disabled?: boolean;
}
export type TreeProps = Omit<JSX.HTMLAttributes<HTMLUListElement>, "onSelect"> & {
    items: TreeNode[];
    expanded?: string[];
    defaultExpanded?: string[];
    onExpandedChange?: (ids: string[]) => void;
    selected?: string | null;
    defaultSelected?: string | null;
    onSelectedChange?: (id: string) => void;
};
export declare const Tree: (props: TreeProps) => JSX.Element;
//# sourceMappingURL=tree.d.ts.map
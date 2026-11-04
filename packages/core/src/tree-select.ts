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
export function visibleRows(
  items: TreeSelectNode[],
  expanded: ReadonlySet<string>,
  level = 1,
  parentId: string | null = null,
): TreeRow[] {
  const out: TreeRow[] = [];
  items.forEach((node, i) => {
    const hasChildren = !!node.children?.length;
    const isOpen = hasChildren && expanded.has(node.id);
    out.push({ node, level, parentId, hasChildren, expanded: isOpen, posInSet: i + 1, setSize: items.length });
    if (isOpen) out.push(...visibleRows(node.children!, expanded, level + 1, node.id));
  });
  return out;
}

/** Labels from the root down to the node, or null when the id is not in the tree. */
export function pathTo(items: TreeSelectNode[], id: string): TreeSelectNode[] | null {
  for (const node of items) {
    if (node.id === id) return [node];
    if (node.children) {
      const below = pathTo(node.children, id);
      if (below) return [node, ...below];
    }
  }
  return null;
}

export function findNode(items: TreeSelectNode[], id: string): TreeSelectNode | null {
  const path = pathTo(items, id);
  return path ? path[path.length - 1] : null;
}

/** A node can be picked: not disabled, and a leaf when only leaves may be. */
export function isSelectable(node: TreeSelectNode, leavesOnly: boolean): boolean {
  return !node.disabled && !(leavesOnly && node.children?.length);
}

const fold = (s: string) => s.toLocaleLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

/**
 * The tree cut down to what matches a query, every match kept under its
 * ancestors, and the ancestors to open so each match shows. A node that
 * matches keeps all its children (you were looking for that group). An empty
 * query is the whole tree, nothing opened.
 */
export function filterTree(
  items: TreeSelectNode[],
  query: string,
): { items: TreeSelectNode[]; expand: Set<string>; matches: Set<string> } {
  const q = fold(query.trim());
  const expand = new Set<string>();
  const matches = new Set<string>();
  if (!q) return { items, expand, matches };
  const walk = (nodes: TreeSelectNode[]): TreeSelectNode[] => {
    const out: TreeSelectNode[] = [];
    for (const node of nodes) {
      const hit = fold(node.label).includes(q);
      if (hit) matches.add(node.id);
      const kids = node.children ? walk(node.children) : [];
      if (hit) {
        out.push(node);
        // Open it too when something below also matches, so that shows.
        if (kids.length) expand.add(node.id);
      } else if (kids.length) {
        expand.add(node.id);
        out.push({ ...node, children: kids });
      }
    }
    return out;
  };
  return { items: walk(items), expand, matches };
}

/**
 * Where a key moves the active row, from the row at `index`, or what it does
 * to the tree: as in a tree view. ↓ ↑ move; → opens a closed group or steps
 * into an open one; ← closes an open group or steps out to the parent.
 */
export type TreeMove =
  | { kind: "move"; index: number }
  | { kind: "expand"; id: string }
  | { kind: "collapse"; id: string }
  | null;

export function treeKeyTarget(key: string, rows: TreeRow[], index: number): TreeMove {
  if (rows.length === 0) return null;
  const at = Math.min(Math.max(index, 0), rows.length - 1);
  const row = rows[at];
  switch (key) {
    case "ArrowDown":
      return { kind: "move", index: Math.min(at + 1, rows.length - 1) };
    case "ArrowUp":
      return { kind: "move", index: Math.max(at - 1, 0) };
    case "ArrowRight":
      if (!row.hasChildren) return null;
      return row.expanded ? { kind: "move", index: at + 1 } : { kind: "expand", id: row.node.id };
    case "ArrowLeft": {
      if (row.hasChildren && row.expanded) return { kind: "collapse", id: row.node.id };
      if (row.parentId === null) return null;
      const parent = rows.findIndex((r) => r.node.id === row.parentId);
      return parent >= 0 ? { kind: "move", index: parent } : null;
    }
    default:
      return null;
  }
}

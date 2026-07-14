import * as React from "react";
import { cn } from "../../lib/cn";
import { Icon, type IconName } from "../icon/icon";

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

/** One visible row: the node plus where it sits. */
type FlatNode = {
  node: TreeNode;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  /** 1-based index among its siblings, and how many siblings there are. */
  posInSet: number;
  setSize: number;
};

/**
 * Depth-first walk of what is currently on screen — the ARIA nav order.
 *
 * The DOM is flat (no nested role="group"), which ARIA permits, but only if
 * each item carries aria-level AND aria-posinset/aria-setsize: with no nesting
 * to infer from, those are the only way assistive tech can say "3 of 5". They
 * are computed here rather than at render, where the sibling count is no longer
 * in scope.
 */
function flatten(items: TreeNode[], expandedSet: Set<string>, level = 1, parentId: string | null = null): FlatNode[] {
  const out: FlatNode[] = [];
  items.forEach((node, i) => {
    const hasChildren = !!node.children?.length;
    out.push({ node, level, parentId, hasChildren, posInSet: i + 1, setSize: items.length });
    if (hasChildren && expandedSet.has(node.id)) {
      out.push(...flatten(node.children!, expandedSet, level + 1, node.id));
    }
  });
  return out;
}

export const Tree = React.forwardRef<HTMLUListElement, TreeProps>(
  (
    { items, expanded, defaultExpanded = [], onExpandedChange, selected, defaultSelected = null, onSelectedChange, className, ...props },
    ref,
  ) => {
    const [internalExpanded, setInternalExpanded] = React.useState<string[]>(defaultExpanded);
    const [internalSelected, setInternalSelected] = React.useState<string | null>(defaultSelected);
    const expandedIds = expanded ?? internalExpanded;
    const selectedId = selected !== undefined ? selected : internalSelected;

    const expandedSet = React.useMemo(() => new Set(expandedIds), [expandedIds]);
    const rows = React.useMemo(() => flatten(items, expandedSet), [items, expandedSet]);

    // Roving tabindex: exactly one row is tabbable. Falls back to the first row
    // when nothing is focused yet, so Tab always lands somewhere sensible.
    const [focusedId, setFocusedId] = React.useState<string | null>(null);
    const activeId = focusedId ?? selectedId ?? rows[0]?.node.id ?? null;
    const rowRefs = React.useRef(new Map<string, HTMLDivElement>());

    const setExpandedIds = (next: string[]) => {
      if (expanded === undefined) setInternalExpanded(next);
      onExpandedChange?.(next);
    };
    const toggle = (id: string, open?: boolean) => {
      const isOpen = expandedSet.has(id);
      const want = open ?? !isOpen;
      if (want === isOpen) return;
      setExpandedIds(want ? [...expandedIds, id] : expandedIds.filter((x) => x !== id));
    };
    const select = (id: string) => {
      if (selected === undefined) setInternalSelected(id);
      onSelectedChange?.(id);
    };
    const focus = (id: string) => {
      setFocusedId(id);
      rowRefs.current.get(id)?.focus();
    };

    const onKeyDown = (e: React.KeyboardEvent, row: FlatNode) => {
      const i = rows.findIndex((r) => r.node.id === row.node.id);
      const key = e.key;
      if (key === "ArrowDown") {
        e.preventDefault();
        if (rows[i + 1]) focus(rows[i + 1].node.id);
      } else if (key === "ArrowUp") {
        e.preventDefault();
        if (rows[i - 1]) focus(rows[i - 1].node.id);
      } else if (key === "ArrowRight") {
        e.preventDefault();
        // Closed -> open; already open -> step into the first child.
        if (row.hasChildren && !expandedSet.has(row.node.id)) toggle(row.node.id, true);
        else if (row.hasChildren && rows[i + 1]) focus(rows[i + 1].node.id);
      } else if (key === "ArrowLeft") {
        e.preventDefault();
        // Open -> close; already closed -> step out to the parent.
        if (row.hasChildren && expandedSet.has(row.node.id)) toggle(row.node.id, false);
        else if (row.parentId) focus(row.parentId);
      } else if (key === "Home") {
        e.preventDefault();
        if (rows[0]) focus(rows[0].node.id);
      } else if (key === "End") {
        e.preventDefault();
        if (rows.at(-1)) focus(rows.at(-1)!.node.id);
      } else if (key === "Enter" || key === " ") {
        e.preventDefault();
        if (!row.node.disabled) select(row.node.id);
      }
    };

    return (
      <ul
        ref={ref}
        role="tree"
        className={cn("zen-m-0 zen-list-none zen-p-0 zen-text-sm", className)}
        {...props}
      >
        {rows.map((row) => {
          const isExpanded = expandedSet.has(row.node.id);
          const isSelected = selectedId === row.node.id;
          return (
            <li
              key={row.node.id}
              role="treeitem"
              aria-expanded={row.hasChildren ? isExpanded : undefined}
              aria-selected={isSelected}
              aria-level={row.level}
              aria-posinset={row.posInSet}
              aria-setsize={row.setSize}
              aria-disabled={row.node.disabled || undefined}
              className="zen-m-0"
            >
              <div
                ref={(el) => {
                  if (el) rowRefs.current.set(row.node.id, el);
                  else rowRefs.current.delete(row.node.id);
                }}
                tabIndex={activeId === row.node.id ? 0 : -1}
                onKeyDown={(e) => onKeyDown(e, row)}
                onFocus={() => setFocusedId(row.node.id)}
                onClick={() => {
                  if (row.node.disabled) return;
                  if (row.hasChildren) toggle(row.node.id);
                  select(row.node.id);
                }}
                // Indent by level. An inline style, not a utility: the depth is
                // unbounded, so no finite class set can express it.
                style={{ paddingLeft: `calc(${row.level - 1} * 1rem + 0.25rem)` }}
                className={cn(
                  "zen-flex zen-cursor-pointer zen-items-center zen-gap-1.5 zen-rounded-zen-sm zen-py-1 zen-pr-2",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  "hover:zen-bg-zen-muted",
                  isSelected && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-font-medium",
                  row.node.disabled && "zen-cursor-not-allowed zen-opacity-50",
                )}
              >
                {row.hasChildren ? (
                  <Icon
                    name={isExpanded ? "chevron-down" : "chevron-right"}
                    size={14}
                    className="zen-shrink-0 zen-text-zen-muted-fg"
                  />
                ) : (
                  // Keep leaves aligned with their expandable siblings.
                  <span className="zen-inline-block zen-w-3.5 zen-shrink-0" />
                )}
                {row.node.icon ? (
                  <Icon name={row.node.icon} size={14} className="zen-shrink-0 zen-text-zen-muted-fg" />
                ) : null}
                <span className="zen-truncate">{row.node.label}</span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  },
);
Tree.displayName = "Tree";

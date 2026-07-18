import { type JSX, For, Show, createMemo, createSignal, splitProps } from "solid-js";
import { cn } from "../../lib/cn";
import { Icon, type IconName } from "../icon/icon";

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

type FlatNode = {
  node: TreeNode;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  posInSet: number;
  setSize: number;
};

/**
 * Depth-first walk of what is currently on screen. The DOM is flat (no nested
 * role="group"), which ARIA permits only if each item carries aria-level AND
 * aria-posinset/aria-setsize — with no nesting to infer from, those are the only
 * way assistive tech can say "3 of 5".
 */
function flatten(
  items: TreeNode[],
  expandedSet: Set<string>,
  level = 1,
  parentId: string | null = null,
): FlatNode[] {
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

export const Tree = (props: TreeProps) => {
  const [local, rest] = splitProps(props, [
    "items",
    "expanded",
    "defaultExpanded",
    "onExpandedChange",
    "selected",
    "defaultSelected",
    "onSelectedChange",
    "class",
  ]);

  const [internalExpanded, setInternalExpanded] = createSignal<string[]>(local.defaultExpanded ?? []);
  const [internalSelected, setInternalSelected] = createSignal<string | null>(local.defaultSelected ?? null);
  const expandedIds = () => local.expanded ?? internalExpanded();
  const selectedId = () => (local.selected !== undefined ? local.selected : internalSelected());

  const expandedSet = createMemo(() => new Set(expandedIds()));
  const rows = createMemo(() => flatten(local.items, expandedSet()));

  const [focusedId, setFocusedId] = createSignal<string | null>(null);
  const activeId = () => focusedId() ?? selectedId() ?? rows()[0]?.node.id ?? null;
  const rowRefs = new Map<string, HTMLDivElement>();

  const setExpandedIds = (next: string[]) => {
    if (local.expanded === undefined) setInternalExpanded(next);
    local.onExpandedChange?.(next);
  };
  const toggle = (id: string, open?: boolean) => {
    const isOpen = expandedSet().has(id);
    const want = open ?? !isOpen;
    if (want === isOpen) return;
    setExpandedIds(want ? [...expandedIds(), id] : expandedIds().filter((x) => x !== id));
  };
  const select = (id: string) => {
    if (local.selected === undefined) setInternalSelected(id);
    local.onSelectedChange?.(id);
  };
  const focus = (id: string) => {
    setFocusedId(id);
    rowRefs.get(id)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent, row: FlatNode) => {
    const list = rows();
    const i = list.findIndex((r) => r.node.id === row.node.id);
    const key = e.key;
    if (key === "ArrowDown") {
      e.preventDefault();
      if (list[i + 1]) focus(list[i + 1].node.id);
    } else if (key === "ArrowUp") {
      e.preventDefault();
      if (list[i - 1]) focus(list[i - 1].node.id);
    } else if (key === "ArrowRight") {
      e.preventDefault();
      if (row.hasChildren && !expandedSet().has(row.node.id)) toggle(row.node.id, true);
      else if (row.hasChildren && list[i + 1]) focus(list[i + 1].node.id);
    } else if (key === "ArrowLeft") {
      e.preventDefault();
      if (row.hasChildren && expandedSet().has(row.node.id)) toggle(row.node.id, false);
      else if (row.parentId) focus(row.parentId);
    } else if (key === "Home") {
      e.preventDefault();
      if (list[0]) focus(list[0].node.id);
    } else if (key === "End") {
      e.preventDefault();
      if (list.at(-1)) focus(list.at(-1)!.node.id);
    } else if (key === "Enter" || key === " ") {
      e.preventDefault();
      if (!row.node.disabled) select(row.node.id);
    }
  };

  return (
    <ul role="tree" class={cn("zen-m-0 zen-list-none zen-p-0 zen-text-sm", local.class)} {...rest}>
      <For each={rows()}>
        {(row) => {
          const isExpanded = () => expandedSet().has(row.node.id);
          const isSelected = () => selectedId() === row.node.id;
          return (
            <li
              role="treeitem"
              aria-expanded={row.hasChildren ? isExpanded() : undefined}
              aria-selected={isSelected()}
              aria-level={row.level}
              aria-posinset={row.posInSet}
              aria-setsize={row.setSize}
              aria-disabled={row.node.disabled || undefined}
              class="zen-m-0"
            >
              <div
                ref={(el) => rowRefs.set(row.node.id, el)}
                tabIndex={activeId() === row.node.id ? 0 : -1}
                onKeyDown={(e) => onKeyDown(e, row)}
                onFocus={() => setFocusedId(row.node.id)}
                onClick={() => {
                  if (row.node.disabled) return;
                  if (row.hasChildren) toggle(row.node.id);
                  select(row.node.id);
                }}
                // Indent by level. Inline, not a utility: depth is unbounded, so
                // no finite class set can express it.
                style={{ "padding-left": `calc(${row.level - 1} * 1rem + 0.25rem)` }}
                class={cn(
                  "zen-flex zen-cursor-pointer zen-items-center zen-gap-1.5 zen-rounded-zen-sm zen-py-1 zen-pr-2",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  "hover:zen-bg-zen-muted",
                  isSelected() && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-font-medium",
                  row.node.disabled && "zen-cursor-not-allowed zen-opacity-50",
                )}
              >
                <Show
                  when={row.hasChildren}
                  fallback={<span class="zen-inline-block zen-w-3.5 zen-shrink-0" />}
                >
                  <Icon
                    name={isExpanded() ? "chevron-down" : "chevron-right"}
                    size={14}
                    class="zen-shrink-0 zen-text-zen-muted-fg"
                  />
                </Show>
                <Show when={row.node.icon}>
                  {(icon) => <Icon name={icon()} size={14} class="zen-shrink-0 zen-text-zen-muted-fg" />}
                </Show>
                <span class="zen-truncate">{row.node.label}</span>
              </div>
            </li>
          );
        }}
      </For>
    </ul>
  );
};

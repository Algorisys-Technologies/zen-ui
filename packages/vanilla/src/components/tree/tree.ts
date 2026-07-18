import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { Icon, type IconName } from "../icon/icon";

/**
 * Tree — the vanilla port of the React reference.
 *
 *   const tree = Tree({
 *     items: nodes,
 *     defaultExpanded: ["src"],
 *     onSelectedChange: (id) => console.log(id),
 *   });
 *
 * Data-driven (`items`) rather than compound, which is the one place this library
 * departs from its usual composition — deliberately, and identically to React.
 * WAI-ARIA tree navigation is defined over the *flattened, visible* node list
 * (ArrowDown goes to the next visible row, which may be a nephew several levels
 * up), so the keyboard model needs the whole tree anyway. Compound children would
 * mean rebuilding that list from the DOM on every keystroke.
 *
 * Implements the ARIA tree pattern: roving tabindex (one tab stop), Arrow
 * up/down over visible rows, Right to expand-or-descend, Left to
 * collapse-or-ascend, Home/End, Enter/Space to select.
 */

export interface TreeNode {
  id: string;
  label: Child;
  icon?: IconName;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeProps extends BaseProps {
  items: TreeNode[];
  /** Controlled expanded ids. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** Controlled selected id. */
  selected?: string | null;
  defaultSelected?: string | null;
  onSelectedChange?: (id: string) => void;
}

/** One visible row: the node plus where it sits. */
interface FlatNode {
  node: TreeNode;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  /** 1-based index among its siblings, and how many siblings there are. */
  posInSet: number;
  setSize: number;
}

/**
 * Depth-first walk of what is currently on screen — the ARIA nav order.
 *
 * The DOM is flat (no nested role="group"), which ARIA permits, but only if each
 * item carries aria-level AND aria-posinset/aria-setsize: with no nesting to infer
 * from, those are the only way assistive tech can say "3 of 5".
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

const arrEquals = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

export function Tree(props: TreeProps): ZenComponent<TreeProps> {
  let current: TreeProps = { ...props };
  const el = document.createElement("ul");
  el.setAttribute("role", "tree");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const expandedState = controllable<string[]>({
    value: current.expanded,
    defaultValue: current.defaultExpanded ?? [],
    onChange: (ids) => current.onExpandedChange?.(ids),
    equals: arrEquals,
  });

  const selectedState = controllable<string | null>({
    value: current.selected,
    defaultValue: current.defaultSelected ?? null,
    onChange: (id) => {
      if (id != null) current.onSelectedChange?.(id);
    },
  });

  // Roving tabindex: exactly one row is tabbable. Falls back to the first row
  // when nothing is focused yet, so Tab always lands somewhere sensible.
  let focusedId: string | null = null;

  /** Live for the current visible set — rebuilt on every expand. */
  let rows: FlatNode[] = [];
  const rowDivs = new Map<string, HTMLDivElement>();

  const expandedSet = () => new Set(expandedState.get());

  const activeId = (): string | null =>
    focusedId ?? selectedState.get() ?? rows[0]?.node.id ?? null;

  const toggle = (id: string, open?: boolean) => {
    const set = expandedSet();
    const isOpen = set.has(id);
    const want = open ?? !isOpen;
    if (want === isOpen) return;
    const ids = expandedState.get();
    expandedState.set(want ? [...ids, id] : ids.filter((x) => x !== id));
  };

  const select = (id: string) => selectedState.set(id);

  /** Move roving focus to a row without changing the visible set. */
  const focusRow = (id: string) => {
    focusedId = id;
    paintActive();
    rowDivs.get(id)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent, row: FlatNode) => {
    const i = rows.findIndex((r) => r.node.id === row.node.id);
    const set = expandedSet();
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (rows[i + 1]) focusRow(rows[i + 1].node.id);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (rows[i - 1]) focusRow(rows[i - 1].node.id);
        break;
      case "ArrowRight":
        e.preventDefault();
        // Closed -> open; already open -> step into the first child.
        if (row.hasChildren && !set.has(row.node.id)) toggle(row.node.id, true);
        else if (row.hasChildren && rows[i + 1]) focusRow(rows[i + 1].node.id);
        break;
      case "ArrowLeft":
        e.preventDefault();
        // Open -> close; already closed -> step out to the parent.
        if (row.hasChildren && set.has(row.node.id)) toggle(row.node.id, false);
        else if (row.parentId) focusRow(row.parentId);
        break;
      case "Home":
        e.preventDefault();
        if (rows[0]) focusRow(rows[0].node.id);
        break;
      case "End":
        e.preventDefault();
        if (rows.at(-1)) focusRow(rows.at(-1)!.node.id);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!row.node.disabled) select(row.node.id);
        break;
    }
  };

  /** Roving tabindex + selection styling on the live rows — no rebuild. */
  function paintActive() {
    const active = activeId();
    const selectedId = selectedState.get();
    for (const row of rows) {
      const div = rowDivs.get(row.node.id);
      if (!div) continue;
      const isSelected = selectedId === row.node.id;
      div.tabIndex = active === row.node.id ? 0 : -1;
      const li = div.parentElement;
      if (li) li.setAttribute("aria-selected", String(isSelected));
      div.classList.toggle("zen-bg-zen-primary-soft", isSelected);
      div.classList.toggle("zen-text-zen-primary-soft-fg", isSelected);
      div.classList.toggle("zen-font-medium", isSelected);
    }
  }

  const buildRow = (row: FlatNode): HTMLLIElement => {
    const isExpanded = expandedSet().has(row.node.id);
    const isSelected = selectedState.get() === row.node.id;

    const li = document.createElement("li");
    li.setAttribute("role", "treeitem");
    if (row.hasChildren) li.setAttribute("aria-expanded", String(isExpanded));
    li.setAttribute("aria-selected", String(isSelected));
    li.setAttribute("aria-level", String(row.level));
    li.setAttribute("aria-posinset", String(row.posInSet));
    li.setAttribute("aria-setsize", String(row.setSize));
    if (row.node.disabled) li.setAttribute("aria-disabled", "true");
    li.className = "zen-m-0";

    const div = document.createElement("div");
    div.tabIndex = activeId() === row.node.id ? 0 : -1;
    // Indent by level. An inline style, not a utility: the depth is unbounded, so
    // no finite class set can express it.
    div.style.paddingLeft = `calc(${row.level - 1} * 1rem + 0.25rem)`;
    div.className = cn(
      "zen-flex zen-cursor-pointer zen-items-center zen-gap-1.5 zen-rounded-zen-sm zen-py-1 zen-pr-2",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "hover:zen-bg-zen-muted",
      isSelected && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-font-medium",
      row.node.disabled && "zen-cursor-not-allowed zen-opacity-50",
    );

    div.addEventListener("keydown", (e) => onKeyDown(e, row));
    div.addEventListener("focus", () => {
      focusedId = row.node.id;
      paintActive();
    });
    div.addEventListener("click", () => {
      if (row.node.disabled) return;
      if (row.hasChildren) toggle(row.node.id);
      select(row.node.id);
    });

    if (row.hasChildren) {
      div.append(
        Icon({
          name: isExpanded ? "chevron-down" : "chevron-right",
          size: 14,
          class: "zen-shrink-0 zen-text-zen-muted-fg",
        }).el,
      );
    } else {
      // Keep leaves aligned with their expandable siblings.
      const spacer = document.createElement("span");
      spacer.className = "zen-inline-block zen-w-3.5 zen-shrink-0";
      div.append(spacer);
    }

    if (row.node.icon) {
      div.append(
        Icon({ name: row.node.icon, size: 14, class: "zen-shrink-0 zen-text-zen-muted-fg" }).el,
      );
    }

    const label = document.createElement("span");
    label.className = "zen-truncate";
    label.append(...toNodes(row.node.label));
    div.append(label);

    li.append(div);
    rowDivs.set(row.node.id, div);
    return li;
  };

  /**
   * Rebuild the visible list. Runs on mount, on every expand/collapse (the set of
   * visible rows changes), and on structural update(). `refocus` restores keyboard
   * focus onto the active row after a keyboard-driven expand replaced its element;
   * it stays false for programmatic updates so the tree never steals focus.
   */
  const rebuild = (refocus: boolean) => {
    rows = flatten(current.items, expandedSet());
    rowDivs.clear();
    el.replaceChildren(...rows.map(buildRow));
    if (refocus && focusedId && rowDivs.has(focusedId)) rowDivs.get(focusedId)!.focus();
  };

  const applyRest = () => {
    const {
      items: _i,
      expanded: _e,
      defaultExpanded: _de,
      onExpandedChange: _oe,
      selected: _s,
      defaultSelected: _ds,
      onSelectedChange: _os,
      class: className,
      children: _ch,
      ...rest
    } = current;
    el.className = cn("zen-m-0 zen-list-none zen-p-0 zen-text-sm", className);
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  applyRest();
  rebuild(false);

  // Expansion changes the visible set -> rebuild, restoring focus (a keyboard
  // expand is the only thing that reaches here with focus in the tree).
  disposer.add(expandedState.subscribe(() => rebuild(true)));
  // Selection is a styling change only -> repaint in place, keeping focus.
  disposer.add(selectedState.subscribe(paintActive));
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      const structural = next.items !== undefined;
      const restChanged =
        next.class !== undefined ||
        Object.keys(next).some((k) => k.startsWith("aria-") || k.startsWith("data-") || k === "style" || k === "id");
      current = { ...current, ...next };
      if (next.expanded !== undefined) expandedState.sync(next.expanded);
      if (next.selected !== undefined) selectedState.sync(next.selected);
      if (restChanged) applyRest();
      if (structural) rebuild(false);
      else paintActive();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

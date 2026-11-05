import {
  filterTree,
  isSelectable,
  pathTo,
  treeKeyTarget,
  visibleRows,
  type TreeRow,
  type TreeSelectNode,
} from "@algorisys/zen-ui-core/tree-select";
import { cn } from "../../lib/cn";
import { Disposer, type ZenComponent } from "../../lib/component";
import { anchorPopup, type AnchoredPopup } from "../../lib/anchored";
import { Icon } from "../icon/icon";
import { useLocale } from "../locale/locale";

export type { TreeSelectNode };

/**
 * TreeSelect — pick one node from a hierarchy: an account from the chart of
 * accounts, an item group, a cost centre, a warehouse.
 *
 *   const account = TreeSelect({
 *     items: accounts, value: "hdfc", placeholder: "Account", leavesOnly: true, showPath: true,
 *     onValueChange: (id) => account.update({ value: id }),
 *   });
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
 * tree logic is @algorisys/zen-ui-core/tree-select (check:tree-select), and the
 * list is portalled and placed by lib/anchored, as React's and Solid's are.
 *
 * Controlled when `value` is given (an `update({ value })` moves it; null is
 * "nothing picked"), uncontrolled from `defaultValue` otherwise.
 */
export interface TreeSelectProps {
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
  /** Lands on the input, so `<label for>` names it. */
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  class?: string;
}

/** The rows on screen for a query and a set of opened groups. */
function rowsFor(items: TreeSelectNode[], query: string, expanded: Set<string>) {
  const f = filterTree(items, query);
  return { filtered: f, rows: visibleRows(f.items, new Set([...expanded, ...f.expand])) };
}

let uid = 0;

export function TreeSelect(props: TreeSelectProps): ZenComponent<TreeSelectProps> {
  let current: TreeSelectProps = { ...props };
  // The provider building this field; its words are used every time it opens.
  const loc = useLocale();
  const listId = `zen-tree-select-${++uid}`;
  const rowId = (nodeId: string) => `${listId}-${nodeId}`;
  const disposer = new Disposer();

  // The initial value seeds it; the user owns it after (uncontrolled).
  let internal: string | null = current.defaultValue ?? null;
  const value = () => (current.value !== undefined ? current.value : internal);
  let open = false;
  let query = "";
  // The initial set seeds it; the user owns it after.
  let expanded = new Set(current.defaultExpanded ?? []);
  let active = 0;
  let rows: TreeRow[] = [];
  let placed: AnchoredPopup | undefined;
  let placedHeight = "";
  const session = new Disposer();

  /* ------------------------------- the field ------------------------------ */

  const el = document.createElement("div");
  const box = document.createElement("div");
  const input = document.createElement("input");
  input.type = "text";
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-haspopup", "tree");
  input.setAttribute("aria-autocomplete", "list");
  input.autocomplete = "off";
  input.spellcheck = false;
  input.className =
    "zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-sm zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg";

  const chevron = document.createElement("button");
  chevron.type = "button";
  chevron.tabIndex = -1;
  chevron.className =
    "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0 zen-text-zen-muted-fg";
  box.append(input, chevron);
  el.append(box);

  /* ------------------------------- the list ------------------------------- */

  const list = document.createElement("div");
  list.id = listId;
  list.setAttribute("role", "tree");
  list.className =
    "zen-z-50 zen-overflow-y-auto zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-1 zen-shadow-md";
  // Presses in the list must not take focus from the field.
  const keepFocus = (e: Event) => e.preventDefault();
  list.addEventListener("mousedown", keepFocus);
  chevron.addEventListener("mousedown", keepFocus);
  disposer.add(() => list.removeEventListener("mousedown", keepFocus));
  disposer.add(() => chevron.removeEventListener("mousedown", keepFocus));

  const selectedPath = (): TreeSelectNode[] => {
    const v = value();
    return v ? (pathTo(current.items, v) ?? []) : [];
  };
  const display = () => {
    const p = selectedPath();
    if (!p.length) return "";
    return current.showPath ? p.map((n) => n.label).join(current.pathSeparator ?? " › ") : p[p.length - 1].label;
  };

  const highlight = (label: string): Node[] => {
    const q = query.trim();
    const i = q ? label.toLocaleLowerCase().indexOf(q.toLocaleLowerCase()) : -1;
    if (i < 0) return [document.createTextNode(label)];
    const mark = document.createElement("mark");
    mark.className = "zen-bg-transparent zen-font-semibold zen-text-inherit";
    mark.textContent = label.slice(i, i + q.length);
    return [document.createTextNode(label.slice(0, i)), mark, document.createTextNode(label.slice(i + q.length))];
  };

  const rowClass = (row: TreeRow, i: number) => {
    const selectable = isSelectable(row.node, current.leavesOnly ?? false);
    return cn(
      "zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-1 zen-rounded-zen-sm zen-py-zen-menu-y zen-pe-2 zen-text-sm",
      i === active && "zen-bg-zen-muted",
      value() === row.node.id && "zen-font-medium zen-text-zen-primary",
      !selectable && !row.hasChildren && "zen-opacity-50",
      !selectable && row.hasChildren && "zen-text-zen-muted-fg",
    );
  };

  /** Only a key moves the list to its active row, in the list's own scroller. */
  const scrollToActive = () => {
    const row = list.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!row) return;
    const top = row.offsetTop;
    const bottom = top + row.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  };

  /** The active row's look and the field's aria-activedescendant. No scrolling. */
  const paintActive = () => {
    list.querySelectorAll<HTMLElement>("[role=treeitem]").forEach((r) => {
      const i = Number(r.dataset.index);
      r.className = rowClass(rows[i], i);
    });
    const row = rows[active];
    if (open && row) input.setAttribute("aria-activedescendant", rowId(row.node.id));
    else input.removeAttribute("aria-activedescendant");
  };

  const setActive = (i: number, scroll: boolean) => {
    active = i;
    paintActive();
    if (scroll) scrollToActive();
  };

  const renderList = () => {
    const leavesOnly = current.leavesOnly ?? false;
    rows = rowsFor(current.items, query, expanded).rows;
    // The active row stays in range as the list changes under it.
    if (active > rows.length - 1) active = Math.max(0, rows.length - 1);
    const name = current["aria-label"] ?? current.placeholder;
    if (name) list.setAttribute("aria-label", name);
    else list.removeAttribute("aria-label");
    if (rows.length === 0) {
      const empty = document.createElement("div");
      empty.className = "zen-px-2 zen-py-1.5 zen-text-sm zen-text-zen-muted-fg";
      empty.textContent = current.emptyMessage ?? loc.t("treeSelect.noMatches");
      list.replaceChildren(empty);
      paintActive();
      return;
    }
    const picked = value();
    list.replaceChildren(
      ...rows.map((row, i) => {
        const r = document.createElement("div");
        r.id = rowId(row.node.id);
        r.setAttribute("role", "treeitem");
        r.dataset.index = String(i);
        r.setAttribute("aria-level", String(row.level));
        r.setAttribute("aria-posinset", String(row.posInSet));
        r.setAttribute("aria-setsize", String(row.setSize));
        if (row.hasChildren) r.setAttribute("aria-expanded", String(row.expanded));
        r.setAttribute("aria-selected", String(picked === row.node.id));
        // Disabled means not operable: a group that only opens (leavesOnly) is
        // operable, so it is not marked, only a disabled node is.
        if (row.node.disabled) r.setAttribute("aria-disabled", "true");
        r.className = rowClass(row, i);
        r.style.paddingInlineStart = `calc(${row.level - 1} * var(--zen-space-4) + var(--zen-space-1))`;

        const toggleSpan = document.createElement("span");
        toggleSpan.setAttribute("aria-hidden", "true");
        toggleSpan.className = "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center";
        if (row.hasChildren) {
          toggleSpan.append(Icon({ name: row.expanded ? "chevron-down" : "chevron-right", size: 14 }).el);
          toggleSpan.addEventListener("click", (e) => {
            e.stopPropagation();
            toggle(row.node.id);
          });
        }
        const label = document.createElement("span");
        label.className = "zen-min-w-0 zen-flex-1 zen-truncate";
        label.append(...highlight(row.node.label));
        r.append(toggleSpan, label);
        if (picked === row.node.id) r.append(Icon({ name: "check", size: 14 }).el);

        // Hover makes the row active and never scrolls: scrolling would slide
        // the list under the pointer, onto the next row, and scroll again.
        r.addEventListener("mousemove", () => {
          if (active !== i) setActive(i, false);
        });
        r.addEventListener("click", () => {
          if (isSelectable(row.node, leavesOnly)) pick(row.node);
          else if (row.hasChildren) toggle(row.node.id);
        });
        return r;
      }),
    );
    paintActive();
  };

  /* ---------------------------- open, pick, close -------------------------- */

  const paintField = () => {
    const shown = display();
    // Open: what is typed (the picked value is the placeholder, so it stays in
    // sight). Closed: the picked value.
    if (input.value !== (open ? query : shown)) input.value = open ? query : shown;
    const ph = open ? shown || current.placeholder : current.placeholder;
    if (ph) input.placeholder = ph;
    else input.removeAttribute("placeholder");
    input.setAttribute("aria-expanded", String(open));
    if (open) input.setAttribute("aria-controls", listId);
    else input.removeAttribute("aria-controls");
    const label = loc.t(open ? "common.close" : "common.open");
    chevron.setAttribute("aria-label", label);
    chevron.replaceChildren(Icon({ name: open ? "chevron-up" : "chevron-down", size: 16 }).el);
  };

  const onOutside = (e: PointerEvent) => {
    const t = e.target as Node;
    if (!el.contains(t) && !list.contains(t)) close();
  };

  /** Open, and show what is there: the list placed, then scrolled to the active row. */
  const show = () => {
    open = true;
    paintField();
    renderList();
    placedHeight = "";
    placed = anchorPopup({
      anchor: el,
      popup: list,
      maxHeight: 288,
      matchWidth: true,
      // The list is only a scroller once placement caps its height, so a list
      // opening on a row far down is scrolled there again after the cap (the
      // React port's first version scrolled before it, and opened at the top).
      // Only when the cap changes: on every scroll it would pull a list the
      // user is wheeling through back to the active row.
      onPlace: ({ maxHeight }) => {
        const h = String(maxHeight);
        if (h === placedHeight) return;
        placedHeight = h;
        scrollToActive();
      },
    });
    scrollToActive();
    document.addEventListener("pointerdown", onOutside, true);
    session.add(() => document.removeEventListener("pointerdown", onOutside, true));
  };

  const openList = () => {
    if (current.disabled || open) return;
    // Open on the picked node: its ancestors opened, it active.
    const path = selectedPath();
    if (path.length > 1) expanded = new Set([...expanded, ...path.slice(0, -1).map((n) => n.id)]);
    query = "";
    const at = rowsFor(current.items, "", expanded).rows.findIndex((r) => r.node.id === value());
    active = at >= 0 ? at : 0;
    show();
  };

  function close() {
    if (!open) return;
    open = false;
    query = "";
    session.dispose();
    placed?.destroy();
    placed = undefined;
    paintField();
    paintActive();
  }

  function pick(node: TreeSelectNode) {
    if (!isSelectable(node, current.leavesOnly ?? false)) return;
    if (current.value === undefined) internal = node.id;
    current.onValueChange?.(node.id, node);
    close();
  }

  function toggle(nodeId: string) {
    const next = new Set(expanded);
    if (next.has(nodeId)) next.delete(nodeId);
    else next.add(nodeId);
    expanded = next;
    renderList();
  }

  /* -------------------------------- events -------------------------------- */

  const onInput = () => {
    query = input.value;
    const leavesOnly = current.leavesOnly ?? false;
    // The first match that can be picked is active, not its ancestor group at
    // the top, so Enter picks what was searched for.
    const next = rowsFor(current.items, query, expanded);
    const at = next.rows.findIndex((r) => next.filtered.matches.has(r.node.id) && isSelectable(r.node, leavesOnly));
    active = at >= 0 ? at : 0;
    if (!open) {
      show();
      return;
    }
    paintField();
    renderList();
    scrollToActive();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (current.disabled) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || (e.key === "Enter" && !e.isComposing)) {
        e.preventDefault();
        openList();
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Typing into the closed field starts a search: it opens empty, and the
        // key lands in it, rather than appending to the picked value's text.
        openList();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "Tab") {
      close();
      return;
    }
    const row = rows[active];
    if (e.key === "Enter") {
      e.preventDefault();
      if (!row) return;
      if (isSelectable(row.node, current.leavesOnly ?? false)) pick(row.node);
      else if (row.hasChildren) toggle(row.node.id);
      return;
    }
    // ← → are the text's while there is text to move through.
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && query) return;
    const move = treeKeyTarget(e.key, rows, active);
    if (!move) return;
    e.preventDefault();
    if (move.kind === "move") setActive(move.index, true);
    else toggle(move.id);
  };

  const onClick = () => openList();
  const onChevron = () => {
    if (open) close();
    else {
      openList();
      input.focus();
    }
  };

  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKeyDown);
  input.addEventListener("click", onClick);
  chevron.addEventListener("click", onChevron);
  disposer.add(() => input.removeEventListener("input", onInput));
  disposer.add(() => input.removeEventListener("keydown", onKeyDown));
  disposer.add(() => input.removeEventListener("click", onClick));
  disposer.add(() => chevron.removeEventListener("click", onChevron));
  disposer.add(() => {
    session.dispose();
    placed?.destroy();
  });

  /* -------------------------------- render -------------------------------- */

  const render = () => {
    const { width, invalid, disabled } = current;
    el.className = cn("zen-relative", current.class);
    el.style.width = typeof width === "number" ? `${width}px` : (width ?? "100%");
    box.className = cn(
      "zen-flex zen-h-zen-control zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-px-zen-control-x",
      "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
      invalid && "zen-border-zen-error",
      disabled && "zen-cursor-not-allowed zen-opacity-50",
    );
    input.id = current.id ?? `${listId}-input`;
    const attr = (name: string, v: string | undefined) => (v ? input.setAttribute(name, v) : input.removeAttribute(name));
    attr("aria-invalid", invalid ? "true" : undefined);
    attr("aria-label", current["aria-label"]);
    attr("aria-labelledby", current["aria-labelledby"]);
    input.disabled = !!disabled;
    chevron.disabled = !!disabled;
    if (disabled) close();
    paintField();
    if (open) renderList();
  };

  render();

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
} from "solid-js";
import { Portal } from "solid-js/web";
import {
  filterTree,
  findNode,
  isSelectable,
  pathTo,
  treeKeyTarget,
  visibleRows,
  type TreeRow,
  type TreeSelectNode,
} from "@algorisys/zen-ui-core/tree-select";
import { cn } from "../../lib/cn";
import { createAnchoredPlacement } from "../../lib/anchored";
import { Icon } from "../icon/icon";
import { useLocale } from "../locale/locale";

export type { TreeSelectNode };

/**
 * TreeSelect — pick one node from a hierarchy: an account from the chart of
 * accounts, an item group, a cost centre, a warehouse.
 *
 *   <TreeSelect items={accounts} value={account()} onValueChange={setAccount}
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
  /** Lands on the input, so `<label for>` names it. */
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  class?: string;
};

export const TreeSelect = (props: TreeSelectProps) => {
  const loc = useLocale();
  const [local] = splitProps(props, [
    "items",
    "value",
    "defaultValue",
    "onValueChange",
    "placeholder",
    "leavesOnly",
    "showPath",
    "pathSeparator",
    "defaultExpanded",
    "emptyMessage",
    "invalid",
    "disabled",
    "width",
    "id",
    "aria-label",
    "aria-labelledby",
    "class",
  ]);
  const listId = createUniqueId();
  const inputId = () => local.id ?? `${listId}-input`;
  const rowId = (id: string) => `${listId}-${id}`;

  // The initial value seeds it; the user owns it after.
  const [internal, setInternal] = createSignal<string | null>(local.defaultValue ?? null);
  const value = () => (local.value !== undefined ? local.value : internal());
  const [open, setOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  // The initial set seeds it; the user owns it after.
  const [expanded, setExpanded] = createSignal(new Set(local.defaultExpanded ?? []));
  const [active, setActive] = createSignal(0);
  let wrap: HTMLDivElement | undefined;
  let input: HTMLInputElement | undefined;
  let list: HTMLDivElement | undefined;

  const selectedPath = createMemo(() => {
    const v = value();
    return v ? (pathTo(local.items, v) ?? []) : [];
  });
  const display = () => {
    const p = selectedPath();
    if (!p.length) return "";
    return local.showPath ? p.map((n) => n.label).join(local.pathSeparator ?? " › ") : p[p.length - 1].label;
  };

  const filtered = createMemo(() => filterTree(local.items, query()));
  const rows = createMemo<TreeRow[]>(() => {
    const f = filtered();
    const open = new Set([...expanded(), ...f.expand]);
    return visibleRows(f.items, open);
  });

  const openList = () => {
    if (local.disabled || open()) return;
    // Open on the picked node: its ancestors opened, it active.
    const p = selectedPath();
    if (p.length > 1) setExpanded((e) => new Set([...e, ...p.slice(0, -1).map((n) => n.id)]));
    setQuery("");
    setOpen(true);
    const at = rows().findIndex((r) => r.node.id === value());
    setActive(at >= 0 ? at : 0);
  };
  const close = () => {
    setOpen(false);
    setQuery("");
  };
  const pick = (node: TreeSelectNode) => {
    if (!isSelectable(node, !!local.leavesOnly)) return;
    if (local.value === undefined) setInternal(node.id);
    local.onValueChange?.(node.id, node);
    close();
  };
  const toggle = (id: string) =>
    setExpanded((e) => {
      const next = new Set(e);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // The active row stays in range as the list changes under it, and in view
  // (in the list's own scroller, never the page's).
  createEffect(() => {
    const n = rows().length;
    if (active() > n - 1) setActive(Math.max(0, n - 1));
  });
  // Only a key moves the list to its active row. The pointer makes a row
  // active by hovering it, and scrolling then would slide the list under the
  // pointer, onto the next row, and scroll again.
  let fromPointer = false;
  createEffect(() => {
    if (!open() || !list) return;
    const index = active();
    if (fromPointer) {
      fromPointer = false;
      return;
    }
    const el = list.querySelector<HTMLElement>(`[data-index="${index}"]`);
    if (!el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  });

  // The list lives in a portal, placed against the field (lib/anchored): a
  // list inside the field's wrapper was cut off by any ancestor that clips.
  const placement = createAnchoredPlacement({ anchor: () => wrap, popup: () => list, open, maxHeight: 288, matchWidth: true });

  // Closing on a press outside, while open.
  createEffect(() => {
    if (!open()) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!wrap?.contains(t) && !list?.contains(t)) close();
    };
    document.addEventListener("pointerdown", onDown, true);
    onCleanup(() => document.removeEventListener("pointerdown", onDown, true));
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (local.disabled) return;
    if (!open()) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || (e.key === "Enter" && !e.isComposing)) {
        e.preventDefault();
        openList();
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Typing into the closed field starts a search: it opens empty, and
        // the key lands in it, rather than appending to the picked value's text.
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
    const rs = rows();
    const row = rs[active()];
    if (e.key === "Enter") {
      e.preventDefault();
      if (!row) return;
      if (isSelectable(row.node, !!local.leavesOnly)) pick(row.node);
      else if (row.hasChildren) toggle(row.node.id);
      return;
    }
    // ← → are the text's while there is text to move through.
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && query()) return;
    const move = treeKeyTarget(e.key, rs, active());
    if (!move) return;
    e.preventDefault();
    if (move.kind === "move") setActive(move.index);
    else toggle(move.id);
  };

  const highlight = (label: string) => {
    const q = query().trim();
    if (!q) return label;
    const i = label.toLocaleLowerCase().indexOf(q.toLocaleLowerCase());
    if (i < 0) return label;
    return (
      <>
        {label.slice(0, i)}
        <mark class="zen-bg-transparent zen-font-semibold zen-text-inherit">{label.slice(i, i + q.length)}</mark>
        {label.slice(i + q.length)}
      </>
    );
  };

  return (
    <div
      ref={wrap}
      class={cn("zen-relative", local.class)}
      style={{ width: typeof local.width === "number" ? `${local.width}px` : (local.width ?? "100%") }}
    >
      <div
        class={cn(
          "zen-flex zen-h-zen-control zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-px-zen-control-x",
          "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
          local.invalid && "zen-border-zen-error",
          local.disabled && "zen-cursor-not-allowed zen-opacity-50",
        )}
      >
        <input
          ref={input}
          id={inputId()}
          type="text"
          role="combobox"
          aria-haspopup="tree"
          aria-expanded={open()}
          aria-controls={open() ? listId : undefined}
          aria-activedescendant={open() && rows()[active()] ? rowId(rows()[active()].node.id) : undefined}
          aria-autocomplete="list"
          aria-invalid={local.invalid ? "true" : undefined}
          aria-label={local["aria-label"]}
          aria-labelledby={local["aria-labelledby"]}
          disabled={local.disabled}
          autocomplete="off"
          spellcheck={false}
          // Open: what is typed (the picked value is the placeholder, so it stays
          // in sight). Closed: the picked value.
          value={open() ? query() : display()}
          placeholder={open() ? display() || local.placeholder : local.placeholder}
          onInput={(e) => {
            setQuery(e.currentTarget.value);
            if (!open()) setOpen(true);
            // The first match that can be picked is active, not its ancestor
            // group at the top, so Enter picks what was searched for.
            const f = filtered();
            const at = rows().findIndex((r) => f.matches.has(r.node.id) && isSelectable(r.node, !!local.leavesOnly));
            setActive(at >= 0 ? at : 0);
          }}
          onClick={() => openList()}
          onKeyDown={onKeyDown}
          class="zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-sm zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open() ? loc.t("common.close") : loc.t("common.open")}
          disabled={local.disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (open()) close();
            else {
              openList();
              input?.focus();
            }
          }}
          class="zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0 zen-text-zen-muted-fg"
        >
          <Icon name={open() ? "chevron-up" : "chevron-down"} size={16} />
        </button>
      </div>

      <Show when={open()}>
        <Portal>
        <div
          ref={list}
          dir={placement.dir()}
          style={placement.style()}
          id={listId}
          role="tree"
          aria-label={local["aria-label"] ?? local.placeholder}
          // Presses in the list must not take focus from the field.
          onMouseDown={(e) => e.preventDefault()}
          class="zen-z-50 zen-overflow-y-auto zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-1 zen-shadow-md"
        >
          <Show
            when={rows().length > 0}
            fallback={<div class="zen-px-2 zen-py-1.5 zen-text-sm zen-text-zen-muted-fg">{local.emptyMessage ?? loc.t("treeSelect.noMatches")}</div>}
          >
            <For each={rows()}>
              {(row, i) => {
                const selectable = () => isSelectable(row.node, !!local.leavesOnly);
                return (
                  <div
                    id={rowId(row.node.id)}
                    role="treeitem"
                    data-index={i()}
                    aria-level={row.level}
                    aria-posinset={row.posInSet}
                    aria-setsize={row.setSize}
                    aria-expanded={row.hasChildren ? row.expanded : undefined}
                    aria-selected={value() === row.node.id}
                    // Disabled means not operable: a group that only opens (leavesOnly)
                    // is operable, so it is not marked, only a disabled node is.
                    aria-disabled={row.node.disabled || undefined}
                    onMouseMove={() => {
                      if (active() === i()) return;
                      fromPointer = true;
                      setActive(i());
                    }}
                    onClick={() => (selectable() ? pick(row.node) : row.hasChildren && toggle(row.node.id))}
                    class={cn(
                      "zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-1 zen-rounded-zen-sm zen-py-zen-menu-y zen-pe-2 zen-text-sm",
                      i() === active() && "zen-bg-zen-muted",
                      value() === row.node.id && "zen-font-medium zen-text-zen-primary",
                      !selectable() && !row.hasChildren && "zen-opacity-50",
                      !selectable() && row.hasChildren && "zen-text-zen-muted-fg",
                    )}
                    style={{ "padding-inline-start": `calc(${row.level - 1} * var(--zen-space-4) + var(--zen-space-1))` }}
                  >
                    <span
                      aria-hidden="true"
                      class="zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center"
                      onClick={(e) => {
                        if (!row.hasChildren) return;
                        e.stopPropagation();
                        toggle(row.node.id);
                      }}
                    >
                      <Show when={row.hasChildren}>
                        <Icon name={row.expanded ? "chevron-down" : "chevron-right"} size={14} />
                      </Show>
                    </span>
                    <span class="zen-min-w-0 zen-flex-1 zen-truncate">{highlight(row.node.label)}</span>
                    <Show when={value() === row.node.id}>
                      <Icon name="check" size={14} />
                    </Show>
                  </div>
                );
              }}
            </For>
          </Show>
        </div>
        </Portal>
      </Show>
    </div>
  );
};

/** The node for an id, for showing a picked value elsewhere. */
export const findTreeSelectNode = findNode;

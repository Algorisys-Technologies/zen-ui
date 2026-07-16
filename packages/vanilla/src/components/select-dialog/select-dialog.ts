import { cn } from "../../lib/cn";
import {
  Disposer,
  type AnyZenComponent,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { Dialog, type DialogHandle } from "../dialog/dialog";
import { Button } from "../button/button";
import { Input } from "../form/input/input";
import { Checkbox } from "../form/checkbox/checkbox";
import { Icon, type IconName } from "../icon/icon";

/**
 * SelectDialog — the list picker: a modal with a search field, a scrollable
 * list, and a footer. The vanilla port of the React reference.
 *
 * Two modes, and they behave differently on purpose:
 *
 * - **Single** — picking a row IS the confirmation. The dialog closes on click
 *   and there is no OK button, because an OK would be a second click that says
 *   nothing new.
 * - **Multiple** — rows are checkboxes and nothing is committed until OK, so a
 *   mis-click is recoverable. Cancel (or Escape / click-outside / ✕) restores
 *   whatever was selected on open, because the draft is thrown away untouched.
 *
 * Selection is drafted internally and only handed back via `onConfirm`, so the
 * caller's state never sees an intermediate tick. `selectedIds` is read when the
 * dialog is opened — this is a picker, not a live-bound field.
 *
 * ## The one divergence from React, and why
 *
 * React drives visibility with `open` / `onOpenChange` and a re-render. There is
 * no re-render here, and the vanilla Dialog this builds on is already imperative,
 * so `open()` / `close()` IS the API — the same shape a vanilla caller would write.
 * `selectedIds` is therefore read on `open()` rather than on an `open` prop
 * flipping true; set it (or `update({ selectedIds })`) before calling `open()`.
 * `onOpenChange` still fires for every close, so a caller keeping its own state
 * can mirror it.
 *
 * Filtering is client-side over label + description. Pass `onSearch` to take it
 * over (server-driven / fuzzy): the dialog then renders `items` verbatim and
 * filtering becomes the caller's job.
 *
 *   const dlg = SelectDialog({
 *     title: "Select supplier",
 *     items: SUPPLIERS,
 *     onConfirm: (ids) => setSupplier(ids[0]),
 *   });
 *   openBtn.el.addEventListener("click", () => {
 *     dlg.update({ selectedIds: supplier ? [supplier] : [] });
 *     dlg.open();
 *   });
 */

/** The item shape. Mirrors React's `SelectListItem`. */
export interface SelectDialogItem {
  id: string;
  label: string;
  /** Secondary line under the label. */
  description?: string;
  /** Right-aligned trailing text — the "info", e.g. a status or amount. */
  info?: string;
  icon?: IconName;
  disabled?: boolean;
}

export interface SelectDialogProps {
  title: string;
  /** Optional subtitle. Also the dialog's accessible description. */
  description?: string;
  items: SelectDialogItem[];
  /** Checkbox rows + an OK/Cancel commit step. Default: single-select. */
  multiple?: boolean;
  /** The selection the dialog opens with. Read on `open()`. */
  selectedIds?: string[];
  /** The only way selection escapes. Single mode passes exactly one id. */
  onConfirm: (ids: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Take over filtering. When set, `items` is rendered as given. */
  onSearch?: (query: string) => void;
  emptyText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  clearLabel?: string;
  /** Multi-select only: a "Clear" action in the footer. Default: true. */
  showClearAll?: boolean;
  /** Fires on every open/close, including Escape, click-outside and ✕. */
  onOpenChange?: (open: boolean) => void;
  class?: string;
}

export interface SelectDialogHandle extends ZenComponent<SelectDialogProps> {
  open(): void;
  close(): void;
  readonly isOpen: boolean;
}

const FULL_BLEED = "zen-flex zen-max-h-[85vh] zen-flex-col zen-overflow-hidden zen-p-0";

const ROW_CLASS =
  "zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-sm zen-px-4 zen-py-2.5 zen-text-left";

/** Client-side filter over label + description. `external` hands it to the caller. */
const filterItems = (
  items: SelectDialogItem[],
  query: string,
  external: boolean,
): SelectDialogItem[] => {
  const q = query.trim().toLowerCase();
  if (external || !q) return items;
  return items.filter(
    (i) =>
      i.label.toLowerCase().includes(q) ||
      (i.description?.toLowerCase().includes(q) ?? false),
  );
};

let uid = 0;

export function SelectDialog(props: SelectDialogProps): SelectDialogHandle {
  let current: SelectDialogProps = { ...props };
  const id = `zen-select-dialog-${++uid}`;
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;

  let query = "";
  // Seeded on open(): `selectedIds` is read when the dialog opens, so a draft of
  // a closed dialog is never shown and an initial read would be a second,
  // contradictory source of that rule.
  let draft: string[] = [];

  /** Row components (Icon, Checkbox) rebuilt each renderList — destroyed first. */
  let rowParts: AnyZenComponent[] = [];
  /** Footer buttons rebuilt each renderChrome — destroyed first. */
  let footerParts: AnyZenComponent[] = [];
  let clearBtn: ReturnType<typeof Button> | null = null;

  // ---- persistent chrome -------------------------------------------------
  const header = document.createElement("div");
  header.className =
    "zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4";

  const titleEl = document.createElement("h2");
  titleEl.id = titleId;
  titleEl.className =
    "zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-pr-8";

  const descEl = document.createElement("p");
  descEl.id = descId;
  descEl.className = "zen-text-sm zen-text-zen-muted-fg zen-leading-snug";

  // The search field: an Icon inside a relative wrapper, over an Input padded to
  // clear it. Mirrors React's SelectSearchField.
  const searchWrap = document.createElement("div");
  searchWrap.className = "zen-relative zen-mt-1";
  const searchIcon = Icon({
    name: "search",
    size: 14,
    class:
      "zen-pointer-events-none zen-absolute zen-left-3 zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg",
  });
  const searchInput = Input({
    class: "zen-pl-9",
    onInput: (e) => handleSearch((e.target as HTMLInputElement).value),
  });
  searchWrap.append(searchIcon.el, searchInput.el);
  header.append(titleEl, descEl, searchWrap);

  const body = document.createElement("div");
  body.className = "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2";

  const footer = document.createElement("div");
  footer.className =
    "zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3";

  const dlg: DialogHandle = Dialog({
    class: cn(FULL_BLEED, current.class),
    showCloseButton: true,
    // Direct children of the flex-col content, so header / body / footer stack
    // and the body owns the only scroller — a scrollbar inside a scrollbar is
    // exactly what the full-bleed layout avoids.
    children: [header, body, footer] as Child,
    onOpenChange: (o) => current.onOpenChange?.(o),
  });
  // The vanilla Dialog only wires aria-labelledby/‑describedby from its own
  // title/description props, which this does not use — it owns the header — so
  // point them at our nodes directly. Set once; Dialog never clears them.
  dlg.el.setAttribute("aria-labelledby", titleId);

  // ---- behaviour ---------------------------------------------------------
  const commit = (ids: string[]) => {
    current.onConfirm(ids);
    api.close();
  };

  const toggle = (itemId: string) => {
    draft = draft.includes(itemId)
      ? draft.filter((x) => x !== itemId)
      : [...draft, itemId];
    renderList();
  };

  // OK reports the selection in list order, not tick order — which rows the user
  // happened to click first is not information the caller should untangle, and
  // Fiori's SelectDialog reports selectedContexts in list order too. Ids `items`
  // no longer holds (a rotated `onSearch` page) keep their draft order on the end.
  const inListOrder = (ids: string[]) => {
    const picked = new Set(ids);
    const known = current.items.filter((i) => picked.has(i.id)).map((i) => i.id);
    const seen = new Set(known);
    return [...known, ...ids.filter((x) => !seen.has(x))];
  };

  const handleSearch = (value: string) => {
    query = value;
    current.onSearch?.(value);
    renderList();
  };

  // ---- rendering ---------------------------------------------------------
  const appendRowBody = (parent: HTMLElement, item: SelectDialogItem) => {
    if (item.icon) {
      const ic = Icon({
        name: item.icon,
        size: 16,
        class: "zen-shrink-0 zen-text-zen-muted-fg",
      });
      rowParts.push(ic);
      parent.append(ic.el);
    }
    const col = document.createElement("span");
    col.className = "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col";
    const lbl = document.createElement("span");
    lbl.className = "zen-truncate zen-text-sm";
    lbl.textContent = item.label;
    col.append(lbl);
    if (item.description) {
      const d = document.createElement("span");
      d.className = "zen-truncate zen-text-xs zen-text-zen-muted-fg";
      d.textContent = item.description;
      col.append(d);
    }
    parent.append(col);
    if (item.info) {
      const info = document.createElement("span");
      info.className = "zen-shrink-0 zen-text-xs zen-text-zen-muted-fg";
      info.textContent = item.info;
      parent.append(info);
    }
  };

  // A real <button>, not a role="option": picking commits, so this is an action.
  // It also buys Enter/Space and tab order for free. `aria-current` marks the
  // incoming selection without claiming listbox semantics the markup lacks.
  const singleRow = (item: SelectDialogItem): HTMLElement => {
    const isCurrent = draft.includes(item.id);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.disabled = Boolean(item.disabled);
    if (isCurrent) btn.setAttribute("aria-current", "true");
    btn.className = cn(
      ROW_CLASS,
      "zen-border-0 zen-bg-transparent zen-cursor-pointer",
      "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      isCurrent && "zen-bg-zen-muted",
    );
    appendRowBody(btn, item);
    if (isCurrent) {
      const check = Icon({
        name: "check",
        size: 16,
        class: "zen-shrink-0 zen-text-zen-primary",
      });
      rowParts.push(check);
      btn.append(check.el);
    }
    if (!item.disabled) btn.addEventListener("click", () => commit([item.id]));
    return btn;
  };

  // A <label> so the whole row is the checkbox's hit target, not just the box.
  const multiRow = (item: SelectDialogItem): HTMLElement => {
    const label = document.createElement("label");
    label.className = cn(
      ROW_CLASS,
      "zen-cursor-pointer hover:zen-bg-zen-muted",
      item.disabled && "zen-cursor-not-allowed zen-opacity-50",
    );
    const cb = Checkbox({
      checked: draft.includes(item.id),
      disabled: item.disabled,
      onCheckedChange: () => toggle(item.id),
    });
    rowParts.push(cb);
    label.append(cb.el);
    appendRowBody(label, item);
    return label;
  };

  const renderList = () => {
    for (const p of rowParts) p.destroy();
    rowParts = [];

    const visible = filterItems(current.items, query, Boolean(current.onSearch));
    body.replaceChildren();

    if (visible.length === 0) {
      const empty = document.createElement("p");
      empty.className =
        "zen-m-0 zen-px-4 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      empty.textContent = current.emptyText ?? "No matching items";
      body.append(empty);
    } else {
      const ul = document.createElement("ul");
      ul.className = "zen-m-0 zen-flex zen-list-none zen-flex-col zen-p-0";
      const multiple = current.multiple ?? false;
      for (const item of visible) {
        const li = document.createElement("li");
        li.append(multiple ? multiRow(item) : singleRow(item));
        ul.append(li);
      }
      body.append(ul);
    }

    // Clearing an empty selection is a no-op dressed as an action.
    clearBtn?.update({ disabled: draft.length === 0 });
  };

  const renderChrome = () => {
    titleEl.textContent = current.title;

    if (current.description) {
      descEl.textContent = current.description;
      descEl.hidden = false;
      dlg.el.setAttribute("aria-describedby", descId);
    } else {
      descEl.hidden = true;
      dlg.el.removeAttribute("aria-describedby");
    }

    const searchable = current.searchable ?? true;
    searchWrap.hidden = !searchable;
    const placeholder = current.searchPlaceholder ?? "Search";
    searchInput.update({ placeholder, "aria-label": placeholder });

    // Footer: which actions exist depends on `multiple` / `showClearAll`, both of
    // which update() can change, so rebuild rather than toggle.
    for (const p of footerParts) p.destroy();
    footerParts = [];
    clearBtn = null;
    footer.replaceChildren();

    const multiple = current.multiple ?? false;

    if (multiple && (current.showClearAll ?? true)) {
      clearBtn = Button({
        type: "button",
        variant: "ghost",
        color: "neutral",
        size: "sm",
        disabled: draft.length === 0,
        class: "zen-mr-auto",
        children: current.clearLabel ?? "Clear",
        onClick: () => {
          draft = [];
          renderList();
        },
      });
      footerParts.push(clearBtn);
      footer.append(clearBtn.el);
    }

    const cancel = Button({
      type: "button",
      variant: "outline",
      color: "neutral",
      size: "sm",
      children: current.cancelLabel ?? "Cancel",
      onClick: () => api.close(),
    });
    footerParts.push(cancel);
    footer.append(cancel.el);

    if (multiple) {
      const ok = Button({
        type: "button",
        size: "sm",
        children: current.confirmLabel ?? "OK",
        onClick: () => commit(inListOrder(draft)),
      });
      footerParts.push(ok);
      footer.append(ok.el);
    }
  };

  renderChrome();
  renderList();

  const disposer = new Disposer();
  disposer.add(() => {
    for (const p of rowParts) p.destroy();
    for (const p of footerParts) p.destroy();
    searchIcon.destroy();
    searchInput.destroy();
    dlg.destroy();
  });

  const api: SelectDialogHandle = {
    el: dlg.el,
    get isOpen() {
      return dlg.isOpen;
    },
    open() {
      if (dlg.isOpen) return;
      // A picker is a fresh question each time it opens: re-seed the draft from
      // the current selection and drop the previous search.
      draft = current.selectedIds ? [...current.selectedIds] : [];
      query = "";
      searchInput.el.value = "";
      renderList();
      dlg.open();
    },
    close() {
      dlg.close();
    },
    update(next) {
      current = { ...current, ...next };
      dlg.update({ class: cn(FULL_BLEED, current.class) });
      renderChrome();
      renderList();
    },
    destroy() {
      disposer.dispose();
    },
  };

  return api;
}

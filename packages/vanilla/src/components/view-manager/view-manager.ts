import {
  encodeView,
  freeViewName,
  isViewModified,
  viewNameProblem,
  type SavedView,
} from "@algorisys/zen-ui-core/views";
import { cn } from "../../lib/cn";
import type { ZenComponent } from "../../lib/component";
import { Button } from "../button/button";
import { Input } from "../form/input/input";
import { Checkbox } from "../form/checkbox/checkbox";
import { Icon } from "../icon/icon";
import { Dialog } from "../dialog/dialog";
import { DropdownMenu, type DropdownMenuItemSpec } from "../dropdown-menu/dropdown-menu";
import { useLocale } from "../locale/locale";

export type { SavedView };

/**
 * ViewManager — named list setups a person keeps and returns to ("My overdue
 * invoices, this quarter, these columns"), as a picker beside the page title.
 *
 *   const vm = ViewManager({
 *     views, activeId: null, state: screenState,
 *     onSelect: (v) => { apply(v?.state ?? standard); vm.update({ activeId: v?.id ?? null, state }); },
 *     onSave: save, onCreate: create, onRename: rename, onDelete: remove,
 *     onDefaultChange: setDefault, onShare: (v, token) => copy(`${url}?view=${token}`),
 *   });
 *   // whenever the screen or the list changes:
 *   vm.update({ views, activeId, state });
 *
 * The state is one serialisable object of the app's choosing (a FilterBuilder
 * value, sort, grouping, columns); this picker never looks inside it. It says
 * when the screen has drifted from the view (key order is not a change), and
 * storage is the app's: every change arrives as a callback, which may return a
 * Promise. A dialog waits for it, and shows the error if it fails rather than
 * closing on a save that did not happen. A view marked readOnly (shared by
 * someone else, or the app's own) can be used and copied, not saved over,
 * renamed or deleted. The pure half is @algorisys/zen-ui-core/views
 * (check:views), which also reads share links back (decodeView).
 *
 * The props are React's, as data: `views`, `activeId` and `state` are
 * controlled, so the caller passes the new ones through `update()` after
 * applying a change (nothing re-renders here by itself). The menu is
 * DropdownMenu's `items`, rebuilt each time it opens, so it always shows the
 * views as they are; the dialogs are built afresh on every opening.
 */
export interface ViewManagerProps<S = unknown> {
  views: SavedView<S>[];
  /** The view on screen; null for the standard (unsaved) one. */
  activeId: string | null;
  /** The screen's state now, to tell when it has drifted from the view. */
  state: S;
  /** The state with no view applied: with it, "Standard" shows Modified too. */
  standardState?: S;
  /** Default "Standard". */
  standardName?: string;
  /** A view was chosen (null: the standard one). Apply its state. */
  onSelect: (view: SavedView<S> | null) => void;
  /** Save: the active view, with the current state. Without it, no Save. */
  onSave?: (view: SavedView<S>) => void | Promise<void>;
  /** Save as: a new view of the current state. Without it, no Save as. */
  onCreate?: (view: SavedView<S>) => void | Promise<void>;
  onRename?: (id: string, name: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  /** The view the screen opens with changed (null: the standard one). */
  onDefaultChange?: (id: string | null) => void | Promise<void>;
  /** Copy link: the view with the current state as a URL-safe token. Without it, no Copy link. */
  onShare?: (view: SavedView<S>, token: string) => void;
  /** Names the trigger for assistive tech, before the view name. Default "View". */
  "aria-label"?: string;
  class?: string;
}

export type ViewManagerHandle<S = unknown> = ZenComponent<ViewManagerProps<S>>;

const STANDARD = "__zen_standard_view__";

const TRIGGER_CLASS =
  "zen-inline-flex zen-cursor-pointer zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-border-0 zen-bg-transparent zen-px-1.5 zen-py-1 zen-text-zen-foreground hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";
/** The vanilla Dialog's own footer row, repeated inside Save as's form so Enter submits it. */
const FOOTER_CLASS = "zen-flex zen-flex-col-reverse sm:zen-flex-row sm:zen-justify-end zen-gap-2 zen-mt-5";
const ROW_CLASS = "zen-border-0 zen-border-t zen-border-solid zen-border-zen-border";

let seq = 0;
const newId = () => `view-${Date.now().toString(36)}-${(++seq).toString(36)}`;
const errorText = (e: unknown) => String((e as Error)?.message ?? e);

const h = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export function ViewManager<S>(props: ViewManagerProps<S>): ViewManagerHandle<S> {
  const loc = useLocale();
  let current: ViewManagerProps<S> = { ...props };
  const uid = `zen-view-manager-${++seq}`;

  const active = () => current.views.find((v) => v.id === current.activeId) ?? null;
  const standardName = () => current.standardName ?? loc.t("viewManager.standard");
  const modified = () => isViewModified(current.state, active(), current.standardState);
  const standardIsDefault = () => !current.views.some((v) => v.isDefault);

  const root = h("div");

  /* ---------------------------------------------------------------- trigger */
  const trigger = h("button", TRIGGER_CLASS);
  trigger.type = "button";
  const nameEl = h("span", "zen-text-lg zen-font-semibold");
  nameEl.setAttribute("data-view-name", "");
  const badge = h(
    "span",
    "zen-rounded-zen-sm zen-bg-zen-muted zen-px-1.5 zen-py-0.5 zen-text-xs zen-font-medium zen-text-zen-muted-fg",
    loc.t("viewManager.modified"),
  );
  badge.setAttribute("data-view-modified", "");
  const chevron = Icon({ name: "chevron-down", size: 16, class: "zen-text-zen-muted-fg" });

  const status = h("span", "zen-sr-only");
  status.setAttribute("role", "status");
  let statusTimer: ReturnType<typeof setTimeout> | undefined;
  /** Cleared first and set a task later, so the same words said twice are announced twice. */
  const announce = (s: string) => {
    status.textContent = "";
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (status.textContent = s), 30);
  };

  const paintTrigger = () => {
    const name = active()?.name ?? standardName();
    const isModified = modified();
    trigger.setAttribute(
      "aria-label",
      loc.t(isModified ? "viewManager.triggerModified" : "viewManager.trigger", {
        label: current["aria-label"] ?? loc.t("viewManager.label"),
        name,
      }),
    );
    nameEl.textContent = name;
    trigger.replaceChildren(...(isModified ? [nameEl, badge] : [nameEl]), chevron.el);
    root.className = cn("zen-inline-flex zen-items-center", current.class);
  };

  /* --------------------------------------------------------------- actions */
  const save = async () => {
    const v = active();
    if (!v || v.readOnly || !current.onSave) return;
    try {
      await current.onSave({ ...v, state: current.state });
      announce(loc.t("viewManager.saved", { name: v.name }));
    } catch (e) {
      announce(loc.t("viewManager.saveFailed", { name: v.name, error: errorText(e) }));
    }
  };

  /** Save as: the state is read before the first await, so the view is what was on screen when Save was pressed. */
  const saveAs = async (viewName: string, asDefault: boolean) => {
    const view: SavedView<S> = { id: newId(), name: viewName.trim(), state: current.state };
    await current.onCreate!(view);
    if (asDefault) await current.onDefaultChange?.(view.id);
    announce(loc.t("viewManager.saved", { name: view.name }));
  };

  /* ------------------------------------------------------------------ menu */
  const viewLabel = (name: string, isDefault: boolean, shared?: boolean): HTMLElement => {
    const wrap = h("span", "zen-flex zen-w-full zen-items-center zen-gap-2");
    wrap.append(h("span", "zen-min-w-0 zen-flex-1 zen-truncate", name));
    if (shared) wrap.append(h("span", "zen-text-xs zen-text-zen-muted-fg", loc.t("viewManager.shared")));
    if (isDefault) wrap.append(h("span", "zen-text-xs zen-text-zen-muted-fg", loc.t("viewManager.default")));
    return wrap;
  };

  const buildItems = (): DropdownMenuItemSpec[] => {
    const a = active();
    const isModified = modified();
    const isDefault = a ? !!a.isDefault : standardIsDefault();
    const items: DropdownMenuItemSpec[] = [
      { type: "label", label: loc.t("viewManager.views") },
      {
        type: "radio",
        value: current.activeId ?? STANDARD,
        onValueChange: (id) => {
          if (id === (current.activeId ?? STANDARD)) return;
          current.onSelect(id === STANDARD ? null : current.views.find((v) => v.id === id) ?? null);
        },
        options: [
          { value: STANDARD, label: viewLabel(standardName(), standardIsDefault()), closeOnSelect: true },
          ...current.views.map((v) => ({
            value: v.id,
            label: viewLabel(v.name, !!v.isDefault, !!v.shared),
            closeOnSelect: true,
          })),
        ],
      },
      { type: "separator" },
    ];
    if (current.onSave) {
      items.push({
        label: loc.t("viewManager.save"),
        disabled: !a || !!a.readOnly || !isModified,
        onSelect: () => void save(),
      });
    }
    if (current.onCreate) {
      items.push({ label: loc.t("viewManager.saveAs"), onSelect: () => afterMenu(openSaveAs) });
    }
    if (current.onDefaultChange) {
      items.push({
        label: a ? loc.t("viewManager.openWithThis") : loc.t("viewManager.openWith", { name: standardName() }),
        disabled: isDefault,
        onSelect: () => void current.onDefaultChange?.(active()?.id ?? null),
      });
    }
    if (current.onShare) {
      items.push({
        label: loc.t("viewManager.copyLink"),
        onSelect: () => {
          const v = active() ?? { id: STANDARD, name: standardName(), state: current.state };
          current.onShare!({ ...v, state: current.state }, encodeView({ name: v.name, state: current.state }));
          announce(loc.t("viewManager.linkCopied", { name: v.name }));
        },
      });
    }
    if (current.onRename || current.onDelete || current.onDefaultChange) {
      items.push(
        { type: "separator" },
        {
          label: loc.t("viewManager.manage"),
          disabled: current.views.length === 0,
          onSelect: () => afterMenu(openManage),
        },
      );
    }
    return items;
  };

  const menu = DropdownMenu({
    trigger,
    items: [],
    class: "zen-min-w-64",
    // Built as it opens (this fires before the panel mounts), so the menu always
    // lists the views as they are now, and an update() while it is shut costs nothing.
    onOpenChange: (open) => {
      if (open) menu.update({ items: buildItems() });
    },
  });

  /**
   * A dialog opened from a menu item opens once the menu has closed and handed
   * focus back to the picker: the dialog's focus trap then remembers the
   * picker, not a menu row that is about to be removed.
   */
  let pendingOpen = false;
  const afterMenu = (open: () => void) => {
    pendingOpen = true;
    queueMicrotask(() => {
      if (!pendingOpen) return;
      pendingOpen = false;
      open();
    });
  };
  /** Closing a dialog returns to the picker, whichever way it was closed. */
  const backToTrigger = (open: boolean) => {
    if (!open && trigger.isConnected) trigger.focus();
  };

  /* --------------------------------------------------------------- save as */
  const saveAsDialog = Dialog({
    title: loc.t("viewManager.saveAsTitle"),
    description: loc.t("viewManager.saveAsDescription"),
    class: "zen-max-w-md",
    onOpenChange: (open) => {
      if (!open) saveAsPaint = null;
      backToTrigger(open);
    },
  });
  /** Repaints the open Save as against the current views (null while shut). */
  let saveAsPaint: (() => void) | null = null;

  const openSaveAs = () => {
    // Everything below is this opening's own: the dialog starts fresh every time.
    const id = `${uid}-save-as`;
    let tried = false;
    let pending = false;
    let failure = "";
    let asDefault = false;

    const form = h("form", "zen-flex zen-flex-col zen-gap-3");
    form.noValidate = true;
    const field = h("div", "zen-flex zen-flex-col zen-gap-1.5");
    const label = h("label", "zen-text-sm zen-font-medium", loc.t("viewManager.name"));
    label.htmlFor = `${id}-name`;
    const input = Input({
      id: `${id}-name`,
      value: freeViewName(active()?.name ?? loc.t("viewManager.newView"), current.views),
      "aria-describedby": `${id}-problem`,
      onInput: () => paint(),
    });
    const problemEl = h("p", "zen-m-0 zen-min-h-5 zen-text-sm zen-text-zen-error");
    problemEl.id = `${id}-problem`;
    problemEl.setAttribute("aria-live", "polite");
    field.append(label, input.el, problemEl);
    form.append(field);

    if (current.onDefaultChange) {
      const row = h("label", "zen-inline-flex zen-items-center zen-gap-2 zen-self-start");
      const box = Checkbox({ checked: false, onCheckedChange: (c) => {
        asDefault = c === true;
        box.update({ checked: asDefault });
      } });
      row.append(box.el, h("span", "zen-text-sm", loc.t("viewManager.openByDefault")));
      form.append(row);
    }

    const footer = h("div", FOOTER_CLASS);
    const cancel = Button({
      type: "button",
      variant: "outline",
      color: "neutral",
      children: loc.t("common.cancel"),
      onClick: () => saveAsDialog.close(),
    });
    const submitBtn = Button({ type: "submit", children: loc.t("viewManager.save") });
    footer.append(cancel.el, submitBtn.el);
    form.append(footer);

    const problem = () => viewNameProblem(input.el.value, current.views);
    const paint = () => {
      const p = tried ? problem() : null;
      problemEl.textContent = p || failure;
      if (p) input.el.setAttribute("aria-invalid", "true");
      else input.el.removeAttribute("aria-invalid");
    };
    const submit = async () => {
      tried = true;
      paint();
      if (problem() || pending) return;
      pending = true;
      failure = "";
      submitBtn.update({ loading: true });
      paint();
      try {
        await saveAs(input.el.value, asDefault);
        saveAsDialog.close();
      } catch (e) {
        failure = loc.t("viewManager.notSaved", { error: errorText(e) });
        paint();
      } finally {
        pending = false;
        submitBtn.update({ loading: false });
      }
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      void submit();
    });

    saveAsPaint = paint;
    saveAsDialog.update({ children: form });
    saveAsDialog.open();
  };

  /* ---------------------------------------------------------------- manage */
  const manageDialog = Dialog({
    title: loc.t("viewManager.manageTitle"),
    description: loc.t("viewManager.manageDescription"),
    class: "zen-max-w-lg",
    onOpenChange: (open) => {
      if (!open) manageSync = null;
      backToTrigger(open);
    },
  });
  /** Brings the open Manage dialog's rows up to date with the current views (null while shut). */
  let manageSync: (() => void) | null = null;

  const openManage = () => {
    const id = `${uid}-manage`;
    const problems: Record<string, string> = {};
    /** The row whose Delete was pressed once: the second press deletes. */
    let confirming: string | null = null;
    const canRename = !!current.onRename;
    const canDelete = !!current.onDelete;
    const canDefault = !!current.onDefaultChange;

    const done = Button({ type: "button", children: loc.t("common.done"), onClick: () => manageDialog.close() });

    const table = h("table", "zen-w-full zen-border-collapse zen-text-sm");
    const headRow = h("tr", "zen-text-xs zen-text-zen-muted-fg");
    headRow.append(h("th", "zen-py-1.5 zen-text-start zen-font-medium", loc.t("viewManager.name")));
    if (canDefault) headRow.append(h("th", "zen-w-20 zen-py-1.5 zen-text-center zen-font-medium", loc.t("viewManager.default")));
    if (canDelete) {
      const th = h("th", "zen-w-12 zen-py-1.5");
      th.append(h("span", "zen-sr-only", loc.t("common.delete")));
      headRow.append(th);
    }
    const thead = h("thead");
    thead.append(headRow);
    const tbody = h("tbody");
    table.append(thead, tbody);

    const radio = (label: string, onChange: () => void) => {
      const r = h("input");
      r.type = "radio";
      r.name = `${id}-default`;
      r.setAttribute("aria-label", label);
      r.addEventListener("change", onChange);
      return r;
    };

    // The standard view's row: only there to be chosen as the default.
    let standardRadio: HTMLInputElement | null = null;
    if (canDefault) {
      const tr = h("tr", ROW_CLASS);
      tr.append(h("td", "zen-py-1.5 zen-text-zen-muted-fg", standardName()));
      const td = h("td", "zen-py-1.5 zen-text-center");
      standardRadio = radio(loc.t("viewManager.openWith", { name: standardName() }), () =>
        void current.onDefaultChange?.(null),
      );
      td.append(standardRadio);
      tr.append(td);
      if (canDelete) tr.append(h("td"));
      tbody.append(tr);
    }

    const viewOf = (viewId: string) => current.views.find((v) => v.id === viewId);

    const rename = async (viewId: string, next: string, input: HTMLInputElement) => {
      const v = viewOf(viewId);
      // Compared with the view as it is NOW: Enter and the blur that follows must not rename twice.
      if (!v || next.trim() === v.name) return;
      const problem = viewNameProblem(next, current.views, v.id);
      if (problem) {
        problems[v.id] = problem;
        sync();
        return;
      }
      try {
        await current.onRename?.(v.id, next.trim());
        problems[v.id] = "";
      } catch (e) {
        problems[v.id] = loc.t("viewManager.notRenamed", { error: errorText(e) });
        input.value = v.name;
      }
      sync();
    };

    const remove = async (viewId: string) => {
      confirming = null;
      sync();
      await current.onDelete?.(viewId);
      done.el.focus();
    };

    interface Row {
      tr: HTMLTableRowElement;
      editable: boolean;
      paint: (v: SavedView<S>) => void;
    }
    const rows = new Map<string, Row>();

    const buildRow = (v: SavedView<S>): Row => {
      const viewId = v.id;
      const editable = !v.readOnly && canRename;
      const tr = h("tr", ROW_CLASS);
      tr.setAttribute("data-view-row", viewId);

      const nameCell = h("td", "zen-py-1.5 zen-pe-3");
      tr.append(nameCell);
      let input: HTMLInputElement | null = null;
      let shownName = v.name;
      let alertEl: HTMLParagraphElement | null = null;
      let readName: HTMLSpanElement | null = null;
      let readNote: HTMLSpanElement | null = null;
      if (editable) {
        const field = Input({
          defaultValue: v.name,
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void rename(viewId, (e.currentTarget as HTMLInputElement).value, e.currentTarget as HTMLInputElement);
            }
          },
          onBlur: (e: FocusEvent) =>
            void rename(viewId, (e.currentTarget as HTMLInputElement).value, e.currentTarget as HTMLInputElement),
        });
        input = field.el;
        nameCell.append(input);
      } else {
        const span = h("span");
        readName = h("span");
        readNote = h("span", "zen-text-xs zen-text-zen-muted-fg");
        span.append(readName, " ", readNote);
        nameCell.append(span);
      }

      let defaultRadio: HTMLInputElement | null = null;
      if (canDefault) {
        const td = h("td", "zen-py-1.5 zen-text-center");
        defaultRadio = radio("", () => void current.onDefaultChange?.(viewId));
        td.append(defaultRadio);
        tr.append(td);
      }

      let del: ReturnType<typeof Button> | null = null;
      if (canDelete) {
        const td = h("td", "zen-py-1.5 zen-text-end");
        if (!v.readOnly) {
          // One button that changes in place: swapping in a separate confirm
          // button removes the focused element, the dialog's focus trap moves
          // focus, and the blur cancels the confirmation it had just asked for.
          del = Button({
            type: "button",
            size: "sm",
            onClick: () => {
              if (confirming === viewId) void remove(viewId);
              else {
                confirming = viewId;
                sync();
              }
            },
          });
          const delEl = del.el;
          delEl.addEventListener("blur", () => {
            if (confirming === viewId) {
              confirming = null;
              sync();
            }
          });
          delEl.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && confirming === viewId) {
              // Backs out of the delete only, not out of the dialog. (The
              // dialog hears Escape on the document, after the button does.)
              e.preventDefault();
              e.stopPropagation();
              confirming = null;
              sync();
            }
          });
          td.append(del.el);
        }
        tr.append(td);
      }

      const paint = (view: SavedView<S>) => {
        if (input) {
          input.setAttribute("aria-label", loc.t("viewManager.nameOf", { name: view.name }));
          // The field is the person's while they edit it: it follows the view's
          // name only when the name changed underneath it (a rename stored).
          if (view.name !== shownName && document.activeElement !== input) input.value = view.name;
          shownName = view.name;
          const problem = problems[view.id];
          if (problem) input.setAttribute("aria-invalid", "true");
          else input.removeAttribute("aria-invalid");
          if (problem) {
            if (!alertEl) {
              alertEl = h("p", "zen-m-0 zen-mt-1 zen-text-xs zen-text-zen-error");
              alertEl.setAttribute("role", "alert");
              nameCell.append(alertEl);
            }
            alertEl.textContent = problem;
          } else if (alertEl) {
            alertEl.remove();
            alertEl = null;
          }
        }
        if (readName && readNote) {
          readName.textContent = view.name;
          readNote.textContent = view.shared ? loc.t("viewManager.sharedWithYou") : loc.t("viewManager.readOnly");
        }
        if (defaultRadio) {
          defaultRadio.setAttribute("aria-label", loc.t("viewManager.openWithQuoted", { name: view.name }));
          defaultRadio.checked = !!view.isDefault;
        }
        if (del) {
          const isConfirming = confirming === view.id;
          del.update({
            variant: isConfirming ? "soft" : "ghost",
            color: isConfirming ? "error" : "neutral",
            shape: isConfirming ? undefined : "square",
            "aria-label": isConfirming
              ? loc.t("viewManager.confirmDelete", { name: view.name })
              : loc.t("viewManager.deleteView", { name: view.name }),
            children: isConfirming ? loc.t("common.delete") : Icon({ name: "trash", size: 16 }),
          });
          del.el.title = isConfirming ? loc.t("viewManager.pressAgain") : loc.t("common.delete");
        }
      };
      paint(v);
      return { tr, editable, paint };
    };

    // Rows keyed by id: a rename builds a new view object, and a row rebuilt
    // for it would lose the field mid-edit.
    const sync = () => {
      if (standardRadio) standardRadio.checked = standardIsDefault();
      const seen = new Set<string>();
      let prev: Element | null = standardRadio ? tbody.firstElementChild : null;
      for (const v of current.views) {
        seen.add(v.id);
        let row = rows.get(v.id);
        const editable = !v.readOnly && canRename;
        if (row && row.editable !== editable) {
          row.tr.remove();
          row = undefined;
        }
        if (!row) {
          row = buildRow(v);
          rows.set(v.id, row);
        } else {
          row.paint(v);
        }
        // Moved only when out of place: moving the row holding focus would blur it.
        const want = prev ? prev.nextElementSibling : tbody.firstElementChild;
        if (want !== row.tr) {
          if (prev) prev.after(row.tr);
          else tbody.prepend(row.tr);
        }
        prev = row.tr;
      }
      for (const [viewId, row] of rows) {
        if (!seen.has(viewId)) {
          row.tr.remove();
          rows.delete(viewId);
        }
      }
    };
    sync();

    manageSync = sync;
    manageDialog.update({ children: table, footer: done.el });
    manageDialog.open();
  };

  /* ------------------------------------------------------------------ root */
  root.append(menu.el, status);
  paintTrigger();

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      paintTrigger();
      saveAsPaint?.();
      manageSync?.();
    },
    destroy() {
      pendingOpen = false;
      clearTimeout(statusTimer);
      menu.destroy();
      saveAsDialog.destroy();
      manageDialog.destroy();
      chevron.destroy();
      root.remove();
    },
  };
}

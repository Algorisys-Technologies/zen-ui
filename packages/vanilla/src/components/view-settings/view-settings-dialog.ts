import { cn } from "../../lib/cn";
import { Disposer, type ZenComponent } from "../../lib/component";
import { rovingFocus } from "../../lib/roving-focus";
import { Dialog, type DialogHandle } from "../dialog/dialog";
import { Button } from "../button/button";
import { Switch } from "../form/switch/switch";
import { Checkbox } from "../form/checkbox/checkbox";
import { Icon, type IconName } from "../icon/icon";
import { tabsListVariants, tabsTriggerVariants } from "../tabs/tabs";

/**
 * ViewSettingsDialog — sort / group / filter settings for a list or table. The
 * caller owns the data; this only collects the user's intent and hands it back
 * on OK. The vanilla port of the React reference.
 *
 * Panes are built from the same searchable-list markup as SelectDialog rather
 * than RadioGroup: "pick one sort field" is the same list, and reusing it keeps
 * the dialog family looking identical. React reaches for `SelectListBody`; that
 * sub-part is not exported from any binding, so this file inlines the same row
 * markup (single-select buttons, multi-select checkbox rows) — copied class for
 * class, not reinvented.
 *
 * ## Why the handle is imperative
 *
 * React drives this with `open` / `onOpenChange`, re-rendering on the way in.
 * There is no re-render here, so — exactly like this binding's Dialog — `open()`
 * / `close()` IS the API, and `onOpenChange` still fires so a caller mirroring
 * its own state stays in sync. The draft is seeded from `value` at the moment
 * `open()` is called, which is the same instant React's reset effect fires.
 *
 * Only the sections you pass get a tab, and the tab strip disappears entirely
 * when there is just one — a single tab is a label pretending to be a choice.
 *
 * Nothing is committed until OK, so Cancel (and Escape / click-outside) restore
 * whatever `value` held when the dialog opened. Reset clears the draft but still
 * needs an OK: it is an edit, not a second commit path.
 */

export interface ViewSettingsItem {
  id: string;
  label: string;
  /** Secondary line under the label. */
  description?: string;
}

export interface ViewSettingsFilterGroup {
  id: string;
  label: string;
  /** Checkbox rows. Default: true — filters are usually "any of these". */
  multiple?: boolean;
  items: ViewSettingsItem[];
}

export interface ViewSettingsValue {
  sortBy?: string | null;
  sortDescending?: boolean;
  groupBy?: string | null;
  groupDescending?: boolean;
  /** Filter group id → selected item ids. */
  filters?: Record<string, string[]>;
}

export interface ViewSettingsDialogProps {
  title?: string;
  /** Optional subtitle. Also the dialog's accessible description. */
  description?: string;
  sortItems?: ViewSettingsItem[];
  groupItems?: ViewSettingsItem[];
  filterGroups?: ViewSettingsFilterGroup[];
  /** The settings the dialog opens with. Read when `open()` is called. */
  value?: ViewSettingsValue;
  /** The only way settings escape. */
  onConfirm?: (value: ViewSettingsValue) => void;
  /** Fires on every open/close, whatever caused it — mirror your own state here. */
  onOpenChange?: (open: boolean) => void;
  confirmLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  sortTabLabel?: string;
  groupTabLabel?: string;
  filterTabLabel?: string;
  class?: string;
}

export interface ViewSettingsDialogHandle extends ZenComponent<ViewSettingsDialogProps> {
  open(): void;
  close(): void;
  readonly isOpen: boolean;
}

const EMPTY: ViewSettingsValue = {
  sortBy: null,
  sortDescending: false,
  groupBy: null,
  groupDescending: false,
  filters: {},
};

const countFilters = (filters: Record<string, string[]> | undefined) =>
  Object.values(filters ?? {}).reduce((n, ids) => n + ids.length, 0);

/** A row's shape — a superset of ViewSettingsItem so the same markup serves both. */
interface ListItem {
  id: string;
  label: string;
  description?: string;
  info?: string;
  icon?: IconName;
  disabled?: boolean;
}

const ROW_CLASS =
  "zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-sm zen-px-4 zen-py-2.5 zen-text-start";

let uid = 0;

export function ViewSettingsDialog(props: ViewSettingsDialogProps): ViewSettingsDialogHandle {
  let current: ViewSettingsDialogProps = { ...props };
  const id = `zen-vsd-${++uid}`;

  let draft: ViewSettingsValue = { ...EMPTY };
  /** Everything the CURRENT content registered — replaced on every rebuild. */
  let contentDisposer = new Disposer();
  /** Repaint callbacks for the pieces that change as the draft changes. */
  let repaints: Array<() => void> = [];
  const repaintAll = () => {
    for (const r of repaints) r();
  };

  const dlg: DialogHandle = Dialog({
    showCloseButton: true,
    onOpenChange: (o) => current.onOpenChange?.(o),
  });

  // --- the shared list markup, ported from select-list.tsx -----------------

  const rowBody = (item: ListItem): Node[] => {
    const out: Node[] = [];
    if (item.icon) {
      const ic = Icon({ name: item.icon, size: 16, class: "zen-shrink-0 zen-text-zen-muted-fg" });
      contentDisposer.add(() => ic.destroy());
      out.push(ic.el);
    }
    const mid = document.createElement("span");
    mid.className = "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col";
    const label = document.createElement("span");
    label.className = "zen-truncate zen-text-sm";
    label.textContent = item.label;
    mid.append(label);
    if (item.description) {
      const d = document.createElement("span");
      d.className = "zen-truncate zen-text-xs zen-text-zen-muted-fg";
      d.textContent = item.description;
      mid.append(d);
    }
    out.push(mid);
    if (item.info) {
      const inf = document.createElement("span");
      inf.className = "zen-shrink-0 zen-text-xs zen-text-zen-muted-fg";
      inf.textContent = item.info;
      out.push(inf);
    }
    return out;
  };

  /** A real <button>: picking commits, so this is an action, and it buys Enter/Space free. */
  const buildSingleRow = (item: ListItem, isSelected: () => boolean, onPick: () => void) => {
    const btn = document.createElement("button");
    btn.type = "button";
    if (item.disabled) btn.disabled = true;
    const check = Icon({ name: "check", size: 16, class: "zen-shrink-0 zen-text-zen-primary" });
    contentDisposer.add(() => check.destroy());

    const paint = () => {
      const cur = isSelected();
      btn.className = cn(
        ROW_CLASS,
        "zen-border-0 zen-bg-transparent zen-cursor-pointer",
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        cur && "zen-bg-zen-muted",
      );
      if (cur) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
      check.el.style.display = cur ? "" : "none";
    };

    btn.append(...rowBody(item), check.el);
    const onClick = () => onPick();
    btn.addEventListener("click", onClick);
    contentDisposer.add(() => btn.removeEventListener("click", onClick));
    paint();
    return { node: btn, repaint: paint };
  };

  /** A <label> so the whole row is the checkbox's hit target, not just the box. */
  const buildMultiRow = (item: ListItem, isChecked: () => boolean, onToggle: () => void) => {
    const lbl = document.createElement("label");
    lbl.className = cn(
      ROW_CLASS,
      "zen-cursor-pointer hover:zen-bg-zen-muted",
      item.disabled && "zen-cursor-not-allowed zen-opacity-50",
    );
    const cb = Checkbox({ checked: isChecked(), disabled: item.disabled, onCheckedChange: () => onToggle() });
    contentDisposer.add(() => cb.destroy());
    lbl.append(cb.el, ...rowBody(item));
    return { node: lbl, repaint: () => cb.update({ checked: isChecked() }) };
  };

  const buildList = (opts: {
    items: ListItem[];
    multiple: boolean;
    getSelected: () => string[];
    onToggle: (itemId: string) => void;
    onPick: (itemId: string) => void;
    emptyText: string;
  }): { node: HTMLElement; repaint: () => void } => {
    if (opts.items.length === 0) {
      const p = document.createElement("p");
      p.className = "zen-m-0 zen-px-4 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      p.textContent = opts.emptyText;
      return { node: p, repaint: () => {} };
    }
    const ul = document.createElement("ul");
    ul.className = "zen-m-0 zen-flex zen-list-none zen-flex-col zen-p-0";
    const rowRepaints: Array<() => void> = [];
    for (const item of opts.items) {
      const li = document.createElement("li");
      const row = opts.multiple
        ? buildMultiRow(
            item,
            () => opts.getSelected().includes(item.id),
            () => opts.onToggle(item.id),
          )
        : buildSingleRow(
            item,
            () => opts.getSelected().includes(item.id),
            () => opts.onPick(item.id),
          );
      li.append(row.node);
      rowRepaints.push(row.repaint);
      ul.append(li);
    }
    return { node: ul, repaint: () => rowRepaints.forEach((r) => r()) };
  };

  /** Disabled until a field is chosen: a direction with nothing to order is noise. */
  const buildDirectionToggle = (opts: {
    label: string;
    getChecked: () => boolean;
    getDisabled: () => boolean;
    onChange: (v: boolean) => void;
  }): { node: HTMLElement; repaint: () => void } => {
    const lbl = document.createElement("label");
    const sw = Switch({
      checked: opts.getChecked(),
      disabled: opts.getDisabled(),
      onCheckedChange: (v) => {
        opts.onChange(v);
        repaintAll();
      },
    });
    contentDisposer.add(() => sw.destroy());
    lbl.append(sw.el, document.createTextNode(opts.label));

    const paint = () => {
      const disabled = opts.getDisabled();
      lbl.className = cn(
        "zen-mt-2 zen-flex zen-items-center zen-gap-2 zen-border-0 zen-border-t zen-border-solid zen-border-zen-border zen-px-4 zen-pt-3 zen-text-sm",
        disabled && "zen-opacity-50",
      );
      sw.update({ checked: opts.getChecked(), disabled });
    };
    paint();
    return { node: lbl, repaint: paint };
  };

  // --- the panes -----------------------------------------------------------

  // Picking the selected field again clears it: a sort you cannot turn off is a
  // trap, and there is no other affordance for "no sort".
  const buildFieldPane = (kind: "sort" | "group"): Node[] => {
    const items = (kind === "sort" ? current.sortItems : current.groupItems) ?? [];
    const getSel = () => (kind === "sort" ? draft.sortBy : draft.groupBy) ?? null;
    const pick = (itemId: string) => {
      const next = getSel() === itemId ? null : itemId;
      if (kind === "sort") draft.sortBy = next;
      else draft.groupBy = next;
      repaintAll();
    };
    const list = buildList({
      items,
      multiple: false,
      getSelected: () => {
        const s = getSel();
        return s ? [s] : [];
      },
      onToggle: pick,
      onPick: pick,
      emptyText: kind === "sort" ? "No sort fields" : "No group fields",
    });
    const toggle = buildDirectionToggle({
      label: "Descending",
      getChecked: () => Boolean(kind === "sort" ? draft.sortDescending : draft.groupDescending),
      getDisabled: () => !getSel(),
      onChange: (v) => {
        if (kind === "sort") draft.sortDescending = v;
        else draft.groupDescending = v;
      },
    });
    repaints.push(list.repaint, toggle.repaint);
    return [list.node, toggle.node];
  };

  const toggleFilter = (groupId: string, itemId: string, multiple: boolean) => {
    const cur = draft.filters?.[groupId] ?? [];
    const next = multiple
      ? cur.includes(itemId)
        ? cur.filter((x) => x !== itemId)
        : [...cur, itemId]
      : cur.includes(itemId)
        ? []
        : [itemId];
    draft.filters = { ...draft.filters, [groupId]: next };
    repaintAll();
  };

  const buildFilterPane = (): HTMLElement => {
    const wrap = document.createElement("div");
    wrap.className = "zen-flex zen-flex-col zen-gap-3";
    for (const g of current.filterGroups ?? []) {
      const groupDiv = document.createElement("div");
      const gl = document.createElement("div");
      gl.className =
        "zen-px-4 zen-pb-1 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg";
      gl.textContent = g.label;
      groupDiv.append(gl);
      const multiple = g.multiple ?? true;
      const list = buildList({
        items: g.items,
        multiple,
        getSelected: () => draft.filters?.[g.id] ?? [],
        onToggle: (itemId) => toggleFilter(g.id, itemId, multiple),
        onPick: (itemId) => toggleFilter(g.id, itemId, multiple),
        emptyText: "No values",
      });
      repaints.push(list.repaint);
      groupDiv.append(list.node);
      wrap.append(groupDiv);
    }
    return wrap;
  };

  const labelFor = (key: "sort" | "group" | "filter") =>
    key === "sort"
      ? current.sortTabLabel ?? "Sort"
      : key === "group"
        ? current.groupTabLabel ?? "Group"
        : current.filterTabLabel ?? "Filter";

  const paneFor = (key: "sort" | "group" | "filter"): Node[] =>
    key === "filter" ? [buildFilterPane()] : buildFieldPane(key);

  // --- the tab strip (Tabs/TabsList/TabsTrigger/TabsContent, inlined) -------

  const buildTabs = (sections: Array<"sort" | "group" | "filter">): HTMLElement => {
    const container = document.createElement("div");
    container.className = "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col";

    const list = document.createElement("div");
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-orientation", "horizontal");
    list.className = cn(
      tabsListVariants({ variant: "underline", orientation: "horizontal" }),
      "zen-mx-6 zen-mt-3",
    );
    container.append(list);

    interface Ref {
      value: string;
      trigger: HTMLButtonElement;
      panel: HTMLDivElement;
    }
    const refs: Ref[] = [];

    const setActive = (value: string) => {
      for (const r of refs) {
        const on = r.value === value;
        r.trigger.setAttribute("aria-selected", String(on));
        r.trigger.setAttribute("data-state", on ? "active" : "inactive");
        r.trigger.tabIndex = on ? 0 : -1;
        r.panel.setAttribute("data-state", on ? "active" : "inactive");
        r.panel.hidden = !on;
      }
    };

    for (const key of sections) {
      const tid = `${id}-${key}`;
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.id = `${tid}-trigger`;
      trigger.setAttribute("role", "tab");
      trigger.setAttribute("aria-controls", `${tid}-panel`);
      trigger.className = cn(tabsTriggerVariants({ variant: "underline" }));
      trigger.append(document.createTextNode(labelFor(key)));

      // The Filter tab carries a live count of everything ticked across its groups.
      if (key === "filter") {
        const badge = document.createElement("span");
        badge.className =
          "zen-ml-2 zen-rounded-zen-full zen-bg-zen-primary-soft zen-px-1.5 zen-text-xs zen-text-zen-primary-soft-fg";
        const badgeRepaint = () => {
          const n = countFilters(draft.filters);
          if (n > 0) {
            badge.textContent = String(n);
            if (!badge.isConnected) trigger.append(badge);
          } else {
            badge.remove();
          }
        };
        repaints.push(badgeRepaint);
        badgeRepaint();
      }

      const panel = document.createElement("div");
      panel.id = `${tid}-panel`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `${tid}-trigger`);
      panel.className = "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2";
      panel.append(...paneFor(key));

      const onClick = () => setActive(key);
      trigger.addEventListener("click", onClick);
      contentDisposer.add(() => trigger.removeEventListener("click", onClick));

      list.append(trigger);
      container.append(panel);
      refs.push({ value: key, trigger, panel: panel as HTMLDivElement });
    }

    // Automatic activation: the arrow keys select as they land, matching React.
    contentDisposer.add(
      rovingFocus(list, {
        items: () => refs.map((r) => r.trigger),
        orientation: "horizontal",
        onFocus: (item) => {
          const hit = refs.find((r) => r.trigger === item);
          if (hit) setActive(hit.value);
        },
      }),
    );

    setActive(sections[0]);
    return container;
  };

  // --- assembling the dialog content ---------------------------------------

  const commit = () => {
    current.onConfirm?.(draft);
    api.close();
  };

  const buildContent = () => {
    contentDisposer.dispose();
    contentDisposer = new Disposer();
    repaints = [];

    const title = current.title ?? "View settings";
    const description = current.description;
    const confirmLabel = current.confirmLabel ?? "OK";
    const cancelLabel = current.cancelLabel ?? "Cancel";
    const resetLabel = current.resetLabel ?? "Reset";

    const sections = [
      current.sortItems?.length ? "sort" : null,
      current.groupItems?.length ? "group" : null,
      current.filterGroups?.length ? "filter" : null,
    ].filter(Boolean) as Array<"sort" | "group" | "filter">;

    const header = document.createElement("div");
    header.className =
      "zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4";
    const h2 = document.createElement("h2");
    h2.id = `${id}-title`;
    h2.className = "zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-pr-8";
    h2.textContent = title;
    header.append(h2);
    if (description) {
      const desc = document.createElement("p");
      desc.id = `${id}-desc`;
      desc.className = "zen-text-sm zen-text-zen-muted-fg zen-leading-snug";
      desc.textContent = description;
      header.append(desc);
    }

    let body: HTMLElement;
    if (sections.length > 1) {
      body = buildTabs(sections);
    } else {
      // The panes scroll on their own, so the dialog's own padding and scroller
      // would double up — hence zen-p-0 on the surface and the scroller here.
      body = document.createElement("div");
      body.className = "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2";
      if (sections.length) body.append(...paneFor(sections[0]));
    }

    const footer = document.createElement("div");
    footer.className =
      "zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3";
    const resetBtn = Button({
      type: "button",
      variant: "ghost",
      color: "neutral",
      size: "sm",
      class: "zen-mr-auto",
      children: resetLabel,
      onClick: () => {
        // Reset clears the draft but still needs an OK — an edit, not a commit.
        draft = { ...EMPTY, filters: {} };
        repaintAll();
      },
    });
    const cancelBtn = Button({
      type: "button",
      variant: "outline",
      color: "neutral",
      size: "sm",
      children: cancelLabel,
      onClick: () => api.close(),
    });
    const okBtn = Button({ type: "button", size: "sm", children: confirmLabel, onClick: commit });
    contentDisposer.add(() => {
      resetBtn.destroy();
      cancelBtn.destroy();
      okBtn.destroy();
    });
    footer.append(resetBtn.el, cancelBtn.el, okBtn.el);

    dlg.update({
      class: cn(
        "zen-flex zen-max-h-[85vh] zen-flex-col zen-overflow-hidden zen-p-0",
        current.class,
      ),
      children: [header, body, footer],
    });

    // The custom header owns the accessible name/description; wire them onto the
    // surface Radix would have labelled for us.
    dlg.el.setAttribute("aria-labelledby", h2.id);
    if (description) dlg.el.setAttribute("aria-describedby", `${id}-desc`);
    else dlg.el.removeAttribute("aria-describedby");
  };

  const api: ViewSettingsDialogHandle = {
    el: dlg.el,
    get isOpen() {
      return dlg.isOpen;
    },
    open() {
      if (dlg.isOpen) return;
      // Seed the draft from `value` at the instant we open — the same moment
      // React's reset effect fires. A deep copy of `filters` so editing the
      // draft never mutates the caller's object.
      const seed = current.value;
      draft = { ...EMPTY, ...seed, filters: { ...(seed?.filters ?? {}) } };
      buildContent();
      dlg.open();
    },
    close() {
      dlg.close();
    },
    update(next) {
      current = { ...current, ...next };
      if (dlg.isOpen) buildContent();
    },
    destroy() {
      contentDisposer.dispose();
      dlg.destroy();
    },
  };

  return api;
}

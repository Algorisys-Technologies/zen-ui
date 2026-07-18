import { cn } from "../../lib/cn";
import { Disposer, type ZenComponent } from "../../lib/component";
import { dismissable } from "../../lib/dismissable";
import { focusTrap } from "../../lib/focus-trap";
import { portal } from "../../lib/portal";
import { rovingFocus } from "../../lib/roving-focus";
import { scrollLock } from "../../lib/scroll-lock";
import { setPresence } from "../../lib/presence";
import { tabsListVariants, tabsTriggerVariants } from "../tabs/tabs";
import { Button } from "../button/button";
import { Icon, type IconName } from "../icon/icon";
import { Input, type InputHandle } from "../form/input/input";
import { Checkbox } from "../form/checkbox/checkbox";
import { Select } from "../form/select/select";

/**
 * ValueHelp — the vanilla port of the React reference: the F4 lookup dialog.
 *
 *   const vh = ValueHelp({
 *     open: false,
 *     onOpenChange: (o) => vh.update({ open: o }),
 *     title: "Supplier value help",
 *     items: SUPPLIERS,
 *     multiple: true,
 *     onConfirm: ({ ids, conditions }) => …,
 *   });
 *   document.body.append(vh.el);           // el is an empty anchor; the surface portals
 *   openBtn.el.addEventListener("click", () => vh.update({ open: true }));
 *
 * SelectDialog answers "which of these?"; ValueHelp also answers "everything
 * matching these rules", which is the whole reason it is a separate component:
 *
 * - **Select** tab — the same searchable list SelectDialog uses.
 * - **Conditions** tab — a rule builder: include/exclude, an operator, and one
 *   or two values. This is what a caller turns into a query.
 *
 * Unlike SelectDialog, picking a row never commits on its own, even in single
 * mode: there is a second tab whose rules also need committing, so OK is the
 * only way out. Cancel restores whatever was there on open.
 *
 * Both halves come back together from `onConfirm`, since a filter is usually
 * "these three, plus anything starting with X".
 *
 * ## Controlled, exactly like React
 *
 * `open` is owned by the caller. A user gesture (Escape, click-outside, Cancel,
 * ✕) fires `onOpenChange(false)` and the surface stays up until the caller feeds
 * `open: false` back via `update()`. That is Radix's controlled contract, hand-
 * written — see state.ts for why a controlled surface must still REPORT a change
 * it refuses to make.
 *
 * Everything Radix supplies for free — portal, focus trap, scroll lock, Escape,
 * click-outside, animation-aware unmount — this owns, through the same six lib
 * modules Dialog uses.
 */

export type ValueHelpOperator =
  | "EQ"
  | "Contains"
  | "StartsWith"
  | "EndsWith"
  | "BT"
  | "LT"
  | "LE"
  | "GT"
  | "GE";

export interface ValueHelpCondition {
  /** Stable row identity. Generated when a row is added. */
  id: string;
  /** The exclude flag: the rule subtracts instead of adds. */
  exclude: boolean;
  operator: ValueHelpOperator;
  value: string;
  /** Upper bound. Only meaningful for `BT`. */
  valueTo?: string;
}

/**
 * A row in the Select tab. Mirrors React's `SelectListItem` — that component's
 * whole body lives inline here, since vanilla has no separate select-list module.
 */
export interface ValueHelpItem {
  id: string;
  label: string;
  /** Secondary line under the label. */
  description?: string;
  /** Right-aligned trailing text — the "info", e.g. a status or amount. */
  info?: string;
  icon?: IconName;
  disabled?: boolean;
}

export interface ValueHelpResult {
  ids: string[];
  conditions: ValueHelpCondition[];
}

export interface ValueHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Optional subtitle. Also the dialog's accessible description. */
  description?: string;
  items: ValueHelpItem[];
  /** Checkbox rows instead of single-pick rows. Default: single. */
  multiple?: boolean;
  /** The selection the dialog opens with. Read when `open` becomes true. */
  selectedIds?: string[];
  /** The conditions the dialog opens with. Read when `open` becomes true. */
  conditions?: ValueHelpCondition[];
  /** The only way anything escapes. Blank-valued rules are dropped first. */
  onConfirm: (result: ValueHelpResult) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Take over filtering. When set, `items` is rendered as given. */
  onSearch?: (query: string) => void;
  emptyText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  selectTabLabel?: string;
  conditionsTabLabel?: string;
  addConditionLabel?: string;
  class?: string;
}

const OPERATOR_LABELS: Record<ValueHelpOperator, string> = {
  EQ: "equals",
  Contains: "contains",
  StartsWith: "starts with",
  EndsWith: "ends with",
  BT: "between",
  LT: "less than",
  LE: "less or equal",
  GT: "greater than",
  GE: "greater or equal",
};

const OPERATORS = Object.keys(OPERATOR_LABELS) as ValueHelpOperator[];

/** A rule with no value filters nothing; committing it would be a silent no-op. */
const isComplete = (c: ValueHelpCondition) =>
  c.value.trim() !== "" && (c.operator !== "BT" || (c.valueTo ?? "").trim() !== "");

/** Client-side filter over label + description. `external` hands it to the caller. */
const filterItems = (items: ValueHelpItem[], query: string, external?: boolean): ValueHelpItem[] => {
  const q = query.trim().toLowerCase();
  if (external || !q) return items;
  return items.filter(
    (i) => i.label.toLowerCase().includes(q) || (i.description?.toLowerCase().includes(q) ?? false),
  );
};

let uid = 0;

const ROW_CLASS =
  "zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-sm zen-px-4 zen-py-2.5 zen-text-left";

/** The label + description + info column shared by both row shapes. */
const rowBody = (item: ValueHelpItem): Node[] => {
  const out: Node[] = [];
  if (item.icon) {
    out.push(Icon({ name: item.icon, size: 16, class: "zen-shrink-0 zen-text-zen-muted-fg" }).el);
  }
  const col = document.createElement("span");
  col.className = "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col";
  const label = document.createElement("span");
  label.className = "zen-truncate zen-text-sm";
  label.textContent = item.label;
  col.append(label);
  if (item.description) {
    const desc = document.createElement("span");
    desc.className = "zen-truncate zen-text-xs zen-text-zen-muted-fg";
    desc.textContent = item.description;
    col.append(desc);
  }
  out.push(col);
  if (item.info) {
    const info = document.createElement("span");
    info.className = "zen-shrink-0 zen-text-xs zen-text-zen-muted-fg";
    info.textContent = item.info;
    out.push(info);
  }
  return out;
};

export function ValueHelp(props: ValueHelpProps): ZenComponent<ValueHelpProps> {
  let current: ValueHelpProps = { ...props };
  const id = `zen-value-help-${++uid}`;

  /** Internal draft state — reset from the seed each time the dialog opens. */
  let query = "";
  let draft: string[] = [];
  let rules: ValueHelpCondition[] = [];
  // Row ids come from a counter, not the array length: deleting a middle row
  // would otherwise hand the next added row an id a live row already owns.
  let nextRowId = 0;
  const newRow = (): ValueHelpCondition => ({
    id: `vh-${nextRowId++}`,
    exclude: false,
    operator: "EQ",
    value: "",
  });

  // Held apart from `current` so the reset reads the values as they were when the
  // dialog opened, not whatever a later update() carried. A caller passing
  // selectedIds={[]} inline would otherwise re-seed mid-interaction.
  let seed = { selectedIds: current.selectedIds, conditions: current.conditions };

  let open = false;
  /** Everything released on close, not on destroy. */
  let session: Disposer | null = null;

  const p = portal();
  const lifetime = new Disposer();

  // The returned handle's element is a zero-size anchor: the real surface portals
  // to <body>, so the caller only needs somewhere to have appended us.
  const el = document.createElement("div");
  el.style.display = "contents";

  /* ------------------------------- surface ------------------------------ */

  const overlay = document.createElement("div");
  overlay.className = cn(
    "zen-fixed zen-inset-0 zen-z-50 zen-bg-black/50",
    "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
  );

  const content = document.createElement("div");
  content.id = id;
  content.setAttribute("role", "dialog");
  content.setAttribute("aria-modal", "true");

  const setContentClass = () => {
    content.className = cn(
      "zen-fixed zen-left-1/2 zen-top-1/2 zen-z-50 -zen-translate-x-1/2 -zen-translate-y-1/2",
      "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-shadow-zen-lg",
      "focus:zen-outline-none",
      // The tab panels scroll on their own, so the dialog's padding and scroller
      // would double up: no padding here, and the surface owns its own overflow.
      "zen-flex zen-max-h-[85vh] zen-w-full zen-max-w-2xl zen-flex-col zen-overflow-hidden zen-p-0",
      "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
      current.class,
    );
  };

  /* -------------------------------- header ------------------------------ */

  const header = document.createElement("div");
  header.className = "zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4";
  const titleEl = document.createElement("h2");
  titleEl.id = `${id}-title`;
  titleEl.className = "zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-pr-8";
  content.setAttribute("aria-labelledby", titleEl.id);
  const descEl = document.createElement("p");
  descEl.id = `${id}-desc`;
  descEl.className = "zen-text-sm zen-text-zen-muted-fg zen-leading-snug";
  header.append(titleEl);

  /* --------------------------------- tabs ------------------------------- */

  const tabsRegion = document.createElement("div");
  tabsRegion.className = "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col";

  const tablist = document.createElement("div");
  tablist.setAttribute("role", "tablist");
  tablist.setAttribute("aria-orientation", "horizontal");
  tablist.className = cn(tabsListVariants({ variant: "underline" }), "zen-mx-6 zen-mt-3");

  const selectTrigger = document.createElement("button");
  selectTrigger.type = "button";
  selectTrigger.id = `${id}-tab-select`;
  selectTrigger.setAttribute("role", "tab");
  selectTrigger.setAttribute("aria-controls", `${id}-panel-select`);
  selectTrigger.className = cn(tabsTriggerVariants({ variant: "underline" }));

  const conditionsTrigger = document.createElement("button");
  conditionsTrigger.type = "button";
  conditionsTrigger.id = `${id}-tab-conditions`;
  conditionsTrigger.setAttribute("role", "tab");
  conditionsTrigger.setAttribute("aria-controls", `${id}-panel-conditions`);
  conditionsTrigger.className = cn(tabsTriggerVariants({ variant: "underline" }));
  const conditionsLabelText = document.createTextNode("");
  const conditionsBadge = document.createElement("span");
  conditionsBadge.className =
    "zen-ml-2 zen-rounded-zen-full zen-bg-zen-primary-soft zen-px-1.5 zen-text-xs zen-text-zen-primary-soft-fg";
  conditionsBadge.hidden = true;
  conditionsTrigger.append(conditionsLabelText, conditionsBadge);

  tablist.append(selectTrigger, conditionsTrigger);

  /* ----------------------------- select panel --------------------------- */

  const selectPanel = document.createElement("div");
  selectPanel.id = `${id}-panel-select`;
  selectPanel.setAttribute("role", "tabpanel");
  selectPanel.setAttribute("aria-labelledby", selectTrigger.id);
  selectPanel.className =
    "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-2 zen-overflow-hidden";

  // Search field — a search glyph over an Input, exactly React's SelectSearchField.
  const searchField = document.createElement("div");
  searchField.className = cn("zen-relative", "zen-mx-6 zen-mt-1");
  searchField.append(
    Icon({
      name: "search",
      size: 14,
      class: "zen-pointer-events-none zen-absolute zen-left-3 zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg",
    }).el,
  );
  const searchInput = Input({
    value: "",
    class: "zen-pl-9",
    onInput: (e) => handleSearch((e.target as HTMLInputElement).value),
  });
  searchField.append(searchInput.el);
  lifetime.add(() => searchInput.destroy());

  const scroller = document.createElement("div");
  scroller.className = "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-pb-2";

  selectPanel.append(searchField, scroller);

  /** Everything the list body owns; reset on every repaint so nothing leaks. */
  let listBody = new Disposer();

  const paintSelectList = () => {
    listBody.dispose();
    listBody = new Disposer();
    scroller.replaceChildren();

    const visible = filterItems(current.items, query, Boolean(current.onSearch));

    if (visible.length === 0) {
      const empty = document.createElement("p");
      empty.className = "zen-m-0 zen-px-4 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      empty.textContent = current.emptyText ?? "No matching items";
      scroller.append(empty);
      return;
    }

    const ul = document.createElement("ul");
    ul.className = "zen-m-0 zen-flex zen-list-none zen-flex-col zen-p-0";

    for (const item of visible) {
      const li = document.createElement("li");
      const picked = draft.includes(item.id);

      if (current.multiple) {
        // A <label> so the whole row is the checkbox's hit target, not just the box.
        const row = document.createElement("label");
        row.className = cn(
          ROW_CLASS,
          "zen-cursor-pointer hover:zen-bg-zen-muted",
          item.disabled && "zen-cursor-not-allowed zen-opacity-50",
        );
        const cb = Checkbox({
          checked: picked,
          disabled: item.disabled,
          onCheckedChange: () => toggle(item.id),
        });
        listBody.add(() => cb.destroy());
        row.append(cb.el, ...rowBody(item));
        li.append(row);
      } else {
        // A real <button>, not role="option": picking is an action, and this buys
        // Enter/Space and tab order without a roving-tabindex manager.
        const row = document.createElement("button");
        row.type = "button";
        row.disabled = Boolean(item.disabled);
        if (picked) row.setAttribute("aria-current", "true");
        row.className = cn(
          ROW_CLASS,
          "zen-border-0 zen-bg-transparent zen-cursor-pointer",
          "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
          picked && "zen-bg-zen-muted",
        );
        row.append(...rowBody(item));
        if (picked) {
          row.append(Icon({ name: "check", size: 16, class: "zen-shrink-0 zen-text-zen-primary" }).el);
        }
        const onClick = () => pick(item.id);
        row.addEventListener("click", onClick);
        listBody.add(() => row.removeEventListener("click", onClick));
        li.append(row);
      }
      ul.append(li);
    }
    scroller.append(ul);
  };

  /* --------------------------- conditions panel ------------------------- */

  const conditionsPanel = document.createElement("div");
  conditionsPanel.id = `${id}-panel-conditions`;
  conditionsPanel.setAttribute("role", "tabpanel");
  conditionsPanel.setAttribute("aria-labelledby", conditionsTrigger.id);
  conditionsPanel.className = "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-6 zen-pb-2 zen-pt-1";

  const emptyRules = document.createElement("p");
  emptyRules.className = "zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg";
  emptyRules.textContent = "No conditions yet.";

  const rulesList = document.createElement("ul");
  rulesList.className = "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0";

  const addBtn = Button({
    type: "button",
    variant: "outline",
    color: "neutral",
    size: "sm",
    class: "zen-mt-3",
    children: "",
    onClick: () => addCondition(),
  });
  lifetime.add(() => addBtn.destroy());

  conditionsPanel.append(emptyRules, rulesList, addBtn.el);

  /** Per-row handles, so a removed row releases its Select / Input / Checkbox. */
  const rowRefs = new Map<string, { li: HTMLLIElement; dispose: () => void }>();

  const patch = (rowId: string, next: Partial<ValueHelpCondition>) => {
    rules = rules.map((c) => (c.id === rowId ? { ...c, ...next } : c));
  };

  const buildRow = (c: ValueHelpCondition) => {
    const li = document.createElement("li");
    li.className = "zen-flex zen-items-center zen-gap-2";
    const rowDisposer = new Disposer();

    // exclude
    const excludeLabel = document.createElement("label");
    excludeLabel.className =
      "zen-flex zen-shrink-0 zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg";
    const cb = Checkbox({
      checked: c.exclude,
      "aria-label": `Exclude condition ${c.id}`,
      onCheckedChange: (v) => patch(c.id, { exclude: v === true }),
    });
    rowDisposer.add(() => cb.destroy());
    excludeLabel.append(cb.el, document.createTextNode("Exclude"));

    // operator
    const sel = Select({
      value: c.operator,
      options: OPERATORS.map((op) => ({ value: op, label: OPERATOR_LABELS[op] })),
      class: "zen-w-40 zen-shrink-0",
      onValueChange: (v) => {
        patch(c.id, { operator: v as ValueHelpOperator });
        ensureTo();
      },
    });
    // Radix put aria-label on the trigger; the vanilla Select's trigger is internal.
    sel.el.querySelector('button[role="combobox"]')?.setAttribute("aria-label", "Operator");
    rowDisposer.add(() => sel.destroy());

    // value
    const valueInput = Input({
      value: c.value,
      placeholder: "Value",
      "aria-label": "Value",
      onInput: (e) => patch(c.id, { value: (e.target as HTMLInputElement).value }),
    });
    rowDisposer.add(() => valueInput.destroy());

    // remove
    const remove = Button({
      type: "button",
      variant: "ghost",
      color: "neutral",
      size: "sm",
      "aria-label": "Remove condition",
      children: "✕",
      onClick: () => removeCondition(c.id),
    });
    rowDisposer.add(() => remove.destroy());

    // The "To" bound only exists for BT, and is added/removed in place so editing
    // the first value never rebuilds — and so never steals focus mid-keystroke.
    let toInput: InputHandle | null = null;
    const ensureTo = () => {
      const cond = rules.find((r) => r.id === c.id);
      const need = cond?.operator === "BT";
      if (need && !toInput) {
        toInput = Input({
          value: cond?.valueTo ?? "",
          placeholder: "To",
          "aria-label": "To value",
          onInput: (e) => patch(c.id, { valueTo: (e.target as HTMLInputElement).value }),
        });
        valueInput.el.after(toInput.el);
      } else if (!need && toInput) {
        toInput.destroy();
        toInput = null;
      }
    };
    rowDisposer.add(() => toInput?.destroy());

    li.append(excludeLabel, sel.el, valueInput.el, remove.el);
    ensureTo();

    rowRefs.set(c.id, { li, dispose: () => rowDisposer.dispose() });
    return li;
  };

  const paintRulesChrome = () => {
    const has = rules.length > 0;
    emptyRules.hidden = has;
    rulesList.hidden = !has;
    conditionsBadge.hidden = !has;
    conditionsBadge.textContent = String(rules.length);
  };

  const addCondition = () => {
    const c = newRow();
    rules = [...rules, c];
    rulesList.append(buildRow(c));
    paintRulesChrome();
  };

  const removeCondition = (rowId: string) => {
    rules = rules.filter((r) => r.id !== rowId);
    const ref = rowRefs.get(rowId);
    if (ref) {
      ref.dispose();
      ref.li.remove();
      rowRefs.delete(rowId);
    }
    paintRulesChrome();
  };

  const rebuildRules = () => {
    for (const ref of rowRefs.values()) ref.dispose();
    rowRefs.clear();
    rulesList.replaceChildren();
    for (const c of rules) rulesList.append(buildRow(c));
    paintRulesChrome();
  };

  /* -------------------------------- footer ------------------------------ */

  const footer = document.createElement("div");
  footer.className =
    "zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3";
  const cancelBtn = Button({
    type: "button",
    variant: "outline",
    color: "neutral",
    size: "sm",
    children: "",
    onClick: () => current.onOpenChange(false),
  });
  const okBtn = Button({ type: "button", size: "sm", children: "", onClick: () => commit() });
  lifetime.add(() => cancelBtn.destroy());
  lifetime.add(() => okBtn.destroy());
  footer.append(cancelBtn.el, okBtn.el);

  tabsRegion.append(tablist, selectPanel, conditionsPanel);
  content.append(header, tabsRegion, footer);

  /* ------------------------------ behaviour ----------------------------- */

  const toggle = (itemId: string) => {
    draft = draft.includes(itemId) ? draft.filter((x) => x !== itemId) : [...draft, itemId];
    paintSelectList();
  };
  // Single mode replaces rather than appends, but still does not commit: the
  // Conditions tab needs an OK, so a click here is a choice, not an answer.
  const pick = (itemId: string) => {
    draft = [itemId];
    paintSelectList();
  };

  const handleSearch = (value: string) => {
    query = value;
    current.onSearch?.(value);
    paintSelectList();
  };

  // Ids come back in list order, not tick order, matching SelectDialog. Ids the
  // current `items` no longer holds keep their draft order on the end.
  const inListOrder = (ids: string[]) => {
    const picked = new Set(ids);
    const known = current.items.filter((i) => picked.has(i.id)).map((i) => i.id);
    const seen = new Set(known);
    return [...known, ...ids.filter((idx) => !seen.has(idx))];
  };

  const commit = () => {
    current.onConfirm({ ids: inListOrder(draft), conditions: rules.filter(isComplete) });
    current.onOpenChange(false);
  };

  const setActiveTab = (value: "select" | "conditions") => {
    for (const [trigger, panel, tab] of [
      [selectTrigger, selectPanel, "select"],
      [conditionsTrigger, conditionsPanel, "conditions"],
    ] as const) {
      const isActive = tab === value;
      trigger.setAttribute("aria-selected", String(isActive));
      trigger.setAttribute("data-state", isActive ? "active" : "inactive");
      panel.setAttribute("data-state", isActive ? "active" : "inactive");
      panel.hidden = !isActive;
    }
  };

  const onSelectClick = () => setActiveTab("select");
  const onConditionsClick = () => setActiveTab("conditions");
  selectTrigger.addEventListener("click", onSelectClick);
  conditionsTrigger.addEventListener("click", onConditionsClick);
  lifetime.add(() => selectTrigger.removeEventListener("click", onSelectClick));
  lifetime.add(() => conditionsTrigger.removeEventListener("click", onConditionsClick));
  lifetime.add(
    rovingFocus(tablist, {
      items: () => [selectTrigger, conditionsTrigger],
      orientation: "horizontal",
      onFocus: (item) => setActiveTab(item === conditionsTrigger ? "conditions" : "select"),
    }),
  );

  /** Static text that a caller may change but that does not depend on draft. */
  const paintStatic = () => {
    setContentClass();
    titleEl.textContent = current.title;

    if (current.description) {
      descEl.textContent = current.description;
      if (!descEl.isConnected) header.append(descEl);
      content.setAttribute("aria-describedby", descEl.id);
    } else {
      descEl.remove();
      content.removeAttribute("aria-describedby");
    }

    searchField.hidden = current.searchable === false;
    searchInput.update({ placeholder: current.searchPlaceholder ?? "Search" });
    searchInput.el.setAttribute("aria-label", current.searchPlaceholder ?? "Search");

    selectTrigger.textContent = current.selectTabLabel ?? "Select from list";
    conditionsLabelText.textContent = current.conditionsTabLabel ?? "Define conditions";
    // Re-append the badge: setting the label text above replaced it.
    if (!conditionsBadge.isConnected) conditionsTrigger.append(conditionsBadge);

    addBtn.update({ children: current.addConditionLabel ?? "Add condition" });
    cancelBtn.update({ children: current.cancelLabel ?? "Cancel" });
    okBtn.update({ children: current.confirmLabel ?? "OK" });
  };

  /* --------------------------- open / close ----------------------------- */

  const doOpen = () => {
    if (open) return;
    open = true;

    // A picker is a fresh question each time it opens.
    draft = seed.selectedIds ?? [];
    rules = (seed.conditions ?? []).map((c) => ({ ...c }));
    query = "";
    searchInput.update({ value: "" });

    paintStatic();
    rebuildRules();
    paintSelectList();
    setActiveTab("select");

    p.mount(overlay);
    p.mount(content);
    setPresence(overlay, "open");
    setPresence(content, "open");

    session = new Disposer();
    session.add(scrollLock());
    session.add(focusTrap(content));
    session.add(
      dismissable(content, {
        onDismiss: () => current.onOpenChange(false),
      }),
    );
  };

  const doClose = () => {
    if (!open) return;
    open = false;
    session?.dispose();
    session = null;
    setPresence(overlay, "closed", () => overlay.remove());
    setPresence(content, "closed", () => content.remove());
  };

  const syncOpen = () => {
    if (current.open && !open) doOpen();
    else if (!current.open && open) doClose();
  };

  paintStatic();
  syncOpen();

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      // Track the seed on every update, but the reset only READS it on open.
      seed = { selectedIds: current.selectedIds, conditions: current.conditions };

      if (open) {
        paintStatic();
        if (next.items !== undefined || next.onSearch !== undefined) paintSelectList();
      }
      if (next.open !== undefined) syncOpen();
    },
    destroy() {
      doClose();
      listBody.dispose();
      for (const ref of rowRefs.values()) ref.dispose();
      rowRefs.clear();
      lifetime.dispose();
      p.destroy();
      el.remove();
    },
  };
}

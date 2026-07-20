import { cn } from "../../lib/cn";
import {
  Disposer,
  toNodes,
  type AnyZenComponent,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { Button } from "../button/button";
import { Input } from "../form/input/input";
import { Checkbox } from "../form/checkbox/checkbox";
import { Icon } from "../icon/icon";
import { Dialog, type DialogHandle } from "../dialog/dialog";

/**
 * FilterBar — the vanilla port of the React reference. The structured filter area
 * above a table; the gap analysis calls the List Report unbuildable without it.
 *
 * Fields are data, not children, exactly as in React and Solid: a `render`
 * function per field keeps the control arbitrary while letting the "Adapt filters"
 * picker build its list from the same source. React reads a child's props with
 * `React.Children`; vanilla (like Solid) cannot, so a compound API could never
 * build the picker in both bindings — data is the only shape that ports.
 *
 *   const bar = FilterBar({
 *     fields: [{ id: "supplier", label: "Supplier", render: () => Input({ placeholder: "Any" }) }],
 *     onGo: runQuery,
 *   });
 *   document.querySelector("#list-report").prepend(bar.el);
 *
 * "Adapt filters" is a multi-select picker over the field labels — choosing which
 * filters are visible is exactly a searchable multi-select. The React binding
 * reuses its <SelectDialog> for this; the vanilla binding has no SelectDialog yet,
 * so the same behaviour (a search field, checkbox rows, a draft that only commits
 * on OK) is written out here on top of the vanilla Dialog.
 *
 * This bar collects and reveals; it does not filter. `onGo` is the caller's cue to
 * run the query, because only the caller knows what the controls mean.
 */

export interface FilterBarField {
  id: string;
  label: string;
  /** The control for this filter. Called once — the node is cached and moved. */
  render: () => Child;
  /** Kept off the bar until the user adds it via Adapt filters. */
  hiddenByDefault?: boolean;
}

/**
 * The prefix goes before the bracket. An unprefixed `[prop:value]` matches nothing
 * under ZEN_PREFIX and emits no CSS at all, which left the fields stacked
 * full-width under a perfectly green build. Copied verbatim from the React source.
 */
const FIELD_GRID = "zen-[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]";

/** Shared with the React select-list rows so the picker looks identical. */
const ROW_CLASS =
  "zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-sm zen-px-4 zen-py-2.5 zen-text-start";

export interface FilterBarProps {
  fields: FilterBarField[];
  /** Run the query. Without it, the Go button is not rendered. */
  onGo?: () => void;
  /** Clear the controls. Without it, the Clear button is not rendered. */
  onClear?: () => void;
  /** Slot for a variant / saved-view control. */
  variant?: Child;
  /** Controlled visible field ids. Uncontrolled default: everything not `hiddenByDefault`. */
  visibleIds?: string[];
  onVisibleIdsChange?: (ids: string[]) => void;
  /** The Adapt filters affordance. Default: true. */
  adaptable?: boolean;
  /** The collapse chevron. Default: true. */
  collapsible?: boolean;
  defaultExpanded?: boolean;
  goLabel?: string;
  clearLabel?: string;
  adaptLabel?: string;
  class?: string;
}

const isComponent = (v: unknown): v is AnyZenComponent =>
  typeof v === "object" && v !== null && "el" in v && "destroy" in v;

const arrayEquals = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

const CHEVRON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;

export function FilterBar(props: FilterBarProps): ZenComponent<FilterBarProps> {
  let current: FilterBarProps = { ...props };
  const disposer = new Disposer();

  // Visible-ids state: controlled when `visibleIds` is passed, else everything not
  // hidden-by-default. Same semantics as the React useState + isControlled dance.
  const visibleState = controllable<string[]>({
    value: current.visibleIds,
    defaultValue: current.fields.filter((f) => !f.hiddenByDefault).map((f) => f.id),
    onChange: (ids) => current.onVisibleIdsChange?.(ids),
    equals: arrayEquals,
  });

  let expanded = current.defaultExpanded ?? true;

  // --- root layout, built once ---------------------------------------------
  const root = document.createElement("div");

  const header = document.createElement("div");
  header.className = "zen-flex zen-items-center zen-gap-2";

  const chevronBtn = document.createElement("button");
  chevronBtn.type = "button";
  chevronBtn.className =
    "zen-inline-flex zen-h-7 zen-w-7 zen-shrink-0 zen-cursor-pointer zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";
  chevronBtn.innerHTML = CHEVRON; // our own trusted markup, never a caller's string
  const chevronSvg = chevronBtn.firstElementChild as SVGElement;
  chevronBtn.addEventListener("click", () => {
    expanded = !expanded;
    paintHeader();
    paintBody();
  });

  // A slot the caller's `variant` node lives in, so re-passing it on update() is a
  // single replaceChildren rather than a header rebuild.
  const variantSlot = document.createElement("span");
  variantSlot.className = "zen-contents";

  const actions = document.createElement("div");
  actions.className = "zen-ml-auto zen-flex zen-items-center zen-gap-2";

  const adaptBtn = Button({
    variant: "ghost",
    color: "neutral",
    size: "sm",
    children: current.adaptLabel ?? "Adapt filters",
    onClick: () => openAdapt(),
  });
  const clearBtn = Button({
    variant: "outline",
    color: "neutral",
    size: "sm",
    children: current.clearLabel ?? "Clear",
    onClick: () => current.onClear?.(),
  });
  const goBtn = Button({
    size: "sm",
    children: current.goLabel ?? "Go",
    onClick: () => current.onGo?.(),
  });
  disposer.add(() => adaptBtn.destroy());
  disposer.add(() => clearBtn.destroy());
  disposer.add(() => goBtn.destroy());

  header.append(chevronBtn, variantSlot, actions);

  // The expandable body: either the field grid, an empty message, or nothing.
  const body = document.createElement("div");

  root.append(header, body);

  // --- field controls, built once and cached -------------------------------
  // Each field's control is created exactly once. React reconciles by key and
  // keeps a controlled input's value; here the node IS the state, so building it
  // once and moving it is what preserves a half-typed value across collapse /
  // Adapt. The <label> wrapper is cached with it.
  const fieldWraps = new Map<string, HTMLElement>();
  const fieldComponents: AnyZenComponent[] = [];

  const buildFieldWrap = (f: FilterBarField): HTMLElement => {
    const existing = fieldWraps.get(f.id);
    if (existing) return existing;

    const wrap = document.createElement("label");
    wrap.className = "zen-flex zen-flex-col zen-gap-1";

    const labelSpan = document.createElement("span");
    labelSpan.className = "zen-text-xs zen-font-medium zen-text-zen-muted-fg";
    labelSpan.textContent = f.label;

    const control = f.render();
    if (isComponent(control)) fieldComponents.push(control);

    wrap.append(labelSpan, ...toNodes(control));
    fieldWraps.set(f.id, wrap);
    return wrap;
  };

  // --- Adapt filters dialog -------------------------------------------------
  // A self-contained multi-select picker: search field, checkbox rows, a draft
  // that only commits on OK. Mirrors the React <SelectDialog multiple> the React
  // FilterBar hands its fields to.
  let adaptDlg: DialogHandle | null = null;
  let draft: string[] = [];
  let query = "";
  const rowComponents: AnyZenComponent[] = [];

  let searchInput: ZenComponent<Record<string, unknown>, HTMLInputElement> | null = null;
  const listBody = document.createElement("div");
  listBody.className = "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2";

  const toggleDraft = (id: string) => {
    draft = draft.includes(id) ? draft.filter((x) => x !== id) : [...draft, id];
    paintAdaptFooter();
  };

  // OK reports the selection in field order, not the order the user ticked — which
  // rows were clicked first is not information the caller should untangle. Copied
  // from the React SelectDialog rule.
  const inListOrder = (ids: string[]) => {
    const picked = new Set(ids);
    const known = current.fields.filter((f) => picked.has(f.id)).map((f) => f.id);
    const seen = new Set(known);
    return [...known, ...ids.filter((id) => !seen.has(id))];
  };

  const renderAdaptList = () => {
    for (const c of rowComponents) c.destroy();
    rowComponents.length = 0;

    const q = query.trim().toLowerCase();
    const items = current.fields
      .map((f) => ({ id: f.id, label: f.label }))
      .filter((it) => !q || it.label.toLowerCase().includes(q));

    listBody.replaceChildren();

    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className =
        "zen-m-0 zen-px-4 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      empty.textContent = "No matching items";
      listBody.append(empty);
      return;
    }

    const ul = document.createElement("ul");
    ul.className = "zen-m-0 zen-flex zen-list-none zen-flex-col zen-p-0";
    for (const it of items) {
      const li = document.createElement("li");
      const row = document.createElement("label");
      row.className = cn(ROW_CLASS, "zen-cursor-pointer hover:zen-bg-zen-muted");

      // Uncontrolled: the box owns its own tick and reports it, so the draft and
      // the box stay in lockstep without re-rendering the whole list on each
      // click (which would rebuild every row and drop focus). React's SelectDialog
      // re-renders instead; here the cheaper path is behaviourally identical.
      const cb = Checkbox({
        defaultChecked: draft.includes(it.id),
        onCheckedChange: () => toggleDraft(it.id),
      });
      rowComponents.push(cb);

      const bodySpan = document.createElement("span");
      bodySpan.className = "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col";
      const rowLabel = document.createElement("span");
      rowLabel.className = "zen-truncate zen-text-sm";
      rowLabel.textContent = it.label;
      bodySpan.append(rowLabel);

      row.append(cb.el, bodySpan);
      li.append(row);
      ul.append(li);
    }
    listBody.append(ul);
  };

  let clearAllBtn: ZenComponent<Record<string, unknown>> | null = null;
  const paintAdaptFooter = () => {
    clearAllBtn?.update({ disabled: draft.length === 0 });
  };

  const buildAdaptDialog = (): DialogHandle => {
    const searchWrap = document.createElement("div");
    searchWrap.className = "zen-relative zen-mt-1";
    const searchIcon = Icon({
      name: "search",
      size: 14,
      class:
        "zen-pointer-events-none zen-absolute zen-left-3 zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg",
    });
    searchInput = Input({
      placeholder: "Search",
      "aria-label": "Search",
      class: "zen-pl-9",
      onInput: (e) => {
        query = (e.target as HTMLInputElement).value;
        renderAdaptList();
      },
    }) as unknown as ZenComponent<Record<string, unknown>, HTMLInputElement>;
    searchWrap.append(searchIcon.el, searchInput.el);

    const bodyWrap = document.createElement("div");
    bodyWrap.className = "zen-flex zen-min-h-0 zen-flex-col zen-gap-3";
    bodyWrap.append(searchWrap, listBody);

    clearAllBtn = Button({
      variant: "ghost",
      color: "neutral",
      size: "sm",
      disabled: true,
      class: "zen-mr-auto",
      children: "Clear",
      onClick: () => {
        draft = [];
        renderAdaptList();
        paintAdaptFooter();
      },
    }) as unknown as ZenComponent<Record<string, unknown>>;
    const cancelBtn = Button({
      variant: "outline",
      color: "neutral",
      size: "sm",
      children: "Cancel",
      onClick: () => adaptDlg?.close(),
    });
    const okBtn = Button({
      size: "sm",
      children: "OK",
      onClick: () => {
        // Uncontrolled -> subscribe repaints the body. Controlled -> the caller
        // feeds the new ids back through update(), which repaints. Painting here
        // too would flash the stale grid in the controlled case.
        visibleState.set(inListOrder(draft));
        adaptDlg?.close();
      },
    });

    const dlg = Dialog({
      title: current.adaptLabel ?? "Adapt filters",
      description: "Choose which filters appear on the bar.",
      class: "zen-flex zen-max-h-[85vh] zen-flex-col",
      children: bodyWrap,
      footer: [clearAllBtn.el, cancelBtn.el, okBtn.el],
    });
    disposer.add(() => clearAllBtn?.destroy());
    disposer.add(() => cancelBtn.destroy());
    disposer.add(() => okBtn.destroy());
    disposer.add(() => searchIcon.destroy());
    disposer.add(() => dlg.destroy());
    return dlg;
  };

  const openAdapt = () => {
    if (!adaptDlg) adaptDlg = buildAdaptDialog();
    // A picker is a fresh question each time it opens: re-seed the draft from the
    // committed selection and drop the previous search.
    draft = [...visibleState.get()];
    query = "";
    searchInput?.update({ value: "" });
    renderAdaptList();
    paintAdaptFooter();
    adaptDlg.open();
  };

  // --- painters -------------------------------------------------------------
  const paintHeader = () => {
    root.className = cn(
      "zen-flex zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-4 zen-py-3",
      current.class,
    );

    const collapsible = current.collapsible ?? true;
    chevronBtn.hidden = !collapsible;
    chevronBtn.setAttribute("aria-expanded", String(expanded));
    chevronBtn.setAttribute("aria-label", expanded ? "Collapse filters" : "Expand filters");
    chevronSvg.setAttribute(
      "class",
      cn("zen-transition-transform", expanded && "zen-rotate-90"),
    );

    variantSlot.replaceChildren(...toNodes(current.variant));

    adaptBtn.update({ children: current.adaptLabel ?? "Adapt filters" });
    clearBtn.update({ children: current.clearLabel ?? "Clear" });
    goBtn.update({ children: current.goLabel ?? "Go" });

    const adaptable = current.adaptable ?? true;
    const parts: Node[] = [];
    if (adaptable) parts.push(adaptBtn.el);
    if (current.onClear) parts.push(clearBtn.el);
    if (current.onGo) parts.push(goBtn.el);
    actions.replaceChildren(...parts);
  };

  const paintBody = () => {
    body.replaceChildren();
    if (!expanded) return;

    const visible = visibleState.get();
    // Field order is the caller's, not the order they were ticked in Adapt.
    const shown = current.fields.filter((f) => visible.includes(f.id));

    if (shown.length) {
      const grid = document.createElement("div");
      grid.className = cn("zen-grid zen-gap-3", FIELD_GRID);
      for (const f of shown) grid.append(buildFieldWrap(f));
      body.append(grid);
    } else {
      const p = document.createElement("p");
      p.className = "zen-m-0 zen-py-2 zen-text-sm zen-text-zen-muted-fg";
      p.textContent = `No filters shown. Use ${current.adaptLabel ?? "Adapt filters"} to add some.`;
      body.append(p);
    }
  };

  disposer.add(
    visibleState.subscribe(() => {
      paintBody();
    }),
  );

  paintHeader();
  paintBody();

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      if (next.visibleIds !== undefined) visibleState.sync(next.visibleIds);
      paintHeader();
      paintBody();
    },
    destroy() {
      for (const c of fieldComponents) c.destroy();
      for (const c of rowComponents) c.destroy();
      disposer.dispose();
      root.remove();
    },
  };
}

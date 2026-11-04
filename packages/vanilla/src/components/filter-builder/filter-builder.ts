import {
  addNode,
  changeField,
  changeOperator,
  describeFilter,
  newCondition,
  newGroup,
  operatorArity,
  operatorLabel,
  operatorsFor,
  removeNode,
  updateNode,
  type FilterCondition,
  type FilterField,
  type FilterGroup,
  type FilterNode,
  type FilterOperator,
  type FilterValue,
} from "@algorisys/zen-ui-core/filter";
import { cn } from "../../lib/cn";
import { Disposer, type ZenComponent } from "../../lib/component";
import { Button } from "../button/button";
import { Input } from "../form/input/input";
import { NumberField } from "../form/number-field/number-field";
import { Select, type SelectOption } from "../form/select/select";
import { DateInput } from "../form/date-picker/date-input";
import { MultiCombobox } from "../combobox/multi-combobox";
import { Icon } from "../icon/icon";
import { useLocale, withLocale, type MessageKey } from "../locale/locale";

export type { FilterField, FilterGroup, FilterNode, FilterCondition, FilterOperator };

/**
 * FilterBuilder — nested AND/OR conditions on any field, edited as a tree:
 * "status is Overdue AND (customer is one of A, B OR amount > 1,00,000)".
 *
 *   const fb = FilterBuilder({
 *     fields,
 *     value: filter,
 *     onValueChange: (next) => fb.update({ value: (filter = next) }),
 *   });
 *   host.append(fb.el);
 *
 * The value is one plain object (a FilterGroup): save it, send it to the server
 * as report criteria, put it in a saved view, or filter rows here with
 * `filterPredicate` from @algorisys/zen-ui-core/filter. Each field's type
 * decides its operators and its value editor: text, number, date (typed, with
 * a calendar), a list of choices, or yes/no. A condition still missing its
 * value filters nothing, and the summary under the builder says in words what
 * the filter does now.
 *
 * Each group's "Match" covers all four meanings (all, any, none, not all), so
 * NOT is never a separate checkbox to miss. The pure half is
 * @algorisys/zen-ui-core/filter (check:filter).
 *
 * Nothing re-renders here, so `update({ value })` RECONCILES: rows and groups
 * are matched to the new tree by node id and only what changed is written.
 * Every edit builds a new tree, and a row matched by anything else (position,
 * object identity) would be rebuilt under the user's caret on each keystroke;
 * Solid hit exactly that keying rows by object. A value handed in through
 * `update()` is shown, never reported back.
 */
export interface FilterBuilderProps {
  fields: FilterField[];
  /** Controlled: present means the caller owns it and pushes each change back with update(). */
  value?: FilterGroup;
  defaultValue?: FilterGroup;
  onValueChange?: (value: FilterGroup) => void;
  /** How deep groups may nest. Default 3 (the top group and two levels inside it). */
  maxDepth?: number;
  /** The summary in words under the builder. Default true. */
  showSummary?: boolean;
  /** Spell a value in the summary (a currency, a local date). Default: as stored. */
  formatValue?: (value: string | number, field: FilterField) => string;
  /** Names the whole builder for assistive tech. Default "Filter". */
  "aria-label"?: string;
  class?: string;
}

type MatchMode = "all" | "any" | "none" | "notAll";
const MATCH_MODES: MatchMode[] = ["all", "any", "none", "notAll"];
const modeOf = (g: FilterGroup): MatchMode =>
  g.join === "and" ? (g.not ? "notAll" : "all") : g.not ? "none" : "any";
const groupOf = (m: MatchMode): Pick<FilterGroup, "join" | "not"> => ({
  join: m === "all" || m === "notAll" ? "and" : "or",
  not: m === "none" || m === "notAll",
});

/** "2026-03-15" <-> a local Date, for DateInput. */
const toDate = (v: FilterValue | undefined): Date | null => {
  if (typeof v !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};
const toIso = (d: Date | null | undefined): string | null => {
  if (!d) return null;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const FIELD_TYPES: FilterField["type"][] = ["text", "number", "date", "enum", "boolean"];
const NO_OPTIONS: SelectOption[] = [];

const h = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
};

/** The vanilla Select keeps its trigger internal and names it `${id}-trigger`; the name goes on it, as Radix's does. */
const triggerOf = (el: Element): HTMLElement | null => el.querySelector<HTMLElement>('[role="combobox"]');

/** One row or one group, matched to the tree by node id. */
interface View {
  readonly kind: FilterNode["kind"];
  readonly el: HTMLElement;
  sync(node: FilterNode): void;
  destroy(): void;
}

let seq = 0;

export function FilterBuilder(props: FilterBuilderProps): ZenComponent<FilterBuilderProps> {
  let current: FilterBuilderProps = { ...props };
  const loc = useLocale();
  const uid = `zen-filter-${++seq}`;
  const controlled = current.value !== undefined;
  // The tree on screen, and the tree the next edit builds on: two edits in one
  // event (before a controlled caller has answered the first) must not lose one.
  let root: FilterGroup = current.value ?? current.defaultValue ?? newGroup();
  let latest = root;

  const maxDepth = () => current.maxDepth ?? 3;
  const fieldOf = (id: string) => current.fields.find((f) => f.id === id);
  const controlId = (nodeId: string, part: string) => `${uid}-${nodeId}-${part}`;
  /** The focusable element for a part: the Select's trigger for field and match, the element itself otherwise. */
  const focusId = (nodeId: string, part: string) =>
    part === "field" || part === "match" || part === "op" ? `${controlId(nodeId, part)}-trigger` : controlId(nodeId, part);

  // Core builds the words by catalogue key through `say`, so a translation reaches the summary and the operator menu.
  const say = (key: string, values?: Record<string, string | number>) => loc.t(key as MessageKey, values);
  // Option lists are built once per input and handed over by identity, so a
  // select is only rebuilt when its list really changed.
  const matchOptions: SelectOption[] = MATCH_MODES.map((m) => ({ value: m, label: loc.t(`filterBuilder.${m}`) }));
  const opLists = new Map(
    FIELD_TYPES.map((type) => [type, operatorsFor(type).map((op) => ({ value: op, label: operatorLabel(op, type, say) }))]),
  );
  let fieldOptions: SelectOption[] = [];
  let fieldsSeen: FilterField[] | undefined;
  const refreshFieldOptions = () => {
    if (fieldsSeen === current.fields) return;
    fieldsSeen = current.fields;
    fieldOptions = current.fields.map((f) => ({ value: f.id, label: f.label }));
  };
  refreshFieldOptions();

  // Conditions numbered in reading order, for labels: "Condition 3, field".
  let numbers = new Map<string, number>();
  const renumber = () => {
    numbers = new Map();
    let n = 0;
    const walk = (node: FilterNode) => {
      if (node.kind === "condition") numbers.set(node.id, ++n);
      else node.children.forEach(walk);
    };
    walk(root);
  };

  const findGroup = (node: FilterNode, id: string): FilterGroup | undefined => {
    if (node.kind !== "group") return undefined;
    if (node.id === id) return node;
    for (const c of node.children) {
      const hit = findGroup(c, id);
      if (hit) return hit;
    }
    return undefined;
  };

  /* ---------------- edits and focus ---------------- */

  // Focus a control once the edit that creates it has been drawn.
  let pendingFocus: string | null = null;
  const flushFocus = () => {
    if (!pendingFocus) return;
    const target = document.getElementById(pendingFocus);
    if (!target) return;
    pendingFocus = null;
    target.focus();
  };

  const edit = (fn: (root: FilterGroup) => FilterGroup) => {
    const next = fn(latest);
    latest = next;
    if (!controlled) {
      root = next;
      render();
    }
    current.onValueChange?.(next);
    flushFocus();
    // A controlled caller that answers later than this event still gets its focus.
    if (pendingFocus) queueMicrotask(flushFocus);
  };

  const addCondition = (groupId: string) => {
    const first = current.fields[0];
    if (!first) return;
    const c = newCondition(first);
    pendingFocus = focusId(c.id, "field");
    edit((r) => addNode(r, groupId, c));
  };
  const addGroup = (groupId: string) => {
    const first = current.fields[0];
    if (!first) return;
    const c = newCondition(first);
    pendingFocus = focusId(c.id, "field");
    edit((r) => addNode(r, groupId, newGroup("and", [c])));
  };
  /** Remove a node; focus goes to the next row's first control, else the previous one's, else the group's "Condition" button. */
  const remove = (id: string, parentId: string) => {
    const parent = findGroup(latest, parentId);
    if (!parent) return;
    const siblings = parent.children;
    const at = siblings.findIndex((s) => s.id === id);
    const neighbour = siblings[at + 1] ?? siblings[at - 1];
    pendingFocus = !neighbour
      ? focusId(parent.id, "add")
      : focusId(neighbour.id, neighbour.kind === "condition" ? "field" : "match");
    edit((r) => removeNode(r, id));
  };

  /* ---------------- a condition row ---------------- */

  // Built later than the factory call, so inside the locale it was built in (see withLocale).
  const ConditionView = (id: string, parentId: string, first: FilterCondition): View => withLocale(loc, () => ConditionViewNow(id, parentId, first));
  const ConditionViewNow = (id: string, parentId: string, first: FilterCondition): View => {
    let c = first;
    const disposer = new Disposer();
    const el = h("div", "zen-flex zen-flex-wrap zen-items-center zen-gap-2");
    el.dataset.filterCondition = id;

    const setValue = (patch: Partial<FilterCondition>) => {
      const cur = c as unknown as Record<string, unknown>;
      if (Object.entries(patch).every(([k, v]) => JSON.stringify(cur[k]) === JSON.stringify(v))) return;
      edit((r) => updateNode(r, id, patch));
    };

    // What each select was last given, so an unchanged one is left alone (a
    // vanilla Select's update() rebuilds its trigger and list). A controlled
    // Select shows only what it is handed: its pick comes back through sync().
    let shownField = c.field;
    let shownFieldOptions = fieldOptions;
    const fieldSel = Select({
      id: controlId(id, "field"),
      options: fieldOptions,
      value: c.field,
      class: "zen-w-40",
      onValueChange: (v) => {
        // Only a real change: a select may report the value it already has.
        const f = v !== c.field ? fieldOf(v) : undefined;
        if (f) edit((r) => changeField(r, id, f, current.fields));
      },
    });
    disposer.add(() => fieldSel.destroy());

    const opsFor = (cond: FilterCondition) => {
      const t = fieldOf(cond.field)?.type;
      return (t && opLists.get(t)) || NO_OPTIONS;
    };
    let shownOp = c.op;
    let shownOps = opsFor(c);
    const opSel = Select({
      id: controlId(id, "op"),
      options: shownOps,
      value: c.op,
      class: "zen-w-44",
      onValueChange: (op) => {
        if (op && op !== c.op) edit((r) => changeOperator(r, id, op as FilterOperator));
      },
    });
    disposer.add(() => opSel.destroy());

    const removeBtn = Button({
      variant: "ghost",
      color: "neutral",
      shape: "square",
      size: "sm",
      class: "zen-ms-auto zen-shrink-0",
      children: Icon({ name: "x", size: 16 }),
      onClick: () => remove(id, parentId),
    });
    removeBtn.el.setAttribute("title", loc.t("filterBuilder.removeCondition"));
    disposer.add(() => removeBtn.destroy());

    el.append(fieldSel.el, opSel.el, removeBtn.el);

    /* The value editors: rebuilt only when the operator's arity or the field's
       TYPE changes. An edit to the value itself keeps the same input, focus and
       caret, which is what typing needs. */
    let editorKey = "";
    let editorNodes: Node[] = [];
    let editorScope = new Disposer();
    let editorSyncs: Array<() => void> = [];
    let labelSyncs: Array<() => void> = [];
    disposer.add(() => editorScope.dispose());

    const srLabel = (part: string, text: () => string) => {
      const l = h("label", "zen-sr-only");
      l.htmlFor = controlId(id, part);
      labelSyncs.push(() => {
        const t = text();
        if (l.textContent !== t) l.textContent = t;
      });
      return l;
    };

    const valueEditor = (which: "value" | "valueTo", type: FilterField["type"] | undefined): Node | null => {
      const cid = controlId(id, which);
      if (type === "number") {
        const asNumber = () => (typeof c[which] === "number" ? (c[which] as number) : null);
        let shown = asNumber();
        const nf = NumberField({
          id: cid,
          value: shown,
          class: "zen-w-44",
          onValueChange: (x) => {
            // Controlled: the field shows what it is handed, so hand it back.
            nf.update({ value: (shown = x) });
            setValue({ [which]: x });
          },
        });
        editorScope.add(() => nf.destroy());
        editorSyncs.push(() => {
          const v = asNumber();
          if (v !== shown) nf.update({ value: (shown = v) });
        });
        return nf.el;
      }
      if (type === "date") {
        let shown = typeof c[which] === "string" ? (c[which] as string) : null;
        const di = DateInput({
          id: cid,
          value: toDate(c[which]),
          onValueChange: (d) => {
            shown = toIso(d);
            di.update({ value: d });
            setValue({ [which]: shown });
          },
        });
        editorScope.add(() => di.destroy());
        editorSyncs.push(() => {
          const v = typeof c[which] === "string" ? (c[which] as string) : null;
          if (v !== shown) di.update({ value: toDate((shown = v)) });
        });
        return di.el;
      }
      if (type === "text") {
        const asText = () => (typeof c[which] === "string" ? (c[which] as string) : "");
        const input = Input({
          id: cid,
          value: asText(),
          class: "zen-w-48",
          onInput: (e) => setValue({ [which]: (e.currentTarget as HTMLInputElement).value }),
        });
        editorScope.add(() => input.destroy());
        // Input writes the property only when it differs, so the caret stays put.
        editorSyncs.push(() => input.update({ value: asText() }));
        return input.el;
      }
      return null;
    };

    const buildEditors = (arity: ReturnType<typeof operatorArity>, type: FilterField["type"] | undefined) => {
      editorScope.dispose();
      editorScope = new Disposer();
      for (const n of editorNodes) n.parentNode?.removeChild(n);
      editorNodes = [];
      editorSyncs = [];
      labelSyncs = [];
      const n = () => numbers.get(id) ?? 0;

      if (arity === "list") {
        const wrap = h("div", "zen-min-w-48 zen-flex-1");
        const chosen = () => (Array.isArray(c.value) ? c.value : []);
        let shownChoices = fieldOf(c.field)?.options ?? NO_OPTIONS;
        let shownValues = chosen();
        const mc = MultiCombobox({
          options: shownChoices,
          value: shownValues,
          placeholder: loc.t("filterBuilder.choose"),
          onValueChange: (vs) => {
            mc.update({ value: (shownValues = vs) });
            setValue({ value: vs });
          },
        });
        editorScope.add(() => mc.destroy());
        wrap.append(mc.el);
        labelSyncs.push(() => triggerOf(wrap)?.setAttribute("aria-label", loc.t("filterBuilder.values", { n: n() })));
        editorSyncs.push(() => {
          const choices = fieldOf(c.field)?.options ?? NO_OPTIONS;
          const values = chosen();
          const patch: { options?: typeof choices; value?: string[] } = {};
          if (choices !== shownChoices) patch.options = shownChoices = choices;
          if (JSON.stringify(values) !== JSON.stringify(shownValues)) patch.value = shownValues = values;
          if (patch.options || patch.value) mc.update(patch);
        });
        editorNodes.push(wrap);
      }
      if (arity === 1 || arity === 2) {
        const ed = valueEditor("value", type);
        if (ed) {
          editorNodes.push(
            srLabel("value", () => loc.t(arity === 2 ? "filterBuilder.from" : "filterBuilder.value", { n: n() })),
            ed,
          );
        }
      }
      if (arity === 2) {
        const ed = valueEditor("valueTo", type);
        if (ed) {
          const and = h("span", "zen-text-sm zen-text-zen-muted-fg");
          and.setAttribute("aria-hidden", "true");
          and.textContent = loc.t("filterBuilder.and");
          editorNodes.push(and, srLabel("valueTo", () => loc.t("filterBuilder.to", { n: n() })), ed);
        }
      }
      for (const node of editorNodes) el.insertBefore(node, removeBtn.el);
    };

    const sync = (node: FilterNode) => {
      if (node.kind !== "condition") return;
      c = node;
      const n = numbers.get(id) ?? 0;
      const type = fieldOf(c.field)?.type;
      const arity = operatorArity(c.op);

      if (shownFieldOptions !== fieldOptions || shownField !== c.field) {
        shownFieldOptions = fieldOptions;
        shownField = c.field;
        fieldSel.update({ options: fieldOptions, value: c.field });
      }
      const ops = opsFor(c);
      if (shownOps !== ops || shownOp !== c.op) {
        shownOps = ops;
        shownOp = c.op;
        opSel.update({ options: ops, value: c.op });
      }
      triggerOf(fieldSel.el)?.setAttribute("aria-label", loc.t("filterBuilder.field", { n }));
      triggerOf(opSel.el)?.setAttribute("aria-label", loc.t("filterBuilder.operator", { n }));
      removeBtn.el.setAttribute("aria-label", loc.t("filterBuilder.removeConditionN", { n }));

      const key = `${arity}|${type}`;
      if (key !== editorKey) {
        editorKey = key;
        buildEditors(arity, type);
      } else {
        for (const s of editorSyncs) s();
      }
      for (const s of labelSyncs) s();
    };

    sync(first);
    return {
      kind: "condition",
      el,
      sync,
      destroy() {
        disposer.dispose();
        el.remove();
      },
    };
  };

  /* ---------------- a group ---------------- */

  const GroupView = (id: string, depth: number, parentId: string | undefined, first: FilterGroup): View => {
    let g = first;
    const nested = depth > 0;
    const disposer = new Disposer();
    const el = h(
      "div",
      cn(
        "zen-flex zen-flex-col zen-gap-2",
        nested && "zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-muted/40 zen-p-3",
      ),
    );
    el.setAttribute("role", "group");
    el.dataset.filterGroup = id;

    const head = h("div", "zen-flex zen-flex-wrap zen-items-center zen-gap-2");
    const matchLabel = h("label", "zen-text-sm zen-text-zen-muted-fg");
    matchLabel.htmlFor = focusId(id, "match");
    matchLabel.textContent = loc.t("filterBuilder.match");
    let shownMode = modeOf(g);
    const matchSel = Select({
      id: controlId(id, "match"),
      options: matchOptions,
      value: shownMode,
      class: "zen-w-36",
      onValueChange: (m) => {
        if (m && m !== modeOf(g)) edit((r) => updateNode(r, id, groupOf(m as MatchMode)));
      },
    });
    disposer.add(() => matchSel.destroy());
    const these = h("span", "zen-text-sm zen-text-zen-muted-fg");
    these.textContent = loc.t("filterBuilder.theseConditions");
    head.append(matchLabel, matchSel.el, these);
    if (nested && parentId) {
      const removeGroup = Button({
        variant: "ghost",
        color: "neutral",
        size: "sm",
        class: "zen-ms-auto",
        children: loc.t("filterBuilder.removeGroup"),
        onClick: () => remove(id, parentId),
      });
      disposer.add(() => removeGroup.destroy());
      head.append(removeGroup.el);
    }

    const body = h("div", cn("zen-flex zen-flex-col zen-gap-2", nested ? "" : "zen-ps-0"));
    const empty = h("p", "zen-m-0 zen-text-sm zen-text-zen-muted-fg");
    empty.textContent = nested ? loc.t("filterBuilder.emptyGroup") : loc.t("filterBuilder.emptyRoot");

    const foot = h("div", "zen-flex zen-flex-wrap zen-gap-2");
    const add = Button({
      id: controlId(id, "add"),
      variant: "outline",
      color: "neutral",
      size: "sm",
      iconLeft: Icon({ name: "plus", size: 14 }),
      children: loc.t("filterBuilder.addCondition"),
      onClick: () => addCondition(id),
    });
    const addGrp = Button({
      variant: "ghost",
      color: "neutral",
      size: "sm",
      iconLeft: Icon({ name: "plus", size: 14 }),
      children: loc.t("filterBuilder.addGroup"),
      onClick: () => addGroup(id),
    });
    disposer.add(() => add.destroy());
    disposer.add(() => addGrp.destroy());
    foot.append(add.el);

    el.append(head, body, foot);

    // Child views by node id: the reconcile key.
    const kids = new Map<string, View>();
    disposer.add(() => {
      for (const v of kids.values()) v.destroy();
      kids.clear();
    });

    const sync = (node: FilterNode) => {
      if (node.kind !== "group") return;
      g = node;
      const mode = modeOf(g);
      if (mode !== shownMode) matchSel.update({ value: (shownMode = mode) });
      el.setAttribute(
        "aria-label",
        nested
          ? loc.t("filterBuilder.groupLabel", { match: loc.t(`filterBuilder.${mode}`).toLowerCase() })
          : (current["aria-label"] ?? loc.t("filterBuilder.label")),
      );

      const seen = new Set<string>();
      let prev: Node | null = null;
      for (const child of g.children) {
        seen.add(child.id);
        let v = kids.get(child.id);
        if (v && v.kind !== child.kind) {
          v.destroy();
          v = undefined;
        }
        if (v) v.sync(child);
        else {
          v = child.kind === "group" ? GroupView(child.id, depth + 1, id, child) : ConditionView(child.id, id, child);
          kids.set(child.id, v);
        }
        // Move a node only when it is out of place: moving the focused row would blur it.
        const want: Node | null = prev ? prev.nextSibling : body.firstChild;
        if (want !== v.el) body.insertBefore(v.el, want);
        prev = v.el;
      }
      for (const [k, v] of kids) {
        if (!seen.has(k)) {
          v.destroy();
          kids.delete(k);
        }
      }
      if (g.children.length === 0) {
        if (!empty.isConnected || empty.parentNode !== body) body.append(empty);
      } else empty.remove();

      const canNest = depth + 1 < maxDepth();
      if (canNest && addGrp.el.parentNode !== foot) foot.append(addGrp.el);
      else if (!canNest) addGrp.el.remove();
    };

    sync(first);
    return {
      kind: "group",
      el,
      sync,
      destroy() {
        disposer.dispose();
        el.remove();
      },
    };
  };

  /* ---------------- the builder ---------------- */

  const el = h("div");
  const summary = h("p", "zen-m-0 zen-text-sm");
  summary.setAttribute("aria-live", "polite");
  summary.dataset.filterSummary = "";
  const shows = h("span", "zen-text-zen-muted-fg");
  shows.textContent = loc.t("filterBuilder.shows");
  const summaryText = document.createTextNode("");
  summary.append(shows, summaryText);

  let rootView: View | null = null;

  function render(): void {
    refreshFieldOptions();
    renumber();
    el.className = cn("zen-flex zen-flex-col zen-gap-3", current.class);
    if (rootView && (rootView.kind !== "group" || el.firstChild !== rootView.el || root.id !== rootId)) {
      rootView.destroy();
      rootView = null;
    }
    if (rootView) rootView.sync(root);
    else {
      rootView = GroupView(root.id, 0, undefined, root);
      rootId = root.id;
      el.prepend(rootView.el);
    }
    if (current.showSummary !== false) {
      // Written only when it changed, so the live region says it once.
      const text = describeFilter(root, current.fields, current.formatValue, say) || loc.t("filterBuilder.showsEverything");
      if (summaryText.data !== text) summaryText.data = text;
      if (summary.parentNode !== el) el.append(summary);
    } else summary.remove();
  }
  let rootId = root.id;

  render();

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      // A value handed in is shown, not reported back.
      if (next.value !== undefined) {
        root = next.value;
        latest = root;
      }
      render();
      flushFocus();
    },
    destroy() {
      rootView?.destroy();
      rootView = null;
      el.remove();
    },
  };
}

import { For, Match, Show, Switch, createMemo, createSignal, createUniqueId, splitProps, untrack } from "solid-js";
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
import { Button } from "../button/button";
import { Input } from "../form/input/input";
import { NumberField } from "../form/number-field/number-field";
import { Select } from "../form/select/select";
import { DateInput } from "../form/date-picker/date-input";
import { MultiCombobox } from "../combobox/multi-combobox";
import { Icon } from "../icon/icon";
import { useLocale } from "../locale/locale";

export type { FilterField, FilterGroup, FilterNode, FilterCondition, FilterOperator };

/**
 * FilterBuilder — nested AND/OR conditions on any field, edited as a tree:
 * "status is Overdue AND (customer is one of A, B OR amount > 1,00,000)".
 *
 *   <FilterBuilder fields={fields} value={filter()} onValueChange={setFilter} />
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
 */
export type FilterBuilderProps = {
  fields: FilterField[];
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
};

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
const toIso = (d: Date | null): string | null => {
  if (!d) return null;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const FilterBuilder = (props: FilterBuilderProps) => {
  const loc = useLocale();
  const [local] = splitProps(props, [
    "fields", "value", "defaultValue", "onValueChange", "maxDepth", "showSummary", "formatValue", "aria-label", "class",
  ]);
  const uid = createUniqueId();
  // The initial value seeds it; the user owns it after.
  const [internal, setInternal] = createSignal<FilterGroup>(local.defaultValue ?? newGroup());
  const root = () => local.value ?? internal();
  const set = (next: FilterGroup) => {
    if (local.value === undefined) setInternal(next);
    local.onValueChange?.(next);
  };
  const maxDepth = () => local.maxDepth ?? 3;
  const fieldOf = (id: string) => local.fields.find((f) => f.id === id);

  // Every node by id. Rows and groups are keyed by id, never by object: each
  // edit builds a new tree, and keying by object would re-create the row being
  // typed into (and lose its focus) on every keystroke.
  const byId = createMemo(() => {
    const map = new Map<string, FilterNode>();
    const walk = (node: FilterNode) => {
      map.set(node.id, node);
      if (node.kind === "group") node.children.forEach(walk);
    };
    walk(root());
    return map;
  });
  const nodeOf = (id: string) => byId().get(id);

  // Conditions numbered in reading order, for labels: "Condition 3, field".
  const numbers = createMemo(() => {
    const map = new Map<string, number>();
    let n = 0;
    const walk = (node: FilterNode) => {
      if (node.kind === "condition") map.set(node.id, ++n);
      else node.children.forEach(walk);
    };
    walk(root());
    return map;
  });
  const controlId = (nodeId: string, part: string) => `${uid}-${nodeId}-${part}`;
  /** Focus a control once it exists (after the edit that creates it has rendered). */
  const focusLater = (id: string) =>
    queueMicrotask(() => requestAnimationFrame(() => document.getElementById(id)?.focus()));

  const addCondition = (group: FilterGroup) => {
    const first = local.fields[0];
    if (!first) return;
    const c = newCondition(first);
    set(addNode(root(), group.id, c));
    focusLater(controlId(c.id, "field"));
  };
  const addGroup = (group: FilterGroup) => {
    const first = local.fields[0];
    if (!first) return;
    const c = newCondition(first);
    set(addNode(root(), group.id, newGroup("and", [c])));
    focusLater(controlId(c.id, "field"));
  };
  /** Remove a node; focus goes to the next row's first control, else the previous one's, else the group's "Condition" button. */
  const remove = (id: string, parentId: string) => {
    const parent = nodeOf(parentId) as FilterGroup | undefined;
    if (!parent) return;
    const siblings = parent.children;
    const at = siblings.findIndex((s) => s.id === id);
    const neighbour = siblings[at + 1] ?? siblings[at - 1];
    set(removeNode(root(), id));
    if (!neighbour) focusLater(controlId(parent.id, "add"));
    else focusLater(neighbour.kind === "condition" ? controlId(neighbour.id, "field") : controlId(neighbour.id, "match"));
  };

  const summary = () => describeFilter(root(), local.fields, local.formatValue);
  // Option lists are built once per input, not per render: Kobalte reports the
  // selection again when its options change identity, and an edit answering that
  // report rebuilt the options, which reported again (a stack overflow, measured).
  const matchOptions = createMemo(() => MATCH_MODES.map((value) => ({ value, label: loc.t(`filterBuilder.${value}`) })));
  const fieldOptions = createMemo(() => local.fields.map((f) => ({ value: f.id, label: f.label })));
  const opOptions = new Map<string, { value: string; label: string }[]>();
  const operatorOptions = (type: FilterField["type"]) => {
    let list = opOptions.get(type);
    if (!list) opOptions.set(type, (list = operatorsFor(type).map((op) => ({ value: op, label: operatorLabel(op, type) }))));
    return list;
  };

  const ConditionRow = (props: { id: string; parentId: string }) => {
    // The live condition for this row's id, or the last one seen: while a
    // removed row is torn down its id is already gone from the tree.
    let last: FilterCondition | undefined;
    const p = {
      get c(): FilterCondition {
        const node = nodeOf(props.id);
        if (node?.kind === "condition") last = node;
        return last!;
      },
    };
    const n = () => numbers().get(props.id) ?? 0;
    const field = () => fieldOf(p.c.field);
    // The editor depends on the field's TYPE only, memoised: anything that read
    // the field itself re-ran on every edit (the tree is rebuilt) and rebuilt the
    // input being typed into, losing its focus after one character.
    const fieldType = createMemo(() => field()?.type);
    const arity = createMemo(() => operatorArity(p.c.op));
    // A memo passed as a call, not a ternary in the prop: Solid compiles a
    // conditional prop to a memo made on each read, and Kobalte reads options
    // outside any root (leaking one each time).
    const choices = createMemo(() => field()?.options ?? []);
    const chosen = () => { const x = p.c.value; return Array.isArray(x) ? x : []; };
    const opList = createMemo(() => {
      const t = fieldType();
      return t ? operatorOptions(t) : [];
    });
    const setValue = (patch: Partial<FilterCondition>) => {
      const c = p.c as unknown as Record<string, unknown>;
      if (Object.entries(patch).every(([k, v]) => JSON.stringify(c[k]) === JSON.stringify(v))) return;
      set(updateNode(root(), p.c.id, patch));
    };
    const SrLabel = (q: { part: string; text: string }) => (
      <label for={controlId(p.c.id, q.part)} class="zen-sr-only">{q.text}</label>
    );
    const valueEditor = (which: "value" | "valueTo") => {
      const id = controlId(props.id, which);
      const v = () => p.c[which];
      // Plain calls, not ternaries in the props (see opList).
      const asNumber = () => { const x = v(); return typeof x === "number" ? x : null; };
      const asText = () => { const x = v(); return typeof x === "string" ? x : ""; };
      return (
        <Switch>
          <Match when={fieldType() === "number"}>
            <NumberField
              id={id}
              value={asNumber()}
              onValueChange={(x) => setValue({ [which]: x })}
              class="zen-w-44"
            />
          </Match>
          <Match when={fieldType() === "date"}>
            <DateInput id={id} value={toDate(v())} onValueChange={(d) => setValue({ [which]: toIso(d) })} />
          </Match>
          <Match when={fieldType() === "text"}>
            <Input
              id={id}
              value={asText()}
              onInput={(e) => setValue({ [which]: e.currentTarget.value })}
              class="zen-w-48"
            />
          </Match>
        </Switch>
      );
    };
    return (
      <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2" data-filter-condition={p.c.id}>
        <Select
          id={controlId(p.c.id, "field")}
          aria-label={loc.t("filterBuilder.field", { n: n() })}
          options={fieldOptions()}
          value={p.c.field}
          onChange={(id) => {
            // Only a real change: a select may report the value it already has.
            const f = id && id !== p.c.field ? fieldOf(id) : undefined;
            if (f) set(changeField(root(), p.c.id, f, local.fields));
          }}
          class="zen-w-40"
        />
        <Select
          id={controlId(p.c.id, "op")}
          aria-label={loc.t("filterBuilder.operator", { n: n() })}
          options={opList()}
          value={p.c.op}
          onChange={(op) => op && op !== p.c.op && set(changeOperator(root(), p.c.id, op as FilterOperator))}
          class="zen-w-44"
        />
        <Show when={arity() === "list"}>
          <div class="zen-min-w-48 zen-flex-1">
            <MultiCombobox
              aria-label={loc.t("filterBuilder.values", { n: n() })}
              options={choices()}
              value={chosen()}
              onValueChange={(vs) => setValue({ value: vs })}
              placeholder={loc.t("filterBuilder.choose")}
            />
          </div>
        </Show>
        <Show when={arity() === 1 || arity() === 2}>
          <SrLabel part="value" text={loc.t(arity() === 2 ? "filterBuilder.from" : "filterBuilder.value", { n: n() })} />
          {valueEditor("value")}
        </Show>
        <Show when={arity() === 2}>
          <span class="zen-text-sm zen-text-zen-muted-fg" aria-hidden="true">{loc.t("filterBuilder.and")}</span>
          <SrLabel part="valueTo" text={loc.t("filterBuilder.to", { n: n() })} />
          {valueEditor("valueTo")}
        </Show>
        <Button
          variant="ghost"
          color="neutral"
          shape="square"
          size="sm"
          aria-label={loc.t("filterBuilder.removeConditionN", { n: n() })}
          title={loc.t("filterBuilder.removeCondition")}
          onClick={() => remove(props.id, props.parentId)}
          class="zen-ms-auto zen-shrink-0"
        >
          <Icon name="x" size={16} />
        </Button>
      </div>
    );
  };

  const GroupView = (props: { id: string; depth: number; parentId?: string }) => {
    let last: FilterGroup | undefined;
    const p = {
      get g(): FilterGroup {
        const node = nodeOf(props.id);
        if (node?.kind === "group") last = node;
        return last!;
      },
      get depth() { return props.depth; },
    };
    const nested = () => p.depth > 0;
    const childIds = () => p.g?.children.map((c) => c.id) ?? [];
    return (
      <div
        role="group"
        aria-label={nested() ? loc.t("filterBuilder.groupLabel", { match: loc.t(`filterBuilder.${modeOf(p.g)}`).toLowerCase() }) : local["aria-label"] ?? loc.t("filterBuilder.label")}
        data-filter-group={p.g.id}
        class={cn(
          "zen-flex zen-flex-col zen-gap-2",
          nested() && "zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-muted/40 zen-p-3",
        )}
      >
        <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2">
          <label for={controlId(p.g.id, "match")} class="zen-text-sm zen-text-zen-muted-fg">{loc.t("filterBuilder.match")}</label>
          <Select
            id={controlId(p.g.id, "match")}
            options={matchOptions()}
            value={modeOf(p.g)}
            onChange={(m) => m && m !== modeOf(p.g) && set(updateNode(root(), p.g.id, groupOf(m as MatchMode)))}
            class="zen-w-36"
          />
          <span class="zen-text-sm zen-text-zen-muted-fg">{loc.t("filterBuilder.theseConditions")}</span>
          <Show when={nested() && props.parentId}>
            <Button
              variant="ghost"
              color="neutral"
              size="sm"
              onClick={() => remove(props.id, props.parentId!)}
              class="zen-ms-auto"
            >
              {loc.t("filterBuilder.removeGroup")}
            </Button>
          </Show>
        </div>
        <div class={cn("zen-flex zen-flex-col zen-gap-2", nested() ? "" : "zen-ps-0")}>
          <For each={childIds()}>
            {(id) =>
              // A node's kind never changes under an edit, so it is read once.
              untrack(() => nodeOf(id)?.kind) === "group" ? (
                <GroupView id={id} depth={p.depth + 1} parentId={props.id} />
              ) : (
                <ConditionRow id={id} parentId={props.id} />
              )
            }
          </For>
          <Show when={p.g.children.length === 0}>
            <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
              {nested() ? loc.t("filterBuilder.emptyGroup") : loc.t("filterBuilder.emptyRoot")}
            </p>
          </Show>
        </div>
        <div class="zen-flex zen-flex-wrap zen-gap-2">
          <Button
            id={controlId(p.g.id, "add")}
            variant="outline"
            color="neutral"
            size="sm"
            iconLeft={<Icon name="plus" size={14} />}
            onClick={() => addCondition(p.g)}
          >
            {loc.t("filterBuilder.addCondition")}
          </Button>
          <Show when={p.depth + 1 < maxDepth()}>
            <Button variant="ghost" color="neutral" size="sm" iconLeft={<Icon name="plus" size={14} />} onClick={() => addGroup(p.g)}>
              {loc.t("filterBuilder.addGroup")}
            </Button>
          </Show>
        </div>
      </div>
    );
  };

  return (
    <div class={cn("zen-flex zen-flex-col zen-gap-3", local.class)}>
      <GroupView id={root().id} depth={0} />
      <Show when={local.showSummary !== false}>
        <p class="zen-m-0 zen-text-sm" aria-live="polite" data-filter-summary="">
          <span class="zen-text-zen-muted-fg">{loc.t("filterBuilder.shows")}</span>
          {summary() || loc.t("filterBuilder.showsEverything")}
        </p>
      </Show>
    </div>
  );
};

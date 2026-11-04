import * as React from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../form/select/select";
import { Calendar } from "../form/date-picker/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { MultiCombobox } from "../combobox/multi-combobox";
import { Icon } from "../icon/icon";
import { useLocale, type LocaleContextValue, type MessageKey } from "../locale/locale";

export type { FilterField, FilterGroup, FilterNode, FilterCondition, FilterOperator };

/**
 * FilterBuilder — nested AND/OR conditions on any field, edited as a tree:
 * "status is Overdue AND (customer is one of A, B OR amount > 1,00,000)".
 *
 *   <FilterBuilder fields={fields} value={filter} onValueChange={setFilter} />
 *
 * The value is one plain object (a FilterGroup): save it, send it to the server
 * as report criteria, put it in a saved view, or filter rows here with
 * `filterPredicate` from @algorisys/zen-ui-core/filter. Each field's type
 * decides its operators and its value editor: text, number, date (a calendar),
 * a list of choices, or yes/no. A condition still missing its value filters
 * nothing, and the summary under the builder says in words what the filter
 * does now.
 *
 * Each group's "Match" covers all four meanings (all, any, none, not all), so
 * NOT is never a separate checkbox to miss. The pure half is
 * @algorisys/zen-ui-core/filter (check:filter).
 */
export interface FilterBuilderProps {
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
  className?: string;
}

type MatchMode = "all" | "any" | "none" | "notAll";
const MATCH_MODES: MatchMode[] = ["all", "any", "none", "notAll"];
const modeOf = (g: FilterGroup): MatchMode =>
  g.join === "and" ? (g.not ? "notAll" : "all") : g.not ? "none" : "any";
const groupOf = (m: MatchMode): Pick<FilterGroup, "join" | "not"> => ({
  join: m === "all" || m === "notAll" ? "and" : "or",
  not: m === "none" || m === "notAll",
});

/** "2026-03-15" <-> a local Date, for the calendar. */
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

type Option = { value: string; label: string };

/** What every row and group reads from the builder: one object per render, passed down. */
type Ctx = {
  loc: LocaleContextValue;
  fields: FilterField[];
  maxDepth: number;
  ariaLabel?: string;
  numbers: Map<string, number>;
  controlId: (nodeId: string, part: string) => string;
  fieldOf: (id: string) => FilterField | undefined;
  fieldOptions: Option[];
  matchOptions: Option[];
  operatorOptions: (type: FilterField["type"]) => Option[];
  edit: (fn: (root: FilterGroup) => FilterGroup) => void;
  addCondition: (groupId: string) => void;
  addGroup: (groupId: string) => void;
  remove: (id: string, parent: FilterGroup) => void;
};

/**
 * A Radix Select over a fixed option list. A select may report the value it
 * already has, so only a real change reaches `onChange`.
 */
const OptionSelect = ({
  id,
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  id: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  "aria-label"?: string;
}) => (
  <Select value={value} onValueChange={(v) => v && v !== value && onChange(v)}>
    <SelectTrigger id={id} aria-label={ariaLabel} className={className}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {options.map((o) => (
        <SelectItem key={o.value} value={o.value}>
          {o.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

/**
 * A day, picked on a calendar. React has no typed DateInput yet, so this is
 * DatePicker's own parts (a trigger button, a Popover, the Calendar), composed
 * here so the trigger can carry the row's id (for its label and for focus) and
 * so a cleared value reads as cleared rather than as DatePicker's last pick.
 */
const DateEditor = ({
  id,
  value,
  onValueChange,
  loc,
}: {
  id: string;
  value: Date | null;
  onValueChange: (d: Date | null) => void;
  loc: LocaleContextValue;
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          color="neutral"
          className={cn("zen-w-44 zen-justify-between zen-font-normal", !value && "zen-text-zen-muted-fg")}
          iconLeft={<Icon name="calendar" size={14} />}
        >
          {value ? value.toLocaleDateString(loc.locale) : loc.t("datePicker.placeholder")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="zen-w-auto zen-p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          defaultMonth={value ?? undefined}
          onSelect={(d: Date | undefined) => {
            onValueChange(d ?? null);
            if (d) setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

const ConditionRow = ({ c, parent, ctx }: { c: FilterCondition; parent: FilterGroup; ctx: Ctx }) => {
  const { loc } = ctx;
  const n = ctx.numbers.get(c.id) ?? 0;
  const fieldType = ctx.fieldOf(c.field)?.type;
  const arity = operatorArity(c.op);
  const choices = ctx.fieldOf(c.field)?.options;
  const setValue = (patch: Partial<FilterCondition>) => {
    const cur = c as unknown as Record<string, unknown>;
    if (Object.entries(patch).every(([k, v]) => JSON.stringify(cur[k]) === JSON.stringify(v))) return;
    ctx.edit((root) => updateNode(root, c.id, patch));
  };
  const srLabel = (part: string, text: string) => (
    <label htmlFor={ctx.controlId(c.id, part)} className="zen-sr-only">
      {text}
    </label>
  );
  const valueEditor = (which: "value" | "valueTo") => {
    const id = ctx.controlId(c.id, which);
    const v = c[which];
    // Keyed on the field's type: switching type swaps the editor, an edit keeps it.
    if (fieldType === "number")
      return (
        <NumberField
          key={`${which}-number`}
          id={id}
          value={typeof v === "number" ? v : null}
          onValueChange={(x) => setValue({ [which]: x })}
          className="zen-w-44"
        />
      );
    if (fieldType === "date")
      return (
        <DateEditor key={`${which}-date`} id={id} value={toDate(v)} onValueChange={(d) => setValue({ [which]: toIso(d) })} loc={loc} />
      );
    if (fieldType === "text")
      return (
        <Input
          key={`${which}-text`}
          id={id}
          value={typeof v === "string" ? v : ""}
          onChange={(e) => setValue({ [which]: e.currentTarget.value })}
          className="zen-w-48"
        />
      );
    return null;
  };
  return (
    <div className="zen-flex zen-flex-wrap zen-items-center zen-gap-2" data-filter-condition={c.id}>
      <OptionSelect
        id={ctx.controlId(c.id, "field")}
        aria-label={loc.t("filterBuilder.field", { n })}
        options={ctx.fieldOptions}
        value={c.field}
        onChange={(id) => {
          const f = ctx.fieldOf(id);
          if (f) ctx.edit((root) => changeField(root, c.id, f, ctx.fields));
        }}
        className="zen-w-40"
      />
      <OptionSelect
        id={ctx.controlId(c.id, "op")}
        aria-label={loc.t("filterBuilder.operator", { n })}
        options={fieldType ? ctx.operatorOptions(fieldType) : NO_OPTIONS}
        value={c.op}
        onChange={(op) => ctx.edit((root) => changeOperator(root, c.id, op as FilterOperator))}
        className="zen-w-44"
      />
      {arity === "list" && (
        <div className="zen-min-w-48 zen-flex-1">
          <MultiCombobox
            aria-label={loc.t("filterBuilder.values", { n })}
            options={choices ?? NO_OPTIONS}
            value={Array.isArray(c.value) ? c.value : NO_VALUES}
            onValueChange={(vs) => setValue({ value: vs })}
            placeholder={loc.t("filterBuilder.choose")}
          />
        </div>
      )}
      {(arity === 1 || arity === 2) && (
        <>
          {srLabel("value", loc.t(arity === 2 ? "filterBuilder.from" : "filterBuilder.value", { n }))}
          {valueEditor("value")}
        </>
      )}
      {arity === 2 && (
        <>
          <span className="zen-text-sm zen-text-zen-muted-fg" aria-hidden="true">
            {loc.t("filterBuilder.and")}
          </span>
          {srLabel("valueTo", loc.t("filterBuilder.to", { n }))}
          {valueEditor("valueTo")}
        </>
      )}
      <Button
        variant="ghost"
        color="neutral"
        shape="square"
        size="sm"
        aria-label={loc.t("filterBuilder.removeConditionN", { n })}
        title={loc.t("filterBuilder.removeCondition")}
        onClick={() => ctx.remove(c.id, parent)}
        className="zen-ms-auto zen-shrink-0"
      >
        <Icon name="x" size={16} />
      </Button>
    </div>
  );
};

const GroupView = ({ g, depth, parent, ctx }: { g: FilterGroup; depth: number; parent?: FilterGroup; ctx: Ctx }) => {
  const { loc } = ctx;
  const nested = depth > 0;
  const mode = modeOf(g);
  return (
    <div
      role="group"
      aria-label={
        nested
          ? loc.t("filterBuilder.groupLabel", { match: loc.t(`filterBuilder.${mode}`).toLowerCase() })
          : ctx.ariaLabel ?? loc.t("filterBuilder.label")
      }
      data-filter-group={g.id}
      className={cn(
        "zen-flex zen-flex-col zen-gap-2",
        nested && "zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-muted/40 zen-p-3",
      )}
    >
      <div className="zen-flex zen-flex-wrap zen-items-center zen-gap-2">
        <label htmlFor={ctx.controlId(g.id, "match")} className="zen-text-sm zen-text-zen-muted-fg">
          {loc.t("filterBuilder.match")}
        </label>
        <OptionSelect
          id={ctx.controlId(g.id, "match")}
          options={ctx.matchOptions}
          value={mode}
          onChange={(m) => ctx.edit((root) => updateNode(root, g.id, groupOf(m as MatchMode)))}
          className="zen-w-36"
        />
        <span className="zen-text-sm zen-text-zen-muted-fg">{loc.t("filterBuilder.theseConditions")}</span>
        {nested && parent && (
          <Button variant="ghost" color="neutral" size="sm" onClick={() => ctx.remove(g.id, parent)} className="zen-ms-auto">
            {loc.t("filterBuilder.removeGroup")}
          </Button>
        )}
      </div>
      <div className={cn("zen-flex zen-flex-col zen-gap-2", nested ? "" : "zen-ps-0")}>
        {/* Keyed by node id, never by position or object: each edit builds a new
            tree, and a row keyed by anything else is re-created (losing focus). */}
        {g.children.map((child) =>
          child.kind === "group" ? (
            <GroupView key={child.id} g={child} depth={depth + 1} parent={g} ctx={ctx} />
          ) : (
            <ConditionRow key={child.id} c={child} parent={g} ctx={ctx} />
          ),
        )}
        {g.children.length === 0 && (
          <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            {nested ? loc.t("filterBuilder.emptyGroup") : loc.t("filterBuilder.emptyRoot")}
          </p>
        )}
      </div>
      <div className="zen-flex zen-flex-wrap zen-gap-2">
        <Button
          id={ctx.controlId(g.id, "add")}
          variant="outline"
          color="neutral"
          size="sm"
          iconLeft={<Icon name="plus" size={14} />}
          onClick={() => ctx.addCondition(g.id)}
        >
          {loc.t("filterBuilder.addCondition")}
        </Button>
        {depth + 1 < ctx.maxDepth && (
          <Button
            variant="ghost"
            color="neutral"
            size="sm"
            iconLeft={<Icon name="plus" size={14} />}
            onClick={() => ctx.addGroup(g.id)}
          >
            {loc.t("filterBuilder.addGroup")}
          </Button>
        )}
      </div>
    </div>
  );
};

const NO_OPTIONS: Option[] = [];
const NO_VALUES: string[] = [];
const FIELD_TYPES: FilterField["type"][] = ["text", "number", "date", "enum", "boolean"];

export const FilterBuilder = ({
  fields,
  value,
  defaultValue,
  onValueChange,
  maxDepth = 3,
  showSummary = true,
  formatValue,
  "aria-label": ariaLabel,
  className,
}: FilterBuilderProps) => {
  const loc = useLocale();
  const uid = React.useId();
  // The initial value seeds it; the user owns it after.
  const [internal, setInternal] = React.useState<FilterGroup>(() => defaultValue ?? newGroup());
  const root = value ?? internal;
  // The latest tree, for edits made before the next render (two in one event).
  const rootRef = React.useRef(root);
  rootRef.current = root;
  const edit = (fn: (root: FilterGroup) => FilterGroup) => {
    const next = fn(rootRef.current);
    rootRef.current = next;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  // Focus a control once the edit that creates it has rendered.
  const pendingFocus = React.useRef<string | null>(null);
  React.useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    pendingFocus.current = null;
    document.getElementById(id)?.focus();
  });
  const controlId = (nodeId: string, part: string) => `${uid}-${nodeId}-${part}`;

  // Conditions numbered in reading order, for labels: "Condition 3, field".
  const numbers = React.useMemo(() => {
    const map = new Map<string, number>();
    let n = 0;
    const walk = (node: FilterNode) => {
      if (node.kind === "condition") map.set(node.id, ++n);
      else node.children.forEach(walk);
    };
    walk(root);
    return map;
  }, [root]);

  // Option lists are built once per input, not per render: a select that
  // re-reports its selection when its options change identity would otherwise
  // answer an edit with another edit (Kobalte did, to a stack overflow; Radix is
  // given the same stable lists).
  const matchOptions = React.useMemo(
    () => MATCH_MODES.map((m) => ({ value: m, label: loc.t(`filterBuilder.${m}`) })),
    [loc],
  );
  const fieldOptions = React.useMemo(() => fields.map((f) => ({ value: f.id, label: f.label })), [fields]);
  // Core builds the words by catalogue key through `say`, so a translation reaches the summary and the operator menu.
  const say = React.useCallback(
    (key: string, values?: Record<string, string | number>) => loc.t(key as MessageKey, values),
    [loc],
  );
  const opLists = React.useMemo(
    () =>
      new Map(
        FIELD_TYPES.map((type) => [type, operatorsFor(type).map((op) => ({ value: op, label: operatorLabel(op, type, say) }))]),
      ),
    [say],
  );
  const operatorOptions = (type: FilterField["type"]) => opLists.get(type) ?? NO_OPTIONS;

  const findGroup = (node: FilterNode, id: string): FilterGroup | undefined => {
    if (node.kind !== "group") return undefined;
    if (node.id === id) return node;
    for (const c of node.children) {
      const hit = findGroup(c, id);
      if (hit) return hit;
    }
    return undefined;
  };

  const ctx: Ctx = {
    loc,
    fields,
    maxDepth,
    ariaLabel,
    numbers,
    controlId,
    fieldOf: (id) => fields.find((f) => f.id === id),
    fieldOptions,
    matchOptions,
    operatorOptions,
    edit,
    addCondition: (groupId) => {
      const first = fields[0];
      if (!first) return;
      const c = newCondition(first);
      edit((r) => addNode(r, groupId, c));
      pendingFocus.current = controlId(c.id, "field");
    },
    addGroup: (groupId) => {
      const first = fields[0];
      if (!first) return;
      const c = newCondition(first);
      edit((r) => addNode(r, groupId, newGroup("and", [c])));
      pendingFocus.current = controlId(c.id, "field");
    },
    /** Remove a node; focus goes to the next row's first control, else the previous one's, else the group's "Condition" button. */
    remove: (id, parent) => {
      const live = findGroup(rootRef.current, parent.id) ?? parent;
      const siblings = live.children;
      const at = siblings.findIndex((s) => s.id === id);
      const neighbour = siblings[at + 1] ?? siblings[at - 1];
      edit((r) => removeNode(r, id));
      pendingFocus.current = !neighbour
        ? controlId(live.id, "add")
        : controlId(neighbour.id, neighbour.kind === "condition" ? "field" : "match");
    },
  };

  const summary = describeFilter(root, fields, formatValue, say);

  return (
    <div className={cn("zen-flex zen-flex-col zen-gap-3", className)}>
      <GroupView g={root} depth={0} ctx={ctx} />
      {showSummary && (
        <p className="zen-m-0 zen-text-sm" aria-live="polite" data-filter-summary="">
          <span className="zen-text-zen-muted-fg">{loc.t("filterBuilder.shows")}</span>
          {summary || loc.t("filterBuilder.showsEverything")}
        </p>
      )}
    </div>
  );
};

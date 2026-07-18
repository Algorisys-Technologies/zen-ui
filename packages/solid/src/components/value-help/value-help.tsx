import { createMemo, createSignal, createUniqueId, createEffect, For, Show } from "solid-js";
import { cn } from "../../lib/cn";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../dialog/dialog";
import { Button } from "../button/button";
import { Input } from "../form/input/input";
import { Checkbox } from "../form/checkbox/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs/tabs";
import { Select } from "../form/select/select";
import {
  SelectSearchField,
  SelectListBody,
  type SelectListItem,
} from "../select-list/select-list";
import { filterItems } from "../select-list/filter";

/**
 * ValueHelp — the F4 lookup dialog. SelectDialog answers "which of these?";
 * ValueHelp also answers "everything matching these rules", which is the whole
 * reason it is a separate component:
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
 * Mirrors the React binding's API.
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
  items: SelectListItem[];
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

const OPERATOR_OPTIONS = (Object.keys(OPERATOR_LABELS) as ValueHelpOperator[]).map((value) => ({
  value,
  label: OPERATOR_LABELS[value],
}));

/** A rule with no value filters nothing; committing it would be a silent no-op. */
const isComplete = (c: ValueHelpCondition) =>
  c.value.trim() !== "" && (c.operator !== "BT" || (c.valueTo ?? "").trim() !== "");

export const ValueHelp = (props: ValueHelpProps) => {
  const [query, setQuery] = createSignal("");
  const [draft, setDraft] = createSignal<string[]>([]);
  const [rules, setRules] = createSignal<ValueHelpCondition[]>([]);
  const descriptionId = createUniqueId();

  // Row ids come from a counter, not the array length: deleting a middle row
  // would otherwise hand the next added row an id a live row already owns.
  let nextRowId = 0;
  const newRow = (): ValueHelpCondition => ({
    id: `vh-${nextRowId++}`,
    exclude: false,
    operator: "EQ",
    value: "",
  });

  // A picker is a fresh question each time it opens. Tracks `props.open` only —
  // reading the seeds untracked keeps a caller's inline array from re-running
  // this mid-interaction and wiping the user's work.
  createEffect(() => {
    if (!props.open) return;
    setDraft(props.selectedIds ? [...props.selectedIds] : []);
    setRules((props.conditions ?? []).map((c) => ({ ...c })));
    setQuery("");
  });

  const visible = createMemo(() => filterItems(props.items, query(), Boolean(props.onSearch)));

  const toggle = (id: string) =>
    setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Single mode replaces rather than appends, but still does not commit: the
  // Conditions tab needs an OK, so a click here is a choice, not an answer.
  const pick = (id: string) => setDraft([id]);

  const patch = (id: string, next: Partial<ValueHelpCondition>) =>
    setRules((prev) => prev.map((c) => (c.id === id ? { ...c, ...next } : c)));

  // Ids come back in list order, not tick order, matching SelectDialog. Ids the
  // current `items` no longer holds keep their draft order on the end.
  const inListOrder = (ids: string[]) => {
    const picked = new Set(ids);
    const known = props.items.filter((i) => picked.has(i.id)).map((i) => i.id);
    const seen = new Set(known);
    return [...known, ...ids.filter((id) => !seen.has(id))];
  };

  const commit = () => {
    props.onConfirm({ ids: inListOrder(draft()), conditions: rules().filter(isComplete) });
    props.onOpenChange(false);
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    props.onSearch?.(value);
  };

  const searchPlaceholder = () => props.searchPlaceholder ?? "Search";

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        // The tab panels scroll on their own, so the dialog's padding and
        // scroller would double up.
        class={cn(
          "zen-flex zen-max-h-[85vh] zen-w-full zen-max-w-2xl zen-flex-col zen-overflow-hidden zen-p-0",
          props.class,
        )}
        aria-describedby={props.description ? descriptionId : undefined}
      >
        <div class="zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4">
          <DialogTitle class="zen-pr-8">{props.title}</DialogTitle>
          <Show when={props.description}>
            <DialogDescription id={descriptionId}>{props.description}</DialogDescription>
          </Show>
        </div>

        <Tabs defaultValue="select" class="zen-flex zen-min-h-0 zen-flex-1 zen-flex-col">
          <TabsList class="zen-mx-6 zen-mt-3">
            <TabsTrigger value="select">{props.selectTabLabel ?? "Select from list"}</TabsTrigger>
            <TabsTrigger value="conditions">
              {props.conditionsTabLabel ?? "Define conditions"}
              <Show when={rules().length > 0}>
                <span class="zen-ml-2 zen-rounded-zen-full zen-bg-zen-primary-soft zen-px-1.5 zen-text-xs zen-text-zen-primary-soft-fg">
                  {rules().length}
                </span>
              </Show>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="select"
            class="zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-2 zen-overflow-hidden"
          >
            <Show when={props.searchable ?? true}>
              <SelectSearchField
                value={query()}
                onValueChange={handleSearch}
                placeholder={searchPlaceholder()}
                class="zen-mx-6 zen-mt-1"
              />
            </Show>
            <div class="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-pb-2">
              <SelectListBody
                items={visible()}
                multiple={props.multiple}
                selected={draft()}
                onToggle={toggle}
                onPick={pick}
                emptyText={props.emptyText}
              />
            </div>
          </TabsContent>

          <TabsContent
            value="conditions"
            class="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-6 zen-pb-2 zen-pt-1"
          >
            <Show
              when={rules().length > 0}
              fallback={
                <p class="zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg">
                  No conditions yet.
                </p>
              }
            >
              <ul class="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0">
                <For each={rules()}>
                  {(c) => (
                    <li class="zen-flex zen-items-center zen-gap-2">
                      <label class="zen-flex zen-shrink-0 zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg">
                        <Checkbox
                          checked={c.exclude}
                          onChange={(v) => patch(c.id, { exclude: v === true })}
                          aria-label={`Exclude condition ${c.id}`}
                        />
                        Exclude
                      </label>
                      <Select
                        options={OPERATOR_OPTIONS}
                        value={c.operator}
                        onChange={(v) => patch(c.id, { operator: (v ?? "EQ") as ValueHelpOperator })}
                        aria-label="Operator"
                        class="zen-w-40 zen-shrink-0"
                      />
                      <Input
                        value={c.value}
                        onInput={(e) => patch(c.id, { value: e.currentTarget.value })}
                        placeholder="Value"
                        aria-label="Value"
                      />
                      <Show when={c.operator === "BT"}>
                        <Input
                          value={c.valueTo ?? ""}
                          onInput={(e) => patch(c.id, { valueTo: e.currentTarget.value })}
                          placeholder="To"
                          aria-label="To value"
                        />
                      </Show>
                      <Button
                        type="button"
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        aria-label="Remove condition"
                        onClick={() => setRules((prev) => prev.filter((r) => r.id !== c.id))}
                      >
                        ✕
                      </Button>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="sm"
              class="zen-mt-3"
              onClick={() => setRules((prev) => [...prev, newRow()])}
            >
              {props.addConditionLabel ?? "Add condition"}
            </Button>
          </TabsContent>
        </Tabs>

        <div class="zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3">
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => props.onOpenChange(false)}
          >
            {props.cancelLabel ?? "Cancel"}
          </Button>
          <Button type="button" size="sm" onClick={commit}>
            {props.confirmLabel ?? "OK"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

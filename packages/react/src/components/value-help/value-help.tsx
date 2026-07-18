import * as React from "react";
import { cn } from "@algorisys/zen-ui-core";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../dialog/dialog";
import { Button } from "../button/button";
import { Input } from "../form/input/input";
import { Checkbox } from "../form/checkbox/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../form/select/select";
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
  className?: string;
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

export const ValueHelp = ({
  open,
  onOpenChange,
  title,
  description,
  items,
  multiple = false,
  selectedIds,
  conditions,
  onConfirm,
  searchable = true,
  searchPlaceholder = "Search",
  onSearch,
  emptyText = "No matching items",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  selectTabLabel = "Select from list",
  conditionsTabLabel = "Define conditions",
  addConditionLabel = "Add condition",
  className,
}: ValueHelpProps) => {
  const [query, setQuery] = React.useState("");
  const [draft, setDraft] = React.useState<string[]>([]);
  const [rules, setRules] = React.useState<ValueHelpCondition[]>([]);

  // Row ids come from a counter, not the array length: deleting a middle row
  // would otherwise hand the next added row an id a live row already owns.
  const nextRowId = React.useRef(0);
  const newRow = (): ValueHelpCondition => ({
    id: `vh-${nextRowId.current++}`,
    exclude: false,
    operator: "EQ",
    value: "",
  });

  // Held in refs so the reset effect can depend on `open` alone. A caller
  // passing `selectedIds={[]}` inline hands us a new array identity every
  // render; depending on it would re-run the reset mid-interaction and wipe the
  // user's work. Same class of bug as FlexibleColumnLayout's render loop.
  const seedRef = React.useRef({ selectedIds, conditions });
  React.useEffect(() => {
    seedRef.current = { selectedIds, conditions };
  });

  // A picker is a fresh question each time it opens.
  React.useEffect(() => {
    if (!open) return;
    setDraft(seedRef.current.selectedIds ?? []);
    setRules((seedRef.current.conditions ?? []).map((c) => ({ ...c })));
    setQuery("");
  }, [open]);

  const visible = React.useMemo(
    () => filterItems(items, query, Boolean(onSearch)),
    [items, query, onSearch],
  );

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
    const known = items.filter((i) => picked.has(i.id)).map((i) => i.id);
    const seen = new Set(known);
    return [...known, ...ids.filter((id) => !seen.has(id))];
  };

  const commit = () => {
    onConfirm({ ids: inListOrder(draft), conditions: rules.filter(isComplete) });
    onOpenChange(false);
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const descriptionId = React.useId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // The tab panels scroll on their own, so the dialog's padding and
        // scroller would double up.
        className={cn(
          "zen-flex zen-max-h-[85vh] zen-w-full zen-max-w-2xl zen-flex-col zen-overflow-hidden zen-p-0",
          className,
        )}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4">
          <DialogTitle className="zen-pr-8">{title}</DialogTitle>
          {description ? (
            <DialogDescription id={descriptionId}>{description}</DialogDescription>
          ) : null}
        </div>

        <Tabs defaultValue="select" className="zen-flex zen-min-h-0 zen-flex-1 zen-flex-col">
          <TabsList className="zen-mx-6 zen-mt-3">
            <TabsTrigger value="select">{selectTabLabel}</TabsTrigger>
            <TabsTrigger value="conditions">
              {conditionsTabLabel}
              {rules.length > 0 ? (
                <span className="zen-ml-2 zen-rounded-zen-full zen-bg-zen-primary-soft zen-px-1.5 zen-text-xs zen-text-zen-primary-soft-fg">
                  {rules.length}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="select"
            className="zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-2 zen-overflow-hidden"
          >
            {searchable ? (
              <SelectSearchField
                value={query}
                onValueChange={handleSearch}
                placeholder={searchPlaceholder}
                className="zen-mx-6 zen-mt-1"
              />
            ) : null}
            <div className="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-pb-2">
              <SelectListBody
                items={visible}
                multiple={multiple}
                selected={draft}
                onToggle={toggle}
                onPick={pick}
                emptyText={emptyText}
              />
            </div>
          </TabsContent>

          <TabsContent
            value="conditions"
            className="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-6 zen-pb-2 zen-pt-1"
          >
            {rules.length === 0 ? (
              <p className="zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg">
                No conditions yet.
              </p>
            ) : (
              <ul className="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0">
                {rules.map((c) => (
                  <li key={c.id} className="zen-flex zen-items-center zen-gap-2">
                    <label className="zen-flex zen-shrink-0 zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg">
                      <Checkbox
                        checked={c.exclude}
                        onCheckedChange={(v) => patch(c.id, { exclude: v === true })}
                        aria-label={`Exclude condition ${c.id}`}
                      />
                      Exclude
                    </label>
                    <Select
                      value={c.operator}
                      onValueChange={(v) => patch(c.id, { operator: v as ValueHelpOperator })}
                    >
                      <SelectTrigger className="zen-w-40 zen-shrink-0" aria-label="Operator">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op} value={op}>
                            {OPERATOR_LABELS[op]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={c.value}
                      onChange={(e) => patch(c.id, { value: e.target.value })}
                      placeholder="Value"
                      aria-label="Value"
                    />
                    {c.operator === "BT" ? (
                      <Input
                        value={c.valueTo ?? ""}
                        onChange={(e) => patch(c.id, { valueTo: e.target.value })}
                        placeholder="To"
                        aria-label="To value"
                      />
                    ) : null}
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
                ))}
              </ul>
            )}
            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="sm"
              className="zen-mt-3"
              onClick={() => setRules((prev) => [...prev, newRow()])}
            >
              {addConditionLabel}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3">
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button type="button" size="sm" onClick={commit}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
ValueHelp.displayName = "ValueHelp";

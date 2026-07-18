import * as React from "react";
import {
  DATE_RANGE_OPERATORS,
  formatDateRangeValue,
  operatorMeta,
  parseISODate,
  resolveDateRange,
  toISODate,
  type DateRangeOperator,
  type DateRangeValue,
  type OperatorMeta,
  type ResolvedRange,
} from "@algorisys/zen-ui-core/date-range";
import { cn } from "../../../lib/cn";
import { Button } from "../../button/button";
import { Icon } from "../../icon/icon";
import { Input } from "../input/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover/popover";
import { Calendar } from "../date-picker/date-picker";

/**
 * DynamicDateRange — a date range you describe rather than point at.
 *
 *   <DynamicDateRange value={v} onValueChange={(v, resolved) => …} />
 *
 * The difference from DateRangePicker is the value, not the popover.
 * DateRangePicker answers "which two dates?" and stores two dates.
 * This answers "which period?" and stores the period — `{operator:
 * "LAST_DAYS", count: 7}`. Save that in a filter variant and it still means
 * the last seven days next month; save two dates and it means the same frozen
 * week forever. That is the entire point, so `onValueChange` hands back both:
 * the semantic value to store, and the resolved dates to query with.
 *
 * All the date maths is in @algorisys/zen-ui-core/date-range, so this and the
 * Solid binding cannot disagree about when a quarter starts.
 *
 * The popover previews the dates the choice resolves to. A semantic range that
 * will not tell you what it currently means is a filter people stop trusting.
 */

export interface DynamicDateRangeProps {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  /** Hands back the value to STORE and the dates to QUERY with. */
  onValueChange?: (value: DateRangeValue | undefined, resolved: ResolvedRange) => void;
  /** Restrict the operator list. Defaults to all of them. */
  operators?: DateRangeOperator[];
  /** 0 = Sunday, matching the calendar. */
  weekStartsOn?: number;
  /** Override "now". For tests and stories — resolution is otherwise live. */
  now?: Date;
  placeholder?: string;
  disabled?: boolean;
  /** Formats dates in the trigger and the preview. */
  formatDate?: (date: Date) => string;
  className?: string;
}

const GROUP_ORDER = ["Day", "Week", "Month", "Quarter", "Year", "Rolling", "Fixed"] as const;

export const DynamicDateRange: React.FC<DynamicDateRangeProps> = ({
  value,
  defaultValue,
  onValueChange,
  operators,
  weekStartsOn = 0,
  now,
  placeholder = "Select a period",
  disabled,
  formatDate = (d) => d.toLocaleDateString(),
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<DateRangeValue | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  // A fresh Date every render would make every memo below a new object each
  // time. Pinned per open instead — and a popover that changed its own preview
  // while you read it would be worse than slightly stale.
  //
  // `open` is not a memo input, so the rule calls it unnecessary; it is here to
  // RE-pin the clock each time the popover opens, or a tab left open overnight
  // would preview yesterday's dates. Deliberate, not an oversight.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const clock = React.useMemo(() => now ?? new Date(), [now, open]);

  const list = React.useMemo(
    () => (operators ? DATE_RANGE_OPERATORS.filter((o) => operators.includes(o.operator)) : DATE_RANGE_OPERATORS),
    [operators],
  );

  const groups = React.useMemo(() => {
    const by = new Map<string, OperatorMeta[]>();
    for (const o of list) {
      const g = by.get(o.group) ?? [];
      g.push(o);
      by.set(o.group, g);
    }
    return GROUP_ORDER.filter((g) => by.has(g)).map((g) => [g, by.get(g)!] as const);
  }, [list]);

  // The popover edits a draft and commits on Apply, matching DateRangePicker's
  // Cancel/Done contract. A half-built "Between" with only one end is a normal
  // state to be in, not a value to emit.
  const [draft, setDraft] = React.useState<DateRangeValue | undefined>(current);
  // Seeded on open only. Re-seeding while open would overwrite what is being
  // typed the moment a controlled parent re-rendered for any other reason.
  React.useEffect(() => {
    if (open) setDraft(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const draftOp = draft?.operator;
  const meta = draftOp ? operatorMeta(draftOp) : undefined;
  const preview = React.useMemo(
    () => resolveDateRange(draft, clock, { weekStartsOn }),
    [draft, clock, weekStartsOn],
  );
  const previewValid = !!(preview.from || preview.to);

  const pick = (op: DateRangeOperator) => {
    const m = operatorMeta(op);
    if (!m) return;
    // Carry the count across a change of unit: someone who typed 7 for days and
    // then switches to weeks meant 7 weeks, not a reset to 1.
    const keptCount = draft && "count" in draft ? draft.count : 1;
    const keptIncl = draft && "includeCurrent" in draft ? draft.includeCurrent : false;
    const today = toISODate(clock);
    if (m.arity === "count") setDraft({ operator: op as never, count: keptCount, includeCurrent: keptIncl });
    else if (m.arity === "date") setDraft({ operator: op as never, date: draft && "date" in draft ? draft.date : today });
    else if (m.arity === "range")
      setDraft({
        operator: "BETWEEN",
        from: draft && "from" in draft ? draft.from : today,
        to: draft && "to" in draft ? draft.to : today,
      });
    else setDraft({ operator: op as never });
  };

  const commit = (next: DateRangeValue | undefined) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next, resolveDateRange(next, now ?? new Date(), { weekStartsOn }));
    setOpen(false);
  };

  const label = current ? formatDateRangeValue(current, formatDate) : placeholder;
  const resolvedNow = current ? resolveDateRange(current, clock, { weekStartsOn }) : {};

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          color="neutral"
          disabled={disabled}
          className={cn("zen-justify-start zen-gap-2 zen-font-normal", className)}
        >
          <Icon name="calendar" size={16} className="zen-shrink-0 zen-text-zen-muted-fg" />
          <span className={cn(!current && "zen-text-zen-muted-fg")}>{label}</span>
          {current && (resolvedNow.from || resolvedNow.to) ? (
            // The trigger says "Last 7 days"; this says which 7. Both matter —
            // the name is the intent, the dates are the fact.
            <span className="zen-text-xs zen-text-zen-muted-fg">({describe(resolvedNow, formatDate)})</span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="zen-w-auto zen-p-0" align="start">
        <div className="zen-flex zen-max-w-[34rem] zen-flex-col zen-gap-0 sm:zen-flex-row">
          <div
            role="listbox"
            aria-label="Period"
            className="zen-max-h-72 zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-b zen-border-zen-border zen-p-1 sm:zen-border-b-0 sm:zen-border-r"
          >
            {groups.map(([group, items]) => (
              <div key={group}>
                <div className="zen-px-2 zen-pb-1 zen-pt-2 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">
                  {group}
                </div>
                {items.map((o) => (
                  <button
                    key={o.operator}
                    type="button"
                    role="option"
                    aria-selected={draftOp === o.operator}
                    onClick={() => pick(o.operator)}
                    className={cn(
                      "zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-px-2 zen-py-1.5",
                      "zen-text-left zen-text-sm zen-transition-colors",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      draftOp === o.operator
                        ? "zen-bg-zen-primary zen-text-zen-primary-fg"
                        : "zen-bg-transparent zen-text-zen-foreground hover:zen-bg-zen-muted",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="zen-flex zen-min-w-[16rem] zen-flex-col zen-gap-3 zen-p-3">
            {!draft ? (
              <p className="zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg">
                Pick a period on the left.
              </p>
            ) : null}

            {meta?.arity === "count" && draft && "count" in draft ? (
              <div className="zen-flex zen-flex-col zen-gap-2">
                <label className="zen-flex zen-items-center zen-gap-2 zen-text-sm">
                  <span className="zen-text-zen-muted-fg">
                    {draft.operator.startsWith("LAST") ? "Last" : "Next"}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={String(draft.count)}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setDraft({ ...draft, count: Number.isFinite(n) ? n : 0 });
                    }}
                    aria-label={`Number of ${meta.unit}s`}
                    className="zen-h-8 zen-w-20"
                  />
                  <span className="zen-text-zen-muted-fg">{meta.unit}s</span>
                </label>
                <label className="zen-flex zen-cursor-pointer zen-items-center zen-gap-2 zen-text-sm zen-text-zen-muted-fg">
                  <input
                    type="checkbox"
                    checked={!!draft.includeCurrent}
                    onChange={(e) => setDraft({ ...draft, includeCurrent: e.target.checked })}
                  />
                  {/* Named for what it does to the dates, not "includeCurrent" —
                      the whole hazard is that the difference is invisible. */}
                  Include the current {meta.unit}
                </label>
              </div>
            ) : null}

            {meta?.arity === "date" && draft && "date" in draft ? (
              <Calendar
                mode="single"
                selected={parseISODate(draft.date) ?? undefined}
                onSelect={(d) => d && setDraft({ ...draft, date: toISODate(d) })}
              />
            ) : null}

            {meta?.arity === "range" && draft && "from" in draft ? (
              <Calendar
                mode="range"
                selected={{ from: parseISODate(draft.from) ?? undefined, to: parseISODate(draft.to) ?? undefined }}
                onSelect={(r) =>
                  setDraft({
                    operator: "BETWEEN",
                    from: r?.from ? toISODate(r.from) : draft.from,
                    to: r?.to ? toISODate(r.to) : r?.from ? toISODate(r.from) : draft.to,
                  })
                }
              />
            ) : null}

            {draft ? (
              <div
                aria-live="polite"
                className="zen-rounded-zen-md zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-xs zen-text-zen-muted-fg"
              >
                {previewValid ? describe(preview, formatDate) : "—"}
              </div>
            ) : null}

            <div className="zen-flex zen-justify-end zen-gap-2">
              <Button variant="ghost" color="neutral" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={!draft || !previewValid} onClick={() => commit(draft)}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
DynamicDateRange.displayName = "DynamicDateRange";

/** "1 Jul – 7 Jul", "from 1 Jul", "until 7 Jul". */
const describe = (r: ResolvedRange, formatDate: (d: Date) => string): string => {
  if (r.from && r.to) return `${formatDate(r.from)} – ${formatDate(r.to)}`;
  if (r.from) return `from ${formatDate(r.from)}`;
  if (r.to) return `until ${formatDate(r.to)}`;
  return "—";
};

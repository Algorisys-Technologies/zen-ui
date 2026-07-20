import { For, Show, createEffect, createMemo, createSignal, untrack } from "solid-js";
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
 * The difference from DateRangePicker is the value, not the popover.
 * DateRangePicker answers "which two dates?" and stores two dates. This
 * answers "which period?" and stores the period — `{operator: "LAST_DAYS",
 * count: 7}`. Save that in a filter variant and it still means the last seven
 * days next month; save two dates and it means the same frozen week forever.
 * So `onValueChange` hands back both: the semantic value to store, and the
 * resolved dates to query with.
 *
 * All the date maths is in @algorisys/zen-ui-core/date-range, shared with the
 * React binding.
 *
 * Mirrors the React binding's API.
 */

export type DynamicDateRangeProps = {
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
  class?: string;
};

const GROUP_ORDER = ["Day", "Week", "Month", "Quarter", "Year", "Rolling", "Fixed"] as const;

export const DynamicDateRange = (props: DynamicDateRangeProps) => {
  const [open, setOpen] = createSignal(false);
  const [internal, setInternal] = createSignal<DateRangeValue | undefined>(props.defaultValue);
  const isControlled = () => props.value !== undefined;
  const current = () => (isControlled() ? props.value : internal());

  const weekStartsOn = () => props.weekStartsOn ?? 0;
  const formatDate = () => props.formatDate ?? ((d: Date) => d.toLocaleDateString());
  const clock = () => props.now ?? new Date();

  const list = createMemo(() =>
    props.operators
      ? DATE_RANGE_OPERATORS.filter((o) => props.operators!.includes(o.operator))
      : DATE_RANGE_OPERATORS,
  );

  const groups = createMemo(() => {
    const by = new Map<string, OperatorMeta[]>();
    for (const o of list()) {
      const g = by.get(o.group) ?? [];
      g.push(o);
      by.set(o.group, g);
    }
    return GROUP_ORDER.filter((g) => by.has(g)).map((g) => [g, by.get(g)!] as const);
  });

  // The popover edits a draft and commits on Apply, matching DateRangePicker's
  // Cancel/Done contract.
  const [draft, setDraft] = createSignal<DateRangeValue | undefined>(untrack(current));

  createEffect(() => {
    // Seed on OPEN only. Reading current() tracked would re-seed the draft
    // every time a controlled parent re-rendered — the exact bug that wiped
    // ViewSettingsDialog's edits mid-typing. untrack is what keeps `open` the
    // only dependency.
    if (open()) setDraft(untrack(current));
  });

  const draftOp = () => draft()?.operator;
  const meta = () => {
    const op = draftOp();
    return op ? operatorMeta(op) : undefined;
  };
  const preview = createMemo(() => resolveDateRange(draft(), clock(), { weekStartsOn: weekStartsOn() }));
  const previewValid = () => !!(preview().from || preview().to);

  const pick = (op: DateRangeOperator) => {
    const m = operatorMeta(op);
    if (!m) return;
    const d = draft();
    // Carry the count across a change of unit: someone who typed 7 for days and
    // then switches to weeks meant 7 weeks, not a reset to 1.
    const keptCount = d && "count" in d ? d.count : 1;
    const keptIncl = d && "includeCurrent" in d ? d.includeCurrent : false;
    const today = toISODate(clock());
    if (m.arity === "count") setDraft({ operator: op as never, count: keptCount, includeCurrent: keptIncl });
    else if (m.arity === "date") setDraft({ operator: op as never, date: d && "date" in d ? d.date : today });
    else if (m.arity === "range")
      setDraft({
        operator: "BETWEEN",
        from: d && "from" in d ? d.from : today,
        to: d && "to" in d ? d.to : today,
      });
    else setDraft({ operator: op as never });
  };

  const commit = () => {
    const next = draft();
    if (!isControlled()) setInternal(next);
    props.onValueChange?.(next, resolveDateRange(next, props.now ?? new Date(), { weekStartsOn: weekStartsOn() }));
    setOpen(false);
  };

  const label = () => (current() ? formatDateRangeValue(current(), formatDate()) : (props.placeholder ?? "Select a period"));
  const resolvedNow = createMemo(() =>
    current() ? resolveDateRange(current(), clock(), { weekStartsOn: weekStartsOn() }) : {},
  );

  // Kobalte takes placement on the root; Radix takes side/align on the Content.
  // Same result as React's align="start", reached the way each library expects,
  // rather than inventing a prop one of them cannot honour.
  return (
    <Popover open={open()} onOpenChange={setOpen} placement="bottom-start">
      <PopoverTrigger
        as={Button}
        variant="outline"
        color="neutral"
        disabled={props.disabled}
        class={cn("zen-justify-start zen-gap-2 zen-font-normal", props.class)}
      >
        <Icon name="calendar" size={16} class="zen-shrink-0 zen-text-zen-muted-fg" />
        <span class={cn(!current() && "zen-text-zen-muted-fg")}>{label()}</span>
        <Show when={current() && (resolvedNow().from || resolvedNow().to)}>
          {/* The trigger says "Last 7 days"; this says which 7. Both matter —
              the name is the intent, the dates are the fact. */}
          <span class="zen-text-xs zen-text-zen-muted-fg">({describe(resolvedNow(), formatDate())})</span>
        </Show>
      </PopoverTrigger>

      <PopoverContent class="zen-w-auto zen-p-0">
        <div class="zen-flex zen-max-w-[34rem] zen-flex-col zen-gap-0 sm:zen-flex-row">
          <div
            role="listbox"
            aria-label="Period"
            class="zen-max-h-72 zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-b zen-border-zen-border zen-p-1 sm:zen-border-b-0 sm:zen-border-r"
          >
            <For each={groups()}>
              {([group, items]) => (
                <div>
                  <div class="zen-px-2 zen-pb-1 zen-pt-2 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">
                    {group}
                  </div>
                  <For each={items}>
                    {(o) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={draftOp() === o.operator}
                        onClick={() => pick(o.operator)}
                        class={cn(
                          "zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-px-2 zen-py-1.5",
                          "zen-text-start zen-text-sm zen-transition-colors",
                          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                          draftOp() === o.operator
                            ? "zen-bg-zen-primary zen-text-zen-primary-fg"
                            : "zen-bg-transparent zen-text-zen-foreground hover:zen-bg-zen-muted",
                        )}
                      >
                        {o.label}
                      </button>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>

          <div class="zen-flex zen-min-w-[16rem] zen-flex-col zen-gap-3 zen-p-3">
            <Show when={!draft()}>
              <p class="zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg">
                Pick a period on the left.
              </p>
            </Show>

            <Show when={meta()?.arity === "count" ? (draft() as { operator: DateRangeOperator; count: number; includeCurrent?: boolean }) : undefined}>
              {(d) => (
                <div class="zen-flex zen-flex-col zen-gap-2">
                  <label class="zen-flex zen-items-center zen-gap-2 zen-text-sm">
                    <span class="zen-text-zen-muted-fg">
                      {d().operator.startsWith("LAST") ? "Last" : "Next"}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      value={String(d().count)}
                      onInput={(e) => {
                        const n = Number(e.currentTarget.value);
                        setDraft({ ...d(), count: Number.isFinite(n) ? n : 0 } as DateRangeValue);
                      }}
                      aria-label={`Number of ${meta()?.unit}s`}
                      class="zen-h-8 zen-w-20"
                    />
                    <span class="zen-text-zen-muted-fg">{meta()?.unit}s</span>
                  </label>
                  <label class="zen-flex zen-cursor-pointer zen-items-center zen-gap-2 zen-text-sm zen-text-zen-muted-fg">
                    <input
                      type="checkbox"
                      checked={!!d().includeCurrent}
                      onChange={(e) =>
                        setDraft({ ...d(), includeCurrent: e.currentTarget.checked } as DateRangeValue)
                      }
                    />
                    {/* Named for what it does to the dates, not "includeCurrent" —
                        the whole hazard is that the difference is invisible. */}
                    Include the current {meta()?.unit}
                  </label>
                </div>
              )}
            </Show>

            <Show when={meta()?.arity === "date" ? (draft() as { operator: DateRangeOperator; date: string }) : undefined}>
              {(d) => (
                <Calendar
                  mode="single"
                  selected={parseISODate(d().date) ?? undefined}
                  onSelect={(picked) => picked && setDraft({ ...d(), date: toISODate(picked) } as DateRangeValue)}
                />
              )}
            </Show>

            <Show when={meta()?.arity === "range" ? (draft() as { operator: "BETWEEN"; from: string; to: string }) : undefined}>
              {(d) => (
                <Calendar
                  mode="range"
                  selected={{ from: parseISODate(d().from) ?? undefined, to: parseISODate(d().to) ?? undefined }}
                  onSelect={(r) =>
                    setDraft({
                      operator: "BETWEEN",
                      from: r?.from ? toISODate(r.from) : d().from,
                      to: r?.to ? toISODate(r.to) : r?.from ? toISODate(r.from) : d().to,
                    })
                  }
                />
              )}
            </Show>

            <Show when={draft()}>
              <div
                aria-live="polite"
                class="zen-rounded-zen-md zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-xs zen-text-zen-muted-fg"
              >
                {previewValid() ? describe(preview(), formatDate()) : "—"}
              </div>
            </Show>

            <div class="zen-flex zen-justify-end zen-gap-2">
              <Button variant="ghost" color="neutral" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={!draft() || !previewValid()} onClick={commit}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/** "1 Jul – 7 Jul", "from 1 Jul", "until 7 Jul". */
const describe = (r: ResolvedRange, formatDate: (d: Date) => string): string => {
  if (r.from && r.to) return `${formatDate(r.from)} – ${formatDate(r.to)}`;
  if (r.from) return `from ${formatDate(r.from)}`;
  if (r.to) return `until ${formatDate(r.to)}`;
  return "—";
};

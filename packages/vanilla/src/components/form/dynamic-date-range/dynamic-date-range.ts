import {
  DATE_RANGE_OPERATORS,
  formatDateRangeValue,
  operatorMeta,
  parseISODate,
  resolveDateRange,
  toISODate,
  type CountOperator,
  type DateOperator,
  type DateRangeOperator,
  type DateRangeValue,
  type FixedOperator,
  type OperatorMeta,
  type ResolvedRange,
} from "@algorisys/zen-ui-core/date-range";
import { cn } from "../../../lib/cn";
import { Disposer, type ZenComponent } from "../../../lib/component";
import { controllable } from "../../../lib/state";
import { Button } from "../../button/button";
import { Icon } from "../../icon/icon";
import { Input } from "../input/input";
import { Popover } from "../../popover/popover";
import { Calendar, type DateRange } from "../date-picker/date-picker";

/**
 * DynamicDateRange — a date range you describe rather than point at.
 *
 *   const ddr = DynamicDateRange({ value: v, onValueChange: (v, resolved) => … });
 *   host.append(ddr.el);
 *
 * The difference from DateRangePicker is the value, not the popover.
 * DateRangePicker answers "which two dates?" and stores two dates. This answers
 * "which period?" and stores the period — `{ operator: "LAST_DAYS", count: 7 }`.
 * Save that in a filter variant and it still means the last seven days next
 * month; save two dates and it means the same frozen week forever. That is the
 * entire point, so `onValueChange` hands back both: the semantic value to store,
 * and the resolved dates to query with.
 *
 * All the date maths is in @algorisys/zen-ui-core/date-range, so React, Solid and
 * vanilla cannot disagree about when a quarter starts. React backs the popover
 * with Radix and the calendars with react-day-picker; here they are the vanilla
 * Popover and Calendar, behind the identical public API.
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
  class?: string;
}

const GROUP_ORDER = ["Day", "Week", "Month", "Quarter", "Year", "Rolling", "Fixed"] as const;

/** "1 Jul – 7 Jul", "from 1 Jul", "until 7 Jul". */
const describe = (r: ResolvedRange, formatDate: (d: Date) => string): string => {
  if (r.from && r.to) return `${formatDate(r.from)} – ${formatDate(r.to)}`;
  if (r.from) return `from ${formatDate(r.from)}`;
  if (r.to) return `until ${formatDate(r.to)}`;
  return "—";
};

type CountValue = Extract<DateRangeValue, { operator: CountOperator }>;
type DateValue = Extract<DateRangeValue, { operator: DateOperator }>;
type BetweenValue = Extract<DateRangeValue, { operator: "BETWEEN" }>;

export function DynamicDateRange(props: DynamicDateRangeProps): ZenComponent<DynamicDateRangeProps> {
  let current: DynamicDateRangeProps = { ...props };
  const weekStartsOn = () => current.weekStartsOn ?? 0;
  const fmt = (d: Date): string =>
    (current.formatDate ?? ((x: Date) => x.toLocaleDateString()))(d);

  // The value the trigger reports. Controlled when `value` is present; the
  // popover edits a DRAFT and only commits to this on Apply.
  const state = controllable<DateRangeValue | undefined>({
    value: current.value,
    defaultValue: current.defaultValue,
  });

  // A fresh Date every open would make yesterday's preview outlive the day. Pinned
  // per open instead, so a tab left open overnight re-pins when reopened. Seeded
  // now for the disabled/never-opened case (the "one saved value, three days" demo).
  let clock = current.now ?? new Date();
  let draft = state.get();

  // ---- trigger -----------------------------------------------------------
  const calIcon = Icon({ name: "calendar", size: 16, class: "zen-shrink-0 zen-text-zen-muted-fg" });
  const labelSpan = document.createElement("span");
  const resolvedSpan = document.createElement("span");
  resolvedSpan.className = "zen-text-xs zen-text-zen-muted-fg";
  resolvedSpan.hidden = true;

  const triggerBtn = Button({
    variant: "outline",
    color: "neutral",
    disabled: current.disabled,
    class: cn("zen-justify-start zen-gap-2 zen-font-normal", current.class),
    children: [calIcon.el, labelSpan, resolvedSpan],
  });

  const paintTrigger = () => {
    const v = state.get();
    labelSpan.textContent = v ? formatDateRangeValue(v, fmt) : current.placeholder ?? "Select a period";
    labelSpan.classList.toggle("zen-text-zen-muted-fg", !v);
    const resolvedNow = v ? resolveDateRange(v, clock, { weekStartsOn: weekStartsOn() }) : {};
    if (v && (resolvedNow.from || resolvedNow.to)) {
      // The trigger says "Last 7 days"; this says which 7. Both matter — the name
      // is the intent, the dates are the fact.
      resolvedSpan.textContent = `(${describe(resolvedNow, fmt)})`;
      resolvedSpan.hidden = false;
    } else {
      resolvedSpan.hidden = true;
    }
  };

  // ---- content: listbox (left) + editing pane (right) --------------------
  const content = document.createElement("div");
  content.className = "zen-flex zen-max-w-[34rem] zen-flex-col zen-gap-0 sm:zen-flex-row";

  const listbox = document.createElement("div");
  listbox.setAttribute("role", "listbox");
  listbox.setAttribute("aria-label", "Period");
  listbox.className =
    "zen-max-h-72 zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-b zen-border-zen-border zen-p-1 sm:zen-border-b-0 sm:zen-border-r";

  const pane = document.createElement("div");
  pane.className = "zen-flex zen-min-w-[16rem] zen-flex-col zen-gap-3 zen-p-3";

  content.append(listbox, pane);

  const optionButtons: Array<{ op: DateRangeOperator; btn: HTMLButtonElement }> = [];

  const paintOption = (btn: HTMLButtonElement, selected: boolean) => {
    btn.setAttribute("aria-selected", String(selected));
    btn.className = cn(
      "zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-px-2 zen-py-1.5",
      "zen-text-start zen-text-sm zen-transition-colors",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      selected
        ? "zen-bg-zen-primary zen-text-zen-primary-fg"
        : "zen-bg-transparent zen-text-zen-foreground hover:zen-bg-zen-muted",
    );
  };

  const paintListboxSelection = () => {
    for (const { op, btn } of optionButtons) paintOption(btn, draft?.operator === op);
  };

  const buildListbox = () => {
    optionButtons.length = 0;
    const list = current.operators
      ? DATE_RANGE_OPERATORS.filter((o) => current.operators!.includes(o.operator))
      : DATE_RANGE_OPERATORS;

    const groups: Array<readonly [string, OperatorMeta[]]> = GROUP_ORDER.filter((g) =>
      list.some((o) => o.group === g),
    ).map((g) => [g, list.filter((o) => o.group === g)] as const);

    listbox.replaceChildren();
    for (const [group, items] of groups) {
      const heading = document.createElement("div");
      heading.className =
        "zen-px-2 zen-pb-1 zen-pt-2 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg";
      heading.textContent = group;
      listbox.append(heading);

      for (const o of items) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("role", "option");
        btn.textContent = o.label;
        paintOption(btn, draft?.operator === o.operator);
        btn.addEventListener("click", () => pick(o.operator));
        listbox.append(btn);
        optionButtons.push({ op: o.operator, btn });
      }
    }
  };

  // ---- the editing pane --------------------------------------------------
  let paneDisposer = new Disposer();
  let previewEl: HTMLDivElement | null = null;
  let applyBtn: ZenComponent<import("../../button/button").ButtonProps> | null = null;

  const refreshPreview = () => {
    const preview = resolveDateRange(draft, clock, { weekStartsOn: weekStartsOn() });
    const valid = !!(preview.from || preview.to);
    if (previewEl) previewEl.textContent = valid ? describe(preview, fmt) : "—";
    applyBtn?.update({ disabled: !draft || !valid });
  };

  const rebuildPane = () => {
    paneDisposer.dispose();
    paneDisposer = new Disposer();
    pane.replaceChildren();
    previewEl = null;
    applyBtn = null;

    const meta = draft ? operatorMeta(draft.operator) : undefined;

    if (!draft) {
      const p = document.createElement("p");
      p.className = "zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      p.textContent = "Pick a period on the left.";
      pane.append(p);
    }

    if (meta?.arity === "count" && draft && "count" in draft) {
      const wrap = document.createElement("div");
      wrap.className = "zen-flex zen-flex-col zen-gap-2";

      const row = document.createElement("label");
      row.className = "zen-flex zen-items-center zen-gap-2 zen-text-sm";
      const dir = document.createElement("span");
      dir.className = "zen-text-zen-muted-fg";
      dir.textContent = draft.operator.startsWith("LAST") ? "Last" : "Next";

      const input = Input({
        type: "number",
        value: String(draft.count),
        "aria-label": `Number of ${meta.unit}s`,
        class: "zen-h-8 zen-w-20",
        onInput: (e) => {
          const n = Number((e.target as HTMLInputElement).value);
          const cur = draft as CountValue;
          draft = { ...cur, count: Number.isFinite(n) ? n : 0 };
          refreshPreview();
        },
      });
      // `min` is not part of InputProps; set it on the native node directly.
      input.el.setAttribute("min", "0");
      paneDisposer.add(() => input.destroy());

      const unit = document.createElement("span");
      unit.className = "zen-text-zen-muted-fg";
      unit.textContent = `${meta.unit}s`;
      row.append(dir, input.el, unit);

      const inclLabel = document.createElement("label");
      inclLabel.className =
        "zen-flex zen-cursor-pointer zen-items-center zen-gap-2 zen-text-sm zen-text-zen-muted-fg";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!draft.includeCurrent;
      cb.addEventListener("change", () => {
        const cur = draft as CountValue;
        draft = { ...cur, includeCurrent: cb.checked };
        refreshPreview();
      });
      // Named for what it does to the dates, not "includeCurrent" — the whole
      // hazard is that the difference is invisible.
      inclLabel.append(cb, document.createTextNode(`Include the current ${meta.unit}`));

      wrap.append(row, inclLabel);
      pane.append(wrap);
    }

    if (meta?.arity === "date" && draft && "date" in draft) {
      const cal = Calendar({
        mode: "single",
        selected: parseISODate(draft.date) ?? undefined,
        onSelect: (d) => {
          if (!d) return;
          const cur = draft as DateValue;
          draft = { ...cur, date: toISODate(d as Date) };
          cal.update({ selected: d as Date });
          refreshPreview();
        },
      });
      paneDisposer.add(() => cal.destroy());
      pane.append(cal.el);
    }

    if (meta?.arity === "range" && draft && "from" in draft) {
      const cal = Calendar({
        mode: "range",
        selected: { from: parseISODate(draft.from) ?? undefined, to: parseISODate(draft.to) ?? undefined },
        onSelect: (r) => {
          const range = r as DateRange | undefined;
          const cur = draft as BetweenValue;
          draft = {
            operator: "BETWEEN",
            from: range?.from ? toISODate(range.from) : cur.from,
            to: range?.to ? toISODate(range.to) : range?.from ? toISODate(range.from) : cur.to,
          };
          cal.update({
            selected: { from: parseISODate(draft.from) ?? undefined, to: parseISODate(draft.to) ?? undefined },
          });
          refreshPreview();
        },
      });
      paneDisposer.add(() => cal.destroy());
      pane.append(cal.el);
    }

    if (draft) {
      previewEl = document.createElement("div");
      previewEl.setAttribute("aria-live", "polite");
      previewEl.className =
        "zen-rounded-zen-md zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-xs zen-text-zen-muted-fg";
      pane.append(previewEl);
    }

    const actions = document.createElement("div");
    actions.className = "zen-flex zen-justify-end zen-gap-2";
    const cancel = Button({
      variant: "ghost",
      color: "neutral",
      size: "sm",
      children: "Cancel",
      onClick: () => popover.close(),
    });
    applyBtn = Button({
      size: "sm",
      children: "Apply",
      onClick: () => commit(),
    });
    paneDisposer.add(() => cancel.destroy());
    paneDisposer.add(() => applyBtn?.destroy());
    actions.append(cancel.el, applyBtn.el);
    pane.append(actions);

    refreshPreview();
  };

  // ---- behaviour ---------------------------------------------------------
  const pick = (op: DateRangeOperator) => {
    const m = operatorMeta(op);
    if (!m) return;
    // Carry the count across a change of unit: someone who typed 7 for days and
    // then switches to weeks meant 7 weeks, not a reset to 1.
    const keptCount = draft && "count" in draft ? draft.count : 1;
    const keptIncl = draft && "includeCurrent" in draft ? draft.includeCurrent : false;
    const today = toISODate(clock);
    if (m.arity === "count") draft = { operator: op as CountOperator, count: keptCount, includeCurrent: keptIncl };
    else if (m.arity === "date")
      draft = { operator: op as DateOperator, date: draft && "date" in draft ? draft.date : today };
    else if (m.arity === "range")
      draft = {
        operator: "BETWEEN",
        from: draft && "from" in draft ? draft.from : today,
        to: draft && "to" in draft ? draft.to : today,
      };
    else draft = { operator: op as FixedOperator };
    paintListboxSelection();
    rebuildPane();
  };

  const commit = () => {
    const next = draft;
    // The popover edits a draft and commits on Apply, matching DateRangePicker's
    // Cancel/Done contract. `now` (not the pinned clock) resolves the committed
    // value, so a caller querying immediately gets the live answer.
    state.set(next);
    current.onValueChange?.(next, resolveDateRange(next, current.now ?? new Date(), { weekStartsOn: weekStartsOn() }));
    popover.close();
  };

  const popover = Popover({
    trigger: triggerBtn,
    children: content,
    align: "start",
    class: "zen-w-auto zen-p-0",
    onOpenChange: (open) => {
      // Seed the draft and RE-pin the clock each time it opens — never while open,
      // or a controlled parent re-rendering for any other reason would overwrite
      // what is being typed.
      if (open) {
        clock = current.now ?? new Date();
        draft = state.get();
        paintListboxSelection();
        rebuildPane();
        paintTrigger();
      }
    },
  });

  const disposer = new Disposer();
  disposer.add(state.subscribe(paintTrigger));
  disposer.add(() => paneDisposer.dispose());
  disposer.add(() => popover.destroy());
  disposer.add(() => triggerBtn.destroy());
  disposer.add(() => calIcon.destroy());

  buildListbox();
  rebuildPane();
  paintTrigger();

  return {
    el: popover.el,
    update(next) {
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);
      if (next.operators !== undefined) {
        buildListbox();
        paintListboxSelection();
      }
      triggerBtn.update({
        disabled: current.disabled,
        class: cn("zen-justify-start zen-gap-2 zen-font-normal", current.class),
      });
      paintTrigger();
    },
    destroy() {
      disposer.dispose();
    },
  };
}

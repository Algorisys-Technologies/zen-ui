import * as React from "react";
import { directionOf } from "@algorisys/zen-ui-core";
import { filterReasons, reasonCategories, type ReasonCode } from "@algorisys/zen-ui-core/reason-codes";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";
import { Search } from "../form/search/search";

/**
 * ReasonCodePicker — a touch grid for saying why: why a machine stopped, why a
 * part was scrapped.
 *
 *   <ReasonCodePicker
 *     reasons={downtimeReasons}
 *     value={reasonId}
 *     onChange={(id) => setReasonId(id)}
 *   />
 *
 * Big targets (48px or more) for gloved hands, category chips when the list has
 * more than one category, and a search box once it is long enough to need one —
 * matching label, code and description, ignoring case and accents, every word
 * in any order. Operators who know the code type "M12".
 *
 * A listbox, one tab stop. Arrow keys move focus; Enter, Space or a tap
 * selects. Selection deliberately does NOT follow focus: choosing a reason is
 * often what records the stop, and walking the list with the arrow keys must
 * not record anything on the way.
 *
 * A selected reason the filter hides stays selected and is named under the
 * grid, so filtering can never quietly change or lose the answer.
 */

export type ReasonCodePickerProps<R extends ReasonCode = ReasonCode> = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange" | "defaultValue"
> & {
  reasons: R[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string, reason: R) => void;
  /** Names the list — the question it answers. Defaults to "Reason". */
  label?: string;
  /** Show the search box. Defaults to on once there are more than 12 reasons. */
  searchable?: boolean;
  /** Show category chips. Defaults to on when there is more than one category. */
  showCategories?: boolean;
};

const chip = (on: boolean) =>
  cn(
    "zen-inline-flex zen-min-h-12 zen-items-center zen-gap-1.5 zen-rounded-zen-full zen-border zen-border-solid zen-px-4 zen-text-sm zen-font-medium zen-cursor-pointer",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
    on
      ? "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg"
      : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground hover:zen-bg-zen-muted",
  );

function ReasonCodePickerInner<R extends ReasonCode = ReasonCode>(
  { reasons, value, defaultValue, onChange, label, searchable, showCategories, className, ...rest }: ReasonCodePickerProps<R>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const loc = useLocale();
  const id = React.useId();

  const [own, setOwn] = React.useState(defaultValue);
  const selected = value !== undefined ? value : own;
  const [category, setCategory] = React.useState<string | undefined>();
  const [query, setQuery] = React.useState("");

  const categories = React.useMemo(() => reasonCategories(reasons), [reasons]);
  const showChips = showCategories ?? categories.length > 1;
  const showSearch = searchable ?? reasons.length > 12;
  const visible = React.useMemo(() => filterReasons(reasons, { category, query }), [reasons, category, query]);
  const hiddenSelection =
    selected === undefined || visible.some((r) => r.id === selected)
      ? undefined
      : reasons.find((r) => r.id === selected);

  const choose = (r: R) => {
    setOwn(r.id);
    onChange?.(r.id, r);
  };

  // One tab stop: the focused option if still visible, else the selected one,
  // else the first.
  const [active, setActive] = React.useState<string | undefined>();
  const stop =
    visible.find((r) => r.id === active)?.id ?? visible.find((r) => r.id === selected)?.id ?? visible[0]?.id;

  const grid = React.useRef<HTMLDivElement>(null);
  const focusOption = (rid: string) => {
    setActive(rid);
    grid.current?.querySelector<HTMLElement>(`[data-reason-id="${CSS.escape(rid)}"]`)?.focus();
  };
  /** How many options sit in one visual row, read from the layout. */
  const perRow = () => {
    const els = grid.current ? [...grid.current.querySelectorAll<HTMLElement>("[data-reason-id]")] : [];
    if (els.length < 2) return 1;
    const top = els[0].offsetTop;
    const n = els.findIndex((e) => e.offsetTop !== top);
    return n < 0 ? els.length : n;
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const list = visible;
    const i = list.findIndex((r) => r.id === stop);
    if (i < 0) return;
    const rtl = directionOf(grid.current) === "rtl";
    let to = -1;
    if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) to = i + 1;
    else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) to = i - 1;
    else if (e.key === "ArrowDown") to = i + perRow();
    else if (e.key === "ArrowUp") to = i - perRow();
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = list.length - 1;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(list[i]);
      return;
    } else return;
    e.preventDefault();
    focusOption(list[Math.min(list.length - 1, Math.max(0, to))].id);
  };

  const listId = [id, "list"].join("-");

  return (
    <div ref={ref} className={cn("zen-flex zen-w-full zen-flex-col zen-gap-3", className)} {...rest}>
      {showSearch && (
        <Search
          size="lg"
          value={query}
          onValueChange={setQuery}
          placeholder={loc.t("reasonCodes.search")}
          aria-label={loc.t("reasonCodes.search")}
          aria-controls={listId}
        />
      )}

      {showChips && (
        <div role="group" aria-label={loc.t("reasonCodes.categories")} className="zen-flex zen-flex-wrap zen-gap-2">
          <button
            type="button"
            aria-pressed={category === undefined}
            className={chip(category === undefined)}
            onClick={() => setCategory(undefined)}
          >
            {loc.t("reasonCodes.all")}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              className={chip(category === c.id)}
              onClick={() => setCategory(category === c.id ? undefined : c.id)}
            >
              {c.id}
              <span className="zen-tabular-nums zen-opacity-80">{c.count}</span>
            </button>
          ))}
        </div>
      )}

      <div
        ref={grid}
        id={listId}
        role="listbox"
        aria-label={label ?? loc.t("reasonCodes.label")}
        className="zen-grid zen-gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(var(--zen-reason-min-width), 100%), 1fr))" }}
        onKeyDown={onKeyDown}
      >
        {visible.map((r) => (
          <div
            key={r.id}
            role="option"
            data-reason-id={r.id}
            aria-selected={selected === r.id}
            tabIndex={stop === r.id ? 0 : -1}
            title={r.description}
            className={cn(
              "zen-flex zen-min-h-14 zen-cursor-pointer zen-select-none zen-flex-col zen-justify-center zen-gap-0.5 zen-rounded-zen-md zen-border-2 zen-border-solid zen-px-3 zen-py-2",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
              selected === r.id
                ? "zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
                : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground hover:zen-bg-zen-muted",
            )}
            onFocus={() => setActive(r.id)}
            onClick={() => choose(r)}
          >
            {r.code ? <span className="zen-font-mono zen-text-xs zen-opacity-80">{r.code}</span> : null}
            <span className="zen-text-base zen-font-medium zen-leading-snug">{r.label}</span>
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">{loc.t("reasonCodes.none", { query })}</p>
      )}
      {hiddenSelection && (
        <p className="zen-m-0 zen-text-sm zen-text-zen-foreground" role="status">
          {loc.t("reasonCodes.selectedHidden", {
            label: hiddenSelection.code ? `${hiddenSelection.code} ${hiddenSelection.label}` : hiddenSelection.label,
          })}
        </p>
      )}
    </div>
  );
}

const ReasonCodePickerBase = React.forwardRef(ReasonCodePickerInner);
ReasonCodePickerBase.displayName = "ReasonCodePicker";

/** Generic over the reason type, so `onChange` hands back the caller's own `R`. */
export const ReasonCodePicker = ReasonCodePickerBase as <R extends ReasonCode = ReasonCode>(
  props: ReasonCodePickerProps<R> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;

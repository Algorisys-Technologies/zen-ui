import { type JSX, For, Show, createMemo, createSignal, createUniqueId, splitProps } from "solid-js";
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
 *     value={reasonId()}
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
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
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

export function ReasonCodePicker<R extends ReasonCode = ReasonCode>(props: ReasonCodePickerProps<R>) {
  const [local, rest] = splitProps(props, [
    "reasons",
    "value",
    "defaultValue",
    "onChange",
    "label",
    "searchable",
    "showCategories",
    "class",
  ]);
  const loc = useLocale();
  const id = createUniqueId();

  const [own, setOwn] = createSignal(local.defaultValue);
  const selected = () => (local.value !== undefined ? local.value : own());
  const [category, setCategory] = createSignal<string | undefined>();
  const [query, setQuery] = createSignal("");

  const categories = createMemo(() => reasonCategories(local.reasons));
  const showChips = () => local.showCategories ?? categories().length > 1;
  const showSearch = () => local.searchable ?? local.reasons.length > 12;
  const visible = createMemo(() => filterReasons(local.reasons, { category: category(), query: query() }));
  const hiddenSelection = () => {
    const s = selected();
    if (s === undefined || visible().some((r) => r.id === s)) return undefined;
    return local.reasons.find((r) => r.id === s);
  };

  const choose = (r: R) => {
    setOwn(r.id);
    local.onChange?.(r.id, r);
  };

  // One tab stop: the focused option if still visible, else the selected one,
  // else the first.
  const [active, setActive] = createSignal<string | undefined>();
  const stop = () => {
    const list = visible();
    return (
      list.find((r) => r.id === active())?.id ?? list.find((r) => r.id === selected())?.id ?? list[0]?.id
    );
  };
  let grid: HTMLDivElement | undefined;
  const focusOption = (rid: string) => {
    setActive(rid);
    grid?.querySelector<HTMLElement>(`[data-reason-id="${CSS.escape(rid)}"]`)?.focus();
  };
  /** How many options sit in one visual row, read from the layout. */
  const perRow = () => {
    const els = grid ? [...grid.querySelectorAll<HTMLElement>("[data-reason-id]")] : [];
    if (els.length < 2) return 1;
    const top = els[0].offsetTop;
    const n = els.findIndex((e) => e.offsetTop !== top);
    return n < 0 ? els.length : n;
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const list = visible();
    const i = list.findIndex((r) => r.id === stop());
    if (i < 0) return;
    const rtl = directionOf(grid) === "rtl";
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

  const chip = (on: boolean) =>
    cn(
      "zen-inline-flex zen-min-h-12 zen-items-center zen-gap-1.5 zen-rounded-zen-full zen-border zen-border-solid zen-px-4 zen-text-sm zen-font-medium zen-cursor-pointer",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      on
        ? "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg"
        : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground hover:zen-bg-zen-muted",
    );

  return (
    <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-3", local.class)} {...rest}>
      <Show when={showSearch()}>
        <Search
          size="lg"
          value={query()}
          onValueChange={setQuery}
          placeholder={loc.t("reasonCodes.search")}
          aria-label={loc.t("reasonCodes.search")}
          aria-controls={`${id}-list`}
        />
      </Show>

      <Show when={showChips()}>
        <div role="group" aria-label={loc.t("reasonCodes.categories")} class="zen-flex zen-flex-wrap zen-gap-2">
          <button type="button" aria-pressed={category() === undefined} class={chip(category() === undefined)} onClick={() => setCategory(undefined)}>
            {loc.t("reasonCodes.all")}
          </button>
          <For each={categories()}>
            {(c) => (
              <button
                type="button"
                aria-pressed={category() === c.id}
                class={chip(category() === c.id)}
                onClick={() => setCategory(category() === c.id ? undefined : c.id)}
              >
                {c.id}
                <span class="zen-tabular-nums zen-opacity-80">{c.count}</span>
              </button>
            )}
          </For>
        </div>
      </Show>

      <div
        ref={grid}
        id={`${id}-list`}
        role="listbox"
        aria-label={local.label ?? loc.t("reasonCodes.label")}
        class="zen-grid zen-gap-2"
        style={{ "grid-template-columns": "repeat(auto-fill, minmax(min(var(--zen-reason-min-width), 100%), 1fr))" }}
        onKeyDown={onKeyDown}
      >
        <For each={visible()}>
          {(r) => (
            <div
              role="option"
              data-reason-id={r.id}
              aria-selected={selected() === r.id}
              tabIndex={stop() === r.id ? 0 : -1}
              title={r.description}
              class={cn(
                "zen-flex zen-min-h-14 zen-cursor-pointer zen-select-none zen-flex-col zen-justify-center zen-gap-0.5 zen-rounded-zen-md zen-border-2 zen-border-solid zen-px-3 zen-py-2",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                selected() === r.id
                  ? "zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
                  : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground hover:zen-bg-zen-muted",
              )}
              onFocus={() => setActive(r.id)}
              onClick={() => choose(r)}
            >
              <Show when={r.code}>
                <span class="zen-font-mono zen-text-xs zen-opacity-80">{r.code}</span>
              </Show>
              <span class="zen-text-base zen-font-medium zen-leading-snug">{r.label}</span>
            </div>
          )}
        </For>
      </div>

      <Show when={visible().length === 0}>
        <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">{loc.t("reasonCodes.none", { query: query() })}</p>
      </Show>
      <Show when={hiddenSelection()}>
        {(r) => (
          <p class="zen-m-0 zen-text-sm zen-text-zen-foreground" role="status">
            {loc.t("reasonCodes.selectedHidden", { label: r().code ? `${r().code} ${r().label}` : r().label })}
          </p>
        )}
      </Show>
    </div>
  );
}

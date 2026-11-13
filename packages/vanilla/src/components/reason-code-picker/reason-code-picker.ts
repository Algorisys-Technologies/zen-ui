import { directionOf } from "@algorisys/zen-ui-core";
import { filterReasons, reasonCategories, type ReasonCode } from "@algorisys/zen-ui-core/reason-codes";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";
import { Search, type SearchHandle } from "../form/search/search";

/**
 * ReasonCodePicker — a touch grid for saying why: why a machine stopped, why a
 * part was scrapped. The vanilla port of the React reference.
 *
 *   const picker = ReasonCodePicker({
 *     reasons: downtimeReasons,
 *     value: reasonId,
 *     onChange: (id) => picker.update({ value: id }),
 *   });
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
 *
 * THIS BINDING keeps its nodes. The search box, the chips and each option are
 * built once and only their state is written on a change; the grid's children
 * are replaced only when the visible SET changes. Rebuilding on every change
 * would drop focus out of the field being typed in, or the option an arrow key
 * just moved to.
 */

export interface ReasonCodePickerProps<R extends ReasonCode = ReasonCode> extends Omit<BaseProps, "children"> {
  reasons: R[];
  /** Controlled. */
  value?: string;
  defaultValue?: string;
  /**
   * Method syntax on purpose: it makes the props bivariant in `R`, so a handle
   * built over a caller's own reason type can be held as the default
   * `ReasonCodePickerHandle` (`ReturnType<typeof ReasonCodePicker>`). As a
   * property, `reasons` and `onChange` pull `R` opposite ways and neither
   * handle is assignable to the other.
   */
  onChange?(id: string, reason: R): void;
  /** Names the list — the question it answers. Defaults to "Reason". */
  label?: string;
  /** Show the search box. Defaults to on once there are more than 12 reasons. */
  searchable?: boolean;
  /** Show category chips. Defaults to on when there is more than one category. */
  showCategories?: boolean;
}

export type ReasonCodePickerHandle<R extends ReasonCode = ReasonCode> = ZenComponent<
  ReasonCodePickerProps<R>,
  HTMLDivElement
>;

const chip = (on: boolean) =>
  cn(
    "zen-inline-flex zen-min-h-12 zen-items-center zen-gap-1.5 zen-rounded-zen-full zen-border zen-border-solid zen-px-4 zen-text-sm zen-font-medium zen-cursor-pointer",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
    on
      ? "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg"
      : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground hover:zen-bg-zen-muted",
  );

const option = (on: boolean) =>
  cn(
    "zen-flex zen-min-h-14 zen-cursor-pointer zen-select-none zen-flex-col zen-justify-center zen-gap-0.5 zen-rounded-zen-md zen-border-2 zen-border-solid zen-px-3 zen-py-2",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
    on
      ? "zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
      : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground hover:zen-bg-zen-muted",
  );

let uid = 0;

export function ReasonCodePicker<R extends ReasonCode = ReasonCode>(
  props: ReasonCodePickerProps<R>,
): ReasonCodePickerHandle<R> {
  let current: ReasonCodePickerProps<R> = { ...props };
  const loc = useLocale();
  const listId = `zen-reason-${++uid}-list`;
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let own = current.defaultValue;
  let category: string | undefined;
  let query = "";
  let active: string | undefined;

  const selected = () => (current.value !== undefined ? current.value : own);
  const visible = () => filterReasons(current.reasons, { category, query });

  const el = document.createElement("div");

  // ---- search ---------------------------------------------------------------
  let search: SearchHandle | undefined;

  // ---- chips ----------------------------------------------------------------
  const chips = document.createElement("div");
  chips.setAttribute("role", "group");
  chips.className = "zen-flex zen-flex-wrap zen-gap-2";
  let chipButtons: { id: string | undefined; btn: HTMLButtonElement }[] = [];
  let chipKey = "";

  const makeChip = (id: string | undefined, text: string, count?: number) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.append(text);
    if (count !== undefined) {
      const n = document.createElement("span");
      n.className = "zen-tabular-nums zen-opacity-80";
      n.textContent = String(count);
      btn.append(n);
    }
    btn.addEventListener("click", () => {
      category = id === undefined ? undefined : category === id ? undefined : id;
      render();
    });
    chipButtons.push({ id, btn });
    return btn;
  };

  // ---- grid -----------------------------------------------------------------
  const grid = document.createElement("div");
  grid.id = listId;
  grid.setAttribute("role", "listbox");
  grid.className = "zen-grid zen-gap-2";
  grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(min(var(--zen-reason-min-width), 100%), 1fr))";

  /** One node per reason, rebuilt when `reasons` changes. */
  let optionNodes = new Map<string, HTMLDivElement>();
  let optionsFor: R[] | undefined;
  let shownKey: string | undefined;

  const buildOptions = () => {
    optionNodes = new Map();
    for (const r of current.reasons) {
      const o = document.createElement("div");
      o.setAttribute("role", "option");
      o.dataset.reasonId = r.id;
      if (r.description) o.title = r.description;
      if (r.code) {
        const c = document.createElement("span");
        c.className = "zen-font-mono zen-text-xs zen-opacity-80";
        c.textContent = r.code;
        o.append(c);
      }
      const l = document.createElement("span");
      l.className = "zen-text-base zen-font-medium zen-leading-snug";
      l.textContent = r.label;
      o.append(l);
      o.addEventListener("focus", () => {
        active = r.id;
        paintStop();
      });
      o.addEventListener("click", () => choose(r));
      optionNodes.set(r.id, o);
    }
    optionsFor = current.reasons;
  };

  const none = document.createElement("p");
  none.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  const hidden = document.createElement("p");
  hidden.className = "zen-m-0 zen-text-sm zen-text-zen-foreground";
  hidden.setAttribute("role", "status");

  /** One tab stop: the focused option if still visible, else the selected one, else the first. */
  const stopOf = (list: R[]) =>
    list.find((r) => r.id === active)?.id ?? list.find((r) => r.id === selected())?.id ?? list[0]?.id;

  const paintStop = () => {
    const stop = stopOf(visible());
    for (const [id, o] of optionNodes) o.tabIndex = id === stop ? 0 : -1;
  };

  const choose = (r: R) => {
    own = r.id;
    current.onChange?.(r.id, r);
    render();
  };

  const focusOption = (rid: string) => {
    active = rid;
    paintStop();
    optionNodes.get(rid)?.focus();
  };

  /** How many options sit in one visual row, read from the layout. */
  const perRow = () => {
    const els = [...grid.querySelectorAll<HTMLElement>("[data-reason-id]")];
    if (els.length < 2) return 1;
    const top = els[0].offsetTop;
    const n = els.findIndex((e) => e.offsetTop !== top);
    return n < 0 ? els.length : n;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const list = visible();
    const i = list.findIndex((r) => r.id === stopOf(list));
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
  grid.addEventListener("keydown", onKeyDown);
  disposer.add(() => grid.removeEventListener("keydown", onKeyDown));

  const render = () => {
    const {
      class: className,
      reasons,
      value: _value,
      defaultValue: _defaultValue,
      onChange: _onChange,
      label,
      searchable,
      showCategories,
      ...rest
    } = current;

    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-3", className);

    // Search — kept alive across renders so typing keeps its focus.
    const showSearch = searchable ?? reasons.length > 12;
    if (showSearch && !search) {
      search = Search({
        size: "lg",
        value: query,
        onValueChange: (v) => {
          query = v;
          render();
        },
        placeholder: loc.t("reasonCodes.search"),
        "aria-label": loc.t("reasonCodes.search"),
        "aria-controls": listId,
      });
    } else if (!showSearch && search) {
      search.destroy();
      search = undefined;
      query = "";
    }
    search?.update({ value: query });

    // Chips — rebuilt only when the categories change.
    const categories = reasonCategories(reasons);
    const showChips = showCategories ?? categories.length > 1;
    if (category !== undefined && !categories.some((c) => c.id === category)) category = undefined;
    const key = categories.map((c) => [c.id, c.count].join(":")).join("|");
    if (key !== chipKey) {
      chipKey = key;
      chipButtons = [];
      chips.replaceChildren(
        makeChip(undefined, loc.t("reasonCodes.all")),
        ...categories.map((c) => makeChip(c.id, c.id, c.count)),
      );
    }
    chips.setAttribute("aria-label", loc.t("reasonCodes.categories"));
    for (const { id, btn } of chipButtons) {
      const on = category === id;
      btn.className = chip(on);
      btn.setAttribute("aria-pressed", String(on));
    }

    // Grid.
    if (optionsFor !== reasons) {
      buildOptions();
      shownKey = undefined;
    }
    grid.setAttribute("aria-label", label ?? loc.t("reasonCodes.label"));
    const list = visible();
    const nextKey = list.map((r) => r.id).join("\u0000");
    if (nextKey !== shownKey) {
      shownKey = nextKey;
      grid.replaceChildren(...list.map((r) => optionNodes.get(r.id) as HTMLDivElement));
    }
    const sel = selected();
    for (const [id, o] of optionNodes) {
      o.className = option(sel === id);
      o.setAttribute("aria-selected", String(sel === id));
    }
    paintStop();

    // Under the grid.
    none.textContent = loc.t("reasonCodes.none", { query });
    const hiddenSelection =
      sel === undefined || list.some((r) => r.id === sel) ? undefined : reasons.find((r) => r.id === sel);
    if (hiddenSelection) {
      hidden.textContent = loc.t("reasonCodes.selectedHidden", {
        label: hiddenSelection.code ? [hiddenSelection.code, hiddenSelection.label].join(" ") : hiddenSelection.label,
      });
    }

    // What is absent in React is absent here. A part is inserted or removed in
    // place and the others never move: moving a node drops its focus, so
    // replacing the children would throw the caret out of the search box the
    // moment a hidden selection's note appeared.
    const parts: [Node, boolean][] = [
      ...(search ? [[search.el, true] as [Node, boolean]] : []),
      [chips, showChips],
      [grid, true],
      [none, list.length === 0],
      [hidden, !!hiddenSelection],
    ];
    for (const [n, on] of parts) if (!on && n.parentNode === el) el.removeChild(n);
    parts.forEach(([n, on], i) => {
      if (!on || n.parentNode === el) return;
      const after = parts.slice(i + 1).find(([m, mOn]) => mOn && m.parentNode === el)?.[0] ?? null;
      el.insertBefore(n, after);
    });

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());
  disposer.add(() => search?.destroy());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

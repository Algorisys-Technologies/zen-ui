import { For, Show } from "solid-js";
import { cn } from "../../lib/cn";
import { Input } from "../form/input/input";
import { Checkbox } from "../form/checkbox/checkbox";
import { Icon, type IconName } from "../icon/icon";

/**
 * The searchable item list shared by the pickers — SelectDialog's whole body,
 * and ValueHelp's "Select" tab. Not exported from the package: it is the
 * innards of those components, not a control anyone should reach for directly.
 *
 * Split into a search field and a list body rather than one component because
 * SelectDialog puts them in different containers: the field sits in the bordered
 * header while the body owns the scroller, so a single wrapper could not produce
 * that layout.
 *
 * Query state stays with the caller. A picker resets its search when it opens,
 * and that rule belongs to whoever owns "open", not to the list.
 *
 * Mirrors the React binding.
 */
export interface SelectListItem {
  id: string;
  label: string;
  /** Secondary line under the label. */
  description?: string;
  /** Right-aligned trailing text — the "info", e.g. a status or amount. */
  info?: string;
  icon?: IconName;
  disabled?: boolean;
}

export const SelectSearchField = (props: {
  value: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
  class?: string;
}) => {
  const placeholder = () => props.placeholder ?? "Search";
  return (
    <div class={cn("zen-relative", props.class)}>
      <Icon
        name="search"
        size={14}
        class="zen-pointer-events-none zen-absolute zen-left-3 zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg"
      />
      <Input
        value={props.value}
        onInput={(e) => props.onValueChange(e.currentTarget.value)}
        placeholder={placeholder()}
        aria-label={placeholder()}
        class="zen-pl-9"
      />
    </div>
  );
};

export const SelectListBody = (props: {
  items: SelectListItem[];
  multiple?: boolean;
  /** ids that are ticked (multi) or current (single) */
  selected: string[];
  onToggle: (id: string) => void;
  onPick: (id: string) => void;
  emptyText?: string;
}) => (
  <Show
    when={props.items.length > 0}
    fallback={
      <p class="zen-m-0 zen-px-4 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg">
        {props.emptyText ?? "No matching items"}
      </p>
    }
  >
    <ul class="zen-m-0 zen-flex zen-list-none zen-flex-col zen-p-0">
      <For each={props.items}>
        {(item) => (
          <li>
            <Show
              when={props.multiple}
              fallback={
                <SingleRow
                  item={item}
                  current={props.selected.includes(item.id)}
                  onPick={() => props.onPick(item.id)}
                />
              }
            >
              <MultiRow
                item={item}
                checked={props.selected.includes(item.id)}
                onToggle={() => props.onToggle(item.id)}
              />
            </Show>
          </li>
        )}
      </For>
    </ul>
  </Show>
);

const ROW_CLASS =
  "zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-sm zen-px-4 zen-py-2.5 zen-text-start";

const RowBody = (props: { item: SelectListItem }) => (
  <>
    <Show when={props.item.icon}>
      {(icon) => <Icon name={icon()} size={16} class="zen-shrink-0 zen-text-zen-muted-fg" />}
    </Show>
    <span class="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col">
      <span class="zen-truncate zen-text-sm">{props.item.label}</span>
      <Show when={props.item.description}>
        <span class="zen-truncate zen-text-xs zen-text-zen-muted-fg">
          {props.item.description}
        </span>
      </Show>
    </span>
    <Show when={props.item.info}>
      <span class="zen-shrink-0 zen-text-xs zen-text-zen-muted-fg">{props.item.info}</span>
    </Show>
  </>
);

/**
 * A real <button>, not a role="option": picking commits, so this is an action.
 * It also buys Enter/Space and tab order without a roving-tabindex manager.
 * `aria-current` marks the incoming selection without claiming listbox
 * semantics the surrounding markup does not have.
 */
const SingleRow = (props: { item: SelectListItem; current: boolean; onPick: () => void }) => (
  <button
    type="button"
    disabled={props.item.disabled}
    aria-current={props.current || undefined}
    onClick={() => props.onPick()}
    class={cn(
      ROW_CLASS,
      "zen-border-0 zen-bg-transparent zen-cursor-pointer",
      "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      props.current && "zen-bg-zen-muted",
    )}
  >
    <RowBody item={props.item} />
    <Show when={props.current}>
      <Icon name="check" size={16} class="zen-shrink-0 zen-text-zen-primary" />
    </Show>
  </button>
);

/** A <label> so the whole row is the checkbox's hit target, not just the box. */
const MultiRow = (props: { item: SelectListItem; checked: boolean; onToggle: () => void }) => (
  <label
    class={cn(
      ROW_CLASS,
      "zen-cursor-pointer hover:zen-bg-zen-muted",
      props.item.disabled && "zen-cursor-not-allowed zen-opacity-50",
    )}
  >
    <Checkbox checked={props.checked} disabled={props.item.disabled} onChange={() => props.onToggle()} />
    <RowBody item={props.item} />
  </label>
);

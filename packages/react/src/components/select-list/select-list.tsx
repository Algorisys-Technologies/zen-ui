import { cn } from "@algorisys/zen-ui-core";
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

export const SelectSearchField = ({
  value,
  onValueChange,
  placeholder = "Search",
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) => (
  <div className={cn("zen-relative", className)}>
    <Icon
      name="search"
      size={14}
      className="zen-pointer-events-none zen-absolute zen-start-3 zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg"
    />
    <Input
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="zen-ps-9"
    />
  </div>
);

export const SelectListBody = ({
  items,
  multiple = false,
  selected,
  onToggle,
  onPick,
  emptyText = "No matching items",
}: {
  items: SelectListItem[];
  multiple?: boolean;
  /** ids that are ticked (multi) or current (single) */
  selected: string[];
  onToggle: (id: string) => void;
  onPick: (id: string) => void;
  emptyText?: string;
}) => {
  if (items.length === 0) {
    return (
      <p className="zen-m-0 zen-px-4 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg">
        {emptyText}
      </p>
    );
  }
  return (
    <ul className="zen-m-0 zen-flex zen-list-none zen-flex-col zen-p-0">
      {items.map((item) => (
        <li key={item.id}>
          {multiple ? (
            <MultiRow
              item={item}
              checked={selected.includes(item.id)}
              onToggle={() => onToggle(item.id)}
            />
          ) : (
            <SingleRow
              item={item}
              current={selected.includes(item.id)}
              onPick={() => onPick(item.id)}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

const ROW_CLASS =
  "zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-sm zen-px-4 zen-py-2.5 zen-text-start";

const RowBody = ({ item }: { item: SelectListItem }) => (
  <>
    {item.icon ? (
      <Icon name={item.icon} size={16} className="zen-shrink-0 zen-text-zen-muted-fg" />
    ) : null}
    <span className="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col">
      <span className="zen-truncate zen-text-sm">{item.label}</span>
      {item.description ? (
        <span className="zen-truncate zen-text-xs zen-text-zen-muted-fg">{item.description}</span>
      ) : null}
    </span>
    {item.info ? (
      <span className="zen-shrink-0 zen-text-xs zen-text-zen-muted-fg">{item.info}</span>
    ) : null}
  </>
);

/**
 * A real <button>, not a role="option": picking commits, so this is an action.
 * It also buys Enter/Space and tab order without a roving-tabindex manager.
 * `aria-current` marks the incoming selection without claiming listbox
 * semantics the surrounding markup does not have.
 */
const SingleRow = ({
  item,
  current,
  onPick,
}: {
  item: SelectListItem;
  current: boolean;
  onPick: () => void;
}) => (
  <button
    type="button"
    disabled={item.disabled}
    aria-current={current || undefined}
    onClick={onPick}
    className={cn(
      ROW_CLASS,
      "zen-border-0 zen-bg-transparent zen-cursor-pointer",
      "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      current && "zen-bg-zen-muted",
    )}
  >
    <RowBody item={item} />
    {current ? <Icon name="check" size={16} className="zen-shrink-0 zen-text-zen-primary" /> : null}
  </button>
);

/** A <label> so the whole row is the checkbox's hit target, not just the box. */
const MultiRow = ({
  item,
  checked,
  onToggle,
}: {
  item: SelectListItem;
  checked: boolean;
  onToggle: () => void;
}) => (
  <label
    className={cn(
      ROW_CLASS,
      "zen-cursor-pointer hover:zen-bg-zen-muted",
      item.disabled && "zen-cursor-not-allowed zen-opacity-50",
    )}
  >
    <Checkbox checked={checked} disabled={item.disabled} onCheckedChange={onToggle} />
    <RowBody item={item} />
  </label>
);

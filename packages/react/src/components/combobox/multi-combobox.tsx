import * as React from "react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../popover/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "./command";
import type { ComboboxOption } from "./combobox";

/**
 * MultiCombobox — multi-select sibling of Combobox. Selected values
 * render as removable chips inside the trigger; clicking an option in
 * the popover toggles its membership instead of closing.
 *
 *   const [picked, setPicked] = useState<string[]>([]);
 *   <MultiCombobox
 *     options={[{ value: "a", label: "Alpha" }, …]}
 *     value={picked}
 *     onValueChange={setPicked}
 *     placeholder="Pick one or more"
 *   />
 *
 * Async mode mirrors Combobox: replace `options` with an `onSearch`
 * function. The component maintains a `valueToLabel` cache so chips
 * keep their human labels even when the current async result page
 * doesn't contain the corresponding option.
 *
 *   <MultiCombobox onSearch={async (q) => fetch(...).then(r => r.json())} />
 *
 * Differs from TagInput: this picks from a fixed (or async-fetched)
 * option set; TagInput accepts free-text values. Reach for TagInput
 * for skills / keywords / arbitrary tags; reach for MultiCombobox for
 * "pick from this list".
 */

export interface MultiComboboxProps {
  options?: ComboboxOption[];
  onSearch?: (query: string) => Promise<ComboboxOption[]>;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[], options: ComboboxOption[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  debounceMs?: number;
  /**
   * Offer to create the typed text when it matches no option's label.
   * Needs `onCreate` to do anything.
   */
  creatable?: boolean;
  /**
   * Called with the typed text when the create row is chosen. Adding the
   * option to your list is always yours — the component cannot know where the
   * list lives or what a new `value` should be.
   *
   * RETURN the new option and it is APPENDED to the selection, which is what
   * "create a tag" almost always means. Return nothing and the selection is
   * left alone. Mirrors Combobox, where returning selects instead of appends —
   * the difference is the selection model, not the contract.
   */
  onCreate?: (label: string) => ComboboxOption | void;
  /** Verb on the create row — `Create "foo"`. Default "Create". */
  createLabel?: string;
  /** Trigger button min width. Defaults to 240. */
  width?: number | string;
  /** Cap how many chips show in the trigger before collapsing into
   *  "+N more". Default 3. */
  maxDisplayed?: number;
  disabled?: boolean;
  className?: string;
  /** Show a "Clear all" button inside the popover when ≥ 1 selected.
   *  Default true. */
  showClearAll?: boolean;
}

const MultiCombobox: React.FC<MultiComboboxProps> = ({
  options,
  onSearch,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No results.",
  debounceMs = 250,
  creatable,
  onCreate,
  createLabel = "Create",
  width = 240,
  maxDisplayed = 3,
  disabled,
  className,
  showClearAll = true,
}) => {
  const isAsync = typeof onSearch === "function";

  const [internalValue, setInternalValue] = React.useState<string[]>(
    defaultValue ?? [],
  );
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internalValue;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  /* Async state — same pattern as Combobox: debounce + AbortController +
   * monotonic seq to drop stale responses. */
  const [asyncResults, setAsyncResults] = React.useState<ComboboxOption[]>([]);
  const [asyncLoading, setAsyncLoading] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const seqRef = React.useRef(0);

  React.useEffect(() => {
    if (!isAsync) return;
    if (!open) return;

    const seq = ++seqRef.current;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const t = setTimeout(async () => {
      setAsyncLoading(true);
      try {
        const results = await onSearch!(query);
        if (seq === seqRef.current && !ac.signal.aborted) {
          setAsyncResults(results);
        }
      } catch {
        if (seq === seqRef.current && !ac.signal.aborted) {
          setAsyncResults([]);
        }
      } finally {
        if (seq === seqRef.current && !ac.signal.aborted) {
          setAsyncLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [query, open, isAsync, onSearch, debounceMs]);

  const allOptions = isAsync ? asyncResults : options ?? [];

  /* Cache the label for every option we've seen so chips keep their
   * human label even after the async result page rotates away from
   * the selected values. */
  const labelCacheRef = React.useRef<Map<string, string>>(new Map());
  React.useEffect(() => {
    for (const o of allOptions) {
      labelCacheRef.current.set(o.value, o.label);
    }
  }, [allOptions]);
  const labelFor = (v: string) => labelCacheRef.current.get(v) ?? v;

  const update = (next: string[]) => {
    if (!isControlled) setInternalValue(next);
    /* Resolve options array for the callback — pull from cache or
     * current option list, dropping any we can't resolve (would only
     * happen on a stale controlled value that's never been seen). */
    const resolved: ComboboxOption[] = next.map(
      (v) =>
        allOptions.find((o) => o.value === v) ?? {
          value: v,
          label: labelFor(v),
        },
    );
    onValueChange?.(next, resolved);
  };

  const toggle = (v: string) => {
    if (selected.includes(v)) {
      update(selected.filter((x) => x !== v));
    } else {
      update([...selected, v]);
    }
  };

  const remove = (v: string) => update(selected.filter((x) => x !== v));

  // Compared against the LABEL, not the value: the user is typing what they
  // read, and "already exists" has to mean the same thing to them as to us.
  const typed = query.trim();
  const alreadyExists = allOptions.some(
    (o) => o.label.trim().toLowerCase() === typed.toLowerCase(),
  );
  const showCreate = Boolean(creatable && onCreate) && typed.length > 0 && !alreadyExists;

  /* Trigger label — show up to `maxDisplayed` chips, then "+N more". */
  const visible = selected.slice(0, maxDisplayed);
  const overflow = selected.length - visible.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          color="neutral"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "zen-justify-between zen-font-normal zen-text-left zen-min-h-10 zen-h-auto zen-py-1.5",
            selected.length === 0 && "zen-text-zen-muted-fg",
            className,
          )}
          style={{ minWidth: width }}
          iconRight={<ChevronIcon />}
        >
          <span className="zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-flex-1 zen-min-w-0">
            {selected.length === 0 ? (
              placeholder
            ) : (
              <>
                {visible.map((v) => (
                  <Chip
                    key={v}
                    label={labelFor(v)}
                    onRemove={(e) => {
                      e.stopPropagation();
                      remove(v);
                    }}
                  />
                ))}
                {overflow > 0 ? (
                  <span className="zen-text-xs zen-text-zen-muted-fg zen-ml-0.5">
                    +{overflow} more
                  </span>
                ) : null}
              </>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="zen-p-0"
        style={{ width: typeof width === "number" ? width : undefined }}
        align="start"
      >
        <Command shouldFilter={!isAsync}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={searchPlaceholder}
          />
          <CommandList>
            {isAsync && asyncLoading ? (
              <CommandLoading>Searching…</CommandLoading>
            ) : null}
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {allOptions.map((o) => {
                const isSelected = selected.includes(o.value);
                return (
                  <CommandItem
                    key={o.value}
                    value={o.value}
                    keywords={[o.label, ...(o.keywords ?? [])]}
                    disabled={o.disabled}
                    onSelect={(v) => {
                      if (o.disabled) return;
                      toggle(v);
                      /* Don't close — multi-select keeps the popover
                       * open so the user can pick several in a row. */
                    }}
                  >
                    <CheckIcon
                      style={{
                        opacity: isSelected ? 1 : 0,
                        marginRight: 6,
                      }}
                    />
                    <span className="zen-flex-1">{o.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {showCreate ? (
              <CommandGroup>
                <CommandItem
                  // The typed text is a keyword so cmdk's filter always keeps
                  // this row: a create row that filters itself out is useless
                  // exactly when it is needed.
                  value={`__create__${typed}`}
                  keywords={[typed]}
                  onSelect={() => {
                    const created = onCreate!(typed);
                    if (created) {
                      // Cache the label first: the caller's options update has
                      // not landed, so the chip would fall back to rendering
                      // the raw value.
                      labelCacheRef.current.set(created.value, created.label);
                      if (!selected.includes(created.value)) {
                        update([...selected, created.value]);
                      }
                    }
                    setQuery("");
                    /* Don't close — same as picking an existing option. The
                     * point of creating a tag is usually to create another. */
                  }}
                >
                  <PlusIcon style={{ marginRight: 6 }} />
                  <span className="zen-flex-1">
                    {createLabel} “{typed}”
                  </span>
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
          {showClearAll && selected.length > 0 ? (
            <div className="zen-border-t zen-border-zen-border zen-p-1">
              <button
                type="button"
                onClick={() => update([])}
                className={cn(
                  "zen-w-full zen-text-left zen-text-xs zen-px-2 zen-py-1 zen-rounded-zen-sm",
                  "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
                  "zen-bg-transparent zen-border-0 zen-cursor-pointer",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                )}
              >
                Clear all ({selected.length})
              </button>
            </div>
          ) : null}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const Chip: React.FC<{
  label: string;
  onRemove: (e: React.SyntheticEvent) => void;
}> = ({ label, onRemove }) => (
  <span
    className={cn(
      "zen-inline-flex zen-items-center zen-gap-1 zen-px-1.5 zen-py-0.5",
      "zen-text-xs zen-font-medium",
      "zen-rounded-zen-sm zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
      "zen-max-w-[10rem]",
    )}
  >
    <span className="zen-truncate">{label}</span>
    {/* role="button" span (not a <button>) so it can live inside the trigger
     * <Button> without nesting interactive <button> elements (invalid HTML). */}
    <span
      role="button"
      tabIndex={0}
      onClick={onRemove}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onRemove(e);
        }
      }}
      onPointerDown={(e) => e.stopPropagation()}
      /* stopPropagation on pointerdown so the click doesn't trigger
       * the parent Popover trigger (which would open the menu when
       * the user just wanted to remove a chip). */
      aria-label={`Remove ${label}`}
      className={cn(
        "zen-inline-flex zen-items-center zen-justify-center",
        "zen-h-3.5 zen-w-3.5 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
        "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
        "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
      )}
    >
      <svg
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </span>
  </span>
);

const ChevronIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PlusIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={style}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    style={style}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export { MultiCombobox };

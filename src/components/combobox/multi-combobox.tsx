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
            "justify-between font-normal text-left min-h-10 h-auto py-1.5",
            selected.length === 0 && "text-zen-muted-fg",
            className,
          )}
          style={{ minWidth: width }}
          iconRight={<ChevronIcon />}
        >
          <span className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
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
                  <span className="text-xs text-zen-muted-fg ml-0.5">
                    +{overflow} more
                  </span>
                ) : null}
              </>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
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
                    <span className="flex-1">{o.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {showClearAll && selected.length > 0 ? (
            <div className="border-t border-zen-border p-1">
              <button
                type="button"
                onClick={() => update([])}
                className={cn(
                  "w-full text-left text-xs px-2 py-1 rounded-zen-sm",
                  "text-zen-muted-fg hover:text-zen-foreground hover:bg-zen-muted",
                  "bg-transparent border-0 cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-ring",
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
  onRemove: (e: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ label, onRemove }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5",
      "text-xs font-medium",
      "rounded-zen-sm bg-zen-primary-soft text-zen-primary-soft-fg",
      "max-w-[10rem]",
    )}
  >
    <span className="truncate">{label}</span>
    <button
      type="button"
      onClick={onRemove}
      onPointerDown={(e) => e.stopPropagation()}
      /* stopPropagation on pointerdown so the click doesn't trigger
       * the parent Popover trigger (which would open the menu when
       * the user just wanted to remove a chip). */
      aria-label={`Remove ${label}`}
      className={cn(
        "inline-flex items-center justify-center",
        "h-3.5 w-3.5 rounded-zen-full bg-transparent border-0 cursor-pointer",
        "text-current opacity-70 hover:opacity-100 hover:bg-black/10",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zen-ring",
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
    </button>
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

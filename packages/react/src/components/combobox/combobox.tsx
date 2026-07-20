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

/**
 * Combobox — searchable single-select with optional async option loading.
 * Built on cmdk (filtering + keyboard) + Radix Popover (positioning +
 * dismissal). Replaces Select when free-text search is needed across a
 * large or remote option set.
 *
 * Synchronous (in-memory):
 *
 *   <Combobox
 *     options={[{ value: "a", label: "Alpha" }, …]}
 *     value={picked}
 *     onValueChange={setPicked}
 *     placeholder="Pick one"
 *   />
 *
 * Async (server-driven):
 *
 *   <Combobox
 *     value={picked}
 *     onValueChange={setPicked}
 *     onSearch={async (query) => {
 *       const res = await fetch(`/api/options?q=${query}`);
 *       return res.json();
 *     }}
 *     debounceMs={250}
 *   />
 *
 * The async signature replaces `options`; the component handles
 * debounce, abort-on-stale, and loading / no-results states.
 *
 * Creatable (the option does not exist yet):
 *
 *   <Combobox
 *     options={tags}
 *     creatable
 *     onCreate={(label) => {
 *       const opt = { value: slug(label), label };
 *       setTags((prev) => [...prev, opt]);
 *       return opt;               // returned -> selected for you
 *     }}
 *   />
 *
 * The component never touches `options`: it cannot know where the list lives
 * or what a new option's `value` should be, so creating is always the
 * caller's. Selecting does not have to be. RETURN the new option and it is
 * selected; return nothing and the value is left alone for the caller to set.
 */

export interface ComboboxOption {
  value: string;
  label: string;
  /** Optional extra text used by cmdk's fuzzy match. */
  keywords?: string[];
  disabled?: boolean;
}

export interface ComboboxProps {
  /** Static option list (synchronous mode). Ignored if `onSearch` is provided. */
  options?: ComboboxOption[];
  /** Async loader (server-driven). Called on every input change, debounced. */
  onSearch?: (query: string) => Promise<ComboboxOption[]>;
  /** Selected value. Pass "" / null to clear. */
  value?: string;
  /** Defaults to "". */
  defaultValue?: string;
  onValueChange?: (value: string, option: ComboboxOption | null) => void;
  /** Text shown when no value is selected. */
  placeholder?: string;
  /** Placeholder inside the search input. */
  searchPlaceholder?: string;
  /** Message when the result list is empty after filtering / search. */
  emptyMessage?: string;
  /** Async-mode: ms to wait after the last keystroke before calling onSearch. */
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
   * RETURN the new option and it is selected for you. Return nothing and the
   * value is left alone, so a caller who wants to select it later (after a
   * round trip to a server, say) stays in control. Both are supported on
   * purpose; returning is just the short path.
   */
  onCreate?: (label: string) => ComboboxOption | void;
  /** Verb on the create row — `Create "foo"`. Default "Create". */
  createLabel?: string;
  /** Trigger button's width. Defaults to 240. */
  width?: number | string;
  disabled?: boolean;
  className?: string;
}

const Combobox: React.FC<ComboboxProps> = ({
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
  disabled,
  className,
}) => {
  const isAsync = typeof onSearch === "function";

  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const selected = isControlled ? (value as string) : internalValue;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  // Async-mode state
  const [asyncResults, setAsyncResults] = React.useState<ComboboxOption[]>([]);
  const [asyncLoading, setAsyncLoading] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const seqRef = React.useRef(0);

  // Trigger fresh fetch when input changes (async mode)
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

  // Track the currently-selected option's label for the trigger
  // useMemo, not a bare expression: `options ?? []` allocates a NEW array on
  // every render when `options` is undefined, so every hook depending on
  // allOptions re-ran each time even when nothing had changed.
  const allOptions = React.useMemo(
    () => (isAsync ? asyncResults : options ?? []),
    [isAsync, asyncResults, options],
  );
  const selectedOption = React.useMemo(
    () => allOptions.find((o) => o.value === selected) ?? null,
    [allOptions, selected],
  );
  // Keep last-known label for selected values that aren't in the current
  // async result page (so the trigger doesn't read "Select…" when the
  // dropdown re-renders with a fresh search).
  const lastLabelRef = React.useRef<string>("");
  if (selectedOption) lastLabelRef.current = selectedOption.label;

  const triggerLabel =
    selected && lastLabelRef.current
      ? lastLabelRef.current
      : placeholder;

  const update = (next: string, opt: ComboboxOption | null) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next, opt);
  };

  // Compared against the LABEL, not the value: the user is typing what they
  // read, and "already exists" has to mean the same thing to them as to us.
  const typed = query.trim();
  const alreadyExists = allOptions.some(
    (o) => o.label.trim().toLowerCase() === typed.toLowerCase(),
  );
  const showCreate = Boolean(creatable && onCreate) && typed.length > 0 && !alreadyExists;

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
            "zen-justify-between zen-font-normal",
            !selected && "zen-text-zen-muted-fg",
            className,
          )}
          style={{ width }}
          iconRight={<ChevronIcon />}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {triggerLabel}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="zen-p-0"
        style={{ width: typeof width === "number" ? width : undefined }}
        align="start"
      >
        <Command
          // In async mode we already filter server-side, so disable cmdk's
          // built-in filter (otherwise it re-filters the already-filtered list).
          shouldFilter={!isAsync}
        >
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={searchPlaceholder}
          />
          <CommandList>
            {isAsync && asyncLoading ? (
              <CommandLoading>Searching…</CommandLoading>
            ) : null}
            {/* CommandEmpty only shows when nothing matches. With a create row
                present that is exactly when it is NOT empty — you get
                "Create foo" instead of "No results", which is the point. */}
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {allOptions.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.value}
                  keywords={[o.label, ...(o.keywords ?? [])]}
                  disabled={o.disabled}
                  onSelect={(v) => {
                    if (o.disabled) return;
                    const next = v === selected ? "" : v;
                    const nextOpt =
                      next === ""
                        ? null
                        : allOptions.find((x) => x.value === next) ?? null;
                    update(next, nextOpt);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    style={{
                      opacity: selected === o.value ? 1 : 0,
                      marginRight: 6,
                    }}
                  />
                  <span style={{ flex: 1 }}>{o.label}</span>
                </CommandItem>
              ))}
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
                      // Cache the label before selecting: the caller's options
                      // update has not landed yet, so the trigger would look
                      // this value up, miss, and fall back to the placeholder.
                      lastLabelRef.current = created.label;
                      update(created.value, created);
                    }
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <PlusIcon style={{ marginRight: 6 }} />
                  <span style={{ flex: 1 }}>
                    {createLabel} “{typed}”
                  </span>
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={style}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export { Combobox };

import {
  Show,
  type Accessor,
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  on,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import { cn } from "../../lib/cn";

/**
 * Command primitives — command-palette / autocomplete engine: filtering,
 * keyboard nav (arrow keys, home/end, enter), grouping, accessibility.
 *
 *   <Command>
 *     <CommandInput placeholder="Search…" />
 *     <CommandList>
 *       <CommandEmpty>No results.</CommandEmpty>
 *       <CommandGroup heading="Recent">
 *         <CommandItem onSelect={…}>Foo</CommandItem>
 *       </CommandGroup>
 *     </CommandList>
 *   </Command>
 *
 * The React binding wraps `cmdk`, which is React-only — there is no Solid
 * build and no equivalent library. This is a from-scratch Solid engine that
 * mirrors cmdk's public API *and* its DOM contract: the same `cmdk-*`
 * attributes and the same `data-selected` / `data-disabled` state attributes,
 * so the styling selectors are identical across both bindings.
 *
 * Known deltas from cmdk, all documented on the props they affect:
 *  - no score-based reordering (matches keep source order; cmdk sorts best-first)
 *  - no `--cmdk-list-height` custom property
 *  - no `asChild`
 * See the port notes at the bottom of this file.
 */

/**
 * Returns a number between 0 and 1: 1 is a perfect match, 0 hides the item.
 * Same contract as cmdk's `CommandFilter`.
 */
export type CommandFilter = (value: string, search: string, keywords?: string[]) => number;

const norm = (s: string) => s.toLowerCase().trim();

/**
 * Default scorer. cmdk delegates to the `command-score` library; this is a
 * cheaper equivalent covering the same cases in the same order of preference:
 * exact > prefix > word-boundary substring > substring > subsequence.
 * Relative ranking between two partial matches can differ from cmdk's.
 */
export const defaultFilter: CommandFilter = (value, search, keywords) => {
  const q = norm(search);
  if (!q) return 1;
  const hay = norm(keywords?.length ? `${value} ${keywords.join(" ")}` : value);
  if (!hay) return 0;

  if (hay === q) return 1;
  if (hay.startsWith(q)) return 0.9;

  const idx = hay.indexOf(q);
  if (idx > -1) return hay[idx - 1] === " " ? 0.8 : 0.7;

  // Subsequence: every character of the query appears in order.
  let i = 0;
  for (const ch of hay) {
    if (ch === q[i]) i += 1;
    if (i === q.length) break;
  }
  return i === q.length ? 0.4 : 0;
};

type ItemState = {
  value: string;
  score: number;
  /** rendered at all — score > 0, or forceMount */
  visible: boolean;
  groupId?: string;
};

type CommandContextValue = {
  search: Accessor<string>;
  setSearch: (s: string) => void;
  value: Accessor<string>;
  setValue: (v: string) => void;
  shouldFilter: Accessor<boolean>;
  filter: Accessor<CommandFilter>;
  disablePointerSelection: Accessor<boolean>;
  items: Record<string, ItemState>;
  setItem: (id: string, state: ItemState) => void;
  removeItem: (id: string) => void;
  filteredCount: Accessor<number>;
  selectedItemId: Accessor<string | undefined>;
  listId: string;
  labelId: string;
  inputId: string;
};

const CommandContext = createContext<CommandContextValue>();

const useCommand = () => {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error("Command components must be rendered inside <Command>");
  return ctx;
};

const GroupContext = createContext<{ groupId: string }>();

/* ---------------------------------------------------------------- Command */

export interface CommandProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> {
  /** Accessible label for this command menu. Not shown visibly. */
  label?: string;
  /**
   * Optionally set to `false` to turn off the automatic filtering.
   * If `false`, you must conditionally render valid items based on the search
   * query yourself. (cmdk also turns off sorting here; this port never sorts.)
   */
  shouldFilter?: boolean;
  /**
   * Custom filter function for whether each command menu item matches the
   * given search query. Should return a number between 0 and 1, with 1 being
   * the best match and 0 being hidden entirely.
   */
  filter?: CommandFilter;
  /** Optional default item value when it is initially rendered. */
  defaultValue?: string;
  /** Optional controlled state of the selected command menu item. */
  value?: string;
  /** Event handler called when the selected item of the menu changes. */
  onValueChange?: (value: string) => void;
  /** Optionally set to `true` to turn on looping around when using the arrow keys. */
  loop?: boolean;
  /** Optionally set to `true` to disable selection via pointer events. */
  disablePointerSelection?: boolean;
  /** Set to `false` to disable ctrl+n/j/p/k shortcuts. Defaults to `true`. */
  vimBindings?: boolean;
  class?: string;
  children?: JSX.Element;
}

export const Command = (props: CommandProps) => {
  const [local, rest] = splitProps(props, [
    "label",
    "shouldFilter",
    "filter",
    "defaultValue",
    "value",
    "onValueChange",
    "loop",
    "disablePointerSelection",
    "vimBindings",
    "class",
    "children",
  ]);

  let rootEl!: HTMLDivElement;

  const [search, setSearch] = createSignal("");
  const [uncontrolledValue, setUncontrolledValue] = createSignal(local.defaultValue ?? "");
  const [store, setStore] = createStore<{ items: Record<string, ItemState> }>({ items: {} });

  const value = () => (local.value !== undefined ? local.value : uncontrolledValue());
  const setValue = (v: string) => {
    if (v === value()) return;
    setUncontrolledValue(v);
    local.onValueChange?.(v);
  };

  const shouldFilter = () => local.shouldFilter ?? true;
  const filter = () => local.filter ?? defaultFilter;
  const disablePointerSelection = () => local.disablePointerSelection ?? false;
  const vimBindings = () => local.vimBindings ?? true;

  const filteredCount = createMemo(
    () => Object.values(store.items).filter((i) => i.score > 0).length,
  );

  const selectedItemId = createMemo(() => {
    const v = value();
    const hit = Object.entries(store.items).find(([, i]) => i.value === v && i.visible);
    return hit?.[0];
  });

  const listId = createUniqueId();
  const labelId = createUniqueId();
  const inputId = createUniqueId();

  /** Items currently navigable, in DOM order. */
  const getValidItems = () =>
    Array.from(
      rootEl?.querySelectorAll<HTMLElement>(
        '[cmdk-item]:not([aria-disabled="true"]):not([hidden])',
      ) ?? [],
    );

  const selectByIndex = (index: number) => {
    const items = getValidItems();
    const next = items[index];
    if (next) setValue(next.getAttribute("data-value") ?? "");
  };

  const selectByOffset = (offset: number) => {
    const items = getValidItems();
    if (items.length === 0) return;
    const current = items.findIndex((el) => el.getAttribute("data-value") === value());
    let next = current + offset;
    if (local.loop) {
      next = ((next % items.length) + items.length) % items.length;
    } else {
      next = Math.max(0, Math.min(next, items.length - 1));
    }
    const el = items[next];
    if (el) setValue(el.getAttribute("data-value") ?? "");
  };

  /** cmdk resets the highlight to the first match whenever the query changes. */
  const selectFirstItem = () => selectByIndex(0);

  onMount(() => {
    queueMicrotask(() => {
      if (!value()) selectFirstItem();
    });
  });

  createEffect(
    on(
      search,
      () => {
        // Item visibility settles in the items' own effects; wait a tick.
        queueMicrotask(selectFirstItem);
      },
      { defer: true },
    ),
  );

  // Keep the highlighted item in view.
  createEffect(
    on(value, (v) => {
      if (!v) return;
      queueMicrotask(() => {
        const el = rootEl?.querySelector<HTMLElement>(
          `[cmdk-item][data-value="${CSS.escape(v)}"]`,
        );
        el?.scrollIntoView({ block: "nearest" });
      });
    }),
  );

  const onKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (e) => {
    if (e.isComposing || e.defaultPrevented) return;

    const vim = vimBindings() && e.ctrlKey;

    switch (e.key) {
      case "n":
      case "j":
        if (vim) {
          e.preventDefault();
          selectByOffset(1);
        }
        return;
      case "p":
      case "k":
        if (vim) {
          e.preventDefault();
          selectByOffset(-1);
        }
        return;
      case "ArrowDown":
        e.preventDefault();
        if (e.metaKey) selectByIndex(getValidItems().length - 1);
        else selectByOffset(1);
        return;
      case "ArrowUp":
        e.preventDefault();
        if (e.metaKey) selectByIndex(0);
        else selectByOffset(-1);
        return;
      case "Home":
        e.preventDefault();
        selectByIndex(0);
        return;
      case "End":
        e.preventDefault();
        selectByIndex(getValidItems().length - 1);
        return;
      case "Enter": {
        e.preventDefault();
        const el = getValidItems().find((i) => i.getAttribute("data-value") === value());
        el?.click();
        return;
      }
    }
  };

  const ctx: CommandContextValue = {
    search,
    setSearch,
    value,
    setValue,
    shouldFilter,
    filter,
    disablePointerSelection,
    get items() {
      return store.items;
    },
    setItem: (id, state) => setStore("items", id, state),
    removeItem: (id) =>
      setStore(
        "items",
        produce((items) => {
          delete items[id];
        }),
      ),
    filteredCount,
    selectedItemId,
    listId,
    labelId,
    inputId,
  };

  return (
    <CommandContext.Provider value={ctx}>
      <div
        ref={rootEl}
        cmdk-root=""
        onKeyDown={onKeyDown}
        class={cn(
          "zen-flex zen-h-full zen-w-full zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-bg-zen-background zen-text-zen-foreground",
          local.class,
        )}
        {...rest}
      >
        <Show when={local.label}>
          <label cmdk-label="" for={inputId} id={labelId} class="zen-sr-only">
            {local.label}
          </label>
        </Show>
        {local.children}
      </div>
    </CommandContext.Provider>
  );
};

/* ----------------------------------------------------------- CommandInput */

export interface CommandInputProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "class"> {
  /** Optional controlled state for the value of the search input. */
  value?: string;
  /** Event handler called when the search value changes. */
  onValueChange?: (search: string) => void;
  class?: string;
}

export const CommandInput = (props: CommandInputProps) => {
  const [local, rest] = splitProps(props, ["value", "onValueChange", "class"]);
  const ctx = useCommand();

  // A controlled `value` drives the engine's search state.
  createEffect(() => {
    if (local.value !== undefined) ctx.setSearch(local.value);
  });

  return (
    <div
      class="zen-flex zen-items-center zen-border-b zen-border-zen-border zen-px-3"
      cmdk-input-wrapper=""
    >
      <SearchIcon />
      <input
        cmdk-input=""
        id={ctx.inputId}
        type="text"
        role="combobox"
        autocomplete="off"
        autocorrect="off"
        spellcheck={false}
        aria-autocomplete="list"
        aria-expanded={true}
        aria-controls={ctx.listId}
        aria-labelledby={ctx.labelId}
        aria-activedescendant={ctx.selectedItemId()}
        value={local.value !== undefined ? local.value : ctx.search()}
        onInput={(e) => {
          const next = e.currentTarget.value;
          if (local.value === undefined) ctx.setSearch(next);
          local.onValueChange?.(next);
        }}
        class={cn(
          "zen-flex zen-h-10 zen-w-full zen-bg-transparent zen-py-3 zen-text-sm zen-outline-none",
          "placeholder:zen-text-zen-muted-fg",
          "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
          local.class,
        )}
        {...rest}
      />
    </div>
  );
};

/* ------------------------------------------------------------ CommandList */

export interface CommandListProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> {
  /** Accessible label for this list of suggestions. Not shown visibly. */
  label?: string;
  class?: string;
  children?: JSX.Element;
}

export const CommandList = (props: CommandListProps) => {
  const [local, rest] = splitProps(props, ["label", "class", "children"]);
  const ctx = useCommand();
  return (
    <div
      cmdk-list=""
      id={ctx.listId}
      role="listbox"
      aria-label={local.label ?? "Suggestions"}
      class={cn("zen-max-h-72 zen-overflow-y-auto zen-overflow-x-hidden", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
};

/* ----------------------------------------------------------- CommandEmpty */

export type CommandEmptyProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  class?: string;
  children?: JSX.Element;
};

export const CommandEmpty = (props: CommandEmptyProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  const ctx = useCommand();
  return (
    <Show when={ctx.filteredCount() === 0}>
      <div
        cmdk-empty=""
        role="presentation"
        class={cn(
          "zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg",
          local.class,
        )}
        {...rest}
      >
        {local.children}
      </div>
    </Show>
  );
};

/* --------------------------------------------------------- CommandLoading */

export interface CommandLoadingProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> {
  /** Estimated progress of loading asynchronous options. */
  progress?: number;
  /** Accessible label for this loading progressbar. Not shown visibly. */
  label?: string;
  class?: string;
  children?: JSX.Element;
}

export const CommandLoading = (props: CommandLoadingProps) => {
  const [local, rest] = splitProps(props, ["progress", "label", "class", "children"]);
  return (
    <div
      cmdk-loading=""
      role="progressbar"
      aria-valuenow={local.progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={local.label ?? "Loading…"}
      class={cn("zen-py-4 zen-text-center zen-text-sm zen-text-zen-muted-fg", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
};

/* ----------------------------------------------------------- CommandGroup */

export interface CommandGroupProps
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "heading" | "class"> {
  /** Optional heading to render for this group. */
  heading?: JSX.Element;
  /** If no heading is provided, you must provide a value that is unique for this group. */
  value?: string;
  /** Whether this group is forcibly rendered regardless of filtering. */
  forceMount?: boolean;
  class?: string;
  children?: JSX.Element;
}

export const CommandGroup = (props: CommandGroupProps) => {
  const [local, rest] = splitProps(props, ["heading", "value", "forceMount", "class", "children"]);
  const ctx = useCommand();
  const groupId = createUniqueId();
  const headingId = createUniqueId();

  // Children stay mounted and are hidden with a class rather than unmounted:
  // the group's visibility is derived from its items' registrations, so
  // unmounting them would deregister the very state that decides visibility
  // and the group would oscillate.
  const visible = createMemo(() => {
    if (local.forceMount) return true;
    if (!ctx.shouldFilter()) return true;
    return Object.values(ctx.items).some((i) => i.groupId === groupId && i.visible);
  });

  return (
    <GroupContext.Provider value={{ groupId }}>
      <div
        cmdk-group=""
        role="presentation"
        data-value={local.value}
        hidden={!visible() || undefined}
        class={cn(
          "zen-overflow-hidden zen-p-1 zen-text-zen-foreground",
          "[&_[cmdk-group-heading]]:zen-px-2 [&_[cmdk-group-heading]]:zen-py-1.5 [&_[cmdk-group-heading]]:zen-text-xs [&_[cmdk-group-heading]]:zen-font-semibold [&_[cmdk-group-heading]]:zen-text-zen-muted-fg",
          local.class,
          !visible() && "zen-hidden",
        )}
        {...rest}
      >
        <Show when={local.heading}>
          <div cmdk-group-heading="" id={headingId} aria-hidden="true">
            {local.heading}
          </div>
        </Show>
        <div cmdk-group-items="" role="group" aria-labelledby={local.heading ? headingId : undefined}>
          {local.children}
        </div>
      </div>
    </GroupContext.Provider>
  );
};

/* ------------------------------------------------------- CommandSeparator */

export interface CommandSeparatorProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> {
  /** Whether this separator should always be rendered. Useful if you disable automatic filtering. */
  alwaysRender?: boolean;
  class?: string;
}

export const CommandSeparator = (props: CommandSeparatorProps) => {
  const [local, rest] = splitProps(props, ["alwaysRender", "class"]);
  const ctx = useCommand();
  return (
    <Show when={local.alwaysRender || !ctx.search()}>
      <div
        cmdk-separator=""
        role="separator"
        class={cn("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", local.class)}
        {...rest}
      />
    </Show>
  );
};

/* ------------------------------------------------------------ CommandItem */

export interface CommandItemProps
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onSelect" | "class"> {
  /** Whether this item is currently disabled. */
  disabled?: boolean;
  /** Event handler for when this item is selected, either via click or keyboard selection. */
  onSelect?: (value: string) => void;
  /**
   * A unique value for this item. If no value is provided, it is inferred from
   * the rendered `textContent`.
   */
  value?: string;
  /** Optional keywords to match against when filtering. */
  keywords?: string[];
  /** Whether this item is forcibly rendered regardless of filtering. */
  forceMount?: boolean;
  class?: string;
  children?: JSX.Element;
}

export const CommandItem = (props: CommandItemProps) => {
  const [local, rest] = splitProps(props, [
    "disabled",
    "onSelect",
    "value",
    "keywords",
    "forceMount",
    "class",
    "children",
  ]);
  const ctx = useCommand();
  const group = useContext(GroupContext);
  const id = createUniqueId();

  let el!: HTMLDivElement;
  const [textValue, setTextValue] = createSignal("");

  // cmdk infers a missing `value` from the rendered text.
  onMount(() => setTextValue(el.textContent?.trim() ?? ""));
  const itemValue = () => local.value ?? textValue();

  const score = createMemo(() => {
    if (!ctx.shouldFilter()) return 1;
    const q = ctx.search();
    if (!q) return 1;
    const v = itemValue();
    if (!v) return 0;
    return ctx.filter()(v, q, local.keywords);
  });

  const visible = createMemo(() => local.forceMount === true || score() > 0);

  createEffect(() => {
    ctx.setItem(id, {
      value: itemValue(),
      score: score(),
      visible: visible(),
      groupId: group?.groupId,
    });
  });
  onCleanup(() => ctx.removeItem(id));

  const selected = () => ctx.value() === itemValue() && itemValue() !== "";

  const select = () => {
    if (local.disabled) return;
    ctx.setValue(itemValue());
    local.onSelect?.(itemValue());
  };

  return (
    <div
      ref={el}
      cmdk-item=""
      id={id}
      role="option"
      data-value={itemValue()}
      data-selected={selected() ? "true" : "false"}
      data-disabled={local.disabled ? "true" : "false"}
      aria-selected={selected()}
      aria-disabled={local.disabled ? "true" : undefined}
      hidden={!visible() || undefined}
      onClick={select}
      onPointerMove={() => {
        if (local.disabled || ctx.disablePointerSelection()) return;
        ctx.setValue(itemValue());
      }}
      class={cn(
        "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
        "data-[selected=true]:zen-bg-zen-muted",
        "data-[disabled=true]:zen-pointer-events-none data-[disabled=true]:zen-opacity-50",
        local.class,
        !visible() && "zen-hidden",
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
};

/* ------------------------------------------------------------------ icons */

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="zen-mr-2 zen-shrink-0 zen-opacity-50"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/*
 * Port notes — where this diverges from the React (cmdk) binding:
 *
 * 1. No score-based reordering. cmdk sorts matching items best-first (and
 *    sorts groups by their best item). This port filters but preserves source
 *    order. Reordering would mean either mutating the DOM or driving CSS
 *    `order`, and CSS `order` would desync keyboard nav (which walks the DOM)
 *    from visual order.
 * 2. `defaultFilter` is not `command-score`. Same 0..1 contract and the same
 *    match categories, but two partial matches may rank differently.
 * 3. Non-matching items/groups are hidden (`hidden` + `zen-hidden`), not
 *    unmounted as in cmdk. Their registration is what decides group and empty
 *    state, so unmounting them would oscillate. Hidden items are excluded from
 *    keyboard nav and from `CommandEmpty`'s count, so behaviour matches; only
 *    the DOM node count differs.
 * 4. No `asChild`. Solid has no cloneElement; Kobalte's `as` is the local
 *    idiom and these are plain elements, so callers style via `class`.
 * 5. No `--cmdk-list-height` custom property on CommandList (cmdk exposes it
 *    for height animations via a ResizeObserver on an inner sizer div).
 * 6. No `CommandDialog` and no `useCommandState`. Neither is exported by the
 *    React binding's command.tsx, so this is not a parity gap; compose
 *    `<Dialog>` with `<Command>` for the dialog case.
 */

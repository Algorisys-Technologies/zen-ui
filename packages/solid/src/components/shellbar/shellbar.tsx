import {
  type JSX,
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  on,
  onCleanup,
  onMount,
  splitProps,
  untrack,
} from "solid-js";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Icon, type IconName } from "../icon/icon";
import { Input } from "../form/input/input";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../dropdown-menu/dropdown-menu";

/**
 * ShellBar — Solid binding. Mirrors packages/react/src/components/shellbar/:
 * same props, same class strings, same measurement strategy. See that file for
 * why `items` is data rather than children, and why the search collapse is keyed
 * off container width alone rather than off what fits.
 */

/** Below this container width the search field collapses to an icon. */
const SEARCH_COLLAPSE_WIDTH = 640;

export interface ShellBarMenuItem {
  id: string;
  label: JSX.Element;
  icon?: IconName;
  onSelect?: () => void;
  disabled?: boolean;
  /** Renders a divider before this entry. */
  separatorBefore?: boolean;
}

export interface ShellBarItem {
  id: string;
  /** Icon-only on the bar, so this is the accessible name AND the menu label. */
  label: string;
  icon: IconName;
  onSelect?: () => void;
  disabled?: boolean;
  /** `never` pins the item to the bar; anything else collapses when needed. */
  overflow?: "never" | "auto";
}

export interface ShellBarProfile {
  /** Accessible name of the trigger, and the menu's heading. */
  name: string;
  image?: string;
  /** Falls back to initials derived from `name`. */
  initials?: string;
  menuItems?: ShellBarMenuItem[];
  onClick?: () => void;
}

export type ShellBarProps = Omit<JSX.HTMLAttributes<HTMLElement>, "onSearch" | "title"> & {
  logo?: JSX.Element;
  primaryTitle?: string;
  secondaryTitle?: string;
  /** Turns the title into a product-switcher dropdown. */
  menuItems?: ShellBarMenuItem[];
  searchable?: boolean;
  onSearch?: (value: string) => void;
  /** Placeholder AND the search field's visually-hidden label. */
  searchPlaceholder?: string;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  profile?: ShellBarProfile;
  /** Custom action icons; these overflow into a menu when space runs out. */
  items?: ShellBarItem[];
  onLogoClick?: () => void;
  overflowLabel?: string;
};

/** "Rajesh Pillai" -> "RP". Two words at most; that is what fits in an avatar. */
const initialsFrom = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export const ShellBar = (props: ShellBarProps) => {
  const [local, rest] = splitProps(props, [
    "logo",
    "primaryTitle",
    "secondaryTitle",
    "menuItems",
    "searchable",
    "onSearch",
    "searchPlaceholder",
    "notificationCount",
    "onNotificationsClick",
    "profile",
    "items",
    "onLogoClick",
    "overflowLabel",
    "class",
    "children",
    "aria-label",
  ]);

  let containerRef: HTMLDivElement | undefined;
  let brandingRef: HTMLDivElement | undefined;
  let fixedRef: HTMLDivElement | undefined;
  let measureRef: HTMLDivElement | undefined;
  let overflowRef: HTMLDivElement | undefined;
  let searchTriggerRef: HTMLButtonElement | undefined;

  const searchId = createUniqueId();
  const [searchValue, setSearchValue] = createSignal("");
  const [searchCollapsed, setSearchCollapsed] = createSignal(false);
  const [searchOpen, setSearchOpen] = createSignal(false);

  const allItems = createMemo(() => local.items ?? []);
  const searchLabel = () => local.searchPlaceholder ?? "Search";

  // Starts at "all" so the first paint is the common case (everything fits)
  // rather than an empty bar. `untrack` because this is a seed read, seen once
  // at setup — the effect below is what keeps it current.
  const [visibleCount, setVisibleCount] = createSignal(untrack(() => allItems().length));

  const pinned = createMemo(() => allItems().filter((i) => i.overflow === "never"));
  const collapsible = createMemo(() => allItems().filter((i) => i.overflow !== "never"));

  const recompute = () => {
    if (!containerRef || !measureRef) return;
    const width = containerRef.offsetWidth;

    // Purely a function of the container width, so re-running this cannot depend
    // on what fits. The effect below re-runs on searchCollapsed to pick up the
    // trailing cluster's new width, then settles on the same value.
    setSearchCollapsed(width < SEARCH_COLLAPSE_WIDTH);

    const widths = Array.from(measureRef.children).map((el) => (el as HTMLElement).offsetWidth);
    const GAP = 8; // zen-gap-2
    const all = allItems();
    const brandingWidth = brandingRef?.offsetWidth ?? 0;
    const fixedWidth = fixedRef?.offsetWidth ?? 0;
    const overflowWidth = (overflowRef?.offsetWidth ?? 32) + GAP;
    const pinnedWidth = pinned().reduce((sum, i) => sum + (widths[all.indexOf(i)] ?? 0) + GAP, 0);

    let budget = width - brandingWidth - fixedWidth - pinnedWidth - GAP;
    let fit = 0;
    const list = collapsible();
    for (const item of list) {
      const w = (widths[all.indexOf(item)] ?? 0) + GAP;
      // Once anything is going to overflow, the trigger needs room too.
      const needsTrigger = fit < list.length - 1;
      if (budget - w < (needsTrigger ? overflowWidth : 0)) break;
      budget -= w;
      fit++;
    }
    setVisibleCount(fit);
  };

  onMount(() => {
    if (!containerRef || typeof ResizeObserver === "undefined") return;
    recompute();
    const ro = new ResizeObserver(() => recompute());
    ro.observe(containerRef);
    onCleanup(() => ro.disconnect());
  });

  // Recompute when the ITEMS change, not only when the container resizes —
  // onMount alone would leave a stale visibleCount. The searchCollapsed
  // dependency mirrors React's effect deps: the trailing cluster changes width
  // when the search field turns into an icon, which changes the item budget.
  createEffect(on([() => local.items, searchCollapsed], () => recompute()));

  // A collapsed-open search that is then widened would leave the overlay up over
  // an already-visible field.
  createEffect(
    on(searchCollapsed, (collapsed) => {
      if (!collapsed) setSearchOpen(false);
    }),
  );

  const shown = createMemo(() => collapsible().slice(0, visibleCount()));
  const hidden = createMemo(() => collapsible().slice(visibleCount()));

  const submitSearch = (e: Event) => {
    e.preventDefault();
    local.onSearch?.(searchValue());
  };

  // An overlay you can only dismiss with the mouse is a trap for keyboard users,
  // so Escape closes it and focus returns to the magnifier that opened it —
  // otherwise focus would land back on <body>.
  const closeSearch = () => {
    setSearchOpen(false);
    queueMicrotask(() => searchTriggerRef?.focus());
  };

  const renderItem = (item: ShellBarItem) => (
    <Button
      type="button"
      variant="ghost"
      color="neutral"
      size="sm"
      shape="square"
      aria-label={item.label}
      disabled={item.disabled}
      onClick={() => item.onSelect?.()}
    >
      <Icon name={item.icon} size={16} />
    </Button>
  );

  const renderMenuItems = (entries: ShellBarMenuItem[]) => (
    <For each={entries}>
      {(m) => (
        <>
          <Show when={m.separatorBefore}>
            <DropdownMenuSeparator />
          </Show>
          <DropdownMenuItem disabled={m.disabled} onSelect={() => m.onSelect?.()}>
            <Show when={m.icon}>{(icon) => <Icon name={icon()} size={14} class="zen-mr-2" />}</Show>
            {m.label}
          </DropdownMenuItem>
        </>
      )}
    </For>
  );

  const titles = () => (
    <span class="zen-flex zen-min-w-0 zen-flex-col zen-items-start zen-leading-tight">
      <Show when={local.primaryTitle}>
        <span class="zen-truncate zen-text-sm zen-font-semibold zen-text-zen-foreground">
          {local.primaryTitle}
        </span>
      </Show>
      <Show when={local.secondaryTitle}>
        <span class="zen-truncate zen-text-xs zen-text-zen-muted-fg">{local.secondaryTitle}</span>
      </Show>
    </span>
  );

  const avatar = () => (
    <Avatar size="sm">
      <Show when={local.profile?.image}>
        {(image) => <AvatarImage src={image()} alt="" />}
      </Show>
      <AvatarFallback>
        {local.profile?.initials ?? initialsFrom(local.profile?.name ?? "")}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <header
      aria-label={local["aria-label"] ?? local.primaryTitle ?? "Application header"}
      class={cn(
        "zen-w-full zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-3",
        local.class,
      )}
      {...rest}
    >
      <div
        ref={containerRef}
        class="zen-relative zen-flex zen-h-14 zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden"
      >
        {/* ------------------------------------------------------ branding */}
        <div ref={brandingRef} class="zen-flex zen-min-w-0 zen-shrink-0 zen-items-center zen-gap-2">
          <Show when={local.logo}>
            <Show
              when={local.onLogoClick}
              fallback={<span class="zen-flex zen-shrink-0 zen-items-center">{local.logo}</span>}
            >
              <Button
                type="button"
                variant="ghost"
                color="neutral"
                size="sm"
                shape="square"
                aria-label="Home"
                onClick={() => local.onLogoClick?.()}
              >
                {local.logo}
              </Button>
            </Show>
          </Show>

          <Show when={local.menuItems && local.menuItems.length > 0} fallback={titles()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                as={Button}
                type="button"
                variant="ghost"
                color="neutral"
                size="sm"
                class="zen-min-w-0 zen-px-2"
                iconRight={<Icon name="chevron-down" size={14} />}
              >
                {titles()}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {renderMenuItems(local.menuItems ?? [])}
              </DropdownMenuContent>
            </DropdownMenu>
          </Show>

          {local.children}
        </div>

        {/* --------------------------------------- items + fixed trailing */}
        <div class="zen-ml-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2">
          <div class="zen-flex zen-items-center zen-gap-2">
            <For each={pinned()}>{(i) => renderItem(i)}</For>
            <For each={shown()}>{(i) => renderItem(i)}</For>

            <Show when={hidden().length > 0}>
              <div ref={overflowRef}>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    as={Button}
                    type="button"
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    shape="square"
                    aria-label={local.overflowLabel ?? "More actions"}
                  >
                    <Icon name="more" size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <For each={hidden()}>
                      {(i) => (
                        <DropdownMenuItem disabled={i.disabled} onSelect={() => i.onSelect?.()}>
                          <Icon name={i.icon} size={14} class="zen-mr-2" />
                          {i.label}
                        </DropdownMenuItem>
                      )}
                    </For>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Show>
          </div>

          <div ref={fixedRef} class="zen-flex zen-shrink-0 zen-items-center zen-gap-2">
            <Show when={local.searchable}>
              <Show
                when={searchCollapsed()}
                fallback={
                  <form
                    role="search"
                    class="zen-relative zen-flex zen-items-center"
                    onSubmit={submitSearch}
                  >
                    <label for={searchId} class="zen-sr-only">
                      {searchLabel()}
                    </label>
                    <Icon
                      name="search"
                      size={14}
                      class="zen-pointer-events-none zen-absolute zen-start-2 zen-text-zen-muted-fg"
                    />
                    <Input
                      id={searchId}
                      type="search"
                      value={searchValue()}
                      placeholder={searchLabel()}
                      onInput={(e) => setSearchValue(e.currentTarget.value)}
                      class="zen-h-8 zen-w-48 zen-pl-7"
                    />
                  </form>
                }
              >
                <Button
                  ref={searchTriggerRef}
                  type="button"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  shape="square"
                  aria-label={searchLabel()}
                  aria-expanded={searchOpen()}
                  onClick={() => setSearchOpen((o) => !o)}
                >
                  <Icon name="search" size={16} />
                </Button>
              </Show>
            </Show>

            <Show when={local.notificationCount !== undefined || local.onNotificationsClick}>
              <span class="zen-relative zen-flex zen-shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  shape="square"
                  aria-label={
                    local.notificationCount
                      ? `Notifications, ${local.notificationCount} unread`
                      : "Notifications"
                  }
                  onClick={() => local.onNotificationsClick?.()}
                >
                  <Icon name="bell" size={16} />
                </Button>
                <Show when={local.notificationCount}>
                  {(count) => (
                    <span
                      // Explicitly "true": bare `aria-hidden` renders as
                      // aria-hidden="" in Solid, which is not `true` per ARIA —
                      // the count would be announced twice, once here and once
                      // in the button's own label.
                      aria-hidden="true"
                      class="zen-pointer-events-none zen-absolute -zen-end-1 -zen-top-1 zen-flex zen-h-4 zen-min-w-4 zen-items-center zen-justify-center zen-rounded-zen-full zen-bg-zen-error zen-px-1 zen-text-xs zen-font-semibold zen-leading-none zen-text-zen-error-fg"
                    >
                      {count() > 99 ? "99+" : count()}
                    </span>
                  )}
                </Show>
              </span>
            </Show>

            <Show when={local.profile}>
              {(p) => (
                <Show
                  when={p().menuItems && p().menuItems!.length > 0}
                  fallback={
                    <Button
                      type="button"
                      variant="ghost"
                      color="neutral"
                      size="sm"
                      shape="circle"
                      aria-label={p().name}
                      onClick={() => p().onClick?.()}
                    >
                      {avatar()}
                    </Button>
                  }
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      as={Button}
                      type="button"
                      variant="ghost"
                      color="neutral"
                      size="sm"
                      shape="circle"
                      aria-label={p().name}
                    >
                      {avatar()}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{p().name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {renderMenuItems(p().menuItems ?? [])}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Show>
              )}
            </Show>
          </div>
        </div>

        {/* --------------------------------------------- collapsed search */}
        <Show when={local.searchable && searchCollapsed() && searchOpen()}>
          <div
            class="zen-absolute zen-inset-0 zen-z-10 zen-flex zen-items-center zen-gap-2 zen-bg-zen-background"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                closeSearch();
              }
            }}
          >
            <form
              role="search"
              class="zen-relative zen-flex zen-flex-1 zen-items-center"
              onSubmit={submitSearch}
            >
              <label for={`${searchId}-collapsed`} class="zen-sr-only">
                {searchLabel()}
              </label>
              <Icon
                name="search"
                size={14}
                class="zen-pointer-events-none zen-absolute zen-start-2 zen-text-zen-muted-fg"
              />
              <Input
                id={`${searchId}-collapsed`}
                type="search"
                // Solid does not focus a dynamically inserted element from the
                // `autofocus` attribute the way React's autoFocus prop does —
                // the attribute only applies at initial document parse.
                ref={(el: HTMLInputElement) => queueMicrotask(() => el.focus())}
                value={searchValue()}
                placeholder={searchLabel()}
                onInput={(e) => setSearchValue(e.currentTarget.value)}
                class="zen-h-8 zen-w-full zen-pl-7"
              />
            </form>
            <Button
              type="button"
              variant="ghost"
              color="neutral"
              size="sm"
              shape="square"
              aria-label="Close search"
              onClick={closeSearch}
            >
              <Icon name="x" size={16} />
            </Button>
          </div>
        </Show>

        {/*
          Hidden measurement row: every item at full width, out of flow so it
          cannot affect layout. `visibility: hidden` removes the subtree from the
          tab order; aria-hidden keeps it out of the accessibility tree. See
          ../toolbar/toolbar.tsx for why measuring the visible row is circular.
        */}
        <div
          ref={measureRef}
          // Explicitly "true" — see the note on the notification badge above.
          aria-hidden="true"
          class="zen-pointer-events-none zen-absolute zen-left-0 zen-top-0 zen-flex zen-gap-2 zen-opacity-0"
          style={{ visibility: "hidden" }}
        >
          <For each={allItems()}>{(i) => renderItem(i)}</For>
        </div>
      </div>
    </header>
  );
};

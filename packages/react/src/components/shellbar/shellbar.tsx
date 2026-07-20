import * as React from "react";
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
 * ShellBar — the global application header: logo, product title, search,
 * custom action icons, notifications, profile.
 *
 * See docs/fiori-gap-analysis.md (Tier 1) — "the single most recognizable Fiori
 * element", and the first piece of the app frame this library has.
 *
 *   <ShellBar
 *     logo={<Logo />}
 *     primaryTitle="Purchase Orders"
 *     secondaryTitle="Northwind"
 *     searchable
 *     onSearch={(q) => find(q)}
 *     notificationCount={3}
 *     items={items}
 *     profile={{ name: "Rajesh Pillai", menuItems: profileMenu }}
 *   />
 *
 * Two things collapse as the bar narrows, and they collapse independently:
 *
 *  - `items` overflow into a ••• menu, measured exactly as Toolbar does it (see
 *    ../toolbar/toolbar.tsx for why the widths come from a hidden row rather
 *    than from the visible one — measuring the visible row is circular).
 *  - the search field turns into a magnifier button below SEARCH_COLLAPSE_WIDTH,
 *    which expands into a full-width overlay. This is keyed off the container
 *    width alone, NOT off what fits, so it cannot feed back into the item
 *    measurement and oscillate.
 *
 * Like Toolbar, `items` is DATA rather than children: an overflowed item has to
 * re-render as a menu item, which is a different element than the icon button it
 * was, so the bar needs the item's intent (label, icon, onSelect) to render it
 * either way.
 */

/** Below this container width the search field collapses to an icon. */
const SEARCH_COLLAPSE_WIDTH = 640;

export interface ShellBarMenuItem {
  id: string;
  label: React.ReactNode;
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

export interface ShellBarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onSearch" | "title"> {
  logo?: React.ReactNode;
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
  /** Accessible name — a banner landmark needs one. Defaults to `primaryTitle`. */
  "aria-label"?: string;
}

/** "Rajesh Pillai" -> "RP". Two words at most; that is what fits in an avatar. */
const initialsFrom = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export const ShellBar = React.forwardRef<HTMLElement, ShellBarProps>(
  (
    {
      logo,
      primaryTitle,
      secondaryTitle,
      menuItems,
      searchable = false,
      onSearch,
      searchPlaceholder = "Search",
      notificationCount,
      onNotificationsClick,
      profile,
      items,
      onLogoClick,
      overflowLabel = "More actions",
      className,
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const brandingRef = React.useRef<HTMLDivElement>(null);
    const fixedRef = React.useRef<HTMLDivElement>(null);
    const measureRef = React.useRef<HTMLDivElement>(null);
    const overflowRef = React.useRef<HTMLDivElement>(null);
    const searchTriggerRef = React.useRef<HTMLButtonElement>(null);

    const searchId = React.useId();
    const [searchValue, setSearchValue] = React.useState("");
    const [searchCollapsed, setSearchCollapsed] = React.useState(false);
    const [searchOpen, setSearchOpen] = React.useState(false);

    const allItems = React.useMemo(() => items ?? [], [items]);
    // How many `auto` items currently fit. Starts at "all" so the first paint is
    // the common case (everything fits) rather than an empty bar.
    const [visibleCount, setVisibleCount] = React.useState(allItems.length);

    const pinned = React.useMemo(
      () => allItems.filter((i) => i.overflow === "never"),
      [allItems],
    );
    const collapsible = React.useMemo(
      () => allItems.filter((i) => i.overflow !== "never"),
      [allItems],
    );

    React.useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container || typeof ResizeObserver === "undefined") return;

      const recompute = () => {
        const measure = measureRef.current;
        if (!measure) return;
        const width = container.offsetWidth;

        // Purely a function of the container width, so re-running this cannot
        // depend on what fits. The effect re-runs on searchCollapsed to pick up
        // the trailing cluster's new width, then settles on the same value.
        setSearchCollapsed(width < SEARCH_COLLAPSE_WIDTH);

        const widths = Array.from(measure.children).map((el) => (el as HTMLElement).offsetWidth);
        const GAP = 8; // zen-gap-2
        const brandingWidth = brandingRef.current?.offsetWidth ?? 0;
        const fixedWidth = fixedRef.current?.offsetWidth ?? 0;
        const overflowWidth = (overflowRef.current?.offsetWidth ?? 32) + GAP;
        const pinnedWidth = pinned.reduce(
          (sum, i) => sum + (widths[allItems.indexOf(i)] ?? 0) + GAP,
          0,
        );

        let budget = width - brandingWidth - fixedWidth - pinnedWidth - GAP;
        let fit = 0;
        for (const item of collapsible) {
          const w = (widths[allItems.indexOf(item)] ?? 0) + GAP;
          // Once anything is going to overflow, the trigger needs room too.
          const needsTrigger = fit < collapsible.length - 1;
          if (budget - w < (needsTrigger ? overflowWidth : 0)) break;
          budget -= w;
          fit++;
        }
        setVisibleCount(fit);
      };

      recompute();
      const ro = new ResizeObserver(recompute);
      ro.observe(container);
      return () => ro.disconnect();
    }, [allItems, pinned, collapsible, searchCollapsed]);

    // A collapsed-open search that is then widened would leave the overlay up
    // over an already-visible field.
    React.useEffect(() => {
      if (!searchCollapsed) setSearchOpen(false);
    }, [searchCollapsed]);

    const shown = collapsible.slice(0, visibleCount);
    const hidden = collapsible.slice(visibleCount);

    const submitSearch = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(searchValue);
    };

    // An overlay you can only dismiss with the mouse is a trap for keyboard
    // users, so Escape closes it and focus returns to the magnifier that opened
    // it — otherwise focus would land back on <body>.
    const closeSearch = () => {
      setSearchOpen(false);
      queueMicrotask(() => searchTriggerRef.current?.focus());
    };

    const renderItem = (item: ShellBarItem, key?: string) => (
      <Button
        key={key ?? item.id}
        type="button"
        variant="ghost"
        color="neutral"
        size="sm"
        shape="square"
        aria-label={item.label}
        disabled={item.disabled}
        onClick={item.onSelect}
      >
        <Icon name={item.icon} size={16} />
      </Button>
    );

    const renderMenuItems = (entries: ShellBarMenuItem[]) =>
      entries.map((m) => (
        <React.Fragment key={m.id}>
          {m.separatorBefore ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem disabled={m.disabled} onSelect={m.onSelect}>
            {m.icon ? <Icon name={m.icon} size={14} className="zen-mr-2" /> : null}
            {m.label}
          </DropdownMenuItem>
        </React.Fragment>
      ));

    const titles = (
      <span className="zen-flex zen-min-w-0 zen-flex-col zen-items-start zen-leading-tight">
        {primaryTitle ? (
          <span className="zen-truncate zen-text-sm zen-font-semibold zen-text-zen-foreground">
            {primaryTitle}
          </span>
        ) : null}
        {secondaryTitle ? (
          <span className="zen-truncate zen-text-xs zen-text-zen-muted-fg">{secondaryTitle}</span>
        ) : null}
      </span>
    );

    const searchField = (
      <form role="search" className="zen-relative zen-flex zen-items-center" onSubmit={submitSearch}>
        <label htmlFor={searchId} className="zen-sr-only">
          {searchPlaceholder}
        </label>
        <Icon
          name="search"
          size={14}
          className="zen-pointer-events-none zen-absolute zen-start-2 zen-text-zen-muted-fg"
        />
        <Input
          id={searchId}
          type="search"
          value={searchValue}
          placeholder={searchPlaceholder}
          onChange={(e) => setSearchValue(e.target.value)}
          className="zen-h-8 zen-w-48 zen-pl-7"
        />
      </form>
    );

    return (
      <header
        ref={ref}
        aria-label={ariaLabel ?? primaryTitle ?? "Application header"}
        className={cn(
          "zen-w-full zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-3",
          className,
        )}
        {...props}
      >
        <div
          ref={containerRef}
          className="zen-relative zen-flex zen-h-14 zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden"
        >
          {/* ---------------------------------------------------- branding */}
          <div
            ref={brandingRef}
            className="zen-flex zen-min-w-0 zen-shrink-0 zen-items-center zen-gap-2"
          >
            {logo ? (
              onLogoClick ? (
                <Button
                  type="button"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  shape="square"
                  aria-label="Home"
                  onClick={onLogoClick}
                >
                  {logo}
                </Button>
              ) : (
                <span className="zen-flex zen-shrink-0 zen-items-center">{logo}</span>
              )
            ) : null}

            {menuItems && menuItems.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    className="zen-min-w-0 zen-px-2"
                    iconRight={<Icon name="chevron-down" size={14} />}
                  >
                    {titles}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">{renderMenuItems(menuItems)}</DropdownMenuContent>
              </DropdownMenu>
            ) : (
              titles
            )}

            {children}
          </div>

          {/* ------------------------------------- items + fixed trailing */}
          <div className="zen-ml-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2">
            <div className="zen-flex zen-items-center zen-gap-2">
              {pinned.map((i) => renderItem(i))}
              {shown.map((i) => renderItem(i))}

              {hidden.length > 0 ? (
                <div ref={overflowRef}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        shape="square"
                        aria-label={overflowLabel}
                      >
                        <Icon name="more" size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {hidden.map((i) => (
                        <DropdownMenuItem key={i.id} disabled={i.disabled} onSelect={i.onSelect}>
                          <Icon name={i.icon} size={14} className="zen-mr-2" />
                          {i.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : null}
            </div>

            <div ref={fixedRef} className="zen-flex zen-shrink-0 zen-items-center zen-gap-2">
              {searchable ? (
                searchCollapsed ? (
                  <Button
                    ref={searchTriggerRef}
                    type="button"
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    shape="square"
                    aria-label={searchPlaceholder}
                    aria-expanded={searchOpen}
                    onClick={() => setSearchOpen((o) => !o)}
                  >
                    <Icon name="search" size={16} />
                  </Button>
                ) : (
                  searchField
                )
              ) : null}

              {notificationCount !== undefined || onNotificationsClick ? (
                <span className="zen-relative zen-flex zen-shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    shape="square"
                    aria-label={
                      notificationCount
                        ? `Notifications, ${notificationCount} unread`
                        : "Notifications"
                    }
                    onClick={onNotificationsClick}
                  >
                    <Icon name="bell" size={16} />
                  </Button>
                  {notificationCount ? (
                    <span
                      aria-hidden="true"
                      className="zen-pointer-events-none zen-absolute -zen-end-1 -zen-top-1 zen-flex zen-h-4 zen-min-w-4 zen-items-center zen-justify-center zen-rounded-zen-full zen-bg-zen-error zen-px-1 zen-text-xs zen-font-semibold zen-leading-none zen-text-zen-error-fg"
                    >
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  ) : null}
                </span>
              ) : null}

              {profile ? (
                profile.menuItems && profile.menuItems.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        shape="circle"
                        aria-label={profile.name}
                      >
                        <Avatar size="sm">
                          {profile.image ? <AvatarImage src={profile.image} alt="" /> : null}
                          <AvatarFallback>
                            {profile.initials ?? initialsFrom(profile.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{profile.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {renderMenuItems(profile.menuItems)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    shape="circle"
                    aria-label={profile.name}
                    onClick={profile.onClick}
                  >
                    <Avatar size="sm">
                      {profile.image ? <AvatarImage src={profile.image} alt="" /> : null}
                      <AvatarFallback>
                        {profile.initials ?? initialsFrom(profile.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                )
              ) : null}
            </div>
          </div>

          {/* ------------------------------------------- collapsed search */}
          {searchable && searchCollapsed && searchOpen ? (
            <div
              className="zen-absolute zen-inset-0 zen-z-10 zen-flex zen-items-center zen-gap-2 zen-bg-zen-background"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  closeSearch();
                }
              }}
            >
              <form
                role="search"
                className="zen-relative zen-flex zen-flex-1 zen-items-center"
                onSubmit={submitSearch}
              >
                <label htmlFor={`${searchId}-collapsed`} className="zen-sr-only">
                  {searchPlaceholder}
                </label>
                <Icon
                  name="search"
                  size={14}
                  className="zen-pointer-events-none zen-absolute zen-start-2 zen-text-zen-muted-fg"
                />
                <Input
                  id={`${searchId}-collapsed`}
                  type="search"
                  autoFocus
                  value={searchValue}
                  placeholder={searchPlaceholder}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="zen-h-8 zen-w-full zen-pl-7"
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
          ) : null}

          {/*
            Hidden measurement row: every item at full width, out of flow so it
            cannot affect layout. `visibility: hidden` removes the subtree from
            the tab order; aria-hidden keeps it out of the accessibility tree.
            See ../toolbar/toolbar.tsx for why measuring the visible row instead
            would be circular.
          */}
          <div
            ref={measureRef}
            aria-hidden="true"
            className="zen-pointer-events-none zen-absolute zen-left-0 zen-top-0 zen-flex zen-gap-2 zen-opacity-0"
            style={{ visibility: "hidden" }}
          >
            {allItems.map((i) => renderItem(i, `measure-${i.id}`))}
          </div>
        </div>
      </header>
    );
  },
);
ShellBar.displayName = "ShellBar";

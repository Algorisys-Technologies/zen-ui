import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { dismissable } from "../../lib/dismissable";
import { rovingFocus } from "../../lib/roving-focus";
import { setPresence } from "../../lib/presence";
import { Button, type ButtonProps } from "../button/button";
import { Icon, type IconName } from "../icon/icon";
import { Input } from "../form/input/input";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar/avatar";

/**
 * ShellBar — the global application header: logo, product title, search,
 * custom action icons, notifications, profile.
 *
 * See docs/fiori-gap-analysis.md (Tier 1) — "the single most recognizable Fiori
 * element", and the first piece of the app frame this library has.
 *
 *   const bar = ShellBar({
 *     logo: makeLogo(),
 *     primaryTitle: "Purchase Orders",
 *     secondaryTitle: "Northwind",
 *     searchable: true,
 *     onSearch: (q) => find(q),
 *     notificationCount: 3,
 *     items,
 *     profile: { name: "Rajesh Pillai", menuItems: profileMenu },
 *   });
 *   host.append(bar.el);
 *
 * Two things collapse as the bar narrows, and they collapse independently:
 *
 *  - `items` overflow into a ••• menu, measured exactly as Toolbar does it (see
 *    ../toolbar/toolbar.ts for why the widths come from a hidden row rather than
 *    from the visible one — measuring the visible row is circular).
 *  - the search field turns into a magnifier button below SEARCH_COLLAPSE_WIDTH,
 *    which expands into a full-width overlay. This is keyed off the container
 *    width alone, NOT off what fits, so it cannot feed back into the item
 *    measurement and oscillate.
 *
 * Like Toolbar, `items` is DATA rather than children: an overflowed item has to
 * re-render as a menu item, which is a different element than the icon button it
 * was, so the bar needs the item's intent (label, icon, onSelect) to render it
 * either way.
 *
 * ## Menus
 *
 * React composes DropdownMenu (Radix) for the product switcher, the profile menu
 * and the items overflow. Vanilla has no DropdownMenu family, and a menu on a
 * trigger is exactly the shape Toolbar already inlines from lib primitives — an
 * absolutely-positioned surface, dismissable, with roving focus over its items.
 * So `createMenu` below builds that once and all three reuse it, rather than
 * porting a whole DropdownMenu family to unblock one component. The class strings
 * are copied from React's DropdownMenuContent / Item / Separator / Label so the
 * surfaces render identically.
 */

/** Below this container width the search field collapses to an icon. */
const SEARCH_COLLAPSE_WIDTH = 640;

/** zen-gap-2, in px — the row's gap, needed to sum measured widths. */
const GAP = 8;

let idCounter = 0;

export interface ShellBarMenuItem {
  id: string;
  label: Child;
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

export interface ShellBarProps extends Omit<BaseProps, "children"> {
  logo?: Child;
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
  /** Leading content placed after the branding, never overflows. */
  children?: Child;
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

// ---- menu surface, copied from React's DropdownMenu class strings ----------

const menuContentClass = (align: "start" | "end") =>
  cn(
    "zen-absolute zen-top-full zen-mt-1 zen-z-50 zen-min-w-32 zen-overflow-hidden",
    align === "end" ? "zen-right-0" : "zen-left-0",
    "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-zen-md",
    "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
  );

const MENU_ITEM_CLASS = cn(
  "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
  "focus:zen-bg-zen-muted hover:zen-bg-zen-muted",
  "aria-disabled:zen-pointer-events-none aria-disabled:zen-opacity-50",
);

const MENU_SEPARATOR_CLASS = "-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border";
const MENU_LABEL_CLASS = "zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg";

/** Fresh nodes for a label, so the same label can render in the bar and the menu. */
const freshLabel = (label: Child): Node[] => toNodes(label).map((n) => n.cloneNode(true));

interface MenuHandle {
  /** The positioned wrapper holding the trigger and the panel. */
  el: HTMLElement;
  trigger: ZenComponent<ButtonProps>;
  setItems(entries: ShellBarMenuItem[]): void;
  close(): void;
  destroy(): void;
}

/**
 * A menu on a trigger: an absolutely-positioned panel, dismissable, with roving
 * focus over its items. Owns the trigger passed in (destroys it on destroy()).
 */
function createMenu(opts: {
  trigger: ZenComponent<ButtonProps>;
  align: "start" | "end";
  /** Heading rendered above the items (the profile menu's name). */
  label?: string;
}): MenuHandle {
  const { trigger, align, label } = opts;

  const container = document.createElement("div");
  container.className = "zen-relative";

  const panel = document.createElement("div");
  panel.setAttribute("role", "menu");
  panel.className = menuContentClass(align);
  panel.hidden = true;
  container.append(trigger.el, panel);

  trigger.el.setAttribute("aria-haspopup", "menu");
  trigger.el.setAttribute("aria-expanded", "false");

  let items: HTMLDivElement[] = [];
  const itemsDisposer = new Disposer();
  const openCleanups = new Disposer();
  let open = false;

  const close = () => {
    if (!open) return;
    open = false;
    trigger.el.setAttribute("aria-expanded", "false");
    setPresence(panel, "closed", () => {
      panel.hidden = true;
    });
    openCleanups.dispose();
    trigger.el.focus();
  };

  const doOpen = () => {
    if (open || items.length === 0) return;
    open = true;
    trigger.el.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    setPresence(panel, "open");

    openCleanups.add(
      dismissable(panel, {
        ignore: [trigger.el],
        onDismiss: () => close(),
      }),
    );
    openCleanups.add(
      rovingFocus(panel, {
        items: () => items.filter((i) => i.getAttribute("aria-disabled") !== "true"),
        orientation: "vertical",
      }),
    );
    items.find((i) => i.getAttribute("aria-disabled") !== "true")?.focus();
  };

  const setItems = (entries: ShellBarMenuItem[]) => {
    itemsDisposer.dispose();
    const fresh = new Disposer();
    panel.replaceChildren();
    items = [];

    if (label) {
      const heading = document.createElement("div");
      heading.className = MENU_LABEL_CLASS;
      heading.textContent = label;
      panel.append(heading);
      const sep = document.createElement("div");
      sep.setAttribute("role", "separator");
      sep.className = MENU_SEPARATOR_CLASS;
      panel.append(sep);
    }

    for (const m of entries) {
      if (m.separatorBefore) {
        const sep = document.createElement("div");
        sep.setAttribute("role", "separator");
        sep.className = MENU_SEPARATOR_CLASS;
        panel.append(sep);
      }

      const item = document.createElement("div");
      item.setAttribute("role", "menuitem");
      item.className = MENU_ITEM_CLASS;
      item.tabIndex = -1;
      if (m.disabled) item.setAttribute("aria-disabled", "true");
      if (m.icon) {
        const ic = Icon({ name: m.icon, size: 14, class: "zen-mr-2" });
        item.append(ic.el);
        fresh.add(() => ic.destroy());
      }
      item.append(...freshLabel(m.label));

      if (!m.disabled) {
        const pick = () => {
          m.onSelect?.();
          close();
        };
        const onKey = (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pick();
          }
        };
        item.addEventListener("click", pick);
        item.addEventListener("keydown", onKey);
        fresh.add(() => {
          item.removeEventListener("click", pick);
          item.removeEventListener("keydown", onKey);
        });
      }
      panel.append(item);
      items.push(item);
    }

    itemsDisposer.add(() => fresh.dispose());
  };

  const onTriggerClick = () => (open ? close() : doOpen());
  const onTriggerKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      doOpen();
    }
  };
  trigger.el.addEventListener("click", onTriggerClick);
  trigger.el.addEventListener("keydown", onTriggerKey);

  return {
    el: container,
    trigger,
    setItems,
    close,
    destroy() {
      trigger.el.removeEventListener("click", onTriggerClick);
      trigger.el.removeEventListener("keydown", onTriggerKey);
      openCleanups.dispose();
      itemsDisposer.dispose();
      trigger.destroy();
      container.remove();
    },
  };
}

export function ShellBar(props: ShellBarProps = {}): ZenComponent<ShellBarProps> {
  let current: ShellBarProps = { ...props };
  const uid = `zen-shellbar-${++idCounter}`;

  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  // Per-render sub-components (branding, fixed cluster). Rebuilt on init and on
  // update(), never per resize frame.
  let renderDisposer = new Disposer();

  // ---- structural elements, built once -------------------------------------
  const el = document.createElement("header");

  const container = document.createElement("div");
  container.className =
    "zen-relative zen-flex zen-h-14 zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden";

  const branding = document.createElement("div");
  branding.className = "zen-flex zen-min-w-0 zen-shrink-0 zen-items-center zen-gap-2";

  const trailing = document.createElement("div");
  trailing.className = "zen-ml-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2";

  const itemsRow = document.createElement("div");
  itemsRow.className = "zen-flex zen-items-center zen-gap-2";

  const fixed = document.createElement("div");
  fixed.className = "zen-flex zen-shrink-0 zen-items-center zen-gap-2";

  const searchSlot = document.createElement("span");
  searchSlot.className = "zen-flex zen-items-center";

  trailing.append(itemsRow, fixed);

  // Hidden measurement row: every item at full width, out of flow so it cannot
  // affect layout. `visibility: hidden` removes the subtree from the tab order;
  // aria-hidden keeps it out of the accessibility tree. See ../toolbar/toolbar.ts
  // for why measuring the visible row instead would be circular.
  const measureRow = document.createElement("div");
  measureRow.setAttribute("aria-hidden", "true");
  measureRow.className =
    "zen-pointer-events-none zen-absolute zen-left-0 zen-top-0 zen-flex zen-gap-2 zen-opacity-0";
  measureRow.style.visibility = "hidden";

  container.append(branding, trailing, measureRow);
  el.append(container);

  // ---- the items overflow menu, built once ---------------------------------
  const overflowTrigger = Button({
    type: "button",
    variant: "ghost",
    color: "neutral",
    size: "sm",
    shape: "square",
    children: Icon({ name: "more", size: 16 }),
  });
  const overflowMenu = createMenu({ trigger: overflowTrigger, align: "end" });
  disposer.add(() => overflowMenu.destroy());

  // ---- item state ----------------------------------------------------------
  let allItems: ShellBarItem[] = [];
  let pinned: ShellBarItem[] = [];
  let collapsible: ShellBarItem[] = [];
  // How many `auto` items currently fit. Starts at "all" so the first paint is
  // the common case (everything fits) rather than an empty bar.
  let visibleCount = 0;

  // Persistent bar buttons, keyed by item id, so a resize does not rebuild every
  // control (which would drop focus and re-add listeners every frame).
  const barButtons = new Map<string, ZenComponent<ButtonProps>>();
  const buttonsDisposer = new Disposer();
  let measureButtons: ZenComponent<ButtonProps>[] = [];
  disposer.add(() => buttonsDisposer.dispose());
  disposer.add(() => {
    for (const b of measureButtons) b.destroy();
  });

  // ---- search state --------------------------------------------------------
  let searchValue = "";
  let searchCollapsed = false;
  let searchOpen = false;
  let searchTriggerBtn: ZenComponent<ButtonProps> | undefined;
  let searchFieldForm: HTMLElement | undefined;
  let overlay: HTMLElement | undefined;
  const overlayDisposer = new Disposer();
  disposer.add(() => overlayDisposer.dispose());

  const submitSearch = (e: Event) => {
    e.preventDefault();
    current.onSearch?.(searchValue);
  };

  const buildSearchField = (
    id: string,
    formClass: string,
    inputWidthClass: string,
    track: Disposer,
  ) => {
    const placeholder = current.searchPlaceholder ?? "Search";
    const form = document.createElement("form");
    form.setAttribute("role", "search");
    form.className = formClass;
    form.addEventListener("submit", submitSearch);

    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.className = "zen-sr-only";
    label.textContent = placeholder;

    const icon = Icon({
      name: "search",
      size: 14,
      class: "zen-pointer-events-none zen-absolute zen-start-2 zen-text-zen-muted-fg",
    });
    const input = Input({
      id,
      type: "search",
      value: searchValue,
      placeholder,
      class: inputWidthClass,
      onInput: (ev) => {
        searchValue = (ev.target as HTMLInputElement).value;
      },
    });

    form.append(label, icon.el, input.el);
    track.add(() => icon.destroy());
    track.add(() => input.destroy());
    return { form, input };
  };

  const renderSearchSlot = () => {
    if (!current.searchable) return;
    searchSlot.replaceChildren();
    if (searchCollapsed) {
      if (searchTriggerBtn) searchSlot.append(searchTriggerBtn.el);
    } else if (searchFieldForm) {
      searchSlot.append(searchFieldForm);
    }
  };

  const closeSearch = () => {
    searchOpen = false;
    searchTriggerBtn?.update({ "aria-expanded": "false" });
    renderSearchOverlay();
    // Return focus to the magnifier that opened it — otherwise focus lands on
    // <body>. queueMicrotask so the overlay is gone before the focus moves.
    queueMicrotask(() => searchTriggerBtn?.el.focus());
  };

  const renderSearchOverlay = () => {
    overlayDisposer.dispose();
    overlay?.remove();
    overlay = undefined;

    if (!(current.searchable && searchCollapsed && searchOpen)) return;

    const fresh = new Disposer();
    overlay = document.createElement("div");
    overlay.className =
      "zen-absolute zen-inset-0 zen-z-10 zen-flex zen-items-center zen-gap-2 zen-bg-zen-background";
    const onKeyDown = (e: KeyboardEvent) => {
      // An overlay you can only dismiss with the mouse is a trap for keyboard
      // users, so Escape closes it and returns focus to the magnifier.
      if (e.key === "Escape") {
        e.stopPropagation();
        closeSearch();
      }
    };
    overlay.addEventListener("keydown", onKeyDown);
    fresh.add(() => overlay?.removeEventListener("keydown", onKeyDown));

    const { form, input } = buildSearchField(
      `${uid}-search-collapsed`,
      "zen-relative zen-flex zen-flex-1 zen-items-center",
      "zen-h-8 zen-w-full zen-pl-7",
      fresh,
    );

    const closeBtn = Button({
      type: "button",
      variant: "ghost",
      color: "neutral",
      size: "sm",
      shape: "square",
      "aria-label": "Close search",
      onClick: closeSearch,
      children: Icon({ name: "x", size: 16 }),
    });
    fresh.add(() => closeBtn.destroy());

    overlay.append(form, closeBtn.el);
    container.append(overlay);
    overlayDisposer.add(() => fresh.dispose());
    input.el.focus();
  };

  // ---- item buttons --------------------------------------------------------
  const makeItemButton = (item: ShellBarItem): ZenComponent<ButtonProps> =>
    Button({
      type: "button",
      variant: "ghost",
      color: "neutral",
      size: "sm",
      shape: "square",
      "aria-label": item.label,
      disabled: item.disabled,
      onClick: item.onSelect,
      children: Icon({ name: item.icon, size: 16 }),
    });

  const barButton = (item: ShellBarItem): ZenComponent<ButtonProps> => {
    let b = barButtons.get(item.id);
    if (!b) {
      b = makeItemButton(item);
      barButtons.set(item.id, b);
      buttonsDisposer.add(() => b!.destroy());
    }
    return b;
  };

  const paint = () => {
    const shown = collapsible.slice(0, visibleCount);
    const hidden = collapsible.slice(visibleCount);

    itemsRow.replaceChildren();
    for (const item of pinned) itemsRow.append(barButton(item).el);
    for (const item of shown) itemsRow.append(barButton(item).el);

    if (hidden.length > 0) {
      overflowMenu.trigger.el.setAttribute(
        "aria-label",
        current.overflowLabel ?? "More actions",
      );
      overflowMenu.setItems(
        hidden.map((i) => ({
          id: i.id,
          label: i.label,
          icon: i.icon,
          onSelect: i.onSelect,
          disabled: i.disabled,
        })),
      );
      itemsRow.append(overflowMenu.el);
    } else {
      overflowMenu.close();
      overflowMenu.el.remove();
    }
  };

  // ---- titles + branding ---------------------------------------------------
  const buildTitles = (): HTMLElement => {
    const span = document.createElement("span");
    span.className = "zen-flex zen-min-w-0 zen-flex-col zen-items-start zen-leading-tight";
    if (current.primaryTitle) {
      const p = document.createElement("span");
      p.className = "zen-truncate zen-text-sm zen-font-semibold zen-text-zen-foreground";
      p.textContent = current.primaryTitle;
      span.append(p);
    }
    if (current.secondaryTitle) {
      const s = document.createElement("span");
      s.className = "zen-truncate zen-text-xs zen-text-zen-muted-fg";
      s.textContent = current.secondaryTitle;
      span.append(s);
    }
    return span;
  };

  // ---- recompute (resize) --------------------------------------------------
  const recompute = () => {
    const width = container.offsetWidth;

    // Purely a function of the container width, so re-running this cannot depend
    // on what fits. When it flips, swap the trailing search cluster before we
    // measure, so its new width is what the item budget sees.
    if (current.searchable) {
      const nextCollapsed = width < SEARCH_COLLAPSE_WIDTH;
      if (nextCollapsed !== searchCollapsed) {
        searchCollapsed = nextCollapsed;
        // A collapsed-open search that is then widened would leave the overlay
        // up over an already-visible field.
        if (!searchCollapsed && searchOpen) {
          searchOpen = false;
          searchTriggerBtn?.update({ "aria-expanded": "false" });
          renderSearchOverlay();
        }
        renderSearchSlot();
      }
    }

    const widths = Array.from(measureRow.children).map((c) => (c as HTMLElement).offsetWidth);
    const brandingWidth = branding.offsetWidth;
    const fixedWidth = fixed.offsetWidth;
    const overflowWidth = (overflowMenu.el.offsetWidth || 32) + GAP;
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

    if (fit !== visibleCount) {
      visibleCount = fit;
      paint();
    }
  };

  // ---- render (init / update) ----------------------------------------------
  const render = () => {
    renderDisposer.dispose();
    renderDisposer = new Disposer();

    const {
      logo,
      primaryTitle,
      menuItems,
      searchable = false,
      searchPlaceholder = "Search",
      notificationCount,
      onNotificationsClick,
      profile,
      items,
      onLogoClick,
      children,
      class: className,
      "aria-label": ariaLabel,
      // Interpreted here, kept off the forwarded rest.
      secondaryTitle: _st,
      onSearch: _os,
      overflowLabel: _ol,
      ...rest
    } = current;

    // Item sets and the measurement row, rebuilt from scratch.
    allItems = items ?? [];
    pinned = allItems.filter((i) => i.overflow === "never");
    collapsible = allItems.filter((i) => i.overflow !== "never");

    buttonsDisposer.dispose();
    barButtons.clear();

    for (const b of measureButtons) b.destroy();
    measureButtons = allItems.map(makeItemButton);
    measureRow.replaceChildren(...measureButtons.map((b) => b.el));

    // ---- root ----
    el.setAttribute("aria-label", ariaLabel ?? primaryTitle ?? "Application header");
    el.className = cn(
      "zen-w-full zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-3",
      className,
    );

    // ---- branding ----
    branding.replaceChildren();
    if (logo !== undefined && logo !== null && logo !== false) {
      if (onLogoClick) {
        const logoBtn = Button({
          type: "button",
          variant: "ghost",
          color: "neutral",
          size: "sm",
          shape: "square",
          "aria-label": "Home",
          onClick: onLogoClick,
          children: logo,
        });
        renderDisposer.add(() => logoBtn.destroy());
        branding.append(logoBtn.el);
      } else {
        const span = document.createElement("span");
        span.className = "zen-flex zen-shrink-0 zen-items-center";
        span.append(...toNodes(logo));
        branding.append(span);
      }
    }

    if (menuItems && menuItems.length > 0) {
      const trigger = Button({
        type: "button",
        variant: "ghost",
        color: "neutral",
        size: "sm",
        class: "zen-min-w-0 zen-px-2",
        iconRight: Icon({ name: "chevron-down", size: 14 }),
        children: buildTitles(),
      });
      const menu = createMenu({ trigger, align: "start" });
      menu.setItems(menuItems);
      renderDisposer.add(() => menu.destroy());
      branding.append(menu.el);
    } else {
      branding.append(buildTitles());
    }

    if (children !== undefined && children !== null && children !== false) {
      branding.append(...toNodes(children));
    }

    // ---- fixed trailing cluster ----
    fixed.replaceChildren();

    if (searchable) {
      searchTriggerBtn = Button({
        type: "button",
        variant: "ghost",
        color: "neutral",
        size: "sm",
        shape: "square",
        "aria-label": searchPlaceholder,
        "aria-expanded": String(searchOpen),
        onClick: () => {
          searchOpen = !searchOpen;
          searchTriggerBtn?.update({ "aria-expanded": String(searchOpen) });
          renderSearchOverlay();
        },
        children: Icon({ name: "search", size: 16 }),
      });
      renderDisposer.add(() => searchTriggerBtn?.destroy());

      const built = buildSearchField(
        `${uid}-search`,
        "zen-relative zen-flex zen-items-center",
        "zen-h-8 zen-w-48 zen-pl-7",
        renderDisposer,
      );
      searchFieldForm = built.form;

      renderSearchSlot();
      fixed.append(searchSlot);
    } else {
      searchTriggerBtn = undefined;
      searchFieldForm = undefined;
    }

    if (notificationCount !== undefined || onNotificationsClick) {
      const notif = document.createElement("span");
      notif.className = "zen-relative zen-flex zen-shrink-0";
      const bell = Button({
        type: "button",
        variant: "ghost",
        color: "neutral",
        size: "sm",
        shape: "square",
        "aria-label": notificationCount
          ? `Notifications, ${notificationCount} unread`
          : "Notifications",
        onClick: onNotificationsClick,
        children: Icon({ name: "bell", size: 16 }),
      });
      renderDisposer.add(() => bell.destroy());
      notif.append(bell.el);
      if (notificationCount) {
        const badge = document.createElement("span");
        badge.setAttribute("aria-hidden", "true");
        badge.className =
          "zen-pointer-events-none zen-absolute -zen-end-1 -zen-top-1 zen-flex zen-h-4 zen-min-w-4 zen-items-center zen-justify-center zen-rounded-zen-full zen-bg-zen-error zen-px-1 zen-text-xs zen-font-semibold zen-leading-none zen-text-zen-error-fg";
        badge.textContent = notificationCount > 99 ? "99+" : String(notificationCount);
        notif.append(badge);
      }
      fixed.append(notif);
    }

    if (profile) {
      const buildAvatar = () =>
        Avatar({
          size: "sm",
          children: [
            profile.image ? AvatarImage({ src: profile.image, alt: "" }) : null,
            AvatarFallback({ children: profile.initials ?? initialsFrom(profile.name) }),
          ],
        });

      if (profile.menuItems && profile.menuItems.length > 0) {
        const trigger = Button({
          type: "button",
          variant: "ghost",
          color: "neutral",
          size: "sm",
          shape: "circle",
          "aria-label": profile.name,
          children: buildAvatar(),
        });
        const menu = createMenu({ trigger, align: "end", label: profile.name });
        menu.setItems(profile.menuItems);
        renderDisposer.add(() => menu.destroy());
        fixed.append(menu.el);
      } else {
        const btn = Button({
          type: "button",
          variant: "ghost",
          color: "neutral",
          size: "sm",
          shape: "circle",
          "aria-label": profile.name,
          onClick: profile.onClick,
          children: buildAvatar(),
        });
        renderDisposer.add(() => btn.destroy());
        fixed.append(btn.el);
      }
    }

    // Item counts may have changed under update(); paint clamps via slice and
    // the observer corrects the real count.
    paint();
    renderSearchOverlay();

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  visibleCount = (current.items ?? []).length;
  render();

  const ro =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => recompute()) : undefined;
  ro?.observe(container);
  disposer.add(() => ro?.disconnect());
  disposer.add(() => renderDisposer.dispose());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if (next.items) visibleCount = next.items.length;
      render();
      recompute();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

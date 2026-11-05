import { DemoPage } from "./demo-helpers";
import { ShellBar, type ShellBarItem, type ShellBarMenuItem } from "./shellbar/shellbar";
import { Button } from "./button/button";
import { Icon } from "./icon/icon";

/**
 * ShellBar demo. Several sections deliberately constrain width, because both
 * collapse behaviours — items into the ••• menu, search into a magnifier — only
 * show up when the bar runs out of room. Mirrors the React demo
 * (NewShellBarDemo.tsx): same six sections, same snippets.
 */

const logo = (): HTMLElement => {
  const span = document.createElement("span");
  span.className =
    "zen-flex zen-h-6 zen-w-6 zen-items-center zen-justify-center zen-rounded-zen-sm zen-bg-zen-primary zen-text-xs zen-font-bold zen-text-zen-primary-fg";
  span.textContent = "Z";
  return span;
};

const ITEMS: ShellBarItem[] = [
  { id: "calendar", label: "Calendar", icon: "calendar" },
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "files", label: "Files", icon: "folder" },
  { id: "team", label: "Team", icon: "users" },
  { id: "settings", label: "Settings", icon: "cog" },
];

/** A longer list, so the overflow is visible while the search is still a field. */
const MANY_ITEMS: ShellBarItem[] = [
  ...ITEMS,
  { id: "starred", label: "Starred", icon: "star" },
  { id: "flagged", label: "Flagged", icon: "flag" },
  { id: "recent", label: "Recent", icon: "clock" },
];

const PRODUCTS: ShellBarMenuItem[] = [
  { id: "orders", label: "Purchase Orders", icon: "file" },
  { id: "invoices", label: "Invoices", icon: "draft" },
  { id: "suppliers", label: "Suppliers", icon: "users" },
  { id: "reports", label: "Reports", icon: "sort-desc", separatorBefore: true },
];

const PROFILE_MENU: ShellBarMenuItem[] = [
  { id: "profile", label: "My profile", icon: "eye" },
  { id: "settings", label: "Settings", icon: "cog" },
  { id: "signout", label: "Sign out", icon: "lock", separatorBefore: true },
];

const PROFILE = {
  name: "Rajesh Pillai",
  image: "https://i.pravatar.cc/96?img=12",
  menuItems: PROFILE_MENU,
};

/** A command palette's trigger: the kind of control ShellBar's `search` slot is for. */
const paletteButton = (compact: boolean, onOpen: () => void) => {
  const kids: Element[] = [Icon({ name: "search", size: 14 }).el];
  if (!compact) {
    const text = document.createElement("span");
    text.textContent = "Search…";
    const kbd = document.createElement("kbd");
    kbd.className = "zen-ml-auto zen-font-sans zen-text-xs";
    kbd.textContent = "Ctrl K";
    kids.push(text, kbd);
  }
  return Button({
    type: "button",
    variant: "outline",
    color: "neutral",
    size: "sm",
    shape: compact ? "square" : undefined,
    "aria-label": compact ? "Search (Ctrl+K)" : undefined,
    onClick: onOpen,
    class: compact ? undefined : "zen-w-56 zen-justify-start zen-text-zen-muted-fg",
    children: kids,
  });
};

/** A rounded, clipping frame for the bar; an optional fixed pixel width. */
const frame = (width: number | null, el: HTMLElement): HTMLElement => {
  const box = document.createElement("div");
  box.className = "zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border";
  if (width === null) box.classList.add("zen-w-full");
  else box.style.width = `${width}px`;
  box.append(el);
  return box;
};

export default function ShellBarDemo(): HTMLElement {
  return DemoPage({
    title: "ShellBar",
    description:
      "The global application header: logo, product title, search, action icons, notifications, profile. Two things collapse independently as it narrows — items overflow into a ••• menu (measured the way Toolbar does it), and the search field turns into a magnifier that expands over the bar.",
    sections: [
      {
        title: "1. Full width — the whole bar",
        codeTitle: "Everything fits",
        codeDescription:
          "Logo, titles, five action icons, search, notifications, profile.",
        code: `const items: ShellBarItem[] = [
  { id: "calendar", label: "Calendar", icon: "calendar" },
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "settings", label: "Settings", icon: "cog" },
];

const bar = ShellBar({
  logo: makeLogo(),
  primaryTitle: "Purchase Orders",
  secondaryTitle: "Northwind",
  searchable: true,
  onSearch: (q) => console.log(q),
  items,
  notificationCount: 3,
  onNotificationsClick: () => {},
  profile: { name: "Rajesh Pillai", image: "/me.jpg", menuItems: PROFILE_MENU },
  onLogoClick: () => {},
});
host.append(bar.el);`,
        render: () =>
          frame(
            null,
            ShellBar({
              logo: logo(),
              primaryTitle: "Purchase Orders",
              secondaryTitle: "Northwind",
              searchable: true,
              items: ITEMS,
              notificationCount: 3,
              onNotificationsClick: () => {},
              profile: PROFILE,
              onLogoClick: () => {},
              "aria-label": "Purchase Orders (full width)",
            }).el,
          ),
      },
      {
        title: "2. Product switcher on the title",
        codeTitle: "menuItems turns the title into a dropdown",
        codeDescription:
          "The product-switcher pattern: the title names the app and opens the list of them.",
        code: `const products: ShellBarMenuItem[] = [
  { id: "orders", label: "Purchase Orders", icon: "file" },
  { id: "invoices", label: "Invoices", icon: "draft" },
  { id: "reports", label: "Reports", icon: "sort-desc", separatorBefore: true },
];

ShellBar({
  logo: makeLogo(),
  primaryTitle: "Purchase Orders",
  secondaryTitle: "Northwind",
  menuItems: products,
  profile: { name: "Rajesh Pillai" },
});`,
        render: () =>
          frame(
            null,
            ShellBar({
              logo: logo(),
              primaryTitle: "Purchase Orders",
              secondaryTitle: "Northwind",
              menuItems: PRODUCTS,
              notificationCount: 12,
              profile: PROFILE,
              "aria-label": "Purchase Orders (product menu)",
            }).el,
          ),
      },
      {
        title: "3. Constrained — action icons collapse",
        codeTitle: "Eight items, 700px of room",
        codeDescription:
          "The icons that no longer fit move into the ••• menu, as menu items with their labels. There is still room for the search field, so it stays a field — the two collapses are independent.",
        code: `const box = document.createElement("div");
box.style.width = "700px";
box.append(ShellBar({ logo: makeLogo(), primaryTitle: "Purchase Orders", searchable: true, items: manyItems, profile }).el);`,
        render: () =>
          frame(
            700,
            ShellBar({
              logo: logo(),
              primaryTitle: "Purchase Orders",
              secondaryTitle: "Northwind",
              searchable: true,
              items: MANY_ITEMS,
              notificationCount: 3,
              profile: PROFILE,
              "aria-label": "Purchase Orders (700px)",
            }).el,
          ),
      },
      {
        title: "4. Narrow — search collapses to an icon",
        codeTitle: "480px",
        codeDescription:
          "Below 640px the search field becomes a magnifier button; clicking it expands the field over the bar. Everything collapsible is in the ••• menu.",
        code: `const box = document.createElement("div");
box.style.width = "480px";
box.append(ShellBar({ logo: makeLogo(), primaryTitle: "Purchase Orders", searchable: true, items, profile }).el);`,
        render: () =>
          frame(
            480,
            ShellBar({
              logo: logo(),
              primaryTitle: "Purchase Orders",
              secondaryTitle: "Northwind",
              searchable: true,
              items: ITEMS,
              notificationCount: 3,
              profile: PROFILE,
              "aria-label": "Purchase Orders (480px)",
            }).el,
          ),
      },
      {
        title: "5. Pinned items and minimal bars",
        codeTitle: "overflow:'never' pins an item; every part is optional",
        codeDescription:
          "Settings stays on the bar however tight it gets. The second bar is a logo and a title — nothing else.",
        code: `ShellBar({
  logo: makeLogo(),
  primaryTitle: "Purchase Orders",
  items: [{ id: "settings", label: "Settings", icon: "cog", overflow: "never" }, ...rest],
});

ShellBar({ logo: makeLogo(), primaryTitle: "Northwind" });`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-4";
          wrap.append(
            frame(
              300,
              ShellBar({
                logo: logo(),
                primaryTitle: "Purchase Orders",
                items: [
                  { id: "settings", label: "Settings", icon: "cog", overflow: "never" },
                  ...ITEMS.filter((i) => i.id !== "settings"),
                ],
                profile: PROFILE,
                "aria-label": "Purchase Orders (pinned item)",
              }).el,
            ),
            frame(
              null,
              ShellBar({
                logo: logo(),
                primaryTitle: "Northwind",
                "aria-label": "Northwind (minimal)",
              }).el,
            ),
          );
          return wrap;
        },
      },
      {
        title: "6. Your own search control in the bar",
        codeTitle: "search: (bar) => …: a command palette's trigger",
        codeDescription:
          "The slot takes any control, laid out by the bar where its search field would be. As a function it is told when the bar is compact (where the built-in field would shrink to an icon), so a palette button can drop its label: the second bar is 480px.",
        code: `ShellBar({
  logo: makeLogo(),
  primaryTitle: "Algorisys One",
  search: (bar) => paletteButton({ compact: bar.compact, onOpen: openPalette }),
  profile,
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-flex-col zen-gap-3";
          const out = document.createElement("p");
          out.className = "zen-text-sm zen-text-zen-muted-fg";
          out.setAttribute("aria-live", "polite");
          const opened = document.createElement("span");
          opened.dataset.testid = "palette";
          opened.textContent = "not opened";
          out.append("Palette: ", opened);
          const bar = (width: number, testid: string, from: string) => {
            const box = frame(
              width,
              ShellBar({
                logo: logo(),
                primaryTitle: "Algorisys One",
                search: (b) => paletteButton(b.compact, () => (opened.textContent = from)),
                profile: PROFILE,
                "aria-label": `Algorisys One (${width}px)`,
              }).el,
            );
            box.style.maxWidth = "100%";
            box.dataset.testid = testid;
            return box;
          };
          wrap.append(
            bar(900, "slot-wide", "from the wide bar"),
            bar(480, "slot-narrow", "from the narrow bar"),
            out,
          );
          return wrap;
        },
      },
    ],
  });
}

import { ShellBar, type ShellBarItem, type ShellBarMenuItem } from "./shellbar/shellbar";
import { createSignal } from "solid-js";
import { DemoPage, DemoSection } from "./demo-helpers";
import { Button } from "./button/button";
import { Icon } from "./icon/icon";

/** A command palette's trigger: the kind of control ShellBar's `search` slot is for. */
const PaletteButton = (props: { compact: boolean; onOpen: () => void }) => (
  <Button
    type="button"
    variant="outline"
    color="neutral"
    size="sm"
    shape={props.compact ? "square" : undefined}
    aria-label={props.compact ? "Search (Ctrl+K)" : undefined}
    onClick={props.onOpen}
    class={props.compact ? undefined : "zen-w-56 zen-justify-start zen-text-zen-muted-fg"}
  >
    <Icon name="search" size={14} />
    {props.compact ? null : (
      <>
        <span>Search…</span>
        <kbd class="zen-ml-auto zen-font-sans zen-text-xs">Ctrl K</kbd>
      </>
    )}
  </Button>
);

/**
 * ShellBar demo — mirrors the React binding's sections. Several widths are
 * deliberately constrained, because both collapse behaviours — items into the
 * ••• menu, search into a magnifier — only show up when the bar runs out of room.
 */

const Logo = () => (
  <span class="zen-flex zen-h-6 zen-w-6 zen-items-center zen-justify-center zen-rounded-zen-sm zen-bg-zen-primary zen-text-xs zen-font-bold zen-text-zen-primary-fg">
    Z
  </span>
);

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

const NewShellBarDemo = () => (
  <DemoPage
    title="ShellBar"
    description={
      <>
        The global application header: logo, product title, search, action icons,
        notifications, profile. Two things collapse independently as it narrows —{" "}
        <code>items</code> overflow into a ••• menu (measured the way{" "}
        <code>Toolbar</code> does it), and the search field turns into a magnifier
        that expands over the bar.
      </>
    }
  >
    <DemoSection
      title="1. Full width — the whole bar"
      codeTitle="Everything fits"
      codeDescription="Logo, titles, five action icons, search, notifications, profile."
      code={`const ITEMS: ShellBarItem[] = [
  { id: "calendar", label: "Calendar", icon: "calendar" },
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "settings", label: "Settings", icon: "cog" },
];

<ShellBar
  logo={<Logo />}
  primaryTitle="Purchase Orders"
  secondaryTitle="Northwind"
  searchable
  onSearch={(q) => console.log(q)}
  items={ITEMS}
  notificationCount={3}
  onNotificationsClick={() => {}}
  profile={{ name: "Rajesh Pillai", image: "/me.jpg", menuItems: PROFILE_MENU }}
  onLogoClick={() => {}}
/>`}
    >
      <div class="zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border">
        <ShellBar
          logo={<Logo />}
          primaryTitle="Purchase Orders"
          secondaryTitle="Northwind"
          searchable
          items={ITEMS}
          notificationCount={3}
          onNotificationsClick={() => {}}
          profile={PROFILE}
          onLogoClick={() => {}}
          aria-label="Purchase Orders (full width)"
        />
      </div>
    </DemoSection>

    <DemoSection
      title="2. Product switcher on the title"
      codeTitle="menuItems turns the title into a dropdown"
      codeDescription="The product-switcher pattern: the title names the app and opens the list of them."
      code={`const PRODUCTS: ShellBarMenuItem[] = [
  { id: "orders", label: "Purchase Orders", icon: "file" },
  { id: "invoices", label: "Invoices", icon: "draft" },
  { id: "reports", label: "Reports", icon: "sort-desc", separatorBefore: true },
];

<ShellBar
  logo={<Logo />}
  primaryTitle="Purchase Orders"
  secondaryTitle="Northwind"
  menuItems={PRODUCTS}
  profile={{ name: "Rajesh Pillai" }}
/>`}
    >
      <div class="zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border">
        <ShellBar
          logo={<Logo />}
          primaryTitle="Purchase Orders"
          secondaryTitle="Northwind"
          menuItems={PRODUCTS}
          notificationCount={12}
          profile={PROFILE}
          aria-label="Purchase Orders (product menu)"
        />
      </div>
    </DemoSection>

    <DemoSection
      title="3. Constrained — action icons collapse"
      codeTitle="Eight items, 700px of room"
      codeDescription="The icons that no longer fit move into the ••• menu, as menu items with their labels. There is still room for the search field, so it stays a field — the two collapses are independent."
      code={`<div style={{ width: "700px" }}>
  <ShellBar logo={<Logo />} primaryTitle="Purchase Orders" searchable items={MANY_ITEMS} profile={PROFILE} />
</div>`}
    >
      <div
        class="zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border"
        style={{ width: "700px" }}
      >
        <ShellBar
          logo={<Logo />}
          primaryTitle="Purchase Orders"
          secondaryTitle="Northwind"
          searchable
          items={MANY_ITEMS}
          notificationCount={3}
          profile={PROFILE}
          aria-label="Purchase Orders (700px)"
        />
      </div>
    </DemoSection>

    <DemoSection
      title="4. Narrow — search collapses to an icon"
      codeTitle="480px"
      codeDescription="Below 640px the search field becomes a magnifier button; clicking it expands the field over the bar. Everything collapsible is in the ••• menu."
      code={`<div style={{ width: "480px" }}>
  <ShellBar logo={<Logo />} primaryTitle="Purchase Orders" searchable items={ITEMS} profile={PROFILE} />
</div>`}
    >
      <div
        class="zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border"
        style={{ width: "480px" }}
      >
        <ShellBar
          logo={<Logo />}
          primaryTitle="Purchase Orders"
          secondaryTitle="Northwind"
          searchable
          items={ITEMS}
          notificationCount={3}
          profile={PROFILE}
          aria-label="Purchase Orders (480px)"
        />
      </div>
    </DemoSection>

    <DemoSection
      title="5. Pinned items and minimal bars"
      codeTitle="overflow:'never' pins an item; every part is optional"
      codeDescription="Settings stays on the bar however tight it gets. The second bar is a logo and a title — nothing else."
      code={`<ShellBar
  logo={<Logo />}
  primaryTitle="Purchase Orders"
  items={[{ id: "settings", label: "Settings", icon: "cog", overflow: "never" }, ...rest]}
/>

<ShellBar logo={<Logo />} primaryTitle="Northwind" />`}
    >
      <div class="zen-flex zen-w-full zen-flex-col zen-gap-4">
        <div
          class="zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border"
          style={{ width: "300px" }}
        >
          <ShellBar
            logo={<Logo />}
            primaryTitle="Purchase Orders"
            items={[
              { id: "settings", label: "Settings", icon: "cog", overflow: "never" },
              ...ITEMS.filter((i) => i.id !== "settings"),
            ]}
            profile={PROFILE}
            aria-label="Purchase Orders (pinned item)"
          />
        </div>
        <div class="zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border">
          <ShellBar logo={<Logo />} primaryTitle="Northwind" aria-label="Northwind (minimal)" />
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="5. Your own search control in the bar"
      codeTitle="search={(bar) => …}: a command palette's trigger"
      codeDescription="The slot takes any control, laid out by the bar where its search field would be. As a function it is told when the bar is compact (where the built-in field would shrink to an icon), so a palette button can drop its label: the second bar is 480px."
      code={`<ShellBar
  logo={<Logo />}
  primaryTitle="Algorisys One"
  search={(bar) => <PaletteButton compact={bar.compact} onOpen={openPalette} />}
  profile={PROFILE}
/>`}
    >
      {(() => {
        const [opened, setOpened] = createSignal("");
        return (
          <div class="zen-flex zen-flex-col zen-gap-3">
            <div class="zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border" style={{ width: "900px", "max-width": "100%" }} data-testid="slot-wide">
              <ShellBar
                logo={<Logo />}
                primaryTitle="Algorisys One"
                search={(bar) => <PaletteButton compact={bar.compact} onOpen={() => setOpened("from the wide bar")} />}
                profile={PROFILE}
                aria-label="Algorisys One (900px)"
              />
            </div>
            <div class="zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border" style={{ width: "480px" }} data-testid="slot-narrow">
              <ShellBar
                logo={<Logo />}
                primaryTitle="Algorisys One"
                search={(bar) => <PaletteButton compact={bar.compact} onOpen={() => setOpened("from the narrow bar")} />}
                profile={PROFILE}
                aria-label="Algorisys One (480px)"
              />
            </div>
            <p class="zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
              Palette: <span data-testid="palette">{opened() || "not opened"}</span>
            </p>
          </div>
        );
      })()}
    </DemoSection>
  </DemoPage>
);

export default NewShellBarDemo;

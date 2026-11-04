import { Tile, TileGrid } from "./tile/tile";
import { Icon } from "./icon/icon";
import { DemoPage } from "./demo-helpers";

const HEADING =
  "zen-mb-2 zen-mt-0 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg";

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className: string, ...kids: (Node | string)[]) => {
  const e = document.createElement(tag);
  e.className = className;
  e.append(...kids);
  return e;
};

export default function TileDemo(): HTMLElement {
  // The line under the launchpad: what the last tile chosen did.
  const action = document.createElement("span");
  action.dataset.testid = "tile-action";
  action.textContent = "Choose a tile.";
  const say = (s: string) => () => {
    action.textContent = s;
  };

  return DemoPage({
    title: "Tile",
    description:
      "A launchpad: the modules, apps or records a person starts their work from, each a tile with a mark, a name and a live line under it. TileGrid lays them out in responsive columns as one tab stop: the arrows move between tiles, Home and End to the ends.",
    sections: [
      {
        title: "1. A launchpad, by module",
        codeTitle: "TileGrid of Tiles, a grid per module",
        codeDescription:
          "Tab into a grid, then use the arrows: up and down follow the columns as they are laid out, so the keys still work when the window narrows and a column drops. A tile with href is a link; with onClick a button. Asset is outside this plan: locked, but it still explains itself when chosen. Pricing Rule is still counting.",
        code: `const heading = document.createElement("h3");
heading.id = "accounts";
heading.textContent = "Accounts";

const grid = TileGrid({
  "aria-labelledby": "accounts",
  children: [
    Tile({ avatar: "SI", title: "Sales Invoice", subtitle: "131 records", href: "/sales-invoice" }),
    Tile({ avatar: "PE", title: "Payment Entry", subtitle: "48 records", href: "/payment-entry" }),
    Tile({ avatar: "JE", title: "Journal Entry", subtitle: "Open", href: "/journal-entry" }),
    Tile({ avatar: "AS", title: "Asset", locked: true, lockedLabel: "Not in your plan", onClick: explainPlan }),
  ],
});
section.append(heading, grid.el);`,
        render: () => {
          const accounts = TileGrid({
            "aria-labelledby": "mod-accounts",
            "data-testid": "grid-accounts",
            children: [
              Tile({ avatar: "SI", title: "Sales Invoice", subtitle: "131 records", href: "#sales-invoice" }),
              Tile({ avatar: "PE", title: "Payment Entry", subtitle: "48 records", href: "#payment-entry" }),
              Tile({ avatar: "JE", title: "Journal Entry", subtitle: "Open", href: "#journal-entry" }),
              Tile({ avatar: "PR", title: "Pricing Rule", loading: true, href: "#pricing-rule" }),
              Tile({
                avatar: "AS",
                title: "Asset",
                locked: true,
                lockedLabel: "Not in your plan",
                onClick: say("Asset is not in this plan: the app explains, or offers an upgrade"),
              }),
              Tile({ avatar: "BU", title: "Budget", subtitle: "Archived", disabled: true }),
            ],
          });
          const stock = TileGrid({
            "aria-labelledby": "mod-stock",
            "data-testid": "grid-stock",
            children: [
              Tile({ avatar: "SE", title: "Stock Entry", subtitle: "212 records", href: "#stock-entry" }),
              Tile({ avatar: "DN", title: "Delivery Note", subtitle: "96 records", href: "#delivery-note" }),
              Tile({ avatar: "IT", title: "Item", subtitle: "1,284 records", href: "#item" }),
            ],
          });
          const h1 = el("h3", HEADING, "Accounts");
          h1.id = "mod-accounts";
          const h2 = el("h3", HEADING, "Stock");
          h2.id = "mod-stock";
          const live = el("p", "zen-m-0 zen-text-sm zen-text-zen-muted-fg", action);
          live.setAttribute("aria-live", "polite");
          const pad = el(
            "div",
            "zen-flex zen-w-full zen-flex-col zen-gap-5",
            el("section", "", h1, accounts.el),
            el("section", "", h2, stock.el),
            live,
          );
          pad.dataset.testid = "launchpad";
          return pad;
        },
      },
      {
        title: "2. With icons",
        codeTitle: "icon in place of avatar",
        codeDescription: "Any icon in the mark. A narrower minimum width packs more tiles in a row.",
        code: `TileGrid({
  minTileWidth: "11rem",
  children: [
    Tile({ icon: Icon({ name: "home" }), title: "Home", subtitle: "Your day", onClick: go }),
    …
  ],
})`,
        render: () =>
          TileGrid({
            "aria-label": "Shortcuts",
            minTileWidth: "11rem",
            children: [
              Tile({ icon: Icon({ name: "home" }), title: "Home", subtitle: "Your day", onClick: say("Home") }),
              Tile({ icon: Icon({ name: "search" }), title: "Search", subtitle: "Everything", onClick: say("Search") }),
              Tile({ icon: Icon({ name: "cog" }), title: "Settings", subtitle: "Company, users", onClick: say("Settings") }),
            ],
          }).el,
      },
    ],
  });
}

import { DemoPage } from "./demo-helpers";

/**
 * Tile demo — the web-components port. <zen-tile>'s name, count, mark and state
 * are attributes; `icon` (a Node) and `onClick` (what makes a tile without href a
 * button) are JS properties. <zen-tile-grid> takes the tiles as children and
 * forwards `aria-labelledby` / `aria-label` to its inner role="group".
 */

const HEADING =
  "zen-mb-2 zen-mt-0 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg";

type TileEl = HTMLElement & { icon?: Node; onClick?: () => void };

function tile(attrs: Record<string, string | true>, props: { icon?: Node; onClick?: () => void } = {}): TileEl {
  const t = document.createElement("zen-tile") as TileEl;
  for (const [k, v] of Object.entries(attrs)) t.setAttribute(k, v === true ? "" : v);
  Object.assign(t, props);
  return t;
}

function grid(attrs: Record<string, string>, ...tiles: Node[]): HTMLElement {
  const g = document.createElement("zen-tile-grid");
  for (const [k, v] of Object.entries(attrs)) g.setAttribute(k, v);
  g.append(...tiles);
  return g;
}

function icon(name: string): HTMLElement {
  const i = document.createElement("zen-icon");
  i.setAttribute("name", name);
  return i;
}

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
        code: `<h3 id="accounts">Accounts</h3>
<zen-tile-grid aria-labelledby="accounts">
  <zen-tile avatar="SI" title="Sales Invoice" subtitle="131 records" href="/sales-invoice"></zen-tile>
  <zen-tile avatar="PE" title="Payment Entry" subtitle="48 records" href="/payment-entry"></zen-tile>
  <zen-tile avatar="JE" title="Journal Entry" subtitle="Open" href="/journal-entry"></zen-tile>
  <zen-tile id="asset" avatar="AS" title="Asset" locked locked-label="Not in your plan"></zen-tile>
</zen-tile-grid>
<script>
  document.querySelector("#asset").onClick = explainPlan;
</script>`,
        render: () => {
          const accounts = grid(
            { "aria-labelledby": "mod-accounts", "data-testid": "grid-accounts" },
            tile({ avatar: "SI", title: "Sales Invoice", subtitle: "131 records", href: "#sales-invoice" }),
            tile({ avatar: "PE", title: "Payment Entry", subtitle: "48 records", href: "#payment-entry" }),
            tile({ avatar: "JE", title: "Journal Entry", subtitle: "Open", href: "#journal-entry" }),
            tile({ avatar: "PR", title: "Pricing Rule", loading: true, href: "#pricing-rule" }),
            tile(
              { avatar: "AS", title: "Asset", locked: true, "locked-label": "Not in your plan" },
              { onClick: say("Asset is not in this plan: the app explains, or offers an upgrade") },
            ),
            tile({ avatar: "BU", title: "Budget", subtitle: "Archived", disabled: true }),
          );
          const stock = grid(
            { "aria-labelledby": "mod-stock", "data-testid": "grid-stock" },
            tile({ avatar: "SE", title: "Stock Entry", subtitle: "212 records", href: "#stock-entry" }),
            tile({ avatar: "DN", title: "Delivery Note", subtitle: "96 records", href: "#delivery-note" }),
            tile({ avatar: "IT", title: "Item", subtitle: "1,284 records", href: "#item" }),
          );
          const h1 = el("h3", HEADING, "Accounts");
          h1.id = "mod-accounts";
          const h2 = el("h3", HEADING, "Stock");
          h2.id = "mod-stock";
          const live = el("p", "zen-m-0 zen-text-sm zen-text-zen-muted-fg", action);
          live.setAttribute("aria-live", "polite");
          const pad = el(
            "div",
            "zen-flex zen-w-full zen-flex-col zen-gap-5",
            el("section", "", h1, accounts),
            el("section", "", h2, stock),
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
        code: `<zen-tile-grid min-tile-width="11rem">
  <zen-tile title="Home" subtitle="Your day"></zen-tile>
  …
</zen-tile-grid>
<script>
  const icon = document.createElement("zen-icon");
  icon.setAttribute("name", "home");
  const home = document.querySelector("zen-tile");
  home.icon = icon;
  home.onClick = go;
</script>`,
        render: () =>
          grid(
            { "aria-label": "Shortcuts", "min-tile-width": "11rem" },
            tile({ title: "Home", subtitle: "Your day" }, { icon: icon("home"), onClick: say("Home") }),
            tile({ title: "Search", subtitle: "Everything" }, { icon: icon("search"), onClick: say("Search") }),
            tile({ title: "Settings", subtitle: "Company, users" }, { icon: icon("cog"), onClick: say("Settings") }),
          ),
      },
    ],
  });
}

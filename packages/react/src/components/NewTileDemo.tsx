import { useState } from "react";
import { Tile, TileGrid } from "./tile/tile";
import { Icon } from "./icon/icon";
import { CodeExample } from "./demo-helpers";

const HEADING =
  "zen-mb-2 zen-mt-0 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg";

const NewTileDemo: React.FC = () => {
  const [last, setLast] = useState("");
  return (
    <div className="demo-page">
      <h1>Tile</h1>
      <p className="lede">
        A launchpad: the modules, apps or records a person starts their work from, each a tile with a mark, a
        name and a live line under it. TileGrid lays them out in responsive columns as one tab stop: the arrows
        move between tiles, Home and End to the ends.
      </p>

      <section className="demo-section">
        <h2>1. A launchpad, by module</h2>
        <CodeExample
          title="TileGrid of Tiles, a grid per module"
          description="Tab into a grid, then use the arrows: up and down follow the columns as they are laid out, so the keys still work when the window narrows and a column drops. A tile with href is a link; with onClick a button. Asset is outside this plan: locked, but it still explains itself when chosen. Pricing Rule is still counting."
          code={`<h3 id="accounts">Accounts</h3>
<TileGrid aria-labelledby="accounts">
  <Tile avatar="SI" title="Sales Invoice" subtitle="131 records" href="/sales-invoice" />
  <Tile avatar="PE" title="Payment Entry" subtitle="48 records" href="/payment-entry" />
  <Tile avatar="JE" title="Journal Entry" subtitle="Open" href="/journal-entry" />
  <Tile avatar="AS" title="Asset" locked lockedLabel="Not in your plan" onClick={explainPlan} />
</TileGrid>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-5" data-testid="launchpad">
            <section>
              <h3 id="mod-accounts" className={HEADING}>
                Accounts
              </h3>
              <TileGrid aria-labelledby="mod-accounts" data-testid="grid-accounts">
                <Tile avatar="SI" title="Sales Invoice" subtitle="131 records" href="#sales-invoice" />
                <Tile avatar="PE" title="Payment Entry" subtitle="48 records" href="#payment-entry" />
                <Tile avatar="JE" title="Journal Entry" subtitle="Open" href="#journal-entry" />
                <Tile avatar="PR" title="Pricing Rule" loading href="#pricing-rule" />
                <Tile
                  avatar="AS"
                  title="Asset"
                  locked
                  lockedLabel="Not in your plan"
                  onClick={() => setLast("Asset is not in this plan: the app explains, or offers an upgrade")}
                />
                <Tile avatar="BU" title="Budget" subtitle="Archived" disabled />
              </TileGrid>
            </section>
            <section>
              <h3 id="mod-stock" className={HEADING}>
                Stock
              </h3>
              <TileGrid aria-labelledby="mod-stock" data-testid="grid-stock">
                <Tile avatar="SE" title="Stock Entry" subtitle="212 records" href="#stock-entry" />
                <Tile avatar="DN" title="Delivery Note" subtitle="96 records" href="#delivery-note" />
                <Tile avatar="IT" title="Item" subtitle="1,284 records" href="#item" />
              </TileGrid>
            </section>
            <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
              <span data-testid="tile-action">{last || "Choose a tile."}</span>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. With icons</h2>
        <CodeExample
          title="icon in place of avatar"
          description="Any icon in the mark. A narrower minimum width packs more tiles in a row."
          code={`<TileGrid minTileWidth="11rem">
  <Tile icon={<Icon name="home" />} title="Home" subtitle="Your day" onClick={go} />
  …
</TileGrid>`}
        >
          <TileGrid aria-label="Shortcuts" minTileWidth="11rem">
            <Tile icon={<Icon name="home" />} title="Home" subtitle="Your day" onClick={() => setLast("Home")} />
            <Tile icon={<Icon name="search" />} title="Search" subtitle="Everything" onClick={() => setLast("Search")} />
            <Tile
              icon={<Icon name="cog" />}
              title="Settings"
              subtitle="Company, users"
              onClick={() => setLast("Settings")}
            />
          </TileGrid>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewTileDemo;

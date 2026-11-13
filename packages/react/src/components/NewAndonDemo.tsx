import { useState } from "react";
import { AndonBoard, AndonTile, type AndonItem } from "./andon/andon";
import { CodeExample } from "./demo-helpers";

// A pinned clock, so the clocks on the page read the same every time.
const NOW = Date.UTC(2026, 10, 13, 12, 30);
const M = 60_000;

const plant: AndonItem[] = [
  { id: "p4", name: "Press 4", line: "Line A", state: "running", since: NOW - 50 * M },
  { id: "p5", name: "Press 5", line: "Line A", state: "fault", cause: "Hydraulic pressure low", since: NOW - 23 * M },
  { id: "t1", name: "Trim 1", line: "Line A", state: "setup", cause: "Changeover to SKU 4471", since: NOW - 11 * M },
  { id: "w2", name: "Weld 2", line: "Line B", state: "unknown", since: NOW - 5 * M - 12_000 },
  { id: "w3", name: "Weld 3", line: "Line B", state: "waiting", cause: "Starved: no blanks", since: NOW - 4 * M - 40_000 },
  { id: "pk1", name: "Pack 1", line: "Line B", state: "maintenance", cause: "PM: belt tension", since: NOW - 38 * M },
  { id: "pk2", name: "Pack 2", line: "Line B", state: "idle", since: NOW - 7 * M },
  { id: "pt1", name: "Paint 1", line: "Line C", state: "running", since: NOW - 29 * 60 * M },
];

const NewAndonDemo: React.FC = () => {
  const [opened, setOpened] = useState<string>("—");
  return (
    <div className="demo-page">
      <h1>AndonTile / AndonBoard</h1>
      <p className="lede">
        The plant board, read from across the room. One tile per machine: a colour, the
        state in words, a cause and a clock. The clock measures trouble, not uptime — Paint 1
        has run for 29 hours and shows no counter, because that would be the biggest number
        on a healthy tile and read as an alarm.
      </p>

      <section className="demo-section">
        <h2>1. The board</h2>
        <CodeExample
          title="items, and the time of the last successful refresh"
          description="Tiles keep the order given: on a wall board people find a machine by where it always is. Weld 2 has not been heard from for five minutes, so it shows no data, with a dashed frame and a clock of how long."
          code={`<AndonBoard
  lastUpdated={fetchedAt}
  items={machines.map((m) => ({
    id: m.id, name: m.name, line: m.line,
    state: m.state, cause: m.cause, since: m.stateSince,
  }))}
/>`}
        >
          <AndonBoard className="zen-w-full" items={plant} now={NOW} lastUpdated={NOW - 12_000} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Trouble first</h2>
        <CodeExample
          title="sort: down, no data, setup, planned, idle, running — longest first"
          description={'For a "needs attention" view rather than the wall. No data sorts straight after down: a dead collector is trouble nobody notices.'}
          code={`<AndonBoard sort items={items} lastUpdated={fetchedAt} />`}
        >
          <AndonBoard className="zen-w-full" sort items={plant} now={NOW} lastUpdated={NOW - 12_000} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. A board that stopped updating</h2>
        <CodeExample
          title="past staleAfterMs (default 2 min) it says so"
          description={
            <>
              The last refresh was six minutes ago. The tiles grey out and a banner says how old
              they are — a frozen board otherwise looks exactly like a calm plant. Pass the time
              of the last <em>successful</em> refresh, not of the last attempt.
            </>
          }
          code={`<AndonBoard items={items} lastUpdated={lastGoodFetch} staleAfterMs={120_000} />`}
        >
          <AndonBoard className="zen-w-full" items={plant.slice(0, 4)} now={NOW} lastUpdated={NOW - 6 * M} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. A tile on its own, and clickable</h2>
        <CodeExample
          title="onClick (onTileClick on the board) makes a tile a button"
          code={`<AndonTile item={item} onClick={(item) => open(item.id)} />`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-3">
            <div className="zen-grid zen-gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(var(--zen-andon-tile-min-width), 100%), 1fr))" }}>
              <AndonTile item={plant[1]} now={NOW} onClick={(i) => setOpened(i.name)} />
              <AndonTile item={plant[0]} now={NOW} onClick={(i) => setOpened(i.name)} />
            </div>
            <p className="zen-m-0 zen-text-sm" aria-live="polite">
              Opened: {opened}
            </p>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewAndonDemo;

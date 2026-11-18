import type { AndonItem } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * Every board and tile below is a <zen-andon-board> / <zen-andon-tile>, bound
 * the way a framework template binds one: PROPERTIES for the items (whose
 * `since` is already an epoch number) and for the pinned clock, attributes for
 * the plain values. The code examples show the hand-written markup, where
 * `items` is a json attribute and its moments are ISO strings, revived by the
 * element.
 */
type ZenEl = HTMLElement & Record<string, unknown>;

const make = (tag: string, props: Record<string, unknown>): ZenEl => {
  const el = document.createElement(tag) as ZenEl;
  for (const [key, value] of Object.entries(props)) {
    // `class` is the host's attribute (it reaches the rendered board), not a prop.
    if (key === "class") el.setAttribute("class", String(value));
    else if (value !== undefined) el[key] = value;
  }
  return el;
};

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

const board = (props: Record<string, unknown>): ZenEl =>
  make("zen-andon-board", { now: NOW, lastUpdated: NOW - 12_000, ...props });

export default function AndonDemo(): HTMLElement {
  return DemoPage({
    title: "AndonTile / AndonBoard",
    description:
      "The plant board, read from across the room. One tile per machine: a colour, the state in words, a cause and a clock. The clock measures trouble, not uptime — Paint 1 has run for 29 hours and shows no counter, because that would be the biggest number on a healthy tile and read as an alarm.",
    sections: [
      {
        title: "1. The board",
        codeTitle: "items, and the time of the last successful refresh",
        codeDescription:
          "Tiles keep the order given: on a wall board people find a machine by where it always is. Weld 2 has not been heard from for five minutes, so it shows no data, with a dashed frame and a clock of how long.",
        code: `const board = document.querySelector("zen-andon-board");
board.lastUpdated = fetchedAt;
board.items = machines.map((m) => ({
  id: m.id, name: m.name, line: m.line,
  state: m.state, cause: m.cause, since: m.stateSince,
}));`,
        render: () => board({ class: "zen-w-full", items: plant }),
      },
      {
        title: "2. Trouble first",
        codeTitle: "sort: down, no data, setup, planned, idle, running — longest first",
        codeDescription:
          'For a "needs attention" view rather than the wall. No data sorts straight after down: a dead collector is trouble nobody notices.',
        code: `<zen-andon-board sort last-updated="2026-11-13T12:29:48Z" items='[…]'></zen-andon-board>`,
        render: () => board({ class: "zen-w-full", sort: true, items: plant }),
      },
      {
        title: "3. A board that stopped updating",
        codeTitle: "past stale-after-ms (default 2 min) it says so",
        codeDescription:
          "The last refresh was six minutes ago. The tiles grey out and a banner says how old they are — a frozen board otherwise looks exactly like a calm plant. Pass the time of the last successful refresh, not of the last attempt.",
        code: `<zen-andon-board items='[…]' last-updated="…" stale-after-ms="120000"></zen-andon-board>`,
        render: () => board({ class: "zen-w-full", items: plant.slice(0, 4), lastUpdated: NOW - 6 * M }),
      },
      {
        title: "4. A tile on its own, and clickable",
        codeTitle: "zen-click (zen-tile-click on the board) makes a tile a button",
        code: `<zen-andon-tile item='{ "id": "p5", "name": "Press 5", "state": "fault", "since": "…" }'></zen-andon-tile>

tile.addEventListener("zen-click", (e) => open(e.detail.id));`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-3";

          const status = document.createElement("p");
          status.className = "zen-m-0 zen-text-sm";
          status.setAttribute("aria-live", "polite");
          const say = (name: string) => {
            status.textContent = "Opened: " + name;
          };
          say("—");

          const grid = document.createElement("div");
          grid.className = "zen-grid zen-gap-3";
          grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(min(var(--zen-andon-tile-min-width), 100%), 1fr))";
          for (const item of [plant[1], plant[0]]) {
            const tile = make("zen-andon-tile", { item, now: NOW });
            tile.addEventListener("zen-click", (e) => say((e as CustomEvent<AndonItem>).detail.name));
            grid.append(tile);
          }
          wrap.append(grid, status);
          return wrap;
        },
      },
    ],
  });
}

import {
  AndonBoard,
  AndonTile,
  type AndonBoardProps,
  type AndonItem,
  type AndonTileProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";
import { reviveEach, reviveKeys, revived } from "../lib/time";

/**
 * <zen-andon-board items='[…]' last-updated="2026-11-13T12:29:48Z">
 * <zen-andon-tile item='{"id":"p5","name":"Press 5","state":"fault","since":"…"}'>
 *
 * `since` (per item), `now` and `last-updated` are moments, and JSON has no date
 * type — so each is revived from an ISO string (or an all-digit epoch string)
 * on build AND on every update; see lib/time.ts. A board whose `lastUpdated`
 * stayed a string would compute its age as NaN and could never say it is stale,
 * which is the one thing it exists to say.
 *
 * The callbacks: a tile's `onClick` is `zen-click`, the board's `onTileClick`
 * is `zen-tile-click`; detail is the item either way. As in vanilla, a listener
 * is what turns a tile into a <button> — a plain DOM `click` on the host does
 * not, because nothing would tell the factory to render one, and its target
 * would not say which machine.
 *
 * No slot: both render from data.
 */
const reviveItem = (item: AndonItem | undefined): AndonItem | undefined =>
  item ? (reviveKeys<AndonItem>(item, ["since"]) as AndonItem) : item;

defineZenElement<AndonTileProps>({
  tag: "zen-andon-tile",
  factory: revived<AndonTileProps, Element>(AndonTile, (p) => {
    const out = reviveKeys(p, ["now"]);
    if ("item" in p) out.item = reviveItem(p.item);
    return out;
  }),
  attrs: {
    item: "json",
    now: "string",
  },
  props: ["item", "now"],
  events: { onClick: "zen-click" },
  childrenProp: false,
});

defineZenElement<AndonBoardProps>({
  tag: "zen-andon-board",
  factory: revived<AndonBoardProps, Element>(AndonBoard, (p) => {
    const out = reviveKeys(p, ["now", "lastUpdated"]);
    if ("items" in p) out.items = reviveEach<AndonItem>(p.items, ["since"]) as AndonItem[];
    return out;
  }),
  attrs: {
    items: "json",
    "last-updated": "string",
    "stale-after-ms": "number",
    sort: "boolean",
    now: "string",
    label: "string",
  },
  props: ["items", "lastUpdated", "now"],
  events: { onTileClick: "zen-tile-click" },
  childrenProp: false,
});

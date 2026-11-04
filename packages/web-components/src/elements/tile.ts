import { Tile, TileGrid, type TileProps, type TileGridProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-tile-grid aria-labelledby="accounts">
 *   <zen-tile avatar="SI" title="Sales Invoice" subtitle="131 records" href="/sales-invoice"></zen-tile>
 *   <zen-tile avatar="AS" title="Asset" locked locked-label="Not in your plan"></zen-tile>
 * </zen-tile-grid>
 *
 * `title` and `subtitle` are attributes: a tile's name and count are text in
 * nearly every launchpad, and authoring them in markup is the point. (Being the
 * global `title` attribute, the host also gives the browser's tooltip with the
 * name, which helps where a long name is truncated.) `icon` is a Node and
 * `onClick` a callback, so both are JS properties. `onClick` is what makes a
 * tile without `href` a button, so it is a property rather than a listener on
 * the native click: a listener cannot tell the factory to render a button.
 *
 * The grid's name has to reach the inner `role="group"`, not the
 * `display: contents` host, so `aria-label` and `aria-labelledby` are attributes
 * forwarded to it. The tiles are the slot: each <zen-tile> renders its tile in
 * place, and the grid finds them by `[data-tile]` through the transparent hosts.
 * Light-DOM children are captured once, at connect, as for every element here:
 * a tile added later goes into the rendered grid (`grid.component.el.append(t)`),
 * where the factory's MutationObserver gives it its tabindex. Removing a
 * <zen-tile>, or changing its attributes, needs nothing extra.
 */
defineZenElement<TileProps>({
  tag: "zen-tile",
  factory: Tile,
  attrs: {
    title: "string",
    subtitle: "string",
    avatar: "string",
    href: "string",
    loading: "boolean",
    disabled: "boolean",
    locked: "boolean",
    "locked-label": "string",
  },
  props: ["icon", "onClick"],
  childrenProp: false,
});

type TileGridElementProps = TileGridProps & { ariaLabel?: string; ariaLabelledby?: string };

defineZenElement<TileGridElementProps>({
  tag: "zen-tile-grid",
  factory: ({ ariaLabel, ariaLabelledby, ...props }) =>
    TileGrid({ ...props, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby }),
  attrs: {
    "min-tile-width": "string",
    "aria-label": "string",
    "aria-labelledby": "string",
  },
  props: ["onKeyDown"],
});

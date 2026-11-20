import * as React from "react";
/**
 * Tile and TileGrid — a launchpad: the apps, modules or records a person
 * starts their work from, each a tile with a mark, a name and a live line
 * under it ("131 records").
 *
 *   <TileGrid aria-label="Accounts">
 *     <Tile avatar="SI" title="Sales Invoice" subtitle="131 records" href="/sales-invoice" />
 *     <Tile icon={<Icon name="book" />} title="Journal Entry" subtitle="Open" onClick={open} />
 *     <Tile avatar="AS" title="Asset" locked lockedLabel="Not in your plan" onClick={explain} />
 *   </TileGrid>
 *
 * A tile with `href` is a link (`as` takes a router link), with `onClick` a
 * button. TileGrid is one tab stop: the arrows move between tiles (up and down
 * by the columns as they are laid out), Home and End to the ends, as
 * DataTable's keyboard rows do. Enter and Space are the tile's own.
 */
export type TileProps = {
    /** The tile's name. */
    title: React.ReactNode;
    /** A live line under the name: a count, a status, "Open". */
    subtitle?: React.ReactNode;
    /** Up to two letters in a square mark ("SI"). Ignored when `icon` is given. */
    avatar?: string;
    /** An icon in the square mark, in place of `avatar`. */
    icon?: React.ReactNode;
    /** Makes the tile a link. */
    href?: string;
    /**
     * The link element: a router's `Link`, say. Default "a". It is given `href`
     * and, for routers that navigate by `to` (react-router), `to` as well.
     */
    as?: React.ElementType;
    /** Makes the tile a button (when it has no href). */
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    /** The subtitle is still coming: shown as a skeleton, and the tile is marked busy. */
    loading?: boolean;
    /** Not available: not focusable, not activated, dimmed. */
    disabled?: boolean;
    /**
     * Outside what this user has (a module not in their plan): muted, with a
     * lock. Still activatable, so the app can say why or offer an upgrade.
     */
    locked?: boolean;
    /** Read with a locked tile's name, and shown under it. Default "Locked". */
    lockedLabel?: string;
    className?: string;
};
export declare const Tile: ({ title, subtitle, avatar, icon, href, as, onClick, loading, disabled, locked, lockedLabel, className, }: TileProps) => React.JSX.Element;
export type TileGridProps = React.HTMLAttributes<HTMLDivElement> & {
    /** The narrowest a tile gets before the grid drops a column. Default: --zen-tile-min-width. */
    minTileWidth?: string;
};
/**
 * Tiles in responsive columns, one tab stop for all of them. The tab stop is
 * the tile last focused; the arrows move it.
 */
export declare const TileGrid: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
    /** The narrowest a tile gets before the grid drops a column. Default: --zen-tile-min-width. */
    minTileWidth?: string;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=tile.d.ts.map
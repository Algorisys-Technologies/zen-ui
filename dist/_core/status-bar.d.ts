/**
 * Status bar layout — the pure half of StatusBar.
 *
 *   bun run check:status-bar
 *
 * Which items show, on which side, and which give way when the bar is too
 * narrow: the lowest `priority` first, and between equals the one later in the
 * list, since the list order is the author's order of importance.
 */
export type StatusBarAlign = "start" | "end";
export interface StatusBarLayoutItem {
    id: string;
    align?: StatusBarAlign;
    /** Higher stays longer when the bar is narrow. Default 0. */
    priority?: number;
    hidden?: boolean;
}
export declare function statusBarSides<T extends StatusBarLayoutItem>(items: readonly T[]): {
    start: T[];
    end: T[];
};
/**
 * The ids to collapse, in the order they give way, so the rest fit in `room`
 * pixels with `gap` pixels between neighbours. A width not measured yet counts
 * as 0. `room <= 0` means the bar has not been measured (not in the document,
 * display:none, a server render), and hides nothing.
 */
export declare function statusBarCollapse(items: readonly StatusBarLayoutItem[], widths: Readonly<Record<string, number>>, room: number, gap: number): string[];

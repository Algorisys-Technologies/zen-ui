import { type Accessor, type JSX } from "solid-js";
/**
 * Pagination — standalone, controlled page navigator. zen-ui's DataTable has
 * its own built-in pager; this is the primitive for the many places that
 * paginate without a DataTable (lists, cards, server-driven feeds).
 *
 *   <Pagination page={page()} pageCount={totalPages()} onPageChange={setPage} />
 *
 * Renders Prev / numbered pages (with ellipses) / Next. Fully controlled:
 * `page` is 1-based. Use `usePaginationRange` directly if you want to render
 * your own markup.
 */
declare const DOTS: "dots";
/**
 * Either a plain value or a zero-arg accessor. The React binding takes plain
 * numbers; Solid needs a way to stay reactive without a re-render, so both
 * forms are accepted and `access()` normalises them.
 */
export type MaybeAccessor<T> = T | Accessor<T>;
export interface UsePaginationRangeOptions {
    page: MaybeAccessor<number>;
    pageCount: MaybeAccessor<number>;
    siblingCount?: MaybeAccessor<number | undefined>;
    boundaryCount?: MaybeAccessor<number | undefined>;
}
/**
 * Build the list of page numbers + ellipsis markers to render.
 *
 * Solid counterpart of the React hook: returns an accessor rather than a
 * value, so callers read it as `items()`. The truncation logic is identical.
 */
export declare function usePaginationRange(options: UsePaginationRangeOptions): Accessor<Array<number | typeof DOTS>>;
export interface PaginationProps extends Omit<JSX.HTMLAttributes<HTMLElement>, "onChange" | "class"> {
    /** current page, 1-based */
    page: number;
    /** total number of pages */
    pageCount: number;
    /** called with the next 1-based page */
    onPageChange: (page: number) => void;
    /** pages shown either side of the current page (default 1) */
    siblingCount?: number;
    /** pages pinned at each end (default 1) */
    boundaryCount?: number;
    /** hide the Prev / Next controls */
    hidePrevNext?: boolean;
    class?: string;
}
export declare const Pagination: (props: PaginationProps) => JSX.Element;
export {};
//# sourceMappingURL=pagination.d.ts.map
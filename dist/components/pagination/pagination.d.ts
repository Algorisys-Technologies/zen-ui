import * as React from "react";
/**
 * Pagination — standalone, controlled page navigator. zen-ui's DataTable has
 * its own built-in pager; this is the primitive for the many places that
 * paginate without a DataTable (lists, cards, server-driven feeds).
 *
 *   <Pagination page={page} pageCount={totalPages} onPageChange={setPage} />
 *
 * Renders Prev / numbered pages (with ellipses) / Next. Fully controlled:
 * `page` is 1-based. Use `usePaginationRange` directly if you want to render
 * your own markup.
 */
declare const DOTS: "dots";
/** Build the list of page numbers + ellipsis markers to render. */
export declare function usePaginationRange({ page, pageCount, siblingCount, boundaryCount, }: {
    page: number;
    pageCount: number;
    siblingCount?: number;
    boundaryCount?: number;
}): Array<number | typeof DOTS>;
export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
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
}
export declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLElement>>;
export {};
//# sourceMappingURL=pagination.d.ts.map
import * as React from "react";
import { cn } from "../../lib/cn";

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

const DOTS = "dots" as const;

/** Build the list of page numbers + ellipsis markers to render. */
export function usePaginationRange({
  page,
  pageCount,
  siblingCount = 1,
  boundaryCount = 1,
}: {
  page: number;
  pageCount: number;
  siblingCount?: number;
  boundaryCount?: number;
}): Array<number | typeof DOTS> {
  return React.useMemo(() => {
    const range = (start: number, end: number) =>
      Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i);

    // Few enough pages: show them all.
    const totalToShow = boundaryCount * 2 + siblingCount * 2 + 3;
    if (pageCount <= totalToShow) return range(1, pageCount);

    const startPages = range(1, boundaryCount);
    const endPages = range(pageCount - boundaryCount + 1, pageCount);

    const siblingsStart = Math.max(
      Math.min(page - siblingCount, pageCount - boundaryCount - siblingCount * 2 - 1),
      boundaryCount + 2,
    );
    const siblingsEnd = Math.min(
      Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
      endPages.length > 0 ? endPages[0] - 2 : pageCount - 1,
    );

    return [
      ...startPages,
      siblingsStart > boundaryCount + 2 ? DOTS : boundaryCount + 1,
      ...range(siblingsStart, siblingsEnd),
      siblingsEnd < pageCount - boundaryCount - 1 ? DOTS : pageCount - boundaryCount,
      ...endPages,
    ];
  }, [page, pageCount, siblingCount, boundaryCount]);
}

const itemBase =
  "zen-inline-flex zen-h-9 zen-min-w-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-px-2 zen-text-sm zen-transition-colors focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 disabled:zen-pointer-events-none disabled:zen-opacity-50";

export interface PaginationProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
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

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      page,
      pageCount,
      onPageChange,
      siblingCount = 1,
      boundaryCount = 1,
      hidePrevNext = false,
      className,
      ...props
    },
    ref,
  ) => {
    const items = usePaginationRange({ page, pageCount, siblingCount, boundaryCount });
    const go = (p: number) => {
      const next = Math.min(Math.max(p, 1), pageCount);
      if (next !== page) onPageChange(next);
    };

    if (pageCount <= 1) return null;

    return (
      <nav
        ref={ref}
        aria-label="pagination"
        className={cn("zen-flex zen-items-center zen-gap-1", className)}
        {...props}
      >
        {!hidePrevNext && (
          <button
            type="button"
            className={cn(itemBase, "hover:zen-bg-zen-muted")}
            onClick={() => go(page - 1)}
            disabled={page <= 1}
            aria-label="Go to previous page"
          >
            &#8249;
          </button>
        )}
        {items.map((item, i) =>
          item === DOTS ? (
            <span
              key={`dots-${i}`}
              aria-hidden="true"
              className="zen-inline-flex zen-h-9 zen-min-w-9 zen-items-center zen-justify-center zen-px-1 zen-text-zen-muted-fg"
            >
              &#8230;
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? "page" : undefined}
              className={cn(
                itemBase,
                item === page
                  ? "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg"
                  : "hover:zen-bg-zen-muted",
              )}
              onClick={() => go(item)}
            >
              {item}
            </button>
          ),
        )}
        {!hidePrevNext && (
          <button
            type="button"
            className={cn(itemBase, "hover:zen-bg-zen-muted")}
            onClick={() => go(page + 1)}
            disabled={page >= pageCount}
            aria-label="Go to next page"
          >
            &#8250;
          </button>
        )}
      </nav>
    );
  },
);
Pagination.displayName = "Pagination";

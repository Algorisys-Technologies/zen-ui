import { For, Show, type Accessor, type JSX, createMemo, splitProps } from "solid-js";
import { cn } from "../../lib/cn";

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

const DOTS = "dots" as const;

/**
 * Either a plain value or a zero-arg accessor. The React binding takes plain
 * numbers; Solid needs a way to stay reactive without a re-render, so both
 * forms are accepted and `access()` normalises them.
 */
export type MaybeAccessor<T> = T | Accessor<T>;

const access = <T,>(v: MaybeAccessor<T>): T =>
  typeof v === "function" ? (v as Accessor<T>)() : v;

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
export function usePaginationRange(
  options: UsePaginationRangeOptions,
): Accessor<Array<number | typeof DOTS>> {
  return createMemo(() => {
    const page = access(options.page);
    const pageCount = access(options.pageCount);
    const siblingCount = access(options.siblingCount) ?? 1;
    const boundaryCount = access(options.boundaryCount) ?? 1;

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
  });
}

const itemBase =
  "zen-inline-flex zen-h-9 zen-min-w-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-px-2 zen-text-sm zen-transition-colors focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 disabled:zen-pointer-events-none disabled:zen-opacity-50";

export interface PaginationProps
  extends Omit<JSX.HTMLAttributes<HTMLElement>, "onChange" | "class"> {
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

export const Pagination = (props: PaginationProps) => {
  const [local, rest] = splitProps(props, [
    "page",
    "pageCount",
    "onPageChange",
    "siblingCount",
    "boundaryCount",
    "hidePrevNext",
    "class",
  ]);

  const items = usePaginationRange({
    page: () => local.page,
    pageCount: () => local.pageCount,
    siblingCount: () => local.siblingCount,
    boundaryCount: () => local.boundaryCount,
  });

  const go = (p: number) => {
    const next = Math.min(Math.max(p, 1), local.pageCount);
    if (next !== local.page) local.onPageChange(next);
  };

  return (
    <Show when={local.pageCount > 1}>
      <nav
        aria-label="pagination"
        class={cn("zen-flex zen-items-center zen-gap-1", local.class)}
        {...rest}
      >
        <Show when={!local.hidePrevNext}>
          <button
            type="button"
            class={cn(itemBase, "hover:zen-bg-zen-muted")}
            onClick={() => go(local.page - 1)}
            disabled={local.page <= 1}
            aria-label="Go to previous page"
          >
            {"‹"}
          </button>
        </Show>
        <For each={items()}>
          {(item) => (
            <Show
              when={item !== DOTS}
              fallback={
                <span
                  aria-hidden="true"
                  class="zen-inline-flex zen-h-9 zen-min-w-9 zen-items-center zen-justify-center zen-px-1 zen-text-zen-muted-fg"
                >
                  {"…"}
                </span>
              }
            >
              <button
                type="button"
                aria-current={item === local.page ? "page" : undefined}
                class={cn(
                  itemBase,
                  item === local.page
                    ? "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg"
                    : "hover:zen-bg-zen-muted",
                )}
                onClick={() => go(item as number)}
              >
                {item}
              </button>
            </Show>
          )}
        </For>
        <Show when={!local.hidePrevNext}>
          <button
            type="button"
            class={cn(itemBase, "hover:zen-bg-zen-muted")}
            onClick={() => go(local.page + 1)}
            disabled={local.page >= local.pageCount}
            aria-label="Go to next page"
          >
            {"›"}
          </button>
        </Show>
      </nav>
    </Show>
  );
};

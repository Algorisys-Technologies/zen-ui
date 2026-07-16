import { cn } from "../../lib/cn";
import { applyProps, type BaseProps, type ZenComponent } from "../../lib/component";

/**
 * Pagination — standalone, controlled page navigator. zen-ui's DataTable has
 * its own built-in pager; this is the primitive for the many places that
 * paginate without a DataTable (lists, cards, server-driven feeds).
 *
 *   const pager = Pagination({ page, pageCount: total, onPageChange: setPage });
 *   document.querySelector("#feed-foot").append(pager.el);
 *
 * Renders Prev / numbered pages (with ellipses) / Next. Fully controlled:
 * `page` is 1-based, and every click calls `onPageChange` — the caller re-applies
 * the new page via `pager.update({ page })`. Use `paginationRange()` directly if
 * you want to render your own markup.
 */

const DOTS = "dots" as const;

/**
 * Build the list of page numbers + ellipsis markers to render.
 *
 * The React binding exposes this as the `usePaginationRange` hook; with no render
 * loop there is nothing to memoise, so it is a plain function. Same algorithm,
 * same output.
 */
export function paginationRange({
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
}

const itemBase =
  "zen-inline-flex zen-h-9 zen-min-w-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-px-2 zen-text-sm zen-transition-colors focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 disabled:zen-pointer-events-none disabled:zen-opacity-50";

export interface PaginationProps extends BaseProps {
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

const OWN = new Set([
  "page",
  "pageCount",
  "onPageChange",
  "siblingCount",
  "boundaryCount",
  "hidePrevNext",
  "class",
  "children",
  "style",
]);

export function Pagination(props: PaginationProps): ZenComponent<PaginationProps> {
  let current = { ...props };
  const el = document.createElement("nav");
  el.setAttribute("aria-label", "pagination");
  let removeRest: (() => void) | undefined;

  const render = () => {
    const {
      page,
      pageCount,
      onPageChange,
      siblingCount = 1,
      boundaryCount = 1,
      hidePrevNext = false,
      class: className,
    } = current;

    el.className = cn("zen-flex zen-items-center zen-gap-1", className);

    // React returns null below pageCount <= 1 (no nav at all). Vanilla always owns
    // a node — the caller is holding it — so the equivalent is an empty nav that
    // renders nothing visible.
    if (pageCount <= 1) {
      el.replaceChildren();
      applyRest();
      return;
    }

    const go = (p: number) => {
      const next = Math.min(Math.max(p, 1), pageCount);
      if (next !== page) onPageChange(next);
    };

    const nodes: Node[] = [];

    if (!hidePrevNext) {
      nodes.push(
        arrowButton({
          label: "Go to previous page",
          glyph: "‹",
          disabled: page <= 1,
          onClick: () => go(page - 1),
        }),
      );
    }

    const items = paginationRange({ page, pageCount, siblingCount, boundaryCount });
    for (const item of items) {
      if (item === DOTS) {
        const span = document.createElement("span");
        span.setAttribute("aria-hidden", "true");
        span.className =
          "zen-inline-flex zen-h-9 zen-min-w-9 zen-items-center zen-justify-center zen-px-1 zen-text-zen-muted-fg";
        span.textContent = "…";
        nodes.push(span);
      } else {
        const btn = document.createElement("button");
        btn.type = "button";
        if (item === page) btn.setAttribute("aria-current", "page");
        btn.className = cn(
          itemBase,
          item === page
            ? "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg"
            : "hover:zen-bg-zen-muted",
        );
        btn.textContent = String(item);
        btn.addEventListener("click", () => go(item));
        nodes.push(btn);
      }
    }

    if (!hidePrevNext) {
      nodes.push(
        arrowButton({
          label: "Go to next page",
          glyph: "›",
          disabled: page >= pageCount,
          onClick: () => go(page + 1),
        }),
      );
    }

    el.replaceChildren(...nodes);
    applyRest();
  };

  const arrowButton = (spec: {
    label: string;
    glyph: string;
    disabled: boolean;
    onClick: () => void;
  }): HTMLButtonElement => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = cn(itemBase, "hover:zen-bg-zen-muted");
    btn.setAttribute("aria-label", spec.label);
    btn.textContent = spec.glyph;
    btn.disabled = spec.disabled;
    btn.addEventListener("click", spec.onClick);
    return btn;
  };

  const applyRest = () => {
    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(current)) {
      if (!OWN.has(k)) rest[k] = v;
    }
    if (current.style) rest.style = current.style;
    removeRest?.();
    removeRest = applyProps(el, rest);
  };

  render();

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      removeRest?.();
      el.remove();
    },
  };
}

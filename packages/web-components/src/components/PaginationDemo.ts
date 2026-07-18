import { DemoPage } from "./demo-helpers";

/**
 * Pagination demo — the web-components port. <zen-pagination> is fully controlled:
 * every click fires `zen-page-change` with the next 1-based page, and the caller
 * re-applies it via `el.page = next` (which reflects to the attribute -> update).
 */

interface PagerOpts {
  page: number;
  pageCount: number;
  siblingCount?: number;
  boundaryCount?: number;
  hidePrevNext?: boolean;
}

function pager(opts: PagerOpts): HTMLElement {
  const p = document.createElement("zen-pagination");
  p.setAttribute("page", String(opts.page));
  p.setAttribute("page-count", String(opts.pageCount));
  if (opts.siblingCount != null) p.setAttribute("sibling-count", String(opts.siblingCount));
  if (opts.boundaryCount != null) p.setAttribute("boundary-count", String(opts.boundaryCount));
  if (opts.hidePrevNext) p.setAttribute("hide-prev-next", "");
  p.addEventListener("zen-page-change", (e) => {
    (p as unknown as { page: number }).page = (e as CustomEvent).detail as number;
  });
  return p;
}

export default function PaginationDemo(): HTMLElement {
  return DemoPage({
    title: "Pagination",
    description:
      "Standalone, controlled page navigator for lists / cards / server-driven feeds (zen-ui's DataTable has its own built-in pager). Renders Prev / numbered pages with ellipses / Next. page is 1-based.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "page of 10",
        code: `<zen-pagination page="1" page-count="10"></zen-pagination>

const pager = document.querySelector("zen-pagination");
pager.addEventListener("zen-page-change", (e) => {
  pager.page = e.detail;   // re-apply the 1-based page
});`,
        render: () => pager({ page: 1, pageCount: 10 }),
      },
      {
        title: "2. Many pages (ellipsis on both sides)",
        codeTitle: "page of 50",
        code: `<zen-pagination page="6" page-count="50"></zen-pagination>`,
        render: () => pager({ page: 6, pageCount: 50 }),
      },
      {
        title: "3. Wider sibling/boundary window",
        codeTitle: "sibling-count + boundary-count control how many numbers show",
        code: `<zen-pagination
  page="6"
  page-count="50"
  sibling-count="2"
  boundary-count="2"
></zen-pagination>`,
        render: () => pager({ page: 6, pageCount: 50, siblingCount: 2, boundaryCount: 2 }),
      },
      {
        title: "4. Numbers only (no Prev / Next)",
        codeTitle: "hide-prev-next",
        code: `<zen-pagination page="1" page-count="8" hide-prev-next></zen-pagination>`,
        render: () => pager({ page: 1, pageCount: 8, hidePrevNext: true }),
      },
    ],
  });
}

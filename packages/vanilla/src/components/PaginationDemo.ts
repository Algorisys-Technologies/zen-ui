import { Pagination } from "./pagination/pagination";
import { DemoPage } from "./demo-helpers";

/**
 * Pagination demo — mirrors packages/react/src/components/NewPaginationDemo.tsx:
 * same four sections, same snippets. React drove `page` through useState; vanilla
 * is controlled the same way, so each pager wires onPageChange back to its own
 * update() — the DOM write a framework would have re-rendered.
 */

export default function PaginationDemo(): HTMLElement {
  return DemoPage({
    title: "Pagination",
    description:
      "Standalone, controlled page navigator for lists / cards / server-driven feeds (zen-ui's DataTable has its own built-in pager). Renders Prev / numbered pages with ellipses / Next. page is 1-based.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "page of 10",
        code: `let page = 1;
const pager = Pagination({
  page,
  pageCount: 10,
  onPageChange: (p) => {
    page = p;
    pager.update({ page });   // no re-render — a targeted DOM write
  },
});
document.body.append(pager.el);`,
        render: () => {
          let page = 1;
          const pager = Pagination({
            page,
            pageCount: 10,
            onPageChange: (p) => {
              page = p;
              pager.update({ page });
            },
          });
          return pager.el;
        },
      },
      {
        title: "2. Many pages (ellipsis on both sides)",
        codeTitle: "page of 50",
        code: `let page = 6;
const pager = Pagination({
  page,
  pageCount: 50,
  onPageChange: (p) => pager.update({ page: (page = p) }),
});`,
        render: () => {
          let page = 6;
          const pager = Pagination({
            page,
            pageCount: 50,
            onPageChange: (p) => pager.update({ page: (page = p) }),
          });
          return pager.el;
        },
      },
      {
        title: "3. Wider sibling/boundary window",
        codeTitle: "siblingCount + boundaryCount control how many numbers show",
        code: `Pagination({
  page: 6,
  pageCount: 50,
  onPageChange: setPage,
  siblingCount: 2,
  boundaryCount: 2,
});`,
        render: () => {
          let page = 6;
          const pager = Pagination({
            page,
            pageCount: 50,
            siblingCount: 2,
            boundaryCount: 2,
            onPageChange: (p) => pager.update({ page: (page = p) }),
          });
          return pager.el;
        },
      },
      {
        title: "4. Numbers only (no Prev / Next)",
        codeTitle: "hidePrevNext",
        code: `Pagination({ page, pageCount: 8, onPageChange: setPage, hidePrevNext: true });`,
        render: () => {
          let page = 1;
          const pager = Pagination({
            page,
            pageCount: 8,
            hidePrevNext: true,
            onPageChange: (p) => pager.update({ page: (page = p) }),
          });
          return pager.el;
        },
      },
    ],
  });
}

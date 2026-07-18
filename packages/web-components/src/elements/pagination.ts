import { Pagination, type PaginationProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-pagination page="3" page-count="20"></zen-pagination>
// Fully controlled: `page`/`page-count` are numeric attrs, and every click fires
// `zen-page-change` with the next 1-based page; the caller re-applies it via
// `el.page = next`. Renders its own markup, so no light-DOM slot.
// (`paginationRange` is a helper function, not a component — not registered.)
defineZenElement<PaginationProps>({
  tag: "zen-pagination",
  factory: Pagination,
  attrs: {
    page: "number",
    "page-count": "number",
    "sibling-count": "number",
    "boundary-count": "number",
    "hide-prev-next": "boolean",
  },
  events: { onPageChange: "zen-page-change" },
  childrenProp: false,
});

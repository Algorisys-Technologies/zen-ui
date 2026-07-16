import {
  DynamicPage,
  DynamicPageTitle,
  DynamicPageHeader,
  DynamicPageFooter,
} from "./dynamic-page/dynamic-page";
import { Button } from "./button/button";
import { Badge } from "./badge/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb/breadcrumb";
import { DemoPage } from "./demo-helpers";
import { toNodes, type Child } from "../lib/component";

/**
 * Mirrors packages/react/src/components/NewDynamicPageDemo.tsx — the same five
 * sections, in the vanilla factory idiom. Every section gives the page an explicit
 * HEIGHT, because a page free to grow to its content never scrolls and so never
 * snaps — and this demo shell's own scroller would happily let it grow forever.
 */

const el = (tag: string, className: string, children?: Child): HTMLElement => {
  const node = document.createElement(tag);
  node.className = className;
  if (children !== undefined) node.append(...toNodes(children));
  return node;
};

const Fact = (label: string, value: string): HTMLElement =>
  el("div", "zen-min-w-0", [
    el("div", "zen-text-xs zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", label),
    el("div", "zen-truncate zen-text-sm zen-font-medium", value),
  ]);

const HeaderFacts = (): HTMLElement =>
  el("div", "zen-grid zen-grid-cols-2 zen-gap-3 sm:zen-grid-cols-4", [
    Fact("Customer", "Acme Corporation"),
    Fact("Delivery", "14 Aug 2026"),
    Fact("Net value", "€ 48,200.00"),
    Fact("Incoterms", "DAP Hamburg"),
  ]);

const Rows = (count = 24): HTMLElement => {
  const wrap = el("div", "zen-flex zen-flex-col zen-gap-2 zen-p-4");
  for (let i = 0; i < count; i++) {
    wrap.append(
      el(
        "div",
        "zen-flex zen-items-center zen-justify-between zen-rounded-zen-md zen-border zen-border-zen-border zen-px-3 zen-py-2 zen-text-sm",
        [
          el("span", "", `Line item ${String(i + 1).padStart(2, "0")}`),
          el("span", "zen-text-zen-muted-fg", `€ ${(120 + i * 37).toLocaleString()}.00`),
        ],
      ),
    );
  }
  return wrap;
};

const FRAME =
  "zen-h-[420px] zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border";

export default function DynamicPageDemo(): HTMLElement {
  return DemoPage({
    title: "DynamicPage",
    description:
      "A page whose header snaps — collapses — as the content scrolls, leaving the title bar sticky behind it, plus an optional floating footer. This is the frame under the List Report and Object Page. Snapping is driven by the page's own scroll container, never by window, so it works inside any container — including this demo shell, where the document itself does not scroll at all.",
    sections: [
      {
        title: "1. Snapping — scroll the content",
        codeTitle: "The header collapses; the title stays",
        codeDescription:
          "Scroll inside the page. The header content snaps away and the title bar remains fixed at the top. Scroll back to the very top and it expands again.",
        code: `DynamicPage({
  class: "zen-h-[420px] zen-rounded-zen-md zen-border zen-border-zen-border",
  children: [
    DynamicPageTitle({
      heading: "Order 4711",
      subheading: "Acme Corporation",
      actions: Button({ size: "sm", variant: "solid", color: "primary", children: "Save" }),
    }),
    DynamicPageHeader({ "aria-label": "Order details", children: HeaderFacts() }),
    Rows(),
  ],
})`,
        render: () =>
          DynamicPage({
            class: FRAME,
            children: [
              DynamicPageTitle({
                heading: "Order 4711",
                subheading: "Acme Corporation",
                actions: Button({ type: "button", size: "sm", variant: "solid", color: "primary", children: "Save" }),
              }),
              DynamicPageHeader({ "aria-label": "Order details", children: HeaderFacts() }),
              Rows(),
            ],
          }).el,
      },
      {
        title: "2. Pinning holds the header open",
        codeTitle: "headerPinnable (default true)",
        codeDescription:
          "Press the pin in the header's trailing edge, then scroll: the header stays expanded and rides along under the title instead of snapping away. Press it again to release.",
        code: `DynamicPage({
  headerPinnable: true,
  class: "zen-h-[420px]",
  children: [
    DynamicPageTitle({ heading: "Order 4711", subheading: "Pin me, then scroll" }),
    DynamicPageHeader({ "aria-label": "Order details", children: HeaderFacts() }),
    Rows(),
  ],
})`,
        render: () =>
          DynamicPage({
            class: FRAME,
            children: [
              DynamicPageTitle({ heading: "Order 4711", subheading: "Pin me, then scroll" }),
              DynamicPageHeader({ "aria-label": "Order details (pinnable)", children: HeaderFacts() }),
              Rows(),
            ],
          }).el,
      },
      {
        title: "3. Different title content when snapped",
        codeTitle: "expandedContent / snappedContent",
        codeDescription:
          "The page shows different title content once the header is gone — the facts you would otherwise lose. Scroll to swap the two.",
        code: `DynamicPageTitle({
  heading: "Order 4711",
  breadcrumbs: Breadcrumb({ children: BreadcrumbList({ children: [ ... ] }) }),
  expandedContent: el("p", "…", "Created 2 Aug 2026 by R. Pillai"),
  snappedContent: Badge({ variant: "soft", color: "success", children: "€ 48,200.00 · Confirmed" }),
})`,
        render: () =>
          DynamicPage({
            class: FRAME,
            children: [
              DynamicPageTitle({
                heading: "Order 4711",
                breadcrumbs: Breadcrumb({
                  children: BreadcrumbList({
                    children: [
                      BreadcrumbItem({ children: BreadcrumbLink({ href: "#", children: "Sales" }) }),
                      BreadcrumbSeparator(),
                      BreadcrumbItem({ children: BreadcrumbLink({ href: "#", children: "Orders" }) }),
                      BreadcrumbSeparator(),
                      BreadcrumbItem({ children: BreadcrumbPage({ children: "4711" }) }),
                    ],
                  }),
                }),
                expandedContent: el(
                  "p",
                  "zen-m-0 zen-px-1 zen-text-sm zen-text-zen-muted-fg",
                  "Created 2 Aug 2026 by R. Pillai",
                ),
                snappedContent: el("div", "zen-px-1 zen-pt-1", [
                  Badge({ variant: "soft", color: "success", children: "€ 48,200.00 · Confirmed" }).el,
                ]),
              }),
              DynamicPageHeader({ "aria-label": "Order details (snapped content)", children: HeaderFacts() }),
              Rows(),
            ],
          }).el,
      },
      {
        title: "4. Floating footer",
        codeTitle: "DynamicPageFooter + showFooter",
        codeDescription:
          "The footer floats above the scrolling content and stays put. showFooter toggles it without removing the page.",
        code: `DynamicPage({
  showFooter: true,
  class: "zen-h-[420px]",
  children: [
    DynamicPageTitle({ heading: "Order 4711" }),
    DynamicPageHeader({ "aria-label": "Order details", children: HeaderFacts() }),
    Rows(),
    DynamicPageFooter({
      children: [
        Button({ size: "sm", variant: "ghost", children: "Cancel" }),
        Button({ size: "sm", variant: "solid", color: "primary", children: "Submit" }),
      ],
    }),
  ],
})`,
        render: () =>
          DynamicPage({
            class: FRAME,
            children: [
              DynamicPageTitle({ heading: "Order 4711", subheading: "With a floating footer" }),
              DynamicPageHeader({ "aria-label": "Order details (footer)", children: HeaderFacts() }),
              Rows(),
              DynamicPageFooter({
                children: [
                  Button({ type: "button", size: "sm", variant: "ghost", children: "Cancel" }).el,
                  Button({ type: "button", size: "sm", variant: "solid", color: "primary", children: "Submit" }).el,
                ],
              }),
            ],
          }).el,
      },
      {
        title: "5. Controlled",
        codeTitle: "headerExpanded + onHeaderExpandedChange",
        codeDescription:
          "Drive the header from outside. Scrolling and clicking the title still report through onHeaderExpandedChange — the page never owns the state.",
        code: `let expanded = true;
const page = DynamicPage({
  headerExpanded: expanded,
  headerPinnable: false,
  onHeaderExpandedChange: (v) => { expanded = v; page.update({ headerExpanded: v }); },
  class: "zen-h-[420px]",
  children: [ ... ],
});`,
        render: () => {
          const wrap = el("div", "zen-flex zen-w-full zen-flex-col zen-gap-2");
          const bar = el("div", "zen-flex zen-items-center zen-gap-2");
          const readout = el("span", "zen-text-xs zen-text-zen-muted-fg", "headerExpanded = true");

          let expanded = true;
          const toggle = Button({
            type: "button",
            size: "sm",
            variant: "outline",
            children: "Collapse header",
          });

          const sync = () => {
            toggle.update({ children: expanded ? "Collapse header" : "Expand header" });
            readout.textContent = `headerExpanded = ${String(expanded)}`;
          };

          const page = DynamicPage({
            headerExpanded: expanded,
            headerPinnable: false,
            onHeaderExpandedChange: (v) => {
              expanded = v;
              page.update({ headerExpanded: v });
              sync();
            },
            class: FRAME,
            children: [
              DynamicPageTitle({ heading: "Order 4711", subheading: "Controlled header" }),
              DynamicPageHeader({ "aria-label": "Order details (controlled)", children: HeaderFacts() }),
              Rows(),
            ],
          });

          toggle.el.addEventListener("click", () => {
            expanded = !expanded;
            page.update({ headerExpanded: expanded });
            sync();
          });

          bar.append(toggle.el, readout);
          wrap.append(bar, page.el);
          return wrap;
        },
      },
    ],
  });
}

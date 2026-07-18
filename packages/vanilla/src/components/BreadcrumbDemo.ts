import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb/breadcrumb";
import { DemoPage } from "./demo-helpers";

export default function BreadcrumbDemo(): HTMLElement {
  return DemoPage({
    title: "Breadcrumb",
    description:
      "Navigation trail. Accessible compound built on semantic <nav>/<ol>/<li>, themed via --zen-* tokens. BreadcrumbLink takes `as` so it can render a router's own anchor.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "Trail ending on the current page",
        code: `Breadcrumb({ children:
  BreadcrumbList({ children: [
    BreadcrumbItem({ children: BreadcrumbLink({ href: "/", children: "Home" }) }),
    BreadcrumbSeparator(),
    BreadcrumbItem({ children: BreadcrumbLink({ href: "/settings", children: "Settings" }) }),
    BreadcrumbSeparator(),
    BreadcrumbItem({ children: BreadcrumbPage({ children: "Profile" }) }),
  ]}),
})`,
        render: () =>
          Breadcrumb({
            children: BreadcrumbList({
              children: [
                BreadcrumbItem({ children: BreadcrumbLink({ href: "/", children: "Home" }) }),
                BreadcrumbSeparator(),
                BreadcrumbItem({
                  children: BreadcrumbLink({ href: "/settings", children: "Settings" }),
                }),
                BreadcrumbSeparator(),
                BreadcrumbItem({ children: BreadcrumbPage({ children: "Profile" }) }),
              ],
            }),
          }).el,
      },
      {
        title: "2. Collapsed with ellipsis",
        codeTitle: "Use BreadcrumbEllipsis for long trails",
        code: `BreadcrumbItem({ children: BreadcrumbEllipsis() })`,
        render: () =>
          Breadcrumb({
            children: BreadcrumbList({
              children: [
                BreadcrumbItem({ children: BreadcrumbLink({ href: "/", children: "Home" }) }),
                BreadcrumbSeparator(),
                BreadcrumbItem({ children: BreadcrumbEllipsis() }),
                BreadcrumbSeparator(),
                BreadcrumbItem({ children: BreadcrumbPage({ children: "Final page" }) }),
              ],
            }),
          }).el,
      },
      {
        title: "3. Custom separator",
        codeTitle: "Pass children to BreadcrumbSeparator",
        code: `BreadcrumbSeparator({ children: "›" })`,
        render: () =>
          Breadcrumb({
            children: BreadcrumbList({
              children: [
                BreadcrumbItem({
                  children: BreadcrumbLink({ href: "/", children: "Dashboard" }),
                }),
                BreadcrumbSeparator({ children: "›" }),
                BreadcrumbItem({ children: BreadcrumbPage({ children: "Reports" }) }),
              ],
            }),
          }).el,
      },
    ],
  });
}

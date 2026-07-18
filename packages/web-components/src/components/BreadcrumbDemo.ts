import { DemoPage } from "./demo-helpers";

/**
 * Breadcrumb demo — the web-components port. A compound of <zen-breadcrumb> >
 * <zen-breadcrumb-list> > <zen-breadcrumb-item>, each item wrapping a
 * <zen-breadcrumb-link href> or a <zen-breadcrumb-page> (the current page).
 * <zen-breadcrumb-separator> renders a default chevron, or a custom glyph passed
 * as its text child. <zen-breadcrumb-ellipsis> collapses a long trail.
 */

function el(tag: string, attrs: Record<string, string> = {}, kids?: Node | Node[] | string): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (kids != null) {
    if (typeof kids === "string") n.textContent = kids;
    else if (Array.isArray(kids)) n.append(...kids);
    else n.append(kids);
  }
  return n;
}

const item = (child: Node): HTMLElement => el("zen-breadcrumb-item", {}, child);

export default function BreadcrumbDemo(): HTMLElement {
  return DemoPage({
    title: "Breadcrumb",
    description:
      "Navigation trail. Accessible compound built on semantic <nav>/<ol>/<li>, themed via --zen-* tokens. BreadcrumbLink takes `as` so it can render a router's own anchor.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "Trail ending on the current page",
        code: `<zen-breadcrumb>
  <zen-breadcrumb-list>
    <zen-breadcrumb-item><zen-breadcrumb-link href="/">Home</zen-breadcrumb-link></zen-breadcrumb-item>
    <zen-breadcrumb-separator></zen-breadcrumb-separator>
    <zen-breadcrumb-item><zen-breadcrumb-link href="/settings">Settings</zen-breadcrumb-link></zen-breadcrumb-item>
    <zen-breadcrumb-separator></zen-breadcrumb-separator>
    <zen-breadcrumb-item><zen-breadcrumb-page>Profile</zen-breadcrumb-page></zen-breadcrumb-item>
  </zen-breadcrumb-list>
</zen-breadcrumb>`,
        render: () =>
          el("zen-breadcrumb", {}, el("zen-breadcrumb-list", {}, [
            item(el("zen-breadcrumb-link", { href: "/" }, "Home")),
            el("zen-breadcrumb-separator"),
            item(el("zen-breadcrumb-link", { href: "/settings" }, "Settings")),
            el("zen-breadcrumb-separator"),
            item(el("zen-breadcrumb-page", {}, "Profile")),
          ])),
      },
      {
        title: "2. Collapsed with ellipsis",
        codeTitle: "Use zen-breadcrumb-ellipsis for long trails",
        code: `<zen-breadcrumb-item><zen-breadcrumb-ellipsis></zen-breadcrumb-ellipsis></zen-breadcrumb-item>`,
        render: () =>
          el("zen-breadcrumb", {}, el("zen-breadcrumb-list", {}, [
            item(el("zen-breadcrumb-link", { href: "/" }, "Home")),
            el("zen-breadcrumb-separator"),
            item(el("zen-breadcrumb-ellipsis")),
            el("zen-breadcrumb-separator"),
            item(el("zen-breadcrumb-page", {}, "Final page")),
          ])),
      },
      {
        title: "3. Custom separator",
        codeTitle: "Pass a glyph as the separator's text",
        code: `<zen-breadcrumb-separator>›</zen-breadcrumb-separator>`,
        render: () =>
          el("zen-breadcrumb", {}, el("zen-breadcrumb-list", {}, [
            item(el("zen-breadcrumb-link", { href: "/" }, "Dashboard")),
            el("zen-breadcrumb-separator", {}, "›"),
            item(el("zen-breadcrumb-page", {}, "Reports")),
          ])),
      },
    ],
  });
}

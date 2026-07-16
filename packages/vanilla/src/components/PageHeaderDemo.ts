import { PageHeader } from "./page-header/page-header";
import { Button } from "./button/button";
import { Badge } from "./badge/badge";
import { DemoPage } from "./demo-helpers";

/**
 * PageHeader demo. Every section drives real state where there is state to
 * drive — onBack is the whole point of the component, so it reports.
 *
 * Vanilla has no Breadcrumb component yet, so section 3 builds a small inline
 * breadcrumb with the same class strings the React binding's Breadcrumb emits —
 * the point of the section is that `breadcrumb` is a slot taking any node.
 */

/** A minimal breadcrumb node, styled with the React Breadcrumb's own classes. */
function breadcrumbNode(): HTMLElement {
  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "breadcrumb");
  const ol = document.createElement("ol");
  ol.className =
    "zen-flex zen-flex-wrap zen-items-center zen-gap-1.5 zen-break-words zen-text-sm zen-text-zen-muted-fg sm:zen-gap-2.5";

  const li1 = document.createElement("li");
  li1.className = "zen-inline-flex zen-items-center zen-gap-1.5";
  const a = document.createElement("a");
  a.href = "#";
  a.className =
    "zen-rounded-zen-sm zen-transition-colors hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2";
  a.textContent = "Surveys";
  li1.append(a);

  const sep = document.createElement("li");
  sep.setAttribute("role", "presentation");
  sep.setAttribute("aria-hidden", "true");
  sep.className = "[&>svg]:zen-size-3.5 zen-text-zen-muted-fg";
  sep.textContent = "/";

  const li2 = document.createElement("li");
  li2.className = "zen-inline-flex zen-items-center zen-gap-1.5";
  const page = document.createElement("span");
  page.setAttribute("aria-current", "page");
  page.className = "zen-font-medium zen-text-zen-foreground";
  page.textContent = "Onboarding survey";
  li2.append(page);

  ol.append(li1, sep, li2);
  nav.append(ol);
  return nav;
}

export default function PageHeaderDemo(): HTMLElement {
  return DemoPage({
    title: "PageHeader",
    description:
      "A heading with a back affordance and one action. DynamicPage and ObjectPageLayout already exist, but they are app-frame weight — snapping headers, pinnable title bars, anchored sections. Most screens want none of that and just need a title, somewhere to go back to, and a button on the right. Everything except title is optional and renders nothing when absent.",
    sections: [
      {
        title: "1. Just a title",
        codeTitle: "The plain case stays plain",
        codeDescription:
          "No back button, no actions, no wrapper. The title renders as an h2 — the h1 belongs to the application shell, and a page-level component that claims it fights the app it is dropped into.",
        code: `PageHeader({ title: "Settings" })`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(PageHeader({ title: "Settings" }).el);
          return wrap;
        },
      },
      {
        title: "2. Back, subtitle and actions",
        codeTitle: "The shape most screens want",
        codeDescription:
          "onBack renders the back control and is the only way it appears. It is icon-only, so backLabel is its accessible name.",
        code: `PageHeader({
  title: "Assessment results",
  subtitle: "32 responses · last updated 2 hours ago",
  onBack: () => history.back(),
  actions: [
    Button({ variant: "outline", color: "neutral", size: "sm", children: "Share" }),
    Button({ size: "sm", children: "Export" }),
  ],
})`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "12px";
          wrap.style.width = "100%";

          const report = document.createElement("p");
          report.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
          const setWent = (v: string) => {
            report.textContent = "";
            report.append(document.createTextNode("onBack → "));
            const code = document.createElement("code");
            code.textContent = v;
            report.append(code);
          };
          setWent("—");

          const header = PageHeader({
            title: "Assessment results",
            subtitle: "32 responses · last updated 2 hours ago",
            onBack: () => setWent("history.back()"),
            actions: [
              Button({ variant: "outline", color: "neutral", size: "sm", children: "Share" }),
              Button({ size: "sm", children: "Export" }),
            ],
          });

          wrap.append(header.el, report);
          return wrap;
        },
      },
      {
        title: "3. Breadcrumb and info",
        codeTitle: "Slots, not props",
        codeDescription:
          "breadcrumb sits above the title and info beside it. Both take any node, so the header does not need to know what a Breadcrumb is.",
        code: `PageHeader({
  breadcrumb: breadcrumbNode(),
  title: "Onboarding survey",
  info: Badge({ variant: "soft", children: "Draft" }),
  subtitle: "11 questions",
  actions: Button({ size: "sm", children: "Publish" }),
})`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(
            PageHeader({
              breadcrumb: breadcrumbNode(),
              title: "Onboarding survey",
              info: Badge({ variant: "soft", children: "Draft" }),
              subtitle: "11 questions",
              actions: Button({ size: "sm", children: "Publish" }),
            }).el,
          );
          return wrap;
        },
      },
      {
        title: "4. A long title truncates",
        codeTitle: "The title yields, the actions do not",
        codeDescription:
          "A title long enough to collide with the actions truncates rather than shoving them off the right edge. Narrow the window to watch it give way.",
        code: `PageHeader({
  title: "A page title long enough that it has nowhere left to go",
  onBack: () => history.back(),
  actions: Button({ size: "sm", children: "Save" }),
})`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "420px";
          wrap.append(
            PageHeader({
              title: "A page title long enough that it has nowhere left to go",
              subtitle: "The subtitle wraps instead — it has room to",
              onBack: () => {},
              actions: Button({ size: "sm", children: "Save" }),
            }).el,
          );
          return wrap;
        },
      },
    ],
  });
}

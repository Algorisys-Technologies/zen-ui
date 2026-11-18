import { DemoPage } from "./demo-helpers";

/**
 * PageHeader demo — the web-components port. `title` / `subtitle` / `actions` /
 * `info` / `breadcrumb` are JS properties (Child slots); `back-label` is an
 * attribute; the back affordance fires the `zen-back` event.
 *
 * NOTE: the custom element always wires its declared events, so `onBack` is
 * always a function and the back control always renders — unlike the vanilla
 * factory, which hides it when onBack is omitted. Sections 1 and 3 therefore show
 * a back button they would not have in the imperative API.
 */

/** A minimal breadcrumb node, styled with the Breadcrumb's own classes. */
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

function button(attrs: Record<string, string>, text: string): HTMLElement {
  const b = document.createElement("zen-button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.textContent = text;
  return b;
}

interface HeaderOpts {
  title: string;
  subtitle?: string;
  actions?: Node | Node[];
  info?: Node;
  breadcrumb?: Node;
  backLabel?: string;
  onBack?: () => void;
}

function pageHeader(opts: HeaderOpts): HTMLElement {
  const h = document.createElement("zen-page-header");
  if (opts.backLabel) h.setAttribute("back-label", opts.backLabel);
  const set = h as unknown as Record<string, unknown>;
  set.title = opts.title;
  if (opts.subtitle) set.subtitle = opts.subtitle;
  if (opts.actions) set.actions = opts.actions;
  if (opts.info) set.info = opts.info;
  if (opts.breadcrumb) set.breadcrumb = opts.breadcrumb;
  if (opts.onBack) h.addEventListener("zen-back", opts.onBack);
  return h;
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
        code: `const h = document.createElement("zen-page-header");
h.title = "Settings";`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(pageHeader({ title: "Settings" }));
          return wrap;
        },
      },
      {
        title: "2. Back, subtitle and actions",
        codeTitle: "The shape most screens want",
        codeDescription:
          "zen-back is the back control's event. It is icon-only, so back-label is its accessible name.",
        code: `const h = document.createElement("zen-page-header");
h.title = "Assessment results";
h.subtitle = "32 responses · last updated 2 hours ago";
h.actions = [shareButton, exportButton];
h.addEventListener("zen-back", () => history.back());`,
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
            report.append(document.createTextNode("zen-back → "));
            const code = document.createElement("code");
            code.textContent = v;
            report.append(code);
          };
          setWent("—");

          const header = pageHeader({
            title: "Assessment results",
            subtitle: "32 responses · last updated 2 hours ago",
            onBack: () => setWent("history.back()"),
            actions: [
              button({ variant: "outline", color: "neutral", size: "sm" }, "Share"),
              button({ size: "sm" }, "Export"),
            ],
          });

          wrap.append(header, report);
          return wrap;
        },
      },
      {
        title: "3. Breadcrumb and info",
        codeTitle: "Slots, not props",
        codeDescription:
          "breadcrumb sits above the title and info beside it. Both take any node, so the header does not need to know what a Breadcrumb is.",
        code: `const h = document.createElement("zen-page-header");
h.breadcrumb = breadcrumbNode();
h.title = "Onboarding survey";
h.info = draftBadge;
h.subtitle = "11 questions";
h.actions = publishButton;`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          const info = document.createElement("zen-badge");
          info.setAttribute("variant", "soft");
          info.textContent = "Draft";
          wrap.append(
            pageHeader({
              breadcrumb: breadcrumbNode(),
              title: "Onboarding survey",
              info,
              subtitle: "11 questions",
              actions: button({ size: "sm" }, "Publish"),
            }),
          );
          return wrap;
        },
      },
      {
        title: "4. A long title truncates",
        codeTitle: "The title yields, the actions do not",
        codeDescription:
          "A title long enough to collide with the actions truncates rather than shoving them off the right edge. Narrow the window to watch it give way.",
        code: `const h = document.createElement("zen-page-header");
h.title = "A page title long enough that it has nowhere left to go";
h.addEventListener("zen-back", () => history.back());
h.actions = saveButton;`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "420px";
          wrap.append(
            pageHeader({
              title: "A page title long enough that it has nowhere left to go",
              subtitle: "The subtitle wraps instead — it has room to",
              onBack: () => {},
              actions: button({ size: "sm" }, "Save"),
            }),
          );
          return wrap;
        },
      },
    ],
  });
}

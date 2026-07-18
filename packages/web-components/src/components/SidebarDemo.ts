import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
} from "../index";
import type { SidebarContextValue } from "../index";
import { DemoPage } from "./demo-helpers";

/**
 * Sidebar demo — the web-components port.
 *
 * WHY FACTORIES, NOT ELEMENTS: the Sidebar parts take the provider's collapse
 * state as an explicit `sidebar` context object, and SidebarProvider hands it out
 * through a `children: (ctx) => …` RENDER FUNCTION — there is no light-DOM
 * composition that reproduces threading one live `ctx` into ten nested parts. So
 * this page uses the re-exported vanilla factories (which @algorisys/zen-ui-web-components
 * exports alongside the <zen-*> elements) exactly as the vanilla demo does. Every
 * other family on this site renders via document.createElement("zen-…").
 */

const svg = (markup: string): SVGElement => {
  const t = document.createElement("template");
  t.innerHTML = markup;
  return t.content.firstChild as SVGElement;
};

const HomeIcon = () =>
  svg(
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  );
const UsersIcon = () =>
  svg(
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>`,
  );
const ChartIcon = () =>
  svg(
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  );
const CogIcon = () =>
  svg(
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  );

const span = (text: string): HTMLSpanElement => {
  const s = document.createElement("span");
  s.textContent = text;
  return s;
};

const brand = (text: string): HTMLElement => {
  const s = document.createElement("strong");
  s.textContent = text;
  return s;
};

/** The bordered flex row the demo lays the rail and its page content into. */
const frame = (build: (ctx: SidebarContextValue) => HTMLElement): HTMLElement => {
  const provider = SidebarProvider({
    children: (ctx) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.height = "320px";
      row.style.width = "100%";
      row.style.border = "1px solid var(--zen-color-border)";
      row.style.borderRadius = "8px";
      row.style.overflow = "hidden";

      const page = document.createElement("div");
      page.style.flex = "1";
      page.style.padding = "16px";
      page.textContent = "Page content…";

      row.append(build(ctx), page);
      return row;
    },
  });
  return provider.el;
};

export default function SidebarDemo(): HTMLElement {
  return DemoPage({
    title: "Sidebar",
    description:
      "Collapsible navigation shell. SidebarProvider holds the open/collapsed state; the parts compose header / scrollable content / grouped menu / footer. Collapsing shrinks the rail to an icon-only strip. React reads the state from context; with no framework, SidebarProvider hands a context object to each part as `sidebar`.",
    sections: [
      {
        title: "1. Collapsible rail (click the toggle)",
        codeTitle: "SidebarProvider + Sidebar + SidebarTrigger",
        codeDescription:
          "The provider owns the collapse state and hands each part a `sidebar` context. Click the hamburger to collapse the rail to a 64px icon strip. (This family uses the re-exported vanilla factories: the `sidebar` context is threaded through a render function, which light-DOM element composition cannot reproduce.)",
        code: `const shell = SidebarProvider({
  children: (ctx) =>
    Sidebar({ sidebar: ctx, children: [
      SidebarHeader({ children: [SidebarTrigger({ sidebar: ctx }), brand("Acme")] }),
      SidebarContent({ children: SidebarGroup({ children: [
        SidebarGroupLabel({ sidebar: ctx, children: "Main" }),
        SidebarMenu({ children: [
          SidebarMenuItem({ children:
            SidebarMenuButton({ sidebar: ctx, active: true,
              children: [HomeIcon(), span("Dashboard")] }) }),
        ] }),
      ] }) }),
    ] }).el,
});
document.body.append(shell.el);`,
        render: () =>
          frame((ctx) =>
            Sidebar({
              sidebar: ctx,
              children: [
                SidebarHeader({ children: [SidebarTrigger({ sidebar: ctx }), brand("Acme")] }),
                SidebarContent({
                  children: SidebarGroup({
                    children: [
                      SidebarGroupLabel({ sidebar: ctx, children: "Main" }),
                      SidebarMenu({
                        children: [
                          SidebarMenuItem({
                            children: SidebarMenuButton({
                              sidebar: ctx,
                              active: true,
                              children: [HomeIcon(), span("Dashboard")],
                            }),
                          }),
                          SidebarMenuItem({
                            children: SidebarMenuButton({
                              sidebar: ctx,
                              children: [UsersIcon(), span("Team")],
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                SidebarFooter({
                  children: SidebarMenuButton({
                    sidebar: ctx,
                    children: [CogIcon(), span("Settings")],
                  }),
                }),
              ],
            }).el,
          ),
      },
      {
        title: "2. Nested items, and the collapsed flyout",
        codeTitle: "SidebarMenuSub / SidebarMenuSubItem / SidebarMenuSubButton",
        codeDescription:
          "SidebarMenuSub owns the nested list. Expanded, it discloses inline with a chevron. Collapse the rail and the same children re-host into a flyout anchored to the icon, because a 48px rail has nowhere to put them. Write the tree once; both modes work.",
        code: `SidebarMenu({ children: [
  SidebarMenuItem({ children:
    SidebarMenuSub({ sidebar: ctx, label: "Reports", icon: ChartIcon(), children: [
      SidebarMenuSubItem({ children:
        SidebarMenuSubButton({ as: "a", href: "#sales", active: true, children: "Sales" }) }),
      SidebarMenuSubItem({ children:
        SidebarMenuSubButton({ as: "a", href: "#forecast", children: "Forecast" }) }),
    ] }) }),
] })`,
        render: () =>
          frame((ctx) =>
            Sidebar({
              sidebar: ctx,
              children: [
                SidebarHeader({ children: [SidebarTrigger({ sidebar: ctx }), brand("Acme")] }),
                SidebarContent({
                  children: SidebarGroup({
                    children: [
                      SidebarGroupLabel({ sidebar: ctx, children: "Main" }),
                      SidebarMenu({
                        children: [
                          SidebarMenuItem({
                            children: SidebarMenuButton({
                              sidebar: ctx,
                              active: true,
                              children: [HomeIcon(), span("Dashboard")],
                            }),
                          }),
                          SidebarMenuItem({
                            children: SidebarMenuSub({
                              sidebar: ctx,
                              label: "Reports",
                              icon: ChartIcon(),
                              children: [
                                SidebarMenuSubItem({
                                  children: SidebarMenuSubButton({
                                    as: "a",
                                    href: "#sales",
                                    active: true,
                                    children: "Sales",
                                  }),
                                }),
                                SidebarMenuSubItem({
                                  children: SidebarMenuSubButton({
                                    as: "a",
                                    href: "#forecast",
                                    children: "Forecast",
                                  }),
                                }),
                              ],
                            }),
                          }),
                          SidebarMenuItem({
                            children: SidebarMenuButton({
                              sidebar: ctx,
                              children: [UsersIcon(), span("Team")],
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            }).el,
          ),
      },
    ],
  });
}

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarHeaderLabel,
  SidebarMenuBadge,
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
  type SidebarContextValue,
  type SidebarProviderProps,
} from "./sidebar/sidebar";
import { Icon } from "./icon/icon";
import { DemoPage } from "./demo-helpers";

/**
 * Sidebar demo. Mirrors the React NewSidebarDemo — the collapsible rail, and the
 * nested items whose children re-host into a flyout when the rail collapses —
 * adapted to the vanilla parts, which take the collapse context explicitly as
 * `sidebar` instead of reading React context.
 */

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

/**
 * Sections 3 and 4: the toggle lives in the page, outside the sidebar (a hidden
 * sidebar, or a closed overlay, has nothing to click on).
 */
const pageFrame = (
  testId: string,
  options: Pick<SidebarProviderProps, "collapseMode" | "overlay">,
  width: string,
  build: (ctx: SidebarContextValue) => HTMLElement,
): HTMLElement => {
  const provider = SidebarProvider({
    ...options,
    children: (ctx) => {
      const row = document.createElement("div");
      row.dataset.testid = testId;
      row.style.display = "flex";
      row.style.height = "320px";
      row.style.width = width;
      row.style.maxWidth = "100%";
      row.style.border = "1px solid var(--zen-color-border)";
      row.style.borderRadius = "8px";
      row.style.overflow = "hidden";

      const page = document.createElement("div");
      page.style.flex = "1";
      page.style.padding = "16px";
      const p = document.createElement("p");
      p.className = "zen-mt-2 zen-text-sm zen-text-zen-muted-fg";
      p.textContent = "Page content…";
      page.append(SidebarTrigger({ sidebar: ctx }).el, p);

      row.append(build(ctx), page);
      return row;
    },
  });
  return provider.el;
};

const subLink = (href: string, text: string) =>
  SidebarMenuSubItem({ children: SidebarMenuSubButton({ as: "a", href, children: text }) });

export default function SidebarDemo(): HTMLElement {
  return DemoPage({
    title: "Sidebar",
    description:
      "Collapsible navigation shell. SidebarProvider holds the open/collapsed state; the parts compose header / scrollable content / grouped menu / footer. Collapsing shrinks it to an icon rail, a rail that keeps its labels, or hides it. React reads the state from context; with no framework, SidebarProvider hands a context object to each part as `sidebar`.",
    sections: [
      {
        title: "1. Collapsible rail (click the toggle)",
        codeTitle: "SidebarProvider + Sidebar + SidebarTrigger",
        codeDescription:
          "The provider owns the collapse state and hands each part a `sidebar` context. Click the hamburger to collapse the rail to a 64px icon strip.",
        code: `const shell = SidebarProvider({
  children: (ctx) => {
    const layout = document.createElement("div");
    layout.style.display = "flex";
    layout.style.height = "320px";
    layout.append(
      Sidebar({ sidebar: ctx, children: [
        SidebarHeader({ sidebar: ctx, children: [SidebarTrigger({ sidebar: ctx }), brand("Acme")] }),
        SidebarContent({ children: SidebarGroup({ children: [
          SidebarGroupLabel({ sidebar: ctx, children: "Main" }),
          SidebarMenu({ children: [
            SidebarMenuItem({ children:
              SidebarMenuButton({ sidebar: ctx, active: true,
                children: [Icon({ name: "home" }), span("Dashboard")] }) }),
            SidebarMenuItem({ children:
              SidebarMenuButton({ sidebar: ctx,
                children: [Icon({ name: "users" }), span("Team")] }) }),
          ] }),
        ] }) }),
        SidebarFooter({ children:
          SidebarMenuButton({ sidebar: ctx,
            children: [Icon({ name: "cog" }), span("Settings")] }) }),
      ] }).el,
      pageContent,
    );
    return layout;
  },
});
document.body.append(shell.el);`,
        render: () =>
          frame((ctx) =>
            Sidebar({
              sidebar: ctx,
              children: [
                SidebarHeader({ sidebar: ctx, children: [SidebarTrigger({ sidebar: ctx }), brand("Acme")] }),
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
                              children: [Icon({ name: "home" }), span("Dashboard")],
                            }),
                          }),
                          SidebarMenuItem({
                            children: SidebarMenuButton({
                              sidebar: ctx,
                              children: [Icon({ name: "users" }), span("Team")],
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
                    children: [Icon({ name: "cog" }), span("Settings")],
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
    SidebarMenuButton({ sidebar: ctx, active: true,
      children: [Icon({ name: "home" }), span("Dashboard")] }) }),
  SidebarMenuItem({ children:
    SidebarMenuSub({ sidebar: ctx, label: "Reports", icon: Icon({ name: "bar-chart" }), children: [
      SidebarMenuSubItem({ children:
        SidebarMenuSubButton({ as: "a", href: "#sales", active: true, children: "Sales" }) }),
      SidebarMenuSubItem({ children:
        SidebarMenuSubButton({ as: "a", href: "#forecast", children: "Forecast" }) }),
    ] }) }),
  SidebarMenuItem({ children:
    SidebarMenuButton({ sidebar: ctx,
      children: [Icon({ name: "users" }), span("Team")] }) }),
] })`,
        render: () =>
          frame((ctx) =>
            Sidebar({
              sidebar: ctx,
              children: [
                SidebarHeader({ sidebar: ctx, children: [SidebarTrigger({ sidebar: ctx }), brand("Acme")] }),
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
                              children: [Icon({ name: "home" }), span("Dashboard")],
                            }),
                          }),
                          SidebarMenuItem({
                            children: SidebarMenuSub({
                              sidebar: ctx,
                              label: "Reports",
                              icon: Icon({ name: "bar-chart" }),
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
                              children: [Icon({ name: "users" }), span("Team")],
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
      {
        title: "3. A text-only menu that hides when collapsed",
        codeTitle: 'collapseMode: "hidden", with counts on the groups',
        codeDescription:
          "A menu with no icons has nothing to show on a rail, so collapsing hides it entirely, and a hidden sidebar is inert. Its toggle lives outside it, in the page's header. SidebarMenuSub's badge puts a count at the row's end.",
        code: `SidebarProvider({
  collapseMode: "hidden",
  children: (ctx) => row(
    Sidebar({ sidebar: ctx, children: [
      SidebarHeader({ sidebar: ctx, children:
        SidebarHeaderLabel({ sidebar: ctx, children: "Algorisys One" }) }),
      SidebarContent({ children: SidebarMenu({ children: [
        SidebarMenuItem({ children:
          SidebarMenuSub({ sidebar: ctx, label: "Accounts", badge: 29, defaultOpen: true, children: [
            SidebarMenuSubItem({ children:
              SidebarMenuSubButton({ as: "a", href: "#journal-entry", children: "Journal Entry" }) }),
            …
          ] }) }),
      ] }) }),
    ] }),
    main(SidebarTrigger({ sidebar: ctx }), …),
  ),
})`,
        render: () =>
          pageFrame("hidden-frame", { collapseMode: "hidden" }, "100%", (ctx) =>
            Sidebar({
              sidebar: ctx,
              children: [
                SidebarHeader({
                  sidebar: ctx,
                  children: SidebarHeaderLabel({ sidebar: ctx, children: "Algorisys One" }),
                }),
                SidebarContent({
                  children: SidebarMenu({
                    children: [
                      SidebarMenuItem({
                        children: SidebarMenuSub({
                          sidebar: ctx,
                          label: "Accounts",
                          badge: 29,
                          defaultOpen: true,
                          children: [
                            subLink("#journal-entry", "Journal Entry"),
                            subLink("#payment-entry", "Payment Entry"),
                            subLink("#sales-invoice", "Sales Invoice"),
                          ],
                        }),
                      }),
                      SidebarMenuItem({
                        children: SidebarMenuSub({
                          sidebar: ctx,
                          label: "Stock",
                          badge: 18,
                          children: [
                            subLink("#stock-entry", "Stock Entry"),
                            subLink("#delivery-note", "Delivery Note"),
                          ],
                        }),
                      }),
                      SidebarMenuItem({
                        children: SidebarMenuSub({
                          sidebar: ctx,
                          label: "Buying",
                          badge: 12,
                          children: [
                            subLink("#purchase-order", "Purchase Order"),
                            subLink("#purchase-receipt", "Purchase Receipt"),
                          ],
                        }),
                      }),
                    ],
                  }),
                }),
              ],
            }).el,
          ),
      },
      {
        title: "4. On a narrow screen, over the content",
        codeTitle: "overlay: { below: 900 }",
        codeDescription:
          "This frame is 600px wide, under the 900px breakpoint, so the sidebar starts closed and opens over the page instead of beside it. It takes focus when it opens; Esc, a click outside it or following one of its links closes it. Widen past 900px and it sits beside the content again. The width is the sidebar's container's, not the window's.",
        code: `SidebarProvider({
  overlay: { below: 900 },
  children: (ctx) => row(
    Sidebar({ sidebar: ctx, children: … }),
    main(SidebarTrigger({ sidebar: ctx }), …),
  ),
})`,
        render: () =>
          pageFrame("overlay-frame", { overlay: { below: 900 } }, "600px", (ctx) =>
            Sidebar({
              sidebar: ctx,
              children: [
                SidebarHeader({
                  sidebar: ctx,
                  children: SidebarHeaderLabel({ sidebar: ctx, children: "Acme" }),
                }),
                SidebarContent({
                  children: SidebarMenu({
                    children: [
                      SidebarMenuItem({
                        children: SidebarMenuButton({
                          sidebar: ctx,
                          as: "a",
                          href: "#home",
                          active: true,
                          children: [Icon({ name: "home" }), span("Home")],
                        }),
                      }),
                      SidebarMenuItem({
                        children: SidebarMenuButton({
                          sidebar: ctx,
                          as: "a",
                          href: "#team",
                          children: [Icon({ name: "users" }), span("Team"), SidebarMenuBadge({ children: "4" })],
                        }),
                      }),
                    ],
                  }),
                }),
              ],
            }).el,
          ),
      },
      {
        title: "5. A rail that keeps its labels",
        codeTitle: 'collapseMode: "labelled"',
        codeDescription:
          "Collapsed, each row keeps a short label under its icon, so the rail can be read rather than remembered. Group headings stay as small captions over a hairline, a count moves onto its icon's corner, and a label too long for the rail is truncated, with the full name in a tooltip. On the icon rail every row has that tooltip.",
        code: `SidebarProvider({
  collapseMode: "labelled",
  children: (ctx) => row(
    Sidebar({ sidebar: ctx, children: [
      SidebarHeader({ sidebar: ctx, children: [
        SidebarTrigger({ sidebar: ctx }),
        SidebarHeaderLabel({ sidebar: ctx, children: "Acme" }),
      ] }),
      SidebarContent({ children: [
        SidebarGroup({ children: [
          SidebarGroupLabel({ sidebar: ctx, children: "Main" }),
          SidebarMenu({ children: [
            SidebarMenuItem({ children: SidebarMenuButton({ sidebar: ctx, active: true, children: [Icon({ name: "home" }), span("Home")] }) }),
            SidebarMenuItem({ children: SidebarMenuButton({ sidebar: ctx, children: [Icon({ name: "users" }), span("Team"), SidebarMenuBadge({ children: "4" })] }) }),
          ] }),
        ] }),
        SidebarGroup({ children: [
          SidebarGroupLabel({ sidebar: ctx, children: "Workspace" }),
          SidebarMenu({ children: [
            SidebarMenuItem({ children: SidebarMenuButton({ sidebar: ctx, children: [Icon({ name: "inbox" }), span("Inbox"), SidebarMenuBadge({ children: "12" })] }) }),
            // Calendar, Documents, Notifications …
          ] }),
        ] }),
        SidebarGroup({ children: [
          SidebarGroupLabel({ sidebar: ctx, children: "Insights" }),
          SidebarMenu({ children: SidebarMenuItem({ children: SidebarMenuSub({ sidebar: ctx, label: "Reports", icon: Icon({ name: "bar-chart" }), children: … }) }) }),
        ] }),
      ] }),
      SidebarFooter({ children: SidebarMenuButton({ sidebar: ctx, children: [Icon({ name: "cog" }), span("Preferences")] }) }),
    ] }),
    page,
  ),
})`,
        render: () =>
          SidebarProvider({
            collapseMode: "labelled",
            defaultCollapsed: true,
            children: (ctx) => {
              const row = document.createElement("div");
              row.dataset.testid = "labelled-frame";
              row.style.display = "flex";
              row.style.height = "480px";
              row.style.width = "100%";
              row.style.border = "1px solid var(--zen-color-border)";
              row.style.borderRadius = "8px";
              row.style.overflow = "hidden";
              const page = document.createElement("div");
              page.style.flex = "1";
              page.style.padding = "16px";
              page.textContent = "Page content…";
              row.append(
                Sidebar({
                  sidebar: ctx,
                  children: [
                    SidebarHeader({
                      sidebar: ctx,
                      children: [
                        SidebarTrigger({ sidebar: ctx }).el,
                        SidebarHeaderLabel({ sidebar: ctx, children: "Acme" }).el,
                      ],
                    }),
                    SidebarContent({
                      children: [
                        SidebarGroup({
                          children: [
                            SidebarGroupLabel({ sidebar: ctx, children: "Main" }),
                            SidebarMenu({
                              children: [
                                SidebarMenuItem({
                                  children: SidebarMenuButton({
                                    sidebar: ctx,
                                    active: true,
                                    children: [Icon({ name: "home" }), span("Home")],
                                  }),
                                }),
                                SidebarMenuItem({
                                  children: SidebarMenuButton({
                                    sidebar: ctx,
                                    children: [Icon({ name: "users" }), span("Team"), SidebarMenuBadge({ children: "4" })],
                                  }),
                                }),
                              ],
                            }),
                          ],
                        }),
                        SidebarGroup({
                          children: [
                            SidebarGroupLabel({ sidebar: ctx, children: "Workspace" }),
                            SidebarMenu({
                              children: [
                                SidebarMenuItem({
                                  children: SidebarMenuButton({ sidebar: ctx, children: [Icon({ name: "inbox" }), span("Inbox"), SidebarMenuBadge({ children: "12" })] }),
                                }),
                                SidebarMenuItem({
                                  children: SidebarMenuButton({ sidebar: ctx, children: [Icon({ name: "calendar" }), span("Calendar")] }),
                                }),
                                SidebarMenuItem({
                                  children: SidebarMenuButton({ sidebar: ctx, children: [Icon({ name: "file" }), span("Documents")] }),
                                }),
                                SidebarMenuItem({
                                  children: SidebarMenuButton({ sidebar: ctx, children: [Icon({ name: "bell" }), span("Notifications")] }),
                                }),
                              ],
                            }),
                          ],
                        }),
                        SidebarGroup({
                          children: [
                            SidebarGroupLabel({ sidebar: ctx, children: "Insights" }),
                            SidebarMenu({
                              children: SidebarMenuItem({
                                children: SidebarMenuSub({
                                  sidebar: ctx,
                                  label: "Reports",
                                  icon: Icon({ name: "bar-chart" }),
                                  children: [subLink("#sales", "Sales"), subLink("#forecast", "Forecast")],
                                }),
                              }),
                            }),
                          ],
                        }),
                      ],
                    }),
                    SidebarFooter({
                      children: SidebarMenuButton({ sidebar: ctx, children: [Icon({ name: "cog" }), span("Preferences")] }),
                    }),
                  ],
                }).el,
                page,
              );
              return row;
            },
          }).el,
      },
    ],
  });
}

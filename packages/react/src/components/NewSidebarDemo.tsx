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
} from "./sidebar/sidebar";
import { Icon } from "./icon/icon";
import { CodeExample } from "./demo-helpers";

const NewSidebarDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Sidebar</h1>
    <p className="lede">
      Collapsible navigation shell. <code>SidebarProvider</code> holds the
      open/collapsed state; the parts compose header / scrollable content /
      grouped menu / footer. Collapsing shrinks it to an icon rail, a rail that
      keeps its labels, or hides it.
      Use <code>SidebarMenuButton asChild</code> to wrap a router{" "}
      <code>Link</code>, and <code>active</code> to mark the current item.
    </p>

    <section className="demo-section">
      <h2>1. Collapsible rail (click the toggle)</h2>
      <CodeExample
        title="SidebarProvider + Sidebar + SidebarTrigger"
        code={`<SidebarProvider>
  <div style={{ display: "flex", height: 320 }}>
    <Sidebar>
      <SidebarHeader>
        <SidebarTrigger />
        <strong>Acme</strong>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton active>
                <Icon name="home" /><span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Icon name="users" /><span>Team</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton><Icon name="cog" /><span>Settings</span></SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
    <div style={{ flex: 1, padding: 16 }}>Page content…</div>
  </div>
</SidebarProvider>`}
      >
        <SidebarProvider>
          <div style={{ display: "flex", height: 320, width: "100%", border: "1px solid var(--zen-color-border)", borderRadius: 8, overflow: "hidden" }}>
            <Sidebar>
              <SidebarHeader>
                <SidebarTrigger />
                <strong>Acme</strong>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Main</SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton active>
                        <Icon name="home" />
                        <span>Dashboard</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Icon name="users" />
                        <span>Team</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenuButton>
                  <Icon name="cog" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarFooter>
            </Sidebar>
            <div style={{ flex: 1, padding: 16 }}>Page content…</div>
          </div>
        </SidebarProvider>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Nested items, and the collapsed flyout</h2>
      <p style={{ fontSize: "0.875rem", color: "var(--zen-color-muted-fg)", margin: "0 0 0.75rem" }}>
        <code>SidebarMenuSub</code> owns the nested list. Expanded, it discloses
        inline with a chevron. Collapse the rail and the same children re-host
        into a flyout anchored to the icon, because a 48px rail has nowhere to
        put them. Write the tree once; both modes work.
      </p>
      <CodeExample
        title="SidebarMenuSub / SidebarMenuSubItem / SidebarMenuSubButton"
        code={`<SidebarMenu>
  <SidebarMenuItem>
    <SidebarMenuButton active>
      <Icon name="home" /><span>Dashboard</span>
    </SidebarMenuButton>
  </SidebarMenuItem>
  <SidebarMenuItem>
    <SidebarMenuSub label="Reports" icon={<Icon name="bar-chart" />}>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild active>
          <a href="#sales">Sales</a>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild>
          <a href="#forecast">Forecast</a>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    </SidebarMenuSub>
  </SidebarMenuItem>
</SidebarMenu>`}
      >
        <SidebarProvider>
          <div style={{ display: "flex", height: 320, width: "100%", border: "1px solid var(--zen-color-border)", borderRadius: 8, overflow: "hidden" }}>
            <Sidebar>
              <SidebarHeader>
                <SidebarTrigger />
                <strong>Acme</strong>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Main</SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton active>
                        <Icon name="home" />
                        <span>Dashboard</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuSub label="Reports" icon={<Icon name="bar-chart" />}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <a href="#sales">Sales</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <a href="#forecast">Forecast</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Icon name="users" />
                        <span>Team</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <div style={{ flex: 1, padding: 16 }}>Page content…</div>
          </div>
        </SidebarProvider>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. A text-only menu that hides when collapsed</h2>
      <CodeExample
        title='collapseMode="hidden", with counts on the groups'
        description="A menu with no icons has nothing to show on a rail, so collapsing hides it entirely, and a hidden sidebar is inert. Its toggle lives outside it, in the page's header. SidebarMenuSub's badge puts a count at the row's end."
        code={`<SidebarProvider collapseMode="hidden">
  <div style={{ display: "flex", height: 320 }}>
    <Sidebar>
      <SidebarHeader><SidebarHeaderLabel>Algorisys One</SidebarHeaderLabel></SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuSub label="Accounts" badge={29} defaultOpen>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <a href="#journal-entry">Journal Entry</a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              …
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
    <main>
      <SidebarTrigger /> …
    </main>
  </div>
</SidebarProvider>`}
      >
        <SidebarProvider collapseMode="hidden">
          <div
            data-testid="hidden-frame"
            style={{ display: "flex", height: 320, width: "100%", border: "1px solid var(--zen-color-border)", borderRadius: 8, overflow: "hidden" }}
          >
            <Sidebar>
              <SidebarHeader>
                <SidebarHeaderLabel>Algorisys One</SidebarHeaderLabel>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuSub label="Accounts" badge={29} defaultOpen>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="#journal-entry">Journal Entry</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="#payment-entry">Payment Entry</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="#sales-invoice">Sales Invoice</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSub label="Stock" badge={18}>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="#stock-entry">Stock Entry</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="#delivery-note">Delivery Note</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSub label="Buying" badge={12}>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="#purchase-order">Purchase Order</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="#purchase-receipt">Purchase Receipt</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
            <div style={{ flex: 1, padding: 16 }}>
              <SidebarTrigger />
              <p className="zen-mt-2 zen-text-sm zen-text-zen-muted-fg">Page content…</p>
            </div>
          </div>
        </SidebarProvider>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. On a narrow screen, over the content</h2>
      <CodeExample
        title="overlay={{ below: 900 }}"
        description="This frame is 600px wide, under the 900px breakpoint, so the sidebar starts closed and opens over the page instead of beside it. It takes focus when it opens; Esc, a click outside it or following one of its links closes it. Widen past 900px and it sits beside the content again. The width is the sidebar's container's, not the window's."
        code={`<SidebarProvider overlay={{ below: 900 }}>
  <div style={{ display: "flex", height: 320 }}>
    <Sidebar>…</Sidebar>
    <main><SidebarTrigger /> …</main>
  </div>
</SidebarProvider>`}
      >
        <SidebarProvider overlay={{ below: 900 }}>
          <div
            data-testid="overlay-frame"
            style={{ display: "flex", height: 320, width: 600, maxWidth: "100%", border: "1px solid var(--zen-color-border)", borderRadius: 8, overflow: "hidden" }}
          >
            <Sidebar>
              <SidebarHeader>
                <SidebarHeaderLabel>Acme</SidebarHeaderLabel>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild active>
                      <a href="#home">
                        <Icon name="home" />
                        <span>Home</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#team">
                        <Icon name="users" />
                        <span>Team</span>
                        <SidebarMenuBadge>4</SidebarMenuBadge>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
            <div style={{ flex: 1, padding: 16 }}>
              <SidebarTrigger />
              <p className="zen-mt-2 zen-text-sm zen-text-zen-muted-fg">Page content…</p>
            </div>
          </div>
        </SidebarProvider>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. A rail that keeps its labels</h2>
      <CodeExample
        title='collapseMode="labelled"'
        description="Collapsed, each row keeps a short label under its icon, so the rail can be read rather than remembered. Group headings stay as small captions over a hairline, a count moves onto its icon's corner, and a label too long for the rail is truncated, with the full name in a tooltip. On the icon rail every row has that tooltip."
        code={`<SidebarProvider collapseMode="labelled">
  <div style={{ display: "flex", height: 480 }}>
    <Sidebar>
      <SidebarHeader>
        <SidebarTrigger />
        <SidebarHeaderLabel>Acme</SidebarHeaderLabel>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton active>
                <Icon name="home" /><span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Icon name="users" /><span>Team</span>
                <SidebarMenuBadge>4</SidebarMenuBadge>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Icon name="inbox" /><span>Inbox</span>
                <SidebarMenuBadge>12</SidebarMenuBadge>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Calendar, Documents, Notifications … */}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Insights</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSub label="Reports" icon={<Icon name="bar-chart" />}>…</SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton><Icon name="cog" /><span>Preferences</span></SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
    <div style={{ flex: 1, padding: 16 }}>Page content…</div>
  </div>
</SidebarProvider>`}
      >
        <SidebarProvider collapseMode="labelled" defaultCollapsed>
          <div
            data-testid="labelled-frame"
            style={{ display: "flex", height: 480, border: "1px solid var(--zen-color-border)", borderRadius: 8, overflow: "hidden" }}
          >
            <Sidebar>
              <SidebarHeader>
                <SidebarTrigger />
                <SidebarHeaderLabel>Acme</SidebarHeaderLabel>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Main</SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton active>
                        <Icon name="home" />
                        <span>Home</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Icon name="users" />
                        <span>Team</span>
                        <SidebarMenuBadge>4</SidebarMenuBadge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Icon name="inbox" />
                        <span>Inbox</span>
                        <SidebarMenuBadge>12</SidebarMenuBadge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Icon name="calendar" />
                        <span>Calendar</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Icon name="file" />
                        <span>Documents</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Icon name="bell" />
                        <span>Notifications</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarGroupLabel>Insights</SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuSub label="Reports" icon={<Icon name="bar-chart" />}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <a href="#sales">Sales</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <a href="#forecast">Forecast</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenuButton>
                  <Icon name="cog" />
                  <span>Preferences</span>
                </SidebarMenuButton>
              </SidebarFooter>
            </Sidebar>
            <div style={{ flex: 1, padding: 16 }}>Page content…</div>
          </div>
        </SidebarProvider>
      </CodeExample>
    </section>
  </div>
);

export default NewSidebarDemo;

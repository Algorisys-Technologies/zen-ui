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
import { DemoPage, DemoSection } from "./demo-helpers";

const NewSidebarDemo = () => (
  <DemoPage
    title="Sidebar"
    description={
      <>
        Collapsible navigation shell. <code>SidebarProvider</code> holds the
        open/collapsed state; the parts compose header / scrollable content /
        grouped menu / footer. Collapsing shrinks it to an icon rail, a rail that
        keeps its labels, or hides it.
        Use <code>SidebarMenuButton</code>'s <code>as</code> to render a router{" "}
        <code>Link</code>, and <code>active</code> to mark the current item.
      </>
    }
  >
    <DemoSection
      title="1. Collapsible rail (click the toggle)"
      codeTitle="SidebarProvider + Sidebar + SidebarTrigger"
      code={`<SidebarProvider>
  <div style={{ display: "flex", height: "320px" }}>
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
    <div style={{ flex: 1, padding: "16px" }}>Page content…</div>
  </div>
</SidebarProvider>`}
    >
      <SidebarProvider>
        <div class="zen-flex zen-h-80 zen-w-full zen-overflow-hidden zen-rounded-zen-lg zen-border zen-border-zen-border">
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
          <div class="zen-flex-1 zen-p-4">Page content…</div>
        </div>
      </SidebarProvider>
    </DemoSection>

    <DemoSection
      title="2. Nested items, and the collapsed flyout"
      description="SidebarMenuSub owns the nested list. Expanded, it discloses inline with a chevron. Collapse the rail and the same children re-host into a flyout anchored to the icon, because a 48px rail has nowhere to put them. Write the tree once; both modes work."
      codeTitle="SidebarMenuSub / SidebarMenuSubItem / SidebarMenuSubButton"
      code={`<SidebarMenu>
  <SidebarMenuItem>
    <SidebarMenuButton active>
      <Icon name="home" /><span>Dashboard</span>
    </SidebarMenuButton>
  </SidebarMenuItem>
  <SidebarMenuItem>
    <SidebarMenuSub label="Reports" icon={<Icon name="bar-chart" />}>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton as="a" href="#sales" active>
          Sales
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton as="a" href="#forecast">
          Forecast
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    </SidebarMenuSub>
  </SidebarMenuItem>
</SidebarMenu>`}
    >
      <SidebarProvider>
        <div class="zen-flex zen-h-80 zen-w-full zen-overflow-hidden zen-rounded-zen-lg zen-border zen-border-zen-border">
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
                        <SidebarMenuSubButton as="a" href="#sales">
                          Sales
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton as="a" href="#forecast">
                          Forecast
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
          <div class="zen-flex-1 zen-p-4">Page content…</div>
        </div>
      </SidebarProvider>
    </DemoSection>

    <DemoSection
      title="3. A text-only menu that hides when collapsed"
      codeTitle='collapseMode="hidden", with counts on the groups'
      codeDescription="A menu with no icons has nothing to show on a rail, so collapsing hides it entirely, and a hidden sidebar is inert. Its toggle lives outside it, in the page's header. SidebarMenuSub's badge puts a count at the row's end."
      code={`<SidebarProvider collapseMode="hidden">
  <div style={{ display: "flex", height: "320px" }}>
    <Sidebar>
      <SidebarHeader><SidebarHeaderLabel>Algorisys One</SidebarHeaderLabel></SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuSub label="Accounts" badge={29} defaultOpen>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton as="a" href="#journal-entry">Journal Entry</SidebarMenuSubButton>
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
        <div class="zen-flex zen-h-80 zen-w-full zen-overflow-hidden zen-rounded-zen-lg zen-border zen-border-zen-border" data-testid="hidden-frame">
          <Sidebar>
            <SidebarHeader>
              <SidebarHeaderLabel>Algorisys One</SidebarHeaderLabel>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuSub label="Accounts" badge={29} defaultOpen>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as="a" href="#journal-entry">Journal Entry</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as="a" href="#payment-entry">Payment Entry</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as="a" href="#sales-invoice">Sales Invoice</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSub label="Stock" badge={18}>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as="a" href="#stock-entry">Stock Entry</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as="a" href="#delivery-note">Delivery Note</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSub label="Buying" badge={12}>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as="a" href="#purchase-order">Purchase Order</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton as="a" href="#purchase-receipt">Purchase Receipt</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <div class="zen-flex-1 zen-p-4">
            <SidebarTrigger />
            <p class="zen-mt-2 zen-text-sm zen-text-zen-muted-fg">Page content…</p>
          </div>
        </div>
      </SidebarProvider>
    </DemoSection>

    <DemoSection
      title="4. On a narrow screen, over the content"
      codeTitle="overlay={{ below: 900 }}"
      codeDescription="This frame is 600px wide, under the 900px breakpoint, so the sidebar starts closed and opens over the page instead of beside it. It takes focus when it opens; Esc, a click outside it or following one of its links closes it. Widen past 900px and it sits beside the content again. The width is the sidebar's container's, not the window's."
      code={`<SidebarProvider overlay={{ below: 900 }}>
  <div style={{ display: "flex", height: "320px" }}>
    <Sidebar>…</Sidebar>
    <main><SidebarTrigger /> …</main>
  </div>
</SidebarProvider>`}
    >
      <SidebarProvider overlay={{ below: 900 }}>
        <div class="zen-flex zen-h-80 zen-w-[600px] zen-max-w-full zen-overflow-hidden zen-rounded-zen-lg zen-border zen-border-zen-border" data-testid="overlay-frame">
          <Sidebar>
            <SidebarHeader>
              <SidebarHeaderLabel>Acme</SidebarHeaderLabel>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton as="a" href="#home" active>
                    <Icon name="home" />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton as="a" href="#team">
                    <Icon name="users" />
                    <span>Team</span>
                    <SidebarMenuBadge>4</SidebarMenuBadge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <div class="zen-flex-1 zen-p-4">
            <SidebarTrigger />
            <p class="zen-mt-2 zen-text-sm zen-text-zen-muted-fg">Page content…</p>
          </div>
        </div>
      </SidebarProvider>
    </DemoSection>

    <DemoSection
      title="5. A rail that keeps its labels"
      codeTitle='collapseMode="labelled"'
      codeDescription="Collapsed, each row keeps a short label under its icon, so the rail can be read rather than remembered. Group headings stay as small captions over a hairline, a count moves onto its icon's corner, and a label too long for the rail is truncated, with the full name in a tooltip. On the icon rail every row has that tooltip."
      code={`<SidebarProvider collapseMode="labelled">
  <div style={{ display: "flex", height: "480px" }}>
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
    <div style={{ flex: 1, padding: "16px" }}>Page content…</div>
  </div>
</SidebarProvider>`}
    >
      <SidebarProvider collapseMode="labelled" defaultCollapsed>
        <div class="zen-flex zen-h-120 zen-w-full zen-overflow-hidden zen-rounded-zen-lg zen-border zen-border-zen-border" data-testid="labelled-frame">
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
                        <SidebarMenuSubButton as="a" href="#sales">Sales</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton as="a" href="#forecast">Forecast</SidebarMenuSubButton>
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
          <div class="zen-flex-1 zen-p-4">Page content…</div>
        </div>
      </SidebarProvider>
    </DemoSection>
  </DemoPage>
);

export default NewSidebarDemo;

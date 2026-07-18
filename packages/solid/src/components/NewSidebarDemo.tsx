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
} from "./sidebar/sidebar";
import { DemoPage, DemoSection } from "./demo-helpers";

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
  </svg>
);
const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const CogIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const NewSidebarDemo = () => (
  <DemoPage
    title="Sidebar"
    description={
      <>
        Collapsible navigation shell. <code>SidebarProvider</code> holds the
        open/collapsed state; the parts compose header / scrollable content /
        grouped menu / footer. Collapsing shrinks the rail to an icon-only strip.
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
                <HomeIcon /><span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <UsersIcon /><span>Team</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton><CogIcon /><span>Settings</span></SidebarMenuButton>
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
                      <HomeIcon />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <UsersIcon />
                      <span>Team</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenuButton>
                <CogIcon />
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
      <HomeIcon /><span>Dashboard</span>
    </SidebarMenuButton>
  </SidebarMenuItem>
  <SidebarMenuItem>
    <SidebarMenuSub label="Reports" icon={<ChartIcon />}>
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
                      <HomeIcon />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSub label="Reports" icon={<ChartIcon />}>
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
                      <UsersIcon />
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
  </DemoPage>
);

export default NewSidebarDemo;

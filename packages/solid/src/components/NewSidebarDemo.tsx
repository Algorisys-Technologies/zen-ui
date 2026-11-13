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
  SidebarMenuSubLabel,
  SidebarTrigger,
} from "./sidebar/sidebar";
import { DemoPage, DemoSection } from "./demo-helpers";
import { For, createSignal } from "solid-js";

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

/**
 * Last section: groups whose open state the APP keeps — an ERP opens the group
 * the current page lives in. Every onOpenChange is logged, so a close the
 * user never made would show.
 */
const ControlledGroups = () => {
  const [open, setOpen] = createSignal<Record<string, boolean>>({ Stock: true });
  const [log, setLog] = createSignal<string[]>([]);
  const groups = [
    { name: "Selling", items: ["Quotations", "Sales orders"] },
    { name: "Stock", items: ["Items", "Stock entries"] },
    { name: "Buying", items: ["Suppliers", "Purchase orders"] },
  ];
  return (
    <div class="zen-flex zen-w-full zen-flex-col zen-gap-2" data-testid="controlled">
      <SidebarProvider>
        <div class="zen-flex zen-h-80 zen-w-full zen-overflow-hidden zen-rounded-zen-lg zen-border zen-border-zen-border">
          <Sidebar>
            <SidebarHeader>
              <SidebarTrigger />
              <strong>ERP</strong>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <For each={groups}>
                  {(g) => (
                    <SidebarMenuItem>
                      <SidebarMenuSub
                        label={g.name}
                        icon={<ChartIcon />}
                        open={open()[g.name] ?? false}
                        onOpenChange={(v) => {
                          setOpen({ ...open(), [g.name]: v });
                          setLog([...log(), `${g.name}: ${v ? "open" : "close"}`]);
                        }}
                      >
                        <For each={g.items}>
                          {(item) => (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton as="a" href={`#${item}`}>
                                {item}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </For>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  )}
                </For>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <div class="zen-flex-1 zen-p-4 zen-text-sm">Page content…</div>
        </div>
      </SidebarProvider>
      <p class="zen-m-0 zen-text-sm" data-testid="controlled-log">
        onOpenChange: {log().length ? log().join(", ") : "none yet"}
      </p>
    </div>
  );
};

const HeadedGroups = () => {
  const [current, setCurrent] = createSignal("Sales orders");
  const sections = [
    { heading: "Transactions", items: ["Quotations", "Sales orders", "Invoices"] },
    { heading: "Pricing", items: ["Price lists", "Discount rules"] },
  ];
  return (
    <div class="zen-flex zen-w-full zen-flex-col zen-gap-2" data-testid="headed">
      <SidebarProvider>
        {/* The mark is off by default; this panel turns it on. */}
        <div
          class="zen-flex zen-h-96 zen-w-full zen-overflow-hidden zen-rounded-zen-lg zen-border zen-border-zen-border"
          style={{ "--zen-sidebar-guide-current": "var(--zen-color-primary)" }}
        >
          <Sidebar>
            <SidebarHeader>
              <SidebarTrigger />
              <strong>ERP</strong>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuSub label="Selling" icon={<ChartIcon />} defaultOpen>
                    <For each={sections}>
                      {(sec) => (
                        <>
                          <SidebarMenuSubLabel>{sec.heading}</SidebarMenuSubLabel>
                          <For each={sec.items}>
                            {(item) => (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  as="a"
                                  href={`#${item}`}
                                  active={current() === item}
                                  aria-current={current() === item ? "page" : undefined}
                                  onClick={(e: MouseEvent) => {
                                    e.preventDefault();
                                    setCurrent(item);
                                  }}
                                >
                                  {item}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          </For>
                        </>
                      )}
                    </For>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <div class="zen-flex-1 zen-p-4 zen-text-sm" data-testid="headed-current">
            {current()}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

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
                    <HomeIcon />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton as="a" href="#team">
                    <UsersIcon />
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
      title="5. Groups the app controls"
      description="An ERP keeps its groups' open state, so the group the current page lives in is open. Collapse to the rail and expand again: the rail's flyout is the row's own state, so the app's groups are never closed for it — onOpenChange reports only what the user did."
      codeTitle="open + onOpenChange on SidebarMenuSub"
      code={`<SidebarMenuSub label="Stock" open={open().Stock} onOpenChange={(v) => setOpen({ ...open(), Stock: v })}>
  …
</SidebarMenuSub>`}
    >
      <ControlledGroups />
    </DemoSection>

    <DemoSection
      title="6. Headings in a group, and the current-row mark"
      description="SidebarMenuSubLabel heads a run of rows: not focusable, and kept out of the list's item count. The guide line is --zen-sidebar-guide (colour) and --zen-sidebar-guide-width; --zen-sidebar-guide-current puts a mark on it beside the active row. The mark is transparent unless you set it — this panel sets it to the primary colour. To style the whole group that holds the current page, [data-sidebar=menu-sub]:has([data-active]) selects its list."
      codeTitle="SidebarMenuSubLabel, and the guide tokens"
      code={`<SidebarMenuSub label="Selling" defaultOpen>
  <SidebarMenuSubLabel>Transactions</SidebarMenuSubLabel>
  <SidebarMenuSubItem>
    <SidebarMenuSubButton as={A} href="/orders" active>Sales orders</SidebarMenuSubButton>
  </SidebarMenuSubItem>
</SidebarMenuSub>

/* CSS */
:root {
  --zen-sidebar-guide-current: var(--zen-color-primary); /* off (transparent) by default */
  --zen-sidebar-guide: var(--zen-color-border);
  --zen-sidebar-guide-width: 1px;
}`}
    >
      <HeadedGroups />
    </DemoSection>
  </DemoPage>
);

export default NewSidebarDemo;

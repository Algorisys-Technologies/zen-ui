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
import { CodeExample } from "./demo-helpers";
import { Fragment, useState } from "react";

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
  </svg>
);
const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const CogIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/**
 * Last section: groups whose open state the APP keeps — an ERP opens the group
 * the current page lives in. Every onOpenChange is logged, so a close the user
 * never made would show.
 */
const GROUPS = [
  { name: "Selling", items: ["Quotations", "Sales orders"] },
  { name: "Stock", items: ["Items", "Stock entries"] },
  { name: "Buying", items: ["Suppliers", "Purchase orders"] },
];
const ControlledGroups = () => {
  const [open, setOpen] = useState<Record<string, boolean>>({ Stock: true });
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="zen-flex zen-w-full zen-flex-col zen-gap-2" data-testid="controlled">
      <SidebarProvider>
        <div className="zen-flex zen-h-80 zen-w-full zen-overflow-hidden zen-rounded-zen-lg zen-border zen-border-zen-border">
          <Sidebar>
            <SidebarHeader>
              <SidebarTrigger />
              <strong>ERP</strong>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {GROUPS.map((g) => (
                  <SidebarMenuItem key={g.name}>
                    <SidebarMenuSub
                      label={g.name}
                      icon={<ChartIcon />}
                      open={open[g.name] ?? false}
                      onOpenChange={(v) => {
                        setOpen((o) => ({ ...o, [g.name]: v }));
                        setLog((l) => [...l, `${g.name}: ${v ? "open" : "close"}`]);
                      }}
                    >
                      {g.items.map((item) => (
                        <SidebarMenuSubItem key={item}>
                          <SidebarMenuSubButton asChild>
                            <a href={`#${item}`}>{item}</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <div className="zen-flex-1 zen-p-4 zen-text-sm">Page content…</div>
        </div>
      </SidebarProvider>
      <p className="zen-m-0 zen-text-sm" data-testid="controlled-log">
        onOpenChange: {log.length ? log.join(", ") : "none yet"}
      </p>
    </div>
  );
};

const SECTIONS = [
  { heading: "Transactions", items: ["Quotations", "Sales orders", "Invoices"] },
  { heading: "Pricing", items: ["Price lists", "Discount rules"] },
];

const HeadedGroups = () => {
  const [current, setCurrent] = useState("Sales orders");
  return (
    <div className="zen-flex zen-w-full zen-flex-col zen-gap-2" data-testid="headed">
      <SidebarProvider>
        {/* The mark is off by default; this panel turns it on. */}
        <div
          className="zen-flex zen-h-96 zen-w-full zen-overflow-hidden zen-rounded-zen-lg zen-border zen-border-zen-border"
          style={{ "--zen-sidebar-guide-current": "var(--zen-color-primary)" } as React.CSSProperties}
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
                    {SECTIONS.map((sec) => (
                      <Fragment key={sec.heading}>
                        <SidebarMenuSubLabel>{sec.heading}</SidebarMenuSubLabel>
                        {sec.items.map((item) => (
                          <SidebarMenuSubItem key={item}>
                            <SidebarMenuSubButton asChild active={current === item}>
                              <a
                                href={`#${item}`}
                                aria-current={current === item ? "page" : undefined}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrent(item);
                                }}
                              >
                                {item}
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </Fragment>
                    ))}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <div className="zen-flex-1 zen-p-4 zen-text-sm" data-testid="headed-current">
            {current}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

const NewSidebarDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Sidebar</h1>
    <p className="lede">
      Collapsible navigation shell. <code>SidebarProvider</code> holds the
      open/collapsed state; the parts compose header / scrollable content /
      grouped menu / footer. Collapsing shrinks the rail to an icon-only strip.
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
      <HomeIcon /><span>Dashboard</span>
    </SidebarMenuButton>
  </SidebarMenuItem>
  <SidebarMenuItem>
    <SidebarMenuSub label="Reports" icon={<ChartIcon />}>
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
                        <HomeIcon />
                        <span>Dashboard</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuSub label="Reports" icon={<ChartIcon />}>
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
                        <UsersIcon />
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
                        <HomeIcon />
                        <span>Home</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#team">
                        <UsersIcon />
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
      <h2>5. Groups the app controls</h2>
      <CodeExample
        title="open + onOpenChange on SidebarMenuSub"
        description="An ERP keeps its groups' open state, so the group the current page lives in is open. Collapse to the rail and expand again: the rail's flyout is the row's own state, so the app's groups are never closed for it — onOpenChange reports only what the user did."
        code={`<SidebarMenuSub label="Stock" open={open.Stock} onOpenChange={(v) => setOpen({ ...open, Stock: v })}>
  …
</SidebarMenuSub>`}
      >
        <ControlledGroups />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>6. Headings in a group, and the current-row mark</h2>
      <CodeExample
        title="SidebarMenuSubLabel, and the guide tokens"
        description="SidebarMenuSubLabel heads a run of rows: not focusable, and kept out of the list's item count. The guide line is --zen-sidebar-guide (colour) and --zen-sidebar-guide-width; --zen-sidebar-guide-current puts a mark on it beside the active row. The mark is transparent unless you set it — this panel sets it to the primary colour. To style the whole group that holds the current page, [data-sidebar=menu-sub]:has([data-active]) selects its list."
        code={`<SidebarMenuSub label="Selling" defaultOpen>
  <SidebarMenuSubLabel>Transactions</SidebarMenuSubLabel>
  <SidebarMenuSubItem>
    <SidebarMenuSubButton asChild active>
      <Link to="/orders">Sales orders</Link>
    </SidebarMenuSubButton>
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
      </CodeExample>
    </section>
  </div>
);

export default NewSidebarDemo;

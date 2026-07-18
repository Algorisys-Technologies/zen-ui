import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs/tabs";
import { Badge } from "./badge/badge";
import { CodeExample } from "./demo-helpers";

const NewTabsDemo: React.FC = () => {
  const [tab, setTab] = useState("overview");

  return (
    <div className="demo-page">
      <h1>Tabs</h1>
      <p className="lede">
        Radix-backed compound API for switching between sibling
        sections. Two visual variants — minimal{" "}
        <code>underline</code> (default) and contained{" "}
        <code>pills</code>. Use Tabs when sections are equal peers; use{" "}
        <a href="#/stepper">Stepper</a> when there's a forward-only
        flow with per-step validation.
      </p>

      <section className="demo-section">
        <h2>1. Default — underline variant</h2>
        <CodeExample
          title="Three peers, no validation"
          code={`<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="notes">Notes</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="activity">…</TabsContent>
  <TabsContent value="notes">…</TabsContent>
</Tabs>`}
        >
          <div style={{ width: "100%" }}>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <p className="zen-text-sm zen-py-2">
                  Summary of the customer record — recent purchases,
                  outstanding balance, lifetime value.
                </p>
              </TabsContent>
              <TabsContent value="activity">
                <p className="zen-text-sm zen-py-2">
                  Timeline of every interaction — emails, calls, support
                  tickets.
                </p>
              </TabsContent>
              <TabsContent value="notes">
                <p className="zen-text-sm zen-py-2">
                  Free-form internal notes only visible to the team.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Pills variant</h2>
        <CodeExample
          title='variant="pills" on TabsList + every TabsTrigger'
          description="Reads more like a segmented control / view switcher. Both list and trigger need the matching variant — they don't auto-coordinate."
          code={`<Tabs defaultValue="list">
  <TabsList variant="pills">
    <TabsTrigger variant="pills" value="list">List</TabsTrigger>
    <TabsTrigger variant="pills" value="board">Board</TabsTrigger>
    <TabsTrigger variant="pills" value="calendar">Calendar</TabsTrigger>
  </TabsList>
  <TabsContent value="list">…</TabsContent>
</Tabs>`}
        >
          <div style={{ width: "100%" }}>
            <Tabs defaultValue="list">
              <TabsList variant="pills">
                <TabsTrigger variant="pills" value="list">List</TabsTrigger>
                <TabsTrigger variant="pills" value="board">Board</TabsTrigger>
                <TabsTrigger variant="pills" value="calendar">Calendar</TabsTrigger>
              </TabsList>
              <TabsContent value="list">
                <p className="zen-text-sm zen-py-2">Linear list view.</p>
              </TabsContent>
              <TabsContent value="board">
                <p className="zen-text-sm zen-py-2">Kanban board view.</p>
              </TabsContent>
              <TabsContent value="calendar">
                <p className="zen-text-sm zen-py-2">Calendar view.</p>
              </TabsContent>
            </Tabs>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Vertical orientation</h2>
        <CodeExample
          title='orientation="vertical" on the Tabs root'
          description="Radix sets aria-orientation and wires Up/Down arrow nav automatically. Pair with a flex-row wrapper so the content sits beside the list."
          code={`<Tabs defaultValue="general" orientation="vertical" className="flex gap-6">
  <TabsList orientation="vertical">
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
  </TabsList>
  <div className="flex-1">
    <TabsContent value="general">…</TabsContent>
    …
  </div>
</Tabs>`}
        >
          <div style={{ width: "100%" }}>
            <Tabs
              defaultValue="general"
              orientation="vertical"
              className="zen-flex zen-gap-6"
            >
              <TabsList orientation="vertical" className="zen-min-w-[10rem]">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              <div style={{ flex: 1 }}>
                <TabsContent value="general">
                  <p className="zen-text-sm">Organization name, default currency, time zone.</p>
                </TabsContent>
                <TabsContent value="billing">
                  <p className="zen-text-sm">Payment method, plan, invoice history.</p>
                </TabsContent>
                <TabsContent value="security">
                  <p className="zen-text-sm">2FA, sessions, API keys.</p>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. With count badges</h2>
        <CodeExample
          title="Tabs accept arbitrary children — drop a Badge in the trigger"
          code={`<TabsTrigger value="inbox">
  Inbox <Badge variant="soft" color="info" className="ml-2">12</Badge>
</TabsTrigger>`}
        >
          <div style={{ width: "100%" }}>
            <Tabs defaultValue="inbox">
              <TabsList>
                <TabsTrigger value="inbox">
                  Inbox{" "}
                  <Badge variant="soft" color="info" className="zen-ml-2">
                    12
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="archive">
                  Archive{" "}
                  <Badge variant="soft" color="neutral" className="zen-ml-2">
                    87
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="trash">
                  Trash{" "}
                  <Badge variant="soft" color="error" className="zen-ml-2">
                    3
                  </Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="inbox">
                <p className="zen-text-sm zen-py-2">12 unread messages.</p>
              </TabsContent>
              <TabsContent value="archive">
                <p className="zen-text-sm zen-py-2">87 archived messages.</p>
              </TabsContent>
              <TabsContent value="trash">
                <p className="zen-text-sm zen-py-2">3 messages in trash.</p>
              </TabsContent>
            </Tabs>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Controlled</h2>
        <CodeExample
          title="value + onValueChange for external state"
          description="Useful when the active tab must sync with a URL search param, an external sidebar, or a parent's view-mode state."
          code={`const [tab, setTab] = useState("overview");
<Tabs value={tab} onValueChange={setTab}>…</Tabs>`}
        >
          <div style={{ width: "100%" }}>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <p className="zen-text-sm zen-py-2">
                  Current tab: <code>{tab}</code> (driven by external
                  React state).
                </p>
              </TabsContent>
              <TabsContent value="activity">
                <p className="zen-text-sm zen-py-2">
                  Current tab: <code>{tab}</code>.
                </p>
              </TabsContent>
              <TabsContent value="notes">
                <p className="zen-text-sm zen-py-2">
                  Current tab: <code>{tab}</code>.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Disabled trigger</h2>
        <CodeExample
          title="Lock a tab out until preconditions are met"
          code={`<TabsTrigger value="advanced" disabled>Advanced (Pro)</TabsTrigger>`}
        >
          <div style={{ width: "100%" }}>
            <Tabs defaultValue="basic">
              <TabsList>
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced" disabled>
                  Advanced (Pro)
                </TabsTrigger>
              </TabsList>
              <TabsContent value="basic">
                <p className="zen-text-sm zen-py-2">Available on the free plan.</p>
              </TabsContent>
              <TabsContent value="advanced">
                <p className="zen-text-sm zen-py-2">Pro-only.</p>
              </TabsContent>
            </Tabs>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewTabsDemo;

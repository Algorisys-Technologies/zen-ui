import { useMemo, useState } from "react";
import {
  NotificationsInbox,
  type Notification,
} from "./notifications-inbox/notifications-inbox";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const NOW = Date.now();
const min = (n: number) => NOW - n * 60_000;
const hr = (n: number) => NOW - n * 3_600_000;
const day = (n: number) => NOW - n * 86_400_000;

const SEED: Notification[] = [
  {
    id: "1",
    title: "Acme Corp accepted your proposal",
    description: "Deal moved to ‘Won’ — $48,200 ARR",
    timestamp: min(2),
    read: false,
  },
  {
    id: "2",
    title: "New comment on ‘Q3 roadmap’",
    description: "@priya: ‘Can we pull in the auth migration?’",
    timestamp: min(35),
    read: false,
  },
  {
    id: "3",
    title: "Invoice #INV-2042 is overdue",
    description: "Customer: Globex • 4 days past due",
    timestamp: hr(3),
    read: false,
  },
  {
    id: "4",
    title: "Weekly report is ready",
    timestamp: hr(20),
    read: true,
  },
  {
    id: "5",
    title: "Maya Patel joined the workspace",
    timestamp: day(1) + hr(2),
    read: true,
  },
  {
    id: "6",
    title: "Backup completed",
    description: "Took 12m 04s • 4.1 GB",
    timestamp: day(2),
    read: true,
  },
  {
    id: "7",
    title: "Security review reminder",
    description: "Quarterly check is due this Friday.",
    timestamp: day(5),
    read: true,
  },
];

const NewNotificationsInboxDemo: React.FC = () => {
  const [feed, setFeed] = useState<Notification[]>(SEED);
  const [controlledOpen, setControlledOpen] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const log = (s: string) =>
    setActionLog((prev) => [s, ...prev].slice(0, 4));

  const markAllRead = () =>
    setFeed((prev) => prev.map((n) => ({ ...n, read: true })));

  const markOneRead = (id: string) =>
    setFeed((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const approvalFeed = useMemo<Notification[]>(
    () => [
      {
        id: "a1",
        title: "Expense claim — $1,840",
        description: "Submitted by Daniel K. for client travel",
        timestamp: min(10),
        read: false,
      },
      {
        id: "a2",
        title: "Time-off request — 3 days",
        description: "Aug 12 – Aug 14 • Personal",
        timestamp: hr(2),
        read: false,
      },
    ],
    [],
  );

  return (
    <div className="demo-page">
      <h1>NotificationsInbox</h1>
      <p className="lede">
        Bell-icon trigger that opens a popover panel of notifications,
        grouped by day with a red unread-count badge, read / unread visual
        states, and optional per-row action buttons. Caller owns the data
        and mutations (mark-read, dismiss, fetch-more); the component is
        a pure presentation surface over a normalised{" "}
        <code>Notification[]</code> shape.
      </p>

      <section className="demo-section">
        <h2>1. Default — bell with unread badge</h2>
        <CodeExample
          title="Click the bell to open the panel"
          description="Items default to unread when `read` is omitted; the unread count is auto-computed from the data."
          code={`<NotificationsInbox
  notifications={feed}
  onItemSelect={(n) => markOneRead(n.id)}
  onMarkAllRead={() => markAll()}
/>`}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              minHeight: 56,
            }}
          >
            <NotificationsInbox
              notifications={feed}
              onItemSelect={(n) => {
                markOneRead(n.id);
                log(`Selected: ${n.id}`);
              }}
              onMarkAllRead={markAllRead}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFeed(SEED)}
            >
              Reset feed
            </Button>
            <span style={{ fontSize: "0.75rem", color: "var(--zen-color-muted-fg)" }}>
              {feed.filter((n) => !n.read).length} unread
            </span>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Controlled open</h2>
        <CodeExample
          title="open + onOpenChange"
          description={
            "Drive the panel from anywhere — keyboard shortcut, deep link, parent menu state. Use explicit Open / Close buttons rather than a toggle so the external action doesn't race with Radix's outside-click dismissal."
          }
          code={`const [open, setOpen] = useState(false);
<NotificationsInbox
  open={open}
  onOpenChange={setOpen}
  notifications={feed}
/>
<Button onClick={() => setOpen(true)} disabled={open}>Open</Button>
<Button onClick={() => setOpen(false)} disabled={!open} variant="outline">Close</Button>`}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <NotificationsInbox
              notifications={feed}
              open={controlledOpen}
              onOpenChange={setControlledOpen}
            />
            <Button
              onClick={() => setControlledOpen(true)}
              disabled={controlledOpen}
            >
              Open panel
            </Button>
            <Button
              variant="outline"
              onClick={() => setControlledOpen(false)}
              disabled={!controlledOpen}
            >
              Close panel
            </Button>
            <span style={{ fontSize: "0.75rem", color: "var(--zen-color-muted-fg)" }}>
              open: <code>{String(controlledOpen)}</code>
            </span>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Per-row actions (Approve / Decline pattern)</h2>
        <CodeExample
          title="actions slot — render any node alongside the timestamp"
          description="Useful for approval queues where the row IS the action surface, no detail-page navigation needed."
          code={`const actions = (
  <>
    <Button size="sm" onClick={approve}>Approve</Button>
    <Button size="sm" variant="outline" onClick={decline}>Decline</Button>
  </>
);
<NotificationsInbox
  notifications={queue.map(n => ({ ...n, actions }))}
/>`}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <NotificationsInbox
              triggerLabel="Approvals"
              notifications={approvalFeed.map((n) => ({
                ...n,
                actions: (
                  <>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        log(`Approved ${n.id}`);
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        log(`Declined ${n.id}`);
                      }}
                    >
                      Decline
                    </Button>
                  </>
                ),
              }))}
            />
            <div style={{ fontSize: "0.75rem", color: "var(--zen-color-muted-fg)" }}>
              {actionLog.length === 0 ? (
                <em>No actions yet</em>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {actionLog.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. With "View all" footer</h2>
        <CodeExample
          title='onViewAll — renders a footer link when set'
          description="Pair with a /notifications page that lists the full history; the panel itself usually paginates to the last 10–20."
          code={`<NotificationsInbox
  notifications={recent}
  onViewAll={() => router.push("/notifications")}
/>`}
        >
          <NotificationsInbox
            notifications={feed.slice(0, 5)}
            onViewAll={() => log("Navigated to /notifications")}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Badge overflow — 99+ cap</h2>
        <CodeExample
          title='unreadCount + badgeMax — for "your inbox is on fire" states'
          description="When the server's unread total exceeds what's loaded in `notifications`, pass `unreadCount` to override the badge."
          code={`<NotificationsInbox
  notifications={loaded}
  unreadCount={142}
  badgeMax={99}
/>`}
        >
          <NotificationsInbox
            notifications={feed}
            unreadCount={142}
            badgeMax={99}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Empty state</h2>
        <CodeExample
          title='No notifications — "all caught up"'
          code={`<NotificationsInbox notifications={[]} />`}
        >
          <NotificationsInbox notifications={[]} />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewNotificationsInboxDemo;

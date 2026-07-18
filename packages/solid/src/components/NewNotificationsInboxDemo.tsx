import { createSignal } from "solid-js";
import { NotificationsInbox, type Notification } from "./notifications-inbox/notifications-inbox";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewNotificationsInboxDemo = () => {
  const seed = (): Notification[] => [
    {
      id: "1",
      title: "Ada Lovelace mentioned you in a comment",
      description: "“…and on the analytical engine front, see Babbage's paper.”",
      timestamp: new Date(Date.now() - 5 * 60_000),
      read: false,
    },
    {
      id: "2",
      title: "New invoice from Algorisys",
      description: "INV-2042 — ₹12,500 due Sep 15",
      timestamp: new Date(Date.now() - 3 * 60 * 60_000),
      read: false,
    },
    {
      id: "3",
      title: "Build #482 passed",
      timestamp: new Date(Date.now() - 26 * 60 * 60_000),
      read: true,
    },
    {
      id: "4",
      title: "Weekly digest",
      description: "12 deploys, 4 incidents resolved.",
      timestamp: new Date(Date.now() - 3 * 86_400_000),
      read: true,
    },
  ];
  const [items, setItems] = createSignal<Notification[]>(seed());
  return (
    <DemoPage
      title="NotificationsInbox"
      description="Bell trigger with unread count + Popover panel grouped by day."
    >
      <DemoSection
        title="Default"
        codeTitle="Click the bell — the unread badge is derived from the data"
        codeDescription="The caller owns the feed and its mutations; the inbox is a pure presentation surface over a Notification[]."
        code={`const [items, setItems] = createSignal<Notification[]>([
  {
    id: "1",
    title: "Ada Lovelace mentioned you in a comment",
    description: "…see Babbage's paper.",
    timestamp: new Date(Date.now() - 5 * 60_000),
    read: false,
  },
  {
    id: "2",
    title: "Build #482 passed",
    timestamp: new Date(Date.now() - 26 * 60 * 60_000),
    read: true,
  },
]);

<NotificationsInbox
  notifications={items()}
  onItemSelect={(n) => alert(\`Open: \${n.id}\`)}
  onMarkAllRead={() =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }
  onViewAll={() => alert("Navigate to /notifications")}
/>`}
      >
        <div class="zen-flex zen-items-center zen-gap-3">
          <NotificationsInbox
            notifications={items()}
            onItemSelect={(n) => alert(`Open: ${n.id}`)}
            onMarkAllRead={() =>
              setItems((prev) => prev.map((n) => ({ ...n, read: true })))
            }
            onViewAll={() => alert("Navigate to /notifications")}
          />
          <span class="zen-text-xs zen-text-zen-muted-fg">↑ click the bell</span>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewNotificationsInboxDemo;

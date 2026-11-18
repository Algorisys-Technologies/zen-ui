import type { Notification } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * NotificationsInbox demo — the web-components port. <zen-notifications-inbox>
 * renders from the `notifications` JS property; `open` is a controlled JS property;
 * `zen-item-select` / `zen-mark-all-read` / `zen-view-all` / `zen-open-change`
 * report what the user did. The caller owns the data and the mutations.
 */

const NOW = Date.now();
const min = (n: number) => NOW - n * 60_000;
const hr = (n: number) => NOW - n * 3_600_000;
const day = (n: number) => NOW - n * 86_400_000;

const SEED: Notification[] = [
  { id: "1", title: "Acme Corp accepted your proposal", description: "Deal moved to ‘Won’ — $48,200 ARR", timestamp: min(2), read: false },
  { id: "2", title: "New comment on ‘Q3 roadmap’", description: "@priya: ‘Can we pull in the auth migration?’", timestamp: min(35), read: false },
  { id: "3", title: "Invoice #INV-2042 is overdue", description: "Customer: Globex • 4 days past due", timestamp: hr(3), read: false },
  { id: "4", title: "Weekly report is ready", timestamp: hr(20), read: true },
  { id: "5", title: "Maya Patel joined the workspace", timestamp: day(1) + hr(2), read: true },
  { id: "6", title: "Backup completed", description: "Took 12m 04s • 4.1 GB", timestamp: day(2), read: true },
  { id: "7", title: "Security review reminder", description: "Quarterly check is due this Friday.", timestamp: day(5), read: true },
];

const APPROVALS: Notification[] = [
  { id: "a1", title: "Expense claim — $1,840", description: "Submitted by Daniel K. for client travel", timestamp: min(10), read: false },
  { id: "a2", title: "Time-off request — 3 days", description: "Aug 12 – Aug 14 • Personal", timestamp: hr(2), read: false },
];

const mutedSpan = (): HTMLSpanElement => {
  const s = document.createElement("span");
  s.style.fontSize = "0.75rem";
  s.style.color = "var(--zen-color-muted-fg)";
  return s;
};

const row = (gap: number): HTMLDivElement => {
  const r = document.createElement("div");
  r.style.display = "flex";
  r.style.alignItems = "center";
  r.style.gap = `${gap}px`;
  return r;
};

function inbox(setup: (el: HTMLElement) => void = () => {}): HTMLElement {
  const el = document.createElement("zen-notifications-inbox");
  setup(el);
  return el;
}

function actionButton(label: string, variant: string | null, onClick: (e: Event) => void): HTMLElement {
  const b = document.createElement("zen-button");
  b.setAttribute("size", "sm");
  if (variant) b.setAttribute("variant", variant);
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

export default function NotificationsInboxDemo(): HTMLElement {
  return DemoPage({
    title: "NotificationsInbox",
    description:
      "Bell-icon trigger that opens a popover panel of notifications, grouped by day with a red unread-count badge, read / unread visual states, and optional per-row action buttons. Caller owns the data and mutations (mark-read, dismiss, fetch-more); the component is a pure presentation surface over a normalised Notification[] shape.",
    sections: [
      {
        title: "1. Default — bell with unread badge",
        codeTitle: "Click the bell to open the panel",
        codeDescription:
          "Items default to unread when `read` is omitted; the unread count is auto-computed from the data.",
        code: `const el = document.querySelector("zen-notifications-inbox");
el.notifications = feed;
el.addEventListener("zen-item-select", (e) => markOneRead(e.detail.id));
el.addEventListener("zen-mark-all-read", () => markAll());`,
        render: () => {
          let feed = SEED.map((n) => ({ ...n }));
          const unread = mutedSpan();
          const refresh = () => {
            unread.textContent = `${feed.filter((n) => !n.read).length} unread`;
          };
          const el = inbox((node) => {
            (node as unknown as { notifications: Notification[] }).notifications = feed;
          });
          el.addEventListener("zen-item-select", (e) => {
            const n = (e as CustomEvent).detail as Notification;
            feed = feed.map((x) => (x.id === n.id ? { ...x, read: true } : x));
            (el as unknown as { notifications: Notification[] }).notifications = feed;
            refresh();
          });
          el.addEventListener("zen-mark-all-read", () => {
            feed = feed.map((n) => ({ ...n, read: true }));
            (el as unknown as { notifications: Notification[] }).notifications = feed;
            refresh();
          });

          const reset = document.createElement("zen-button");
          reset.setAttribute("variant", "outline");
          reset.setAttribute("size", "sm");
          reset.textContent = "Reset feed";
          reset.addEventListener("click", () => {
            feed = SEED.map((n) => ({ ...n }));
            (el as unknown as { notifications: Notification[] }).notifications = feed;
            refresh();
          });
          refresh();

          const r = row(16);
          r.style.minHeight = "56px";
          r.append(el, reset, unread);
          return r;
        },
      },
      {
        title: "2. Controlled open",
        codeTitle: "open + zen-open-change",
        codeDescription:
          "Drive the panel from anywhere — keyboard shortcut, deep link, parent menu state. Use explicit Open / Close buttons rather than a toggle so the external action doesn't race with the outside-click dismissal.",
        code: `const el = document.querySelector("zen-notifications-inbox");
el.open = false;
el.addEventListener("zen-open-change", (e) => { open = e.detail; sync(); });`,
        render: () => {
          let open = false;
          const stateWrap = mutedSpan();
          stateWrap.append(document.createTextNode("open: "));
          const code = document.createElement("code");
          stateWrap.append(code);

          const el = inbox((node) => {
            (node as unknown as { notifications: Notification[] }).notifications = SEED;
            (node as unknown as { open: boolean }).open = open;
          });

          const openBtn = document.createElement("zen-button");
          openBtn.textContent = "Open panel";
          const closeBtn = document.createElement("zen-button");
          closeBtn.setAttribute("variant", "outline");
          closeBtn.textContent = "Close panel";

          const sync = () => {
            (el as unknown as { open: boolean }).open = open;
            if (open) openBtn.setAttribute("disabled", "");
            else openBtn.removeAttribute("disabled");
            if (!open) closeBtn.setAttribute("disabled", "");
            else closeBtn.removeAttribute("disabled");
            code.textContent = String(open);
          };
          openBtn.addEventListener("click", () => {
            open = true;
            sync();
          });
          closeBtn.addEventListener("click", () => {
            open = false;
            sync();
          });
          el.addEventListener("zen-open-change", (e) => {
            open = (e as CustomEvent).detail as boolean;
            sync();
          });
          sync();

          const r = row(12);
          r.append(el, openBtn, closeBtn, stateWrap);
          return r;
        },
      },
      {
        title: "3. Per-row actions (Approve / Decline pattern)",
        codeTitle: "actions slot — render any node alongside the timestamp",
        codeDescription:
          "Useful for approval queues where the row IS the action surface, no detail-page navigation needed.",
        code: `el.notifications = queue.map((n) => ({
  ...n,
  actions: [approveBtn, declineBtn],
}));`,
        render: () => {
          const logList = document.createElement("div");
          logList.style.fontSize = "0.75rem";
          logList.style.color = "var(--zen-color-muted-fg)";
          const logs: string[] = [];
          const renderLog = () => {
            logList.replaceChildren();
            if (logs.length === 0) {
              const em = document.createElement("em");
              em.textContent = "No actions yet";
              logList.append(em);
              return;
            }
            const ul = document.createElement("ul");
            ul.style.listStyle = "none";
            ul.style.padding = "0";
            ul.style.margin = "0";
            for (const a of logs) {
              const li = document.createElement("li");
              li.textContent = a;
              ul.append(li);
            }
            logList.append(ul);
          };
          const log = (s: string) => {
            logs.unshift(s);
            logs.length = Math.min(logs.length, 4);
            renderLog();
          };
          renderLog();

          const feed: Notification[] = APPROVALS.map((n) => ({
            ...n,
            actions: [
              actionButton("Approve", null, (e) => {
                e.stopPropagation();
                log(`Approved ${n.id}`);
              }),
              actionButton("Decline", "outline", (e) => {
                e.stopPropagation();
                log(`Declined ${n.id}`);
              }),
            ],
          }));

          const el = inbox((node) => {
            node.setAttribute("trigger-label", "Approvals");
            (node as unknown as { notifications: Notification[] }).notifications = feed;
          });

          const r = row(16);
          r.append(el, logList);
          return r;
        },
      },
      {
        title: '4. With "View all" footer',
        codeTitle: "zen-view-all — renders a footer link when a listener is attached",
        codeDescription:
          "Pair with a /notifications page that lists the full history; the panel itself usually paginates to the last 10–20.",
        code: `el.addEventListener("zen-view-all", () => router.push("/notifications"));`,
        render: () => {
          const status = mutedSpan();
          const el = inbox((node) => {
            (node as unknown as { notifications: Notification[] }).notifications = SEED.slice(0, 5);
          });
          el.addEventListener("zen-view-all", () => {
            status.textContent = "Navigated to /notifications";
          });
          const r = row(16);
          r.append(el, status);
          return r;
        },
      },
      {
        title: "5. Badge overflow — 99+ cap",
        codeTitle: 'unread-count + badge-max — for "your inbox is on fire" states',
        codeDescription:
          "When the server's unread total exceeds what's loaded in `notifications`, pass `unread-count` to override the badge.",
        code: `<zen-notifications-inbox unread-count="142" badge-max="99"></zen-notifications-inbox>`,
        render: () =>
          inbox((node) => {
            node.setAttribute("unread-count", "142");
            node.setAttribute("badge-max", "99");
            (node as unknown as { notifications: Notification[] }).notifications = SEED;
          }),
      },
      {
        title: "6. Empty state",
        codeTitle: 'No notifications — "all caught up"',
        code: `el.notifications = [];`,
        render: () =>
          inbox((node) => {
            (node as unknown as { notifications: Notification[] }).notifications = [];
          }),
      },
    ],
  });
}

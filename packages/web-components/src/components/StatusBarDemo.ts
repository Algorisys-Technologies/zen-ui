import { Button, type StatusBarItem, type StatusBarProps } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * StatusBar demo — the web-components port. Items with `onSelect` or an
 * element label are set as the `items` PROPERTY; JSON in the attribute covers
 * text-only bars (section 3 shows that form).
 */

type BarEl = HTMLElement & Record<string, unknown>;

const statusBar = (props: Partial<StatusBarProps>): BarEl => {
  const el = document.createElement("zen-status-bar") as BarEl;
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) el[key] = value;
  }
  return el;
};

// minmax(0, 1fr): an auto track would grow with the resizable box in section 4
// and let the card clip the bar instead of the bar collapsing.
const stack = (...children: Node[]) => {
  const d = document.createElement("div");
  Object.assign(d.style, { display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "12px", width: "100%" });
  d.append(...children);
  return d;
};

export default function StatusBarDemo(): HTMLElement {
  let problems = 2;
  const opened = document.createElement("span");
  opened.setAttribute("data-testid", "opened");
  const open = (what: string) => (opened.textContent = `Last opened: ${what}`);
  open("nothing yet");

  const editor = (): StatusBarItem[] => [
    { id: "branch", icon: "flag", label: "main", title: "Current branch", priority: 3 },
    { id: "sync", icon: "download", label: "Pull", onSelect: () => open("pull"), priority: 1 },
    {
      id: "problems",
      icon: problems > 0 ? "error" : "check-circle",
      label: String(problems),
      title: "Problems",
      color: problems > 0 ? "error" : undefined,
      onSelect: () => open("problems"),
      priority: 5,
    },
    { id: "cursor", label: "Ln 42, Col 7", align: "end", onSelect: () => open("go to line") },
    { id: "indent", label: "Spaces: 2", align: "end", separatorBefore: true },
    { id: "encoding", label: "UTF-8", align: "end" },
    { id: "lang", label: "TypeScript", align: "end", onSelect: () => open("language"), priority: 2 },
    { id: "bell", icon: "bell", title: "Notifications", align: "end", onSelect: () => open("notifications"), priority: 4 },
  ];
  // Every bar drawn from `editor()`, so the problem toggle reaches all of them.
  const editorBars: BarEl[] = [];
  const editorBar = (extra: Partial<StatusBarProps> = {}) => {
    const bar = statusBar({ items: editor(), ...extra });
    editorBars.push(bar);
    return bar;
  };

  return DemoPage({
    title: "StatusBar",
    description:
      "The strip along the bottom of an app, an editor or a panel: the state of the thing you are working on, and shortcuts to the places it points at. Items are data, so the bar can decide what still fits when it is narrow.",
    sections: [
      {
        title: "1. An editor's status bar",
        codeTitle: "start and end, text and buttons",
        codeDescription:
          'An item with onSelect is a button; one without is text. align: "end" puts it on the far side. An item with only an icon needs a title — it becomes the tooltip and the accessible name.',
        code: `<zen-status-bar id="bar"></zen-status-bar>

<script>
  document.querySelector("#bar").items = [
    { id: "branch", icon: "flag", label: "main", title: "Current branch" },
    { id: "problems", icon: "error", label: "2", color: "error", onSelect: openProblems },
    { id: "cursor", label: "Ln 42, Col 7", align: "end", onSelect: goToLine },
    { id: "indent", label: "Spaces: 2", align: "end", separatorBefore: true },
    { id: "bell", icon: "bell", title: "Notifications", align: "end", onSelect: openInbox },
  ];
</script>`,
        render: () => {
          const row = document.createElement("div");
          row.className = "zen-flex zen-flex-wrap zen-items-center zen-gap-2 zen-text-sm";
          const toggle = Button({
            variant: "outline",
            size: "sm",
            children: "Fix the problems",
            onClick: () => {
              problems = problems > 0 ? 0 : 2;
              toggle.update({ children: problems > 0 ? "Fix the problems" : "Break something" });
              for (const b of editorBars) b.items = editor();
            },
          });
          row.append(toggle.el, opened);
          return stack(editorBar(), row);
        },
      },
      {
        title: "2. Variants and sizes",
        codeTitle: 'variant: "default" | "muted" | "accent", size: "sm" | "md"',
        codeDescription:
          "accent fills the bar with the primary colour, for the one bar an app wants noticed. Coloured items are soft chips, so they read on every variant.",
        code: `<zen-status-bar></zen-status-bar>
<zen-status-bar variant="muted"></zen-status-bar>
<zen-status-bar variant="accent" size="sm"></zen-status-bar>`,
        render: () =>
          stack(
            editorBar({ label: "Default status bar" }),
            editorBar({ variant: "muted", label: "Muted status bar" }),
            editorBar({ variant: "accent", label: "Accent status bar" }),
            editorBar({ variant: "accent", size: "sm", label: "Small accent status bar" }),
          ),
      },
      {
        title: "3. Colours",
        codeTitle: 'color: "info" | "success" | "warning" | "error"',
        code: `<zen-status-bar items='[
  {"id":"env","label":"Staging","color":"warning"},
  {"id":"build","icon":"check-circle","label":"Build passed","color":"success"},
  {"id":"sync","icon":"info","label":"3 changes to sync","color":"info"},
  {"id":"errors","icon":"error","label":"1 failed job","color":"error","align":"end"}
]'></zen-status-bar>`,
        render: () => {
          const el = document.createElement("zen-status-bar");
          el.setAttribute(
            "items",
            JSON.stringify([
              { id: "env", label: "Staging", color: "warning" },
              { id: "build", icon: "check-circle", label: "Build passed", color: "success" },
              { id: "sync", icon: "info", label: "3 changes to sync", color: "info" },
              { id: "errors", icon: "error", label: "1 failed job", color: "error", align: "end" },
            ]),
          );
          return el;
        },
      },
      {
        title: "4. When it is narrow",
        codeTitle: "priority decides what gives way",
        codeDescription:
          "Drag the corner to narrow the bar. Items give way lowest priority first, and between equals the one later in the list; the rest keep their full width. A collapsed item is gone for a screen reader too, so give anything nobody may miss a high priority. onCollapse reports what went.",
        code: `<zen-status-bar></zen-status-bar>
bar.addEventListener("zen-collapse", (e) => showCollapsed(e.detail));
// branch 3 · pull 1 · problems 5 · notifications 4 · language 2 · the rest 0`,
        render: () => {
          const box = document.createElement("div");
          box.setAttribute("data-testid", "narrow");
          Object.assign(box.style, { resize: "horizontal", overflow: "hidden", width: "100%", minWidth: "60px", maxWidth: "100%", border: "1px dashed var(--zen-color-border)" });
          const out = document.createElement("span");
          out.className = "zen-text-sm";
          out.setAttribute("data-testid", "collapsed");
          out.textContent = "Collapsed: nothing";
          const bar = editorBar();
          bar.addEventListener("zen-collapse", (e) => {
            const ids = (e as CustomEvent<string[]>).detail;
            out.textContent = `Collapsed: ${ids.length ? ids.join(", ") : "nothing"}`;
          });
          box.append(bar);
          return stack(box, out);
        },
      },
      {
        title: "5. Live content",
        codeTitle: "any element as a label; announce only what matters",
        codeDescription:
          "A label can be any element — here a LiveIndicator and a clock. Item text is not read out when it changes, or the clock would speak every second; announce makes one item a polite live region, for the change a person needs to hear.",
        code: `const live = document.createElement("zen-live-indicator");
live.lastUpdated = fetchedAt;
bar.items = [
  { id: "save", label: "All changes saved", announce: true },
  { id: "live", label: live, align: "end" },
  { id: "clock", label: clock, align: "end" },
];
// later — the bar keeps its DOM, so the change is announced
bar.items = [{ id: "save", label: "Saving…", announce: true }, …];`,
        render: () => {
          let saved = true;
          const live = document.createElement("zen-live-indicator") as BarEl;
          live.lastUpdated = Date.now();
          live.size = "sm";
          const clock = document.createElement("span");
          clock.className = "zen-tabular-nums";
          const tick = () => (clock.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
          tick();
          const items = (): StatusBarItem[] => [
            { id: "save", icon: saved ? "check" : "clock", label: saved ? "All changes saved" : "Saving…", announce: true },
            { id: "live", label: live, align: "end", priority: 1 },
            { id: "clock", label: clock, align: "end" },
          ];
          const bar = statusBar({ items: items() });
          const toggle = Button({
            variant: "outline",
            size: "sm",
            children: "Edit something",
            onClick: () => {
              saved = !saved;
              bar.items = items();
              toggle.update({ children: saved ? "Edit something" : "Finish saving" });
            },
          });
          const row = document.createElement("div");
          row.append(toggle.el);
          let started = false;
          const timer = setInterval(() => {
            // Stop once the page has navigated away and taken the demo with it.
            if (bar.isConnected) started = true;
            else if (started) {
              clearInterval(timer);
              return;
            }
            tick();
          }, 1000);
          return stack(bar, row);
        },
      },
    ],
  });
}

import { createSignal, onCleanup } from "solid-js";
import { StatusBar, type StatusBarItem } from "./status-bar/status-bar";
import { LiveIndicator } from "./live-indicator/live-indicator";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

// minmax(0, 1fr): an auto track would grow with the resizable box in section 4
// and let the card clip the bar instead of the bar collapsing.
const STACK = { display: "grid", "grid-template-columns": "minmax(0, 1fr)", gap: "12px" } as const;

const NewStatusBarDemo = () => {
  const [problems, setProblems] = createSignal(2);
  const [opened, setOpened] = createSignal("nothing yet");
  const [collapsed, setCollapsed] = createSignal<string[]>([]);
  const [saved, setSaved] = createSignal(true);
  const [fetched] = createSignal(Date.now());
  const [clock, setClock] = createSignal(new Date());
  const timer = setInterval(() => setClock(new Date()), 1000);
  onCleanup(() => clearInterval(timer));
  const time = () => clock().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  // Built once: an element is one DOM node, and the items below are rebuilt on every change.
  const liveNode = <LiveIndicator lastUpdated={fetched()} size="sm" />;
  const clockNode = <span class="zen-tabular-nums">{time()}</span>;

  const editor = (): StatusBarItem[] => [
    { id: "branch", icon: "flag", label: "main", title: "Current branch", priority: 3 },
    { id: "sync", icon: "download", label: "Pull", onSelect: () => setOpened("pull"), priority: 1 },
    {
      id: "problems",
      icon: problems() > 0 ? "error" : "check-circle",
      label: String(problems()),
      title: "Problems",
      color: problems() > 0 ? "error" : undefined,
      onSelect: () => setOpened("problems"),
      priority: 5,
    },
    { id: "cursor", label: "Ln 42, Col 7", align: "end", onSelect: () => setOpened("go to line") },
    { id: "indent", label: "Spaces: 2", align: "end", separatorBefore: true },
    { id: "encoding", label: "UTF-8", align: "end" },
    { id: "lang", label: "TypeScript", align: "end", onSelect: () => setOpened("language"), priority: 2 },
    { id: "bell", icon: "bell", title: "Notifications", align: "end", onSelect: () => setOpened("notifications"), priority: 4 },
  ];

  return (
    <DemoPage
      title="StatusBar"
      description={
        <>
          The strip along the bottom of an app, an editor or a panel: the state of the thing
          you are working on, and shortcuts to the places it points at. Items are data, so the
          bar can decide what still fits when it is narrow.
        </>
      }
    >
      <DemoSection
        title="1. An editor's status bar"
        codeTitle="start and end, text and buttons"
        codeDescription={
          <>
            An item with <code>onSelect</code> is a button; one without is text.{" "}
            <code>align: "end"</code> puts it on the far side. An item with only an icon needs a{" "}
            <code>title</code> — it becomes the tooltip and the accessible name.
          </>
        }
        code={`<StatusBar items={[
  { id: "branch", icon: "flag", label: "main", title: "Current branch" },
  { id: "problems", icon: "error", label: "2", color: "error", onSelect: openProblems },
  { id: "cursor", label: "Ln 42, Col 7", align: "end", onSelect: goToLine },
  { id: "indent", label: "Spaces: 2", align: "end", separatorBefore: true },
  { id: "bell", icon: "bell", title: "Notifications", align: "end", onSelect: openInbox },
]} />`}
        previewStyle={STACK}
      >
        <StatusBar items={editor()} />
        <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2 zen-text-sm">
          <Button variant="outline" size="sm" onClick={() => setProblems((n) => (n > 0 ? 0 : 2))}>
            {problems() > 0 ? "Fix the problems" : "Break something"}
          </Button>
          <span data-testid="opened">Last opened: {opened()}</span>
        </div>
      </DemoSection>

      <DemoSection
        title="2. Variants and sizes"
        codeTitle={'variant="default" | "muted" | "accent", size="sm" | "md"'}
        codeDescription={
          <>
            <code>accent</code> fills the bar with the primary colour, for the one bar an app
            wants noticed. Coloured items are soft chips, so they read on every variant.
          </>
        }
        code={`<StatusBar items={items} />
<StatusBar items={items} variant="muted" />
<StatusBar items={items} variant="accent" size="sm" />`}
        previewStyle={STACK}
      >
        <StatusBar items={editor()} label="Default status bar" />
        <StatusBar items={editor()} variant="muted" label="Muted status bar" />
        <StatusBar items={editor()} variant="accent" label="Accent status bar" />
        <StatusBar items={editor()} variant="accent" size="sm" label="Small accent status bar" />
      </DemoSection>

      <DemoSection
        title="3. Colours"
        codeTitle={'color="info" | "success" | "warning" | "error"'}
        code={`<StatusBar items={[
  { id: "env", label: "Staging", color: "warning" },
  { id: "build", icon: "check-circle", label: "Build passed", color: "success" },
  { id: "sync", icon: "info", label: "3 changes to sync", color: "info", onSelect: sync },
  { id: "errors", icon: "error", label: "1 failed job", color: "error", align: "end" },
]} />`}
      >
        <StatusBar
          items={[
            { id: "env", label: "Staging", color: "warning" },
            { id: "build", icon: "check-circle", label: "Build passed", color: "success" },
            { id: "sync", icon: "info", label: "3 changes to sync", color: "info", onSelect: () => setOpened("sync") },
            { id: "errors", icon: "error", label: "1 failed job", color: "error", align: "end" },
          ]}
        />
      </DemoSection>

      <DemoSection
        title="4. When it is narrow"
        codeTitle="priority decides what gives way"
        codeDescription={
          <>
            Drag the corner to narrow the bar. Items give way lowest <code>priority</code>{" "}
            first, and between equals the one later in the list; the rest keep their full
            width. A collapsed item is gone for a screen reader too, so give anything nobody
            may miss a high priority. <code>onCollapse</code> reports what went.
          </>
        }
        code={`<StatusBar items={items} onCollapse={(ids) => setCollapsed(ids)} />
// branch 3 · pull 1 · problems 5 · notifications 4 · language 2 · the rest 0`}
        previewStyle={STACK}
      >
        <div
          data-testid="narrow"
          style={{ resize: "horizontal", overflow: "hidden", width: "100%", "min-width": "60px", "max-width": "100%", border: "1px dashed var(--zen-color-border)" }}
        >
          <StatusBar items={editor()} onCollapse={setCollapsed} />
        </div>
        <span class="zen-text-sm" data-testid="collapsed">
          Collapsed: {collapsed().length ? collapsed().join(", ") : "nothing"}
        </span>
      </DemoSection>

      <DemoSection
        title="5. Live content"
        codeTitle="any element as a label; announce only what matters"
        codeDescription={
          <>
            A <code>label</code> can be any element — here a LiveIndicator and a clock. Item
            text is not read out when it changes, or the clock would speak every second;{" "}
            <code>announce</code> makes one item a polite live region, for the change a person
            needs to hear.
          </>
        }
        code={`<StatusBar items={[
  { id: "save", label: saved() ? "All changes saved" : "Saving…", announce: true },
  { id: "live", label: <LiveIndicator lastUpdated={fetchedAt()} size="sm" />, align: "end" },
  { id: "clock", label: <span>{time()}</span>, align: "end" },
]} />`}
        previewStyle={STACK}
      >
        <StatusBar
          items={[
            { id: "save", icon: saved() ? "check" : "clock", label: saved() ? "All changes saved" : "Saving…", announce: true },
            { id: "live", label: liveNode, align: "end", priority: 1 },
            { id: "clock", label: clockNode, align: "end" },
          ]}
        />
        <div>
          <Button variant="outline" size="sm" onClick={() => setSaved((s) => !s)}>
            {saved() ? "Edit something" : "Finish saving"}
          </Button>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewStatusBarDemo;

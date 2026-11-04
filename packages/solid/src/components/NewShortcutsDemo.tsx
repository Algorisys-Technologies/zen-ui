import { For, createSignal } from "solid-js";
import { ShortcutProvider, ShortcutHelp, Kbd, useShortcut, keyshortcut, shortcutLabel } from "./shortcuts/shortcuts";
import { Button } from "./button/button";
import { Input } from "./form/input/input";
import { DemoPage, DemoSection } from "./demo-helpers";

/** A small working panel: its keys are registered while it is on screen. */
const Panel = (props: { log: (s: string) => void }) => {
  let panel: HTMLDivElement | undefined;
  const [rows, setRows] = createSignal(["Invoice SI/26/0001", "Invoice SI/26/0002", "Invoice SI/26/0003"]);
  const [selected, setSelected] = createSignal(0);
  useShortcut("Mod+S", () => props.log("Saved"), { description: "Save", group: "This panel", allowInFields: true });
  useShortcut("Alt+N", () => {
    setRows((r) => [...r, `Invoice SI/26/000${r.length + 1}`]);
    props.log("New row");
  }, { description: "New row", group: "This panel" });
  useShortcut("Delete", () => {
    const i = selected();
    setRows((r) => r.filter((_, j) => j !== i));
    props.log(`Deleted row ${i + 1}`);
  }, { description: "Delete the selected row (with focus in the panel)", group: "This panel", within: () => panel });
  return (
    <div ref={panel} class="zen-flex zen-w-full zen-max-w-lg zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-p-4" data-testid="panel">
      <div class="zen-flex zen-flex-wrap zen-gap-2">
        <Button size="sm" aria-keyshortcuts={keyshortcut("Mod+S")} title={`Save (${shortcutLabel("Mod+S")})`} onClick={() => props.log("Saved")}>
          Save <Kbd keys="Mod+S" class="zen-ml-1.5" />
        </Button>
        <Button size="sm" variant="outline" aria-keyshortcuts={keyshortcut("Alt+N")} title={`New row (${shortcutLabel("Alt+N")})`} onClick={() => setRows((r) => [...r, "Invoice (new)"])}>
          New row <Kbd keys="Alt+N" class="zen-ml-1.5" />
        </Button>
      </div>
      <Input placeholder="Type here: Ctrl+S still saves; Delete stays the field's" aria-label="Notes" />
      <ul class="zen-m-0 zen-list-none zen-p-0" role="listbox" aria-label="Rows">
        <For each={rows()}>
          {(r, i) => (
            <li
              role="option"
              tabIndex={0}
              aria-selected={selected() === i()}
              onFocus={() => setSelected(i())}
              class="zen-rounded-zen-sm zen-px-2 zen-py-1 zen-text-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring aria-selected:zen-bg-zen-muted"
            >
              {r}
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};

const NewShortcutsDemo = () => {
  const [log, setLog] = createSignal("");
  const [helpOpen, setHelpOpen] = createSignal(false);
  return (
    <ShortcutProvider>
      <DemoPage
        title="Shortcuts"
        description="Keyboard shortcuts as a system: Kbd draws a chord's keys, useShortcut answers one while a component is on screen, and ShortcutHelp lists every one registered (press ?). A chord is written once (Mod+S: Ctrl, or ⌘ on a Mac) and spelled for the keyboard in front of the reader."
      >
        <DemoSection
          title="1. Kbd: a chord's keys"
          codeTitle="One chord, spelled per platform"
          codeDescription="The same strings on Windows or Linux, and on a Mac. Each group is read as the whole chord, not key by key."
          code={`<Kbd keys="Mod+K" />  <Kbd keys="Mod+Shift+P" />  <Kbd keys="Alt+PageDown" />  <Kbd keys="Shift+F10" />`}
        >
          <table class="zen-text-sm" data-testid="kbd-table">
            <thead>
              <tr>
                <th class="zen-pe-6 zen-text-start zen-font-medium zen-text-zen-muted-fg">Chord</th>
                <th class="zen-pe-6 zen-text-start zen-font-medium zen-text-zen-muted-fg">Windows, Linux</th>
                <th class="zen-text-start zen-font-medium zen-text-zen-muted-fg">Mac</th>
              </tr>
            </thead>
            <tbody>
              <For each={["Mod+K", "Mod+Shift+P", "Mod+Enter", "Alt+PageDown", "Alt+W", "Shift+F10", "?"]}>
                {(c) => (
                  <tr>
                    <td class="zen-py-1 zen-pe-6 zen-font-mono zen-text-xs">{c}</td>
                    <td class="zen-py-1 zen-pe-6"><Kbd keys={c} platform="other" /></td>
                    <td class="zen-py-1"><Kbd keys={c} platform="mac" /></td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </DemoSection>

        <DemoSection
          title="2. useShortcut: keys that do something"
          codeTitle="Registered while on screen, released when it goes"
          codeDescription="Try Ctrl+S (or ⌘S): it saves even while typing in the field, because it says allowInFields. Alt+N adds a row. Delete removes the focused row, but only while focus is inside the panel (within), and never while typing in the field. The buttons name their keys with aria-keyshortcuts and a tooltip."
          code={`useShortcut("Mod+S", save, { description: "Save", group: "This panel", allowInFields: true });
useShortcut("Alt+N", addRow, { description: "New row", group: "This panel" });
useShortcut("Delete", deleteRow, { description: "Delete the selected row", within: () => panel });

<Button aria-keyshortcuts={keyshortcut("Mod+S")} title={\`Save (\${shortcutLabel("Mod+S")})\`}>
  Save <Kbd keys="Mod+S" />
</Button>`}
        >
          <div class="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <Panel log={setLog} />
            <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
              Last: <span data-testid="shortcut-log">{log() || "nothing yet"}</span>
            </p>
          </div>
        </DemoSection>

        <DemoSection
          title="3. ShortcutHelp: every key, listed"
          codeTitle="Generated from what is registered, plus keys handled elsewhere"
          codeDescription="Press ? anywhere on this page (not in a field), or the button. The panel's keys are there because the panel registered them; the table's are passed as extra, being keys the table handles itself."
          code={`<ShortcutProvider>
  <App />
  <ShortcutHelp extra={[{ title: "Lists", shortcuts: [{ keys: ["↑", "↓"], description: "Previous or next row" }] }]} />
</ShortcutProvider>`}
        >
          <Button size="sm" variant="outline" onClick={() => setHelpOpen(true)}>
            Show keyboard shortcuts <Kbd keys="?" class="zen-ml-1.5" />
          </Button>
        </DemoSection>
      </DemoPage>
      <ShortcutHelp
        open={helpOpen()}
        onOpenChange={setHelpOpen}
        extra={[
          {
            title: "Lists",
            where: "A DataTable with keyboard rows",
            shortcuts: [
              { keys: ["↑", "↓"], description: "Previous or next row" },
              { keys: ["PageUp", "PageDown"], description: "Ten rows up or down" },
              { keys: ["Enter"], description: "Open the row" },
            ],
          },
        ]}
      />
    </ShortcutProvider>
  );
};

export default NewShortcutsDemo;

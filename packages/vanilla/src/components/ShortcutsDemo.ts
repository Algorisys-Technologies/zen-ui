import { ShortcutProvider, ShortcutHelp, Kbd, useShortcut, keyshortcut, shortcutLabel, type ShortcutHelpGroup } from "./shortcuts/shortcuts";
import { Button } from "./button/button";
import { Input } from "./form/input/input";
import { DemoPage } from "./demo-helpers";
import type { ZenComponent } from "../lib/component";

/** A small working panel: its keys are registered while it exists, released by its destroy(). */
function Panel(log: (s: string) => void): ZenComponent<never> {
  const panel = document.createElement("div");
  panel.className =
    "zen-flex zen-w-full zen-max-w-lg zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-p-4";
  panel.dataset.testid = "panel";
  let rows = ["Invoice SI/26/0001", "Invoice SI/26/0002", "Invoice SI/26/0003"];
  let selected = 0;

  const list = document.createElement("ul");
  list.className = "zen-m-0 zen-list-none zen-p-0";
  list.setAttribute("role", "listbox");
  list.setAttribute("aria-label", "Rows");
  const paintRows = () => {
    list.replaceChildren(
      ...rows.map((r, i) => {
        const li = document.createElement("li");
        li.setAttribute("role", "option");
        li.tabIndex = 0;
        li.setAttribute("aria-selected", String(selected === i));
        li.className =
          "zen-rounded-zen-sm zen-px-2 zen-py-1 zen-text-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring aria-selected:zen-bg-zen-muted";
        li.textContent = r;
        li.addEventListener("focus", () => {
          selected = i;
          for (const [j, o] of [...list.children].entries()) o.setAttribute("aria-selected", String(j === i));
        });
        return li;
      }),
    );
  };
  paintRows();

  const releases = [
    useShortcut("Mod+S", () => log("Saved"), { description: "Save", group: "This panel", allowInFields: true }),
    useShortcut("Alt+N", () => {
      rows = [...rows, `Invoice SI/26/000${rows.length + 1}`];
      paintRows();
      log("New row");
    }, { description: "New row", group: "This panel" }),
    useShortcut("Delete", () => {
      const i = selected;
      rows = rows.filter((_, j) => j !== i);
      paintRows();
      log(`Deleted row ${i + 1}`);
    }, { description: "Delete the selected row (with focus in the panel)", group: "This panel", within: panel }),
  ];

  const save = Button({
    size: "sm",
    "aria-keyshortcuts": keyshortcut("Mod+S"),
    onClick: () => log("Saved"),
    children: ["Save ", Kbd({ keys: "Mod+S", class: "zen-ml-1.5" })],
  });
  save.el.title = `Save (${shortcutLabel("Mod+S")})`;
  const add = Button({
    size: "sm",
    variant: "outline",
    "aria-keyshortcuts": keyshortcut("Alt+N"),
    onClick: () => {
      rows = [...rows, "Invoice (new)"];
      paintRows();
    },
    children: ["New row ", Kbd({ keys: "Alt+N", class: "zen-ml-1.5" })],
  });
  add.el.title = `New row (${shortcutLabel("Alt+N")})`;
  const buttons = document.createElement("div");
  buttons.className = "zen-flex zen-flex-wrap zen-gap-2";
  buttons.append(save.el, add.el);

  const notes = Input({ placeholder: "Type here: Ctrl+S still saves; Delete stays the field's", "aria-label": "Notes" });
  panel.append(buttons, notes.el, list);

  return {
    el: panel,
    update() {},
    destroy() {
      releases.forEach((release) => release());
      save.destroy();
      add.destroy();
      notes.destroy();
      panel.remove();
    },
  };
}

const EXTRA: ShortcutHelpGroup[] = [
  {
    title: "Lists",
    where: "A DataTable with keyboard rows",
    shortcuts: [
      { keys: ["↑", "↓"], description: "Previous or next row" },
      { keys: ["PageUp", "PageDown"], description: "Ten rows up or down" },
      { keys: ["Enter"], description: "Open the row" },
    ],
  },
];

const CHORDS = ["Mod+K", "Mod+Shift+P", "Mod+Enter", "Alt+PageDown", "Alt+W", "Shift+F10", "?"];

function kbdTable(): HTMLElement {
  const table = document.createElement("table");
  table.className = "zen-text-sm";
  table.dataset.testid = "kbd-table";
  const head = table.createTHead().insertRow();
  [["Chord", "zen-pe-6 "], ["Windows, Linux", "zen-pe-6 "], ["Mac", ""]].forEach(([t, pad]) => {
    const th = document.createElement("th");
    th.className = `${pad}zen-text-start zen-font-medium zen-text-zen-muted-fg`;
    th.textContent = t;
    head.append(th);
  });
  const body = table.createTBody();
  for (const c of CHORDS) {
    const tr = body.insertRow();
    const name = tr.insertCell();
    name.className = "zen-py-1 zen-pe-6 zen-font-mono zen-text-xs";
    name.textContent = c;
    const other = tr.insertCell();
    other.className = "zen-py-1 zen-pe-6";
    other.append(Kbd({ keys: c, platform: "other" }).el);
    const mac = tr.insertCell();
    mac.className = "zen-py-1";
    mac.append(Kbd({ keys: c, platform: "mac" }).el);
  }
  return table;
}

export default function ShortcutsDemo(): HTMLElement {
  const provider = ShortcutProvider({
    // A function, so the panel and the overlay register into this provider.
    children: () => {
      // Built after the page, so its "?" lists after the panel's keys, as in React and Solid.
      const overlay: { help?: ReturnType<typeof ShortcutHelp> } = {};

      const logText = document.createElement("span");
      logText.dataset.testid = "shortcut-log";
      logText.textContent = "nothing yet";
      const log = (s: string) => (logText.textContent = s || "nothing yet");

      const page = DemoPage({
        title: "Shortcuts",
        description:
          "Keyboard shortcuts as a system: Kbd draws a chord's keys, useShortcut answers one while a component is on screen, and ShortcutHelp lists every one registered (press ?). A chord is written once (Mod+S: Ctrl, or ⌘ on a Mac) and spelled for the keyboard in front of the reader.",
        sections: [
          {
            title: "1. Kbd: a chord's keys",
            codeTitle: "One chord, spelled per platform",
            codeDescription:
              "The same strings on Windows or Linux, and on a Mac. Each group is read as the whole chord, not key by key.",
            code: `Kbd({ keys: "Mod+K" })  Kbd({ keys: "Mod+Shift+P" })  Kbd({ keys: "Alt+PageDown" })  Kbd({ keys: "Shift+F10" })`,
            render: kbdTable,
          },
          {
            title: "2. useShortcut: keys that do something",
            codeTitle: "Registered while it exists, released by its destroy()",
            codeDescription:
              "Try Ctrl+S (or ⌘S): it saves even while typing in the field, because it says allowInFields. Alt+N adds a row. Delete removes the focused row, but only while focus is inside the panel (within), and never while typing in the field. The buttons name their keys with aria-keyshortcuts and a tooltip.",
            code: `// In a factory a ShortcutProvider's children function calls; each returns its release.
const releases = [
  useShortcut("Mod+S", save, { description: "Save", group: "This panel", allowInFields: true }),
  useShortcut("Alt+N", addRow, { description: "New row", group: "This panel" }),
  useShortcut("Delete", deleteRow, { description: "Delete the selected row", within: panel }),
];
// destroy() { releases.forEach((release) => release()); }

Button({
  "aria-keyshortcuts": keyshortcut("Mod+S"),
  children: ["Save ", Kbd({ keys: "Mod+S" })],
}).el.title = \`Save (\${shortcutLabel("Mod+S")})\`;`,
            render: () => {
              const wrap = document.createElement("div");
              wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-2";
              const p = document.createElement("p");
              p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
              p.setAttribute("aria-live", "polite");
              p.append("Last: ", logText);
              wrap.append(Panel(log).el, p);
              return wrap;
            },
          },
          {
            title: "3. ShortcutHelp: every key, listed",
            codeTitle: "Generated from what is registered, plus keys handled elsewhere",
            codeDescription:
              "Press ? anywhere on this page (not in a field), or the button. The panel's keys are there because the panel registered them; the table's are passed as extra, being keys the table handles itself.",
            code: `ShortcutProvider({
  children: () => [
    App(),
    ShortcutHelp({ extra: [{ title: "Lists", shortcuts: [{ keys: ["↑", "↓"], description: "Previous or next row" }] }] }),
  ],
});`,
            render: () =>
              Button({
                size: "sm",
                variant: "outline",
                onClick: () => overlay.help?.open(),
                children: ["Show keyboard shortcuts ", Kbd({ keys: "?", class: "zen-ml-1.5" })],
              }).el,
          },
        ],
      });
      overlay.help = ShortcutHelp({ extra: EXTRA });
      // The overlay's handle sits beside the page: it renders nothing in place.
      return [page, overlay.help];
    },
  });
  return provider.el;
}

import { keyshortcut, shortcutLabel, type ShortcutHelpGroup } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * Shortcuts demo — the web-components port. <zen-kbd> draws a chord,
 * <zen-shortcut> is useShortcut as an element (it fires `zen-shortcut`), and
 * <zen-shortcut-help> is the "?" overlay. They share the document's registry:
 * keys live while their elements are connected, so leaving this page releases them.
 */

const h = <K extends keyof HTMLElementTagNameMap>(tag: K, className: string, ...kids: (Node | string)[]) => {
  const e = document.createElement(tag);
  if (className) e.className = className;
  e.append(...kids);
  return e;
};

function custom(tag: string, attrs: Record<string, string | true> = {}, ...kids: (Node | string)[]): HTMLElement {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v === true ? "" : v);
  e.append(...kids);
  return e;
}

const kbd = (keys: string, attrs: Record<string, string> = {}) => custom("zen-kbd", { keys, ...attrs });

/** <zen-button> and <zen-input> render their control on connect; name it once it exists. */
function onRendered(host: HTMLElement, selector: string, fn: (el: Element) => void) {
  queueMicrotask(() => {
    const el = host.querySelector(selector);
    if (el) fn(el);
  });
}

function panel(log: (s: string) => void): HTMLElement {
  const root = h("div", "zen-flex zen-w-full zen-max-w-lg zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-p-4");
  root.dataset.testid = "panel";
  root.id = "shortcuts-panel";
  let rows = ["Invoice SI/26/0001", "Invoice SI/26/0002", "Invoice SI/26/0003"];
  let selected = 0;

  const list = h("ul", "zen-m-0 zen-list-none zen-p-0");
  list.setAttribute("role", "listbox");
  list.setAttribute("aria-label", "Rows");
  const paintRows = () => {
    list.replaceChildren(
      ...rows.map((r, i) => {
        const li = h("li", "zen-rounded-zen-sm zen-px-2 zen-py-1 zen-text-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring aria-selected:zen-bg-zen-muted", r);
        li.setAttribute("role", "option");
        li.tabIndex = 0;
        li.setAttribute("aria-selected", String(selected === i));
        li.addEventListener("focus", () => {
          selected = i;
          for (const [j, o] of [...list.children].entries()) o.setAttribute("aria-selected", String(j === i));
        });
        return li;
      }),
    );
  };
  paintRows();

  const shortcut = (attrs: Record<string, string | true>, run: () => void) => {
    const s = custom("zen-shortcut", attrs);
    s.addEventListener("zen-shortcut", run);
    return s;
  };
  const keys = [
    shortcut({ keys: "Mod+S", description: "Save", group: "This panel", "allow-in-fields": true }, () => log("Saved")),
    shortcut({ keys: "Alt+N", description: "New row", group: "This panel" }, () => {
      rows = [...rows, `Invoice SI/26/000${rows.length + 1}`];
      paintRows();
      log("New row");
    }),
    shortcut({ keys: "Delete", description: "Delete the selected row (with focus in the panel)", group: "This panel", within: "#shortcuts-panel" }, () => {
      const i = selected;
      rows = rows.filter((_, j) => j !== i);
      paintRows();
      log(`Deleted row ${i + 1}`);
    }),
  ];

  const save = custom("zen-button", { size: "sm" }, "Save ", kbd("Mod+S", { class: "zen-ml-1.5" }));
  save.addEventListener("click", () => log("Saved"));
  onRendered(save, "button", (b) => {
    b.setAttribute("aria-keyshortcuts", keyshortcut("Mod+S"));
    b.setAttribute("title", `Save (${shortcutLabel("Mod+S")})`);
  });
  const add = custom("zen-button", { size: "sm", variant: "outline" }, "New row ", kbd("Alt+N", { class: "zen-ml-1.5" }));
  add.addEventListener("click", () => {
    rows = [...rows, "Invoice (new)"];
    paintRows();
  });
  onRendered(add, "button", (b) => {
    b.setAttribute("aria-keyshortcuts", keyshortcut("Alt+N"));
    b.setAttribute("title", `New row (${shortcutLabel("Alt+N")})`);
  });
  const notes = custom("zen-input", { placeholder: "Type here: Ctrl+S still saves; Delete stays the field's" });
  onRendered(notes, "input", (i) => i.setAttribute("aria-label", "Notes"));

  root.append(...keys, h("div", "zen-flex zen-flex-wrap zen-gap-2", save, add), notes, list);
  return root;
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
    head.append(h("th", `${pad}zen-text-start zen-font-medium zen-text-zen-muted-fg`, t));
  });
  const body = table.createTBody();
  for (const c of CHORDS) {
    const tr = body.insertRow();
    tr.append(
      h("td", "zen-py-1 zen-pe-6 zen-font-mono zen-text-xs", c),
      h("td", "zen-py-1 zen-pe-6", kbd(c, { platform: "other" })),
      h("td", "zen-py-1", kbd(c, { platform: "mac" })),
    );
  }
  return table;
}

export default function ShortcutsDemo(): HTMLElement {
  const logText = h("span", "", "nothing yet");
  logText.dataset.testid = "shortcut-log";
  const log = (s: string) => (logText.textContent = s || "nothing yet");

  const help = custom("zen-shortcut-help") as HTMLElement & { extra?: ShortcutHelpGroup[]; open?: () => void };
  help.extra = EXTRA;

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
        code: `<zen-kbd keys="Mod+K"></zen-kbd>  <zen-kbd keys="Mod+Shift+P"></zen-kbd>  <zen-kbd keys="Alt+PageDown"></zen-kbd>  <zen-kbd keys="Shift+F10"></zen-kbd>`,
        render: kbdTable,
      },
      {
        title: "2. useShortcut: keys that do something",
        codeTitle: "Registered while connected, released when it goes",
        codeDescription:
          "Try Ctrl+S (or ⌘S): it saves even while typing in the field, because it says allow-in-fields. Alt+N adds a row. Delete removes the focused row, but only while focus is inside the panel (within), and never while typing in the field. The buttons name their keys with aria-keyshortcuts and a tooltip.",
        code: `<div id="panel">
  <zen-shortcut keys="Mod+S" description="Save" group="This panel" allow-in-fields></zen-shortcut>
  <zen-shortcut keys="Alt+N" description="New row" group="This panel"></zen-shortcut>
  <zen-shortcut keys="Delete" description="Delete the selected row" within="#panel"></zen-shortcut>
  <zen-button>Save <zen-kbd keys="Mod+S"></zen-kbd></zen-button>
</div>

panel.querySelector('zen-shortcut[keys="Mod+S"]').addEventListener("zen-shortcut", save);`,
        render: () => {
          const p = h("p", "zen-m-0 zen-text-sm zen-text-zen-muted-fg", "Last: ", logText);
          p.setAttribute("aria-live", "polite");
          return h("div", "zen-flex zen-w-full zen-flex-col zen-gap-2", panel(log), p);
        },
      },
      {
        title: "3. ShortcutHelp: every key, listed",
        codeTitle: "Generated from what is registered, plus keys handled elsewhere",
        codeDescription:
          "Press ? anywhere on this page (not in a field), or the button. The panel's keys are there because the panel registered them; the table's are passed as extra, being keys the table handles itself.",
        code: `<zen-shortcut-help></zen-shortcut-help>

document.querySelector("zen-shortcut-help").extra = [
  { title: "Lists", shortcuts: [{ keys: ["↑", "↓"], description: "Previous or next row" }] },
];`,
        render: () => {
          const b = custom("zen-button", { size: "sm", variant: "outline" }, "Show keyboard shortcuts ", kbd("?", { class: "zen-ml-1.5" }));
          b.addEventListener("click", () => help.open?.());
          return b;
        },
      },
    ],
  });
  // After the page, so its "?" lists after the panel's keys, as in React and Solid.
  page.append(help);
  return page;
}

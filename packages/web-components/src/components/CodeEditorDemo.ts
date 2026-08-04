import { DemoPage } from "./demo-helpers";

const PY = `def reconcile(gate, weighbridge):
    """Return the lines that do not agree."""
    by_ref = {row.ref: row for row in weighbridge}
    for line in gate:
        other = by_ref.get(line.ref)
        if other is None or other.net_kg != line.net_kg:
            yield line
`;

const FILES = [
  { path: "src/solution.py", content: PY, language: "python" },
  {
    path: "src/models.py",
    content: "from dataclasses import dataclass\n\n\n@dataclass\nclass Line:\n    ref: str\n    net_kg: int\n",
    language: "python",
  },
  {
    path: "tests/test_solution.py",
    content: "def test_reconcile_flags_a_mismatch():\n    assert list(reconcile(GATE, WEIGH)) == [GATE[1]]\n",
    language: "python",
    readOnly: true,
  },
];

function el(tag: string, attrs: Record<string, string>): HTMLElement {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

export default function CodeEditorDemo(): HTMLElement {
  return DemoPage({
    title: "CodeEditor / IDEWindow",
    description:
      "A code surface over Monaco, and a file list beside it. Deliberately a thin wrapper: Monaco is enormous and well documented, and re-exporting a curated slice of its options would only mean a caller cannot reach the rest.",
    sections: [
      {
        title: "1. The editor",
        codeTitle: "`language` and `value` as attributes",
        codeDescription:
          "A seeded snippet really can live in markup; anything long is a property. What this adds over raw Monaco is the things every app re-decides and gets inconsistent: the theme, a font size that is a token rather than a magic number, read-only, and a language name that survives being written down. `options` is a json attribute for everything else.",
        code: `<zen-code-editor language="python" value="print(1)" height="18rem"></zen-code-editor>

el.addEventListener("zen-change", (e) => (code = e.detail));`,
        render: () => el("zen-code-editor", { language: "python", value: PY, height: "18rem" }),
      },
      {
        title: "2. How Monaco gets here",
        codeTitle: "`@monaco-editor/loader`, an optional peer of the vanilla binding",
        codeDescription:
          "This binding cannot use @monaco-editor/react, so it goes through the framework-agnostic loader that package itself uses — the same one Solid and vanilla take. All four then fetch the same Monaco the same way and behave the same, rather than merely looking the same. If the loader is missing or the CDN is unreachable the element renders the install message instead of throwing, which matters more here than anywhere else: there is no error boundary to put around a custom element.",
        code: `npm i @monaco-editor/loader

<!-- point it at a copy you host — the answer for an exam that must not
     depend on someone else's uptime -->
<zen-code-editor loader-config='{"paths":{"vs":"/vendor/monaco/vs"}}'></zen-code-editor>`,
        render: () => {
          const p = document.createElement("p");
          p.style.cssText = "margin:0;font-size:14px;color:var(--zen-color-muted-fg)";
          p.textContent =
            "Every editor on this page is loaded that way. With the peer absent you would see the install message instead, in the same box.";
          return p;
        },
      },
      {
        title: "3. Theme, size and read-only",
        codeTitle: "It follows the page theme unless you pin one",
        codeDescription:
          "With no theme attribute the editor reads data-theme off the document and watches it, so an editor inside a dark panel is not a white rectangle and switching the site theme switches the editor with it. minimap is off by default — it costs horizontal room and helps only in long files — so it is a plain boolean attribute, while line-numbers defaults to TRUE and is therefore json.",
        code: `<zen-code-editor theme="dark" font-size="13"></zen-code-editor>
<zen-code-editor read-only line-numbers="false"></zen-code-editor>`,
        render: () => {
          const stack = document.createElement("div");
          stack.style.cssText = "display:flex;flex-direction:column;gap:12px;width:100%";
          stack.append(
            el("zen-code-editor", { language: "python", value: PY, theme: "dark", "font-size": "13", height: "12rem" }),
            el("zen-code-editor", { language: "python", value: PY, "read-only": "", "line-numbers": "false", height: "10rem" }),
          );
          return stack;
        },
      },
      {
        title: "4. Running it is yours",
        codeTitle: "`zen-run`, wired to Ctrl/Cmd+Enter",
        codeDescription:
          "It does NOT run code. Execution is a server concern — a sandbox, a container, a rate limit and an auth boundary — and a component that owned it would be wrong for every consumer. The chord is wired because it is the near-universal 'run' in an editor and a user who has to reach for the mouse notices.",
        code: `el.addEventListener("zen-run", (e) => post("/api/run", { source: e.detail }));`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%";
          const out = document.createElement("pre");
          out.className = "zen-m-0 zen-rounded-zen-sm zen-bg-zen-muted zen-p-2 zen-text-xs";
          out.textContent = "Press Ctrl/Cmd+Enter in the editor.";

          const editor = el("zen-code-editor", { language: "python", value: PY, height: "12rem" });
          editor.addEventListener("zen-run", (e) => {
            out.textContent = `zen-run fired with ${String((e as CustomEvent<string>).detail).split("\n").length} lines`;
          });
          wrap.append(editor, out);
          return wrap;
        },
      },
      {
        title: "5. A file list beside it",
        codeTitle: "`<zen-ide-window>`, whose slot is its toolbar",
        codeDescription:
          "A flat list rather than a folder tree: a tree needs expand state, drag to move and a rename affordance to be worth having, and a half-tree is worse than an honest list. Light-DOM children go to the toolbar, because a Run button really is markup a caller writes. Switching files rebuilds the editor rather than handing it new text — an editor that keeps its model across a switch keeps the old undo stack with it, which is how Ctrl+Z in one file edits another.",
        code: `<zen-ide-window files='[{"path":"main.py","content":"…"}]' height="20rem">
  <zen-button size="sm">Run tests</zen-button>
</zen-ide-window>`,
        render: () => {
          const ide = document.createElement("zen-ide-window");
          ide.setAttribute("height", "20rem");
          (ide as unknown as { files: unknown[] }).files = FILES;
          const btn = document.createElement("zen-button");
          btn.setAttribute("size", "sm");
          btn.textContent = "Run tests";
          ide.append(btn);
          return ide;
        },
      },
    ],
  });
}

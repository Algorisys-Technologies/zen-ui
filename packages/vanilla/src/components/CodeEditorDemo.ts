import { CodeEditor, IDEWindow, type CodeFile } from "./code-editor/code-editor";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

const PY = `def reconcile(gate, weighbridge):
    """Return the lines that do not agree."""
    by_ref = {row.ref: row for row in weighbridge}
    for line in gate:
        other = by_ref.get(line.ref)
        if other is None or other.net_kg != line.net_kg:
            yield line
`;

const FILES: CodeFile[] = [
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

export default function CodeEditorDemo(): HTMLElement {
  return DemoPage({
    title: "CodeEditor / IDEWindow",
    description:
      "A code surface over Monaco, and a file list beside it. Deliberately a thin wrapper: Monaco is enormous and well documented, and re-exporting a curated slice of its options would only mean a caller cannot reach the rest.",
    sections: [
      {
        title: "1. The editor",
        codeTitle: "`language`, `value`, `onChange`",
        codeDescription:
          "What this adds over raw Monaco is the things every app re-decides and gets inconsistent: the theme, a font size that is a token rather than a magic number, read-only, and a language name that survives being written down. `options` passes straight through for everything else.",
        code: `CodeEditor({ language: "python", value: code, onChange: (v) => (code = v) }).el`,
        render: () => CodeEditor({ language: "python", value: PY, height: "18rem" }).el,
      },
      {
        title: "2. How Monaco gets here",
        codeTitle: "`@monaco-editor/loader`, an optional peer",
        codeDescription:
          "This binding cannot use @monaco-editor/react, so it takes the framework-agnostic loader that package itself uses — the same one the Solid binding takes. All three then fetch the same Monaco the same way and behave the same, rather than merely looking the same. It also settles the worker problem: importing monaco-editor's ESM build directly fails to resolve its own worker entry under Vite, and that is not fixable from inside a component. If the loader is missing or cannot reach the CDN, the component degrades to a message instead of throwing past you.",
        code: `npm i @monaco-editor/loader        // optional peer dependency

// By default it fetches from a CDN. Point it at a copy you host —
// the answer for an exam that must not depend on someone else's uptime:
CodeEditor({ loaderConfig: { paths: { vs: "/vendor/monaco/vs" } } }).el`,
        render: () => {
          const p = document.createElement("p");
          p.style.margin = "0";
          p.style.fontSize = "14px";
          p.style.color = "var(--zen-color-muted-fg)";
          p.textContent =
            "Every editor on this page is loaded that way. With the peer absent you would see the install message instead, in the same box.";
          return p;
        },
      },
      {
        title: "3. Theme, size and read-only",
        codeTitle: "It follows the page theme unless you pin one",
        codeDescription:
          "With no `theme` the editor reads data-theme off the document and watches it, so an editor inside a dark panel is not a white rectangle and switching the site theme switches the editor with it. minimap is off by default — it costs horizontal room and helps only in long files.",
        code: `CodeEditor({ theme: "dark", fontSize: 13, readOnly: true, minimap: true }).el`,
        render: () => {
          const stack = document.createElement("div");
          stack.style.display = "flex";
          stack.style.flexDirection = "column";
          stack.style.gap = "12px";
          stack.style.width = "100%";
          stack.append(
            CodeEditor({ language: "python", value: PY, theme: "dark", fontSize: 13, height: "12rem" }).el,
            CodeEditor({ language: "python", value: PY, readOnly: true, lineNumbers: false, height: "10rem" }).el,
          );
          return stack;
        },
      },
      {
        title: "4. Running it is yours",
        codeTitle: "`onRun`, wired to Ctrl/Cmd+Enter",
        codeDescription:
          "It does NOT run code. Execution is a server concern — a sandbox, a container, a rate limit and an auth boundary — and a component that owned it would be wrong for every consumer. The chord is wired because it is the near-universal 'run' in an editor and a user who has to reach for the mouse notices.",
        code: `CodeEditor({ value: code, onRun: (source) => post("/api/run", { source }) }).el`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";
          wrap.style.width = "100%";

          const out = document.createElement("pre");
          out.className = "zen-m-0 zen-rounded-zen-sm zen-bg-zen-muted zen-p-2 zen-text-xs";
          out.textContent = "Press Ctrl/Cmd+Enter in the editor.";

          wrap.append(
            CodeEditor({
              language: "python",
              value: PY,
              height: "12rem",
              onRun: (source) => {
                out.textContent = `onRun fired with ${source.split("\n").length} lines`;
              },
            }).el,
            out,
          );
          return wrap;
        },
      },
      {
        title: "5. A file list beside it",
        codeTitle: "`IDEWindow`",
        codeDescription:
          "A flat list rather than a folder tree: a tree needs expand state, drag to move and a rename affordance to be worth having, and a half-tree is worse than an honest list. Paths still read as paths, so a caller who wants grouping has the information. Switching files rebuilds the editor rather than handing it new text — an editor that keeps its model across a switch keeps the old undo stack with it, which is how Ctrl+Z in one file edits another.",
        code: `IDEWindow({
  files,                                  // [{ path, content, language, readOnly }]
  onFileChange: (path, content) => save(path, content),
  toolbar: runButton.el,
}).el`,
        render: () =>
          IDEWindow({
            files: FILES,
            height: "20rem",
            toolbar: Button({ size: "sm", children: "Run tests" }).el,
          }).el,
      },
    ],
  });
}

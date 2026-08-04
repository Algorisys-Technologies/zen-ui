import { useState } from "react";
import { CodeEditor, IDEWindow } from "./code-editor/code-editor";
import type { CodeFile } from "./code-editor/code-editor";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const PY = `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []
`;

const FILES: CodeFile[] = [
  { path: "src/solution.ts", language: "typescript", content: "export const solve = (n: number) => n * 2;\n" },
  { path: "src/helpers.ts", language: "typescript", content: "export const clamp = (n: number) => Math.max(0, n);\n" },
  {
    path: "tests/solution.test.ts",
    language: "typescript",
    readOnly: true,
    content: "import { solve } from '../src/solution';\n\ntest('doubles', () => {\n  expect(solve(2)).toBe(4);\n});\n",
  },
];

const NewCodeEditorDemo: React.FC = () => {
  const [code, setCode] = useState(PY);
  const [files, setFiles] = useState(FILES);
  const [ran, setRan] = useState("—");

  return (
    <div className="demo-page">
      <h1>CodeEditor &amp; IDEWindow</h1>
      <p className="lede">
        A code surface for a coding kata, wrapping <code>@monaco-editor/react</code>{" "}
        — an <strong>optional</strong> peer dependency, lazily imported, so an app
        that never shows code never downloads it. Deliberately a thin wrapper:
        Monaco is enormous and well documented, and re-exporting a curated slice of
        its options would only stop you reaching the rest.
      </p>

      <section className="demo-section">
        <h2>1. A language and a value</h2>
        <CodeExample
          title="What the wrapper adds is consistency"
          description="The zen theme rather than a hardcoded vs-dark, a font size that is a prop rather than a magic number, and read-only. That sounds small until you count the copies: the assessment product this was built for renders Monaco at 16px on one screen and 14px on another, each with its own duplicate options object disabling the minimap."
          code={`<CodeEditor language="python" value={code} onChange={setCode} />`}
        >
          <CodeEditor language="python" value={code} onChange={setCode} height="14rem" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Running it is yours</h2>
        <CodeExample
          title="`onRun`, wired to Ctrl/Cmd+Enter"
          description="It does not execute code. Execution is a sandbox, a container, a rate limit and an auth boundary — a component that owned it would be wrong for every consumer. The chord is here because a candidate who has to reach for the mouse to run their code notices."
          code={`<CodeEditor
  language="python"
  value={code}
  onChange={setCode}
  onRun={(src) => runOnServer(src)}
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <CodeEditor
              language="python"
              value={code}
              onChange={setCode}
              height="10rem"
              onRun={(src) => setRan(`ran ${src.split("\n").length} lines at ${new Date().toLocaleTimeString()}`)}
            />
            <p style={{ margin: 0, fontSize: 12, color: "var(--zen-color-muted-fg)" }}>
              Ctrl/Cmd+Enter in the editor → <code>{ran}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Read-only</h2>
        <CodeExample
          title="For the test file a candidate must not edit"
          description="readOnly locks the buffer without greying it out, so the code stays readable — which is the point of showing it."
          code={`<CodeEditor language="typescript" value={tests} readOnly />`}
        >
          <CodeEditor
            language="typescript"
            value={FILES[2]!.content}
            readOnly
            height="8rem"
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. IDEWindow</h2>
        <CodeExample
          title="A file list beside the editor"
          description="A flat list rather than a folder tree: a tree needs expand state, drag-to-move and rename to be worth having, and a half-tree is worse than an honest list. Paths still read as paths. A read-only file gets an RO badge and locks the editor. Switching files remounts the editor, so Ctrl+Z in one file cannot undo an edit in another."
          code={`<IDEWindow
  files={files}
  onFileChange={(path, content) => update(path, content)}
  toolbar={<Button size="sm">Run tests</Button>}
/>`}
        >
          <IDEWindow
            files={files}
            height="16rem"
            onFileChange={(path, content) =>
              setFiles((fs) => fs.map((f) => (f.path === path ? { ...f, content } : f)))
            }
            toolbar={<Button size="sm">Run tests</Button>}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Without Monaco installed</h2>
        <CodeExample
          title="It says what to install"
          description="Suspense does not catch a rejected lazy import — only an error boundary does — so without one the whole tree unmounts with a module-resolution stack trace that never mentions the package you need. The boundary is narrow: anything that is not the missing dependency is re-thrown, so a real editor bug still surfaces."
          code={`npm i @monaco-editor/react   # optional peer dependency`}
        >
          <p style={{ margin: 0, fontSize: 14, color: "var(--zen-color-muted-fg)" }}>
            The editors above are live, so Monaco is installed here. Uninstall it and
            each renders a bordered note naming the package rather than crashing.
          </p>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewCodeEditorDemo;

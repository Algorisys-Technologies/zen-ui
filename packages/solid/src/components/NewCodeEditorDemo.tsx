import { createSignal } from "solid-js";
import { CodeEditor, IDEWindow } from "./code-editor/code-editor";
import type { CodeFile } from "./code-editor/code-editor";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";


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

const NewCodeEditorDemo = () => {
  const [code, setCode] = createSignal(PY);
  const [files, setFiles] = createSignal(FILES);
  const [ran, setRan] = createSignal("—");

  return (
    <DemoPage
      title="CodeEditor & IDEWindow"
      description={
        <>
          A code surface for a coding kata. The React binding wraps{" "}
          <code>@monaco-editor/react</code>; that package is React-only, so Solid
          drives <code>@monaco-editor/loader</code> — the framework-agnostic package that <code>@monaco-editor/react</code> itself uses, so both bindings load Monaco identically — an <strong>optional</strong>{" "}
          peer dependency, lazily imported. Same props, same behaviour; the
          difference is composition, not API.
        </>
      }
    >
      <DemoSection
        title="1. A language and a value"
        codeTitle="What the wrapper adds is consistency"
        codeDescription="The zen theme rather than a hardcoded vs-dark, a font size that is a prop rather than a magic number, and read-only. That sounds small until you count the copies: the assessment product this was built for renders Monaco at 16px on one screen and 14px on another, each with its own duplicate options object disabling the minimap."
        code={`<CodeEditor language="python" value={code()} onChange={setCode} />`}
      >
        <CodeEditor language="python" value={code()} onChange={setCode} height="14rem" />
      </DemoSection>

      <DemoSection
        title="2. Running it is yours"
        codeTitle="`onRun`, wired to Ctrl/Cmd+Enter"
        codeDescription="It does not execute code. Execution is a sandbox, a container, a rate limit and an auth boundary — a component that owned it would be wrong for every consumer. The chord is here because a candidate who has to reach for the mouse to run their code notices."
        code={`<CodeEditor language="python" value={code()} onChange={setCode} onRun={runOnServer} />`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-2">
          <CodeEditor
            language="python"
            value={code()}
            onChange={setCode}
            height="10rem"
            onRun={(src) => setRan(`ran ${src.split("\n").length} lines at ${new Date().toLocaleTimeString()}`)}
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            Ctrl/Cmd+Enter in the editor → <code>{ran()}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="3. Read-only"
        codeTitle="For the test file a candidate must not edit"
        codeDescription="readOnly locks the buffer without greying it out, so the code stays readable — which is the point of showing it."
        code={`<CodeEditor language="typescript" value={tests} readOnly />`}
      >
        <CodeEditor language="typescript" value={FILES[2]!.content} readOnly height="8rem" />
      </DemoSection>

      <DemoSection
        title="4. IDEWindow"
        codeTitle="A file list beside the editor"
        codeDescription="A flat list rather than a folder tree: a tree needs expand state, drag-to-move and rename to be worth having, and a half-tree is worse than an honest list. A read-only file gets an RO badge and locks the editor. Switching files remounts the editor, so Ctrl+Z in one file cannot undo an edit in another."
        code={`<IDEWindow files={files()} onFileChange={update} toolbar={<Button size="sm">Run tests</Button>} />`}
      >
        <IDEWindow
          files={files()}
          height="16rem"
          onFileChange={(path, content) =>
            setFiles((fs) => fs.map((f) => (f.path === path ? { ...f, content } : f)))
          }
          toolbar={<Button size="sm">Run tests</Button>}
        />
      </DemoSection>

      <DemoSection
        title="5. Without Monaco installed"
        codeTitle="It says what to install"
        codeDescription="The import is caught and the component degrades to a bordered note naming the package, rather than taking the tree down with a module-resolution stack trace that never mentions what you need — the same choice RichText makes in this binding."
        code={`npm i @monaco-editor/loader   # optional peer dependency`}
      >
        <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
          The editors above are live, so Monaco is installed here.
        </p>
      </DemoSection>
    </DemoPage>
  );
};

export default NewCodeEditorDemo;

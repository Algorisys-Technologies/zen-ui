/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * CodeEditor — a code surface, wrapping `@monaco-editor/react` (an OPTIONAL
 * peer dependency, lazily imported).
 *
 *   <CodeEditor language="python" value={code} onChange={setCode} />
 *
 * Deliberately a THIN wrapper. Monaco is an enormous, well-documented editor and
 * re-exporting a curated slice of its options would only mean a caller cannot
 * reach the rest; `options` passes straight through. What this adds is the
 * things every app re-decides and gets inconsistent: the zen theme, a font size
 * that is a token rather than a magic number, read-only, and a language name
 * that survives being written down.
 *
 * The concrete drift it exists to kill: the assessment app this was built for
 * renders Monaco `vs-dark` at 16px on one screen and `vs-dark` at 14px on
 * another, with `minimap` disabled in both by separate copies of the same
 * object.
 *
 * It does NOT run code. Execution is a server concern — a sandbox, a container,
 * a rate limit and an auth boundary — and a component that owned it would be
 * wrong for every consumer. `onRun` is a callback: yours to implement.
 */

/** The languages zen-ui names. Monaco accepts many more; this is just the typed set. */
export const CODE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "go",
  "rust",
  "elixir",
  "ruby",
  "php",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "markdown",
  "shell",
  "plaintext",
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number] | (string & {});

export interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  /** Monaco language id. Defaults to `plaintext` so an unset one is never a guess. */
  language?: CodeLanguage;
  /** Follows the zen theme when omitted. */
  theme?: "light" | "dark";
  /** px. Default 14. */
  fontSize?: number;
  readOnly?: boolean;
  /** CSS height for the editor box. Default `"24rem"`. */
  height?: string;
  /** Off by default — it costs horizontal room and helps only in long files. */
  minimap?: boolean;
  lineNumbers?: boolean;
  /** Wired to Ctrl/Cmd+Enter as well as any button you render. */
  onRun?: (value: string) => void;
  /**
   * Raw Monaco options, merged over the defaults. Everything not named above
   * lives here rather than being re-exported one prop at a time.
   */
  options?: Record<string, any>;
  /** Monaco's own `onMount`, for a caller that needs the editor instance. */
  onMount?: (editor: any, monaco: any) => void;
  /** Shown while Monaco loads. */
  loading?: React.ReactNode;
  className?: string;
}

const MonacoEditor = React.lazy(() =>
  import("@monaco-editor/react").then((m) => ({ default: m.default })),
);

/**
 * `@monaco-editor/react` is an OPTIONAL peer, so `import()` rejects when a
 * consumer renders this without installing it. Suspense does not catch a
 * rejected lazy import — only an error boundary does — so without this the tree
 * unmounts with a module-resolution stack trace that never says "install
 * @monaco-editor/react". Same shape as RichTextBoundary, and narrow for the
 * same reason: anything that is not the missing dependency is re-thrown, so a
 * real editor bug still surfaces.
 */
class CodeEditorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const err = this.state.error;
    if (!err) return this.props.children;
    if (!/monaco-editor|Failed to fetch dynamically imported module/i.test(err.message)) throw err;
    return this.props.fallback;
  }
}

const MissingMonaco = ({ height }: { height: string }) => (
  <div
    style={{ height }}
    className="zen-flex zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-dashed zen-border-zen-border zen-p-4 zen-text-center zen-text-sm zen-text-zen-muted-fg"
  >
    CodeEditor needs <code className="zen-mx-1 zen-font-mono">@monaco-editor/react</code> installed.
  </div>
);

export const CodeEditor = ({
  value,
  onChange,
  language = "plaintext",
  theme,
  fontSize = 14,
  readOnly = false,
  height = "24rem",
  minimap = false,
  lineNumbers = true,
  onRun,
  options,
  onMount,
  loading,
  className,
}: CodeEditorProps) => {
  /* Follows the document's theme when the caller does not pin one, so an editor
     inside a dark panel is not a white rectangle. */
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(theme ?? "light");
  React.useEffect(() => {
    if (theme) {
      setResolvedTheme(theme);
      return;
    }
    const read = () => {
      const attr = document.documentElement.getAttribute("data-theme");
      setResolvedTheme(attr === "dark" ? "dark" : "light");
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [theme]);

  const onRunRef = React.useRef(onRun);
  onRunRef.current = onRun;

  const handleMount = React.useCallback(
    (editor: any, monaco: any) => {
      if (onRunRef.current && monaco?.KeyMod && monaco?.KeyCode) {
        /* Ctrl/Cmd+Enter is the near-universal "run" chord in an editor; a user
           who has to reach for the mouse to run their code notices. */
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
          onRunRef.current?.(editor.getValue() ?? "");
        });
      }
      onMount?.(editor, monaco);
    },
    [onMount],
  );

  return (
    <div
      className={cn(
        "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        className,
      )}
    >
      <CodeEditorBoundary fallback={<MissingMonaco height={height} />}>
        <React.Suspense
          fallback={
            loading ?? (
              <div
                style={{ height }}
                className="zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg"
              >
                Loading editor…
              </div>
            )
          }
        >
          <MonacoEditor
            height={height}
            language={language}
            theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
            value={value}
            onChange={(next) => onChange?.(next ?? "")}
            onMount={handleMount}
            options={{
              fontSize,
              readOnly,
              minimap: { enabled: minimap },
              lineNumbers: lineNumbers ? "on" : "off",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              ...options,
            }}
          />
        </React.Suspense>
      </CodeEditorBoundary>
    </div>
  );
};

export interface CodeFile {
  /** Unique; also the display name. Use a path for a tree, e.g. `src/app.ts`. */
  path: string;
  content: string;
  language?: CodeLanguage;
  /** Shows an "RO" badge and locks the editor on this file. */
  readOnly?: boolean;
}

export interface IDEWindowProps
  extends Omit<CodeEditorProps, "value" | "onChange" | "language" | "readOnly"> {
  files: CodeFile[];
  /** Controlled active path. */
  activePath?: string;
  defaultActivePath?: string;
  onActivePathChange?: (path: string) => void;
  onFileChange?: (path: string, content: string) => void;
  /** Toolbar slot — a Run button, a language picker, whatever the screen needs. */
  toolbar?: React.ReactNode;
  className?: string;
}

/**
 * IDEWindow — a file list beside a CodeEditor.
 *
 * A flat list rather than a folder tree: a tree needs expand state, drag to
 * move, and a rename affordance to be worth having, and a half-tree is worse
 * than an honest list. Paths still read as paths, so a caller who wants
 * grouping has the information.
 */
export const IDEWindow = ({
  files,
  activePath,
  defaultActivePath,
  onActivePathChange,
  onFileChange,
  toolbar,
  className,
  height = "24rem",
  ...editor
}: IDEWindowProps) => {
  const [internal, setInternal] = React.useState(defaultActivePath ?? files[0]?.path ?? "");
  const current = activePath ?? internal;
  const file = files.find((f) => f.path === current) ?? files[0];

  const select = (path: string) => {
    setInternal(path);
    onActivePathChange?.(path);
  };

  return (
    <div
      className={cn(
        "zen-flex zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        className,
      )}
    >
      {/* A real list, so a screen reader gets the file count. */}
      <nav
        aria-label="Files"
        className="zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-e zen-border-zen-border zen-bg-zen-muted"
        style={{ height }}
      >
        <ul className="zen-m-0 zen-list-none zen-p-1">
          {files.map((f) => (
            <li key={f.path}>
              <button
                type="button"
                aria-current={f.path === current ? "true" : undefined}
                onClick={() => select(f.path)}
                className={cn(
                  "zen-flex zen-w-full zen-items-center zen-gap-1 zen-rounded-zen-sm zen-px-2 zen-py-1 zen-text-start zen-text-xs",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  f.path === current
                    ? "zen-bg-zen-background zen-font-medium zen-text-zen-foreground"
                    : "zen-text-zen-muted-fg hover:zen-text-zen-foreground",
                )}
              >
                <span className="zen-min-w-0 zen-flex-1 zen-truncate">{f.path}</span>
                {f.readOnly ? (
                  <span
                    className="zen-shrink-0 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1 zen-text-[0.625rem] zen-text-zen-muted-fg"
                    title="Read only"
                  >
                    RO
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col">
        {toolbar ? (
          <div className="zen-flex zen-items-center zen-gap-2 zen-border-b zen-border-zen-border zen-px-2 zen-py-1">
            {toolbar}
          </div>
        ) : null}
        <CodeEditor
          {...editor}
          height={height}
          /* Keyed on the path so switching files remounts rather than handing
             the new content to an editor still holding the old undo stack —
             which is how Ctrl+Z in one file edits another. */
          key={file?.path}
          value={file?.content ?? ""}
          language={file?.language}
          readOnly={file?.readOnly}
          onChange={(next) => file && onFileChange?.(file.path, next)}
          className="zen-rounded-none zen-border-0"
        />
      </div>
    </div>
  );
};

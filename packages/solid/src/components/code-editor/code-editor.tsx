/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSignal, createEffect, onCleanup, onMount, Show, For, type JSX } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * CodeEditor — a code surface, wrapping `monaco-editor` (an OPTIONAL peer
 * dependency, lazily imported).
 *
 *   <CodeEditor language="python" value={code()} onChange={setCode} />
 *
 * The React binding wraps `@monaco-editor/react`; that package is React-only, so
 * Solid drives `monaco-editor` directly. Same props, same behaviour — the
 * difference is composition, not API, which is the parity rule.
 *
 * Deliberately a THIN wrapper. Monaco is enormous and well documented, and
 * re-exporting a curated slice of its options would only stop a caller reaching
 * the rest; `options` passes straight through. What this adds is what every app
 * re-decides and gets inconsistent: the zen theme, a font size that is a prop
 * rather than a magic number, read-only, and a language name.
 *
 * It does NOT run code. Execution is a sandbox, a rate limit and an auth
 * boundary. `onRun` is a callback: yours to implement.
 *
 * If Monaco is absent this degrades to a plain read-only pre with an install
 * hint, rather than taking the tree down — the same choice RichText makes here.
 *
 * Monaco is loaded through `@monaco-editor/loader` — the framework-agnostic
 * package that `@monaco-editor/react` itself uses. That is deliberate: it means
 * both bindings load Monaco the same way, so they behave the same rather than
 * merely looking the same, which is what parity is for.
 *
 * It also settles the worker problem. Importing `monaco-editor`'s ESM build
 * directly requires the consumer to wire `MonacoEnvironment`, and Monaco's own
 * worker entry then fails to resolve under Vite ("Failed to resolve module
 * specifier ../../../base/common/worker/webWorkerBootstrap.js") — measured, and
 * not fixable from inside a component. The loader fetches a build whose workers
 * are already wired.
 *
 * By default it fetches from a CDN. `loaderConfig` points it at a copy you host,
 * which is the answer for an exam that must not depend on someone else's uptime:
 *
 *   <CodeEditor loaderConfig={{ paths: { vs: "/vendor/monaco/vs" } }} />
 */

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
  /** Follows the document's theme when omitted. */
  theme?: "light" | "dark";
  /** px. Default 14. */
  fontSize?: number;
  readOnly?: boolean;
  /** CSS height for the editor box. Default `"24rem"`. */
  height?: string;
  minimap?: boolean;
  lineNumbers?: boolean;
  /** Wired to Ctrl/Cmd+Enter as well as any button you render. */
  onRun?: (value: string) => void;
  /** Raw Monaco options, merged over the defaults. */
  options?: Record<string, any>;
  /** Monaco's editor instance, for a caller that needs it. */
  onMount?: (editor: any, monaco: any) => void;
  /**
   * Passed to `@monaco-editor/loader`. Use `{ paths: { vs: "/vendor/monaco/vs" } }`
   * to load a self-hosted copy instead of the default CDN.
   */
  loaderConfig?: Record<string, any>;
  class?: string;
}

export const CodeEditor = (props: CodeEditorProps) => {
  const [status, setStatus] = createSignal<"loading" | "ready" | "missing">("loading");
  let host: HTMLDivElement | undefined;
  let editor: any = null;
  let monaco: any = null;
  /* Set while the editor's own change event is being applied, so writing the
     caller's value back does not read as a user edit and loop. */
  let applying = false;

  const height = () => props.height ?? "24rem";

  const resolvedTheme = () => {
    if (props.theme) return props.theme;
    if (typeof document === "undefined") return "light";
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  };

  onMount(async () => {
    let mod: any;
    try {
      const loaderMod: any = await import("@monaco-editor/loader");
      const loader = loaderMod.default ?? loaderMod;
      if (props.loaderConfig) loader.config(props.loaderConfig);
      mod = await loader.init();
    } catch {
      /* Optional dep missing, or the loader could not fetch Monaco — degrade
         instead of throwing past the caller. */
      setStatus("missing");
      return;
    }
    if (!host || !mod) {
      setStatus("missing");
      return;
    }
    monaco = mod;

    editor = mod.editor.create(host, {
      value: props.value ?? "",
      language: props.language ?? "plaintext",
      theme: resolvedTheme() === "dark" ? "vs-dark" : "vs",
      fontSize: props.fontSize ?? 14,
      readOnly: props.readOnly ?? false,
      minimap: { enabled: props.minimap ?? false },
      lineNumbers: (props.lineNumbers ?? true) ? "on" : "off",
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      ...props.options,
    });

    /* Monaco's own event. It fires later, so reading props here sees the
       CURRENT handler — capturing one at setup is what would go stale. */
    // eslint-disable-next-line solid/reactivity
    editor.onDidChangeModelContent(() => {
      if (applying) return;
      props.onChange?.(editor.getValue() ?? "");
    });

    /* Ctrl/Cmd+Enter is the near-universal "run" chord; a user who has to reach
       for the mouse to run their code notices. */
    if (mod.KeyMod && mod.KeyCode) {
      /* Registered once on the editor; invoked on every chord, so the props
         read inside is the current one. */
      // eslint-disable-next-line solid/reactivity
      editor.addCommand(mod.KeyMod.CtrlCmd | mod.KeyCode.Enter, () => {
        props.onRun?.(editor.getValue() ?? "");
      });
    }

    setStatus("ready");
    props.onMount?.(editor, mod);
    onCleanup(() => editor?.dispose());
  });

  /* Controlled value: write it back only when it genuinely differs, or every
     keystroke would reset the cursor to the start of the document. */
  createEffect(() => {
    const next = props.value ?? "";
    if (!editor || editor.getValue() === next) return;
    applying = true;
    editor.setValue(next);
    applying = false;
  });

  createEffect(() => {
    if (!editor || !monaco) return;
    monaco.editor.setModelLanguage(editor.getModel(), props.language ?? "plaintext");
  });

  createEffect(() => {
    if (!monaco) return;
    monaco.editor.setTheme(resolvedTheme() === "dark" ? "vs-dark" : "vs");
  });

  createEffect(() => {
    editor?.updateOptions({
      readOnly: props.readOnly ?? false,
      fontSize: props.fontSize ?? 14,
      minimap: { enabled: props.minimap ?? false },
      lineNumbers: (props.lineNumbers ?? true) ? "on" : "off",
    });
  });

  return (
    <div
      class={cn(
        "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        props.class,
      )}
    >
      <Show
        when={status() !== "missing"}
        fallback={
          <div
            style={{ height: height() }}
            class="zen-flex zen-items-center zen-justify-center zen-p-4 zen-text-center zen-text-sm zen-text-zen-muted-fg"
          >
            CodeEditor needs <code class="zen-mx-1 zen-font-mono">@monaco-editor/loader</code> installed, and network access to fetch Monaco.
          </div>
        }
      >
        <div ref={host} style={{ height: height() }} />
      </Show>
    </div>
  );
};

export interface CodeFile {
  /** Unique; also the display name. Use a path for grouping, e.g. `src/app.ts`. */
  path: string;
  content: string;
  language?: CodeLanguage;
  /** Shows an "RO" badge and locks the editor on this file. */
  readOnly?: boolean;
}

export interface IDEWindowProps
  extends Omit<CodeEditorProps, "value" | "onChange" | "language" | "readOnly"> {
  files: CodeFile[];
  activePath?: string;
  defaultActivePath?: string;
  onActivePathChange?: (path: string) => void;
  onFileChange?: (path: string, content: string) => void;
  /** Toolbar slot — a Run button, a language picker. */
  toolbar?: JSX.Element;
  class?: string;
}

/**
 * IDEWindow — a file list beside a CodeEditor.
 *
 * A flat list rather than a folder tree: a tree needs expand state, drag to
 * move and a rename affordance to be worth having, and a half-tree is worse
 * than an honest list. Paths still read as paths.
 */
export const IDEWindow = (props: IDEWindowProps) => {
  // eslint-disable-next-line solid/reactivity
  const [internal, setInternal] = createSignal(props.defaultActivePath ?? props.files[0]?.path ?? "");
  const current = () => props.activePath ?? internal();
  const file = () => props.files.find((f) => f.path === current()) ?? props.files[0];
  const height = () => props.height ?? "24rem";

  const select = (path: string) => {
    setInternal(path);
    props.onActivePathChange?.(path);
  };

  return (
    <div
      class={cn(
        "zen-flex zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        props.class,
      )}
    >
      {/* A real list, so a screen reader gets the file count. */}
      <nav
        aria-label="Files"
        class="zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-e zen-border-zen-border zen-bg-zen-muted"
        style={{ height: height() }}
      >
        <ul class="zen-m-0 zen-list-none zen-p-1">
          <For each={props.files}>
            {(f) => (
              <li>
                <button
                  type="button"
                  aria-current={f.path === current() ? "true" : undefined}
                  onClick={() => select(f.path)}
                  class={cn(
                    "zen-flex zen-w-full zen-items-center zen-gap-1 zen-rounded-zen-sm zen-px-2 zen-py-1 zen-text-start zen-text-xs",
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                    f.path === current()
                      ? "zen-bg-zen-background zen-font-medium zen-text-zen-foreground"
                      : "zen-text-zen-muted-fg hover:zen-text-zen-foreground",
                  )}
                >
                  <span class="zen-min-w-0 zen-flex-1 zen-truncate">{f.path}</span>
                  <Show when={f.readOnly}>
                    <span
                      class="zen-shrink-0 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1 zen-text-xs zen-text-zen-muted-fg"
                      title="Read only"
                    >
                      RO
                    </span>
                  </Show>
                </button>
              </li>
            )}
          </For>
        </ul>
      </nav>

      <div class="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col">
        <Show when={props.toolbar}>
          <div class="zen-flex zen-items-center zen-gap-2 zen-border-b zen-border-zen-border zen-px-2 zen-py-1">
            {props.toolbar}
          </div>
        </Show>
        {/*
          Keyed on the path so switching files REMOUNTS the editor rather than
          handing new content to one still holding the old undo stack — which is
          how Ctrl+Z in one file edits another.
        */}
        <Show when={file()} keyed>
          {(f) => (
            <CodeEditor
              {...props}
              height={height()}
              value={f.content}
              language={f.language}
              readOnly={f.readOnly}
              onChange={(next) => props.onFileChange?.(f.path, next)}
              class="zen-rounded-none zen-border-0"
            />
          )}
        </Show>
      </div>
    </div>
  );
};

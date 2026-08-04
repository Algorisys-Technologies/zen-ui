/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "../../lib/cn";
import { applyProps, Disposer, setChildren, type BaseProps, type Child, type ZenComponent } from "../../lib/component";

/**
 * CodeEditor — a code surface over `monaco-editor`.
 *
 *   CodeEditor({ language: "python", value: code, onChange: setCode }).el
 *
 * Vanilla port; see the React binding for the reasoning. Same props, same
 * behaviour.
 *
 * Monaco is loaded through `@monaco-editor/loader` — the framework-agnostic
 * package `@monaco-editor/react` itself uses, and the one the Solid binding
 * takes. React's wrapper is React-only, so this binding could not use it; going
 * through the same loader means all three fetch the same Monaco the same way,
 * and behave the same rather than merely looking the same.
 *
 * It also settles the worker problem: importing `monaco-editor`'s ESM build
 * directly fails to resolve its own worker entry under Vite, and that is not
 * fixable from inside a component. The build the loader fetches has its workers
 * already wired.
 *
 * By default it fetches from a CDN. `loaderConfig` points it at a copy you host
 * — the answer for an exam that must not depend on someone else's uptime:
 *
 *   CodeEditor({ loaderConfig: { paths: { vs: "/vendor/monaco/vs" } } })
 *
 * Deliberately a THIN wrapper: `options` passes straight through rather than
 * re-exporting a curated slice a caller cannot see past.
 *
 * It does NOT run code. Execution is a server concern — a sandbox, a container,
 * a rate limit and an auth boundary. `onRun` is yours to implement.
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

export interface CodeEditorProps extends BaseProps {
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
  /** Raw Monaco options, merged over the defaults. */
  options?: Record<string, any>;
  /** Monaco's own mount callback, for a caller that needs the editor instance. */
  onMount?: (editor: any, monaco: any) => void;
  /**
   * Passed to `@monaco-editor/loader`. Use `{ paths: { vs: "/vendor/monaco/vs" } }`
   * to serve Monaco yourself instead of from the CDN.
   */
  loaderConfig?: Record<string, any>;
  /** Shown while Monaco loads. */
  loading?: Child;
}

export function CodeEditor(props: CodeEditorProps): ZenComponent<CodeEditorProps> {
  let current: CodeEditorProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let status: "loading" | "ready" | "missing" = "loading";
  let editor: any = null;
  let monaco: any = null;
  /* Set while the editor's own change event is being applied, so writing the
     caller's value back does not read as a user edit and loop. */
  let applying = false;
  let disposed = false;

  const el = document.createElement("div");
  const host = document.createElement("div");
  const message = document.createElement("div");

  const height = () => current.height ?? "24rem";

  const resolvedTheme = (): "light" | "dark" => {
    if (current.theme) return current.theme;
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  };

  const paintShell = () => {
    el.className = cn(
      "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
      current.class,
    );
    host.style.height = height();
    host.style.width = "100%";
    message.style.height = height();

    el.replaceChildren();
    if (status === "missing") {
      message.className =
        "zen-flex zen-items-center zen-justify-center zen-p-4 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      message.replaceChildren();
      message.append("CodeEditor needs ");
      const code = document.createElement("code");
      code.className = "zen-mx-1 zen-font-mono";
      code.textContent = "@monaco-editor/loader";
      message.append(code, " installed, and network access to fetch Monaco.");
      el.append(message);
    } else if (status === "loading") {
      message.className = "zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg";
      setChildren(message, current.loading ?? "Loading editor…");
      /* The host stays mounted and merely hidden: Monaco is created into it, and
         creating into a node that is not in the document gives an editor with a
         measured size of zero. */
      host.style.display = "none";
      el.append(message, host);
    } else {
      host.style.display = "";
      el.append(host);
    }
  };

  /* Follows the document's theme when the caller does not pin one, so an editor
     inside a dark panel is not a white rectangle. */
  const themeObserver = new MutationObserver(() => {
    if (current.theme || !monaco) return;
    monaco.editor.setTheme(resolvedTheme() === "dark" ? "vs-dark" : "vs");
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  disposer.add(() => themeObserver.disconnect());

  const boot = async () => {
    let mod: any;
    try {
      const loaderMod: any = await import("@monaco-editor/loader");
      const loader = loaderMod.default ?? loaderMod;
      if (current.loaderConfig) loader.config(current.loaderConfig);
      mod = await loader.init();
    } catch {
      /* Optional dep missing, or the loader could not fetch Monaco — degrade
         instead of throwing past the caller. */
      status = "missing";
      paintShell();
      return;
    }
    if (disposed) return;
    if (!mod) {
      status = "missing";
      paintShell();
      return;
    }

    monaco = mod;
    status = "ready";
    paintShell();

    editor = mod.editor.create(host, {
      value: current.value ?? "",
      language: current.language ?? "plaintext",
      theme: resolvedTheme() === "dark" ? "vs-dark" : "vs",
      fontSize: current.fontSize ?? 14,
      readOnly: current.readOnly ?? false,
      minimap: { enabled: current.minimap ?? false },
      lineNumbers: (current.lineNumbers ?? true) ? "on" : "off",
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      ...current.options,
    });

    /* Monaco's own event. It fires later, so reading `current` here sees the
       CURRENT handler — capturing one at setup is what would go stale. */
    editor.onDidChangeModelContent(() => {
      if (applying) return;
      current.onChange?.(editor.getValue() ?? "");
    });

    /* Ctrl/Cmd+Enter is the near-universal "run" chord; a user who has to reach
       for the mouse to run their code notices. */
    if (mod.KeyMod && mod.KeyCode) {
      editor.addCommand(mod.KeyMod.CtrlCmd | mod.KeyCode.Enter, () => {
        current.onRun?.(editor.getValue() ?? "");
      });
    }

    current.onMount?.(editor, mod);
    disposer.add(() => editor?.dispose());
  };

  const sync = () => {
    if (!editor || !monaco) return;

    /* Controlled value: written back only when it genuinely differs, or every
       keystroke would reset the cursor to the start of the document. */
    const next = current.value ?? "";
    if (editor.getValue() !== next) {
      applying = true;
      editor.setValue(next);
      applying = false;
    }

    monaco.editor.setModelLanguage(editor.getModel(), current.language ?? "plaintext");
    monaco.editor.setTheme(resolvedTheme() === "dark" ? "vs-dark" : "vs");
    editor.updateOptions({
      readOnly: current.readOnly ?? false,
      fontSize: current.fontSize ?? 14,
      minimap: { enabled: current.minimap ?? false },
      lineNumbers: (current.lineNumbers ?? true) ? "on" : "off",
    });
  };

  const applyRest = () => {
    const {
      value: _v, onChange: _oc, language: _l, theme: _t, fontSize: _fs, readOnly: _ro,
      height: _h, minimap: _m, lineNumbers: _ln, onRun: _or, options: _o, onMount: _om,
      loaderConfig: _lc, loading: _ld, class: _c, children: _ch,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  paintShell();
  applyRest();
  void boot();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      paintShell();
      sync();
      applyRest();
    },
    destroy() {
      disposed = true;
      disposer.dispose();
      el.remove();
    },
  };
}

export interface CodeFile {
  /** Unique; also the display name. Use a path for a tree, e.g. `src/app.ts`. */
  path: string;
  content: string;
  language?: CodeLanguage;
  /** Shows an "RO" badge and locks the editor on this file. */
  readOnly?: boolean;
}

export interface IDEWindowProps extends Omit<CodeEditorProps, "value" | "onChange" | "language" | "readOnly"> {
  files: CodeFile[];
  /** Controlled active path. */
  activePath?: string;
  defaultActivePath?: string;
  onActivePathChange?: (path: string) => void;
  onFileChange?: (path: string, content: string) => void;
  /** Toolbar slot — a Run button, a language picker, whatever the screen needs. */
  toolbar?: Child;
}

/**
 * IDEWindow — a file list beside a CodeEditor.
 *
 * A flat list rather than a folder tree: a tree needs expand state, drag to move
 * and a rename affordance to be worth having, and a half-tree is worse than an
 * honest list. Paths still read as paths, so a caller who wants grouping has the
 * information.
 */
export function IDEWindow(props: IDEWindowProps): ZenComponent<IDEWindowProps> {
  let current: IDEWindowProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let internal = current.defaultActivePath ?? current.files[0]?.path ?? "";

  const el = document.createElement("div");
  const nav = document.createElement("nav");
  const list = document.createElement("ul");
  const right = document.createElement("div");
  const bar = document.createElement("div");

  nav.setAttribute("aria-label", "Files");
  nav.append(list);
  el.append(nav, right);

  const activePath = () => current.activePath ?? internal;
  const activeFile = () => current.files.find((f) => f.path === activePath()) ?? current.files[0];

  const editorProps = (): CodeEditorProps => {
    const {
      files: _f, activePath: _a, defaultActivePath: _d, onActivePathChange: _oa,
      onFileChange: _of, toolbar: _t, class: _c, children: _ch,
      ...editor
    } = current;
    const file = activeFile();
    return {
      ...editor,
      height: current.height ?? "24rem",
      value: file?.content ?? "",
      language: file?.language,
      readOnly: file?.readOnly,
      onChange: (next) => {
        const f = activeFile();
        if (f) current.onFileChange?.(f.path, next);
      },
      class: "zen-rounded-none zen-border-0",
    };
  };

  let editor = CodeEditor(editorProps());
  disposer.add(() => editor.destroy());

  const select = (path: string) => {
    internal = path;
    current.onActivePathChange?.(path);
    swapFile();
    render();
  };

  /**
   * Switching files REBUILDS the editor rather than handing it new text.
   *
   * React keys the editor on the path for the same reason: an editor that keeps
   * its model across a file switch keeps the old undo stack with it, so Ctrl+Z in
   * one file edits another. Monaco has no cheaper way to say "this is a different
   * document" from the outside.
   */
  const swapFile = () => {
    const next = CodeEditor(editorProps());
    editor.el.replaceWith(next.el);
    editor.destroy();
    editor = next;
  };

  const render = () => {
    const { files, toolbar, height = "24rem", class: className } = current;
    const active = activePath();

    el.className = cn(
      "zen-flex zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
      className,
    );

    /* A real list, so a screen reader gets the file count. */
    nav.className = "zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-e zen-border-zen-border zen-bg-zen-muted";
    nav.style.height = height;
    list.className = "zen-m-0 zen-list-none zen-p-1";
    list.replaceChildren();

    for (const f of files) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      if (f.path === active) btn.setAttribute("aria-current", "true");
      btn.className = cn(
        "zen-flex zen-w-full zen-items-center zen-gap-1 zen-rounded-zen-sm zen-px-2 zen-py-1 zen-text-start zen-text-xs",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        f.path === active
          ? "zen-bg-zen-background zen-font-medium zen-text-zen-foreground"
          : "zen-text-zen-muted-fg hover:zen-text-zen-foreground",
      );
      const name = document.createElement("span");
      name.className = "zen-min-w-0 zen-flex-1 zen-truncate";
      name.textContent = f.path;
      btn.append(name);
      if (f.readOnly) {
        const ro = document.createElement("span");
        ro.className = "zen-shrink-0 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1 zen-text-[0.625rem] zen-text-zen-muted-fg";
        ro.title = "Read only";
        ro.textContent = "RO";
        btn.append(ro);
      }
      const click = () => select(f.path);
      btn.addEventListener("click", click);
      disposer.add(() => btn.removeEventListener("click", click));
      li.append(btn);
      list.append(li);
    }

    right.className = "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col";
    right.replaceChildren();
    if (toolbar !== undefined && toolbar !== null && toolbar !== false) {
      bar.className = "zen-flex zen-items-center zen-gap-2 zen-border-b zen-border-zen-border zen-px-2 zen-py-1";
      setChildren(bar, toolbar);
      right.append(bar);
    }
    right.append(editor.el);

    const {
      files: _f, activePath: _a, defaultActivePath: _d, onActivePathChange: _oa,
      onFileChange: _of, toolbar: _t, class: _c, children: _ch,
      theme: _th, fontSize: _fs, height: _h, minimap: _m, lineNumbers: _ln,
      onRun: _or, options: _o, onMount: _om, loaderConfig: _lc, loading: _ld,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      const before = activePath();
      current = { ...current, ...next };
      if (activePath() !== before) swapFile();
      else editor.update(editorProps());
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

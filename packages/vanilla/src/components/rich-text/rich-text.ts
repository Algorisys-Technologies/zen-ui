/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "../../lib/cn";
import { Disposer, type ZenComponent } from "../../lib/component";

/**
 * RichText — WYSIWYG editor wrapping `jodit` (an OPTIONAL peer dependency).
 * Lazy-loaded so it never weighs on consumers who don't edit rich text.
 * Install `jodit` to use it, and import its CSS once in your app:
 * `import "jodit/es2021/jodit.min.css"`.
 *
 *   const rt = RichText({ value: html, onChange: setHtml, placeholder: "Write…" });
 *   document.body.append(rt.el);
 *
 * `onChange` fires on blur (Jodit's recommended commit point — its per-keystroke
 * event is noisy and can fight controlled state).
 *
 * The React binding reaches for `jodit-pro-react`; Jodit's own package is plain
 * vanilla JS (it IS a framework-agnostic editor), so this binding drives it
 * directly and `config` keeps the same meaning. Public API matches React:
 * `value` / `onChange` / `placeholder` / `config` / `class`.
 *
 * If Jodit is absent the dynamic import rejects — React catches that in an error
 * boundary and renders an install hint; there is no boundary here and a rejected
 * `import()` would otherwise escape past the caller, so it is caught and the same
 * hint is rendered. jodit is NOT bundled: the `import("jodit")` is a real dynamic
 * import so a consumer who never renders RichText never pays for it.
 */
export interface RichTextProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  /** raw Jodit config, merged over the defaults */
  config?: Record<string, any>;
  class?: string;
}

const LOADING_CLASS = "zen-text-sm zen-text-zen-muted-fg";
const FALLBACK_CLASS =
  "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-4 zen-text-sm zen-text-zen-muted-fg";

export function RichText(props: RichTextProps = {}): ZenComponent<RichTextProps> {
  let current: RichTextProps = { ...props };
  const disposer = new Disposer();

  const el = document.createElement("div");
  el.className = cn(current.class);

  // Loading placeholder — replaced once the import settles one way or the other.
  const status = document.createElement("div");
  status.className = LOADING_CLASS;
  status.textContent = "Loading editor…";
  el.append(status);

  // Jodit takes ownership of `mount` and writes its own `display` onto it, so the
  // node must already exist before Jodit.make runs and must never be re-rendered
  // by us afterwards. It stays detached until the editor is ready.
  const mount = document.createElement("div");

  let editor: any = null;
  let destroyed = false;

  // Config is read once at construction — same as React, where `config` is passed
  // once per mount by JoditEditor. Rebuilding on every change would blow away the
  // editor's state, so later `config` / `placeholder` changes are deliberately
  // ignored (the value below is captured now).
  const editorConfig = {
    readonly: false,
    placeholder: current.placeholder ?? "",
    ...current.config,
  };

  const value = () => current.value ?? "";

  const showFallback = () => {
    if (destroyed) return;
    status.className = FALLBACK_CLASS;
    status.textContent = "";
    const strong = document.createElement("strong");
    strong.className = "zen-font-medium zen-text-zen-foreground";
    strong.textContent = "RichText needs an optional peer dependency.";
    const code = document.createElement("code");
    code.textContent = "jodit";
    status.append(strong, document.createTextNode(" Install "), code, document.createTextNode(" to use this component."));
  };

  // The dynamic import resolves on a later microtask, by which point the caller
  // has appended `el`, so Jodit.make measures against a node that is in the DOM.
  void (async () => {
    let mod: any;
    try {
      mod = await import("jodit");
    } catch {
      showFallback();
      return;
    }
    if (destroyed) return;
    const Jodit = mod?.Jodit ?? mod?.default?.Jodit;
    if (typeof Jodit?.make !== "function") {
      showFallback();
      return;
    }
    try {
      editor = Jodit.make(mount, editorConfig);
    } catch {
      showFallback();
      return;
    }
    editor.value = value();
    editor.events.on("blur", () => current.onChange?.(editor.value));
    // Swap the loading placeholder for the live editor.
    status.remove();
    el.append(mount);
  })();

  disposer.add(() => {
    editor?.destruct?.();
    editor = null;
  });

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if ("class" in next) el.className = cn(current.class);
      // Controlled-value sync. Only push when it genuinely differs, or every
      // keystroke round-trips through the editor and the caret jumps to the end.
      if ("value" in next && editor && editor.value !== value()) {
        editor.value = value();
      }
    },
    destroy() {
      destroyed = true;
      disposer.dispose();
      el.remove();
    },
  };
}

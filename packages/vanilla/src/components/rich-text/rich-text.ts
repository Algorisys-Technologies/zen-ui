/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "../../lib/cn";
import { Disposer, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";

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
 * `value` / `onChange` / `placeholder` / `config` / `onImageUpload` / `math` /
 * `class`.
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
  /**
   * Handle an inserted image and return the URL to embed.
   *
   * Without it, Jodit inlines the file as a base64 data URI — which works,
   * and quietly puts a two-megabyte string inside the HTML you then store in a
   * database and send back on every read. Supply this and the editor embeds a
   * URL instead; uploading is yours, for the same reason UploadCollection does
   * not own its transport. Whether uploads go through it is decided at
   * construction, like `config`; the LATEST function passed through `update()`
   * is the one called.
   */
  onImageUpload?: (file: File) => Promise<string>;
  /**
   * Render `$…$` and `$$…$$` as maths, using KaTeX, in a preview beneath the
   * editor.
   *
   * `katex` is an OPTIONAL peer dependency, loaded only when this is on, so an
   * app with no equations never downloads it. Import its stylesheet once in your
   * app (`import "katex/dist/katex.min.css"`) — KaTeX's markup is unreadable
   * without it. Rendering happens on the OUTPUT (see `renderMath`) rather than
   * inside the editor: the author writes and edits the TeX source, which is the
   * only form that survives a round trip through storage.
   */
  math?: boolean;
  class?: string;
}

/**
 * Render `$…$` and `$$…$$` in an HTML string as maths.
 *
 * Separate from the editor and exported, because the same string has to render
 * the same way everywhere it appears — the editor's preview, the page that shows
 * the content, a printed report. A component that rendered maths only inside
 * itself would leave the others showing raw TeX.
 *
 * Returns the input unchanged if `katex` is not installed — an equation that
 * shows as `$x^2$` is legible; a thrown error is not.
 */
export const renderMath = async (html: string): Promise<string> => {
  let katex: any;
  try {
    katex = await import("katex");
  } catch {
    return html;
  }
  const render = (tex: string, display: boolean) => {
    try {
      return (katex.default ?? katex).renderToString(tex, {
        displayMode: display,
        throwOnError: false,
      });
    } catch {
      /* A malformed equation renders as its source rather than taking the
         surrounding document with it. */
      return display ? `$$${tex}$$` : `$${tex}$`;
    }
  };
  return html
    .replace(/\$\$([^$]+)\$\$/g, (_m, tex: string) => render(tex, true))
    .replace(/\$([^$\n]+)\$/g, (_m, tex: string) => render(tex, false));
};

const LOADING_CLASS = "zen-text-sm zen-text-zen-muted-fg";
const FALLBACK_CLASS =
  "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-4 zen-text-sm zen-text-zen-muted-fg";

export function RichText(props: RichTextProps = {}): ZenComponent<RichTextProps> {
  let current: RichTextProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();

  const el = document.createElement("div");
  el.className = cn(current.class);

  // Loading placeholder — replaced once the import settles one way or the other.
  const status = document.createElement("div");
  status.className = LOADING_CLASS;
  status.textContent = loc.t("richText.loadingEditor");
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
    // Jodit's beforeInitHook fetches `<basePath>config.js` when
    // loadExternalConfig is on (its default), so every RichText mount fired a
    // request for a file zen-ui does not ship and never will — a guaranteed 404
    // in the console of any app using it. Nothing reads the response; turning it
    // off removes a failed request per mount and nothing else. A caller who DOES
    // host a jodit config can turn it back on through `config`, since theirs is
    // spread after this.
    loadExternalConfig: false,
    /*
     * Jodit's own default is neither base64 nor a working upload (its `url` is
     * empty), so match React: inline as base64 unless the caller takes the file.
     * With a handler, the file goes wherever the caller sends it and only the
     * URL is embedded. `customUploadFunction` is Jodit's hook for replacing the
     * transport; it answers in Jodit's own response shape, so Jodit's default
     * success handler does the inserting for every entry point (toolbar, drop,
     * paste).
     *
     * `url` is never requested — the custom function replaces the request — but
     * it must not be empty: Jodit binds drop and paste on the editor only when
     * `url` (or base64) is set, so with "" an image dropped into the text went
     * nowhere and only the toolbar's Upload tab reached the handler (measured).
     */
    ...(current.onImageUpload
      ? {
          uploader: {
            insertImageAsBase64URI: false,
            url: "onImageUpload",
            customUploadFunction: async (request: unknown) => {
              const files =
                request instanceof FormData
                  ? [...request.values()].filter((v): v is File => v instanceof File)
                  : [];
              try {
                const urls: string[] = [];
                const isImages: boolean[] = [];
                for (const file of files) {
                  const url = await current.onImageUpload?.(file);
                  if (!url) continue;
                  urls.push(url);
                  isImages.push(!file.type || file.type.startsWith("image/"));
                }
                return { success: true, time: "", data: { baseurl: "", files: urls, isImages, messages: [] } };
              } catch (error) {
                return {
                  success: false,
                  time: "",
                  data: { baseurl: "", files: [], messages: [error instanceof Error ? error.message : String(error)] },
                };
              }
            },
          },
        }
      : { uploader: { insertImageAsBase64URI: true } }),
    ...current.config,
  };

  const value = () => current.value ?? "";

  const showFallback = () => {
    if (destroyed) return;
    status.className = FALLBACK_CLASS;
    status.textContent = "";
    const strong = document.createElement("strong");
    strong.className = "zen-font-medium zen-text-zen-foreground";
    strong.textContent = "RichText needs an optional peer dependency."; // i18n-ignore (a developer notice: install instructions)
    const code = document.createElement("code");
    code.textContent = "jodit"; // i18n-ignore (a package name)
    status.append(strong, document.createTextNode(" Install "), code, document.createTextNode(" to use this component."));
  };

  // The dynamic import resolves on a later microtask, by which point the caller
  // has appended `el`, so Jodit.make measures against a node that is in the DOM.
  void (async () => {
    let mod: any;
    try {
      mod = await import("jodit");
      /* The bare entry registers only 22 of Jodit's 68 plugins: no paste,
         clipboard, source, fullsize, justify, indent, search… React's
         jodit-pro build has all of them, so this loads the rest. Without
         `paste`, a pasted image never reached onImageUpload and fell through
         to the browser's own base64 insert. */
      await import("jodit/esm/plugins/all.js");
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
    /* The mount goes INTO the document before Jodit.make, not after. Jodit
       inserts its container beside the element it is given, and a detached
       element has nowhere to insert it: making the editor first and swapping
       the mount in afterwards (as this did, and as the previous
       `status.remove(); el.append(mount)` did) left /rich-text an empty box,
       with no error for any check to catch. In the placeholder's place, so it
       stays ahead of the maths preview when there is one. */
    status.replaceWith(mount);
    try {
      editor = Jodit.make(mount, editorConfig);
    } catch {
      mount.replaceWith(status);
      showFallback();
      return;
    }
    editor.value = value();
    editor.events.on("blur", () => current.onChange?.(editor.value));
  })();

  disposer.add(() => {
    editor?.destruct?.();
    editor = null;
  });

  /*
   * The editor holds TeX SOURCE — `$x^2$` — because that is the only form that
   * survives a round trip through storage and back into an editor. The rendered
   * form goes in a preview beneath it, so an author can see what they wrote
   * without the editor mangling KaTeX's markup on the next keystroke. Built only
   * while `math` is on, so without it RichText renders exactly what it always did.
   */
  let preview: { figure: HTMLElement; body: HTMLElement } | null = null;
  let mathSeq = 0;
  const syncMath = () => {
    if (!current.math) {
      mathSeq += 1;
      preview?.figure.remove();
      preview = null;
      return;
    }
    if (!preview) {
      const figure = document.createElement("figure");
      figure.className =
        "zen-mt-2 zen-m-0 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-3";
      const caption = document.createElement("figcaption");
      caption.className = "zen-mb-1 zen-text-xs zen-font-medium zen-text-zen-muted-fg";
      caption.textContent = loc.t("richText.preview");
      const body = document.createElement("div");
      body.className = "zen-text-sm zen-text-zen-foreground";
      figure.append(caption, body);
      preview = { figure, body };
      el.append(figure);
    }
    const seq = ++mathSeq;
    const target = preview.body;
    void renderMath(value()).then((html) => {
      // Overtaken by a newer value (or math turned off): drop the stale render.
      if (seq !== mathSeq || destroyed) return;
      // The HTML is the author's own, already in the editor above; KaTeX output
      // is markup by definition. Sanitise upstream if the author is not trusted.
      target.innerHTML = html;
    });
  };
  syncMath();

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
      if ("value" in next || "math" in next) syncMath();
    },
    destroy() {
      destroyed = true;
      disposer.dispose();
      el.remove();
    },
  };
}

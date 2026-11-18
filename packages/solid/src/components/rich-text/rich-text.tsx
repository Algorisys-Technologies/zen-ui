/* eslint-disable @typescript-eslint/no-explicit-any */
import { createEffect, createMemo, createSignal, on, onCleanup, onMount, Show } from "solid-js";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * RichText — WYSIWYG editor wrapping `jodit` (an OPTIONAL peer dependency).
 * Lazy-loaded so it never weighs on consumers who don't edit rich text.
 * Install `jodit` to use it, and import its CSS once in your app:
 * `import "jodit/es2021/jodit.min.css"`.
 *
 *   <RichText value={html()} onChange={setHtml} placeholder="Write…" />
 *
 * `onChange` fires on blur (Jodit's recommended commit point — its
 * per-keystroke event is noisy and can fight controlled state).
 *
 * The React binding reaches for `jodit-pro-react`; Jodit's own package is
 * vanilla JS, so Solid drives it directly and `config` keeps the same meaning.
 * If Jodit is absent, the import failure is caught and this degrades to a plain
 * contentEditable surface — same props, no toolbar — with a hint naming the
 * package to install. React crashes the tree in that case; this does not.
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
   * not own its transport.
   */
  onImageUpload?: (file: File) => Promise<string>;
  /**
   * Render `$…$` and `$$…$$` as maths, using KaTeX.
   *
   * `katex` is an OPTIONAL peer dependency, loaded only when this is on, so an
   * app with no equations never downloads it. Rendering happens on the OUTPUT
   * (see `renderMath`) rather than inside the editor: the author writes and
   * edits the TeX source, which is the only form that survives a round trip
   * through storage. Import KaTeX's stylesheet once in your app
   * (`import "katex/dist/katex.min.css"`) or the rendered maths is unstyled.
   */
  math?: boolean;
  class?: string;
}

/**
 * Render `$…$` and `$$…$$` in an HTML string as maths.
 *
 * Separate from the editor and exported, because the same string has to render
 * the same way in the three places it appears: the editor's preview, the
 * candidate's question, and the printed report. A component that rendered maths
 * only inside itself would leave the other two showing raw TeX.
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

/** Jodit's upload-response shape, which its own success handler consumes. */
const uploadAnswer = (urls: string[], error?: string) => ({
  success: !error,
  time: "",
  data: {
    files: urls,
    isImages: urls.map(() => true),
    baseurl: "",
    messages: error ? [error] : [],
  },
});

export const RichText = (props: RichTextProps) => {
  const loc = useLocale();
  const [status, setStatus] = createSignal<"loading" | "jodit" | "fallback">("loading");

  let mountPoint: HTMLDivElement | undefined;
  let fallbackEl: HTMLDivElement | undefined;
  let editor: any = null;

  const value = () => props.value ?? "";

  const editorConfig = createMemo(() => ({
    readonly: false,
    placeholder: props.placeholder ?? "",
    /*
     * Jodit inlines a dropped or pasted image as base64 unless told otherwise.
     * That silently multiplies the stored HTML by the size of every image, and
     * the bill arrives later as a slow list page. With a handler, the file goes
     * wherever the caller sends it and only the URL is embedded.
     *
     * `customUploadFunction` is Jodit's hook for replacing the transport: it is
     * handed the FormData Jodit built and answers in Jodit's upload-response
     * shape, so Jodit's own success handler inserts the `<img>`. `url` must be
     * non-empty or Jodit never binds drop/paste to the uploader; it is never
     * requested, because the custom function replaces the request.
     */
    uploader: props.onImageUpload
      ? {
          insertImageAsBase64URI: false,
          url: "onImageUpload",
          customUploadFunction: async (request: FormData) => {
            const files = Array.from(request.values()).filter(
              (v): v is File => typeof File !== "undefined" && v instanceof File,
            );
            const urls: string[] = [];
            try {
              for (const file of files) {
                // Read at call time, so a replaced handler is the one used.
                const url = await props.onImageUpload?.(file);
                if (url) urls.push(url);
              }
            } catch (e) {
              /* Jodit shows `messages` through its own error toast; a rejected
                 promise here would surface as an unhandled rejection instead. */
              return uploadAnswer([], e instanceof Error ? e.message : String(e));
            }
            return uploadAnswer(urls);
          },
        }
      : { insertImageAsBase64URI: true },
    // Jodit's beforeInitHook fetches `<basePath>config.js` when
    // loadExternalConfig is on (its default), so every RichText mount fired a
    // request for a file zen-ui does not ship and never will — a guaranteed 404
    // in the console of any app using it. Nothing reads the response; turning it
    // off removes a failed request per mount and nothing else. A caller who DOES
    // host a jodit config can turn it back on through `config`, since theirs is
    // spread after this.
    loadExternalConfig: false,
    ...props.config,
  }));

  onMount(async () => {
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
      // Optional dep missing — degrade instead of throwing past the caller.
      setStatus("fallback");
      return;
    }
    const Jodit = mod?.Jodit ?? mod?.default?.Jodit;
    if (!mountPoint || typeof Jodit?.make !== "function") {
      setStatus("fallback");
      return;
    }
    /* Reveal the mount BEFORE Jodit.make. Jodit sizes its toolbar from the
       container's width when it is made: made while the wrapper was still
       display:none, it measured 0px and built its narrow-screen set (14
       buttons where React shows 63, the source/HTML view among the missing),
       and never rebuilt it once shown. Vanilla had the same bug with a
       detached mount. */
    setStatus("jodit");
    try {
      editor = Jodit.make(mountPoint, editorConfig());
    } catch {
      setStatus("fallback");
      return;
    }
    editor.value = value();
    // An imperative bridge to Jodit, not a tracked scope: this registers a DOM
    // listener on a third-party editor. `props.onChange` is read INSIDE the
    // callback, so it is current at fire time — which is the reactivity that
    // matters here.
    // eslint-disable-next-line solid/reactivity
    editor.events.on("blur", () => props.onChange?.(editor.value));
  });

  onCleanup(() => {
    editor?.destruct?.();
    editor = null;
  });

  // Controlled-value sync. Only push when the value genuinely differs, or every
  // keystroke round-trips through the editor and the caret jumps to the end.
  createEffect(
    on(value, (html) => {
      if (editor && editor.value !== html) editor.value = html;
      if (fallbackEl && fallbackEl.innerHTML !== html) fallbackEl.innerHTML = html;
    }),
  );

  // Jodit reads config at construction; rebuilding on every config change would
  // blow away editor state, so later changes are ignored — same as React, where
  // `config` is passed once per mount by JoditEditor.

  /*
   * The editor holds TeX SOURCE — `$x^2$` — because that is the only form that
   * survives a round trip through storage and back into an editor. The rendered
   * form goes in a preview beneath it, so an author can see what they wrote
   * without the editor mangling KaTeX's markup on the next keystroke.
   */
  const [preview, setPreview] = createSignal("");
  createEffect(() => {
    if (!props.math) return;
    const html = value();
    let cancelled = false;
    void renderMath(html).then((out) => {
      if (!cancelled) setPreview(out);
    });
    onCleanup(() => {
      cancelled = true;
    });
  });

  return (
    <div class={props.class}>
      <Show when={status() !== "loading"}>
        <Show when={status() === "fallback"}>
          <div
            class="zen-mb-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-xs zen-text-zen-muted-fg"
            role="status"
          >
            {/* i18n-ignore-next-line (a developer notice: install instructions) */}
            Rich-text toolbar unavailable — run <code>npm install jodit</code> and import{" "}
            <code>jodit/es2021/jodit.min.css</code>. Editing still works below as plain text.
          </div>
        </Show>
      </Show>

      <Show when={status() === "loading"}>
        <div class="zen-text-sm zen-text-zen-muted-fg">{loc.t("richText.loadingEditor")}</div>
      </Show>

      {/*
        Two nodes on purpose. Jodit takes ownership of the inner div and sets
        its own `display` on it; visibility is toggled on the outer wrapper so
        Solid never clears what Jodit wrote. The inner node must already exist
        when onMount runs.
      */}
      <div style={{ display: status() === "jodit" ? undefined : "none" }}>
        <div ref={mountPoint} />
      </div>

      <Show when={status() === "fallback"}>
        <div
          ref={(el) => {
            fallbackEl = el;
            // Seed on attach: the sync effect below ran at mount, long before
            // this node existed, and `fallbackEl` is not reactive.
            el.innerHTML = value();
          }}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={props.placeholder}
          data-placeholder={props.placeholder}
          class={cn(
            "zen-min-h-32 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-3 zen-text-sm zen-text-zen-foreground",
            "focus:zen-outline-none focus:zen-ring-2 focus:zen-ring-zen-ring focus:zen-ring-offset-2",
            "empty:before:zen-text-zen-muted-fg empty:before:zen-content-[attr(data-placeholder)]",
          )}
          onBlur={(e) => props.onChange?.(e.currentTarget.innerHTML)}
        />
      </Show>

      <Show when={props.math}>
        <figure class="zen-mt-2 zen-m-0 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-3">
          <figcaption class="zen-mb-1 zen-text-xs zen-font-medium zen-text-zen-muted-fg">
            {loc.t("richText.preview")}
          </figcaption>
          {/* The HTML is the author's own, already in the editor above; KaTeX
              output is markup by definition. Sanitise upstream if the author is
              not trusted. Same contract as React's dangerouslySetInnerHTML. */}
          <div
            class="zen-text-sm zen-text-zen-foreground"
            // eslint-disable-next-line solid/no-innerhtml
            innerHTML={preview()}
          />
        </figure>
      </Show>
    </div>
  );
};

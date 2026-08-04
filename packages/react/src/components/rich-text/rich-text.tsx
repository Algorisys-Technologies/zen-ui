/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

/**
 * RichText — WYSIWYG editor wrapping `jodit-pro-react` (an OPTIONAL peer
 * dependency). Lazy-loaded so it never weighs on consumers who don't edit rich
 * text. Install `jodit-pro-react` to use it.
 *
 *   <RichText value={html} onChange={setHtml} placeholder="Write…" />
 *
 * `onChange` fires on blur (Jodit's recommended commit point — its per-keystroke
 * event is noisy and can fight controlled state).
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
   * through storage.
   */
  math?: boolean;
  className?: string;
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

const JoditEditor = React.lazy(() => import("jodit-pro-react"));

/**
 * `jodit-pro-react` is an OPTIONAL peer dep, so `import()` rejects whenever a
 * consumer renders RichText without installing it. Suspense does NOT catch a
 * rejected lazy import — only an error boundary does — so without this the whole
 * React tree unmounts with a module-resolution stack trace, and the one thing it
 * never says is "install jodit-pro-react". The Solid binding degrades rather
 * than crashing; this brings React level.
 *
 * Deliberately narrow: anything that is not the missing dependency is re-thrown,
 * so real editor bugs still surface instead of hiding behind an install hint.
 */
class RichTextBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    // Vite, webpack and Node each phrase a missing module differently; match on
    // the package name, which all of them include.
    if (!/jodit-pro-react|Failed to fetch dynamically imported module/i.test(error.message)) {
      throw error;
    }
    return this.props.fallback;
  }
}

export const RichText = ({
  value = "",
  onChange,
  placeholder,
  config,
  onImageUpload,
  math,
  className,
}: RichTextProps) => {
  const uploadRef = React.useRef(onImageUpload);
  uploadRef.current = onImageUpload;

  const editorConfig = React.useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder ?? "",
      /* Inline code and a code block, which a question bank needs and Jodit
         does not enable by default. */
      controls: {},
      /*
       * Jodit inlines a dropped image as base64 unless told otherwise. That
       * silently multiplies the stored HTML by the size of every image, and the
       * bill arrives later as a slow list page. With a handler, the file goes
       * wherever the caller sends it and only the URL is embedded.
       */
      ...(onImageUpload
        ? {
            uploader: {
              insertImageAsBase64URI: false,
              url: "",
              process: undefined,
              defaultHandlerSuccess: undefined,
              customUploader: async (files: FileList, insert: (url: string) => void) => {
                for (const file of Array.from(files)) {
                  const url = await uploadRef.current?.(file);
                  if (url) insert(url);
                }
              },
            },
          }
        : { uploader: { insertImageAsBase64URI: true } }),
    // Jodit's beforeInitHook fetches `<basePath>config.js` when
    // loadExternalConfig is on (its default), so every RichText mount fired a
    // request for a file zen-ui does not ship and never will — a guaranteed 404
    // in the console of any app using it. Nothing reads the response; turning it
    // off removes a failed request per mount and nothing else. A caller who DOES
    // host a jodit config can turn it back on through `config`, since theirs is
    // spread after this.
    loadExternalConfig: false,
      ...config,
    }),
    [placeholder, config, onImageUpload],
  );

  /*
   * The editor holds TeX SOURCE — `$x^2$` — because that is the only form that
   * survives a round trip through storage and back into an editor. The rendered
   * form goes in a preview beneath it, so an author can see what they wrote
   * without the editor mangling KaTeX's markup on the next keystroke.
   */
  const [preview, setPreview] = React.useState("");
  React.useEffect(() => {
    if (!math) return;
    let cancelled = false;
    void renderMath(value).then((html) => {
      if (!cancelled) setPreview(html);
    });
    return () => {
      cancelled = true;
    };
  }, [math, value]);

  return (
    <div className={className}>
      <RichTextBoundary
        fallback={
          <div className="zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-4 zen-text-sm zen-text-zen-muted-fg">
            <strong className="zen-font-medium zen-text-zen-foreground">
              RichText needs an optional peer dependency.
            </strong>{" "}
            Install <code>jodit-pro-react</code> to use this component.
          </div>
        }
      >
        <React.Suspense
          fallback={<div className="zen-text-sm zen-text-zen-muted-fg">Loading editor…</div>}
        >
        <JoditEditor
          value={value}
          config={editorConfig}
          onBlur={(html: string) => onChange?.(html)}
        />
        </React.Suspense>
      </RichTextBoundary>

      {math ? (
        <figure className="zen-mt-2 zen-m-0 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-3">
          <figcaption className="zen-mb-1 zen-text-xs zen-font-medium zen-text-zen-muted-fg">
            Preview
          </figcaption>
          {/* The HTML is the author's own, already in the editor above; KaTeX
              output is markup by definition. Sanitise upstream if the author is
              not trusted. */}
          <div
            className="zen-text-sm zen-text-zen-foreground"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </figure>
      ) : null}
    </div>
  );
};
RichText.displayName = "RichText";

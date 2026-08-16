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
export declare const renderMath: (html: string) => Promise<string>;
export declare const RichText: {
    ({ value, onChange, placeholder, config, onImageUpload, math, className, }: RichTextProps): React.JSX.Element;
    displayName: string;
};
//# sourceMappingURL=rich-text.d.ts.map
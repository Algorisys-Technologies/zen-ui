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
    class?: string;
}
export declare const RichText: (props: RichTextProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=rich-text.d.ts.map
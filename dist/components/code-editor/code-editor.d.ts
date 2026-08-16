import * as React from "react";
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
export declare const CODE_LANGUAGES: readonly ["javascript", "typescript", "python", "java", "csharp", "go", "rust", "elixir", "ruby", "php", "sql", "html", "css", "json", "yaml", "markdown", "shell", "plaintext"];
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
export declare const CodeEditor: ({ value, onChange, language, theme, fontSize, readOnly, height, minimap, lineNumbers, onRun, options, onMount, loading, className, }: CodeEditorProps) => React.JSX.Element;
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
export declare const IDEWindow: ({ files, activePath, defaultActivePath, onActivePathChange, onFileChange, toolbar, className, height, ...editor }: IDEWindowProps) => React.JSX.Element;
//# sourceMappingURL=code-editor.d.ts.map
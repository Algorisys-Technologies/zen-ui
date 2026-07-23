import { type JSX, type ParentProps } from "solid-js";
import "./demo-helpers.css";
/**
 * Shared chrome for the shadcn-style demo pages — Solid port of the
 * React binding's demo-helpers.tsx. Uses the same `.demo-page`,
 * `.demo-section`, `.example` class names (see demo-helpers.css,
 * copied verbatim from the React side) so the two demos render
 * visually identically.
 */
/**
 * Prose props are JSX.Element, not string: the React demos mark up API names
 * with <code> chips, and a plain string prop cannot. Passing markdown-ish
 * backticks instead rendered them literally, which is how `render` and `onGo`
 * ended up on screen as backticked text.
 *
 * They are read through Show's callback rather than twice, because a prop
 * holding JSX is a getter — see the note on CodeExample's children below.
 */
export declare const DemoPage: (props: ParentProps<{
    title: string;
    description?: JSX.Element;
}>) => JSX.Element;
export declare const DemoSection: (props: ParentProps<{
    title: string;
    description?: JSX.Element;
    /**
     * Snippet that produced `children`. When given, the children render as the
     * live preview of a CodeExample card (heading + copyable code block) rather
     * than as a bare row — matching how the React demos pair every section with
     * its source. Omit it and the section keeps the plain-row layout the
     * pre-existing demos rely on.
     */
    code?: string;
    /** CodeExample heading. Defaults to the section title. */
    codeTitle?: JSX.Element;
    /** CodeExample sub-caption, shown under the heading. */
    codeDescription?: JSX.Element;
    /** Override the preview area's layout (e.g. to use grid). */
    previewStyle?: JSX.CSSProperties;
}>) => JSX.Element;
export declare const Row: (props: {
    children: JSX.Element;
}) => JSX.Element;
/**
 * CodeExample — card showing a live preview + the code that produced
 * it, with a copy-to-clipboard button. Matches the React binding's
 * CodeExample one-for-one (.example / .example-head / .example-preview
 * / .example-code).
 */
export declare const CodeExample: (props: {
    title: JSX.Element;
    description?: JSX.Element;
    code: string;
    children?: JSX.Element;
    previewStyle?: JSX.CSSProperties;
}) => JSX.Element;
//# sourceMappingURL=demo-helpers.d.ts.map
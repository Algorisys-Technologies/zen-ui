import { type ReactNode } from "react";
/**
 * CodeExample — a card that shows a live component preview, the code that
 * produces it, and a copy-to-clipboard button. Used across the shadcn-style
 * demos (NewButtonDemo, NewTooltipDemo, …).
 */
export interface CodeExampleProps {
    title: string;
    description?: string;
    code: string;
    /**
     * Live preview rendered above the code block. Optional — omit for
     * code-only doc snippets (e.g. when illustrating a polyfill the
     * library doesn't bundle).
     */
    children?: ReactNode;
    /** Override the preview area's layout (e.g. to use grid). */
    previewStyle?: React.CSSProperties;
}
export declare function CodeExample({ title, description, code, children, previewStyle, }: CodeExampleProps): import("react").JSX.Element;
//# sourceMappingURL=demo-helpers.d.ts.map
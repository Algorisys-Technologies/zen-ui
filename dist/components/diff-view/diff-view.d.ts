import * as React from "react";
export interface DiffViewProps {
    /**
     * Either snapshot, in whatever shape your audit column actually holds: an
     * object, a JSON string, a bare array, plain prose, or empty for "there was no
     * before". Strings are parsed with `parse`; a string that is not JSON is kept
     * as the text it is rather than lost to a failed parse.
     *
     * Two objects are compared field by field. Anything else is shown whole, side
     * by side, because an array has no field names to put in the left column.
     */
    before?: unknown;
    /** As `before`. Omit for a record that was deleted. */
    after?: unknown;
    /** Override how a raw string becomes a value. Defaults to a JSON parse that never throws. */
    parse?: (raw: string) => unknown;
    /** Which keys to compare, in this order. Omitted compares every key on either side. */
    keys?: string[];
    /** Display names for keys. Unlisted keys render verbatim. */
    labels?: Record<string, string>;
    /** Default `true` — an audit entry is about what changed. */
    changedOnly?: boolean;
    /**
     * How a value becomes something to look at. The default prints strings
     * verbatim, `null` as the literal word (a cleared field and an absent one are
     * different events), and anything else through `JSON.stringify`.
     */
    format?: (value: unknown, key: string) => React.ReactNode;
    /** Column headings. Defaults to "Field" / "Before" / "After". */
    headings?: {
        key?: string;
        before?: string;
        after?: string;
    };
    /** `"compact"` tightens the rows for a Timeline slot or a popover. */
    density?: "default" | "compact";
    /** Shown when nothing changed — the common case in an audit log, not an error. */
    emptyMessage?: React.ReactNode;
    className?: string;
}
export declare const DiffView: ({ before, after, parse, keys, labels, changedOnly, format, headings, density, emptyMessage, className, }: DiffViewProps) => React.JSX.Element;
//# sourceMappingURL=diff-view.d.ts.map
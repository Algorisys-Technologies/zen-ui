import { type JSX } from "solid-js";
/**
 * ObjectPageLayout — Solid binding. Mirrors
 * packages/react/src/components/object-page/object-page.tsx: same props, same
 * class strings, same observer strategy, same ARIA. See that file for why
 * `sections` is data rather than compound children, why the root needs a
 * container with a definite height, why the scroll-spy is rooted at the content
 * scroller rather than the window, and why the bar is a `nav` with
 * `aria-current` rather than a `tablist` with `aria-selected`.
 *
 * IDS: a section's `id` is its identity in the API and its id in the DOM, so it
 * must be unique in the document — one object page per screen.
 */
export interface ObjectPageSubSection {
    id: string;
    title: JSX.Element;
    content: JSX.Element;
}
export interface ObjectPageSection {
    id: string;
    title: JSX.Element;
    subSections?: ObjectPageSubSection[];
    content?: JSX.Element;
}
export type ObjectPageLayoutProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "title"> & {
    sections: ObjectPageSection[];
    /** Controlled active section. Setting it scrolls there. */
    selectedSectionId?: string;
    defaultSelectedSectionId?: string;
    /** Fires for both a click on an anchor and a scroll that changes the section. */
    onSelectedSectionChange?: (id: string) => void;
    /** The object header — scrolls away under the anchor bar. */
    header?: JSX.Element;
    /** Stays put above the scroller. */
    title?: JSX.Element;
    showAnchorBar?: boolean;
    /** Accessible name for the anchor bar's nav landmark. */
    anchorBarLabel?: string;
};
export declare const ObjectPageLayout: (props: ObjectPageLayoutProps) => JSX.Element;
//# sourceMappingURL=object-page.d.ts.map
import * as React from "react";
/**
 * ObjectPageLayout — the object detail page: a title bar that stays, an
 * object header that scrolls away, and a sticky AnchorBar whose links stay in
 * sync with whatever section you are looking at.
 *
 * docs/fiori-gap-analysis.md (Tier 1): "Object detail page with anchored,
 * scroll-synced sections. `sap.uxap`'s whole reason to exist."
 *
 *   <ObjectPageLayout
 *     title="SO-4711"
 *     header={<OrderHeader />}
 *     sections={SECTIONS}
 *     onSelectedSectionChange={setSection}
 *   />
 *
 * `sections` is DATA rather than compound children — the same departure from
 * this library's usual Radix-style composition that Tree and DataTable make, and
 * for the same structural reason (see tree.tsx's header). Two facts force it:
 * the AnchorBar has to render the WHOLE section list before a single section is
 * on screen, and the scroll-spy needs an element per section to observe. With
 * compound children both live only in the DOM, so the bar would be a DOM walk
 * re-run on every render and the observer would be re-attached as the tree
 * changed underneath it. Given the list, the bar is a map over it and the
 * observer is registered once per section.
 *
 * HEIGHT: the root is `zen-h-full` and its container must have a definite
 * height. min-height is a floor, not a ceiling — a container that grows to fit
 * its content leaves the inner scroller nothing to scroll, so it expands too,
 * and the page ends up with two scrollbars and an anchor bar that sticks to
 * nothing. This is the same bug App.css documents at `.app-shell`.
 *
 * SCROLL-SPY: an IntersectionObserver rooted at the CONTENT scroller, not the
 * window. The demo shell owns page scrolling (`.app-content` is the single
 * scroller; the document does not scroll), so a window-rooted observer would
 * never fire — and offset arithmetic against `window.scrollY` would read 0
 * forever. The band it watches is a strip across the top of the scroller,
 * starting just below the sticky bar; the first section (in document order) to
 * reach it is the one being read.
 *
 * IDS: a section's `id` is its identity in the API and its id in the DOM, so it
 * is what a URL fragment or an external link can point at — and so it must be
 * unique in the document. One object page per screen is the assumption.
 *
 * ARIA: the bar is a `nav` landmark of buttons carrying `aria-current`, not a
 * `tablist` of `role="tab"`. It behaves like a tablist — roving tabindex,
 * arrows, Home/End — and Fiori's own anchor bar looks like one, but `role="tab"`
 * promises `role="tabpanel"` siblings of which exactly one is shown. Here every
 * section is on screen at once and the bar moves the viewport rather than
 * swapping panels, so `aria-selected` would be describing a widget that isn't
 * there. `aria-current` is the attribute for "this is the one you're on".
 */
export interface ObjectPageSubSection {
    id: string;
    title: React.ReactNode;
    content: React.ReactNode;
}
export interface ObjectPageSection {
    id: string;
    title: React.ReactNode;
    subSections?: ObjectPageSubSection[];
    content?: React.ReactNode;
}
export interface ObjectPageLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    sections: ObjectPageSection[];
    /** Controlled active section. Setting it scrolls there. */
    selectedSectionId?: string;
    defaultSelectedSectionId?: string;
    /** Fires for both a click on an anchor and a scroll that changes the section. */
    onSelectedSectionChange?: (id: string) => void;
    /** The object header — scrolls away under the anchor bar. */
    header?: React.ReactNode;
    /** Stays put above the scroller. */
    title?: React.ReactNode;
    showAnchorBar?: boolean;
    /** Accessible name for the anchor bar's nav landmark. */
    anchorBarLabel?: string;
}
export declare const ObjectPageLayout: React.ForwardRefExoticComponent<ObjectPageLayoutProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=object-page.d.ts.map
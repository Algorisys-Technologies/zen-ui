/**
 * Single source of truth for the demo's navigation AND its landing-page
 * catalogue. Both App.tsx (sidebar) and components/Welcome.tsx (cards) render
 * from this list, so a component can no longer appear in one and not the other
 * — which is exactly how the landing page ended up 16 entries out of date.
 *
 * Adding a component: add it here, add its <Route> in App.tsx. Nothing else.
 */
export type NavItem = {
    to: string;
    label: string;
    /** Shown on the landing page. Omitted for non-component routes (Welcome). */
    description?: string;
    /**
     * Repo-relative path to the demo file behind this route — the USAGE, not the
     * component's own source. It is what "View code" opens.
     *
     * The demos already print a snippet, but that snippet is a `code` string
     * typed by hand next to the JSX it claims to describe, and nothing makes the
     * two agree. This is the file that actually ran.
     *
     * Kept honest by `bun run check:nav`, which asserts every one of these exists
     * and matches the component the route really renders.
     */
    source?: string;
    /**
     * The version this component first ships in. While that is the current
     * release's minor version or a later one, the sidebar and the catalogue mark
     * it "New"; one minor release later the mark goes by itself, so nobody has
     * to remember to take it off.
     */
    since?: string;
    /**
     * The version this component last changed in (a feature or a fix worth
     * knowing). While that is the current release's minor or later, and it is
     * not New, the sidebar and the catalogue mark it "Updated"; like New, the
     * mark goes by itself one minor release later. Set it when you change a
     * component, alongside the CHANGELOG entry.
     */
    updated?: string;
};
/** Whether an entry is marked New, against the latest release in RELEASE_NOTES. */
export declare const isNew: (item: NavItem) => boolean;
/** Whether an entry is marked Updated: changed in this release line, and not New. */
export declare const isUpdated: (item: NavItem) => boolean;
export type NavGroup = {
    title: string;
    items: NavItem[];
    /** Groups flagged `catalogue: false` are sidebar-only (e.g. Getting started). */
    catalogue?: boolean;
    /**
     * Whether this group's items count toward the header's component tally.
     * Default true.
     *
     * A second axis, because `catalogue` cannot express it: Patterns belongs ON
     * the landing page but is not made of components — it is screens assembled
     * from the groups above. Counting a screen as a component inflates the
     * number the header states, and that number is checked.
     */
    components?: boolean;
};
export declare const NAV: NavGroup[];
//# sourceMappingURL=nav.d.ts.map
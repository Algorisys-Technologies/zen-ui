/**
 * Single source of truth for the demo's navigation AND its landing-page
 * catalogue. Both App.tsx (sidebar) and components/Welcome.tsx (cards) render
 * from this list so the two cannot drift apart.
 *
 * Adding a component: add it here, add its <Route> in main.tsx. Nothing else.
 */
export type NavItem = {
    path: string;
    label: string;
    /** Shown on the landing page. */
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
};
export type NavGroup = {
    group: string;
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
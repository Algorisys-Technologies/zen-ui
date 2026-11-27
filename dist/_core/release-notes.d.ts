/**
 * End-user-readable release notes, newest first. Shown by the version chip in
 * each demo's footer.
 *
 * Deliberately NOT generated from CHANGELOG.md. That file is written for the
 * people who maintain zen-ui — it names tailwind-merge's radius group and
 * argues about `experimentalParseClassName`. These are for the people who USE
 * it: what changed, why it matters to them, and nothing about how it was done.
 * The two want different words, so they get different words. CHANGELOG.md stays
 * the complete record; this is the readable summary, and the dialog links to it.
 *
 * ONE copy, in core, because this is pure data and there is exactly one set of
 * notes for one design system. It used to live in each binding, and its own header
 * said "keep this in sync with the Solid binding's copy" — by hand, with nothing
 * checking. They had not drifted (measured), but only because someone copied
 * correctly every time; a third binding would have made it three copies and three
 * chances to forget. Each binding re-exports this file so its existing imports are
 * unchanged.
 */
export type ReleaseNoteKind = "new" | "improved" | "fixed" | "breaking";
/**
 * The bindings a note can be scoped to. Mirrors the ids in scripts/bindings.mjs
 * (core cannot import a build script, so the union is spelled out here).
 */
export type ReleaseBinding = "react" | "solid" | "vanilla" | "web-components";
export type ReleaseNote = {
    version: string;
    /** ISO date of the release. */
    date: string;
    kind: ReleaseNoteKind;
    /** One line. What changed, in the user's terms. */
    title: string;
    /** Optional — why it matters, when that is not obvious from the title. */
    detail?: string;
    /**
     * The bindings this release belongs to. Absent means every binding.
     *
     * Since 13.8.0 each binding carries its own version: Solid is in production
     * and ships on its own schedule, and the others catch up to parity later. So
     * "13.9.0" is a Solid version and means nothing to React's footer. Every note
     * before the split is unscoped — those releases really were all four — and a
     * note shipped by one binding must name it, or it would show up in, and expire
     * the New/Updated marks of, a binding that never released it.
     */
    bindings?: ReleaseBinding[];
};
export declare const RELEASE_NOTES: ReleaseNote[];
/**
 * The most recent `n`. The dialog says when it is showing fewer than all.
 *
 * Versions stay in the order they are authored (newest first); only the notes
 * WITHIN a version are reordered, by how much they matter. Sorting across
 * versions would need semver comparison and would lie about chronology, and a
 * comparator that returns 0 for different versions is not transitive — so this
 * groups first and sorts inside each group instead.
 */
export declare const recentReleaseNotes: (n?: number, binding?: ReleaseBinding) => ReleaseNote[];
/**
 * The notes that belong to `binding`, newest first. With no binding, every note —
 * which is what the pre-split callers, and anything binding-agnostic, want.
 */
export declare const notesFor: (binding?: ReleaseBinding) => ReleaseNote[];
/**
 * The newest version `binding` has released, by authored order. This is what a
 * demo's New/Updated marks expire against — a binding's own latest release, not
 * whichever binding shipped most recently.
 */
export declare const latestVersionFor: (binding?: ReleaseBinding) => string;

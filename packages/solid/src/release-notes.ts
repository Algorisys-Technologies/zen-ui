/**
 * End-user-readable release notes, newest first. Shown by the version chip in
 * the footer.
 *
 * Deliberately NOT generated from CHANGELOG.md. That file is written for the
 * people who maintain zen-ui — it names tailwind-merge's radius group and
 * argues about `experimentalParseClassName`. These are for the people who USE
 * it: what changed, why it matters to them, and nothing about how it was done.
 * The two want different words, so they get different words. CHANGELOG.md stays
 * the complete record; this is the readable summary, and the dialog links to it.
 *
 * Keep this in sync with the React binding's copy — one design system, one set
 * of notes.
 */

export type ReleaseNoteKind = "new" | "improved" | "fixed" | "breaking";

export type ReleaseNote = {
  version: string;
  /** ISO date of the release. */
  date: string;
  kind: ReleaseNoteKind;
  /** One line. What changed, in the user's terms. */
  title: string;
  /** Optional — why it matters, when that is not obvious from the title. */
  detail?: string;
};

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "6.0.0",
    date: "2026-07-16",
    kind: "breaking",
    title: "Pivot: the Solid workbench is laid out like React's",
    detail:
      "Solid folded the toolbar into the Available Fields header and stacked Values and Rows in a fixed sidebar with Columns over the grid. It now renders React's shape: a toolbar bar, Available Fields, then Values | Rows | Columns as three equal columns. Your page will reflow, and the grid area no longer has a hardcoded height — set one on your own grid if you relied on it. No prop changed.",
  },
  {
    version: "6.0.0",
    date: "2026-07-16",
    kind: "fixed",
    title: "Pivot: row and column counts respect your locale",
    detail:
      "Solid hardcoded Indian digit grouping, so 1234567 read as 12,34,567 for everyone. It now formats to the reader's locale, as React already did.",
  },
  {
    version: "6.0.0",
    date: "2026-07-16",
    kind: "fixed",
    title: "Pivot: warning alerts have their icon, and dead controls are gone",
    detail:
      "React's \"Value field required\" and \"Dimension required\" alerts drew an empty box where the icon belongs. In Solid, \"Clear filters\" could appear with nothing to clear, and Available fields had a remove button that moved the field to where it already was.",
  },
  {
    version: "5.0.0",
    date: "2026-07-16",
    kind: "breaking",
    title: "Pivot: available fields filter to one member at a time",
    detail:
      "React's available fields multi-selected; Solid's did not. A field in Available Fields is not placed yet, so its filter previews what is in there — one member. Placed fields (Rows, Columns, Values) still take as many as you like. The indicator is now a radio rather than a checkbox, because a square box promised a second click would add.",
  },
  {
    version: "4.0.0",
    date: "2026-07-15",
    kind: "breaking",
    title: "TypeScript types work now — and may surface real errors",
    detail:
      'package.json pointed "types" at a file the build never wrote, so every zen-ui import was silently `any`. Code that compiled against `any` now type-checks for real; errors that appear on upgrade were always there, just invisible.',
  },
  {
    version: "4.0.0",
    date: "2026-07-15",
    kind: "improved",
    title: "A Button costs 17 kB instead of 151 kB",
    detail:
      "The library was published as one bundled module and never declared sideEffects, so your bundler could drop nothing — importing one component gave you all of them. Nothing to change: rebuild and your bundle shrinks.",
  },
  {
    version: "4.0.0",
    date: "2026-07-15",
    kind: "fixed",
    title: "dist/ is one file per module",
    detail:
      "Deep paths into dist/ have changed. They were never a supported API — import from the package entry.",
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    kind: "new",
    title: "DynamicDateRange — date filters that stay current",
    detail:
      'Pick "Last 7 days" or "This quarter" and the filter saves the period, not the dates. Reopen it next month and it still means the last seven days.',
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    kind: "new",
    title: "Carousel — a swipeable strip of slides",
    detail:
      "Every child becomes a slide. Swipe, arrows, dots and the keyboard all work; it never moves on its own.",
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    kind: "new",
    title: "ColorPicker — a palette, a hex field and the system picker",
    detail: "Restrict it to your brand colours, or let people type any hex.",
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    kind: "new",
    title: "MaskInput — inputs that hold their shape",
    detail: "Phone numbers, dates and reference codes format themselves as you type.",
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    kind: "new",
    title: "The application frame: ShellBar, DynamicPage, ObjectPage and more",
    detail:
      "The pieces a real app is built from — a global header, a collapsing page header, master-detail columns and anchored sections.",
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    kind: "new",
    title: "Enterprise dialogs: FilterBar, ValueHelp, SelectDialog, ViewSettings",
    detail: "Filtering, lookups and view settings, without building them again.",
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    kind: "new",
    title: "StatCard and PageHeader",
    detail: "A labelled figure with a trend, and a page title with a way back.",
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    kind: "improved",
    title: "Combobox and MultiCombobox can create new options",
    detail: 'Type something that is not on the list and add it, without leaving the field.',
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    kind: "improved",
    title: "Half stars on Rating, marks on Slider, and a scale layout for Likert",
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    kind: "fixed",
    title: "Dialogs and sheets are readable in dark mode",
    detail:
      "They painted a dark panel but left the text black. The panel now carries its own text colour, so it cannot inherit the wrong one from the page around it.",
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    kind: "fixed",
    title: "Rounded-corner overrides now actually apply",
    detail:
      "Passing a corner radius to a component was silently ignored in some combinations. It is not any more.",
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    kind: "breaking",
    title: "zen-ui no longer restyles the page around it",
    detail:
      "The library used to change your document's base font size. It now only styles its own elements. If you relied on the old reset, import the /preflight stylesheet.",
  },
];

/**
 * Within a version, the order a reader needs — not the order they were typed.
 * A breaking change is the one note someone cannot afford to miss, so it must
 * never be the note that falls off the end of the cap.
 */
const KIND_PRIORITY: Record<ReleaseNoteKind, number> = {
  breaking: 0,
  new: 1,
  improved: 2,
  fixed: 3,
};

/**
 * The most recent `n`. The dialog says when it is showing fewer than all.
 *
 * Versions stay in the order they are authored (newest first); only the notes
 * WITHIN a version are reordered, by how much they matter. Sorting across
 * versions would need semver comparison and would lie about chronology, and a
 * comparator that returns 0 for different versions is not transitive — so this
 * groups first and sorts inside each group instead.
 */
export const recentReleaseNotes = (n = 10): ReleaseNote[] => {
  const byVersion = new Map<string, ReleaseNote[]>();
  for (const note of RELEASE_NOTES) {
    const group = byVersion.get(note.version) ?? [];
    group.push(note);
    byVersion.set(note.version, group);
  }
  // Map iterates in insertion order, so the versions keep their authored order.
  // Array.sort is stable, so notes of equal priority keep theirs too.
  return [...byVersion.values()]
    .flatMap((group) => [...group].sort((a, b) => KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind]))
    .slice(0, n);
};

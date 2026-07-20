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
    version: "9.5.0",
    date: "2026-07-21",
    kind: "new",
    title: "Timeline and UploadCollection",
    detail:
      "Timeline is an ordered list of events — an order's history, an audit trail, a ticket's comments. Pass items rather than compound parts, because the shape is always a rail, a marker, a time and a body, and parts would only let you build one that is subtly wrong. Grouping is a string you set, not a function that derives it: you already know whether two events fall on the same day, and deriving it here would mean guessing at your timezone. density=\"compact\" DROPS the description rather than shrinking type, because in a narrow column a two-line description wraps to five and the sequence stops being scannable. UploadCollection is the list of files after they are picked — FileUpload was the input, and nothing showed the result. It renders the upload but does not run it: no url, no method, no retry policy, so you keep your own transport and write status and progress back onto the items. Every button is presence-gated — no onRemove, no delete button — because a control that sometimes does nothing costs a click to find out. Rename edits in place, committing on Enter or blur and discarding on Escape. A progress bar is drawn only where there is a real number behind it; without one the row says Uploading… or Queued. Both in all four bindings.",
  },
  {
    version: "9.4.0",
    date: "2026-07-21",
    kind: "new",
    title: "TreeTable: lazy children, pagination and windowing",
    detail:
      "Three additions, all opt-in. `loadChildren` + `hasChildren` fetch a subtree the first time it is opened, for trees too big or too remote to send whole — hasChildren is what makes an unloaded row openable at all, since otherwise it is indistinguishable from a leaf; the chevron becomes a spinner during the fetch and results cache per row id. `enablePagination` pages the ROOT rows, so pageSize counts top-level rows and a page carries each root's whole subtree — paging the flattened list would cut through a subtree and strand its children on the next page. `enableVirtualization` (with maxBodyHeight) renders only the rows near the viewport: 1,240 open rows become 16-25 in the DOM, with aria-rowcount and aria-rowindex added since the DOM no longer holds every row. Expanding a node in vanilla and web-components also got much faster — it touches only the affected subtree now rather than rebuilding the table, 49ms to 3-8ms at 1,110 rows. All four bindings.",
  },
  {
    version: "9.3.0",
    date: "2026-07-21",
    kind: "new",
    title: "TreeTable — a table whose rows nest",
    detail:
      "For data where the hierarchy is the point: a cost-centre rollup, an org chart, a bill of materials. The chevron sits INSIDE the first column and indents with depth, so the hierarchy reads down one column rather than across a gutter. Searching keeps a match's ancestors, so a hit three levels down arrives with its full path instead of orphaned. Selecting a parent selects its subtree, and a partly-selected parent shows indeterminate. Sorting reorders siblings without ever moving a child out from under its parent. It is a real treegrid — aria-level, aria-expanded, sibling positions, and roving row focus with direction-aware arrows. Turn on enableVirtualization (with maxBodyHeight) for trees you expand all of: 1,240 open rows render as 16-25. Separate from DataTable rather than a flag on it, because hierarchy and grouping cannot share one table's sub-rows. All four bindings.",
  },
  {
    version: "9.2.0",
    date: "2026-07-20",
    kind: "new",
    title: "MessagePopover — the validation summary a long form owes its user",
    detail:
      "A form with twenty fields and three errors makes people hunt. MessagePopover collects the messages into one button, counts them by severity, and takes the user to the field when they click one — give a message a targetId and activating it closes the popover, scrolls that element into view and FOCUSES it, because scrollIntoView alone leaves a keyboard user where they were. It renders messages you pass it rather than reading your form, so it works with react-hook-form, FormBuilder, modular-forms or a hand-rolled useState. All four bindings.",
  },
  {
    version: "9.1.0",
    date: "2026-07-20",
    kind: "new",
    title: "Calendar takes month, defaultMonth and onMonthChange",
    detail:
      "A calendar picks its month once and then leaves it alone, so setting `selected` to a date in another month does not move the view — the right default, but there was no way to override it in Solid or vanilla. `defaultMonth` opens on a month you choose; `month` + `onMonthChange` make the view controlled, which is how you make it follow a selection. React already had these: its Calendar is react-day-picker and forwards that library's props.",
  },
  {
    version: "9.0.4",
    date: "2026-07-20",
    kind: "fixed",
    title: "Solid: callbacks you change after render now take effect",
    detail:
      "Several Solid components bound a callback prop once, at first render, and kept that function for ever — NotificationsInbox's onMarkAllRead and onViewAll, DataTable's filter-chip remove and column-pin toggle, and FormField's Field component. DataTable also asked TanStack for its sort and resize handlers once and bound the result, which could go stale against a rebuilt table; they are looked up at click and drag time now. React, vanilla and web-components were never affected.",
  },
  {
    version: "9.0.3",
    date: "2026-07-20",
    kind: "improved",
    title: "Combobox stops rebuilding its option list on every render",
    detail:
      "Combobox and MultiCombobox derived their working list as `isAsync ? asyncResults : options ?? []`. Without `options` — the async case — that `?? []` produced a new empty array every render, so everything depending on the list redid itself each time whether or not anything had changed. No behaviour difference; fewer wasted recomputations in a component that re-renders on every keystroke.",
  },
  {
    version: "9.0.3",
    date: "2026-07-20",
    kind: "improved",
    title: "Six prop types are now type aliases rather than empty interfaces",
    detail:
      "SkeletonProps, SeparatorProps, TextareaProps, InputProps, AlertCloseProps and BannerCloseProps were `interface X extends Y {}` and are now `type X = Y`. Same name, same shape, same import. The one thing an alias cannot do is declaration merging — if you were augmenting one of these with `declare module`, that no longer applies.",
  },
  {
    version: "9.0.2",
    date: "2026-07-20",
    kind: "fixed",
    title: "Buttons and icons positioned inside components now mirror in right-to-left pages",
    detail:
      "A dialog's close button sat 13px from the physical right whichever way the page read — everything around it flipped and it stayed put. Same for the magnifier in a search field, the show/hide button in a password field, the tick on a selectable card, notification count badges and the checkmark beside a selected menu item. They now sit at the start or end of the reading direction, and the padding reserving room for them moved with them — otherwise a mirrored close button leaves the title sliding underneath it. Identical output in a left-to-right page.",
  },
  {
    version: "9.0.1",
    date: "2026-07-20",
    kind: "fixed",
    title: "Bar's title no longer sits on top of its buttons",
    detail:
      "On a narrow bar — a side panel, a split view, a phone — middleContent could be drawn straight over endContent, both readable and neither usable. When a bar now runs out of room the TITLE is the thing that gives and clips, and the start and end slots keep their size; previously the outer slots shrank, which is what caused it, because a button inside them does not shrink with them.",
  },
  {
    version: "9.0.0",
    date: "2026-07-20",
    kind: "breaking",
    title: "A `:root` override of a `--zen-*` token may start winning where it used to lose",
    detail:
      "Theme tokens moved from `:root[data-theme=\"x\"]` to `[data-theme=\"x\"]`, one specificity step lower, which is what lets a theme apply to a div rather than only the document. An override you wrote at `:root` used to lose to the theme block and silently do nothing; it now ties, so a later-loaded stylesheet of yours wins. If some of your overrides were dead, they are about to come alive.",
  },
  {
    version: "9.0.0",
    date: "2026-07-20",
    kind: "breaking",
    title: "Right-to-left pages behave differently, because they were wrong",
    detail:
      "Arrow keys now follow the reading direction: in Arabic or Hebrew, next is to the left. Sixty places treated ArrowRight as forward — the carousel, rating, NPS and Likert scales, OTP boxes, tree, colour palette, object-page anchors and slider. The carousel additionally did not move at all in RTL, because scroll position counts downwards into negative numbers there. If you built a workaround for any of this, the workaround is now the bug.",
  },
  {
    version: "9.0.0",
    date: "2026-07-20",
    kind: "new",
    title: "A theme can apply to part of a page",
    detail:
      "<Theme name=\"dark\"> themes one subtree — a dark panel in a light app, a live preview of another theme, a widget that keeps its palette whatever the host page does. It nests with no bookkeeping, and no JavaScript runs. Portalled overlays (Dialog, Popover, Sheet, Tooltip, DropdownMenu) still take the document theme.",
  },
  {
    version: "9.0.0",
    date: "2026-07-20",
    kind: "new",
    title: "DirectionProvider tells menus, tabs and sliders which way the page reads",
    detail:
      "The primitives underneath zen-ui keep direction in their own JavaScript and do not read `dir` off your page, so submenu side and arrow-key meaning were stuck left-to-right. Render <DirectionProvider> once near the root: with no props it follows <html dir> and keeps following it, so a runtime language switch works without a reload.",
  },
  {
    version: "9.0.0",
    date: "2026-07-20",
    kind: "fixed",
    title: "Table headers line up with their columns in a right-to-left page",
    detail:
      "Headers stayed left-aligned while their column data moved right. Sixty-nine places meant \"align the way this reads\" and said \"align left\".",
  },
  {
    version: "8.0.0",
    date: "2026-07-19",
    kind: "breaking",
    title: "Padded, bordered controls stop overflowing their container",
    detail:
      "The opt-in /preflight stylesheet now sets box-sizing: border-box on every element, which every sizing utility in the library already assumed. Without it Input — w-full plus padding plus a border — rendered 26px wider than the box it was told to fill, so in a flex row the fields touched and the focus ring landed on top of the neighbour. If you already load Tailwind v3's preflight you had this rule and nothing changes; if you do not, it reaches your own markup too and a layout of yours may move.",
  },
  {
    version: "7.3.0",
    date: "2026-07-19",
    kind: "new",
    title: "The Solid binding now renders on the server",
    detail:
      "@algorisys/zen-ui-solid ships a server build alongside the browser one, so SolidStart (or any Vinxi/Node server) can renderToString a page that uses zen-ui components and the browser hydrates it. Node picks it up automatically through a node export condition; you do not change how you import or use anything. Both bundles keep solid-js external, so server and client share one Solid instance.",
  },
  {
    version: "7.2.0",
    date: "2026-07-18",
    kind: "new",
    title: "A fourth binding: zen-ui as native custom elements",
    detail:
      "@algorisys/zen-ui-web-components is every component as a <zen-*> custom element — <zen-button>, <zen-tabs>, <zen-data-table>. They render in the light DOM, so the same zen-* stylesheet and --zen-* tokens style them exactly as in the other bindings, and they drop into any framework, or none. Set attributes for HTML authoring, JS properties for data, and listen for zen-value-change and friends.",
  },
  {
    version: "7.1.0",
    date: "2026-07-16",
    kind: "new",
    title: "Search — a search field as a component",
    detail:
      "Magnifier, a type=search input (role=searchbox), and a clear button that shows only when there is text. sm / md / lg, controlled or uncontrolled. zen-ui had inlined this exact affordance seven times before extracting it.",
  },
  {
    version: "7.1.0",
    date: "2026-07-16",
    kind: "new",
    title: "PasswordInput — a password field with a show/hide toggle",
    detail:
      "The toggle is a real button (keyboard reachable, labelled, aria-pressed) rather than an icon only a mouse can hit, and it never moves focus out of the field. Every native input attribute passes through.",
  },
  {
    version: "7.1.0",
    date: "2026-07-16",
    kind: "new",
    title: "SkipToContent — the keyboard bypass for the app frame",
    detail:
      "Invisible until focused; the first Tab reveals it and Enter jumps past the header and nav to the content. Now that zen-ui ships a full app frame, this is the WCAG 2.4.1 bypass it needed.",
  },
  {
    version: "7.1.0",
    date: "2026-07-16",
    kind: "improved",
    title: "Type and motion are re-themeable now",
    detail:
      "The type scale and the animations used hardcoded values no --zen-* override could reach. --zen-font-* and --zen-duration- / --zen-ease-* now back them, so you can set a brand font or retime motion. Defaults are the old values to the pixel — nothing looks different.",
  },
  {
    version: "7.1.0",
    date: "2026-07-16",
    kind: "fixed",
    title: "Animations respect reduced motion",
    detail:
      "If a visitor's system asks for less motion, the animations now shrink to nothing. They did not before — the timings had no shared place to answer the setting.",
  },
  {
    version: "7.1.0",
    date: "2026-07-16",
    kind: "fixed",
    title: "Solid: a standalone <label for> associates with Checkbox, RadioGroup and Select",
    detail:
      "The caller's id had landed on a wrapper the browser cannot label, so clicking the label did nothing. It now lands on the native control, which both names and toggles it.",
  },
  {
    version: "7.0.0",
    date: "2026-07-16",
    kind: "breaking",
    title: "Accordions, sheets and dialogs animate — they never did before",
    detail:
      "Twelve animations start running that had never run in any binding. Accordion sections slide instead of snapping, Sheet panels slide in from their edge, overlays fade. Nothing you call changed and no layout moves, but the output looks different, which is why this is a major bump. To opt out, use a prefers-reduced-motion rule.",
  },
  {
    version: "7.0.0",
    date: "2026-07-16",
    kind: "new",
    title: "A third binding: zen-ui with no framework",
    detail:
      "@algorisys/zen-ui-vanilla is every component with no React, no Solid and no primitive library — call a factory, get a { el, update, destroy } handle, append the node yourself. Not on npm yet; you can try it at the vanilla demo. Building it is what surfaced the animation fixes in this release.",
  },
  {
    version: "7.0.0",
    date: "2026-07-16",
    kind: "fixed",
    title: "The animation classes generated no CSS at all",
    detail:
      "zen-anim-* were plain classes used only behind a state variant, and UnoCSS cannot build a variant of a class it does not own — so the rule that shipped matched no element on any page. They are real utilities now.",
  },
  {
    version: "7.0.0",
    date: "2026-07-16",
    kind: "fixed",
    title: "Solid's accordion could never have animated",
    detail:
      "The shared keyframes interpolated height to a Radix-specific variable. Kobalte publishes its own name, so Solid was animating toward something unset. The keyframes now read a neutral --zen-collapsible-content-height that each binding maps its own measurement onto.",
  },
  {
    version: "7.0.0",
    date: "2026-07-16",
    kind: "fixed",
    title: "DynamicPage's header collapsed instantly",
    detail:
      "Its transition was written against a class UnoCSS does not provide, so it did not exist. The header now animates as its own documentation always claimed.",
  },
  {
    version: "7.0.0",
    date: "2026-07-16",
    kind: "improved",
    title: "Button and Badge variants moved to core, shared by every binding",
    detail:
      "buttonVariants and badgeVariants are still exported from your binding and produce byte-identical classes — verified by diffing the published stylesheet across the move. They were duplicated per binding with nothing asserting the copies agreed.",
  },
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

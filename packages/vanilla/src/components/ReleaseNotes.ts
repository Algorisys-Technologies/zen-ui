import {
  recentReleaseNotes,
  RELEASE_NOTES,
  type ReleaseNoteKind,
} from "@algorisys/zen-ui-core/release-notes";
// The version comes from the package that is actually published, so the footer
// cannot drift from what a consumer installs. Vite emits JSON as named exports, so
// only `version` survives tree-shaking.
import { version as ZEN_VERSION } from "../../package.json";
import { Badge } from "./badge/badge";
import { Dialog } from "./dialog/dialog";

/**
 * The footer's version chip and the dialog it opens — the vanilla equivalent of
 * the React demo's ReleaseNotes.tsx.
 *
 * Built from vanilla's own Dialog and Badge rather than bespoke markup, for the
 * same reason the React one is built from Radix's: the demo asking people to use
 * these components should be using them, and a panel like this is a fair test of
 * whether they compose. The notes themselves come from
 * @algorisys/zen-ui-core/release-notes — one copy for one design system.
 */

const LIMIT = 10;

const KIND_LABEL: Record<ReleaseNoteKind, string> = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
  breaking: "Breaking",
};

/** Badge colours carry the meaning here, so they track the semantics. */
const KIND_COLOR: Record<ReleaseNoteKind, "primary" | "success" | "warning" | "error"> = {
  new: "primary",
  improved: "success",
  fixed: "warning",
  breaking: "error",
};

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};

export function ReleaseNotes(): { el: HTMLElement; destroy(): void } {
  const notes = recentReleaseNotes(LIMIT);
  const hidden = RELEASE_NOTES.length - notes.length;

  const list = el("ul", "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-4 zen-p-0");
  for (const n of notes) {
    const li = el("li", "zen-flex zen-flex-col zen-gap-1");
    const head = el("div", "zen-flex zen-items-center zen-gap-2");
    head.append(
      Badge({ color: KIND_COLOR[n.kind], variant: "soft", children: KIND_LABEL[n.kind] }).el,
      el("span", "zen-text-sm zen-font-medium", n.title),
    );
    li.append(head);
    if (n.detail) li.append(el("p", "zen-m-0 zen-text-sm zen-text-zen-muted-fg", n.detail));
    li.append(el("span", "zen-text-xs zen-text-zen-muted-fg", `v${n.version} · ${n.date}`));
    list.append(li);
  }

  const scroll = el("div", "zen-max-h-[60vh] zen-overflow-y-auto zen-pr-1");
  scroll.append(list);

  const footnote = el("p", "zen-m-0 zen-mt-4 zen-pt-4 zen-border-t zen-border-zen-border zen-text-xs zen-text-zen-muted-fg");
  const changelog = el("a", "zen-text-zen-primary zen-underline", "changelog");
  changelog.setAttribute("href", "https://github.com/Algorisys-Technologies/zen-ui/blob/main/CHANGELOG.md");
  changelog.setAttribute("target", "_blank");
  changelog.setAttribute("rel", "noreferrer noopener");
  // Saying what was left out, rather than quietly showing 10 and implying that is
  // everything.
  footnote.append(
    document.createTextNode(
      hidden > 0 ? `${hidden} older ${hidden === 1 ? "note" : "notes"} not shown. The complete record is in the ` : "The complete record is in the ",
    ),
    changelog,
    document.createTextNode("."),
  );

  const dialog = Dialog({
    class: "zen-max-w-2xl",
    title: "What's new in zen-ui",
    description: `The ${notes.length} most recent, with anything breaking first.`,
    children: [scroll, footnote],
  });

  const chip = el("button", "app-version", `v${ZEN_VERSION}`);
  chip.type = "button";
  chip.title = `@algorisys/zen-ui-vanilla ${ZEN_VERSION} — what's new`;
  chip.addEventListener("click", () => dialog.open());

  return {
    el: chip,
    destroy: () => dialog.destroy(),
  };
}

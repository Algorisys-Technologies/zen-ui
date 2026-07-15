import { useState } from "react";
import { RELEASE_NOTES, recentReleaseNotes, type ReleaseNoteKind } from "../release-notes";
// The version comes from the package that is actually published, so the footer
// cannot drift from what a consumer installs. resolveJsonModule is already on,
// and Vite emits JSON as named exports, so only `version` survives tree-shaking
// — the rest of package.json never reaches the bundle.
import { version as ZEN_VERSION } from "../../package.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog/dialog";
import { Badge } from "./badge/badge";
import { Link } from "./link/link";
import { Separator } from "./divider/divider";

/**
 * The footer's version chip, and what it opens.
 *
 * Built from zen-ui's own Dialog / Badge / Link rather than bespoke markup:
 * the demo asking people to use these components should be using them, and a
 * panel like this is a fair test of whether they actually compose.
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

const ReleaseNotes: React.FC = () => {
  const [open, setOpen] = useState(false);
  const notes = recentReleaseNotes(LIMIT);
  const hidden = RELEASE_NOTES.length - notes.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="app-version"
          title={`@algorisys/zen-ui-react ${ZEN_VERSION} — what's new`}
        >
          v{ZEN_VERSION}
        </button>
      </DialogTrigger>
      <DialogContent className="zen-max-w-2xl">
        <DialogHeader>
          <DialogTitle>What's new in zen-ui</DialogTitle>
          <DialogDescription>
            The {notes.length} most recent, with anything breaking first.
          </DialogDescription>
        </DialogHeader>

        <div className="zen-max-h-[60vh] zen-overflow-y-auto zen-pr-1">
          <ul className="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-4 zen-p-0">
            {notes.map((n, i) => (
              <li key={`${n.version}-${i}`} className="zen-flex zen-flex-col zen-gap-1">
                <div className="zen-flex zen-items-center zen-gap-2">
                  <Badge color={KIND_COLOR[n.kind]} variant="soft">
                    {KIND_LABEL[n.kind]}
                  </Badge>
                  <span className="zen-text-sm zen-font-medium">{n.title}</span>
                </div>
                {n.detail ? (
                  <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">{n.detail}</p>
                ) : null}
                <span className="zen-text-xs zen-text-zen-muted-fg">
                  v{n.version} · {n.date}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />
        <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
          {/* Saying what was left out, rather than quietly showing 10 and
              implying that is everything. */}
          {hidden > 0 ? `${hidden} older ${hidden === 1 ? "note" : "notes"} not shown. ` : ""}
          The complete record, including the parts only a maintainer could love, is in the{" "}
          <Link
            href="https://github.com/Algorisys-Technologies/zen-ui/blob/main/CHANGELOG.md"
            external
            inline
          >
            changelog
          </Link>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ReleaseNotes;

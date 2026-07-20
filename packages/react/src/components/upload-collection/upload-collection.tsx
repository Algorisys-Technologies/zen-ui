import * as React from "react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";
import { Progress } from "../progress/progress";

/**
 * UploadCollection — the list of files that have been uploaded, or are on their
 * way.
 *
 *   <UploadCollection items={files} onRemove={remove} onRetry={retry} />
 *
 * FileUpload is the input; this is the result. They are two components because
 * they answer to different owners: the drop zone is a control the user operates,
 * while this list is state your transport writes — a file can appear in it from
 * a previous session, and a file the user picked can sit here failing for
 * minutes.
 *
 * It does NOT own the upload. There is no `url`, no `method`, no retry policy:
 * the component takes `status` and `progress` per item and renders them. A
 * component that owned the transport would have to guess at your endpoint,
 * headers, auth refresh and chunking, and every real app would then fight it.
 * `onRetry` hands the item back to you rather than re-issuing anything itself.
 *
 * Every affordance is presence-gated — no `onRemove`, no delete button. A
 * disabled-looking control that does nothing is worse than an absent one,
 * because the user spends a click finding out.
 *
 * It renders an UNORDERED list, unlike Timeline: a set of attachments has no
 * meaningful sequence, and announcing "item 3 of 7" over one implies there is.
 */

export type UploadStatus = "pending" | "uploading" | "complete" | "error";

export interface UploadItem {
  id: string;
  name: string;
  /** Bytes. Omit for a file the server described without one. */
  size?: number;
  /** MIME type, when you have it. Used for the icon only. */
  type?: string;
  /** Defaults to "complete" — a list of already-uploaded files is the common case. */
  status?: UploadStatus;
  /** 0–100, while `status` is "uploading". Omitted renders the state in words. */
  progress?: number;
  /** What went wrong. Shown in place of the meta line when `status` is "error". */
  error?: string;
  /** When set, the name becomes a link — a download or a preview. */
  url?: string;
  /** Shown beside the size. A display string, for the same reason Timeline's is. */
  uploadedAt?: string;
  uploadedBy?: string;
  /** An image src to show instead of the file icon. */
  thumbnail?: string;
}

export interface UploadCollectionProps {
  items: UploadItem[];
  /** Presence adds the delete button. */
  onRemove?: (item: UploadItem) => void;
  /** Presence adds a Retry button to failed items. */
  onRetry?: (item: UploadItem) => void;
  /** Presence adds inline rename. Called with the new name, already trimmed. */
  onRename?: (item: UploadItem, name: string) => void;
  /** Message when there is nothing yet. */
  emptyMessage?: React.ReactNode;
  /** Blocks every action without hiding the list. */
  disabled?: boolean;
  className?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * The meta line under the name: state · size · when · who, skipping what is
 * absent.
 *
 * A file that is uploading with no percentage says so in WORDS rather than
 * drawing an indeterminate bar. Radix renders an indeterminate Progress as an
 * empty track and Kobalte renders it as a full one — so the same component
 * would read "nothing has happened" in React and "finished" in Solid, and the
 * full one is actively wrong for a queued file. A bar is drawn only when there
 * is a real number behind it.
 */
const metaOf = (item: UploadItem): string => {
  const status = item.status ?? "complete";
  const state =
    status === "pending"
      ? "Queued"
      : status === "uploading" && item.progress === undefined
        ? "Uploading…"
        : undefined;
  return [
    state,
    item.size !== undefined ? formatBytes(item.size) : undefined,
    item.uploadedAt,
    item.uploadedBy,
  ]
    .filter(Boolean)
    .join(" · ");
};

interface RowProps {
  item: UploadItem;
  disabled?: boolean;
  onRemove?: (item: UploadItem) => void;
  onRetry?: (item: UploadItem) => void;
  onRename?: (item: UploadItem, name: string) => void;
}

const Row = ({ item, disabled, onRemove, onRetry, onRename }: RowProps) => {
  const [editing, setEditing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  /* Escape closes the editor, which unmounts the input, which fires BLUR — and
   * blur commits. Without this flag, cancelling saved the text it was meant to
   * discard. A ref rather than state: it must not schedule a render, and it is
   * read during the blur that the same interaction causes. */
  const cancelled = React.useRef(false);

  const status = item.status ?? "complete";
  const busy = status === "uploading" || status === "pending";

  React.useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    /* Closing the editor unmounts a FOCUSED input, so the removal fires blur and
       calls this a second time. React has nulled the ref by then — read it
       explicitly and bail rather than leaning on `?.` yielding "", which is the
       same protection by accident and reads as if it were about a missing ref.
       Read the input rather than tracking every keystroke in state: the value is
       only needed once, and state per row re-renders the row on each key. */
    const input = inputRef.current;
    if (!input) return;
    const next = input.value.trim();
    setEditing(false);
    if (next && next !== item.name) onRename?.(item, next);
  };

  const cancel = () => {
    cancelled.current = true;
    setEditing(false);
  };

  return (
    <li
      className={cn(
        "zen-flex zen-items-start zen-gap-3 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2",
        status === "error" && "zen-border-zen-error/40",
      )}
    >
      {item.thumbnail ? (
        /* Decorative: the file's name is right beside it, so alt text would be
           the same words read twice. */
        <img
          src={item.thumbnail}
          alt=""
          className="zen-mt-0.5 zen-h-9 zen-w-9 zen-shrink-0 zen-rounded-zen-sm zen-object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "zen-mt-0.5 zen-shrink-0",
            status === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg",
          )}
        >
          <Icon name={status === "error" ? "x-circle" : "file"} size={18} />
        </span>
      )}

      <div className="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-1">
        {editing ? (
          /* Escape cancels, Enter and blur commit — the three things anyone
             tries. Committing on blur rather than demanding Enter means a click
             elsewhere does not silently discard the edit.

             Uncontrolled (defaultValue): the value is read once on commit, so
             binding it to state would re-render the row on every keystroke to
             no end. */
          <input
            ref={inputRef}
            defaultValue={item.name}
            aria-label={`Rename ${item.name}`}
            className="zen-w-full zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancel();
              }
            }}
            onBlur={commit}
          />
        ) : item.url ? (
          <a
            href={item.url}
            className="zen-truncate zen-text-sm zen-font-medium zen-text-zen-primary hover:zen-underline"
          >
            {item.name}
          </a>
        ) : (
          <span className="zen-truncate zen-text-sm zen-font-medium">{item.name}</span>
        )}

        {status === "error" ? (
          <span className="zen-text-xs zen-text-zen-error">{item.error ?? "Upload failed"}</span>
        ) : (
          !!metaOf(item) && (
            <span className="zen-text-xs zen-text-zen-muted-fg">{metaOf(item)}</span>
          )
        )}

        {busy && item.progress !== undefined && (
          <Progress size="sm" value={item.progress} aria-label={`Uploading ${item.name}`} />
        )}
      </div>

      <div className="zen-flex zen-shrink-0 zen-items-center zen-gap-1">
        {status === "error" && onRetry && (
          /* A word, not an icon. There is no retry glyph anyone reads reliably,
             and this is the one action a failed row exists to offer. */
          <Button variant="outline" size="sm" disabled={disabled} onClick={() => onRetry(item)}>
            Retry
          </Button>
        )}
        {onRename && !busy && (
          <Button
            variant="ghost"
            color="neutral"
            size="sm"
            aria-label={`Rename ${item.name}`}
            disabled={disabled}
            onClick={() => setEditing(true)}
          >
            <Icon name="edit" size={14} />
          </Button>
        )}
        {onRemove && (
          <Button
            variant="ghost"
            color="neutral"
            size="sm"
            aria-label={`Remove ${item.name}`}
            disabled={disabled}
            onClick={() => onRemove(item)}
          >
            <Icon name="trash" size={14} />
          </Button>
        )}
      </div>
    </li>
  );
};

export const UploadCollection = ({
  items,
  onRemove,
  onRetry,
  onRename,
  emptyMessage,
  disabled,
  className,
}: UploadCollectionProps) => {
  if ((items ?? []).length === 0) {
    /* `className` reaches the empty state too. A caller who sized the list — a
       width, a max-width, a border — meant the box the files live in, and a
       message that ignored it would jump the layout the moment the last file
       was removed. */
    return (
      <p
        className={cn(
          "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg",
          className,
        )}
      >
        {emptyMessage ?? "No files yet"}
      </p>
    );
  }

  return (
    <ul className={cn("zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0", className)}>
      {items.map((item) => (
        <Row
          key={item.id}
          item={item}
          disabled={disabled}
          onRemove={onRemove}
          onRetry={onRetry}
          onRename={onRename}
        />
      ))}
    </ul>
  );
};

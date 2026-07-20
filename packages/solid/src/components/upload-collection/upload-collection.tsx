import { type JSX, createSignal, For, Show } from "solid-js";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";
import { Progress } from "../progress/progress";

/**
 * UploadCollection — the list of files that have been uploaded, or are on their
 * way.
 *
 *   <UploadCollection items={files()} onRemove={remove} onRetry={retry} />
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
  /** 0–100, while `status` is "uploading". Omitted renders an indeterminate bar. */
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
  emptyMessage?: JSX.Element;
  /** Blocks every action without hiding the list. */
  disabled?: boolean;
  class?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/** The meta line under the name: size · when · who, skipping what is absent. */
const metaOf = (item: UploadItem): string =>
  [item.size !== undefined ? formatBytes(item.size) : undefined, item.uploadedAt, item.uploadedBy]
    .filter(Boolean)
    .join(" · ");

const Row = (props: {
  item: UploadItem;
  disabled?: boolean;
  onRemove?: (item: UploadItem) => void;
  onRetry?: (item: UploadItem) => void;
  onRename?: (item: UploadItem, name: string) => void;
}) => {
  const [editing, setEditing] = createSignal(false);
  let inputRef: HTMLInputElement | undefined;
  /* Escape closes the editor, which unmounts the input, which fires BLUR — and
   * blur commits. Without this flag, cancelling saved the text it was meant to
   * discard, on every binding that wires both. */
  let cancelled = false;

  const status = () => props.item.status ?? "complete";
  const busy = () => status() === "uploading" || status() === "pending";

  const commit = () => {
    if (cancelled) {
      cancelled = false;
      return;
    }
    /* Read the input rather than tracking every keystroke in a signal: the value
       is only needed once, and a signal per row re-renders the row on each key. */
    const next = inputRef?.value.trim() ?? "";
    setEditing(false);
    if (next && next !== props.item.name) props.onRename?.(props.item, next);
  };

  const cancel = () => {
    cancelled = true;
    setEditing(false);
  };

  return (
    <li
      class={cn(
        "zen-flex zen-items-start zen-gap-3 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2",
        status() === "error" && "zen-border-zen-error/40",
      )}
    >
      <Show
        when={props.item.thumbnail}
        fallback={
          <span
            aria-hidden="true"
            class={cn(
              "zen-mt-0.5 zen-shrink-0",
              status() === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg",
            )}
          >
            <Icon name={status() === "error" ? "x-circle" : "file"} size={18} />
          </span>
        }
      >
        {/* Decorative: the file's name is right beside it, so alt text would be
            the same words read twice. */}
        <img
          src={props.item.thumbnail}
          alt=""
          class="zen-mt-0.5 zen-h-9 zen-w-9 zen-shrink-0 zen-rounded-zen-sm zen-object-cover"
        />
      </Show>

      <div class="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-1">
        <Show
          when={editing()}
          fallback={
            <Show
              when={props.item.url}
              fallback={<span class="zen-truncate zen-text-sm zen-font-medium">{props.item.name}</span>}
            >
              <a
                href={props.item.url}
                class="zen-truncate zen-text-sm zen-font-medium zen-text-zen-primary hover:zen-underline"
              >
                {props.item.name}
              </a>
            </Show>
          }
        >
          {/* Escape cancels, Enter and blur commit — the three things anyone
              tries. Committing on blur rather than demanding Enter means a
              click elsewhere does not silently discard the edit. */}
          <input
            ref={inputRef}
            value={props.item.name}
            aria-label={`Rename ${props.item.name}`}
            class="zen-w-full zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
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
        </Show>

        <Show
          when={status() === "error"}
          fallback={
            <Show when={metaOf(props.item)}>
              <span class="zen-text-xs zen-text-zen-muted-fg">{metaOf(props.item)}</span>
            </Show>
          }
        >
          <span class="zen-text-xs zen-text-zen-error">
            {props.item.error ?? "Upload failed"}
          </span>
        </Show>

        <Show when={busy()}>
          {/* Pulsed when there is no number, because Progress renders an
              indeterminate bar as a FULL one — a queued file reads as finished.
              That is a bug in Progress and is tracked as its own item; pulsing
              here is the honest reading of "working, duration unknown" without
              restyling a shipped component from inside this one. */}
          <Progress
            size="sm"
            value={props.item.progress}
            indeterminate={props.item.progress === undefined}
            class={props.item.progress === undefined ? "zen-animate-pulse" : undefined}
            aria-label={`Uploading ${props.item.name}`}
          />
        </Show>
      </div>

      <div class="zen-flex zen-shrink-0 zen-items-center zen-gap-1">
        <Show when={status() === "error" && props.onRetry}>
          {/* A word, not an icon. There is no retry glyph anyone reads reliably,
              and this is the one action a failed row exists to offer. */}
          <Button
            variant="outline"
            size="sm"
            disabled={props.disabled}
            onClick={() => props.onRetry?.(props.item)}
          >
            Retry
          </Button>
        </Show>
        <Show when={props.onRename && !busy()}>
          <Button
            variant="ghost"
            color="neutral"
            size="sm"
            aria-label={`Rename ${props.item.name}`}
            disabled={props.disabled}
            onClick={() => {
              setEditing(true);
              /* Focus after the input exists. queueMicrotask rather than
                 setTimeout: Solid has already flushed the DOM by then. */
              queueMicrotask(() => {
                inputRef?.focus();
                inputRef?.select();
              });
            }}
          >
            <Icon name="edit" size={14} />
          </Button>
        </Show>
        <Show when={props.onRemove}>
          <Button
            variant="ghost"
            color="neutral"
            size="sm"
            aria-label={`Remove ${props.item.name}`}
            disabled={props.disabled}
            onClick={() => props.onRemove?.(props.item)}
          >
            <Icon name="trash" size={14} />
          </Button>
        </Show>
      </div>
    </li>
  );
};

export const UploadCollection = (props: UploadCollectionProps) => (
  <Show
    when={(props.items ?? []).length > 0}
    fallback={
      /* `class` reaches the empty state too. A caller who sized the list — a
         width, a max-width, a border — meant the box the files live in, and a
         message that ignored it would jump the layout the moment the last file
         was removed. */
      <p
        class={cn(
          "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg",
          props.class,
        )}
      >
        {props.emptyMessage ?? "No files yet"}
      </p>
    }
  >
    <ul class={cn("zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0", props.class)}>
      <For each={props.items}>
        {(item) => (
          <Row
            item={item}
            disabled={props.disabled}
            onRemove={props.onRemove}
            onRetry={props.onRetry}
            onRename={props.onRename}
          />
        )}
      </For>
    </ul>
  </Show>
);

import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";
import { Progress } from "../progress/progress";
import {
  applyProps,
  Disposer,
  toNodes,
  type AnyZenComponent,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";

/**
 * UploadCollection — the list of files that have been uploaded, or are on their
 * way.
 *
 *   UploadCollection({ items, onRemove, onRetry }).el
 *
 * FileUpload is the input; this is the result. They are two components because
 * they answer to different owners: the drop zone is a control the user operates,
 * while this list is state your transport writes — a file can appear in it from
 * a previous session, and a file the user picked can sit here failing for
 * minutes.
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * It does NOT own the upload: no `url`, no `method`, no retry policy. It takes
 * `status` and `progress` per item and renders them, and `onRetry` hands the
 * item back rather than re-issuing anything.
 *
 * Every affordance is presence-gated — no `onRemove`, no delete button.
 *
 * It renders an UNORDERED list, unlike Timeline: a set of attachments has no
 * meaningful sequence.
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

export interface UploadCollectionProps extends BaseProps {
  items: UploadItem[];
  /** Presence adds the delete button. */
  onRemove?: (item: UploadItem) => void;
  /** Presence adds a Retry button to failed items. */
  onRetry?: (item: UploadItem) => void;
  /** Presence adds inline rename. Called with the new name, already trimmed. */
  onRename?: (item: UploadItem, name: string) => void;
  /** Message when there is nothing yet. */
  emptyMessage?: Child;
  /** Blocks every action without hiding the list. */
  disabled?: boolean;
}

/** Register a handle for disposal and return it, so it can be used inline. */
const keep = <T extends AnyZenComponent>(owned: AnyZenComponent[], comp: T): T => {
  owned.push(comp);
  return comp;
};

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
 * drawing an indeterminate bar — Radix renders an indeterminate Progress as an
 * empty track and Kobalte as a full one, and the full one is actively wrong for
 * a queued file. A bar is drawn only when there is a real number behind it.
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

/**
 * One row. Every handle it builds is pushed onto `owned` so the collection's
 * destroy() can release them: a Button holds a real listener on a node this
 * component created, and dropping the handle would leave the closure alive
 * after the row is gone. There is no unmount here to do it for us.
 */
function row(
  item: UploadItem,
  props: UploadCollectionProps,
  owned: AnyZenComponent[],
): HTMLLIElement {
  const status = item.status ?? "complete";
  const busy = status === "uploading" || status === "pending";

  const li = document.createElement("li");
  li.className = cn(
    "zen-flex zen-items-start zen-gap-3 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2",
    status === "error" && "zen-border-zen-error/40",
  );

  if (item.thumbnail) {
    // Decorative: the file's name is right beside it, so alt text would be the
    // same words read twice.
    const img = document.createElement("img");
    img.src = item.thumbnail;
    img.alt = "";
    img.className = "zen-mt-0.5 zen-h-9 zen-w-9 zen-shrink-0 zen-rounded-zen-sm zen-object-cover";
    li.append(img);
  } else {
    const mark = document.createElement("span");
    mark.setAttribute("aria-hidden", "true");
    mark.className = cn(
      "zen-mt-0.5 zen-shrink-0",
      status === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg",
    );
    const icon = Icon({ name: status === "error" ? "x-circle" : "file", size: 18 });
    owned.push(icon);
    mark.append(icon.el);
    li.append(mark);
  }

  const body = document.createElement("div");
  body.className = "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-1";

  const name = item.url ? document.createElement("a") : document.createElement("span");
  if (item.url) (name as HTMLAnchorElement).href = item.url;
  name.className = item.url
    ? "zen-truncate zen-text-sm zen-font-medium zen-text-zen-primary hover:zen-underline"
    : "zen-truncate zen-text-sm zen-font-medium";
  name.textContent = item.name;
  body.append(name);

  const meta = document.createElement("span");
  if (status === "error") {
    meta.className = "zen-text-xs zen-text-zen-error";
    meta.textContent = item.error ?? "Upload failed";
    body.append(meta);
  } else if (metaOf(item)) {
    meta.className = "zen-text-xs zen-text-zen-muted-fg";
    meta.textContent = metaOf(item);
    body.append(meta);
  }

  if (busy && item.progress !== undefined) {
    const bar = Progress({ size: "sm", value: item.progress, "aria-label": `Uploading ${item.name}` });
    owned.push(bar);
    body.append(bar.el);
  }

  li.append(body);

  const actions = document.createElement("div");
  actions.className = "zen-flex zen-shrink-0 zen-items-center zen-gap-1";

  if (status === "error" && props.onRetry) {
    // A word, not an icon. There is no retry glyph anyone reads reliably, and
    // this is the one action a failed row exists to offer.
    actions.append(
      keep(owned, Button({
        variant: "outline",
        size: "sm",
        disabled: props.disabled,
        children: "Retry",
        onClick: () => props.onRetry?.(item),
      })).el,
    );
  }

  if (props.onRename && !busy) {
    actions.append(
      keep(owned, Button({
        variant: "ghost",
        color: "neutral",
        size: "sm",
        "aria-label": `Rename ${item.name}`,
        disabled: props.disabled,
        children: keep(owned, Icon({ name: "edit", size: 14 })),
        onClick: () => {
          const input = document.createElement("input");
          input.value = item.name;
          input.setAttribute("aria-label", `Rename ${item.name}`);
          input.className =
            "zen-w-full zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";

          /* Rename swaps the name for an input in place. Escape cancels; Enter
             and blur commit — and closing the editor removes a FOCUSED input,
             so the browser fires blur DURING replaceWith and re-enters this
             code before the first call has finished.
             `closed` is therefore set before the DOM is touched, not after, and
             not derived from `input.isConnected`: at blur time the node is
             still a child, so isConnected reads true, the handler replaces it a
             second time, and the outer replaceWith then throws NotFoundError
             ("the node to be removed is no longer a child"). Measured — the
             first attempt at this guard did exactly that, twice per rename, and
             called onRename twice with it.
             The flag is per editing session, hence declared here rather than
             per row: a stale true would swallow the next rename. */
          let closed = false;
          const close = () => {
            if (closed) return;
            closed = true;
            input.replaceWith(name);
          };
          const commit = () => {
            if (closed) return;
            const next = input.value.trim();
            close();
            if (next && next !== item.name) props.onRename?.(item, next);
          };

          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              close();
            }
          });
          input.addEventListener("blur", commit);
          name.replaceWith(input);
          input.focus();
          input.select();
        },
      })).el,
    );
  }

  if (props.onRemove) {
    actions.append(
      keep(owned, Button({
        variant: "ghost",
        color: "neutral",
        size: "sm",
        "aria-label": `Remove ${item.name}`,
        disabled: props.disabled,
        children: keep(owned, Icon({ name: "trash", size: 14 })),
        onClick: () => props.onRemove?.(item),
      })).el,
    );
  }

  li.append(actions);
  return li;
}

export function UploadCollection(
  props: UploadCollectionProps,
): ZenComponent<UploadCollectionProps> {
  let current: UploadCollectionProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  /* One stable root, for the same reason Timeline has one: `el` is handed out
     once, so a factory cannot swap between a <ul> and the empty <p> the way the
     React binding returns one or the other. Inside it the markup matches React
     element for element, including the empty state rendering no <ul>. */
  const el = document.createElement("div");

  /* Handles built by the CURRENT render. update() rebuilds the list, so the
     previous render's buttons and icons are destroyed first — otherwise every
     update leaks a listener per action, which is the DOM's version of the bug
     React unmounting a subtree prevents for free. */
  let owned: AnyZenComponent[] = [];

  const render = () => {
    const { items, emptyMessage, class: className, children: _children, ...rest } = current;
    const rows = items ?? [];

    for (const comp of owned) comp.destroy();
    owned = [];
    el.replaceChildren();
    /* `class` reaches the empty state too — a caller who sized the list meant
       the box the files live in, and a message that ignored it would jump the
       layout the moment the last file was removed. It lands on this wrapper,
       which holds whichever of the two is rendered. */
    el.className = cn(className);

    if (rows.length === 0) {
      const p = document.createElement("p");
      p.className = "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      p.append(...toNodes(emptyMessage ?? "No files yet"));
      el.append(p);
    } else {
      const ul = document.createElement("ul");
      ul.className = "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0";
      for (const item of rows) ul.append(row(item, current, owned));
      el.append(ul);
    }

    removeProps?.();
    removeProps = applyProps(el, {
      ...rest,
      // Handlers are read by the rows themselves; forwarding them to the root
      // would add real DOM listeners for "remove"/"retry"/"rename" events that
      // nothing dispatches.
      onRemove: undefined,
      onRetry: undefined,
      onRename: undefined,
      disabled: undefined,
    } as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());
  disposer.add(() => {
    for (const comp of owned) comp.destroy();
    owned = [];
  });

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

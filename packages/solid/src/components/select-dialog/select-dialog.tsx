import { createMemo, createSignal, createUniqueId, createEffect, Show } from "solid-js";
import { cn } from "../../lib/cn";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../dialog/dialog";
import { Button } from "../button/button";
import {
  SelectSearchField,
  SelectListBody,
  type SelectListItem,
} from "../select-list/select-list";
import { filterItems } from "../select-list/filter";

/**
 * SelectDialog — the list picker: a modal with a search field, a scrollable
 * list, and a footer. Mirrors the React binding's API exactly.
 *
 * Two modes, and they behave differently on purpose:
 *
 * - **Single** — picking a row IS the confirmation. The dialog closes on click
 *   and there is no OK button, because an OK would be a second click that says
 *   nothing new.
 * - **Multiple** — rows are checkboxes and nothing is committed until OK, so a
 *   mis-click is recoverable. Cancel restores whatever was selected on open.
 *
 * Selection is drafted internally and only handed back via `onConfirm`, so the
 * caller's state never sees an intermediate tick. `selectedIds` is read when
 * `open` flips true — this is a picker, not a live-bound field.
 *
 * Filtering is client-side over label + description. Pass `onSearch` to take it
 * over (server-driven / fuzzy): the dialog then renders `items` verbatim and
 * filtering becomes the caller's job.
 *
 * The search field and list body come from `select-list`, shared with ValueHelp.
 */

/** The item shape. Shared with ValueHelp's Select tab as `SelectListItem`. */
export type SelectDialogItem = SelectListItem;

export interface SelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Optional subtitle. Also the dialog's accessible description. */
  description?: string;
  items: SelectDialogItem[];
  /** Checkbox rows + an OK/Cancel commit step. Default: single-select. */
  multiple?: boolean;
  /** The selection the dialog opens with. Read when `open` becomes true. */
  selectedIds?: string[];
  /** The only way selection escapes. Single mode passes exactly one id. */
  onConfirm: (ids: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Take over filtering. When set, `items` is rendered as given. */
  onSearch?: (query: string) => void;
  emptyText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  clearLabel?: string;
  /** Multi-select only: a "Clear" action in the footer. Default: true. */
  showClearAll?: boolean;
  class?: string;
}

export const SelectDialog = (props: SelectDialogProps) => {
  const [query, setQuery] = createSignal("");
  // Seeded by the effect below rather than here: `selectedIds` is read when the
  // dialog opens, so an initial read would be a second, contradictory source of
  // that rule (and the draft of a closed dialog is never shown anyway).
  const [draft, setDraft] = createSignal<string[]>([]);
  const descriptionId = createUniqueId();

  // A picker is a fresh question each time it opens: re-seed the draft and drop
  // the previous search. Tracks `props.open` only — reading selectedIds inside
  // an untracked read keeps a caller's inline array from re-running this
  // mid-interaction and wiping the user's ticks.
  createEffect(() => {
    if (!props.open) return;
    setDraft(props.selectedIds ? [...props.selectedIds] : []);
    setQuery("");
  });

  const visible = createMemo(() => filterItems(props.items, query(), Boolean(props.onSearch)));

  const commit = (ids: string[]) => {
    props.onConfirm(ids);
    props.onOpenChange(false);
  };

  const toggle = (id: string) =>
    setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // OK reports the selection in list order, not tick order — which rows the user
  // happened to click first is not information the caller should have to
  // untangle, and Fiori's SelectDialog reports selectedContexts in list order
  // too. Ids `items` no longer holds (a rotated `onSearch` page) keep their
  // draft order on the end instead of being dropped.
  const inListOrder = (ids: string[]) => {
    const picked = new Set(ids);
    const known = props.items.filter((i) => picked.has(i.id)).map((i) => i.id);
    const seen = new Set(known);
    return [...known, ...ids.filter((id) => !seen.has(id))];
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    props.onSearch?.(value);
  };

  const searchPlaceholder = () => props.searchPlaceholder ?? "Search";
  const showClearAll = () => props.showClearAll ?? true;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        // The list is full-bleed and scrolls on its own, so the dialog's own
        // padding and scroller would double up: a scrollbar inside a scrollbar,
        // and a search field that scrolls away from the list it filters.
        class={cn(
          "zen-flex zen-max-h-[85vh] zen-flex-col zen-overflow-hidden zen-p-0",
          props.class,
        )}
        aria-describedby={props.description ? descriptionId : undefined}
      >
        <div class="zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4">
          <DialogTitle class="zen-pr-8">{props.title}</DialogTitle>
          <Show when={props.description}>
            <DialogDescription id={descriptionId}>{props.description}</DialogDescription>
          </Show>
          <Show when={props.searchable ?? true}>
            <SelectSearchField
              value={query()}
              onValueChange={handleSearch}
              placeholder={searchPlaceholder()}
              class="zen-mt-1"
            />
          </Show>
        </div>

        <div class="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2">
          <SelectListBody
            items={visible()}
            multiple={props.multiple}
            selected={draft()}
            onToggle={toggle}
            onPick={(id) => commit([id])}
            emptyText={props.emptyText}
          />
        </div>

        <div class="zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3">
          <Show when={props.multiple && showClearAll()}>
            <Button
              type="button"
              variant="ghost"
              color="neutral"
              size="sm"
              // Clearing an empty selection is a no-op dressed as an action.
              disabled={draft().length === 0}
              onClick={() => setDraft([])}
              class="zen-mr-auto"
            >
              {props.clearLabel ?? "Clear"}
            </Button>
          </Show>
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => props.onOpenChange(false)}
          >
            {props.cancelLabel ?? "Cancel"}
          </Button>
          <Show when={props.multiple}>
            <Button type="button" size="sm" onClick={() => commit(inListOrder(draft()))}>
              {props.confirmLabel ?? "OK"}
            </Button>
          </Show>
        </div>
      </DialogContent>
    </Dialog>
  );
};

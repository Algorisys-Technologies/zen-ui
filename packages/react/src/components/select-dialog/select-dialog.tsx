import * as React from "react";
import { cn } from "@algorisys/zen-ui-core";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../dialog/dialog";
import { Button } from "../button/button";
import {
  SelectSearchField,
  SelectListBody,
  type SelectListItem,
} from "../select-list/select-list";
import { filterItems } from "../select-list/filter";

/**
 * SelectDialog — the list picker: a modal with a search field, a scrollable
 * list, and a footer.
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
  className?: string;
}

export const SelectDialog = ({
  open,
  onOpenChange,
  title,
  description,
  items,
  multiple = false,
  selectedIds,
  onConfirm,
  searchable = true,
  searchPlaceholder = "Search",
  onSearch,
  emptyText = "No matching items",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  clearLabel = "Clear",
  showClearAll = true,
  className,
}: SelectDialogProps) => {
  const [query, setQuery] = React.useState("");
  // Seeded by the reset effect below rather than here: `selectedIds` is read when
  // the dialog opens, so an initial read would be a second, contradictory source
  // of that rule (and the draft of a closed dialog is never shown anyway).
  const [draft, setDraft] = React.useState<string[]>([]);

  // Held in a ref so the reset effect below can depend on `open` alone. A
  // caller passing `selectedIds={[]}` inline hands us a new array identity every
  // render; depending on it would re-run the reset mid-interaction and wipe the
  // user's ticks. Same class of bug as FlexibleColumnLayout's render loop.
  const selectedRef = React.useRef(selectedIds);
  React.useEffect(() => {
    selectedRef.current = selectedIds;
  });

  // A picker is a fresh question each time it opens: re-seed the draft and drop
  // the previous search. Resetting on close instead would animate the list
  // rebuilding while the dialog fades out.
  React.useEffect(() => {
    if (!open) return;
    setDraft(selectedRef.current ?? []);
    setQuery("");
  }, [open]);

  const visible = React.useMemo(
    () => filterItems(items, query, Boolean(onSearch)),
    [items, query, onSearch],
  );

  const commit = (ids: string[]) => {
    onConfirm(ids);
    onOpenChange(false);
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
    const known = items.filter((i) => picked.has(i.id)).map((i) => i.id);
    const seen = new Set(known);
    return [...known, ...ids.filter((id) => !seen.has(id))];
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const descriptionId = React.useId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // The list is full-bleed and scrolls on its own, so the dialog's own
        // padding and scroller would double up: a scrollbar inside a scrollbar,
        // and a search field that scrolls away from the list it filters.
        className={cn("zen-flex zen-max-h-[85vh] zen-flex-col zen-overflow-hidden zen-p-0", className)}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4">
          <DialogTitle className="zen-pr-8">{title}</DialogTitle>
          {description ? (
            <DialogDescription id={descriptionId}>{description}</DialogDescription>
          ) : null}
          {searchable ? (
            <SelectSearchField
              value={query}
              onValueChange={handleSearch}
              placeholder={searchPlaceholder}
              className="zen-mt-1"
            />
          ) : null}
        </div>

        <div className="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2">
          <SelectListBody
            items={visible}
            multiple={multiple}
            selected={draft}
            onToggle={toggle}
            onPick={(id) => commit([id])}
            emptyText={emptyText}
          />
        </div>

        <div className="zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3">
          {multiple && showClearAll ? (
            <Button
              type="button"
              variant="ghost"
              color="neutral"
              size="sm"
              // Clearing an empty selection is a no-op dressed as an action.
              disabled={draft.length === 0}
              onClick={() => setDraft([])}
              className="zen-mr-auto"
            >
              {clearLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          {multiple ? (
            <Button type="button" size="sm" onClick={() => commit(inListOrder(draft))}>
              {confirmLabel}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
SelectDialog.displayName = "SelectDialog";

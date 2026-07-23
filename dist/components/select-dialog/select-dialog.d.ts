import { type SelectListItem } from "../select-list/select-list";
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
export declare const SelectDialog: (props: SelectDialogProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=select-dialog.d.ts.map
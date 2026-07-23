/**
 * ViewSettingsDialog — sort / group / filter settings for a list or
 * table. The caller owns the data; this only collects the user's intent and
 * hands it back on OK.
 *
 * Panes are built from `select-list` rather than RadioGroup: "pick one sort
 * field" is the same list SelectDialog draws, the two bindings' RadioGroup APIs
 * diverge (React needs a sibling <label htmlFor>, Solid takes children), and
 * Solid's RadioGroupItem still lands a caller's id on the wrapper. Reusing the
 * list keeps the dialog family looking identical and sidesteps all of it.
 *
 * Only the sections you pass get a tab, and the tab strip disappears entirely
 * when there is just one — a single tab is a label pretending to be a choice.
 *
 * Nothing is committed until OK, so Cancel restores whatever `value` held when
 * the dialog opened. Reset clears the draft but still needs an OK: it is an
 * edit, not a second commit path.
 *
 * Mirrors the React binding's API.
 */
export interface ViewSettingsItem {
    id: string;
    label: string;
    /** Secondary line under the label. */
    description?: string;
}
export interface ViewSettingsFilterGroup {
    id: string;
    label: string;
    /** Checkbox rows. Default: true — filters are usually "any of these". */
    multiple?: boolean;
    items: ViewSettingsItem[];
}
export interface ViewSettingsValue {
    sortBy?: string | null;
    sortDescending?: boolean;
    groupBy?: string | null;
    groupDescending?: boolean;
    /** Filter group id → selected item ids. */
    filters?: Record<string, string[]>;
}
export interface ViewSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    /** Optional subtitle. Also the dialog's accessible description. */
    description?: string;
    sortItems?: ViewSettingsItem[];
    groupItems?: ViewSettingsItem[];
    filterGroups?: ViewSettingsFilterGroup[];
    /** The settings the dialog opens with. Read when `open` becomes true. */
    value?: ViewSettingsValue;
    /** The only way settings escape. */
    onConfirm: (value: ViewSettingsValue) => void;
    confirmLabel?: string;
    cancelLabel?: string;
    resetLabel?: string;
    sortTabLabel?: string;
    groupTabLabel?: string;
    filterTabLabel?: string;
    class?: string;
}
export declare const ViewSettingsDialog: (props: ViewSettingsDialogProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=view-settings-dialog.d.ts.map
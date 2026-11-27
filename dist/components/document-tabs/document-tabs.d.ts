import * as React from "react";
/**
 * DocumentTabs — a workspace's open documents, as closable, pinnable tabs.
 *
 *   <DocumentTabs
 *     tabs={[{ id: "a", label: "SI/26/00012", description: "Sales Invoice", dirty: true }]}
 *     activeId="a"
 *     onSelect={(id) => …}
 *     onClose={(id) => …}
 *     onPinChange={(id, pinned) => …}
 *   />
 *
 * Unlike Tabs, the panels are the consumer's: each document lives in its own
 * subtree (kept alive while hidden), so this renders the strip only and
 * reports intent. `tabs` is data, as with Toolbar, because the strip needs
 * every tab's label for the "all tabs" menu.
 *
 * Keyboard (WAI-ARIA tabs, manual activation, since opening a document is
 * work): ←/→ move focus, Home/End jump, Enter or Space opens, Delete closes.
 * A middle-click closes, as in a browser. The close and pin buttons are out
 * of the tab order (the keys above cover them) and labelled for pointers and
 * screen readers.
 *
 * When the tabs do not fit, the strip scrolls sideways (the active tab is
 * kept in view) and an "all tabs" menu appears at its end.
 *
 * Ported from the Solid binding, which is the behaviour reference.
 */
export interface DocumentTab {
    id: string;
    /** The document's name, shown on the tab. */
    label: string;
    /** A second, quieter line or prefix: the document's type. */
    description?: string;
    /** Kept at the strip's start and not closable until unpinned. */
    pinned?: boolean;
    /** Has unsaved changes: shown as a dot, announced as "unsaved changes". */
    dirty?: boolean;
}
export type DocumentTabsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "onClose"> & {
    tabs: DocumentTab[];
    activeId?: string | null;
    onSelect: (id: string) => void;
    onClose?: (id: string) => void;
    onPinChange?: (id: string, pinned: boolean) => void;
    /** The id of the panel a tab controls (aria-controls), when there is one. */
    panelId?: (id: string) => string;
    /** Accessible name of the strip. */
    label?: string;
    allTabsLabel?: string;
    /**
     * The close button's tooltip, per tab: say how else to close it, e.g.
     * `() => "Close (Alt+W)"`. Default "Close". Its accessible name stays
     * "Close <tab label>", so it is clear which tab it closes.
     */
    closeLabel?: (tab: DocumentTab) => string;
};
export declare const DocumentTabs: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "onClose"> & {
    tabs: DocumentTab[];
    activeId?: string | null;
    onSelect: (id: string) => void;
    onClose?: (id: string) => void;
    onPinChange?: (id: string, pinned: boolean) => void;
    /** The id of the panel a tab controls (aria-controls), when there is one. */
    panelId?: (id: string) => string;
    /** Accessible name of the strip. */
    label?: string;
    allTabsLabel?: string;
    /**
     * The close button's tooltip, per tab: say how else to close it, e.g.
     * `() => "Close (Alt+W)"`. Default "Close". Its accessible name stays
     * "Close <tab label>", so it is clear which tab it closes.
     */
    closeLabel?: (tab: DocumentTab) => string;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=document-tabs.d.ts.map
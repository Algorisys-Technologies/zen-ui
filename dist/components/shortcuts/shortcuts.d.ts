import * as React from "react";
import { type Chord, type Platform } from "../../_core/keys";
/**
 * Keyboard shortcuts as a system: one list of every key the app answers, so
 * a help overlay (`?`) can show them, tooltips and menus can name them, and two
 * features cannot quietly take the same key.
 *
 *   <ShortcutProvider>
 *     <App />
 *     <ShortcutHelp />                      // "?" opens it
 *   </ShortcutProvider>
 *
 *   useShortcut("Mod+S", save, { description: "Save", group: "Forms" });
 *   useShortcut("Alt+W", closeTab, { description: "Close the tab", group: "Tabs", within: () => workspaceRef.current });
 *   <Button aria-keyshortcuts={keyshortcut("Mod+S")}>Save <Kbd keys="Mod+S" /></Button>
 *
 * Chords are written once ("Mod+K": Ctrl, or ⌘ on a Mac) and the pure half is
 * @algorisys/zen-ui-core/keys (check:keys). One keydown listener for the whole
 * app; a shortcut `within` an element answers only while focus is inside it,
 * and wins over a global one with the same keys. Plain keys typed into a field
 * stay the field's unless a shortcut says `allowInFields`. A chord the browser
 * keeps (Ctrl+T, Ctrl+W, F5…) is refused with a warning, as is a second
 * shortcut on the same keys in the same place.
 *
 * React specifics. The registry is a ref, written synchronously by register
 * and release, so the keydown listener and the clash check always see the
 * current list — StrictMode's mount/cleanup/mount cannot leave a stale entry
 * behind or warn about a clash with itself. A copy in state drives what the
 * help overlay renders. useShortcut registers once per chord and reads the
 * handler and the `within` / `enabled` / `allowInFields` options through a
 * ref, so a new handler identity on every render neither re-registers (which
 * would reorder the list and change which scoped shortcut wins) nor answers
 * with a stale closure.
 */
export interface ShortcutOptions {
    /** What it does, for the help overlay: "Save", "Close the tab". */
    description?: string;
    /** The help overlay's heading it goes under: "Forms", "Tabs". Default "General". */
    group?: string;
    /**
     * Only while focus is inside this element. Wins over a global shortcut on the same keys.
     * A function returning the element (as in Solid), or a ref to it.
     */
    within?: (() => Element | null | undefined) | React.RefObject<Element | null>;
    /** Also while typing in a field (a chord with Mod or Alt usually wants this). */
    allowInFields?: boolean;
    /** Turned off while this returns false. */
    enabled?: () => boolean;
    /** Left out of the help overlay (a key that is an implementation detail). */
    hidden?: boolean;
}
interface Registration {
    id: number;
    text: string;
    chord: Chord;
    description?: string;
    group?: string;
    hidden?: boolean;
    /** The element the shortcut is scoped to, read now; undefined when it is global. */
    scope: () => Element | null | undefined;
    scoped: boolean;
    allowInFields: () => boolean;
    enabled: () => boolean;
    handler: (e: KeyboardEvent) => void;
}
interface ShortcutRegistry {
    platform: Platform;
    register: (r: Omit<Registration, "id" | "chord">) => () => void;
    /** Every registered shortcut, in registration order. */
    list: Registration[];
}
/** The platform, for spelling and matching: a Mac, or everything else. */
export declare function detectPlatform(): Platform;
export type ShortcutProviderProps = {
    children?: React.ReactNode;
    /** Override the detected platform (tests, a demo showing both). */
    platform?: Platform;
};
export declare const ShortcutProvider: ({ children, platform: platformProp }: ShortcutProviderProps) => React.JSX.Element;
/** The registry and platform, for a component that lists or spells shortcuts. */
export declare function useShortcuts(): ShortcutRegistry | undefined;
/**
 * Answer a key while this component is mounted. Released when it unmounts.
 * Outside a ShortcutProvider it does nothing (and says so, in development).
 */
export declare function useShortcut(text: string, handler: (e: KeyboardEvent) => void, options?: ShortcutOptions): void;
/** A chord's aria-keyshortcuts value on this platform: put it on the control the shortcut acts as. */
export declare function keyshortcut(text: string, platform?: Platform): string;
/** A chord spelled for a tooltip on this platform: "Ctrl+S", "⌘S". */
export declare function shortcutLabel(text: string, platform?: Platform): string;
export type KbdProps = React.HTMLAttributes<HTMLSpanElement> & {
    /** A chord, drawn as key caps spelled for this platform: "Mod+K" is Ctrl K, or ⌘ K on a Mac. */
    keys: string;
    /** Override the platform (a demo showing both). */
    platform?: Platform;
};
/**
 * Key caps for a chord. The caps are drawn for the eye; the group is named by
 * the chord as words ("Ctrl+K", "⌘K") so it reads as one thing.
 */
export declare const Kbd: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & {
    /** A chord, drawn as key caps spelled for this platform: "Mod+K" is Ctrl K, or ⌘ K on a Mac. */
    keys: string;
    /** Override the platform (a demo showing both). */
    platform?: Platform;
} & React.RefAttributes<HTMLSpanElement>>;
/** A group of shortcuts the help overlay lists that are not registered here: a component's own keys. */
export interface ShortcutHelpGroup {
    title: string;
    /** Where these keys work, when the title does not say. */
    where?: string;
    shortcuts: {
        keys: string[];
        description: string;
    }[];
}
export type ShortcutHelpProps = {
    /** The key that opens it. Default "?". Pass null to open it only through `open`. */
    openKey?: string | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Keys handled elsewhere (a table's arrows, a form's own keys), listed after the registered ones. */
    extra?: ShortcutHelpGroup[];
    title?: string;
};
/**
 * Every registered shortcut, grouped, with its keys, generated from the
 * registry: a key added with useShortcut shows up here by itself.
 */
export declare const ShortcutHelp: ({ openKey: openKeyProp, open: openProp, onOpenChange, extra, title }: ShortcutHelpProps) => React.JSX.Element;
export {};
//# sourceMappingURL=shortcuts.d.ts.map
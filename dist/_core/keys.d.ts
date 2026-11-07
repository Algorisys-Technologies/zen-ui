/**
 * Keyboard chords: the pure half of zen-ui's shortcuts (Kbd, useShortcut,
 * ShortcutHelp), shared by every binding.
 *
 *   bun run check:keys
 *
 * A chord is written once, the way people say it: "Mod+K", "Alt+PageDown",
 * "Shift+?", "F2". `Mod` is the platform's command key, Ctrl on Windows and
 * Linux, ⌘ on a Mac, so one chord means the right thing everywhere; write
 * "Ctrl" only for a chord that really is Ctrl on a Mac too. From that one
 * string this module matches key events, spells the chord for display (⌘ ⌥ ⇧
 * on a Mac), gives its aria-keyshortcuts form, and says whether the browser
 * keeps it for itself.
 */
export type Platform = "mac" | "other";
export interface Chord {
    /** The platform's command key: Ctrl, or ⌘ on a Mac. */
    mod: boolean;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
    /** The key, normalised: "k", "Enter", "ArrowDown", "F2", "?". */
    key: string;
}
/** "Mod+Shift+K" -> a Chord. The last part is the key; a lone "+" is the plus key. */
export declare function parseChord(text: string): Chord;
/** What matching needs from a key event: KeyboardEvent has all of it. */
export interface KeyEventLike {
    key: string;
    code?: string;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
}
/**
 * Whether a key event is this chord. Letters match by the key typed, case
 * ignored; with Alt (where a Mac's Option changes the character typed: ⌥N is
 * "˜") they match by the physical key. Shifted symbols ("?") match whatever
 * Shift state produced them.
 */
export declare function matchesChord(e: KeyEventLike, chord: Chord, platform: Platform): boolean;
/**
 * The keys to draw, in order, spelled for the platform: "Mod+Shift+K" is
 * ["Ctrl", "Shift", "K"], or ["⌘", "⇧", "K"] on a Mac.
 */
export declare function chordParts(chord: Chord, platform: Platform): string[];
/** The chord as one string for a tooltip: "Ctrl+Shift+K", or "⌘⇧K" on a Mac. */
export declare function chordLabel(chord: Chord, platform: Platform): string;
/** The chord in aria-keyshortcuts' form: "Control+Shift+K". */
export declare function ariaKeyshortcut(chord: Chord, platform: Platform): string;
/**
 * Chords the browser or the system keeps: a page cannot have them, or takes
 * them from the user (a new tab, closing one, the address bar, reload).
 * Registering one is a mistake to report, not a shortcut.
 */
export declare function isReservedChord(chord: Chord, platform: Platform): boolean;
/** Two chords are the same keys on this platform (Mod+K and Ctrl+K are, off a Mac). */
export declare function sameChord(a: Chord, b: Chord, platform: Platform): boolean;
/** Whether a key event came from somewhere typing happens: a field keeps its plain keys. */
export declare function isTypingTarget(target: EventTarget | null): boolean;

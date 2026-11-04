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

const KEY_ALIASES: Record<string, string> = {
  esc: "Escape", escape: "Escape", enter: "Enter", return: "Enter", tab: "Tab", space: " ",
  up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight",
  "↑": "ArrowUp", "↓": "ArrowDown", "←": "ArrowLeft", "→": "ArrowRight",
  arrowup: "ArrowUp", arrowdown: "ArrowDown", arrowleft: "ArrowLeft", arrowright: "ArrowRight",
  pageup: "PageUp", pagedown: "PageDown", home: "Home", end: "End",
  del: "Delete", delete: "Delete", backspace: "Backspace", ins: "Insert", insert: "Insert",
  plus: "+",
};

const normaliseKey = (k: string): string => {
  const alias = KEY_ALIASES[k.toLowerCase()];
  if (alias) return alias;
  if (/^f\d{1,2}$/i.test(k)) return k.toUpperCase();
  return k.length === 1 ? k.toLowerCase() : k;
};

/** "Mod+Shift+K" -> a Chord. The last part is the key; a lone "+" is the plus key. */
export function parseChord(text: string): Chord {
  const parts = text === "+" ? ["+"] : text.split(/\+(?!$)/).map((p) => p.trim()).filter(Boolean);
  const chord: Chord = { mod: false, ctrl: false, alt: false, shift: false, meta: false, key: "" };
  parts.forEach((p, i) => {
    const lower = p.toLowerCase();
    if (i === parts.length - 1) {
      chord.key = normaliseKey(p);
      return;
    }
    if (lower === "mod") chord.mod = true;
    else if (lower === "ctrl" || lower === "control") chord.ctrl = true;
    else if (lower === "alt" || lower === "option" || lower === "opt") chord.alt = true;
    else if (lower === "shift") chord.shift = true;
    else if (lower === "meta" || lower === "cmd" || lower === "command") chord.meta = true;
    else throw new Error(`Unknown modifier "${p}" in "${text}"`);
  });
  return chord;
}

/** The modifiers a chord needs on this platform, with Mod resolved. */
function resolved(chord: Chord, platform: Platform) {
  return {
    ctrl: chord.ctrl || (chord.mod && platform === "other"),
    meta: chord.meta || (chord.mod && platform === "mac"),
    alt: chord.alt,
    shift: chord.shift,
  };
}

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
export function matchesChord(e: KeyEventLike, chord: Chord, platform: Platform): boolean {
  const need = resolved(chord, platform);
  if (e.ctrlKey !== need.ctrl || e.metaKey !== need.meta || e.altKey !== need.alt) return false;
  const k = chord.key;
  const isLetterOrDigit = /^[a-z0-9]$/.test(k);
  if (isLetterOrDigit) {
    if (e.shiftKey !== need.shift) return false;
    const byKey = e.key.toLowerCase() === k;
    const byCode = !!e.code && (e.code === `Key${k.toUpperCase()}` || e.code === `Digit${k}`);
    return byKey || (need.alt && byCode);
  }
  if (k.length === 1) {
    // A symbol: Shift is whatever typing it took, unless the chord asks for it.
    if (chord.shift && !e.shiftKey) return false;
    return e.key === k;
  }
  if (e.shiftKey !== need.shift) return false;
  return normaliseKey(e.key) === k;
}

const MAC_SYMBOLS: Record<string, string> = { ctrl: "⌃", alt: "⌥", shift: "⇧", meta: "⌘" };
const KEY_LABELS: Record<string, string> = {
  ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
  Escape: "Esc", " ": "Space", PageUp: "PageUp", PageDown: "PageDown", Delete: "Del", Insert: "Ins",
};

/**
 * The keys to draw, in order, spelled for the platform: "Mod+Shift+K" is
 * ["Ctrl", "Shift", "K"], or ["⌘", "⇧", "K"] on a Mac.
 */
export function chordParts(chord: Chord, platform: Platform): string[] {
  const m = resolved(chord, platform);
  const mods: string[] = [];
  if (platform === "mac") {
    if (m.ctrl) mods.push(MAC_SYMBOLS.ctrl);
    if (m.alt) mods.push(MAC_SYMBOLS.alt);
    if (m.shift) mods.push(MAC_SYMBOLS.shift);
    if (m.meta) mods.push(MAC_SYMBOLS.meta);
  } else {
    if (m.ctrl) mods.push("Ctrl");
    if (m.meta) mods.push("Win");
    if (m.alt) mods.push("Alt");
    if (m.shift) mods.push("Shift");
  }
  const key = KEY_LABELS[chord.key] ?? (chord.key.length === 1 ? chord.key.toUpperCase() : chord.key);
  return [...mods, key];
}

/** The chord as one string for a tooltip: "Ctrl+Shift+K", or "⌘⇧K" on a Mac. */
export function chordLabel(chord: Chord, platform: Platform): string {
  const parts = chordParts(chord, platform);
  return platform === "mac" ? parts.join("") : parts.join("+");
}

/** The chord in aria-keyshortcuts' form: "Control+Shift+K". */
export function ariaKeyshortcut(chord: Chord, platform: Platform): string {
  const m = resolved(chord, platform);
  const parts: string[] = [];
  if (m.ctrl) parts.push("Control");
  if (m.alt) parts.push("Alt");
  if (m.shift) parts.push("Shift");
  if (m.meta) parts.push("Meta");
  const key = chord.key === " " ? "Space" : chord.key.length === 1 ? chord.key.toUpperCase() : chord.key;
  parts.push(key);
  return parts.join("+");
}

/**
 * Chords the browser or the system keeps: a page cannot have them, or takes
 * them from the user (a new tab, closing one, the address bar, reload).
 * Registering one is a mistake to report, not a shortcut.
 */
export function isReservedChord(chord: Chord, platform: Platform): boolean {
  const m = resolved(chord, platform);
  const primary = platform === "mac" ? m.meta : m.ctrl;
  const k = chord.key;
  if (primary && !m.alt && ["t", "n", "w", "l", "r", "q", "h", "j"].includes(k)) return true;
  if (primary && k === "Tab") return true;
  if (!m.ctrl && !m.meta && !m.alt && ["F5", "F11", "F12"].includes(k)) return true;
  if (platform === "other" && m.alt && !m.ctrl && (k === "F4" || k === "ArrowLeft" || k === "ArrowRight")) return true;
  if (platform === "mac" && m.meta && (k === "ArrowLeft" || k === "ArrowRight" || k === "[" || k === "]")) return true;
  return false;
}

/** Two chords are the same keys on this platform (Mod+K and Ctrl+K are, off a Mac). */
export function sameChord(a: Chord, b: Chord, platform: Platform): boolean {
  const ra = resolved(a, platform);
  const rb = resolved(b, platform);
  return ra.ctrl === rb.ctrl && ra.meta === rb.meta && ra.alt === rb.alt && ra.shift === rb.shift && a.key === b.key;
}

/** Whether a key event came from somewhere typing happens: a field keeps its plain keys. */
export function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as (Element & { isContentEditable?: boolean }) | null;
  if (!el || typeof el.tagName !== "string") return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable) return true;
  if (tag === "INPUT") {
    const type = (el.getAttribute("type") ?? "text").toLowerCase();
    return !["checkbox", "radio", "button", "submit", "reset", "range", "color", "file"].includes(type);
  }
  return false;
}

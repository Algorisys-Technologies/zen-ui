/**
 * Keyboard chord contract.
 *
 *   bun run check:keys
 *
 * The pure half of zen-ui's shortcuts: one chord string, matched against key
 * events, spelled for each platform, given in aria-keyshortcuts form, and
 * refused when the browser keeps it. Invariants re-checked everywhere: a chord
 * matches the event its own description produces, on each platform, and no
 * other modifier combination of the same key.
 */
import {
  parseChord, matchesChord, chordParts, chordLabel, ariaKeyshortcut, isReservedChord, sameChord, isTypingTarget,
  type KeyEventLike, type Platform,
} from "../packages/core/src/keys";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
};
const ev = (key: string, mods: Partial<KeyEventLike> = {}, code?: string): KeyEventLike =>
  ({ key, code, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...mods });

/* parsing */
eq("Mod+K", parseChord("Mod+K"), { mod: true, ctrl: false, alt: false, shift: false, meta: false, key: "k" });
eq("aliases", parseChord("Ctrl+Shift+Del").key, "Delete");
eq("arrows by symbol", parseChord("Alt+↓").key, "ArrowDown");
eq("function keys", parseChord("f2").key, "F2");
eq("a lone plus", parseChord("+").key, "+");
eq("Ctrl and plus", parseChord("Ctrl++").key, "+");
let threw = false; try { parseChord("Hyper+K"); } catch { threw = true; }
eq("unknown modifier is an error", threw, true);

/* matching */
const mod = parseChord("Mod+K");
eq("Mod+K is Ctrl+K off a Mac", matchesChord(ev("k", { ctrlKey: true }), mod, "other"), true);
eq("Mod+K is ⌘K on a Mac", matchesChord(ev("k", { metaKey: true }), mod, "mac"), true);
eq("…not Ctrl+K on a Mac", matchesChord(ev("k", { ctrlKey: true }), mod, "mac"), false);
eq("capital K from caps lock still K", matchesChord(ev("K", { ctrlKey: true }), mod, "other"), true);
eq("extra Shift is another chord", matchesChord(ev("K", { ctrlKey: true, shiftKey: true }), mod, "other"), false);
eq("Alt+N by physical key (⌥N types ˜ on a Mac)", matchesChord(ev("˜", { altKey: true }, "KeyN"), parseChord("Alt+N"), "mac"), true);
eq("? needs whatever Shift typed it", matchesChord(ev("?", { shiftKey: true }), parseChord("?"), "other"), true);
eq("/ plain", matchesChord(ev("/"), parseChord("/"), "other"), true);
eq("Alt+PageDown", matchesChord(ev("PageDown", { altKey: true }), parseChord("Alt+PageDown"), "other"), true);
eq("Esc alias", matchesChord(ev("Escape"), parseChord("Esc"), "other"), true);
eq("F2 not Shift+F2", matchesChord(ev("F2", { shiftKey: true }), parseChord("F2"), "other"), false);
// Invariant: each chord matches its own event, and none of the other 15 modifier combinations.
const MODS = ["ctrlKey", "altKey", "shiftKey", "metaKey"] as const;
let combos = 0;
for (const platform of ["mac", "other"] as Platform[]) {
  for (const text of ["Mod+K", "Mod+Shift+K", "Alt+N", "Ctrl+Enter", "Alt+PageUp", "Shift+F10", "F2", "Mod+S", "Alt+1", "Ctrl+Insert", "Escape", "Delete"]) {
    const chord = parseChord(text);
    const own = {
      ctrlKey: chord.ctrl || (chord.mod && platform === "other"),
      metaKey: chord.meta || (chord.mod && platform === "mac"),
      altKey: chord.alt, shiftKey: chord.shift,
    };
    const keyFor = (shift: boolean) => (chord.key.length === 1 ? (shift ? chord.key.toUpperCase() : chord.key) : chord.key);
    eq(`${text} on ${platform} matches itself`, matchesChord(ev(keyFor(own.shiftKey), own), chord, platform), true);
    for (let m = 0; m < 16; m++) {
      const mods = Object.fromEntries(MODS.map((k, i) => [k, !!(m & (1 << i))])) as Record<(typeof MODS)[number], boolean>;
      const same = MODS.every((k) => mods[k] === own[k]);
      if (same) continue;
      eq(`${text} on ${platform} is not ${JSON.stringify(mods)}`, matchesChord(ev(keyFor(mods.shiftKey), mods), chord, platform), false);
      combos++;
    }
  }
}

/* spelling */
eq("parts off a Mac", chordParts(parseChord("Mod+Shift+K"), "other"), ["Ctrl", "Shift", "K"]);
eq("parts on a Mac", chordParts(parseChord("Mod+Shift+K"), "mac"), ["⇧", "⌘", "K"]);
eq("Alt on a Mac is ⌥", chordParts(parseChord("Alt+W"), "mac"), ["⌥", "W"]);
eq("arrows drawn as arrows", chordParts(parseChord("Alt+PageDown"), "other"), ["Alt", "PageDown"]);
eq("label off a Mac", chordLabel(parseChord("Mod+Enter"), "other"), "Ctrl+Enter");
eq("label on a Mac", chordLabel(parseChord("Mod+Enter"), "mac"), "⌘Enter");
eq("aria", ariaKeyshortcut(parseChord("Mod+Shift+K"), "other"), "Control+Shift+K");
eq("aria on a Mac", ariaKeyshortcut(parseChord("Mod+K"), "mac"), "Meta+K");
eq("aria space", ariaKeyshortcut(parseChord("Ctrl+Space"), "other"), "Control+Space");

/* reserved */
for (const [text, platform, want] of [
  ["Mod+T", "other", true], ["Mod+W", "mac", true], ["Mod+L", "other", true], ["Ctrl+Tab", "other", true], ["F5", "other", true],
  ["Alt+F4", "other", true], ["Mod+K", "other", false], ["Alt+W", "other", false], ["Alt+PageDown", "other", false], ["Mod+S", "mac", false],
  ["Shift+F10", "other", false], ["Alt+N", "mac", false],
] as const) eq(`reserved ${text} on ${platform}`, isReservedChord(parseChord(text), platform), want);

/* sameness */
eq("Mod+K is Ctrl+K off a Mac", sameChord(parseChord("Mod+K"), parseChord("Ctrl+K"), "other"), true);
eq("…not on a Mac", sameChord(parseChord("Mod+K"), parseChord("Ctrl+K"), "mac"), false);

/* typing targets */
const el = (tag: string, attrs: Record<string, string> = {}, editable = false) =>
  ({ tagName: tag, isContentEditable: editable, getAttribute: (n: string) => attrs[n] ?? null }) as unknown as EventTarget;
eq("text input types", isTypingTarget(el("INPUT")), true);
eq("checkbox does not", isTypingTarget(el("INPUT", { type: "checkbox" })), false);
eq("textarea", isTypingTarget(el("TEXTAREA")), true);
eq("contenteditable", isTypingTarget(el("DIV", {}, true)), true);
eq("a button does not", isTypingTarget(el("BUTTON")), false);
eq("nothing", isTypingTarget(null), false);

if (failed) { console.error(`\ncheck:keys — ${failed} of ${checked} failed`); process.exit(1); }
console.log(`check:keys — ${checked} assertions passed (${combos} chord × platform × modifier combinations)`);

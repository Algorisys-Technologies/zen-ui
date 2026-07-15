/**
 * The mask engine contract.
 *
 *   bun run check:mask
 *
 * The engine is pure logic shared by both bindings (that is why it lives in
 * core, like the icon geometry), so it is cheap to pin and expensive to get
 * wrong quietly. Writing this BEFORE the UI caught two things a browser would
 * have hidden: an unescaped "9" in a "+91" dialling code silently becoming an
 * editable slot, and extractRaw reading its own literals back as data.
 */
import {
  applyMask,
  extractRaw,
  maskSkeleton,
  isMaskComplete,
  maskSlotCount,
} from "../packages/core/src/mask";
let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(46)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};
console.log("\napplyMask — literals appear ahead of the next char");
t(applyMask("", "99-9999"), "", "empty stays empty");
t(applyMask("1", "99-9999"), "1", "one digit");
t(applyMask("12", "99-9999"), "12-", "literal emitted once the group is full");
t(applyMask("123", "99-9999"), "12-3", "third digit lands past the dash");
t(applyMask("123456", "99-9999"), "12-3456", "complete");
t(applyMask("1234567890", "99-9999"), "12-3456", "overflow is dropped");
console.log("\nextractRaw — per-slot rules, not a blanket filter");
t(extractRaw("12-3456", "99-9999"), "123456", "strips the literal");
t(extractRaw("12-34", "99-9999"), "1234", "partial");
t(extractRaw("ab-12", "aa-99"), "ab12", "letters then digits");
t(extractRaw("12-ab", "aa-99"), "ab", "digits skipped, letters found (forgiving paste)");
t(extractRaw("a1b2", "aa-99"), "ab2", "a char that fits a LATER slot lands there");
t(extractRaw("123456", "99-9999"), "123456", "bare paste, literal absent -> nothing consumed");
t(extractRaw("(020) 7946 0018", "9999 999999"), "0207946001", "junk and spaces skipped");
t(extractRaw("!!12!!", "99"), "12", "junk ignored");
console.log("\nskeleton + completeness");
t(maskSkeleton("99-9999"), "__-____", "skeleton");
t(maskSkeleton("99-9999", "#"), "##-####", "custom placeholder char");
t(maskSlotCount("+91 99999 99999"), 11, "unescaped 9 in +91 IS a slot (the trap)");
t(isMaskComplete("123456", "99-9999"), true, "complete");
t(isMaskComplete("12345", "99-9999"), false, "incomplete");
console.log("\nescaping — the fix for a literal that collides with a rule symbol");
t(maskSlotCount("+\\9\\1 99999 99999"), 10, "escaped 9 and 1 are literals");
t(maskSkeleton("+\\9\\1 99999 99999"), "+91 _____ _____", "skeleton keeps the dialling code");
t(applyMask("1234567890", "+\\9\\1 99999 99999"), "+91 12345 67890", "formats past the escaped literals");
t(extractRaw("+91 12345 67890", "+\\9\\1 99999 99999"), "1234567890", "round-trips");
t(applyMask("12", "\\a99"), "a12", "escaped rule symbol stays literal");

// The bug a browser found and the unit tests had missed: typing the FIRST
// digit into an escaped dialling code. A literal may only be consumed while
// the string still aligns with the mask, or the leading "1" is read as the
// literal 1 of "+91" and silently vanishes.
t(extractRaw("1", "+\\9\\1 99999 99999"), "1", "bare first keystroke is data, not the literal");
t(extractRaw("12", "+\\9\\1 99999 99999"), "12", "bare second keystroke too");
t(extractRaw("1234567890", "+\\9\\1 99999 99999"), "1234567890", "bare paste keeps every digit");
t(applyMask(extractRaw("1", "+\\9\\1 99999 99999"), "+\\9\\1 99999 99999"), "+91 1", "round-trips from one keystroke");
t(extractRaw("+9", "+\\9\\1 99999 99999"), "", "a half-typed literal is still a literal");

console.log("\ncustom rules merge with the defaults");
t(applyMask("AB12", "AA-99", { A: /[A-Z]/ }), "AB-12", "custom symbol works");
t(extractRaw("ab", "AA", { A: /[A-Z]/ }), "", "custom rule rejects lowercase");
t(applyMask("12", "99", { A: /[A-Z]/ }), "12", "defaults survive an override");
console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);

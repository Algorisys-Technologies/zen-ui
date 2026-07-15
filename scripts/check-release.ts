/**
 * Guards a release against drifting across the four places that describe one.
 *
 * A release currently lives in more places than anyone will remember to update:
 *
 *   packages/{core,react,solid}/package.json    the version consumers install
 *   release-notes/<version>.md                  the human note for that version
 *   CHANGELOG.md                                the maintainer record
 *   packages/{react,solid}/src/release-notes.ts what the demo footer shows
 *
 * Nothing makes them agree, and each is plausible while wrong: a version bumped
 * in two packages of three, a release note for a version that was never cut, a
 * footer still naming the previous release. This is the "ship it" procedure's
 * seatbelt — see CLAUDE.md.
 *
 * It does NOT try to merge them. They are four different audiences and
 * collapsing them would just lose the distinction. It asserts they point at the
 * same version.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";

let f = 0;
const t = (ok: boolean, name: string, detail = "") => {
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(52)} ${ok ? "" : detail}`);
};

const pkgVersion = (name: string): string =>
  JSON.parse(readFileSync(`packages/${name}/package.json`, "utf8")).version;

const core = pkgVersion("core");
const react = pkgVersion("react");
const solid = pkgVersion("solid");

console.log("\none version, three packages");
// They ship one API. Two version numbers describing it would only diverge and
// force every question to name a binding first.
t(core === react && react === solid, `core/react/solid all at ${core}`, `core ${core}, react ${react}, solid ${solid}`);

const version = core;

console.log("\nthe release note exists and is about THIS version");
const notePath = `release-notes/${version}.md`;
t(existsSync(notePath), `${notePath} exists`, `no note for the version in package.json`);

if (existsSync(notePath)) {
  const note = readFileSync(notePath, "utf8");
  t(note.includes(version), `${notePath} names ${version}`, "the note does not mention its own version");
  // A note that is only a heading is a note nobody wrote.
  t(note.trim().split("\n").length > 10, `${notePath} says something`, "fewer than 10 lines — is it a stub?");
}

console.log("\nthe notes folder is coherent");
const notes = existsSync("release-notes")
  ? readdirSync("release-notes").filter((n) => n.endsWith(".md")).map((n) => n.replace(/\.md$/, ""))
  : [];
t(notes.length > 0, `${notes.length} release note(s) on disk`);
const bad = notes.filter((n) => !/^\d+\.\d+\.\d+$/.test(n));
t(bad.length === 0, "every note is named <major>.<minor>.<patch>.md", bad.join(", "));

// The newest note should be the current version — a note for a version ahead of
// package.json means someone wrote the note and forgot the bump.
const cmp = (a: string, b: string) => {
  const [x, y] = [a.split(".").map(Number), b.split(".").map(Number)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};
const newest = [...notes].sort(cmp).pop();
t(newest === version, `the newest note (${newest}) is the current version`, `package.json says ${version}`);

console.log("\nthe changelog knows about it");
const changelog = readFileSync("CHANGELOG.md", "utf8");
t(changelog.includes(`[${version}]`), `CHANGELOG.md has a [${version}] section`, "the version is not in the changelog");

console.log("\nno page hardcodes a version");
// This is the check that was missing. The landing page's footer said "v0.1"
// from the day it was written straight through 3.0.0 — the most public page in
// the repo, advertising a version two majors old, on every deploy. It read as
// intentional because a version string always does. The footer now takes its
// value from core via vite's `define`, and this asserts nobody types one back.
for (const [name, file] of [
  ["landing", "apps/landing/src/App.tsx"],
  ["react demo", "packages/react/src/App.tsx"],
  ["solid demo", "packages/solid/src/App.tsx"],
] as const) {
  const src = readFileSync(file, "utf8");
  // A literal like `v0.1` or `v3.0.0` sitting in JSX text.
  const literals = [...src.matchAll(/>[^<>{}]*\bv\d+\.\d+(\.\d+)?\b/g)].map((m) => m[0].trim());
  t(literals.length === 0, `${name}: no hardcoded version literal`, literals.join(" | "));
}

console.log("\nthe demo footer names it too");
// The footer's notes are per-binding and hand-written for a different audience.
// They need not match word for word — but the newest one must be THIS release,
// or the footer is advertising the last one.
for (const binding of ["react", "solid"]) {
  const src = readFileSync(`packages/${binding}/src/release-notes.ts`, "utf8");
  const versions = [...src.matchAll(/version:\s*"([^"]+)"/g)].map((m) => m[1]);
  const uniq = [...new Set(versions)];
  t(uniq.includes(version), `${binding}: the footer lists ${version}`, `it lists ${uniq.join(", ") || "nothing"}`);
}

console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);

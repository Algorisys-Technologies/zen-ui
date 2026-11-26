/**
 * Guards a release against drifting across the four places that describe one.
 *
 * A release lives in more places than anyone will remember to update:
 *
 *   packages/<binding>/package.json             the version consumers install
 *   release-notes/<binding>/<version>.md        the human note for that version
 *   CHANGELOG.md  [<binding> <version>]         the maintainer record
 *   packages/core/src/release-notes.ts          what the demo footer shows
 *
 * Nothing makes them agree, and each is plausible while wrong. This is the
 * release procedure's seatbelt — see CLAUDE.md.
 *
 * EACH BINDING IS VERSIONED ON ITS OWN, since 13.8.0. Solid is in production and
 * ships on its own schedule; the others are brought to parity later
 * (scripts/port-queue.mjs). So this no longer asserts one version across every
 * package — that rule is what made a Solid fix wait on four bindings. It asserts
 * that each binding's four places agree with THAT binding's version.
 *
 *   bun run check:release            every binding, each against its own version
 *   bun run check:release solid      just one (what "ship solid" runs)
 *
 * Releases up to 13.8.0 were cut for every binding at once, so their notes are
 * unscoped: `release-notes/<v>.md`, CHANGELOG `[<v>]`, a RELEASE_NOTES entry with
 * no `bindings`. Those still count for every binding, which is what keeps today's
 * tree green and the history continuous.
 *
 * It does NOT try to merge the four places. They are four different audiences.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { BINDINGS, byId } from "./bindings.mjs";
import { notesFor, type ReleaseBinding } from "../packages/core/src/release-notes.ts";

let f = 0;
const t = (ok: boolean, name: string, detail = "") => {
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(56)} ${ok ? "" : detail}`);
};

const pkgVersion = (name: string): string =>
  JSON.parse(readFileSync(`packages/${name}/package.json`, "utf8")).version;

const cmp = (a: string, b: string) => {
  const [x, y] = [a.split(".").map(Number), b.split(".").map(Number)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};
const SEMVER = /^\d+\.\d+\.\d+$/;
const notesIn = (dir: string) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isFile() && d.name.endsWith(".md"))
        .map((d) => d.name.replace(/\.md$/, ""))
    : [];

const args = process.argv.slice(2);
const unknown = args.filter((a) => !byId(a));
if (unknown.length) {
  console.error(`unknown binding(s): ${unknown.join(", ")} — expected one of ${BINDINGS.map((b) => b.id).join(", ")}`);
  process.exit(2);
}
const targets = args.length ? args.map((a) => byId(a)!) : BINDINGS;

const lock = readFileSync("bun.lock", "utf8");
// This is not cosmetic and it does not self-heal. `bun install` only rewrites the
// lockfile when the dependency GRAPH changes, so a version bump leaves the
// workspace entry behind — `bun install --force` does not fix it either. It was
// found two majors stale, and it matters because `bun pm pack` takes the version
// it substitutes for a `workspace:*` range from the lockfile. Fix by editing the
// `"packages/<name>"` version field directly; deleting the lockfile mid-release
// would re-resolve every range.
const lockedVersion = (name: string) =>
  (lock.split(`"packages/${name}": {`)[1]?.split("}")[0] ?? "").match(/"version": "([^"]+)"/)?.[1];

const changelog = readFileSync("CHANGELOG.md", "utf8");
const sharedNotes = notesIn("release-notes");

console.log("\nthe notes folder is coherent");
t(sharedNotes.length > 0, `${sharedNotes.length} shared (pre-split) release note(s) on disk`);
const badShared = sharedNotes.filter((n) => !SEMVER.test(n));
t(badShared.length === 0, "every shared note is named <major>.<minor>.<patch>.md", badShared.join(", "));
// A folder under release-notes/ that is not a binding is a typo that would hide
// a note from this check forever.
const strayDirs = existsSync("release-notes")
  ? readdirSync("release-notes", { withFileTypes: true })
      .filter((d) => d.isDirectory() && !byId(d.name))
      .map((d) => d.name)
  : [];
t(strayDirs.length === 0, "every release-notes/ subfolder is a binding id", strayDirs.join(", "));

console.log("\ncore is frozen and the lockfile agrees");
// core is private and inlined into every binding's dist; it is never installed,
// so it has no release of its own. It stays at the last shared version.
{
  const core = pkgVersion("core");
  t(lockedVersion("core") === core, `bun.lock: packages/core is ${core}`, `lockfile says ${lockedVersion("core")}`);
}

for (const b of targets) {
  const version = pkgVersion(b.id);
  const id = b.id as ReleaseBinding;
  console.log(`\n${b.id} ${version}`);

  const locked = lockedVersion(b.id);
  t(locked === version, `bun.lock: packages/${b.id} is ${version}`, locked ? `lockfile says ${locked}` : "no version entry found");

  // The binding's own note, or — for a pre-split release — the shared one.
  const own = notesIn(`release-notes/${b.id}`);
  const badOwn = own.filter((n) => !SEMVER.test(n));
  t(badOwn.length === 0, `every release-notes/${b.id}/ note is <major>.<minor>.<patch>.md`, badOwn.join(", "));
  // When neither exists, name the per-binding path — that is where a new note goes.
  const notePath =
    !own.includes(version) && sharedNotes.includes(version)
      ? `release-notes/${version}.md`
      : `release-notes/${b.id}/${version}.md`;
  t(existsSync(notePath), `${notePath} exists`, `no note for ${b.id} ${version}`);
  if (existsSync(notePath)) {
    const note = readFileSync(notePath, "utf8");
    t(note.includes(version), `${notePath} names ${version}`, "the note does not mention its own version");
    // A note that is only a heading is a note nobody wrote.
    t(note.trim().split("\n").length > 10, `${notePath} says something`, "fewer than 10 lines — is it a stub?");
  }
  // A note ahead of package.json means someone wrote the note and forgot the bump.
  const newest = [...new Set([...sharedNotes, ...own])].filter((n) => SEMVER.test(n)).sort(cmp).pop();
  t(
    newest !== undefined && cmp(newest, version) <= 0,
    `no note is ahead of ${b.id} ${version}`,
    `release-notes has ${newest} but package.json says ${version}`,
  );

  t(
    changelog.includes(`[${b.id} ${version}]`) || changelog.includes(`[${version}]`),
    `CHANGELOG.md has a [${b.id} ${version}] section`,
    "the version is not in the changelog",
  );

  // The footer: a note scoped to (or shared by) this binding at this version.
  const footer = notesFor(id);
  t(
    footer.some((n) => n.version === version),
    `core release-notes.ts lists ${b.id} ${version}`,
    `it lists ${[...new Set(footer.map((n) => n.version))].slice(0, 3).join(", ")}…`,
  );
  t(footer[0]?.version === version, `${b.id}'s newest footer note is ${version}`, `it is ${footer[0]?.version}`);

  // Each binding must still REACH the notes, or its footer silently shows nothing.
  const shim = `${b.dir}/src/release-notes.ts`;
  if (existsSync(shim)) {
    const reaches = /zen-ui-core\/release-notes/.test(readFileSync(shim, "utf8"));
    t(reaches, `${b.id}: reads the notes from core`, `${shim} does not re-export them`);
  } else {
    // Say so rather than pass quietly: a green tick claiming it "reads the notes
    // from core" would be a check telling a small lie.
    console.log(`       ${b.id}: no release-notes shim — its demo imports core directly`);
  }
}

console.log("\nno page hardcodes a version");
// The landing page's footer said "v0.1" from the day it was written straight
// through 3.0.0 — the most public page in the repo. It now takes the lead
// binding's version via vite's `define`, and this asserts nobody types one back.
for (const [name, file] of [
  ["landing", "apps/landing/src/App.tsx"],
  ...BINDINGS.map((b) => [`${b.id} demo`, b.router] as const),
] as const) {
  const src = readFileSync(file, "utf8");
  const literals = [...src.matchAll(/>[^<>{}]*\bv\d+\.\d+(\.\d+)?\b/g)].map((m) => m[0].trim());
  t(literals.length === 0, `${name}: no hardcoded version literal`, literals.join(" | "));
}

console.log(f ? `\n${f} FAILED\n` : `\nall passed (${targets.length} binding(s) checked)\n`);
process.exit(f ? 1 : 0);

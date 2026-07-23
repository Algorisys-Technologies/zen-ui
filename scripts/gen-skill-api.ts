/**
 * Generates the zen-ui skill's per-family API reference —
 * skills/zen-ui/references/api/<family>.md — from the REACT SOURCE TYPES.
 *
 * Why this exists: the skill's SKILL.md + catalogue tell an agent WHICH
 * component to use; nothing told it the props. An agent that has picked
 * Stepper still guesses `activeStep` where the prop is `value`, or invents a
 * `variant` a component does not have — and props are exactly what a compiler
 * can enumerate. So this asks the TypeScript checker, not a human.
 *
 * React is the source because it is the parity REFERENCE (scripts/bindings.mjs)
 * — the API the other bindings mirror by rule. Each file says so; the skill's
 * divergences section covers where the mirror bends (Select, Toast,
 * data-driven factories).
 *
 * What gets listed, calibrated by measurement (see the probe in the 9.7.0
 * session): a ButtonProps has 296 properties, of which 9 matter — the rest are
 * React's DOM attributes. The filter is by DECLARATION ORIGIN:
 *   - declared in this repo (packages/…) → full line: name, type, JSDoc. This
 *     bucket includes the cva variant unions, because VariantProps members
 *     resolve to core's variants.ts object literal — measured, not assumed.
 *   - declared in @types/react / csstype / typescript lib → dropped ("also
 *     forwards the underlying element's props" says it once).
 *   - declared in any other package (@radix-ui/*, react-day-picker, …) →
 *     names only, grouped by package: component-specific escape hatches like
 *     onEscapeKeyDown are worth surfacing, but their docs live upstream.
 *
 * Families come from index.ts's own export declarations — the module specifier
 * (./components/button/button) IS the family; nothing is re-derived from file
 * paths that could disagree with what actually ships. api/index.md maps every
 * export to its family file so an agent can find the right one in one read.
 *
 * Same contract as gen-agent-guide.ts: root copy + one per binding package,
 * --check wired into `bun run check`, so a prop change cannot land without the
 * published reference regenerating. Write mode also DELETES api/*.md files no
 * family claims any more — a renamed component must not leave its old sheet
 * lying around describing an export that no longer exists.
 *
 * Usage:
 *   bun run scripts/gen-skill-api.ts            # write the files
 *   bun run scripts/gen-skill-api.ts --check    # assert they are in sync (CI)
 */
import ts from "typescript";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { BINDINGS } from "./bindings.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------------------
// Build the program the same way the lib build sees it.
// ---------------------------------------------------------------------------
const configPath = resolve(root, "packages/react/tsconfig.lib.json");
const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, {
  ...ts.sys,
  onUnRecoverableConfigFileDiagnostic: (d) => {
    throw new Error(ts.flattenDiagnosticMessageText(d.messageText, "\n"));
  },
});
if (!parsed) throw new Error("could not parse tsconfig.lib.json");
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const indexFile = program.getSourceFile(resolve(root, "packages/react/src/index.ts"));
if (!indexFile) throw new Error("index.ts not in program");

// ---------------------------------------------------------------------------
// Families: index.ts export declarations, grouped by module specifier.
// ---------------------------------------------------------------------------
type Family = { slug: string; module: string; names: string[] };

const families = new Map<string, Family>();
for (const stmt of indexFile.statements) {
  if (!ts.isExportDeclaration(stmt)) continue;
  const spec = stmt.moduleSpecifier;
  if (!spec || !ts.isStringLiteral(spec)) continue;
  const module = spec.text;
  const names: string[] = [];
  if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
    for (const e of stmt.exportClause.elements) names.push(e.name.text);
  }
  const existing = families.get(module);
  if (existing) existing.names.push(...names);
  else {
    // Slug from the module basename; a collision gets its parent dir prefixed,
    // so two files never fight over one name silently.
    const base = module.split("/").at(-1) ?? module;
    families.set(module, { slug: base, module, names });
  }
}
{
  const bySlug = new Map<string, Family[]>();
  for (const f of families.values()) bySlug.set(f.slug, [...(bySlug.get(f.slug) ?? []), f]);
  for (const clash of bySlug.values()) {
    if (clash.length < 2) continue;
    for (const f of clash) {
      const segs = f.module.split("/");
      f.slug = `${segs.at(-2) ?? "x"}-${segs.at(-1)}`;
    }
  }
}

// ---------------------------------------------------------------------------
// Per-export extraction.
// ---------------------------------------------------------------------------
const moduleSym = checker.getSymbolAtLocation(indexFile);
if (!moduleSym) throw new Error("no module symbol for index.ts");
const allExports = new Map(checker.getExportsOfModule(moduleSym).map((s) => [s.getName(), s]));

const declPathOf = (s: ts.Symbol): string =>
  s.getDeclarations()?.[0]?.getSourceFile().fileName ?? "";

type Origin = "repo" | "dom" | { pkg: string };
const originOf = (s: ts.Symbol): Origin => {
  const p = declPathOf(s);
  if (p.includes("node_modules/@types/react") || p.includes("node_modules/csstype") || /typescript\/lib\//.test(p))
    return "dom";
  const m = p.match(/node_modules\/(@?[^/]+(?:\/[^/]+)?)/);
  if (m) return { pkg: m[1].startsWith("@") ? m[1] : m[1].split("/")[0] };
  return "repo";
};

/** One line of JSDoc, or "". Newlines flattened: these render as list items. */
const docOf = (s: ts.Symbol): string =>
  ts.displayPartsToString(s.getDocumentationComment(checker)).replace(/\s+/g, " ").trim();

const typeText = (type: ts.Type, at: ts.Node): string => {
  const text = checker.typeToString(type, at, ts.TypeFormatFlags.NoTruncation);
  // Variant unions are the point of this file, so no 100-char default
  // truncation — but a 2,000-char inline object type helps nobody.
  return text.length > 400 ? `${text.slice(0, 400)}…` : text;
};

const realSymbol = (s: ts.Symbol): ts.Symbol =>
  s.getFlags() & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;

/** The props type of a component-like export, if it has one. */
const propsTypeOf = (sym: ts.Symbol, at: ts.Node): ts.Type | undefined => {
  const type = checker.getTypeOfSymbol(sym);
  const sig = type.getCallSignatures()[0];
  const first = sig?.getParameters()[0];
  if (!first) return undefined;
  // getNonNullableType: an optional props param ( cva's `props?` ) is
  // `P | undefined`, and getPropertiesOfType on that union returns nothing.
  return checker.getNonNullableType(checker.getTypeOfSymbol(first));
};

const renderProps = (propsType: ts.Type, at: ts.Node): string[] => {
  const lines: string[] = [];
  const thirdParty = new Map<string, string[]>();
  let domCount = 0;
  for (const p of checker.getPropertiesOfType(propsType)) {
    const name = p.getName();
    const opt = p.getFlags() & ts.SymbolFlags.Optional ? "?" : "";
    const origin = originOf(p);
    if (origin === "dom") {
      domCount++;
      continue;
    }
    if (origin !== "repo") {
      thirdParty.set(origin.pkg, [...(thirdParty.get(origin.pkg) ?? []), `${name}${opt}`]);
      continue;
    }
    const t = typeText(checker.getTypeOfSymbol(p), at);
    const doc = docOf(p);
    lines.push(`- \`${name}${opt}: ${t}\`${doc ? ` — ${doc}` : ""}`);
  }
  for (const [pkg, names] of thirdParty)
    lines.push(`- from \`${pkg}\`: ${names.map((n) => `\`${n}\``).join(", ")}`);
  if (domCount > 0)
    lines.push(`- …plus the underlying element's standard props (${domCount} inherited).`);
  return lines;
};

/** Markdown body for one export inside a family file, or null to skip. */
const renderExport = (name: string): string | null => {
  const aliased = allExports.get(name);
  if (!aliased) return null;
  const sym = realSymbol(aliased);
  const at = sym.getDeclarations()?.[0] ?? indexFile;

  // Type exports. A Props interface duplicates its component's listing, so it
  // gets one naming line — but an ITEM shape (StepperStep, TimelineItem) is
  // the real API of a data-driven component, so its members are rendered in
  // full; and a short union alias (SearchSize) is worth inlining.
  if (sym.getFlags() & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)) {
    if (!name.endsWith("Props")) {
      const t = checker.getDeclaredTypeOfSymbol(sym);
      // InTypeAlias prints the RHS; without it an alias (and any interface)
      // stringifies to its own name, which told a reader nothing.
      const text = checker.typeToString(
        t,
        at,
        ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias,
      );
      if (text !== name && text.length <= 120 && !text.startsWith("{"))
        return `\`${name}\` = \`${text}\``;
      const members = renderProps(t, at);
      if (members.length) return `### ${name} (type)\n\n${members.join("\n")}`;
    }
    return `\`${name}\` — type${name.endsWith("Props") ? " (see the component above)" : ""}`;
  }

  // No component-level JSDoc on purpose: the file-header comments here are
  // written with package names (`on @radix-ui/react-dialog`) that the JSDoc
  // parser reads as tags, truncating mid-sentence. What a component is FOR
  // already lives in references/catalogue.md; this file is for props, whose
  // own JSDoc lines are single-sentence and parse clean.
  const propsType = /^[A-Z]/.test(name) ? propsTypeOf(sym, at) : undefined;
  if (propsType) {
    const body = renderProps(propsType, at);
    const propLines = body.length
      ? body.join("\n")
      : "- No zen-specific props; forwards the underlying element/primitive props.";
    return `### ${name}\n\n${propLines}`;
  }

  // Non-component values: hooks, cva functions, constants.
  const type = checker.getTypeOfSymbol(sym);
  const sig = type.getCallSignatures()[0];
  if (sig) {
    const text = checker.signatureToString(sig, at);
    return `\`${name}${text.length > 300 ? "(…)" : text}\``;
  }
  return `\`${name}: ${typeText(type, at)}\``;
};

// ---------------------------------------------------------------------------
// Files.
// ---------------------------------------------------------------------------
const NOTICE = `<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by \`bun run check\`) -->`;

const familyDoc = (f: Family): string => {
  const components: string[] = [];
  const values: string[] = [];
  const types: string[] = [];
  for (const name of f.names) {
    const body = renderExport(name);
    if (!body) continue;
    if (body.startsWith("### ")) components.push(body);
    else if (body.startsWith("`") && !body.includes(" — type")) values.push(`- ${body}`);
    else types.push(`- ${body}`);
  }
  const sections = [
    components.join("\n\n"),
    values.length ? `### Other exports\n\n${values.join("\n")}` : "",
    types.length ? `### Types\n\n${types.join("\n")}` : "",
  ].filter(Boolean);
  return `${NOTICE}

# ${f.slug} — API (React, the parity reference)

Exports: ${f.names.map((n) => `\`${n}\``).join(", ")}

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, \`.el\` is the node); web-components as \`<zen-${f.slug}>\`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

${sections.join("\n\n")}
`;
};

const indexDoc = (list: Family[]): string =>
  `${NOTICE}

# zen-ui API index — which file has which export

One file per source family. Before using a component, read its file for the
real props; guessing prop names is how agents invent APIs.

${list
  .map((f) => `- [${f.slug}.md](${f.slug}.md) — ${f.names.map((n) => `\`${n}\``).join(", ")}`)
  .join("\n")}
`;

const familyList = [...families.values()].filter((f) => f.names.length > 0);
const apiFiles = new Map<string, string>();
for (const f of familyList) apiFiles.set(`${f.slug}.md`, familyDoc(f));
apiFiles.set("index.md", indexDoc(familyList));

/** Every api/ directory this generator owns: root skill + one per binding. */
const apiDirs = [
  resolve(root, "skills/zen-ui/references/api"),
  ...BINDINGS.map((b: { dir: string }) => resolve(root, b.dir, "skills/zen-ui/references/api")),
];

const check = process.argv.includes("--check");
let drift = 0;
const report = (ok: boolean, rel: string, why: string) => {
  if (!ok) drift++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${rel}${ok ? "" : `  (${why} — run \`bun run gen:skill-api\`)`}`);
};

for (const dir of apiDirs) {
  const relDir = dir.replace(`${root}/`, "");
  if (check) {
    let onDisk: string[] = [];
    try {
      onDisk = readdirSync(dir).filter((f) => f.endsWith(".md"));
    } catch {
      onDisk = [];
    }
    for (const [file, content] of apiFiles) {
      let current = "";
      try {
        current = readFileSync(resolve(dir, file), "utf8");
      } catch {
        current = "";
      }
      report(current === content, `${relDir}/${file}`, "stale");
    }
    for (const file of onDisk)
      if (!apiFiles.has(file)) report(false, `${relDir}/${file}`, "orphaned");
  } else {
    mkdirSync(dir, { recursive: true });
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".md")))
      if (!apiFiles.has(file)) rmSync(resolve(dir, file));
    for (const [file, content] of apiFiles) writeFileSync(resolve(dir, file), content);
    console.log(`  wrote ${relDir} (${apiFiles.size} files)`);
  }
}

if (check) {
  console.log(drift ? `\n${drift} FILE(S) OUT OF SYNC\n` : "\nall api references in sync\n");
  process.exit(drift ? 1 : 0);
}

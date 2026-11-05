/**
 * Prop parity, as a check. `check:parity` compares what each binding EXPORTS;
 * it cannot see a missing PROP, which is how vanilla's DataTable went without
 * 27 of React's and Solid's props (column visibility, filters, grouping…)
 * through releases that called the bindings level.
 *
 * For every `export interface XxxProps` declared in more than one binding, it
 * compares the members. A member one binding has and another lacks is a gap,
 * unless it is in KNOWN below. KNOWN may only shrink:
 *
 *   - a gap not in KNOWN fails (a new prop that skipped a binding);
 *   - an entry in KNOWN that is no longer a gap fails too (it was closed:
 *     delete the line, so the list stays the truth).
 *
 * What is NOT a gap, and is normalised away:
 *   - React's `className` is Solid's and vanilla's `class` (and any
 *     `fooClassName` their `fooClass`);
 *   - `class`, `id`, `style`, `children` count as present everywhere: most
 *     interfaces inherit them (vanilla BaseProps, Solid JSX attributes, React
 *     ComponentProps), and an inherited member is invisible to this parser;
 *   - `ref`, `asChild`: React-only mechanics.
 *
 * Two things the parser cannot judge, so it does not:
 *   - an interface that extends a COMPONENT's props (React's
 *     `ComponentPropsWithoutRef<typeof RadixSlider.Root>`, Kobalte's) inherits
 *     members it cannot see, so that binding is never counted as lacking one.
 *     Bases that only add DOM attributes (BaseProps, HTMLAttributes) are fine;
 *   - a member only vanilla declares (Splitter's `panels`, a factory's `items`)
 *     is its data-driven idiom (CLAUDE.md), not a gap in the others.
 *
 * Web components are not compared: they re-export vanilla's types verbatim.
 * The parser reads top-level members (two-space indent) of each interface
 * body. Measure, then add to KNOWN with a reason.
 *
 *   bun run check:props
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BINDINGS = [
  { id: "react", dir: "packages/react/src/components" },
  { id: "solid", dir: "packages/solid/src/components" },
  { id: "vanilla", dir: "packages/vanilla/src/components" },
] as const;
type Binding = (typeof BINDINGS)[number]["id"];

/** React's `className` / `triggerClassName` are the others' `class` / `triggerClass`. */
const rename = (m: string): string => (m === "className" ? "class" : m.replace(/ClassName$/, "Class"));
const ALWAYS = new Set(["class", "id", "style", "children", "ref", "asChild"]);

/**
 * Known gaps: "Interface.member": binding(s) that LACK it, and why. Each line
 * is debt with a home: closing it means deleting the line.
 */
const KNOWN: Record<string, string> = {
  // docs/vanilla-data-table.md, phases 2-5 (phase 1, columns, closed these:
  // visibility, ordering, resizing, pinning, persistKey).
  ...Object.fromEntries(
    [
      "enablePerColumnFilters", "enableFilterOperators", "columnFilters", "onColumnFiltersChange", "manualFiltering",
      "manualSorting",
      "renderSubRow", "expanded", "onExpandedChange",
      "enableGrouping", "grouping", "initialGrouping", "onGroupingChange",
      "enableExport", "exportOnlySelected", "renderBulkActions",
    ].map((m) => [`DataTableProps.${m}`, "vanilla"]),
  ),
  // TreeTable's controlled state, never ported to vanilla.
  ...Object.fromEntries(
    ["expanded", "globalFilter", "onGlobalFilterChange", "sorting", "onSortingChange", "rowSelection", "rowClass"].map(
      (m) => [`TreeTableProps.${m}`, "vanilla"],
    ),
  ),
  // Divergences between React and Solid, found by this check's first run.
  "RichTextProps.math": "solid vanilla",
  "RichTextProps.onImageUpload": "solid vanilla",
  "CodeEditorProps.loading": "solid",
  "CodeEditorProps.loaderConfig": "react",
  "PivotFilterMenuProps.onSort": "react vanilla",
  "PivotFilterMenuProps.sortDirection": "react vanilla",
  "PivotFieldChipProps.dragHandleProps": "solid",
  "DirectionProviderProps.locale": "react vanilla",
  // Vanilla dialogs open through their handle (`.open()`), not a prop: idiom.
  "SelectDialogProps.open": "vanilla",
  "ViewSettingsDialogProps.open": "vanilla",
};

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? files(join(dir, e.name))
      : /\.tsx?$/.test(e.name) && !/Demo\.tsx?$/.test(e.name) && !e.name.endsWith(".d.ts")
        ? [join(dir, e.name)]
        : [],
  );

/** A base that only adds DOM attributes, whose members never matter here. */
const DOM_BASE = /^(?:BaseProps|(?:React\.|JSX\.)?\w*HTMLAttributes<[^>]*>|Omit<|Pick<|Partial<|[,\s])/;
const extendsComponent = (clause: string): boolean =>
  clause
    .split(/,(?![^<]*>)/)
    .map((p) => p.trim())
    .filter(Boolean)
    .some((part) => /ComponentProps|typeof|PolymorphicProps/.test(part) || !DOM_BASE.test(part));

interface Iface {
  members: Set<string>;
  /** Extends something whose members the parser cannot see. */
  open: boolean;
}

/** interface name -> its top-level members, for one binding. */
function interfaces(dir: string): Map<string, Iface> {
  const out = new Map<string, Iface>();
  for (const file of files(dir)) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/export interface (\w+Props)\b([^{]*)\{/g)) {
      const ext = /\bextends\b([\s\S]*)$/.exec(m[2])?.[1] ?? "";
      let depth = 0;
      let k = m.index! + m[0].length - 1;
      const start = k;
      for (; k < src.length; k++) {
        if (src[k] === "{") depth++;
        else if (src[k] === "}" && --depth === 0) break;
      }
      const body = src.slice(start, k);
      const iface = out.get(m[1]) ?? { members: new Set<string>(), open: false };
      // Members on their own lines; a one-line body (`{ size?: AvatarSize }`)
      // has them after the brace or a semicolon instead.
      const member = body.includes("\n") ? /^ {2}(\w+)\??\s*[:(]/gm : /[{;]\s*(\w+)\??\s*[:(]/g;
      for (const mm of body.matchAll(member)) iface.members.add(rename(mm[1]!));
      if (ext && extendsComponent(ext)) iface.open = true;
      out.set(m[1], iface);
    }
  }
  return out;
}

const byBinding = new Map(BINDINGS.map((b) => [b.id, interfaces(b.dir)]));
const names = new Set([...byBinding.values()].flatMap((m) => [...m.keys()]));

/** "Interface.member" -> the bindings that lack it (sorted, space-joined). */
const gaps = new Map<string, string>();
let compared = 0;
for (const name of [...names].sort()) {
  const present = BINDINGS.filter((b) => byBinding.get(b.id)!.has(name));
  if (present.length < 2) continue;
  compared++;
  const of = (b: (typeof BINDINGS)[number]) => byBinding.get(b.id)!.get(name)!;
  // Members React or Solid declare: a vanilla-only member is its idiom.
  const all = new Set(present.filter((b) => b.id !== "vanilla").flatMap((b) => [...of(b).members]));
  for (const member of [...all].sort()) {
    if (ALWAYS.has(member)) continue;
    const lacking = present.filter((b) => !of(b).open && !of(b).members.has(member)).map((b) => b.id as Binding);
    if (lacking.length) gaps.set(`${name}.${member}`, lacking.sort().join(" "));
  }
}

let f = 0;
const fail = (msg: string) => {
  f++;
  console.log(`  FAIL ${msg}`);
};
for (const [key, lacking] of gaps) {
  if (!(key in KNOWN)) fail(`${key.padEnd(48)} missing in ${lacking} (new gap: port it, or add it to KNOWN with a reason)`);
  else if (KNOWN[key] !== lacking) fail(`${key.padEnd(48)} missing in ${lacking}, KNOWN says ${KNOWN[key]} (update the line)`);
}
for (const key of Object.keys(KNOWN)) {
  if (!gaps.has(key)) fail(`${key.padEnd(48)} is no longer a gap: delete it from KNOWN`);
}

console.log(`compared ${compared} props interfaces declared in two or more bindings`);
console.log(`known gaps: ${Object.keys(KNOWN).length} (${[...gaps.keys()].filter((k) => k.startsWith("DataTableProps.")).length} in DataTable)`);
if (compared === 0) fail("compared nothing: the parser found no interfaces (a zero-denominator pass is not a pass)");
console.log(f ? `\n${f} FAILED` : "\nall passed");
process.exit(f ? 1 : 0);

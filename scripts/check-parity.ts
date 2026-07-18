/**
 * Binding parity, as a check rather than a paragraph.
 *
 * CLAUDE.md's parity section has been wrong twice: it claimed "React 219, Solid
 * 204" (both roughly half the real count, because the number came from grepping
 * single-line `export {` lines) and "the only gap is Toast" (Select diverges the
 * same way). A number in a doc is a number nobody re-measures.
 *
 * So this measures. It asserts the two things that are actually rules:
 *
 *  1. A COMPONENT in one binding exists in the other. CLAUDE.md: "a component
 *     that exists only in React is a bug, not a roadmap item."
 *  2. A prop type that EXISTS is EXPORTED. A component whose props cannot be
 *     named is hard to wrap, extend, or store in a variable — the pivot shipped
 *     exactly this and `loadMembers` was untypable by a consumer.
 *
 * It deliberately does NOT assert that the two export identical name sets. They
 * do not, and should not: React types its Radix wrappers with
 * ComponentPropsWithoutRef rather than named interfaces, so ~27 Solid `*Props`
 * types have no React equivalent to export. That is a difference between Radix
 * and Kobalte, not a gap. The known DESIGN divergences are listed below and are
 * decisions, not debt.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { BINDINGS, REFERENCE } from "./bindings.mjs";

let f = 0;
const t = (ok: boolean, name: string, detail = "") => {
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(52)} ${ok ? "" : detail}`);
};

/** Every name a package root exports. */
const exportedNames = (file: string): Set<string> => {
  const src = readFileSync(file, "utf8");
  const names = new Set<string>();
  for (const m of src.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const raw of m[1].split(",")) {
      const name = raw.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()?.trim();
      if (name) names.add(name);
    }
  }
  return names;
};

/** Does a type of this name exist anywhere in the binding's components? */
const typeExists = (pkg: string, name: string): boolean => {
  try {
    return (
      execSync(`grep -rlE "\\b(interface|type) ${name}\\b" packages/${pkg}/src/components 2>/dev/null | head -1`, {
        encoding: "utf8",
      }).trim().length > 0
    );
  } catch {
    return false;
  }
};

/** Every binding's public surface, measured. */
const surfaces = new Map(BINDINGS.map((b) => [b.id, exportedNames(`${b.dir}/src/index.ts`)]));
const react = surfaces.get("react")!;
const solid = surfaces.get("solid")!;

console.log("\nexport counts (measured, not remembered)");
for (const b of BINDINGS) {
  console.log(`       ${b.label.padEnd(8)} ${surfaces.get(b.id)!.size} names`);
}
// One floor for every binding — vanilla is a full binding now, not a slice.
for (const b of BINDINGS) {
  const n = surfaces.get(b.id)!.size;
  t(n > 400, `${b.id}: root exports a full surface`, `only ${n}, want > 400`);
}

console.log("\nevery type that EXISTS is EXPORTED");
// Any type, not just *Props. MapMarker was the proof: it exists in both
// bindings, Solid never exported it, and a check that only looked at names
// ending in "Props" would never have said so.
for (const [pkg, mine, theirs] of [
  ["react", react, solid],
  ["solid", solid, react],
] as const) {
  const missing = [...theirs].filter((n) => /^[A-Z]/.test(n) && !mine.has(n)).filter((n) => typeExists(pkg, n));
  t(
    missing.length === 0,
    `${pkg}: no type is defined but unexported`,
    `${missing.join(", ")} exist in ${pkg} and are not exported`,
  );
}

console.log("\ncomponents exist in every FULL binding");
// A component, not a type: exported, capitalised, not a *Props / *Variants.
const componentish = (names: Set<string>) =>
  new Set(
    [...names].filter(
      (n) => /^[A-Z]/.test(n) && !n.endsWith("Props") && !n.endsWith("Variants") && !n.endsWith("Type"),
    ),
  );

/**
 * Known DESIGN divergences — decisions, not debt. Each is a place the two
 * upstream libraries disagree and converging would mean picking a loser:
 *  - Toast:  React wraps Radix Toast primitives; Solid uses solid-toast.
 *  - Select: React exposes Radix's compound parts; Solid takes `options`.
 *  - Tooltip/Sidebar providers, and Solid's polymorphic helpers, likewise.
 * Adding a name here is a claim that convergence is a product decision. Do not
 * use it to silence a component that is merely missing.
 */
const DIVERGENT = new Set([
  "Toast", "ToastAction", "ToastClose", "ToastDescription", "ToastProvider",
  "ToastTitle", "ToastViewport", "useToast", "ToastDescriptor", "ToastInput",
  "SelectContent", "SelectGroup", "SelectItem", "SelectLabel", "SelectSeparator",
  "SelectTrigger", "SelectValue", "SelectScrollUpButton", "SelectScrollDownButton",
  "TooltipProvider", "PopoverClose", "PopoverPortal", "SelectOption",
  "CellEditPayload", "CommandFilter", "EditVariant", "FilterVariant",
  "NumberFilterValue", "NumberOp", "NumberRangeFilterValue", "TextFilterValue",
  "TextOp", "defaultFilter", "cn",
]);

/**
 * Compared against the REFERENCE binding rather than pairwise. With two bindings
 * those are the same thing; with three, pairwise means N² arguments about which
 * one is right, and the answer is always React.
 *
 * Every binding is held to the full rule — CLAUDE.md's "a component that exists
 * only in React is a bug, not a roadmap item". vanilla used to carry a `partial`
 * flag that skipped it here while it was an 8-component slice; dropping that flag
 * from bindings.mjs was the decision to hold it to the same parity as Solid.
 */
const ref = componentish(surfaces.get(REFERENCE.id)!);
for (const b of BINDINGS) {
  if (b.id === REFERENCE.id) continue;
  // A binding may declare its OWN divergences in bindings.mjs, unioned with the
  // global set. This is where a structurally-different binding records that it
  // does not mirror the reference's API name-for-name. The vanilla binding is
  // data-driven (no framework, so no context to power compound children): it has
  // every component FAMILY but exposes them as factories taking data + returning
  // a handle, not as compound parts. So React's `AccordionContent` has no vanilla
  // twin, and vanilla's `AccordionItemSpec` / `DialogHandle` have no React twin —
  // the same class of decision as Solid's data-driven Select, and recorded the
  // same way. See PORTING.md.
  const divergent = new Set([...DIVERGENT, ...((b as { divergent?: string[] }).divergent ?? [])]);
  const mine = componentish(surfaces.get(b.id)!);
  const onlyRef = [...ref].filter((n) => !mine.has(n) && !divergent.has(n)).sort();
  const onlyMine = [...mine].filter((n) => !ref.has(n) && !divergent.has(n)).sort();
  t(onlyRef.length === 0, `no component exists only in ${REFERENCE.label}`, onlyRef.join(", "));
  t(onlyMine.length === 0, `no component exists only in ${b.label}`, onlyMine.join(", "));
}

console.log("\nthe demos match too");
const navPaths = (file: string, key: "to" | "path"): Set<string> => {
  const src = readFileSync(file, "utf8");
  return new Set([...src.matchAll(new RegExp(`${key}:\\s*"([^"]+)"`, "g"))].map((m) => m[1]));
};
const rNav = navPaths("packages/react/src/nav.ts", "to");
const sNav = navPaths("packages/solid/src/nav.ts", "path");
// Routes are allowed to differ where a component genuinely does not exist, but
// a big divergence means the demos have drifted, which is how the catalogue got
// 16 entries out of date before.
const shared = [...rNav].filter((p) => sNav.has(p)).length;
t(shared > 40, `the two demos share ${shared} routes`, `only ${shared} in common`);

console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);

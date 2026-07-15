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

const react = exportedNames("packages/react/src/index.ts");
const solid = exportedNames("packages/solid/src/index.ts");

console.log("\nexport counts (measured, not remembered)");
console.log(`       React ${react.size} names, Solid ${solid.size}`);
t(react.size > 400 && solid.size > 400, "both roots export a full surface");

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

console.log("\ncomponents exist in both bindings");
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

const rc = componentish(react);
const sc = componentish(solid);
const onlyReact = [...rc].filter((n) => !sc.has(n) && !DIVERGENT.has(n)).sort();
const onlySolid = [...sc].filter((n) => !rc.has(n) && !DIVERGENT.has(n)).sort();

t(onlyReact.length === 0, "no component exists only in React", onlyReact.join(", "));
t(onlySolid.length === 0, "no component exists only in Solid", onlySolid.join(", "));

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

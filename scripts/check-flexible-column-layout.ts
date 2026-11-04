/**
 * FlexibleColumnLayout column contract.
 *
 *   bun run check:flexible-column-layout
 *
 * The pure half of FlexibleColumnLayout: which columns render at each container
 * tier, and how wide. All four bindings call it. The invariant every case
 * re-checks is that the rendered shares fill the row exactly — the bug this
 * check was written for drew a three-column layout with no start column at
 * three quarters of the width, the last quarter blank.
 */
import {
  resolveFlexibleColumns,
  flexibleColumnsForWidth,
  flexibleColumnShare,
  FLEXIBLE_COLUMN_ORDER,
  type FlexibleColumnLayoutType,
  type FlexibleColumnName,
  type FlexibleColumnShare,
} from "../packages/core/src/flexible-column-layout";

let failed = 0;
let checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g !== w) { failed++; console.error(`FAIL ${label}\n  got  ${g}\n  want ${w}`); }
};

const VALUE: Record<FlexibleColumnShare, number> = { full: 1, "2/3": 2 / 3, "1/2": 1 / 2, "1/3": 1 / 3, "1/4": 1 / 4 };
const all = { start: true, mid: true, end: true };
const without = (...gone: FlexibleColumnName[]) =>
  Object.fromEntries(FLEXIBLE_COLUMN_ORDER.map((n) => [n, !gone.includes(n)])) as Record<FlexibleColumnName, boolean>;
const cols = (layout: FlexibleColumnLayoutType, tier: 1 | 2 | 3, present = all) =>
  resolveFlexibleColumns(layout, tier, present).map((c) => `${c.name}:${c.share}`);

// --- tiers from the container's width
eq("width 0 → 1", flexibleColumnsForWidth(0), 1);
eq("width 599 → 1", flexibleColumnsForWidth(599), 1);
eq("width 600 → 2", flexibleColumnsForWidth(600), 2);
eq("width 899 → 2", flexibleColumnsForWidth(899), 2);
eq("width 900 → 3", flexibleColumnsForWidth(900), 3);
eq("width 4000 → 3", flexibleColumnsForWidth(4000), 3);

// --- every column present: unchanged from the tables the bindings carried
eq("OneColumn", cols("OneColumn", 3), ["start:full"]);
eq("TwoColumnsBeginExpanded", cols("TwoColumnsBeginExpanded", 3), ["start:2/3", "mid:1/3"]);
eq("TwoColumnsMidExpanded", cols("TwoColumnsMidExpanded", 3), ["start:1/3", "mid:2/3"]);
eq("ThreeColumnsMidExpanded", cols("ThreeColumnsMidExpanded", 3), ["start:1/4", "mid:1/2", "end:1/4"]);
eq("ThreeColumnsEndExpanded", cols("ThreeColumnsEndExpanded", 3), ["start:1/4", "mid:1/4", "end:1/2"]);
eq("MidColumnFullScreen", cols("MidColumnFullScreen", 3), ["mid:full"]);
eq("EndColumnFullScreen", cols("EndColumnFullScreen", 3), ["end:full"]);
eq("tier 2 drops start", cols("ThreeColumnsMidExpanded", 2), ["mid:2/3", "end:1/3"]);
eq("tier 2 end expanded", cols("ThreeColumnsEndExpanded", 2), ["mid:1/3", "end:2/3"]);
eq("tier 2 two columns kept", cols("TwoColumnsMidExpanded", 2), ["start:1/3", "mid:2/3"]);
eq("tier 1 shows the last of three", cols("ThreeColumnsEndExpanded", 1), ["end:full"]);
eq("tier 1 shows the last of two", cols("TwoColumnsBeginExpanded", 1), ["mid:full"]);

// --- absent columns give their room to the others, keeping proportion
eq("three, no start, mid expanded", cols("ThreeColumnsMidExpanded", 3, without("start")), ["mid:2/3", "end:1/3"]);
eq("three, no start, end expanded", cols("ThreeColumnsEndExpanded", 3, without("start")), ["mid:1/3", "end:2/3"]);
eq("three, no end, mid expanded", cols("ThreeColumnsMidExpanded", 3, without("end")), ["start:1/3", "mid:2/3"]);
eq("three, no end, end expanded", cols("ThreeColumnsEndExpanded", 3, without("end")), ["start:1/2", "mid:1/2"]);
eq("three, no mid", cols("ThreeColumnsMidExpanded", 3, without("mid")), ["start:1/2", "end:1/2"]);
eq("three, mid only", cols("ThreeColumnsEndExpanded", 3, without("start", "end")), ["mid:full"]);
eq("two, no start", cols("TwoColumnsMidExpanded", 3, without("start")), ["mid:full"]);
eq("two, no mid", cols("TwoColumnsBeginExpanded", 3, without("mid")), ["start:full"]);
eq("tier 1, last absent, falls back", cols("ThreeColumnsMidExpanded", 1, without("end")), ["mid:full"]);
eq("nothing present", cols("ThreeColumnsMidExpanded", 3, without("start", "mid", "end")), []);
eq("tier 1, nothing present", cols("OneColumn", 1, without("start")), []);

// --- the row is always filled, at every layout, tier and presence
const LAYOUTS: FlexibleColumnLayoutType[] = [
  "OneColumn", "TwoColumnsBeginExpanded", "TwoColumnsMidExpanded", "ThreeColumnsMidExpanded",
  "ThreeColumnsEndExpanded", "MidColumnFullScreen", "EndColumnFullScreen",
];
let combos = 0;
for (const layout of LAYOUTS) {
  for (const tier of [1, 2, 3] as const) {
    for (let mask = 0; mask < 8; mask++) {
      const present = { start: !!(mask & 1), mid: !!(mask & 2), end: !!(mask & 4) };
      const out = resolveFlexibleColumns(layout, tier, present);
      combos++;
      if (!out.length) continue;
      const sum = out.reduce((s, c) => s + VALUE[c.share], 0);
      eq(`${layout} tier ${tier} mask ${mask} fills the row`, Math.abs(sum - 1) < 1e-9, true);
      eq(`${layout} tier ${tier} mask ${mask} renders only present columns`, out.every((c) => present[c.name]), true);
    }
  }
}

// --- a share with no token throws rather than rendering an unsized column
let threw = false;
try { flexibleColumnShare(0.4); } catch { threw = true; }
eq("unknown share throws", threw, true);

if (failed) {
  console.error(`\ncheck:flexible-column-layout — ${failed} of ${checked} failed`);
  process.exit(1);
}
console.log(`check:flexible-column-layout — ${checked} assertions passed (${combos} layout × tier × presence combinations)`);

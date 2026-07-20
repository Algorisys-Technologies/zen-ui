/**
 * Reading-direction contract.
 *
 *   bun run check:direction
 *
 * `horizontalStep` decides what ArrowLeft and ArrowRight MEAN, which is the
 * single piece of RTL behaviour zen-ui's own components get wrong when it is
 * absent. The 2026-07-20 RTL audit found 59 sites across three bindings
 * hardcoding `key === "ArrowRight"` as "next" — correct in English, backwards
 * in Arabic and Hebrew, and invisible to every build, lint and screenshot.
 *
 * It is pure logic, so it is cheap to pin. The cases below are the ones a
 * refactor is most likely to break: the RTL inversion itself, and the rule that
 * VERTICAL arrows never flip (up and down mean the same thing in every reading
 * direction — a component treating ArrowDown as "next" is already right).
 */
import { horizontalStep, type Direction } from "../packages/core/src/direction";

let fails = 0;
const check = (got: number, want: number, name: string) => {
  const ok = got === want;
  if (!ok) fails++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(46)}${ok ? "" : `\n       got ${got}, want ${want}`}`,
  );
};

console.log("\nhorizontalStep — which way is forward\n");

console.log("  ltr: right is forward");
check(horizontalStep("ArrowRight", "ltr"), 1, "ArrowRight advances");
check(horizontalStep("ArrowLeft", "ltr"), -1, "ArrowLeft goes back");

console.log("  rtl: LEFT is forward — the whole point");
check(horizontalStep("ArrowLeft", "rtl"), 1, "ArrowLeft advances");
check(horizontalStep("ArrowRight", "rtl"), -1, "ArrowRight goes back");

console.log("  vertical arrows never flip");
for (const dir of ["ltr", "rtl"] as Direction[]) {
  check(horizontalStep("ArrowUp", dir), 0, `ArrowUp is not horizontal (${dir})`);
  check(horizontalStep("ArrowDown", dir), 0, `ArrowDown is not horizontal (${dir})`);
}

console.log("  everything else is 0, so a caller can branch on truthiness");
for (const key of ["Enter", " ", "Home", "End", "Tab", "a", "ArrowRightExtra"]) {
  check(horizontalStep(key, "ltr"), 0, `${JSON.stringify(key)} is not a step`);
}

console.log("  the two directions are exact mirrors");
for (const key of ["ArrowLeft", "ArrowRight"]) {
  check(
    horizontalStep(key, "ltr") + horizontalStep(key, "rtl"),
    0,
    `${key} inverts between ltr and rtl`,
  );
}

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);

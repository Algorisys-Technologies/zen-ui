/**
 * Scan contract.
 *
 *   bun run check:scan
 *
 * The pure half of ScanInput. A USB barcode scanner is a keyboard: it "types"
 * the code as a burst of keystrokes a few milliseconds apart, usually ending in
 * Enter. Telling that from a person typing is a matter of timing:
 *
 *  - A scan is at least `minLength` characters with every gap between them at
 *    most `maxGapMs`. A person cannot sustain 35 ms per key; a scanner never
 *    gets near it.
 *  - Editing (Backspace, Delete) makes it typed, whatever the speed.
 *  - Outside a focused field (a station listening for scans anywhere), stray
 *    keystrokes must not leak into the next scan: a gap longer than
 *    `maxGapMs` starts a new buffer.
 *  - Scanners configured with no suffix send no Enter: a buffer that has gone
 *    quiet is flushed as a scan if it qualifies.
 */
import { classifyEntry, createScanBuffer, DEFAULT_SCAN_OPTIONS } from "../packages/core/src/scan";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};
const keys = (text: string, gap: number, start = 0) => [...text].map((key, i) => ({ key, at: start + i * gap }));

console.log("\ndefaults");
t(DEFAULT_SCAN_OPTIONS, { maxGapMs: 35, minLength: 4, terminators: ["Enter"] }, "35 ms per key, 4 characters, Enter");

console.log("\nclassifyEntry — a field the operator may type in or scan into");
t(classifyEntry(keys("4006381333931", 8)), "scanner", "13 digits 8 ms apart: a scanner");
t(classifyEntry(keys("4006381333931", 120)), "keyboard", "the same 120 ms apart: a person");
t(classifyEntry(keys("ABC", 5)), "keyboard", "too short to call a scan");
t(classifyEntry([...keys("40063813", 8), { key: "x", at: 300 }, ...keys("33931", 8, 310)]), "keyboard", "one slow gap anywhere: typed");
t(classifyEntry([...keys("40063813", 8), { key: "Backspace", at: 72 }, ...keys("3", 8, 80)]), "keyboard", "editing makes it typed, however fast");
t(classifyEntry([{ key: "Shift", at: 0 }, ...keys("AB12CD", 6, 2)]), "scanner", "modifier keys are not characters and do not count");
t(classifyEntry([]), "keyboard", "nothing at all is not a scan");

console.log("\ncreateScanBuffer — listening for scans anywhere");
const b = createScanBuffer();
const feed = (buf: ReturnType<typeof createScanBuffer>, evs: { key: string; at: number }[]) =>
  evs.map((e) => buf.push(e.key, e.at)).filter((x) => x !== null);
t(feed(b, [...keys("WO-10042", 7), { key: "Enter", at: 7 * 8 }]), ["WO-10042"], "a burst ending in Enter is a scan");
t(feed(b, [...keys("hello", 150, 1000), { key: "Enter", at: 1800 }]), [], "slow typing ending in Enter is not");
t(
  feed(b, [{ key: "q", at: 5000 }, ...keys("LOT-77", 6, 5400), { key: "Enter", at: 5440 }]),
  ["LOT-77"],
  "a stray key long before the burst does not leak into it",
);
t(feed(b, [...keys("AB", 5, 7000), { key: "Enter", at: 7010 }]), [], "a burst shorter than minLength is not a scan");
t(
  feed(b, [...keys("PSN-9", 6, 8000), { key: "Backspace", at: 8030 }, ...keys("1", 6, 8036), { key: "Enter", at: 8042 }]),
  [],
  "a burst with an edit in it is not a scan",
);
const tab = createScanBuffer({ terminators: ["Tab"] });
t(feed(tab, [...keys("X1234", 6, 0), { key: "Tab", at: 30 }]), ["X1234"], "a scanner configured to end with Tab");
t(feed(tab, [...keys("X1234", 6, 100), { key: "Enter", at: 130 }]), [], "…and then Enter is not its terminator");

console.log("\nflush — scanners with no suffix");
const quiet = createScanBuffer({ terminators: [] });
t(feed(quiet, keys("9783161484100", 5, 0)), [], "nothing ends the burst by itself");
t(quiet.flush(60 + 10), null, "still inside the gap: not finished yet");
t(quiet.flush(60 + 36), "9783161484100", "quiet for longer than the gap: flushed as a scan");
t(quiet.flush(500), null, "and only once");
t(quiet.pending(), false, "nothing pending after a flush");
feed(quiet, keys("ab", 200, 1000));
t(quiet.flush(2000), null, "a slow fragment is dropped, not flushed");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);

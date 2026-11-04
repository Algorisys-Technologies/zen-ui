/**
 * QRCode and Barcode contract.
 *
 *   bun run check:barcode
 *
 * Every symbol drawn here is FOUND AND DECODED by zxing-cpp (zxing-wasm, a dev
 * dependency of the check only, never shipped), the reader engine much
 * production scanning runs on: a symbol that reads back as anything but its
 * input fails, and so does one it cannot locate in the image. Reading back with
 * this module's own logic would prove only that it agrees with itself.
 *
 * Not ZXing-js: its detector misses about one large symbol in eight from ANY
 * encoder (measured: the qrcode package's bit-identical grids failed on exactly
 * the same 27 of 203), where zxing-cpp finds all of them.
 *
 * Covered: every QR version 1–40 at every level, at the exact capacity edge
 * (the most that fits in version v, and one more character must not); all
 * eight masks; numeric, alphanumeric and byte modes, UTF-8 included; Code 128
 * through all three code sets and their switches; EAN-13 with every leading
 * digit; Code 39's whole alphabet. Plus the structure the reader cannot
 * report: sizes, tables, error cases.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { prepareZXingModule, readBarcodes, type ReadInputBarcodeFormat } from "zxing-wasm/reader";
import {
  encodeQr, encodeBarcode, qrDataCodewords, qrRawModules, qrAlignmentPositions, qrPath,
  eanCheckDigit, code128Values, CODE128_PATTERNS, CODE39_PATTERNS, type QrEcc, type BarcodeFormat,
} from "../packages/core/src/barcode";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; if (failed <= 30) console.error(`FAIL ${label}: got ${JSON.stringify(got)?.slice(0, 200)}, want ${JSON.stringify(want)?.slice(0, 200)}`); }
};

// --- Rendering to an image zxing-cpp can read ------------------------------------

await prepareZXingModule({
  overrides: { wasmBinary: readFileSync(createRequire(import.meta.url).resolve("zxing-wasm/reader/zxing_reader.wasm")) },
  fireImmediately: true,
});
type Img = { data: Uint8ClampedArray; width: number; height: number; colorSpace: "srgb" };
const image = (w: number, h: number, dark: (x: number, y: number) => boolean): Img => {
  const data = new Uint8ClampedArray(w * h * 4).fill(255);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (dark(x, y)) { const i = (y * w + x) * 4; data[i] = data[i + 1] = data[i + 2] = 0; }
  return { data, width: w, height: h, colorSpace: "srgb" };
};
async function read(img: Img, format: ReadInputBarcodeFormat): Promise<string> {
  const [r] = await readBarcodes(img as unknown as ImageData, { formats: [format], tryHarder: false, textMode: "Plain" });
  return r ? r.text : "<not found>";
}
/** A QR symbol at 3 px a module with its 4-module quiet zone, found and read as a camera frame would be. */
function readQr(modules: boolean[][]): Promise<string> {
  const scale = 3, quiet = 4, n = (modules.length + quiet * 2) * scale;
  return read(image(n, n, (x, y) => modules[Math.floor(y / scale) - quiet]?.[Math.floor(x / scale) - quiet] === true), "QRCode");
}
function readLinear(widths: number[], format: BarcodeFormat, scale = 2): Promise<string> {
  const quiet = 12, total = widths.reduce((a, b) => a + b, 0) + quiet * 2;
  const dark = new Array<boolean>(total).fill(false);
  let x = quiet;
  widths.forEach((w, i) => { if (i % 2 === 0) dark.fill(true, x, x + w); x += w; });
  return read(image(total * scale, 24, (px) => dark[Math.floor(px / scale)]), format === "code128" ? "Code128" : format === "ean13" ? "EAN-13" : "Code39");
}

// --- QR: structure -------------------------------------------------------------

eq("raw modules v1", qrRawModules(1), 208);
eq("raw modules v7", qrRawModules(7), 1568);
eq("raw modules v40", qrRawModules(40), 29648);
// Published data capacities (codewords) for a few versions, by level.
eq("data codewords v1", ["L", "M", "Q", "H"].map((e) => qrDataCodewords(1, e as QrEcc)), [19, 16, 13, 9]);
eq("data codewords v10", ["L", "M", "Q", "H"].map((e) => qrDataCodewords(10, e as QrEcc)), [274, 216, 154, 122]);
eq("data codewords v40", ["L", "M", "Q", "H"].map((e) => qrDataCodewords(40, e as QrEcc)), [2956, 2334, 1666, 1276]);
eq("alignment v1", qrAlignmentPositions(1), []);
eq("alignment v2", qrAlignmentPositions(2), [6, 18]);
eq("alignment v7", qrAlignmentPositions(7), [6, 22, 38]);
eq("alignment v32", qrAlignmentPositions(32), [6, 34, 60, 86, 112, 138]);
eq("alignment v40", qrAlignmentPositions(40), [6, 30, 58, 86, 114, 142, 170]);
// Published character capacities: v1-L numeric 41, alnum 25, byte 17; v40-L byte 2953; v40-H numeric 3057.
const fits = (text: string, ecc: QrEcc, v: number) => { const r = encodeQr(text, { ecc }); return r.ok && r.version === v; };
eq("v1-L holds 41 digits, not 42", [fits("1".repeat(41), "L", 1), fits("1".repeat(42), "L", 2)], [true, true]);
eq("v1-L holds 25 alphanumerics", [fits("A".repeat(25), "L", 1), fits("A".repeat(26), "L", 2)], [true, true]);
eq("v1-L holds 17 bytes", [fits("a".repeat(17), "L", 1), fits("a".repeat(18), "L", 2)], [true, true]);
eq("v40-L holds 2953 bytes, not 2954", [fits("a".repeat(2953), "L", 40), encodeQr("a".repeat(2954), { ecc: "L" }).ok], [true, false]);
eq("v40-H holds 3057 digits", fits("7".repeat(3057), "H", 40), true);
const tooLong = encodeQr("a".repeat(3000), { ecc: "M" });
eq("too long is an error, not a symbol", tooLong.ok ? "symbol" : /too long/.test(tooLong.error), true);

// --- QR: format and version words, against the standard's tables ----------------
// A reader corrects a wrong bit or two in these (they are BCH-coded), so a decode
// round trip cannot see a broken format word: read them out of the symbol and
// compare with ISO/IEC 18004 Annex C/D. Both copies.
const FORMAT_WORDS: Record<QrEcc, number[]> = {
  L: [0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976],
  M: [0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0],
  Q: [0x355f, 0x3068, 0x3f31, 0x3a06, 0x24b4, 0x2183, 0x2eda, 0x2bed],
  H: [0x1689, 0x13be, 0x1ce7, 0x19d0, 0x0762, 0x0255, 0x0d0c, 0x083b],
};
const formatCopies = (m: boolean[][]) => {
  const size = m.length;
  const at = (x: number, y: number) => (m[y][x] ? 1 : 0);
  const first: number[] = [], second: number[] = [];
  for (let i = 0; i <= 5; i++) first[i] = at(8, i);
  first[6] = at(8, 7); first[7] = at(8, 8); first[8] = at(7, 8);
  for (let i = 9; i < 15; i++) first[i] = at(14 - i, 8);
  for (let i = 0; i < 8; i++) second[i] = at(size - 1 - i, 8);
  for (let i = 8; i < 15; i++) second[i] = at(8, size - 15 + i);
  const word = (b: number[]) => b.reduce((w, bit, i) => w | (bit << i), 0);
  return [word(first), word(second), at(8, size - 8)];
};
for (const ecc of ["L", "M", "Q", "H"] as QrEcc[]) {
  for (let mask = 0; mask < 8; mask++) {
    const r = encodeQr("FORMAT", { ecc, mask });
    eq(`format word ${ecc} mask ${mask}, both copies, and the dark module`, r.ok ? formatCopies(r.modules) : null, [FORMAT_WORDS[ecc][mask], FORMAT_WORDS[ecc][mask], 1]);
  }
}
// Version words (Annex D) for v7, v8, v21 and v40; both blocks.
const VERSION_WORDS: Record<number, number> = { 7: 0x07c94, 8: 0x085bc, 21: 0x15683, 40: 0x28c69 };
for (const [v, want] of Object.entries(VERSION_WORDS)) {
  const r = encodeQr("V", { minVersion: Number(v) });
  if (!r.ok) continue;
  const size = r.modules.length;
  let a = 0, b = 0;
  for (let i = 0; i < 18; i++) {
    const p = size - 11 + (i % 3), q = Math.floor(i / 3);
    a |= (r.modules[q][p] ? 1 : 0) << i; // top right
    b |= (r.modules[p][q] ? 1 : 0) << i; // bottom left
  }
  eq(`version word v${v}, both blocks`, [a, b], [want, want]);
}

// --- QR: decoded, at every version and level, at the capacity edge ---------------

const LEVELS: QrEcc[] = ["L", "M", "Q", "H"];
// Byte text with variety (so masks and blocks get exercised): a JSON-ish e-invoice fragment, repeated.
const SEED = '{"SellerGstin":"27AAACR5055K1Z7","DocNo":"SI/26/0042","DocDt":"04/11/2026","TotInvVal":118000.5,"Irn":"b7f3c1"}';
const textOf = (n: number) => SEED.repeat(Math.ceil(n / SEED.length)).slice(0, n);
let symbols = 0;
// The most bytes a version holds: 4 mode bits and the count field, then 8 bits a byte.
const byteCapacity = (v: number, ecc: QrEcc) => Math.floor((qrDataCodewords(v, ecc) * 8 - 4 - (v <= 9 ? 8 : 16)) / 8);
for (const ecc of LEVELS) {
  for (let v = 1; v <= 40; v++) {
    // The edge: the most that fits is version v; one byte more is not.
    const n = byteCapacity(v, ecc);
    const over = encodeQr(textOf(n + 1), { ecc });
    eq(`QR ${ecc}: ${n + 1} bytes no longer fit version ${v}`, over.ok ? over.version : 41, v + 1);
    const r = encodeQr(textOf(n), { ecc });
    eq(`QR ${ecc} v${v}: ${n} bytes, the most it holds, is version ${v}`, r.ok && [r.version, r.size], [v, 17 + 4 * v]);
    if (r.ok) {
      eq(`QR ${ecc} v${v} (${n} bytes) is found and reads back`, await readQr(r.modules), textOf(n));
      symbols++;
    }
  }
}
eq("QR symbols decoded across versions and levels", symbols, 160);

// Every mask reads (forced), in every mode.
const MODE_TEXTS = ["0123456789012345", "HELLO WORLD $%*+-./:", "Invoice SI/26/0042 for ₹1,18,000.50 — paid", "日本語のテキスト", "a"];
for (const t of MODE_TEXTS) {
  for (let mask = 0; mask < 8; mask++) {
    const r = encodeQr(t, { mask, ecc: "Q" });
    eq(`mask ${mask} "${t}"`, r.ok ? [r.mask, await readQr(r.modules)] : "error", [mask, t]);
  }
}
const mixed = encodeQr("SI/26/0042", { minVersion: 5 });
eq("minVersion holds a fixed size", mixed.ok && mixed.version, 5);
eq("minVersion symbol reads", mixed.ok ? await readQr(mixed.modules) : "", "SI/26/0042");
eq("empty text is a valid (empty) symbol", (() => { const r = encodeQr(""); return r.ok && r.version; })(), 1);

// qrPath draws exactly the dark modules.
{
  const r = encodeQr("path check");
  if (r.ok) {
    let dark = 0, area = 0;
    for (const row of r.modules) for (const c of row) if (c) dark++;
    for (const m of qrPath(r.modules).matchAll(/h(\d+)/g)) area += Number(m[1]);
    eq("qrPath covers every dark module once", area, dark);
  }
}

// --- Linear: tables ---------------------------------------------------------------

eq("Code 128: 107 patterns", CODE128_PATTERNS.length, 107);
eq("Code 128: every value is 11 modules, stop 13", CODE128_PATTERNS.map((p) => [...p].reduce((a, b) => a + Number(b), 0)).every((s, i) => s === (i === 106 ? 13 : 11)), true);
eq("Code 128: patterns are distinct", new Set(CODE128_PATTERNS).size, 107);
eq("Code 39: 44 characters, three wide each", Object.values(CODE39_PATTERNS).every((p) => p.length === 9 && [...p].filter((c) => c === "w").length === 3), true);
eq("Code 39: patterns are distinct", new Set(Object.values(CODE39_PATTERNS)).size, 44);
eq("EAN check digit", [eanCheckDigit("400638133393"), eanCheckDigit("890123456789"), eanCheckDigit("000000000000")], [1, 0, 0]);

// --- Linear: decoded ----------------------------------------------------------------

const CODE128 = [
  "ITM-0042", "SI/26/0042", "1234567890", "12345", "A", "00", "abc123456789xyz", "hello world",
  "Batch: B-2026-11 / Qty 40", "123456789012345678901234567890", "X1234567Y", "1234ABcd5678",
  "\tTAB", "line1\nline2", "MiXeD\x01ctrl", "~!@#$%^&*()_+{}|:<>?", "9", "98765", "AB12345678",
];
for (const t of CODE128) {
  const r = encodeBarcode(t, "code128");
  eq(`Code 128 "${JSON.stringify(t)}" reads back`, r.ok ? await readLinear(r.widths, "code128") : r.error, t);
}
eq("Code 128: digit pairs are compact (set C)", code128Values("123456")!.slice(0, 4), [105, 12, 34, 56]);
eq("Code 128: non-ASCII refused", encodeBarcode("₹100", "code128").ok, false);

for (let first = 0; first <= 9; first++) {
  const twelve = `${first}${"90123456789".slice(0, 11)}`;
  const r = encodeBarcode(twelve, "ean13");
  const full = twelve + eanCheckDigit(twelve);
  eq(`EAN-13 starting ${first}`, r.ok ? [r.text, r.length, await readLinear(r.widths, "ean13")] : r.error, [full, 95, full]);
}
eq("EAN-13 with a right check digit", encodeBarcode("4006381333931", "ean13").ok, true);
const wrong = encodeBarcode("4006381333932", "ean13");
eq("EAN-13 with a wrong check digit is refused, naming the right one", wrong.ok ? "" : wrong.error, "the check digit should be 1");
eq("EAN-13 needs digits", encodeBarcode("40063813339X", "ean13").ok, false);

const C39_ALL = Object.keys(CODE39_PATTERNS).filter((c) => c !== "*").join("");
for (const t of ["CODE 39", "ITM-0042", C39_ALL.slice(0, 22), C39_ALL.slice(22), "$/+%", "A", "1.5"]) {
  const r = encodeBarcode(t, "code39");
  eq(`Code 39 "${t}" reads back`, r.ok ? await readLinear(r.widths, "code39") : r.error, t);
}
const lower = encodeBarcode("abc", "code39");
eq("Code 39 refuses lower case, naming it", lower.ok ? "" : lower.error.includes("“a”"), true);
eq("empty is refused", encodeBarcode("", "code128").ok, false);

console.log(failed ? `${failed} of ${checked} FAILED` : `all passed (${checked} assertions, ${symbols} QR symbols found and decoded)`);
process.exit(failed ? 1 : 0);

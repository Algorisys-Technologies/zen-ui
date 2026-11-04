/**
 * Drawing codes: the pure half of QRCode and Barcode, shared by every binding.
 *
 *   bun run check:barcode
 *
 * A QR code (ISO/IEC 18004: versions 1–40, error correction L/M/Q/H, numeric,
 * alphanumeric and byte (UTF-8) modes, the mask with the lowest penalty) and
 * three linear symbologies: Code 128 (item labels, GS1 shipping marks), EAN-13
 * (retail goods) and Code 39 (older industrial labels). The output is geometry
 * only, modules and bar widths, for a binding to draw as SVG. An Indian
 * e-invoice must carry the IRP's signed QR, so what is drawn here is checked by
 * decoding it with an independent reader, not by reading it back with itself.
 *
 * Input that cannot be encoded comes back as an error, never as a symbol that
 * scans as something else.
 */

export type QrEcc = "L" | "M" | "Q" | "H";

export interface QrCode {
  ok: true;
  /** Modules per side: 17 + 4 × version. */
  size: number;
  version: number;
  ecc: QrEcc;
  mask: number;
  /** modules[y][x]: true is dark. No quiet zone: draw 4 light modules around it. */
  modules: boolean[][];
}

/**
 * Why a value has no code. `error` is the English sentence; `code` and `values`
 * name the same reason for a message catalogue (`barcode.error.<code>`), so a
 * translated UI need not parse the English.
 */
export type CodeError = {
  ok: false;
  error: string;
  code?: CodeErrorCode;
  values?: Record<string, string | number>;
};
export type CodeErrorCode = "qrTooLongBytes" | "qrTooLongChars" | "empty" | "code128Ascii" | "ean13Digits" | "ean13Check" | "code39Char";

// --- QR tables (index 0 unused) ------------------------------------------------

const ECC_PER_BLOCK: Record<QrEcc, number[]> = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};
const ECC_BLOCKS: Record<QrEcc, number[]> = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};
const FORMAT_ECC: Record<QrEcc, number> = { L: 1, M: 0, Q: 3, H: 2 };
const ALNUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

/** Modules that carry data or error correction (everything but the function patterns). */
export function qrRawModules(version: number): number {
  let n = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const align = Math.floor(version / 7) + 2;
    n -= (25 * align - 10) * align - 55;
    if (version >= 7) n -= 36;
  }
  return n;
}

/** Data codewords a version holds at a level. */
export function qrDataCodewords(version: number, ecc: QrEcc): number {
  return Math.floor(qrRawModules(version) / 8) - ECC_PER_BLOCK[ecc][version] * ECC_BLOCKS[ecc][version];
}

type Mode = "numeric" | "alphanumeric" | "byte";
const MODE_BITS: Record<Mode, number> = { numeric: 1, alphanumeric: 2, byte: 4 };
const COUNT_BITS: Record<Mode, [number, number, number]> = {
  numeric: [10, 12, 14],
  alphanumeric: [9, 11, 13],
  byte: [8, 16, 16],
};
const countBits = (mode: Mode, version: number) => COUNT_BITS[mode][version <= 9 ? 0 : version <= 26 ? 1 : 2];

/** The most compact mode that holds the whole text (one segment). */
export function qrMode(text: string): Mode {
  if (/^[0-9]*$/.test(text)) return "numeric";
  if ([...text].every((c) => ALNUM.includes(c))) return "alphanumeric";
  return "byte";
}

function dataBits(text: string, mode: Mode): number[] {
  const bits: number[] = [];
  const put = (value: number, n: number) => {
    for (let i = n - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  if (mode === "numeric") {
    for (let i = 0; i < text.length; i += 3) {
      const chunk = text.slice(i, i + 3);
      put(Number(chunk), chunk.length * 3 + 1);
    }
  } else if (mode === "alphanumeric") {
    for (let i = 0; i < text.length; i += 2) {
      if (i + 1 < text.length) put(ALNUM.indexOf(text[i]) * 45 + ALNUM.indexOf(text[i + 1]), 11);
      else put(ALNUM.indexOf(text[i]), 6);
    }
  } else {
    for (const b of new TextEncoder().encode(text)) put(b, 8);
  }
  return bits;
}

// --- Reed–Solomon over GF(256), polynomial 0x11D ------------------------------

function gfMul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function rsDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return result;
}

function rsRemainder(data: number[], divisor: number[]): number[] {
  const result = new Array<number>(divisor.length).fill(0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    for (let i = 0; i < divisor.length; i++) result[i] ^= gfMul(divisor[i], factor);
  }
  return result;
}

// --- The symbol --------------------------------------------------------------

/** Centres of the alignment patterns along one axis. */
export function qrAlignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const size = version * 4 + 17;
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
  const result = [6];
  for (let pos = size - 7; result.length < count; pos -= step) result.splice(1, 0, pos);
  return result;
}

const MASKS: ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

export interface QrOptions {
  /** Error correction: L 7%, M 15% (default), Q 25%, H 30% of the symbol can be lost. */
  ecc?: QrEcc;
  /** The smallest version to use (a fixed size for a printed form). Default 1. */
  minVersion?: number;
  /** Force a mask, 0–7. Default: the one with the lowest penalty. */
  mask?: number;
}

/** The QR code for a text, or why there is none (too long for version 40 at that level). */
export function encodeQr(text: string, options: QrOptions = {}): QrCode | CodeError {
  const ecc = options.ecc ?? "M";
  const mode = qrMode(text);
  const payload = dataBits(text, mode);
  const count = mode === "byte" ? new TextEncoder().encode(text).length : text.length;

  let version = 0;
  for (let v = Math.max(1, options.minVersion ?? 1); v <= 40; v++) {
    if (count >= 1 << countBits(mode, v)) continue;
    if (4 + countBits(mode, v) + payload.length <= qrDataCodewords(v, ecc) * 8) {
      version = v;
      break;
    }
  }
  if (!version) return { ok: false, error: `too long for a QR code at level ${ecc} (${count} ${mode === "byte" ? "bytes" : "characters"})`, code: mode === "byte" ? "qrTooLongBytes" : "qrTooLongChars", values: { level: ecc, count } };

  // Data codewords: mode, count, data, terminator, byte padding, pad bytes.
  const bits: number[] = [];
  const put = (value: number, n: number) => {
    for (let i = n - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  put(MODE_BITS[mode], 4);
  put(count, countBits(mode, version));
  bits.push(...payload);
  const capacity = qrDataCodewords(version, ecc) * 8;
  put(0, Math.min(4, capacity - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));

  // Error correction per block, then interleaved.
  const blocks = ECC_BLOCKS[ecc][version];
  const eccLen = ECC_PER_BLOCK[ecc][version];
  const raw = Math.floor(qrRawModules(version) / 8);
  const shortBlocks = blocks - (raw % blocks);
  const shortLen = Math.floor(raw / blocks);
  const divisor = rsDivisor(eccLen);
  const all: number[][] = [];
  for (let i = 0, k = 0; i < blocks; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < shortBlocks ? 0 : 1));
    k += dat.length;
    const check = rsRemainder(dat, divisor);
    if (i < shortBlocks) dat.push(0);
    all.push([...dat, ...check]);
  }
  const codewords: number[] = [];
  for (let i = 0; i < all[0].length; i++) {
    for (let j = 0; j < all.length; j++) {
      if (i !== shortLen - eccLen || j >= shortBlocks) codewords.push(all[j][i]);
    }
  }

  // Function patterns.
  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const fixed = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const set = (x: number, y: number, dark: boolean) => {
    modules[y][x] = dark;
    fixed[y][x] = true;
  };
  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
      }
    }
  }
  const align = qrAlignmentPositions(version);
  const last = align.length - 1;
  for (let i = 0; i < align.length; i++) {
    for (let j = 0; j < align.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) set(align[i] + dx, align[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }
  const drawFormat = (mask: number) => {
    const d = (FORMAT_ECC[ecc] << 3) | mask;
    let rem = d;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const f = ((d << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((f >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6));
    set(8, 8, bit(7));
    set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, true);
  };
  drawFormat(0); // reserves the format areas before the data goes in
  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const v = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const dark = ((v >>> i) & 1) === 1;
      const a = size - 11 + (i % 3), b = Math.floor(i / 3);
      set(a, b, dark);
      set(b, a, dark);
    }
  }

  // Data, in the two-column zigzag from the bottom right.
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const up = ((right + 1) & 2) === 0;
        const y = up ? size - 1 - vert : vert;
        if (!fixed[y][x] && i < codewords.length * 8) {
          modules[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) === 1;
          i++;
        }
      }
    }
  }

  const applyMask = (m: number) => {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fixed[y][x] && MASKS[m](x, y)) modules[y][x] = !modules[y][x];
  };
  let mask = options.mask ?? -1;
  if (mask < 0) {
    let best = Infinity;
    for (let m = 0; m < 8; m++) {
      applyMask(m);
      drawFormat(m);
      const p = qrPenalty(modules);
      if (p < best) {
        best = p;
        mask = m;
      }
      applyMask(m); // XOR again: undone
    }
  }
  applyMask(mask);
  drawFormat(mask);
  return { ok: true, size, version, ecc, mask, modules };
}

/**
 * The standard's penalty for a masked symbol: lower reads better. Finder-like
 * patterns are counted at every scale (2:2:6:2:2 fools a detector as surely as
 * 1:1:3:1:1), from run lengths, with the edge counting as light. Counting only
 * one-module patterns let stripe masks win that ZXing then could not locate.
 */
export function qrPenalty(m: boolean[][]): number {
  const size = m.length;
  let p = 0;
  const line = (k: number, vertical: boolean) => (i: number) => (vertical ? m[i][k] : m[k][i]);
  for (const vertical of [false, true]) {
    for (let k = 0; k < size; k++) {
      const at = line(k, vertical);
      // Run history, newest first; the first run gets the light border added.
      const history = [0, 0, 0, 0, 0, 0, 0];
      const push = (run: number) => {
        if (history[0] === 0) run += size;
        history.pop();
        history.unshift(run);
      };
      const finders = () => {
        const n = history[1];
        const core = n > 0 && history[2] === n && history[3] === n * 3 && history[4] === n && history[5] === n;
        return (core && history[0] >= n * 4 && history[6] >= n ? 1 : 0) + (core && history[6] >= n * 4 && history[0] >= n ? 1 : 0);
      };
      let color = false;
      let run = 0;
      for (let i = 0; i < size; i++) {
        if (at(i) === color) {
          run++;
          if (run === 5) p += 3;
          else if (run > 5) p++;
        } else {
          push(run);
          if (!color) p += finders() * 40;
          color = at(i);
          run = 1;
        }
      }
      // The line's end: close the last run, then the light border beyond it.
      if (color) {
        push(run);
        run = 0;
      }
      run += size;
      push(run);
      p += finders() * 40;
    }
  }
  for (let y = 0; y + 1 < size; y++) {
    for (let x = 0; x + 1 < size; x++) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3;
    }
  }
  let dark = 0;
  for (const row of m) for (const c of row) if (c) dark++;
  const total = size * size;
  p += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
  return p;
}

// --- Linear barcodes -----------------------------------------------------------

export type BarcodeFormat = "code128" | "ean13" | "code39";

export interface LinearBarcode {
  ok: true;
  format: BarcodeFormat;
  /** What to print under the bars: the value, with EAN's check digit. */
  text: string;
  /** Widths in modules, bar first, alternating bar and space. No quiet zone: leave 10 modules each side. */
  widths: number[];
  /** The sum of the widths. */
  length: number;
}

// Code 128: each value's six widths (bar, space, …), the stop's seven.
const C128 = (
  "212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 " +
  "123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 " +
  "232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 " +
  "313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 " +
  "111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 " +
  "111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 " +
  "114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112"
).split(" ");
export const CODE128_PATTERNS: readonly string[] = C128;

/** Code 128 values for a text: set C for runs of digits, B for printable ASCII, A for control characters. */
export function code128Values(text: string): number[] | null {
  for (const ch of text) if (ch.charCodeAt(0) > 127 || ch.length > 1) return null;
  const digitsAt = (i: number) => {
    let n = 0;
    while (i + n < text.length && text[i + n] >= "0" && text[i + n] <= "9") n++;
    return n;
  };
  const setFor = (i: number): "A" | "B" => {
    // A for a control character coming before any lower-case letter, else B.
    for (let k = i; k < text.length; k++) {
      const c = text.charCodeAt(k);
      if (c < 32) return "A";
      if (c >= 96) return "B";
    }
    return "B";
  };
  const values: number[] = [];
  let set: "A" | "B" | "C";
  const lead = digitsAt(0);
  if (lead >= 4 && (lead % 2 === 0 || lead >= 5) || (lead === text.length && lead >= 2 && lead % 2 === 0)) {
    set = "C";
    values.push(105);
  } else {
    set = setFor(0);
    values.push(set === "A" ? 103 : 104);
  }
  let i = 0;
  while (i < text.length) {
    const run = digitsAt(i);
    if (set === "C") {
      if (run >= 2) {
        values.push(Number(text.slice(i, i + 2)));
        i += 2;
        continue;
      }
      set = setFor(i);
      values.push(set === "A" ? 101 : 100);
      continue;
    }
    // In A or B: go to C for 6+ digits, or 4+ that end the text; an odd run sends its first digit in A/B.
    if (run >= 6 || (run >= 4 && i + run === text.length)) {
      if (run % 2 === 1) {
        values.push(text.charCodeAt(i) - 32);
        i++;
      }
      set = "C";
      values.push(99);
      continue;
    }
    const c = text.charCodeAt(i);
    if (set === "B" && c < 32) {
      // One control character: SHIFT if B resumes right after, else change to A.
      if (i + 1 < text.length && text.charCodeAt(i + 1) >= 32 && setFor(i + 1) === "B") {
        values.push(98, c + 64);
        i++;
        continue;
      }
      set = "A";
      values.push(101);
      continue;
    }
    if (set === "A" && c >= 96) {
      set = "B";
      values.push(100);
      continue;
    }
    values.push(set === "A" ? (c < 32 ? c + 64 : c - 32) : c - 32);
    i++;
  }
  let sum = values[0];
  for (let k = 1; k < values.length; k++) sum += values[k] * k;
  values.push(sum % 103, 106);
  return values;
}

// EAN-13: the left half's codes (L, and G is R reversed), and which digits are G by the first digit.
const EAN_L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const EAN_R = EAN_L.map((c) => [...c].map((b) => (b === "1" ? "0" : "1")).join(""));
const EAN_G = EAN_R.map((c) => [...c].reverse().join(""));
const EAN_PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

/** EAN-13's check digit for the first twelve digits. */
export function eanCheckDigit(twelve: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(twelve[i]) * (i % 2 === 0 ? 1 : 3);
  return (10 - (sum % 10)) % 10;
}

// Code 39: nine elements (bar, space, …), w wide; three of the nine are wide.
const C39: Record<string, string> = {
  "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn", "4": "nnnwwnnnw",
  "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw", "8": "wnnwnnwnn", "9": "nnwwnnwnn",
  A: "wnnnnwnnw", B: "nnwnnwnnw", C: "wnwnnwnnn", D: "nnnnwwnnw", E: "wnnnwwnnn",
  F: "nnwnwwnnn", G: "nnnnnwwnw", H: "wnnnnwwnn", I: "nnwnnwwnn", J: "nnnnwwwnn",
  K: "wnnnnnnww", L: "nnwnnnnww", M: "wnwnnnnwn", N: "nnnnwnnww", O: "wnnnwnnwn",
  P: "nnwnwnnwn", Q: "nnnnnnwww", R: "wnnnnnwwn", S: "nnwnnnwwn", T: "nnnnwnwwn",
  U: "wwnnnnnnw", V: "nwwnnnnnw", W: "wwwnnnnnn", X: "nwnnwnnnw", Y: "wwnnwnnnn",
  Z: "nwwnwnnnn", "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", "*": "nwnnwnwnn",
  $: "nwnwnwnnn", "/": "nwnwnnnwn", "+": "nwnnnwnwn", "%": "nnnwnwnwn",
};
export const CODE39_PATTERNS: Readonly<Record<string, string>> = C39;

/** The bars for a value, or why there are none. */
export function encodeBarcode(value: string, format: BarcodeFormat): LinearBarcode | CodeError {
  if (value === "") return { ok: false, error: "nothing to encode", code: "empty" };
  if (format === "code128") {
    const values = code128Values(value);
    if (!values) return { ok: false, error: "Code 128 holds ASCII only", code: "code128Ascii" };
    const widths = values.flatMap((v) => [...C128[v]].map(Number));
    return { ok: true, format, text: value, widths, length: widths.reduce((a, b) => a + b, 0) };
  }
  if (format === "ean13") {
    if (!/^\d{12,13}$/.test(value)) return { ok: false, error: "EAN-13 is 12 digits (the check digit is added) or 13", code: "ean13Digits" };
    const check = eanCheckDigit(value);
    if (value.length === 13 && Number(value[12]) !== check) return { ok: false, error: `the check digit should be ${check}`, code: "ean13Check", values: { check } };
    const digits = value.slice(0, 12) + check;
    const parity = EAN_PARITY[Number(digits[0])];
    let bits = "101";
    for (let i = 1; i <= 6; i++) bits += (parity[i - 1] === "L" ? EAN_L : EAN_G)[Number(digits[i])];
    bits += "01010";
    for (let i = 7; i <= 12; i++) bits += EAN_R[Number(digits[i])];
    bits += "101";
    return { ok: true, format, text: digits, widths: runs(bits), length: bits.length };
  }
  const bad = [...value].find((c) => !(c in C39) || c === "*");
  if (bad !== undefined) return { ok: false, error: `Code 39 has no “${bad}” (it holds 0–9, A–Z, space and - . $ / + %)`, code: "code39Char", values: { char: bad } };
  const widths: number[] = [];
  const chars = `*${value}*`;
  for (let k = 0; k < chars.length; k++) {
    for (const e of C39[chars[k]]) widths.push(e === "w" ? 3 : 1);
    if (k < chars.length - 1) widths.push(1); // the gap between characters
  }
  return { ok: true, format, text: value, widths, length: widths.reduce((a, b) => a + b, 0) };
}

/** "1101" -> [2, 1, 1]: run lengths, starting with a bar. */
function runs(bits: string): number[] {
  const out: number[] = [];
  let n = 1;
  for (let i = 1; i <= bits.length; i++) {
    if (i < bits.length && bits[i] === bits[i - 1]) n++;
    else {
      out.push(n);
      n = 1;
    }
  }
  return out;
}

/**
 * A QR symbol as SVG path data: dark modules, each row's runs merged, offset by
 * the quiet zone. Plain data rather than rendering, kept here so the bindings
 * share it instead of each re-merging runs.
 */
export function qrPath(modules: boolean[][], quiet = 4): string {
  let d = "";
  modules.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      if (!row[x]) {
        x++;
        continue;
      }
      let w = 1;
      while (x + w < row.length && row[x + w]) w++;
      d += `M${x + quiet} ${y + quiet}h${w}v1h${-w}z`;
      x += w;
    }
  });
  return d;
}

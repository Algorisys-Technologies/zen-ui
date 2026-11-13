/**
 * Scan detection — the pure half of ScanInput.
 *
 *   bun run check:scan
 *
 * A USB ("keyboard wedge") barcode scanner types the code as a burst of
 * keystrokes a few milliseconds apart, usually followed by Enter. A scan is at
 * least `minLength` characters, every gap at most `maxGapMs`, with no editing
 * keys in it. A person cannot sustain 35 ms per key; a scanner never gets near.
 *
 * Keys are KeyboardEvent.key values: a one-character key is a character,
 * "Backspace" / "Delete" are edits, anything else (Shift, Alt, …) is ignored.
 */

export interface ScanOptions {
  /** Longest gap between two characters of one scan. */
  maxGapMs: number;
  /** Shortest code that counts as a scan. */
  minLength: number;
  /** Keys a scanner sends after the code. Empty: scanners with no suffix; use `flush`. */
  terminators: string[];
}

export const DEFAULT_SCAN_OPTIONS: ScanOptions = { maxGapMs: 35, minLength: 4, terminators: ["Enter"] };

export interface KeyAt {
  key: string;
  at: number;
}

const isChar = (key: string) => [...key].length === 1;
const isEdit = (key: string) => key === "Backspace" || key === "Delete";

/** Whether a field's keystrokes, up to its Enter, were a scanner or a person. */
export function classifyEntry(events: readonly KeyAt[], options: Partial<ScanOptions> = {}): "scanner" | "keyboard" {
  const o = { ...DEFAULT_SCAN_OPTIONS, ...options };
  let count = 0;
  let last: number | undefined;
  for (const e of events) {
    if (isEdit(e.key)) return "keyboard";
    if (!isChar(e.key)) continue;
    if (last !== undefined && e.at - last > o.maxGapMs) return "keyboard";
    last = e.at;
    count++;
  }
  return count >= o.minLength ? "scanner" : "keyboard";
}

export interface ScanBuffer {
  /** Feed one keystroke. Returns the scanned code when this key finishes a scan, else null. */
  push(key: string, at: number): string | null;
  /** For scanners with no suffix: returns the code if the buffer has gone quiet and qualifies. */
  flush(at: number): string | null;
  /** Whether characters are waiting (a caller may schedule a flush). */
  pending(): boolean;
  reset(): void;
}

/** Collects bursts from keystrokes anywhere on a page, for a station that scans without a focused field. */
export function createScanBuffer(options: Partial<ScanOptions> = {}): ScanBuffer {
  const o = { ...DEFAULT_SCAN_OPTIONS, ...options };
  let chars = "";
  let last = -Infinity;
  let spoiled = false;

  const reset = () => {
    chars = "";
    last = -Infinity;
    spoiled = false;
  };
  const take = () => {
    const code = !spoiled && [...chars].length >= o.minLength ? chars : null;
    reset();
    return code;
  };

  return {
    push(key, at) {
      if (chars && at - last > o.maxGapMs) reset(); // a stray earlier key does not leak in
      if (o.terminators.includes(key)) return chars ? take() : null;
      if (isEdit(key)) {
        if (chars) {
          spoiled = true;
          last = at;
        }
        return null;
      }
      if (!isChar(key)) return null;
      chars += key;
      last = at;
      return null;
    },
    flush(at) {
      if (!chars || at - last <= o.maxGapMs) return null;
      return take();
    },
    pending: () => chars.length > 0,
    reset,
  };
}

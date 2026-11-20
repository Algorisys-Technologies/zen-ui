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
/** Modules that carry data or error correction (everything but the function patterns). */
export declare function qrRawModules(version: number): number;
/** Data codewords a version holds at a level. */
export declare function qrDataCodewords(version: number, ecc: QrEcc): number;
type Mode = "numeric" | "alphanumeric" | "byte";
/** The most compact mode that holds the whole text (one segment). */
export declare function qrMode(text: string): Mode;
/** Centres of the alignment patterns along one axis. */
export declare function qrAlignmentPositions(version: number): number[];
export interface QrOptions {
    /** Error correction: L 7%, M 15% (default), Q 25%, H 30% of the symbol can be lost. */
    ecc?: QrEcc;
    /** The smallest version to use (a fixed size for a printed form). Default 1. */
    minVersion?: number;
    /** Force a mask, 0–7. Default: the one with the lowest penalty. */
    mask?: number;
}
/** The QR code for a text, or why there is none (too long for version 40 at that level). */
export declare function encodeQr(text: string, options?: QrOptions): QrCode | CodeError;
/**
 * The standard's penalty for a masked symbol: lower reads better. Finder-like
 * patterns are counted at every scale (2:2:6:2:2 fools a detector as surely as
 * 1:1:3:1:1), from run lengths, with the edge counting as light. Counting only
 * one-module patterns let stripe masks win that ZXing then could not locate.
 */
export declare function qrPenalty(m: boolean[][]): number;
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
export declare const CODE128_PATTERNS: readonly string[];
/** Code 128 values for a text: set C for runs of digits, B for printable ASCII, A for control characters. */
export declare function code128Values(text: string): number[] | null;
/** EAN-13's check digit for the first twelve digits. */
export declare function eanCheckDigit(twelve: string): number;
export declare const CODE39_PATTERNS: Readonly<Record<string, string>>;
/** The bars for a value, or why there are none. */
export declare function encodeBarcode(value: string, format: BarcodeFormat): LinearBarcode | CodeError;
/**
 * A QR symbol as SVG path data: dark modules, each row's runs merged, offset by
 * the quiet zone. Plain data rather than rendering, kept here so the bindings
 * share it instead of each re-merging runs.
 */
export declare function qrPath(modules: boolean[][], quiet?: number): string;
export {};

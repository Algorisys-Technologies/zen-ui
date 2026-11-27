import * as React from "react";
import { type ScanOptions } from "../../_core/scan";
/**
 * ScanInput — a field for a USB barcode scanner, which types like a keyboard.
 *
 *   <ScanInput onScan={async (code, { source }) => {
 *     const wo = await api.workOrder(code);
 *     if (!wo) return `No work order ${code}`;   // shown as the error
 *     open(wo);                                   // nothing returned: accepted
 *   }} />
 *
 * Enter submits whatever is in the field, and `source` says whether a scanner
 * or a person put it there — judged by timing (a scanner's keys arrive a few
 * milliseconds apart; nobody types that fast). `allowTyping={false}` refuses
 * typed codes, for steps where traceability means the label must be scanned.
 *
 * `onScan` returns an error message, or a promise of one, or nothing for
 * accepted; the line under the field says "Checking…", "Scanned …" or the
 * error. The field clears and keeps focus, ready for the next scan.
 *
 * `captureGlobal` also catches scans made while focus is NOT in any field — a
 * station where nobody should have to tap the input first. Keystrokes typed
 * into other fields are left alone.
 *
 * The field is uncontrolled on purpose: the key timings and the text are read
 * together at Enter, and a re-render between a scanner's keystrokes buys
 * nothing.
 */
export type ScanSource = "scanner" | "keyboard";
export type ScanInputProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
    onScan: (code: string, info: {
        source: ScanSource;
    }) => string | void | Promise<string | void>;
    /** Shown above the field. Defaults to "Scan or type a code". */
    label?: string;
    placeholder?: string;
    /** Refuse codes that were typed rather than scanned. Default true (typing allowed). */
    allowTyping?: boolean;
    /** Also catch scans made while focus is not in any field. */
    captureGlobal?: boolean;
    /** Timing thresholds and terminators; see core/scan. */
    scanOptions?: Partial<ScanOptions>;
    /** Clear the field after a submission. Default true. */
    clearOnScan?: boolean;
    disabled?: boolean;
};
export declare const ScanInput: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "children"> & {
    onScan: (code: string, info: {
        source: ScanSource;
    }) => string | void | Promise<string | void>;
    /** Shown above the field. Defaults to "Scan or type a code". */
    label?: string;
    placeholder?: string;
    /** Refuse codes that were typed rather than scanned. Default true (typing allowed). */
    allowTyping?: boolean;
    /** Also catch scans made while focus is not in any field. */
    captureGlobal?: boolean;
    /** Timing thresholds and terminators; see core/scan. */
    scanOptions?: Partial<ScanOptions>;
    /** Clear the field after a submission. Default true. */
    clearOnScan?: boolean;
    disabled?: boolean;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=scan-input.d.ts.map
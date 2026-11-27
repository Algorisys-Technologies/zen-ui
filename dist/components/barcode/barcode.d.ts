import * as React from "react";
import { type BarcodeFormat, type QrEcc } from "../../_core/barcode";
export type { BarcodeFormat, QrEcc };
/**
 * QRCode and Barcode — codes drawn as SVG, for screens and for print: the
 * e-invoice's signed QR, a gate pass, an item label.
 *
 *   <QRCode value={signedQr} ecc="M" size={160} label="e-invoice QR" />
 *   <Barcode value="ITM-0042" format="code128" />
 *   <Barcode value="400638133393" format="ean13" />   // check digit added
 *
 * Drawn dark on light whatever the theme (the --zen-code-dark and
 * --zen-code-light tokens, black and white by default): scanners read inverted
 * codes badly, and paper is light. The quiet zone (4 modules round a QR, 10
 * either side of bars) is part of the drawing, because a code printed hard
 * against a border does not scan. A value that cannot be encoded shows why, in
 * place of the code, rather than a code that scans as something else. The
 * encoding is @algorisys/zen-ui-core/barcode (check:barcode, which decodes every
 * symbol with an independent reader).
 */
export type QRCodeProps = {
    value: string;
    /** Error correction: L 7%, M 15% (default), Q 25%, H 30% of the code can be damaged or covered. */
    ecc?: QrEcc;
    /** Width and height in px, quiet zone included. Default 128. */
    size?: number;
    /** Light modules round the code. Default 4, the standard's minimum. */
    quietZone?: number;
    /** The smallest version (a fixed size on a printed form). */
    minVersion?: number;
    /** What it is, for assistive tech: "e-invoice QR". Default "QR code". */
    label?: string;
    className?: string;
};
export declare const QRCode: ({ value, ecc, size, quietZone, minVersion, label, className }: QRCodeProps) => React.JSX.Element;
export type BarcodeProps = {
    value: string;
    /** Default "code128" (any ASCII). "ean13": 12 digits (the check digit is added) or 13. "code39": 0–9, A–Z, space, - . $ / + %. */
    format?: BarcodeFormat;
    /** Height of the bars in px. Default 64. */
    height?: number;
    /** Width of the narrowest bar in px. Default 2. Print at 1 px and many scanners miss it. */
    moduleWidth?: number;
    /** The value printed under the bars. Default true. */
    showText?: boolean;
    /** Light modules either side. Default 10. */
    quietZone?: number;
    /** What it is, for assistive tech. Default: the format and the value. */
    label?: string;
    className?: string;
};
export declare const Barcode: ({ value, format, height: barHeight, moduleWidth: unit, showText, quietZone: quiet, label, className, }: BarcodeProps) => React.JSX.Element;
//# sourceMappingURL=barcode.d.ts.map
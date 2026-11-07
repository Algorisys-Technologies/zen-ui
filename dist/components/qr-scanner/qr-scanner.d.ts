import * as React from "react";
/**
 * QRScanner — camera-based barcode / QR scanner.
 *
 *   <QRScanner onScan={(s) => console.log(s.rawValue)} />
 *
 * Uses the native `BarcodeDetector` API (Chromium, Safari 17+). On
 * browsers without it (Firefox today), pass a `decode` function and we'll
 * call it once per animation frame with the live <video> element — wire
 * in jsQR or @zxing/browser there. We deliberately don't bundle a
 * decoder so the library payload stays small.
 *
 *   import jsQR from "jsqr";
 *   const decode = async (video) => { ... };
 *   <QRScanner decode={decode} onScan={...} />
 *
 * Lifecycle: requests `getUserMedia({ video: { facingMode } })` on mount
 * (or when `paused` flips false), stops all tracks on unmount / `paused`
 * true. Identical scans within `cooldownMs` are suppressed.
 */
type DetectedBarcode = {
    rawValue: string;
    format: string;
    boundingBox: DOMRectReadOnly;
    cornerPoints: {
        x: number;
        y: number;
    }[];
};
type BarcodeDetectorOptions = {
    formats?: string[];
};
type BarcodeDetectorInstance = {
    detect(image: CanvasImageSource): Promise<DetectedBarcode[]>;
};
type BarcodeDetectorCtor = {
    new (options?: BarcodeDetectorOptions): BarcodeDetectorInstance;
    getSupportedFormats?(): Promise<string[]>;
};
declare global {
    interface Window {
        BarcodeDetector?: BarcodeDetectorCtor;
    }
}
export interface QRScannerScan {
    rawValue: string;
    format?: string;
    cornerPoints?: {
        x: number;
        y: number;
    }[];
}
export interface QRScannerProps {
    /** Fired every time a barcode is detected (subject to cooldown dedupe). */
    onScan: (scan: QRScannerScan) => void;
    /** Fired on permission denial, no-camera, or decoder errors. */
    onError?: (error: Error) => void;
    /** Formats to look for. Defaults to QR only. Ignored by custom `decode`. */
    formats?: string[];
    /** Front (selfie) or back (environment, default for scanning). */
    facingMode?: "user" | "environment";
    /** Stop the camera. Useful for tab visibility or modal close. */
    paused?: boolean;
    /** Suppress duplicate scans inside this window (ms). Default 1500. */
    cooldownMs?: number;
    /** Custom decoder for browsers without native BarcodeDetector. */
    decode?: (video: HTMLVideoElement) => Promise<QRScannerScan | null>;
    /** Width/height ratio of the scanner viewport. Default 1 (square). */
    aspectRatio?: number;
    /** Rendered in place of the camera surface on error / unsupported. */
    fallback?: React.ReactNode;
    className?: string;
    /** Hide the white corner-bracket viewfinder. */
    hideViewfinder?: boolean;
    /** Aria label for the camera surface. */
    "aria-label"?: string;
}
declare const QRScanner: React.ForwardRefExoticComponent<QRScannerProps & React.RefAttributes<HTMLDivElement>>;
export { QRScanner };
//# sourceMappingURL=qr-scanner.d.ts.map
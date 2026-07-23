import { type JSX } from "solid-js";
/**
 * QRScanner — camera-based barcode / QR scanner. Solid port.
 *
 *   <QRScanner onScan={(s) => console.log(s.rawValue)} />
 *
 * Uses the native `BarcodeDetector` API (Chromium, Safari 17+). On
 * browsers without it, pass a `decode` function that we'll call once
 * per animation frame with the live <video> element. We deliberately
 * don't bundle a decoder so the library payload stays small.
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
export type QRScannerProps = {
    onScan: (scan: QRScannerScan) => void;
    onError?: (error: Error) => void;
    formats?: string[];
    facingMode?: "user" | "environment";
    paused?: boolean;
    cooldownMs?: number;
    decode?: (video: HTMLVideoElement) => Promise<QRScannerScan | null>;
    aspectRatio?: number;
    fallback?: JSX.Element;
    class?: string;
    hideViewfinder?: boolean;
    "aria-label"?: string;
};
export declare const QRScanner: (props: QRScannerProps) => JSX.Element;
export {};
//# sourceMappingURL=qr-scanner.d.ts.map
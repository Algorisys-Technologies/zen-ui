import * as React from "react";
import { cn } from "../../lib/cn";

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
  cornerPoints: { x: number; y: number }[];
};
type BarcodeDetectorOptions = { formats?: string[] };
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
  cornerPoints?: { x: number; y: number }[];
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

type Status = "idle" | "starting" | "scanning" | "blocked" | "no-camera" | "no-decoder";

const QRScanner = React.forwardRef<HTMLDivElement, QRScannerProps>(
  (
    {
      onScan,
      onError,
      formats = ["qr_code"],
      facingMode = "environment",
      paused = false,
      cooldownMs = 1500,
      decode,
      aspectRatio = 1,
      fallback,
      className,
      hideViewfinder,
      "aria-label": ariaLabel = "QR scanner camera view",
    },
    ref,
  ) => {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const streamRef = React.useRef<MediaStream | null>(null);
    const rafRef = React.useRef<number | null>(null);
    const lastScanRef = React.useRef<{ value: string; at: number }>({ value: "", at: 0 });
    const detectorRef = React.useRef<BarcodeDetectorInstance | null>(null);
    const cancelledRef = React.useRef(false);

    const [status, setStatus] = React.useState<Status>("idle");

    // Stable refs to props that change frequently but don't need to retrigger the effect.
    const onScanRef = React.useRef(onScan);
    const onErrorRef = React.useRef(onError);
    const decodeRef = React.useRef(decode);
    React.useEffect(() => {
      onScanRef.current = onScan;
      onErrorRef.current = onError;
      decodeRef.current = decode;
    });

    React.useEffect(() => {
      if (paused) return;
      cancelledRef.current = false;
      setStatus("starting");

      const stop = () => {
        cancelledRef.current = true;
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      const start = async () => {
        // 1. Pick a detector.
        let usingNative = false;
        if (window.BarcodeDetector) {
          try {
            detectorRef.current = new window.BarcodeDetector({ formats });
            usingNative = true;
          } catch (e) {
            detectorRef.current = null;
            onErrorRef.current?.(e as Error);
          }
        }
        if (!usingNative && !decodeRef.current) {
          setStatus("no-decoder");
          return;
        }

        // 2. Open the camera.
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: false,
          });
        } catch (e) {
          const err = e as DOMException;
          if (
            err.name === "NotAllowedError" ||
            err.name === "SecurityError" ||
            err.name === "PermissionDeniedError"
          ) {
            setStatus("blocked");
          } else {
            setStatus("no-camera");
          }
          onErrorRef.current?.(err);
          return;
        }
        if (cancelledRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = stream;
        try {
          await video.play();
        } catch (e) {
          // Autoplay can be rejected if user hasn't interacted yet — caller can wire up a tap-to-start.
          onErrorRef.current?.(e as Error);
        }

        setStatus("scanning");

        // 3. Detection loop.
        const tick = async () => {
          if (cancelledRef.current || !videoRef.current) return;
          const v = videoRef.current;
          if (v.readyState >= 2 && !v.paused) {
            try {
              if (usingNative && detectorRef.current) {
                const results = await detectorRef.current.detect(v);
                if (results.length) {
                  emit({
                    rawValue: results[0].rawValue,
                    format: results[0].format,
                    cornerPoints: results[0].cornerPoints,
                  });
                }
              } else if (decodeRef.current) {
                const result = await decodeRef.current(v);
                if (result) emit(result);
              }
            } catch (e) {
              onErrorRef.current?.(e as Error);
            }
          }
          if (!cancelledRef.current) {
            rafRef.current = requestAnimationFrame(tick);
          }
        };

        const emit = (scan: QRScannerScan) => {
          const now = Date.now();
          if (
            scan.rawValue === lastScanRef.current.value &&
            now - lastScanRef.current.at < cooldownMs
          ) {
            return;
          }
          lastScanRef.current = { value: scan.rawValue, at: now };
          onScanRef.current(scan);
        };

        rafRef.current = requestAnimationFrame(tick);
      };

      void start();

      return stop;
    }, [paused, facingMode, cooldownMs, formats]);

    const showSurface = status === "scanning" || status === "starting";

    return (
      <div
        ref={ref}
        className={cn(
          "zen-relative zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted",
          className,
        )}
        style={{ aspectRatio: `${aspectRatio} / 1` }}
      >
        <video
          ref={videoRef}
          aria-label={ariaLabel}
          playsInline
          muted
          className={cn(
            "zen-absolute zen-inset-0 zen-h-full zen-w-full zen-object-cover",
            !showSurface && "zen-invisible",
          )}
        />

        {!hideViewfinder && showSurface && <Viewfinder />}

        {!showSurface && (
          <div className="zen-absolute zen-inset-0 zen-flex zen-items-center zen-justify-center zen-p-4 zen-text-center zen-text-sm zen-text-zen-muted-fg">
            {fallback ?? <DefaultFallback status={status} />}
          </div>
        )}

        {status === "starting" && (
          <div className="zen-absolute zen-inset-x-0 zen-bottom-2 zen-text-center zen-text-xs zen-text-white/80">
            Starting camera…
          </div>
        )}
      </div>
    );
  },
);
QRScanner.displayName = "QRScanner";

const Viewfinder: React.FC = () => (
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    className="zen-pointer-events-none zen-absolute zen-inset-0 zen-h-full zen-w-full"
    aria-hidden
  >
    <g
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,.45))" }}
    >
      {/* corner brackets at 20–80 box */}
      <path d="M 20 26 L 20 20 L 26 20" />
      <path d="M 74 20 L 80 20 L 80 26" />
      <path d="M 80 74 L 80 80 L 74 80" />
      <path d="M 26 80 L 20 80 L 20 74" />
    </g>
  </svg>
);

const DefaultFallback: React.FC<{ status: Status }> = ({ status }) => {
  if (status === "blocked") {
    return (
      <span>
        Camera access was blocked. Allow camera permission in your browser
        settings, then reload.
      </span>
    );
  }
  if (status === "no-camera") {
    return <span>No camera was found on this device.</span>;
  }
  if (status === "no-decoder") {
    return (
      <span>
        This browser does not support the BarcodeDetector API. Pass a{" "}
        <code>decode</code> prop (e.g. powered by jsQR) to enable scanning
        here.
      </span>
    );
  }
  return <span>Scanner idle.</span>;
};

export { QRScanner };

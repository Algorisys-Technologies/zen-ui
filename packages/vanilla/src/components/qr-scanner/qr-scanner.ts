import { cn } from "../../lib/cn";
import { Disposer, toNodes, type BaseProps, type Child, type ZenComponent } from "../../lib/component";

/**
 * QRScanner — camera-based barcode / QR scanner. The vanilla port of the React
 * component; same public API (onScan, onError, formats, facingMode, paused,
 * cooldownMs, decode, aspectRatio, fallback, hideViewfinder).
 *
 *   const scanner = QRScanner({ onScan: (s) => console.log(s.rawValue) });
 *   document.body.append(scanner.el);
 *
 * Uses the native `BarcodeDetector` API (Chromium, Safari 17+). On browsers
 * without it (Firefox today), pass a `decode` function and it is called once per
 * animation frame with the live <video> element — wire in jsQR or @zxing/browser
 * there. No decoder is bundled, so the library payload stays small.
 *
 * Lifecycle: requests `getUserMedia({ video: { facingMode } })` on create (or when
 * `paused` flips false via update()), stops all tracks and cancels the scan loop on
 * destroy() or `paused` true. Identical scans within `cooldownMs` are suppressed.
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

export interface QRScannerScan {
  rawValue: string;
  format?: string;
  cornerPoints?: { x: number; y: number }[];
}

export interface QRScannerProps extends BaseProps {
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
  fallback?: Child;
  /** Hide the white corner-bracket viewfinder. */
  hideViewfinder?: boolean;
  /** Aria label for the camera surface. */
  "aria-label"?: string;
}

type Status = "idle" | "starting" | "scanning" | "blocked" | "no-camera" | "no-decoder";

const ROOT_CLASS =
  "zen-relative zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted";
const VIDEO_CLASS = "zen-absolute zen-inset-0 zen-h-full zen-w-full zen-object-cover";

const VIEWFINDER_SVG = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="zen-pointer-events-none zen-absolute zen-inset-0 zen-h-full zen-w-full" aria-hidden="true"><g stroke="white" stroke-width="2" stroke-linecap="round" fill="none" style="filter: drop-shadow(0 1px 3px rgba(0,0,0,.45))"><path d="M 20 26 L 20 20 L 26 20" /><path d="M 74 20 L 80 20 L 80 26" /><path d="M 80 74 L 80 80 L 74 80" /><path d="M 26 80 L 20 80 L 20 74" /></g></svg>`;

function defaultFallback(status: Status): Node {
  const span = document.createElement("span");
  if (status === "blocked") {
    span.textContent =
      "Camera access was blocked. Allow camera permission in your browser settings, then reload.";
  } else if (status === "no-camera") {
    span.textContent = "No camera was found on this device.";
  } else if (status === "no-decoder") {
    const code = document.createElement("code");
    code.textContent = "decode";
    span.append(
      "This browser does not support the BarcodeDetector API. Pass a ",
      code,
      " prop (e.g. powered by jsQR) to enable scanning here.",
    );
  } else {
    span.textContent = "Scanner idle.";
  }
  return span;
}

export function QRScanner(props: QRScannerProps): ZenComponent<QRScannerProps, HTMLDivElement> {
  let current: QRScannerProps = { ...props };
  const disposer = new Disposer();

  // DOM.
  const el = document.createElement("div");

  const video = document.createElement("video");
  video.playsInline = true;
  video.muted = true;
  video.setAttribute("playsinline", "");

  const viewfinderHolder = document.createElement("div");
  viewfinderHolder.innerHTML = VIEWFINDER_SVG;
  const viewfinder = viewfinderHolder.firstElementChild as SVGSVGElement;

  const fallbackOverlay = document.createElement("div");
  fallbackOverlay.className =
    "zen-absolute zen-inset-0 zen-flex zen-items-center zen-justify-center zen-p-4 zen-text-center zen-text-sm zen-text-zen-muted-fg";

  const startingOverlay = document.createElement("div");
  startingOverlay.className =
    "zen-absolute zen-inset-x-0 zen-bottom-2 zen-text-center zen-text-xs zen-text-white/80";
  startingOverlay.textContent = "Starting camera…";

  el.append(video, viewfinder, fallbackOverlay, startingOverlay);

  // Scan-loop state.
  let stream: MediaStream | null = null;
  let rafId: number | null = null;
  let detector: BarcodeDetectorInstance | null = null;
  let cancelled = false;
  let lastScan = { value: "", at: 0 };
  let status: Status = "idle";

  const applyStatic = () => {
    el.className = cn(ROOT_CLASS, current.class);
    el.style.aspectRatio = `${current.aspectRatio ?? 1} / 1`;
    if (current.id) el.id = current.id;
    video.setAttribute("aria-label", current["aria-label"] ?? "QR scanner camera view");
  };

  const renderStatus = () => {
    const showSurface = status === "scanning" || status === "starting";
    video.className = cn(VIDEO_CLASS, !showSurface && "zen-invisible");
    viewfinder.style.display = !current.hideViewfinder && showSurface ? "" : "none";
    startingOverlay.style.display = status === "starting" ? "" : "none";

    if (!showSurface) {
      fallbackOverlay.style.display = "";
      fallbackOverlay.replaceChildren(
        ...(current.fallback != null ? toNodes(current.fallback) : [defaultFallback(status)]),
      );
    } else {
      fallbackOverlay.style.display = "none";
      fallbackOverlay.replaceChildren();
    }
  };

  const setStatus = (s: Status) => {
    status = s;
    renderStatus();
  };

  const emit = (scan: QRScannerScan) => {
    const now = Date.now();
    const cooldown = current.cooldownMs ?? 1500;
    if (scan.rawValue === lastScan.value && now - lastScan.at < cooldown) return;
    lastScan = { value: scan.rawValue, at: now };
    current.onScan(scan);
  };

  const stop = () => {
    cancelled = true;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    video.srcObject = null;
  };

  const start = async () => {
    cancelled = false;
    setStatus("starting");

    // 1. Pick a detector.
    let usingNative = false;
    const ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (ctor) {
      try {
        detector = new ctor({ formats: current.formats ?? ["qr_code"] });
        usingNative = true;
      } catch (e) {
        detector = null;
        current.onError?.(e as Error);
      }
    }
    if (!usingNative && !current.decode) {
      setStatus("no-decoder");
      return;
    }

    // 2. Open the camera.
    let opened: MediaStream;
    try {
      opened = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: current.facingMode ?? "environment" },
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
      current.onError?.(err);
      return;
    }
    if (cancelled) {
      opened.getTracks().forEach((t) => t.stop());
      return;
    }
    stream = opened;
    video.srcObject = opened;
    try {
      await video.play();
    } catch (e) {
      // Autoplay can be rejected if the user hasn't interacted yet — a caller can
      // wire up a tap-to-start.
      current.onError?.(e as Error);
    }

    setStatus("scanning");

    // 3. Detection loop.
    const tick = async () => {
      if (cancelled) return;
      if (video.readyState >= 2 && !video.paused) {
        try {
          if (usingNative && detector) {
            const results = await detector.detect(video);
            if (results.length) {
              emit({
                rawValue: results[0].rawValue,
                format: results[0].format,
                cornerPoints: results[0].cornerPoints,
              });
            }
          } else if (current.decode) {
            const result = await current.decode(video);
            if (result) emit(result);
          }
        } catch (e) {
          current.onError?.(e as Error);
        }
      }
      if (!cancelled) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  };

  const needsRestart = (next: Partial<QRScannerProps>, prev: QRScannerProps): boolean =>
    (next.paused !== undefined && next.paused !== prev.paused) ||
    (next.facingMode !== undefined && next.facingMode !== prev.facingMode) ||
    (next.formats !== undefined && next.formats !== prev.formats);

  applyStatic();
  renderStatus();
  if (!current.paused) {
    void start();
  } else {
    setStatus("idle");
  }
  disposer.add(stop);

  return {
    el,
    update(next) {
      const prev = current;
      current = { ...current, ...next };
      applyStatic();
      if (needsRestart(next, prev)) {
        stop();
        if (!current.paused) {
          void start();
        } else {
          setStatus("idle");
        }
      } else {
        renderStatus();
      }
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

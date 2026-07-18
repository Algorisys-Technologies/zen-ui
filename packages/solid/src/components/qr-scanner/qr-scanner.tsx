import { type JSX, Show, createEffect, createSignal, onCleanup } from "solid-js";
import { cn } from "../../lib/cn";

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
  cornerPoints: { x: number; y: number }[];
};
type BarcodeDetectorOptions = { formats?: string[] };
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
  cornerPoints?: { x: number; y: number }[];
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

type Status = "idle" | "starting" | "scanning" | "blocked" | "no-camera" | "no-decoder";

export const QRScanner = (props: QRScannerProps) => {
  let videoEl: HTMLVideoElement | undefined;
  let stream: MediaStream | null = null;
  let rafId: number | null = null;
  let detector: BarcodeDetectorInstance | null = null;
  let cancelled = false;
  let lastScan = { value: "", at: 0 };

  const [status, setStatus] = createSignal<Status>("idle");

  const stop = () => {
    cancelled = true;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (videoEl) videoEl.srcObject = null;
  };

  const cooldown = () => props.cooldownMs ?? 1500;
  const formats = () => props.formats ?? ["qr_code"];

  const start = async () => {
    cancelled = false;
    setStatus("starting");

    let usingNative = false;
    if (typeof window !== "undefined" && window.BarcodeDetector) {
      try {
        detector = new window.BarcodeDetector({ formats: formats() });
        usingNative = true;
      } catch (e) {
        detector = null;
        props.onError?.(e as Error);
      }
    }
    if (!usingNative && !props.decode) {
      setStatus("no-decoder");
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: props.facingMode ?? "environment" },
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
      props.onError?.(err);
      return;
    }
    if (cancelled) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    if (!videoEl) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    videoEl.srcObject = stream;
    try {
      await videoEl.play();
    } catch (e) {
      props.onError?.(e as Error);
    }
    setStatus("scanning");

    const emit = (scan: QRScannerScan) => {
      const now = Date.now();
      if (scan.rawValue === lastScan.value && now - lastScan.at < cooldown()) return;
      lastScan = { value: scan.rawValue, at: now };
      props.onScan(scan);
    };

    const tick = async () => {
      if (cancelled || !videoEl) return;
      const v = videoEl;
      if (v.readyState >= 2 && !v.paused) {
        try {
          if (usingNative && detector) {
            const results = await detector.detect(v);
            if (results.length) {
              emit({
                rawValue: results[0].rawValue,
                format: results[0].format,
                cornerPoints: results[0].cornerPoints,
              });
            }
          } else if (props.decode) {
            const result = await props.decode(v);
            if (result) emit(result);
          }
        } catch (e) {
          props.onError?.(e as Error);
        }
      }
      if (!cancelled) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  };

  createEffect(() => {
    if (props.paused) {
      stop();
      return;
    }
    void start();
  });

  onCleanup(stop);

  const showSurface = () => status() === "scanning" || status() === "starting";
  const aspectRatio = () => props.aspectRatio ?? 1;

  return (
    <div
      class={cn(
        "zen-relative zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted",
        props.class,
      )}
      style={{ "aspect-ratio": `${aspectRatio()} / 1` }}
    >
      <video
        ref={videoEl}
        aria-label={props["aria-label"] ?? "QR scanner camera view"}
        playsinline
        muted
        class={cn(
          "zen-absolute zen-inset-0 zen-h-full zen-w-full zen-object-cover",
          !showSurface() && "zen-invisible",
        )}
      />

      <Show when={!props.hideViewfinder && showSurface()}>
        <Viewfinder />
      </Show>

      <Show when={!showSurface()}>
        <div class="zen-absolute zen-inset-0 zen-flex zen-items-center zen-justify-center zen-p-4 zen-text-center zen-text-sm zen-text-zen-muted-fg">
          {props.fallback ?? <DefaultFallback status={status()} />}
        </div>
      </Show>

      <Show when={status() === "starting"}>
        <div class="zen-absolute zen-inset-x-0 zen-bottom-2 zen-text-center zen-text-xs zen-text-white/80">
          Starting camera…
        </div>
      </Show>
    </div>
  );
};

const Viewfinder = () => (
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    class="zen-pointer-events-none zen-absolute zen-inset-0 zen-h-full zen-w-full"
    aria-hidden="true"
  >
    <g
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      fill="none"
      style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,.45))" }}
    >
      <path d="M 20 26 L 20 20 L 26 20" />
      <path d="M 74 20 L 80 20 L 80 26" />
      <path d="M 80 74 L 80 80 L 74 80" />
      <path d="M 26 80 L 20 80 L 20 74" />
    </g>
  </svg>
);

const DefaultFallback = (props: { status: Status }) => (
  <Show
    when={props.status === "blocked"}
    fallback={
      <Show
        when={props.status === "no-camera"}
        fallback={
          <Show
            when={props.status === "no-decoder"}
            fallback={<span>Scanner idle.</span>}
          >
            <span>
              This browser does not support the BarcodeDetector API. Pass a{" "}
              <code>decode</code> prop (e.g. powered by jsQR) to enable
              scanning.
            </span>
          </Show>
        }
      >
        <span>No camera was found on this device.</span>
      </Show>
    }
  >
    <span>
      Camera access was blocked. Allow camera permission in your browser
      settings, then reload.
    </span>
  </Show>
);

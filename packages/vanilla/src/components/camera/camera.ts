import { cn } from "../../lib/cn";
import { Disposer, type BaseProps, type ZenComponent, type Child } from "../../lib/component";
import { toNodes } from "../../lib/component";

/**
 * Camera — webcam capture. The vanilla port of the React reference.
 *
 *   const cam = Camera({ onCapture: (dataUrl) => save(dataUrl), facingMode: "user" });
 *   document.body.append(cam.el);
 *   // …later, programmatically:
 *   const shot = cam.capture();     // also fires onCapture
 *   cam.destroy();                  // stops the tracks and releases the device
 *
 * ## No react-webcam, no lazy chunk
 *
 * React wraps `react-webcam` (an optional peer dependency, `React.lazy`-loaded so
 * it never weighs on consumers who don't capture). There is no framework here and
 * no primitive to defer, so this talks to `navigator.mediaDevices.getUserMedia`
 * directly: the stream goes into a `<video>`, and `capture()` paints the current
 * frame onto an offscreen `<canvas>` and reads back a data URL — which is exactly
 * what `react-webcam`'s `getScreenshot()` does internally.
 *
 * The public API mirrors React: `onCapture`, `width`, `height`, `facingMode`,
 * `screenshotFormat`, `mirrored`, `captureLabel`. `class` replaces `className`.
 *
 * ## The device is a resource, and this owns closing it
 *
 * A `MediaStream` holds the camera open until every track is stopped — React's
 * unmount does it via `react-webcam`'s effect cleanup. Here `destroy()` stops the
 * tracks and drops `srcObject`; forget it and the camera light stays on after the
 * element is gone. Permission denial and unsupported browsers surface as an inline
 * message rather than an unhandled rejection.
 */
export interface CameraProps extends BaseProps {
  /** Called with a data-URL screenshot on each capture. */
  onCapture?: (dataUrl: string) => void;
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
  screenshotFormat?: "image/jpeg" | "image/png" | "image/webp";
  /** Flip the preview (and the screenshot) horizontally, like a mirror. Default true. */
  mirrored?: boolean;
  /** Label on the capture button. Default "Capture". */
  captureLabel?: Child;
}

const VIDEO_CLASS = "zen-rounded-zen-md zen-border zen-border-zen-border";
const STATUS_CLASS =
  "zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg";
const BUTTON_CLASS =
  "zen-inline-flex zen-h-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-bg-zen-primary zen-px-4 zen-text-sm zen-font-medium zen-text-zen-primary-fg zen-transition-colors hover:zen-opacity-90 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2";

/** The handle adds `capture()` — the imperative equivalent of clicking the button. */
export interface CameraHandle extends ZenComponent<CameraProps> {
  /** Paint the current frame and return its data URL. Also fires `onCapture`. */
  capture(): string | null;
}

export function Camera(props: CameraProps = {}): CameraHandle {
  let current: CameraProps = {
    width: 480,
    height: 360,
    facingMode: "user",
    screenshotFormat: "image/jpeg",
    mirrored: true,
    captureLabel: "Capture",
    ...props,
  };

  const disposer = new Disposer();
  let stream: MediaStream | null = null;
  let destroyed = false;
  // What is currently streaming, so update() only restarts when it must.
  let liveKey = "";

  const el = document.createElement("div");
  el.className = cn("zen-flex zen-flex-col zen-items-center zen-gap-3", current.class);

  // The viewport holds the video and, stacked over it, a status line for the
  // loading and error states. Positioning is inline so no new zen- utility has to
  // be invented for a layout detail.
  const viewport = document.createElement("div");
  viewport.style.position = "relative";

  const video = document.createElement("video");
  video.className = VIDEO_CLASS;
  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;
  video.style.display = "block";
  video.style.objectFit = "cover";

  const status = document.createElement("div");
  status.className = STATUS_CLASS;
  status.style.position = "absolute";
  status.style.inset = "0";

  viewport.append(video, status);

  const button = document.createElement("button");
  button.type = "button";
  button.className = BUTTON_CLASS;

  el.append(viewport, button);

  const setLabel = () => button.replaceChildren(...toNodes(current.captureLabel));

  const applySize = () => {
    const { width = 480, height = 360 } = current;
    video.width = width;
    video.height = height;
    video.style.width = `${width}px`;
    video.style.height = `${height}px`;
    viewport.style.width = `${width}px`;
    viewport.style.height = `${height}px`;
  };

  const applyMirror = () => {
    video.style.transform = current.mirrored ? "scaleX(-1)" : "";
  };

  const showStatus = (text: string) => {
    status.textContent = text;
    status.style.display = "flex";
    video.style.visibility = "hidden";
  };

  const clearStatus = () => {
    status.textContent = "";
    status.style.display = "none";
    video.style.visibility = "visible";
  };

  const stopStream = () => {
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
      stream = null;
    }
    video.srcObject = null;
    liveKey = "";
  };

  const constraintKey = () =>
    `${current.facingMode}|${current.width}|${current.height}`;

  const start = async () => {
    const key = constraintKey();
    if (stream && liveKey === key) return; // already streaming these constraints
    stopStream();

    if (!navigator.mediaDevices?.getUserMedia) {
      showStatus("Camera is not available in this browser.");
      return;
    }

    showStatus("Loading camera…");
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: current.facingMode,
          width: current.width,
          height: current.height,
        },
      });
      if (destroyed) {
        for (const track of next.getTracks()) track.stop();
        return;
      }
      stream = next;
      liveKey = key;
      video.srcObject = next;
      await video.play().catch(() => {});
      clearStatus();
    } catch (err) {
      if (destroyed) return;
      const name = (err as DOMException)?.name;
      showStatus(
        name === "NotAllowedError" || name === "SecurityError"
          ? "Camera permission denied."
          : name === "NotFoundError"
            ? "No camera device was found."
            : "Could not start the camera.",
      );
    }
  };

  const capture = (): string | null => {
    if (!video.videoWidth || !video.videoHeight) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    if (current.mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL(current.screenshotFormat);
    current.onCapture?.(dataUrl);
    return dataUrl;
  };

  const onClick = () => {
    capture();
  };
  button.addEventListener("click", onClick);
  disposer.add(() => button.removeEventListener("click", onClick));
  disposer.add(stopStream);

  applySize();
  applyMirror();
  setLabel();
  void start();

  return {
    el,
    capture,
    update(next) {
      const restart =
        (next.facingMode !== undefined && next.facingMode !== current.facingMode) ||
        (next.width !== undefined && next.width !== current.width) ||
        (next.height !== undefined && next.height !== current.height);
      current = { ...current, ...next };
      el.className = cn("zen-flex zen-flex-col zen-items-center zen-gap-3", current.class);
      applySize();
      applyMirror();
      if (next.captureLabel !== undefined) setLabel();
      if (restart) void start();
    },
    destroy() {
      destroyed = true;
      disposer.dispose();
      el.remove();
    },
  };
}

Camera.displayName = "Camera";

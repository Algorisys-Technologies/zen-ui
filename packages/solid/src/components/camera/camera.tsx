import { type JSX, createSignal, onCleanup, onMount, Show, mergeProps } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * Camera — webcam capture. No dependency.
 *
 * The React binding wraps `react-webcam`; Solid talks to
 * `navigator.mediaDevices.getUserMedia` directly, so there is nothing to
 * install. Calls `onCapture` with a data-URL screenshot.
 *
 *   <Camera onCapture={(dataUrl) => save(dataUrl)} facingMode="user" />
 *
 * Requires a secure context (https or localhost) — browsers deny getUserMedia
 * over plain http. Permission denial and missing hardware are surfaced inline
 * rather than thrown.
 */

export interface CameraProps {
  onCapture?: (dataUrl: string) => void;
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
  screenshotFormat?: "image/jpeg" | "image/png" | "image/webp";
  mirrored?: boolean;
  captureLabel?: JSX.Element;
  class?: string;
}

export const Camera = (props: CameraProps) => {
  const merged = mergeProps(
    {
      width: 480,
      height: 360,
      facingMode: "user" as const,
      screenshotFormat: "image/jpeg" as const,
      mirrored: true,
      captureLabel: "Capture" as JSX.Element,
    },
    props,
  );

  const [error, setError] = createSignal<string | null>(null);
  const [ready, setReady] = createSignal(false);

  let video: HTMLVideoElement | undefined;
  let stream: MediaStream | null = null;

  const stop = () => {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
  };

  onMount(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera is unavailable — this browser has no getUserMedia, or the page is not on https/localhost.");
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: merged.facingMode,
          width: merged.width,
          height: merged.height,
        },
      });
    } catch (err) {
      const name = (err as DOMException)?.name;
      setError(
        name === "NotAllowedError"
          ? "Camera permission denied."
          : name === "NotFoundError"
            ? "No camera found."
            : `Camera failed to start${name ? ` (${name})` : ""}.`,
      );
      return;
    }
    // The component may have unmounted while getUserMedia was pending.
    if (!video) {
      stop();
      return;
    }
    video.srcObject = stream;
    try {
      await video.play();
    } catch {
      /* autoplay rejection is not fatal — the stream still paints */
    }
    setReady(true);
  });

  onCleanup(stop);

  const capture = () => {
    if (!video || !ready()) return;
    const w = video.videoWidth || merged.width;
    const h = video.videoHeight || merged.height;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (merged.mirrored) {
      // Match what the user sees: a mirrored preview yields a mirrored shot.
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    merged.onCapture?.(canvas.toDataURL(merged.screenshotFormat));
  };

  return (
    <div class={cn("zen-flex zen-flex-col zen-items-center zen-gap-3", merged.class)}>
      <Show
        when={!error()}
        fallback={
          <div
            class="zen-flex zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-p-4 zen-text-center zen-text-sm zen-text-zen-error"
            style={{ width: `${merged.width}px`, height: `${merged.height}px` }}
            role="alert"
          >
            {error()}
          </div>
        }
      >
        <video
          ref={video}
          autoplay
          playsinline
          muted
          width={merged.width}
          height={merged.height}
          class="zen-rounded-zen-md zen-border zen-border-zen-border"
          style={merged.mirrored ? { transform: "scaleX(-1)" } : undefined}
        />
      </Show>
      <button
        type="button"
        onClick={capture}
        disabled={!ready()}
        class="zen-inline-flex zen-h-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-bg-zen-primary zen-px-4 zen-text-sm zen-font-medium zen-text-zen-primary-fg zen-transition-colors hover:zen-opacity-90 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 disabled:zen-pointer-events-none disabled:zen-opacity-50"
      >
        {merged.captureLabel}
      </button>
    </div>
  );
};

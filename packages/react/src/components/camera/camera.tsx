/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * Camera — webcam capture wrapping `react-webcam` (an OPTIONAL peer dependency).
 * Lazy-loaded so it never weighs on consumers who don't capture. Install
 * `react-webcam` to use it. Calls `onCapture` with a data-URL screenshot.
 *
 *   <Camera onCapture={(dataUrl) => save(dataUrl)} facingMode="user" />
 */

export interface CameraProps {
  onCapture?: (dataUrl: string) => void;
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
  screenshotFormat?: "image/jpeg" | "image/png" | "image/webp";
  mirrored?: boolean;
  captureLabel?: React.ReactNode;
  className?: string;
}

const Webcam = React.lazy(() => import("react-webcam"));

export const Camera = ({
  onCapture,
  width = 480,
  height = 360,
  facingMode = "user",
  screenshotFormat = "image/jpeg",
  mirrored = true,
  captureLabel = "Capture",
  className,
}: CameraProps) => {
  const ref = React.useRef<any>(null);

  const capture = React.useCallback(() => {
    const shot = ref.current?.getScreenshot?.();
    if (shot) onCapture?.(shot);
  }, [onCapture]);

  return (
    <div className={cn("zen-flex zen-flex-col zen-items-center zen-gap-3", className)}>
      <React.Suspense
        fallback={
          <div
            className="zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg"
            style={{ width, height }}
          >
            Loading camera…
          </div>
        }
      >
        <Webcam
          ref={ref}
          audio={false}
          width={width}
          height={height}
          mirrored={mirrored}
          screenshotFormat={screenshotFormat}
          videoConstraints={{ facingMode, width, height }}
          className="zen-rounded-zen-md zen-border zen-border-zen-border"
        />
      </React.Suspense>
      <button
        type="button"
        onClick={capture}
        className="zen-inline-flex zen-h-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-bg-zen-primary zen-px-4 zen-text-sm zen-font-medium zen-text-zen-primary-fg zen-transition-colors hover:zen-opacity-90 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"
      >
        {captureLabel}
      </button>
    </div>
  );
};
Camera.displayName = "Camera";

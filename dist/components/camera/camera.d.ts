import { type JSX } from "solid-js";
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
export declare const Camera: (props: CameraProps) => JSX.Element;
//# sourceMappingURL=camera.d.ts.map
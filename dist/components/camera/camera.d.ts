import * as React from "react";
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
export declare const Camera: {
    ({ onCapture, width, height, facingMode, screenshotFormat, mirrored, captureLabel, className, }: CameraProps): React.JSX.Element;
    displayName: string;
};
//# sourceMappingURL=camera.d.ts.map
import { Camera } from "./camera/camera";
import { DemoPage } from "./demo-helpers";

/**
 * CameraDemo — mirrors React's NewCameraDemo. The React version wraps
 * `react-webcam`; the vanilla Camera talks to getUserMedia directly, so the demo
 * drops the "install react-webcam" note and keeps the same single section: capture
 * a frame, show the resulting data URL beside the live preview.
 */
export default function CameraDemo(): HTMLElement {
  return DemoPage({
    title: "Camera",
    description:
      "Webcam capture straight through navigator.mediaDevices.getUserMedia — no framework, no peer dependency. Calls onCapture with a data-URL screenshot, painted from the live frame via an offscreen canvas. Your browser will ask for camera permission; destroy() stops the tracks and releases the device.",
    sections: [
      {
        title: "1. Capture a frame",
        codeTitle: "onCapture → data URL",
        codeDescription:
          "onCapture fires with a data URL every time the button is clicked (or handle.capture() is called). Here it swaps the src of an <img> beside the preview.",
        code: `const preview = document.createElement("img");

const cam = Camera({
  facingMode: "user",
  width: 360,
  height: 270,
  onCapture: (dataUrl) => { preview.src = dataUrl; },
});

document.body.append(cam.el, preview);
// …later:
cam.destroy();   // stops the tracks, releases the camera`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "16px";
          row.style.flexWrap = "wrap";
          row.style.alignItems = "flex-start";

          const captured = document.createElement("div");
          captured.style.display = "none";
          captured.style.flexDirection = "column";
          captured.style.gap = "6px";

          const label = document.createElement("span");
          label.textContent = "Captured";
          label.style.fontSize = "0.75rem";
          label.style.color = "var(--zen-color-muted-fg)";

          const img = document.createElement("img");
          img.alt = "captured frame";
          img.style.width = "180px";
          img.style.borderRadius = "8px";
          img.style.border = "1px solid var(--zen-color-border)";

          captured.append(label, img);

          const cam = Camera({
            width: 360,
            height: 270,
            onCapture: (dataUrl) => {
              img.src = dataUrl;
              captured.style.display = "flex";
            },
          });

          row.append(cam.el, captured);
          return row;
        },
      },
    ],
  });
}

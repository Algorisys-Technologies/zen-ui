import { DemoPage } from "./demo-helpers";

/**
 * Camera demo — the web-components port. <zen-camera> talks to getUserMedia
 * directly. `width` / `height` / `facing-mode` are attributes; it fires
 * `zen-capture` with a data-URL screenshot each time the button is clicked (or
 * `el.capture()` is called). The handle's destroy() releases the device.
 */
export default function CameraDemo(): HTMLElement {
  return DemoPage({
    title: "Camera",
    description:
      "Webcam capture straight through navigator.mediaDevices.getUserMedia — no framework, no peer dependency. Fires zen-capture with a data-URL screenshot, painted from the live frame via an offscreen canvas. Your browser will ask for camera permission; removing the element stops the tracks and releases the device.",
    sections: [
      {
        title: "1. Capture a frame",
        codeTitle: "zen-capture → data URL",
        codeDescription:
          "zen-capture fires with a data URL every time the button is clicked (or el.capture() is called). Here it swaps the src of an <img> beside the preview.",
        code: `<zen-camera width="360" height="270"></zen-camera>

const cam = document.querySelector("zen-camera");
cam.addEventListener("zen-capture", (e) => { preview.src = e.detail; });
// …later:
cam.remove();   // stops the tracks, releases the camera`,
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

          const cam = document.createElement("zen-camera");
          cam.setAttribute("width", "360");
          cam.setAttribute("height", "270");
          cam.addEventListener("zen-capture", (e) => {
            img.src = (e as CustomEvent).detail as string;
            captured.style.display = "flex";
          });

          row.append(cam, captured);
          return row;
        },
      },
    ],
  });
}

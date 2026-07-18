import { Camera, type CameraProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Webcam capture. `mirrored` defaults TRUE, so it is a JS prop; `captureLabel` is a
// Child slot for the button, set as a JS prop. The handle's capture() auto-forwards.
defineZenElement<CameraProps>({
  tag: "zen-camera",
  factory: Camera,
  attrs: {
    width: "number",
    height: "number",
    "facing-mode": "string",
    "screenshot-format": "string",
  },
  props: ["mirrored", "captureLabel"],
  events: { onCapture: "zen-capture" },
  childrenProp: false,
});

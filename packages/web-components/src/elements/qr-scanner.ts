import { QRScanner, type QRScannerProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Camera QR / barcode scanner. `onScan` (and `onError`) map to events. `formats`,
// the `decode` fn and the `fallback` slot are JS props. The camera surface's
// `aria-label` is not exposed as an attr — its bracketed prop key would not survive
// the attribute->camelCase mapping — so set it on the host element directly.
defineZenElement<QRScannerProps>({
  tag: "zen-qr-scanner",
  factory: QRScanner,
  attrs: {
    "facing-mode": "string",
    paused: "boolean",
    "cooldown-ms": "number",
    "aspect-ratio": "number",
    "hide-viewfinder": "boolean",
  },
  props: ["formats", "decode", "fallback"],
  events: { onScan: "zen-scan", onError: "zen-error" },
  childrenProp: false,
});

import { QRCode, Barcode, type QRCodeProps, type BarcodeProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-qr-code value="GP/26/0815" ecc="H" size="160" label="Gate pass QR"></zen-qr-code>
 * <zen-barcode value="890123456789" format="ean13"></zen-barcode>
 *
 * Every prop is a scalar, so every prop is an attribute, and changing one
 * redraws. The factory swaps its <svg> for the reason a value cannot be encoded
 * (and back) in place inside the host. `show-text` defaults to TRUE, so it is
 * json (`show-text="false"`): as a boolean attribute, absent would mean false.
 */
defineZenElement<QRCodeProps>({
  tag: "zen-qr-code",
  factory: QRCode,
  attrs: {
    value: "string",
    ecc: "string",
    size: "number",
    "quiet-zone": "number",
    "min-version": "number",
    label: "string",
  },
  childrenProp: false,
});

defineZenElement<BarcodeProps>({
  tag: "zen-barcode",
  factory: Barcode,
  attrs: {
    value: "string",
    format: "string",
    height: "number",
    "module-width": "number",
    "show-text": "json",
    "quiet-zone": "number",
    label: "string",
  },
  childrenProp: false,
});

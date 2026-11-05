import * as React from "react";
import {
  encodeBarcode,
  encodeQr,
  qrPath,
  type BarcodeFormat,
  type QrEcc,
  type CodeError as CodeErrorResult,
} from "@algorisys/zen-ui-core/barcode";
import { cn } from "../../lib/cn";
import { useLocale, type MessageKey } from "../locale/locale";

export type { BarcodeFormat, QrEcc };

/**
 * QRCode and Barcode — codes drawn as SVG, for screens and for print: the
 * e-invoice's signed QR, a gate pass, an item label.
 *
 *   <QRCode value={signedQr} ecc="M" size={160} label="e-invoice QR" />
 *   <Barcode value="ITM-0042" format="code128" />
 *   <Barcode value="400638133393" format="ean13" />   // check digit added
 *
 * Drawn dark on light whatever the theme (the --zen-code-dark and
 * --zen-code-light tokens, black and white by default): scanners read inverted
 * codes badly, and paper is light. The quiet zone (4 modules round a QR, 10
 * either side of bars) is part of the drawing, because a code printed hard
 * against a border does not scan. A value that cannot be encoded shows why, in
 * place of the code, rather than a code that scans as something else. The
 * encoding is @algorisys/zen-ui-core/barcode (check:barcode, which decodes every
 * symbol with an independent reader).
 */
export type QRCodeProps = {
  value: string;
  /** Error correction: L 7%, M 15% (default), Q 25%, H 30% of the code can be damaged or covered. */
  ecc?: QrEcc;
  /** Width and height in px, quiet zone included. Default 128. */
  size?: number;
  /** Light modules round the code. Default 4, the standard's minimum. */
  quietZone?: number;
  /** The smallest version (a fixed size on a printed form). */
  minVersion?: number;
  /** What it is, for assistive tech: "e-invoice QR". Default "QR code". */
  label?: string;
  className?: string;
};

export const QRCode = ({ value, ecc, size = 128, quietZone = 4, minVersion, label, className }: QRCodeProps) => {
  const loc = useLocale();
  const code = React.useMemo(() => encodeQr(value, { ecc, minVersion }), [value, ecc, minVersion]);
  if (!code.ok) {
    return <CodeError size={`${size}px`} message={code} what={loc.t("barcode.qrCode")} className={className} />;
  }
  const n = code.size + quietZone * 2;
  return (
    <svg
      role="img"
      aria-label={label ?? loc.t("barcode.qrCode")}
      data-version={code.version}
      data-ecc={code.ecc}
      width={size}
      height={size}
      viewBox={`0 0 ${n} ${n}`}
      shapeRendering="crispEdges"
      className={cn("zen-block zen-shrink-0", className)}
    >
      <rect width={n} height={n} fill="var(--zen-code-light)" />
      <path d={qrPath(code.modules, quietZone)} fill="var(--zen-code-dark)" />
    </svg>
  );
};

export type BarcodeProps = {
  value: string;
  /** Default "code128" (any ASCII). "ean13": 12 digits (the check digit is added) or 13. "code39": 0–9, A–Z, space, - . $ / + %. */
  format?: BarcodeFormat;
  /** Height of the bars in px. Default 64. */
  height?: number;
  /** Width of the narrowest bar in px. Default 2. Print at 1 px and many scanners miss it. */
  moduleWidth?: number;
  /** The value printed under the bars. Default true. */
  showText?: boolean;
  /** Light modules either side. Default 10. */
  quietZone?: number;
  /** What it is, for assistive tech. Default: the format and the value. */
  label?: string;
  className?: string;
};

const FORMAT_NAME: Record<BarcodeFormat, string> = { code128: "Code 128", ean13: "EAN-13", code39: "Code 39" };

export const Barcode = ({
  value,
  format = "code128",
  height: barHeight = 64,
  moduleWidth: unit = 2,
  showText = true,
  quietZone: quiet = 10,
  label,
  className,
}: BarcodeProps) => {
  const code = React.useMemo(() => encodeBarcode(value, format), [value, format]);
  if (!code.ok) {
    return <CodeError size={`${barHeight}px`} message={code} what={FORMAT_NAME[format]} className={className} />;
  }
  const textSize = Math.max(10, unit * 6);
  const width = (code.length + quiet * 2) * unit;
  const height = barHeight + (showText ? textSize + unit * 2 : 0);
  // Bars as one path: each dark run a rectangle, in module units scaled by `unit`.
  let x = quiet;
  let d = "";
  code.widths.forEach((w, i) => {
    if (i % 2 === 0) d += `M${x * unit} 0h${w * unit}v${barHeight}h${-w * unit}z`;
    x += w;
  });
  return (
    <svg
      role="img"
      aria-label={label ?? `${FORMAT_NAME[format]} ${code.text}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={cn("zen-block zen-shrink-0", className)}
    >
      <rect width={width} height={height} fill="var(--zen-code-light)" />
      <path d={d} fill="var(--zen-code-dark)" />
      {showText && (
        <text
          x={width / 2}
          y={barHeight + unit + textSize}
          textAnchor="middle"
          fontSize={String(textSize)}
          fontFamily="var(--zen-font-mono)"
          fill="var(--zen-code-dark)"
          aria-hidden="true"
        >
          {code.text}
        </text>
      )}
    </svg>
  );
};

/** In place of a code that cannot be drawn: why, where the code would be. */
const CodeError = ({
  size,
  message: m,
  what,
  className,
}: {
  size: string;
  message: CodeErrorResult;
  what: string;
  className?: string;
}) => {
  const loc = useLocale();
  // The catalogue's sentence for core's error code; core's English when it has none.
  const message = m.code ? loc.t(`barcode.error.${m.code}` as MessageKey, m.values) : m.error;
  const text = loc.t("barcode.noCode", { what, message });
  return (
    <span
      role="img"
      aria-label={text}
      title={message}
      style={{ minHeight: size }}
      className={cn(
        "zen-inline-flex zen-max-w-full zen-items-center zen-justify-center zen-rounded-zen-sm zen-border zen-border-dashed zen-border-zen-error zen-p-2 zen-text-center zen-text-xs zen-text-zen-error",
        className,
      )}
    >
      {text}
    </span>
  );
};

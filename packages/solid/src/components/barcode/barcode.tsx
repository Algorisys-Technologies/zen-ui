import { Show, createMemo, splitProps } from "solid-js";
import {
  encodeBarcode,
  encodeQr,
  qrPath,
  type BarcodeFormat,
  type QrEcc,
} from "@algorisys/zen-ui-core/barcode";
import { cn } from "../../lib/cn";

export type { BarcodeFormat, QrEcc };

type Encoded<T> = (T & { ok: true }) | { ok: false; error: string };
const drawn = <T,>(c: Encoded<T>) => (c.ok ? c : undefined);
const whyNot = <T,>(c: Encoded<T>) => (c.ok ? "" : c.error);

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
  class?: string;
};

export const QRCode = (props: QRCodeProps) => {
  const [local] = splitProps(props, ["value", "ecc", "size", "quietZone", "minVersion", "label", "class"]);
  const code = createMemo(() => encodeQr(local.value, { ecc: local.ecc, minVersion: local.minVersion }));
  const quiet = () => local.quietZone ?? 4;
  const size = () => local.size ?? 128;
  return (
    <Show
      when={drawn(code())}
      fallback={<CodeError size={`${size()}px`} message={whyNot(code())} what="QR code" class={local.class} />}
    >
      {(c) => {
        const n = () => c().size + quiet() * 2;
        return (
          <svg
            role="img"
            aria-label={local.label ?? "QR code"}
            data-version={c().version}
            data-ecc={c().ecc}
            width={size()}
            height={size()}
            viewBox={`0 0 ${n()} ${n()}`}
            shape-rendering="crispEdges"
            class={cn("zen-block zen-shrink-0", local.class)}
          >
            <rect width={n()} height={n()} fill="var(--zen-code-light)" />
            <path d={qrPath(c().modules, quiet())} fill="var(--zen-code-dark)" />
          </svg>
        );
      }}
    </Show>
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
  class?: string;
};

const FORMAT_NAME: Record<BarcodeFormat, string> = { code128: "Code 128", ean13: "EAN-13", code39: "Code 39" };

export const Barcode = (props: BarcodeProps) => {
  const [local] = splitProps(props, ["value", "format", "height", "moduleWidth", "showText", "quietZone", "label", "class"]);
  const format = () => local.format ?? "code128";
  const code = createMemo(() => encodeBarcode(local.value, format()));
  const unit = () => local.moduleWidth ?? 2;
  const quiet = () => local.quietZone ?? 10;
  const barHeight = () => local.height ?? 64;
  const textSize = () => Math.max(10, unit() * 6);
  return (
    <Show
      when={drawn(code())}
      fallback={<CodeError size={`${barHeight()}px`} message={whyNot(code())} what={FORMAT_NAME[format()]} class={local.class} />}
    >
      {(c) => {
        const width = () => (c().length + quiet() * 2) * unit();
        const height = () => barHeight() + (local.showText === false ? 0 : textSize() + unit() * 2);
        // Bars as one path: each dark run a rectangle, in module units scaled by `unit`.
        const path = () => {
          let x = quiet();
          let d = "";
          c().widths.forEach((w, i) => {
            if (i % 2 === 0) d += `M${x * unit()} 0h${w * unit()}v${barHeight()}h${-w * unit()}z`;
            x += w;
          });
          return d;
        };
        return (
          <svg
            role="img"
            aria-label={local.label ?? `${FORMAT_NAME[format()]} ${c().text}`}
            width={width()}
            height={height()}
            viewBox={`0 0 ${width()} ${height()}`}
            shape-rendering="crispEdges"
            class={cn("zen-block zen-shrink-0", local.class)}
          >
            <rect width={width()} height={height()} fill="var(--zen-code-light)" />
            <path d={path()} fill="var(--zen-code-dark)" />
            <Show when={local.showText !== false}>
              <text
                x={width() / 2}
                y={barHeight() + unit() + textSize()}
                text-anchor="middle"
                font-size={String(textSize())}
                font-family="var(--zen-font-mono)"
                fill="var(--zen-code-dark)"
                aria-hidden="true"
              >
                {c().text}
              </text>
            </Show>
          </svg>
        );
      }}
    </Show>
  );
};

/** In place of a code that cannot be drawn: why, where the code would be. */
const CodeError = (props: { size: string; message: string; what: string; class?: string }) => (
  <span
    role="img"
    aria-label={`No ${props.what}: ${props.message}`}
    title={props.message}
    style={{ "min-height": props.size }}
    class={cn(
      "zen-inline-flex zen-max-w-full zen-items-center zen-justify-center zen-rounded-zen-sm zen-border zen-border-dashed zen-border-zen-error zen-p-2 zen-text-center zen-text-xs zen-text-zen-error",
      props.class,
    )}
  >
    {`No ${props.what}: ${props.message}`}
  </span>
);

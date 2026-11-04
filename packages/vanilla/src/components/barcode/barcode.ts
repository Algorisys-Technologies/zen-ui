import {
  encodeBarcode,
  encodeQr,
  qrPath,
  type BarcodeFormat,
  type QrEcc,
  type CodeError as CodeErrorResult,
} from "@algorisys/zen-ui-core/barcode";
import { cn } from "../../lib/cn";
import type { ZenComponent } from "../../lib/component";
import { useLocale, type LocaleContextValue, type MessageKey } from "../locale/locale";

export type { BarcodeFormat, QrEcc };

/**
 * QRCode and Barcode — codes drawn as SVG, for screens and for print: the
 * e-invoice's signed QR, a gate pass, an item label.
 *
 *   QRCode({ value: signedQr, ecc: "M", size: 160, label: "e-invoice QR" })
 *   Barcode({ value: "ITM-0042", format: "code128" })
 *   Barcode({ value: "400638133393", format: "ean13" })   // check digit added
 *
 * Drawn dark on light whatever the theme (the --zen-code-dark and
 * --zen-code-light tokens, black and white by default): scanners read inverted
 * codes badly, and paper is light. The quiet zone (4 modules round a QR, 10
 * either side of bars) is part of the drawing, because a code printed hard
 * against a border does not scan. A value that cannot be encoded shows why, in
 * place of the code, rather than a code that scans as something else. The
 * encoding is @algorisys/zen-ui-core/barcode (check:barcode, which decodes every
 * symbol with an independent reader).
 *
 * `el` is an `<svg>`, or a `<span>` saying why there is no code. update()
 * redraws, and swaps the node in place when one becomes the other, so read
 * `el` from the handle rather than keeping the first one.
 */
export interface QRCodeProps {
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
}

export interface BarcodeProps {
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
}

const SVG_NS = "http://www.w3.org/2000/svg";
const FORMAT_NAME: Record<BarcodeFormat, string> = { code128: "Code 128", ean13: "EAN-13", code39: "Code 39" };

const svgEl = (tag: string, attrs: Record<string, string | number>) => {
  const e = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
};

/** A rebuild-on-update handle whose node may change kind (svg ↔ span), swapped in place. */
function redrawn<P>(props: P, draw: (p: P) => Element): ZenComponent<P, Element> {
  let current = { ...props };
  let el = draw(current);
  return {
    get el() {
      return el;
    },
    update(next) {
      current = { ...current, ...next };
      const replacement = draw(current);
      el.replaceWith(replacement);
      el = replacement;
    },
    destroy() {
      el.remove();
    },
  };
}

/** In place of a code that cannot be drawn: why, where the code would be. */
function codeError(loc: LocaleContextValue, size: string, m: CodeErrorResult, what: string, className?: string) {
  // The catalogue's sentence for core's error code; core's English when it has none.
  const message = m.code ? loc.t(`barcode.error.${m.code}` as MessageKey, m.values) : m.error;
  const text = loc.t("barcode.noCode", { what, message });
  const span = document.createElement("span");
  span.setAttribute("role", "img");
  span.setAttribute("aria-label", text);
  span.title = message;
  span.style.minHeight = size;
  span.className = cn(
    "zen-inline-flex zen-max-w-full zen-items-center zen-justify-center zen-rounded-zen-sm zen-border zen-border-dashed zen-border-zen-error zen-p-2 zen-text-center zen-text-xs zen-text-zen-error",
    className,
  );
  span.textContent = text;
  return span;
}

export function QRCode(props: QRCodeProps): ZenComponent<QRCodeProps, Element> {
  // The provider building this code; its words are used on every redraw.
  const loc = useLocale();
  return redrawn(props, ({ value, ecc, size = 128, quietZone = 4, minVersion, label, class: className }) => {
    const code = encodeQr(value, { ecc, minVersion });
    if (!code.ok) return codeError(loc, `${size}px`, code, loc.t("barcode.qrCode"), className);
    const n = code.size + quietZone * 2;
    const svg = svgEl("svg", {
      role: "img",
      "aria-label": label ?? loc.t("barcode.qrCode"),
      "data-version": code.version,
      "data-ecc": code.ecc,
      width: size,
      height: size,
      viewBox: `0 0 ${n} ${n}`,
      "shape-rendering": "crispEdges",
      // `class` on an SVG element is an attribute, not the HTML className property.
      class: cn("zen-block zen-shrink-0", className),
    });
    svg.append(
      svgEl("rect", { width: n, height: n, fill: "var(--zen-code-light)" }),
      svgEl("path", { d: qrPath(code.modules, quietZone), fill: "var(--zen-code-dark)" }),
    );
    return svg;
  });
}

export function Barcode(props: BarcodeProps): ZenComponent<BarcodeProps, Element> {
  const loc = useLocale();
  return redrawn(
    props,
    ({
      value,
      format = "code128",
      height: barHeight = 64,
      moduleWidth: unit = 2,
      showText = true,
      quietZone: quiet = 10,
      label,
      class: className,
    }) => {
      const code = encodeBarcode(value, format);
      if (!code.ok) return codeError(loc, `${barHeight}px`, code, FORMAT_NAME[format], className);
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
      const svg = svgEl("svg", {
        role: "img",
        "aria-label": label ?? `${FORMAT_NAME[format]} ${code.text}`,
        width,
        height,
        viewBox: `0 0 ${width} ${height}`,
        "shape-rendering": "crispEdges",
        class: cn("zen-block zen-shrink-0", className),
      });
      svg.append(
        svgEl("rect", { width, height, fill: "var(--zen-code-light)" }),
        svgEl("path", { d, fill: "var(--zen-code-dark)" }),
      );
      if (showText) {
        const text = svgEl("text", {
          x: width / 2,
          y: barHeight + unit + textSize,
          "text-anchor": "middle",
          "font-size": textSize,
          "font-family": "var(--zen-font-mono)",
          fill: "var(--zen-code-dark)",
          "aria-hidden": "true",
        });
        text.textContent = code.text;
        svg.append(text);
      }
      return svg;
    },
  );
}

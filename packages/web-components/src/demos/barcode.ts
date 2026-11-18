import { encodeQr, type QrEcc } from "@algorisys/zen-ui-core/barcode";
import { DemoPage } from "./demo-helpers";

/**
 * QRCode / Barcode demo — the web-components port. Every prop of <zen-qr-code>
 * and <zen-barcode> is a scalar attribute, so the live sections just set
 * attributes and the element redraws.
 */

// The shape of an IRP signed QR: a JWS (header.payload.signature) carrying the
// seller and buyer GSTINs, the document, its value and the IRN. Made up here,
// signature included; its length is what matters (about 750 characters).
const SIGNED_QR =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE1MTNCODIxRUU0NkJEQ0E1NzJENDRCMjlGN0MyRDQxNzdBM0QyMzgiLCJ0eXAiOiJKV1QifQ." +
  btoa(JSON.stringify({
    data: JSON.stringify({
      SellerGstin: "27AAACR5055K1Z7", BuyerGstin: "29AABCT1332L1ZU", DocNo: "SI/26/0042", DocTyp: "INV", DocDt: "04/11/2026",
      TotInvVal: 118000.5, ItemCnt: 3, MainHsnCode: "73181500",
      Irn: "b7f3c1e94a0d2f6e8c5b1a3d7e9f0c2b4a6d8e0f1c3b5a7d9e1f3c5b7a9d0e2f", IrnDt: "2026-11-04 10:42:00",
    }),
    iss: "NIC Sandbox",
  })).replace(/=+$/, "") +
  ".kD2vJ8xQmP4zR7tY1uW9sB3nC6fH0gL5aE2iO8jK4dM7rT1vX9yZ3bN6cQ0wS5eU8hG2lA4pF7kJ1mD9oR3tI6zV0xY4qW8sB2nC5fH9gL3aE7iO1jK5dM8rT2vX6yZ0bN4cQ7wS1eU5hG9lA3pF6kJ0mD8oR2tI5zV9xY3qW7";

const LEVELS: QrEcc[] = ["L", "M", "Q", "H"];
const version = (t: string, ecc: QrEcc) => {
  const r = encodeQr(t, { ecc });
  return r.ok ? `version ${r.version}, ${r.size}×${r.size}` : r.error;
};

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className: string, ...kids: (Node | string)[]) => {
  const e = document.createElement(tag);
  e.className = className;
  e.append(...kids);
  return e;
};
function zen(tag: string, attrs: Record<string, string | number>): HTMLElement {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}
const figure = (code: Node, ...caption: (Node | string)[]) =>
  el(
    "figure",
    "zen-m-0 zen-flex zen-flex-col zen-gap-1.5",
    code,
    el("figcaption", "zen-text-xs zen-text-zen-muted-fg", ...caption),
  );

/** A labelled <zen-input>. The id belongs on the INNER <input> (see LabelDemo). */
function field(id: string, label: string, value: string, onInput: (v: string) => void, width: string) {
  const l = document.createElement("zen-label");
  l.setAttribute("for", id);
  l.textContent = label;
  const input = zen("zen-input", { value });
  requestAnimationFrame(() => {
    const control = input.querySelector("input");
    if (control) control.id = id;
  });
  // The native input event bubbles from the inner <input> through the host.
  input.addEventListener("input", (e) => onInput((e.target as HTMLInputElement).value));
  return el("div", `zen-flex ${width} zen-flex-col zen-gap-1.5`, l, input);
}

export default function BarcodeDemo(): HTMLElement {
  return DemoPage({
    title: "QRCode and Barcode",
    description:
      "Codes drawn as SVG, for screens and print: the e-invoice's signed QR, a gate pass, an item label. Dark on light whatever the theme, quiet zone included, and a value that cannot be encoded says why instead of drawing a code that scans as something else.",
    sections: [
      {
        title: "1. The e-invoice QR",
        codeTitle: "The IRP's signed QR, as the invoice prints it",
        codeDescription:
          "Several hundred characters of signed JSON: at level M, a symbol about a hundred modules a side (the exact size is shown beside it). Print it at 3 cm or more. The QR here is made up, signature included.",
        code: `<zen-qr-code ecc="M" size="192" label="e-invoice QR"></zen-qr-code>
<script>
  document.querySelector("zen-qr-code").value = invoice.signedQrCode;
</script>`,
        render: () => {
          const length = el("dd", "zen-m-0", String(SIGNED_QR.length));
          length.dataset.testid = "qr-length";
          const symbol = el("dd", "zen-m-0", version(SIGNED_QR, "M"));
          symbol.dataset.testid = "qr-version";
          return el(
            "div",
            "zen-flex zen-flex-wrap zen-items-start zen-gap-6",
            zen("zen-qr-code", { value: SIGNED_QR, ecc: "M", size: 192, label: "e-invoice QR" }),
            el(
              "dl",
              "zen-m-0 zen-grid zen-grid-cols-[auto_1fr] zen-gap-x-4 zen-gap-y-1 zen-text-sm",
              el("dt", "zen-text-zen-muted-fg", "Characters"),
              length,
              el("dt", "zen-text-zen-muted-fg", "Symbol"),
              symbol,
            ),
          );
        },
      },
      {
        title: "2. Error correction",
        codeTitle: "The same text at each level",
        codeDescription:
          "Higher levels survive more damage (a fold, a smudge, a logo over the middle) at the price of a bigger symbol. M is the default; H for codes that live on the shop floor. Type to change the text.",
        code: `<zen-qr-code value="GP/26/0815" ecc="L"></zen-qr-code>  <zen-qr-code value="GP/26/0815" ecc="H"></zen-qr-code>
<script>
  // as the text changes:
  qr.setAttribute("value", next);
</script>`,
        render: () => {
          const text = "GP/26/0815 · Vehicle MH12 AB 4521 · Gate 2";
          const levels = LEVELS.map((ecc) => {
            const qr = zen("zen-qr-code", { value: text, ecc, size: 128, label: `Gate pass QR, level ${ecc}` });
            const detail = document.createTextNode(` · ${version(text, ecc)}`);
            const fig = figure(qr, el("span", "zen-font-medium zen-text-zen-foreground", ecc), detail);
            fig.classList.add("zen-items-center");
            return { ecc, qr, detail, fig };
          });
          const input = field(
            "qr-text",
            "Text",
            text,
            (v) => {
              for (const l of levels) {
                l.qr.setAttribute("value", v);
                l.detail.textContent = ` · ${version(v, l.ecc)}`;
              }
            },
            "zen-max-w-md",
          );
          return el(
            "div",
            "zen-flex zen-w-full zen-flex-col zen-gap-4",
            input,
            el("div", "zen-flex zen-flex-wrap zen-gap-6", ...levels.map((l) => l.fig)),
          );
        },
      },
      {
        title: "3. Barcodes",
        codeTitle: "Code 128, EAN-13, Code 39",
        codeDescription:
          "Code 128 holds any ASCII and packs runs of digits two to a bar pattern. EAN-13 takes 12 digits and adds the check digit (13 are checked). Code 39 is for older readers: upper case, digits and a few symbols.",
        code: `<zen-barcode value="ITM-0042"></zen-barcode>
<zen-barcode value="890123456789" format="ean13"></zen-barcode>
<zen-barcode value="SI-26-0042" format="code39"></zen-barcode>`,
        render: () =>
          el(
            "div",
            "zen-flex zen-flex-wrap zen-items-end zen-gap-8",
            figure(zen("zen-barcode", { value: "ITM-0042" }), "Code 128 · item label"),
            figure(zen("zen-barcode", { value: "890123456789", format: "ean13" }), "EAN-13 · check digit added"),
            figure(zen("zen-barcode", { value: "SI-26-0042", format: "code39" }), "Code 39"),
          ),
      },
      {
        title: "4. Try one",
        codeTitle: "What cannot be encoded says why",
        codeDescription:
          "Try lower case in Code 39, a wrong check digit in EAN-13 (4006381333932), or ₹ in Code 128: the code is replaced by the reason, never by bars that scan as something else.",
        code: `<zen-barcode value="ITM-0042" format="code128"></zen-barcode>
<script>
  code.setAttribute("value", value);
  code.setAttribute("format", format);
</script>`,
        render: () => {
          const code = zen("zen-barcode", { value: "ITM-0042", format: "code128" });
          const box = el("div", "", code);
          box.dataset.testid = "try-barcode";
          const input = field("bar-text", "Value", "ITM-0042", (v) => code.setAttribute("value", v), "zen-w-64");
          const formats = zen("zen-segmented-button", { "aria-label": "Format", value: "code128" }) as HTMLElement & {
            items: { value: string; label: string }[];
          };
          formats.items = [
            { value: "code128", label: "Code 128" },
            { value: "ean13", label: "EAN-13" },
            { value: "code39", label: "Code 39" },
          ];
          formats.addEventListener("zen-value-change", (e) => {
            const v = (e as CustomEvent<string>).detail;
            formats.setAttribute("value", v);
            code.setAttribute("format", v);
          });
          return el(
            "div",
            "zen-flex zen-w-full zen-flex-col zen-gap-4",
            el("div", "zen-flex zen-flex-wrap zen-items-end zen-gap-4", input, formats),
            box,
          );
        },
      },
    ],
  });
}

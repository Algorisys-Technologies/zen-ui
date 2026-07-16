import { QRScanner, type QRScannerScan } from "./qr-scanner/qr-scanner";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

/**
 * QRScannerDemo — the vanilla port of NewQRScannerDemo. Same six sections, same
 * code snippets. State that React held in useState lives in closures here, and the
 * places React re-rendered become targeted DOM writes.
 */
export default function QRScannerDemo(): HTMLElement {
  return DemoPage({
    title: "QRScanner",
    description:
      "Camera-based barcode / QR scanner backed by the native BarcodeDetector API (Chromium, Safari 17+). Firefox and other browsers without the API can plug in their own decoder via the decode prop (jsQR, @zxing/browser) — we deliberately don't bundle one. Common use cases: KYC document handoff, payment QRs, device pairing, lobby check-in. Note: camera access requires a secure context (HTTPS, or localhost) and explicit permission. If the surface below shows a fallback, that's expected.",
    sections: [
      {
        title: "1. Basic — scan QR codes",
        codeTitle: "QRScanner({ onScan })",
        code: `const last = document.createElement("code");
const scanner = QRScanner({ onScan: (s) => { last.textContent = s.rawValue; } });
document.body.append(scanner.el, last);`,
        render: () => {
          const col = column(360);

          const status = document.createElement("div");
          status.style.fontSize = "0.8125rem";
          status.style.color = "var(--zen-color-muted-fg)";
          const placeholder = document.createElement("em");
          placeholder.textContent = "(waiting…)";
          status.append("Last scan: ", placeholder);

          const scanner = QRScanner({
            onScan: (s: QRScannerScan) => {
              const code = document.createElement("code");
              code.textContent = s.rawValue;
              status.replaceChildren("Last scan: ", code);
            },
          });

          col.append(scanner.el, status);
          return col;
        },
      },
      {
        title: "2. Pause / resume",
        codeTitle: "paused — stops camera tracks; resume by flipping false",
        codeDescription:
          "Useful when the parent modal closes, the tab is hidden, or after a confirmed scan.",
        code: `const scanner = QRScanner({ paused, onScan });
btn.el.addEventListener("click", () => scanner.update({ paused: !paused }));`,
        render: () => {
          const col = column(360);
          let paused = false;
          const scanner = QRScanner({ paused, onScan: () => {} });
          const btn = Button({ children: "Pause camera" });
          btn.el.addEventListener("click", () => {
            paused = !paused;
            scanner.update({ paused });
            btn.update({ children: paused ? "Resume camera" : "Pause camera" });
          });
          col.append(scanner.el, btn.el);
          return col;
        },
      },
      {
        title: "3. Switch camera",
        codeTitle: 'facingMode — "environment" (back) vs "user" (selfie)',
        code: `const scanner = QRScanner({ facingMode: facing, onScan });
btn.el.addEventListener("click", () => scanner.update({ facingMode: facing }));`,
        render: () => {
          const col = column(360);
          let facing: "environment" | "user" = "environment";
          const scanner = QRScanner({ facingMode: facing, onScan: () => {} });
          const btn = Button({ variant: "outline", children: "Switch to front camera" });
          btn.el.addEventListener("click", () => {
            facing = facing === "environment" ? "user" : "environment";
            scanner.update({ facingMode: facing });
            btn.update({ children: `Switch to ${facing === "environment" ? "front" : "back"} camera` });
          });
          col.append(scanner.el, btn.el);
          return col;
        },
      },
      {
        title: "4. Multiple formats — 1D barcodes too",
        codeTitle: 'formats: ["qr_code", "ean_13", "code_128"]',
        codeDescription:
          "Native BarcodeDetector supports a range of formats — check getSupportedFormats() in your target browser.",
        code: `QRScanner({
  formats: ["qr_code", "ean_13", "code_128"],
  onScan: (s) => console.log(s.format, s.rawValue),
});`,
        render: () => {
          const box = document.createElement("div");
          box.style.maxWidth = "360px";
          const scanner = QRScanner({
            formats: ["qr_code", "ean_13", "code_128"],
            onScan: () => {},
          });
          box.append(scanner.el);
          return box;
        },
      },
      {
        title: "5. Custom polyfill — jsQR / zxing",
        codeTitle: "decode prop — for browsers without BarcodeDetector",
        codeDescription:
          "When the native API isn't available, pass an async decoder that takes the live video element and returns a scan (or null). Example with jsQR:",
        code: `import jsQR from "jsqr";

const decode = async (video: HTMLVideoElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, 0, 0);
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(img.data, img.width, img.height);
  return code ? { rawValue: code.data, format: "qr_code" } : null;
};

QRScanner({ decode, onScan });`,
        render: () => document.createDocumentFragment(),
      },
      {
        title: "6. Scan history",
        codeTitle: "Cooldown dedupes — same QR within 1.5 s only fires once",
        codeDescription:
          "Repeated identical scans inside cooldownMs are suppressed so onScan doesn't spam the parent.",
        code: `const scanner = QRScanner({
  cooldownMs: 1500,
  onScan: (s) => prepend(s.rawValue),
});`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "16px";
          row.style.alignItems = "flex-start";
          row.style.flexWrap = "wrap";

          const left = document.createElement("div");
          left.style.width = "280px";

          const right = document.createElement("div");
          right.style.flex = "1";
          right.style.minWidth = "240px";
          const h3 = document.createElement("h3");
          h3.style.margin = "0 0 0.5rem 0";
          h3.style.fontSize = "0.875rem";
          h3.textContent = "Recent";
          const empty = document.createElement("p");
          empty.style.fontSize = "0.8125rem";
          empty.style.color = "var(--zen-color-muted-fg)";
          empty.textContent = "No scans yet.";
          const list = document.createElement("ul");
          list.style.listStyle = "none";
          list.style.padding = "0";
          list.style.margin = "0";
          list.style.fontSize = "0.8125rem";
          right.append(h3, empty);

          const history: string[] = [];
          const scanner = QRScanner({
            onScan: (s: QRScannerScan) => {
              history.unshift(s.rawValue);
              history.splice(8);
              if (empty.isConnected) empty.remove();
              if (!list.isConnected) right.append(list);
              list.replaceChildren(
                ...history.map((v) => {
                  const li = document.createElement("li");
                  li.style.padding = "0.3125rem 0";
                  li.style.borderBottom = "1px solid var(--zen-color-border)";
                  const code = document.createElement("code");
                  code.textContent = v;
                  li.append(code);
                  return li;
                }),
              );
            },
          });

          left.append(scanner.el);
          row.append(left, right);
          return row;
        },
      },
    ],
  });
}

function column(maxWidth: number): HTMLElement {
  const col = document.createElement("div");
  col.style.display = "flex";
  col.style.flexDirection = "column";
  col.style.gap = "12px";
  col.style.maxWidth = `${maxWidth}px`;
  return col;
}

import { DemoPage } from "./demo-helpers";

/**
 * QRScannerDemo — the web-components port of the QRScanner demo. Same six
 * sections, same snippets. `onScan` maps to the `zen-scan` event (detail is the
 * { rawValue, format } scan); `paused` / `facing-mode` are boolean/string attrs;
 * `formats` and `decode` are JS properties.
 */

interface QRScannerScan {
  rawValue: string;
  format: string;
}

function column(maxWidth: number): HTMLElement {
  const col = document.createElement("div");
  col.style.display = "flex";
  col.style.flexDirection = "column";
  col.style.gap = "12px";
  col.style.maxWidth = `${maxWidth}px`;
  return col;
}

export default function QRScannerDemo(): HTMLElement {
  return DemoPage({
    title: "QRScanner",
    description:
      "Camera-based barcode / QR scanner backed by the native BarcodeDetector API (Chromium, Safari 17+). Firefox and other browsers without the API can plug in their own decoder via the decode prop (jsQR, @zxing/browser) — we deliberately don't bundle one. Common use cases: KYC document handoff, payment QRs, device pairing, lobby check-in. Note: camera access requires a secure context (HTTPS, or localhost) and explicit permission. If the surface below shows a fallback, that's expected.",
    sections: [
      {
        title: "1. Basic — scan QR codes",
        codeTitle: "<zen-qr-scanner> + zen-scan",
        code: `<zen-qr-scanner></zen-qr-scanner>

scanner.addEventListener("zen-scan", (e) => { last.textContent = e.detail.rawValue; });`,
        render: () => {
          const col = column(360);

          const status = document.createElement("div");
          status.style.fontSize = "0.8125rem";
          status.style.color = "var(--zen-color-muted-fg)";
          const placeholder = document.createElement("em");
          placeholder.textContent = "(waiting…)";
          status.append("Last scan: ", placeholder);

          const scanner = document.createElement("zen-qr-scanner");
          scanner.addEventListener("zen-scan", (e) => {
            const s = (e as CustomEvent).detail as QRScannerScan;
            const code = document.createElement("code");
            code.textContent = s.rawValue;
            status.replaceChildren("Last scan: ", code);
          });

          col.append(scanner, status);
          return col;
        },
      },
      {
        title: "2. Pause / resume",
        codeTitle: "paused — stops camera tracks; resume by removing it",
        codeDescription:
          "Useful when the parent modal closes, the tab is hidden, or after a confirmed scan.",
        code: `<zen-qr-scanner paused></zen-qr-scanner>

btn.addEventListener("click", () => scanner.toggleAttribute("paused"));`,
        render: () => {
          const col = column(360);
          const scanner = document.createElement("zen-qr-scanner");
          const btn = document.createElement("zen-button");
          btn.textContent = "Pause camera";
          btn.addEventListener("click", () => {
            const paused = scanner.toggleAttribute("paused");
            btn.textContent = paused ? "Resume camera" : "Pause camera";
          });
          col.append(scanner, btn);
          return col;
        },
      },
      {
        title: "3. Switch camera",
        codeTitle: 'facing-mode — "environment" (back) vs "user" (selfie)',
        code: `<zen-qr-scanner facing-mode="environment"></zen-qr-scanner>

btn.addEventListener("click", () => scanner.setAttribute("facing-mode", facing));`,
        render: () => {
          const col = column(360);
          let facing: "environment" | "user" = "environment";
          const scanner = document.createElement("zen-qr-scanner");
          scanner.setAttribute("facing-mode", facing);
          const btn = document.createElement("zen-button");
          btn.setAttribute("variant", "outline");
          btn.textContent = "Switch to front camera";
          btn.addEventListener("click", () => {
            facing = facing === "environment" ? "user" : "environment";
            scanner.setAttribute("facing-mode", facing);
            btn.textContent = `Switch to ${facing === "environment" ? "front" : "back"} camera`;
          });
          col.append(scanner, btn);
          return col;
        },
      },
      {
        title: "4. Multiple formats — 1D barcodes too",
        codeTitle: 'formats: ["qr_code", "ean_13", "code_128"]',
        codeDescription:
          "Native BarcodeDetector supports a range of formats — check getSupportedFormats() in your target browser.",
        code: `const scanner = document.createElement("zen-qr-scanner");
scanner.formats = ["qr_code", "ean_13", "code_128"];
scanner.addEventListener("zen-scan", (e) => console.log(e.detail.format, e.detail.rawValue));`,
        render: () => {
          const box = document.createElement("div");
          box.style.maxWidth = "360px";
          const scanner = document.createElement("zen-qr-scanner");
          (scanner as unknown as { formats: string[] }).formats = ["qr_code", "ean_13", "code_128"];
          box.append(scanner);
          return box;
        },
      },
      {
        title: "5. Custom polyfill — jsQR / zxing",
        codeTitle: "decode prop — for browsers without BarcodeDetector",
        codeDescription:
          "When the native API isn't available, set an async decoder that takes the live video element and returns a scan (or null). Example with jsQR:",
        code: `import jsQR from "jsqr";

const scanner = document.createElement("zen-qr-scanner");
scanner.decode = async (video) => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, 0, 0);
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(img.data, img.width, img.height);
  return code ? { rawValue: code.data, format: "qr_code" } : null;
};`,
        render: () => document.createDocumentFragment(),
      },
      {
        title: "6. Scan history",
        codeTitle: "Cooldown dedupes — same QR within 1.5 s only fires once",
        codeDescription:
          "Repeated identical scans inside cooldown-ms are suppressed so zen-scan doesn't spam the parent.",
        code: `<zen-qr-scanner cooldown-ms="1500"></zen-qr-scanner>

scanner.addEventListener("zen-scan", (e) => prepend(e.detail.rawValue));`,
        render: () => {
          const rowEl = document.createElement("div");
          rowEl.style.display = "flex";
          rowEl.style.gap = "16px";
          rowEl.style.alignItems = "flex-start";
          rowEl.style.flexWrap = "wrap";

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
          const scanner = document.createElement("zen-qr-scanner");
          scanner.setAttribute("cooldown-ms", "1500");
          scanner.addEventListener("zen-scan", (e) => {
            const s = (e as CustomEvent).detail as QRScannerScan;
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
          });

          left.append(scanner);
          rowEl.append(left, right);
          return rowEl;
        },
      },
    ],
  });
}

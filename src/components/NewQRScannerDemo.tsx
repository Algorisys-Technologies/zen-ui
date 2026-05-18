import { useState } from "react";
import { QRScanner, type QRScannerScan } from "./qr-scanner/qr-scanner";
import { CodeExample } from "./demo-helpers";
import { Button } from "./button/button";

const NewQRScannerDemo: React.FC = () => {
  const [last, setLast] = useState<QRScannerScan | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");

  const handleScan = (scan: QRScannerScan) => {
    setLast(scan);
    setHistory((prev) => [scan.rawValue, ...prev].slice(0, 8));
  };

  return (
    <div className="demo-page">
      <h1>QRScanner</h1>
      <p className="lede">
        Camera-based barcode / QR scanner backed by the native{" "}
        <code>BarcodeDetector</code> API (Chromium, Safari 17+). Firefox
        and other browsers without the API can plug in their own decoder
        via the <code>decode</code> prop (jsQR, @zxing/browser) — we
        deliberately don't bundle one. Common use cases: KYC document
        handoff, payment QRs, device pairing, lobby check-in.
      </p>

      <p
        style={{
          padding: "0.8rem 1.2rem",
          background: "var(--zen-color-warning-soft)",
          color: "var(--zen-color-warning-fg)",
          borderRadius: 6,
          fontSize: "1.3rem",
        }}
      >
        Note: camera access requires a secure context (HTTPS, or{" "}
        <code>localhost</code>) and explicit permission. If the surface
        below shows a fallback, that's expected.
      </p>

      <section className="demo-section">
        <h2>1. Basic — scan QR codes</h2>
        <CodeExample
          title="<QRScanner onScan={...} />"
          code={`const [last, setLast] = useState<QRScannerScan | null>(null);
<QRScanner onScan={setLast} />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}>
            <QRScanner onScan={handleScan} />
            <div style={{ fontSize: "1.3rem", color: "var(--zen-color-muted-fg)" }}>
              Last scan:{" "}
              {last ? (
                <code>{last.rawValue}</code>
              ) : (
                <em>(waiting…)</em>
              )}
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Pause / resume</h2>
        <CodeExample
          title="paused — stops camera tracks; resume by flipping false"
          description="Useful when the parent modal closes, the tab is hidden, or after a confirmed scan."
          code={`<QRScanner paused={paused} onScan={...} />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}>
            <QRScanner paused={paused} onScan={handleScan} />
            <Button onClick={() => setPaused((p) => !p)}>
              {paused ? "Resume" : "Pause"} camera
            </Button>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Switch camera</h2>
        <CodeExample
          title='facingMode — "environment" (back) vs "user" (selfie)'
          code={`<QRScanner facingMode={facing} onScan={...} />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}>
            <QRScanner facingMode={facing} onScan={handleScan} />
            <Button
              variant="outline"
              onClick={() =>
                setFacing((f) => (f === "environment" ? "user" : "environment"))
              }
            >
              Switch to {facing === "environment" ? "front" : "back"} camera
            </Button>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Multiple formats — 1D barcodes too</h2>
        <CodeExample
          title='formats={["qr_code", "ean_13", "code_128"]}'
          description="Native BarcodeDetector supports a range of formats — check getSupportedFormats() in your target browser."
          code={`<QRScanner
  formats={["qr_code", "ean_13", "code_128"]}
  onScan={(s) => console.log(s.format, s.rawValue)}
/>`}
        >
          <div style={{ maxWidth: 360 }}>
            <QRScanner
              formats={["qr_code", "ean_13", "code_128"]}
              onScan={handleScan}
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Custom polyfill — jsQR / zxing</h2>
        <CodeExample
          title="decode prop — for browsers without BarcodeDetector"
          description={
            "When the native API isn't available, pass an async decoder that takes the live video element and returns a scan (or null). Example with jsQR:"
          }
          code={`import jsQR from "jsqr";

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

<QRScanner decode={decode} onScan={...} />`}
        />
      </section>

      <section className="demo-section">
        <h2>6. Scan history</h2>
        <CodeExample
          title="Cooldown dedupes — same QR within 1.5 s only fires once"
          description="Repeated identical scans inside cooldownMs are suppressed so onScan doesn't spam the parent."
          code={`<QRScanner cooldownMs={1500} onScan={(s) => append(s.rawValue)} />`}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ width: 280 }}>
              <QRScanner onScan={handleScan} />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h3 style={{ margin: "0 0 0.8rem 0", fontSize: "1.4rem" }}>Recent</h3>
              {history.length === 0 ? (
                <p style={{ fontSize: "1.3rem", color: "var(--zen-color-muted-fg)" }}>
                  No scans yet.
                </p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "1.3rem" }}>
                  {history.map((v, i) => (
                    <li
                      key={`${v}-${i}`}
                      style={{
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--zen-color-border)",
                      }}
                    >
                      <code>{v}</code>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewQRScannerDemo;

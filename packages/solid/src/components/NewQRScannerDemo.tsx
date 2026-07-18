import { createSignal } from "solid-js";
import { QRScanner, type QRScannerScan } from "./qr-scanner/qr-scanner";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewQRScannerDemo = () => {
  const [paused, setPaused] = createSignal(true);
  const [scan, setScan] = createSignal<QRScannerScan | null>(null);
  return (
    <DemoPage
      title="QRScanner"
      description="Camera-based QR / barcode scanner via the native BarcodeDetector API. Click Start to request camera permission."
    >
      <DemoSection
        title="Default (QR only, environment camera)"
        codeTitle="paused stops the camera tracks; flip it false to start"
        code={`const [paused, setPaused] = createSignal(true);
const [scan, setScan] = createSignal<QRScannerScan | null>(null);

<QRScanner paused={paused()} onScan={(s) => setScan(s)} />
<Button size="sm" variant="outline" onClick={() => setPaused((p) => !p)}>
  {paused() ? "Start scanning" : "Pause"}
</Button>
<div>Last scan: {scan()?.rawValue ?? "—"}</div>`}
      >
        <div class="zen-flex zen-flex-col zen-gap-3 zen-max-w-sm zen-w-full">
          <div style={{ width: "240px" }}>
            <QRScanner paused={paused()} onScan={(s) => setScan(s)} />
          </div>
          <div class="zen-flex zen-gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPaused((p) => !p)}
            >
              {paused() ? "Start scanning" : "Pause"}
            </Button>
          </div>
          <div class="zen-text-xs zen-text-zen-muted-fg">
            Last scan: {scan()?.rawValue ?? "—"}
          </div>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewQRScannerDemo;

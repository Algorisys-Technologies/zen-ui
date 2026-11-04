import { useState } from "react";
import { encodeQr, type QrEcc } from "@algorisys/zen-ui-core/barcode";
import { QRCode, Barcode, type BarcodeFormat } from "./barcode/barcode";
import { Input } from "./form/input/input";
import { Label } from "./form/label/label";
import { SegmentedButton, SegmentedButtonItem } from "./button/button-family";
import { CodeExample } from "./demo-helpers";

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

const NewBarcodeDemo: React.FC = () => {
  const [qrText, setQrText] = useState("GP/26/0815 · Vehicle MH12 AB 4521 · Gate 2");
  const [bar, setBar] = useState("ITM-0042");
  const [format, setFormat] = useState<BarcodeFormat>("code128");

  return (
    <div className="demo-page">
      <h1>QRCode and Barcode</h1>
      <p className="lede">
        Codes drawn as SVG, for screens and print: the e-invoice's signed QR, a gate pass, an item label. Dark on
        light whatever the theme, quiet zone included, and a value that cannot be encoded says why instead of
        drawing a code that scans as something else.
      </p>

      <section className="demo-section">
        <h2>1. The e-invoice QR</h2>
        <CodeExample
          title="The IRP's signed QR, as the invoice prints it"
          description="Several hundred characters of signed JSON: at level M, a symbol about a hundred modules a side (the exact size is shown beside it). Print it at 3 cm or more. The QR here is made up, signature included."
          code={`<QRCode value={invoice.signedQrCode} ecc="M" size={192} label="e-invoice QR" />`}
        >
          <div className="zen-flex zen-flex-wrap zen-items-start zen-gap-6">
            <QRCode value={SIGNED_QR} ecc="M" size={192} label="e-invoice QR" />
            <dl className="zen-m-0 zen-grid zen-grid-cols-[auto_1fr] zen-gap-x-4 zen-gap-y-1 zen-text-sm">
              <dt className="zen-text-zen-muted-fg">Characters</dt>
              <dd className="zen-m-0" data-testid="qr-length">{SIGNED_QR.length}</dd>
              <dt className="zen-text-zen-muted-fg">Symbol</dt>
              <dd className="zen-m-0" data-testid="qr-version">{version(SIGNED_QR, "M")}</dd>
            </dl>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Error correction</h2>
        <CodeExample
          title="The same text at each level"
          description="Higher levels survive more damage (a fold, a smudge, a logo over the middle) at the price of a bigger symbol. M is the default; H for codes that live on the shop floor. Type to change the text."
          code={`<QRCode value={gatePass} ecc="L" />  <QRCode value={gatePass} ecc="H" />`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-4">
            <div className="zen-flex zen-max-w-md zen-flex-col zen-gap-1.5">
              <Label htmlFor="qr-text">Text</Label>
              <Input id="qr-text" value={qrText} onChange={(e) => setQrText(e.currentTarget.value)} />
            </div>
            <div className="zen-flex zen-flex-wrap zen-gap-6">
              {LEVELS.map((ecc) => (
                <figure key={ecc} className="zen-m-0 zen-flex zen-flex-col zen-items-center zen-gap-1.5">
                  <QRCode value={qrText} ecc={ecc} size={128} label={`Gate pass QR, level ${ecc}`} />
                  <figcaption className="zen-text-xs zen-text-zen-muted-fg">
                    <span className="zen-font-medium zen-text-zen-foreground">{ecc}</span> · {version(qrText, ecc)}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Barcodes</h2>
        <CodeExample
          title="Code 128, EAN-13, Code 39"
          description="Code 128 holds any ASCII and packs runs of digits two to a bar pattern. EAN-13 takes 12 digits and adds the check digit (13 are checked). Code 39 is for older readers: upper case, digits and a few symbols."
          code={`<Barcode value="ITM-0042" />
<Barcode value="890123456789" format="ean13" />
<Barcode value="SI-26-0042" format="code39" />`}
        >
          <div className="zen-flex zen-flex-wrap zen-items-end zen-gap-8">
            <figure className="zen-m-0 zen-flex zen-flex-col zen-gap-1.5">
              <Barcode value="ITM-0042" />
              <figcaption className="zen-text-xs zen-text-zen-muted-fg">Code 128 · item label</figcaption>
            </figure>
            <figure className="zen-m-0 zen-flex zen-flex-col zen-gap-1.5">
              <Barcode value="890123456789" format="ean13" />
              <figcaption className="zen-text-xs zen-text-zen-muted-fg">EAN-13 · check digit added</figcaption>
            </figure>
            <figure className="zen-m-0 zen-flex zen-flex-col zen-gap-1.5">
              <Barcode value="SI-26-0042" format="code39" />
              <figcaption className="zen-text-xs zen-text-zen-muted-fg">Code 39</figcaption>
            </figure>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Try one</h2>
        <CodeExample
          title="What cannot be encoded says why"
          description="Try lower case in Code 39, a wrong check digit in EAN-13 (4006381333932), or ₹ in Code 128: the code is replaced by the reason, never by bars that scan as something else."
          code={`<Barcode value={value} format={format} />`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-4">
            <div className="zen-flex zen-flex-wrap zen-items-end zen-gap-4">
              <div className="zen-flex zen-w-64 zen-flex-col zen-gap-1.5">
                <Label htmlFor="bar-text">Value</Label>
                <Input id="bar-text" value={bar} onChange={(e) => setBar(e.currentTarget.value)} />
              </div>
              <SegmentedButton value={format} onValueChange={(v) => setFormat(v as BarcodeFormat)} aria-label="Format">
                <SegmentedButtonItem value="code128">Code 128</SegmentedButtonItem>
                <SegmentedButtonItem value="ean13">EAN-13</SegmentedButtonItem>
                <SegmentedButtonItem value="code39">Code 39</SegmentedButtonItem>
              </SegmentedButton>
            </div>
            <div data-testid="try-barcode">
              <Barcode value={bar} format={format} />
            </div>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewBarcodeDemo;

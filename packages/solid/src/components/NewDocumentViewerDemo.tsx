import { createSignal } from "solid-js";
// Vite's ?url suffix gives the emitted worker's URL. This is the consumer's
// job, not the library's: only your bundler knows where its copy of pdf.js
// landed. Other bundlers have their own spelling for the same idea.
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { DocumentViewer } from "./document-viewer/document-viewer";
import { DemoPage, DemoSection } from "./demo-helpers";

/*
 * A real two-page PDF, inline so the demo needs no network and no fixture file.
 * Built with a correct xref table rather than copied from somewhere: pdf.js can
 * often recover from a broken one, and a sample that only worked because of
 * that recovery would hide a real failure behind a green page.
 */
const PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUg" +
  "L1BhZ2VzIC9LaWRzIFszIDAgUiA0IDAgUl0gL0NvdW50IDIgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVu" +
  "dCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA1NDAgNzYwXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA3IDAgUiA+PiA+PiAvQ29u" +
  "dGVudHMgNSAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA1" +
  "NDAgNzYwXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA3IDAgUiA+PiA+PiAvQ29udGVudHMgNiAwIFIgPj4KZW5kb2JqCjUg" +
  "MCBvYmoKPDwgL0xlbmd0aCAxNjEgPj4Kc3RyZWFtCkJUIC9GMSAyNCBUZiA2MCA3MDAgVGQgKElOVk9JQ0UgODg0MikgVGogRVQK" +
  "QlQgL0YxIDExIFRmIDYwIDY2MCBUZCAoemVuLXVpIERvY3VtZW50Vmlld2VyIHNhbXBsZSAtIHBhZ2UgMSBvZiAyKSBUaiBFVAox" +
  "IHcgNjAgODAgbSA0ODAgODAgbCBTCjYwIDY0MCBtIDQ4MCA2NDAgbCBTCmVuZHN0cmVhbQplbmRvYmoKNiAwIG9iago8PCAvTGVu" +
  "Z3RoIDE2NSA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDYwIDcwMCBUZCAoREVMSVZFUlkgQ0hBTExBTikgVGogRVQKQlQgL0YxIDEx" +
  "IFRmIDYwIDY2MCBUZCAoemVuLXVpIERvY3VtZW50Vmlld2VyIHNhbXBsZSAtIHBhZ2UgMiBvZiAyKSBUaiBFVAoxIHcgNjAgODAg" +
  "bSA0ODAgODAgbCBTCjYwIDY0MCBtIDQ4MCA2NDAgbCBTCmVuZHN0cmVhbQplbmRvYmoKNyAwIG9iago8PCAvVHlwZSAvRm9udCAv" +
  "U3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EgPj4KZW5kb2JqCnhyZWYKMCA4CjAwMDAwMDAwMDAgNjU1MzUgZiAK" +
  "MDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKMDAwMDAwMDI0NyAwMDAw" +
  "MCBuIAowMDAwMDAwMzczIDAwMDAwIG4gCjAwMDAwMDA1ODUgMDAwMDAgbiAKMDAwMDAwMDgwMSAwMDAwMCBuIAp0cmFpbGVyCjw8" +
  "IC9TaXplIDggL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjg3MQolJUVPRgo=";

const SAMPLE_PDF = `data:application/pdf;base64,${PDF_BASE64}`;

/* A stand-in for a scanned page. An SVG so it stays sharp at every zoom the
   toolbar can reach, which is also what makes the zoom visibly do something. */
const SAMPLE_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="520" viewBox="0 0 760 520">
      <rect width="760" height="520" fill="#ffffff"/>
      <rect x="1" y="1" width="758" height="518" fill="none" stroke="#d4d4d8"/>
      <text x="48" y="88" font-family="Georgia, serif" font-size="34" fill="#18181b">GOODS RECEIPT NOTE</text>
      <text x="48" y="122" font-family="Helvetica, sans-serif" font-size="15" fill="#71717a">GRN-2026-0431 - gate 3 - 04 Aug 2026</text>
      <line x1="48" y1="146" x2="712" y2="146" stroke="#e4e4e7" stroke-width="2"/>
      <text x="48" y="196" font-family="Helvetica, sans-serif" font-size="16" fill="#3f3f46">Vendor    Rotterdam Freight BV</text>
      <text x="48" y="230" font-family="Helvetica, sans-serif" font-size="16" fill="#3f3f46">Vehicle   MH-04-AB-1182</text>
      <text x="48" y="264" font-family="Helvetica, sans-serif" font-size="16" fill="#3f3f46">Net wt    862 kg</text>
      <text x="48" y="298" font-family="Helvetica, sans-serif" font-size="16" fill="#3f3f46">PO ref    PO-4417</text>
      <line x1="48" y1="330" x2="712" y2="330" stroke="#e4e4e7" stroke-width="2"/>
      <text x="48" y="382" font-family="Helvetica, sans-serif" font-size="13" fill="#a1a1aa">Signature</text>
      <path d="M48 430 c 40 -34 70 22 108 -6 c 30 -22 54 26 92 4" fill="none" stroke="#3f3f46" stroke-width="3"/>
    </svg>`,
  );

const NewDocumentViewerDemo = () => {
  const [zoom, setZoom] = createSignal(0.75);
  const [page, setPage] = createSignal(1);

  return (
    <DemoPage
      title="DocumentViewer"
      description={
        <>
          Show a scanned document — the other half of FileUpload and Camera.
          Images render directly; PDFs render through <code>pdfjs-dist</code>,
          an optional peer dependency loaded only when a PDF actually appears.
        </>
      }
    >
      <DemoSection
        title="1. An image"
        codeTitle="`src`, and nothing else required"
        codeDescription="A URL you already have the right to read, or a Blob you already hold. It does not fetch: no method, no headers, no retry policy, for the same reason UploadCollection has none — a component that owned the transport would have to guess at your auth refresh. A signed URL works untouched, because its query string is stripped before the extension is read. Skipping that step is what renders every document in an app as a broken image."
        code={`<DocumentViewer src={signedUrl} name="grn-2026-0431.png" />`}
      >
        <DocumentViewer src={SAMPLE_IMAGE} name="grn-2026-0431.svg" height="26rem" />
      </DemoSection>

      <DemoSection
        title="2. A PDF, with pages"
        codeTitle="Rendered to a canvas, not dropped in an iframe"
        codeDescription="An iframe hands the browser's own viewer a frame box and lets it lay out inside — so the page count is unreadable, rotation is impossible, and zoom crops instead of magnifying unless you inflate the frame by 1/zoom and scale it back, which behaves differently in all three engines. Rendering the page ourselves makes zoom a render parameter and rotation a number. The page control appears only when there is more than one page, and the canvas is drawn at device resolution so a 2x display shows the document rather than a blur of it."
        code={`import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

<DocumentViewer src={pdfUrl} name="invoice-8842.pdf" workerSrc={workerSrc} />`}
      >
        <DocumentViewer src={SAMPLE_PDF} name="invoice-8842.pdf" height="26rem" workerSrc={pdfWorkerSrc} />
      </DemoSection>

      <DemoSection
        title="3. Watching the controls"
        codeTitle="Uncontrolled, with change callbacks"
        codeDescription="Zoom, page and rotation live inside the component and report out. Nothing an app does depends on owning them mid-gesture, and a controlled version is cheap to add later — the reverse is not. defaultZoom and defaultPage set the starting point."
        code={`<DocumentViewer
  src={pdfUrl}
  workerSrc={workerSrc}
  defaultZoom={0.75}
  onZoomChange={setZoom}
  onPageChange={setPage}
/>`}
      >
        <div class="zen-flex zen-flex-col zen-gap-2">
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            zoom{" "}
            <strong class="zen-tabular-nums zen-text-zen-foreground">
              {Math.round(zoom() * 100)}%
            </strong>
            {" · "}page{" "}
            <strong class="zen-tabular-nums zen-text-zen-foreground">{page()}</strong>
          </p>
          <DocumentViewer
            src={SAMPLE_PDF}
            name="invoice-8842.pdf"
            height="22rem"
            workerSrc={pdfWorkerSrc}
            defaultZoom={0.75}
            onZoomChange={setZoom}
            onPageChange={setPage}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="4. Download, and no toolbar"
        codeTitle="Presence-gated, like UploadCollection's delete button"
        codeDescription="No onDownload, no download button. A disabled-looking control that does nothing is worse than an absent one, because the user spends a click finding out. toolbar={false} drops the bar entirely, for a thumbnail-sized preview where the controls would outweigh the document."
        code={`<DocumentViewer src={src} onDownload={(src, name) => save(src, name)} />
<DocumentViewer src={src} toolbar={false} height="12rem" />`}
      >
        <div class="zen-flex zen-flex-col zen-gap-4">
          <DocumentViewer
            src={SAMPLE_IMAGE}
            name="grn-2026-0431.svg"
            height="16rem"
            onDownload={(s, n) => {
              const a = document.createElement("a");
              a.href = s;
              a.download = n ?? "document";
              a.click();
            }}
          />
          <DocumentViewer src={SAMPLE_IMAGE} toolbar={false} height="12rem" />
        </div>
      </DemoSection>

      <DemoSection
        title="5. Something it cannot draw"
        codeTitle="`unknown` is a state, not a crash"
        codeDescription="A type neither branch can render falls through to a plain card with the download escape hatch, rather than an empty box or a broken image element. The kind is worked out from an explicit type first, then the URL extension — and only the LAST extension counts, so archive.pdf.zip is a zip."
        code={`<DocumentViewer src="/exports/ledger.zip" name="ledger.zip" onDownload={save} />`}
      >
        <DocumentViewer
          src="/exports/ledger.zip"
          name="ledger.zip"
          height="14rem"
          onDownload={() => {}}
        />
      </DemoSection>
    </DemoPage>
  );
};

export default NewDocumentViewerDemo;

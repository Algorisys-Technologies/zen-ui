import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { DemoPage } from "./demo-helpers";

// Vite's ?url suffix gives the emitted worker's URL. This is the consumer's job,
// not the library's: only your bundler knows where its copy of pdf.js landed.
/*
 * Built with a correct xref table rather than copied: pdf.js can often recover
 * from a broken one, and a sample that only worked because of that recovery
 * would hide a real failure behind a green page.
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
      <line x1="48" y1="330" x2="712" y2="330" stroke="#e4e4e7" stroke-width="2"/>
      <path d="M48 430 c 40 -34 70 22 108 -6 c 30 -22 54 26 92 4" fill="none" stroke="#3f3f46" stroke-width="3"/>
    </svg>`,
  );


/** A <zen-document-viewer> from attributes alone. */
function viewer(attrs: Record<string, string>): HTMLElement {
  const el = document.createElement("zen-document-viewer");
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

export default function DocumentViewerDemo(): HTMLElement {
  return DemoPage({
    title: "DocumentViewer",
    description:
      "Show a scanned document — the other half of FileUpload and Camera. Images render directly; PDFs render through pdfjs-dist, an optional peer dependency loaded only when a PDF actually appears.",
    sections: [
      {
        title: "1. An image",
        codeTitle: "`src`, and nothing else required",
        codeDescription:
          "A URL you already have the right to read. It does not fetch: no method, no headers, no retry policy, for the same reason UploadCollection has none. A signed URL works untouched, because its query string is stripped before the extension is read — skipping that step is what renders every document in an app as a broken image. A Blob has no attribute form, so that one is a property: el.src = blob.",
        code: `<zen-document-viewer src="/grn-2026-0431.png" name="grn-2026-0431.png"></zen-document-viewer>`,
        render: () => viewer({ src: SAMPLE_IMAGE, name: "grn-2026-0431.svg", height: "26rem" }),
      },
      {
        title: "2. A PDF, with pages",
        codeTitle: "`worker-src` has no default, because none could work",
        codeDescription:
          "pdf.js will not start without a worker, and only your bundler knows where its copy landed — so the component asks rather than guessing, and says so in the frame if you forget. Rendered to a canvas rather than an iframe: handed a frame box the browser's own viewer lays out inside it, so the page count is unreadable, rotation is impossible, and zoom crops instead of magnifying. The canvas is drawn at device resolution so a 2x display shows the document rather than a blur of it.",
        code: `<zen-document-viewer
  src="/invoice-8842.pdf"
  name="invoice-8842.pdf"
  worker-src="/assets/pdf.worker.min.mjs">
</zen-document-viewer>`,
        render: () =>
          viewer({ src: SAMPLE_PDF, name: "invoice-8842.pdf", height: "26rem", "worker-src": pdfWorkerSrc }),
      },
      {
        title: "3. Controlled zoom, page and rotation",
        codeTitle: "Attributes in, `zen-zoom-change` and `zen-page-change` out",
        codeDescription:
          "Leave them off and the element owns them. Set zoom and listen for zen-zoom-change and you do — which is what lets a window-level +/-/0 shortcut drive the viewer, a normal expectation of a document viewer and impossible against a purely uncontrolled one. min-zoom, max-zoom and zoom-step set the range, and the buttons disable at the bounds rather than going quietly dead.",
        code: `<zen-document-viewer src="…" worker-src="…" zoom="0.75" min-zoom="0.25" max-zoom="4">
</zen-document-viewer>

el.addEventListener("zen-zoom-change", (e) => el.setAttribute("zoom", e.detail));`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%";
          const readout = document.createElement("p");
          readout.style.cssText = "margin:0;font-size:13px;color:var(--zen-color-muted-fg)";

          let zoom = 0.75;
          let page = 1;
          const paint = () => (readout.textContent = `zoom ${Math.round(zoom * 100)}% · page ${page}`);
          paint();

          const el = viewer({
            src: SAMPLE_PDF,
            name: "invoice-8842.pdf",
            height: "22rem",
            "worker-src": pdfWorkerSrc,
            zoom: String(zoom),
            "min-zoom": "0.25",
            "max-zoom": "4",
          });
          el.addEventListener("zen-zoom-change", (e) => {
            zoom = (e as CustomEvent<number>).detail;
            el.setAttribute("zoom", String(zoom));
            paint();
          });
          el.addEventListener("zen-page-change", (e) => {
            page = (e as CustomEvent<number>).detail;
            paint();
          });

          wrap.append(readout, el);
          return wrap;
        },
      },
      {
        title: "4. Download, and no toolbar",
        codeTitle: "Presence-gated, and `toolbar` is json because it defaults to TRUE",
        codeDescription:
          "No zen-download listener, no download button. A disabled-looking control that does nothing is worse than an absent one, because the user spends a click finding out — so here the element only passes the callback through once someone is actually listening. toolbar=\"false\" drops the bar entirely, for a thumbnail-sized preview where the controls would outweigh the document.",
        code: `<zen-document-viewer src="…"></zen-document-viewer>          <!-- listen for zen-download -->
<zen-document-viewer src="…" toolbar="false" height="12rem"></zen-document-viewer>`,
        render: () => {
          const stack = document.createElement("div");
          stack.style.cssText = "display:flex;flex-direction:column;gap:16px;width:100%";
          const withDownload = viewer({ src: SAMPLE_IMAGE, name: "grn-2026-0431.svg", height: "16rem" });
          withDownload.addEventListener("zen-download", (e) => {
            const [src, name] = (e as CustomEvent<[string, string?]>).detail as unknown as [string, string?];
            const a = document.createElement("a");
            a.href = src;
            a.download = name ?? "document";
            a.click();
          });
          stack.append(withDownload, viewer({ src: SAMPLE_IMAGE, toolbar: "false", height: "12rem" }));
          return stack;
        },
      },
      {
        title: "5. Something it cannot draw",
        codeTitle: "`unknown` is a state, not a crash",
        codeDescription:
          "A type neither branch can render falls through to a plain card with the download escape hatch, rather than an empty box or a broken image element. The kind is worked out from an explicit type first, then the URL extension — and only the LAST extension counts, so archive.pdf.zip is a zip.",
        code: `<zen-document-viewer src="/exports/ledger.zip" name="ledger.zip"></zen-document-viewer>`,
        render: () => {
          const el = viewer({ src: "/exports/ledger.zip", name: "ledger.zip", height: "14rem" });
          el.addEventListener("zen-download", () => {});
          return el;
        },
      },
    ],
  });
}

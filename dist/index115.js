import { jsxs as o, jsx as e, Fragment as oe } from "react/jsx-runtime";
import * as n from "react";
import { cn as Me } from "./index143.js";
import "./index24.js";
import "./index98.js";
import { inferDocumentKind as Ne, DOCUMENT_ZOOM_MIN as Ce, DOCUMENT_ZOOM_MAX as Re, normalizeRotation as ae, fitScale as Se } from "./index116.js";
import { Button as f } from "./index64.js";
import { Icon as ie } from "./index56.js";
const Pe = (i) => `${Math.round(i * 100)}%`, y = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": !0
}, je = () => /* @__PURE__ */ e("svg", { width: "16", height: "16", ...y, children: /* @__PURE__ */ e("line", { x1: "5", y1: "12", x2: "19", y2: "12" }) }), Ee = () => /* @__PURE__ */ o("svg", { width: "16", height: "16", ...y, children: [
  /* @__PURE__ */ e("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
  /* @__PURE__ */ e("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
] }), De = () => /* @__PURE__ */ o("svg", { width: "16", height: "16", ...y, children: [
  /* @__PURE__ */ e("polyline", { points: "21 4 21 10 15 10" }),
  /* @__PURE__ */ e("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L21 10" })
] }), Te = () => /* @__PURE__ */ o("svg", { width: "16", height: "16", ...y, children: [
  /* @__PURE__ */ e("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  /* @__PURE__ */ e("polyline", { points: "7 10 12 15 17 10" }),
  /* @__PURE__ */ e("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
] }), Oe = () => /* @__PURE__ */ o("svg", { width: "32", height: "32", ...y, strokeWidth: 1.5, className: "zen-text-zen-muted-fg", children: [
  /* @__PURE__ */ e("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
  /* @__PURE__ */ e("polyline", { points: "14 2 14 8 20 8" })
] }), $e = ({
  src: i,
  type: se,
  name: x,
  zoom: F,
  defaultZoom: I,
  onZoomChange: ce,
  minZoom: U = Ce,
  maxZoom: W = Re,
  zoomStep: B = 1.25,
  page: V,
  defaultPage: le,
  onPageChange: de,
  rotation: $,
  defaultRotation: H,
  onRotationChange: ue,
  resetOnSrcChange: he = !0,
  fit: fe = "contain",
  onDownload: k,
  toolbar: me = !0,
  height: ze = "32rem",
  workerSrc: P,
  unsupportedMessage: ge,
  className: pe
}) => {
  const [xe, Z] = n.useState(I ?? 1), [we, _] = n.useState(Math.max(1, Math.floor(le ?? 1))), [ve, A] = n.useState(H ?? 0), [M, G] = n.useState(1), [j, d] = n.useState("idle"), [K, w] = n.useState(""), [N, E] = n.useState(), Q = (t) => Number.isNaN(t) ? 1 : Math.min(W, Math.max(U, t)), s = Q(F ?? xe), c = Math.max(1, Math.floor(V ?? we)), g = ae($ ?? ve), C = n.useMemo(
    () => i instanceof Blob ? URL.createObjectURL(i) : "",
    [i]
  );
  n.useEffect(() => () => {
    C && URL.revokeObjectURL(C);
  }, [C]);
  const u = i instanceof Blob ? C : i, X = se ?? (i instanceof Blob ? i.type : void 0), l = n.useMemo(() => Ne(u, X), [u, X]), q = n.useRef(null), J = n.useRef(null), v = n.useRef(null), R = n.useRef(null), S = n.useRef(Promise.resolve()), D = n.useRef(!1), h = n.useRef(0), Y = (t) => {
    const r = Q(t);
    Z(r), ce?.(r);
  }, ee = (t) => Y(Math.round((t >= 0 ? s * B : s / B) * 1e4) / 1e4), T = (t) => {
    const r = Math.min(M, Math.max(1, t));
    _(r), de?.(r);
  }, be = () => {
    const t = ae(g + 90);
    A(t), ue?.(t);
  }, ye = () => {
    const t = q.current;
    !t || !N || Y(
      Se(N, { width: t.clientWidth - 32, height: t.clientHeight - 32 }, fe, g)
    );
  }, te = n.useCallback(async () => {
    const t = v.current, r = J.current;
    if (!t || !r) return;
    const p = h.current, m = await t.getPage(c);
    if (p !== h.current) return;
    const a = m.getViewport({ scale: s, rotation: g }), z = window.devicePixelRatio || 1;
    r.width = Math.floor(a.width * z), r.height = Math.floor(a.height * z), r.style.width = `${Math.floor(a.width)}px`, r.style.height = `${Math.floor(a.height)}px`;
    const O = r.getContext("2d");
    if (!O) return;
    O.setTransform(z, 0, 0, z, 0, 0);
    const L = m.render({ canvasContext: O, viewport: a, canvas: r });
    R.current = L;
    try {
      await L.promise;
    } catch (b) {
      if (b?.name !== "RenderingCancelledException") throw b;
      return;
    } finally {
      R.current === L && (R.current = null);
    }
    E((b) => {
      if (b) return b;
      const re = m.getViewport({ scale: 1, rotation: 0 });
      return { width: re.width, height: re.height };
    });
  }, [c, s, g]), ne = n.useCallback(() => (D.current || (D.current = !0, R.current?.cancel(), S.current = S.current.catch(() => {
  }).then(() => (D.current = !1, te()))), S.current), [te]);
  n.useEffect(() => {
    if (E(void 0), he && (F === void 0 && Z(I ?? 1), V === void 0 && _(1), $ === void 0 && A(H ?? 0)), !u) return;
    if (l !== "pdf") {
      h.current++, v.current = null, G(1), d(l === "image" ? "loading" : "error"), w("");
      return;
    }
    let t = !1;
    return (async () => {
      const p = ++h.current;
      d("loading");
      let m;
      try {
        m = await import("./index186.js");
      } catch {
        if (p !== h.current || t) return;
        d("error"), w("This is a PDF, and pdfjs-dist is not installed. Add it to render PDFs.");
        return;
      }
      if (p !== h.current || t) return;
      const a = m.GlobalWorkerOptions;
      if (P && a && (a.workerSrc = P), a && !a.workerSrc) {
        d("error"), w(
          'PDFs need a pdf.js worker. Pass workerSrc — in Vite: import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url".'
        );
        return;
      }
      try {
        if (v.current = await m.getDocument({ url: u }).promise, p !== h.current || t) return;
        G(v.current.numPages), c > v.current.numPages && T(1), d("ready");
      } catch (z) {
        if (p !== h.current || t) return;
        d("error"), w(z instanceof Error ? z.message : "Could not open this PDF.");
      }
    })(), () => {
      t = !0;
    };
  }, [u, l, P]), n.useEffect(() => {
    l === "pdf" && j === "ready" && ne();
  }, [l, j, c, s, g, ne]);
  const ke = l === "pdf";
  return /* @__PURE__ */ o(
    "div",
    {
      className: Me(
        "zen-flex zen-w-full zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
        pe
      ),
      children: [
        me && /* @__PURE__ */ o("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-border-b zen-border-zen-border zen-bg-zen-muted zen-px-2 zen-py-1.5", children: [
          x && /* @__PURE__ */ e("span", { className: "zen-me-2 zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground", children: x }),
          /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", "aria-label": "Zoom out", disabled: s <= U, onClick: () => ee(-1), children: /* @__PURE__ */ e(je, {}) }),
          /* @__PURE__ */ e("span", { "aria-live": "polite", className: "zen-min-w-12 zen-text-center zen-text-xs zen-tabular-nums zen-text-zen-muted-fg", children: Pe(s) }),
          /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", "aria-label": "Zoom in", disabled: s >= W, onClick: () => ee(1), children: /* @__PURE__ */ e(Ee, {}) }),
          /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", onClick: ye, children: "Fit" }),
          /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", "aria-label": "Rotate 90 degrees", onClick: be, children: /* @__PURE__ */ e(De, {}) }),
          ke && M > 1 && /* @__PURE__ */ o(oe, { children: [
            /* @__PURE__ */ e("span", { className: "zen-mx-1 zen-h-4 zen-w-px zen-bg-zen-border", "aria-hidden": !0 }),
            /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", "aria-label": "Previous page", disabled: c <= 1, onClick: () => T(c - 1), children: /* @__PURE__ */ e(ie, { name: "chevron-left", size: 16, className: "rtl:zen-rotate-180" }) }),
            /* @__PURE__ */ o("span", { className: "zen-text-xs zen-tabular-nums zen-text-zen-muted-fg", children: [
              c,
              " / ",
              M
            ] }),
            /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", "aria-label": "Next page", disabled: c >= M, onClick: () => T(c + 1), children: /* @__PURE__ */ e(ie, { name: "chevron-right", size: 16, className: "rtl:zen-rotate-180" }) })
          ] }),
          k && /* @__PURE__ */ o(oe, { children: [
            /* @__PURE__ */ e("span", { className: "zen-ms-auto" }),
            /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", "aria-label": "Download", onClick: () => k(u, x), children: /* @__PURE__ */ e(Te, {}) })
          ] })
        ] }),
        /* @__PURE__ */ o(
          "div",
          {
            ref: q,
            style: { height: ze },
            className: "zen-flex zen-w-full zen-justify-center zen-overflow-auto zen-bg-zen-muted zen-p-4",
            children: [
              l === "image" && /* @__PURE__ */ e(
                "img",
                {
                  src: u,
                  alt: x ?? "Document",
                  onLoad: (t) => {
                    E({
                      width: t.currentTarget.naturalWidth,
                      height: t.currentTarget.naturalHeight
                    }), d("ready");
                  },
                  onError: () => {
                    d("error"), w("Could not load this image.");
                  },
                  style: {
                    width: N ? `${N.width * s}px` : "auto",
                    height: "auto",
                    maxWidth: "none",
                    transform: `rotate(${g}deg)`,
                    alignSelf: "flex-start"
                  }
                }
              ),
              l === "pdf" && /* @__PURE__ */ e("canvas", { ref: J, className: "zen-self-start zen-shadow-zen-sm" }),
              l === "unknown" && /* @__PURE__ */ o("div", { className: "zen-m-auto zen-flex zen-flex-col zen-items-center zen-gap-2 zen-text-center", children: [
                /* @__PURE__ */ e(Oe, {}),
                /* @__PURE__ */ e("p", { className: "zen-m-0 zen-text-sm zen-text-zen-muted-fg", children: ge ?? "No preview for this file type." }),
                k && /* @__PURE__ */ e(f, { variant: "outline", size: "sm", onClick: () => k(u, x), children: "Download" })
              ] }),
              j === "error" && K && /* @__PURE__ */ e("p", { className: "zen-m-auto zen-text-sm zen-text-zen-error", children: K })
            ]
          }
        )
      ]
    }
  );
};
export {
  $e as DocumentViewer
};
//# sourceMappingURL=index115.js.map

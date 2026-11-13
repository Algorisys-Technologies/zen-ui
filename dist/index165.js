import { jsxs as i, jsx as e, Fragment as ie } from "react/jsx-runtime";
import * as n from "react";
import { cn as Ne } from "./index197.js";
import "./index28.js";
import "./index110.js";
import { inferDocumentKind as Ce, DOCUMENT_ZOOM_MIN as Re, DOCUMENT_ZOOM_MAX as Se, normalizeRotation as ae, fitScale as Ve } from "./index166.js";
import { Button as f } from "./index71.js";
import { Icon as se } from "./index63.js";
import { useLocale as Pe } from "./index90.js";
const je = (s) => `${Math.round(s * 100)}%`, k = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": !0
}, Ee = () => /* @__PURE__ */ e("svg", { width: "16", height: "16", ...k, children: /* @__PURE__ */ e("line", { x1: "5", y1: "12", x2: "19", y2: "12" }) }), Te = () => /* @__PURE__ */ i("svg", { width: "16", height: "16", ...k, children: [
  /* @__PURE__ */ e("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
  /* @__PURE__ */ e("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
] }), Oe = () => /* @__PURE__ */ i("svg", { width: "16", height: "16", ...k, children: [
  /* @__PURE__ */ e("polyline", { points: "21 4 21 10 15 10" }),
  /* @__PURE__ */ e("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L21 10" })
] }), Fe = () => /* @__PURE__ */ i("svg", { width: "16", height: "16", ...k, children: [
  /* @__PURE__ */ e("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  /* @__PURE__ */ e("polyline", { points: "7 10 12 15 17 10" }),
  /* @__PURE__ */ e("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
] }), Le = () => /* @__PURE__ */ i("svg", { width: "32", height: "32", ...k, strokeWidth: 1.5, className: "zen-text-zen-muted-fg", children: [
  /* @__PURE__ */ e("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
  /* @__PURE__ */ e("polyline", { points: "14 2 14 8 20 8" })
] }), Ae = ({
  src: s,
  type: ce,
  name: x,
  zoom: I,
  defaultZoom: U,
  onZoomChange: le,
  minZoom: D = Re,
  maxZoom: W = Se,
  zoomStep: B = 1.25,
  page: $,
  defaultPage: de,
  onPageChange: ue,
  rotation: H,
  defaultRotation: _,
  onRotationChange: he,
  resetOnSrcChange: me = !0,
  fit: fe = "contain",
  onDownload: M,
  toolbar: ze = !0,
  height: ge = "32rem",
  workerSrc: P,
  unsupportedMessage: pe,
  className: we
}) => {
  const o = Pe(), [xe, A] = n.useState(U ?? 1), [ve, Z] = n.useState(Math.max(1, Math.floor(de ?? 1))), [be, G] = n.useState(_ ?? 0), [N, K] = n.useState(1), [j, u] = n.useState("idle"), [Q, v] = n.useState(""), [C, E] = n.useState(), X = (t) => Number.isNaN(t) ? 1 : Math.min(W, Math.max(D, t)), c = X(I ?? xe), l = Math.max(1, Math.floor($ ?? ve)), p = ae(H ?? be), R = n.useMemo(
    () => s instanceof Blob ? URL.createObjectURL(s) : "",
    [s]
  );
  n.useEffect(() => () => {
    R && URL.revokeObjectURL(R);
  }, [R]);
  const h = s instanceof Blob ? R : s, q = ce ?? (s instanceof Blob ? s.type : void 0), d = n.useMemo(() => Ce(h, q), [h, q]), J = n.useRef(null), Y = n.useRef(null), b = n.useRef(null), S = n.useRef(null), V = n.useRef(Promise.resolve()), T = n.useRef(!1), m = n.useRef(0), ee = (t) => {
    const r = X(t);
    A(r), le?.(r);
  }, te = (t) => ee(Math.round((t >= 0 ? c * B : c / B) * 1e4) / 1e4), O = (t) => {
    const r = Math.min(N, Math.max(1, t));
    Z(r), ue?.(r);
  }, ye = () => {
    const t = ae(p + 90);
    G(t), he?.(t);
  }, ke = () => {
    const t = J.current;
    !t || !C || ee(
      Ve(C, { width: t.clientWidth - 32, height: t.clientHeight - 32 }, fe, p)
    );
  }, ne = n.useCallback(async () => {
    const t = b.current, r = Y.current;
    if (!t || !r) return;
    const w = m.current, z = await t.getPage(l);
    if (w !== m.current) return;
    const a = z.getViewport({ scale: c, rotation: p }), g = window.devicePixelRatio || 1;
    r.width = Math.floor(a.width * g), r.height = Math.floor(a.height * g), r.style.width = `${Math.floor(a.width)}px`, r.style.height = `${Math.floor(a.height)}px`;
    const F = r.getContext("2d");
    if (!F) return;
    F.setTransform(g, 0, 0, g, 0, 0);
    const L = z.render({ canvasContext: F, viewport: a, canvas: r });
    S.current = L;
    try {
      await L.promise;
    } catch (y) {
      if (y?.name !== "RenderingCancelledException") throw y;
      return;
    } finally {
      S.current === L && (S.current = null);
    }
    E((y) => {
      if (y) return y;
      const oe = z.getViewport({ scale: 1, rotation: 0 });
      return { width: oe.width, height: oe.height };
    });
  }, [l, c, p]), re = n.useCallback(() => (T.current || (T.current = !0, S.current?.cancel(), V.current = V.current.catch(() => {
  }).then(() => (T.current = !1, ne()))), V.current), [ne]);
  n.useEffect(() => {
    if (E(void 0), me && (I === void 0 && A(U ?? 1), $ === void 0 && Z(1), H === void 0 && G(_ ?? 0)), !h) return;
    if (d !== "pdf") {
      m.current++, b.current = null, K(1), u(d === "image" ? "loading" : "error"), v("");
      return;
    }
    let t = !1;
    return (async () => {
      const w = ++m.current;
      u("loading");
      let z;
      try {
        z = await import("./index255.js");
      } catch {
        if (w !== m.current || t) return;
        u("error"), v("This is a PDF, and pdfjs-dist is not installed. Add it to render PDFs.");
        return;
      }
      if (w !== m.current || t) return;
      const a = z.GlobalWorkerOptions;
      if (P && a && (a.workerSrc = P), a && !a.workerSrc) {
        u("error"), v(
          // i18n-ignore-next-line (a developer setup notice: the fix is code, not a word for users)
          'PDFs need a pdf.js worker. Pass workerSrc — in Vite: import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url".'
        );
        return;
      }
      try {
        if (b.current = await z.getDocument({ url: h }).promise, w !== m.current || t) return;
        K(b.current.numPages), l > b.current.numPages && O(1), u("ready");
      } catch (g) {
        if (w !== m.current || t) return;
        u("error"), v(g instanceof Error ? g.message : o.t("documentViewer.pdfFailed"));
      }
    })(), () => {
      t = !0;
    };
  }, [h, d, P]), n.useEffect(() => {
    d === "pdf" && j === "ready" && re();
  }, [d, j, l, c, p, re]);
  const Me = d === "pdf";
  return /* @__PURE__ */ i(
    "div",
    {
      className: Ne(
        "zen-flex zen-w-full zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
        we
      ),
      children: [
        ze && /* @__PURE__ */ i("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-border-b zen-border-zen-border zen-bg-zen-muted zen-px-2 zen-py-1.5", children: [
          x && /* @__PURE__ */ e("span", { className: "zen-me-2 zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground", children: x }),
          /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", "aria-label": o.t("documentViewer.zoomOut"), disabled: c <= D, onClick: () => te(-1), children: /* @__PURE__ */ e(Ee, {}) }),
          /* @__PURE__ */ e("span", { "aria-live": "polite", className: "zen-min-w-12 zen-text-center zen-text-xs zen-tabular-nums zen-text-zen-muted-fg", children: je(c) }),
          /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", "aria-label": o.t("documentViewer.zoomIn"), disabled: c >= W, onClick: () => te(1), children: /* @__PURE__ */ e(Te, {}) }),
          /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", onClick: ke, children: o.t("documentViewer.fit") }),
          /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", "aria-label": o.t("documentViewer.rotate"), onClick: ye, children: /* @__PURE__ */ e(Oe, {}) }),
          Me && N > 1 && /* @__PURE__ */ i(ie, { children: [
            /* @__PURE__ */ e("span", { className: "zen-mx-1 zen-h-4 zen-w-px zen-bg-zen-border", "aria-hidden": !0 }),
            /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", "aria-label": o.t("documentViewer.previousPage"), disabled: l <= 1, onClick: () => O(l - 1), children: /* @__PURE__ */ e(se, { name: "chevron-left", size: 16, className: "rtl:zen-rotate-180" }) }),
            /* @__PURE__ */ i("span", { className: "zen-text-xs zen-tabular-nums zen-text-zen-muted-fg", children: [
              l,
              " / ",
              N
            ] }),
            /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", "aria-label": o.t("documentViewer.nextPage"), disabled: l >= N, onClick: () => O(l + 1), children: /* @__PURE__ */ e(se, { name: "chevron-right", size: 16, className: "rtl:zen-rotate-180" }) })
          ] }),
          M && /* @__PURE__ */ i(ie, { children: [
            /* @__PURE__ */ e("span", { className: "zen-ms-auto" }),
            /* @__PURE__ */ e(f, { variant: "ghost", size: "sm", "aria-label": o.t("documentViewer.download"), onClick: () => M(h, x), children: /* @__PURE__ */ e(Fe, {}) })
          ] })
        ] }),
        /* @__PURE__ */ i(
          "div",
          {
            ref: J,
            style: { height: ge },
            className: "zen-flex zen-w-full zen-justify-center zen-overflow-auto zen-bg-zen-muted zen-p-4",
            children: [
              d === "image" && /* @__PURE__ */ e(
                "img",
                {
                  src: h,
                  alt: x ?? o.t("documentViewer.document"),
                  onLoad: (t) => {
                    E({
                      width: t.currentTarget.naturalWidth,
                      height: t.currentTarget.naturalHeight
                    }), u("ready");
                  },
                  onError: () => {
                    u("error"), v(o.t("documentViewer.imageFailed"));
                  },
                  style: {
                    width: C ? `${C.width * c}px` : "auto",
                    height: "auto",
                    maxWidth: "none",
                    transform: `rotate(${p}deg)`,
                    alignSelf: "flex-start"
                  }
                }
              ),
              d === "pdf" && /* @__PURE__ */ e("canvas", { ref: Y, className: "zen-self-start zen-shadow-zen-sm" }),
              d === "unknown" && /* @__PURE__ */ i("div", { className: "zen-m-auto zen-flex zen-flex-col zen-items-center zen-gap-2 zen-text-center", children: [
                /* @__PURE__ */ e(Le, {}),
                /* @__PURE__ */ e("p", { className: "zen-m-0 zen-text-sm zen-text-zen-muted-fg", children: pe ?? o.t("documentViewer.noPreviewForThisFile") }),
                M && /* @__PURE__ */ e(f, { variant: "outline", size: "sm", onClick: () => M(h, x), children: o.t("documentViewer.download") })
              ] }),
              j === "error" && Q && /* @__PURE__ */ e("p", { className: "zen-m-auto zen-text-sm zen-text-zen-error", children: Q })
            ]
          }
        )
      ]
    }
  );
};
export {
  Ae as DocumentViewer
};
//# sourceMappingURL=index165.js.map

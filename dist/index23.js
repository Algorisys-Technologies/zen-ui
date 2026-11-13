import { jsxs as b, jsx as t } from "react/jsx-runtime";
import * as n from "react";
import { useLocale as D } from "./index90.js";
import { cn as j } from "./index197.js";
const O = n.forwardRef(
  ({
    onScan: c,
    onError: a,
    formats: g = ["qr_code"],
    facingMode: x = "environment",
    paused: y = !1,
    cooldownMs: S = 1500,
    decode: k,
    aspectRatio: A = 1,
    fallback: V,
    className: B,
    hideViewfinder: F,
    "aria-label": P
  }, T) => {
    const L = D(), I = P ?? L.t("qrScanner.cameraView"), s = n.useRef(null), m = n.useRef(null), o = n.useRef(null), w = n.useRef({ value: "", at: 0 }), z = n.useRef(null), i = n.useRef(!1), [h, u] = n.useState("idle"), q = n.useRef(c), l = n.useRef(a), p = n.useRef(k);
    n.useEffect(() => {
      q.current = c, l.current = a, p.current = k;
    }), n.useEffect(() => {
      if (y) return;
      i.current = !1, u("starting");
      const M = () => {
        i.current = !0, o.current !== null && cancelAnimationFrame(o.current), o.current = null, m.current && (m.current.getTracks().forEach((f) => f.stop()), m.current = null), s.current && (s.current.srcObject = null);
      };
      return (async () => {
        let f = !1;
        if (window.BarcodeDetector)
          try {
            z.current = new window.BarcodeDetector({ formats: g }), f = !0;
          } catch (e) {
            z.current = null, l.current?.(e);
          }
        if (!f && !p.current) {
          u("no-decoder");
          return;
        }
        let d;
        try {
          d = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: x },
            audio: !1
          });
        } catch (e) {
          const r = e;
          r.name === "NotAllowedError" || r.name === "SecurityError" || r.name === "PermissionDeniedError" ? u("blocked") : u("no-camera"), l.current?.(r);
          return;
        }
        if (i.current) {
          d.getTracks().forEach((e) => e.stop());
          return;
        }
        m.current = d;
        const v = s.current;
        if (!v) {
          d.getTracks().forEach((e) => e.stop());
          return;
        }
        v.srcObject = d;
        try {
          await v.play();
        } catch (e) {
          l.current?.(e);
        }
        u("scanning");
        const E = async () => {
          if (i.current || !s.current) return;
          const e = s.current;
          if (e.readyState >= 2 && !e.paused)
            try {
              if (f && z.current) {
                const r = await z.current.detect(e);
                r.length && N({
                  rawValue: r[0].rawValue,
                  format: r[0].format,
                  cornerPoints: r[0].cornerPoints
                });
              } else if (p.current) {
                const r = await p.current(e);
                r && N(r);
              }
            } catch (r) {
              l.current?.(r);
            }
          i.current || (o.current = requestAnimationFrame(E));
        }, N = (e) => {
          const r = Date.now();
          e.rawValue === w.current.value && r - w.current.at < S || (w.current = { value: e.rawValue, at: r }, q.current(e));
        };
        o.current = requestAnimationFrame(E);
      })(), M;
    }, [y, x, S, g]);
    const R = h === "scanning" || h === "starting";
    return /* @__PURE__ */ b(
      "div",
      {
        ref: T,
        className: j(
          "zen-relative zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted",
          B
        ),
        style: { aspectRatio: `${A} / 1` },
        children: [
          /* @__PURE__ */ t(
            "video",
            {
              ref: s,
              "aria-label": I,
              playsInline: !0,
              muted: !0,
              className: j(
                "zen-absolute zen-inset-0 zen-h-full zen-w-full zen-object-cover",
                !R && "zen-invisible"
              )
            }
          ),
          !F && R && /* @__PURE__ */ t(Q, {}),
          !R && /* @__PURE__ */ t("div", { className: "zen-absolute zen-inset-0 zen-flex zen-items-center zen-justify-center zen-p-4 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: V ?? /* @__PURE__ */ t(C, { status: h }) }),
          h === "starting" && /* @__PURE__ */ t("div", { className: "zen-absolute zen-inset-x-0 zen-bottom-2 zen-text-center zen-text-xs zen-text-white/80", children: L.t("qrScanner.startingCamera") })
        ]
      }
    );
  }
);
O.displayName = "QRScanner";
const Q = () => /* @__PURE__ */ t(
  "svg",
  {
    viewBox: "0 0 100 100",
    preserveAspectRatio: "none",
    className: "zen-pointer-events-none zen-absolute zen-inset-0 zen-h-full zen-w-full",
    "aria-hidden": !0,
    children: /* @__PURE__ */ b(
      "g",
      {
        stroke: "white",
        strokeWidth: "2",
        strokeLinecap: "round",
        fill: "none",
        style: { filter: "drop-shadow(0 1px 3px rgba(0,0,0,.45))" },
        children: [
          /* @__PURE__ */ t("path", { d: "M 20 26 L 20 20 L 26 20" }),
          /* @__PURE__ */ t("path", { d: "M 74 20 L 80 20 L 80 26" }),
          /* @__PURE__ */ t("path", { d: "M 80 74 L 80 80 L 74 80" }),
          /* @__PURE__ */ t("path", { d: "M 26 80 L 20 80 L 20 74" })
        ]
      }
    )
  }
), C = ({ status: c }) => {
  const a = D();
  return c === "blocked" ? /* @__PURE__ */ t("span", { children: a.t("qrScanner.cameraBlocked") }) : c === "no-camera" ? /* @__PURE__ */ t("span", { children: a.t("qrScanner.noCameraWasFoundOn") }) : c === "no-decoder" ? /* @__PURE__ */ b("span", { children: [
    "This browser does not support the BarcodeDetector API. Pass a",
    " ",
    /* @__PURE__ */ t("code", { children: "decode" }),
    " prop (e.g. powered by jsQR) to enable scanning here."
  ] }) : /* @__PURE__ */ t("span", { children: a.t("qrScanner.scannerIdle") });
};
export {
  O as QRScanner
};
//# sourceMappingURL=index23.js.map

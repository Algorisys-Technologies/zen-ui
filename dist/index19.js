import { jsxs as R, jsx as t } from "react/jsx-runtime";
import * as n from "react";
import { cn as j } from "./index143.js";
const T = n.forwardRef(
  ({
    onScan: c,
    onError: b,
    formats: g = ["qr_code"],
    facingMode: y = "environment",
    paused: x = !1,
    cooldownMs: k = 1500,
    decode: S,
    aspectRatio: A = 1,
    fallback: D,
    className: P,
    hideViewfinder: V,
    "aria-label": B = "QR scanner camera view"
  }, F) => {
    const a = n.useRef(null), f = n.useRef(null), s = n.useRef(null), p = n.useRef({ value: "", at: 0 }), m = n.useRef(null), o = n.useRef(!1), [h, i] = n.useState("idle"), L = n.useRef(c), u = n.useRef(b), z = n.useRef(S);
    n.useEffect(() => {
      L.current = c, u.current = b, z.current = S;
    }), n.useEffect(() => {
      if (x) return;
      o.current = !1, i("starting");
      const Q = () => {
        o.current = !0, s.current !== null && cancelAnimationFrame(s.current), s.current = null, f.current && (f.current.getTracks().forEach((l) => l.stop()), f.current = null), a.current && (a.current.srcObject = null);
      };
      return (async () => {
        let l = !1;
        if (window.BarcodeDetector)
          try {
            m.current = new window.BarcodeDetector({ formats: g }), l = !0;
          } catch (e) {
            m.current = null, u.current?.(e);
          }
        if (!l && !z.current) {
          i("no-decoder");
          return;
        }
        let d;
        try {
          d = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: y },
            audio: !1
          });
        } catch (e) {
          const r = e;
          r.name === "NotAllowedError" || r.name === "SecurityError" || r.name === "PermissionDeniedError" ? i("blocked") : i("no-camera"), u.current?.(r);
          return;
        }
        if (o.current) {
          d.getTracks().forEach((e) => e.stop());
          return;
        }
        f.current = d;
        const v = a.current;
        if (!v) {
          d.getTracks().forEach((e) => e.stop());
          return;
        }
        v.srcObject = d;
        try {
          await v.play();
        } catch (e) {
          u.current?.(e);
        }
        i("scanning");
        const N = async () => {
          if (o.current || !a.current) return;
          const e = a.current;
          if (e.readyState >= 2 && !e.paused)
            try {
              if (l && m.current) {
                const r = await m.current.detect(e);
                r.length && E({
                  rawValue: r[0].rawValue,
                  format: r[0].format,
                  cornerPoints: r[0].cornerPoints
                });
              } else if (z.current) {
                const r = await z.current(e);
                r && E(r);
              }
            } catch (r) {
              u.current?.(r);
            }
          o.current || (s.current = requestAnimationFrame(N));
        }, E = (e) => {
          const r = Date.now();
          e.rawValue === p.current.value && r - p.current.at < k || (p.current = { value: e.rawValue, at: r }, L.current(e));
        };
        s.current = requestAnimationFrame(N);
      })(), Q;
    }, [x, y, k, g]);
    const w = h === "scanning" || h === "starting";
    return /* @__PURE__ */ R(
      "div",
      {
        ref: F,
        className: j(
          "zen-relative zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted",
          P
        ),
        style: { aspectRatio: `${A} / 1` },
        children: [
          /* @__PURE__ */ t(
            "video",
            {
              ref: a,
              "aria-label": B,
              playsInline: !0,
              muted: !0,
              className: j(
                "zen-absolute zen-inset-0 zen-h-full zen-w-full zen-object-cover",
                !w && "zen-invisible"
              )
            }
          ),
          !V && w && /* @__PURE__ */ t(q, {}),
          !w && /* @__PURE__ */ t("div", { className: "zen-absolute zen-inset-0 zen-flex zen-items-center zen-justify-center zen-p-4 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: D ?? /* @__PURE__ */ t(M, { status: h }) }),
          h === "starting" && /* @__PURE__ */ t("div", { className: "zen-absolute zen-inset-x-0 zen-bottom-2 zen-text-center zen-text-xs zen-text-white/80", children: "Starting camera…" })
        ]
      }
    );
  }
);
T.displayName = "QRScanner";
const q = () => /* @__PURE__ */ t(
  "svg",
  {
    viewBox: "0 0 100 100",
    preserveAspectRatio: "none",
    className: "zen-pointer-events-none zen-absolute zen-inset-0 zen-h-full zen-w-full",
    "aria-hidden": !0,
    children: /* @__PURE__ */ R(
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
), M = ({ status: c }) => c === "blocked" ? /* @__PURE__ */ t("span", { children: "Camera access was blocked. Allow camera permission in your browser settings, then reload." }) : c === "no-camera" ? /* @__PURE__ */ t("span", { children: "No camera was found on this device." }) : c === "no-decoder" ? /* @__PURE__ */ R("span", { children: [
  "This browser does not support the BarcodeDetector API. Pass a",
  " ",
  /* @__PURE__ */ t("code", { children: "decode" }),
  " prop (e.g. powered by jsQR) to enable scanning here."
] }) : /* @__PURE__ */ t("span", { children: "Scanner idle." });
export {
  T as QRScanner
};
//# sourceMappingURL=index19.js.map
